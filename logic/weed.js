(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['weed'] = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VALID_COLORS = new Set(['blue', 'green', 'orange', 'purple', 'pink', 'yellow']);
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function validateLevel(level) {
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

    const catIds = new Set();
    const catPositions = new Set();

    if (!Array.isArray(level.cats)) {
      errors.push('cats phải là mảng');
    } else {
      for (const c of level.cats) {
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
          const posKey = `${c.x},${c.y}`;
          if (catPositions.has(posKey)) {
            errors.push('hai mèo cùng ô');
          }
          catPositions.add(posKey);
        }
      }
    }

    const wa = level.weedArea;
    let waValid = false;
    if (!wa || typeof wa !== 'object') {
      errors.push('weedArea phải là object');
    } else if (!Number.isInteger(wa.x) || !Number.isInteger(wa.y) || !Number.isInteger(wa.w) || !Number.isInteger(wa.h) || wa.w < 1 || wa.h < 1) {
      errors.push('weedArea x, y, w, h phải là số nguyên và w, h >= 1');
    } else if (hasValidCols && hasValidRows && (wa.x < 0 || wa.y < 0 || wa.x + wa.w > level.cols || wa.y + wa.h > level.rows)) {
      errors.push('khu vực ra ngoài bàn');
    } else {
      waValid = true;
    }

    if (waValid && Array.isArray(level.cats)) {
      for (const c of level.cats) {
        if (c && Number.isInteger(c.x) && Number.isInteger(c.y)) {
          if (c.x >= wa.x && c.x < wa.x + wa.w && c.y >= wa.y && c.y < wa.y + wa.h) {
            errors.push('mèo trong khu vực');
          }
        }
      }
    }

    const ws = level.weedStart;
    if (!Array.isArray(ws) || ws.length === 0) {
      errors.push('weedStart rỗng');
    } else {
      const seenWeed = new Set();
      let hasDup = false;
      let hasOut = false;
      for (const pt of ws) {
        if (!Array.isArray(pt) || pt.length < 2 || !Number.isInteger(pt[0]) || !Number.isInteger(pt[1])) {
          errors.push('ô trong weedStart không hợp lệ');
          continue;
        }
        const [cx, cy] = pt;
        const key = `${cx},${cy}`;
        if (seenWeed.has(key)) {
          hasDup = true;
        }
        seenWeed.add(key);

        if (waValid) {
          if (cx < wa.x || cx >= wa.x + wa.w || cy < wa.y || cy >= wa.y + wa.h) {
            hasOut = true;
          }
        }
      }
      if (hasDup) {
        errors.push('weedStart trùng');
      }
      if (hasOut) {
        errors.push('weedStart ngoài khu vực');
      }
      if (waValid) {
        let insideCount = 0;
        for (const k of seenWeed) {
          const [cx, cy] = k.split(',').map(Number);
          if (cx >= wa.x && cx < wa.x + wa.w && cy >= wa.y && cy < wa.y + wa.h) {
            insideCount++;
          }
        }
        if (insideCount >= wa.w * wa.h) {
          errors.push('weedStart đã phủ kín');
        }
      }
    }

    const p = level.pesticide;
    if (!p || typeof p !== 'object' || !Number.isInteger(p.x) || !Number.isInteger(p.y)) {
      errors.push('thuốc sâu không hợp lệ');
    } else {
      if (hasValidCols && hasValidRows && (p.x < 0 || p.x >= level.cols || p.y < 0 || p.y >= level.rows)) {
        errors.push('thuốc sâu ngoài bàn');
      }
      if (waValid && p.x >= wa.x && p.x < wa.x + wa.w && p.y >= wa.y && p.y < wa.y + wa.h) {
        errors.push('thuốc sâu nằm trong khu vực');
      }
      if (catPositions.has(`${p.x},${p.y}`)) {
        errors.push('thuốc sâu trùng ô mèo');
      }
    }

    return errors;
  }

  function createGame(level) {
    const errors = validateLevel(level);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    const cols = level.cols;
    const rows = level.rows;
    let status = 'playing';
    let loseReason = null;
    let clearedCount = 0;

    const cats = level.cats.map(c => ({
      id: c.id,
      color: c.color,
      x: c.x,
      y: c.y,
      alive: true
    }));

    const weed = {
      area: {
        x: level.weedArea.x,
        y: level.weedArea.y,
        w: level.weedArea.w,
        h: level.weedArea.h
      },
      cells: level.weedStart.map(([x, y]) => [x, y]),
      total: level.weedArea.w * level.weedArea.h,
      cleared: false
    };

    const pesticide = {
      x: level.pesticide.x,
      y: level.pesticide.y,
      picked: false
    };

    function getState() {
      return {
        status,
        loseReason,
        cats: cats.map(c => ({
          id: c.id,
          color: c.color,
          x: c.x,
          y: c.y,
          alive: c.alive
        })),
        clearedCount,
        weed: {
          area: { ...weed.area },
          cells: weed.cells.map(([x, y]) => [x, y]),
          total: weed.total,
          cleared: weed.cleared
        },
        pesticide: { ...pesticide }
      };
    }

    function groupAt(x, y) {
      if (status !== 'playing') return [];
      if (!Number.isInteger(x) || !Number.isInteger(y)) return [];
      if (x < 0 || x >= cols || y < 0 || y >= rows) return [];

      const startCat = cats.find(c => c.alive && c.x === x && c.y === y);
      if (!startCat) return [];

      const targetColor = startCat.color;
      const aliveMap = new Map();
      for (const c of cats) {
        if (c.alive && c.color === targetColor) {
          aliveMap.set(`${c.x},${c.y}`, c);
        }
      }

      const visited = new Set([`${x},${y}`]);
      const queue = [`${x},${y}`];
      const result = [];

      while (queue.length > 0) {
        const key = queue.shift();
        const cat = aliveMap.get(key);
        if (!cat) continue;
        result.push(cat);

        for (const [dx, dy] of DIRS) {
          const nx = cat.x + dx;
          const ny = cat.y + dy;
          const nkey = `${nx},${ny}`;
          if (aliveMap.has(nkey) && !visited.has(nkey)) {
            visited.add(nkey);
            queue.push(nkey);
          }
        }
      }

      result.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });

      return result.map(c => c.id);
    }

    function getNextWeedCell() {
      const area = weed.area;
      const coveredSet = new Set(weed.cells.map(([cx, cy]) => `${cx},${cy}`));
      if (coveredSet.size >= weed.total) return null;

      const candidates = new Map();
      for (const [cx, cy] of weed.cells) {
        for (const [dx, dy] of DIRS) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= area.x && nx < area.x + area.w && ny >= area.y && ny < area.y + area.h) {
            const key = `${nx},${ny}`;
            if (!coveredSet.has(key)) {
              candidates.set(key, [nx, ny]);
            }
          }
        }
      }

      const list = Array.from(candidates.values());
      if (list.length === 0) return null;

      list.sort((a, b) => {
        if (a[1] !== b[1]) return a[1] - b[1];
        return a[0] - b[0];
      });

      return list[0];
    }

    function eat(x, y) {
      if (status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= cols || y < 0 || y >= rows) {
        return { ok: false, reason: 'out-of-board', events: [] };
      }

      const groupIds = groupAt(x, y);
      if (groupIds.length === 0) {
        return { ok: false, reason: 'empty', events: [] };
      }

      const events = [{ type: 'eat', ids: groupIds }];

      const idSet = new Set(groupIds);
      for (const c of cats) {
        if (idSet.has(c.id)) {
          c.alive = false;
        }
      }
      clearedCount += groupIds.length;

      if (!weed.cleared) {
        for (let i = 0; i < groupIds.length; i++) {
          const cell = getNextWeedCell();
          if (cell) {
            weed.cells.push(cell);
            const covered = weed.cells.length;
            events.push({
              type: 'weedGrow',
              cell,
              covered,
              total: weed.total
            });
            if (covered === weed.total) {
              status = 'lost';
              loseReason = 'weed';
              events.push({ type: 'lose', reason: 'weed' });
              break;
            }
          }
        }
      }

      if (status === 'playing') {
        const allDead = cats.every(c => !c.alive);
        if (allDead) {
          status = 'won';
          events.push({ type: 'win' });
        }
      }

      return { ok: true, events };
    }

    function pickPesticide() {
      if (status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }
      if (pesticide.picked) {
        return { ok: false, reason: 'already-picked', events: [] };
      }

      const clearedCells = weed.cells.map(([x, y]) => [x, y]);
      weed.cells = [];
      weed.cleared = true;
      pesticide.picked = true;

      return {
        ok: true,
        events: [
          { type: 'pick' },
          { type: 'weedClear', cells: clearedCells }
        ]
      };
    }

    return {
      getState,
      groupAt,
      eat,
      pickPesticide
    };
  }

  return { validateLevel, createGame };
});
