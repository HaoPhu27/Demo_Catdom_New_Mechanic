// Phần test dùng chung cho 6 mechanic hố di chuyển, theo docs/logic-contract.md mục 5
// và design/quick-specs/hole-move-board-2026-10-26.md. Mỗi tests/<slug>.test.mjs gọi commonSuite(slug).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
export const { fixtures, seq } = require('../boards/lab-fixtures.js');
export const load = slug => require('../logic/' + slug + '.js');
export const clone = x => JSON.parse(JSON.stringify(x));

// Chạy chuỗi nước, trả kết quả của từng nước.
export function play(game, moves) {
  return (typeof moves === 'string' ? seq(moves) : moves).map(([h, dx, dy]) => game.move(h, dx, dy));
}
export const last = results => results[results.length - 1];

// Board nền 3×3:  H0 p .  /  a # .  /  H1 . q
const baseLevel = () => ({
  cols: 3, rows: 3,
  cats: [{ id: 'p', color: 'pink', x: 1, y: 0 }, { id: 'a', color: 'blue', x: 0, y: 1 }, { id: 'q', color: 'pink', x: 2, y: 2 }],
  holes: [{ color: 'blue', x: 0, y: 0, remaining: 1 }, { color: 'pink', x: 0, y: 2, remaining: 2 }],
  walls: [[1, 1]]
});
const rejected = reason => ({ ok: false, reason, events: [] });

