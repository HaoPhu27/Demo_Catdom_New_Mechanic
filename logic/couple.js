(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['couple'] = api;
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

    const coupleIds = new Set();
    const seenMarks = new Set();

    if (!Array.isArray(level.couples)) {
      errors.push('couples phải là mảng');
    } else {
      for (const cp of level.couples) {
        if (!cp || typeof cp !== 'object') {
          errors.push('cặp phải là object');
          continue;
        }

        if (typeof cp.id !== 'string' || !cp.id) {
          errors.push('id cặp không hợp lệ');
        } else {
          if (coupleIds.has(cp.id)) {
            errors.push('id cặp trùng');
          }
          coupleIds.add(cp.id);
        }

        if (!Number.isInteger(cp.n) || cp.n < 1) {
          errors.push('n phải là số nguyên >= 1');
        }

        if (!VALID_COLORS.has(cp.mark)) {
          errors.push('mark không hợp lệ');
        } else {
          if (seenMarks.has(cp.mark)) {
            errors.push('mark trùng giữa các cặp');
          }
          seenMarks.add(cp.mark);
        }
      }
    }

    if (Array.isArray(level.cats) && Array.isArray(level.couples)) {
      const counts = {};
      for (const id of coupleIds) {
        counts[id] = 0;
      }

      for (const c of level.cats) {
        if (c && typeof c === 'object' && c.couple !== undefined) {
          if (typeof c.couple !== 'string' || !coupleIds.has(c.couple)) {
            errors.push('mèo trỏ tới cặp không tồn tại');
          } else {
            counts[c.couple] = (counts[c.couple] || 0) + 1;
          }
        }
      }

      for (const id of coupleIds) {
        if (counts[id] !== 2) {
          errors.push('cặp không có đúng 2 mèo');
        }
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

    const couples = level.couples.map(cp => {
      const coupleCats = level.cats
        .filter(c => c && c.couple === cp.id)
        .map(c => c.id);
      return {
        id: cp.id,
        n: cp.n,
        mark: cp.mark,
        cats: coupleCats,
        state: 'idle',
        target: null,
        remaining: null
      };
    });

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
        couples: couples.map(cp => ({
          id: cp.id,
          n: cp.n,
          mark: cp.mark,
          cats: [...cp.cats],
          state: cp.state,
          target: cp.target,
          remaining: cp.remaining
        }))
      };
    }

    function groupAt(x, y) {
      if (status !== 'playing') return [];
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= cols || y < 0 || y >= rows) {
        return [];
      }

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

      for (const cp of couples) {
        if (cp.state === 'idle') {
          const eatenInCp = cp.cats.filter(id => idSet.has(id));
          if (eatenInCp.length === 2) {
            cp.state = 'safe';
            events.push({ type: 'coupleSafe', couple: cp.id });
          } else if (eatenInCp.length === 1) {
            const by = eatenInCp[0];
            const target = cp.cats.find(id => id !== by);
            cp.state = 'counting';
            cp.target = target;
            cp.remaining = cp.n;
            events.push({
              type: 'coupleTrigger',
              couple: cp.id,
              by,
              target,
              remaining: cp.remaining
            });
          }
        } else if (cp.state === 'counting') {
          if (idSet.has(cp.target)) {
            cp.state = 'safe';
            events.push({ type: 'coupleSafe', couple: cp.id });
          } else {
            cp.remaining -= groupIds.length;
            events.push({
              type: 'coupleCount',
              couple: cp.id,
              target: cp.target,
              remaining: cp.remaining
            });
            if (cp.remaining <= 0) {
              cp.state = 'broken';
              status = 'lost';
              loseReason = 'couple';
              events.push({ type: 'lose', reason: 'couple', couple: cp.id });
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

    return {
      getState,
      groupAt,
      eat
    };
  }

  return { validateLevel, createGame };
});
