(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['fragile-floor'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function validateFloors(level) {
    const errors = [];
    if (!level || typeof level !== 'object') return errors;
    if (level.floors === undefined) return errors;
    if (!Array.isArray(level.floors)) {
      errors.push('floors phải là mảng');
      return errors;
    }
    const hasValidCols = Number.isInteger(level.cols) && level.cols >= 1;
    const hasValidRows = Number.isInteger(level.rows) && level.rows >= 1;
    const floorPositions = new Set();
    const wallSet = new Set();
    if (Array.isArray(level.walls)) {
      for (let i = 0; i < level.walls.length; i++) {
        const w = level.walls[i];
        if (Array.isArray(w) && w.length === 2 && Number.isInteger(w[0]) && Number.isInteger(w[1])) {
          wallSet.add(w[0] + ',' + w[1]);
        }
      }
    }

    for (let i = 0; i < level.floors.length; i++) {
      const f = level.floors[i];
      if (!f || typeof f !== 'object') {
        errors.push('sàn phải là object');
        continue;
      }
      if (!Number.isInteger(f.x) || !Number.isInteger(f.y)) {
        errors.push('tọa độ sàn phải là số nguyên');
      } else {
        if (hasValidCols && hasValidRows && (f.x < 0 || f.x >= level.cols || f.y < 0 || f.y >= level.rows)) {
          errors.push('sàn ngoài bàn');
        }
        if (wallSet.has(f.x + ',' + f.y)) {
          errors.push('sàn trùng tường');
        }
        const key = f.x + ',' + f.y;
        if (floorPositions.has(key)) {
          errors.push('hai sàn cùng ô');
        }
        floorPositions.add(key);
      }
      if (!Number.isInteger(f.durability) || f.durability < 0) {
        errors.push('durability không phải số nguyên >= 0');
      }
      if (f.max !== undefined && (!Number.isInteger(f.max) || f.max < f.durability)) {
        errors.push('max phải là số nguyên >= durability');
      }
    }
    return errors;
  }

  function validateLevel(level) {
    return boardMove.validateLevel(level, validateFloors);
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      validateExtra: validateFloors,
      initState: function (lvl) {
        return {
          floors: (lvl.floors || []).map(function (f) {
            return {
              x: f.x,
              y: f.y,
              durability: f.durability,
              max: f.max !== undefined ? f.max : f.durability
            };
          })
        };
      },
      extraState: function (state) {
        return {
          floors: state.floors.map(function (f) {
            return {
              x: f.x,
              y: f.y,
              durability: f.durability,
              max: f.max
            };
          })
        };
      },
      onMoveStep2: function (state, holeIndex, from, to, events) {
        if (!state.floors || state.floors.length === 0) return;
        const hole = state.holes[holeIndex];
        const oldCells = hole.shape.map(function (p) {
          return [from[0] + p[0], from[1] + p[1]];
        });
        const newCells = hole.shape.map(function (p) {
          return [to[0] + p[0], to[1] + p[1]];
        });

        for (let i = 0; i < state.floors.length; i++) {
          const f = state.floors[i];
          const inNew = newCells.some(function (p) {
            return p[0] === f.x && p[1] === f.y;
          });
          const inOld = oldCells.some(function (p) {
            return p[0] === f.x && p[1] === f.y;
          });

          if (inNew && !inOld) {
            f.durability = Math.max(0, f.durability - 1);
            events.push({
              type: 'crack',
              x: f.x,
              y: f.y,
              durability: f.durability
            });
          }
        }
      },
      onMoveStep12: function (state, holeIndex, events) {
        const aliveCats = state.cats.filter(function (c) {
          return c.alive;
        });
        const activeHoles = state.holes.filter(function (h) {
          return !h.done && h.remaining > 0;
        });

        const stranded = aliveCats.some(function (c) {
          return !activeHoles.some(function (h) {
            if (h.color !== c.color) return false;
            const hIdx = state.holes.indexOf(h);
            return boardMove.canReach(state.cols, state.rows, state, hIdx, c);
          });
        });

        if (stranded) {
          state.status = 'lost';
          state.loseReason = 'stuck';
          events.push({ type: 'lose', reason: 'stuck' });
        }
      }
    });
  }

  return {
    validateLevel: validateLevel,
    createGame: createGame
  };
});
