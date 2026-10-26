# Tiến trình: demo trên board giống level thật (feature `real-board`)

Cập nhật: 2026-10-27. Nhánh: `feature/RB-3` (chứa toàn bộ chuỗi `feature/lab-ui` → `RB-1` → `RB-2` → `RB-3`), chưa merge `main`.

## Mục tiêu
Lead: demo "GIF"/chơi thử phải chân thực như game thật, tham khảo cách Rollic dựng obstacle trong *30 Drop Away* (https://rollic.helpshift.com/hc/en/30-drop-away/faq/1043-what-are-the-obstacles/): dùng hố/mèo có sẵn của kit, số lượng khớp, hình hố đa dạng, không spam hố 2 ô ngang/dọc. Claude lên kế hoạch + review, agy (Antigravity CLI) làm qua orchestrator.

Luật chi tiết: `design/quick-specs/realistic-demo-board-2026-10-26.md`. Test nghiệm thu: `tests/demo-board.test.mjs`.

## Phát hiện từ level thật (`boards/*.json`)
- Bàn 7×8 / 8×9, 8–9 hố, mỗi hố một màu, tổng mèo = tổng sức chứa.
- **Sức chứa hố = số ô của hố** (I2 → 2, I3 → 3, L3 → 3, L4 → 4, chữ thập → 5).
- Ánh xạ `holeType` → hình suy ra từ vị trí mèo bị ăn trong lời giải (file `HoleShapes.json` gốc ở `D:/Xgame` không còn trên máy).
- Catalog repo: I2, I3, L3, L4, O4, T4, X5 (xoay/lật).

## Đợt 1 — mechanic 05–10 (XONG)
| Task | Nội dung | Kết quả | Commit |
|---|---|---|---|
| — | Quick spec + test nghiệm thu | | `22bc746` |
| RB-1 | Kit: `Stage.addHole(..., {cells})` vẽ hố đúng hình liền khối; `.hole-tag` trên ô đầu; viền chọn theo hình; board chơi thử dựng lại Stage khi đổi cỡ; `labPage` dùng `fixtures[slug].demo` | 1 vòng fix (hố phẳng, hố 1 ô bị đổi style) | `4aab3cc` |
| RB-2 | Board demo: magnet 7×8, fragile-floor 7×7, teleport-cat 7×7 | Đạt lần đầu | `800cc45` |
| RB-3 | Board demo: stripe-cat 7×8, alarm-zone 6×8, electric-link 8×7 | 2 vòng fix (lặp khuôn board; quên luật hố chồng hố) | `9b0f404` |
| — | Chú thích demo 6 trang khớp board mới | | `4184dde` |

Trạng thái: `node --test tests/*.test.mjs` 205/205. Fixture hướng dẫn cũ (`main`, `SC-0x`, `EL-0x`) và `default` giữ nguyên; board demo là key `demo` mới, cũng chọn được trong board chơi thử.

## Còn tồn của đợt 1
- Board teleport-cat còn khối nửa dưới (O4 vàng + T4 xanh lá) theo mẫu cũ.
- Hố O4 còn vạch chữ thập mờ giữa 4 ô.
- Chưa xem animation ở tốc độ thật và màn hình 375 px (app bị ẩn khi kiểm).
- Quy trình: `run-task.ps1 -Fix` resume phiên agy có lúc bị agy bỏ qua prompt mới (trả lại câu trả lời cũ) → vòng fix nên chạy phiên mới với prompt tự đủ ngữ cảnh.

## Đợt 2 — mechanic 01–04 (ĐANG LÊN KẾ HOẠCH, Lead đã duyệt hướng)
Hiện trạng: Mèo Ích Kỷ (`selfish-cat.html`, Stage riêng không dùng kit), Cây dại (`weed.html`), Mèo bệnh (`sick-cat.html`), Couple (`couple-cat.html`) dùng kit `demo()`/`playground()` kiểu nuốt nhóm `eat(x, y)`: hố hiện ra tại chỗ với hình chữ nhật bao của nhóm, board 5×5–6×6.

Hướng dự kiến:
- Kit `demo()`: hố đặt sẵn trên bàn với hình trong catalog (dùng `Stage.addHole(..., {cells})` của RB-1), kéo tới trùm nhóm mèo cùng màu thay vì hiện tại chỗ.
- Board demo mới cho 4 mechanic theo cùng luật đợt 1 (bàn 6–8 × 7–9, 4–7 hố, sức chứa = số ô, mèo khít, ≥ 3 hình).
- `selfish-cat.html` là file mẫu chuẩn đã duyệt → làm sau cùng, giữ kịch bản gameplay.
