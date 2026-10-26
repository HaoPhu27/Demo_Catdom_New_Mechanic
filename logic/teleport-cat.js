(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['teleport-cat'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function validateLevel(level) {
    return boardMove.validateLevel(level);
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      onMoveStep10: function (state, holeIndex, acceptedCats, events) {
        const arrowCats = acceptedCats.filter(function (c) {
          return Boolean(c.arrow);
        });

        for (let i = 0; i < arrowCats.length; i++) {
          const source = arrowCats[i];
          const dx = source.arrow[0];
          const dy = source.arrow[1];

          const occupied = state.cats
            .filter(function (c) { return c.alive; })
            .map(function (c) { return [c.x, c.y]; });

          const sameColorCats = state.cats.filter(function (c) {
            return c.alive && c.color === source.color;
          });

          for (let j = 0; j < sameColorCats.length; j++) {
            const cat = sameColorCats[j];
            const nx = cat.x + dx;
            const ny = cat.y + dy;

            const isOutOfBounds = nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows;
            const isWall = !isOutOfBounds && state.walls.some(function (w) {
              return w[0] === nx && w[1] === ny;
            });
            const isOccupiedByCat = occupied.some(function (p) {
              return p[0] === nx && p[1] === ny;
            });
            const isOccupiedByHole = state.holes.some(function (h) {
              return !h.done && h.remaining > 0 && h.shape.some(function (p) {
                return (h.x + p[0]) === nx && (h.y + p[1]) === ny;
              });
            });

            if (isOutOfBounds || isWall || isOccupiedByCat || isOccupiedByHole) {
              events.push({
                type: 'teleportBlocked',
                id: cat.id
              });
            } else {
              events.push({
                type: 'teleport',
                id: cat.id,
                from: [cat.x, cat.y],
                to: [nx, ny]
              });
              cat.x = nx;
              cat.y = ny;
            }
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
