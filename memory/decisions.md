# Nhật ký quyết định

> Mỗi quyết định kỹ thuật thật thêm một mục: Ngày / Quyết định / Lý do / Trạng thái. Không xoá lịch sử cũ.

## 2026-10-23 — `selfish-cat.html` là file mẫu chuẩn
- **Quyết định:** `selfish-cat.html` là file mẫu chuẩn về kịch bản gameplay và cách trình bày cho mọi trang visualize mechanic về sau. Mọi `tasks/<ID>/prompt.md` giao cho worker phải ghi file này trong mục "File mẫu để bắt chước", và cho phép worker đọc nó (không được sửa).
- **Lý do:** Lead xác nhận kịch bản trong `selfish-cat.html` là đúng. Bản `selfish-cat-agy.html` của task SC-1 có kịch bản gameplay sai: mèo xếp hàng, hole tròn hiện tại chỗ, click từng con một, không có lưới, không kéo hole, không nuốt nhóm cùng màu.
- **Trạng thái:** Đang áp dụng.

## 2026-10-23 — Tách UI và logic cho các trang mechanic
- **Quyết định:** Mỗi mechanic gồm trang `<tên>.html` (Claude), bộ UI chung `assets/catdom-kit.*` (Claude) và `logic/<tên>.js` thuần, dạng UMD (worker). Hai bên giao tiếp qua `docs/logic-contract.md`: `createGame` / `eat` / `getState` / `events`. Test nghiệm thu `tests/<tên>.test.mjs` do Claude viết trước, worker phải qua 100%.
- **Lý do:** Lead muốn Claude lên kế hoạch và dựng UI, agy chỉ code logic. Ranh giới rõ ràng giúp chấm bài tự động và tránh worker phá UI.
- **Trạng thái:** Áp dụng cho Cây dại, Mèo bệnh, Couple Mèo (MW-1, MS-1, MC-1 đều duyệt vòng 1).

## 2026-10-23 — Luật chốt cho 3 mechanic mới
- **Quyết định:** Mèo bệnh: mỗi con khoẻ bị ăn tạo 1 ca lây. Couple: con nào ăn trước cũng kích hoạt. Cây dại: nhặt thuốc sâu thì xoá sạch, không mọc lại. Chi tiết ở `design/quick-specs/*-2026-10-23.md`.
- **Lý do:** Lead chọn qua câu hỏi chốt luật. Ngưỡng thua 1/2 của Mèo bệnh cần playtest, nên để thành tham số `loseRatio` (chỉnh được trong playground).
- **Trạng thái:** Đang áp dụng.

## 2026-10-23 — Trang demo tổng nhúng lại trang chi tiết bằng iframe
- **Quyết định:** `index.html` (phong cách dreamcoffee.homes) mở trang chi tiết trong `<dialog>` + `<iframe>`, rồi chèn CSS để chỉ hiện `main > .demos` (nút "Xem GIF gameplay") hoặc `main > .card.play` (nút "Chơi thử ngay"). "GIF" là demo chạy trực tiếp, không phải file `.gif`.
- **Lý do:** Không sửa 4 trang đã duyệt, gameplay giữ đúng bản Lead đã review, không cần công cụ quay GIF. Mọi trang mechanic về sau phải giữ `.demos` và `.card.play` là con trực tiếp của `<main>` (`tests/index.test.mjs` kiểm tra điều này).
- **Trạng thái:** Đang áp dụng (LP-1 duyệt sau 1 vòng fix).

