// Đặt 4 mechanic mới lên board thật do tool "Generate VIPPRO" sinh ra, theo đúng ý đồ của từng mechanic.
// Dùng: node tools/place-mechanics.mjs <thư mục level của generator>... [--out boards]
// Cần build trước: dotnet build tools/solvecli -c Release   (harness gọi IndependentSolver của tool)
//
// Cách làm: giải board gốc bằng solver của tool để có lời giải chuẩn (witness), rồi chọn vị trí mechanic sao cho
// lời giải đó vẫn qua được mà sát ngưỡng nhất (đúng ý đồ "phải ưu tiên"). Cây Dại đổi không gian chơi
// (khu vực cấm hole + Special Hole phải nhặt thuốc sâu) nên mỗi phương án được solver giải lại để chứng minh.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { join, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';

const TOOL = process.env.CATDOM_TOOL || 'D:/Xgame/Generate VIPPRO';
const SOLVER = resolve('tools/solvecli/bin/Release/net10.0/solvecli.dll');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const outDir = resolve(oi >= 0 ? args.splice(oi, 2)[1] : 'boards');
const levelDirs = args.map(a => resolve(a));
const SHAPES = Object.fromEntries(JSON.parse(readFileSync(join(TOOL, 'SYSTEM/SOURCE/AI/IndependentSolver/IO/HoleShapes.json'), 'utf8'))
  .shapes.map(s => [s.holeType, s.footprint.map(c => [c.x, c.y])]));

const man = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const pos = p => [p.x, p.y];
const key = (x, y) => `${x},${y}`;
const footprint = h => SHAPES[h.holeType].map(([dx, dy]) => [h.position.x + dx, h.position.y + dy]);
const footAt = (h, at) => SHAPES[h.holeType].map(([dx, dy]) => [at.x + dx, at.y + dy]);

let tmpN = 0;
function solve(level, ms = 30000) {
  const file = join(tmpdir(), `catdom-place-${process.pid}-${tmpN++}.json`);
  writeFileSync(file, JSON.stringify(level));
  return new Promise((ok, fail) => execFile('dotnet', [SOLVER, file, String(ms)], {maxBuffer: 64 << 20},
    (err, out) => err ? fail(err) : ok(JSON.parse(out))));
}
async function pool(jobs, n = 6) {
  const res = []; let i = 0;
  await Promise.all(Array.from({length: n}, async () => { while (i < jobs.length) { const j = i++; res[j] = await jobs[j](); } }));
  return res;
}

// Lượt ăn = các lần kéo có nuốt mèo. Mèo bàn: 'c<chỉ số catInfos>', mèo box: 'b<box>_<thứ tự>'.
const eatId = e => e.catId >= 0 ? `c${e.catId}` : `b${e.boxId}_${e.boxIndex}`;
const turnsOf = moves => moves.filter(m => m.eaten.length).map(m => m.eaten.map(eatId));
const totalCats = lv => lv.catInfos.length + lv.catBoxInfos.reduce((s, b) => s + b.colorIds.length, 0);
const turnOf = (turns, id) => turns.findIndex(t => t.includes(id));
const eatenBefore = (turns, t) => turns.slice(0, t).reduce((s, x) => s + x.length, 0);

// Mèo Ích Kỷ: N = số mèo khác bị clear trước lượt của nó + 1 (lời giải chuẩn qua với 1 nhịp dư).
// Ý đồ: nó ở xa hole cùng màu (phải dọn đường) và N vừa đủ gắt.
function placeSelfish(lv, moves) {
  const turns = turnsOf(moves);
  return lv.catInfos.map((c, i) => {
    const t = turnOf(turns, `c${i}`);
    const N = eatenBefore(turns, t) + 1;
    const hole = lv.holeInfos[moves.filter(m => m.eaten.length)[t].holeId];
    const dist = man(pos(c.position), pos(hole.position));
    return {cat: i, N, dist, turn: t, score: dist * 2 + Math.min(N, 8) - Math.max(0, N - 8) * 2 - (N < 3 ? 20 : 0)};
  }).sort((a, b) => b.score - a.score)[0];
}

