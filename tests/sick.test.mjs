// Test nghiệm thu cho logic/sick.js theo docs/logic-contract.md (mục 1–3, 4.2) và design/quick-specs/sick-cat-2026-10-23.md.
// Chạy: node --test tests/sick.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const sick = require('../logic/sick.js');

const base = () => ({
  cols: 5, rows: 5,
  cats: [
    {id: 'b1', color: 'blue', x: 0, y: 0}, {id: 'b2', color: 'blue', x: 1, y: 0}, {id: 'g1', color: 'green', x: 4, y: 0},
    {id: 'o1', color: 'orange', x: 1, y: 2}, {id: 'p1', color: 'pink', x: 2, y: 2}, {id: 'o2', color: 'orange', x: 3, y: 2},
    {id: 'u1', color: 'purple', x: 0, y: 4}, {id: 'u2', color: 'purple', x: 1, y: 4}, {id: 'y1', color: 'yellow', x: 2, y: 4}
  ],
  boxes: [{id: 'bx', x: 4, y: 4, cats: [{id: 'bx1', color: 'green'}]}],
  initialSick: 'p1'
});
const sickIds = g => g.getState().cats.filter(c => c.alive && c.sick).map(c => c.id);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

test('module: UMD export cho Node và trình duyệt, không Math.random/DOM', () => {
  assert.equal(typeof sick.createGame, 'function');
  assert.equal(typeof sick.validateLevel, 'function');
  const src = readFileSync(new URL('../logic/sick.js', import.meta.url), 'utf8');
  const ctx = {self: {}};
  vm.runInNewContext(src, ctx);
  assert.equal(typeof ctx.self.CatDomLogic.sick.createGame, 'function');
  assert.doesNotMatch(src, /Math\.random|document\.|window\./);
});

test('state ban đầu', () => {
  const s = sick.createGame(base()).getState();
  assert.equal(s.status, 'playing');
  assert.equal(s.loseReason, null);
  assert.equal(s.clearedCount, 0);
  assert.equal(s.sickCount, 1);
  assert.equal(s.totalRemaining, 10);
  assert.equal(s.loseRatio, 0.5);
  assert.deepEqual(s.cats.filter(c => c.sick).map(c => c.id), ['p1']);
  assert.ok(s.cats.every(c => c.alive === true && typeof c.sick === 'boolean'));
  assert.deepEqual(s.boxes, [{id: 'bx', x: 4, y: 4, queue: [{id: 'bx1', color: 'green'}]}]);
  assert.equal(s.cats.some(c => c.id === 'bx1'), false);
});

test('groupAt: nhóm trên bàn, box chỉ trả con đầu', () => {
  const g = sick.createGame(base());
  assert.deepEqual(g.groupAt(1, 0), ['b1', 'b2']);
  assert.deepEqual(g.groupAt(4, 4), ['bx1']);
  assert.deepEqual(g.groupAt(3, 3), []);
});

test('mỗi mèo khoẻ bị ăn gây 1 ca lây cho con gần nhất (Manhattan, rồi y, rồi x)', () => {
  const g = sick.createGame(base());
  const r = g.eat(0, 0);
  assert.deepEqual(r, {ok: true, events: [
    {type: 'eat', ids: ['b1', 'b2']},
    {type: 'infect', from: 'p1', to: 'o1'},
    {type: 'infect', from: 'p1', to: 'o2'}
  ]});
  assert.deepEqual(sickIds(g), ['o1', 'p1', 'o2']);
  const s = g.getState();
  assert.equal(s.sickCount, 3);
  assert.equal(s.totalRemaining, 8);
  assert.equal(s.clearedCount, 2);
});

test('nguồn lây là mèo bệnh gần mục tiêu nhất; chạm ngưỡng thì thua', () => {
  const g = sick.createGame(base());
  g.eat(0, 0);
  const r = g.eat(0, 4);
  assert.deepEqual(r.events, [
    {type: 'eat', ids: ['u1', 'u2']},
    {type: 'infect', from: 'p1', to: 'y1'},
    {type: 'infect', from: 'o2', to: 'g1'},
    {type: 'lose', reason: 'sick', sick: 5, total: 6}
  ]);
  const s = g.getState();
  assert.equal(s.status, 'lost');
  assert.equal(s.loseReason, 'sick');
  assert.deepEqual(g.eat(4, 4), {ok: false, reason: 'not-playing', events: []});
});

test('ăn mèo bệnh không gây lây; hết ổ bệnh thì không lây nữa', () => {
  const g = sick.createGame(base());
  assert.deepEqual(g.eat(2, 2).events, [{type: 'eat', ids: ['p1']}]);
  assert.equal(g.getState().sickCount, 0);
  assert.deepEqual(g.eat(0, 0).events, [{type: 'eat', ids: ['b1', 'b2']}]);
  assert.deepEqual(sickIds(g), []);
});

test('mèo box miễn nhiễm, ăn box chỉ lấy con đầu và phát boxNext', () => {
  const lvl = base();
  lvl.boxes = [{id: 'bx', x: 4, y: 4, cats: [{id: 'bx1', color: 'green'}, {id: 'bx2', color: 'blue'}]}];
  lvl.cats = [{id: 'p1', color: 'pink', x: 3, y: 4}, {id: 'h1', color: 'orange', x: 0, y: 0}, {id: 'h2', color: 'yellow', x: 1, y: 0},
    {id: 'h3', color: 'purple', x: 2, y: 0}, {id: 'h4', color: 'green', x: 3, y: 0}];
  lvl.loseRatio = 0.9;
  const g = sick.createGame(lvl);
  const r = g.eat(4, 4);
  assert.deepEqual(r.events, [
    {type: 'eat', ids: ['bx1']},
    {type: 'boxNext', boxId: 'bx', next: {id: 'bx2', color: 'blue'}},
    {type: 'infect', from: 'p1', to: 'h4'}
  ]);
  const s = g.getState();
  assert.deepEqual(s.boxes[0].queue, [{id: 'bx2', color: 'blue'}]);
  assert.equal(s.clearedCount, 1);
  assert.equal(s.totalRemaining, 6);
  const r2 = g.eat(4, 4);
  assert.deepEqual(r2.events.slice(0, 2), [{type: 'eat', ids: ['bx2']}, {type: 'boxNext', boxId: 'bx', next: null}]);
  assert.deepEqual(g.eat(4, 4), {ok: false, reason: 'empty', events: []});
});

