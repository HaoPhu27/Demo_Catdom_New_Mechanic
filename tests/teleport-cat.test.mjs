// Test nghiệm thu logic/teleport-cat.js — docs/logic-contract.md mục 5, design/quick-specs/teleport-cat-2026-10-26.md.
// Chạy: node --test tests/teleport-cat.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('teleport-cat');
const main = fixtures['teleport-cat'].list.main;

test('teleport-cat: đẩy mèo vào hốc hẹp → stuck', () => {
  const g = logic.createGame(clone(main.level));
  assert.deepEqual(last(play(g, main.bad.moves)).events, [
    { type: 'move', hole: 0, from: [1, 2], to: [2, 2] },
    { type: 'eat', hole: 0, ids: ['arrow'] },
    { type: 'teleport', id: 'normal', from: [3, 1], to: [4, 1] },
    { type: 'lose', reason: 'stuck' }
  ]);
  const c = g.getState().cats.find(c => c.id === 'normal');
  assert.deepEqual([c.x, c.y, c.alive], [4, 1, true]);
});

test('teleport-cat: dịch đồng thời, mèo khác màu đứng yên', () => {
  const g = logic.createGame({ cols: 5, rows: 2,
    cats: [{ id: 'ar', color: 'blue', x: 0, y: 0, arrow: [1, 0] }, { id: 'c1', color: 'blue', x: 2, y: 0 },
      { id: 'c2', color: 'blue', x: 3, y: 0 }, { id: 'pk', color: 'pink', x: 1, y: 1 }],
    holes: [{ color: 'blue', x: 0, y: 1, remaining: 3 }, { color: 'pink', x: 2, y: 1, remaining: 1 }] });
  assert.deepEqual(g.move(0, 0, -1).events, [
    { type: 'move', hole: 0, from: [0, 1], to: [0, 0] },
    { type: 'eat', hole: 0, ids: ['ar'] },
    { type: 'teleportBlocked', id: 'c1' },
    { type: 'teleport', id: 'c2', from: [3, 0], to: [4, 0] }
  ]);
  const at = id => { const c = g.getState().cats.find(c => c.id === id); return [c.x, c.y]; };
  assert.deepEqual([at('c1'), at('c2'), at('pk')], [[2, 0], [4, 0], [1, 1]]);
});

test('teleport-cat: tường, mép bàn và hố còn hoạt động chặn dịch chuyển', () => {
  const g = logic.createGame({ cols: 3, rows: 3,
    cats: [{ id: 'ar', color: 'blue', x: 0, y: 0, arrow: [0, 1] }, { id: 'w', color: 'blue', x: 1, y: 0 },
      { id: 'e', color: 'blue', x: 2, y: 2 }, { id: 'h', color: 'blue', x: 2, y: 0 }],
    holes: [{ color: 'blue', x: 0, y: 1, remaining: 4 }, { color: 'pink', x: 2, y: 1, remaining: 1 }, { color: 'pink', x: 0, y: 2, remaining: 1 }],
    walls: [[1, 1]] });
  assert.deepEqual(g.move(0, 0, -1).events.slice(2), [
    { type: 'teleportBlocked', id: 'w' }, { type: 'teleportBlocked', id: 'e' }, { type: 'teleportBlocked', id: 'h' }
  ]);
});
