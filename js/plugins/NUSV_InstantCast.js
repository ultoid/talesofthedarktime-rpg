/*:
 * @plugindesc v1.0.0 NUSV Instant Cast - clean-room instant action system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Instant Cast Type
 * @type select
 * @option None
 * @value none
 * @option Skill
 * @value skill
 * @option Item
 * @value item
 * @option Both
 * @value both
 * @default none
 *
 * @param Consume Turn
 * @type boolean
 * @default false
 *
 * @param Allow Multiple Instant Casts
 * @type boolean
 * @default true
 *
 * @param Max Instant Casts Per Input
 * @type number
 * @min 1
 * @default 99
 *
 * @help
 * ============================================================================
 * NUSV_InstantCast
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_InstantCast source code.
 *
 * Purpose:
 * - allow specific Skills or Items to execute immediately
 * - return the same actor to input afterward
 * - optionally make instant casts consume a turn
 * - support repeated instant casts during one input phase
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_InstantCast
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * <Instant Cast>
 *
 * The Skill or Item executes immediately after selection.
 * By default, the actor returns to command input afterward.
 *
 * <Instant Cast: Turn>
 *
 * The action executes immediately, but counts as that actor's action.
 * After execution, input advances normally.
 *
 * <Instant Cast: Free>
 *
 * The action executes immediately and does NOT consume the actor's turn.
 *
 * ============================================================================
 * GLOBAL DEFAULT
 * ============================================================================
 *
 * Parameter "Default Instant Cast Type":
 *
 * None  = only database objects with <Instant Cast>
 * Skill = every Skill acts as Instant Cast unless opted out
 * Item  = every Item acts as Instant Cast unless opted out
 * Both  = every Skill and Item acts as Instant Cast unless opted out
 *
 * To disable an object when a global default is active:
 *
 * <No Instant Cast>
 *
 * ============================================================================
 * CONDITIONAL INSTANT CAST
 * ============================================================================
 *
 * <Instant Cast Condition>
 * condition = user.hpRate() <= 0.5;
 * </Instant Cast Condition>
 *
 * Available variables:
 *
 *   user = battler using the action
 *   a    = same as user
 *   item = selected skill/item
 *   s    = $gameSwitches._data
 *   v    = $gameVariables._data
 *   condition = boolean result
 *
 * ============================================================================
 * SCRIPT ACCESS
 * ============================================================================
 *
 * NUSV.InstantCast.isInstant(item, user)
 *
 * ============================================================================
 * IMPORTANT
 * ============================================================================
 *
 * This plugin is intended for the standard turn-based BattleManager flow.
 * It should be smoke-tested with:
 *
 * - YEP_BattleEngineCore
 * - Action Sequence Packs
 * - SRD Summon Core
 * - NUSV_TargetCore / SelectionControl
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_InstantCast = true;

var NUSV = NUSV || {};
NUSV.InstantCast = NUSV.InstantCast || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_InstantCast';
    var params = PluginManager.parameters(pluginName);

    var defaultType = String(params['Default Instant Cast Type'] || 'none').toLowerCase();
    var defaultConsumeTurn = String(params['Consume Turn'] || 'false') === 'true';
    var allowMultiple = String(params['Allow Multiple Instant Casts'] || 'true') === 'true';
    var maxInstant = Math.max(1, Number(params['Max Instant Casts Per Input'] || 99));

    function note(obj) {
        return obj && obj.note ? String(obj.note) : '';
    }

    function isSkill(item) {
        return DataManager.isSkill(item);
    }

    function isItem(item) {
        return DataManager.isItem(item);
    }

    function globalDefaultApplies(item) {
        if (!item) return false;

        if (defaultType === 'both') return isSkill(item) || isItem(item);
        if (defaultType === 'skill') return isSkill(item);
        if (defaultType === 'item') return isItem(item);

        return false;
    }

    function hasInstantTag(item) {
        return /<Instant Cast(?:\s*:\s*(?:Free|Turn))?\s*>/i.test(note(item));
    }

    function hasNoInstantTag(item) {
        return /<No Instant Cast>/i.test(note(item));
    }

    function conditionMet(item, user) {
        var match = /<Instant Cast Condition>([\s\S]*?)<\/Instant Cast Condition>/i.exec(note(item));
        if (!match) return true;

        try {
            var a = user;
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var condition = true;

            eval(String(match[1] || '').trim());
            return !!condition;
        } catch (e) {
            console.error(pluginName + ': Instant Cast Condition error', item, e);
            return false;
        }
    }

    function isInstant(item, user) {
        if (!item) return false;
        if (hasNoInstantTag(item)) return false;

        var enabled = hasInstantTag(item) || globalDefaultApplies(item);
        if (!enabled) return false;

        return conditionMet(item, user);
    }

    function consumesTurn(item) {
        var text = note(item);

        if (/<Instant Cast\s*:\s*Free\s*>/i.test(text)) return false;
        if (/<Instant Cast\s*:\s*Turn\s*>/i.test(text)) return true;

        return defaultConsumeTurn;
    }

    // -------------------------------------------------------------------------
    // BattleManager state
    // -------------------------------------------------------------------------

    var _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._nusvInstantCastActive = false;
        this._nusvInstantCastActor = null;
        this._nusvInstantCastCount = 0;
        this._nusvInstantConsumeTurn = false;
        this._nusvInstantReturnActorIndex = -1;
    };

    BattleManager.nusvResetInstantCounter = function() {
        this._nusvInstantCastCount = 0;
    };

    BattleManager.nusvCanInstantCastAgain = function() {
        return allowMultiple && this._nusvInstantCastCount < maxInstant;
    };

    // Reset counter when a fresh actor input begins.
    var _BattleManager_startActorInput = BattleManager.startActorInput;
    if (_BattleManager_startActorInput) {
        BattleManager.startActorInput = function() {
            this.nusvResetInstantCounter();
            _BattleManager_startActorInput.call(this);
        };
    }

    // -------------------------------------------------------------------------
    // Scene_Battle: intercept selected action
    // -------------------------------------------------------------------------

    var _Scene_Battle_onSelectAction = Scene_Battle.prototype.onSelectAction;
    Scene_Battle.prototype.onSelectAction = function() {
        var action = BattleManager.inputtingAction();
        var subject = BattleManager.actor();

        if (action && subject) {
            var item = action.item();

            if (isInstant(item, subject)) {
                if (action.needsSelection()) {
                    _Scene_Battle_onSelectAction.call(this);
                    return;
                }

                this.nusvStartInstantCast();
                return;
            }
        }

        _Scene_Battle_onSelectAction.call(this);
    };

    var _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function() {
        var action = BattleManager.inputtingAction();
        var subject = BattleManager.actor();
        var instant = action && subject && isInstant(action.item(), subject);

        _Scene_Battle_onEnemyOk.call(this);

        if (instant) {
            this.nusvStartInstantCast();
        }
    };

    var _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        var action = BattleManager.inputtingAction();
        var subject = BattleManager.actor();
        var instant = action && subject && isInstant(action.item(), subject);

        _Scene_Battle_onActorOk.call(this);

        if (instant) {
            this.nusvStartInstantCast();
        }
    };

    Scene_Battle.prototype.nusvStartInstantCast = function() {
        if (BattleManager._nusvInstantCastActive) return;

        var actor = BattleManager.actor();
        var action = BattleManager.inputtingAction();

        if (!actor || !action || !action.item()) return;

        BattleManager._nusvInstantCastActive = true;
        BattleManager._nusvInstantCastActor = actor;
        BattleManager._nusvInstantCastCount++;
        BattleManager._nusvInstantConsumeTurn = consumesTurn(action.item());
        BattleManager._nusvInstantReturnActorIndex = BattleManager._actorIndex;

        this._actorCommandWindow.deactivate();
        this._skillWindow.hide();
        this._itemWindow.hide();
        this._enemyWindow.hide();
        this._actorWindow.hide();

        BattleManager.startAction();
    };

    // -------------------------------------------------------------------------
    // Return to input after action
    // -------------------------------------------------------------------------

    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        if (!this._nusvInstantCastActive) {
            _BattleManager_endAction.call(this);
            return;
        }

        var actor = this._nusvInstantCastActor;
        var consume = this._nusvInstantConsumeTurn;
        var returnIndex = this._nusvInstantReturnActorIndex;

        _BattleManager_endAction.call(this);

        this._nusvInstantCastActive = false;
        this._nusvInstantCastActor = null;
        this._nusvInstantConsumeTurn = false;

        if (!actor || actor.isDead()) return;

        if (consume) {
            // Continue standard input flow.
            this._actorIndex = returnIndex;
            this.selectNextCommand();
            return;
        }

        if (!this.nusvCanInstantCastAgain()) {
            this._actorIndex = returnIndex;
            this.selectNextCommand();
            return;
        }

        // Remove the just-used input action and recreate a fresh one.
        actor.clearActions();
        actor.makeActions();

        this._actorIndex = returnIndex;
        this._phase = 'input';
        actor.setActionState('inputting');

        if (SceneManager._scene instanceof Scene_Battle) {
            var scene = SceneManager._scene;
            scene.startActorCommandSelection();
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.InstantCast.isInstant = isInstant;
    NUSV.InstantCast.consumesTurn = consumesTurn;
    NUSV.InstantCast.version = '1.0.0';

})();