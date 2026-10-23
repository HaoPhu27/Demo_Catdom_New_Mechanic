(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['sick'] = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VALID_COLORS = new Set(['blue', 'green', 'orange', 'purple', 'pink', 'yellow']);
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

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
    } else if (level.cats.length === 0) {
      errors.push('không có mèo trên bàn nào để bệnh');
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

    const boxPositions = new Set();
    const boxCatIds = new Set();
    let totalBoxCats = 0;

    if (level.boxes !== undefined && level.boxes !== null) {
      if (!Array.isArray(level.boxes)) {
        errors.push('boxes phải là mảng');
      } else {
        const boxIds = new Set();
        for (const b of level.boxes) {
          if (!b || typeof b !== 'object') {
            errors.push('box phải là object');
            continue;
          }

          if (typeof b.id !== 'string' || !b.id) {
            errors.push('id box không hợp lệ');
          } else {
            if (boxIds.has(b.id)) {
              errors.push('id box trùng');
            }
            boxIds.add(b.id);
          }

          const validPos = Number.isInteger(b.x) && Number.isInteger(b.y);
          if (!validPos) {
            errors.push('tọa độ box phải là số nguyên');
          } else {
            if (hasValidCols && hasValidRows && (b.x < 0 || b.x >= level.cols || b.y < 0 || b.y >= level.rows)) {
              errors.push('box ngoài bàn');
            }
            const posKey = `${b.x},${b.y}`;
            if (catPositions.has(posKey)) {
              errors.push('box trùng ô mèo');
            }
            if (boxPositions.has(posKey)) {
              errors.push('box trùng ô box khác');
            }
            boxPositions.add(posKey);
          }

          if (!Array.isArray(b.cats)) {
            errors.push('box.cats phải là mảng');
          } else {
            totalBoxCats += b.cats.length;
            for (const bc of b.cats) {
              if (!bc || typeof bc !== 'object') {
                errors.push('mèo trong box phải là object');
                continue;
              }

              if (typeof bc.id !== 'string' || !bc.id) {
                errors.push('id mèo box không hợp lệ');
              } else {
                if (catIds.has(bc.id)) {
                  errors.push('id trùng giữa mèo bàn và mèo box');
                }
                if (boxCatIds.has(bc.id)) {
                  errors.push('id mèo trùng');
                }
                boxCatIds.add(bc.id);
              }

              if (!VALID_COLORS.has(bc.color)) {
                errors.push('màu không hợp lệ');
              }
            }
          }
        }
      }
    }

    if (level.initialSick !== undefined && level.initialSick !== null) {
      if (typeof level.initialSick !== 'string') {
        errors.push('initialSick phải là string');
      } else if (catIds.has(level.initialSick)) {
        // valid
      } else if (boxCatIds.has(level.initialSick)) {
        errors.push('initialSick không phải mèo trên bàn');
      } else {
        errors.push('initialSick không tồn tại');
      }
    }

    const totalCats = (Array.isArray(level.cats) ? level.cats.length : 0) + totalBoxCats;
    const loseRatio = typeof level.loseRatio === 'number' ? level.loseRatio : 0.5;
    if (totalCats > 0 && 1 >= loseRatio * totalCats - 1e-9) {
      errors.push('trạng thái đầu đã thua');
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
    const loseRatio = typeof level.loseRatio === 'number' ? level.loseRatio : 0.5;

    let status = 'playing';
    let loseReason = null;
    let clearedCount = 0;

    const cats = level.cats.map(c => ({
      id: c.id,
      color: c.color,
      x: c.x,
      y: c.y,
      alive: true,
      sick: false
    }));

    let initialSickId = level.initialSick;
    if (typeof initialSickId !== 'string') {
      const seed = typeof level.seed === 'number' ? level.seed : 1;
      const rand = mulberry32(seed);
      const pool = cats.map(c => c.id);
      initialSickId = pool[Math.floor(rand() * pool.length)];
    }

    for (const c of cats) {
      if (c.id === initialSickId) {
        c.sick = true;
      }
    }

    const boxes = (level.boxes || []).map(b => ({
      id: b.id,
      x: b.x,
      y: b.y,
      queue: (b.cats || []).map(c => ({
        id: c.id,
        color: c.color
      }))
    }));

    function getState() {
      return {
        status,
        loseReason,
        cats: cats.map(c => ({
          id: c.id,
          color: c.color,
          x: c.x,
          y: c.y,
          alive: c.alive,
          sick: c.sick
        })),
        clearedCount,
        boxes: boxes.map(b => ({
          id: b.id,
          x: b.x,
          y: b.y,
          queue: b.queue.map(q => ({
            id: q.id,
            color: q.color
          }))
        })),
        sickCount: cats.filter(c => c.alive && c.sick).length,
        totalRemaining: cats.filter(c => c.alive).length + boxes.reduce((sum, b) => sum + b.queue.length, 0),
        loseRatio
      };
    }

    function groupAt(x, y) {
      if (status !== 'playing') return [];
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= cols || y < 0 || y >= rows) {
        return [];
      }

      const box = boxes.find(b => b.x === x && b.y === y);
      if (box) {
        return box.queue.length > 0 ? [box.queue[0].id] : [];
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

      const box = boxes.find(b => b.x === x && b.y === y);
      let healthyCount = 0;
      const events = [];

      if (box) {
        if (box.queue.length === 0) {
          return { ok: false, reason: 'empty', events: [] };
        }
        const eatenCat = box.queue.shift();
        clearedCount++;
        healthyCount = 1;
        events.push({ type: 'eat', ids: [eatenCat.id] });
        const nextCat = box.queue.length > 0 ? { id: box.queue[0].id, color: box.queue[0].color } : null;
        events.push({ type: 'boxNext', boxId: box.id, next: nextCat });
      } else {
        const groupIds = groupAt(x, y);
        if (groupIds.length === 0) {
          return { ok: false, reason: 'empty', events: [] };
        }
        events.push({ type: 'eat', ids: groupIds });
        const idSet = new Set(groupIds);
        for (const c of cats) {
          if (idSet.has(c.id)) {
            if (!c.sick) {
              healthyCount++;
            }
            c.alive = false;
            clearedCount++;
          }
        }
      }

      for (let i = 0; i < healthyCount; i++) {
        const currentSick = cats.filter(c => c.alive && c.sick);
        if (currentSick.length === 0) break;
        const currentHealthy = cats.filter(c => c.alive && !c.sick);
        if (currentHealthy.length === 0) break;

        let bestTarget = null;
        let bestTargetDist = Infinity;
        for (const t of currentHealthy) {
          let minD = Infinity;
          for (const s of currentSick) {
            const d = Math.abs(t.x - s.x) + Math.abs(t.y - s.y);
            if (d < minD) minD = d;
          }
          if (minD < bestTargetDist) {
            bestTargetDist = minD;
            bestTarget = t;
          } else if (minD === bestTargetDist) {
            if (t.y < bestTarget.y || (t.y === bestTarget.y && t.x < bestTarget.x)) {
              bestTarget = t;
            }
          }
        }

        let bestSource = null;
        let bestSourceDist = Infinity;
        for (const s of currentSick) {
          const d = Math.abs(bestTarget.x - s.x) + Math.abs(bestTarget.y - s.y);
          if (d < bestSourceDist) {
            bestSourceDist = d;
            bestSource = s;
          } else if (d === bestSourceDist) {
            if (s.y < bestSource.y || (s.y === bestSource.y && s.x < bestSource.x)) {
              bestSource = s;
            }
          }
        }

        bestTarget.sick = true;
        events.push({ type: 'infect', from: bestSource.id, to: bestTarget.id });
      }

      const currentSickCount = cats.filter(c => c.alive && c.sick).length;
      const currentTotalRemaining = cats.filter(c => c.alive).length + boxes.reduce((sum, b) => sum + b.queue.length, 0);

      if (currentTotalRemaining > 0 && currentSickCount >= loseRatio * currentTotalRemaining - 1e-9) {
        status = 'lost';
        loseReason = 'sick';
        events.push({ type: 'lose', reason: 'sick', sick: currentSickCount, total: currentTotalRemaining });
      } else if (currentTotalRemaining === 0) {
        status = 'won';
        events.push({ type: 'win' });
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
