// Board và chuỗi nước "sai / đúng" cho 6 mechanic hố di chuyển (05–10).
// Trích từ reference/play-lab/mechanics-core.js, đổi màu theo design/quick-specs/hole-move-board-2026-10-26.md.
// Dùng chung cho test nghiệm thu (Node) và trang chi tiết (trình duyệt): window.CatDomFixtures.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatDomFixtures = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // seq('0UUR 1L') → [[0,0,-1],[0,0,-1],[0,1,0],[1,-1,0]]. Mỗi cụm: chỉ số hố rồi các hướng U/D/L/R.
  const DIR = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  function seq(text) {
    const out = [];
    for (const chunk of text.trim().split(/\s+/)) {
      const m = /^(\d+)([UDLR]+)$/.exec(chunk);
      if (!m) throw new Error('Chuỗi nước sai: ' + chunk);
      for (const d of m[2]) out.push([Number(m[1]), DIR[d][0], DIR[d][1]]);
    }
    return out;
  }

  const cat = (id, color, x, y, extra) => Object.assign({ id, color, x, y }, extra);
  const hole = (color, x, y, remaining = 1, shape) => (shape ? { color, x, y, remaining, shape } : { color, x, y, remaining });
  const board = extra => Object.assign({ cols: 5, rows: 5 }, extra);

  const fragileWalls = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const open = y === 2 || ((x === 0 || x === 4) && y === 1) || (x === 4 && y === 3);
    if (!open) fragileWalls.push([x, y]);
  }

  const N = (id, x, y) => cat(id, 'blue', x, y, { kind: 'NORMAL' });
  const H = (id, x, y) => cat(id, 'blue', x, y, { kind: 'STRIPE_H' });
  const V = (id, x, y) => cat(id, 'blue', x, y, { kind: 'STRIPE_V' });

  function laneBoard(columns, colors, quota) {
    const cats = [];
    columns.forEach((x, i) => { for (let n = 0; n < quota; n++) cats.push(cat('lane-' + i + '-' + n, colors[i], x, 3 - n)); });
    return board({ cats, holes: columns.map((x, i) => hole(colors[i], x, 4, quota)), pads: [[1, 2], [3, 2]] });
  }

  // Mỗi fixture: level, good (chuỗi đúng → won), bad (chuỗi sai → status/loseReason như ghi).
  const fixtures = {
    magnet: { default: 'main', demo: 'demo', list: {
      main: {
        name: 'Mèo nam châm',
        hint: 'Hố xanh: ↑ ↑ ↑ →. Hố hồng: ↑ ↑ ←. Cuối cùng hố vàng: ↑ ↑.',
        level: board({
          cats: [cat('blue', 'blue', 1, 1), cat('magnet', 'yellow', 2, 2, { magnet: true }), cat('pink', 'pink', 3, 2)],
          holes: [hole('blue', 0, 4), hole('yellow', 2, 4), hole('pink', 4, 4)]
        }),
        bad: { moves: '1UU', status: 'lost', loseReason: 'stuck' },
        good: '0UUUR 2UUL 1UU'
      },
      demo: {
        name: 'Board thật · Vùng hút nam châm',
        hint: 'Xanh dọn cột 0. Hồng ăn cụm hồng dọn sạch vùng 3×3 quanh nam châm. Vàng ăn nam châm an toàn. Xanh lá và Cam dọn nốt.',
        level: board({
          cols: 7, rows: 8,
          holes: [
            hole('blue', 0, 0, 3, [[0, 0], [0, 1], [0, 2]]),
            hole('pink', 1, 0, 3, [[0, 0], [1, 0], [0, 1]]),
            hole('yellow', 2, 5, 4, [[0, 0], [1, 0], [0, 1], [1, 1]]),
            hole('green', 4, 0, 4, [[0, 0], [1, 0], [2, 0], [1, 1]]),
            hole('orange', 5, 6, 4, [[0, 0], [1, 0], [0, 1], [1, 1]])
          ],
          cats: [
            cat('b1', 'blue', 0, 4), cat('b2', 'blue', 0, 5), cat('b3', 'blue', 0, 6),
            cat('p1', 'pink', 1, 2), cat('p2', 'pink', 2, 2), cat('p3', 'pink', 1, 3),
            cat('y1', 'yellow', 2, 3, { magnet: true }), cat('y2', 'yellow', 3, 3), cat('y3', 'yellow', 2, 4), cat('y4', 'yellow', 3, 4),
            cat('g1', 'green', 4, 2), cat('g2', 'green', 5, 2), cat('g3', 'green', 6, 2), cat('g4', 'green', 5, 3),
            cat('o1', 'orange', 5, 4), cat('o2', 'orange', 6, 4), cat('o3', 'orange', 5, 5), cat('o4', 'orange', 6, 5)
          ]
        }),
        bad: { moves: '0DDDD 2UU', status: 'lost', loseReason: 'stuck' },
        good: '0DDDD 1DD 2UU 3DD 4UU'
      }
    } },

    'fragile-floor': { default: 'main', demo: 'demo', list: {
      main: {
        name: 'Sàn dễ vỡ',
        hint: 'Hố xanh đi → → → → ↑. Sau đó hố hồng đi ↑ ← ← ← ← ↑. Không quay lại cầu.',
        level: board({
          cats: [cat('b', 'blue', 4, 1), cat('p', 'pink', 0, 1)],
          holes: [hole('blue', 0, 2), hole('pink', 4, 3)],
          walls: fragileWalls,
          floors: [{ x: 2, y: 2, durability: 2, max: 2 }]
        }),
        bad: { moves: '0RRLR', status: 'lost', loseReason: 'stuck' },
        good: '0RRRRU 1ULLLLU'
      },
      demo: {
        name: 'Board thật · Cầu sàn chia đôi',
        hint: 'Xanh đi qua cầu xuống nửa dưới. Hồng qua cầu rẽ trái ăn cụm hồng. Vàng sang phải ăn cụm vàng. Xanh lá và Cam dọn nốt. Không bước lãng phí trên cầu.',
        level: board({
          cols: 7, rows: 7,
          holes: [
            hole('blue', 3, 0, 3, [[0, 0], [0, 1], [0, 2]]),
            hole('pink', 2, 0, 2, [[0, 0], [0, 1]]),
            hole('yellow', 0, 0, 4, [[0, 0], [1, 0], [0, 1], [1, 1]]),
            hole('green', 4, 4, 3, [[0, 0], [1, 0], [0, 1]]),
            hole('orange', 0, 4, 3, [[0, 0], [0, 1], [0, 2]])
          ],
          cats: [
            cat('b1', 'blue', 3, 4), cat('b2', 'blue', 3, 5), cat('b3', 'blue', 3, 6),
            cat('p1', 'pink', 2, 4), cat('p2', 'pink', 2, 5),
            cat('y1', 'yellow', 5, 0), cat('y2', 'yellow', 6, 0), cat('y3', 'yellow', 5, 1), cat('y4', 'yellow', 6, 1),
            cat('g1', 'green', 5, 5), cat('g2', 'green', 6, 5), cat('g3', 'green', 5, 6),
            cat('o1', 'orange', 1, 4), cat('o2', 'orange', 1, 5), cat('o3', 'orange', 1, 6)
          ],
          walls: [[0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3]],
          floors: [{ x: 3, y: 3, durability: 2, max: 2 }]
        }),
        bad: { moves: '0DUD', status: 'lost', loseReason: 'stuck' },
        good: '0DDDD 1RDDDDL 2RRRRR 3RD 4R'
      }
    } },

    'stripe-cat': { default: 'SC-02', list: {
      'SC-01': { name: 'SC-01 · Làm quen khóa ngang', hint: '↑ ↓ → →. Thử → trước để thấy nhận ngang quá sớm gây stuck.',
        level: board({ cats: [N('normal-c2', 2, 1), H('h-d3', 3, 2), N('normal-e3', 4, 2)], holes: [hole('blue', 2, 2, 3)] }),
        bad: { moves: '0R', status: 'lost', loseReason: 'stuck' }, good: '0UDRR' },
      'SC-02': { name: 'SC-02 · Chia hố theo strict', hint: 'Xanh 1: ← ← → → →. Xanh 2: ↑ ↑ ↑ ↑. Không cho hố ngang ăn mèo dọc.',
        level: board({ cats: [H('h-d3', 3, 2), V('v-e3', 4, 2), N('normal-a3', 0, 2), N('normal-b3', 1, 2), N('normal-e1', 4, 0)],
          holes: [hole('blue', 2, 2, 3), hole('blue', 4, 4, 2)] }),
        bad: { moves: '0RR', status: 'lost', loseReason: 'stripe' }, good: '0LLRRR 1UUUU' },
      'SC-03': { name: 'SC-03 · Thu sọc cùng trục', hint: '→ → ← ← ← ←. Hai sọc ngang chỉ giữ khóa ngang, không cộng dồn.',
        level: board({ cats: [H('h-d3', 3, 2), H('h-e3', 4, 2), N('normal-a3', 0, 2)], holes: [hole('blue', 2, 2, 3)] }),
        good: '0RRLLLL' },
      'SC-04': { name: 'SC-04 · Mèo cuối hoàn thành hố', hint: '→ →. Hố nhận ngang, còn 1; ăn mèo dọc cuối vẫn hoàn thành.',
        level: board({ cats: [H('last-h', 3, 2), V('last-v', 4, 2)], holes: [hole('blue', 2, 2, 2)] }),
        good: '0RR' },
      'SC-05': { name: 'SC-05 · Strict gây stuck', hint: 'Đúng: ↑ ↑ ↓ ↓ → →. Sai: → ăn sọc ngang trước, thua STUCK ngay.',
        level: board({ cats: [N('above', 2, 0), H('lock', 3, 2), N('right', 4, 2)], holes: [hole('blue', 2, 2, 3)] }),
        bad: { moves: '0R', status: 'lost', loseReason: 'stuck' }, good: '0UUDDRR' }
    } },

    'alarm-zone': { default: 'main', list: { main: {
      name: 'Vùng báo động',
      hint: 'Xanh ↑ vào S và giữ. Hồng ↑ ↑ ↑ ← ↑. Cuối cùng Xanh ↑ ↑ ↑.',
      level: board({
        cats: [cat('b', 'blue', 0, 0), cat('p1', 'pink', 4, 1), cat('p2', 'pink', 3, 0)],
        holes: [hole('blue', 0, 4), hole('pink', 4, 4, 2)],
        alarmSwitches: [[0, 3]],
        alarms: [[1, 2], [2, 2], [3, 2], [4, 2]]
      }),
      bad: { moves: '0U 1UU 0D', status: 'lost', loseReason: 'alarm' },
      good: '0U 1UUULU 0UUU'
    } } },

    'teleport-cat': { default: 'main', demo: 'demo', list: {
      main: {
        name: 'Mèo dịch chuyển',
        hint: 'Hố xanh đi → → ↑ ↑ thu mèo thường, rồi ← ăn mèo mũi tên.',
        level: board({
          cats: [cat('arrow', 'blue', 2, 2, { arrow: [1, 0] }), cat('normal', 'blue', 3, 1)],
          holes: [hole('blue', 1, 3, 2, [[0, 0], [0, 1]])],
          walls: [[4, 0], [4, 2]]
        }),
        bad: { moves: '0UR', status: 'lost', loseReason: 'stuck' },
        good: '0RRUUL'
      },
      demo: {
        name: 'Board thật · Hốc bẫy dịch chuyển',
        hint: 'Hồng ăn cụm hồng. Cam sang phải ăn cụm cam. Xanh lá xuống ăn cụm xanh lá. Xanh dương sang phải ăn mèo thường trước rồi mới ăn mèo mũi tên. Vàng dọn nốt.',
        level: board({
          cols: 7, rows: 7,
          holes: [
            hole('blue', 2, 3, 2, [[0, 0], [0, 1]]),
            hole('pink', 0, 0, 3, [[0, 0], [1, 0], [0, 1]]),
            hole('yellow', 0, 5, 4, [[0, 0], [1, 0], [0, 1], [1, 1]]),
            hole('green', 4, 3, 4, [[0, 0], [1, 0], [2, 0], [1, 1]]),
            hole('orange', 3, 0, 3, [[0, 0], [0, 1], [0, 2]])
          ],
          cats: [
            cat('b_arrow', 'blue', 2, 1, { arrow: [1, 0] }), cat('b_norm', 'blue', 5, 1),
            cat('p1', 'pink', 0, 2), cat('p2', 'pink', 1, 2), cat('p3', 'pink', 0, 3),
            cat('y1', 'yellow', 2, 5), cat('y2', 'yellow', 3, 5), cat('y3', 'yellow', 2, 6), cat('y4', 'yellow', 3, 6),
            cat('g1', 'green', 4, 5), cat('g2', 'green', 5, 5), cat('g3', 'green', 6, 5), cat('g4', 'green', 5, 6),
            cat('o1', 'orange', 4, 0), cat('o2', 'orange', 4, 1), cat('o3', 'orange', 4, 2)
          ],
          walls: [[6, 0], [6, 2]]
        }),
        bad: { moves: '1DD 0UU', status: 'lost', loseReason: 'stuck' },
        good: '1DD 4R 3DD 0URRRUDLLLU 2RR'
      }
    } },

    'electric-link': { default: 'EL-01', list: {
      'EL-00': { name: 'EL-00 · Hai hố làm quen', hint: 'Xanh ↑ ↑, Hồng ↑ ↑: rào bật. Xanh ← để tắt điện rồi đi tiếp.',
        level: board({ cats: [cat('b', 'blue', 0, 0), cat('p', 'pink', 4, 0)], holes: [hole('blue', 1, 4), hole('pink', 3, 4)], pads: [[1, 2], [3, 2]] }),
        bad: { moves: '0UU 1UU', status: 'playing', loseReason: null }, good: '0UU 1UU 0LUU 1RUU' },
      'EL-01': { name: 'EL-01 · 3 hố × 3 mèo', hint: 'Đừng bật A và B khi mèo vàng còn ở ô giữa. Xanh ↑ ↑ → ← ↑; Hồng ↑ ↑ ← → ↑; Vàng ↑ ↑ ↑.',
        level: laneBoard([0, 4, 2], ['blue', 'pink', 'yellow'], 3),
        bad: { moves: '0UUR 1UUL', status: 'lost', loseReason: 'electric' }, good: '0UURLU 1UULRU 2UUU' },
      'EL-02': { name: 'EL-02 · 4 hố × 3 mèo', hint: 'Vàng ↑ ↑ ←; Hồng ↑ ↑ ↑; Vàng → ↑; mỗi hố xanh ↑ ↑ ↑.',
        level: laneBoard([0, 1, 3, 4], ['blue', 'pink', 'yellow', 'blue'], 3),
        bad: { moves: '2U 1UUR 2U 0RUU', status: 'lost', loseReason: 'electric' }, good: '2UUL 1UUU 2RU 0UUU 3UUU' },
      'EL-03': { name: 'EL-03 · 3 hố × 4 mèo', hint: 'Dọn mèo trên đoạn nối trước khi bật điện. Xanh ↑ ↑ → ← ↑ ↑; Hồng ↑ ↑ ← → ↑ ↑; Vàng ↑ ↑ ↑ ↑.',
        level: laneBoard([0, 4, 2], ['blue', 'pink', 'yellow'], 4),
        bad: { moves: '0UUR 1UUL', status: 'lost', loseReason: 'electric' }, good: '0UURLUU 1UULRUU 2UUUU' },
      'EL-04': { name: 'EL-04 · 4 hố × 4 mèo', hint: 'Vàng ↑ ↑ ←; Hồng ↑ ↑; Vàng → bật rào an toàn; Hồng ↑ ↑; Vàng ↑ ↑; mỗi hố xanh ↑ ↑ ↑ ↑.',
        level: laneBoard([0, 1, 3, 4], ['blue', 'pink', 'yellow', 'blue'], 4),
        // Nước cuối (Xanh ↑ vào ô giữa) bị rào chặn: không thua.
        bad: { moves: '2UUL 1UU 2R 0RURU', status: 'playing', loseReason: null, lastRejected: 'electric-barrier' }, good: '2UUL 1UU 2R 1UU 2UU 0UUUU 3UUUU' }
    } }
  };

  return { fixtures, seq };
});
