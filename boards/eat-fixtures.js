(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatDomEatFixtures = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const level = {
    cols: 7,
    rows: 8,
    cats: [
      // Orange (L3, 3 cats)
      { id: 'o1', color: 'orange', x: 0, y: 0 },
      { id: 'o2', color: 'orange', x: 1, y: 0 },
      { id: 'o3', color: 'orange', x: 0, y: 1 },
      // Green (L4, 4 cats)
      { id: 'g1', color: 'green', x: 2, y: 4 },
      { id: 'g2', color: 'green', x: 2, y: 5 },
      { id: 'g3', color: 'green', x: 2, y: 6 },
      { id: 'g4', color: 'green', x: 3, y: 6 },
      // Blue (I3, 3 cats)
      { id: 'b1', color: 'blue', x: 6, y: 2 },
      { id: 'b2', color: 'blue', x: 6, y: 3 },
      { id: 'b3', color: 'blue', x: 6, y: 4 },
      // Yellow (O4, 4 cats)
      { id: 'y1', color: 'yellow', x: 4, y: 4 },
      { id: 'y2', color: 'yellow', x: 5, y: 4 },
      { id: 'y3', color: 'yellow', x: 4, y: 5 },
      { id: 'y4', color: 'yellow', x: 5, y: 5 },
      // Pink (L3, 3 cats)
      { id: 'p1', color: 'pink', x: 4, y: 2 },
      { id: 'p2', color: 'pink', x: 5, y: 2 },
      { id: 'p3', color: 'pink', x: 4, y: 3 }
    ],
    weedArea: { x: 4, y: 0, w: 3, h: 2 },
    weedStart: [[6, 0]],
    pesticide: { x: 3, y: 1 }
  };

  const holes = [
    { id: 'ho', color: 'orange', x: 0, y: 2, shape: [[0, 0], [1, 0], [0, 1]] },
    { id: 'hg', color: 'green', x: 0, y: 4, shape: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { id: 'hb', color: 'blue', x: 6, y: 5, shape: [[0, 0], [0, 1], [0, 2]] },
    { id: 'hy', color: 'yellow', x: 4, y: 6, shape: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { id: 'hp', color: 'pink', special: true, x: 2, y: 2, shape: [[0, 0], [1, 0], [0, 1]] }
  ];

  const intro = 'Khu vực cây dại 3×2 có 6 ô, đã mọc 1 ô. Mỗi mèo lọt hố làm mọc thêm 1 ô. Cần nhặt thuốc sâu trước khi cây phủ kín!';

  const good = [
    { eat: [0, 0], hole: 'ho', path: [[0, 1], [0, 0]], say: 'Kéo hố cam nuốt 3 mèo → cây dại mọc 3 ô (4/6)' },
    { pick: true, hole: 'hp', path: [[2, 1]], say: 'Kéo Special Hole nhặt thuốc sâu, diệt sạch cây dại!' },
    { eat: [2, 4], hole: 'hg', path: [[1, 4], [2, 4]], say: 'Cây dại đã diệt, kéo hố xanh lá nuốt 4 mèo' },
    { eat: [6, 2], hole: 'hb', path: [[6, 4], [6, 3], [6, 2]], say: 'Kéo hố xanh dương nuốt 3 mèo' },
    { eat: [4, 4], hole: 'hy', path: [[4, 5], [4, 4]], say: 'Kéo hố vàng nuốt 4 mèo' },
    { eat: [4, 2], hole: 'hp', path: [[2, 2], [3, 2], [4, 2]], say: 'Special Hole nuốt 3 mèo hồng cuối cùng, bàn sạch!' }
  ];

  const bad = [
    { eat: [0, 0], hole: 'ho', path: [[0, 1], [0, 0]], say: 'Kéo hố cam nuốt 3 mèo → cây dại mọc 3 ô (4/6)' },
    { eat: [2, 4], hole: 'hg', path: [[1, 4], [2, 4]], say: 'Quên thuốc sâu, ăn tiếp 4 mèo xanh lá → cây dại phủ kín, thua!' }
  ];

  // --- Sick Cat (Mèo bệnh) ---
  const sickLevel = {
    cols: 7,
    rows: 8,
    cats: [
      // Orange (L3, 3 cats)
      { id: 'o1', color: 'orange', x: 0, y: 0 },
      { id: 'o2', color: 'orange', x: 1, y: 0 },
      { id: 'o3', color: 'orange', x: 0, y: 1 },
      // Yellow (T4, 4 cats, y2 at center is initial sick)
      { id: 'y1', color: 'yellow', x: 2, y: 1 },
      { id: 'y2', color: 'yellow', x: 3, y: 1 },
      { id: 'y3', color: 'yellow', x: 4, y: 1 },
      { id: 'y4', color: 'yellow', x: 3, y: 2 },
      // Blue (I3, 3 cats)
      { id: 'b1', color: 'blue', x: 6, y: 0 },
      { id: 'b2', color: 'blue', x: 6, y: 1 },
      { id: 'b3', color: 'blue', x: 6, y: 2 },
      // Green (L4, 4 cats)
      { id: 'g1', color: 'green', x: 0, y: 5 },
      { id: 'g2', color: 'green', x: 0, y: 6 },
      { id: 'g3', color: 'green', x: 0, y: 7 },
      { id: 'g4', color: 'green', x: 1, y: 7 },
      // Pink (O4, 4 cats)
      { id: 'p1', color: 'pink', x: 4, y: 6 },
      { id: 'p2', color: 'pink', x: 5, y: 6 },
      { id: 'p3', color: 'pink', x: 4, y: 7 },
      { id: 'p4', color: 'pink', x: 5, y: 7 }
    ],
    initialSick: 'y2'
  };

  const sickHoles = [
    { id: 'ho', color: 'orange', x: 0, y: 2, shape: [[0, 0], [1, 0], [0, 1]] },
    { id: 'hy', color: 'yellow', x: 2, y: 3, shape: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { id: 'hb', color: 'blue', x: 6, y: 3, shape: [[0, 0], [0, 1], [0, 2]] },
    { id: 'hg', color: 'green', x: 1, y: 4, shape: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { id: 'hp', color: 'pink', x: 4, y: 4, shape: [[0, 0], [1, 0], [0, 1], [1, 1]] }
  ];

  const sickIntro = 'Ổ bệnh ban đầu ở giữa nhóm mèo vàng (1 con). Mỗi mèo khoẻ lọt hố lây thêm 1 ca. Mèo bệnh chiếm từ 50% số mèo còn lại sẽ thua!';

  const sickGood = [
    { eat: [0, 0], hole: 'ho', path: [[0, 1], [0, 0]], say: 'Kéo hố cam nuốt 3 mèo khoẻ → 3 ca lây, cả ổ vàng bị bệnh' },
    { eat: [2, 1], hole: 'hy', path: [[2, 2], [2, 1]], say: 'Kéo hố vàng nuốt cả ổ 4 mèo bệnh → dập tắt ổ dịch!' },
    { eat: [6, 0], hole: 'hb', path: [[6, 2], [6, 1], [6, 0]], say: 'Ổ dịch đã hết, kéo hố xanh dương nuốt 3 mèo' },
    { eat: [0, 5], hole: 'hg', path: [[0, 4], [0, 5]], say: 'Kéo hố xanh lá nuốt 4 mèo' },
    { eat: [4, 6], hole: 'hp', path: [[4, 5], [4, 6]], say: 'Nuốt nốt 4 mèo hồng cuối cùng, bàn sạch!' }
  ];

  const sickBad = [
    { eat: [0, 0], hole: 'ho', path: [[0, 1], [0, 0]], say: 'Kéo hố cam nuốt 3 mèo khoẻ → 3 ca lây, cả ổ vàng bị bệnh' },
    { eat: [0, 5], hole: 'hg', path: [[0, 4], [0, 5]], say: 'Ăn 4 mèo xanh lá thay vì dập ổ bệnh → 4 ca lây bùng phát, đại dịch!' }
  ];

  // --- Couple Cat (Couple Mèo) ---
  const coupleLevel = {
    cols: 7,
    rows: 8,
    cats: [
      // Yellow (T4, 4 cats)
      { id: 'y1', color: 'yellow', x: 0, y: 0 },
      { id: 'y2', color: 'yellow', x: 1, y: 0 },
      { id: 'y3', color: 'yellow', x: 2, y: 0 },
      { id: 'y4', color: 'yellow', x: 1, y: 1, couple: 'A' },
      // Purple (I3, 3 cats)
      { id: 'p1', color: 'purple', x: 0, y: 2 },
      { id: 'p2', color: 'purple', x: 1, y: 2 },
      { id: 'p3', color: 'purple', x: 2, y: 2 },
      // Blue (O4, 4 cats)
      { id: 'b1', color: 'blue', x: 3, y: 3 },
      { id: 'b2', color: 'blue', x: 4, y: 3 },
      { id: 'b3', color: 'blue', x: 3, y: 4 },
      { id: 'b4', color: 'blue', x: 4, y: 4 },
      // Green (L4, 4 cats)
      { id: 'g1', color: 'green', x: 0, y: 4 },
      { id: 'g2', color: 'green', x: 1, y: 4 },
      { id: 'g3', color: 'green', x: 2, y: 4 },
      { id: 'g4', color: 'green', x: 0, y: 5 },
      // Orange (L3, 3 cats)
      { id: 'o1', color: 'orange', x: 6, y: 6 },
      { id: 'o2', color: 'orange', x: 5, y: 7 },
      { id: 'o3', color: 'orange', x: 6, y: 7, couple: 'A' }
    ],
    couples: [
      { id: 'A', n: 4, mark: 'pink' }
    ]
  };

  const coupleHoles = [
    { id: 'hy', color: 'yellow', x: 3, y: 0, shape: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { id: 'hp', color: 'purple', x: 0, y: 3, shape: [[0, 0], [1, 0], [2, 0]] },
    { id: 'hb', color: 'blue', x: 5, y: 3, shape: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { id: 'hg', color: 'green', x: 0, y: 6, shape: [[0, 0], [1, 0], [2, 0], [0, 1]] },
    { id: 'ho', color: 'orange', x: 3, y: 6, shape: [[1, 0], [0, 1], [1, 1]] }
  ];

  const coupleIntro = 'Hai con mèo mang mũi tên 💘 hồng là một cặp, N = 4. Nuốt một con thì con kia bắt đầu đếm ngược, phải cứu kịp trước khi số về 0!';

  const coupleGood = [
    { eat: [6, 6], hole: 'ho', path: [[4, 6], [5, 6]], say: 'Kéo hố cam nuốt 3 mèo → mèo vàng bắt đầu đếm ngược 4' },
    { eat: [0, 2], hole: 'hp', path: [[0, 2]], say: 'Kéo hố tím nuốt 3 mèo → mèo vàng còn 1 lượt' },
    { eat: [0, 0], hole: 'hy', path: [[2, 0], [1, 0], [0, 0]], say: 'Kéo hố vàng nuốt 4 mèo → đưa mèo vàng về với người yêu kịp lúc, an toàn!' },
    { eat: [0, 4], hole: 'hg', path: [[0, 5], [0, 4]], say: 'Cặp đôi đã an toàn, kéo hố xanh lá nuốt 4 mèo' },
    { eat: [3, 3], hole: 'hb', path: [[4, 3], [3, 3]], say: 'Nuốt nốt 4 mèo xanh dương cuối cùng, bàn sạch!' }
  ];

  const coupleBad = [
    { eat: [6, 6], hole: 'ho', path: [[4, 6], [5, 6]], say: 'Kéo hố cam nuốt 3 mèo → mèo vàng bắt đầu đếm ngược 4' },
    { eat: [0, 2], hole: 'hp', path: [[0, 2]], say: 'Kéo hố tím nuốt 3 mèo → mèo vàng còn 1 lượt' },
    { eat: [3, 3], hole: 'hb', path: [[4, 3], [3, 3]], say: 'Mải ăn 4 mèo xanh dương thay vì cứu cặp đôi → đếm về 0, chia tay, thua!' }
  ];

  // --- Selfish Cat (Mèo Ích Kỷ) ---
  const selfishLevel = {
    cols: 7,
    rows: 8,
    selfishCount: 5,
    cats: [
      // Orange (L3, 3 cats)
      { id: 'o1', color: 'orange', x: 0, y: 2 },
      { id: 'o2', color: 'orange', x: 1, y: 2 },
      { id: 'o3', color: 'orange', x: 0, y: 3 },
      // Purple (T4, 4 cats, s at center is Selfish Cat)
      { id: 'p1', color: 'purple', x: 2, y: 3 },
      { id: 's',  color: 'purple', x: 3, y: 3, selfish: true },
      { id: 'p2', color: 'purple', x: 4, y: 3 },
      { id: 'p3', color: 'purple', x: 3, y: 4 },
      // Blue (I3, 3 cats)
      { id: 'b1', color: 'blue', x: 4, y: 0 },
      { id: 'b2', color: 'blue', x: 5, y: 0 },
      { id: 'b3', color: 'blue', x: 6, y: 0 },
      // Green (L4, 4 cats)
      { id: 'g1', color: 'green', x: 0, y: 4 },
      { id: 'g2', color: 'green', x: 0, y: 5 },
      { id: 'g3', color: 'green', x: 0, y: 6 },
      { id: 'g4', color: 'green', x: 1, y: 6 },
      // Yellow (O4, 4 cats)
      { id: 'y1', color: 'yellow', x: 5, y: 3 },
      { id: 'y2', color: 'yellow', x: 6, y: 3 },
      { id: 'y3', color: 'yellow', x: 5, y: 4 },
      { id: 'y4', color: 'yellow', x: 6, y: 4 }
    ]
  };

  const selfishHoles = [
    { id: 'ho', color: 'orange', x: 0, y: 0, shape: [[0, 0], [1, 0], [0, 1]] },
    { id: 'hp', color: 'purple', x: 2, y: 6, shape: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { id: 'hb', color: 'blue', x: 4, y: 2, shape: [[0, 0], [1, 0], [2, 0]] },
    { id: 'hg', color: 'green', x: 2, y: 0, shape: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { id: 'hy', color: 'yellow', x: 5, y: 6, shape: [[0, 0], [1, 0], [0, 1], [1, 1]] }
  ];

  const selfishIntro = 'Mèo Ích Kỷ đòi được clear trong 5 con đầu tiên. Clear mèo khác làm giảm đếm, về 0 là bị cào thua!';

  const selfishGood = [
    { eat: [0, 2], hole: 'ho', path: [[0, 1], [0, 2]], say: 'Kéo hố cam nuốt 3 mèo → Mèo Ích Kỷ còn 2' },
    { eat: [2, 3], hole: 'hp', path: [[2, 5], [2, 4], [2, 3]], say: 'Kịp lúc! Kéo hố tím nuốt Mèo Ích Kỷ cùng nhóm tím → an toàn!' },
    { eat: [4, 0], hole: 'hb', path: [[4, 1], [4, 0]], say: 'Đã an toàn, kéo hố xanh dương nuốt 3 mèo' },
    { eat: [0, 4], hole: 'hg', path: [[1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], say: 'Kéo hố xanh lá nuốt 4 mèo' },
    { eat: [5, 3], hole: 'hy', path: [[5, 5], [5, 4], [5, 3]], say: 'Nuốt nốt 4 mèo vàng cuối cùng, bàn sạch!' }
  ];

  const selfishBad = [
    { eat: [0, 2], hole: 'ho', path: [[0, 1], [0, 2]], say: 'Kéo hố cam nuốt 3 mèo → Mèo Ích Kỷ còn 2' },
    { eat: [4, 0], hole: 'hb', path: [[4, 1], [4, 0]], say: 'Mải ăn 3 mèo xanh dương thay vì cứu Mèo Ích Kỷ → đếm về 0, bị cào, thua!' }
  ];

  return {
    fixtures: {
      weed: {
        demo: { level, holes, intro, good, bad }
      },
      sick: {
        demo: { level: sickLevel, holes: sickHoles, intro: sickIntro, good: sickGood, bad: sickBad }
      },
      couple: {
        demo: { level: coupleLevel, holes: coupleHoles, intro: coupleIntro, good: coupleGood, bad: coupleBad }
      },
      selfish: {
        demo: { level: selfishLevel, holes: selfishHoles, intro: selfishIntro, good: selfishGood, bad: selfishBad }
      }
    }
  };
});