## 2026-10-26 — Hợp nhất Play Lab (6 mechanic, clone từ site GPT) vào repo này
- **Quyết định:** Lead chốt 5 điểm theo phương án đề xuất trong `design/merge-play-lab-plan.md`:
  1. 6 mechanic mới giữ mô hình **hố di chuyển từng ô** của Play Lab (`move(h, dx, dy)`, hố có `remaining`, `shape`, tường, công tắc). Không ép về `eat(x, y)`.
  2. Vẽ lại 6 mechanic bằng SVG `catdom-kit` cho đồng bộ với 4 mechanic cũ. Không dùng sprite PNG + canvas của Play Lab trên trang.
  3. Bỏ file GIF thật (~49 MB) và `mechanic-frames.js`. "GIF" là demo tự lặp chạy logic thật, như 4 mechanic cũ. Khung hình gốc chỉ dùng để đối chiếu khi port.
  4. Khối "Tiêu chí đánh giá" viết cho **cả 10 mechanic** (bổ sung cho 4 mechanic cũ) để trang đồng nhất.
  5. Đánh số liên tục: 01–04 bộ cũ, 05–10 bộ mới.
- **Lý do:** Luật Mèo sọc và Liên kết điện phụ thuộc hướng đi của hố; giữ format và hạ tầng (test, orchestrator) của Demo CatDom làm gốc.
- **Trạng thái:** Đang áp dụng. Nguồn tham chiếu ở `reference/play-lab/` (chỉ đọc).

## 2026-10-26 — Hợp đồng hố di chuyển và fixture dùng chung
- **Quyết định:** `docs/logic-contract.md` mục 5: `move(h, dx, dy)` với lý do từ chối `not-playing | bad-move | axis-locked | electric-barrier | blocked` (gộp "ngoài bàn" vào `blocked`), 12 bước event cố định, `loseReason` theo quick spec (`stuck | stripe | alarm | electric`) thay cho danh sách trong kế hoạch ban đầu. Board + chuỗi nước sai/đúng nằm trong một file UMD `boards/lab-fixtures.js` (không tách `boards/stripe-cat.json`, `electric-link.json`) để test và trang đọc cùng một nguồn. Mọi trường riêng của mechanic là tuỳ chọn ở mọi module.
- **Lý do:** Một nguồn fixture tránh lệch giữa test và demo; đã đối chiếu 14/14 kịch bản với `reference/play-lab/mechanics-core.js`. Bỏ `validMoves()` vì UI chưa cần.
- **Trạng thái:** Đang áp dụng.

## 2026-10-26 — Worker agy cần câu dặn "không có quyền chạy lệnh"
- **Quyết định:** Prompt cho agy chạy `-p` phải ghi rõ RunCommand luôn bị từ chối, chỉ dùng công cụ đọc/ghi file.
- **Lý do:** Lần đầu PL-1 agy thử chạy lệnh, bị từ chối rồi dừng không trả lời (run-worker mã 8). Thêm câu dặn thì 6/6 task chạy trọn.
- **Trạng thái:** Đang áp dụng.

## 2026-10-26 — UI cho 6 mechanic hố di chuyển dùng một bộ vẽ chung trong kit
- **Quyết định:** `assets/catdom-kit.js` thêm `MoveView` (vẽ theo `getState()` + events; vật thể của 6 mechanic là lớp phủ ô `mv-*`), `moveDemo` (demo sai/đúng tự lặp chạy logic thật theo chuỗi nước trong `boards/lab-fixtures.js`), `movePlay` (chọn hố bằng bấm/kéo/phím 1–9, đi bằng phím mũi tên, nút ↑↓←→, kéo) và `labPage(slug, text)` nối các id cố định của khuôn trang. Trang `<slug>.html` chỉ chứa nội dung + một lệnh `CatDom.labPage`. Khối "Tiêu chí đánh giá" là `<details class="review">` ngoài `.demos`/`.card.play` ở cả 10 trang. Header trang tổng chia 2 nhóm menu thả; mobile là hàng cuộn ngang.
- **Lý do:** 6 mechanic có chung API `move`, một bộ vẽ đủ cho cả 6; demo chạy logic thật thay 49 MB GIF và 3,3 MB khung hình.
- **Trạng thái:** Đang áp dụng. Phím bấm trong lúc animation (~0,3–1,1 s) bị bỏ qua, không xếp hàng.
