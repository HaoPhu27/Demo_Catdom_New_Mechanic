# Tóm tắt dự án (cập nhật lần cuối: 2026-10-26)

> File nén, đọc ĐẦU TIÊN mỗi phiên. Giữ trong khoảng 40–60 dòng; ghi đè phần liên quan, không append vô hạn.

## Kiến trúc hiện tại
- Trang demo mechanic CatDom dạng HTML tĩnh, mở qua `node tools/serve.mjs` (http://127.0.0.1:5173/).
- `index.html`: trang demo tổng 10 mechanic (header 2 nhóm: Bộ 1 · 4 mechanic, Bộ 2 · 6 mechanic). Nút "Xem GIF gameplay" / "Chơi thử ngay" nhúng trang chi tiết bằng iframe ngay trong khung visual, chỉ hiện `main > .demos` hoặc `main > .card.play`.
- `selfish-cat.html`: file mẫu chuẩn (độc lập, không dùng kit).
- `weed.html`, `sick-cat.html`, `couple-cat.html`: dùng `assets/catdom-kit.css/js` (Stage, catSVG, `demo`, `playground`) cùng `logic/<tên>.js`.
- 6 mechanic 05–10 (`magnet`, `fragile-floor`, `stripe-cat`, `alarm-zone`, `teleport-cat`, `electric-link`): logic `logic/_board-move.js` (lõi) + `logic/<slug>.js`; trang `<slug>.html` chỉ gọi `CatDom.labPage(slug, …)` (kit: `MoveView`, `moveDemo`, `movePlay`). Board và chuỗi nước sai/đúng dùng chung cho test và trang: `boards/lab-fixtures.js`.
- Logic thuần UMD theo `docs/logic-contract.md` (mục 1–4: kiểu nuốt nhóm `eat`; mục 5: kiểu hố di chuyển `move`). Test: `node --test tests/*.test.mjs` (174 test).
- Mỗi trang chi tiết có `<details class="review">` "Tiêu chí đánh giá", nằm ngoài `.demos`/`.card.play`.
- Luật: `docs/business-rules.md` (Mèo Ích Kỷ), `design/quick-specs/` (9 mechanic còn lại + luật nền board hố di chuyển).
- Game gốc (chỉ đọc): `D:/Xgame/CatDom_NoTime`. Play Lab gốc (chỉ đọc): `reference/play-lab/`.

## Phase hiện tại
- Feature `mechanics`, `landing` xong và đã merge `main` (2026-10-23).
- Hợp nhất Play Lab (`design/merge-play-lab-plan.md`): Bước 0–6 xong (2026-10-26), chưa merge `main`. Chuỗi nhánh: `feature/import-lab` → `feature/move-contract` → `feature/PL-1…PL-6` (logic, agy viết) → `feature/lab-ui` (Bước 4–6, chứa toàn bộ).
- Còn Bước 7: QA tay (desktop, mobile 375 px, `prefers-reduced-motion`, bàn phím), playtest, Lead review + merge.

## Rủi ro đang mở
- Điều kiện thua của Mèo bệnh (1/2) chưa được playtest; case strict SC-05 và điều kiện thua Liên kết điện cần playtest.
- Worker agy chạy `-p` không có quyền shell: prompt phải dặn rõ, orchestrator luôn chạy `checks`.
- Demo/board mới chưa xử lý `prefers-reduced-motion`; phím bấm trong lúc animation bị bỏ qua.

## Quyết định gần nhất quan trọng
- 2026-10-26: UI 6 mechanic mới dùng một bộ vẽ chung trong kit (`MoveView`), demo chạy logic thật thay GIF.
- 2026-10-26: Hợp đồng hố di chuyển (mục 5) + fixture chung `boards/lab-fixtures.js`.
- 2026-10-26: 6 mechanic mới giữ mô hình hố di chuyển, vẽ lại bằng SVG kit, bỏ GIF thật, tiêu chí đánh giá cho cả 10 mechanic, đánh số 01–10.
- 2026-10-23: `selfish-cat.html` là file mẫu chuẩn; tách UI (Claude) và logic (worker) qua hợp đồng và test nghiệm thu.
