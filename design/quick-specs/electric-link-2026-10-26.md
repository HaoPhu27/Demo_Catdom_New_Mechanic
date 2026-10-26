# Quick Design Spec: Liên Kết Điện (Mechanic 10)

**Type**: New Small System
**Scope**: Hai công tắc A và B. Hai hố khác nhau cùng đứng trên A và B thì điện bật trên đoạn nối giữa chúng. Bật trúng mèo/hố là thua; đoạn nối trống thì thành rào chắn. Dựa trên `hole-move-board-2026-10-26.md`.
**Date**: 2026-10-26
**Slug**: `electric-link` · `loseReason`: `'electric'`
**Nguồn**: `reference/play-lab/mechanics-core.js` level `'6'`, `electricFixtures`, `electricActive`, `electricBarrierCells`, `checkElectric`.

## Overview
Bật điện đúng lúc: dọn đoạn nối trước, rồi mới cho hai hố đứng lên A và B. Khi rào đang bật, nhả một công tắc để mở đường.

## Core Rules
1. Level có `pads: [A, B]`, A và B cùng hàng hoặc cùng cột.
2. **Đoạn nối** là các ô nằm giữa A và B, **không** gồm chính A và B.
3. Điện **bật** khi A và B mỗi ô bị một hố còn hoạt động chiếm, và là **hai hố khác nhau**.
4. Ngay khi điện bật (kiểm tra sau khi hố đi, trước khi thu mèo; và đầu mỗi lượt nếu điện đang bật): còn mèo trên board hoặc có ô của hố còn hoạt động nằm trên đoạn nối thì thua ngay, `loseReason: 'electric'`. Không được đi thêm để thoát.
5. Điện bật và đoạn nối trống: hố đi vào ô thuộc đoạn nối bị **chặn** (không thua), lý do `'electric-barrier'`.
6. Một hố rời A hoặc B thì điện tắt, đường mở lại. Phát event `electricOn` / `electricOff` khi trạng thái đổi.
7. Mèo ngoài đoạn nối thu bình thường.

## Board kiểm thử (fixture)
EL-01…04 dùng "board làn": mỗi làn một cột `x`, có `quota` mèo cùng màu xếp dọc từ `y = 3` lên, hố cùng màu ở `y = 4` cần `quota`. Công tắc A `(1,2)`, B `(3,2)`, đoạn nối `(2,2)`.

| ID | Làn (cột:màu) | Quota | Chuỗi sai → kết quả | Chuỗi đúng → kết quả |
|---|---|---|---|---|
| EL-00 | Mèo `blue (0,0)`, `pink (4,0)`; hố `blue (1,4)`, `pink (3,4)` | 1 | `0↑↑`, `1↑↑` → rào bật, không thua | `0↑↑`, `1↑↑`, `0←↑↑`, `1→↑↑` → `won` |
| EL-01 | 0:blue, 4:pink, 2:yellow | 3 | `0↑↑→`, `1↑↑←`, `2↑↑` → `lost`, mèo vàng trên dây | `0↑↑→←↑`, `1↑↑←→↑`, `2↑↑↑` → `won` |
| EL-02 | 0:blue, 1:pink, 3:yellow, 4:blue | 3 | `2↑`, `1↑↑→`, `2↑`, `0→↑↑` → `lost`, hố hồng trên dây | `2↑↑←`, `1↑↑↑`, `2→↑`, `0↑↑↑`, `3↑↑↑` → `won` |
| EL-03 | 0:blue, 4:pink, 2:yellow | 4 | như EL-01 → `lost` | `0↑↑→←↑↑`, `1↑↑←→↑↑`, `2↑↑↑↑` → `won` |
| EL-04 | 0:blue, 1:pink, 3:yellow, 4:blue | 4 | `2↑↑←`, `1↑↑`, `2→`, `0→↑→↑` → rào bật, không thua | `2↑↑←`, `1↑↑`, `2→`, `1↑↑`, `2↑↑`, `0↑↑↑↑`, `3↑↑↑↑` → `won` |

Tất cả kết quả đã chạy lại trên nguồn. Fixture mặc định của board chơi thử và demo: EL-01.

## Tiêu chí đánh giá (từ `review.js`)
- **Case thua:** hard fail khi bật trúng mèo/hố; rào chắn khi đoạn nối trống.
- **Visual:** đường điện nối A–B; ô đoạn nối đổi màu khi bật; hố lớn chỉ cần một ô chạm dây cũng thua.

## Acceptance Criteria
- [ ] Một hố đứng trên cả A và B (hố nhiều ô) không bật điện.
- [ ] Bật điện khi đoạn nối có mèo hoặc hố: thua ngay, trước khi thu mèo.
- [ ] Đoạn nối trống: đi vào bị chặn, không thua; nhả một công tắc thì đi được.
- [ ] 5 fixture trong bảng cho đúng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