// Couple: 2 mèo khác màu, xa nhau trên bàn, nhưng lời giải chuẩn ăn chúng gần nhau theo thời gian.
// n = số mèo bị ăn giữa hai lượt + 1.
function placeCouple(lv, moves) {
  const turns = turnsOf(moves); let best = null;
  lv.catInfos.forEach((a, i) => lv.catInfos.forEach((b, j) => {
    if (j <= i || a.colorId === b.colorId) return;
    let [ta, tb] = [turnOf(turns, `c${i}`), turnOf(turns, `c${j}`)];
    if (ta === tb) return;
    const first = ta < tb ? i : j, [lo, hi] = [Math.min(ta, tb), Math.max(ta, tb)];
    const gap = eatenBefore(turns, hi) - eatenBefore(turns, lo + 1);
    const dist = man(pos(a.position), pos(b.position));
    const score = dist * 3 - Math.abs(gap - 4) * 2 - (gap < 1 ? 30 : 0);
    if (!best || score > best.score) best = {cats: [i, j], first, n: gap + 1, gap, dist, score};
  }));
  return best;
}

// Mèo Bệnh: mô phỏng đúng luật lây (quick spec) dọc lời giải chuẩn, chọn ổ bệnh đẩy tỉ lệ bệnh sát ngưỡng nhất mà chưa thua.
function simulateSick(lv, moves, start, loseRatio = 0.5) {
  const alive = new Map(lv.catInfos.map((c, i) => [`c${i}`, pos(c.position)]));
  const sick = new Set([start]); let boxLeft = totalCats(lv) - lv.catInfos.length;
  let peak = 0; const log = [];
  for (const ids of turnsOf(moves)) {
    let k = 0;
    for (const id of ids) {
      if (id[0] === 'b') { boxLeft--; k++; continue; }
      if (!sick.has(id)) k++;
      alive.delete(id); sick.delete(id);
    }
    const infections = [];
    for (; k > 0 && sick.size; k--) {
      const healthy = [...alive].filter(([id]) => !sick.has(id));
      if (!healthy.length) break;
      const near = p => Math.min(...[...sick].map(s => man(alive.get(s), p)));
      const byYX = (a, b) => a[1][1] - b[1][1] || a[1][0] - b[1][0];
      const [to] = healthy.sort((a, b) => near(a[1]) - near(b[1]) || byYX(a, b))[0];
      const [from] = [...sick].map(s => [s, alive.get(s)])
        .sort((a, b) => man(a[1], alive.get(to)) - man(b[1], alive.get(to)) || byYX(a, b))[0];
      sick.add(to); infections.push([from, to]);
    }
    const total = alive.size + boxLeft;
    log.push({ids, infections, sick: sick.size, total});
    if (total > 0) { peak = Math.max(peak, sick.size / total); if (sick.size >= loseRatio * total) return {lost: true, peak, log}; }
  }
  return {lost: false, peak, log};
}
function placeSick(lv, moves) {
  return lv.catInfos.map((c, i) => ({cat: i, ...simulateSick(lv, moves, `c${i}`)}))
    .filter(r => !r.lost).map(r => ({...r, score: r.peak})).sort((a, b) => b.score - a.score)[0] || null;
}

