# Kế hoạch hợp nhất: Demo CatDom + Play Lab (clone từ site GPT)

> Ngày lập: 2026-10-26. Chỉ là kế hoạch, chưa sửa code.
> Thực hiện theo quy trình `/feature` của repo này (mode `lean`): mỗi giai đoạn dưới đây là một feature, mỗi mục `Task` là một task cho worker, test nghiệm thu do orchestrator viết trước.

## 1. Hiện trạng hai bản

| | Demo CatDom (`Demo_Catdom_New_Mechanic`) — **format chính** | Play Lab (`CatDom_Play_Lab_6_Mechanic`) — bản clone |
|---|---|---|
| Mechanic | 4: Mèo Ích Kỷ, Cây Dại, Mèo Bệnh, Couple Mèo | 6: Mèo nam châm, Sàn dễ vỡ, Mèo sọc, Vùng báo động, Mèo dịch chuyển, Liên kết điện |
| Trình bày | `index.html` dạng landing: hero → mỗi mechanic một `section.mech` (chip "Mechanic 0N", tên, mô tả, luật gạch đầu dòng, nút "Xem GIF gameplay" / "Chơi thử ngay", khung art), xen kẽ trái/phải, drip divider, footer | SPA một trang: picker 6 nút → intro + canvas preview (tab sai/đúng) → board chơi thử → 2 GIF thật → tiêu chí đánh giá (`review.js`) |
| Trang chi tiết | Mỗi mechanic một file `<tên>.html`, có `main > .demos` và `main > .card.play`, nhúng vào `index.html` bằng iframe | Không có, mọi thứ trong `index.html` + JS |
| Gameplay | Bấm/kéo hole nuốt cả nhóm cùng màu (`eat(x, y)`) | Hố di chuyển từng ô (`{h, dx, dy}`), hố có `remaining`, có hố nhiều ô (`shape`), tường, pad |
| Logic | `logic/<tên>.js` UMD, `CatDomLogic.<tên>`, theo `docs/logic-contract.md`, có test `node --test` | `mechanics-core.js` UMD gộp chung, `window.CatdomMechanics`, có fixture SC-01…05, EL-00…04 |
| Render | SVG qua `assets/catdom-kit.js` (`catSVG`, Stage, demo tự lặp) | Canvas qua `mechanics-render.js` + sprite PNG (`cat-*.png`, `hole-*.png`, `board.png`) |
| "GIF" | Demo chạy trực tiếp tự lặp (không phải file) | File `.gif` thật (~49 MB) + `assets/mechanic-frames.js` (3,3 MB khung hình) |
| Màu | `blue, green, orange, purple, pink, yellow` | `xanhduong, vang, hong` |
| Hạ tầng | git, orchestrator, `tests/`, `tools/serve.mjs`, `tools/check-html.mjs` | Không có |

**Hướng hợp nhất:** lấy repo Demo CatDom làm gốc. Sáu mechanic của Play Lab được chuyển thành sáu trang chi tiết mới theo khuôn `selfish-cat.html`, rồi thêm sáu `section.mech` vào `index.html`. Play Lab chỉ là nguồn tham chiếu (luật, fixture, kịch bản sai/đúng, nội dung đánh giá), không giữ lại bố cục SPA.

## 2. Điểm cần Lead chốt trước khi code (Bước 0)

1. **Mô hình gameplay của 6 mechanic mới**: giữ nguyên kiểu "hố di chuyển từng ô" của Play Lab (đề xuất — luật Mèo sọc và Liên kết điện phụ thuộc hướng đi, đổi sang kiểu nuốt nhóm sẽ phá luật) hay ép về kiểu `eat(x, y)` của Demo CatDom?
2. **Hình ảnh**: vẽ lại 6 mechanic bằng SVG `catdom-kit` cho đồng bộ (đề xuất, làm ở Bước 5) hay giữ sprite PNG + canvas của Play Lab?
3. **File GIF thật 49 MB**: bỏ hẳn (dùng demo tự lặp như 4 mechanic cũ — đề xuất), hay giữ làm link "Tải GIF" ở trang chi tiết?
4. **Khối "Tiêu chí đánh giá"** (case thua, visual, cảm giác, đánh đổi, mật độ, rủi ro trong `review.js`): chỉ gắn cho 6 mechanic mới, hay viết bổ sung cho cả 4 mechanic cũ để trang đồng nhất?
5. **Thứ tự & đánh số**: giữ 01–04 cho bộ cũ, 05–10 cho bộ mới (đề xuất), hay chia hai nhóm "Bộ 1 / Bộ 2"?

