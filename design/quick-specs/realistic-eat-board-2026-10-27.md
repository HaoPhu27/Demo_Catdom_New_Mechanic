# Quick Design Spec: Board demo thực tế (mechanic 01–04, kiểu nuốt nhóm)

**Type**: Nội dung demo (fixture) + kit `demo()` kéo hố đặt sẵn
**Scope**: Đợt 2 của feature `real-board`. Hai demo sai/đúng của Cây dại, Mèo bệnh, Couple chạy trên board giống level thật: hố đặt sẵn trên bàn với hình trong catalog, được KÉO theo đường đi tới trùm nhóm mèo cùng màu. Không đổi logic (`logic/weed.js`, `sick.js`, `couple.js`), không đổi playground. Mèo Ích Kỷ (`selfish-cat.html`, file mẫu chuẩn) làm sau, task riêng.
**Date**: 2026-10-27
**Nguồn**: `design/quick-specs/realistic-demo-board-2026-10-26.md` (đợt 1, cùng luật board), `design/real-board-progress.md`.

## Vì sao
Demo hiện tại của 01–04: board 5×5, hố HIỆN RA tại chỗ với hình chữ nhật bao của nhóm rồi trượt 1 ô. Game thật: hố có sẵn trên bàn ngay từ đầu, mỗi hố một hình (I3, L3, L4, O4, T4, X5…), sức chứa bằng số ô; người chơi kéo hố qua ô trống tới dưới nhóm mèo cùng màu.

## Core Rules
1. **Fixture chung** `boards/eat-fixtures.js` (UMD giống `boards/lab-fixtures.js`; trình duyệt: `window.CatDomEatFixtures`, Node: `module.exports`), dạng `{ fixtures: { weed: { demo }, sick: { demo }, couple: { demo } } }`.
2. `demo = { level, holes, intro, good, bad }`:
   - `level`: level của logic tương ứng, đúng `docs/logic-contract.md` mục 4 (không thêm khoá lạ vào `level`).
   - `holes`: `[{ id, color, x, y, shape, special? }]`. `shape` là mảng ô `[dx, dy]` thuộc catalog (xoay/lật được), `(x, y)` là gốc. Sức chứa = `shape.length`, không ghi riêng.
   - `intro`: câu chú thích lúc mở màn. Mỗi bước có `say`.
   - Bước ăn: `{ eat: [x, y], hole: '<id>', path: [[x, y], ...], say }`. Bước nhặt thuốc sâu (Cây dại): `{ pick: true, hole: '<id special>', path, say }`.
3. **Kéo hố:** `path` là các vị trí gốc liên tiếp, mỗi bước lệch đúng 1 ô ngang/dọc, bắt đầu kề vị trí hiện tại của hố. Ở mọi vị trí trên đường đi, mọi ô của hố: trong bàn, ngoài khu vực cây dại, không trùng hố khác còn trên bàn, không trùng box, không trùng thuốc sâu (trừ Special Hole khi nhặt), không trùng mèo — trừ mèo thuộc nhóm đang ăn ở bước đó.
4. **Ăn:** vị trí cuối của `path` trùm đủ mọi mèo của nhóm `groupAt(eat)` (với box: trùm ô box). Hố cùng màu nhóm, sức chứa còn lại ≥ số mèo nhóm. Ăn xong trừ sức chứa; về 0 thì hố biến mất (ô của nó trống ra).
5. **Special Hole (Cây dại):** đúng 1 hố `special: true`, có hình trong catalog. Chưa nhặt thuốc sâu thì không ăn được; bước `pick` dừng ở vị trí trùm ô thuốc sâu. Nhặt xong nó thành hố thường, ăn nhóm cùng màu của nó. Mechanic khác không có Special Hole.
6. **Board giống level thật** (như đợt 1): `cols` 6–8, `rows` 7–9; 4–7 hố; ≥ 3 loại hình, ≥ 2 hố không thẳng, hố I2 ≤ 1/3; ≥ min(4, số hố) màu; mỗi màu: số mèo (cả mèo trong box) = tổng sức chứa các hố màu đó; tổng mèo ≥ 30% số ô.
7. **Kịch bản:** `good` ≤ 14 bước, thắng, chứa khoảnh khắc chữ ký — Cây dại: `weedGrow`, `pick`, `weedClear`; Mèo bệnh: `infect`; Couple: `coupleTrigger` và `coupleSafe`. `bad` 2–6 bước, bước đầu trùng `good`, thua đúng lý do (`weed` / `sick` / `couple`), bước cuối là bước thua.
8. **Kit `demo(cfg)`:** khi `cfg.holes` có mặt:
   - `build` vẽ sẵn mọi hố bằng `Stage.addHole(id, color, x, y, w, h, {cells})` (RB-1) kèm số sức chứa, Special Hole có kiểu riêng như hiện tại.
   - Bước `eat`: bàn tay kéo hố theo từng ô của `path`, hố nuốt nhóm, số sức chứa giảm; về 0 thì hố thu nhỏ biến mất. Không còn tạo hố mới tại chỗ.
   - Bước `pick`: kéo Special Hole theo `path` rồi chạy event `pick`/`weedClear` như hiện tại.
   - Không có `cfg.holes` thì giữ nguyên hành vi cũ.
