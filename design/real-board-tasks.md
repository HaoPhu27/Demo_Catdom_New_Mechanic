# Danh sách task còn lại — feature `real-board` (2026-10-27)

Hai worker chạy song song, mỗi worker một thư mục làm việc (git worktree) để không đè nhau:

| Worker | Thư mục | Chuỗi nhánh | Loại việc |
|---|---|---|---|
| `agy` (Antigravity) | `D:/Cat Mechanic Demo Visualize` | `feature/RB-4` → `RB-5` → `RB-6` → `RB-7` | Dựng board/kịch bản demo (cần suy luận đường đi, luật mechanic) |
| `ccr` (claude-code-router → river DeepSeek-V4.1-Flash) | `D:/Cat Mechanic Demo Visualize - ccr` | tách từ `7dce4c1`: `feature/RB-8` → `RB-9` → `RB-10` | Việc nhỏ, phạm vi 1–2 file, có test/check rõ |

Chạy task cho ccr (trong thư mục ccr): `scripts/start-task.ps1 -TaskId RB-8` rồi `scripts/run-task.ps1 -TaskId RB-8 -Worker ccr`.
Cả hai worker đều KHÔNG chạy được shell: orchestrator luôn tự chạy checks và xem trên trình duyệt trước khi duyệt.
Gộp: khi Lead duyệt, merge chuỗi ccr vào chuỗi agy (file chung dễ đụng: `orchestrator.config.json` phần `checks`, `assets/catdom-kit.js`).

Lưu ý riêng cho ccr: model đổi dấu cách trong đường dẫn thành gạch ngang. Mọi prompt cho ccr mở đầu bằng khối "Đường dẫn workspace" (xem `tasks/RB-8/prompt.md`).

---

## RB-6 · Board demo thật cho Couple — agy — ĐANG CHẠY
- **File:** `boards/eat-fixtures.js` (thêm `fixtures.couple.demo`), `couple-cat.html`.
- **Spec:** `design/quick-specs/realistic-eat-board-2026-10-27.md`.
- **Board:** 7×8, 5 hố (L3, L4, I3, O4, T4), 1 cặp `n = 4` giữa nhóm L3 và nhóm T4, hai con cách nhau ≥ 5 ô.
- **Kịch bản:** good = L3 (kích hoạt) → I3 (còn 1) → T4 (an toàn) → L4 → O4 → thắng. bad = L3 → I3 → O4 → thua `couple`.
- **Nghiệm thu:** `node --test tests/eat-demo-board.test.mjs` 100%; `check-html couple-cat.html`; xem trình duyệt.

## RB-7 · Mèo Ích Kỷ trên board thật — agy — CHỜ SPEC
- **File:** `selfish-cat.html` (file mẫu chuẩn, Stage riêng không dùng kit), có thể thêm `fixtures.selfish.demo` vào `boards/eat-fixtures.js`.
- **Việc của orchestrator trước khi giao:** viết quick spec + test nghiệm thu cho phần board (board 7×8, hố đặt sẵn đúng hình, kéo theo `path`), quyết định có chuyển trang sang kit `demo()` hay giữ Stage riêng. Giữ nguyên kịch bản gameplay mà Lead đã duyệt (bộ đếm N, nuốt cùng lượt là an toàn, cào khi N = 0).
- **Phụ thuộc:** Lead xem RB-4…RB-6 trước (hướng "hố đặt sẵn + kéo" có đạt ý không).

## RB-8 · Bỏ vạch chữ thập trong hố nhiều ô — ccr
- **Vấn đề:** hố nhiều ô (đặc biệt O4, X5, T4) hiện vạch mờ ở chỗ hai ô cùng hố giáp nhau, vì mỗi `.hole-cell` có `box-shadow` viền riêng và các ô chồng lên nhau 3 px.
- **File:** `assets/catdom-kit.js` (`Stage.addHole`, `Stage.styleHole`), `assets/catdom-kit.css` nếu cần.
- **Yêu cầu:** viền tối chỉ vẽ ở cạnh NGOÀI của khối (cạnh không có ô cùng hố kề bên); bên trong khối liền màu, không vạch. Áp dụng cho hố thường và Special Hole. Hố 1 ô và hố không có `cells` giữ nguyên.
- **Nghiệm thu:** checks hiện có đều PASS; xem `weed.html`, `sick-cat.html`, `magnet.html`, `teleport-cat.html` trên trình duyệt: hố O4/T4/X5 liền khối, không vạch giữa ô.

## RB-9 · Board teleport-cat bỏ khuôn nửa dưới cũ — ccr
- **Vấn đề:** board demo `teleport-cat` (`boards/lab-fixtures.js`, key `demo`) có nửa dưới lặp khuôn của board khác: hố vàng O4 góc trái dưới + nhóm vàng O4 + nhóm xanh lá T4 sát đáy.
- **File:** `boards/lab-fixtures.js` (chỉ `fixtures['teleport-cat'].list.demo`).
- **Yêu cầu:** đổi bố cục nửa dưới (vị trí/hình hố vàng và xanh lá, vị trí nhóm mèo) cho khác các board demo khác, vẫn đúng luật đợt 1 (`design/quick-specs/realistic-demo-board-2026-10-26.md`). Giữ nguyên phần trên và khoảnh khắc chữ ký `teleport`. Cập nhật `good`, `bad`, `hint` cho khớp.
- **Nghiệm thu:** `node --test tests/teleport-cat.test.mjs tests/demo-board.test.mjs` PASS; xem `teleport-cat.html`.

## RB-10 · Tôn trọng `prefers-reduced-motion` — ccr
- **File:** `assets/catdom-kit.js` (`demo`, `moveDemo`), `assets/catdom-kit.css`.
- **Yêu cầu:** khi `matchMedia('(prefers-reduced-motion: reduce)')` khớp: demo không tự chạy và không tự lặp; hiện board đầu màn + câu intro + nút "▶ Xem demo" chạy 1 lần; tắt rung màn hình (`shakeTl`) và nhấp nháy (`flashTl`). Không khớp thì giữ y như cũ.
- **Nghiệm thu:** checks PASS; orchestrator kiểm trên trình duyệt bằng cách giả lập `matchMedia`.
- **Phụ thuộc:** sau RB-8 (cùng file kit, cùng chuỗi ccr).

## Ngoài code (orchestrator / Lead)
- QA tay: màn hình 375 px, tốc độ animation thật, bàn phím (Bước 7 của `design/merge-play-lab-plan.md`).
- Playtest: `loseRatio` Mèo bệnh, case SC-05 Mèo sọc, điều kiện thua Liên kết điện.
- Lead review cả chuỗi rồi merge `main`.