Ghi kết quả vào `memory/decisions.md` trước khi sang Bước 1.

## 3. Các bước phát triển

### Bước 1 — Nhập nguồn tham chiếu (feature `import-lab`)
- Copy Play Lab vào `reference/play-lab/` (chỉ đọc, ghi vào `do-not-modify` của mọi task). Không copy các file `.gif` nếu Lead chọn bỏ ở mục 2.3; thêm chúng vào `.gitignore`.
- Viết `design/quick-specs/<tên>-2026-10-26.md` cho 6 mechanic: luật, điều kiện thua/thắng, kịch bản sai và đúng, bảng fixture — trích từ `mechanics-core.js`, `review.js`, `lab.js` (bảng `legend`).
- Đặt tên file/slug: `magnet`, `fragile-floor`, `stripe-cat`, `alarm-zone`, `teleport-cat`, `electric-link`.
- Bảng đổi màu: `xanhduong → blue`, `vang → yellow`, `hong → pink`.
- **Xong khi:** 6 quick spec được Lead duyệt.

### Bước 2 — Hợp đồng logic cho mô hình "hố di chuyển" (feature `move-contract`)
- Thêm mục mới vào `docs/logic-contract.md` (giữ nguyên phần cũ): `createGame(level)`, `game.move(holeIndex, dx, dy) → { ok, reason?, events }`, `game.getState()`, `game.validMoves()`; kiểu dữ liệu hố `{ color, x, y, remaining, shape }`, tường, pad, công tắc; thứ tự event (`move`, `eat`, `holeDone`, rồi riêng từng mechanic, cuối cùng `lose`/`win`); `loseReason` mới: `'magnet' | 'floor' | 'stripe' | 'alarm' | 'teleport' | 'electric' | 'stuck'`.
- Orchestrator viết test nghiệm thu `tests/<slug>.test.mjs` cho mỗi mechanic: chạy chuỗi nước "đúng" trong fixture → `won`; chuỗi "sai" → `lost` với đúng `loseReason`; các đường từ chối (`not-playing`, `blocked`, `out-of-board`); `getState()` trả bản sao sâu; không dùng `Math.random`.
- **Xong khi:** hợp đồng và 6 file test có trong `main` (test đang đỏ là đúng).

### Bước 3 — Port logic 6 mechanic (feature `lab-logic`, task PL-1…PL-6)
- Mỗi task: tách phần của mechanic đó khỏi `reference/play-lab/mechanics-core.js` sang `logic/<slug>.js` dạng UMD `CatDomLogic.<slug>`, đổi tên màu, bỏ phụ thuộc DOM.
- Phần dùng chung (di chuyển hố, ăn mèo, quota, stuck) đặt ở `logic/_board-move.js` — làm trong PL-1 trước, PL-2…6 dùng lại.
- Fixture SC-01…05 (Mèo sọc) và EL-00…04 (Liên kết điện) chuyển thành `boards/stripe-cat.json`, `boards/electric-link.json`.
- Thứ tự: PL-1 (nam châm, kèm lõi chung) → PL-2 (sàn vỡ) → PL-5 (dịch chuyển) → PL-4 (báo động) → PL-3 (sọc) → PL-6 (điện), từ đơn giản đến nhiều trạng thái.
- **Xong khi:** `node --test` qua 100% cho cả 10 mechanic (4 cũ là hồi quy).

