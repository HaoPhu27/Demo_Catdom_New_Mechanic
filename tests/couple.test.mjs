// Test nghiệm thu cho logic/couple.js theo docs/logic-contract.md (mục 1–3, 4.3) và design/quick-specs/couple-cat-2026-10-23.md.
// Chạy: node --test tests/couple.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const couple = require('../logic/couple.js');

const base = () => ({
  cols: 5, rows: 5,
  cats: [
    {id: 'c1', color: 'blue', x: 0, y: 0, couple: 'A'}, {id: 'g1', color: 'green', x: 2, y: 0}, {id: 'g2', color: 'green', x: 3, y: 0},
    {id: 'o1', color: 'orange', x: 0, y: 2}, {id: 'o2', color: 'orange', x: 1, y: 2}, {id: 'y1', color: 'yellow', x: 3, y: 2},
    {id: 'c2', color: 'purple', x: 4, y: 4, couple: 'A'}
  ],
  couples: [{id: 'A', n: 3, mark: 'pink'}]
});
const cp = (g, id = 'A') => g.getState().couples.find(c => c.id === id);

test('module: UMD export cho Node và trình duyệt, không Math.random/DOM', () => {
  assert.equal(typeof couple.createGame, 'function');
  assert.equal(typeof couple.validateLevel, 'function');
  const src = readFileSync(new URL('../logic/couple.js', import.meta.url), 'utf8');
  const ctx = {self: {}};
  vm.runInNewContext(src, ctx);
  assert.equal(typeof ctx.self.CatDomLogic.couple.createGame, 'function');
  assert.doesNotMatch(src, /Math\.random|document\.|window\./);
});

test('state ban đầu', () => {
  const s = couple.createGame(base()).getState();
  assert.equal(s.status, 'playing');
  assert.equal(s.loseReason, null);
  assert.equal(s.clearedCount, 0);
  assert.deepEqual(s.couples, [{id: 'A', n: 3, mark: 'pink', cats: ['c1', 'c2'], state: 'idle', target: null, remaining: null}]);
  assert.ok(s.cats.every(c => c.alive));
});

test('kích hoạt: con kia đếm n, lượt kích hoạt không trừ', () => {
  const g = couple.createGame(base());
  assert.deepEqual(g.eat(0, 0), {ok: true, events: [
    {type: 'eat', ids: ['c1']},
    {type: 'coupleTrigger', couple: 'A', by: 'c1', target: 'c2', remaining: 3}
  ]});
  assert.deepEqual(cp(g), {id: 'A', n: 3, mark: 'pink', cats: ['c1', 'c2'], state: 'counting', target: 'c2', remaining: 3});
});

test('con nào ăn trước cũng kích hoạt', () => {
  const g = couple.createGame(base());
  assert.deepEqual(g.eat(4, 4).events[1], {type: 'coupleTrigger', couple: 'A', by: 'c2', target: 'c1', remaining: 3});
});

test('mèo khác cùng lượt kích hoạt không bị trừ', () => {
  const lvl = base();
  lvl.cats[1] = {id: 'g1', color: 'blue', x: 1, y: 0};   // nhóm xanh: c1 + g1
  const g = couple.createGame(lvl);
  const r = g.eat(0, 0);
  assert.deepEqual(r.events, [{type: 'eat', ids: ['c1', 'g1']}, {type: 'coupleTrigger', couple: 'A', by: 'c1', target: 'c2', remaining: 3}]);
  assert.equal(cp(g).remaining, 3);
});

test('trừ đúng số mèo mỗi lượt; ăn target trước khi về 0 thì an toàn', () => {
  const g = couple.createGame(base());
  g.eat(0, 0);
  assert.deepEqual(g.eat(2, 0).events, [{type: 'eat', ids: ['g1', 'g2']}, {type: 'coupleCount', couple: 'A', target: 'c2', remaining: 1}]);
  assert.deepEqual(g.eat(4, 4).events, [{type: 'eat', ids: ['c2']}, {type: 'coupleSafe', couple: 'A'}]);
  assert.deepEqual(cp(g), {id: 'A', n: 3, mark: 'pink', cats: ['c1', 'c2'], state: 'safe', target: 'c2', remaining: 1});
  assert.deepEqual(g.eat(0, 2).events, [{type: 'eat', ids: ['o1', 'o2']}]);
  assert.deepEqual(g.eat(3, 2).events, [{type: 'eat', ids: ['y1']}, {type: 'win'}]);
  assert.equal(g.getState().status, 'won');
  assert.equal(g.getState().clearedCount, 7);
});

test('về 0 thì thua (remaining có thể âm), sau đó từ chối mọi hành động', () => {
  const g = couple.createGame(base());
  g.eat(0, 0); g.eat(2, 0);
  assert.deepEqual(g.eat(0, 2).events, [
    {type: 'eat', ids: ['o1', 'o2']},
    {type: 'coupleCount', couple: 'A', target: 'c2', remaining: -1},
    {type: 'lose', reason: 'couple', couple: 'A'}
  ]);
  const s = g.getState();
  assert.equal(s.status, 'lost');
  assert.equal(s.loseReason, 'couple');
  assert.equal(cp(g).state, 'broken');
  assert.deepEqual(g.eat(4, 4), {ok: false, reason: 'not-playing', events: []});
});

