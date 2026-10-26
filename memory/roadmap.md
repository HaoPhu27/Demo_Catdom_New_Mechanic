# Roadmap

- [x] Mèo Ích Kỷ: `selfish-cat.html` (file mẫu chuẩn)
- [x] Cây dại, Mèo bệnh, Couple Mèo: feature `mechanics`, nhánh `feature/MC-1`
- [x] Lead review 3 trang mới, đã merge `feature/MC-1` vào `main` (2026-10-23)
- [x] Trang demo tổng `index.html` (feature `landing`, nhánh `feature/LP-1`)
- [x] Lead review trang demo tổng, đã merge `feature/LP-1` vào `main` (2026-10-23)
- [ ] Playtest ngưỡng thua của Mèo bệnh (`loseRatio`), chốt giá trị
- [ ] (Đang dở, 2026-10-23) Board thật từ tool `D:/Xgame/Generate VIPPRO` + đặt mechanic mới: `tools/place-mechanics.mjs` + `tools/solvecli` (gọi IndependentSolver). Đã có `boards/selfish.json`, `couple.json`, `sick.json`. Còn thiếu: Cây Dại (solver trả NoNextCatReachable khi thêm plug hole + obstacle, đang gỡ lỗi), trang `boards.html` hiển thị/replay witness. Preset dùng: `PRESETS/VIS_BOARD.json`, `PRESETS/VIS_WEED.json` trong thư mục tool.
- [x] Hợp nhất Play Lab — Bước 0: Lead chốt 5 điểm (2026-10-26, xem decisions.md)
- [x] Hợp nhất Play Lab — Bước 1 (`feature/import-lab`): `reference/play-lab/` + 7 quick spec (luật nền + 6 mechanic)
- [x] Hợp nhất Play Lab — Bước 2 (`feature/move-contract`): hợp đồng mục 5, `boards/lab-fixtures.js`, 6 test nghiệm thu
- [x] Hợp nhất Play Lab — Bước 3 (feature `lab-logic`, nhánh cuối `feature/PL-6`): logic 6 mechanic do agy viết, 174/174 test
- [ ] Lead review + merge các nhánh Bước 1–3 vào `main`
- [ ] Hợp nhất Play Lab — Bước 4–7: xem `design/merge-play-lab-plan.md`
