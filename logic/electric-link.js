(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['electric-link'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function getBarrierCells(pads) {
    if (!Array.isArray(pads) || pads.length !== 2) return [];
    const p1 = pads[0];
    const p2 = pads[1];
    if (!Array.isArray(p1) || !Array.isArray(p2) || p1.length !== 2 || p2.length !== 2) return [];
    const ax = p1[0];
    const ay = p1[1];
    const bx = p2[0];
    const by = p2[1];
    if (ax !== bx && ay !== by) return [];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    const count = Math.max(0, steps - 1);
    const signX = Math.sign(bx - ax);
    const signY = Math.sign(by - ay);
    const cells = [];
    for (let i = 1; i <= count; i++) {
      cells.push([ax + signX * i, ay + signY * i]);
    }
    return cells;
  }

  function isElectricActive(pads, holes) {
    if (!Array.isArray(pads) || pads.length !== 2) return false;
    const padA = pads[0];
    const padB = pads[1];
    let holeAIndex = -1;
    let holeBIndex = -1;

    for (let i = 0; i < holes.length; i++) {
      const h = holes[i];
      if (h.done || (h.remaining !== undefined && h.remaining <= 0)) continue;
      const shape = h.shape || [[0, 0]];
      for (let s = 0; s < shape.length; s++) {
        const cx = h.x + shape[s][0];
        const cy = h.y + shape[s][1];
        if (cx === padA[0] && cy === padA[1]) {
          holeAIndex = i;
        }
        if (cx === padB[0] && cy === padB[1]) {
          holeBIndex = i;
        }
      }
    }

    return holeAIndex >= 0 && holeBIndex >= 0 && holeAIndex !== holeBIndex;
  }

  function checkElectricHit(barrier, cats, holes) {
    if (!barrier || barrier.length === 0) return false;

    const catHit = cats.some(function (c) {
      if (!c.alive) return false;
      return barrier.some(function ([bx, by]) {
        return bx === c.x && by === c.y;
      });
    });
    if (catHit) return true;

    const holeHit = holes.some(function (h) {
      if (h.done || (h.remaining !== undefined && h.remaining <= 0)) return false;
      const shape = h.shape || [[0, 0]];
      return shape.some(function ([dx, dy]) {
        const cx = h.x + dx;
        const cy = h.y + dy;
        return barrier.some(function ([bx, by]) {
          return bx === cx && by === cy;
        });
      });
    });

    return holeHit;
  }

  function validateLevel(level) {
    return boardMove.validateLevel(level);
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      initState: function (lvl) {
        const pads = (lvl.pads || []).map(function (p) {
          return [p[0], p[1]];
        });
        const barrier = getBarrierCells(pads);
        const electricOn = isElectricActive(pads, lvl.holes);
        return {
          pads: pads,
          barrier: barrier,
          electricOn: electricOn
        };
      },
      extraState: function (state) {
        return {
          pads: state.pads.map(function (p) {
            return [p[0], p[1]];
          }),
          barrier: state.barrier.map(function (p) {
            return [p[0], p[1]];
          }),
          electricOn: state.electricOn
        };
      },
      checkElectricBarrier: function (state, holeIndex, targetX, targetY) {
        if (!state.electricOn) return false;
        if (!state.barrier || state.barrier.length === 0) return false;
        const hole = state.holes[holeIndex];
        const shape = hole.shape || [[0, 0]];
        return shape.some(function ([dx, dy]) {
          const cx = targetX + dx;
          const cy = targetY + dy;
          return state.barrier.some(function ([bx, by]) {
            return bx === cx && by === cy;
          });
        });
      },
      onMoveStep3: function (state, holeIndex, events) {
        const nextElectricOn = isElectricActive(state.pads, state.holes);
        const changed = nextElectricOn !== state.electricOn;
        if (changed) {
          state.electricOn = nextElectricOn;
          events.push({ type: nextElectricOn ? 'electricOn' : 'electricOff' });
        }

        if (state.electricOn) {
          if (checkElectricHit(state.barrier, state.cats, state.holes)) {
            state.status = 'lost';
            state.loseReason = 'electric';
            events.push({ type: 'lose', reason: 'electric' });
          }
        }
      }
    });
  }

  return {
    validateLevel: validateLevel,
    createGame: createGame
  };
});