test('remaining đúng bằng 0 cũng thua', () => {
  const lvl = base(); lvl.couples[0].n = 2;
  const g = couple.createGame(lvl);
  g.eat(0, 0);
  assert.deepEqual(g.eat(2, 0).events.slice(1), [{type: 'coupleCount', couple: 'A', target: 'c2', remaining: 0}, {type: 'lose', reason: 'couple', couple: 'A'}]);
});

test('ăn cả cặp trong một lượt thì an toàn ngay', () => {
  const lvl = base();
  lvl.cats[6] = {id: 'c2', color: 'blue', x: 1, y: 0, couple: 'A'};
  const g = couple.createGame(lvl);
  assert.deepEqual(g.eat(0, 0).events, [{type: 'eat', ids: ['c1', 'c2']}, {type: 'coupleSafe', couple: 'A'}]);
  assert.deepEqual(cp(g), {id: 'A', n: 3, mark: 'pink', cats: ['c1', 'c2'], state: 'safe', target: null, remaining: null});
});

test('hai cặp chạy độc lập, xử lý theo thứ tự couples', () => {
  const lvl = {cols: 6, rows: 1, couples: [{id: 'A', n: 2, mark: 'pink'}, {id: 'B', n: 3, mark: 'blue'}],
    cats: [{id: 'a1', color: 'green', x: 0, y: 0, couple: 'A'}, {id: 'b1', color: 'orange', x: 1, y: 0, couple: 'B'},
      {id: 'x', color: 'yellow', x: 2, y: 0}, {id: 'b2', color: 'purple', x: 3, y: 0, couple: 'B'},
      {id: 'a2', color: 'blue', x: 4, y: 0, couple: 'A'}, {id: 'z', color: 'pink', x: 5, y: 0}]};
  const g = couple.createGame(lvl);
  assert.deepEqual(g.eat(0, 0).events.slice(1), [{type: 'coupleTrigger', couple: 'A', by: 'a1', target: 'a2', remaining: 2}]);
  assert.deepEqual(g.eat(1, 0).events.slice(1), [
    {type: 'coupleCount', couple: 'A', target: 'a2', remaining: 1},
    {type: 'coupleTrigger', couple: 'B', by: 'b1', target: 'b2', remaining: 3}
  ]);
  assert.deepEqual(g.eat(4, 0).events.slice(1), [
    {type: 'coupleSafe', couple: 'A'},
    {type: 'coupleCount', couple: 'B', target: 'b2', remaining: 2}
  ]);
  assert.deepEqual(g.getState().couples.map(c => c.state), ['safe', 'counting']);
});

test('eat bị từ chối: ô trống, ngoài bàn', () => {
  const g = couple.createGame(base());
  assert.deepEqual(g.eat(1, 1), {ok: false, reason: 'empty', events: []});
  assert.deepEqual(g.eat(0, -1), {ok: false, reason: 'out-of-board', events: []});
});

test('getState là bản sao sâu, createGame không sửa level', () => {
  const lvl = base(); const snap = JSON.stringify(lvl);
  const g = couple.createGame(lvl);
  const s = g.getState(); s.couples[0].state = 'safe'; s.couples[0].cats.pop();
  assert.equal(cp(g).state, 'idle');
  assert.deepEqual(cp(g).cats, ['c1', 'c2']);
  g.eat(0, 0); g.eat(2, 0);
  assert.equal(JSON.stringify(lvl), snap);
});

test('validateLevel: level hợp lệ không có lỗi', () => assert.deepEqual(couple.validateLevel(base()), []));

for (const [name, mutate] of [
  ['cặp chỉ có 1 mèo', l => { delete l.cats[6].couple; }],
  ['cặp có 3 mèo', l => { l.cats[1].couple = 'A'; }],
  ['mèo trỏ tới cặp không tồn tại', l => { l.cats[1].couple = 'Z'; }],
  ['n không hợp lệ', l => { l.couples[0].n = 0; }],
  ['n không nguyên', l => { l.couples[0].n = 2.5; }],
  ['mark không hợp lệ', l => { l.couples[0].mark = 'red'; }],
  ['mark trùng giữa các cặp', l => { l.couples.push({id: 'B', n: 2, mark: 'pink'}); l.cats[1].couple = 'B'; l.cats[2].couple = 'B'; }],
  ['id cặp trùng', l => { l.couples.push({id: 'A', n: 2, mark: 'blue'}); }],
  ['id mèo trùng', l => { l.cats[1].id = 'c1'; }],
  ['hai mèo cùng ô', l => { l.cats[1].x = 0; }],
  ['mèo ngoài bàn', l => { l.cats[1].y = 7; }]
]) {
  test(`validateLevel + createGame bắt lỗi: ${name}`, () => {
    const l = base(); mutate(l);
    const errs = couple.validateLevel(l);
    assert.ok(Array.isArray(errs) && errs.length > 0, 'phải có ít nhất 1 lỗi');
    assert.throws(() => couple.createGame(l), err => err instanceof Error && err.message === errs.join('; '));
  });
}
