# Quick Design Spec: Board demo thực tế (mechanic 05–10)

**Type**: Nội dung demo (fixture) + vẽ hố nhiều ô
**Scope**: Demo "GIF" sai/đúng của 6 mechanic hố di chuyển chạy trên board giống level thật, thay board đồ chơi 5×5. Board chơi thử giữ các fixture hướng dẫn cũ, thêm board demo vào danh sách.
**Date**: 2026-10-26
**Nguồn**: level thật trong `boards/*.json` (Level09105…, 7×8 / 8×9) và cách Rollic dựng obstacle trong *30 Drop Away* (https://rollic.helpshift.com/hc/en/30-drop-away/faq/1043-what-are-the-obstacles/).

## Vì sao
Board demo hiện tại: 5×5, 1–3 hố, hố 1 ô hoặc chữ nhật 2×1, chỉ 1–3 màu. Trông như bài test, không giống game. Level thật thì khác hẳn (đo trên 3 level trong `boards/`):

| Chỉ số | Level thật | Demo hiện tại |
|---|---|---|
| Kích thước | 7×8, 8×9 | 5×5 |
| Số hố | 8–9 | 1–3 |
| Màu | mỗi hố một màu | 1–3 màu |
| Hình hố | I2, I3, L3, L4, chữ thập 5 ô… | 1 ô, 2×1 |
| Sức chứa | **bằng số ô của hố** (2–5) | tuỳ ý (hố 1 ô chứa 3) |
| Mèo | tổng mèo = tổng sức chứa, ~35% ô | vài con |

Rollic dựng obstacle theo cùng kiểu: obstacle là **một chi tiết đặt vào board bình thường** (đầy hố nhiều hình, nhiều màu), không phải một board riêng chỉ có obstacle. Mỗi màn có một "khoảnh khắc chữ ký" của obstacle; phần còn lại là chơi thường.

## Core Rules
1. **Fixture demo:** mỗi `fixtures[slug]` thêm khoá `demo` trỏ tới một key mới trong `list` (ví dụ `'demo'`). Fixture đó có `level`, `good`, `bad` như các fixture khác. `default` và các fixture cũ giữ nguyên (test riêng của mechanic đang dùng chúng).
2. **Trang:** hai demo sai/đúng ở trang chi tiết dùng `list[demo]`; board chơi thử vẫn mở `list[default]`, board demo có trong danh sách chọn màn (nếu trang có).
3. **Kích thước:** `cols` 6–8, `rows` 7–9.
4. **Hố:** 4–7 hố. Mỗi hố có `shape` thuộc catalog bên dưới (tính cả xoay/lật). `remaining` = số ô của `shape`.
5. **Đa dạng hình:** ≥ 3 loại hình khác nhau; ≥ 2 hố không thẳng (L3, L4, O4, T4, X5); số hố I2 ≤ 1/3 số hố.
6. **Màu:** ≥ min(4, số hố) màu khác nhau trong các hố. Với mỗi màu: số mèo cùng màu = tổng `remaining` các hố màu đó (không mèo thừa, không thiếu).
7. **Mật độ:** số mèo ≥ 30% số ô của board.
8. **Chữ ký mechanic:** chuỗi `good` hoặc `bad` phải phát event chữ ký: magnet `magnet`, fragile-floor `crack`, teleport-cat `teleport`, stripe-cat `axis`, alarm-zone `alarmOn`, electric-link `electricOn`.
9. **Nhịp demo:** `bad` ≤ 10 nước và thua đúng `loseReason` của mechanic (electric-link được phép kết thúc `playing` với `lastRejected` như EL-04 nếu không có cách thua gọn; ưu tiên thua `electric`). `good` ≤ 40 nước, thắng. Chuỗi `bad` nên trùng phần đầu với `good` rồi rẽ sai ở khoảnh khắc chữ ký, để người xem so được hai bên.
10. **Hiệu năng:** chạy hết `good` trong ≤ 1500 ms trên Node (stripe-cat có tìm kiếm stuck toàn bộ — board phải đủ "thoáng" để tìm kiếm thắng nhanh).

## Catalog hình hố
Ô `[dx, dy]`, góc trên-trái `(0,0)`. Mọi phép xoay 90° và lật gương đều hợp lệ.

| Tên | Ô | Sức chứa | Loại thật (`holeType`) |
|---|---|---|---|
| I2 | `[0,0] [1,0]` | 2 | 21 (ngang), 8 (dọc) |
| I3 | `[0,0] [1,0] [2,0]` | 3 | 22, 9 |
| L3 | `[0,0] [1,0] [0,1]` | 3 | 13, 14, 15, 16 |
| L4 | `[0,0] [0,1] [0,2] [1,2]` | 4 | 4, 6, 3 |
| O4 | `[0,0] [1,0] [0,1] [1,1]` | 4 | (Rollic) |
| T4 | `[0,0] [1,0] [2,0] [1,1]` | 4 | (Rollic) |
| X5 | `[1,0] [0,1] [1,1] [2,1] [1,2]` | 5 | 12 |

Ánh xạ `holeType` suy ra từ vị trí mèo bị ăn trong lời giải của level thật (file `HoleShapes.json` gốc không còn trên máy); dùng làm tham khảo, catalog trên là chuẩn của repo.

## Vẽ hố nhiều ô (kit)
- Hố vẽ đúng hình các ô của nó (không phải hình chữ nhật bao). Các ô liền nhau trông là một khối liền (không có khe giữa hai ô cùng hố).
- Số `remaining` đặt trên một ô của hố (ô đầu tiên trong `shape`).
- Chọn hố, kéo hố, rung khi bị chặn, thu nhỏ khi xong: áp dụng cho cả khối.

## Acceptance Criteria
- [ ] `tests/demo-board.test.mjs` đạt cho cả 6 mechanic.
- [ ] Test cũ (`tests/*.test.mjs`) vẫn đạt; fixture cũ không đổi.
- [ ] Trang chi tiết 05–10: demo sai/đúng chạy trên board demo, hố hiện đúng hình.
