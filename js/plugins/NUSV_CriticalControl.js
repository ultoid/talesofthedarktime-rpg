/*:
 * @plugindesc v1.0.0 NUSV Critical Control - clean-room critical system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Base Critical Rate Formula
 * @desc Global critical-rate formula. Variables: user, target, item, s, v, rate.
 * @default rate = user.cri * (1 - target.cev);
 *
 * @param Base Critical Multiplier Formula
 * @desc Global critical multiplier. Variables: user, target, item, bonus, value.
 * @default value *= 3.0 + bonus;
 *
 * @param Base Flat Critical Formula
 * @desc Global flat critical adjustment. Variables: user, target, item, bonus, value.
 * @default value += bonus;
 *
 * @help
 * ============================================================================
 * NUSV_CriticalControl
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy source code from YEP_X_CriticalControl.
 *
 * Intended workflow:
 * - Use below NUSV_DamageCore.
 * - Provides familiar Critical Control-style notetags and Action Sequences.
 *
 * Recommended Plugin Manager order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_DamageCore
 *   NUSV_CriticalControl
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * <Critical Rate: 25%>
 * <Critical Rate: 0.25>
 *   Sets this skill/item's critical rate directly.
 *   This ignores user CRI and target CEV.
 *
 * <Critical Multiplier: 250%>
 * <Critical Multiplier: 2.5>
 *   Sets the base critical multiplier for this skill/item.
 *   Trait-based Critical Multiplier bonuses are still added.
 *
 * <Flat Critical: 50% atk>
 *   Adds 50% of the user's ATK as flat critical damage.
 *   Valid stats: hp, mp, atk, def, mat, mdf, agi, luk.
 *
 * ============================================================================
 * ACTOR / CLASS / ENEMY / WEAPON / ARMOR / STATE NOTETAGS
 * ============================================================================
 *
 * <Critical Multiplier: +25%>
 * <Critical Multiplier: -25%>
 *   Additive modifier to critical multiplier.
 *
 * <Flat Critical: +100>
 * <Flat Critical: -50>
 *   Additive flat critical damage.
 *
 * <Certain Hit Critical Rate: +10%>
 * <Certain Hit Critical Rate: -10%>
 *
 * <Physical Critical Rate: +10%>
 * <Physical Critical Rate: -10%>
 *
 * <Magical Critical Rate: +10%>
 * <Magical Critical Rate: -10%>
 *
 * ============================================================================
 * LUNATIC / FORMULA NOTETAGS — SKILLS & ITEMS
 * ============================================================================
 *
 * <Critical Rate Formula>
 * rate = user.cri + 0.20;
 * rate -= target.cev;
 * </Critical Rate Formula>
 *
 * Available:
 *   user, subject, target, item, s, v, rate
 *
 *
 * <Critical Multiplier Formula>
 * value *= 3.0 + bonus;
 * value *= $gameVariables.value(1) * 0.01;
 * </Critical Multiplier Formula>
 *
 * Available:
 *   user, subject, target, item, s, v, bonus, value
 *
 *
 * <Flat Critical Formula>
 * value += 1.5 * user.luk + bonus;
 * value -= 0.75 * target.luk;
 * </Flat Critical Formula>
 *
 * Available:
 *   user, subject, target, item, s, v, bonus, value
 *
 * ============================================================================
 * ACTION SEQUENCES
 * ============================================================================
 *
 * Requires YEP_BattleEngineCore.
 *
 * CRITICAL MULTIPLIER: 50%
 * CRITICAL MULTIPLIER: 2.5
 * CRITICAL MULTIPLIER: VARIABLE 3
 *
 * FLAT CRITICAL: +100
 * FLAT CRITICAL: -250
 * FLAT CRITICAL: VARIABLE 3
 *
 * FORCE CRITICAL
 * FORCE NO CRITICAL
 * NORMAL CRITICAL
 *
 * These settings remain for the current action and are cleared when the action
 * ends.
 *
 * ============================================================================
 * COMPATIBILITY
 * ============================================================================
 *
 * - Designed for RPG Maker MV.
 * - Designed to work with NUSV_DamageCore.
 * - Standard MV skills that cannot critical remain non-critical unless one of
 *   this plugin's skill/item critical notetags is present.
 * - Trait critical-rate modifiers also allow critical checks for matching hit
 *   types if the skill/item normally allows critical hits.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_CriticalControl = true;

var NUSV = NUSV || {};
NUSV.CriticalControl = NUSV.CriticalControl || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_CriticalControl';
    var params = PluginManager.parameters(pluginName);

    NUSV.CriticalControl.rateFormula =
        String(params['Base Critical Rate Formula'] || 'rate = user.cri * (1 - target.cev);');
    NUSV.CriticalControl.multFormula =
        String(params['Base Critical Multiplier Formula'] || 'value *= 3.0 + bonus;');
    NUSV.CriticalControl.flatFormula =
        String(params['Base Flat Critical Formula'] || 'value += bonus;');

    // -------------------------------------------------------------------------
    // Utilities
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

    function traitObjects(battler) {
        if (!battler || !battler.traitObjects) return [];
        return battler.traitObjects().filter(Boolean);
    }

    function parseRate(raw) {
        if (raw == null) return null;
        var t = String(raw).trim();
        if (/%$/.test(t)) {
            var p = parseFloat(t);
            return isNaN(p) ? null : p / 100;
        }
        var n = parseFloat(t);
        return isNaN(n) ? null : n;
    }

    function parseSignedPercent(raw) {
        if (raw == null) return 0;
        var n = parseFloat(String(raw).replace('%','').trim());
        return isNaN(n) ? 0 : n / 100;
    }

    function sumTraitPercent(battler, tag) {
        return traitObjects(battler).reduce(function(sum, obj) {
            return sum + parseSignedPercent(noteValue(obj, tag));
        }, 0);
    }

    function sumTraitNumber(battler, tag) {
        return traitObjects(battler).reduce(function(sum, obj) {
            var raw = noteValue(obj, tag);
            if (raw == null) return sum;
            var n = Number(raw);
            return sum + (isNaN(n) ? 0 : n);
        }, 0);
    }

    function hasSkillCriticalNotetag(item) {
        if (!item || !item.note) return false;
        return /<Critical Rate\s*:/i.test(item.note) ||
               /<Critical Multiplier\s*:/i.test(item.note) ||
               /<Flat Critical\s*:/i.test(item.note) ||
               /<Critical Rate Formula>/i.test(item.note) ||
               /<Critical Multiplier Formula>/i.test(item.note) ||
               /<Flat Critical Formula>/i.test(item.note);
    }

    function safeEvalFormula(code, context, fallback, label) {
        try {
            var user = context.user;
            var subject = user;
            var target = context.target;
            var item = context.item;
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var rate = context.rate;
            var bonus = context.bonus;
            var value = context.value;

            eval(code);

            return {
                rate: Number(rate),
                value: Number(value)
            };
        } catch (e) {
            console.error(pluginName + ': ' + label + ' error');
            console.error(e);
            return fallback;
        }
    }

    // -------------------------------------------------------------------------
    // Action state
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvCriticalMode = function() {
        return this._nusvCriticalMode || 'normal';
    };

    Game_Action.prototype.nusvSetCriticalMode = function(mode) {
        this._nusvCriticalMode = mode || 'normal';
    };

    Game_Action.prototype.nusvSetActionCriticalMultiplier = function(value) {
        this._nusvActionCriticalMultiplier = value;
    };

    Game_Action.prototype.nusvSetActionFlatCritical = function(value) {
        this._nusvActionFlatCritical = value;
    };

    Game_Action.prototype.nusvClearCriticalOverrides = function() {
        this._nusvCriticalMode = 'normal';
        this._nusvActionCriticalMultiplier = undefined;
        this._nusvActionFlatCritical = undefined;
    };

    // -------------------------------------------------------------------------
    // Critical eligibility / rate
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvCanCritical = function() {
        var item = this.item();
        if (!item || !item.damage) return false;
        return !!item.damage.critical || hasSkillCriticalNotetag(item);
    };

    Game_Action.prototype.nusvHitTypeCriticalBonus = function() {
        var user = this.subject();
        if (!user) return 0;

        if (this.isPhysical()) {
            return sumTraitPercent(user, 'Physical Critical Rate');
        } else if (this.isMagical()) {
            return sumTraitPercent(user, 'Magical Critical Rate');
        } else {
            return sumTraitPercent(user, 'Certain Hit Critical Rate');
        }
    };

    Game_Action.prototype.nusvBaseCriticalRate = function(target) {
        var item = this.item();
        var direct = parseRate(noteValue(item, 'Critical Rate'));
        if (direct != null) return direct;

        var custom = multiline(item, 'Critical Rate Formula');
        if (custom) {
            var res = safeEvalFormula(custom, {
                user: this.subject(),
                target: target,
                item: item,
                rate: 0,
                bonus: 0,
                value: 0
            }, {rate: 0, value: 0}, 'Critical Rate Formula');
            return isNaN(res.rate) ? 0 : res.rate;
        }

        var user = this.subject();
        var context = {
            user: user,
            target: target,
            item: item,
            rate: 0,
            bonus: 0,
            value: 0
        };
        var globalRes = safeEvalFormula(
            NUSV.CriticalControl.rateFormula,
            context,
            {rate: user ? user.cri * (1 - target.cev) : 0, value: 0},
            'Base Critical Rate Formula'
        );
        return isNaN(globalRes.rate) ? 0 : globalRes.rate;
    };

    Game_Action.prototype.itemCri = function(target) {
        var mode = this.nusvCriticalMode();
        if (mode === 'force') return 1;
        if (mode === 'none') return 0;
        if (!this.nusvCanCritical()) return 0;

        var direct = noteValue(this.item(), 'Critical Rate');
        var custom = multiline(this.item(), 'Critical Rate Formula');

        // Direct/custom formulas intentionally define the skill rate themselves.
        var rate = this.nusvBaseCriticalRate(target);
        if (direct == null && !custom) {
            rate += this.nusvHitTypeCriticalBonus();
        }

        return Math.max(0, Math.min(1, rate));
    };

    // -------------------------------------------------------------------------
    // Critical multiplier / flat bonus
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvTraitCriticalMultiplierBonus = function() {
        var user = this.subject();
        if (!user) return 0;

        var bonus = sumTraitPercent(user, 'Critical Multiplier');

        // Compatibility with NUSV_DamageCore's early Nusvanir notetag.
        // Treat <Critical Damage: +25%> as an additive multiplier bonus.
        bonus += sumTraitPercent(user, 'Critical Damage');

        var itemExtra = parseSignedPercent(noteValue(this.item(), 'Critical Damage'));
        bonus += itemExtra;

        return bonus;
    };

    Game_Action.prototype.nusvCriticalMultiplier = function(target) {
        var item = this.item();
        var bonus = this.nusvTraitCriticalMultiplierBonus();

        if (this._nusvActionCriticalMultiplier !== undefined) {
            return Number(this._nusvActionCriticalMultiplier) + bonus;
        }

        var direct = parseRate(noteValue(item, 'Critical Multiplier'));
        if (direct != null) return direct + bonus;

        return null; // use formula mode
    };

    Game_Action.prototype.nusvTraitFlatCritical = function() {
        return sumTraitNumber(this.subject(), 'Flat Critical');
    };

    Game_Action.prototype.nusvSkillFlatCriticalFromStat = function() {
        var raw = noteValue(this.item(), 'Flat Critical');
        if (raw == null) return 0;

        var m = String(raw).match(/^([+-]?\d+(?:\.\d+)?)%\s*(hp|mp|atk|def|mat|mdf|agi|luk)$/i);
        if (!m) return 0;

        var rate = Number(m[1]) / 100;
        var stat = m[2].toLowerCase();
        var user = this.subject();
        return user && user[stat] != null ? Number(user[stat]) * rate : 0;
    };

    Game_Action.prototype.nusvFlatCriticalBonus = function(target) {
        if (this._nusvActionFlatCritical !== undefined) {
            return Number(this._nusvActionFlatCritical);
        }
        return this.nusvTraitFlatCritical() + this.nusvSkillFlatCriticalFromStat();
    };

    Game_Action.prototype.applyCritical = function(damage) {
        var item = this.item();
        var user = this.subject();
        var target = this._nusvCriticalTarget || null;
        var bonus = this.nusvTraitCriticalMultiplierBonus();
        var value = Number(damage);

        var customMult = multiline(item, 'Critical Multiplier Formula');
        var directMult = this.nusvCriticalMultiplier(target);

        if (customMult) {
            var multResult = safeEvalFormula(customMult, {
                user: user,
                target: target,
                item: item,
                rate: 0,
                bonus: bonus,
                value: value
            }, {rate: 0, value: value}, 'Critical Multiplier Formula');
            value = isNaN(multResult.value) ? value : multResult.value;
        } else if (directMult != null) {
            value *= directMult;
        } else {
            var globalMultResult = safeEvalFormula(
                NUSV.CriticalControl.multFormula,
                {
                    user: user,
                    target: target,
                    item: item,
                    rate: 0,
                    bonus: bonus,
                    value: value
                },
                {rate: 0, value: value * (3.0 + bonus)},
                'Base Critical Multiplier Formula'
            );
            value = isNaN(globalMultResult.value) ? value : globalMultResult.value;
        }

        var customFlat = multiline(item, 'Flat Critical Formula');
        var flatBonus = this.nusvFlatCriticalBonus(target);

        if (customFlat) {
            var flatResult = safeEvalFormula(customFlat, {
                user: user,
                target: target,
                item: item,
                rate: 0,
                bonus: flatBonus,
                value: value
            }, {rate: 0, value: value + flatBonus}, 'Flat Critical Formula');
            value = isNaN(flatResult.value) ? value : flatResult.value;
        } else {
            var globalFlatResult = safeEvalFormula(
                NUSV.CriticalControl.flatFormula,
                {
                    user: user,
                    target: target,
                    item: item,
                    rate: 0,
                    bonus: flatBonus,
                    value: value
                },
                {rate: 0, value: value + flatBonus},
                'Base Flat Critical Formula'
            );
            value = isNaN(globalFlatResult.value) ? value : globalFlatResult.value;
        }

        return value;
    };

    // NUSV_DamageCore calls applyCritical(value) without a target argument.
    // Capture the target while makeDamageValue runs so custom formulas still
    // receive the correct target.
    var _NUSVCC_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        this._nusvCriticalTarget = target;
        try {
            return _NUSVCC_makeDamageValue.call(this, target, critical);
        } finally {
            this._nusvCriticalTarget = null;
        }
    };

    // -------------------------------------------------------------------------
    // Battle Engine Core Action Sequences
    // -------------------------------------------------------------------------

    if (typeof BattleManager !== 'undefined') {

        BattleManager.nusvCurrentAction = function() {
            return this._action || null;
        };

        var _NUSVCC_processActionSequence = BattleManager.processActionSequence;
        BattleManager.processActionSequence = function(actionName, actionArgs) {
            var name = String(actionName || '').toUpperCase().trim();
            var action = this.nusvCurrentAction();

            if (action) {
                if (name === 'FORCE CRITICAL') {
                    action.nusvSetCriticalMode('force');
                    return true;
                }

                if (name === 'FORCE NO CRITICAL') {
                    action.nusvSetCriticalMode('none');
                    return true;
                }

                if (name === 'NORMAL CRITICAL') {
                    action.nusvSetCriticalMode('normal');
                    return true;
                }

                if (name === 'CRITICAL MULTIPLIER') {
                    var text = (actionArgs || []).join(' ').trim();
                    var value = NUSV.CriticalControl.parseActionValue(text, true);
                    if (value != null) {
                        action.nusvSetActionCriticalMultiplier(value);
                        return true;
                    }
                }

                if (name === 'FLAT CRITICAL') {
                    var flatText = (actionArgs || []).join(' ').trim();
                    var flat = NUSV.CriticalControl.parseActionValue(flatText, false);
                    if (flat != null) {
                        action.nusvSetActionFlatCritical(flat);
                        return true;
                    }
                }
            }

            if (_NUSVCC_processActionSequence) {
                return _NUSVCC_processActionSequence.call(this, actionName, actionArgs);
            }
            return false;
        };

        var _NUSVCC_endAction = BattleManager.endAction;
        BattleManager.endAction = function() {
            if (this._action && this._action.nusvClearCriticalOverrides) {
                this._action.nusvClearCriticalOverrides();
            }
            _NUSVCC_endAction.call(this);
        };
    }

    NUSV.CriticalControl.parseActionValue = function(text, asMultiplier) {
        var t = String(text || '').trim();

        var variable = t.match(/^VARIABLE\s+(\d+)$/i);
        if (variable) {
            var n = Number($gameVariables.value(Number(variable[1])));
            if (isNaN(n)) return null;
            return asMultiplier ? n / 100 : n;
        }

        if (/%$/.test(t)) {
            var p = parseFloat(t);
            if (isNaN(p)) return null;
            return asMultiplier ? p / 100 : p;
        }

        var value = Number(t);
        return isNaN(value) ? null : value;
    };

    NUSV.CriticalControl.version = '1.0.0';

})();