9. **Trang:** hai demo ở `weed.html`, `sick-cat.html`, `couple-cat.html` lấy `level`, `holes`, `intro`, `good`/`bad` từ fixture. Board chơi thử và phần còn lại của trang giữ nguyên. `main > .demos` và `main > .card.play` vẫn là con trực tiếp của `<main>`.

## Mèo Ích Kỷ (RB-7)
`selfish-cat.html` là file mẫu chuẩn, không dùng kit và không có module logic. RB-7 giữ nguyên toàn bộ phần vẽ (Stage riêng, mèo khoanh tay, badge đếm, cào, banner), trạng thái visual và playground; chỉ thay board demo:
- `fixtures.selfish.demo = { level, holes, intro, good, bad }` trong `boards/eat-fixtures.js`. `level = { cols, rows, cats:[{id,color,x,y,selfish?}], selfishCount }`: đúng 1 mèo `selfish: true`, `selfishCount` 3–8.
- Luật đếm (test tự mô phỏng theo `docs/business-rules.md`): lượt nuốt không có Mèo Ích Kỷ trừ N đúng bằng số mèo; N ≤ 0 khi nó còn trên bàn thì thua `selfish`; lượt có nó (kể cả cùng mèo khác) thì an toàn, hết đếm. Event chữ ký: `selfishCount`, `selfishSafe`.
- Trang đọc fixture: kích thước Stage theo `level`, vẽ hố đúng hình (ô liền khối, viền chỉ ở cạnh ngoài), mỗi bước kéo hố theo `path` rồi nuốt nhóm `groupAt(eat)` (nhóm cùng màu nối 4 hướng).

## Catalog hình hố
Giống đợt 1: I2, I3, L3, L4, O4, T4, X5 (xoay/lật). Xem `design/quick-specs/realistic-demo-board-2026-10-26.md`.

## Acceptance Criteria
- [ ] `node --test tests/eat-demo-board.test.mjs` đạt (cả 4 mechanic sau RB-7).
- [ ] Test cũ (`tests/*.test.mjs`) vẫn đạt.
- [ ] `node tools/check-html.mjs <trang>` đạt cho `weed.html`, `sick-cat.html`, `couple-cat.html`.
- [ ] Mở trang qua `node tools/serve.mjs`: demo sai/đúng chạy hết kịch bản, hố đúng hình đi qua ô trống, không lỗi console.

## Kế hoạch task
| Task | Nội dung |
|---|---|
| RB-4 | Kit `demo()` kéo hố đặt sẵn + `boards/eat-fixtures.js` (board Cây dại) + `weed.html` dùng fixture |
| RB-5 | Board Mèo bệnh trong fixture, `sick-cat.html` dùng fixture |
| RB-6 | Board Couple trong fixture, `couple-cat.html` dùng fixture |
| RB-7 | Mèo Ích Kỷ (`selfish-cat.html`), sau khi Lead duyệt RB-4…RB-6 |

Mỗi task tối đa 2 file chính (bài học RB-4: prompt lớn làm agy chạm giới hạn 15 phút).
