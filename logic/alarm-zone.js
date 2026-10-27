(function (root, factory) {
  const boardMove = typeof module === 'object' && module.exports
    ? require('./_board-move.js')
    : (root.CatDomLogic && root.CatDomLogic._boardMove);
  const api = factory(boardMove);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.CatDomLogic = root.CatDomLogic || {})['alarm-zone'] = api;
})(typeof self !== 'undefined' ? self : this, function (boardMove) {
  'use strict';

  function validateAlarm(level) {
    const errors = [];
    if (!level || typeof level !== 'object') return errors;
    const hasValidCols = Number.isInteger(level.cols) && level.cols >= 1;
    const hasValidRows = Number.isInteger(level.rows) && level.rows >= 1;

    if (level.alarmSwitches !== undefined) {
      if (!Array.isArray(level.alarmSwitches)) {
        errors.push('alarmSwitches phải là mảng');
      } else {
        for (let i = 0; i < level.alarmSwitches.length; i++) {
          const p = level.alarmSwitches[i];
          if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1])) {
            errors.push('tọa độ alarmSwitches phải là mảng 2 số nguyên');
          } else if (hasValidCols && hasValidRows && (p[0] < 0 || p[0] >= level.cols || p[1] < 0 || p[1] >= level.rows)) {
            errors.push('alarmSwitches ngoài bàn');
          }
        }
      }
    }

    if (level.alarms !== undefined) {
      if (!Array.isArray(level.alarms)) {
        errors.push('alarms phải là mảng');
      } else {
        for (let i = 0; i < level.alarms.length; i++) {
          const p = level.alarms[i];
          if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1])) {
            errors.push('tọa độ alarms phải là mảng 2 số nguyên');
          } else if (hasValidCols && hasValidRows && (p[0] < 0 || p[0] >= level.cols || p[1] < 0 || p[1] >= level.rows)) {
            errors.push('alarms ngoài bàn');
          }
        }
      }
    }

    return errors;
  }

  function validateLevel(level) {
    return boardMove.validateLevel(level, validateAlarm);
  }

  function isAlarmOn(alarmSwitches, alarms, holes) {
    if ((!alarmSwitches || alarmSwitches.length === 0) && (!alarms || alarms.length === 0)) {
      return false;
    }
    if (!alarmSwitches || alarmSwitches.length === 0) {
      return true;
    }
    const isSwitchPressed = alarmSwitches.some(function ([sx, sy]) {
      return holes.some(function (h) {
        if (h.done || h.remaining <= 0) return false;
        const shape = h.shape || [[0, 0]];
        return shape.some(function ([dx, dy]) {
          return (h.x + dx) === sx && (h.y + dy) === sy;
        });
      });
    });
    return !isSwitchPressed;
  }

  function hasHoleInAlarmZone(alarms, holes) {
    if (!alarms || alarms.length === 0) return false;
    return holes.some(function (h) {
      if (h.done || h.remaining <= 0) return false;
      const shape = h.shape || [[0, 0]];
      return shape.some(function ([dx, dy]) {
        const cx = h.x + dx;
        const cy = h.y + dy;
        return alarms.some(function ([ax, ay]) {
          return ax === cx && ay === cy;
        });
      });
    });
  }

  function createGame(level) {
    return boardMove.createGame(level, {
      validateExtra: validateAlarm,
      initState: function (lvl) {
        const alarmSwitches = (lvl.alarmSwitches || []).map(function (p) {
          return [p[0], p[1]];
        });
        const alarms = (lvl.alarms || []).map(function (p) {
          return [p[0], p[1]];
        });
        const alarmOn = isAlarmOn(alarmSwitches, alarms, lvl.holes);
        return {
          alarmSwitches: alarmSwitches,
          alarms: alarms,
          alarmOn: alarmOn
        };
      },
      extraState: function (state) {
        return {
          alarmSwitches: state.alarmSwitches.map(function (p) {
            return [p[0], p[1]];
          }),
          alarms: state.alarms.map(function (p) {
            return [p[0], p[1]];
          }),
          alarmOn: state.alarmOn
        };
      },
      onMoveStep3: function (state, holeIndex, events) {
        const nextAlarmOn = isAlarmOn(state.alarmSwitches, state.alarms, state.holes);
        const changed = nextAlarmOn !== state.alarmOn;
        if (changed) {
          state.alarmOn = nextAlarmOn;
          events.push({ type: nextAlarmOn ? 'alarmOn' : 'alarmOff' });
        }

        if (state.alarmOn) {
          if (hasHoleInAlarmZone(state.alarms, state.holes)) {
            state.status = 'lost';
            state.loseReason = 'alarm';
            events.push({ type: 'lose', reason: 'alarm' });
          }
        }
      },
      onMoveStep8: function (state, holeIndex, events) {
        const nextAlarmOn = isAlarmOn(state.alarmSwitches, state.alarms, state.holes);
        const changed = nextAlarmOn !== state.alarmOn;
        if (changed) {
          state.alarmOn = nextAlarmOn;
          events.push({ type: nextAlarmOn ? 'alarmOn' : 'alarmOff' });
        }

        if (state.alarmOn && changed) {
          if (hasHoleInAlarmZone(state.alarms, state.holes)) {
            state.status = 'lost';
            state.loseReason = 'alarm';
            events.push({ type: 'lose', reason: 'alarm' });
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
