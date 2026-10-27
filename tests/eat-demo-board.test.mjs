// Board demo thực tế cho 3 mechanic nuốt nhóm (Cây dại, Mèo bệnh, Couple): design/quick-specs/realistic-eat-board-2026-10-27.md.
// Hố đặt sẵn trên bàn với hình trong catalog, mỗi bước kéo một hố theo đường đi tới trùm đúng nhóm mèo cùng màu.
// Test này đi lại từng bước như trang demo: logic thật (logic/<tên>.js) + vị trí, sức chứa của hố.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { fixtures } = require('../boards/eat-fixtures.js');
const clone = x => JSON.parse(JSON.stringify(x));

const BASE = {
  I2: [[0, 0], [1, 0]],
  I3: [[0, 0], [1, 0], [2, 0]],
  L3: [[0, 0], [1, 0], [0, 1]],
  L4: [[0, 0], [0, 1], [0, 2], [1, 2]],
  O4: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T4: [[0, 0], [1, 0], [2, 0], [1, 1]],
  X5: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]
};
const norm = cells => {
  const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(c => c.join(',')).join(' ');
};
const CATALOG = new Map();
for (const [name, base] of Object.entries(BASE)) {
  let c = base;
  for (let r = 0; r < 4; r++) {
    c = c.map(([x, y]) => [-y, x]);
    CATALOG.set(norm(c), name);
    CATALOG.set(norm(c.map(([x, y]) => [-x, y])), name);
  }
}
const STRAIGHT = new Set(['I2', 'I3']);
// Event chữ ký phải xuất hiện trong good; bad phải thua đúng lý do.
const MECH = {
  weed: { good: ['pick', 'weedClear', 'weedGrow'], lose: 'weed' },
  sick: { good: ['infect'], lose: 'sick' },
  couple: { good: ['coupleTrigger', 'coupleSafe'], lose: 'couple' }
};
const key = (x, y) => x + ',' + y;

test('module: UMD export cho Node và trình duyệt', () => {
  const ctx = { self: {} };
  vm.runInNewContext(readFileSync(new URL('../boards/eat-fixtures.js', import.meta.url), 'utf8'), ctx);
  assert.equal(typeof ctx.self.CatDomEatFixtures.fixtures, 'object');
});

