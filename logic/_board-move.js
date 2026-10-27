(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})._boardMove = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VALID_COLORS = new Set(['blue', 'green', 'orange', 'purple', 'pink', 'yellow']);
  const UNIT_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function validateLevel(level, extraValidator) {
    const errors = [];
    if (!level || typeof level !== 'object') {
      return ['level phải là một object'];
    }

    const hasValidCols = Number.isInteger(level.cols) && level.cols >= 1;
    if (!hasValidCols) {
      errors.push('cols phải là số nguyên >= 1');
    }

    const hasValidRows = Number.isInteger(level.rows) && level.rows >= 1;
    if (!hasValidRows) {
      errors.push('rows phải là số nguyên >= 1');
    }

    const wallSet = new Set();
    if (level.walls !== undefined) {
      if (!Array.isArray(level.walls)) {
        errors.push('walls phải là mảng');
      } else {
        for (let i = 0; i < level.walls.length; i++) {
          const w = level.walls[i];
          if (!Array.isArray(w) || w.length !== 2 || !Number.isInteger(w[0]) || !Number.isInteger(w[1])) {
            errors.push('tọa độ tường phải là mảng 2 số nguyên');
          } else {
            wallSet.add(w[0] + ',' + w[1]);
          }
        }
      }
    }

    if (!Array.isArray(level.cats)) {
      errors.push('cats phải là mảng');
    } else {
      const catIds = new Set();
      const catPositions = new Set();
      for (let i = 0; i < level.cats.length; i++) {
        const c = level.cats[i];
        if (!c || typeof c !== 'object') {
          errors.push('mèo phải là object');
          continue;
        }

        if (typeof c.id !== 'string' || !c.id) {
          errors.push('id mèo không hợp lệ');
        } else {
          if (catIds.has(c.id)) {
            errors.push('id mèo trùng');
          }
          catIds.add(c.id);
        }

        if (!VALID_COLORS.has(c.color)) {
          errors.push('màu không hợp lệ');
        }

        const validPos = Number.isInteger(c.x) && Number.isInteger(c.y);
        if (!validPos) {
          errors.push('tọa độ mèo phải là số nguyên');
        } else {
          if (hasValidCols && hasValidRows && (c.x < 0 || c.x >= level.cols || c.y < 0 || c.y >= level.rows)) {
            errors.push('mèo ngoài bàn');
          }
          const posKey = c.x + ',' + c.y;
          if (catPositions.has(posKey)) {
            errors.push('hai mèo cùng ô');
          }
          catPositions.add(posKey);
        }

        if (c.arrow !== undefined) {
          if (!Array.isArray(c.arrow) || c.arrow.length !== 2 || !UNIT_DIRS.some(d => d[0] === c.arrow[0] && d[1] === c.arrow[1])) {
            errors.push('arrow không phải một trong 4 hướng đơn vị');
          }
        }

        if (c.kind !== undefined) {
          if (c.kind !== 'NORMAL' && c.kind !== 'STRIPE_H' && c.kind !== 'STRIPE_V') {
            errors.push('kind ngoài 3 giá trị');
          }
        }
      }
    }

    if (!Array.isArray(level.holes)) {
      errors.push('holes phải là mảng');
    } else if (level.holes.length === 0) {
      errors.push('holes không được rỗng');
    } else {
      const occupiedHoleCells = new Map();
      for (let i = 0; i < level.holes.length; i++) {
        const h = level.holes[i];
        if (!h || typeof h !== 'object') {
          errors.push('hố phải là object');
          continue;
        }

        if (!VALID_COLORS.has(h.color)) {
          errors.push('màu không hợp lệ');
        }

        const validPos = Number.isInteger(h.x) && Number.isInteger(h.y);
        if (!validPos) {
          errors.push('tọa độ hố phải là số nguyên');
        }

        if (!Number.isInteger(h.remaining) || h.remaining < 1) {
          errors.push('remaining không phải số nguyên >= 1');
        }

        let shape = [[0, 0]];
        if (h.shape !== undefined) {
          if (!Array.isArray(h.shape) || h.shape.length === 0 || !h.shape.every(p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]))) {
            errors.push('shape của hố không hợp lệ');
            shape = [];
          } else {
            shape = h.shape;
          }
        }

        if (validPos && shape.length > 0) {
          for (let sIdx = 0; sIdx < shape.length; sIdx++) {
            const cx = h.x + shape[sIdx][0];
            const cy = h.y + shape[sIdx][1];
            if (hasValidCols && hasValidRows && (cx < 0 || cx >= level.cols || cy < 0 || cy >= level.rows)) {
              errors.push('ô của hố ngoài bàn hoặc trùng tường');
            } else if (wallSet.has(cx + ',' + cy)) {
              errors.push('ô của hố ngoài bàn hoặc trùng tường');
            }
            const cellKey = cx + ',' + cy;
            if (occupiedHoleCells.has(cellKey)) {
              errors.push('hai hố chồng ô');
            } else {
              occupiedHoleCells.set(cellKey, i);
            }
          }
        }
      }
    }

    if (level.pads !== undefined) {
      if (!Array.isArray(level.pads) || level.pads.length !== 2 ||
          !Array.isArray(level.pads[0]) || level.pads[0].length !== 2 ||
          !Array.isArray(level.pads[1]) || level.pads[1].length !== 2 ||
          !Number.isInteger(level.pads[0][0]) || !Number.isInteger(level.pads[0][1]) ||
          !Number.isInteger(level.pads[1][0]) || !Number.isInteger(level.pads[1][1])) {
        errors.push('pads có mặt mà không phải đúng 2 ô cùng hàng hoặc cùng cột');
      } else {
        const p1 = level.pads[0];
        const p2 = level.pads[1];
        const sameRowOrCol = (p1[0] === p2[0] || p1[1] === p2[1]) && !(p1[0] === p2[0] && p1[1] === p2[1]);
        if (!sameRowOrCol) {
          errors.push('pads có mặt mà không phải đúng 2 ô cùng hàng hoặc cùng cột');
        }
      }
    }

    if (typeof extraValidator === 'function') {
      const extraErrors = extraValidator(level);
      if (Array.isArray(extraErrors)) {
        errors.push(...extraErrors);
      }
    }

    return errors;
  }

  function fits(cols, rows, state, hIndex, targetX, targetY, oldX, oldY, ignoreMovable) {
    const hole = state.holes[hIndex];
    const fromX = oldX !== undefined ? oldX : hole.x;
    const fromY = oldY !== undefined ? oldY : hole.y;
    const targetCells = hole.shape.map(([dx, dy]) => [targetX + dx, targetY + dy]);
    const oldCells = hole.shape.map(([dx, dy]) => [fromX + dx, fromY + dy]);

    for (let i = 0; i < targetCells.length; i++) {
      const [cx, cy] = targetCells[i];

      // Ngoài bàn
      if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) {
        return false;
      }

      // Tường
      if (state.walls.some(([wx, wy]) => wx === cx && wy === cy)) {
        return false;
      }

      // Sàn đã sụp (fragile-floor)
      if (state.floors && state.floors.some(f => f.x === cx && f.y === cy && f.durability === 0 && !oldCells.some(([ox, oy]) => ox === cx && oy === cy))) {
        return false;
      }

      if (!ignoreMovable) {
        // Hố khác còn hoạt động
        for (let oIdx = 0; oIdx < state.holes.length; oIdx++) {
          if (oIdx !== hIndex && !state.holes[oIdx].done) {
            const other = state.holes[oIdx];
            const otherCells = other.shape.map(([dx, dy]) => [other.x + dx, other.y + dy]);
            if (otherCells.some(([ox, oy]) => ox === cx && oy === cy)) {
              return false;
            }
          }
        }

        // Mèo khác màu còn trên bàn
        if (state.cats.some(c => c.alive && c.color !== hole.color && c.x === cx && c.y === cy)) {
          return false;
        }
      }
    }

    return true;
  }

  function canReach(cols, rows, state, hIndex, cat) {
    if (cat === undefined) {
      cat = state;
      hIndex = rows;
      state = cols;
      cols = state.cols;
      rows = state.rows;
    }
    const hole = state.holes[hIndex];
    const queue = [[hole.x, hole.y]];
    const seen = new Set([hole.x + ',' + hole.y]);

    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i];
      if (hole.shape.some(([dx, dy]) => x + dx === cat.x && y + dy === cat.y)) {
        return true;
      }
      for (let d = 0; d < UNIT_DIRS.length; d++) {
        const [ddx, ddy] = UNIT_DIRS[d];
        const nx = x + ddx;
        const ny = y + ddy;
        const k = nx + ',' + ny;
        if (!seen.has(k) && fits(cols, rows, state, hIndex, nx, ny, x, y, true)) {
          seen.add(k);
          queue.push([nx, ny]);
        }
      }
    }

    return false;
  }

  function createGame(level, hooks = {}) {
    const errors = validateLevel(level, hooks.validateExtra);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    const cols = level.cols;
    const rows = level.rows;

    const state = {
      cols,
      rows,
      status: 'playing',
      loseReason: null,
      turn: 0,
      cats: level.cats.map(c => Object.assign({}, c, { alive: true }, (hooks.initCat ? hooks.initCat(c, level) : {}))),
      holes: level.holes.map(h => Object.assign({}, h, {
        remaining: h.remaining,
        shape: h.shape ? h.shape.map(p => [p[0], p[1]]) : [[0, 0]],
        done: h.remaining === 0
      }, (hooks.initHole ? hooks.initHole(h, level) : {}))),
      walls: (level.walls || []).map(w => [w[0], w[1]])
    };

    if (hooks.initState) {
      Object.assign(state, hooks.initState(level));
    }

    function getState() {
      const s = {
        status: state.status,
        loseReason: state.loseReason,
        turn: state.turn,
        cats: state.cats.map(c => Object.assign({}, c)),
        holes: state.holes.map(h => Object.assign({}, h, {
          shape: h.shape.map(p => [p[0], p[1]])
        })),
        walls: state.walls.map(w => [w[0], w[1]])
      };
      if (hooks.extraState) {
        Object.assign(s, hooks.extraState(state));
      }
      return JSON.parse(JSON.stringify(s));
    }

    function move(h, dx, dy) {
      // 1. 'not-playing'
      if (state.status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }

      // 2. 'bad-move'
      if (!Number.isInteger(h) || h < 0 || h >= state.holes.length ||
          state.holes[h].done || state.holes[h].remaining === 0 ||
          !Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) + Math.abs(dy) !== 1) {
        return { ok: false, reason: 'bad-move', events: [] };
      }

      // 3. 'axis-locked' (stripe-cat)
      if (hooks.checkAxisLocked && hooks.checkAxisLocked(state, h, dx, dy)) {
        return { ok: false, reason: 'axis-locked', events: [] };
      }

      const targetX = state.holes[h].x + dx;
      const targetY = state.holes[h].y + dy;

      // 4. 'electric-barrier' (electric-link)
      if (hooks.checkElectricBarrier && hooks.checkElectricBarrier(state, h, targetX, targetY)) {
        return { ok: false, reason: 'electric-barrier', events: [] };
      }

      // 5. 'blocked'
      if (!fits(cols, rows, state, h, targetX, targetY)) {
        return { ok: false, reason: 'blocked', events: [] };
      }

      // Hợp lệ: tăng turn và ghi nhận di chuyển
      state.turn++;
      const hole = state.holes[h];
      const from = [hole.x, hole.y];
      const to = [targetX, targetY];
      hole.x = targetX;
      hole.y = targetY;

      const events = [];

      // 1. move event
      events.push({ type: 'move', hole: h, from, to });

      // 2. (fragile) crack
      if (hooks.onMoveStep2) {
        hooks.onMoveStep2(state, h, from, to, events);
      }

      // 3. (alarm / electric)
      if (hooks.onMoveStep3) {
        hooks.onMoveStep3(state, h, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      // 4. (stripe) xung đột trước khi thu
      if (hooks.onMoveStep4) {
        hooks.onMoveStep4(state, h, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      // 5. Thu >= 1 mèo theo thứ tự level, tối đa remaining
      const holeCells = hole.shape.map(([pdx, pdy]) => [hole.x + pdx, hole.y + pdy]);
      const targetCats = state.cats.filter(c =>
        c.alive && c.color === hole.color && holeCells.some(([hx, hy]) => hx === c.x && hy === c.y)
      );
      const acceptedCats = targetCats.slice(0, hole.remaining);
      for (let i = 0; i < acceptedCats.length; i++) {
        acceptedCats[i].alive = false;
        hole.remaining--;
      }

      if (acceptedCats.length > 0) {
        events.push({
          type: 'eat',
          hole: h,
          ids: acceptedCats.map(c => c.id)
        });
      }

      // 6. (stripe) trục đổi
      if (hooks.onMoveStep6) {
        hooks.onMoveStep6(state, h, acceptedCats, events);
      }

      // 7. remaining về 0
      if (hole.remaining === 0 && !hole.done) {
        hole.done = true;
        events.push({ type: 'holeDone', hole: h });
      }

      // 8. (alarm) hố vừa xong làm đổi trạng thái
      if (hooks.onMoveStep8) {
        hooks.onMoveStep8(state, h, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      // 9. (magnet)
      if (hooks.onMoveStep9) {
        hooks.onMoveStep9(state, h, acceptedCats, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      // 10. (teleport)
      if (hooks.onMoveStep10) {
        hooks.onMoveStep10(state, h, acceptedCats, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      // 11. Mọi hố done: win
      if (state.holes.every(item => item.done)) {
        state.status = 'won';
        state.loseReason = null;
        events.push({ type: 'win' });
        return { ok: true, events };
      }

      // 12. Kiểm stuck khác (fragile, teleport, stripe)
      if (hooks.onMoveStep12) {
        hooks.onMoveStep12(state, h, events);
        if (state.status === 'lost') return { ok: true, events };
      }

      return { ok: true, events };
    }

    return {
      getState,
      move
    };
  }

  return {
    validateLevel,
    createGame,
    fits,
    canReach,
    VALID_COLORS,
    UNIT_DIRS
  };
});
