/*:
 * @plugindesc v1.0.0 NUSV Item Upgrade - clean-room equipment upgrade/enhance system for RPG Maker MV.
 * @author OpenAI for Nusvanir
 *
 * @param Max Upgrade Level
 * @type number
 * @min 0
 * @default 15
 *
 * @param Upgrade Gold Base
 * @type number
 * @min 0
 * @default 100
 *
 * @param Upgrade Gold Growth
 * @type number
 * @decimals 2
 * @default 1.35
 *
 * @param Upgrade Success Base
 * @type number
 * @min 0
 * @max 100
 * @default 100
 *
 * @param Upgrade Success Loss Per Level
 * @type number
 * @min 0
 * @max 100
 * @default 4
 *
 * @param Failure Destroys Item
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * NUSV_ItemUpgrade
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 *
 * Purpose:
 * - upgrade equipment level (+1, +2, +3...)
 * - increase raw stats
 * - consume gold/materials
 * - configurable success rate
 * - NO item destruction by default
 * - supports separate upgrade caps and custom formulas
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_ItemCore
 *   YEP_EquipCore
 *   NUSV_ItemUpgrade
 *
 * ============================================================================
 * WEAPON / ARMOR NOTETAGS
 * ============================================================================
 *
 * <Upgrade Max: 10>
 *
 * <Upgrade Gold: 500>
 *   Base gold cost override.
 *
 * <Upgrade Material: Item 25, 2>
 *   Consumes Item ID 25 x2 each attempt.
 *
 * <Upgrade Success: 90%>
 *   Base success chance override.
 *
 * <Upgrade ATK: +3>
 * <Upgrade DEF: +2>
 * <Upgrade MAT: +4>
 * <Upgrade MDF: +4>
 * <Upgrade AGI: +1>
 * <Upgrade LUK: +1>
 * <Upgrade MHP: +20>
 * <Upgrade MMP: +10>
 *
 * These are bonuses PER upgrade level.
 *
 * Example:
 * <Upgrade ATK: +5>
 * At +6 => +30 ATK.
 *
 * ============================================================================
 * CUSTOM COST / SUCCESS
 * ============================================================================
 *
 * <Upgrade Cost Formula>
 * gold = 500 * Math.pow(1.4, level);
 * </Upgrade Cost Formula>
 *
 * Variables:
 *   item, level, nextLevel, gold, s, v
 *
 * <Upgrade Success Formula>
 * chance = Math.max(25, 100 - level * 5);
 * </Upgrade Success Formula>
 *
 * chance is percentage 0..100.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * NUSV.ItemUpgrade.level(item)
 * NUSV.ItemUpgrade.canUpgrade(item)
 * NUSV.ItemUpgrade.attempt(item)
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ItemUpgrade = true;

var NUSV = NUSV || {};
NUSV.ItemUpgrade = NUSV.ItemUpgrade || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ItemUpgrade';
    var params = PluginManager.parameters(pluginName);

    var defaultMax = Number(params['Max Upgrade Level'] || 15);
    var goldBase = Number(params['Upgrade Gold Base'] || 100);
    var goldGrowth = Number(params['Upgrade Gold Growth'] || 1.35);
    var successBase = Number(params['Upgrade Success Base'] || 100);
    var successLoss = Number(params['Upgrade Success Loss Per Level'] || 4);
    var destroyOnFail = String(params['Failure Destroys Item'] || 'false') === 'true';

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

    function parsePair(raw) {
        if (raw == null) return null;
        var m = String(raw).match(/^(Item|Weapon|Armor)\s+(\d+)\s*,\s*(\d+)$/i);
        if (!m) return null;
        return { type:m[1].toLowerCase(), id:Number(m[2]), amount:Number(m[3]) };
    }

    function getObj(type, id) {
        if (type === 'item') return $dataItems[id];
        if (type === 'weapon') return $dataWeapons[id];
        if (type === 'armor') return $dataArmors[id];
        return null;
    }

    function ensureData(obj) {
        if (!obj) return;
        if (obj._nusvUpgradeLevel == null) obj._nusvUpgradeLevel = 0;
    }

    NUSV.ItemUpgrade.level = function(obj) {
        ensureData(obj);
        return Number(obj && obj._nusvUpgradeLevel || 0);
    };

    NUSV.ItemUpgrade.maxLevel = function(obj) {
        var raw = noteValue(obj, 'Upgrade Max');
        var n = raw != null ? Number(raw) : defaultMax;
        return Math.max(0, isNaN(n) ? defaultMax : n);
    };

    NUSV.ItemUpgrade.goldCost = function(obj) {
        var level = this.level(obj);
        var nextLevel = level + 1;
        var raw = noteValue(obj, 'Upgrade Gold');
        var gold = raw != null ? Number(raw) : goldBase;
        if (isNaN(gold)) gold = goldBase;
        gold *= Math.pow(goldGrowth, level);

        var code = multiline(obj, 'Upgrade Cost Formula');
        if (code) {
            try {
                var item = obj;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                eval(code);
            } catch(e) {
                console.error(pluginName + ': Upgrade Cost Formula Error', e);
            }
        }
        return Math.max(0, Math.floor(gold));
    };

    NUSV.ItemUpgrade.successChance = function(obj) {
        var level = this.level(obj);
        var nextLevel = level + 1;
        var raw = noteValue(obj, 'Upgrade Success');
        var chance = raw != null ? parseFloat(raw) : (successBase - level * successLoss);
        if (isNaN(chance)) chance = successBase - level * successLoss;

        var code = multiline(obj, 'Upgrade Success Formula');
        if (code) {
            try {
                var item = obj;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                eval(code);
            } catch(e) {
                console.error(pluginName + ': Upgrade Success Formula Error', e);
            }
        }
        return Math.max(0, Math.min(100, Number(chance)));
    };

    NUSV.ItemUpgrade.material = function(obj) {
        return parsePair(noteValue(obj, 'Upgrade Material'));
    };

    NUSV.ItemUpgrade.canUpgrade = function(obj) {
        if (!obj || !(DataManager.isWeapon(obj) || DataManager.isArmor(obj))) return false;
        if (this.level(obj) >= this.maxLevel(obj)) return false;
        if ($gameParty.gold() < this.goldCost(obj)) return false;

        var mat = this.material(obj);
        if (mat) {
            var data = getObj(mat.type, mat.id);
            if (!data || $gameParty.numItems(data) < mat.amount) return false;
        }
        return true;
    };

    NUSV.ItemUpgrade.payCost = function(obj) {
        $gameParty.loseGold(this.goldCost(obj));
        var mat = this.material(obj);
        if (mat) {
            var data = getObj(mat.type, mat.id);
            if (data) $gameParty.loseItem(data, mat.amount);
        }
    };

    NUSV.ItemUpgrade.attempt = function(obj) {
        if (!this.canUpgrade(obj)) return false;

        this.payCost(obj);
        var success = Math.random() * 100 < this.successChance(obj);

        if (success) {
            ensureData(obj);
            obj._nusvUpgradeLevel += 1;
        } else if (destroyOnFail) {
            $gameParty.loseItem(obj, 1);
        }

        return success;
    };

    NUSV.ItemUpgrade.paramBonus = function(obj, paramId) {
        if (!obj) return 0;
        var tags = ['MHP','MMP','ATK','DEF','MAT','MDF','AGI','LUK'];
        var key = tags[paramId];
        if (!key) return 0;
        var raw = noteValue(obj, 'Upgrade ' + key);
        var perLevel = raw != null ? Number(raw) : 0;
        if (isNaN(perLevel)) perLevel = 0;
        return perLevel * this.level(obj);
    };

    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        var actor = this;
        this.equips().forEach(function(eq) {
            if (eq) value += NUSV.ItemUpgrade.paramBonus(eq, paramId);
        });
        return value;
    };

    NUSV.ItemUpgrade.version = '1.0.0';
})();
