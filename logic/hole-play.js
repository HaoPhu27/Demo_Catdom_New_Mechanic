// HP-1: luật kéo hố cho board chơi thử mechanic 01–04.
// Hố đặt sẵn trên bàn (mỗi hố một shape, sức chứa = số ô). Người chơi đi hố 1 ô mỗi bước;
// hố trùm đủ cả nhóm mèo cùng màu (và còn đủ sức chứa) thì tự nuốt nhóm đó.
// Module thuần luật, không DOM, không phụ thuộc thư viện.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CatDomHolePlay = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function inWeedArea(area, x, y) {
    if (!area) return false;
    return x >= area.x && x < area.x + area.w && y >= area.y && y < area.y + area.h;
  }

  function create(game, opts) {
    const o = opts || {};
    const cols = o.cols;
    const rows = o.rows;
    const weedArea = o.weedArea || null;

    // Sao chép hố từ opts.holes để không sửa mảng gốc của caller.
    const holes = (o.holes || []).map(h => {
      const shape = (h.shape || []).map(([dx, dy]) => [dx, dy]);
      const special = !!h.special;
      return {
        id: h.id,
        color: h.color,
        x: h.x,
        y: h.y,
        shape,
        special,
        picked: !special,
        remaining: shape.length,
        done: false
      };
    });

    // Thuốc sâu: chỉ còn trên bàn khi opts.pesticide có và chưa bị nhặt.
    let pesticide = o.pesticide ? { x: o.pesticide.x, y: o.pesticide.y } : null;

    function footprint(h, ox, oy) {
      const bx = ox === undefined ? h.x : ox;
      const by = oy === undefined ? h.y : oy;
      return h.shape.map(([dx, dy]) => [bx + dx, by + dy]);
    }

    function holeById(id) {
      return holes.find(h => h.id === id) || null;
    }

    function holesApi() {
      return holes.map(h => ({
        id: h.id,
        color: h.color,
        x: h.x,
        y: h.y,
        shape: h.shape.map(([dx, dy]) => [dx, dy]),
        special: h.special,
        picked: h.picked,
        remaining: h.remaining,
        done: h.done
      }));
    }

    // id của hố chưa done có footprint chứa ô (x,y); không có thì null.
    function holeAt(x, y) {
      for (const h of holes) {
        if (h.done) continue;
        for (const [cx, cy] of footprint(h)) {
          if (cx === x && cy === y) return h.id;
        }
      }
      return null;
    }

    // Kiểm một footprint mới; trả lý do chặn đầu tiên hoặc null.
    function checkFootprint(h, cells) {
      const state = game.getState();
      const boxes = state.boxes || [];
      const cats = state.cats || [];

      for (const [cx, cy] of cells) {
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return 'out-of-board';
        if (inWeedArea(weedArea, cx, cy)) return 'weed-area';

        for (const other of holes) {
          if (other === h || other.done) continue;
          if (footprint(other).some(([ox, oy]) => ox === cx && oy === cy)) return 'hole';
        }

        const box = boxes.find(b => b.x === cx && b.y === cy);
        if (box && box.queue && box.queue.length > 0) {
          const eatsBox = h.picked && box.queue[0].color === h.color;
          if (!eatsBox) return 'box';
        }

        if (pesticide && pesticide.x === cx && pesticide.y === cy) {
          const picks = h.special && !h.picked;
          if (!picks) return 'pesticide';
        }

        const cat = cats.find(c => c.alive && c.x === cx && c.y === cy);
        if (cat) {
          const eatsCat = h.picked && cat.color === h.color;
          if (!eatsCat) return 'cat';
        }
      }

      return null;
    }

    function move(id, dx, dy) {
      // 1. Ván đã kết thúc.
      if (game.getState().status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }

      // 2. Hố không tồn tại hoặc đã xong.
      const h = holeById(id);
      if (!h || h.done) {
        return { ok: false, reason: 'bad-hole', events: [] };
      }

      // 3. Bước đi phải là 1 ô theo 4 hướng.
      if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) + Math.abs(dy) !== 1) {
        return { ok: false, reason: 'bad-move', events: [] };
      }

      // 4. Ô của footprint mới phải hợp lệ.
      const newX = h.x + dx;
      const newY = h.y + dy;
      const cells = footprint(h, newX, newY);
      const blocked = checkFootprint(h, cells);
      if (blocked) return { ok: false, reason: blocked, events: [] };

      // 5. Hợp lệ: cập nhật vị trí.
      h.x = newX;
      h.y = newY;
      const events = [{ type: 'move', hole: id, x: newX, y: newY }];

      // 6. Nhặt thuốc sâu (chỉ hố special, khi footprint mới trùm ô thuốc sâu).
      if (h.special && !h.picked && pesticide && cells.some(([cx, cy]) => cx === pesticide.x && cy === pesticide.y)) {
        const res = game.pickPesticide();
        if (res && res.events) events.push(...res.events);
        h.picked = true;
        pesticide = null;
      }

      // 7. Tự nuốt khi hố đã picked: lặp cho tới khi không còn nhóm nào trùm đủ.
      while (h.picked && !h.done && game.getState().status === 'playing') {
        const state = game.getState();
        const boxes = state.boxes || [];
        const cats = state.cats || [];
        const cur = footprint(h);

        let target = null;
        for (const [cx, cy] of cur) {
          // (a) Ô box còn mèo đúng màu hố.
          const box = boxes.find(b => b.x === cx && b.y === cy);
          if (box && box.queue && box.queue.length > 0) {
            if (box.queue[0].color === h.color) { target = { x: cx, y: cy, isBox: true }; break; }
            continue;
          }
          // (b) Mèo trên bàn cùng màu hố.
          const cat = cats.find(c => c.alive && c.x === cx && c.y === cy);
          if (cat && cat.color === h.color) { target = { x: cx, y: cy, isBox: false }; break; }
        }

        if (!target) break;

        const ids = game.groupAt(target.x, target.y);
        if (!ids || ids.length === 0) break;
        if (ids.length > h.remaining) break;

        // Mèo trên bàn: cả nhóm phải nằm gọn trong footprint. Box thì không cần kiểm.
        if (!target.isBox) {
          const idSet = new Set(ids);
          const allInside = cats
            .filter(c => c.alive && idSet.has(c.id))
            .every(c => cur.some(([cx, cy]) => cx === c.x && cy === c.y));
          if (!allInside) break;
        }

        const res = game.eat(target.x, target.y);
        if (!res || !res.ok) break;

        const eatEvent = (res.events || []).find(e => e.type === 'eat');
        const eaten = eatEvent && eatEvent.ids ? eatEvent.ids.slice() : [];
        h.remaining -= eaten.length;
        events.push(...(res.events || []));
        events.push({ type: 'holeEat', hole: id, ids: eaten.slice(), remaining: h.remaining });
        if (h.remaining <= 0) {
          h.done = true;
          events.push({ type: 'holeDone', hole: id });
        }
      }

      // 8.
      return { ok: true, events };
    }

    return { holes: holesApi, holeAt, move };
  }

  return { create };
});
