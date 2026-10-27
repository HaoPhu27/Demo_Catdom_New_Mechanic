// Test nghiệm thu logic/electric-link.js — docs/logic-contract.md mục 5, design/quick-specs/electric-link-2026-10-26.md.
// Chạy: node --test tests/electric-link.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('electric-link');
const fx = fixtures['electric-link'].list;
const game = key => logic.createGame(clone(fx[key].level));

test('electric-link: đoạn nối trống → điện bật thành rào, nhả công tắc thì tắt', () => {
  const g = game('EL-00');
  const s0 = g.getState();
  assert.deepEqual([s0.pads, s0.barrier, s0.electricOn], [[[1, 2], [3, 2]], [[2, 2]], false]);
  assert.deepEqual(last(play(g, '0UU 1UU')).events, [{ type: 'move', hole: 1, from: [3, 3], to: [3, 2] }, { type: 'electricOn' }]);
  assert.equal(g.getState().electricOn, true);
  assert.deepEqual(g.move(0, 1, 0), { ok: false, reason: 'electric-barrier', events: [] });
  assert.deepEqual(g.move(0, -1, 0).events, [{ type: 'move', hole: 0, from: [1, 2], to: [0, 2] }, { type: 'electricOff' }]);
  assert.equal(g.getState().electricOn, false);
});

test('electric-link: bật điện trúng mèo → thua trước khi thu mèo', () => {
  const g = game('EL-01');
  assert.deepEqual(last(play(g, fx['EL-01'].bad.moves)).events, [
    { type: 'move', hole: 1, from: [4, 2], to: [3, 2] }, { type: 'electricOn' }, { type: 'lose', reason: 'electric' }
  ]);
});

test('electric-link: bật điện trúng hố → thua', () => {
  const ev = last(play(game('EL-02'), fx['EL-02'].bad.moves)).events;
  assert.deepEqual(ev.slice(-2), [{ type: 'electricOn' }, { type: 'lose', reason: 'electric' }]);
});

test('electric-link: một hố nhiều ô đứng trên cả A và B không bật điện', () => {
  const g = logic.createGame({ cols: 3, rows: 2, pads: [[0, 0], [2, 0]],
    cats: [{ id: 'c', color: 'blue', x: 1, y: 0 }],
    holes: [{ color: 'blue', x: 0, y: 1, remaining: 1, shape: [[0, 0], [1, 0], [2, 0]] }] });
  assert.deepEqual(g.move(0, 0, -1).events, [
    { type: 'move', hole: 0, from: [0, 1], to: [0, 0] },
    { type: 'eat', hole: 0, ids: ['c'] },
    { type: 'holeDone', hole: 0 },
    { type: 'win' }
  ]);
});
