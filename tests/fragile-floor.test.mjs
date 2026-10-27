// Test nghiệm thu logic/fragile-floor.js — docs/logic-contract.md mục 5, design/quick-specs/fragile-floor-2026-10-26.md.
// Chạy: node --test tests/fragile-floor.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('fragile-floor');
const main = fixtures['fragile-floor'].list.main;

test('fragile-floor: sàn sụp cắt đường hố hồng → stuck', () => {
  const g = logic.createGame(clone(main.level));
  const rs = play(g, main.bad.moves);
  assert.deepEqual(rs[1].events, [{ type: 'move', hole: 0, from: [1, 2], to: [2, 2] }, { type: 'crack', x: 2, y: 2, durability: 1 }]);
  assert.deepEqual(last(rs).events, [
    { type: 'move', hole: 0, from: [1, 2], to: [2, 2] },
    { type: 'crack', x: 2, y: 2, durability: 0 },
    { type: 'lose', reason: 'stuck' }
  ]);
  assert.deepEqual(g.getState().floors, [{ x: 2, y: 2, durability: 0, max: 2 }]);
});

test('fragile-floor: sàn 0 chặn đường, hố đang đứng trên đó vẫn ra được', () => {
  const g = logic.createGame({ cols: 4, rows: 1, cats: [{ id: 'c', color: 'blue', x: 3, y: 0 }],
    holes: [{ color: 'blue', x: 0, y: 0, remaining: 1 }], floors: [{ x: 1, y: 0, durability: 1 }] });
  assert.deepEqual(g.move(0, 1, 0).events, [{ type: 'move', hole: 0, from: [0, 0], to: [1, 0] }, { type: 'crack', x: 1, y: 0, durability: 0 }]);
  assert.equal(g.move(0, 1, 0).ok, true);
  assert.deepEqual(g.move(0, -1, 0), { ok: false, reason: 'blocked', events: [] });
  assert.deepEqual(g.getState().floors, [{ x: 1, y: 0, durability: 0, max: 1 }]);
  assert.equal(g.getState().status, 'playing');
});

test('fragile-floor: hố nhiều ô vẫn phủ sàn thì không trừ; đi vào lại thì trừ', () => {
  const g = logic.createGame({ cols: 5, rows: 1, cats: [{ id: 'c', color: 'blue', x: 4, y: 0 }],
    holes: [{ color: 'blue', x: 0, y: 0, remaining: 1, shape: [[0, 0], [1, 0]] }], floors: [{ x: 1, y: 0, durability: 2, max: 2 }] });
  assert.deepEqual(g.move(0, 1, 0).events, [{ type: 'move', hole: 0, from: [0, 0], to: [1, 0] }]);
  assert.equal(g.move(0, 1, 0).events.length, 1);
  assert.deepEqual(g.move(0, -1, 0).events[1], { type: 'crack', x: 1, y: 0, durability: 1 });
});

test('fragile-floor: stuck dùng tìm đường thật, không chỉ ô kề', () => {
  // Mèo hồng không kề hố hồng nhưng còn đường vòng qua hàng dưới: không thua.
  const g = logic.createGame({ cols: 3, rows: 3, cats: [{ id: 'b', color: 'blue', x: 2, y: 0 }, { id: 'p', color: 'pink', x: 2, y: 2 }],
    holes: [{ color: 'blue', x: 0, y: 0, remaining: 1 }, { color: 'pink', x: 0, y: 2, remaining: 1 }],
    walls: [[1, 1]], floors: [{ x: 1, y: 0, durability: 1 }] });
  play(g, '0R');
  assert.equal(g.getState().status, 'playing');
});
