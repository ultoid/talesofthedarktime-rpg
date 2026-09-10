/*:
 * @plugindesc v1.0.0 NUSV Socket Core - clean-room equipment socket/augment system for RPG Maker MV.
 * @author OpenAI for Nusvanir
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

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function hasTag(obj, tag) {
        if (!obj || !obj.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(obj.note);
    }

    function ensureSockets(eq) {
        if (!eq) return;
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
        ensureSockets(eq);
        return eq ? eq._nusvSockets : [];
    };

    NUSV.SocketCore.isSocketItem = function(item) {
        return !!(item && DataManager.isItem(item) && hasTag(item, 'Socket Item'));
    };

    NUSV.SocketCore.canAttach = function(eq, item) {
        if (!eq || !this.isSocketItem(item)) return false;
        if (!(DataManager.isWeapon(eq) || DataManager.isArmor(eq))) return false;

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
        ensureSockets(eq);
        index = Number(index);
        if (!eq || index < 0 || index >= eq._nusvSockets.length) return false;

        var itemId = eq._nusvSockets[index];
        if (!itemId) return false;

        var item = $dataItems[itemId];
        eq._nusvSockets[index] = 0;
        if (item) $gameParty.gainItem(item, 1);
        return true;
    };

    NUSV.SocketCore.paramBonus = function(eq, paramId) {
        ensureSockets(eq);
        if (!eq) return 0;

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

    NUSV.SocketCore.version = '1.0.0';
})();
