/*:
 * @plugindesc v1.0.0 NUSV Job Points - clean-room JP system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default JP Gain
 * @type number
 * @min 0
 * @default 10
 *
 * @param JP Name
 * @type text
 * @default JP
 *
 * @param Show JP In Victory
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Shared JP Across Classes
 * @type boolean
 * @on Shared
 * @off Per Class
 * @default false
 *
 * @param Max JP
 * @type number
 * @min 0
 * @default 999999
 *
 * @help
 * ============================================================================
 * NUSV_JobPoints
 * ============================================================================
 *
 * Clean-room JP system written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_JobPoints source code.
 *
 * Purpose:
 * - actors gain Job Points (JP) after battle
 * - JP can be stored per class or shared globally
 * - supports enemy JP rewards
 * - supports JP gain modifiers from Actor/Class/Enemy/Weapon/Armor/State
 * - provides script/plugin-command API for future skill-learning systems
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_ClassChange
 *   NUSV_JobPoints
 *
 * ============================================================================
 * ENEMY NOTETAGS
 * ============================================================================
 *
 * <JP: 25>
 *   Enemy gives 25 JP when defeated.
 *
 * If omitted, Default JP Gain is used.
 *
 * <JP Rate: 150%>
 *   Multiplies this enemy's JP reward.
 *
 * ============================================================================
 * ACTOR / CLASS / WEAPON / ARMOR / STATE NOTETAGS
 * ============================================================================
 *
 * <JP Gain: +5>
 *   Adds flat JP after battle.
 *
 * <JP Rate: 120%>
 *   Multiplies JP earned by 1.20.
 *
 * These modifiers stack.
 *
 * Example:
 *
 * Class:
 *   <JP Rate: 125%>
 *
 * State:
 *   <JP Gain: +10>
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * actor.jp()
 * actor.jp(classId)
 * actor.gainJp(amount)
 * actor.gainJp(amount, classId)
 * actor.loseJp(amount)
 * actor.loseJp(amount, classId)
 * actor.setJp(amount)
 * actor.setJp(amount, classId)
 *
 * If Shared JP Across Classes = OFF:
 *   JP is stored separately for each class.
 *
 * If Shared JP Across Classes = ON:
 *   classId is ignored.
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVJP Gain actorId amount
 * NUSVJP Gain actorId amount classId
 *
 * NUSVJP Lose actorId amount
 * NUSVJP Lose actorId amount classId
 *
 * NUSVJP Set actorId amount
 * NUSVJP Set actorId amount classId
 *
 * Examples:
 *
 * NUSVJP Gain 1 50
 * NUSVJP Gain 1 100 5
 * NUSVJP Lose 2 25
 * NUSVJP Set 1 0
 *
 * ============================================================================
 * VICTORY JP
 * ============================================================================
 *
 * At battle end:
 * - total JP from defeated enemies is summed
 * - each alive party member receives JP
 * - actor/class/equipment/state JP modifiers are applied
 *
 * Default formula:
 *
 *   finalJP = (enemy JP total + flat bonuses) * JP Rate
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_JobPoints = true;

var NUSV = NUSV || {};
NUSV.JobPoints = NUSV.JobPoints || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_JobPoints';
    var params = PluginManager.parameters(pluginName);

    var defaultJpGain = Number(params['Default JP Gain'] || 10);
    var jpName = String(params['JP Name'] || 'JP');
    var showJpInVictory = String(params['Show JP In Victory'] || 'true') === 'true';
    var sharedJp = String(params['Shared JP Across Classes'] || 'false') === 'true';
    var maxJp = Number(params['Max JP'] || 999999);

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function parsePercent(raw, fallback) {
        if (raw == null) return fallback;
        var text = String(raw).trim();
        var n;
        if (/%$/.test(text)) n = parseFloat(text) / 100;
        else n = Number(text);
        return isNaN(n) ? fallback : n;
    }

    function traitObjects(battler) {
        if (!battler || !battler.traitObjects) return [];
        return battler.traitObjects().filter(Boolean);
    }

    function clampJp(value) {
        value = Math.floor(Number(value || 0));
        if (!isFinite(value)) value = 0;
        return Math.max(0, Math.min(maxJp, value));
    }

    // -------------------------------------------------------------------------
    // Actor JP storage
    // -------------------------------------------------------------------------

    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this._nusvJp = this._nusvJp || {};
        this._nusvSharedJp = this._nusvSharedJp || 0;
    };

    Game_Actor.prototype.jp = function(classId) {
        if (sharedJp) {
            this._nusvSharedJp = this._nusvSharedJp || 0;
            return this._nusvSharedJp;
        }

        classId = Number(classId || this._classId);
        this._nusvJp = this._nusvJp || {};
        return Number(this._nusvJp[classId] || 0);
    };

    Game_Actor.prototype.setJp = function(amount, classId) {
        if (sharedJp) {
            this._nusvSharedJp = clampJp(amount);
            return;
        }

        classId = Number(classId || this._classId);
        this._nusvJp = this._nusvJp || {};
        this._nusvJp[classId] = clampJp(amount);
    };

    Game_Actor.prototype.gainJp = function(amount, classId) {
        this.setJp(this.jp(classId) + Number(amount || 0), classId);
    };

    Game_Actor.prototype.loseJp = function(amount, classId) {
        this.gainJp(-Math.abs(Number(amount || 0)), classId);
    };

    Game_Actor.prototype.nusvJpFlatBonus = function() {
        var total = 0;

        traitObjects(this).forEach(function(obj) {
            var raw = noteValue(obj, 'JP Gain');
            if (raw != null) {
                var n = Number(raw);
                if (!isNaN(n)) total += n;
            }
        });

        return total;
    };

    Game_Actor.prototype.nusvJpRate = function() {
        var rate = 1.0;

        traitObjects(this).forEach(function(obj) {
            var raw = noteValue(obj, 'JP Rate');
            if (raw != null) {
                rate *= parsePercent(raw, 1.0);
            }
        });

        return rate;
    };

    Game_Actor.prototype.nusvBattleJpGain = function(baseJp) {
        var value = Number(baseJp || 0);
        value += this.nusvJpFlatBonus();
        value *= this.nusvJpRate();
        return Math.max(0, Math.floor(value));
    };

    // -------------------------------------------------------------------------
    // Enemy JP
    // -------------------------------------------------------------------------

    Game_Enemy.prototype.nusvBaseJp = function() {
        var enemy = this.enemy();
        var raw = noteValue(enemy, 'JP');
        var value = raw != null ? Number(raw) : defaultJpGain;
        if (isNaN(value)) value = defaultJpGain;

        var rateRaw = noteValue(enemy, 'JP Rate');
        value *= parsePercent(rateRaw, 1.0);

        return Math.max(0, Math.floor(value));
    };

    Game_Troop.prototype.nusvJpTotal = function() {
        return this.deadMembers().reduce(function(sum, enemy) {
            return sum + enemy.nusvBaseJp();
        }, 0);
    };

    // -------------------------------------------------------------------------
    // Battle reward
    // -------------------------------------------------------------------------

    BattleManager.nusvBaseJpReward = function() {
        return $gameTroop ? $gameTroop.nusvJpTotal() : 0;
    };

    BattleManager.nusvDistributeJp = function() {
        var baseJp = this.nusvBaseJpReward();

        $gameParty.members().forEach(function(actor) {
            if (!actor) return;
            if (actor.isDead && actor.isDead()) return;

            var gain = actor.nusvBattleJpGain(baseJp);
            actor.gainJp(gain);
            actor._nusvLastBattleJp = gain;
        });

        this._nusvLastBaseJp = baseJp;
    };

    var _BattleManager_gainRewards = BattleManager.gainRewards;
    BattleManager.gainRewards = function() {
        _BattleManager_gainRewards.call(this);
        this.nusvDistributeJp();
    };

    // -------------------------------------------------------------------------
    // Victory display
    // -------------------------------------------------------------------------

    if (showJpInVictory) {
        var _BattleManager_displayRewards = BattleManager.displayRewards;
        BattleManager.displayRewards = function() {
            _BattleManager_displayRewards.call(this);

            var total = this._nusvLastBaseJp || 0;
            if (total > 0 && $gameMessage) {
                $gameMessage.add('\\.' + total + ' ' + jpName + ' gained!');
            }
        };
    }

    // -------------------------------------------------------------------------
    // Plugin commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toLowerCase() !== 'nusvjp') return;

        var sub = String(args[0] || '').toLowerCase();
        var actorId = Number(args[1]);
        var amount = Number(args[2] || 0);
        var classId = args[3] != null ? Number(args[3]) : undefined;

        var actor = $gameActors.actor(actorId);
        if (!actor) return;

        if (sub === 'gain') {
            actor.gainJp(amount, classId);
        } else if (sub === 'lose') {
            actor.loseJp(amount, classId);
        } else if (sub === 'set') {
            actor.setJp(amount, classId);
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.JobPoints.noteValue = noteValue;
    NUSV.JobPoints.jpName = jpName;
    NUSV.JobPoints.sharedJp = sharedJp;
    NUSV.JobPoints.maxJp = maxJp;
    NUSV.JobPoints.version = '1.0.0';

})();
