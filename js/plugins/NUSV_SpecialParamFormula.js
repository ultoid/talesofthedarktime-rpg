/*:
 * @plugindesc v1.0.0 NUSV Special Param Formula - clean-room custom S-Parameter formulas for RPG Maker MV.
 * @author OpenAI for Nusvanir
 *
 * @param TGR Formula
 * @desc Formula for Target Rate.
 * @default value = base;
 *
 * @param GRD Formula
 * @desc Formula for Guard Effect Rate.
 * @default value = base;
 *
 * @param REC Formula
 * @desc Formula for Recovery Effect Rate.
 * @default value = base;
 *
 * @param PHA Formula
 * @desc Formula for Pharmacology.
 * @default value = base;
 *
 * @param MCR Formula
 * @desc Formula for MP Cost Rate.
 * @default value = base;
 *
 * @param TCR Formula
 * @desc Formula for TP Charge Rate.
 * @default value = base;
 *
 * @param PDR Formula
 * @desc Formula for Physical Damage Rate.
 * @default value = base;
 *
 * @param MDR Formula
 * @desc Formula for Magical Damage Rate.
 * @default value = base;
 *
 * @param FDR Formula
 * @desc Formula for Floor Damage Rate.
 * @default value = base;
 *
 * @param EXR Formula
 * @desc Formula for Experience Rate.
 * @default value = base;
 *
 * @help
 * ============================================================================
 * NUSV_SpecialParamFormula
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_SpecialParamFormula source code.
 *
 * Purpose:
 * - control RPG Maker MV Special Parameters (S-Parameters) with formulas
 * - preserve native trait values as "base"
 * - support Plugin Manager global formulas
 * - support Actor/Class/Enemy/Weapon/Armor/State notetag adjustments
 *
 * Special Parameters:
 *
 *   TGR = Target Rate
 *   GRD = Guard Effect Rate
 *   REC = Recovery Effect Rate
 *   PHA = Pharmacology
 *   MCR = MP Cost Rate
 *   TCR = TP Charge Rate
 *   PDR = Physical Damage Rate
 *   MDR = Magical Damage Rate
 *   FDR = Floor Damage Rate
 *   EXR = Experience Rate
 *
 * These are multiplicative rates.
 *
 *   100% = 1.00
 *   90%  = 0.90
 *   120% = 1.20
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
 *   NUSV_SpecialParamFormula
 *
 * ============================================================================
 * GLOBAL FORMULAS
 * ============================================================================
 *
 * Each Special Parameter has a formula in Plugin Manager.
 *
 * Default:
 *
 *   value = base;
 *
 * Available variables:
 *
 *   user  = battler
 *   a     = battler
 *   base  = native MV S-Parameter value
 *   value = final value
 *   s     = $gameSwitches._data
 *   v     = $gameVariables._data
 *
 * Example:
 *
 * REC Formula
 *   value = base + user.mat * 0.001;
 *
 * TCR Formula
 *   value = base + user.agi * 0.0005;
 *
 * ============================================================================
 * TRAIT OBJECT NOTETAGS
 * ============================================================================
 *
 * May be placed on:
 * Actor, Class, Enemy, Weapon, Armor, State
 *
 * Additive modifier:
 *
 * <TGR Plus: +25%>
 * <GRD Plus: +20%>
 * <REC Plus: +10%>
 * <PHA Plus: +15%>
 * <MCR Plus: -10%>
 * <TCR Plus: +15%>
 * <PDR Plus: -10%>
 * <MDR Plus: -5%>
 * <FDR Plus: -25%>
 * <EXR Plus: +10%>
 *
 * Multiplicative modifier:
 *
 * <TGR Rate: 125%>
 * <GRD Rate: 120%>
 * <REC Rate: 110%>
 * <MCR Rate: 90%>
 * <PDR Rate: 90%>
 * <MDR Rate: 95%>
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
 * <PDR Formula>
 * if (user.hpRate() <= 0.25) value *= 0.85;
 * </PDR Formula>
 *
 * <REC Formula>
 * if (user.isStateAffected(20)) value += 0.20;
 * </REC Formula>
 *
 * <MCR Formula>
 * if (user.mpRate() <= 0.25) value *= 0.90;
 * </MCR Formula>
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
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * battler.tgr
 * battler.grd
 * battler.rec
 * battler.pha
 * battler.mcr
 * battler.tcr
 * battler.pdr
 * battler.mdr
 * battler.fdr
 * battler.exr
 *
 * continue to work normally.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * Avoid self-referencing the same S-Parameter inside its own formula.
 *
 * Bad:
 *   value = user.pdr * 0.9;
 *
 * Good:
 *   value = base * 0.9;
 *
 * This prevents recursive calls.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_SpecialParamFormula = true;

var NUSV = NUSV || {};
NUSV.SpecialParamFormula = NUSV.SpecialParamFormula || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_SpecialParamFormula';
    var params = PluginManager.parameters(pluginName);

    var keys = [
        'TGR','GRD','REC','PHA','MCR',
        'TCR','PDR','MDR','FDR','EXR'
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

        // Additive modifiers.
        objects.forEach(function(obj) {
            var raw = noteValue(obj, key + ' Plus');
            if (raw != null) {
                value += parsePercent(raw, 0);
            }
        });

        // Multiplicative modifiers.
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
    // Native base sparam
    // -------------------------------------------------------------------------

    var _Game_BattlerBase_sparam = Game_BattlerBase.prototype.sparam;

    Game_BattlerBase.prototype.nusvNativeSParam = function(sparamId) {
        return _Game_BattlerBase_sparam.call(this, sparamId);
    };

    Game_BattlerBase.prototype.nusvSpecialParamKey = function(sparamId) {
        return keys[sparamId] || null;
    };

    Game_BattlerBase.prototype.sparam = function(sparamId) {
        var key = this.nusvSpecialParamKey(sparamId);
        if (!key) return _Game_BattlerBase_sparam.call(this, sparamId);

        var nativeBase = _Game_BattlerBase_sparam.call(this, sparamId);
        var value = nativeBase;

        // 1. Trait notetags.
        value = applyNotetagModifiers(this, key, value);

        // 2. Plugin-manager formula.
        value = safeEval(
            formulas[key],
            this,
            value,
            nativeBase,
            key + ' global'
        );

        // 3. Trait custom formulas.
        value = applyCustomTraitFormulas(this, key, value);

        if (!isFinite(value)) value = nativeBase;

        return value;
    };

    // -------------------------------------------------------------------------
    // Public helpers
    // -------------------------------------------------------------------------

    NUSV.SpecialParamFormula.keys = keys.slice();
    NUSV.SpecialParamFormula.formulas = formulas;
    NUSV.SpecialParamFormula.noteValue = noteValue;
    NUSV.SpecialParamFormula.multiline = multiline;
    NUSV.SpecialParamFormula.version = '1.0.0';

})();
