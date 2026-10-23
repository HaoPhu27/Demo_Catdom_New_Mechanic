// Test nghiệm thu cho logic/weed.js theo docs/logic-contract.md (mục 1–3, 4.1) và design/quick-specs/weed-area-2026-10-23.md.
// Chạy: node --test tests/weed.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const weed = require('../logic/weed.js');

const base = () => ({
  cols: 5, rows: 5,
  cats: [
    {id: 'g1', color: 'green', x: 0, y: 0}, {id: 'g2', color: 'green', x: 0, y: 1},
    {id: 'o1', color: 'orange', x: 2, y: 2}, {id: 'o2', color: 'orange', x: 2, y: 3},
    {id: 'b1', color: 'blue', x: 0, y: 3}, {id: 'b2', color: 'blue', x: 1, y: 3},
    {id: 'y1', color: 'yellow', x: 4, y: 3}
  ],
  weedArea: {x: 2, y: 0, w: 3, h: 2}, weedStart: [[4, 0]], pesticide: {x: 1, y: 1}
});
const types = r => r.events.map(e => e.type);

test('module: UMD export cho Node và trình duyệt', () => {
  assert.equal(typeof weed.createGame, 'function');
  assert.equal(typeof weed.validateLevel, 'function');
  const ctx = {self: {}};
  vm.runInNewContext(readFileSync(new URL('../logic/weed.js', import.meta.url), 'utf8'), ctx);
  assert.equal(typeof ctx.self.CatDomLogic.weed.createGame, 'function');
});

