# Tiêu chí đánh giá 10 mechanic (bản chi tiết, 2026-10-27)

Nguồn: luật chốt trong `design/quick-specs/*`, `docs/business-rules.md` (Mèo Ích Kỷ) và board demo thật hiện tại (`boards/eat-fixtures.js` cho 01–04, `boards/lab-fixtures.js` key `demo` cho 05–10). Mọi con số dưới đây lấy từ board demo đang chạy trên trang.

Bốn câu hỏi của Lead, áp dụng cho từng mechanic:
1. **Có dễ hiểu không?** Người chơi hiểu sau mấy thao tác, nhìn vào đâu để hiểu, chỗ nào dễ hiểu sai.
2. **Có case stuck / thua màn không?** Kiểu kết thúc (thua ngay / stuck / chỉ bị chặn), điều kiện chính xác, ví dụ trên board demo, cách an toàn, có cảnh báo trước không.
3. **Visual có dễ demo không?** Thành phần nhìn thấy, các trạng thái, rủi ro đọc nhầm.
4. **Tạo được feeling khác không?** Ưu tiên clear sớm hay để dành, cách chơi thay đổi ra sao, tần suất xuất hiện trong map (màn giới thiệu / thường / khó), rủi ro cần playtest.

Thang "Dễ hiểu": **Dễ** = hiểu ngay sau 1 thao tác · **Vừa** = 2 thao tác hoặc cần thấy 1 lần thua · **Khó** = cần ≥ 3 thao tác hoặc có luật ẩn.

## Bảng so sánh nhanh

| # | Mechanic | Dễ hiểu | Kiểu thua | Ưu tiên hay để dành | Số lượng / màn |
|---|---|---|---|---|---|
| 01 | Mèo Ích Kỷ | Dễ (1–2 thao tác) | Thua ngay khi N về 0 | **Ưu tiên** clear nó sớm | 1 (tối đa 2) |
| 02 | Cây Dại | Vừa (2 thao tác) | Thua ngay khi cây phủ kín | **Ưu tiên** nhặt thuốc sâu | 1 khu vực |
| 03 | Mèo Bệnh | Vừa–Khó | Thua ngay khi bệnh ≥ 50% còn lại | **Ưu tiên** dập ổ | 1 ổ |
| 04 | Couple Mèo | Vừa (2 thao tác) | Thua ngay khi đếm về 0 | **Để dành** con đầu, ăn liên tiếp | 1 (tối đa 2 cặp) |
| 05 | Mèo Nam Châm | Vừa (thấy 1 lần sai) | Stuck ngay khi hút mất mèo cần | **Để dành** nam châm | 1–2 |
| 06 | Sàn Dễ Vỡ | Vừa–Khó | Stuck khi mèo không còn tới được | **Để dành** lượt qua cầu | 1 cầu 2–3 ô |
| 07 | Mèo Sọc | Khó (≥ 3 thao tác) | Thua ngay khi xung đột trục; stuck | **Để dành** sọc đối trục làm mèo cuối | 1–2 sọc |
| 08 | Vùng Báo Động | Vừa (2 thao tác) | Thua ngay khi nhả công tắc lúc vùng còn hố | **Để dành** hố giữ công tắc | 1 công tắc + 1 hành lang |
| 09 | Mèo Dịch Chuyển | Vừa (1 thao tác + 1 lần sai) | Stuck ngay khi đẩy mèo vào chỗ kẹt | **Để dành** mèo mũi tên | 1–2 |
| 10 | Liên Kết Điện | Khó (≥ 3 thao tác) | Thua ngay khi bật điện trúng mèo/hố | **Ưu tiên** dọn đoạn nối | 1 cặp công tắc |

---

## 01 · Mèo Ích Kỷ (`selfish-cat.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi bộ đếm N về 0`

