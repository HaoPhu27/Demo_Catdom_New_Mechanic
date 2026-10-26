// Test nghiệm thu logic/alarm-zone.js — docs/logic-contract.md mục 5, design/quick-specs/alarm-zone-2026-10-26.md.
// Chạy: node --test tests/alarm-zone.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('alarm-zone');
const main = fixtures['alarm-zone'].list.main;

test('alarm-zone: state báo động, đứng lên S thì tắt', () => {
  const g = logic.createGame(clone(main.level));
  const s = g.getState();
  assert.equal(s.alarmOn, true);
  assert.deepEqual(s.alarmSwitches, [[0, 3]]);
  assert.deepEqual(s.alarms, [[1, 2], [2, 2], [3, 2], [4, 2]]);
  assert.deepEqual(g.move(0, 0, -1).events, [{ type: 'move', hole: 0, from: [0, 4], to: [0, 3] }, { type: 'alarmOff' }]);
  assert.equal(g.getState().alarmOn, false);
});

test('alarm-zone: nhả S khi hố khác còn trong vùng → thua, dù hố vừa đi ở ngoài vùng', () => {
  const g = logic.createGame(clone(main.level));
  assert.deepEqual(last(play(g, main.bad.moves)).events, [
    { type: 'move', hole: 0, from: [0, 3], to: [0, 4] },
    { type: 'alarmOn' },
    { type: 'lose', reason: 'alarm' }
  ]);
});

test('alarm-zone: đi vào vùng khi báo động bật → thua ngay', () => {
  const g = logic.createGame(clone(main.level));
  assert.deepEqual(last(play(g, '1UU')).events, [{ type: 'move', hole: 1, from: [4, 3], to: [4, 2] }, { type: 'lose', reason: 'alarm' }]);
});

test('alarm-zone: hố giữ S hoàn thành thì báo động bật lại ngay và được kiểm', () => {
  const g = logic.createGame({ cols: 3, rows: 3,
    cats: [{ id: 'c', color: 'blue', x: 0, y: 0 }, { id: 'd', color: 'pink', x: 2, y: 0 }],
    holes: [{ color: 'blue', x: 0, y: 1, remaining: 1, shape: [[0, 0], [0, 1]] }, { color: 'pink', x: 2, y: 2, remaining: 1 }],
    alarmSwitches: [[0, 1]], alarms: [[2, 2]] });
  assert.equal(g.getState().alarmOn, false);
  assert.deepEqual(g.move(0, 0, -1).events, [
    { type: 'move', hole: 0, from: [0, 1], to: [0, 0] },
    { type: 'eat', hole: 0, ids: ['c'] },
    { type: 'holeDone', hole: 0 },
    { type: 'alarmOn' },
    { type: 'lose', reason: 'alarm' }
  ]);
  assert.equal(g.getState().alarmOn, true);
});
