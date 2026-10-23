# Hợp đồng logic demo (bắt buộc dùng đúng từng ký tự)

UI (do Claude dựng) chỉ gọi logic qua hợp đồng này. Worker viết logic trong `logic/<tên>.js`, KHÔNG đụng tới DOM.
Luật chi tiết của từng mechanic nằm ở `design/quick-specs/*.md`. Nếu chỗ nào khác nhau thì file này thắng ở phần tên, kiểu dữ liệu và thứ tự event; quick spec thắng ở phần luật.

## 1. Khung module (UMD, chạy được cả trình duyệt lẫn Node)

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['<tên>'] = api;   // <tên> = weed | sick | couple
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // ... không dùng thư viện ngoài, không dùng DOM, không dùng Math.random
  return { validateLevel, createGame };
});
```

## 2. Kiểu dữ liệu chung
- Màu hợp lệ: `'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'yellow'`.
- Toạ độ: `x` là cột (0 … cols−1), `y` là hàng (0 … rows−1). Ô `[x, y]` là mảng 2 số.
- Mèo trong level: `{ id: string, color: string, x: number, y: number, ...cờ riêng của mechanic }`.
- **Nhóm ăn**: các mèo `alive`, ăn được, cùng màu, nối liền theo 4 hướng với ô được chọn, trên bàn và không thuộc box. Một lần `eat` ăn cả nhóm, nghĩa là một hole cùng màu nuốt chúng trong một lượt.
- Thứ tự `ids` trong event `eat`: sắp theo `y` tăng dần, rồi `x` tăng dần.

## 3. API bắt buộc
- `validateLevel(level) → string[]`: danh sách lỗi, rỗng là hợp lệ. Lỗi chung phải kiểm: `cols`/`rows` là số nguyên ≥ 1, id mèo trùng, hai mèo cùng ô, mèo ngoài bàn, màu không hợp lệ.
- `createGame(level) → game`: nếu `validateLevel` có lỗi thì `throw new Error(errors.join('; '))`. Không được sửa object `level` truyền vào.
- `game.getState() → object`: bản sao sâu (sửa object trả về không ảnh hưởng game), luôn có:
  - `status`: `'playing' | 'won' | 'lost'`
  - `loseReason`: `null | 'weed' | 'sick' | 'couple'`
  - `cats`: mảng `{ id, color, x, y, alive }` theo thứ tự level, gồm cả mèo đã bị ăn (`alive: false`), cộng các trường riêng của mechanic ở mục 4
  - `clearedCount`: tổng số mèo đã bị ăn
- `game.groupAt(x, y) → string[]`: id các mèo sẽ bị ăn nếu gọi `eat(x, y)` (cùng thứ tự với event `eat`). Trả `[]` nếu không ăn được.
- `game.eat(x, y) → { ok: boolean, reason?: string, events: object[] }`
  - Từ chối (`ok: false`, `events: []`, state KHÔNG đổi) với `reason` đúng một trong: `'not-playing'` (status khác playing), `'empty'` (ô không có mèo ăn được hay box còn mèo), `'out-of-board'`.
  - Thành công: `ok: true`, `events` theo đúng thứ tự mô tả ở mục 4. Event đầu tiên luôn là `{ type: 'eat', ids: [...] }`.
  - Event kết thúc (nếu có), luôn là event cuối: `{ type: 'lose', reason: 'weed'|'sick'|'couple', ... }` hoặc `{ type: 'win' }`. Thua được kiểm trước thắng. Sau `lose`/`win` không phát thêm event nào.

## 4. Riêng từng mechanic

### 4.1 `logic/weed.js` — `CatDomLogic.weed`
Level:
```js
{ cols, rows, cats: [{id,color,x,y}],
  weedArea: { x, y, w, h },          // hình chữ nhật trong bàn
  weedStart: [[x,y], ...],           // ≥ 1 ô, trong khu vực, không trùng
  pesticide: { x, y } }              // ngoài khu vực, không trùng ô mèo
```
`validateLevel` báo thêm lỗi khi: khu vực ra ngoài bàn; có mèo trong khu vực; `weedStart` rỗng, có ô ngoài khu vực hoặc ô trùng; `weedStart` đã phủ kín khu vực; thuốc sâu ngoài bàn, TRONG khu vực, hoặc trùng ô mèo.
State thêm: `weed: { area: {x,y,w,h}, cells: [[x,y],...] /* ô đang phủ, theo thứ tự đã mọc, weedStart trước */, total: w*h, cleared: boolean }`, `pesticide: { x, y, picked: boolean }`.
`eat` — event theo thứ tự:
1. `{ type:'eat', ids }`
2. Nếu `!weed.cleared`: với MỖI mèo vừa ăn, mọc 1 ô (luật 4 trong quick spec) và phát `{ type:'weedGrow', cell:[x,y], covered: <số ô phủ sau khi mọc>, total }`. Khi `covered === total` thì phát `{ type:'lose', reason:'weed' }` và dừng.
3. Nếu hết mèo sống: `{ type:'win' }`.