### 01 Dễ hiểu
- **Kết luận:** Dễ — hiểu sau 1–2 thao tác.
- Số N hiện trên đầu ngay từ đầu màn và giảm ngay lượt đầu: demo nuốt 3 mèo cam, N 5 → 2.
- Cảm xúc leo thang báo trước: khó chịu (≥ 3) → badge cam, nổi gân (2) → badge đỏ nhấp nháy, rung (1).
- Dễ hiểu sai: tưởng N là số **lượt**. Thật ra N trừ theo **số mèo** (một lượt nuốt 3 con trừ 3).
- **Hỏi người chơi:** "Nuốt nhóm này thì N còn mấy?" · "Hố tím cần mấy bước để tới Mèo Ích Kỷ?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay (không có stuck).
- **Điều kiện:** sau mỗi lượt nuốt không có Mèo Ích Kỷ, N trừ đúng số mèo bị nuốt; N ≤ 0 khi nó còn trên bàn → nó cào, thua.
- **Trên board demo:** bước 1 nuốt 3 mèo cam (N = 2); bước 2 nuốt 3 mèo xanh dương thay vì cứu nó → N = −1 → BỊ CÀO.
- **An toàn:** nuốt nó trong một lượt bất kỳ khi N ≥ 1, kể cả cùng lượt với mèo khác; từ đó hết đếm.
- **Luật thiết kế màn:** phải có lời giải đưa hố cùng màu tới nó sau ≤ N − 1 mèo khác.

### 03 Visual
- **Kết luận:** Rất dễ demo — 1 con mèo, 1 con số, cảm xúc rõ.
- Badge số, mặt mèo đổi theo N, bong bóng "Tớ trước! Trong 5 con!", cào + rung + banner khi thua, mặt hài lòng khi được cứu.
- **Rủi ro:** N lớn (≥ 7) gần như không căng; nhóm 1 con không cho thấy "trừ theo số mèo" → demo nên dùng nhóm 3–4 con.

### 04 Feeling
- **Ưu tiên hay để dành:** **Ưu tiên** — dọn đường cho hố cùng màu tới nó trước mọi thứ.
- **Cách chơi đổi:** khi buộc phải nuốt mèo khác, chọn nhóm nhỏ để "tiết kiệm" N; tránh hố lớn (4–5 ô) đầu màn.
- **Tần suất trong map:** giới thiệu 1 con, N = số mèo cần dọn tối thiểu + 2; màn thường 1 con, N vừa đủ + 1; màn khó 2 con khác màu. Không quá 2 con/màn.
- **Rủi ro cần playtest:** N quá chặt khiến màn chỉ còn đúng 1 thứ tự giải; ghép với Couple trong cùng màn tạo 2 bộ đếm khó theo dõi.

---

## 02 · Cây Dại (`weed.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi cây dại phủ kín khu vực`

### 01 Dễ hiểu
- **Kết luận:** Vừa — hiểu sau 2 thao tác.
- Thao tác 1: nuốt 3 mèo cam → 3 ô cây mọc (1/6 → 4/6). Người chơi thấy ngay "mỗi mèo lọt hố = 1 ô cây".
- Thao tác 2: kéo Special Hole tới lọ thuốc sâu → cây bị diệt sạch.
- Dễ hiểu sai: Special Hole **không nuốt mèo** cho tới khi nhặt thuốc sâu; nhặt xong nó mới thành hố thường.
- **Hỏi người chơi:** "Còn mấy mèo nữa là kín?" · "Hố nào nhặt được thuốc sâu?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay (không có stuck).
- **Điều kiện:** số ô cây = diện tích khu vực (w × h) → thua, kể cả giữa một lượt nuốt nhóm lớn.
- **Trên board demo:** khu vực 3×2 = 6 ô, sẵn 1 ô → còn được 5 mèo. Bước 1 nuốt 3 cam (4/6); bước 2 nuốt 4 xanh lá thay vì đi nhặt thuốc → kín 6/6 → THUA.
- **An toàn:** nhặt thuốc sâu trước khi tổng mèo đã nuốt đạt diện tích − số ô ban đầu; nhặt xong cây xoá sạch và không mọc lại.
- **Cảnh báo trước:** viền khu vực chuyển cam khi còn ≤ 2 ô trống, đỏ khi kín.
- Khu vực cây dại là vùng hố không đi vào được: board phải được kiểm tra vẫn giải được khi vùng này bị chặn.

