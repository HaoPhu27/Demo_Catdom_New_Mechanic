(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['stripe-cat'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function cloneSearchState(s) {
    return {
      cols: s.cols,
      rows: s.rows,
      walls: s.walls,
      holes: s.holes.map(function (h) {
        return {
          color: h.color,
          x: h.x,
          y: h.y,
          remaining: h.remaining,
          done: h.done,
          shape: h.shape,
          axis: h.axis
        };
      }),
      cats: s.cats.map(function (c) {
        return {
          id: c.id,
          color: c.color,
          x: c.x,
          y: c.y,
          alive: c.alive,
          kind: c.kind
        };
      })
    };
  }

  function signature(s) {
    let sig = '';
    for (let i = 0; i < s.holes.length; i++) {
      const h = s.holes[i];
      if (i > 0) sig += '|';
      if (h.done || h.remaining <= 0) {
        sig += 'done';
      } else {
        sig += h.x + ',' + h.y + ',' + h.remaining + ',' + h.axis;
      }
    }
    sig += '/';
    for (let i = 0; i < s.cats.length; i++) {
      sig += s.cats[i].alive ? '1' : '0';
    }
    return sig;
  }

  function simulateMove(current, hi, dx, dy) {
    const hole = current.holes[hi];
    const targetX = hole.x + dx;
    const targetY = hole.y + dy;

    if (!boardMove.fits(current.cols, current.rows, current, hi, targetX, targetY)) {
      return null;
    }

    const targetCells = hole.shape.map(function (p) {
      return [targetX + p[0], targetY + p[1]];
    });
    const targetCats = current.cats.filter(function (c) {
      return c.alive && c.color === hole.color &&
        targetCells.some(function (p) {
          return p[0] === c.x && p[1] === c.y;
        });
    });

    if (hole.remaining > 1) {
      const hasH = targetCats.some(function (c) { return c.kind === 'STRIPE_H'; });
      const hasV = targetCats.some(function (c) { return c.kind === 'STRIPE_V'; });
      if (hasH && hasV) return null;

      const acceptedCats = targetCats.slice(0, hole.remaining);
      const conflict = acceptedCats.some(function (c) {
        if (hole.axis === 'HORIZONTAL' && c.kind === 'STRIPE_V') return true;
        if (hole.axis === 'VERTICAL' && c.kind === 'STRIPE_H') return true;
        return false;
      });
      if (conflict) return null;
    }

    const next = cloneSearchState(current);
    const nextHole = next.holes[hi];
    nextHole.x = targetX;
    nextHole.y = targetY;

    const nextTargetCats = next.cats.filter(function (c) {
      return c.alive && c.color === nextHole.color &&
        targetCells.some(function (p) {
          return p[0] === c.x && p[1] === c.y;
        });
    });
    const nextAccepted = nextTargetCats.slice(0, nextHole.remaining);
    for (let i = 0; i < nextAccepted.length; i++) {
      const c = nextAccepted[i];
      c.alive = false;
      nextHole.remaining--;
      if (c.kind === 'STRIPE_H') {
        nextHole.axis = 'HORIZONTAL';
      } else if (c.kind === 'STRIPE_V') {
        nextHole.axis = 'VERTICAL';
      }
    }

    if (nextHole.remaining === 0) {
      nextHole.done = true;
    }

    if (next.holes.every(function (h) { return h.done || h.remaining === 0; })) {
      return 'WON';
    }

    return next;
  }

  function canComplete(initialState) {
    if (initialState.holes.every(function (h) { return h.done || h.remaining === 0; })) {
      return true;
    }

    const totalNeededByColor = {};
    for (let i = 0; i < initialState.holes.length; i++) {
      const h = initialState.holes[i];
      if (!h.done && h.remaining > 0) {
        totalNeededByColor[h.color] = (totalNeededByColor[h.color] || 0) + h.remaining;
      }
    }
    for (const color in totalNeededByColor) {
      let aliveCount = 0;
      for (let j = 0; j < initialState.cats.length; j++) {
        if (initialState.cats[j].alive && initialState.cats[j].color === color) {
          aliveCount++;
        }
      }
      if (totalNeededByColor[color] > aliveCount) {
        return false;
      }
    }

    const stack = [cloneSearchState(initialState)];
    const seen = new Set([signature(initialState)]);

    while (stack.length > 0) {
      const current = stack.pop();

      for (let hi = 0; hi < current.holes.length; hi++) {
        const h = current.holes[hi];
        if (h.done || h.remaining <= 0) continue;

        let dirs;
        if (h.axis === 'HORIZONTAL') {
          dirs = [[1, 0], [-1, 0]];
        } else if (h.axis === 'VERTICAL') {
          dirs = [[0, 1], [0, -1]];
        } else {
          dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        }

        for (let d = 0; d < dirs.length; d++) {
          const [dx, dy] = dirs[d];
          const res = simulateMove(current, hi, dx, dy);
          if (!res) continue;
          if (res === 'WON') return true;

          const sig = signature(res);
          if (!seen.has(sig)) {
            seen.add(sig);
            stack.push(res);
          }
        }
      }
    }

    return false;
  }

  function validateLevel(level) {
    return boardMove.validateLevel(level);
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      initHole: function () {
        return { axis: 'FREE' };
      },
      checkAxisLocked: function (state, h, dx, dy) {
        const hole = state.holes[h];
        if (hole.axis === 'HORIZONTAL' && dy !== 0) return true;
        if (hole.axis === 'VERTICAL' && dx !== 0) return true;
        return false;
      },
      onMoveStep4: function (state, h, events) {
        const hole = state.holes[h];
        if (hole.remaining <= 1) return;

        const holeCells = hole.shape.map(function (p) {
          return [hole.x + p[0], hole.y + p[1]];
        });
        const targetCats = state.cats.filter(function (c) {
          return c.alive && c.color === hole.color && holeCells.some(function (p) {
            return p[0] === c.x && p[1] === c.y;
          });
        });

        const hasH = targetCats.some(function (c) {
          return c.kind === 'STRIPE_H';
        });
        const hasV = targetCats.some(function (c) {
          return c.kind === 'STRIPE_V';
        });

        if (hasH && hasV) {
          state.status = 'lost';
          state.loseReason = 'stripe';
          events.push({ type: 'lose', reason: 'stripe' });
          return;
        }

        const acceptedCats = targetCats.slice(0, hole.remaining);
        const conflict = acceptedCats.some(function (c) {
          if (hole.axis === 'HORIZONTAL' && c.kind === 'STRIPE_V') return true;
          if (hole.axis === 'VERTICAL' && c.kind === 'STRIPE_H') return true;
          return false;
        });

        if (conflict) {
          state.status = 'lost';
          state.loseReason = 'stripe';
          events.push({ type: 'lose', reason: 'stripe' });
          return;
        }
      },
      onMoveStep6: function (state, h, acceptedCats, events) {
        const hole = state.holes[h];
        let newAxis = hole.axis;
        for (let i = 0; i < acceptedCats.length; i++) {
          const c = acceptedCats[i];
          if (c.kind === 'STRIPE_H') {
            newAxis = 'HORIZONTAL';
          } else if (c.kind === 'STRIPE_V') {
            newAxis = 'VERTICAL';
          }
        }
        if (newAxis !== hole.axis) {
          hole.axis = newAxis;
          events.push({ type: 'axis', hole: h, axis: newAxis });
        }
      },
      onMoveStep12: function (state, h, events) {
        if (!canComplete(state)) {
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
