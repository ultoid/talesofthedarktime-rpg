/*:
 * @plugindesc v1.0.0 NUSV Map Select Equip - select Weapon/Armor on map and store database ID in a variable.
 * @author Ultoid
 *
 * @param Window Width
 * @type number
 * @default 560
 *
 * @param Window Height
 * @type number
 * @default 420
 *
 * @param Show Quantity
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_MapSelectEquip
 * ============================================================================
 * Clean-room implementation written from scratch for Nusvanir.
 *
 * Purpose:
 * - select Weapons, Armors, or both from party inventory
 * - store the selected DATABASE ID into a variable
 * - cancel stores 0
 * - compatible with ordinary MV inventory and YEP_ItemCore-style independent
 *   items by resolving baseItemId when available
 *
 * Plugin Commands:
 *
 *   MapSelectEquip variableId Both
 *   MapSelectEquip variableId Weapon
 *   MapSelectEquip variableId Armor
 *
 * Examples:
 *
 *   MapSelectEquip 10 Both
 *   MapSelectEquip 11 Weapon
 *   MapSelectEquip 12 Armor
 *
 * Optional filters:
 *
 *   MapSelectEquip 10 Weapon WType 3
 *   MapSelectEquip 10 Armor AType 2
 *   MapSelectEquip 10 Armor EType 4
 *
 * Result:
 *   Variable gets the selected database ID.
 *   Cancel = 0.
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_ItemCore       (optional)
 *   YEP_EquipCore      (optional)
 *   NUSV_MapSelectEquip
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_MapSelectEquip = true;
var NUSV = NUSV || {};
NUSV.MapSelectEquip = NUSV.MapSelectEquip || {};

(function() {
'use strict';

var pluginName = 'NUSV_MapSelectEquip';
var p = PluginManager.parameters(pluginName);
var WIN_W = Math.max(320, Number(p['Window Width'] || 560));
var WIN_H = Math.max(240, Number(p['Window Height'] || 420));
var SHOW_QTY = String(p['Show Quantity'] || 'true') === 'true';

function baseDatabaseId(item) {
    if (!item) return 0;
    if (item.baseItemId != null && Number(item.baseItemId) > 0) return Number(item.baseItemId);
    return Number(item.id || 0);
}

function request(variableId, mode, filterType, filterId) {
    $gameTemp._nusvMapSelectEquip = {
        variableId: Math.max(1, Number(variableId || 1)),
        mode: String(mode || 'Both').toLowerCase(),
        filterType: String(filterType || '').toLowerCase(),
        filterId: Number(filterId || 0)
    };
    SceneManager.push(Scene_NUSVMapSelectEquip);
}

function Window_NUSVEquipSelect() { this.initialize.apply(this, arguments); }
Window_NUSVEquipSelect.prototype = Object.create(Window_Selectable.prototype);
Window_NUSVEquipSelect.prototype.constructor = Window_NUSVEquipSelect;

Window_NUSVEquipSelect.prototype.initialize = function(x,y,w,h) {
    Window_Selectable.prototype.initialize.call(this,x,y,w,h);
    this._data = [];
    this.refresh();
    this.select(0);
};

Window_NUSVEquipSelect.prototype.maxItems = function() { return this._data ? this._data.length : 0; };
Window_NUSVEquipSelect.prototype.item = function() { return this._data[this.index()]; };

Window_NUSVEquipSelect.prototype.includes = function(item) {
    if (!item) return false;
    var req = $gameTemp._nusvMapSelectEquip || {};
    var isW = DataManager.isWeapon(item);
    var isA = DataManager.isArmor(item);
    var mode = req.mode || 'both';

    if (mode === 'weapon' && !isW) return false;
    if (mode === 'armor' && !isA) return false;
    if (mode === 'both' && !isW && !isA) return false;

    if (req.filterId > 0) {
        if (req.filterType === 'wtype' && (!isW || item.wtypeId !== req.filterId)) return false;
        if (req.filterType === 'atype' && (!isA || item.atypeId !== req.filterId)) return false;
        if (req.filterType === 'etype' && item.etypeId !== req.filterId) return false;
    }
    return true;
};

Window_NUSVEquipSelect.prototype.makeItemList = function() {
    this._data = $gameParty.allItems().filter(this.includes.bind(this));
};

Window_NUSVEquipSelect.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (!item) return;
    var rect = this.itemRectForText(index);
    var qtyWidth = SHOW_QTY ? 96 : 0;
    this.drawItemName(item, rect.x, rect.y, rect.width - qtyWidth);
    if (SHOW_QTY) {
        this.drawText('x' + $gameParty.numItems(item), rect.x, rect.y, rect.width, 'right');
    }
};

Window_NUSVEquipSelect.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

function Scene_NUSVMapSelectEquip() { this.initialize.apply(this, arguments); }
Scene_NUSVMapSelectEquip.prototype = Object.create(Scene_MenuBase.prototype);
Scene_NUSVMapSelectEquip.prototype.constructor = Scene_NUSVMapSelectEquip;

Scene_NUSVMapSelectEquip.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    var w = Math.min(WIN_W, Graphics.boxWidth);
    var h = Math.min(WIN_H, Graphics.boxHeight);
    var x = Math.floor((Graphics.boxWidth - w) / 2);
    var y = Math.floor((Graphics.boxHeight - h) / 2);
    this._selectWindow = new Window_NUSVEquipSelect(x,y,w,h);
    this._selectWindow.setHandler('ok', this.onOk.bind(this));
    this._selectWindow.setHandler('cancel', this.onCancel.bind(this));
    this.addWindow(this._selectWindow);
    this._selectWindow.activate();
};

Scene_NUSVMapSelectEquip.prototype.finish = function(value) {
    var req = $gameTemp._nusvMapSelectEquip;
    if (req) $gameVariables.setValue(req.variableId, value);
    $gameTemp._nusvMapSelectEquip = null;
    this.popScene();
};

Scene_NUSVMapSelectEquip.prototype.onOk = function() {
    this.finish(baseDatabaseId(this._selectWindow.item()));
};

Scene_NUSVMapSelectEquip.prototype.onCancel = function() { this.finish(0); };
window.Scene_NUSVMapSelectEquip = Scene_NUSVMapSelectEquip;

var _pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command,args) {
    _pluginCommand.call(this,command,args);
    if (String(command).toLowerCase() !== 'mapselectequip') return;
    request(args[0], args[1] || 'Both', args[2] || '', args[3] || 0);
};

NUSV.MapSelectEquip.open = request;
NUSV.MapSelectEquip.baseDatabaseId = baseDatabaseId;
NUSV.MapSelectEquip.version = '1.0.0';

})();