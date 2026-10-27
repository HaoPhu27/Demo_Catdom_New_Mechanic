// HP-1: luật kéo hố cho board chơi thử mechanic 01–04 (logic/hole-play.js, UMD: window.CatDomHolePlay).
// Hố đặt sẵn trên bàn (fixtures.<mech>.demo.holes). Chọn hố, đi từng ô; hố trùm đủ cả nhóm mèo cùng màu thì tự nuốt.
// Test đi lại đúng kịch bản good/bad của demo bằng move() và kiểm các luật chặn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const HP = require('../logic/hole-play.js');
const { fixtures } = require('../boards/eat-fixtures.js');
const clone = x => JSON.parse(JSON.stringify(x));

// Mèo Ích Kỷ không có module logic: mô phỏng luật như tests/eat-demo-board.test.mjs.
const selfishLogic = {
  createGame(level) {
    const cats = level.cats.map(c => ({ id: c.id, color: c.color, x: c.x, y: c.y, alive: true }));
    const st = { status: 'playing', loseReason: null, counter: level.selfishCount, safe: false };
    const sid = (level.cats.find(c => c.selfish) || {}).id;
    const at = (x, y) => cats.find(c => c.alive && c.x === x && c.y === y);
    const groupAt = (x, y) => {
      const first = at(x, y); if (!first) return [];
      const out = [first], seen = new Set([first.id]);
      for (let i = 0; i < out.length; i++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = at(out[i].x + dx, out[i].y + dy);
        if (n && n.color === first.color && !seen.has(n.id)) { seen.add(n.id); out.push(n); }
      }
      return out.map(c => c.id);
    };
    return {
      getState: () => JSON.parse(JSON.stringify({ ...st, cats })),
      groupAt,
      eat(x, y) {
        const ids = st.status === 'playing' ? groupAt(x, y) : [];
        if (!ids.length) return { ok: false, reason: 'empty', events: [] };
        ids.forEach(id => { cats.find(c => c.id === id).alive = false; });
        const events = [{ type: 'eat', ids }];
        if (!st.safe) {
          if (ids.includes(sid)) { st.safe = true; events.push({ type: 'selfishSafe' }); }
          else {
            st.counter -= ids.length;
            events.push({ type: 'selfishCount', remaining: st.counter });
            if (st.counter <= 0) { st.status = 'lost'; st.loseReason = 'selfish'; events.push({ type: 'lose', reason: 'selfish' }); return { ok: true, events }; }
          }
        }
        if (cats.every(c => !c.alive)) { st.status = 'won'; events.push({ type: 'win' }); }
        return { ok: true, events };
      }
    };
  }
};
const logicOf = name => name === 'selfish' ? selfishLogic : require('../logic/' + name + '.js');
const MECHS = ['weed', 'sick', 'couple', 'selfish'];

function setup(name) {
  const fx = fixtures[name].demo, L = fx.level;
  const game = logicOf(name).createGame(clone(L));
  const play = HP.create(game, { cols: L.cols, rows: L.rows, holes: clone(fx.holes), weedArea: L.weedArea, pesticide: L.pesticide });
  return { fx, L, game, play };
}

// Đi một kịch bản demo bằng move(): mỗi phần tử path là 1 bước kề. Trả mọi event.
function replay(name, steps) {
  const { game, play } = setup(name);
  const all = [];
  for (const [i, s] of steps.entries()) {
    const where = `${name} bước ${i + 1}`;
    const group = s.eat ? game.groupAt(...s.eat) : null;
    const before = play.holes().find(h => h.id === s.hole);
    let { x, y } = before;
    const stepEvents = [];
    for (const [j, [px, py]] of s.path.entries()) {
      const res = play.move(s.hole, px - x, py - y);
      assert.ok(res.ok, `${where} path[${j}]: move bị từ chối (${res.reason})`);
      assert.deepEqual(res.events[0], { type: 'move', hole: s.hole, x: px, y: py }, `${where}: event đầu phải là move`);
      [x, y] = [px, py];
      stepEvents.push(...res.events);
    }
    if (s.eat) {
      const he = stepEvents.filter(e => e.type === 'holeEat');
      assert.equal(he.length, 1, `${where}: cần đúng 1 holeEat, có ${he.length}`);
      assert.deepEqual([...he[0].ids].sort(), [...group].sort(), `${where}: hố nuốt sai nhóm`);
      assert.equal(he[0].remaining, before.remaining - group.length, `${where}: sức chứa còn lại sai`);
      assert.equal(he[0].hole, s.hole);
      const after = play.holes().find(h => h.id === s.hole);
      assert.equal(after.done, after.remaining === 0, `${where}: done phải đúng khi sức chứa về 0`);
      assert.equal(stepEvents.some(e => e.type === 'holeDone' && e.hole === s.hole), after.done, `${where}: holeDone`);
    } else {
      assert.ok(stepEvents.some(e => e.type === 'pick'), `${where}: Special Hole trùm thuốc sâu phải nhặt (event pick)`);
      assert.ok(play.holes().find(h => h.id === s.hole).picked, `${where}: sau khi nhặt, picked = true`);
    }
    all.push(...stepEvents);
  }
  return { all, state: game.getState(), play };
}