test('không còn mục tiêu (chỉ còn mèo box) thì dừng lây', () => {
  const lvl = {cols: 3, rows: 1, cats: [{id: 'p', color: 'pink', x: 0, y: 0}, {id: 'a', color: 'blue', x: 1, y: 0}],
    boxes: [{id: 'bx', x: 2, y: 0, cats: [{id: 'q1', color: 'green'}, {id: 'q2', color: 'green'}, {id: 'q3', color: 'green'}]}], initialSick: 'p'};
  const g = sick.createGame(lvl);
  assert.deepEqual(g.eat(1, 0).events, [{type: 'eat', ids: ['a']}]);
  assert.equal(g.getState().sickCount, 1);
});

test('thắng khi hết mèo, kể cả mèo trong box', () => {
  const lvl = {cols: 3, rows: 1, cats: [{id: 'p', color: 'pink', x: 0, y: 0}, {id: 'a', color: 'blue', x: 1, y: 0}],
    boxes: [{id: 'bx', x: 2, y: 0, cats: [{id: 'q1', color: 'green'}]}], initialSick: 'p'};
  const g = sick.createGame(lvl);
  g.eat(0, 0); g.eat(1, 0);
  assert.equal(g.getState().status, 'playing');
  assert.deepEqual(g.eat(2, 0).events, [{type: 'eat', ids: ['q1']}, {type: 'boxNext', boxId: 'bx', next: null}, {type: 'win'}]);
  assert.equal(g.getState().status, 'won');
  assert.equal(g.getState().totalRemaining, 0);
});

test('loseRatio tuỳ chỉnh', () => {
  const lvl = base(); lvl.loseRatio = 0.3;
  const r = sick.createGame(lvl).eat(0, 0);
  assert.deepEqual(r.events.at(-1), {type: 'lose', reason: 'sick', sick: 3, total: 8});
});

test('chọn mèo bệnh ban đầu bằng mulberry32(seed), gọi rand() đúng 1 lần', () => {
  for (const seed of [1, 7, 42, 123456]) {
    const lvl = base(); delete lvl.initialSick; lvl.seed = seed;
    const pool = lvl.cats.map(c => c.id);
    const expected = pool[Math.floor(mulberry32(seed)() * pool.length)];
    assert.deepEqual(sickIds(sick.createGame(lvl)), [expected], `seed ${seed}`);
  }
  const lvl = base(); delete lvl.initialSick;
  const pool = lvl.cats.map(c => c.id);
  assert.deepEqual(sickIds(sick.createGame(lvl)), [pool[Math.floor(mulberry32(1)() * pool.length)]], 'seed mặc định = 1');
});

test('eat bị từ chối: ô trống, ngoài bàn', () => {
  const g = sick.createGame(base());
  assert.deepEqual(g.eat(3, 3), {ok: false, reason: 'empty', events: []});
  assert.deepEqual(g.eat(0, 5), {ok: false, reason: 'out-of-board', events: []});
});

test('getState là bản sao sâu, createGame không sửa level', () => {
  const lvl = base(); const snap = JSON.stringify(lvl);
  const g = sick.createGame(lvl);
  const s = g.getState(); s.cats[0].sick = true; s.boxes[0].queue.pop(); s.sickCount = 99;
  assert.equal(g.getState().cats[0].sick, false);
  assert.equal(g.getState().boxes[0].queue.length, 1);
  g.eat(0, 0); g.eat(4, 4);
  assert.equal(JSON.stringify(lvl), snap);
});

test('validateLevel: level hợp lệ không có lỗi', () => assert.deepEqual(sick.validateLevel(base()), []));

for (const [name, mutate] of [
  ['initialSick không phải mèo trên bàn', l => { l.initialSick = 'bx1'; }],
  ['initialSick không tồn tại', l => { l.initialSick = 'nope'; }],
  ['box ngoài bàn', l => { l.boxes[0].x = 5; }],
  ['box trùng ô mèo', l => { l.boxes[0].x = 0; l.boxes[0].y = 0; }],
  ['id trùng giữa mèo bàn và mèo box', l => { l.boxes[0].cats[0].id = 'b1'; }],
  ['không có mèo trên bàn', l => { l.cats = []; delete l.initialSick; }],
  ['trạng thái đầu đã thua', l => { l.cats = [{id: 'p1', color: 'pink', x: 0, y: 0}]; l.boxes = []; }],
  ['id mèo trùng', l => { l.cats[1].id = 'b1'; }],
  ['hai mèo cùng ô', l => { l.cats[1].x = 0; }],
  ['màu không hợp lệ', l => { l.cats[0].color = 'red'; }],
  ['rows không hợp lệ', l => { l.rows = 1.5; }]
]) {
  test(`validateLevel + createGame bắt lỗi: ${name}`, () => {
    const l = base(); mutate(l);
    const errs = sick.validateLevel(l);
    assert.ok(Array.isArray(errs) && errs.length > 0, 'phải có ít nhất 1 lỗi');
    assert.throws(() => sick.createGame(l), err => err instanceof Error && err.message === errs.join('; '));
  });
}