### 03 Visual
- **Kết luận:** Dễ demo.
- Viền nét đứt + nhãn đếm 🌿 x/6; cây mọc từng ô có animation; lọ thuốc sâu là vật riêng; Special Hole viền vàng phát sáng + ổ hình mèo, đổi về hố thường sau khi nhặt; hiệu ứng diệt sạch.
- **Rủi ro:** Special Hole cùng màu với nhóm mèo của nó có thể bị nhìn như hố thường; thứ tự mọc (hàng trên trước, cột trái trước) khó đoán nhưng không đổi kết quả thắng/thua.

### 04 Feeling
- **Ưu tiên hay để dành:** **Ưu tiên** chen một lượt "không nuốt mèo" để nhặt thuốc sâu sớm.
- **Cách chơi đổi:** trước khi nhặt thuốc, chọn nhóm nhỏ; dọn đường cho Special Hole trước khi dọn bàn.
- **Tần suất trong map:** 1 khu vực/màn. Giới thiệu: diện tích 6, sẵn 1 ô, thuốc sâu cách Special Hole 1–2 bước. Màn thường: đường tới thuốc bị mèo chặn. Màn khó: diện tích 4 hoặc sẵn 2–3 ô. Khu vực chiếm chỗ trên map — tránh đặt giữa vùng dày mèo.
- **Rủi ro cần playtest:** diện tích quá nhỏ so với số mèo phải dọn để mở đường tới thuốc làm màn không giải được (cần certify bằng solver).

---

## 03 · Mèo Bệnh (`sick-cat.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi mèo bệnh ≥ 50% số mèo còn lại`

### 01 Dễ hiểu
- **Kết luận:** Vừa–Khó — hiểu "ăn mèo khoẻ thì lây" sau 1 thao tác, hiểu ngưỡng thua sau khi thấy 1 lần thua.
- Thao tác 1: nuốt 3 mèo cam khoẻ → 3 chấm xanh bay sang 3 mèo gần ổ nhất (HUD 4/15).
- Dễ hiểu sai: (a) mục tiêu lây là mèo khoẻ gần ổ nhất theo ô ngang + dọc, hoà thì hàng trên trước, cột trái trước; (b) ngưỡng 50% tính trên số mèo **còn lại** (cả mèo trong box), không phải tổng ban đầu.
- **Hỏi người chơi:** "Ăn nhóm này có mấy ca lây?" · "Con nào bị lây tiếp theo?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay (không có stuck).
- **Điều kiện:** sau mỗi lượt, mèo bệnh ≥ 50% × số mèo còn lại → ĐẠI DỊCH.
- **Trên board demo:** bước 1 nuốt 3 mèo khoẻ → cả ổ vàng 4 con bệnh (4/15); bước 2 nuốt 4 mèo xanh lá thay vì dập ổ → 4 ca lây → 8/11 → THUA.
- **An toàn:** cho nhóm có mèo bệnh lọt hố (mèo bệnh bị nuốt không gây lây) → hết ổ, các lượt sau không lây nữa. Mèo trong box không bao giờ bị lây.
- **Cảnh báo trước:** HUD 🤒 x/y luôn hiện; chưa có cảnh báo màu khi gần ngưỡng (đề xuất thêm).
- Vì mẫu số giảm dần, cuối màn càng dễ chạm ngưỡng.

### 03 Visual
- **Kết luận:** Dễ demo.
- Mèo bệnh đổi màu xanh bệnh + 🦠; chấm lây bay từ nguồn tới đích; HUD đếm bệnh/còn lại; banner ĐẠI DỊCH.
- **Rủi ro:** nhiều ca lây trong một lượt diễn ra liên tiếp, khó theo; ổ lớn cùng màu khó phân biệt con nào bệnh nếu không có 🦠.

