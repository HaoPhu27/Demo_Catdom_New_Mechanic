# Quick Design Spec: Vùng Báo Động (Mechanic 08)

**Type**: New Small System
**Scope**: Vùng ô báo động và công tắc S. Có hố đứng trên S thì báo động tắt. Báo động bật mà có hố trong vùng thì thua. Dựa trên `hole-move-board-2026-10-26.md`.
**Date**: 2026-10-26
**Slug**: `alarm-zone` · `loseReason`: `'alarm'`
**Nguồn**: `reference/play-lab/mechanics-core.js` level `'4'`, `alarmActive`, `alarmOccupied`, `checkAlarm`.

## Overview
Một hố giữ công tắc để hố khác đi qua vùng đỏ. Nhả công tắc khi vùng còn hố là thua. Người chơi phải phối hợp thứ tự giữa các hố.

## Core Rules
1. Level có `alarmSwitches: [[x,y], ...]` và `alarms: [[x,y], ...]` (các ô vùng báo động).
2. Báo động **tắt** khi có ít nhất một hố còn hoạt động có ô nằm trên một công tắc. Ngược lại báo động **bật**.
3. Bất kỳ hố nào còn hoạt động cũng giữ được công tắc. Hố giữ công tắc hoàn thành và biến mất thì công tắc được nhả ngay.
4. Kiểm tra sau khi hố đi (trước khi thu mèo) và lần nữa sau khi thu mèo: báo động bật và có **bất kỳ** hố còn hoạt động nào có ô trong vùng báo động thì thua ngay, `loseReason: 'alarm'` — kể cả hố đó không vừa di chuyển.
5. Phát event `alarmOn` / `alarmOff` khi trạng thái báo động đổi.
6. Thu mèo không tắt báo động vĩnh viễn.

## Board mẫu (5×5)
- Công tắc S: `(0,3)`. Vùng báo động: `(1,2) (2,2) (3,2) (4,2)`.
- Mèo: `blue (0,0)`, `pink (4,1)`, `pink (3,0)`.
- Hố: `blue (0,4)` cần 1, `pink (4,4)` cần 2.

| Kịch bản | Chuỗi nước | Kết quả (đã chạy lại trên nguồn) |
|---|---|---|
| Sai: nhả công tắc quá sớm | `0↑`, `1↑↑`, `0↓` | `lost`, alarm — hồng còn trong vùng khi xanh rời S |
| Đúng: giữ đến khi hố kia qua hết | `0↑`, `1↑↑↑←↑`, `0↑↑↑` | `won` |

## Tiêu chí đánh giá (từ `review.js`)
- **Case thua:** hard fail khi báo động bật và vùng có hố.
- **Visual:** vùng đỏ khi bật, xanh khi tắt; chữ S trên công tắc.
- **Cảm giác:** một hố "giữ cửa", một hố đi qua.

## Acceptance Criteria
- [ ] Đi vào vùng khi báo động bật: thua ngay.
- [ ] Nhả công tắc khi hố khác còn trong vùng: thua, dù hố vừa đi đang ở ngoài vùng.
- [ ] Hố giữ S hoàn thành thì báo động bật lại ngay và được kiểm tra.
- [ ] Hai kịch bản trong bảng cho đúng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