// Đi lại một kịch bản. Trả { results, events } hoặc ném lỗi assert với bước sai.
function walk(name, fx, steps) {
  const logic = require('../logic/' + name + '.js');
  const L = fx.level, game = logic.createGame(clone(L));
  const holes = fx.holes.map(h => ({ ...h, remaining: h.shape.length, picked: !h.special, done: false }));
  const area = L.weedArea;
  const inArea = (x, y) => area && x >= area.x && y >= area.y && x < area.x + area.w && y < area.y + area.h;
  const boxCells = new Set((L.boxes || []).map(b => key(b.x, b.y)));
  const foot = (h, ax, ay) => h.shape.map(([dx, dy]) => [ax + dx, ay + dy]);
  const catAt = () => new Map(game.getState().cats.filter(c => c.alive).map(c => [key(c.x, c.y), c]));
  let pestLeft = !!L.pesticide;
  // Ô của footprint hợp lệ khi: trong bàn, ngoài khu vực cây dại, không trùng hố khác, không trùng mèo/box (trừ ô được phép).
  const checkFoot = (h, cells, allowed, where) => {
    const cats = catAt();
    for (const [x, y] of cells) {
      const k = key(x, y);
      assert.ok(x >= 0 && y >= 0 && x < L.cols && y < L.rows, `${where}: hố ${h.id} ra ngoài bàn tại (${k})`);
      assert.ok(!inArea(x, y), `${where}: hố ${h.id} đi vào khu vực cây dại tại (${k})`);
      if (allowed.has(k)) continue;
      assert.ok(!cats.has(k), `${where}: hố ${h.id} đè lên mèo ${cats.get(k)?.id} tại (${k})`);
      assert.ok(!boxCells.has(k), `${where}: hố ${h.id} đè lên box tại (${k})`);
      assert.ok(!(pestLeft && L.pesticide.x === x && L.pesticide.y === y && !h.special), `${where}: hố ${h.id} đè lên thuốc sâu`);
      for (const o of holes) if (o !== h && !o.done)
        assert.ok(!foot(o, o.x, o.y).some(c => key(...c) === k), `${where}: hố ${h.id} đè lên hố ${o.id} tại (${k})`);
    }
  };
  const results = [];
  holes.forEach(h => checkFoot(h, foot(h, h.x, h.y), new Set(), 'Lúc đầu'));
  steps.forEach((s, i) => {
    const where = `Bước ${i + 1}`;
    assert.equal(game.getState().status, 'playing', `${where}: màn đã kết thúc trước bước này`);
    const h = holes.find(o => o.id === s.hole);
    assert.ok(h && !h.done, `${where}: không có hố '${s.hole}' trên bàn`);
    assert.ok(Array.isArray(s.path) && s.path.length >= 1, `${where}: thiếu path`);
    let group = [], allowed = new Set();
    if (s.eat) {
      assert.ok(h.picked, `${where}: Special Hole chưa nhặt thuốc sâu thì chưa nuốt được mèo`);
      group = game.groupAt(...s.eat);
      assert.ok(group.length, `${where}: ô ${s.eat} không có nhóm ăn được`);
      const st = game.getState();
      const box = (st.boxes || []).find(b => b.x === s.eat[0] && b.y === s.eat[1] && b.queue.length);
      const color = box ? box.queue[0].color : st.cats.find(c => c.id === group[0]).color;
      assert.equal(color, h.color, `${where}: hố ${h.id} màu ${h.color} không nuốt được mèo ${color}`);
      assert.ok(group.length <= h.remaining, `${where}: nhóm ${group.length} mèo > sức chứa còn ${h.remaining}`);
      allowed = new Set(box ? [key(box.x, box.y)] : group.map(id => { const c = st.cats.find(k => k.id === id); return key(c.x, c.y); }));
    } else assert.ok(s.pick && h.special && !h.picked, `${where}: bước phải là eat, hoặc pick bằng Special Hole chưa nhặt`);
    let [px, py] = [h.x, h.y];
    s.path.forEach(([x, y], j) => {
      assert.equal(Math.abs(x - px) + Math.abs(y - py), 1, `${where}: path[${j}] (${x},${y}) không kề (${px},${py})`);
      [px, py] = [x, y];
      checkFoot(h, foot(h, x, y), allowed, `${where} path[${j}]`);
    });
    [h.x, h.y] = [px, py];
    const cells = new Set(foot(h, px, py).map(c => key(...c)));
    let res;
    if (s.eat) {
      for (const k of allowed) assert.ok(cells.has(k), `${where}: hố ${h.id} dừng ở (${px},${py}) chưa trùm mèo ở (${k})`);
      res = game.eat(...s.eat);
      h.remaining -= group.length;
      if (h.remaining === 0) h.done = true;
    } else {
      assert.ok(cells.has(key(L.pesticide.x, L.pesticide.y)), `${where}: Special Hole dừng ở (${px},${py}) chưa trùm thuốc sâu`);
      res = game.pickPesticide();
      h.picked = true; pestLeft = false;
    }
    assert.ok(res.ok, `${where}: logic từ chối (${res.reason})`);
    results.push(res);
  });
  return { results, events: results.flatMap(r => r.events), state: game.getState(), holes };
}

