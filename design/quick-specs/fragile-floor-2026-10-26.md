# Quick Design Spec: Sàn Dễ Vỡ (Mechanic 06)

**Type**: New Small System
**Scope**: Ô sàn có độ bền. Mỗi lần hố đi vào ô, độ bền giảm 1; về 0 thì sụp, hố không đi vào được nữa. Dựa trên `hole-move-board-2026-10-26.md`.
**Date**: 2026-10-26
**Slug**: `fragile-floor` · `loseReason`: `'stuck'`
**Nguồn**: `reference/play-lab/mechanics-core.js` level `'2'`, `fits` (sàn sụp), vòng `for(const f of s.floors)` và kiểm tra `stranded` trong `step`.

## Overview
Một lượt đi thừa qua cầu có thể cắt đứt đường của hố khác. Người chơi phải tính trước số lần mỗi hố cần đi qua sàn.

## Core Rules
1. Sàn: `{ x, y, durability, max }`. Hố đi vào ô sàn (ô đó **mới** nằm trong hố sau nước đi, trước đó không nằm trong hố) thì `durability` giảm 1, không dưới 0.
2. Đứng yên trên sàn hay di chuyển mà ô sàn vẫn nằm trong hố không làm giảm độ bền.
3. Sàn `durability = 0` là ô đã sụp: hố không đi vào được. Hố đang đứng trên ô vừa sụp vẫn đi ra được.
4. Sàn sụp tự nó không gây thua.
5. Sau mỗi nước đi chưa thắng: nếu có mèo còn trên board mà không hố cùng màu nào còn hoạt động **tới được** (tìm đường bỏ qua mèo/hố khác, chỉ tính tường, mép board và sàn sụp) thì thua, `loseReason: 'stuck'`.

## Board mẫu (5×5)
- Hàng `y = 2` là lối đi; ngoài ra chỉ mở các ô `(0,1)`, `(4,1)`, `(4,3)`, còn lại là tường.
- Sàn: `(2,2)` độ bền 2/2.
- Mèo: `blue (4,1)`, `pink (0,1)`. Hố (mỗi hố cần 1): `blue (0,2)`, `pink (4,3)`.

| Kịch bản | Chuỗi nước | Kết quả (đã chạy lại trên nguồn) |
|---|---|---|
| Sai: quay lại cầu quá nhiều | `0→→←→` | `lost`, stuck — cầu sụp, hố hồng mất đường |
| Đúng: mỗi hố qua một lần | `0→→→→↑`, `1↑←←←←↑` | `won` |

## Tiêu chí đánh giá (từ `review.js`)
- **Case thua:** stuck khi mất đường hoàn thành. Chỉ sụp sàn không tự động gây thua.
- **Visual:** số độ bền trên ô sàn; ô sẫm màu là đã sụp; tường chặn đường.
- **Đánh đổi:** mỗi lượt qua cầu là tài nguyên chung của mọi hố.

## Acceptance Criteria
- [ ] Độ bền chỉ giảm khi ô sàn mới đi vào hố; hố nhiều ô đứng trên sàn và đi tiếp không trừ thêm.
- [ ] Sàn 0 chặn đường; hố đang đứng trên đó vẫn ra được.
- [ ] Kiểm tra stuck dùng tìm đường thật, không chỉ nhìn ô kề.
- [ ] Hai kịch bản trong bảng cho đúng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