### 04 Feeling
- **Ưu tiên hay để dành:** **Ưu tiên** dập ổ; **để dành** mèo trong box (an toàn) cho cuối màn.
- **Cách chơi đổi:** tránh nuốt nhóm khoẻ lớn khi ổ còn sống; cân nhắc "ăn nhóm khoẻ nhỏ để mở đường cho hố cùng màu ổ bệnh" hay "đi vòng".
- **Tần suất trong map:** 1 ổ/màn. Giới thiệu: ổ trong nhóm cô lập, hố cùng màu sát bên. Màn thường: ổ giữa vùng đông mèo. Màn khó: hố cùng màu ổ ở xa, ít box.
- **Rủi ro cần playtest:** ngưỡng 50% (Lead chưa chốt); luôn chỉ định `initialSick` trong level, không để ngẫu nhiên.

---

## 04 · Couple Mèo (`couple-cat.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi đếm ngược của cặp về 0`

### 01 Dễ hiểu
- **Kết luận:** Vừa — hiểu sau 2 thao tác.
- Thao tác 1: nuốt nhóm cam có 1 con của cặp → con vàng bắt đầu đếm 4. Thao tác 2: nuốt 3 mèo tím → còn 1.
- Dễ hiểu sai: lượt kích hoạt **không** bị trừ; đếm trừ theo **số mèo**, không theo lượt.
- **Hỏi người chơi:** "Ăn con này thì con kia còn mấy?" · "Hố cùng màu con kia đã tới được chưa?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay (không có stuck).
- **Điều kiện:** đếm ≤ 0 khi con còn lại chưa lọt hố → CHIA TAY.
- **Trên board demo:** cặp cách nhau 11 ô (góc trên trái – góc dưới phải), N = 4. Bước 3 nuốt 4 mèo xanh dương khi còn 1 → −3 → THUA.
- **An toàn:** nuốt cả hai trong cùng một lượt (không đếm), hoặc nuốt con thứ hai khi đếm ≥ 1.
- **Cảnh báo trước:** số đếm trên con chờ, mặt buồn dần khi gần 0.

### 03 Visual
- **Kết luận:** Dễ demo.
- Mũi tên 💘 cùng màu đánh dấu + đường chấm nối hai con, tim bay khi kích hoạt, 💔 + cào khi thua.
- **Rủi ro:** 2 cặp cùng đếm khó theo dõi; đường nối dài chéo bàn bị hố che khi hố đi ngang.

### 04 Feeling
- **Ưu tiên hay để dành:** **Để dành** — không vội ăn con đầu; dọn đường cho cả hai rồi ăn liên tiếp.
- **Cách chơi đổi:** lên kế hoạch theo cặp; sau khi kích hoạt, chỉ chọn nhóm nhỏ cho tới khi cứu được con còn lại.
- **Tần suất trong map:** giới thiệu 1 cặp gần nhau, N = 4; màn thường 1 cặp chéo bàn; màn khó 2 cặp N khác nhau. Không quá 2 cặp/màn.
- **Rủi ro cần playtest:** ghép cùng Mèo Ích Kỷ trong một màn (2 bộ đếm) — tránh ở màn sớm.

---

## 05 · Mèo Nam Châm (`magnet.html`)
**summary:** `📋 Tiêu chí đánh giá · Stuck khi nam châm hút mất mèo hố khác cần`

