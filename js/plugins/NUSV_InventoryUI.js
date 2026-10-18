/*:
 * @plugindesc v1.0.0 Replaces the default Item screen with a grid-based Inventory UI.
 * @author Ultoid
 *
 * @help
 * NUSV_InventoryUI
 *
 * A presentation-only replacement for Scene_Item. It uses the party's normal
 * RPG Maker inventory and does not change item, equipment, or save data.
 *
 * Controls:
 * - Move in the item grid with the cursor keys or mouse.
 * - Press Up from the first grid row to select a category.
 * - Confirm a usable consumable to use it as usual.
 */

var Imported = Imported || {};
Imported.NUSV_InventoryUI = true;

(function() {
    'use strict';

    var GRID_WIDTH = 648;
    var HEADER_HEIGHT = 72;
    var CATEGORY_HEIGHT = 72;
    var DETAIL_WIDTH = 432;
    var CELL_WIDTH = 96;
    var CELL_HEIGHT = 96;

    function isEquip(item) {
        return DataManager.isWeapon(item) || DataManager.isArmor(item);
    }

    function categoryIncludes(item, category) {
        if (!item) return false;
        if (category === 'all') return true;
        if (category === 'item') return DataManager.isItem(item) && item.itypeId === 1;
        if (category === 'weapon') return DataManager.isWeapon(item);
        if (category === 'armor') return DataManager.isArmor(item);
        return DataManager.isItem(item) && item.itypeId === 2;
    }

    function equippedBy(item) {
        if (!isEquip(item)) return [];
        return $gameParty.allMembers().filter(function(actor) {
            return actor.equips().some(function(equip) {
                // Identity is precise for normal and independent items. The
                // fallback also supports older saves that store database refs.
                return equip === item || (equip && equip.id === item.id &&
                    DataManager.isWeapon(equip) === DataManager.isWeapon(item) &&
                    DataManager.isArmor(equip) === DataManager.isArmor(item));
            });
        });
    }

    function drawLargeIcon(window, iconIndex, x, y, size) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        window.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    }

    // Window_Base.drawFace crops the centre when a smaller width/height is
    // requested. Inventory badges need the full portrait, just scaled down.
    function drawPortrait(window, actor, x, y, size) {
        var bitmap = ImageManager.loadFace(actor.faceName());
        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
        var index = actor.faceIndex();
        var sx = index % 4 * pw;
        var sy = Math.floor(index / 4) * ph;
        window.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    }

    function Window_NUSVInventoryCategory() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVInventoryCategory.prototype = Object.create(Window_HorzCommand.prototype);
    Window_NUSVInventoryCategory.prototype.constructor = Window_NUSVInventoryCategory;

    Window_NUSVInventoryCategory.prototype.windowWidth = function() {
        return GRID_WIDTH;
    };

    Window_NUSVInventoryCategory.prototype.maxCols = function() {
        return 5;
    };

    Window_NUSVInventoryCategory.prototype.numVisibleRows = function() {
        return 1;
    };

    Window_NUSVInventoryCategory.prototype.makeCommandList = function() {
        this.addCommand('All', 'all');
        this.addCommand('Item', 'item');
        this.addCommand('Weapon', 'weapon');
        this.addCommand('Armor', 'armor');
        this.addCommand('Key Items', 'keyItem');
    };

    function Window_NUSVInventoryGrid() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVInventoryGrid.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVInventoryGrid.prototype.constructor = Window_NUSVInventoryGrid;

    Window_NUSVInventoryGrid.prototype.initialize = function(x, y, width, height) {
        this._category = 'all';
        this._data = [];
        // Window_Selectable.initialize calls deactivate/select internally,
        // which in turn asks maxItems(). Initialise the backing list first.
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_NUSVInventoryGrid.prototype.maxCols = function() {
        return 6;
    };

    Window_NUSVInventoryGrid.prototype.itemWidth = function() {
        return CELL_WIDTH;
    };

    Window_NUSVInventoryGrid.prototype.itemHeight = function() {
        return CELL_HEIGHT;
    };

    Window_NUSVInventoryGrid.prototype.spacing = function() {
        // Six 96px cards must fit inside the 612px content area. The default
        // MV spacing of 12px pushes the sixth card beyond the right edge.
        return 4;
    };

    Window_NUSVInventoryGrid.prototype.maxItems = function() {
        return this._data.length;
    };

    Window_NUSVInventoryGrid.prototype.item = function() {
        return this._data[this.index()];
    };

    Window_NUSVInventoryGrid.prototype.setCategory = function(category) {
        if (this._category !== category) {
            this._category = category;
            this.refresh();
            this.select(this.maxItems() > 0 ? 0 : -1);
        }
    };

    Window_NUSVInventoryGrid.prototype.makeItemList = function() {
        // YEP_ItemCore can show equipment currently worn by actors even when
        // it is not present in Game_Party.allItems() (for example, starting
        // equipment). Mirror that behaviour so the Inventory grid never
        // hides equipped weapons or armour.
        var inventory = $gameParty.allItems().slice();
        $gameParty.allMembers().forEach(function(actor) {
            actor.equips().forEach(function(equip) {
                if (equip && inventory.indexOf(equip) < 0) {
                    inventory.push(equip);
                }
            });
        });

        this._data = inventory.filter(function(item) {
            return categoryIncludes(item, this._category);
        }, this);
    };

    Window_NUSVInventoryGrid.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    Window_NUSVInventoryGrid.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (!item) return;
        var rect = this.itemRect(index);
        var x = rect.x + 4;
        var y = rect.y + 4;
        var w = rect.width - 8;
        var h = rect.height - 8;
        this.contents.fillRect(x, y, w, h, 'rgba(12, 26, 52, 0.72)');
        this.contents.fillRect(x + 1, y + 1, w - 2, 2, 'rgba(135, 205, 255, 0.65)');
        drawLargeIcon(this, item.iconIndex, x + Math.floor((w - 60) / 2), y + 8, 60);
        this.resetFontSettings();
        this.contents.fontSize = 18;
        this.drawText('×' + $gameParty.numItems(item), x + 4, y + h - 28, w - 8, 'right');

        var actors = equippedBy(item);
        if (actors.length) {
            drawPortrait(this, actors[0], x + w - 34, y + 2, 32);
            if (actors.length > 1) {
                this.contents.fontSize = 14;
                this.drawText('+' + (actors.length - 1), x + w - 31, y + 15, 27, 'right');
            }
        }
    };

    Window_NUSVInventoryGrid.prototype.cursorUp = function(wrap) {
        if (this.index() >= 0 && this.index() < this.maxCols() && this.isHandled('category')) {
            this.callHandler('category');
            return;
        }
        Window_Selectable.prototype.cursorUp.call(this, wrap);
    };

    function Window_NUSVInventoryDetail() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVInventoryDetail.prototype = Object.create(Window_Base.prototype);
    Window_NUSVInventoryDetail.prototype.constructor = Window_NUSVInventoryDetail;

    Window_NUSVInventoryDetail.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._item = null;
        this.refresh();
    };

    Window_NUSVInventoryDetail.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_NUSVInventoryDetail.prototype.drawWrapped = function(text, x, y, width) {
        var words = String(text || '').split(/\s+/);
        var line = '';
        var lineY = y;
        for (var i = 0; i < words.length; i++) {
            var next = line ? line + ' ' + words[i] : words[i];
            if (this.textWidth(next) > width && line) {
                this.drawText(line, x, lineY, width);
                line = words[i];
                lineY += this.lineHeight();
            } else {
                line = next;
            }
        }
        if (line) this.drawText(line, x, lineY, width);
        return lineY + this.lineHeight();
    };

    Window_NUSVInventoryDetail.prototype.refresh = function() {
        this.contents.clear();
        var item = this._item;
        if (!item) {
            this.changeTextColor(this.systemColor());
            this.drawText('Select an item', 0, 0, this.contents.width, 'center');
            this.resetTextColor();
            return;
        }

        var width = this.contents.width;
        var x = this.textPadding();
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 28;
        this.drawText(item.name, x, 0, width - x * 2);
        this.resetFontSettings();

        drawLargeIcon(this, item.iconIndex, x, this.lineHeight() + 8, 88);
        this.changeTextColor(this.systemColor());
        this.drawText('Quantity', 108, this.lineHeight() + 16, 130);
        this.resetTextColor();
        this.drawText(String($gameParty.numItems(item)), 108, this.lineHeight() + 50, 130);

        var y = this.lineHeight() * 4 + 12;
        this.changeTextColor(this.systemColor());
        this.drawText('Description', x, y, width - x * 2);
        this.resetTextColor();
        y = this.drawWrapped(item.description, x, y + this.lineHeight(), width - x * 2) + 12;

        this.changeTextColor(this.systemColor());
        this.drawText('Stat Bonus', x, y, width - x * 2);
        this.resetTextColor();
        y += this.lineHeight();
        var hasStats = false;
        if (isEquip(item) && item.params) {
            for (var i = 0; i < item.params.length; i++) {
                var value = item.params[i];
                if (!value) continue;
                hasStats = true;
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.param(i), x, y, 190);
                this.changeTextColor(this.paramchangeTextColor(value));
                this.drawText((value > 0 ? '+' : '') + value, x + 190, y, 100, 'right');
                this.resetTextColor();
                y += this.lineHeight();
            }
        }
        if (!hasStats) {
            this.changeTextColor(this.textColor(7));
            this.drawText('No stat bonus', x, y, width - x * 2);
            this.resetTextColor();
        }

        var actors = equippedBy(item);
        var footerY = this.contents.height - this.lineHeight() - 4;
        this.contents.fillRect(0, footerY - 4, width, this.lineHeight() + 8, 'rgba(18, 38, 74, 0.9)');
        this.changeTextColor(this.systemColor());
        this.drawText('Equipped', x, footerY, 100);
        this.resetTextColor();
        if (actors.length) {
            drawPortrait(this, actors[0], x + 104, footerY - 2, 32);
            this.drawText(actors.map(function(actor) { return actor.name(); }).join(', '), x + 144, footerY, width - x - 144);
        } else {
            this.drawText('Not equipped', x + 104, footerY, width - x - 104);
        }
    };

    function Scene_NUSVInventory() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVInventory.prototype = Object.create(Scene_ItemBase.prototype);
    Scene_NUSVInventory.prototype.constructor = Scene_NUSVInventory;

    Scene_NUSVInventory.prototype.create = function() {
        Scene_ItemBase.prototype.create.call(this);
        this.createInventoryHeader();
        this.createCategoryWindow();
        this.createGridWindow();
        this.createDetailWindow();
        this.createActorWindow();
    };

    Scene_NUSVInventory.prototype.start = function() {
        Scene_ItemBase.prototype.start.call(this);
        this._gridWindow.activate();
        this._gridWindow.select(this._gridWindow.maxItems() > 0 ? 0 : -1);
        this.refreshDetail();
    };

    Scene_NUSVInventory.prototype.createInventoryHeader = function() {
        this._headerWindow = new Window_Base(0, 0, Graphics.boxWidth, HEADER_HEIGHT);
        this._headerWindow.changeTextColor(this._headerWindow.systemColor());
        this._headerWindow.contents.fontSize = 28;
        this._headerWindow.drawText('Inventory', this._headerWindow.textPadding(), 0, this._headerWindow.contents.width);
        this.addWindow(this._headerWindow);
    };

    Scene_NUSVInventory.prototype.createCategoryWindow = function() {
        this._categoryWindow = new Window_NUSVInventoryCategory(0, HEADER_HEIGHT);
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._categoryWindow);
    };

    Scene_NUSVInventory.prototype.createGridWindow = function() {
        var y = HEADER_HEIGHT + CATEGORY_HEIGHT;
        this._gridWindow = new Window_NUSVInventoryGrid(0, y, GRID_WIDTH, Graphics.boxHeight - y);
        this._itemWindow = this._gridWindow;
        this._gridWindow.setHandler('ok', this.onGridOk.bind(this));
        this._gridWindow.setHandler('cancel', this.popScene.bind(this));
        this._gridWindow.setHandler('category', this.activateCategory.bind(this));
        this.addWindow(this._gridWindow);
    };

    Scene_NUSVInventory.prototype.createDetailWindow = function() {
        this._detailWindow = new Window_NUSVInventoryDetail(GRID_WIDTH, HEADER_HEIGHT,
            DETAIL_WIDTH, Graphics.boxHeight - HEADER_HEIGHT);
        this.addWindow(this._detailWindow);
    };

    Scene_NUSVInventory.prototype.update = function() {
        Scene_ItemBase.prototype.update.call(this);
        if (this._gridWindow && this._lastGridIndex !== this._gridWindow.index()) {
            this._lastGridIndex = this._gridWindow.index();
            this.refreshDetail();
        }
        if (this._categoryWindow && this._lastCategory !== this._categoryWindow.currentSymbol()) {
            this._lastCategory = this._categoryWindow.currentSymbol();
            this._gridWindow.setCategory(this._lastCategory);
            this.refreshDetail();
        }
    };

    Scene_NUSVInventory.prototype.refreshDetail = function() {
        if (this._detailWindow) this._detailWindow.setItem(this._gridWindow.item());
    };

    Scene_NUSVInventory.prototype.activateCategory = function() {
        this._gridWindow.deactivate();
        this._categoryWindow.activate();
    };

    Scene_NUSVInventory.prototype.onCategoryOk = function() {
        this._gridWindow.setCategory(this._categoryWindow.currentSymbol());
        this._categoryWindow.deactivate();
        this._gridWindow.activate();
        this._gridWindow.select(this._gridWindow.maxItems() > 0 ? 0 : -1);
        this.refreshDetail();
    };

    Scene_NUSVInventory.prototype.user = function() {
        var members = $gameParty.movableMembers();
        return members[0] || $gameParty.members()[0];
    };

    Scene_NUSVInventory.prototype.onGridOk = function() {
        var item = this.item();
        if (DataManager.isItem(item) && this.user() && this.user().canUse(item)) {
            $gameParty.setLastItem(item);
            this.determineItem();
        } else {
            SoundManager.playBuzzer();
            this._gridWindow.activate();
        }
    };

    Scene_NUSVInventory.prototype.playSeForItem = function() {
        SoundManager.playUseItem();
    };

    Scene_NUSVInventory.prototype.useItem = function() {
        Scene_ItemBase.prototype.useItem.call(this);
        this._gridWindow.refresh();
        this.refreshDetail();
    };

    Scene_NUSVInventory.prototype.activateItemWindow = function() {
        this._gridWindow.refresh();
        this._gridWindow.activate();
        this.refreshDetail();
    };

    window.Scene_NUSVInventory = Scene_NUSVInventory;

    // Menu command is configured by YEP_MainMenuManager. Overriding this
    // method keeps the original command symbol and keyboard flow intact.
    var _Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        _Window_MenuCommand_makeCommandList.call(this);
        this._list.forEach(function(command) {
            if (command.symbol === 'item') command.name = 'Inventory';
        });
    };

    Scene_Menu.prototype.commandItem = function() {
        SceneManager.push(Scene_NUSVInventory);
    };
})();