test('module: UMD export cho Node và trình duyệt', () => {
  assert.equal(typeof HP.create, 'function');
  const ctx = { self: {} };
  vm.runInNewContext(readFileSync(new URL('../logic/hole-play.js', import.meta.url), 'utf8'), ctx);
  assert.equal(typeof ctx.self.CatDomHolePlay.create, 'function');
});

for (const name of MECHS) {
  test(`${name}: holes() lúc đầu đúng fixture, sức chứa = số ô, Special Hole chưa nhặt`, () => {
    const { fx, play } = setup(name);
    const hs = play.holes();
    assert.equal(hs.length, fx.holes.length);
    for (const h of fx.holes) {
      const o = hs.find(k => k.id === h.id);
      assert.deepEqual([o.color, o.x, o.y, o.shape, o.remaining, o.done, o.special, o.picked],
        [h.color, h.x, h.y, h.shape, h.shape.length, false, !!h.special, !h.special], `hố ${h.id}`);
      for (const [dx, dy] of h.shape) assert.equal(play.holeAt(h.x + dx, h.y + dy), h.id, `holeAt ô của ${h.id}`);
    }
    hs[0].x = 99; // holes() trả bản sao
    assert.notEqual(play.holes()[0].x, 99, 'holes() phải trả bản sao');
  });

  test(`${name}: đi lại kịch bản good bằng move() → thắng`, () => {
    const { all, state } = replay(name, fixtures[name].demo.good);
    assert.equal(state.status, 'won');
    assert.ok(all.some(e => e.type === 'win'));
  });

  test(`${name}: đi lại kịch bản bad bằng move() → thua đúng lý do, sau đó không đi được nữa`, () => {
    const steps = fixtures[name].demo.bad;
    const { state, play } = replay(name, steps);
    assert.equal(state.status, 'lost');
    assert.equal(state.loseReason, name);
    const h = play.holes().find(o => !o.done);
    assert.deepEqual(play.move(h.id, 1, 0), { ok: false, reason: 'not-playing', events: [] });
  });
}

test('chặn: ra ngoài bàn, bước không hợp lệ, hố không tồn tại; bị chặn thì hố đứng yên', () => {
  const { play } = mini();
  assert.deepEqual(play.move('ho', -1, 0), { ok: false, reason: 'out-of-board', events: [] });
  assert.deepEqual(play.move('ho', 0, -1), { ok: false, reason: 'out-of-board', events: [] });
  assert.deepEqual(play.move('khong-co', 1, 0), { ok: false, reason: 'bad-hole', events: [] });
  assert.deepEqual(play.move('ho', 1, 1), { ok: false, reason: 'bad-move', events: [] });
  assert.deepEqual(play.move('ho', 0, 0), { ok: false, reason: 'bad-move', events: [] });
  assert.deepEqual(play.move('ho', 2, 0), { ok: false, reason: 'bad-move', events: [] });
  const h = play.holes().find(o => o.id === 'ho');
  assert.deepEqual([h.x, h.y, h.remaining], [0, 0, 3], 'bị chặn thì không đổi vị trí, sức chứa');
});