### 01 Dễ hiểu
- **Kết luận:** Vừa — hiểu sau khi thấy 1 lần ăn sai.
- Ăn nam châm → vùng 3×3 sáng lên, mèo khác màu trong 8 ô quanh nó bị hút mất; hố hồng còn dư số → biết ngay thiếu mèo.
- Dễ hiểu sai: mèo bị hút **không** tính là được thu, không giảm số của hố nào.
- **Hỏi người chơi:** "Ăn nam châm bây giờ thì hố nào thiếu mèo?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Stuck ngay (thua ngay sau khi hút, không chờ hết nước).
- **Điều kiện:** sau khi hút, có hố mà số còn cần > số mèo cùng màu còn trên board → STUCK.
- **Trên board demo:** demo sai (6 nước): hố vàng ăn nam châm khi cụm hồng còn kề bên → 3 mèo hồng bị hút → hố hồng không bao giờ đủ.
- **An toàn:** thu hết mèo trong 8 ô quanh nam châm bằng hố đúng màu trước; vùng trống thì ăn nam châm không mất gì.

### 03 Visual
- **Kết luận:** Dễ demo.
- Badge 🧲 trên mèo nam châm, vùng 3×3 viền vàng nét đứt, sóng hút + mèo bay vào; hố còn dư số cho thấy chỗ thiếu.
- **Rủi ro:** hai vùng hút chồng nhau làm người xem khó chỉ đúng ô bị ảnh hưởng.

### 04 Feeling
- **Ưu tiên hay để dành:** **Để dành** nam châm tới khi vùng hút trống.
- **Cách chơi đổi:** thứ tự thu đảo ngược — dọn xung quanh trước, "phần thưởng" (nam châm) sau.
- **Tần suất trong map:** giới thiệu 1 nam châm, 2–3 mèo lân cận; màn thường 1–2 vùng hút tách nhau; màn khó 2 vùng giao nhau.
- **Rủi ro cần playtest:** vùng giao nhau làm thứ tự giải khó đọc.

---

## 06 · Sàn Dễ Vỡ (`fragile-floor.html`)
**summary:** `📋 Tiêu chí đánh giá · Stuck khi cầu sụp cắt đường`

### 01 Dễ hiểu
- **Kết luận:** Vừa–Khó — hiểu sau 2–3 thao tác.
- Số độ bền trên ô cầu giảm mỗi lần hố **bước vào** ô đó; đứng yên hay di chuyển mà ô vẫn nằm trong hố thì không giảm.
- Dễ hiểu sai: hố nhiều ô bước vào nhiều ô sàn cùng lúc → nhiều ô cùng giảm.
- **Hỏi người chơi:** "Ô cầu này còn chịu được mấy lần?" · "Còn hố nào cần qua cầu?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Stuck (sàn sụp tự nó không thua).
- **Điều kiện:** sau mỗi nước, có mèo mà không hố cùng màu nào còn tới được (tính tường, mép board, sàn đã sụp) → STUCK.
- **Trên board demo:** demo sai (3 nước): hố xanh bước lên cầu, lùi lại, quay lại → cầu sụp, nửa dưới bị cắt.
- **An toàn:** mỗi hố qua cầu đúng số lần cần, không bước lãng phí; hố đang đứng trên ô vừa sụp vẫn đi ra được.

### 03 Visual
- **Kết luận:** Dễ demo.
- Số độ bền trên ô, ô nứt dần, ô sụp tối hẳn; hố bị chặn rung khi định đi vào ô sụp.
- **Rủi ro:** người xem không thấy ô nào bị trừ khi hố lớn đi qua nhiều ô sàn một lúc.

### 04 Feeling
- **Ưu tiên hay để dành:** **Để dành** lượt qua cầu — tính trước đường đi, cho hố cần qua cầu đi trước khi cầu yếu.
- **Cách chơi đổi:** chơi như bài toán đường đi; mỗi bước thừa có giá.
- **Tần suất trong map:** giới thiệu 1 cầu 2–3 ô độ bền 2; màn thường cầu chia đôi map; màn khó độ bền 1 hoặc 2 cầu.
- **Rủi ro cần playtest:** người chơi lỡ bước thừa không nhận ra cho tới khi STUCK.

---

## 07 · Mèo Sọc (`stripe-cat.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi xung đột trục hoặc STUCK`