test('không dùng Math.random và DOM', () => {
  const src = readFileSync(new URL('../logic/weed.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /Math\.random|document\.|window\./);
});

test('state ban đầu', () => {
  const s = weed.createGame(base()).getState();
  assert.equal(s.status, 'playing');
  assert.equal(s.loseReason, null);
  assert.equal(s.clearedCount, 0);
  assert.deepEqual(s.weed, {area: {x: 2, y: 0, w: 3, h: 2}, cells: [[4, 0]], total: 6, cleared: false});
  assert.deepEqual(s.pesticide, {x: 1, y: 1, picked: false});
  assert.deepEqual(s.cats.map(c => [c.id, c.alive]), base().cats.map(c => [c.id, true]));
  assert.deepEqual(Object.keys(s.cats[0]).sort(), ['alive', 'color', 'id', 'x', 'y']);
});

test('groupAt: nhóm cùng màu nối 4 hướng, sắp theo y rồi x', () => {
  const g = weed.createGame(base());
  assert.deepEqual(g.groupAt(1, 3), ['b1', 'b2']);
  assert.deepEqual(g.groupAt(2, 3), ['o1', 'o2']);
  assert.deepEqual(g.groupAt(3, 3), []);
  assert.deepEqual(g.groupAt(9, 9), []);
});

test('mỗi mèo lọt hố mọc 1 ô theo thứ tự y rồi x, kề ô đã phủ', () => {
  const g = weed.createGame(base());
  const r = g.eat(0, 3);
  assert.equal(r.ok, true);
  assert.deepEqual(r.events, [
    {type: 'eat', ids: ['b1', 'b2']},
    {type: 'weedGrow', cell: [3, 0], covered: 2, total: 6},
    {type: 'weedGrow', cell: [2, 0], covered: 3, total: 6}
  ]);
  assert.deepEqual(g.getState().weed.cells, [[4, 0], [3, 0], [2, 0]]);
  assert.equal(g.getState().clearedCount, 2);
});

test('phủ kín thì thua, dừng mọc giữa lượt, sau đó mọi hành động bị từ chối', () => {
  const g = weed.createGame(base());
  g.eat(0, 3);                       // 3/6
  const r2 = g.eat(0, 0);            // 5/6
  assert.deepEqual(r2.events.filter(e => e.type === 'weedGrow').map(e => e.cell), [[2, 1], [3, 1]]);
  const r3 = g.eat(2, 2);            // o1 làm kín 6/6, o2 không mọc thêm
  assert.deepEqual(r3.events, [
    {type: 'eat', ids: ['o1', 'o2']},
    {type: 'weedGrow', cell: [4, 1], covered: 6, total: 6},
    {type: 'lose', reason: 'weed'}
  ]);
  const s = g.getState();
  assert.equal(s.status, 'lost');
  assert.equal(s.loseReason, 'weed');
  assert.deepEqual(g.eat(4, 3), {ok: false, reason: 'not-playing', events: []});
  assert.deepEqual(g.pickPesticide(), {ok: false, reason: 'not-playing', events: []});
});

test('pickPesticide xoá sạch, không mọc lại, gọi lần hai bị từ chối', () => {
  const g = weed.createGame(base());
  g.eat(0, 3);
  const r = g.pickPesticide();
  assert.deepEqual(r, {ok: true, events: [{type: 'pick'}, {type: 'weedClear', cells: [[4, 0], [3, 0], [2, 0]]}]});
  let s = g.getState();
  assert.deepEqual(s.weed.cells, []);
  assert.equal(s.weed.cleared, true);
  assert.equal(s.pesticide.picked, true);
  assert.equal(s.clearedCount, 2);
  assert.deepEqual(g.pickPesticide(), {ok: false, reason: 'already-picked', events: []});
  assert.deepEqual(types(g.eat(0, 0)), ['eat']);
  assert.deepEqual(types(g.eat(2, 2)), ['eat']);
  assert.deepEqual(g.eat(4, 3).events, [{type: 'eat', ids: ['y1']}, {type: 'win'}]);
  s = g.getState();
  assert.equal(s.status, 'won');
  assert.equal(s.clearedCount, 7);
});

test('thắng không cần nhặt thuốc sâu nếu chưa phủ kín', () => {
  const lvl = base();
  lvl.cats = [{id: 'a', color: 'pink', x: 0, y: 4}];
  const g = weed.createGame(lvl);
  assert.deepEqual(g.eat(0, 4).events, [
    {type: 'eat', ids: ['a']}, {type: 'weedGrow', cell: [3, 0], covered: 2, total: 6}, {type: 'win'}
  ]);
});

test('thua được kiểm trước thắng', () => {
  const lvl = base();
  lvl.cats = [{id: 'a', color: 'pink', x: 0, y: 4}];
  lvl.weedStart = [[2, 0], [3, 0], [4, 0], [2, 1], [3, 1]];
  const r = weed.createGame(lvl).eat(0, 4);
  assert.deepEqual(r.events.at(-1), {type: 'lose', reason: 'weed'});
  assert.equal(r.events.some(e => e.type === 'win'), false);
});

test('eat bị từ chối: ô trống, ngoài bàn, ô thuốc sâu', () => {
  const g = weed.createGame(base());
  assert.deepEqual(g.eat(3, 3), {ok: false, reason: 'empty', events: []});
  assert.deepEqual(g.eat(1, 1), {ok: false, reason: 'empty', events: []});
  assert.deepEqual(g.eat(-1, 0), {ok: false, reason: 'out-of-board', events: []});
  assert.deepEqual(g.eat(5, 0), {ok: false, reason: 'out-of-board', events: []});
  g.eat(0, 3);
  assert.deepEqual(g.eat(0, 3), {ok: false, reason: 'empty', events: []});
  assert.equal(g.getState().clearedCount, 2);
});

test('getState là bản sao sâu, createGame không sửa level', () => {
  const lvl = base();
  const snapshot = JSON.stringify(lvl);
  const g = weed.createGame(lvl);
  const s = g.getState();
  s.weed.cells.push([0, 0]); s.cats[0].alive = false; s.pesticide.picked = true;
  assert.deepEqual(g.getState().weed.cells, [[4, 0]]);
  assert.equal(g.getState().cats[0].alive, true);
  g.eat(0, 3);
  assert.equal(JSON.stringify(lvl), snapshot);
});

test('validateLevel: level hợp lệ không có lỗi', () => {
  assert.deepEqual(weed.validateLevel(base()), []);
});

for (const [name, mutate] of [
  ['thuốc sâu nằm trong khu vực', l => { l.pesticide = {x: 3, y: 1}; }],
  ['thuốc sâu ngoài bàn', l => { l.pesticide = {x: 7, y: 1}; }],
  ['thuốc sâu trùng ô mèo', l => { l.pesticide = {x: 0, y: 0}; }],
  ['mèo trong khu vực', l => { l.cats.push({id: 'z', color: 'pink', x: 3, y: 1}); }],
  ['khu vực ra ngoài bàn', l => { l.weedArea = {x: 3, y: 0, w: 3, h: 2}; }],
  ['weedStart rỗng', l => { l.weedStart = []; }],
  ['weedStart ngoài khu vực', l => { l.weedStart = [[0, 4]]; }],
  ['weedStart trùng', l => { l.weedStart = [[4, 0], [4, 0]]; }],
  ['weedStart đã phủ kín', l => { l.weedStart = [[2, 0], [3, 0], [4, 0], [2, 1], [3, 1], [4, 1]]; }],
  ['id mèo trùng', l => { l.cats[1].id = 'g1'; }],
  ['hai mèo cùng ô', l => { l.cats[1].y = 0; }],
  ['mèo ngoài bàn', l => { l.cats[0].x = 9; }],
  ['màu không hợp lệ', l => { l.cats[0].color = 'red'; }],
  ['cols không hợp lệ', l => { l.cols = 0; }]
]) {
  test(`validateLevel + createGame bắt lỗi: ${name}`, () => {
    const l = base(); mutate(l);
    const errs = weed.validateLevel(l);
    assert.ok(Array.isArray(errs) && errs.length > 0, 'phải có ít nhất 1 lỗi');
    assert.ok(errs.every(e => typeof e === 'string' && e.length > 0));
    assert.throws(() => weed.createGame(l), err => err instanceof Error && err.message === errs.join('; '));
  });
}
