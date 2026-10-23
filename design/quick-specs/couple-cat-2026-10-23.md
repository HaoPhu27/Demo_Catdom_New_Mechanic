# Quick Design Spec: Couple Mèo (Love Arrow)

**Type**: New Small System
**Scope**: Hai con mèo gắn mũi tên tình yêu cùng màu đánh dấu thành một cặp. Ăn một con thì con còn lại bắt đầu đếm ngược giống Mèo Ích Kỷ. Không đổi luật Mèo Ích Kỷ.
**Date**: 2026-10-23
**Estimated Implementation**: ~5 giờ (bản demo HTML)
**Tham chiếu**: `selfish-cat.html` và `docs/business-rules.md` (luật đếm của Mèo Ích Kỷ).

## Overview
Mỗi cặp có màu đánh dấu (`mark`) và một số đếm `n`. Lúc đầu cặp ở trạng thái chờ, không đếm. Ăn được một con trong cặp (con nào trước cũng được) thì con còn lại thành "mèo chờ" và đếm ngược `n` giống Mèo Ích Kỷ. Ăn được nó trước khi đếm về 0 thì cặp an toàn. Ăn cả hai con trong cùng một lượt thì an toàn ngay.

## Core Rules
1. Trạng thái của một cặp: `idle` → `counting` → `safe` | `broken`.
2. Ở `idle`:
   - Lượt ăn có cả 2 con: chuyển sang `safe`.
   - Lượt ăn có 1 con: chuyển sang `counting`. Con còn lại là `target`, `remaining = n`. Các mèo khác trong CÙNG lượt kích hoạt KHÔNG bị trừ vào đếm.
3. Ở `counting`, sau mỗi lượt ăn tiếp theo:
   - Lượt có `target`: chuyển sang `safe`. Các mèo khác trong cùng lượt đó không làm thua.
   - Lượt không có `target`: `remaining` giảm đúng bằng số mèo bị ăn trong lượt. `remaining ≤ 0` thì chuyển sang `broken` và thua (lý do `couple`).
4. Nhiều cặp được xử lý độc lập, theo thứ tự trong `couples`. Cặp đầu tiên `broken` thì dừng xử lý và thua.
5. Thắng khi tất cả mèo đã được clear mà chưa thua.
6. Luật thiết kế màn: mỗi cặp có đúng 2 con mèo, `n ≥ 1`, `mark` khác nhau giữa các cặp.

## Tuning Knobs
| Knob | Default | Range | Category | Rationale |
|------|---------|-------|----------|-----------|
| `n` | 4 | 1–12 | gate | Giống `selfishCount` |
| Khoảng cách 2 con trong cặp | xa | — | curve | Càng xa thì càng khó ăn con thứ hai kịp |

## Acceptance Criteria
- [ ] Ăn 1 con thì con kia đếm `n`. Mèo trong cùng lượt kích hoạt không bị trừ.
- [ ] Ăn `n` mèo khác trước `target` thì thua. Ăn `target` lúc còn `remaining ≥ 1` thì an toàn.
- [ ] Ăn cả cặp trong một lượt thì an toàn ngay, không đếm.
- [ ] Hai cặp chạy độc lập.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
