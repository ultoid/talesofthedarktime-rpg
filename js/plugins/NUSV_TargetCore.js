/*:
 * @plugindesc v1.0.0 NUSV Target Core - clean-room expanded targeting for RPG Maker MV.
 * @author Ultoid
 *
 * @help
 * ============================================================================
 * NUSV_TargetCore
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_TargetCore source code.
 *
 * Goal:
 * - provide expanded target scopes for Skills/Items
 * - keep a familiar notetag workflow
 * - support custom target evaluation
 * - stay compatible with RPG Maker MV and YEP_BattleEngineCore
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_DamageCore
 *   NUSV_CriticalControl
 *   NUSV_TargetCore
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * <Repeat: 12>
 *   Sets the number of repeats and can exceed MV editor limits.
 *
 * <Target: Everybody>
 *   All living allies and foes. User is placed last.
 *
 * <Target: 3 Random Any>
 *   3 random living battlers from both sides.
 *
 * <Target: Target All Foes>
 *   Uses the selected foe plus all living foes.
 *
 * <Target: Target 3 Random Foes>
 *   Uses selected foe plus 3 random living foes.
 *
 * <Target: 6 Random Foes>
 *   6 random living foes.
 *
 * <Target: All Allies But User>
 *   All living allies except the user.
 *
 * <Target: Target All Allies>
 *   Uses selected ally plus all living allies.
 *
 * <Target: Target 3 Random Allies>
 *   Uses selected ally plus 3 random living allies.
 *
 * <Target: 6 Random Allies>
 *   6 random living allies.
 *
 * Parameter multiple targets:
 *
 * <Target: Everybody atk Multiple Of 10>
 * <Target: Allies hp Multiple Of 100>
 * <Target: Foes agi Multiple Of 5>
 *
 * Valid parameters:
 *   level, maxhp, maxmp, atk, def, mat, mdf, agi, luk, hp, mp, tp
 *
 * "level" works for enemies only if another plugin gives enemies a level.
 *
 * ============================================================================
 * CUSTOM TARGET EVAL
 * ============================================================================
 *
 * <Custom Target Eval>
 * for (var i = 0; i < foes.aliveMembers().length; ++i) {
 *   var member = foes.aliveMembers()[i];
 *   if (member.hpRate() < 0.5) targets.push(member);
 * }
 * </Custom Target Eval>
 *
 * Available variables:
 *
 *   user       action subject
 *   subject    action subject
 *   target     currently selected/default target when available
 *   allies     user's unit
 *   foes       user's opponents unit
 *   targets    output array; push battlers into this array
 *   item       current skill/item
 *   action     current Game_Action
 *   s          $gameSwitches._data
 *   v          $gameVariables._data
 *
 * If at least one valid battler is pushed into targets, those targets replace
 * the normal targeting result.
 *
 * ============================================================================
 * CUSTOM TARGET HELP TEXT
 * ============================================================================
 *
 * <Custom Target Text>
 * text = "Targets all wounded enemies.";
 * </Custom Target Text>
 *
 * If YEP_BattleEngineCore or a compatible help window is present, this plugin
 * attempts to display the custom target text when the skill/item is highlighted.
 *
 * ============================================================================
 * OPTIONAL ROW TARGETING
 * ============================================================================
 *
 * If a compatible row plugin gives battlers a row() method, these are supported:
 *
 * <Target: Enemy Row>
 * <Target: Enemy Row 2>
 * <Target: Front Enemy Row>
 * <Target: Back Enemy Row>
 * <Target: Ally Row>
 * <Target: Ally Row 2>
 * <Target: Front Ally Row>
 * <Target: Back Ally Row>
 *
 * Row numbering is expected to start at 1 in notetags. The plugin detects
 * whichever numeric row values the battlers return and normalizes selection.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * - Custom target arrays are sanitized automatically.
 * - Dead battlers are excluded from these custom scopes unless your own
 *   <Custom Target Eval> explicitly returns them.
 * - Duplicate targets are intentionally preserved for random scopes because
 *   repeated random hits can strike the same battler more than once.
 * - "Target All ..." keeps the selected/default target at the front.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_TargetCore = true;

var NUSV = NUSV || {};
NUSV.TargetCore = NUSV.TargetCore || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_TargetCore';

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function multiline(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function aliveMembers(unit) {
        if (!unit || !unit.aliveMembers) return [];
        return unit.aliveMembers().slice();
    }

    function randomMemberFromArray(array) {
        if (!array || array.length <= 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    function randomTargets(array, count) {
        var result = [];
        count = Math.max(0, Number(count || 0));
        for (var i = 0; i < count; ++i) {
            var member = randomMemberFromArray(array);
            if (member) result.push(member);
        }
        return result;
    }

    function uniqueMembers(array) {
        var result = [];
        (array || []).forEach(function(member) {
            if (member && result.indexOf(member) < 0) result.push(member);
        });
        return result;
    }

    function paramValue(member, key) {
        if (!member) return 0;
        key = String(key || '').toLowerCase();

        if (key === 'level') {
            var lv = member.level;
            if (typeof lv === 'function') lv = lv.call(member);
            return Number(lv || 0);
        }

        var allowed = ['mhp','mmp','atk','def','mat','mdf','agi','luk','hp','mp','tp'];

        // Friendly aliases used in notetags.
        if (key === 'maxhp') key = 'mhp';
        if (key === 'maxmp') key = 'mmp';

        if (allowed.indexOf(key) < 0) return 0;

        var value = member[key];
        if (typeof value === 'function') value = value.call(member);
        return Number(value || 0);
    }

    function isMultipleOf(value, divisor) {
        value = Number(value);
        divisor = Number(divisor);
        if (!isFinite(value) || !isFinite(divisor) || divisor === 0) return false;

        // Float-safe multiple check.
        var quotient = value / divisor;
        return Math.abs(quotient - Math.round(quotient)) < 0.0000001;
    }

    function parseTargetTag(item) {
        var raw = noteValue(item, 'Target');
        return raw ? raw.trim() : null;
    }

    function defaultSelectedTarget(action) {
        if (!action) return null;

        var index = action._targetIndex;
        var unit = null;

        if (action.isForOpponent && action.isForOpponent()) {
            unit = action.opponentsUnit();
        } else if (action.isForFriend && action.isForFriend()) {
            unit = action.friendsUnit();
        }

        if (!unit) return null;

        var members = unit.members ? unit.members() : [];
        if (index >= 0 && members[index]) return members[index];

        var alive = aliveMembers(unit);
        return alive.length > 0 ? alive[0] : null;
    }

    function rowValue(member) {
        if (!member) return null;

        if (typeof member.row === 'function') {
            var value = Number(member.row());
            return isNaN(value) ? null : value;
        }

        if (typeof member.row === 'number') return member.row;
        if (typeof member._row === 'number') return member._row;

        return null;
    }

    function membersWithRow(unit, row) {
        return aliveMembers(unit).filter(function(member) {
            return rowValue(member) === row;
        });
    }

    function availableRows(unit) {
        var rows = [];
        aliveMembers(unit).forEach(function(member) {
            var row = rowValue(member);
            if (row != null && rows.indexOf(row) < 0) rows.push(row);
        });
        rows.sort(function(a, b) { return a - b; });
        return rows;
    }

    function normalizedRequestedRow(unit, requested) {
        var rows = availableRows(unit);
        if (rows.length <= 0) return null;

        // Prefer exact match.
        if (rows.indexOf(requested) >= 0) return requested;

        // Common case: plugin internally uses 0-based rows while note uses 1-based.
        if (rows.indexOf(requested - 1) >= 0) return requested - 1;

        return null;
    }

    // -------------------------------------------------------------------------
    // Repeat count
    // -------------------------------------------------------------------------

    var _Game_Action_numRepeats = Game_Action.prototype.numRepeats;
    Game_Action.prototype.numRepeats = function() {
        var raw = noteValue(this.item(), 'Repeat');
        if (raw != null) {
            var count = Math.floor(Number(raw));
            if (!isNaN(count)) return Math.max(1, count);
        }
        return _Game_Action_numRepeats.call(this);
    };

    // -------------------------------------------------------------------------
    // Target construction
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvTargetTagTargets = function() {
        var tag = parseTargetTag(this.item());
        if (!tag) return null;

        var user = this.subject();
        var allies = this.friendsUnit();
        var foes = this.opponentsUnit();
        var allyAlive = aliveMembers(allies);
        var foeAlive = aliveMembers(foes);
        var selected = defaultSelectedTarget(this);
        var m;

        // Everybody
        if (/^Everybody$/i.test(tag)) {
            var everyone = [];
            foeAlive.forEach(function(member) { everyone.push(member); });
            allyAlive.forEach(function(member) {
                if (member !== user) everyone.push(member);
            });
            if (user && user.isAlive && user.isAlive()) everyone.push(user);
            return everyone;
        }

        // x Random Any
        m = tag.match(/^(\d+)\s+Random\s+Any$/i);
        if (m) {
            return randomTargets(foeAlive.concat(allyAlive), Number(m[1]));
        }

        // Target All Foes
        if (/^Target\s+All\s+Foes$/i.test(tag)) {
            var tf = foeAlive.slice();
            if (selected && foeAlive.indexOf(selected) >= 0) {
                tf.splice(tf.indexOf(selected), 1);
                tf.unshift(selected);
            }
            return tf;
        }

        // Target x Random Foes
        m = tag.match(/^Target\s+(\d+)\s+Random\s+Foes$/i);
        if (m) {
            var resultFoes = [];
            if (selected && foeAlive.indexOf(selected) >= 0) resultFoes.push(selected);
            return resultFoes.concat(randomTargets(foeAlive, Number(m[1])));
        }

        // x Random Foes
        m = tag.match(/^(\d+)\s+Random\s+Foes$/i);
        if (m) {
            return randomTargets(foeAlive, Number(m[1]));
        }

        // All Allies But User
        if (/^All\s+Allies\s+But\s+User$/i.test(tag)) {
            return allyAlive.filter(function(member) {
                return member !== user;
            });
        }

        // Target All Allies
        if (/^Target\s+All\s+Allies$/i.test(tag)) {
            var ta = allyAlive.slice();
            if (selected && allyAlive.indexOf(selected) >= 0) {
                ta.splice(ta.indexOf(selected), 1);
                ta.unshift(selected);
            }
            return ta;
        }

        // Target x Random Allies
        m = tag.match(/^Target\s+(\d+)\s+Random\s+Allies$/i);
        if (m) {
            var resultAllies = [];
            if (selected && allyAlive.indexOf(selected) >= 0) resultAllies.push(selected);
            return resultAllies.concat(randomTargets(allyAlive, Number(m[1])));
        }

        // x Random Allies
        m = tag.match(/^(\d+)\s+Random\s+Allies$/i);
        if (m) {
            return randomTargets(allyAlive, Number(m[1]));
        }

        // Parameter multiples
        m = tag.match(/^(Everybody|Allies|Foes)\s+(level|maxhp|maxmp|atk|def|mat|mdf|agi|luk|hp|mp|tp)\s+Multiple\s+Of\s+(-?\d+(?:\.\d+)?)$/i);
        if (m) {
            var group = m[1].toLowerCase();
            var key = m[2].toLowerCase();
            var divisor = Number(m[3]);
            var pool = [];

            if (group === 'everybody') pool = foeAlive.concat(allyAlive);
            if (group === 'allies') pool = allyAlive.slice();
            if (group === 'foes') pool = foeAlive.slice();

            return pool.filter(function(member) {
                return isMultipleOf(paramValue(member, key), divisor);
            });
        }

        // Optional row support.
        var rowUnit, rows, row, targetRow;

        if (/^Enemy\s+Row$/i.test(tag)) {
            rowUnit = foes;
            targetRow = rowValue(selected);
            return targetRow == null ? null : membersWithRow(rowUnit, targetRow);
        }

        m = tag.match(/^Enemy\s+Row\s+(\d+)$/i);
        if (m) {
            rowUnit = foes;
            row = normalizedRequestedRow(rowUnit, Number(m[1]));
            return row == null ? null : membersWithRow(rowUnit, row);
        }

        if (/^Front\s+Enemy\s+Row$/i.test(tag)) {
            rows = availableRows(foes);
            return rows.length ? membersWithRow(foes, rows[0]) : null;
        }

        if (/^Back\s+Enemy\s+Row$/i.test(tag)) {
            rows = availableRows(foes);
            return rows.length ? membersWithRow(foes, rows[rows.length - 1]) : null;
        }

        if (/^Ally\s+Row$/i.test(tag)) {
            rowUnit = allies;
            targetRow = rowValue(selected);
            return targetRow == null ? null : membersWithRow(rowUnit, targetRow);
        }

        m = tag.match(/^Ally\s+Row\s+(\d+)$/i);
        if (m) {
            rowUnit = allies;
            row = normalizedRequestedRow(rowUnit, Number(m[1]));
            return row == null ? null : membersWithRow(rowUnit, row);
        }

        if (/^Front\s+Ally\s+Row$/i.test(tag)) {
            rows = availableRows(allies);
            return rows.length ? membersWithRow(allies, rows[0]) : null;
        }

        if (/^Back\s+Ally\s+Row$/i.test(tag)) {
            rows = availableRows(allies);
            return rows.length ? membersWithRow(allies, rows[rows.length - 1]) : null;
        }

        return null;
    };

    // -------------------------------------------------------------------------
    // Custom target eval
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvCustomTargetEval = function(defaultTargets) {
        var code = multiline(this.item(), 'Custom Target Eval');
        if (!code) return null;

        try {
            var action = this;
            var user = this.subject();
            var subject = user;
            var allies = this.friendsUnit();
            var foes = this.opponentsUnit();
            var target = defaultSelectedTarget(this);
            if (!target && defaultTargets && defaultTargets.length > 0) {
                target = defaultTargets[0];
            }
            var item = this.item();
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var targets = [];

            eval(code);

            if (!Array.isArray(targets)) return null;

            // Remove invalid entries only. Do not force alive status here,
            // because custom eval intentionally gives the developer full control.
            targets = targets.filter(function(member) {
                return member && typeof member.isActor === 'function';
            });

            return targets.length > 0 ? targets : null;
        } catch (e) {
            console.error(pluginName + ': Custom Target Eval Error');
            console.error(this.item());
            console.error(e);
            return null;
        }
    };

    // -------------------------------------------------------------------------
    // Main makeTargets override
    // -------------------------------------------------------------------------

    var _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        var standardTargets = _Game_Action_makeTargets.call(this);

        var tagTargets = this.nusvTargetTagTargets();
        var baseTargets = tagTargets !== null ? tagTargets : standardTargets;

        var customTargets = this.nusvCustomTargetEval(baseTargets);
        var targets = customTargets !== null ? customTargets : baseTargets;

        return targets || [];
    };

    // -------------------------------------------------------------------------
    // Help text
    // -------------------------------------------------------------------------

    NUSV.TargetCore.customTargetText = function(item) {
        var code = multiline(item, 'Custom Target Text');
        if (!code) return null;

        try {
            var text = '';
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            eval(code);
            return String(text || '');
        } catch (e) {
            console.error(pluginName + ': Custom Target Text Error');
            console.error(item);
            console.error(e);
            return null;
        }
    };

    if (typeof Window_Help !== 'undefined') {
        var _Window_Help_setItem = Window_Help.prototype.setItem;
        Window_Help.prototype.setItem = function(item) {
            var text = NUSV.TargetCore.customTargetText(item);
            if (text !== null && text.length > 0) {
                this.setText(text);
                return;
            }
            _Window_Help_setItem.call(this, item);
        };
    }

    // -------------------------------------------------------------------------
    // Small public helpers for future NUSV_SelectionControl
    // -------------------------------------------------------------------------

    NUSV.TargetCore.noteValue = noteValue;
    NUSV.TargetCore.multiline = multiline;
    NUSV.TargetCore.aliveMembers = aliveMembers;
    NUSV.TargetCore.paramValue = paramValue;
    NUSV.TargetCore.uniqueMembers = uniqueMembers;
    NUSV.TargetCore.version = '1.0.0';

})();
