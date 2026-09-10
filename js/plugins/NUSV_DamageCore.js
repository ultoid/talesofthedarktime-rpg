/*:
 * @plugindesc v1.0.0 NUSV Damage Core - clean-room damage core for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Damage Cap
 * @type number
 * @min 0
 * @default 9999
 *
 * @param Default Heal Cap
 * @type number
 * @min 0
 * @default 9999
 *
 * @param Enable Damage Cap
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Round Final Damage
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_DamageCore
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy code from YEP_DamageCore.
 *
 * Goal:
 * - provide a familiar Damage Core workflow
 * - support multiline damage formulas
 * - support damage/heal caps
 * - support bypassing caps
 * - keep compatibility with standard RPG Maker MV damage calculation
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_DamageCore
 *   other battle plugins
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * 1. Multiline Damage Formula
 *
 * <Damage Formula>
 * value = a.atk * 4;
 * value -= b.def * 2;
 * </Damage Formula>
 *
 * Available variables:
 *
 *   a       = action subject
 *   b       = target
 *   user    = action subject
 *   subject = action subject
 *   target  = target
 *   item    = current skill/item
 *   s       = $gameSwitches._data
 *   v       = $gameVariables._data
 *   value   = resulting base damage
 *
 * The formula should assign the result to "value".
 *
 * Example:
 *
 * <Damage Formula>
 * value = a.atk * 5 - b.def * 2;
 * if (b.isStateAffected(10)) value *= 1.25;
 * </Damage Formula>
 *
 *
 * 2. Damage Cap
 *
 * <Damage Cap: 50000>
 *
 * Limits positive damage from that skill/item to 50000.
 *
 *
 * 3. Heal Cap
 *
 * <Heal Cap: 50000>
 *
 * Limits healing from that skill/item to 50000.
 *
 *
 * 4. Bypass Damage Cap
 *
 * <Bypass Damage Cap>
 *
 * Ignores damage and healing caps for that skill/item.
 *
 * ============================================================================
 * ACTOR / CLASS / ENEMY / WEAPON / ARMOR / STATE NOTETAGS
 * ============================================================================
 *
 * These trait objects can also use:
 *
 * <Damage Cap: 50000>
 * <Heal Cap: 50000>
 * <Bypass Damage Cap>
 *
 * Battler-side caps are combined as follows:
 * - the highest applicable Damage Cap is used
 * - the highest applicable Heal Cap is used
 * - if any applicable trait has <Bypass Damage Cap>, caps are bypassed
 *
 * Skill/item-specific caps take priority over battler-side caps.
 *
 * ============================================================================
 * NUSVIR EXTENSIONS
 * ============================================================================
 *
 * Optional extra notetags provided for Nusvanir.
 *
 * <Armor Penetration: 15%>
 *   Physical damage ignores 15% of target DEF in standard-style formulas
 *   that use the helper function below.
 *
 * <Magic Penetration: 15%>
 *   Magical damage ignores 15% of target MDF in formulas using the helper.
 *
 * <Critical Damage: +25%>
 *   Adds +25% to the default critical multiplier.
 *
 * These may be placed on Skills, Items, Actors, Classes, Enemies,
 * Weapons, Armors, or States.
 *
 * Formula helper functions:
 *
 *   nusvDef(b)
 *   nusvMdf(b)
 *
 * Example:
 *
 * <Damage Formula>
 * value = a.atk * 4 - nusvDef(b) * 2;
 * </Damage Formula>
 *
 * If the action/subject has <Armor Penetration: 25%>,
 * nusvDef(b) returns 75% of the target's DEF.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * - Standard MV formula field still works when no <Damage Formula> is present.
 * - Element Rate, PDR/MDR, REC, Critical, Variance, and Guard are still applied.
 * - Damage type follows the normal RPG Maker MV database setting.
 * - This plugin is designed for RPG Maker MV.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_DamageCore = true;

var NUSV = NUSV || {};
NUSV.DamageCore = NUSV.DamageCore || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_DamageCore';
    var params = PluginManager.parameters(pluginName);

    NUSV.DamageCore.defaultDamageCap = Number(params['Default Damage Cap'] || 9999);
    NUSV.DamageCore.defaultHealCap = Number(params['Default Heal Cap'] || 9999);
    NUSV.DamageCore.enableDamageCap = String(params['Enable Damage Cap'] || 'true') === 'true';
    NUSV.DamageCore.roundFinalDamage = String(params['Round Final Damage'] || 'true') === 'true';

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    NUSV.DamageCore.noteValue = function(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    };

    NUSV.DamageCore.hasTag = function(obj, tag) {
        if (!obj || !obj.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(obj.note);
    };

    NUSV.DamageCore.percentValue = function(obj, tag) {
        var raw = this.noteValue(obj, tag);
        if (raw == null) return 0;
        raw = raw.replace(/\s/g, '');
        var value = parseFloat(raw.replace('%', ''));
        if (isNaN(value)) return 0;
        return value / 100;
    };

    NUSV.DamageCore.signedPercentValue = function(obj, tag) {
        return this.percentValue(obj, tag);
    };

    NUSV.DamageCore.multilineTag = function(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    };

    NUSV.DamageCore.traitObjects = function(battler) {
        if (!battler || !battler.traitObjects) return [];
        return battler.traitObjects().filter(function(obj) {
            return !!obj;
        });
    };

    NUSV.DamageCore.actionObjects = function(action) {
        var result = [];
        if (action && action.item && action.item()) result.push(action.item());
        if (action && action.subject) {
            var subject = action.subject();
            result = result.concat(this.traitObjects(subject));
        }
        return result;
    };

    NUSV.DamageCore.highestTagNumber = function(objects, tag, fallback) {
        var found = [];
        objects.forEach(function(obj) {
            var raw = NUSV.DamageCore.noteValue(obj, tag);
            if (raw != null) {
                var n = Number(raw);
                if (!isNaN(n)) found.push(n);
            }
        });
        if (found.length <= 0) return fallback;
        return Math.max.apply(null, found);
    };

    NUSV.DamageCore.anyHasTag = function(objects, tag) {
        return objects.some(function(obj) {
            return NUSV.DamageCore.hasTag(obj, tag);
        });
    };

    NUSV.DamageCore.sumPercentTag = function(objects, tag) {
        return objects.reduce(function(sum, obj) {
            return sum + NUSV.DamageCore.percentValue(obj, tag);
        }, 0);
    };

    // -------------------------------------------------------------------------
    // Action Notetag Access
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvDamageFormula = function() {
        return NUSV.DamageCore.multilineTag(this.item(), 'Damage Formula');
    };

    Game_Action.prototype.nusvBypassDamageCap = function() {
        var item = this.item();
        if (NUSV.DamageCore.hasTag(item, 'Bypass Damage Cap')) return true;
        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.anyHasTag(objects, 'Bypass Damage Cap');
    };

    Game_Action.prototype.nusvDamageCap = function() {
        var itemRaw = NUSV.DamageCore.noteValue(this.item(), 'Damage Cap');
        if (itemRaw != null && !isNaN(Number(itemRaw))) return Number(itemRaw);

        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.highestTagNumber(
            objects,
            'Damage Cap',
            NUSV.DamageCore.defaultDamageCap
        );
    };

    Game_Action.prototype.nusvHealCap = function() {
        var itemRaw = NUSV.DamageCore.noteValue(this.item(), 'Heal Cap');
        if (itemRaw != null && !isNaN(Number(itemRaw))) return Number(itemRaw);

        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.highestTagNumber(
            objects,
            'Heal Cap',
            NUSV.DamageCore.defaultHealCap
        );
    };

    Game_Action.prototype.nusvArmorPenetration = function() {
        return Math.max(
            0,
            NUSV.DamageCore.sumPercentTag(
                NUSV.DamageCore.actionObjects(this),
                'Armor Penetration'
            )
        );
    };

    Game_Action.prototype.nusvMagicPenetration = function() {
        return Math.max(
            0,
            NUSV.DamageCore.sumPercentTag(
                NUSV.DamageCore.actionObjects(this),
                'Magic Penetration'
            )
        );
    };

    Game_Action.prototype.nusvCriticalBonus = function() {
        return NUSV.DamageCore.sumPercentTag(
            NUSV.DamageCore.actionObjects(this),
            'Critical Damage'
        );
    };

    // -------------------------------------------------------------------------
    // Damage Formula
    // -------------------------------------------------------------------------

    var _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
    Game_Action.prototype.evalDamageFormula = function(target) {
        var customFormula = this.nusvDamageFormula();
        if (!customFormula) {
            return _Game_Action_evalDamageFormula.call(this, target);
        }

        try {
            var item = this.item();
            var a = this.subject();
            var b = target;
            var user = a;
            var subject = a;
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var value = 0;
            var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
            var action = this;

            var nusvDef = function(t) {
                if (!t) return 0;
                var pen = Math.min(1, Math.max(0, action.nusvArmorPenetration()));
                return t.def * (1 - pen);
            };

            var nusvMdf = function(t) {
                if (!t) return 0;
                var pen = Math.min(1, Math.max(0, action.nusvMagicPenetration()));
                return t.mdf * (1 - pen);
            };

            // Clean-room formula evaluator.
            // The content of customFormula comes from the developer's own database.
            eval(customFormula);

            value = Number(value);
            if (isNaN(value)) value = 0;
            return Math.max(value, 0) * sign;
        } catch (e) {
            console.error(pluginName + ': Damage Formula Error');
            console.error(this.item());
            console.error(e);
            return 0;
        }
    };

    // -------------------------------------------------------------------------
    // Critical
    // -------------------------------------------------------------------------

    var _Game_Action_applyCritical = Game_Action.prototype.applyCritical;
    Game_Action.prototype.applyCritical = function(damage) {
        var base = _Game_Action_applyCritical.call(this, damage);
        var bonus = this.nusvCriticalBonus();
        if (!bonus) return base;

        // Default MV critical is x3. The bonus is additive to the multiplier:
        // +25% => x3.25 instead of x3.00
        var normalCriticalMultiplier = 3.0;
        var desiredMultiplier = normalCriticalMultiplier + bonus;
        if (normalCriticalMultiplier === 0) return base;
        return base * (desiredMultiplier / normalCriticalMultiplier);
    };

    // -------------------------------------------------------------------------
    // Final Damage Flow
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvApplyDamageCap = function(value) {
        if (!NUSV.DamageCore.enableDamageCap) return value;
        if (this.nusvBypassDamageCap()) return value;

        if (value > 0) {
            var damageCap = Math.max(0, this.nusvDamageCap());
            if (damageCap > 0) value = Math.min(value, damageCap);
        } else if (value < 0) {
            var healCap = Math.max(0, this.nusvHealCap());
            if (healCap > 0) value = Math.max(value, -healCap);
        }

        return value;
    };

    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        // Reproduce the standard MV damage flow so the cap is guaranteed
        // to happen at the final stage, after guard/variance/critical.
        var item = this.item();
        var baseValue = this.evalDamageFormula(target);
        var value = baseValue * this.calcElementRate(target);

        if (this.isPhysical()) value *= target.pdr;
        if (this.isMagical()) value *= target.mdr;
        if (baseValue < 0) value *= target.rec;
        if (critical) value = this.applyCritical(value);

        value = this.applyVariance(value, item.damage.variance);
        value = this.applyGuard(value, target);
        value = this.nusvApplyDamageCap(value);

        if (NUSV.DamageCore.roundFinalDamage) {
            value = Math.round(value);
        }

        return value;
    };

    // -------------------------------------------------------------------------
    // Script-call helpers
    // -------------------------------------------------------------------------

    NUSV.DamageCore.version = '1.0.0';

})();
