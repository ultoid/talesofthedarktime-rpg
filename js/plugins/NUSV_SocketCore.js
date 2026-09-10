/*:
 * @plugindesc v1.1.0 NUSV Socket Core - clean-room equipment socket/augment system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Socket Count
 * @type number
 * @min 0
 * @default 0
 *
 * @help
 * ============================================================================
 * NUSV_SocketCore
 * ============================================================================
 *
 * Clean-room socket/augment implementation for Nusvanir.
 *
 * Purpose:
 * - equipment can have sockets
 * - socket items into weapons/armors
 * - socketed items grant parameter bonuses
 * - remove/replace sockets
 * - supports future special socket effects
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_ItemCore
 *   YEP_EquipCore
 *   NUSV_ItemUpgrade
 *   NUSV_SocketCore
 *
 * ============================================================================
 * EQUIPMENT NOTETAGS
 * ============================================================================
 *
 * <Sockets: 2>
 *
 * ============================================================================
 * SOCKET ITEM NOTETAGS
 * ============================================================================
 *
 * Put on an Item used as socket material:
 *
 * <Socket Item>
 * <Socket MHP: +50>
 * <Socket MMP: +20>
 * <Socket ATK: +5>
 * <Socket DEF: +5>
 * <Socket MAT: +5>
 * <Socket MDF: +5>
 * <Socket AGI: +3>
 * <Socket LUK: +3>
 *
 * Optional restriction:
 *
 * <Socket Weapon Only>
 * <Socket Armor Only>
 *
 * ============================================================================
 * YEP ITEM CORE / INDEPENDENT EQUIPMENT
 * ============================================================================
 *
 * When YEP_ItemCore uses independent Weapons/Armors, sockets are stored on
 * the actual independent equipment instance (baseItemId), never on the base
 * database object. Two copies of the same equipment can therefore have
 * completely different socket contents, and YEP_ItemCore save/load persists
 * those fields with the independent item.
 *
 * Passing a base database Weapon/Armor to attach()/remove() is rejected while
 * independent equipment is enabled.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * NUSV.SocketCore.socketCount(equipment)
 * NUSV.SocketCore.sockets(equipment)
 * NUSV.SocketCore.canAttach(equipment, item)
 * NUSV.SocketCore.attach(equipment, item)
 * NUSV.SocketCore.remove(equipment, index)
 *
 * remove() returns removed socket item to party.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_SocketCore = true;

var NUSV = NUSV || {};
NUSV.SocketCore = NUSV.SocketCore || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_SocketCore';
    var params = PluginManager.parameters(pluginName);
    var defaultSockets = Number(params['Default Socket Count'] || 0);

    function baseObject(obj) {
        if (!obj) return null;
        if (obj.baseItemId) {
            if (DataManager.isWeapon(obj)) return $dataWeapons[obj.baseItemId] || obj;
            if (DataManager.isArmor(obj)) return $dataArmors[obj.baseItemId] || obj;
        }
        return obj;
    }

    function noteValue(obj, tag) {
        var source = baseObject(obj);
        if (!source || !source.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = source.note.match(re);
        return m ? m[1].trim() : null;
    }

    function hasTag(obj, tag) {
        var source = baseObject(obj);
        if (!source || !source.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(source.note);
    }

    function usesIndependentEquipment() {
        return !!(Imported.YEP_ItemCore && window.Yanfly && Yanfly.Param &&
            (Number(Yanfly.Param.ItemMaxWeapons || 0) > 0 ||
             Number(Yanfly.Param.ItemMaxArmors || 0) > 0));
    }

    function isMutableInstance(eq) {
        if (!eq || !(DataManager.isWeapon(eq) || DataManager.isArmor(eq))) return false;
        if (!usesIndependentEquipment()) return true;
        return !!eq.baseItemId;
    }

    function ensureSockets(eq) {
        if (!eq || !isMutableInstance(eq)) return;
        if (!Array.isArray(eq._nusvSockets)) eq._nusvSockets = [];
        var max = NUSV.SocketCore.socketCount(eq);
        while (eq._nusvSockets.length < max) eq._nusvSockets.push(0);
        if (eq._nusvSockets.length > max) eq._nusvSockets.length = max;
    }

    NUSV.SocketCore.socketCount = function(eq) {
        var raw = noteValue(eq, 'Sockets');
        var count = raw != null ? Number(raw) : defaultSockets;
        return Math.max(0, Math.floor(isNaN(count) ? defaultSockets : count));
    };

    NUSV.SocketCore.sockets = function(eq) {
        if (!eq || !isMutableInstance(eq)) return [];
        ensureSockets(eq);
        return eq._nusvSockets;
    };

    NUSV.SocketCore.isMutableInstance = isMutableInstance;
    NUSV.SocketCore.baseObject = baseObject;

    NUSV.SocketCore.isSocketItem = function(item) {
        return !!(item && DataManager.isItem(item) && hasTag(item, 'Socket Item'));
    };

    NUSV.SocketCore.canAttach = function(eq, item) {
        if (!eq || !this.isSocketItem(item)) return false;
        if (!(DataManager.isWeapon(eq) || DataManager.isArmor(eq))) return false;
        if (!isMutableInstance(eq)) return false;

        if (hasTag(item, 'Socket Weapon Only') && !DataManager.isWeapon(eq)) return false;
        if (hasTag(item, 'Socket Armor Only') && !DataManager.isArmor(eq)) return false;

        ensureSockets(eq);
        return eq._nusvSockets.indexOf(0) >= 0 && $gameParty.numItems(item) > 0;
    };

    NUSV.SocketCore.attach = function(eq, item) {
        if (!this.canAttach(eq, item)) return false;

        ensureSockets(eq);
        var index = eq._nusvSockets.indexOf(0);
        eq._nusvSockets[index] = item.id;
        $gameParty.loseItem(item, 1);
        return true;
    };

    NUSV.SocketCore.remove = function(eq, index) {
        if (!eq || !isMutableInstance(eq)) return false;
        ensureSockets(eq);
        index = Number(index);
        if (index < 0 || index >= eq._nusvSockets.length) return false;

        var itemId = eq._nusvSockets[index];
        if (!itemId) return false;

        var item = $dataItems[itemId];
        eq._nusvSockets[index] = 0;
        if (item) $gameParty.gainItem(item, 1);
        return true;
    };

    NUSV.SocketCore.paramBonus = function(eq, paramId) {
        if (!eq || !isMutableInstance(eq)) return 0;
        ensureSockets(eq);

        var tags = ['MHP','MMP','ATK','DEF','MAT','MDF','AGI','LUK'];
        var key = tags[paramId];
        if (!key) return 0;

        return eq._nusvSockets.reduce(function(sum, itemId) {
            var item = $dataItems[itemId];
            if (!item) return sum;
            var raw = noteValue(item, 'Socket ' + key);
            var n = raw != null ? Number(raw) : 0;
            return sum + (isNaN(n) ? 0 : n);
        }, 0);
    };

    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        this.equips().forEach(function(eq) {
            if (eq) value += NUSV.SocketCore.paramBonus(eq, paramId);
        });
        return value;
    };

    NUSV.SocketCore.version = '1.1.0';
})();