### 01 Dễ hiểu
- **Kết luận:** Khó — cần ≥ 3 thao tác, có 2 luật.
- Luật 1 (khoá trục): ăn sọc ngang → hố chỉ đi trái/phải; sọc dọc → chỉ lên/xuống. Đi sai hướng bị **chặn**, không thua.
- Luật 2 (xung đột): ăn sọc khác trục khi hố còn cần > 1 mèo → thua.
- Ký hiệu trên hố: ○ tự do, ↔ ngang, ↕ dọc.
- **Hỏi người chơi:** "Hố này đang khoá trục nào?" · "Còn mấy mèo thì ăn được sọc đối trục?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** 2 kiểu — thua ngay khi xung đột; STUCK khi không còn chuỗi nước nào thắng được (máy tự kiểm mọi đường).
- **Trên board demo:** demo sai (5 nước): hố xanh ăn sọc ngang rồi rẽ trái ăn ngay sọc dọc khi còn cần 2 → XUNG ĐỘT.
- **An toàn:** để sọc đối trục là mèo cuối của hố (còn đúng 1 thì ăn bất kể trục). Hai sọc cùng trục không cộng dồn.
- Vuốt sai trục chỉ bị chặn (hố rung), không mất lượt.

### 03 Visual
- **Kết luận:** Vừa — cần chú thích.
- Badge ↔ / ↕ trên mèo, ký hiệu trục trên hố, rung khi bị chặn.
- **Rủi ro:** người chơi tưởng "bị chặn" là lỗi game; STUCK do máy phát hiện sớm (thua dù vẫn còn đi được) cần câu giải thích rõ.

### 04 Feeling
- **Ưu tiên hay để dành:** **Để dành** sọc đối trục làm mèo cuối; **ưu tiên** chia sọc cho đúng hố.
- **Cách chơi đổi:** mỗi hố có "hướng sống"; người chơi xếp thứ tự ăn theo trục.
- **Tần suất trong map:** giới thiệu 1 sọc + 1 hố; màn thường 2 sọc 2 hố; màn khó 2 trục cùng màu (kiểu SC-02).
- **Rủi ro cần playtest:** case strict SC-05 (STUCK sớm) có thể bị cảm nhận là bất công.

---

## 08 · Vùng Báo Động (`alarm-zone.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi báo động bật lúc vùng còn hố`

### 01 Dễ hiểu
- **Kết luận:** Vừa — hiểu sau 2 thao tác.
- Hố đứng lên công tắc S → vùng đỏ tắt → hố khác đi qua hành lang.
- Dễ hiểu sai: hố giữ S hoàn thành và biến mất thì S **tự nhả**; thua cả khi hố trong vùng đứng yên.
- **Hỏi người chơi:** "Nếu hố này rời S bây giờ, còn hố nào trong vùng đỏ không?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay.
- **Điều kiện:** báo động bật (không hố nào đứng trên S) mà có bất kỳ hố nào có ô trong vùng → thua; kiểm sau khi hố đi và lần nữa sau khi thu mèo.
- **Trên board demo:** demo sai (7 nước): hố xanh giữ S cho hố hồng vào hành lang rồi nhả S khi hồng còn trong vùng → BÁO ĐỘNG.
- **An toàn:** giữ S tới khi hố trong vùng ra hẳn hoặc hoàn thành; hố giữ S đừng ăn mèo cuối khi còn hố trong vùng.

### 03 Visual
- **Kết luận:** Dễ demo.
- Vùng đỏ sáng khi báo động bật, tắt khi có hố giữ S; công tắc S đổi trạng thái.
- **Rủi ro:** luật "hoàn thành thì tự nhả S" là bẫy ngầm, cần nói rõ trong demo.

