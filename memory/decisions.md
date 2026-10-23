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
