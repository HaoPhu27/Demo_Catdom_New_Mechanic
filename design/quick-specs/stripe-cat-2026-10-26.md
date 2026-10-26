# Quick Design Spec: Mèo Sọc (Mechanic 07)

**Type**: New Small System
**Scope**: Mèo sọc ngang/dọc khoá hố vào một trục di chuyển (strict). Ăn sọc đối trục khi hố còn cần hơn 1 mèo thì thua. Dựa trên `hole-move-board-2026-10-26.md`.
**Date**: 2026-10-26
**Slug**: `stripe-cat` · `loseReason`: `'stripe'` (xung đột) hoặc `'stuck'`
**Nguồn**: `reference/play-lab/mechanics-core.js` level `'3'`, `stripeFixtures`, `stripeConflict`, `stripeCanComplete`, nhánh `s.id==='3'` trong `step`.

## Overview
Mỗi hố bắt đầu tự do. Ăn mèo sọc ngang thì hố chỉ đi trái/phải; sọc dọc thì chỉ đi lên/xuống. Người chơi phải chia mèo sọc cho đúng hố và đúng thứ tự.

## Core Rules
1. Mèo: `kind` = `'NORMAL' | 'STRIPE_H' | 'STRIPE_V'`. Hố: `axis` = `'FREE' | 'HORIZONTAL' | 'VERTICAL'`, ban đầu `'FREE'`.
2. Hố `HORIZONTAL` đi lên/xuống, hoặc `VERTICAL` đi trái/phải: nước đi bị **chặn** (không thua, không tăng `turn`), lý do `'axis-locked'`.
3. Thu `STRIPE_H` đặt `axis = 'HORIZONTAL'`, `STRIPE_V` đặt `'VERTICAL'`. Thu mèo thường không đổi `axis`. Sọc cùng trục chỉ giữ nguyên, không cộng dồn.
4. **Xung đột:** khi sắp thu một mèo sọc, nếu `remaining > 1` **trước khi thu**, `axis ≠ 'FREE'` và trục của mèo khác `axis` thì thua ngay, `loseReason: 'stripe'`.
5. Cùng một nước, hố chạm cả `STRIPE_H` và `STRIPE_V` khi `remaining > 1`: thua xung đột.
6. Hố còn đúng 1: thu mèo cuối bất kể trục, hố biến mất, không xét xung đột.
7. **Stuck:** sau mỗi nước đi chưa kết thúc, tìm kiếm mọi chuỗi nước hợp lệ của tất cả hố (có xét strict, vật cản tạm thời có thể được hố khác dọn). Không còn chuỗi nào dẫn tới thắng thì thua ngay, `loseReason: 'stuck'`.
8. Làm lại màn đưa mọi hố về `'FREE'`.

## Board kiểm thử (fixture)
Màu đều `blue`. Đã chạy lại chuỗi "đúng" trên nguồn: cả 5 fixture đều `won`.

| ID | Mèo | Hố (cần) | Chuỗi đúng | Bài học |
|---|---|---|---|---|
| SC-01 | N(2,1), H(3,2), N(4,2) | (2,2)×3 | `0↑↓→→` | Nhận ngang quá sớm gây stuck |
| SC-02 | H(3,2), V(4,2), N(0,2), N(1,2), N(4,0) | (2,2)×3, (4,4)×2 | `0←←→→→`, `1↑↑↑↑` | Mỗi hố giữ một trục |
| SC-03 | H(3,2), H(4,2), N(0,2) | (2,2)×3 | `0→→←←←←` | Hai sọc cùng trục không cộng dồn |
| SC-04 | H(3,2), V(4,2) | (2,2)×2 | `0→→` | Mèo cuối hoàn thành hố, không xung đột |
| SC-05 | N(2,0), H(3,2), N(4,2) | (2,2)×3 | `0↑↑↓↓→→` | Ăn ngang trước gây STUCK |

(N = thường, H = sọc ngang, V = sọc dọc.)

Kịch bản sai dùng cho demo: SC-02, `0→→` → `lost`, `'stripe'` (hố ngang còn 2 mà ăn sọc dọc). Fixture mặc định của board chơi thử: SC-02.

## Tiêu chí đánh giá (từ `review.js`)
- **Case thua:** thua ngay khi ăn sọc đối trục lúc còn > 1; thua STUCK khi strict làm mất cách hoàn thành (thử SC-05 đi →).
- **Visual:** ký hiệu ↔ / ↕ / ○ trên hố cho trục hiện tại.

## Acceptance Criteria
- [ ] Vuốt sai trục bị chặn, không thua, không tăng `turn`.
- [ ] Xung đột chỉ xét khi `remaining > 1` trước khi thu.
- [ ] Stuck được phát hiện ngay ở nước gây ra nó (SC-05 đi `0→` thua ngay).
- [ ] 5 fixture và kịch bản sai trong spec cho đúng kết quả.

## Systems Index
Below systems-index tracking threshold — quick spec is sufficient.
