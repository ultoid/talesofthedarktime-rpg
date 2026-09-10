/*:
 * @plugindesc v1.0.0 NUSV Extra Param Formula - clean-room custom X-Parameter formulas for RPG Maker MV.
 * @author Ultoid
 *
 * @param HIT Formula
 * @desc Formula for Hit Rate. Variables: base, user, a, s, v.
 * @default value = base;
 *
 * @param EVA Formula
 * @desc Formula for Evasion Rate.
 * @default value = base;
 *
 * @param CRI Formula
 * @desc Formula for Critical Rate.
 * @default value = base;
 *
 * @param CEV Formula
 * @desc Formula for Critical Evasion.
 * @default value = base;
 *
 * @param MEV Formula
 * @desc Formula for Magic Evasion.
 * @default value = base;
 *
 * @param MRF Formula
 * @desc Formula for Magic Reflection.
 * @default value = base;
 *
 * @param CNT Formula
 * @desc Formula for Counter Attack.
 * @default value = base;
 *
 * @param HRG Formula
 * @desc Formula for HP Regeneration.
 * @default value = base;
 *
 * @param MRG Formula
 * @desc Formula for MP Regeneration.
 * @default value = base;
 *
 * @param TRG Formula
 * @desc Formula for TP Regeneration.
 * @default value = base;
 *
 * @help
 * ============================================================================
 * NUSV_ExtraParamFormula
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_ExtraParamFormula source code.
 *
 * Purpose:
 * - control RPG Maker MV Extra Parameters (X-Parameters) with formulas
 * - keep native trait values as the starting "base"
 * - allow global formulas through Plugin Parameters
 * - allow Actor/Class/Enemy/Weapon/Armor/State notetag adjustments
 *
 * Extra Parameters:
 *
 *   HIT = Hit Rate
 *   EVA = Evasion Rate
 *   CRI = Critical Rate
 *   CEV = Critical Evasion
 *   MEV = Magic Evasion
 *   MRF = Magic Reflection
 *   CNT = Counter Attack
 *   HRG = HP Regeneration
 *   MRG = MP Regeneration
 *   TRG = TP Regeneration
 *
 * NOTE:
 * These parameters are decimal rates.
 *
 *   5%   = 0.05
 *   100% = 1.00
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
 *   NUSV_ExtraParamFormula
 *
 * ============================================================================
 * GLOBAL FORMULAS
 * ============================================================================
 *
 * Configure formulas from Plugin Manager.
 *
 * Default:
 *
 *   value = base;
 *
 * Available variables:
 *
 *   user  = battler
 *   a     = battler
 *   base  = native MV X-Parameter value from traits
 *   value = final result
 *   s     = $gameSwitches._data
 *   v     = $gameVariables._data
 *
 * Example HIT Formula:
 *
 *   value = base + user.agi * 0.0005;
 *
 * Example CRI Formula:
 *
 *   value = base + user.luk * 0.0002;
 *
 * ============================================================================
 * TRAIT OBJECT NOTETAGS
 * ============================================================================
 *
 * May be placed on:
 * Actor, Class, Enemy, Weapon, Armor, State
 *
 * Flat additive adjustment:
 *
 * <HIT Plus: +5%>
 * <EVA Plus: +10%>
 * <CRI Plus: +3%>
 * <CEV Plus: +5%>
 * <MEV Plus: +5%>
 * <MRF Plus: +5%>
 * <CNT Plus: +10%>
 * <HRG Plus: +3%>
 * <MRG Plus: +2%>
 * <TRG Plus: +5%>
 *
 * Multiplicative adjustment:
 *
 * <HIT Rate: 110%>
 * <EVA Rate: 125%>
 * <CRI Rate: 150%>
 *
 * Calculation order:
 *
 *   Native MV base
 *      -> all Plus modifiers
 *      -> all Rate modifiers
 *      -> global formula
 *      -> custom formula notetags
 *
 * ============================================================================
 * CUSTOM FORMULA NOTETAGS
 * ============================================================================
 *
 * <HIT Formula>
 * value += user.agi * 0.0005;
 * </HIT Formula>
 *
 * <CRI Formula>
 * if (user.hpRate() <= 0.5) value += 0.10;
 * </CRI Formula>
 *
 * <HRG Formula>
 * if (user.isStateAffected(20)) value += 0.05;
 * </HRG Formula>
 *
 * Available:
 *
 *   user  = battler
 *   a     = battler
 *   base  = value before this custom formula
 *   value = editable value
 *   s     = $gameSwitches._data
 *   v     = $gameVariables._data
 *
 * Multiple trait objects may each have a custom formula.
 * They are processed in traitObjects() order.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * battler.hit
 * battler.eva
 * battler.cri
 * battler.cev
 * battler.mev
 * battler.mrf
 * battler.cnt
 * battler.hrg
 * battler.mrg
 * battler.trg
 *
 * continue to work normally.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * This plugin replaces the final xparam calculation only. Native RPG Maker MV
 * trait data remains supported and becomes the "base" used by formulas.
 *
 * Be careful not to write formulas like:
 *
 *   value = user.cri + 0.10;
 *
 * inside CRI Formula, because user.cri calls CRI again and creates recursion.
 *
 * Use:
 *
 *   value = base + 0.10;
 *
 * instead.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ExtraParamFormula = true;

var NUSV = NUSV || {};
NUSV.ExtraParamFormula = NUSV.ExtraParamFormula || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ExtraParamFormula';
    var params = PluginManager.parameters(pluginName);

    var keys = [
        'HIT','EVA','CRI','CEV','MEV',
        'MRF','CNT','HRG','MRG','TRG'
    ];

    var formulas = {};
    keys.forEach(function(key) {
        formulas[key] = String(params[key + ' Formula'] || 'value = base;');
    });

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    }

    function multiline(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    }

    function parsePercent(raw, defaultValue) {
        if (raw == null) return defaultValue;
        var text = String(raw).trim();
        var value;

        if (/%$/.test(text)) {
            value = parseFloat(text) / 100;
        } else {
            value = Number(text);
        }

        return isNaN(value) ? defaultValue : value;
    }

    function traitObjects(battler) {
        if (!battler || !battler.traitObjects) return [];
        return battler.traitObjects().filter(Boolean);
    }

    function safeEval(code, battler, startValue, baseValue, label) {
        try {
            var user = battler;
            var a = battler;
            var base = Number(baseValue);
            var value = Number(startValue);
            var s = $gameSwitches._data;
            var v = $gameVariables._data;

            eval(code);

            value = Number(value);
            return isNaN(value) ? startValue : value;
        } catch (e) {
            console.error(pluginName + ': ' + label + ' Formula Error');
            console.error(e);
            return startValue;
        }
    }

    function applyNotetagModifiers(battler, key, value) {
        var objects = traitObjects(battler);

        // Additive Plus modifiers.
        objects.forEach(function(obj) {
            var raw = noteValue(obj, key + ' Plus');
            if (raw != null) {
                value += parsePercent(raw, 0);
            }
        });

        // Multiplicative Rate modifiers.
        objects.forEach(function(obj) {
            var raw = noteValue(obj, key + ' Rate');
            if (raw != null) {
                value *= parsePercent(raw, 1);
            }
        });

        return value;
    }

    function applyCustomTraitFormulas(battler, key, value) {
        var objects = traitObjects(battler);

        objects.forEach(function(obj) {
            var code = multiline(obj, key + ' Formula');
            if (!code) return;

            value = safeEval(
                code,
                battler,
                value,
                value,
                key + ' trait'
            );
        });

        return value;
    }

    // -------------------------------------------------------------------------
    // Native base xparam
    // -------------------------------------------------------------------------

    var _Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;

    Game_BattlerBase.prototype.nusvNativeXParam = function(xparamId) {
        return _Game_BattlerBase_xparam.call(this, xparamId);
    };

    Game_BattlerBase.prototype.nusvExtraParamKey = function(xparamId) {
        return keys[xparamId] || null;
    };

    Game_BattlerBase.prototype.xparam = function(xparamId) {
        var key = this.nusvExtraParamKey(xparamId);
        if (!key) return _Game_BattlerBase_xparam.call(this, xparamId);

        // Native MV traits are preserved as base.
        var nativeBase = _Game_BattlerBase_xparam.call(this, xparamId);
        var value = nativeBase;

        // 1. Notetag Plus / Rate.
        value = applyNotetagModifiers(this, key, value);

        // 2. Global plugin-manager formula.
        value = safeEval(
            formulas[key],
            this,
            value,
            nativeBase,
            key + ' global'
        );

        // 3. Individual trait-object custom formulas.
        value = applyCustomTraitFormulas(this, key, value);

        // Avoid NaN/Infinity contaminating battle calculations.
        if (!isFinite(value)) value = nativeBase;

        return value;
    };

    // -------------------------------------------------------------------------
    // Convenience getters
    // -------------------------------------------------------------------------

    NUSV.ExtraParamFormula.keys = keys.slice();
    NUSV.ExtraParamFormula.formulas = formulas;
    NUSV.ExtraParamFormula.noteValue = noteValue;
    NUSV.ExtraParamFormula.multiline = multiline;
    NUSV.ExtraParamFormula.version = '1.0.0';

})();
