(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['magnet'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function validateLevel(level) {
    return boardMove.validateLevel(level);
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      initCat: function (c) {
        return { pulled: false };
      },
      onMoveStep9: function (state, holeIndex, acceptedCats, events) {
        const magnetCats = acceptedCats.filter(function (c) {
          return c.magnet;
        });

        for (let i = 0; i < magnetCats.length; i++) {
          const source = magnetCats[i];
          const victims = state.cats.filter(function (c) {
            return c.alive && Math.max(Math.abs(c.x - source.x), Math.abs(c.y - source.y)) <= 1;
          });

          if (victims.length > 0) {
            for (let j = 0; j < victims.length; j++) {
              victims[j].alive = false;
              victims[j].pulled = true;
            }

            events.push({
              type: 'magnet',
              source: source.id,
              ids: victims.map(function (v) {
                return v.id;
              })
            });

            const stuck = state.holes.some(function (h) {
              return !h.done && h.remaining > state.cats.filter(function (c) {
                return c.alive && c.color === h.color;
              }).length;
            });

            if (stuck) {
              state.status = 'lost';
              state.loseReason = 'stuck';
              events.push({ type: 'lose', reason: 'stuck' });
              return;
            }
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