// Board nhỏ tự dựng để kiểm từng luật (dùng logic thật của weed).
function mini(extra = {}) {
  const level = {
    cols: 6, rows: 8,
    cats: [
      { id: 'o1', color: 'orange', x: 3, y: 0 }, { id: 'o2', color: 'orange', x: 4, y: 0 }, { id: 'o3', color: 'orange', x: 5, y: 0 },
      { id: 'b1', color: 'blue', x: 0, y: 3 },
      { id: 'g1', color: 'green', x: 5, y: 5 }, { id: 'g2', color: 'green', x: 4, y: 5 }
    ],
    weedArea: { x: 0, y: 6, w: 6, h: 2 }, weedStart: [[0, 7]],
    pesticide: { x: 3, y: 3 },
    ...extra
  };
  const game = require('../logic/weed.js').createGame(clone(level));
  const holes = [
    { id: 'ho', color: 'orange', x: 0, y: 0, shape: [[0, 0], [1, 0], [2, 0]] },          // I3 ngang, sức chứa 3
    { id: 'hb', color: 'blue', x: 0, y: 1, shape: [[0, 0], [1, 0]] },                    // I2
    { id: 'hs', color: 'green', special: true, x: 4, y: 3, shape: [[0, 0], [1, 0], [0, 1]] }, // L3 special
    { id: 'hg', color: 'green', x: 2, y: 4, shape: [[0, 0]] }
  ];
  return { game, play: HP.create(game, { cols: level.cols, rows: level.rows, holes, weedArea: level.weedArea, pesticide: level.pesticide }) };
}

test('trùm một phần nhóm cùng màu: đi được, chưa nuốt; trùm đủ thì nuốt, sức chứa 0 → holeDone', () => {
  const { game, play } = mini();
  let r = play.move('ho', 1, 0);            // ô (1..3,0): đè o1 (cùng màu), nhóm 3 mèo chưa trùm đủ
  assert.ok(r.ok, r.reason);
  assert.equal(r.events.length, 1, 'chỉ có event move');
  r = play.move('ho', 1, 0);                // (2..4,0) vẫn thiếu o3
  assert.ok(r.ok); assert.equal(r.events.length, 1);
  r = play.move('ho', 1, 0);                // (3..5,0) trùm đủ o1 o2 o3
  assert.ok(r.ok);
  const he = r.events.find(e => e.type === 'holeEat');
  assert.deepEqual([...he.ids].sort(), ['o1', 'o2', 'o3']);
  assert.equal(he.remaining, 0);
  assert.ok(r.events.some(e => e.type === 'eat'), 'phải kèm event eat của logic');
  assert.deepEqual(r.events.at(-1), { type: 'holeDone', hole: 'ho' });
  assert.equal(play.holeAt(3, 0), null, 'hố xong thì không còn chiếm ô');
  assert.equal(play.move('ho', -1, 0).reason, 'bad-hole');
  assert.equal(game.getState().cats.filter(c => c.alive && c.color === 'orange').length, 0);
});

test('đè mèo khác màu bị chặn "cat"; đè hố khác bị chặn "hole"; vào khu cây dại bị chặn "weed-area"', () => {
  const { play } = mini();
  assert.deepEqual(play.move('hb', 0, 1), { ok: true, events: [{ type: 'move', hole: 'hb', x: 0, y: 2 }] });
  // hb (0..1,2) đi xuống: ô (0,3) là mèo xanh dương cùng màu, (1,3) trống → đi được, nhóm b1 1 mèo trùm đủ → nuốt
  const r = play.move('hb', 0, 1);
  assert.ok(r.ok);
  assert.deepEqual(r.events.find(e => e.type === 'holeEat').ids, ['b1']);
  assert.equal(r.events.find(e => e.type === 'holeEat').remaining, 1);
  assert.equal(play.holes().find(h => h.id === 'hb').done, false);
  // hb đi lên đè ho (0..2,0)? hb ở (0..1,3) → lên 3 lần mới tới hàng 0
  play.move('hb', 0, -1); play.move('hb', 0, -1);
  assert.deepEqual(play.move('hb', 0, -1), { ok: false, reason: 'hole', events: [] });
  // hg (2,4) xuống (2,5) trống; xuống tiếp (2,6) là khu cây dại
  assert.ok(play.move('hg', 0, 1).ok);
  assert.deepEqual(play.move('hg', 0, 1), { ok: false, reason: 'weed-area', events: [] });
  // hg sang phải: (3,5) trống, rồi (4,5) mèo xanh lá g2 cùng màu, nhóm g1+g2 = 2 > sức chứa 1 → đi được nhưng không nuốt
  assert.ok(play.move('hg', 1, 0).ok);
  const r2 = play.move('hg', 1, 0);
  assert.ok(r2.ok);
  assert.equal(r2.events.some(e => e.type === 'holeEat'), false, 'nhóm lớn hơn sức chứa thì không nuốt');
  // ho đi xuống (0..2,1) đè hb? hb đang ở (0..1,1)
  assert.deepEqual(play.move('ho', 0, 1), { ok: false, reason: 'hole', events: [] });
  // Mèo khác màu: hb (xanh dương) sang phải dọc hàng 1 rồi đi lên đè mèo cam → 'cat'
  const { play: p3 } = mini();
  for (let k = 0; k < 4; k++) assert.ok(p3.move('hb', 1, 0).ok, `hb sang phải lần ${k + 1}`);
  assert.deepEqual(p3.move('hb', 0, -1), { ok: false, reason: 'cat', events: [] }, 'hố đè mèo khác màu bị chặn');
  const { play: p2 } = mini();
  p2.move('ho', 1, 0); p2.move('ho', 1, 0); p2.move('ho', 1, 0);   // nuốt xong cam
  assert.equal(p2.move('hs', 1, 0).reason, 'out-of-board');
  assert.deepEqual(p2.move('hs', 0, 1), { ok: false, reason: 'cat', events: [] }, 'Special Hole chưa nhặt thuốc: đè mèo (kể cả cùng màu) bị chặn');
});

