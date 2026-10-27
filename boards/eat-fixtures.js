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

  return {
    fixtures: {
      weed: {
        demo: { level, holes, intro, good, bad }
      }
    }
  };
});
