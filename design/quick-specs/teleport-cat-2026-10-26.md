# Quick Design Spec: Mèo Dịch Chuyển (Mechanic 09)

**Type**: New Small System
**Scope**: Mèo mang mũi tên. Thu nó thì mọi mèo cùng màu còn trên board dịch 1 ô theo hướng mũi tên. Dựa trên `hole-move-board-2026-10-26.md`.
**Date**: 2026-10-26
**Slug**: `teleport-cat` · `loseReason`: `'stuck'`
**Nguồn**: `reference/play-lab/mechanics-core.js` level `'5'`, event `trigger` / `teleport` / `blockedTeleport` và kiểm tra `stranded` trong `step`.

## Overview
Ăn mèo mũi tên đổi vị trí cả nhóm cùng màu. Đẩy mèo vào chỗ hố không tới được là mất màn. Người chơi phải dọn mèo dễ kẹt trước.

## Core Rules
1. Mèo mũi tên có `arrow: [dx, dy]` (một trong 4 hướng), được thu như mèo thường.
2. Sau khi thu mèo mũi tên, mọi mèo **cùng màu** còn trên board dịch 1 ô theo `arrow`. Các ô đích được tính **cùng một thời điểm** từ vị trí trước khi dịch.
3. Một mèo đứng yên (event `blockedTeleport`) nếu ô đích: ra ngoài board, là tường, có mèo còn trên board (theo vị trí **trước** khi dịch), hoặc thuộc hố còn hoạt động.
4. Sau nước đi chưa thắng: có mèo còn trên board mà không hố cùng màu nào tới được (như luật 5 của Sàn Dễ Vỡ, có tính `shape` của hố) thì thua, `loseReason: 'stuck'`.

## Board mẫu (5×5)
- Tường: `(4,0)`, `(4,2)` — tạo hốc 1 ô ở `(4,1)`.
- Mèo: `blue (2,2) arrow → [1,0]`, `blue (3,1)`.
- Hố: `blue (1,3)` cần 2, cao 2 ô (`shape [[0,0],[0,1]]`).

| Kịch bản | Chuỗi nước | Kết quả (đã chạy lại trên nguồn) |
|---|---|---|
| Sai: dịch chuyển vào góc kẹt | `0↑→` | `lost`, stuck — mèo thường bị đẩy vào hốc `(4,1)`, hố cao 2 ô không lọt |
| Đúng: dọn mèo dễ kẹt trước | `0→→↑↑←` | `won` |

## Tiêu chí đánh giá (từ `review.js`)
- **Case thua:** stuck do vị trí mới của mèo.
- **Visual:** mũi tên trên mèo; bóng mờ ô đích trước khi thu.
- **Cảm giác:** dự đoán ô đích trước khi thu mèo mũi tên.

## Acceptance Criteria
- [ ] Dịch chuyển đồng thời: hai mèo cùng màu nằm nối đuôi theo hướng mũi tên thì con phía sau đứng yên (ô đích đang có mèo ở thời điểm tính), dù con phía trước dịch được.
- [ ] Mèo khác màu không bị dịch.
- [ ] Hố nhiều ô được tính đúng khi xét tới được.
- [ ] Hai kịch bản trong bảng cho đúng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
