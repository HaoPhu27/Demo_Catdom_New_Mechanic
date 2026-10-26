// Board demo thực tế cho 6 mechanic hố di chuyển: design/quick-specs/realistic-demo-board-2026-10-26.md.
// Chuỗi good → won và bad → thua đã được commonSuite kiểm (fixture demo nằm trong list); ở đây kiểm độ "thật" của board.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtures, seq, load, clone, play } from './lab-common.mjs';

const BASE = {
  I2: [[0, 0], [1, 0]],
  I3: [[0, 0], [1, 0], [2, 0]],
  L3: [[0, 0], [1, 0], [0, 1]],
  L4: [[0, 0], [0, 1], [0, 2], [1, 2]],
  O4: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T4: [[0, 0], [1, 0], [2, 0], [1, 1]],
  X5: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]
};
const norm = cells => {
  const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(c => c.join(',')).join(' ');
};
const CATALOG = new Map();
for (const [name, base] of Object.entries(BASE)) {
  let c = base;
  for (let r = 0; r < 4; r++) {
    c = c.map(([x, y]) => [-y, x]);
    CATALOG.set(norm(c), name);
    CATALOG.set(norm(c.map(([x, y]) => [-x, y])), name);
  }
}
const SIGNATURE = { magnet: 'magnet', 'fragile-floor': 'crack', 'teleport-cat': 'teleport', 'stripe-cat': 'axis', 'alarm-zone': 'alarmOn', 'electric-link': 'electricOn' };
const STRAIGHT = new Set(['I2', 'I3']);

test('catalog: 7 hình, xoay/lật quy về đúng tên', () => {
  assert.equal(new Set(CATALOG.values()).size, 7);
  assert.equal(CATALOG.get(norm([[0, 0], [0, 1]])), 'I2');
  assert.equal(CATALOG.get(norm([[1, 0], [1, 1], [0, 1]])), 'L3');
  assert.equal(CATALOG.get(norm([[0, 0], [1, 0], [2, 0], [0, 1]])), 'L4');
  assert.equal(CATALOG.get(norm([[0, 0], [1, 1]])), undefined, 'hai ô chéo không phải hố hợp lệ');
});

for (const slug of Object.keys(SIGNATURE)) {
  const set = fixtures[slug];

  test(`${slug}: có fixture demo`, () => {
    assert.ok(set.demo, `thiếu fixtures['${slug}'].demo`);
    assert.ok(set.list[set.demo], `fixtures['${slug}'].demo = '${set.demo}' không có trong list`);
    assert.notEqual(set.demo, set.default, 'demo phải là board mới, không dùng lại board hướng dẫn');
    assert.ok(set.list[set.demo].bad, 'fixture demo phải có chuỗi bad');
  });

  test(`${slug}: board demo giống level thật`, () => {
    const fx = set.list[set.demo], L = fx.level;
    assert.ok(L.cols >= 6 && L.cols <= 8, `cols = ${L.cols}, cần 6–8`);
    assert.ok(L.rows >= 7 && L.rows <= 9, `rows = ${L.rows}, cần 7–9`);
    assert.ok(L.holes.length >= 4 && L.holes.length <= 7, `${L.holes.length} hố, cần 4–7`);

    const names = L.holes.map((h, i) => {
      const shape = h.shape || [[0, 0]];
      const name = CATALOG.get(norm(shape));
      assert.ok(name, `hố ${i} có hình ${JSON.stringify(shape)} không thuộc catalog`);
      assert.equal(h.remaining, shape.length, `hố ${i} (${name}): remaining phải bằng số ô`);
      return name;
    });
    assert.ok(new Set(names).size >= 3, `chỉ có ${[...new Set(names)]}: cần ≥ 3 loại hình`);
    assert.ok(names.filter(n => !STRAIGHT.has(n)).length >= 2, `cần ≥ 2 hố không thẳng, đang có ${names}`);
    assert.ok(names.filter(n => n === 'I2').length * 3 <= names.length, `quá nhiều hố I2: ${names}`);

    const colors = new Set(L.holes.map(h => h.color));
    assert.ok(colors.size >= Math.min(4, L.holes.length), `chỉ ${colors.size} màu hố`);
    for (const c of new Set([...colors, ...L.cats.map(k => k.color)])) {
      const need = L.holes.filter(h => h.color === c).reduce((s, h) => s + h.remaining, 0);
      const have = L.cats.filter(k => k.color === c).length;
      assert.equal(have, need, `màu ${c}: ${have} mèo nhưng hố cần ${need}`);
    }
    assert.ok(L.cats.length >= 0.3 * L.cols * L.rows, `${L.cats.length} mèo < 30% của ${L.cols * L.rows} ô`);
  });

  test(`${slug}: demo có khoảnh khắc chữ ký, nhịp vừa, chạy nhanh`, () => {
    const fx = set.list[set.demo], logic = load(slug);
    const goodN = seq(fx.good).length, badN = seq(fx.bad.moves).length;
    assert.ok(goodN <= 40, `good có ${goodN} nước, tối đa 40`);
    assert.ok(badN <= 10, `bad có ${badN} nước, tối đa 10`);

    const t0 = Date.now();
    const good = play(logic.createGame(clone(fx.level)), fx.good);
    const ms = Date.now() - t0;
    assert.ok(ms <= 1500, `chạy good mất ${ms} ms, tối đa 1500`);
    const bad = play(logic.createGame(clone(fx.level)), fx.bad.moves);
    const types = new Set([...good, ...bad].flatMap(r => r.events.map(e => e.type)));
    assert.ok(types.has(SIGNATURE[slug]), `không có event chữ ký '${SIGNATURE[slug]}' trong good/bad`);
  });
}