### 04 Feeling
- **Ưu tiên hay để dành:** **Để dành** hố giữ công tắc (đừng hoàn thành nó sớm).
- **Cách chơi đổi:** phối hợp 2 hố; thứ tự "giữ – đi qua – nhả".
- **Tần suất trong map:** 1 công tắc + 1 hành lang; màn khó: hố giữ S cũng phải đi qua vùng, hoặc 2 công tắc.
- **Rủi ro cần playtest:** người chơi quên hố đứng yên trong vùng vẫn làm thua.

---

## 09 · Mèo Dịch Chuyển (`teleport-cat.html`)
**summary:** `📋 Tiêu chí đánh giá · Stuck khi mèo bị đẩy vào chỗ hố không tới`

### 01 Dễ hiểu
- **Kết luận:** Vừa — hiểu sau 1 thao tác + 1 lần thấy kẹt.
- Ăn mèo mũi tên → mọi mèo cùng màu còn trên board trượt 1 ô theo mũi tên, cùng lúc.
- Dễ hiểu sai: mèo bị chặn (mép, tường, mèo khác, hố) thì **đứng yên**, không thua.
- **Hỏi người chơi:** "Ăn mèo mũi tên bây giờ thì mèo xanh còn lại đi đâu? Hố còn tới được chỗ đó không?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Stuck ngay sau nước đi.
- **Điều kiện:** có mèo mà không hố cùng màu nào tới được (tính cả hình dạng hố) → STUCK.
- **Trên board demo:** demo sai (4 nước): hố xanh ăn mèo mũi tên trước → mèo xanh thường bị đẩy vào hốc giữa hai tường, hố cao 2 ô không lọt.
- **An toàn:** thu mèo thường cùng màu trước, ăn mèo mũi tên sau cùng.

### 03 Visual
- **Kết luận:** Dễ demo.
- Badge mũi tên → ↑ ↓ ← trên mèo, animation trượt đồng thời, mèo bị chặn rung tại chỗ.
- **Rủi ro:** nhóm lớn trượt cùng lúc khó đoán vị trí mới.

### 04 Feeling
- **Ưu tiên hay để dành:** thường **để dành** mèo mũi tên; có lúc **dùng chủ đích** để kéo mèo xa lại gần hố.
- **Cách chơi đổi:** người chơi đọc hướng mũi tên và địa hình (hốc, tường) trước khi ăn.
- **Tần suất trong map:** 1–2 mèo mũi tên/màn, ở màu có ít mèo; màn khó: mũi tên hướng vào góc/hốc.
- **Rủi ro cần playtest:** nhiều mũi tên cùng màu khiến kết quả khó đoán.

---

## 10 · Liên Kết Điện (`electric-link.html`)
**summary:** `📋 Tiêu chí đánh giá · Thua khi bật điện trúng mèo/hố trên đoạn nối`

### 01 Dễ hiểu
- **Kết luận:** Khó — cần ≥ 3 thao tác, có 3 trạng thái.
- Điện tắt (đi tự do) → điện bật khi **hai hố khác nhau** đứng trên A và B → đoạn nối trống thì thành rào chặn; đoạn nối còn mèo/hố thì điện giật.
- Dễ hiểu sai: một hố nhiều ô đứng cả A và B **không** bật điện; hố lớn chỉ cần 1 ô chạm đoạn nối là thua.
- **Hỏi người chơi:** "Nếu hố hồng xuống B bây giờ, trên đoạn nối còn gì không?"

### 02 Case stuck / thua
- **Kiểu kết thúc:** Thua ngay khi bật điện trúng; rào chặn khi đoạn trống thì **không** thua.
- **Điều kiện:** điện bật mà đoạn nối (các ô giữa A và B) còn mèo hoặc ô của hố → thua, kiểm trước khi thu mèo; không được đi thêm để thoát.
- **Trên board demo:** demo sai (8 nước): hố xanh đứng A, hố hồng xuống B khi mèo xanh còn trên đoạn nối → ĐIỆN GIẬT.
- **An toàn:** dọn đoạn nối trước, rồi mới cho hai hố đứng A và B; muốn qua rào thì nhả một công tắc.