for (const [name, mech] of Object.entries(MECH)) {
  const fx = fixtures[name] && fixtures[name].demo;

  test(`${name}: có fixture demo`, () => {
    assert.ok(fx, `thiếu fixtures.${name}.demo`);
    for (const k of ['level', 'holes', 'good', 'bad']) assert.ok(fx[k], `fixtures.${name}.demo thiếu '${k}'`);
    assert.ok(typeof fx.intro === 'string' && fx.intro.length, 'thiếu câu intro cho demo');
    for (const s of [...fx.good, ...fx.bad]) assert.ok(typeof s.say === 'string' && s.say.length, 'mỗi bước cần câu chú thích say');
  });

  test(`${name}: board demo giống level thật`, () => {
    const L = fx.level, holes = fx.holes;
    assert.ok(L.cols >= 6 && L.cols <= 8, `cols = ${L.cols}, cần 6–8`);
    assert.ok(L.rows >= 7 && L.rows <= 9, `rows = ${L.rows}, cần 7–9`);
    assert.ok(holes.length >= 4 && holes.length <= 7, `${holes.length} hố, cần 4–7`);
    assert.equal(new Set(holes.map(h => h.id)).size, holes.length, 'id hố trùng nhau');
    assert.equal(holes.filter(h => h.special).length, name === 'weed' ? 1 : 0, 'Cây dại có đúng 1 Special Hole, mechanic khác không có');

    const names = holes.map(h => {
      const n = CATALOG.get(norm(h.shape || [[0, 0]]));
      assert.ok(n, `hố ${h.id} có hình ${JSON.stringify(h.shape)} không thuộc catalog`);
      return n;
    });
    assert.ok(new Set(names).size >= 3, `chỉ có ${[...new Set(names)]}: cần ≥ 3 loại hình`);
    assert.ok(names.filter(n => !STRAIGHT.has(n)).length >= 2, `cần ≥ 2 hố không thẳng, đang có ${names}`);
    assert.ok(names.filter(n => n === 'I2').length * 3 <= names.length, `quá nhiều hố I2: ${names}`);

    const colors = new Set(holes.map(h => h.color));
    assert.ok(colors.size >= Math.min(4, holes.length), `chỉ ${colors.size} màu hố`);
    const all = [...L.cats, ...(L.boxes || []).flatMap(b => b.cats)];
    for (const c of new Set([...colors, ...all.map(k => k.color)])) {
      const need = holes.filter(h => h.color === c).reduce((s, h) => s + h.shape.length, 0);
      const have = all.filter(k => k.color === c).length;
      assert.equal(have, need, `màu ${c}: ${have} mèo nhưng hố cần ${need}`);
    }
    assert.ok(all.length >= 0.3 * L.cols * L.rows, `${all.length} mèo < 30% của ${L.cols * L.rows} ô`);
  });

  test(`${name}: good kéo hố hợp lệ và thắng, có khoảnh khắc chữ ký`, () => {
    assert.ok(fx.good.length <= 14, `good có ${fx.good.length} bước, tối đa 14`);
    const r = walk(name, fx, fx.good);
    assert.equal(r.state.status, 'won', `good kết thúc ở ${r.state.status} (${r.state.loseReason})`);
    assert.ok(r.holes.every(h => h.done), 'thắng nhưng còn hố chưa đầy: sức chứa không khớp');
    const types = new Set(r.events.map(e => e.type));
    for (const t of mech.good) assert.ok(types.has(t), `good thiếu event '${t}'`);
  });

  test(`${name}: bad kéo hố hợp lệ và thua đúng lý do, rẽ sai từ phần đầu của good`, () => {
    assert.ok(fx.bad.length >= 2 && fx.bad.length <= 6, `bad có ${fx.bad.length} bước, cần 2–6`);
    const r = walk(name, fx, fx.bad);
    assert.equal(r.state.status, 'lost', `bad kết thúc ở ${r.state.status}`);
    assert.equal(r.state.loseReason, mech.lose);
    assert.deepEqual(fx.bad[0], fx.good[0], 'bước đầu của bad phải trùng good để người xem so được hai bên');
  });
}