// Cây Dại: khu vực = hình chữ nhật ô trống (không mèo, không hole), hole không được vào (đưa vào solver dưới dạng obstacle).
// Special Hole = plug hole của game (isPlug), thuốc sâu = plug. Solver giải lại từng phương án.
function weedGrowOrder(area, count) {
  const cells = [[area.x, area.y]];
  const inA = ([x, y]) => x >= area.x && y >= area.y && x < area.x + area.w && y < area.y + area.h;
  while (cells.length < count) {
    const has = new Set(cells.map(c => key(...c)));
    const next = cells.flatMap(([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
      .filter(c => inA(c) && !has.has(key(...c))).sort((a, b) => a[1] - b[1] || a[0] - b[0])[0];
    cells.push(next);
  }
  return cells;
}
async function placeWeed(lv) {
  const W = lv.sizeX, H = lv.sizeY, used = new Set();
  lv.catInfos.forEach(c => used.add(key(c.position.x, c.position.y)));
  lv.holeInfos.forEach(h => footprint(h).forEach(c => used.add(key(...c))));
  lv.catBoxInfos.forEach(b => { const d = [[0, 1], [-1, 0], [0, -1], [1, 0]][b.direction] || [0, 0]; used.add(key(b.position.x + d[0], b.position.y + d[1])); });
  const free = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !used.has(key(x, y));
  const rects = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [w, h] of [[3, 2], [2, 3], [2, 2], [4, 1], [1, 4], [3, 1], [1, 3]]) {
    let ok = true; for (let dy = 0; dy < h && ok; dy++) for (let dx = 0; dx < w && ok; dx++) ok = free(x + dx, y + dy);
    if (ok) rects.push({x, y, w, h});
  }
  rects.sort((a, b) => b.w * b.h - a.w * a.h);
  const jobs = [];
  for (const area of rects.slice(0, 6)) {
    const inA = (x, y) => x >= area.x && y >= area.y && x < area.x + area.w && y < area.y + area.h;
    lv.holeInfos.forEach((hole, hi) => {
      const spots = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (free(x, y) && !inA(x, y)) spots.push([x, y]);
      spots.sort((a, b) => man(b, pos(hole.position)) - man(a, pos(hole.position)));
      for (const p of spots.slice(0, 2)) jobs.push({area, hi, p});
    });
  }
  const tried = await pool(jobs.slice(0, 120).map(j => async () => {
    const test = structuredClone(lv);
    for (let dy = 0; dy < j.area.h; dy++) for (let dx = 0; dx < j.area.w; dx++) test.obstacleInfos.push({x: j.area.x + dx, y: j.area.y + dy});
    Object.assign(test.holeInfos[j.hi], {isPlug: true, plugColorId: test.holeInfos[j.hi].colorIds[0]});
    test.plugs = [{colorId: test.holeInfos[j.hi].colorIds[0], position: {x: j.p[0], y: j.p[1]}}];
    const r = await solve(test, 20000);
    if (r.status !== 'Solved') return null;
    const pick = r.moves.findIndex(m => m.holeId === j.hi && footAt(lv.holeInfos[j.hi], m.path.at(-1)).some(c => c[0] === j.p[0] && c[1] === j.p[1]));
    if (pick < 0) return null;
    const k = r.moves.slice(0, pick).reduce((s, m) => s + m.eaten.length, 0);
    const A = j.area.w * j.area.h, start = A - 1 - k;   // lời giải chuẩn nhặt thuốc sâu khi cây còn đúng 1 ô trống
    if (start < 1) return null;
    const dist = man(j.p, pos(lv.holeInfos[j.hi].position));
    return {...j, moves: r.moves, pickMove: pick, k, A, start, dist, score: A * 2 + Math.min(k, 4) * 3 + dist};
  }));
  return tried.filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
}

const strip = lv => ({sizeX: lv.sizeX, sizeY: lv.sizeY, holeInfos: lv.holeInfos, catInfos: lv.catInfos,
  obstacleInfos: lv.obstacleInfos || [], brokenObstacleInfos: lv.brokenObstacleInfos || [], catBoxInfos: lv.catBoxInfos || [], linkInfos: lv.linkInfos || []});

const files = levelDirs.flatMap(d => readdirSync(d).filter(f => /^Level\d+\.json$/.test(f)).sort().map(f => join(d, f)));
const cands = {selfish: [], couple: [], sick: [], weed: []};
for (const path of files) {
  const f = basename(path), raw = JSON.parse(readFileSync(path, 'utf8'));
  const lv = strip(raw);
  const base = await solve(lv);
  if (base.status !== 'Solved') { console.log(`${f}: solver ${base.status}, bỏ qua`); continue; }
  const src = {file: f, run: basename(resolve(path, '..')), levelInfo: raw.levelInfo};
  const s = placeSelfish(lv, base.moves), c = placeCouple(lv, base.moves), k = placeSick(lv, base.moves), w = await placeWeed(lv);
  console.log(`${f}: selfish N=${s.N} d=${s.dist} | couple n=${c?.n} d=${c?.dist} | sick ${k ? 'peak ' + k.peak.toFixed(2) : 'không ổ nào sống'} | weed ${w ? `${w.area.w}x${w.area.h} k=${w.k}` : 'không có'}`);
  cands.selfish.push({src, lv, moves: base.moves, pick: s});
  if (c) cands.couple.push({src, lv, moves: base.moves, pick: c});
  if (k) cands.sick.push({src, lv, moves: base.moves, pick: k});
  if (w) cands.weed.push({src, lv, moves: w.moves, pick: w});
}

const best = list => list.sort((a, b) => b.pick.score - a.pick.score)[0];
const MARKS = ['pink', 'purple'];
const out = {};
{
  const {src, lv, moves, pick} = best(cands.selfish), level = structuredClone(lv);
  level.catInfos[pick.cat].selfishCount = pick.N;
  out.selfish = {src, level, moves, intent: {cat: pick.cat, N: pick.N, distToHole: pick.dist,
    note: `Lời giải chuẩn clear ${pick.N - 1} mèo khác trước khi tới Mèo Ích Kỷ, còn đúng 1 nhịp. Hole cùng màu nằm cách ${pick.dist} ô nên phải dọn đường cho nó trước.`}};
}
{
  const {src, lv, moves, pick} = best(cands.couple), level = structuredClone(lv);
  pick.cats.forEach(i => { level.catInfos[i].coupleId = 0; });
  level.coupleInfos = [{id: 0, n: pick.n, mark: MARKS[0]}];
  out.couple = {src, level, moves, intent: {cats: pick.cats, n: pick.n, dist: pick.dist,
    note: `Hai con khác màu, cách nhau ${pick.dist} ô. Ăn con đầu thì còn ${pick.n} nhịp; lời giải chuẩn chỉ ăn ${pick.gap} mèo xen giữa.`}};
}
if (cands.sick.length) {
  const {src, lv, moves, pick} = best(cands.sick), level = structuredClone(lv);
  level.catInfos[pick.cat].isSick = true;
  level.sickInfo = {loseRatio: 0.5};
  out.sick = {src, level, moves, intent: {cat: pick.cat, peak: +pick.peak.toFixed(3), log: pick.log,
    note: `Đi theo lời giải chuẩn, tỉ lệ mèo bệnh lên tới ${Math.round(pick.peak * 100)}% (ngưỡng thua 50%). Ổ bệnh nằm giữa đám mèo đông nên lây rất nhanh.`}};
}
if (cands.weed.length) {
  const {src, lv, moves, pick} = best(cands.weed), level = structuredClone(lv);
  const color = level.holeInfos[pick.hi].colorIds[0];
  Object.assign(level.holeInfos[pick.hi], {isPlug: true, plugColorId: color});
  level.plugs = [{colorId: color, position: {x: pick.p[0], y: pick.p[1]}}];
  level.weedAreaInfos = [{position: {x: pick.area.x, y: pick.area.y}, sizeX: pick.area.w, sizeY: pick.area.h,
    startCells: weedGrowOrder(pick.area, pick.start).map(([x, y]) => ({x, y}))}];
  out.weed = {src, level, moves, intent: {area: pick.area, start: pick.start, specialHole: pick.hi, pesticide: pick.p,
    catsBeforePick: pick.k, pickMove: pick.pickMove,
    note: `Khu vực ${pick.area.w}×${pick.area.h}, đã phủ sẵn ${pick.start} ô. Lời giải chuẩn ăn ${pick.k} mèo rồi mới nhặt được thuốc sâu, lúc đó cây chỉ còn 1 ô là kín.`}};
}

mkdirSync(outDir, {recursive: true});
for (const [name, b] of Object.entries(out)) {
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify({mechanic: name, ...b}, null, 1));
  console.log(`→ ${name}: ${b.src.file} · ${b.intent.note}`);
}
writeFileSync(join(outDir, 'boards.js'), `// Sinh bởi tools/place-mechanics.mjs, không sửa tay.\nwindow.CATDOM_BOARDS = ${JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, {mechanic: k, ...v}])))};\n`);
