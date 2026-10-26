// Test nghiệm thu logic/magnet.js — docs/logic-contract.md mục 5, design/quick-specs/magnet-2026-10-26.md.
// Chạy: node --test tests/magnet.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('magnet');
const main = fixtures.magnet.list.main;

test('magnet: hút mọi mèo trong 3×3 kể cả khác màu, không giảm remaining', () => {
  const g = logic.createGame(clone(main.level));
  const rs = play(g, main.bad.moves);
  assert.deepEqual(last(rs).events, [
    { type: 'move', hole: 1, from: [2, 3], to: [2, 2] },
    { type: 'eat', hole: 1, ids: ['magnet'] },
    { type: 'holeDone', hole: 1 },
    { type: 'magnet', source: 'magnet', ids: ['blue', 'pink'] },
    { type: 'lose', reason: 'stuck' }
  ]);
  const s = g.getState();
  assert.deepEqual(s.cats.map(c => [c.id, c.alive, c.pulled]), [['blue', false, true], ['magnet', false, false], ['pink', false, true]]);
  assert.deepEqual(s.holes.map(h => h.remaining), [1, 0, 1]);
});

test('magnet: mèo ngoài 3×3 không bị hút; vùng trống thì không có event magnet', () => {
  const lvl = clone(main.level);
  lvl.cats.push({ id: 'far', color: 'blue', x: 4, y: 0 });
  lvl.holes[0].remaining = 2;
  const g = logic.createGame(lvl);
  const rs = play(g, '1UU');
  assert.deepEqual(last(rs).events.find(e => e.type === 'magnet'), { type: 'magnet', source: 'magnet', ids: ['blue', 'pink'] });
  assert.equal(g.getState().cats.find(c => c.id === 'far').alive, true);

  const g2 = logic.createGame(clone(main.level));
  assert.equal(last(play(g2, main.good)).events.some(e => e.type === 'magnet'), false);
});
