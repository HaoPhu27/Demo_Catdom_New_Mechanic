// Đối chiếu khối "Tiêu chí đánh giá" của 10 trang với design/review-criteria-2026-10-27.md (nguồn chuẩn).
// Mỗi gạch đầu dòng của tài liệu phải xuất hiện nguyên văn (bỏ định dạng) trong <details class="review"> của đúng trang.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const doc = readFileSync(new URL('design/review-criteria-2026-10-27.md', root), 'utf8').replace(/\r/g, '');
const flat = s => s.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
const text = html => flat(html.replace(/<\/?(?:b|strong|i|em|code|span)(?:\s[^>]*)?>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' '));

// Tách tài liệu theo mechanic: "## 01 · Tên (`file.html`)" … tới "---" hoặc mục kế tiếp.
const sections = [...doc.matchAll(/^## (\d\d) · (.+?) \(`([\w-]+\.html)`\)\n([\s\S]*?)(?=\n---\n|\n## )/gm)]
  .map(([, n, name, file, body]) => ({
    n, name, file,
    summary: flat(/\*\*summary:\*\* `([^`]+)`/.exec(body)[1]),
    items: body.split('\n').filter(l => l.startsWith('- ')).map(l => flat(l.slice(2)))
  }));

test('tài liệu: đủ 10 mechanic, mỗi mechanic có summary và ≥ 14 ý', () => {
  assert.equal(sections.length, 10);
  for (const s of sections) assert.ok(s.items.length >= 14, `${s.name}: chỉ ${s.items.length} ý`);
});

for (const s of sections) {
  test(`${s.n} ${s.name} (${s.file}): khối tiêu chí khớp tài liệu`, () => {
    const html = readFileSync(new URL(s.file, root), 'utf8');
    const blocks = html.match(/<details class="review">[\s\S]*?<\/details>/g) || [];
    assert.equal(blocks.length, 1, 'cần đúng 1 khối <details class="review">');
    const block = blocks[0], plain = text(block);
    assert.ok(text(/<summary>([\s\S]*?)<\/summary>/.exec(block)[1]) === s.summary, `summary phải là "${s.summary}"`);
    assert.equal((block.match(/<article>/g) || []).length, 4, 'cần đúng 4 <article>');
    for (const h of ['Có dễ hiểu không?', 'Có case stuck / thua màn?', 'Visual có dễ demo?', 'Tạo feeling khác không?'])
      assert.ok(plain.includes(h), `thiếu tiêu đề "${h}"`);
    assert.equal((block.match(/class="verdict"/g) || []).length, 4, 'mỗi article mở đầu bằng 1 <p class="verdict">');
    const missing = s.items.filter(i => !plain.includes(i));
    assert.deepEqual(missing, [], `thiếu hoặc chép sai ${missing.length} ý`);
    // Khối tiêu chí nằm ngoài phần được nhúng vào trang tổng.
    const main = /<main>([\s\S]*)<\/main>/.exec(html)[1];
    assert.ok(main.includes(block), 'khối tiêu chí phải nằm trong <main>, ngoài .demos và .card.play');
  });
}

test('CSS: kit và selfish-cat có luật cho ul / verdict', () => {
  const kit = readFileSync(new URL('assets/catdom-kit.css', root), 'utf8');
  const selfish = readFileSync(new URL('selfish-cat.html', root), 'utf8');
  for (const [name, css] of [['assets/catdom-kit.css', kit], ['selfish-cat.html', selfish]]) {
    assert.ok(/\.criteria ul\s*\{/.test(css), `${name}: thiếu .criteria ul`);
    assert.ok(/\.criteria \.verdict\s*\{/.test(css), `${name}: thiếu .criteria .verdict`);
  }
  assert.ok(/details\.review\s*\{/.test(selfish) && /\.criteria\s*\{/.test(selfish), 'selfish-cat.html: thiếu CSS details.review / .criteria');
});
