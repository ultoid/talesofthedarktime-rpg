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
 * - Confirm a grid cell to open its action menu:
 *     - Items: Use, Trash, Cancel.
 *     - Weapons / Armors: Equip (when unequipped), otherwise Unequip, Move,
 *       Trash, Cancel.
 *     - Key Items: no menu.
 * - Unequip / Move choose which wearer to take the gear from when more than
 *   one actor has it equipped.
 * - Move then asks which actor should receive the equipment.
 * - Trash asks for confirmation before removing a single copy.
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

    function isKeyItem(item) {
        return DataManager.isItem(item) && item.itypeId === 2;
    }

    // Identity is precise for normal and independent items. The fallback also
    // supports older saves that store database references by id only.
    function sameEquip(a, b) {
        if (!a || !b) return false;
        if (a === b) return true;
        return a.id === b.id &&
            DataManager.isWeapon(a) === DataManager.isWeapon(b) &&
            DataManager.isArmor(a) === DataManager.isArmor(b);
    }

    function equippedBy(item) {
        if (!isEquip(item)) return [];
        return $gameParty.allMembers().filter(function(actor) {
            return actor.equips().some(function(equip) {
                return sameEquip(equip, item);
            });
        });
    }

    function equippedSlot(actor, item) {
        var equips = actor.equips();
        for (var i = 0; i < equips.length; i++) {
            if (sameEquip(equips[i], item)) return i;
        }
        return -1;
    }

    function unequipActorItem(actor, item) {
        var slotId = equippedSlot(actor, item);
        if (slotId >= 0) actor.changeEquip(slotId, null);
    }

    function unequipEverywhere(item) {
        $gameParty.allMembers().forEach(function(actor) {
            unequipActorItem(actor, item);
        });
    }

    // Pick a slot the item can legally occupy. Prefer an empty matching slot,
    // otherwise replace the first matching one.
    function equipSlotFor(actor, item) {
        var slots = actor.equipSlots();
        var equips = actor.equips();
        var isWeapon = DataManager.isWeapon(item);
        var fallback = -1;
        for (var i = 0; i < slots.length; i++) {
            var typeId = slots[i];
            var matches = isWeapon ? (typeId === 1 || typeId === 0) : (typeId === item.etypeId);
            if (!matches) continue;
            if (!equips[i]) return i;
            if (fallback < 0) fallback = i;
        }
        return fallback;
    }

    var RARITY_CONFIG = {
        'common': {
            name: 'Common',
            color: '#cfd8dc',
            border: 'rgba(176, 190, 197, 0.8)',
            accent: 'rgba(207, 216, 220, 0.95)',
            glow: 'rgba(176, 190, 197, 0.2)',
            bg: 'rgba(18, 28, 44, 0.85)'
        },
        'uncommon': {
            name: 'Uncommon',
            color: '#4ade80',
            border: 'rgba(74, 222, 128, 0.85)',
            accent: 'rgba(134, 239, 172, 0.95)',
            glow: 'rgba(74, 222, 128, 0.25)',
            bg: 'rgba(12, 36, 24, 0.85)'
        },
        'rare': {
            name: 'Rare',
            color: '#60a5fa',
            border: 'rgba(59, 130, 246, 0.85)',
            accent: 'rgba(147, 197, 253, 0.95)',
            glow: 'rgba(59, 130, 246, 0.25)',
            bg: 'rgba(12, 30, 58, 0.85)'
        },
        'epic': {
            name: 'Epic',
            color: '#c084fc',
            border: 'rgba(168, 85, 247, 0.9)',
            accent: 'rgba(216, 180, 254, 0.95)',
            glow: 'rgba(168, 85, 247, 0.25)',
            bg: 'rgba(36, 16, 54, 0.85)'
        },
        'legendary': {
            name: 'Legendary',
            color: '#fbbf24',
            border: 'rgba(245, 158, 11, 0.95)',
            accent: 'rgba(252, 211, 77, 0.95)',
            glow: 'rgba(245, 158, 11, 0.3)',
            bg: 'rgba(50, 36, 10, 0.85)'
        },
        'mythic': {
            name: 'Mythic',
            color: '#f87171',
            border: 'rgba(239, 68, 68, 0.95)',
            accent: 'rgba(252, 165, 165, 0.95)',
            glow: 'rgba(239, 68, 68, 0.35)',
            bg: 'rgba(52, 14, 18, 0.85)'
        }
    };

    function getBaseItem(item) {
        if (!item) return null;
        if (typeof DataManager.getBaseItem === 'function') {
            var base = DataManager.getBaseItem(item);
            if (base) return base;
        }
        if (item.baseItemId) {
            if (DataManager.isWeapon(item) && $dataWeapons && $dataWeapons[item.baseItemId]) {
                return $dataWeapons[item.baseItemId];
            }
            if (DataManager.isArmor(item) && $dataArmors && $dataArmors[item.baseItemId]) {
                return $dataArmors[item.baseItemId];
            }
            if (DataManager.isItem(item) && $dataItems && $dataItems[item.baseItemId]) {
                return $dataItems[item.baseItemId];
            }
        }
        return item;
    }

    function itemRarityData(item) {
        if (!item) return RARITY_CONFIG['common'];
        var base = getBaseItem(item);
        var rarity = '';

        if (item.rarity) {
            rarity = String(item.rarity).trim();
        } else if (base && base.rarity) {
            rarity = String(base.rarity).trim();
        }

        if (!rarity) {
            var note = (item.note || '') + '\n' + (base && base !== item && base.note ? base.note : '');
            if (note) {
                var m = note.match(/<NUSV Rarity:\s*([^>]+)>/i);
                if (!m) m = note.match(/<(?:Item )?Rarity:\s*([^>]+)>/i);
                if (!m) m = note.match(/<Rarity\s+Tier:\s*([^>]+)>/i);
                if (m) rarity = m[1].trim();
            }
        }

        if (!rarity) rarity = 'Common';
        var key = rarity.toLowerCase();
        return RARITY_CONFIG[key] || RARITY_CONFIG['common'];
    }

    function drawLargeIcon(window, iconIndex, x, y, size) {
        if (!window || !window.contents || !iconIndex) return;
        var bitmap = ImageManager.loadSystem('IconSet');
        if (!bitmap.isReady()) {
            bitmap.addLoadListener(function() {
                if (window && window.contents && typeof window.refresh === 'function') {
                    window.refresh();
                }
            });
            return;
        }
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = (iconIndex % 16) * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        var ctx = window.contents._context;
        var prevSmooth = ctx.imageSmoothingEnabled;

        // Force nearest-neighbor scaling to prevent blur on pixel art icons
        ctx.imageSmoothingEnabled = false;
        if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = false;
        if ('webkitImageSmoothingEnabled' in ctx) ctx.webkitImageSmoothingEnabled = false;
        if ('msImageSmoothingEnabled' in ctx) ctx.msImageSmoothingEnabled = false;

        window.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);

        ctx.imageSmoothingEnabled = prevSmooth;
        if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = prevSmooth;
        if ('webkitImageSmoothingEnabled' in ctx) ctx.webkitImageSmoothingEnabled = prevSmooth;
        if ('msImageSmoothingEnabled' in ctx) ctx.msImageSmoothingEnabled = prevSmooth;
    }

    // Draws a circular portrait with a circular border for equipped status and list windows.
    function drawCirclePortrait(window, actor, x, y, size, borderColor) {
        if (!actor || !window || !window.contents) return;
        var faceName = actor.faceName();
        if (!faceName) return;
        var bitmap = ImageManager.loadFace(faceName);
        if (!bitmap.isReady()) {
            bitmap.addLoadListener(function() {
                if (window && window.contents && typeof window.refresh === 'function') {
                    window.refresh();
                }
            });
            return;
        }
        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
        var index = actor.faceIndex();
        var sx = (index % 4) * pw;
        var sy = Math.floor(index / 4) * ph;

        var ctx = window.contents._context;
        var radius = size / 2;
        var cx = x + radius;
        var cy = y + radius;

        // 1. Dark circular backing
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(18, 16, 15, 0.95)';
        ctx.fill();

        // 2. Circular clip for portrait graphic
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.clip();

        // 3. Draw face inside circle
        window.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
        ctx.restore();

        // 4. Circular border ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2, false);
        ctx.strokeStyle = borderColor || 'rgba(196, 174, 136, 0.95)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        window.contents._setDirty();
    }

    function drawPortrait(window, actor, x, y, size) {
        drawCirclePortrait(window, actor, x, y, size);
    }

    // Helper to generate a rounded rectangle path for HTML5 2D canvas
    function drawRoundedRectPath(ctx, x, y, width, height, radius) {
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
            return;
        }
        radius = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    // Draws a card with border-radius, background, clipped top accent line, and border
    function drawRoundedCard(ctx, x, y, w, h, radius, bg, border, accent) {
        ctx.save();
        // 1. Background fill
        drawRoundedRectPath(ctx, x, y, w, h, radius);
        ctx.fillStyle = bg;
        ctx.fill();

        // 2. Top accent highlight (clipped to the rounded top corners)
        if (accent) {
            ctx.save();
            drawRoundedRectPath(ctx, x, y, w, h, radius);
            ctx.clip();
            ctx.fillStyle = accent;
            ctx.fillRect(x, y, w, 3);
            ctx.restore();
        }

        // 3. Border stroke
        if (border) {
            ctx.save();
            drawRoundedRectPath(ctx, x + 1, y + 1, w - 2, h - 2, Math.max(0, radius - 1));
            ctx.strokeStyle = border;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
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

    Window_NUSVInventoryCategory.prototype.processHandling = function() {
        if (this.isOpenAndActive()) {
            if (Input.isTriggered('pageup')) {
                var max = this.maxItems();
                if (max > 0) {
                    this.select((this.index() - 1 + max) % max);
                    SoundManager.playCursor();
                }
                return;
            } else if (Input.isTriggered('pagedown')) {
                var max = this.maxItems();
                if (max > 0) {
                    this.select((this.index() + 1) % max);
                    SoundManager.playCursor();
                }
                return;
            }
        }
        Window_HorzCommand.prototype.processHandling.call(this);
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

    Window_NUSVInventoryGrid.prototype.isCurrentItemEnabled = function() {
        var item = this.item();
        return !!item && !isKeyItem(item);
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
        var rarity = itemRarityData(item);

        // Card with border-radius (8px), rarity border, and curved top accent
        var ctx = this.contents._context;
        drawRoundedCard(ctx, x, y, w, h, 8, rarity.bg, rarity.border, rarity.accent);

        var base = getBaseItem(item);
        var iconIndex = (item.iconIndex > 0) ? item.iconIndex : (base && base.iconIndex > 0 ? base.iconIndex : 0);

        // Nearest-neighbor scaled pixel-perfect icon centered horizontally & vertically in card
        var iconSize = 60;
        var iconX = x + Math.floor((w - iconSize) / 2);
        var iconY = y + Math.floor((h - iconSize) / 2);
        drawLargeIcon(this, iconIndex, iconX, iconY, iconSize);

        // Item quantity
        this.resetFontSettings();
        this.contents.fontSize = 18;
        this.drawText('×' + $gameParty.numItems(item), x + 4, y + h - 28, w - 8, 'right');

        // Equipped status badge (circular portrait with border)
        var actors = equippedBy(item);
        if (actors.length) {
            drawCirclePortrait(this, actors[0], x + w - 34, y + 4, 30, 'rgba(255, 255, 255, 0.9)');
            if (actors.length > 1) {
                var badgeX = x + w - 18;
                var badgeY = y + 20;
                this.contents.fillRect(badgeX - 1, badgeY - 1, 18, 14, 'rgba(0, 0, 0, 0.8)');
                var bCtx = this.contents._context;
                bCtx.save();
                bCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                bCtx.lineWidth = 1;
                bCtx.strokeRect(badgeX - 0.5, badgeY - 0.5, 17, 13);
                bCtx.restore();
                this.contents.fontSize = 12;
                this.changeTextColor('#ffffff');
                this.drawText('+' + (actors.length - 1), badgeX, badgeY - 3, 16, 'center');
                this.resetTextColor();
                this.resetFontSettings();
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

    Window_NUSVInventoryGrid.prototype.processHandling = function() {
        if (this.isOpenAndActive()) {
            if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
                return this.processPageup();
            } else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
                return this.processPagedown();
            }
        }
        Window_Selectable.prototype.processHandling.call(this);
    };

    Window_NUSVInventoryGrid.prototype.processPageup = function() {
        this.updateInputData();
        this.callHandler('pageup');
    };

    Window_NUSVInventoryGrid.prototype.processPagedown = function() {
        this.updateInputData();
        this.callHandler('pagedown');
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

        var rarity = itemRarityData(item);
        var width = this.contents.width;
        var x = this.textPadding();

        // Item Name in its Rarity Color
        this.changeTextColor(rarity.color);
        this.contents.fontSize = 28;
        this.drawText(item.name, x, 0, width - x * 2);
        this.resetFontSettings();
        this.resetTextColor();

        var base = getBaseItem(item);
        var iconIndex = (item.iconIndex > 0) ? item.iconIndex : (base && base.iconIndex > 0 ? base.iconIndex : 0);

        // Large icon box with border-radius (8px), rarity border, and curved top accent
        var iconBoxSize = 88;
        var iconY = this.lineHeight() + 8;
        var ctx = this.contents._context;
        drawRoundedCard(ctx, x, iconY, iconBoxSize, iconBoxSize, 8, rarity.bg, rarity.border, rarity.accent);
        drawLargeIcon(this, iconIndex, x + 4, iconY + 4, iconBoxSize - 8);

        // Quantity & Rarity Label
        var infoX = x + iconBoxSize + 16;
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 17;
        this.drawText('Quantity', infoX, iconY + 2, width - infoX);
        this.resetTextColor();
        this.contents.fontSize = 22;
        this.drawText(String($gameParty.numItems(item)), infoX, iconY + 24, width - infoX);

        this.contents.fontSize = 17;
        var labelText = 'Rarity: ';
        var labelWidth = this.textWidth(labelText);
        this.changeTextColor(this.systemColor());
        this.drawText(labelText, infoX, iconY + 54, width - infoX);
        this.changeTextColor(rarity.color);
        this.drawText(rarity.name, infoX + labelWidth, iconY + 54, width - infoX - labelWidth);
        this.resetTextColor();
        this.resetFontSettings();

        var desc = item.description || (base && base.description) || '';
        if (!desc) {
            var fullNote = (item.note || '') + '\n' + (base && base !== item && base.note ? base.note : '');
            var sigMatch = fullNote.match(/\[SIGNATURE EFFECT\]\s*([^\n\r]+)/i);
            if (sigMatch) desc = sigMatch[1].trim();
        }

        var y = this.lineHeight() * 4 + 12;
        this.changeTextColor(this.systemColor());
        this.drawText('Description', x, y, width - x * 2);
        this.resetTextColor();
        y = this.drawWrapped(desc, x, y + this.lineHeight(), width - x * 2) + 12;

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

        // Footer: Equipped Status with circular portrait and border
        var actors = equippedBy(item);
        var footerH = this.lineHeight() + 8;
        var footerY = this.contents.height - footerH - 4;
        this.contents.fillRect(0, footerY - 4, width, footerH, 'rgba(18, 16, 15, 0.95)');
        this.contents.fillRect(0, footerY - 4, width, 1, 'rgba(162, 139, 104, 0.4)');
        this.changeTextColor(this.systemColor());
        this.drawText('Equipped', x, footerY, 100);
        this.resetTextColor();
        if (actors.length) {
            var portraitSize = 34;
            var portraitY = footerY - 4 + Math.floor((footerH - portraitSize) / 2);
            var portraitX = x + 104;
            drawCirclePortrait(this, actors[0], portraitX, portraitY, portraitSize, 'rgba(196, 174, 136, 0.95)');
            if (actors.length > 1) {
                var badgeX = portraitX + portraitSize - 12;
                var badgeY = portraitY + portraitSize - 12;
                this.contents.fillRect(badgeX - 1, badgeY - 1, 16, 13, 'rgba(0, 0, 0, 0.8)');
                var bCtx = this.contents._context;
                bCtx.save();
                bCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                bCtx.lineWidth = 1;
                bCtx.strokeRect(badgeX - 0.5, badgeY - 0.5, 15, 12);
                bCtx.restore();
                this.contents.fontSize = 11;
                this.changeTextColor('#ffffff');
                this.drawText('+' + (actors.length - 1), badgeX, badgeY - 3, 14, 'center');
                this.resetTextColor();
                this.resetFontSettings();
            }
            var nameX = portraitX + portraitSize + 12;
            this.contents.fontSize = 20;
            this.drawText(actors.map(function(actor) { return actor.name(); }).join(', '), nameX, footerY, width - nameX - x);
            this.resetFontSettings();
        } else {
            this.changeTextColor(this.textColor(7));
            this.drawText('Not equipped', x + 104, footerY, width - x - 104);
            this.resetTextColor();
        }
    };

    // Compact command popup opened when a grid cell is confirmed. Its command
    // list depends on the confirmed item.
    function Window_NUSVInventoryAction() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVInventoryAction.prototype = Object.create(Window_Command.prototype);
    Window_NUSVInventoryAction.prototype.constructor = Window_NUSVInventoryAction;

    Window_NUSVInventoryAction.prototype.initialize = function() {
        this._item = null;
        this._gridWindow = null;
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.hide();
        this.deactivate();
    };

    Window_NUSVInventoryAction.prototype.windowWidth = function() {
        return 220;
    };

    Window_NUSVInventoryAction.prototype.numVisibleRows = function() {
        // Unequip, Move, Trash, Cancel is the longest list, so keep a fixed
        // height and avoid resizing the popup between items.
        return 4;
    };

    Window_NUSVInventoryAction.prototype.setItem = function(item, gridWindow) {
        this._item = item;
        this._gridWindow = gridWindow || this._gridWindow;
        this.refresh();
        this.reposition();
        this.show();
        this.select(0);
    };

    // Anchor the popup just to the right of the confirmed grid cell so it
    // overlays the surrounding UI. Flip to the left side and clamp on both
    // axes when there is not enough room.
    Window_NUSVInventoryAction.prototype.reposition = function() {
        var grid = this._gridWindow;
        if (!grid || grid.index() < 0) {
            this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
            this.y = Math.floor((Graphics.boxHeight - this.height) / 2);
            return;
        }
        var rect = grid.itemRect(grid.index());
        var cellLeft = grid.x + grid.padding + rect.x;
        var cellTop = grid.y + grid.padding + rect.y;
        var cellRight = cellLeft + rect.width;
        var cellBottom = cellTop + rect.height;
        var gap = 12;
        var x = cellRight + gap;
        if (x + this.width > Graphics.boxWidth) {
            x = cellLeft - this.width - gap;
        }
        x = x.clamp(0, Graphics.boxWidth - this.width);
        var y = cellTop;
        if (y + this.height > Graphics.boxHeight) {
            y = cellBottom - this.height;
        }
        y = y.clamp(0, Graphics.boxHeight - this.height);
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    };

    Window_NUSVInventoryAction.prototype.makeCommandList = function() {
        var item = this._item;
        if (!item) return;
        if (isEquip(item)) {
            if (equippedBy(item).length) {
                this.addCommand('Unequip', 'unequip');
                this.addCommand('Move', 'move');
            } else {
                this.addCommand('Equip', 'equip');
            }
            this.addCommand('Trash', 'trash');
        } else if (DataManager.isItem(item)) {
            this.addCommand('Use', 'use');
            this.addCommand('Trash', 'trash');
        }
        this.addCommand('Cancel', 'cancel');
    };

    // Generic follow-up popup. It renders a titled list whose entries can carry
    // an actor (for equip / unequip / move) or a plain confirm value.
    function Window_NUSVInventoryList() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVInventoryList.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVInventoryList.prototype.constructor = Window_NUSVInventoryList;

    Window_NUSVInventoryList.prototype.initialize = function() {
        this._title = '';
        this._entries = [];
        this._gridWindow = null;
        Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), 160);
        this.hide();
        this.deactivate();
    };

    Window_NUSVInventoryList.prototype.windowWidth = function() {
        return 320;
    };

    Window_NUSVInventoryList.prototype.headerHeight = function() {
        return 40;
    };

    Window_NUSVInventoryList.prototype.maxCols = function() {
        return 1;
    };

    Window_NUSVInventoryList.prototype.itemHeight = function() {
        return 48;
    };

    Window_NUSVInventoryList.prototype.numVisibleRows = function() {
        return Math.max(1, this._entries.length);
    };

    Window_NUSVInventoryList.prototype.maxItems = function() {
        return this._entries.length;
    };

    Window_NUSVInventoryList.prototype.entry = function() {
        return this._entries[this.index()];
    };

    Window_NUSVInventoryList.prototype.setList = function(title, entries, gridWindow) {
        this._title = title || '';
        this._entries = entries || [];
        this._gridWindow = gridWindow || this._gridWindow;
        this.height = this.headerHeight() + this.numVisibleRows() * this.itemHeight() + 44;
        this.createContents();
        this.refresh();
        this.reposition();
        this.show();
        this.select(this._entries.length > 0 ? 0 : -1);
    };

    Window_NUSVInventoryList.prototype.reposition = function() {
        var grid = this._gridWindow;
        if (!grid || grid.index() < 0) {
            this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
            this.y = Math.floor((Graphics.boxHeight - this.height) / 2);
            return;
        }
        var rect = grid.itemRect(grid.index());
        var cellLeft = grid.x + grid.padding + rect.x;
        var cellTop = grid.y + grid.padding + rect.y;
        var cellRight = cellLeft + rect.width;
        var cellBottom = cellTop + rect.height;
        var gap = 12;
        var x = cellRight + gap;
        if (x + this.width > Graphics.boxWidth) {
            x = cellLeft - this.width - gap;
        }
        x = x.clamp(0, Graphics.boxWidth - this.width);
        var y = cellTop;
        if (y + this.height > Graphics.boxHeight) {
            y = cellBottom - this.height;
        }
        y = y.clamp(0, Graphics.boxHeight - this.height);
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    };

    Window_NUSVInventoryList.prototype.itemRect = function(index) {
        var rect = Window_Selectable.prototype.itemRect.call(this, index);
        rect.y += this.headerHeight();
        return rect;
    };

    Window_NUSVInventoryList.prototype.refresh = function() {
        this.contents.clear();
        this.drawTitle();
        this.drawAllItems();
    };

    Window_NUSVInventoryList.prototype.drawTitle = function() {
        var x = this.textPadding();
        var width = this.contents.width;
        this.contents.fillRect(0, 0, width, this.headerHeight() - 6, 'rgba(18, 16, 15, 0.9)');
        this.changeTextColor(this.systemColor());
        this.drawText(this._title, x, 0, width - x * 2);
        this.resetTextColor();
    };

    Window_NUSVInventoryList.prototype.drawItem = function(index) {
        var entry = this._entries[index];
        if (!entry) return;
        var rect = this.itemRect(index);
        if (entry.actor) {
            drawCirclePortrait(this, entry.actor, rect.x + 6, rect.y + 5, 38, 'rgba(196, 174, 136, 0.95)');
            this.contents.fontSize = 20;
            this.drawText(entry.label, rect.x + 52, rect.y, rect.width - 56);
            this.contents.fontSize = 16;
            this.changeTextColor(this.systemColor());
            if (!entry.enabled) this.changePaintOpacity(false);
            this.drawText(entry.actor.currentClass().name, rect.x + 52, rect.y + 22, rect.width - 56);
            this.changePaintOpacity(true);
            this.resetTextColor();
            this.resetFontSettings();
        } else {
            this.contents.fontSize = 22;
            this.changePaintOpacity(entry.enabled !== false);
            this.drawText(entry.label, rect.x, rect.y + 6, rect.width, 'center');
            this.changePaintOpacity(true);
            this.resetFontSettings();
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
        this.createActionWindow();
        this.createListWindow();
    };

    Scene_NUSVInventory.prototype.start = function() {
        Scene_ItemBase.prototype.start.call(this);
        if (Scene_NUSVInventory._itemOnlyMode) {
            this._gridWindow.setCategory('item');
            this._lastCategory = 'item';
        }
        this._gridWindow.activate();
        this._gridWindow.select(this._gridWindow.maxItems() > 0 ? 0 : -1);
        this.refreshDetail();
    };

    Scene_NUSVInventory.prototype.createInventoryHeader = function() {
        this._headerWindow = new Window_Base(0, 0, Graphics.boxWidth, HEADER_HEIGHT);
        this._headerWindow.changeTextColor(this._headerWindow.systemColor());
        this._headerWindow.contents.fontSize = 28;
        var title = Scene_NUSVInventory._itemOnlyMode ? 'Item' : 'Inventory';
        this._headerWindow.drawText(title, this._headerWindow.textPadding(), 0, this._headerWindow.contents.width);
        this._headerWindow.resetFontSettings();
        this._headerWindow.contents.fontSize = 14;
        this._headerWindow.changeTextColor(this._headerWindow.textColor(7));
        var legendText = '[Z / Enter] Pilih   [X / Esc] Kembali   [Q / W] Ganti Kategori';
        this._headerWindow.drawText(legendText, 0, 8, this._headerWindow.contents.width - this._headerWindow.textPadding(), 'right');
        this._headerWindow.resetTextColor();
        this.addWindow(this._headerWindow);
    };

    Scene_NUSVInventory.prototype.createCategoryWindow = function() {
        this._categoryWindow = new Window_NUSVInventoryCategory(0, HEADER_HEIGHT);
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        if (Scene_NUSVInventory._itemOnlyMode) {
            this._categoryWindow.hide();
            this._categoryWindow.deactivate();
        }
        this.addWindow(this._categoryWindow);
    };

    Scene_NUSVInventory.prototype.createGridWindow = function() {
        var isItemOnly = !!Scene_NUSVInventory._itemOnlyMode;
        var y = HEADER_HEIGHT + (isItemOnly ? 0 : CATEGORY_HEIGHT);
        this._gridWindow = new Window_NUSVInventoryGrid(0, y, GRID_WIDTH, Graphics.boxHeight - y);
        this._itemWindow = this._gridWindow;
        this._gridWindow.setHandler('ok', this.onGridOk.bind(this));
        this._gridWindow.setHandler('cancel', this.popScene.bind(this));
        if (!isItemOnly) {
            this._gridWindow.setHandler('category', this.activateCategory.bind(this));
            this._gridWindow.setHandler('pageup', this.onGridPageup.bind(this));
            this._gridWindow.setHandler('pagedown', this.onGridPagedown.bind(this));
        }
        this.addWindow(this._gridWindow);
    };

    Scene_NUSVInventory.prototype.onGridPageup = function() {
        if (Scene_NUSVInventory._itemOnlyMode || !this._categoryWindow) {
            this._gridWindow.activate();
            return;
        }
        var max = this._categoryWindow.maxItems();
        if (max > 0) {
            var nextIndex = (this._categoryWindow.index() - 1 + max) % max;
            this._categoryWindow.select(nextIndex);
            this._gridWindow.setCategory(this._categoryWindow.currentSymbol());
            SoundManager.playCursor();
        }
        this._gridWindow.activate();
    };

    Scene_NUSVInventory.prototype.onGridPagedown = function() {
        if (Scene_NUSVInventory._itemOnlyMode || !this._categoryWindow) {
            this._gridWindow.activate();
            return;
        }
        var max = this._categoryWindow.maxItems();
        if (max > 0) {
            var nextIndex = (this._categoryWindow.index() + 1) % max;
            this._categoryWindow.select(nextIndex);
            this._gridWindow.setCategory(this._categoryWindow.currentSymbol());
            SoundManager.playCursor();
        }
        this._gridWindow.activate();
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
        if (!Scene_NUSVInventory._itemOnlyMode && this._categoryWindow && this._lastCategory !== this._categoryWindow.currentSymbol()) {
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

    Scene_NUSVInventory.prototype.createActionWindow = function() {
        this._actionWindow = new Window_NUSVInventoryAction();
        this._actionWindow.setHandler('ok', this.onActionOk.bind(this));
        this._actionWindow.setHandler('cancel', this.closeActionWindow.bind(this));
        this.addWindow(this._actionWindow);
    };

    Scene_NUSVInventory.prototype.createListWindow = function() {
        this._listWindow = new Window_NUSVInventoryList();
        this._listWindow.setHandler('ok', this.onListOk.bind(this));
        this._listWindow.setHandler('cancel', this.closeListWindow.bind(this));
        this.addWindow(this._listWindow);
    };

    // Confirming a grid cell opens the action menu. Key items intentionally
    // have no menu, so they only give audible feedback.
    Scene_NUSVInventory.prototype.onGridOk = function() {
        var item = this.item();
        if (!item || isKeyItem(item)) {
            SoundManager.playBuzzer();
            this._gridWindow.activate();
            return;
        }
        this._actionItem = item;
        this._gridWindow.deactivate();
        this._actionWindow.setItem(item, this._gridWindow);
        this._actionWindow.activate();
    };

    Scene_NUSVInventory.prototype.hideActionWindow = function() {
        this._actionWindow.hide();
        this._actionWindow.deactivate();
    };

    Scene_NUSVInventory.prototype.closeActionWindow = function() {
        this.hideActionWindow();
        this._gridWindow.activate();
    };

    Scene_NUSVInventory.prototype.onActionOk = function() {
        var symbol = this._actionWindow.currentSymbol();
        switch (symbol) {
            case 'use': this.actionUse(); break;
            case 'equip': this.actionEquip(); break;
            case 'unequip': this.actionUnequip(); break;
            case 'move': this.actionMove(); break;
            case 'trash': this.actionTrash(); break;
            default: this.closeActionWindow(); break;
        }
    };

    Scene_NUSVInventory.prototype.actionUse = function() {
        var item = this._actionItem;
        if (DataManager.isItem(item) && this.user() && this.user().canUse(item)) {
            $gameParty.setLastItem(item);
            this.hideActionWindow();
            this.determineItem();
        } else {
            SoundManager.playBuzzer();
        }
    };

    Scene_NUSVInventory.prototype.actionEquip = function() {
        var item = this._actionItem;
        var actors = $gameParty.members().filter(function(actor) {
            return actor.canEquip(item);
        });
        if (!actors.length) {
            SoundManager.playBuzzer();
            return;
        }
        this.openList('Equip to', this.actorEntries(actors), 'equip');
    };

    Scene_NUSVInventory.prototype.actionUnequip = function() {
        var item = this._actionItem;
        var actors = equippedBy(item);
        if (!actors.length) {
            SoundManager.playBuzzer();
            return;
        }
        if (actors.length === 1) {
            this.performUnequip(actors[0]);
            return;
        }
        this.openList('Unequip from', this.actorEntries(actors), 'unequip');
    };

    Scene_NUSVInventory.prototype.actionMove = function() {
        var item = this._actionItem;
        var sources = equippedBy(item);
        if (!sources.length) {
            SoundManager.playBuzzer();
            return;
        }
        if (sources.length === 1) {
            this.startMoveTarget(sources[0]);
            return;
        }
        this.openList('Move from', this.actorEntries(sources), 'move-source');
    };

    Scene_NUSVInventory.prototype.actionTrash = function() {
        this.openList('Discard ' + this._actionItem.name + '?', [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
        ], 'trash');
    };

    Scene_NUSVInventory.prototype.actorEntries = function(actors) {
        return actors.map(function(actor) {
            return { label: actor.name(), actor: actor, value: actor };
        });
    };

    Scene_NUSVInventory.prototype.openList = function(title, entries, mode) {
        this._listMode = mode;
        this.hideActionWindow();
        this._listWindow.setList(title, entries, this._gridWindow);
        this._listWindow.activate();
    };

    Scene_NUSVInventory.prototype.closeListWindow = function() {
        this._listWindow.hide();
        this._listWindow.deactivate();
        // Return to the action menu so another option can be picked.
        this._actionWindow.show();
        this._actionWindow.activate();
    };

    Scene_NUSVInventory.prototype.onListOk = function() {
        var entry = this._listWindow.entry();
        if (!entry) {
            this.closeListWindow();
            return;
        }
        switch (this._listMode) {
            case 'equip': this.performEquip(entry.value); break;
            case 'unequip': this.performUnequip(entry.value); break;
            case 'move-source': this.startMoveTarget(entry.value); break;
            case 'move-target': this.performMove(entry.value); break;
            case 'trash':
                if (entry.value) {
                    this.performTrash();
                } else {
                    this.closeListWindow();
                }
                break;
            default: this.closeListWindow(); break;
        }
    };

    Scene_NUSVInventory.prototype.performEquip = function(actor) {
        var slotId = equipSlotFor(actor, this._actionItem);
        if (slotId < 0) {
            SoundManager.playBuzzer();
            return;
        }
        actor.changeEquip(slotId, this._actionItem);
        SoundManager.playEquip();
        this.finishAction();
    };

    Scene_NUSVInventory.prototype.performUnequip = function(actor) {
        unequipActorItem(actor, this._actionItem);
        SoundManager.playEquip();
        this.finishAction();
    };

    Scene_NUSVInventory.prototype.startMoveTarget = function(source) {
        var item = this._actionItem;
        var targets = $gameParty.members().filter(function(actor) {
            return actor !== source && actor.canEquip(item);
        });
        if (!targets.length) {
            SoundManager.playBuzzer();
            this.closeListWindow();
            return;
        }
        this._moveSource = source;
        this.openList('Move to', this.actorEntries(targets), 'move-target');
    };

    Scene_NUSVInventory.prototype.performMove = function(target) {
        var item = this._actionItem;
        var source = this._moveSource;
        unequipActorItem(source, item);
        var slotId = equipSlotFor(target, item);
        if (slotId < 0) {
            // Restore the source if the target cannot actually take it.
            unequipActorItem(target, item);
            var backSlot = equipSlotFor(source, item);
            if (backSlot >= 0) source.changeEquip(backSlot, item);
            SoundManager.playBuzzer();
            return;
        }
        target.changeEquip(slotId, item);
        SoundManager.playEquip();
        this._moveSource = null;
        this.finishAction();
    };

    Scene_NUSVInventory.prototype.performTrash = function() {
        // Dropping an equipped item should pull it off every wearer first, then
        // remove a single copy from the party.
        unequipEverywhere(this._actionItem);
        $gameParty.gainItem(this._actionItem, -1);
        SoundManager.playUseItem();
        this.finishAction();
    };

    Scene_NUSVInventory.prototype.finishAction = function() {
        this._listWindow.hide();
        this._listWindow.deactivate();
        this.hideActionWindow();
        this._actionItem = null;
        this._moveSource = null;
        this.refreshInventory();
        this._gridWindow.activate();
    };

    Scene_NUSVInventory.prototype.refreshInventory = function() {
        var grid = this._gridWindow;
        grid.refresh();
        var max = grid.maxItems();
        if (max <= 0) {
            grid.select(-1);
        } else if (grid.index() >= max || grid.index() < 0) {
            grid.select(max - 1);
        }
        this._lastGridIndex = grid.index();
        this.refreshDetail();
    };

    Scene_NUSVInventory.prototype.playSeForItem = function() {
        SoundManager.playUseItem();
    };

    Scene_NUSVInventory.prototype.useItem = function() {
        Scene_ItemBase.prototype.useItem.call(this);
        this.refreshInventory();
    };

    Scene_NUSVInventory.prototype.activateItemWindow = function() {
        this.refreshInventory();
        this._gridWindow.activate();
    };

    Scene_NUSVInventory.prototype.popScene = function() {
        Scene_NUSVInventory._itemOnlyMode = false;
        Scene_ItemBase.prototype.popScene.call(this);
    };

    Scene_NUSVInventory.prototype.terminate = function() {
        Scene_NUSVInventory._itemOnlyMode = false;
        Scene_ItemBase.prototype.terminate.call(this);
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
