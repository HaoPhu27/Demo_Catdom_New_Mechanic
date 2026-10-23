// Kiểm tra tĩnh trang HTML do worker tạo: tồn tại, có khung cơ bản, script inline không lỗi cú pháp, CDN chỉ từ nguồn cho phép.
// Dùng: node tools/check-html.mjs <file.html>
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
const fail = (msg) => { console.error('FAIL: ' + msg); process.exit(1); };

if (!file) fail('thiếu đường dẫn file');
if (!existsSync(file)) fail(`không có file ${file}`);
const html = readFileSync(file, 'utf8');
if (html.trim().length < 2000) fail('file quá ngắn, có vẻ chưa hoàn chỉnh');

for (const [re, what] of [
  [/<!doctype html>/i, 'doctype'],
  [/<meta[^>]+charset/i, 'meta charset'],
  [/<meta[^>]+name=["']viewport["']/i, 'meta viewport (responsive)'],
  [/<title>[^<]+<\/title>/i, '<title>'],
  [/lang=["']vi["']/i, 'lang="vi"'],
]) if (!re.test(html)) fail(`thiếu ${what}`);

const allowed = /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)(\/|$)/;
for (const m of html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["'](https?:[^"']+)["']/gi)) {
  if (!allowed.test(m[1])) fail(`nguồn ngoài không cho phép: ${m[1]}`);
}

let n = 0;
for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/type=["'](?!text\/javascript|module)/i.test(m[1])) continue;
  n++;
  try { new Function(m[2]); } catch (e) { fail(`script inline #${n} lỗi cú pháp: ${e.message}`); }
}
if (n === 0) fail('không có script inline nào (cần animation/playground)');

console.log(`PASS: ${file} (${html.length} ký tự, ${n} script inline)`);
