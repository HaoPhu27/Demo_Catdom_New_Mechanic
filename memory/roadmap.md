# Roadmap

- [x] Mèo Ích Kỷ: `selfish-cat.html` (file mẫu chuẩn)
- [x] Cây dại, Mèo bệnh, Couple Mèo: feature `mechanics`, nhánh `feature/MC-1`
- [x] Lead review 3 trang mới, đã merge `feature/MC-1` vào `main` (2026-10-23)
- [x] Trang demo tổng `index.html` (feature `landing`, nhánh `feature/LP-1`)
- [x] Lead review trang demo tổng, đã merge `feature/LP-1` vào `main` (2026-10-23)
- [ ] Playtest ngưỡng thua của Mèo bệnh (`loseRatio`), chốt giá trị
- [ ] (Đang dở, 2026-10-23) Board thật từ tool `D:/Xgame/Generate VIPPRO` + đặt mechanic mới: `tools/place-mechanics.mjs` + `tools/solvecli` (gọi IndependentSolver). Đã có `boards/selfish.json`, `couple.json`, `sick.json`. Còn thiếu: Cây Dại (solver trả NoNextCatReachable khi thêm plug hole + obstacle, đang gỡ lỗi), trang `boards.html` hiển thị/replay witness. Preset dùng: `PRESETS/VIS_BOARD.json`, `PRESETS/VIS_WEED.json` trong thư mục tool.