### 03 Visual
- **Kết luận:** Vừa — cần chú thích.
- Pad A / B, dây nối, ô đoạn nối sáng khi điện bật, tia điện khi thua; hố bị rào chặn thì rung.
- **Rủi ro:** hố lớn chỉ 1 ô chạm dây khó nhìn thấy; "rào chặn" và "điện giật" cùng xuất hiện khi điện bật.

### 04 Feeling
- **Ưu tiên hay để dành:** **Ưu tiên** dọn đoạn nối; dùng điện như rào chắn có chủ đích.
- **Cách chơi đổi:** người chơi coi đoạn nối là "vùng cấm tạm thời" và lên lịch bật/tắt.
- **Tần suất trong map:** 1 cặp công tắc, đoạn nối 1–3 ô; màn khó: đoạn dài, mèo trên dây cần hố khác dọn trước.
- **Rủi ro cần playtest:** điều kiện thua chưa được Lead chốt (giật ngay vs. chỉ chặn).

---

## Cách đưa vào trang (cho worker)

Mỗi trang chi tiết đã có đúng một khối `<details class="review">` nằm NGOÀI `main > .demos` và `main > .card.play`. Thay **toàn bộ** khối đó bằng nội dung của mechanic tương ứng ở trên, theo khuôn:

```html
<details class="review">
  <summary>📋 Tiêu chí đánh giá · …(dòng summary của mechanic)…</summary>
  <div class="criteria">
    <article><div class="n">01</div><h3>Có dễ hiểu không?</h3>
      <p class="verdict"><b>Kết luận:</b> …</p>
      <ul><li>…</li><li>…</li></ul>
      <p><b>Hỏi người chơi:</b> …</p></article>
    <article><div class="n">02</div><h3>Có case stuck / thua màn?</h3>
      <p class="verdict"><b>Kiểu kết thúc:</b> …</p>
      <ul><li><b>Điều kiện:</b> …</li><li><b>Trên board demo:</b> …</li><li><b>An toàn:</b> …</li>…</ul></article>
    <article><div class="n">03</div><h3>Visual có dễ demo?</h3>
      <p class="verdict"><b>Kết luận:</b> …</p>
      <ul><li>…</li><li><b>Rủi ro:</b> …</li></ul></article>
    <article><div class="n">04</div><h3>Tạo feeling khác không?</h3>
      <p class="verdict"><b>Ưu tiên hay để dành:</b> …</p>
      <ul><li><b>Cách chơi đổi:</b> …</li><li><b>Tần suất trong map:</b> …</li><li><b>Rủi ro cần playtest:</b> …</li></ul></article>
  </div>
</details>
```

Quy tắc chép:
- Mỗi gạch đầu dòng trong tài liệu = một `<li>`; dòng in đậm kiểu `**Kết luận:** …` / `**Kiểu kết thúc:** …` / `**Ưu tiên hay để dành:** …` là `<p class="verdict">` đầu article; dòng `**Hỏi người chơi:**` là `<p>` cuối article 01. `**…**` → `<b>…</b>`. Giữ nguyên chữ, dấu, số; không thêm, không bớt ý.
- CSS (thêm một lần, không đổi luật cũ): `.criteria ul{margin:6px 0 0;padding-left:18px;font-size:14.5px;line-height:1.5}` · `.criteria li{margin:3px 0}` · `.criteria .verdict{margin-top:4px;padding:6px 10px;background:var(--card);border-radius:10px}` — vào `assets/catdom-kit.css` (9 trang dùng kit). `selfish-cat.html` không nạp kit: thêm vào thẻ `<style>` của nó các luật `details.review`, `.criteria` tương đương kit (sao chép từ `assets/catdom-kit.css` dòng `details.review…` tới `.criteria p…`) cộng 3 luật mới; nếu trang thiếu biến `--card`/`--bg`/`--line`/`--accent` thì dùng màu cụ thể tương đương.
