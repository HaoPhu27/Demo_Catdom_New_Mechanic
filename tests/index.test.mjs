// Test nghiệm thu tĩnh cho index.html theo tasks/feature-landing/plan.md (mục "Hợp đồng nguyên văn").
// LP-2: bỏ dialog, demo hiện ngay trong khung visual (.mech-art-col) của từng section.
// Hành vi chạy thật (nhúng iframe, co giãn chiều cao) do Claude review trên trình duyệt.
// Chạy: node --test tests/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const MECHS = [
  ['selfish', 'selfish-cat.html'], ['weed', 'weed.html'], ['sick', 'sick-cat.html'], ['couple', 'couple-cat.html']
];
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function sectionBody(id) {
  const open = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(html);
  assert.ok(open, `thiếu <section id="${id}">`);
  const end = html.indexOf('</section>', open.index);
  assert.ok(end > open.index, `section ${id} không đóng`);
  return {tag: open[0], body: html.slice(open.index + open[0].length, end), index: open.index};
}

test('4 section mechanic đúng id, class, data-page và thứ tự', () => {
  let last = -1;
  for (const [id, page] of MECHS) {
    const {tag, index} = sectionBody(id);
    assert.match(tag, /\bclass=["'][^"']*\bmech\b/, `section ${id} thiếu class "mech"`);
    assert.match(tag, new RegExp(`data-page=["']${page.replace('.', '\\.')}["']`), `section ${id} sai data-page`);
    assert.ok(index > last, `section ${id} sai thứ tự`);
    last = index;
    assert.ok(existsSync(new URL(page, root)), `không có file ${page}`);
  }
  assert.equal((html.match(/<section\b[^>]*\bclass=["'][^"']*\bmech\b/gi) || []).length, 4, 'phải có đúng 4 section .mech');
});

test('mỗi section có đúng 2 nút gif/play với đúng nhãn và link trang chi tiết', () => {
  for (const [id, page] of MECHS) {
    const {body} = sectionBody(id);
    const gif = [...body.matchAll(/<button\b([^>]*)\bdata-action=["']gif["']([^>]*)>([\s\S]*?)<\/button>/gi)];
    const play = [...body.matchAll(/<button\b([^>]*)\bdata-action=["']play["']([^>]*)>([\s\S]*?)<\/button>/gi)];
    assert.equal(gif.length, 1, `section ${id}: cần đúng 1 nút data-action="gif"`);
    assert.equal(play.length, 1, `section ${id}: cần đúng 1 nút data-action="play"`);
    assert.match(gif[0][1] + gif[0][2], /type=["']button["']/, `section ${id}: nút gif phải type="button"`);
    assert.match(play[0][1] + play[0][2], /type=["']button["']/, `section ${id}: nút play phải type="button"`);
    assert.match(strip(gif[0][3]), /Xem GIF gameplay/, `section ${id}: nhãn nút gif`);
    assert.match(strip(play[0][3]), /Chơi thử ngay/, `section ${id}: nhãn nút play`);
    assert.match(body, new RegExp(`<a\\b[^>]*href=["']${page.replace('.', '\\.')}["']`), `section ${id}: thiếu link tới ${page}`);
  }
});

test('không có popup/modal: không dialog, không showModal, không viewer cũ', () => {
  assert.doesNotMatch(html, /<dialog\b/i, 'không được có <dialog>');
  assert.doesNotMatch(inlineScripts, /showModal\s*\(|\.showPopover\s*\(/, 'không được mở modal/popover');
  assert.doesNotMatch(html, /\bid=["']viewer(?:-frame|-title)?["']/, 'không còn #viewer/#viewer-frame/#viewer-title');
  assert.doesNotMatch(html, /::backdrop|position\s*:\s*fixed/, 'không được có lớp phủ toàn màn hình');
  assert.doesNotMatch(inlineScripts, /\bopenViewer\b/, 'bỏ hàm openViewer cũ');
});

test('mỗi khung visual chứa sẵn vùng demo: ảnh minh hoạ, iframe, dòng nhắc serve', () => {
  for (const [id, page] of MECHS) {
    const {body} = sectionBody(id);
    const card = new RegExp(`<div\\b[^>]*\\bid=["']art-${id}["'][^>]*>`, 'i').exec(body);
    assert.ok(card, `section ${id}: thiếu khung #art-${id}`);
    const artCol = body.slice(body.indexOf('mech-art-col'));
    assert.ok(artCol.includes(`id="art-${id}"`), `section ${id}: #art-${id} phải nằm trong .mech-art-col`);
    assert.match(artCol, new RegExp(`<div\\b[^>]*\\bid=["']illus-${id}["']`), `section ${id}: thiếu #illus-${id}`);
    const embed = new RegExp(`<div\\b[^>]*\\bid=["']embed-${id}["'][^>]*>`, 'i').exec(artCol);
    assert.ok(embed, `section ${id}: thiếu #embed-${id}`);
    assert.match(embed[0], /\bhidden\b/, `section ${id}: #embed-${id} phải hidden lúc đầu`);
    const frame = new RegExp(`<iframe\\b[^>]*\\bid=["']frame-${id}["'][^>]*>`, 'i').exec(artCol);
    assert.ok(frame, `section ${id}: thiếu iframe #frame-${id} trong khung visual`);
    assert.match(frame[0], /\btitle=["'][^"']+["']/, `section ${id}: iframe cần title`);
    assert.match(frame[0], /\bsrc=["']about:blank["']/, `section ${id}: iframe ban đầu src="about:blank"`);
    assert.match(artCol, /class=["'][^"']*\bserve-notice\b[^"']*["'][^>]*\bhidden\b[^>]*>[\s\S]*?node tools\/serve\.mjs/, `section ${id}: thiếu .serve-notice hidden có chữ node tools/serve.mjs`);
    for (const act of ['gif', 'play']) {
      const btn = new RegExp(`<button\\b[^>]*data-action=["']${act}["'][^>]*>`, 'i').exec(body)[0];
      assert.match(btn, new RegExp(`aria-controls=["']embed-${id}["']`), `section ${id}: nút ${act} cần aria-controls="embed-${id}"`);
      assert.match(btn, /aria-pressed=["']false["']/, `section ${id}: nút ${act} cần aria-pressed="false" ban đầu`);
    }
    assert.ok(page);
  }
});

test('JS: showDemo, CSS nhúng nguyên văn, xử lý lỗi, tự co giãn chiều cao', () => {
  assert.match(inlineScripts, /function\s+showDemo\s*\(/, 'cần hàm showDemo(mechId, mode)');
  assert.match(inlineScripts, /window\.showDemo\s*=\s*showDemo/, 'cần gán window.showDemo');
  assert.match(inlineScripts, /embed-style/);
  assert.match(inlineScripts, /scrollHeight/, 'iframe phải co theo chiều cao nội dung');
  assert.match(inlineScripts, /ResizeObserver/, 'theo dõi đổi kích thước nội dung iframe');
  for (const rule of ['header.topbar{display:none!important}', 'main{padding-top:12px!important}', 'main>*:not(']) {
    assert.ok(inlineScripts.replace(/\s+/g, '').includes(rule), `thiếu CSS nhúng: ${rule}`);
  }
  assert.ok(/['"`]\.demos['"`]/.test(inlineScripts), 'cần selector .demos cho chế độ gif');
  assert.ok(/['"`]\.card\.play['"`]/.test(inlineScripts), 'cần selector .card.play cho chế độ play');
  assert.match(inlineScripts, /contentDocument/);
  assert.match(inlineScripts, /try\s*{[\s\S]*contentDocument[\s\S]*}\s*catch/, 'truy cập contentDocument phải nằm trong try/catch');
  assert.match(html, /node tools\/serve\.mjs/, 'cần dòng nhắc chạy node tools/serve.mjs');
  assert.match(inlineScripts, /about:blank/, 'phải bỏ qua iframe đang ở about:blank');
  assert.match(inlineScripts, /aria-pressed/);
});

test('header sticky có nav tới 4 mechanic; hero và footer', () => {
  assert.match(html, /<header\b/i);
  assert.match(html, /position\s*:\s*sticky/);
  for (const [id] of MECHS) assert.match(html, new RegExp(`href=["']#${id}["']`), `nav thiếu #${id}`);
  assert.match(html, /<footer\b/i);
  assert.match(html, /<h1\b/i);
});

test('nguồn ngoài hợp lệ, dùng kit JS nhưng không nạp kit CSS, có responsive', () => {
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
    const u = m[1];
    if (/^https?:/.test(u)) assert.match(u, /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)(\/|$)/, `nguồn ngoài không cho phép: ${u}`);
  }
  assert.match(html, /<script\b[^>]*src=["']assets\/catdom-kit\.js["']/, 'cần nạp assets/catdom-kit.js');
  assert.doesNotMatch(html, /catdom-kit\.css/, 'không được nạp catdom-kit.css');
  assert.match(html, /@media\s*\(\s*max-width\s*:\s*\d+px\s*\)/, 'cần media query cho màn hình nhỏ');
  assert.match(html, /CatDom\.catSVG\s*\(/, 'ảnh minh hoạ dùng CatDom.catSVG');
});

test('4 trang chi tiết vẫn có khu .demos và .card.play là con trực tiếp của main', () => {
  for (const [, page] of MECHS) {
    const src = readFileSync(new URL(page, root), 'utf8');
    const main = src.slice(src.indexOf('<main'), src.indexOf('</main>'));
    assert.match(main, /\n  <div class="demos">/, `${page}: thiếu .demos ở cấp con của main`);
    assert.match(main, /\n  <div class="card play">/, `${page}: thiếu .card.play ở cấp con của main`);
  }
});
