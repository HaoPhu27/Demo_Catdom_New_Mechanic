# Quick Design Spec: Board hố di chuyển (luật nền cho mechanic 05–10)

**Type**: Luật nền dùng chung
**Scope**: Luật di chuyển hố và thu mèo mà 6 mechanic 05–10 cùng dựa vào. Mỗi mechanic có spec riêng chỉ ghi phần thêm vào.
**Date**: 2026-10-26
**Nguồn**: `reference/play-lab/mechanics-core.js` (`create`, `fits`, `canReach`, `step`). Khi spec và nguồn khác nhau ở chỗ chưa ghi, nguồn là đúng; ghi lại khác biệt vào spec.

## Overview
Board 5×5. Mỗi hố có màu, vị trí, số mèo còn cần thu (`remaining`) và hình dạng (`shape`, mặc định 1 ô). Người chơi chọn một hố và đi từng ô theo 4 hướng. Hố đi vào ô có mèo cùng màu thì thu mèo đó. Thu đủ thì hố biến mất. Mọi hố hoàn thành là thắng.

## Core Rules
1. **Toạ độ:** `x` là cột 0–4, `y` là hàng 0–4. Hố có `shape` là danh sách ô lệch `[dx, dy]` tính từ `(x, y)`; mọi ô của hố đều tính khi kiểm tra va chạm và thu mèo.
2. **Một nước đi:** `move(h, dx, dy)` với `|dx| + |dy| = 1`. Hố đã hoàn thành (`remaining = 0`) không đi được.
3. **Bị chặn** (nước đi bị từ chối, state không đổi) khi ô đích của bất kỳ ô nào trong hố: ra ngoài board; là tường; là sàn đã sụp (trừ ô hố đang đứng sẵn); bị hố khác còn hoạt động chiếm; có mèo còn trên board **khác màu**.
4. **Thu mèo:** sau khi đi, mọi mèo cùng màu nằm trong các ô của hố được thu, tối đa `remaining` con, theo thứ tự mèo trong level. Mỗi con thu làm `remaining` giảm 1.
5. **Hoàn thành hố:** `remaining = 0` thì hố biến mất khỏi board (không chặn đường, không tính vào vùng nguy hiểm).
6. **Thắng:** mọi hố có `remaining = 0`.
7. **Thua:** chỉ do luật riêng của từng mechanic (stuck, xung đột, báo động, điện). Sau khi thua hay thắng, mọi nước đi bị từ chối với lý do `not-playing`.
8. **Đếm lượt:** mỗi nước đi hợp lệ tăng `turn` 1. Nước bị chặn không tăng.

## Bảng đổi màu từ Play Lab
| Play Lab | Repo này |
|---|---|
| `xanhduong` | `blue` |
| `vang` | `yellow` |
| `hong` | `pink` |

## Ký hiệu chuỗi nước trong các spec
`X↑↑→` = hố X đi lên 2 ô rồi sang phải 1 ô. Hố được đánh số theo thứ tự trong level, bắt đầu từ 0.

## Acceptance Criteria
- [ ] Các trường hợp bị chặn ở luật 3 đều từ chối và không đổi state, không tăng `turn`.
- [ ] Hố nhiều ô thu mèo ở bất kỳ ô nào của nó.
- [ ] Hố hoàn thành không chặn đường hố khác.
- [ ] Không dùng `Math.random`; cùng chuỗi nước luôn cho cùng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
