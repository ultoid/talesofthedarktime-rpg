/*:
 * @plugindesc v1.0.0 NUSV Status Screen - Genshin-style character status layout.
 * @author Ultoid
 *
 * @param Tab: Equipment
 * @type text
 * @default Equipment
 *
 * @param Tab: Class
 * @type text
 * @default Class
 *
 * @param Tab: Skills
 * @type text
 * @default Skills
 *
 * @param Show Parameters
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Show Nickname
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Use TP As SP
 * @type boolean
 * @on ON (display TP value as SP)
 * @off OFF (use actor.sp if it exists)
 * @default true
 *
 * @param SP Label
 * @type text
 * @default SP
 *
 * @param Portrait Note Tag
 * @type text
 * @default Status Image
 *
 * @param Default Portrait Prefix
 * @type text
 * @default Hero_
 *
 * @help
 * ============================================================================
 * NUSV_StatusScreen
 * ============================================================================
 *
 * Redesigns the actor Status screen into a three column "character page":
 *
 *   [ LEFT ]   Tabs: Equipment / Class / Skills + the selected tab content
 *   [ CENTER ] Full body character portrait, with Name / Class / Level above
 *   [ RIGHT ]  Profile description + Stats (HP / MP / SP / EXP) + Parameters
 *
 * The full body portrait is loaded from img/pictures/ using the actor's
 * portrait name. Resolution order:
 *
 *   1. Actor note tag:  <Status Image: MyPortrait>
 *   2. Default prefix + actor name:  Hero_ + name   (e.g. Hero_Cassian)
 *   3. Fallback: the actor's face image (drawn large)
 *
 * The class description is taken from NUSV_ClassChange when available
 * (actor.nusvClassDescription), otherwise from the class note tag
 * <Class Description>...</Class Description>.
 *
 * The actor profile description is taken from:
 *
 *   1. The actor's profile field (Database > Actors > Profile)
 *   2. Actor note tag:  <Profile>...</Profile>
 *   3. The current class description
 *
 * This plugin redefines Scene_Status and Window_Status. Place it below
 * NUSV_MainMenuBridge (and below NUSV_ClassChange) so the Party menu keeps
 * opening this status screen.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_StatusScreen = true;

var NUSV = NUSV || {};
NUSV.StatusScreen = NUSV.StatusScreen || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_StatusScreen';
    var params = PluginManager.parameters(pluginName);

    function pBool(name, fallback) {
        var value = params[name];
        if (value === undefined || value === '') value = fallback;
        return String(value) === 'true';
    }

    function pText(name, fallback) {
        var value = params[name];
        return value === undefined || value === '' ? fallback : String(value);
    }

    var TAB_EQUIP      = pText('Tab: Equipment', 'Equipment');
    var TAB_CLASS      = pText('Tab: Class', 'Class');
    var TAB_SKILLS     = pText('Tab: Skills', 'Skills');
    var SHOW_PARAMS    = pBool('Show Parameters', true);
    var SHOW_NICKNAME  = pBool('Show Nickname', true);
    var USE_TP_AS_SP   = pBool('Use TP As SP', true);
    var SP_LABEL       = pText('SP Label', 'SP');
    var PORTRAIT_TAG   = pText('Portrait Note Tag', 'Status Image');
    var PORTRAIT_PREF  = pText('Default Portrait Prefix', 'Hero_');

    // -------------------------------------------------------------------------
    // Layout constants (computed at runtime so screen size changes are honored)
    // -------------------------------------------------------------------------

    function leftWidth()  { return Math.floor(Graphics.boxWidth * 0.24); }
    function rightWidth() { return Math.floor(Graphics.boxWidth * 0.32); }
    function centerWidth() {
        return Graphics.boxWidth - leftWidth() - rightWidth();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function multilineTag(note, tag) {
        if (!note) return '';
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>', 'i');
        var m = re.exec(note);
        return m ? String(m[1]).replace(/\r/g, '').trim() : '';
    }

    function portraitName(actor) {
        var note = (actor.actor() && actor.actor().note) || '';
        var tagged = multilineTag(note, PORTRAIT_TAG);
        if (tagged) return tagged;

        var single = new RegExp('<' + PORTRAIT_TAG + ':\\s*([^>]+)>', 'i').exec(note);
        if (single) return single[1].trim();

        return PORTRAIT_PREF + actor.name();
    }

    function classDescription(actor) {
        var cls = actor.currentClass();
        if (typeof actor.nusvClassDescription === 'function') {
            var d = actor.nusvClassDescription(cls.id);
            if (d) return d;
        }
        var meta = cls.meta || {};
        if (meta['Class Description']) return meta['Class Description'];
        if (meta.Description) return meta.Description;
        return '';
    }

    function profileText(actor) {
        // Only the actor's own profile description is used here.
        var profile = actor.profile();
        if (profile) return profile;

        var note = (actor.actor() && actor.actor().note) || '';
        return multilineTag(note, 'Profile');
    }

    function wrapText(text, maxWidth, measure) {
        var lines = [];
        if (!text) return lines;

        text.split('\n').forEach(function(paragraph) {
            var words = paragraph.split(' ');
            var line = '';
            words.forEach(function(word) {
                var test = line ? line + ' ' + word : word;
                if (measure(test) <= maxWidth || !line) {
                    line = test;
                } else {
                    lines.push(line);
                    line = word;
                }
            });
            lines.push(line);
        });
        return lines;
    }

    function drawGaugeBar(win, x, y, width, rate, c1, c2) {
        rate = Math.max(0, Math.min(1, rate || 0));
        win.contents.fillRect(x, y + 12, width, 12, win.gaugeBackColor());
        win.contents.gradientFillRect(x, y + 12, Math.floor(width * rate), 12, c1, c2);
    }

    // -------------------------------------------------------------------------
    // Window_StatusTabs
    // -------------------------------------------------------------------------

    function Window_StatusTabs() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusTabs.prototype = Object.create(Window_Command.prototype);
    Window_StatusTabs.prototype.constructor = Window_StatusTabs;

    Window_StatusTabs.prototype.initialize = function(x, y) {
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_StatusTabs.prototype.windowWidth = function() {
        return leftWidth();
    };

    Window_StatusTabs.prototype.numVisibleRows = function() {
        return this.maxItems();
    };

    Window_StatusTabs.prototype.makeCommandList = function() {
        this.addCommand(TAB_EQUIP, 'equip');
        this.addCommand(TAB_CLASS, 'class');
        this.addCommand(TAB_SKILLS, 'skills');
    };

    Window_StatusTabs.prototype.itemTextAlign = function() {
        return 'left';
    };

    // -------------------------------------------------------------------------
    // Window_StatusDetail (content for the selected tab)
    // -------------------------------------------------------------------------

    function Window_StatusDetail() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusDetail.prototype = Object.create(Window_Selectable.prototype);
    Window_StatusDetail.prototype.constructor = Window_StatusDetail;

    Window_StatusDetail.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._mode = 'equip';
        this.deactivate();
    };

    Window_StatusDetail.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_StatusDetail.prototype.setMode = function(mode) {
        if (this._mode !== mode) {
            this._mode = mode;
            this.refresh();
        }
    };

    Window_StatusDetail.prototype.mode = function() {
        return this._mode;
    };

    Window_StatusDetail.prototype.maxItems = function() {
        var actor = this._actor;
        if (!actor) return 0;
        if (this._mode === 'equip') return actor.equips().length;
        if (this._mode === 'skills') return actor.skills().length;
        return 0;
    };

    Window_StatusDetail.prototype.drawItem = function(index) {
        if (this._mode === 'equip') return this.drawEquipItem(index);
        if (this._mode === 'skills') return this.drawSkillItem(index);
    };

    Window_StatusDetail.prototype.drawEquipItem = function(index) {
        var actor = this._actor;
        var rect = this.itemRectForText(index);
        var slot = actor.equipSlots()[index];
        var item = actor.equips()[index];
        var slotName = this.equipSlotName(slot);
        this.changeTextColor(this.systemColor());
        this.drawText(slotName, rect.x, rect.y, rect.width);
        this.resetTextColor();
        if (item) {
            this.drawItemName(item, rect.x, rect.y + this.lineHeight());
        } else {
            this.changePaintOpacity(false);
            this.drawText('-', rect.x, rect.y + this.lineHeight(), rect.width);
            this.changePaintOpacity(true);
        }
    };

    Window_StatusDetail.prototype.equipSlotName = function(slot) {
        if (!slot) return '---';
        if (slot === 1) return TextManager.weapon;
        if (slot === 2) return TextManager.armor;
        return 'Accessory';
    };

    Window_StatusDetail.prototype.drawSkillItem = function(index) {
        var actor = this._actor;
        var rect = this.itemRectForText(index);
        var skill = actor.skills()[index];
        if (!skill) return;
        this.drawItemName(skill, rect.x, rect.y, rect.width);
        var cost = skill.mpCost;
        if (cost > 0) {
            this.changeTextColor(this.mpCostColor());
            this.drawText(cost + ' MP', rect.x, rect.y, rect.width, 'right');
        }
    };

    Window_StatusDetail.prototype.itemHeight = function() {
        return this._mode === 'equip' ? this.lineHeight() * 2 : this.lineHeight();
    };

    Window_StatusDetail.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };

    Window_StatusDetail.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this.resetFontSettings();

        if (!this._actor) return;

        if (this._mode === 'class') {
            this.drawClassInfo();
        } else {
            this.drawAllItems();
        }
    };

    Window_StatusDetail.prototype.drawClassInfo = function() {
        var actor = this._actor;
        var cls = actor.currentClass();
        var x = this.textPadding();
        var y = 0;
        var width = this.contents.width - this.textPadding() * 2;
        var lh = this.lineHeight();

        this.changeTextColor(this.systemColor());
        this.drawText(cls.name, x, y, width);
        y += lh;

        this.resetTextColor();
        this.drawText(TextManager.levelA + ': ' + actor.level + '/' + actor.maxLevel(), x, y, width);
        y += lh;

        if (typeof actor.nusvClassTier === 'function') {
            this.drawText('Tier: ' + actor.nusvClassTier(), x, y, width);
            y += lh;
        }

        y += Math.floor(lh / 2);

        var desc = classDescription(actor);
        if (desc) {
            this.changeTextColor(this.systemColor());
            this.drawText('Description', x, y, width);
            y += lh;
            this.resetTextColor();
            var lines = wrapText(desc, width, this.textWidth.bind(this));
            for (var i = 0; i < lines.length; i++) {
                this.drawText(lines[i], x, y, width);
                y += lh;
            }
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusPortrait (center: name / class / level + full body image)
    // -------------------------------------------------------------------------

    function Window_StatusPortrait() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusPortrait.prototype = Object.create(Window_Base.prototype);
    Window_StatusPortrait.prototype.constructor = Window_StatusPortrait;

    Window_StatusPortrait.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this.deactivate();
    };

    Window_StatusPortrait.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_StatusPortrait.prototype.refresh = function() {
        this.contents.clear();
        this.resetFontSettings();
        if (!this._actor) return;

        var pad = this.textPadding();
        var width = this.contents.width - pad * 2;
        var lh = this.lineHeight();
        var y = 0;

        this.contents.fontSize = 40;
        this.changeTextColor(this.normalColor());
        this.drawText(this._actor.name(), pad, y, width, 'center');
        y += lh + 8;
        this.contents.fontSize = this.standardFontSize();

        this.changeTextColor(this.systemColor());
        this.drawText(this._actor.currentClass().name, pad, y, width, 'center');
        y += lh;

        this.resetTextColor();
        this.drawText(TextManager.levelA + ' ' + this._actor.level, pad, y, width, 'center');
        y += lh;

        if (SHOW_NICKNAME && this._actor.nickname()) {
            this.changeTextColor(this.systemColor());
            this.drawText('"' + this._actor.nickname() + '"', pad, y, width, 'center');
            y += lh;
        }

        var imageTop = y + pad;
        var imageHeight = this.contents.height - imageTop - pad;
        this.drawPortrait(pad, imageTop, width, imageHeight);
    };

    Window_StatusPortrait.prototype.drawPortrait = function(x, y, width, height) {
        var name = portraitName(this._actor);
        var bitmap = ImageManager.loadPicture(name);

        if (bitmap && bitmap.isReady() && bitmap.width > 0) {
            var scale = Math.min(width / bitmap.width, height / bitmap.height);
            var dw = Math.floor(bitmap.width * scale);
            var dh = Math.floor(bitmap.height * scale);
            var dx = x + Math.floor((width - dw) / 2);
            var dy = y + Math.floor(height - dh);
            this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, dx, dy, dw, dh);
        } else {
            // Fallback: draw the actor face scaled up while the portrait loads.
            var faceW = Math.min(width, Window_Base._faceWidth * 2);
            var faceH = Math.min(height, faceW);
            var fx = x + Math.floor((width - faceW) / 2);
            var fy = y + Math.floor(height - faceH);
            this.drawActorFace(this._actor, fx, fy, faceW, faceH);
        }
    };

    Window_StatusPortrait.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        // Redraw until the portrait bitmap finishes loading.
        var name = this._actor ? portraitName(this._actor) : null;
        if (name) {
            var bitmap = ImageManager.loadPicture(name);
            if (bitmap && bitmap.isReady() && !this._portraitDrawn) {
                this._portraitDrawn = true;
                this.refresh();
            } else if (name !== this._lastPortraitName) {
                this._lastPortraitName = name;
                this._portraitDrawn = false;
                this.refresh();
            }
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusInfo (right: description + stats + parameters)
    // -------------------------------------------------------------------------

    function Window_StatusInfo() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusInfo.prototype = Object.create(Window_Base.prototype);
    Window_StatusInfo.prototype.constructor = Window_StatusInfo;

    Window_StatusInfo.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this.deactivate();
    };

    Window_StatusInfo.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_StatusInfo.prototype.refresh = function() {
        this.contents.clear();
        this.resetFontSettings();
        if (!this._actor) return;

        var pad = this.textPadding();
        var width = this.contents.width - pad * 2;
        var lh = this.lineHeight();
        var y = 0;

        // --- Profile description ---
        this.changeTextColor(this.systemColor());
        this.drawText('Profile', pad, y, width);
        y += lh;
        this.resetTextColor();

        var desc = profileText(this._actor);
        var lines = wrapText(desc, width, this.textWidth.bind(this));
        var maxDescLines = 4;
        for (var i = 0; i < lines.length && i < maxDescLines; i++) {
            this.drawText(lines[i], pad, y, width);
            y += lh;
        }
        y += Math.floor(lh / 2);
        this.drawHorzLine(pad, y, width);
        y += Math.floor(lh / 2);

        // --- Core stats ---
        this.drawStatBar('HP', this._actor.hp, this._actor.mhp, this._actor.hpRate(),
            this.hpGaugeColor1(), this.hpGaugeColor2(), pad, y, width);
        y += lh + 6;
        this.drawStatBar('MP', this._actor.mp, this._actor.mmp, this._actor.mpRate(),
            this.mpGaugeColor1(), this.mpGaugeColor2(), pad, y, width);
        y += lh + 6;

        var sp = this.spValue();
        var msp = this.spMax();
        this.drawStatBar(SP_LABEL, sp, msp, msp > 0 ? sp / msp : 0,
            this.tpGaugeColor1(), this.tpGaugeColor2(), pad, y, width);
        y += lh + 6;

        // EXP
        var expText = this._actor.isMaxLevel()
            ? '-------'
            : this._actor.currentExp() + ' / ' + (this._actor.currentExp() + this._actor.nextRequiredExp());
        this.changeTextColor(this.systemColor());
        this.drawText('EXP', pad, y, 90);
        this.resetTextColor();
        this.drawText(TextManager.levelA + ' ' + this._actor.level, pad, y, width, 'right');
        y += lh;
        this.changeTextColor(this.normalColor());
        this.drawText(expText, pad, y, width, 'right');
        y += lh + 6;

        // --- Parameters ---
        if (SHOW_PARAMS) {
            this.drawHorzLine(pad, y, width);
            y += Math.floor(lh / 2);
            var colW = Math.floor(width / 2);
            for (var p = 2; p <= 7; p++) {
                var idx = p - 2;
                var col = idx % 2;
                var row = Math.floor(idx / 2);
                var px = pad + col * colW;
                var py = y + row * lh;
                if (py + lh > this.contents.height) break;
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.param(p), px, py, colW - 60);
                this.resetTextColor();
                this.drawText(this._actor.param(p), px, py, colW - 12, 'right');
            }
            y += lh * 3;
        }
    };

    Window_StatusInfo.prototype.spValue = function() {
        if (USE_TP_AS_SP) return this._actor.tp;
        if (typeof this._actor.sp === 'function') return this._actor.sp;
        return this._actor.tp;
    };

    Window_StatusInfo.prototype.spMax = function() {
        if (USE_TP_AS_SP) return this._actor.maxTp();
        if (typeof this._actor.msp === 'function') return this._actor.msp;
        return this._actor.maxTp();
    };

    Window_StatusInfo.prototype.drawStatBar = function(label, value, max, rate, c1, c2, x, y, width) {
        this.changeTextColor(this.systemColor());
        this.drawText(label, x, y, 60);
        this.resetTextColor();
        this.drawText(value + ' / ' + max, x, y, width, 'right');
        drawGaugeBar(this, x, y, width, rate, c1, c2);
    };

    Window_StatusInfo.prototype.drawHorzLine = function(x, y, width) {
        var lineY = y + this.lineHeight() / 2 - 1;
        this.contents.paintOpacity = 48;
        this.contents.fillRect(x, lineY, width, 2, this.normalColor());
        this.contents.paintOpacity = 255;
    };

    // -------------------------------------------------------------------------
    // Scene_Status
    // -------------------------------------------------------------------------

    function Scene_Status() {
        this.initialize.apply(this, arguments);
    }

    Scene_Status.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Status.prototype.constructor = Scene_Status;

    Scene_Status.prototype.initialize = function(actor) {
        Scene_MenuBase.prototype.initialize.call(this);
        this._statusActor = actor || null;
    };

    Scene_Status.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        if (this._statusActor) this._actor = this._statusActor;

        this.createTabsWindow();

        this._portraitWindow = new Window_StatusPortrait(
            leftWidth(), 0, centerWidth(), Graphics.boxHeight
        );
        this.addWindow(this._portraitWindow);

        this._infoWindow = new Window_StatusInfo(
            leftWidth() + centerWidth(), 0, rightWidth(), Graphics.boxHeight
        );
        this.addWindow(this._infoWindow);

        this._detailWindow = new Window_StatusDetail(
            0, this._tabsWindow.height, leftWidth(), Graphics.boxHeight - this._tabsWindow.height
        );
        this.addWindow(this._detailWindow);

        this.refreshAll();
    };

    Scene_Status.prototype.createTabsWindow = function() {
        this._tabsWindow = new Window_StatusTabs(0, 0);
        this._tabsWindow.setHandler('equip',  this.onTabEquip.bind(this));
        this._tabsWindow.setHandler('class',  this.onTabClass.bind(this));
        this._tabsWindow.setHandler('skills', this.onTabSkills.bind(this));
        this._tabsWindow.setHandler('cancel', this.popScene.bind(this));
        this._tabsWindow.setHandler('pageup',  this.previousActor.bind(this));
        this._tabsWindow.setHandler('pagedown', this.nextActor.bind(this));
        this.addWindow(this._tabsWindow);
    };

    Scene_Status.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        this._tabsWindow.activate();
        this._tabsWindow.select(0);
        this.refreshAll();
    };

    Scene_Status.prototype.onTabEquip = function() {
        this._detailWindow.setMode('equip');
        this._tabsWindow.activate();
    };

    Scene_Status.prototype.onTabClass = function() {
        this._detailWindow.setMode('class');
        this._tabsWindow.activate();
    };

    Scene_Status.prototype.onTabSkills = function() {
        this._detailWindow.setMode('skills');
        this._tabsWindow.activate();
    };

    Scene_Status.prototype.refreshAll = function() {
        var actor = this.actor();
        this._tabsWindow.refresh();
        this._tabsWindow.activate();
        this._portraitWindow.setActor(actor);
        this._infoWindow.setActor(actor);
        this._detailWindow.setActor(actor);
        this._detailWindow.setMode(this.currentTabMode());
    };

    Scene_Status.prototype.currentTabMode = function() {
        var symbol = this._tabsWindow.currentSymbol();
        if (symbol === 'class') return 'class';
        if (symbol === 'skills') return 'skills';
        return 'equip';
    };

    Scene_Status.prototype.onActorChange = function() {
        this.refreshAll();
    };

    Scene_Status.prototype.reserveFaceImages = function() {
        // no-op: the redesigned screen relies on full body portraits
    };

    // Replace the global Scene_Status so SceneManager.push(Scene_Status)
    // and the Party menu open this redesigned screen.
    window.Scene_Status = Scene_Status;

    // Expose for debugging / other plugins
    NUSV.StatusScreen.Window_StatusTabs = Window_StatusTabs;
    NUSV.StatusScreen.Window_StatusDetail = Window_StatusDetail;
    NUSV.StatusScreen.Window_StatusPortrait = Window_StatusPortrait;
    NUSV.StatusScreen.Window_StatusInfo = Window_StatusInfo;
    NUSV.StatusScreen.Scene_Status = Scene_Status;
    NUSV.StatusScreen.portraitName = portraitName;
    NUSV.StatusScreen.version = '1.0.0';

})();
