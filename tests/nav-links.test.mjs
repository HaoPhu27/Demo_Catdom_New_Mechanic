// NAV-1: logo, nav và breadcrumb của 10 trang mechanic phải bấm được.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const SET1 = [
  ['selfish-cat.html', 'selfish', 'Mèo Ích Kỷ'],
  ['weed.html', 'weed', 'Cây Dại'],
  ['sick-cat.html', 'sick', 'Mèo Bệnh'],
  ['couple-cat.html', 'couple', 'Couple Mèo'],
];
const SET2 = [
  ['magnet.html', 'magnet', 'Mèo Nam Châm', '05'],
  ['fragile-floor.html', 'fragile-floor', 'Sàn Dễ Vỡ', '06'],
  ['stripe-cat.html', 'stripe-cat', 'Mèo Sọc', '07'],
  ['alarm-zone.html', 'alarm-zone', 'Vùng Báo Động', '08'],
  ['teleport-cat.html', 'teleport-cat', 'Mèo Dịch Chuyển', '09'],
  ['electric-link.html', 'electric-link', 'Liên Kết Điện', '10'],
];
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const index = read('index.html');
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const links = (h) => [...h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
  attrs: m[1], href: (/href="([^"]*)"/.exec(m[1]) || [])[1], label: text(m[2]),
}));

function checkTarget(href) {
  const [file, hash] = href.split('#');
  assert.ok(file && existsSync(new URL(`../${file}`, import.meta.url)), `link tới file không tồn tại: ${href}`);
  if (hash) assert.match(read(file), new RegExp(`id="${hash}"`), `không có id #${hash} trong ${file}`);
}

for (const [set, pages] of [[1, SET1], [2, SET2]]) {
  for (const [file, id, name, num] of pages) {
    test(`${file}: logo, nav, breadcrumb bấm được`, () => {
      const html = read(file);

      // Logo là link về trang chủ
      assert.doesNotMatch(html, /<div class="logo"/, 'logo không được là <div>');
      const logo = /<a\b[^>]*class="logo"[^>]*>[\s\S]*?<\/a>/.exec(html);
      assert.ok(logo, 'thiếu <a class="logo">');
      assert.match(logo[0], /href="index\.html"/, 'logo phải trỏ index.html');
      assert.match(text(logo[0]), /CatDom Support/);

      // Nav
      const nav = /<header class="topbar">[\s\S]*?<nav>([\s\S]*?)<\/nav>/.exec(html)[1];
      assert.doesNotMatch(nav, /<span/, 'nav không được có <span> chết');
      const navLinks = links(nav);
      assert.equal(navLinks[0].href, 'index.html');
      assert.equal(navLinks[0].label, 'Trang tổng');
      assert.deepEqual(navLinks.slice(1).map((l) => [l.href, l.label]), pages.map((p) => [p[0], p[2]]), 'nav phải liệt kê đủ trang của bộ, đúng thứ tự');
      const current = navLinks.filter((l) => /aria-current="page"/.test(l.attrs));
      assert.equal(current.length, 1, 'đúng 1 link nav có aria-current="page"');
      assert.equal(current[0].href, file);

      // Breadcrumb: chữ giữ nguyên, các cấp trên là link
      const crumb = /<div class="crumb">([\s\S]*?)<\/div>/.exec(html)[1];
      const expected = set === 1
        ? `Home › 🧱 Game Elements (Obstacles) › ${name}`
        : `Home › 🧱 Game Elements › Bộ 2 · Mechanic ${num} › ${name}`;
      assert.equal(text(crumb), expected, 'chữ breadcrumb phải giữ nguyên');
      const cl = links(crumb);
      const want = set === 1
        ? [['index.html', 'Home'], [`index.html#${id}`, '🧱 Game Elements (Obstacles)']]
        : [['index.html', 'Home'], ['index.html#magnet', '🧱 Game Elements'], [`index.html#${id}`, `Bộ 2 · Mechanic ${num}`]];
      assert.deepEqual(cl.map((l) => [l.href, l.label]), want);
      assert.match(crumb, new RegExp(`<span aria-current="page">${name}</span>`), 'cấp cuối là <span aria-current="page">, không phải link');

      for (const l of [...navLinks, ...cl]) checkTarget(l.href);
    });
  }
}

test('CSS: logo-link và link breadcrumb không gạch chân, không đổi màu', () => {
  const sources = { 'assets/catdom-kit.css': read('assets/catdom-kit.css'), 'selfish-cat.html': read('selfish-cat.html') };
  for (const [name, css] of Object.entries(sources)) {
    const flat = css.replace(/\s+/g, '');
    assert.match(flat, /\.logo{[^}]*color:inherit[^}]*}/, `${name}: .logo cần color:inherit`);
    assert.match(flat, /\.logo{[^}]*text-decoration:none[^}]*}/, `${name}: .logo cần text-decoration:none`);
    assert.match(flat, /\.crumba{[^}]*color:inherit[^}]*}/, `${name}: cần rule .crumb a{color:inherit…}`);
    assert.match(flat, /\.crumba:hover{[^}]*text-decoration:underline/, `${name}: cần .crumb a:hover gạch chân`);
    assert.match(flat, /\.topbarnava\[aria-current="?page"?\]{[^}]*color:#ffb02e/, `${name}: link nav đang xem tô #ffb02e`);
  }
  assert.match(sources['selfish-cat.html'].replace(/\s+/g, ''), /\.topbarnava{[^}]*color:#fff[^}]*text-decoration:none/, 'selfish-cat.html: thiếu rule .topbar nav a');
});

test('index.html: section id cho link breadcrumb vẫn còn', () => {
  for (const id of [...SET1, ...SET2].map((p) => p[1])) assert.match(index, new RegExp(`<section id="${id}"`));
});