Hàm thêm `game.pickPesticide() → { ok, reason?, events }`:
- Từ chối: `'not-playing'`, `'already-picked'`.
- Thành công, event theo thứ tự: `{ type:'pick' }`, rồi `{ type:'weedClear', cells:[...các ô đang phủ trước khi xoá] }`. Sau đó `weed.cells = []`, `weed.cleared = true`, `pesticide.picked = true`. Không tính là mèo bị ăn.

### 4.2 `logic/sick.js` — `CatDomLogic.sick`
Level:
```js
{ cols, rows, cats: [{id,color,x,y}],
  boxes: [{ id, x, y, cats: [{id,color}, ...] }],   // có thể thiếu = []; cats[0] là con đầu, đang lộ ra
  initialSick?: '<id mèo trên bàn>',                 // tuỳ chọn
  seed?: number,                                     // mặc định 1
  loseRatio?: number }                               // mặc định 0.5
```
Ngẫu nhiên: BẮT BUỘC dùng đúng hàm này, gọi `rand()` ĐÚNG MỘT LẦN, chọn `pool[Math.floor(rand() * pool.length)]` với `pool` = mèo trên bàn theo thứ tự level:
```js
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
```
`validateLevel` báo thêm lỗi khi: box ngoài bàn, box trùng ô mèo/box khác, id trùng giữa mèo bàn và mèo box; `initialSick` không phải mèo trên bàn; không có mèo trên bàn nào để bệnh; trạng thái đầu đã thua (`1 >= loseRatio * tổng mèo`).
State thêm:
- mỗi mèo trong `cats` (mèo trên bàn) có `sick: boolean`. Mèo đã bị ăn giữ nguyên giá trị `sick` tại lúc bị ăn.
- `boxes: [{ id, x, y, queue: [{id,color}, ...] }]` (`queue[0]` là con đầu)
- `sickCount` (mèo sống và bệnh), `totalRemaining` (mèo sống trên bàn + mèo còn trong box), `loseRatio`
- Mèo box đã bị ăn KHÔNG nằm trong `cats`. Chúng chỉ được tính vào `clearedCount`.

`eat(x, y)`: nếu ô là box còn mèo thì chỉ ăn `queue[0]`. Ngược lại ăn nhóm mèo trên bàn. Event theo thứ tự:
1. `{ type:'eat', ids }`
2. Nếu ăn từ box: `{ type:'boxNext', boxId, next: {id,color} | null }`
3. Lặp k lần (k = số mèo khoẻ vừa ăn, mèo box tính là khoẻ), mỗi ca lây: `{ type:'infect', from:<id nguồn>, to:<id mục tiêu> }`. Dừng sớm khi không còn mèo bệnh hoặc không còn mục tiêu.
4. Nếu `totalRemaining > 0` và `sickCount >= loseRatio * totalRemaining`: `{ type:'lose', reason:'sick', sick: sickCount, total: totalRemaining }`
5. Ngược lại nếu `totalRemaining === 0`: `{ type:'win' }`

### 4.3 `logic/couple.js` — `CatDomLogic.couple`
Level:
```js
{ cols, rows,
  cats: [{id,color,x,y, couple?: '<id cặp>'}],
  couples: [{ id, n, mark }] }       // mark: màu đánh dấu, một trong các màu hợp lệ
```
`validateLevel` báo thêm lỗi khi: cặp không có đúng 2 mèo; mèo trỏ tới cặp không tồn tại; `n` không phải số nguyên ≥ 1; `mark` không hợp lệ hoặc trùng giữa các cặp; id cặp trùng.
State thêm: `couples: [{ id, n, mark, cats:[id1,id2], state:'idle'|'counting'|'safe'|'broken', target: id|null, remaining: number|null }]`. `cats` của cặp theo thứ tự level. `target` và `remaining` là `null` khi chưa `counting`, và giữ nguyên giá trị cuối khi `safe`/`broken`.
`eat` — event theo thứ tự:
1. `{ type:'eat', ids }`
2. Duyệt từng cặp theo thứ tự `couples`:
   - `idle` + lượt có cả 2: `{ type:'coupleSafe', couple:<id> }`
   - `idle` + lượt có 1: `{ type:'coupleTrigger', couple, by:<id đã ăn>, target:<id còn lại>, remaining:n }`
   - `counting` + lượt có `target`: `{ type:'coupleSafe', couple }`
   - `counting` + lượt không có `target`: `remaining -= ids.length`, rồi `{ type:'coupleCount', couple, target, remaining }`. Nếu `remaining <= 0` thì `state='broken'`, phát `{ type:'lose', reason:'couple', couple }` và dừng.
   - Cặp `safe`/`broken` bị bỏ qua. Cặp vừa chuyển `counting` trong lượt này KHÔNG bị trừ trong cùng lượt.
3. Nếu hết mèo sống: `{ type:'win' }`
