/*:
 * @plugindesc v1.0.0 NUSV Map Select Item - advanced map item selection with category/type filters and variable result.
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
 * NUSV_MapSelectItem
 * ============================================================================
 * Clean-room implementation written from scratch for Nusvanir.
 *
 * MV already has "Select Item". This plugin adds a plugin-command workflow
 * useful when you want category filters and the same style as the other NUSV
 * Map Select plugins.
 *
 * Plugin Commands:
 *
 *   MapSelectItem variableId All
 *   MapSelectItem variableId Normal
 *   MapSelectItem variableId KeyItem
 *
 * With NUSV_ItemMenuCategories:
 *
 *   MapSelectItem variableId Category categoryName
 *
 * Examples:
 *
 *   MapSelectItem 10 All
 *   MapSelectItem 11 Normal
 *   MapSelectItem 12 KeyItem
 *   MapSelectItem 13 Category Material
 *   MapSelectItem 14 Category Forge
 *   MapSelectItem 15 Category Valuable
 *
 * Result:
 *   Variable gets selected Item database ID.
 *   Cancel = 0.
 *
 * This plugin selects ITEMS only. Use NUSV_MapSelectEquip for Weapons/Armors.
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_ItemCore                  (optional)
 *   NUSV_ItemMenuCategories       (optional)
 *   NUSV_MapSelectItem
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_MapSelectItem = true;
var NUSV = NUSV || {};
NUSV.MapSelectItem = NUSV.MapSelectItem || {};

(function() {
'use strict';

var pluginName = 'NUSV_MapSelectItem';
var p = PluginManager.parameters(pluginName);
var WIN_W = Math.max(320, Number(p['Window Width'] || 560));
var WIN_H = Math.max(240, Number(p['Window Height'] || 420));
var SHOW_QTY = String(p['Show Quantity'] || 'true') === 'true';

function baseDatabaseId(item) {
    if (!item) return 0;
    if (item.baseItemId != null && Number(item.baseItemId) > 0) return Number(item.baseItemId);
    return Number(item.id || 0);
}

function request(variableId, mode, category) {
    $gameTemp._nusvMapSelectItem = {
        variableId: Math.max(1,Number(variableId || 1)),
        mode: String(mode || 'All').toLowerCase(),
        category: String(category || '')
    };
    SceneManager.push(Scene_NUSVMapSelectItem);
}

function Window_NUSVItemSelect() { this.initialize.apply(this, arguments); }
Window_NUSVItemSelect.prototype = Object.create(Window_Selectable.prototype);
Window_NUSVItemSelect.prototype.constructor = Window_NUSVItemSelect;

Window_NUSVItemSelect.prototype.initialize = function(x,y,w,h) {
    Window_Selectable.prototype.initialize.call(this,x,y,w,h);
    this._data = [];
    this.refresh();
    this.select(0);
};

Window_NUSVItemSelect.prototype.maxItems = function() { return this._data ? this._data.length : 0; };
Window_NUSVItemSelect.prototype.item = function() { return this._data[this.index()]; };

Window_NUSVItemSelect.prototype.includes = function(item) {
    if (!item || !DataManager.isItem(item)) return false;
    var req = $gameTemp._nusvMapSelectItem || {};
    var mode = req.mode || 'all';

    if (mode === 'normal' && item.itypeId !== 1) return false;
    if ((mode === 'keyitem' || mode === 'key') && item.itypeId !== 2) return false;

    if (mode === 'category') {
        if (Imported.NUSV_ItemMenuCategories &&
            NUSV.ItemMenuCategories &&
            NUSV.ItemMenuCategories.includesCategory) {
            return NUSV.ItemMenuCategories.includesCategory(item, req.category);
        }
        var re = /<Menu Category:\s*([^>]+)>/ig;
        var m, target = String(req.category || '').toLowerCase();
        while ((m = re.exec(item.note || ''))) {
            var cats = String(m[1]).split(',');
            for (var i=0;i<cats.length;i++) {
                if (cats[i].trim().toLowerCase() === target) return true;
            }
        }
        return false;
    }
    return true;
};

Window_NUSVItemSelect.prototype.makeItemList = function() {
    this._data = $gameParty.items().filter(this.includes.bind(this));
};

Window_NUSVItemSelect.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (!item) return;
    var rect = this.itemRectForText(index);
    var qtyWidth = SHOW_QTY ? 96 : 0;
    this.drawItemName(item,rect.x,rect.y,rect.width-qtyWidth);
    if (SHOW_QTY) this.drawText('x'+$gameParty.numItems(item),rect.x,rect.y,rect.width,'right');
};

Window_NUSVItemSelect.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

function Scene_NUSVMapSelectItem() { this.initialize.apply(this, arguments); }
Scene_NUSVMapSelectItem.prototype = Object.create(Scene_MenuBase.prototype);
Scene_NUSVMapSelectItem.prototype.constructor = Scene_NUSVMapSelectItem;

Scene_NUSVMapSelectItem.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    var w = Math.min(WIN_W,Graphics.boxWidth);
    var h = Math.min(WIN_H,Graphics.boxHeight);
    var x = Math.floor((Graphics.boxWidth-w)/2);
    var y = Math.floor((Graphics.boxHeight-h)/2);
    this._selectWindow = new Window_NUSVItemSelect(x,y,w,h);
    this._selectWindow.setHandler('ok',this.onOk.bind(this));
    this._selectWindow.setHandler('cancel',this.onCancel.bind(this));
    this.addWindow(this._selectWindow);
    this._selectWindow.activate();
};

Scene_NUSVMapSelectItem.prototype.finish = function(value) {
    var req = $gameTemp._nusvMapSelectItem;
    if (req) $gameVariables.setValue(req.variableId,Number(value || 0));
    $gameTemp._nusvMapSelectItem = null;
    this.popScene();
};

Scene_NUSVMapSelectItem.prototype.onOk = function() {
    this.finish(baseDatabaseId(this._selectWindow.item()));
};
Scene_NUSVMapSelectItem.prototype.onCancel = function() { this.finish(0); };
window.Scene_NUSVMapSelectItem = Scene_NUSVMapSelectItem;

var _pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command,args) {
    _pluginCommand.call(this,command,args);
    if (String(command).toLowerCase() !== 'mapselectitem') return;
    var mode = args[1] || 'All';
    var category = '';
    if (String(mode).toLowerCase() === 'category') category = args.slice(2).join(' ');
    request(args[0],mode,category);
};

NUSV.MapSelectItem.open = request;
NUSV.MapSelectItem.baseDatabaseId = baseDatabaseId;
NUSV.MapSelectItem.version = '1.0.0';

})();