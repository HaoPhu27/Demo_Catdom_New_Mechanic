# Business rules

Nguồn chuẩn: `selfish-cat.html` (xem `memory/decisions.md`, 2026-10-23). Worker phải bám đúng phần dưới đây và file mẫu đó.

## Gameplay CatDom (mô hình dùng cho mọi trang visualize)
- Bàn chơi là lưới ô vuông màu xanh xám. Trên ô có mèo nhiều màu.
- Hole là khối polyomino màu (viền sáng, lòng tối). Người chơi **kéo** hole tới dưới mèo **cùng màu**.
- Một lần kéo có thể nuốt **cả nhóm** mèo cùng màu cùng lúc.
- Demo minh hoạ dùng bàn tay hướng dẫn kéo hole. Playground mô phỏng một lần nuốt bằng cả nhóm mèo cùng màu đang dính nhau.

## Mèo Ích Kỷ (Selfish Cat)
- Có bộ đếm N hiện trên đầu ngay từ đầu màn.
- Mỗi **con mèo khác** bị clear thì N giảm 1. Một hole nuốt 3 con thì N giảm 3.
- Clear Mèo Ích Kỷ khi N > 0 thì an toàn, bộ đếm biến mất.
- Nếu Mèo Ích Kỷ nằm trong **cùng lượt nuốt** với các con khác thì vẫn an toàn.
- N về 0 khi Mèo Ích Kỷ còn trên bàn thì nó cào và người chơi thua màn.
- Ví dụ N = 5: Mèo Ích Kỷ phải nằm trong 5 con được clear đầu tiên. Clear 5 con khác trước nó là thua.
- Visual theo N: từ 3 trở lên khó chịu; 2 cảnh cáo (badge cam, nổi gân); 1 nổi điên (badge đỏ nhấp nháy, rung); 0 cào; đã clear thì hài lòng.
