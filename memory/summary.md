# Tóm tắt dự án (cập nhật lần cuối: 2026-10-26)

> File nén, đọc ĐẦU TIÊN mỗi phiên. Giữ trong khoảng 40–60 dòng; ghi đè phần liên quan, không append vô hạn.

## Kiến trúc hiện tại
- Trang demo mechanic CatDom dạng HTML tĩnh, mở qua `node tools/serve.mjs` (http://127.0.0.1:5173/).
- `index.html`: trang demo tổng 4 mechanic. Mỗi mechanic có nút "Xem GIF gameplay" và "Chơi thử ngay", mở trang chi tiết trong dialog + iframe.
- `selfish-cat.html`: file mẫu chuẩn (độc lập, không dùng kit).
- `weed.html`, `sick-cat.html`, `couple-cat.html`: dùng `assets/catdom-kit.css/js` (Stage, catSVG, demo tự lặp, playground) cùng `logic/<tên>.js`.
- Logic thuần UMD theo `docs/logic-contract.md`. Test: `node --test tests/weed.test.mjs tests/sick.test.mjs tests/couple.test.mjs`.
- Luật: `docs/business-rules.md` (Mèo Ích Kỷ) và `design/quick-specs/` (3 mechanic mới).
- Game gốc (chỉ đọc): `D:/Xgame/CatDom_NoTime`.

## Phase hiện tại
- Feature `mechanics` xong: MW-1, MS-1, MC-1 approved. Lead đã review và merge vào `main` (2026-10-23).
- Feature `landing` xong: LP-1 approved sau 1 vòng fix. Lead đã review và merge vào `main` (2026-10-23).

- Hợp nhất Play Lab (6 mechanic 05–10, clone từ site GPT): kế hoạch ở `design/merge-play-lab-plan.md`. Bước 0 đã chốt; Bước 1 xong trên nhánh `feature/import-lab`, chờ Lead duyệt 7 quick spec `design/quick-specs/*-2026-10-26.md`. Nguồn tham chiếu chỉ đọc: `reference/play-lab/`.

## Rủi ro đang mở
- Điều kiện thua của Mèo bệnh (1/2) chưa được playtest.
- Worker agy chạy `-p` không có quyền shell nên không tự test được. Luôn để orchestrator chạy `checks`.

## Quyết định gần nhất quan trọng
- 2026-10-26: 6 mechanic mới giữ mô hình hố di chuyển, vẽ lại bằng SVG kit, bỏ GIF thật, tiêu chí đánh giá cho cả 10 mechanic, đánh số 01–10.
- 2026-10-23: `selfish-cat.html` là file mẫu chuẩn.
- 2026-10-23: Tách UI (Claude) và logic (worker) qua hợp đồng và test nghiệm thu.
- 2026-10-23: Luật chốt cho 3 mechanic (chi tiết ở decisions.md).
