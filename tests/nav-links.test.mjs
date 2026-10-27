// NAV-1/NAV-2: logo, nav và breadcrumb của 10 trang mechanic bấm được; đánh số chung 01–10, không tách bộ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGES = [
  ['selfish-cat.html', 'selfish', 'Mèo Ích Kỷ'],
  ['weed.html', 'weed', 'Cây Dại'],
  ['sick-cat.html', 'sick', 'Mèo Bệnh'],
  ['couple-cat.html', 'couple', 'Couple Mèo'],
  ['magnet.html', 'magnet', 'Mèo Nam Châm'],
  ['fragile-floor.html', 'fragile-floor', 'Sàn Dễ Vỡ'],
  ['stripe-cat.html', 'stripe-cat', 'Mèo Sọc'],
  ['alarm-zone.html', 'alarm-zone', 'Vùng Báo Động'],
  ['teleport-cat.html', 'teleport-cat', 'Mèo Dịch Chuyển'],
  ['electric-link.html', 'electric-link', 'Liên Kết Điện'],
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

PAGES.forEach(([file, id, name], i) => {
  const num = String(i + 1).padStart(2, '0');
  const prev = PAGES[i - 1], next = PAGES[i + 1];
  test(`${file}: logo, nav trước/sau, breadcrumb Mechanic ${num}`, () => {
    const html = read(file);

    // Logo là link về trang chủ
    assert.doesNotMatch(html, /<div class="logo"/, 'logo không được là <div>');
    const logo = /<a\b[^>]*class="logo"[^>]*>[\s\S]*?<\/a>/.exec(html);
    assert.ok(logo, 'thiếu <a class="logo">');
    assert.match(logo[0], /href="index\.html"/, 'logo phải trỏ index.html');
    assert.match(text(logo[0]), /CatDom Support/);

    // Nav: Trang tổng + mechanic trước + mechanic sau (theo thứ tự chung 01–10)
    const nav = /<header class="topbar">[\s\S]*?<nav>([\s\S]*?)<\/nav>/.exec(html)[1];
    assert.doesNotMatch(nav, /<span/, 'nav không được có <span> chết');
    const want = [['index.html', 'Trang tổng']];
    if (prev) want.push([prev[0], `← ${prev[2]}`]);
    if (next) want.push([next[0], `${next[2]} →`]);
    const navLinks = links(nav);
    assert.deepEqual(navLinks.map((l) => [l.href, l.label]), want);
    if (prev) assert.match(navLinks[1].attrs, /rel="prev"/);
    if (next) assert.match(navLinks.at(-1).attrs, /rel="next"/);

    // Breadcrumb: Home › 🧱 Game Elements › Mechanic NN › Tên
    const crumb = /<div class="crumb">([\s\S]*?)<\/div>/.exec(html)[1];
    assert.equal(text(crumb), `Home › 🧱 Game Elements › Mechanic ${num} › ${name}`);
    assert.deepEqual(links(crumb).map((l) => [l.href, l.label]), [
      ['index.html', 'Home'], ['index.html#selfish', '🧱 Game Elements'], [`index.html#${id}`, `Mechanic ${num}`],
    ]);
    assert.match(crumb, new RegExp(`<span aria-current="page">${name}</span>`), 'cấp cuối là <span aria-current="page">, không phải link');

    assert.doesNotMatch(html, /Bộ [12] ·/, 'không còn chữ "Bộ 1 ·"/"Bộ 2 ·"');
    for (const l of [...navLinks, ...links(crumb)]) checkTarget(l.href);
  });
});

test('CSS: logo-link và link breadcrumb không gạch chân, không đổi màu', () => {
  const sources = { 'assets/catdom-kit.css': read('assets/catdom-kit.css'), 'selfish-cat.html': read('selfish-cat.html') };
  for (const [name, css] of Object.entries(sources)) {
    const flat = css.replace(/\s+/g, '');
    assert.match(flat, /\.logo{[^}]*color:inherit[^}]*}/, `${name}: .logo cần color:inherit`);
    assert.match(flat, /\.logo{[^}]*text-decoration:none[^}]*}/, `${name}: .logo cần text-decoration:none`);
    assert.match(flat, /\.crumba{[^}]*color:inherit[^}]*}/, `${name}: cần rule .crumb a{color:inherit…}`);
    assert.match(flat, /\.crumba:hover{[^}]*text-decoration:underline/, `${name}: cần .crumb a:hover gạch chân`);
  }
  assert.match(sources['selfish-cat.html'].replace(/\s+/g, ''), /\.topbarnava{[^}]*color:#fff[^}]*text-decoration:none/, 'selfish-cat.html: thiếu rule .topbar nav a');
});

test('index.html: section id cho link breadcrumb vẫn còn', () => {
  for (const id of PAGES.map((p) => p[1])) assert.match(index, new RegExp(`<section id="${id}"`));
});
