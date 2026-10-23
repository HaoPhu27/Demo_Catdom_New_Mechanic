// Static server tối giản để xem các trang demo qua http (pane browser không nạp file tương đối khi mở file://).
// Dùng: node tools/serve.mjs [port] [--logic <thư mục>]   (mặc định 5173, chỉ nghe 127.0.0.1)
//   --logic: phục vụ /logic/* từ thư mục khác (để xem UI với một bản logic thử nghiệm mà không chép vào repo).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd());
const args = process.argv.slice(2);
const li = args.indexOf('--logic');
const logicDir = li >= 0 ? resolve(args.splice(li, 2)[1]) : null;
const port = Number(args[0] || 5173);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml'};

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  const base = logicDir && /^logic[/\\]/.test(path) ? logicDir : root;
  const file = join(base, base === root ? path || 'index.html' : path.replace(/^logic[/\\]/, ''));
  if (!file.startsWith(base)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store'}).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/`));
