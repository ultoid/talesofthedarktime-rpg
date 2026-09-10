/*:
 * @plugindesc v1.0.0 NUSV Item Menu Categories - clean-room custom item categories for RPG Maker MV.
 * @author Ultoid
 *
 * @param Category Order
 * @type text
 * @default Item,Weapon,Armor,KeyItem,Consumable,Material,Forge,Valuable
 *
 * @param Show Empty Categories
 * @type boolean
 * @default false
 *
 * @param All Category Name
 * @type text
 * @default All
 *
 * @param Show All Category
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * NUSV_ItemMenuCategories
 * ============================================================================
 * Clean-room implementation written from scratch for Nusvanir.
 *
 * Adds custom item-menu categories while keeping MV's built-in categories.
 *
 * Item / Weapon / Armor notetags:
 *
 * <Menu Category: Material>
 * <Menu Category: Material, Forge>
 *
 * Multiple separate tags are also supported.
 *
 * Built-in category names:
 *   Item
 *   Weapon
 *   Armor
 *   KeyItem
 *   All
 *
 * Recommended Nusvanir order:
 * Consumable,Material,Forge,Valuable,Weapon,Armor,KeyItem
 *
 * Put below YEP_ItemCore if YEP_ItemCore is enabled.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ItemMenuCategories = true;

var NUSV = NUSV || {};
NUSV.ItemMenuCategories = NUSV.ItemMenuCategories || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ItemMenuCategories';
    var params = PluginManager.parameters(pluginName);

    var categoryOrder = String(
        params['Category Order'] ||
        'Item,Weapon,Armor,KeyItem,Consumable,Material,Forge,Valuable'
    ).split(',').map(function(s) {
        return s.trim();
    }).filter(Boolean);

    var showEmpty = String(params['Show Empty Categories'] || 'false') === 'true';
    var allName = String(params['All Category Name'] || 'All');
    var showAll = String(params['Show All Category'] || 'false') === 'true';

    function norm(name) {
        return String(name || '').trim();
    }

    function key(name) {
        return norm(name).toLowerCase().replace(/\s+/g, '');
    }

    function menuCategories(obj) {
        if (!obj || !obj.note) return [];
        var result = [];
        var re = /<Menu Category:\s*([^>]+)>/ig;
        var match;

        while ((match = re.exec(obj.note))) {
            String(match[1]).split(',').forEach(function(cat) {
                cat = norm(cat);
                if (cat && result.indexOf(cat) < 0) result.push(cat);
            });
        }
        return result;
    }

    function builtIn(name) {
        return ['item','weapon','armor','keyitem','all'].indexOf(key(name)) >= 0;
    }

    function builtInMatch(item, name) {
        if (!item) return false;
        var k = key(name);

        if (k === 'all') {
            return DataManager.isItem(item) ||
                   DataManager.isWeapon(item) ||
                   DataManager.isArmor(item);
        }

        if (k === 'weapon') return DataManager.isWeapon(item);
        if (k === 'armor') return DataManager.isArmor(item);
        if (k === 'keyitem') return DataManager.isItem(item) && item.itypeId === 2;
        if (k === 'item') return DataManager.isItem(item) && item.itypeId === 1;

        return false;
    }

    function customMatch(item, name) {
        var target = norm(name).toLowerCase();
        return menuCategories(item).some(function(cat) {
            return cat.toLowerCase() === target;
        });
    }

    function includesCategory(item, name) {
        return builtIn(name) ? builtInMatch(item, name) : customMatch(item, name);
    }

    function hasInventoryItem(name) {
        return $gameParty.allItems().some(function(item) {
            return includesCategory(item, name);
        });
    }

    function visibleOrder() {
        var result = categoryOrder.slice();

        if (showAll && !result.some(function(n) { return key(n) === 'all'; })) {
            result.unshift(allName);
        }

        if (showEmpty) return result;

        return result.filter(function(name) {
            return hasInventoryItem(name);
        });
    }

    var _Window_ItemCategory_makeCommandList =
        Window_ItemCategory.prototype.makeCommandList;

    Window_ItemCategory.prototype.makeCommandList = function() {
        this.clearCommandList();

        var order = visibleOrder();

        if (order.length <= 0) {
            _Window_ItemCategory_makeCommandList.call(this);
            return;
        }

        order.forEach(function(name) {
            var k = key(name);

            if (k === 'item') {
                this.addCommand(TextManager.item, 'item');
            } else if (k === 'weapon') {
                this.addCommand(TextManager.weapon, 'weapon');
            } else if (k === 'armor') {
                this.addCommand(TextManager.armor, 'armor');
            } else if (k === 'keyitem') {
                this.addCommand(TextManager.keyItem, 'keyItem');
            } else if (k === 'all') {
                this.addCommand(allName, 'nusvCategory', true, 'All');
            } else {
                this.addCommand(name, 'nusvCategory', true, name);
            }
        }, this);
    };

    Window_ItemCategory.prototype.currentNusvCategory = function() {
        if (this.currentSymbol() === 'nusvCategory') return this.currentExt();

        switch (this.currentSymbol()) {
            case 'item': return 'Item';
            case 'weapon': return 'Weapon';
            case 'armor': return 'Armor';
            case 'keyItem': return 'KeyItem';
        }
        return null;
    };

    var _Window_ItemList_setCategory = Window_ItemList.prototype.setCategory;

    Window_ItemList.prototype.setNusvCategory = function(category) {
        if (this._nusvCategory !== category) {
            this._nusvCategory = category;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_ItemList.prototype.setCategory = function(category) {
        this._nusvCategory = null;
        _Window_ItemList_setCategory.call(this, category);
    };

    var _Window_ItemList_includes = Window_ItemList.prototype.includes;

    Window_ItemList.prototype.includes = function(item) {
        if (this._nusvCategory) {
            return includesCategory(item, this._nusvCategory);
        }
        return _Window_ItemList_includes.call(this, item);
    };

    var _Scene_Item_onCategoryOk = Scene_Item.prototype.onCategoryOk;

    Scene_Item.prototype.onCategoryOk = function() {
        if (this._categoryWindow.currentSymbol() === 'nusvCategory') {
            this._itemWindow.setNusvCategory(
                this._categoryWindow.currentNusvCategory()
            );
            this._itemWindow.activate();
            this._itemWindow.selectLast();
            return;
        }

        _Scene_Item_onCategoryOk.call(this);
    };

    var _Scene_Item_createCategoryWindow = Scene_Item.prototype.createCategoryWindow;

    Scene_Item.prototype.createCategoryWindow = function() {
        _Scene_Item_createCategoryWindow.call(this);

        var scene = this;
        var oldUpdate = this._categoryWindow.update;

        this._categoryWindow.update = function() {
            oldUpdate.call(this);

            if (!scene._itemWindow) return;

            if (this.currentSymbol() === 'nusvCategory') {
                scene._itemWindow.setNusvCategory(this.currentExt());
            }
        };
    };

    NUSV.ItemMenuCategories.menuCategories = menuCategories;
    NUSV.ItemMenuCategories.includesCategory = includesCategory;
    NUSV.ItemMenuCategories.categoryOrder = function() {
        return categoryOrder.slice();
    };
    NUSV.ItemMenuCategories.version = '1.0.0';

})();
