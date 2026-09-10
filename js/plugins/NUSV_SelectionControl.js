/*:
 * @plugindesc v1.0.0 NUSV Selection Control - clean-room selectable-target restrictions for RPG Maker MV.
 * @author OpenAI for Nusvanir
 *
 * @help
 * ============================================================================
 * NUSV_SelectionControl
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_SelectionControl source code.
 *
 * Goal:
 * - restrict which battlers may be selected by a skill/item
 * - support actor/enemy/state/type/parameter based selection
 * - support custom selection conditions
 * - integrate with NUSV_TargetCore and normal RPG Maker MV target windows
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_DamageCore
 *   NUSV_CriticalControl
 *   NUSV_TargetCore
 *   NUSV_SelectionControl
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * Basic allow/block rules:
 *
 * <Select Allies>
 * <Select Foes>
 * <Select Dead Allies>
 *
 * <Cannot Select User>
 * <Only Select User>
 *
 * <Select State: 10>
 * <Select State: Poison>
 *   Target must currently have the listed State.
 *
 * <Cannot Select State: 10>
 * <Cannot Select State: Poison>
 *   Target is blocked if it has that State.
 *
 * <Select Actor: 3>
 * <Cannot Select Actor: 3>
 *
 * <Select Enemy: 5>
 * <Cannot Select Enemy: 5>
 *
 * <Select Actor Type: Fighter>
 * <Cannot Select Actor Type: Fighter>
 *
 * <Select Enemy Type: Undead>
 * <Cannot Select Enemy Type: Undead>
 *
 * Actor Type checks the actor's current class name.
 * Enemy Type reads either:
 *   <Enemy Type: Undead>
 * from the enemy's note,
 * or falls back to enemy name if notetag is absent.
 *
 * ============================================================================
 * PARAMETER CONDITIONS
 * ============================================================================
 *
 * <Select HP Above: 50%>
 * <Select HP Below: 50%>
 * <Select MP Above: 25%>
 * <Select MP Below: 25%>
 * <Select TP Above: 50>
 * <Select TP Below: 50>
 *
 * Also supported:
 *
 * <Select ATK Above: 100>
 * <Select DEF Below: 80>
 * <Select MAT Above: 120>
 * <Select MDF Below: 100>
 * <Select AGI Above: 75>
 * <Select LUK Below: 50>
 *
 * ============================================================================
 * CUSTOM SELECT CONDITION
 * ============================================================================
 *
 * <Custom Select Condition>
 * condition = target.hpRate() < 0.5;
 * </Custom Select Condition>
 *
 * Available:
 *
 *   user       action subject
 *   subject    action subject
 *   target     battler being checked
 *   item       current skill/item
 *   action     current Game_Action
 *   s          $gameSwitches._data
 *   v          $gameVariables._data
 *   condition  boolean result
 *
 * ============================================================================
 * CUSTOM SELECT TEXT
 * ============================================================================
 *
 * <Custom Select Text>
 * text = "Can only target wounded allies.";
 * </Custom Select Text>
 *
 * This is exposed for UI integration and may be used by compatible help windows.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * - These rules affect manual target selection.
 * - NUSV_TargetCore custom scopes are also filtered by these selection rules.
 * - If all possible targets are blocked, the skill/item cannot produce targets.
 * - Dead allies are only allowed when the skill scope supports dead friends or
 *   <Select Dead Allies> is present.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_SelectionControl = true;

var NUSV = NUSV || {};
NUSV.SelectionControl = NUSV.SelectionControl || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_SelectionControl';

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function hasTag(obj, tag) {
        if (!obj || !obj.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(obj.note);
    }

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

    function resolveState(raw) {
        if (raw == null) return null;

        var numeric = Number(raw);
        if (!isNaN(numeric) && numeric > 0) {
            return $dataStates[numeric] ? numeric : null;
        }

        var name = String(raw).trim().toLowerCase();
        for (var i = 1; i < $dataStates.length; ++i) {
            var state = $dataStates[i];
            if (state && String(state.name).toLowerCase() === name) {
                return i;
            }
        }
        return null;
    }

    function battlerActorId(target) {
        return target && target.isActor && target.isActor() ? target.actorId() : 0;
    }

    function battlerEnemyId(target) {
        return target && target.isEnemy && target.isEnemy() ? target.enemyId() : 0;
    }

    function actorTypeName(target) {
        if (!target || !target.isActor || !target.isActor()) return '';
        var cls = target.currentClass ? target.currentClass() : null;
        return cls && cls.name ? String(cls.name) : '';
    }

    function enemyTypeName(target) {
        if (!target || !target.isEnemy || !target.isEnemy()) return '';
        var data = target.enemy ? target.enemy() : null;
        if (!data) return '';

        var explicit = noteValue(data, 'Enemy Type');
        if (explicit != null) return String(explicit);

        return String(data.name || '');
    }

    function parseThreshold(raw, target, key) {
        if (raw == null) return null;
        var txt = String(raw).trim();

        if (/%$/.test(txt)) {
            var p = parseFloat(txt);
            if (isNaN(p)) return null;
            var rate = p / 100;

            if (key === 'hp') return target.mhp * rate;
            if (key === 'mp') return target.mmp * rate;
            if (key === 'tp') return 100 * rate;
        }

        var n = Number(txt);
        return isNaN(n) ? null : n;
    }

    function statValue(target, key) {
        if (!target) return 0;
        key = String(key).toLowerCase();

        if (key === 'hp') return Number(target.hp || 0);
        if (key === 'mp') return Number(target.mp || 0);
        if (key === 'tp') return Number(target.tp || 0);

        var valid = ['atk','def','mat','mdf','agi','luk'];
        if (valid.indexOf(key) < 0) return 0;

        var value = target[key];
        if (typeof value === 'function') value = value.call(target);
        return Number(value || 0);
    }

    function checkAboveBelow(item, target, stat, compare) {
        var cap = stat.toUpperCase();
        var tag = 'Select ' + cap + ' ' + compare;
        var raw = noteValue(item, tag);
        if (raw == null) return true;

        var threshold = parseThreshold(raw, target, stat);
        if (threshold == null) return true;

        var value = statValue(target, stat);

        if (compare === 'Above') return value > threshold;
        if (compare === 'Below') return value < threshold;

        return true;
    }

    // -------------------------------------------------------------------------
    // Core selection check
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvCanSelectTarget = function(target) {
        var item = this.item();
        var user = this.subject();

        if (!item || !target) return false;

        // Side restrictions
        if (hasTag(item, 'Select Allies')) {
            if (!user || !user.friendsUnit || user.friendsUnit() !== target.friendsUnit()) {
                return false;
            }
        }

        if (hasTag(item, 'Select Foes')) {
            if (!user || !user.opponentsUnit || user.opponentsUnit() !== target.friendsUnit()) {
                return false;
            }
        }

        // User restrictions
        if (hasTag(item, 'Cannot Select User') && target === user) {
            return false;
        }

        if (hasTag(item, 'Only Select User') && target !== user) {
            return false;
        }

        // Dead ally allowance / restriction
        var allowDead = hasTag(item, 'Select Dead Allies');
        if (target.isDead && target.isDead()) {
            var nativeDeadScope = this.isForDeadFriend && this.isForDeadFriend();
            if (!allowDead && !nativeDeadScope) return false;
        }

        // State required
        var reqStateRaw = noteValue(item, 'Select State');
        if (reqStateRaw != null) {
            var reqState = resolveState(reqStateRaw);
            if (!reqState || !target.isStateAffected || !target.isStateAffected(reqState)) {
                return false;
            }
        }

        // State forbidden
        var blockStateRaw = noteValue(item, 'Cannot Select State');
        if (blockStateRaw != null) {
            var blockState = resolveState(blockStateRaw);
            if (blockState && target.isStateAffected && target.isStateAffected(blockState)) {
                return false;
            }
        }

        // Actor id required / forbidden
        var actorReq = noteValue(item, 'Select Actor');
        if (actorReq != null) {
            if (battlerActorId(target) !== Number(actorReq)) return false;
        }

        var actorBlock = noteValue(item, 'Cannot Select Actor');
        if (actorBlock != null) {
            if (battlerActorId(target) === Number(actorBlock)) return false;
        }

        // Enemy id required / forbidden
        var enemyReq = noteValue(item, 'Select Enemy');
        if (enemyReq != null) {
            if (battlerEnemyId(target) !== Number(enemyReq)) return false;
        }

        var enemyBlock = noteValue(item, 'Cannot Select Enemy');
        if (enemyBlock != null) {
            if (battlerEnemyId(target) === Number(enemyBlock)) return false;
        }

        // Actor class/type
        var actorTypeReq = noteValue(item, 'Select Actor Type');
        if (actorTypeReq != null) {
            if (actorTypeName(target).toLowerCase() !== String(actorTypeReq).toLowerCase()) {
                return false;
            }
        }

        var actorTypeBlock = noteValue(item, 'Cannot Select Actor Type');
        if (actorTypeBlock != null) {
            if (actorTypeName(target).toLowerCase() === String(actorTypeBlock).toLowerCase()) {
                return false;
            }
        }

        // Enemy type
        var enemyTypeReq = noteValue(item, 'Select Enemy Type');
        if (enemyTypeReq != null) {
            if (enemyTypeName(target).toLowerCase() !== String(enemyTypeReq).toLowerCase()) {
                return false;
            }
        }

        var enemyTypeBlock = noteValue(item, 'Cannot Select Enemy Type');
        if (enemyTypeBlock != null) {
            if (enemyTypeName(target).toLowerCase() === String(enemyTypeBlock).toLowerCase()) {
                return false;
            }
        }

        // Parameter thresholds
        var stats = ['hp','mp','tp','atk','def','mat','mdf','agi','luk'];
        for (var i = 0; i < stats.length; ++i) {
            var stat = stats[i];
            if (!checkAboveBelow(item, target, stat, 'Above')) return false;
            if (!checkAboveBelow(item, target, stat, 'Below')) return false;
        }

        // Custom condition
        var code = multiline(item, 'Custom Select Condition');
        if (code) {
            try {
                var action = this;
                var subject = user;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                var condition = true;

                eval(code);

                if (!condition) return false;
            } catch (e) {
                console.error(pluginName + ': Custom Select Condition Error');
                console.error(item);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    // -------------------------------------------------------------------------
    // Filter NUSV_TargetCore / normal targeting results
    // -------------------------------------------------------------------------

    var _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        var targets = _Game_Action_makeTargets.call(this);
        var action = this;

        return (targets || []).filter(function(target) {
            return action.nusvCanSelectTarget(target);
        });
    };

    // -------------------------------------------------------------------------
    // Manual target selection windows
    // -------------------------------------------------------------------------

    function currentBattleAction() {
        if (typeof BattleManager !== 'undefined' && BattleManager.inputtingAction) {
            return BattleManager.inputtingAction();
        }
        return null;
    }

    if (typeof Window_BattleEnemy !== 'undefined') {
        var _Window_BattleEnemy_isEnabled = Window_BattleEnemy.prototype.isEnabled;
        Window_BattleEnemy.prototype.isEnabled = function(enemy) {
            var enabled = _Window_BattleEnemy_isEnabled ?
                _Window_BattleEnemy_isEnabled.call(this, enemy) : true;

            if (!enabled) return false;

            var action = currentBattleAction();
            if (!action) return enabled;

            return action.nusvCanSelectTarget(enemy);
        };
    }

    if (typeof Window_BattleActor !== 'undefined') {
        var _Window_BattleActor_isEnabled = Window_BattleActor.prototype.isEnabled;
        Window_BattleActor.prototype.isEnabled = function(actor) {
            var enabled = _Window_BattleActor_isEnabled ?
                _Window_BattleActor_isEnabled.call(this, actor) : true;

            if (!enabled) return false;

            var action = currentBattleAction();
            if (!action) return enabled;

            return action.nusvCanSelectTarget(actor);
        };
    }

    // -------------------------------------------------------------------------
    // Menu actor targeting
    // -------------------------------------------------------------------------

    if (typeof Window_MenuActor !== 'undefined') {
        var _Window_MenuActor_isEnabled = Window_MenuActor.prototype.isEnabled;
        Window_MenuActor.prototype.isEnabled = function(index) {
            var enabled = _Window_MenuActor_isEnabled ?
                _Window_MenuActor_isEnabled.call(this, index) : true;

            if (!enabled) return false;

            var actor = $gameParty.members()[index];
            if (!actor) return false;

            var item = null;

            if (SceneManager._scene && SceneManager._scene._itemWindow &&
                SceneManager._scene._itemWindow.item) {
                item = SceneManager._scene._itemWindow.item();
            }

            if (!item) return enabled;

            var action = new Game_Action($gameParty.menuActor());
            action.setItemObject(item);

            return action.nusvCanSelectTarget(actor);
        };
    }

    // -------------------------------------------------------------------------
    // Custom select text
    // -------------------------------------------------------------------------

    NUSV.SelectionControl.customSelectText = function(item) {
        var code = multiline(item, 'Custom Select Text');
        if (!code) return null;

        try {
            var text = '';
            var s = $gameSwitches._data;
            var v = $gameVariables._data;

            eval(code);

            return String(text || '');
        } catch (e) {
            console.error(pluginName + ': Custom Select Text Error');
            console.error(item);
            console.error(e);
            return null;
        }
    };

    // -------------------------------------------------------------------------
    // Public helpers for future NUSV plugins
    // -------------------------------------------------------------------------

    NUSV.SelectionControl.hasTag = hasTag;
    NUSV.SelectionControl.noteValue = noteValue;
    NUSV.SelectionControl.multiline = multiline;
    NUSV.SelectionControl.resolveState = resolveState;
    NUSV.SelectionControl.version = '1.0.0';

})();
