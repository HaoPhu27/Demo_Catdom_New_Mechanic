// Test nghiệm thu logic/stripe-cat.js — docs/logic-contract.md mục 5, design/quick-specs/stripe-cat-2026-10-26.md.
// Chạy: node --test tests/stripe-cat.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commonSuite, fixtures, play, last, clone } from './lab-common.mjs';

const logic = commonSuite('stripe-cat');
const fx = fixtures['stripe-cat'].list;
const game = key => logic.createGame(clone(fx[key].level));

test('stripe-cat: hố bắt đầu FREE, ăn sọc ngang thì khoá ngang, vuốt dọc bị chặn', () => {
  const g = game('SC-03');
  assert.deepEqual(g.getState().holes.map(h => h.axis), ['FREE']);
  assert.deepEqual(g.move(0, 1, 0).events, [
    { type: 'move', hole: 0, from: [2, 2], to: [3, 2] },
    { type: 'eat', hole: 0, ids: ['h-d3'] },
    { type: 'axis', hole: 0, axis: 'HORIZONTAL' }
  ]);
  const s = g.getState();
  assert.deepEqual(g.move(0, 0, -1), { ok: false, reason: 'axis-locked', events: [] });
  assert.deepEqual(g.move(0, 0, 1), { ok: false, reason: 'axis-locked', events: [] });
  assert.deepEqual(g.getState(), s);
  // Sọc cùng trục: không có event axis.
  assert.deepEqual(g.move(0, 1, 0).events, [{ type: 'move', hole: 0, from: [3, 2], to: [4, 2] }, { type: 'eat', hole: 0, ids: ['h-e3'] }]);
});

test('stripe-cat: hố dọc không đi ngang', () => {
  const g = game('SC-02');
  play(g, '1UU');
  assert.equal(g.getState().holes[1].axis, 'VERTICAL');
  assert.deepEqual(g.move(1, -1, 0), { ok: false, reason: 'axis-locked', events: [] });
});

test('stripe-cat: còn > 1 ăn sọc đối trục → thua stripe, không thu mèo', () => {
  const g = game('SC-02');
  assert.deepEqual(last(play(g, '0RR')).events, [{ type: 'move', hole: 0, from: [3, 2], to: [4, 2] }, { type: 'lose', reason: 'stripe' }]);
  const s = g.getState();
  assert.equal(s.cats.find(c => c.id === 'v-e3').alive, true);
  assert.equal(s.holes[0].remaining, 2);
});

test('stripe-cat: còn 1 thì mèo cuối hoàn thành hố, không xung đột', () => {
  const ev = last(play(game('SC-04'), '0RR')).events;
  assert.deepEqual(ev[1], { type: 'eat', hole: 0, ids: ['last-v'] });
  assert.deepEqual(ev.slice(-2), [{ type: 'holeDone', hole: 0 }, { type: 'win' }]);
});

test('stripe-cat: cùng nước chạm cả sọc ngang và dọc khi còn > 1 → thua stripe', () => {
  const g = logic.createGame({ cols: 3, rows: 3,
    cats: [{ id: 'h', color: 'blue', x: 0, y: 1, kind: 'STRIPE_H' }, { id: 'v', color: 'blue', x: 1, y: 1, kind: 'STRIPE_V' }, { id: 'n', color: 'blue', x: 2, y: 2 }],
    holes: [{ color: 'blue', x: 0, y: 0, remaining: 3, shape: [[0, 0], [1, 0]] }] });
  assert.deepEqual(g.move(0, 0, 1).events, [{ type: 'move', hole: 0, from: [0, 0], to: [0, 1] }, { type: 'lose', reason: 'stripe' }]);
});

test('stripe-cat: stuck phát hiện ngay ở nước gây ra nó (SC-05 đi →)', () => {
  assert.deepEqual(last(play(game('SC-05'), '0R')).events, [
    { type: 'move', hole: 0, from: [2, 2], to: [3, 2] },
    { type: 'eat', hole: 0, ids: ['lock'] },
    { type: 'axis', hole: 0, axis: 'HORIZONTAL' },
    { type: 'lose', reason: 'stuck' }
  ]);
});