test('Special Hole: chỉ nó được trùm thuốc sâu, trùm thì nhặt (pick); hố khác đè thuốc sâu bị chặn', () => {
  const { game, play } = mini();
  // hb (0,1)-(1,1) → xuống (0..1,2) → phải (1..2,2) → phải (2..3,2) → xuống (2..3,3): (3,3) là thuốc sâu → bị chặn
  play.move('hb', 0, 1); play.move('hb', 1, 0); play.move('hb', 1, 0);
  assert.deepEqual(play.move('hb', 0, 1), { ok: false, reason: 'pesticide', events: [] });
  // hs (4..5,3)+(4,4) sang trái → (3..4,3)+(3,4): trùm thuốc sâu → nhặt
  const r = play.move('hs', -1, 0);
  assert.ok(r.ok, r.reason);
  assert.ok(r.events.some(e => e.type === 'pick'));
  assert.equal(play.holes().find(h => h.id === 'hs').picked, true);
  assert.equal(game.getState().pesticidePicked ?? true, true);
  // Sau khi nhặt, ô thuốc sâu không còn chặn hố khác: đưa hs đi chỗ khác rồi hb xuống (2..3,3)
  assert.ok(play.move('hs', 0, 1).ok, 'hs (3..4,4)+(3,5): ô trống');
  assert.ok(play.move('hb', 0, 1).ok, 'thuốc sâu đã nhặt thì không còn chặn');
});

test('sức chứa: trùm đủ nhóm nhưng nhóm lớn hơn sức chứa còn lại thì không nuốt', () => {
  const level = {
    cols: 6, rows: 8,
    cats: [
      { id: 'a1', color: 'orange', x: 0, y: 3 },
      { id: 'c1', color: 'orange', x: 0, y: 1 }, { id: 'c2', color: 'orange', x: 1, y: 1 }, { id: 'c3', color: 'orange', x: 2, y: 1 },
      { id: 'z1', color: 'blue', x: 5, y: 0 }
    ],
    weedArea: { x: 0, y: 6, w: 6, h: 2 }, weedStart: [[0, 7]],
    pesticide: { x: 5, y: 4 }
  };
  const game = require('../logic/weed.js').createGame(clone(level));
  const play = HP.create(game, { cols: 6, rows: 8, holes: [{ id: 'hx', color: 'orange', x: 0, y: 4, shape: [[0, 0], [1, 0], [2, 0]] }],
    weedArea: level.weedArea, pesticide: level.pesticide });
  const r1 = play.move('hx', 0, -1);              // (0..2,3) trùm a1 → nuốt 1, còn 2
  assert.deepEqual(r1.events.find(e => e.type === 'holeEat'), { type: 'holeEat', hole: 'hx', ids: ['a1'], remaining: 2 });
  assert.ok(play.move('hx', 0, -1).ok);           // (0..2,2) trống
  const r3 = play.move('hx', 0, -1);              // (0..2,1) trùm đủ nhóm 3 mèo nhưng chỉ còn chứa 2
  assert.ok(r3.ok, r3.reason);
  assert.equal(r3.events.some(e => e.type === 'holeEat'), false, 'nhóm 3 > sức chứa 2: không nuốt');
  assert.equal(play.holes()[0].remaining, 2);
});