export function commonSuite(slug) {
  const logic = load(slug);
  const set = fixtures[slug];

  test(`${slug}: UMD cho Node và trình duyệt, không Math.random/DOM`, () => {
    assert.equal(typeof logic.createGame, 'function');
    assert.equal(typeof logic.validateLevel, 'function');
    const core = readFileSync(new URL('../logic/_board-move.js', import.meta.url), 'utf8');
    const src = readFileSync(new URL('../logic/' + slug + '.js', import.meta.url), 'utf8');
    const ctx = { self: {} };
    vm.runInNewContext(core, ctx);
    vm.runInNewContext(src, ctx);
    assert.equal(typeof ctx.self.CatDomLogic[slug].createGame, 'function');
    for (const s of [core, src]) assert.doesNotMatch(s, /Math\.random|document\.|window\./);
  });

  for (const [key, fx] of Object.entries(set.list)) {
    test(`${slug} ${key}: chuỗi đúng → won`, () => {
      const g = logic.createGame(clone(fx.level));
      const rs = play(g, fx.good);
      rs.forEach((r, i) => assert.equal(r.ok, true, `nước ${i} bị từ chối: ${r.reason}`));
      assert.deepEqual(last(last(rs).events), { type: 'win' });
      const s = g.getState();
      assert.equal(s.status, 'won');
      assert.equal(s.loseReason, null);
      assert.equal(s.turn, rs.length);
      assert.ok(s.holes.every(h => h.done && h.remaining === 0));
      assert.deepEqual(g.move(0, 1, 0), rejected('not-playing'));
    });

    if (fx.bad) test(`${slug} ${key}: chuỗi sai → ${fx.bad.status} ${fx.bad.loseReason || ''}`, () => {
      const g = logic.createGame(clone(fx.level));
      const rs = play(g, fx.bad.moves);
      const end = fx.bad.lastRejected ? rs.length - 1 : rs.length;
      rs.slice(0, end).forEach((r, i) => assert.equal(r.ok, true, `nước ${i} bị từ chối: ${r.reason}`));
      if (fx.bad.lastRejected) assert.deepEqual(last(rs), rejected(fx.bad.lastRejected));
      const s = g.getState();
      assert.equal(s.status, fx.bad.status);
      assert.equal(s.loseReason, fx.bad.loseReason);
      if (fx.bad.status === 'lost') {
        assert.deepEqual(last(last(rs).events), { type: 'lose', reason: fx.bad.loseReason });
        assert.deepEqual(g.move(0, 0, -1), rejected('not-playing'));
      }
    });
  }

  test(`${slug}: cùng chuỗi nước luôn cho cùng event, không sửa level`, () => {
    const fx = set.list[set.default];
    const level = clone(fx.level), before = JSON.stringify(level);
    const a = play(logic.createGame(level), fx.good);
    const b = play(logic.createGame(clone(fx.level)), fx.good);
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(level), before);
  });

  test(`${slug}: getState trả bản sao sâu, state ban đầu`, () => {
    const g = logic.createGame(baseLevel());
    const s = g.getState();
    assert.equal(s.status, 'playing');
    assert.equal(s.loseReason, null);
    assert.equal(s.turn, 0);
    assert.deepEqual(s.walls, [[1, 1]]);
    assert.deepEqual(s.cats.map(({ id, color, x, y, alive }) => ({ id, color, x, y, alive })),
      baseLevel().cats.map(c => ({ ...c, alive: true })));
    assert.deepEqual(s.holes.map(({ color, x, y, remaining, shape, done }) => ({ color, x, y, remaining, shape, done })), [
      { color: 'blue', x: 0, y: 0, remaining: 1, shape: [[0, 0]], done: false },
      { color: 'pink', x: 0, y: 2, remaining: 2, shape: [[0, 0]], done: false }
    ]);
    s.cats[0].x = 9; s.holes[0].remaining = 9; s.holes[0].shape[0][0] = 9; s.walls.length = 0;
    assert.deepEqual(g.getState(), logic.createGame(baseLevel()).getState());
  });

  test(`${slug}: các đường bị từ chối không đổi state`, () => {
    const g = logic.createGame(baseLevel());
    const s0 = g.getState();
    assert.deepEqual(g.move(0, 0, -1), rejected('blocked'));   // ra ngoài bàn
    assert.deepEqual(g.move(0, -1, 0), rejected('blocked'));
    assert.deepEqual(g.move(0, 1, 0), rejected('blocked'));    // mèo hồng chặn hố xanh
    assert.deepEqual(g.move(1, 0, -1), rejected('blocked'));   // mèo xanh chặn hố hồng
    assert.deepEqual(g.move(5, 1, 0), rejected('bad-move'));
    assert.deepEqual(g.move(-1, 1, 0), rejected('bad-move'));
    assert.deepEqual(g.move(0, 1, 1), rejected('bad-move'));
    assert.deepEqual(g.move(0, 0, 0), rejected('bad-move'));
    assert.deepEqual(g.move(0, 2, 0), rejected('bad-move'));
    assert.deepEqual(g.getState(), s0);
  });

  test(`${slug}: thu mèo, hố xong không chặn đường, tường chặn, thắng`, () => {
    const g = logic.createGame(baseLevel());
    assert.deepEqual(g.move(0, 0, 1), { ok: true, events: [
      { type: 'move', hole: 0, from: [0, 0], to: [0, 1] },
      { type: 'eat', hole: 0, ids: ['a'] },
      { type: 'holeDone', hole: 0 }
    ] });
    assert.deepEqual(g.move(0, 0, 1), rejected('bad-move'));   // hố đã xong
    let s = g.getState();
    assert.equal(s.turn, 1);
    assert.equal(s.cats.find(c => c.id === 'a').alive, false);
    assert.deepEqual(s.holes[0].done, true);
    assert.equal(g.move(1, 0, -1).ok, true);                    // đi vào ô của hố đã xong
    assert.deepEqual(g.move(1, 1, 0), rejected('blocked'));      // tường
    assert.equal(g.move(1, 0, -1).ok, true);
    assert.deepEqual(g.move(1, 1, 0).events, [
      { type: 'move', hole: 1, from: [0, 0], to: [1, 0] },
      { type: 'eat', hole: 1, ids: ['p'] }
    ]);
    play(g, '1RD');
    assert.deepEqual(g.move(1, 0, 1).events, [
      { type: 'move', hole: 1, from: [2, 1], to: [2, 2] },
      { type: 'eat', hole: 1, ids: ['q'] },
      { type: 'holeDone', hole: 1 },
      { type: 'win' }
    ]);
    s = g.getState();
    assert.equal(s.status, 'won');
    assert.equal(s.turn, 7);
  });

  test(`${slug}: hố nhiều ô thu ở mọi ô, tối đa remaining, bị chặn bởi ô bất kỳ`, () => {
    const lvl = {
      cols: 3, rows: 3,
      cats: [{ id: 'b1', color: 'blue', x: 1, y: 1 }, { id: 'b2', color: 'blue', x: 0, y: 1 }],
      holes: [{ color: 'blue', x: 0, y: 0, remaining: 1, shape: [[0, 0], [1, 0]] }],
      walls: [[2, 2]]
    };
    const g = logic.createGame(lvl);
    assert.deepEqual(g.move(0, 1, 0), rejected('blocked'));      // ô phải ra ngoài bàn
    assert.deepEqual(g.move(0, 0, 1).events, [
      { type: 'move', hole: 0, from: [0, 0], to: [0, 1] },
      { type: 'eat', hole: 0, ids: ['b1'] },
      { type: 'holeDone', hole: 0 },
      { type: 'win' }
    ]);
    assert.equal(g.getState().cats.find(c => c.id === 'b2').alive, true);
  });

  test(`${slug}: validateLevel và createGame bắt level xấu`, () => {
    assert.deepEqual(logic.validateLevel(baseLevel()), []);
    for (const fx of Object.values(set.list)) assert.deepEqual(logic.validateLevel(clone(fx.level)), []);
    const bad = [
      l => { l.cols = 0; },
      l => { l.cats[1].id = 'p'; },
      l => { l.cats[0].x = 3; },
      l => { l.cats[0].color = 'red'; },
      l => { l.cats[2].x = 1; l.cats[2].y = 0; },
      l => { l.holes = []; },
      l => { l.holes[0].remaining = 0; },
      l => { l.holes[1].remaining = 1.5; },
      l => { l.holes[0].shape = [[0, 0], [0, -1]]; },
      l => { l.walls.push([0, 0]); },
      l => { l.holes[1].x = 0; l.holes[1].y = 0; },
      l => { l.cats[0].arrow = [1, 1]; },
      l => { l.cats[0].kind = 'STRIPE_X'; },
      l => { l.pads = [[0, 0], [2, 2]]; }
    ];
    bad.forEach((mut, i) => {
      const l = baseLevel(); mut(l);
      assert.ok(logic.validateLevel(l).length > 0, `level xấu #${i} không bị bắt`);
      assert.throws(() => logic.createGame(l), Error, `createGame không ném với level xấu #${i}`);
    });
  });

  return logic;
}