### Bước 4 — Mở rộng bộ UI chung (feature `kit-move`, task KM-1)
- Thêm vào `assets/catdom-kit.js/css` một Stage dạng lưới cho hố di chuyển: vẽ ô, tường, hố nhiều ô, số `remaining`, điều khiển bằng kéo + phím mũi tên + nút ↑↓←→ (lấy cách nhập từ `lab.js`).
- Thêm hàm vẽ phần tử riêng: nam châm và vùng hút 8 ô, ô sàn có độ bền / đã sụp, mèo sọc ↔/↕, vùng báo động + công tắc S, mèo mũi tên, dây điện A–B.
- Trình phát demo "sai / đúng" từ chuỗi nước đi (thay cho `mechanic-frames.js` 3,3 MB): demo tự lặp bằng cách chạy logic thật, giống 4 mechanic cũ.
- **Xong khi:** một trang thử nghiệm dựng được board fixture bất kỳ và phát lại chuỗi nước.

### Bước 5 — Sáu trang chi tiết (feature `lab-pages`, task LB-1…LB-6)
- Mỗi trang `<slug>.html` bắt chước `selfish-cat.html` / `weed.html`: header, tiêu đề, `main > .demos` gồm **2 bảng nằm ngang "01 · Cách chơi sai" và "02 · Cách chơi đúng"**, `main > .card.play` có board chơi thử, nút Làm lại, Gợi ý, chọn fixture (với Mèo sọc và Liên kết điện), trạng thái thắng/thua.
- Thêm khối `<details>` "Tiêu chí đánh giá" (nội dung từ `review.js`) **ngoài** `.demos` và `.card.play` để iframe ở trang tổng không hiện nó.
- **Xong khi:** `node tools/check-html.mjs <slug>.html` qua; Lead chơi thử được từng trang.

### Bước 6 — Trang demo tổng 10 mechanic (feature `landing-merge`, task LP-4)
- `index.html`: thêm 6 `section.mech` (id = slug, `data-page`, chip "Mechanic 05"…"10", emoji/biểu tượng, mô tả, 3 luật, 2 nút GIF/Chơi thử, art minh hoạ), giữ xen kẽ `mech-reverse` và drip divider đổi màu nền đúng thứ tự.
- Thêm 6 slug vào `VALID_MECHS`; vẽ `illus-<slug>` bằng kit.
- Header: 10 link quá dài → đổi thành 2 nhóm có menu thả ("Bộ 1 · 4 mechanic", "Bộ 2 · 6 mechanic"), trên mobile là thanh cuộn ngang.
- Hero: sửa câu chữ "4 cơ chế" → "10 cơ chế"; cụm mèo minh hoạ thêm 2–3 mèo của bộ mới. Footer: thêm 6 link và link "Tài liệu mechanic ↗" của Play Lab.
- Cập nhật `tests/index.test.mjs`: đủ 10 section, mỗi trang chi tiết có `.demos` và `.card.play` là con trực tiếp của `<main>`.
- **Xong khi:** checks trong `orchestrator.config.json` (đã thêm 6 test logic mới) qua hết.

### Bước 7 — Hoàn thiện và kiểm tra (feature `merge-qa`)
- Hiệu năng: iframe chỉ nạp khi bấm nút (đã có), không còn file > 500 KB trên trang tổng; kiểm tra 10 iframe mở cùng lúc.
- Kiểm tra tay: desktop + mobile 375 px, `prefers-reduced-motion`, bàn phím (Tab, mũi tên trên board).
- Playtest các điểm còn mở: `loseRatio` Mèo bệnh, case strict của Mèo sọc (SC-05), điều kiện thua của Liên kết điện.
- Cập nhật `memory/summary.md`, `roadmap.md`, `decisions.md`; Lead review và merge vào `main`.

## 4. Phụ thuộc và rủi ro

- Bước 0 chặn mọi bước sau. Bước 2 → 3; Bước 4 có thể chạy song song với Bước 3 (khác file), Bước 5 cần cả 3 và 4; Bước 6 cần 5.
- **Rủi ro lớn nhất:** port logic làm lệch hành vi so với bản Play Lab mà Lead đã xem. Giảm bằng cách lấy test từ chính fixture và chuỗi nước "sai/đúng" của Play Lab.
- `mechanic-frames.js` được sinh từ logic cũ; nếu demo tự lặp (Bước 4) chạy ra khác khung hình gốc thì đó là dấu hiệu port sai — dùng nó làm đối chiếu ở Bước 3, không đưa lên trang.
- Việc dở trong roadmap (board thật từ generator, Cây Dại báo `NoNextCatReachable`) độc lập với kế hoạch này; không gộp chung feature.
