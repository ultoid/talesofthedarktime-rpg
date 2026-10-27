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
 *   [ LEFT ]   Party actor selector
 *   [ CENTER ] Horizontal Status / Equipment / Class / Skills tabs and the
 *              selected actor's full body portrait
 *   [ RIGHT ]  "Status" page: HP / MP / SP / EXP bars, the active status
 *              effect icons (click one for a tooltip with its details),
 *              the Attribute list, and the actor Profile at the bottom.
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
 *
 * STATE NOTETAGS (used by the status effect tooltip)
 *
 *   <NUSV Type: 1>                   Category of the state. The tooltip shows
 *                                   its label under the name, colored:
 *                                   1 = Passive (yellow),
 *                                   2 = Status Effect (red),
 *                                   3 = Skill Effect (green).
 *   <NUSV Desc: ...>                Short description shown in the tooltip.
 *
 * The namespaced "NUSV" prefix keeps these tags from colliding with other
 * plugins. The shorthands <TYPE = ...> / <DESC = ...> are also accepted; they
 * require a ":" or "=" so unrelated tags without a value are ignored. When
 * <NUSV Desc> is absent, the state's database Description is used instead.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_StatusScreen = true;

var NUSV = window.NUSV = window.NUSV || {};
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

    function partyWidth() { return Math.floor(Graphics.boxWidth * 0.10); }
    function rightWidth() { return Math.floor(Graphics.boxWidth * 0.32); }
    function centerWidth() {
        return Graphics.boxWidth - partyWidth() - rightWidth();
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
        win.contents.fillRect(x, y, width, 12, win.gaugeBackColor());
        win.contents.gradientFillRect(x, y, Math.floor(width * rate), 12, c1, c2);
    }

    // Read one <Tag: value> / <Tag = value> field from a state's note.
    // Keys are tried in order, letting the namespaced form take priority.
    // The value is allowed to span multiple lines up to the closing ">".
    function stateNoteField(state, keys) {
        var note = state && state.note ? String(state.note) : '';
        if (!note) return '';
        for (var i = 0; i < keys.length; i++) {
            var re = new RegExp('<' + keys[i] + '\\s*[:=]\\s*([\\s\\S]*?)>', 'i');
            var match = note.match(re);
            if (match) {
                var value = match[1].replace(/\s+/g, ' ').trim();
                if (value) return value;
            }
        }
        return '';
    }

    // Status category code (1 = Passive, 2 = Status Effect, 3 = Skill Effect).
    // Namespaced <NUSV Type: ...> is preferred; <TYPE = ...> is kept as a
    // shorthand. Both need a ":" or "=" so other plugins' tags are ignored.
    function stateTypeName(state) {
        return stateNoteField(state, ['NUSV\\s*Type', 'State\\s*Type', 'TYPE']);
    }

    // Label text shown for each type code.
    //   1 = Passive, 2 = Status Effect, 3 = Skill Effect
    function stateTypeLabel(type) {
        switch (String(type).trim()) {
        case '1': return 'Passive';
        case '2': return 'Status Effect';
        case '3': return 'Skill Effect';
        default:  return '';
        }
    }

    // Text color for each type code:
    //   1 = Passive       -> yellow
    //   2 = Status Effect -> red
    //   3 = Skill Effect  -> green
    function stateTypeColor(win, type) {
        switch (String(type).trim()) {
        case '1': return win.textColor(6);   // yellow
        case '2': return win.textColor(18);  // red
        case '3': return win.textColor(3);   // green
        default:  return win.normalColor();
        }
    }

    // Description text: the <NUSV Desc: ...> / <DESC = ...> tag, falling back
    // to the state's database description when the tag is absent.
    function stateDescriptionText(state) {
        var tagged = stateNoteField(state, ['NUSV\\s*Desc', 'State\\s*Desc', 'DESC']);
        if (tagged) return tagged;
        return state && state.description ? String(state.description) : '';
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
        return centerWidth();
    };

    Window_StatusTabs.prototype.numVisibleRows = function() {
        return 1;
    };

    Window_StatusTabs.prototype.maxCols = function() {
        return 4;
    };

    Window_StatusTabs.prototype.makeCommandList = function() {
        this.addCommand(TextManager.status || 'Status', 'status');
        this.addCommand(TAB_EQUIP, 'equip');
        this.addCommand(TAB_CLASS, 'class');
        this.addCommand(TAB_SKILLS, 'skills');
    };

    Window_StatusTabs.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_StatusTabs.prototype.select = function(index) {
        Window_Command.prototype.select.call(this, index);
        if (this._onSelectHandler) {
            this._onSelectHandler(index, this.currentSymbol());
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusParty (selectable actor rail)
    // -------------------------------------------------------------------------

    function Window_StatusParty() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusParty.prototype = Object.create(Window_Selectable.prototype);
    Window_StatusParty.prototype.constructor = Window_StatusParty;

    Window_StatusParty.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._readyPortraits = {};
        var actor = $gameParty.menuActor();
        this.select(actor ? Math.max(0, $gameParty.members().indexOf(actor)) : 0);
    };

    Window_StatusParty.prototype.maxItems = function() {
        return $gameParty.members().length;
    };

    Window_StatusParty.prototype.itemHeight = function() {
        var rows = Math.max(1, Math.min(this.maxItems(), 4));
        return Math.min(150, Math.floor((this.height - this.padding * 2) / rows));
    };

    Window_StatusParty.prototype.drawItem = function(index) {
        var actor = $gameParty.members()[index];
        if (!actor) return;

        var rect = this.itemRect(index);
        if (index === this.index()) {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height,
                'rgba(255, 255, 255, 0.16)');
        }

        var faceName = actor.faceName();
        var isFace = Boolean(faceName);
        var bitmap = isFace ? ImageManager.loadFace(faceName) : ImageManager.loadPicture(portraitName(actor));
        if (bitmap && !bitmap.isReady()) {
            bitmap.addLoadListener(this.refresh.bind(this));
        }

        var portraitWidth = Math.max(1, rect.width - 8);
        var portraitHeight = Math.max(1, rect.height - this.lineHeight() - 14);
        var size = Math.min(portraitWidth, portraitHeight);
        if (size % 2 !== 0) size--;

        if (bitmap && bitmap.isReady() && bitmap.width > 0 && bitmap.height > 0 && size > 0) {
            var pw = isFace ? Window_Base._faceWidth : bitmap.width;
            var ph = isFace ? Window_Base._faceHeight : bitmap.height;
            var sx = isFace ? (actor.faceIndex() % 4) * pw : 0;
            var sy = isFace ? Math.floor(actor.faceIndex() / 4) * ph : 0;
            var sw = pw;
            var sh = ph;

            var imageX = rect.x + Math.floor((rect.width - size) / 2);
            var imageY = rect.y + 4 + Math.floor((portraitHeight - size) / 2);
            var radius = Math.floor(size / 2);
            var cx = imageX + radius;
            var cy = imageY + radius;

            var context = this.contents._context;
            context.save();
            context.beginPath();
            context.arc(cx, cy, radius, 0, Math.PI * 2, false);
            context.clip();

            this.contents.blt(bitmap, sx, sy, sw, sh, imageX, imageY, size, size);

            context.restore();
            this.contents._setDirty();
        }

        this.contents.fontSize = Math.min(18, this.standardFontSize());
        this.drawText(actor.name(), rect.x, rect.y + rect.height - this.lineHeight() - 4,
            rect.width, 'center');
        this.resetFontSettings();
    };

    Window_StatusParty.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.refreshReadyPortraits();
        if (!TouchInput.isTriggered() || !this.isTouchedInsideFrame()) return;

        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        var index = this.hitTest(x, y);
        if (index >= 0) {
            this.select(index);
            this.refresh();
            this.callHandler('actorChange');
        }
    };

    Window_StatusParty.prototype.refreshReadyPortraits = function() {
        var members = $gameParty.members();
        for (var i = 0; i < members.length; i++) {
            var faceName = members[i].faceName();
            var key = faceName || portraitName(members[i]);
            if (this._readyPortraits[key]) continue;
            var bitmap = faceName ? ImageManager.loadFace(faceName) : ImageManager.loadPicture(key);
            if (bitmap && bitmap.isReady() && bitmap.width > 0 && bitmap.height > 0) {
                this._readyPortraits[key] = true;
                this.refresh();
            }
        }
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
        this._stateIcons = [];
        this._statePopup = null;
        this.deactivate();
    };

    Window_StatusInfo.prototype.setActor = function(actor) {
        this._actor = actor;
        this.hideStatePopup();
        this.refresh();
    };

    Window_StatusInfo.prototype.setStatePopup = function(popup) {
        this._statePopup = popup;
    };

    Window_StatusInfo.prototype.refresh = function() {
        this.contents.clear();
        this.resetFontSettings();
        if (!this._actor) return;

        var pad = this.textPadding();
        var width = this.contents.width - pad * 2;
        var lh = this.lineHeight();
        var y = 0;

        // --- Title ---
        this.changeTextColor(this.systemColor());
        this.drawText('Status', pad, y, width, 'center');
        this.resetTextColor();
        y += lh + 4;

        // --- HP / MP / SP bars (grouped under the title) ---
        this.drawStatBar('HP', this._actor.hp + ' / ' + this._actor.mhp,
            this._actor.hpRate(), this.hpGaugeColor1(), this.hpGaugeColor2(),
            pad, y, width);
        y += lh + 14;

        this.drawStatBar('MP', this._actor.mp + ' / ' + this._actor.mmp,
            this._actor.mpRate(), this.mpGaugeColor1(), this.mpGaugeColor2(),
            pad, y, width);
        y += lh + 14;

        var sp = this.spValue();
        var msp = this.spMax();
        this.drawStatBar(SP_LABEL, sp + ' / ' + msp, msp > 0 ? sp / msp : 0,
            this.tpGaugeColor1(), this.tpGaugeColor2(), pad, y, width);
        y += lh + 14;

        // --- EXP bar (4th bar) ---
        this.drawStatBar('EXP', this.expValueText(), this.expRate(),
            this.expGaugeColor1(), this.expGaugeColor2(), pad, y, width);
        y += lh + 18;

        // --- Status Effects: icons only, click one to see its details ---
        y = this.drawStateIcons(pad, y, width);
        y += 6;

        // --- Attribute: single column, 6 rows ---
        if (SHOW_PARAMS) {
            this.changeTextColor(this.systemColor());
            this.drawText('Attribute', pad, y, width);
            this.resetTextColor();
            y += lh;
            for (var p = 2; p <= 7; p++) {
                if (y + lh > this.contents.height) break;
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.param(p), pad + 8, y, width - 60);
                this.resetTextColor();
                this.drawText(this._actor.param(p), pad, y, width, 'right');
                y += lh;
            }
            y += 6;
        }

        // --- Profile: half-size font, sized to fit the remaining space ---
        this.drawProfileBlock(pad, y, width);
    };

    // The states currently applied to the actor (status effects).
    Window_StatusInfo.prototype.activeStates = function() {
        var result = [];
        var states = this._actor ? this._actor.states() : [];
        for (var i = 0; i < states.length; i++) {
            if (states[i] && states[i].id > 0) result.push(states[i]);
        }
        return result;
    };

    // Draw one icon per active state and remember each hotspot so a click can
    // open the matching popup. Returns the y coordinate below the row(s).
    Window_StatusInfo.prototype.drawStateIcons = function(x, y, width) {
        this._stateIcons = [];
        var states = this.activeStates();
        if (states.length === 0) return y;

        var size = Window_Base._iconWidth;
        var gap = 6;
        var perRow = Math.max(1, Math.floor((width + gap) / (size + gap)));
        var cx = x;
        var cy = y;
        var col = 0;
        for (var i = 0; i < states.length; i++) {
            if (col >= perRow) {
                col = 0;
                cx = x;
                cy += size + gap;
            }
            this.drawStateIcon(states[i], cx, cy, size);
            this._stateIcons.push({ state: states[i], x: cx, y: cy, size: size });
            cx += size + gap;
            col++;
        }
        var rows = Math.ceil(states.length / perRow);
        return y + rows * (size + gap);
    };

    Window_StatusInfo.prototype.drawStateIcon = function(state, x, y, size) {
        if (state.iconIndex > 0) {
            this.drawIcon(state.iconIndex, x, y);
            return;
        }
        // States without a database icon still need a clickable placeholder.
        this.contents.fillRect(x, y, size, size, this.gaugeBackColor());
        var lastSize = this.contents.fontSize;
        this.contents.fontSize = 20;
        this.changeTextColor(this.normalColor());
        var letter = (state.name || '?').charAt(0).toUpperCase();
        this.drawText(letter, x, y + 4, size, 'center');
        this.contents.fontSize = lastSize;
        this.resetTextColor();
    };

    Window_StatusInfo.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.processStateTouch();
    };

    // A click on a state icon toggles its popup; a click anywhere else closes it.
    Window_StatusInfo.prototype.processStateTouch = function() {
        if (!this._statePopup || !this._actor || !this.visible) return;
        if (!TouchInput.isTriggered()) return;
        var sx = TouchInput.x;
        var sy = TouchInput.y;
        if (this._statePopup.visible && this._statePopup.isScreenPointInside(sx, sy)) return;

        var hit = this.stateIconAtScreen(sx, sy);
        if (hit) {
            var same = this._statePopup.visible && this._statePopup.state() === hit.state;
            if (same) {
                this.hideStatePopup();
            } else {
                this.showStatePopup(hit);
            }
        } else {
            this.hideStatePopup();
        }
    };

    Window_StatusInfo.prototype.stateIconAtScreen = function(sx, sy) {
        var lx = sx - this.x - this.padding;
        var ly = sy - this.y - this.padding;
        for (var i = 0; i < this._stateIcons.length; i++) {
            var icon = this._stateIcons[i];
            if (lx >= icon.x && lx < icon.x + icon.size &&
                ly >= icon.y && ly < icon.y + icon.size) {
                return {
                    state: icon.state,
                    screen: {
                        x: this.x + this.padding + icon.x,
                        y: this.y + this.padding + icon.y,
                        w: icon.size,
                        h: icon.size
                    }
                };
            }
        }
        return null;
    };

    Window_StatusInfo.prototype.showStatePopup = function(hit) {
        this._statePopup.showState(hit.state);
        this._statePopup.reposition(hit.screen);
    };

    Window_StatusInfo.prototype.hideStatePopup = function() {
        if (this._statePopup) this._statePopup.hideState();
    };

    Window_StatusInfo.prototype.expRate = function() {
        var actor = this._actor;
        if (actor.isMaxLevel()) return 1;
        var total = actor.currentExp() + actor.nextRequiredExp();
        return total > 0 ? actor.currentExp() / total : 0;
    };

    Window_StatusInfo.prototype.expValueText = function() {
        var actor = this._actor;
        if (actor.isMaxLevel()) return '-------';
        return actor.currentExp() + ' / ' + (actor.currentExp() + actor.nextRequiredExp());
    };

    Window_StatusInfo.prototype.expGaugeColor1 = function() {
        return this.textColor(6);
    };

    Window_StatusInfo.prototype.expGaugeColor2 = function() {
        return this.textColor(27);
    };

    Window_StatusInfo.prototype.drawProfileBlock = function(x, y, width) {
        var desc = profileText(this._actor);
        var smallFont = Math.max(10, Math.floor(this.standardFontSize() / 2));
        var smallLine = smallFont + 6;

        // Show up to 5 lines, capped by the space left below Attribute so the
        // text never runs past the bottom of the window.
        var remaining = this.contents.height - y;
        var maxLines = Math.min(5, Math.floor(remaining / smallLine) - 1);
        if (!desc || maxLines <= 0) {
            this.resetFontSettings();
            return;
        }

        this.contents.fontSize = smallFont;

        var lines = wrapText(desc, width, this.textWidth.bind(this));
        if (lines.length > maxLines) lines = lines.slice(0, maxLines);

        // Flow linearly right below Attribute.
        var py = y;

        this.changeTextColor(this.systemColor());
        this.drawText('Profile', x, py, width);
        this.resetTextColor();
        py += smallLine;

        for (var i = 0; i < lines.length; i++) {
            this.drawText(lines[i], x, py, width);
            py += smallLine;
        }
        this.resetFontSettings();
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

    Window_StatusInfo.prototype.drawStatBar = function(label, valueText, rate, c1, c2, x, y, width) {
        this.changeTextColor(this.systemColor());
        this.drawText(label, x, y, 60);
        this.resetTextColor();
        this.drawText(valueText, x, y, width, 'right');
        drawGaugeBar(this, x, y + this.lineHeight(), width, rate, c1, c2);
    };

    // -------------------------------------------------------------------------
    // Window_StatePopup (tooltip shown beside a clicked status-effect icon)
    // -------------------------------------------------------------------------

    function Window_StatePopup() {
        this.initialize.apply(this, arguments);
    }

    Window_StatePopup.prototype = Object.create(Window_Base.prototype);
    Window_StatePopup.prototype.constructor = Window_StatePopup;

    Window_StatePopup.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, 0, 0, 240, 96);
        this._state = null;
        this.deactivate();
        this.hideState();
    };

    Window_StatePopup.prototype.state = function() {
        return this._state;
    };

    Window_StatePopup.prototype.showState = function(state) {
        this._state = state;
        this.refresh();
        this.visible = true;
    };

    Window_StatePopup.prototype.hideState = function() {
        this.visible = false;
    };

    // Place the popup beside the icon, flipping to the left and clamping on
    // both axes when there is not enough room.
    Window_StatePopup.prototype.reposition = function(anchor) {
        var gap = 8;
        var x = anchor.x + anchor.w + gap;
        if (x + this.width > Graphics.boxWidth) {
            x = anchor.x - this.width - gap;
        }
        x = x.clamp(0, Graphics.boxWidth - this.width);
        var y = anchor.y;
        if (y + this.height > Graphics.boxHeight) {
            y = anchor.y + anchor.h - this.height;
        }
        y = y.clamp(0, Graphics.boxHeight - this.height);
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    };

    Window_StatePopup.prototype.isScreenPointInside = function(sx, sy) {
        return sx >= this.x && sx < this.x + this.width &&
               sy >= this.y && sy < this.y + this.height;
    };

    Window_StatePopup.prototype.refresh = function() {
        var state = this._state;
        if (!state) return;

        var padding = this.standardPadding();
        var lineHeight = this.lineHeight();
        var smallFont = Math.max(12, Math.floor(this.standardFontSize() / 2));
        var smallLine = smallFont + 6;
        var iconWidth = state.iconIndex > 0 ? Window_Base._iconWidth + 6 : 0;

        var width = Math.max(180, this.textWidth(state.name) + iconWidth + padding * 2);
        width = Math.min(width, Graphics.boxWidth - 24);
        this.width = width;
        var textWidth = width - padding * 2;

        // Line 1: the state name. Line 2: its type label, colored by code.
        // Then the description, all at half size.
        var type = stateTypeName(state);
        var typeLabel = stateTypeLabel(type);
        var desc = stateDescriptionText(state);

        this.contents.fontSize = smallFont;
        var typeLines = typeLabel ? wrapText(typeLabel, textWidth, this.textWidth.bind(this)) : [];
        var descLines = desc ? wrapText(desc, textWidth, this.textWidth.bind(this)) : [];
        this.contents.fontSize = this.standardFontSize();

        var computeHeight = function() {
            var h = padding * 2 + lineHeight;
            if (typeLines.length > 0) h += 4 + typeLines.length * smallLine;
            if (descLines.length > 0) h += 6 + descLines.length * smallLine;
            return h;
        };
        var height = computeHeight();

        // Keep the popup on screen even when the note is very long.
        var maxHeight = Graphics.boxHeight - 24;
        while (height > maxHeight && descLines.length > 0) {
            descLines.pop();
            height = computeHeight();
        }
        while (height > maxHeight && typeLines.length > 0) {
            typeLines.pop();
            height = computeHeight();
        }
        this.height = height;

        this.createContents();
        this.contents.clear();
        this.resetFontSettings();

        var x = 0;
        var y = 0;
        if (state.iconIndex > 0) {
            this.drawIcon(state.iconIndex, x, y + 2);
            x += Window_Base._iconWidth + 6;
        }
        this.changeTextColor(this.systemColor());
        this.drawText(state.name, x, y, width - padding * 2 - x);
        this.resetTextColor();
        y += lineHeight + 4;

        if (typeLines.length > 0) {
            this.contents.fontSize = smallFont;
            this.changeTextColor(stateTypeColor(this, type));
            for (var t = 0; t < typeLines.length; t++) {
                this.drawText(typeLines[t], 0, y, textWidth);
                y += smallLine;
            }
            this.resetFontSettings();
        }

        if (descLines.length > 0) {
            this.contents.fontSize = smallFont;
            this.changeTextColor(this.normalColor());
            for (var i = 0; i < descLines.length; i++) {
                this.drawText(descLines[i], 0, y, textWidth);
                y += smallLine;
            }
            this.resetFontSettings();
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusEquipPreview (Right panel: Battler, 8 Equip Slots, Item Detail)
    // -------------------------------------------------------------------------

    function Window_StatusEquipPreview() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusEquipPreview.prototype = Object.create(Window_Selectable.prototype);
    Window_StatusEquipPreview.prototype.constructor = Window_StatusEquipPreview;

    Window_StatusEquipPreview.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._selectedIndex = 0;
        this.select(0);
        this.deactivate();
        this.refresh();
    };

    Window_StatusEquipPreview.prototype.maxItems = function() {
        return this.slotDefs().length;
    };

    Window_StatusEquipPreview.prototype.isCursorMovable = function() {
        return this.isOpenAndActive();
    };

    Window_StatusEquipPreview.prototype.select = function(index) {
        Window_Selectable.prototype.select.call(this, index);
        if (this._selectedIndex !== index) {
            this._selectedIndex = index;
            this.refresh();
        }
    };

    Window_StatusEquipPreview.prototype.activate = function() {
        Window_Selectable.prototype.activate.call(this);
        this.refresh();
    };

    Window_StatusEquipPreview.prototype.deactivate = function() {
        Window_Selectable.prototype.deactivate.call(this);
        this.refresh();
    };

    Window_StatusEquipPreview.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_StatusEquipPreview.prototype.updateCursor = function() {
        // Custom visual cursor rendered per slot in drawSlots()
        this.setCursorRect(0, 0, 0, 0);
    };

    Window_StatusEquipPreview.prototype.slotDefs = function() {
        var W = this.contents ? this.contents.width : (this.width - this.standardPadding() * 2);
        var boxW = 40;
        var cx = Math.floor(W / 2);
        return [
            { key: 'helm',      label: 'Helm',       etypeId: 3, occ: 0, placeholderIcon: 130, x: cx - Math.floor(boxW / 2), y: 32 },
            { key: 'armor',     label: 'Armor',      etypeId: 4, occ: 0, placeholderIcon: 135, x: 12,                        y: 80 },
            { key: 'boots',     label: 'Boots',      etypeId: 5, occ: 0, placeholderIcon: 139, x: 12,                        y: 150 },
            { key: 'primary',   label: 'Weapon',     etypeId: 1, occ: 0, placeholderIcon: 96,  x: W - 12 - boxW,             y: 80 },
            { key: 'secondary', label: 'Secondary',  etypeId: 2, occ: 0, placeholderIcon: 128, x: W - 12 - boxW,             y: 150 },
            { key: 'acc1',      label: 'Acc 1',      etypeId: 6, occ: 0, placeholderIcon: 144, x: 14,                        y: 220 },
            { key: 'acc2',      label: 'Acc 2',      etypeId: 6, occ: 1, placeholderIcon: 144, x: cx - Math.floor(boxW / 2), y: 220 },
            { key: 'relic',     label: 'Relic',      etypeId: 7, occ: 0, placeholderIcon: 160, x: W - 14 - boxW,             y: 220 }
        ];
    };

    Window_StatusEquipPreview.prototype.getEquippedItem = function(slotDef) {
        if (!this._actor || !slotDef) return null;
        var slots = this._actor.equipSlots();
        var equips = this._actor.equips();

        if (slotDef.key === 'primary') {
            for (var i = 0; i < slots.length; i++) {
                if (slots[i] === 1) return equips[i];
            }
        } else if (slotDef.key === 'secondary') {
            if (slots.length > 1 && (slots[1] === 2 || slots[1] === 1)) {
                return equips[1];
            }
            for (var j = 0; j < slots.length; j++) {
                if (slots[j] === 2) return equips[j];
            }
        } else if (slotDef.key === 'acc1') {
            for (var a = 0; a < slots.length; a++) {
                if (slots[a] === 6) return equips[a];
            }
        } else if (slotDef.key === 'acc2') {
            var count = 0;
            for (var b = 0; b < slots.length; b++) {
                if (slots[b] === 6) {
                    if (count === 1) return equips[b];
                    count++;
                }
            }
            return null;
        } else {
            for (var k = 0; k < slots.length; k++) {
                if (slots[k] === slotDef.etypeId) return equips[k];
            }
        }
        return null;
    };

    Window_StatusEquipPreview.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this.resetFontSettings();
        if (!this._actor) return;

        var W = this.contents.width;

        // Title
        this.contents.fontSize = 16;
        this.changeTextColor(this.systemColor());
        this.contents.drawText('EQUIPMENT', 0, 4, W, 18, 'center');
        this.resetFontSettings();

        // Battler in center
        this.drawBattler();

        // 8 Equip slot boxes
        this.drawSlots();

        // Detail panel at bottom
        this.drawDetail();
    };

    Window_StatusEquipPreview.prototype.drawBattler = function() {
        var actor = this._actor;
        if (!actor) return;
        var W = this.contents.width;
        var cx = Math.floor(W / 2);
        var bw = 72;
        var bh = 95;
        var bx = cx - Math.floor(bw / 2);
        var by = 88;

        var drawn = false;
        if (actor.battlerName && typeof ImageManager !== 'undefined' && ImageManager.loadSvActor) {
            var bName = actor.battlerName();
            if (bName) {
                var bitmap = ImageManager.loadSvActor(bName);
                if (bitmap && !bitmap.isReady()) {
                    bitmap.addLoadListener(this.refresh.bind(this));
                } else if (bitmap && bitmap.isReady() && bitmap.width > 0) {
                    var fw = bitmap.width / 9;
                    var fh = bitmap.height / 6;
                    var motionIndex = 1; // wait
                    var pattern = 1;
                    var sx = ((motionIndex % 3) * 3 + pattern) * fw;
                    var sy = Math.floor(motionIndex / 3) * fh;
                    var scale = Math.min(bw / fw, bh / fh);
                    var dw = Math.floor(fw * scale);
                    var dh = Math.floor(fh * scale);
                    var dx = bx + Math.floor((bw - dw) / 2);
                    var dy = by + Math.floor((bh - dh) / 2);
                    this.contents.blt(bitmap, sx, sy, fw, fh, dx, dy, dw, dh);
                    drawn = true;
                }
            }
        }

        if (!drawn && actor.characterName) {
            var cName = actor.characterName();
            if (cName) {
                var cBitmap = ImageManager.loadCharacter(cName);
                if (cBitmap && !cBitmap.isReady()) {
                    cBitmap.addLoadListener(this.refresh.bind(this));
                } else if (cBitmap && cBitmap.isReady()) {
                    var big = ImageManager.isBigCharacter(cName);
                    var pw = cBitmap.width / (big ? 3 : 12);
                    var ph = cBitmap.height / (big ? 4 : 8);
                    var n = actor.characterIndex();
                    var csx = (n % 4 * 3 + 1) * pw;
                    var csy = Math.floor(n / 4 * 4) * ph;
                    var cScale = Math.min(bw / pw, bh / ph);
                    var cdw = Math.floor(pw * cScale);
                    var cdh = Math.floor(ph * cScale);
                    var cdx = bx + Math.floor((bw - cdw) / 2);
                    var cdy = by + Math.floor((bh - cdh) / 2);
                    this.contents.blt(cBitmap, csx, csy, pw, ph, cdx, cdy, cdw, cdh);
                }
            }
        }
    };

    Window_StatusEquipPreview.prototype.drawSlots = function() {
        var defs = this.slotDefs();
        var boxW = 40;
        var boxH = 40;

        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            var item = this.getEquippedItem(def);
            var isSelected = this.active && (i === this._selectedIndex);

            // Box Background
            var bgColor = isSelected ? 'rgba(50, 110, 200, 0.45)' : 'rgba(10, 20, 42, 0.6)';
            this.contents.fillRect(def.x, def.y, boxW, boxH, bgColor);

            // Border
            var ctx = this.contents._context;
            ctx.save();
            ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(80, 140, 220, 0.4)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(def.x + 0.5, def.y + 0.5, boxW - 1, boxH - 1);
            ctx.restore();

            // Icon (centered in 40x40 box)
            var ix = def.x + Math.floor((boxW - 32) / 2);
            var iy = def.y + Math.floor((boxH - 32) / 2);
            var slotIcon = (item && item.iconIndex > 0) ? item.iconIndex : 0;
            if (!slotIcon && item && item.note) {
                var sim = item.note.match(/<icon:\s*(\d+)>/i);
                if (sim) slotIcon = parseInt(sim[1], 10);
            }
            if (slotIcon > 0) {
                this.drawIcon(slotIcon, ix, iy);
            } else {
                this.contents.paintOpacity = item ? 255 : 65;
                this.drawIcon(def.placeholderIcon, ix, iy);
                this.contents.paintOpacity = 255;
            }
            this.contents._setDirty();

            // Label below box (drawn with explicit 14px height so it doesn't collide with below row)
            this.contents.fontSize = 10;
            this.changeTextColor(isSelected ? this.normalColor() : this.systemColor());
            this.contents.drawText(def.label, def.x - 12, def.y + boxH, boxW + 24, 14, 'center');
            this.resetFontSettings();
        }
    };

    Window_StatusEquipPreview.prototype.drawDetail = function() {
        var defs = this.slotDefs();
        var def = defs[this._selectedIndex] || defs[0];
        var item = this.getEquippedItem(def);
        var W = this.contents.width;
        var x = 10;
        var dy = 292;

        // Divider
        this.contents.fillRect(x, dy, W - x * 2, 1, 'rgba(255, 255, 255, 0.2)');
        dy += 12;

        if (!item) {
            this.contents.fontSize = 17;
            this.changeTextColor(this.systemColor());
            this.contents.drawText(def.label + ' (Empty)', x, dy, W - x * 2, 22, 'left');
            dy += 26;
            this.resetFontSettings();

            // Empty icon box
            this.contents.fillRect(x, dy, 40, 40, 'rgba(10, 20, 40, 0.4)');
            var ctx = this.contents._context;
            ctx.save();
            ctx.strokeStyle = 'rgba(80, 140, 220, 0.4)';
            ctx.strokeRect(x + 0.5, dy + 0.5, 39, 39);
            ctx.restore();
            this.contents.paintOpacity = 60;
            this.drawIcon(def.placeholderIcon, x + 4, dy + 4);
            this.contents.paintOpacity = 255;
            this.contents._setDirty();

            this.changeTextColor(this.systemColor());
            this.contents.fontSize = 13;
            this.contents.drawText(def.label, x + 48, dy + 2, W - x - 48, 16, 'left');
            this.resetTextColor();
            this.contents.fontSize = 12;
            this.contents.drawText('Empty Slot', x + 48, dy + 20, W - x - 48, 16, 'left');
            this.resetFontSettings();
            dy += 46;

            this.changeTextColor(this.systemColor());
            this.contents.fontSize = 13;
            this.contents.drawText('Description', x, dy, W - x * 2, 16, 'left');
            dy += 18;
            this.resetTextColor();
            this.contents.fontSize = 12;
            this.contents.drawText('No equipment equipped in this slot.', x, dy, W - x * 2, 16, 'left');
            dy += 24;

            this.changeTextColor(this.systemColor());
            this.contents.fontSize = 13;
            this.contents.drawText('Stat Bonus', x, dy, W - x * 2, 16, 'left');
            dy += 20;
            this.changeTextColor(this.textColor(7));
            this.contents.fontSize = 12;
            this.contents.drawText('No stat bonus', x, dy, W - x * 2, 16, 'left');
            this.resetFontSettings();
            return;
        }

        // Item Title
        var rarity = '';
        if (item.note) {
            var rm = item.note.match(/<NUSV Rarity:\s*([^>]+)>/i);
            if (rm) rarity = rm[1].trim();
        }
        this.contents.fontSize = 17;
        var rLow = rarity.toLowerCase();
        if (rLow === 'uncommon') {
            this.changeTextColor(this.textColor(14)); // Light blue
        } else if (rLow === 'rare') {
            this.changeTextColor(this.textColor(27)); // Purple
        } else if (rLow === 'epic' || rLow === 'legendary') {
            this.changeTextColor(this.textColor(17)); // Gold / yellow
        } else {
            this.changeTextColor(this.normalColor());
        }
        this.contents.drawText(item.name, x, dy, W - x * 2, 22, 'left');
        dy += 26;
        this.resetFontSettings();

        // Large icon box & Type info
        this.contents.fillRect(x, dy, 40, 40, 'rgba(10, 20, 40, 0.4)');
        var ctx2 = this.contents._context;
        ctx2.save();
        ctx2.strokeStyle = 'rgba(80, 140, 220, 0.4)';
        ctx2.strokeRect(x + 0.5, dy + 0.5, 39, 39);
        ctx2.restore();

        var detailIcon = (item.iconIndex > 0) ? item.iconIndex : def.placeholderIcon;
        if (item.note) {
            var iconMatch = item.note.match(/<icon:\s*(\d+)>/i);
            if (iconMatch) detailIcon = parseInt(iconMatch[1], 10);
        }
        this.drawIcon(detailIcon, x + 4, dy + 4);
        this.contents._setDirty();

        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 13;
        this.contents.drawText(def.label, x + 48, dy + 2, W - x - 48, 16, 'left');

        var typeText = '';
        if (DataManager.isWeapon(item)) {
            typeText = $dataSystem.weaponTypes[item.wtypeId] || TextManager.weapon;
        } else if (DataManager.isArmor(item)) {
            typeText = $dataSystem.armorTypes[item.atypeId] || TextManager.armor;
        }
        if (rarity) typeText += (typeText ? ' • ' : '') + rarity;
        this.resetTextColor();
        this.contents.fontSize = 12;
        this.contents.drawText(typeText, x + 48, dy + 20, W - x - 48, 16, 'left');
        this.resetFontSettings();
        dy += 46;

        // Description
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 13;
        this.contents.drawText('Description', x, dy, W - x * 2, 16, 'left');
        dy += 18;
        this.resetTextColor();
        this.contents.fontSize = 12;
        var lines = wrapText(item.description, W - x * 2, this.textWidth.bind(this));
        if (lines.length > 0) {
            for (var l = 0; l < Math.min(lines.length, 3); l++) {
                this.contents.drawText(lines[l], x, dy, W - x * 2, 16, 'left');
                dy += 16;
            }
        } else {
            this.contents.drawText('-', x, dy, W - x * 2, 16, 'left');
            dy += 16;
        }
        dy += 10;

        // Stat Bonus
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 13;
        this.contents.drawText('Stat Bonus', x, dy, W - x * 2, 16, 'left');
        dy += 20;
        this.resetTextColor();
        this.contents.fontSize = 12;

        var hasStats = false;
        if (item.params) {
            for (var p = 0; p < 8; p++) {
                var val = item.params[p];
                if (!val) continue;
                hasStats = true;
                this.changeTextColor(this.systemColor());
                this.contents.drawText(TextManager.param(p), x + 4, dy, 100, 18, 'left');
                this.changeTextColor(val > 0 ? this.powerUpColor() : this.powerDownColor());
                this.contents.drawText((val > 0 ? '+' : '') + val, x + 104, dy, W - x * 2 - 104, 18, 'right');
                this.resetTextColor();
                dy += 18;
            }
        }
        if (!hasStats) {
            this.changeTextColor(this.textColor(7));
            this.contents.drawText('No stat bonus', x + 4, dy, W - x * 2 - 4, 18, 'left');
            this.resetTextColor();
        }
        this.resetFontSettings();
    };

    Window_StatusEquipPreview.prototype.hitTestSlot = function(x, y) {
        var defs = this.slotDefs();
        var boxW = 40;
        var boxH = 40;
        for (var i = 0; i < defs.length; i++) {
            var d = defs[i];
            if (x >= d.x - 4 && x <= d.x + boxW + 4 &&
                y >= d.y - 4 && y <= d.y + boxH + 16) {
                return i;
            }
        }
        return -1;
    };

    Window_StatusEquipPreview.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        if (this.isOpenAndActive() && TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hit = this.hitTestSlot(x, y);
            if (hit >= 0) {
                this._selectedIndex = hit;
                SoundManager.playCursor();
                this.refresh();
            }
        }
    };

    Window_StatusEquipPreview.prototype.cursorDown = function(wrap) {
        var cur = this._selectedIndex;
        var next = cur;
        if (cur === 0) next = 1;
        else if (cur === 1) next = 2;
        else if (cur === 2) next = 5;
        else if (cur === 3) next = 4;
        else if (cur === 4) next = 7;
        else if (cur === 5 || cur === 6 || cur === 7) {
            if (wrap) next = 0;
        }
        if (next !== cur) {
            this._selectedIndex = next;
            SoundManager.playCursor();
            this.refresh();
        }
    };

    Window_StatusEquipPreview.prototype.cursorUp = function(wrap) {
        var cur = this._selectedIndex;
        var next = cur;
        if (cur === 0) {
            if (wrap) next = 6;
        } else if (cur === 1) next = 0;
        else if (cur === 2) next = 1;
        else if (cur === 3) next = 0;
        else if (cur === 4) next = 3;
        else if (cur === 5 || cur === 6) next = 2;
        else if (cur === 7) next = 4;
        if (next !== cur) {
            this._selectedIndex = next;
            SoundManager.playCursor();
            this.refresh();
        }
    };

    Window_StatusEquipPreview.prototype.cursorRight = function(wrap) {
        var cur = this._selectedIndex;
        var next = cur;
        if (cur === 0) next = 3;
        else if (cur === 1) next = 3;
        else if (cur === 2) next = 4;
        else if (cur === 3 && wrap) next = 1;
        else if (cur === 4 && wrap) next = 2;
        else if (cur === 5) next = 6;
        else if (cur === 6) next = 7;
        else if (cur === 7 && wrap) next = 5;
        if (next !== cur) {
            this._selectedIndex = next;
            SoundManager.playCursor();
            this.refresh();
        }
    };

    Window_StatusEquipPreview.prototype.cursorLeft = function(wrap) {
        var cur = this._selectedIndex;
        var next = cur;
        if (cur === 0) next = 1;
        else if (cur === 1 && wrap) next = 3;
        else if (cur === 2 && wrap) next = 4;
        else if (cur === 3) next = 1;
        else if (cur === 4) next = 2;
        else if (cur === 5 && wrap) next = 7;
        else if (cur === 6) next = 5;
        else if (cur === 7) next = 6;
        if (next !== cur) {
            this._selectedIndex = next;
            SoundManager.playCursor();
            this.refresh();
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusClassTree (Right panel: Job Advancement Tree & Stat Traits)
    // -------------------------------------------------------------------------

    var DEFAULT_CLASS_PARENT_MAP = {
        // Fighter Track
        2: 1, 3: 1, 4: 1,
        5: 2, 6: 3, 7: 4,
        8: 5, 9: 6, 10: 6, 11: 7,
        12: 8, 13: 10, 14: 10, 15: 11, 16: 9,

        // Apprentice Track
        18: 17, 19: 17, 20: 17,
        21: 18, 22: 19, 23: 20,
        24: 21, 25: 21, 26: 21, 27: 21, 28: 21, 29: 21, 30: 21, 31: 21,
        32: 22, 33: 23,
        34: 21, 35: 32, 36: 33, 37: 22, 38: 21,
        49: 34, 50: 36,

        // Scout Track
        40: 39, 41: 39,
        42: 40, 43: 41,
        44: 42, 45: 43,
        46: 42, 47: 45, 48: 44
    };

    function getClassParentId(cls) {
        if (!cls) return 0;
        if (cls.note) {
            var m = cls.note.match(/<Class Change From:\s*([^>]+)>/i);
            if (m) {
                var raw = m[1].trim();
                var id = parseInt(raw, 10);
                if (!isNaN(id) && $dataClasses[id]) return id;
                for (var i = 1; i < $dataClasses.length; i++) {
                    if ($dataClasses[i] && $dataClasses[i].name.toLowerCase() === raw.toLowerCase()) {
                        return i;
                    }
                }
            }
        }
        return DEFAULT_CLASS_PARENT_MAP[cls.id] || 0;
    }

    function getClassIconIndex(cls) {
        if (!cls) return 0;
        if (cls.note) {
            var m = cls.note.match(/<(?:icon|class icon):\s*(\d+)>/i);
            if (m) return parseInt(m[1], 10);
        }
        var cid = cls.id;
        // Fighter
        if (cid === 1) return 96;
        if (cid === 2) return 99;
        if (cid === 3) return 128;
        if (cid === 4) return 104;
        if (cid === 5) return 96;
        if (cid === 6) return 128;
        if (cid === 7) return 104;
        if (cid === 8) return 99;
        if (cid === 9) return 101;
        if (cid === 10) return 96;
        if (cid === 11) return 104;
        if (cid === 12) return 99;
        if (cid === 13) return 135;
        if (cid === 14) return 128;
        if (cid === 15) return 104;
        if (cid === 16) return 101;
        // Apprentice
        if (cid === 17) return 100;
        if (cid === 18) return 64;
        if (cid === 19) return 72;
        if (cid === 20) return 71;
        if (cid === 21) return 65;
        if (cid === 22) return 73;
        if (cid === 23) return 80;
        if (cid >= 24 && cid <= 31) return 66;
        if (cid === 32) return 74;
        if (cid === 33) return 80;
        if (cid === 34) return 79;
        if (cid === 35) return 74;
        if (cid === 36) return 71;
        if (cid === 37) return 68;
        if (cid === 38) return 64;
        // Scout
        if (cid === 39) return 102;
        if (cid === 40) return 102;
        if (cid === 41) return 97;
        if (cid === 42) return 102;
        if (cid === 43) return 97;
        if (cid === 44) return 102;
        if (cid === 45) return 97;
        if (cid === 46) return 110;
        if (cid === 47) return 97;
        if (cid === 48) return 102;
        // Tier 6
        if (cid === 49) return 144;
        if (cid === 50) return 80;
        return 76;
    }

    function getClassParamTraits(cls) {
        if (!cls || !cls.traits) return [];
        var res = [];
        var traits = cls.traits;
        var pnames = [
            TextManager.param(0) || 'Max HP',
            TextManager.param(1) || 'Max MP',
            TextManager.param(2) || 'Attack',
            TextManager.param(3) || 'Defense',
            TextManager.param(4) || 'M.Attack',
            TextManager.param(5) || 'M.Defense',
            TextManager.param(6) || 'Agility',
            TextManager.param(7) || 'Luck'
        ];
        var xnames = [
            'Hit Rate', 'Evasion Rate', 'Critical Rate', 'Critical Evade',
            'Magic Evade', 'Magic Reflect', 'Counter Attack',
            'HP Regen', 'MP Regen', 'TP Regen'
        ];
        var snames = [
            'Target Rate', 'Guard Effect', 'Recovery Effect', 'Pharmacology',
            'MP Cost', 'TP Charge Rate', 'Phys Dmg Taken',
            'Mag Dmg Taken', 'Floor Damage', 'EXP Rate'
        ];

        for (var i = 0; i < traits.length; i++) {
            var tr = traits[i];
            if (tr.code === 21) {
                var pname = pnames[tr.dataId] || ('Param ' + tr.dataId);
                var prate = Math.round((tr.value - 1) * 100);
                if (prate !== 0) {
                    res.push({
                        name: pname,
                        text: (prate > 0 ? '+' : '') + prate + '%',
                        isPositive: prate > 0
                    });
                }
            } else if (tr.code === 22) {
                var xname = xnames[tr.dataId] || ('XParam ' + tr.dataId);
                if (tr.dataId === 0) {
                    var hrate = Math.round(tr.value * 100);
                    res.push({
                        name: xname,
                        text: hrate + '%',
                        isPositive: hrate >= 95
                    });
                } else {
                    var xval = Math.round(tr.value * 100);
                    if (xval !== 0) {
                        res.push({
                            name: xname,
                            text: (xval > 0 ? '+' : '') + xval + '%',
                            isPositive: xval > 0
                        });
                    }
                }
            } else if (tr.code === 23) {
                var sname = snames[tr.dataId] || ('SParam ' + tr.dataId);
                var did = tr.dataId;
                var srate = Math.round((tr.value - 1) * 100);
                if (srate !== 0) {
                    var isPos = (did === 4 || did === 6 || did === 7 || did === 8) ? (srate < 0) : (srate > 0);
                    res.push({
                        name: sname,
                        text: (srate > 0 ? '+' : '') + srate + '%',
                        isPositive: isPos
                    });
                }
            }
        }
        return res;
    }

    function getClassDescription(cls) {
        if (!cls || !cls.note) return '';
        var m = cls.note.match(/<Class Description>([\s\S]*?)<\/Class Description>/i);
        return m ? m[1].trim() : '';
    }

    function Window_StatusClassTree() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusClassTree.prototype = Object.create(Window_Selectable.prototype);
    Window_StatusClassTree.prototype.constructor = Window_StatusClassTree;

    Window_StatusClassTree.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._selectedIndex = 0;
        this._nodes = [];
        this.deactivate();
        this.refresh();
    };

    Window_StatusClassTree.prototype.standardPadding = function() {
        return 12;
    };

    Window_StatusClassTree.prototype.maxItems = function() {
        return this._nodes ? this._nodes.length : 0;
    };

    Window_StatusClassTree.prototype.index = function() {
        return this._selectedIndex;
    };

    Window_StatusClassTree.prototype.currentNode = function() {
        if (!this._nodes || this._nodes.length === 0) return null;
        return this._nodes[this._selectedIndex] || null;
    };

    Window_StatusClassTree.prototype.isCursorMovable = function() {
        return this.isOpenAndActive();
    };

    Window_StatusClassTree.prototype.isCurrentItemEnabled = function() {
        var node = this.currentNode();
        if (!node || !node.cls || !this._actor) return false;
        if (node.classId === this._actor._classId) return false;
        if (typeof this._actor.nusvCanChangeClass === 'function') {
            return this._actor.nusvCanChangeClass(node.classId);
        }
        if (typeof this._actor.nusvIsClassUnlocked === 'function') {
            return this._actor.nusvIsClassUnlocked(node.classId);
        }
        return false;
    };

    Window_StatusClassTree.prototype.processOk = function() {
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.updateInputData();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }
    };

    Window_StatusClassTree.prototype.select = function(index) {
        if (index < 0 || (this._nodes && index >= this._nodes.length)) return;
        this._index = index;
        if (this._selectedIndex !== index) {
            this._selectedIndex = index;
            this.refresh();
        }
    };

    Window_StatusClassTree.prototype.activate = function() {
        Window_Selectable.prototype.activate.call(this);
        this.refresh();
    };

    Window_StatusClassTree.prototype.deactivate = function() {
        Window_Selectable.prototype.deactivate.call(this);
        this.refresh();
    };

    Window_StatusClassTree.prototype.setActor = function(actor, force) {
        var classChanged = actor && this._lastClassId !== actor._classId;
        if (this._actor !== actor || classChanged || force) {
            this._actor = actor;
            this._lastClassId = actor ? actor._classId : 0;
            this.buildTree();
            this.refresh();
        }
    };

    Window_StatusClassTree.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };

    Window_StatusClassTree.prototype.buildTree = function() {
        this._nodes = [];
        if (!this._actor) return;

        var currentClassId = this._actor._classId;
        var W = this.contents ? this.contents.width : (this.width - this.standardPadding() * 2);

        // Find lineage ancestors of active class
        var ancestors = [];
        var p = getClassParentId($dataClasses[currentClassId]);
        var visited = {};
        while (p > 0 && !visited[p]) {
            visited[p] = true;
            ancestors.push(p);
            p = getClassParentId($dataClasses[p]);
        }
        var rootId = ancestors.length > 0 ? ancestors[ancestors.length - 1] : currentClassId;

        // Coordinates configuration
        var colX3 = [ Math.floor(W * 0.20), Math.floor(W * 0.50), Math.floor(W * 0.80) ];
        var colX2 = [ Math.floor(W * 0.32), Math.floor(W * 0.68) ];
        var tierY = [ 46, 134, 222, 310, 398 ];

        var rawList = [];

        if (rootId === 39) {
            // Scout Track (2 columns)
            rawList = [
                // Tier 1
                { classId: 39, tier: 1, cx: Math.floor(W * 0.50), cy: tierY[0], parentId: 0 },
                // Tier 2
                { classId: 40, tier: 2, cx: colX2[0], cy: tierY[1], parentId: 39 },
                { classId: 41, tier: 2, cx: colX2[1], cy: tierY[1], parentId: 39 },
                // Tier 3
                { classId: 42, tier: 3, cx: colX2[0], cy: tierY[2], parentId: 40 },
                { classId: 43, tier: 3, cx: colX2[1], cy: tierY[2], parentId: 41 },
                // Tier 4
                { classId: 44, tier: 4, cx: colX2[0], cy: tierY[3], parentId: 42 },
                { classId: 45, tier: 4, cx: colX2[1], cy: tierY[3], parentId: 43 },
                // Tier 5
                { classId: (currentClassId === 46 ? 46 : 48), tier: 5, cx: colX2[0], cy: tierY[4], parentId: 44 },
                { classId: 47, tier: 5, cx: colX2[1], cy: tierY[4], parentId: 45 }
            ];
        } else if (rootId === 1) {
            // Fighter Track (3 columns)
            var t4Col1 = (currentClassId === 9 || currentClassId === 16) ? 9 : 10;
            var t5Col1 = (currentClassId === 9 || currentClassId === 16) ? 16 :
                         (currentClassId === 13 ? 13 : 14);

            rawList = [
                // Tier 1
                { classId: 1, tier: 1, cx: colX3[1], cy: tierY[0], parentId: 0 },
                // Tier 2
                { classId: 2, tier: 2, cx: colX3[0], cy: tierY[1], parentId: 1 },
                { classId: 3, tier: 2, cx: colX3[1], cy: tierY[1], parentId: 1 },
                { classId: 4, tier: 2, cx: colX3[2], cy: tierY[1], parentId: 1 },
                // Tier 3
                { classId: 5, tier: 3, cx: colX3[0], cy: tierY[2], parentId: 2 },
                { classId: 6, tier: 3, cx: colX3[1], cy: tierY[2], parentId: 3 },
                { classId: 7, tier: 3, cx: colX3[2], cy: tierY[2], parentId: 4 },
                // Tier 4
                { classId: 8, tier: 4, cx: colX3[0], cy: tierY[3], parentId: 5 },
                { classId: t4Col1, tier: 4, cx: colX3[1], cy: tierY[3], parentId: 6 },
                { classId: 11, tier: 4, cx: colX3[2], cy: tierY[3], parentId: 7 },
                // Tier 5
                { classId: 12, tier: 5, cx: colX3[0], cy: tierY[4], parentId: 8 },
                { classId: t5Col1, tier: 5, cx: colX3[1], cy: tierY[4], parentId: t4Col1 },
                { classId: 15, tier: 5, cx: colX3[2], cy: tierY[4], parentId: 11 }
            ];
        } else {
            // Apprentice Track (3 columns)
            var t4Col0 = (currentClassId >= 24 && currentClassId <= 31) ? currentClassId : 24;

            rawList = [
                // Tier 1
                { classId: 17, tier: 1, cx: colX3[1], cy: tierY[0], parentId: 0 },
                // Tier 2
                { classId: 18, tier: 2, cx: colX3[0], cy: tierY[1], parentId: 17 },
                { classId: 19, tier: 2, cx: colX3[1], cy: tierY[1], parentId: 17 },
                { classId: 20, tier: 2, cx: colX3[2], cy: tierY[1], parentId: 17 },
                // Tier 3
                { classId: 21, tier: 3, cx: colX3[0], cy: tierY[2], parentId: 18 },
                { classId: 22, tier: 3, cx: colX3[1], cy: tierY[2], parentId: 19 },
                { classId: 23, tier: 3, cx: colX3[2], cy: tierY[2], parentId: 20 },
                // Tier 4
                { classId: t4Col0, tier: 4, cx: colX3[0], cy: tierY[3], parentId: 21 },
                { classId: 32, tier: 4, cx: colX3[1], cy: tierY[3], parentId: 22 },
                { classId: 33, tier: 4, cx: colX3[2], cy: tierY[3], parentId: 23 },
                // Tier 5
                { classId: 34, tier: 5, cx: colX3[0], cy: tierY[4], parentId: t4Col0 },
                { classId: 35, tier: 5, cx: colX3[1], cy: tierY[4], parentId: 32 },
                { classId: 36, tier: 5, cx: colX3[2], cy: tierY[4], parentId: 33 }
            ];
        }

        // Convert to nodes with status and parent references
        var nodes = [];
        var curIdx = 0;

        for (var i = 0; i < rawList.length; i++) {
            var raw = rawList[i];
            var cls = $dataClasses[raw.classId];
            if (!cls) continue;

            var isCur = (raw.classId === currentClassId);
            var isUnlocked = false;
            if (typeof this._actor.nusvIsClassUnlocked === 'function') {
                isUnlocked = this._actor.nusvIsClassUnlocked(raw.classId);
            } else {
                isUnlocked = (ancestors.indexOf(raw.classId) !== -1);
            }
            var canChange = false;
            if (typeof this._actor.nusvCanChangeClass === 'function') {
                canChange = this._actor.nusvCanChangeClass(raw.classId);
            }

            var status = 'locked';
            var levelText = 'Locked';

            var parentId = (raw.tier > 1 ? (getClassParentId(cls) || raw.parentId) : 0);

            if (isCur) {
                status = 'current';
                levelText = 'Lv ' + this._actor.level;
                curIdx = nodes.length;
            } else if (isUnlocked) {
                status = 'mastered';
                levelText = 'Max Level';
            } else if (canChange) {
                status = 'available';
                levelText = 'Available';
            } else if (parentId === currentClassId || (typeof this._actor.nusvIsClassUnlocked === 'function' && this._actor.nusvIsClassUnlocked(parentId))) {
                status = 'next';
                levelText = 'Next Adv.';
            }

            nodes.push({
                index: nodes.length,
                classId: raw.classId,
                cls: cls,
                tier: raw.tier,
                cx: raw.cx,
                cy: raw.cy,
                parentId: parentId,
                parentIndex: -1,
                status: status,
                levelText: levelText
            });
        }

        // Link parentIndex
        for (var n = 0; n < nodes.length; n++) {
            if (nodes[n].parentId > 0) {
                for (var m = 0; m < nodes.length; m++) {
                    if (nodes[m].classId === nodes[n].parentId) {
                        nodes[n].parentIndex = m;
                        break;
                    }
                }
            }
        }

        this._nodes = nodes;
        this._selectedIndex = curIdx;
    };

    Window_StatusClassTree.prototype.drawHexagon = function(cx, cy, radius, fillStyle, strokeStyle, lineWidth) {
        var ctx = this.contents._context;
        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle = -Math.PI / 2 + (i * Math.PI / 3);
            var x = cx + radius * Math.cos(angle);
            var y = cy + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth || 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    Window_StatusClassTree.prototype.drawConnectingLines = function() {
        var ctx = this.contents._context;
        var r = 21;

        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            if (node.parentIndex < 0) continue;
            var parent = this._nodes[node.parentIndex];

            var isLit = (parent.status === 'mastered' || parent.status === 'current') &&
                        (node.status === 'mastered' || node.status === 'current');
            var isSemiLit = (parent.status === 'mastered' || parent.status === 'current');

            ctx.save();
            if (isLit) {
                ctx.strokeStyle = 'rgba(180, 220, 50, 0.85)';
                ctx.lineWidth = 2.5;
            } else if (isSemiLit) {
                ctx.strokeStyle = 'rgba(80, 160, 240, 0.65)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = 'rgba(60, 80, 110, 0.4)';
                ctx.lineWidth = 1.5;
            }

            ctx.beginPath();
            var px = parent.cx;
            var py = parent.cy + r;
            var cx = node.cx;
            var cy = node.cy - r;

            if (px === cx) {
                ctx.moveTo(px, py);
                ctx.lineTo(cx, cy);
            } else {
                var midY = Math.floor((py + cy) / 2);
                ctx.moveTo(px, py);
                ctx.lineTo(px, midY);
                ctx.lineTo(cx, midY);
                ctx.lineTo(cx, cy);
            }
            ctx.stroke();
            ctx.restore();
        }
    };

    Window_StatusClassTree.prototype.drawNodes = function() {
        var r = 20;

        for (var i = 0; i < this._nodes.length; i++) {
            var node = this._nodes[i];
            var isSelected = (i === this._selectedIndex);
            var isCur = (node.status === 'current');
            var isMast = (node.status === 'mastered');
            var isAvail = (node.status === 'available' || node.status === 'next');

            // 1. Outer Hexagon
            var fillStyle = 'rgba(20, 25, 35, 0.7)';
            var strokeStyle = 'rgba(80, 100, 130, 0.4)';
            var lineWidth = 1;

            if (isCur) {
                fillStyle = 'rgba(20, 60, 100, 0.85)';
                strokeStyle = 'rgba(60, 200, 255, 0.95)';
                lineWidth = 2;
            } else if (isMast) {
                fillStyle = 'rgba(45, 75, 20, 0.8)';
                strokeStyle = 'rgba(180, 220, 50, 0.9)';
                lineWidth = 2;
            } else if (isAvail) {
                fillStyle = 'rgba(25, 45, 80, 0.7)';
                strokeStyle = 'rgba(120, 180, 255, 0.75)';
                lineWidth = 1.5;
            }

            // Outer Selection Glow when window active
            if (isSelected && this.active) {
                this.drawHexagon(node.cx, node.cy, r + 5, null, 'rgba(255, 170, 30, 0.4)', 4);
                this.drawHexagon(node.cx, node.cy, r + 3, null, 'rgba(255, 210, 50, 0.95)', 2.5);
            }

            // Main Hexagon
            this.drawHexagon(node.cx, node.cy, r, fillStyle, strokeStyle, lineWidth);

            // 2. Icon (centered in 40x40 area around cx, cy)
            var iconIndex = getClassIconIndex(node.cls);
            var ix = node.cx - 16;
            var iy = node.cy - 16;
            this.contents.paintOpacity = (node.status === 'locked') ? 130 : 255;
            this.drawIcon(iconIndex, ix, iy);
            this.contents.paintOpacity = 255;

            // 3. Class Name below node
            this.contents.fontSize = 11;
            var nameColor = this.normalColor();
            if (isCur) nameColor = this.normalColor();
            else if (isMast) nameColor = this.powerUpColor();
            else if (isAvail) nameColor = this.systemColor();
            else nameColor = this.textColor(7);

            this.changeTextColor(nameColor);
            var rawName = node.cls.name;
            if (rawName.indexOf(' - ') !== -1) {
                rawName = rawName.split(' - ')[1];
            }
            this.contents.drawText(rawName, node.cx - 44, node.cy + 22, 88, 14, 'center');

            // 4. Class Level / Status below name
            this.contents.fontSize = 10;
            var lvlColor = this.textColor(7);
            if (isCur) lvlColor = this.textColor(14); // Cyan
            else if (isMast) lvlColor = this.powerUpColor(); // Gold/Green
            else if (isAvail) lvlColor = this.systemColor();

            this.changeTextColor(lvlColor);
            this.contents.drawText(node.levelText, node.cx - 44, node.cy + 36, 88, 12, 'center');
            this.resetFontSettings();
        }
        this.contents._setDirty();
    };

    Window_StatusClassTree.prototype.drawDetailCard = function() {
        var node = this._nodes[this._selectedIndex];
        if (!node || !node.cls) return;

        var W = this.contents.width;
        var cardX = 8;
        var cardY = 460;
        var cardW = W - 16;
        var cardH = this.contents.height - cardY - 6;

        // Container background & border
        this.contents.fillRect(cardX, cardY, cardW, cardH, 'rgba(10, 20, 42, 0.88)');
        var ctx = this.contents._context;
        ctx.save();
        ctx.strokeStyle = 'rgba(70, 130, 210, 0.45)';
        ctx.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);
        ctx.restore();

        // Icon badge on left
        this.drawHexagon(cardX + 28, cardY + 28, 20, 'rgba(25, 45, 80, 0.8)', 'rgba(80, 160, 240, 0.7)', 1.5);
        var iconIndex = getClassIconIndex(node.cls);
        this.drawIcon(iconIndex, cardX + 12, cardY + 12);

        // Right Action Pill
        var btnW = 120;
        var btnH = 26;
        var btnX = cardX + cardW - btnW - 12;
        var btnY = cardY + 12;

        var canChange = false;
        if (this._actor) {
            if (typeof this._actor.nusvCanChangeClass === 'function') {
                canChange = this._actor.nusvCanChangeClass(node.classId);
            } else if (typeof this._actor.nusvIsClassUnlocked === 'function') {
                canChange = this._actor.nusvIsClassUnlocked(node.classId);
            }
        }

        if (node.status === 'current') {
            this.contents.fillRect(btnX, btnY, btnW, btnH, 'rgba(20, 60, 100, 0.7)');
            ctx.save();
            ctx.strokeStyle = 'rgba(60, 200, 255, 0.85)';
            ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnW - 1, btnH - 1);
            ctx.restore();
            this.contents.fontSize = 11;
            this.changeTextColor(this.textColor(14));
            this.contents.drawText('[ ACTIVE CLASS ]', btnX, btnY + 5, btnW, 16, 'center');
        } else if (canChange) {
            var isMastered = (node.status === 'mastered');
            var btnFill = isMastered ? 'rgba(35, 75, 20, 0.85)' : 'rgba(20, 80, 110, 0.85)';
            var btnStroke = isMastered ? 'rgba(180, 220, 50, 0.95)' : 'rgba(60, 220, 255, 0.95)';
            var btnText = isMastered ? 'ENTER: SWITCH' : 'ENTER: ADVANCE';

            this.contents.fillRect(btnX, btnY, btnW, btnH, btnFill);
            ctx.save();
            ctx.strokeStyle = btnStroke;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnW - 1, btnH - 1);
            ctx.restore();
            this.contents.fontSize = 11;
            this.changeTextColor(this.normalColor());
            this.contents.drawText(btnText, btnX, btnY + 5, btnW, 16, 'center');
        } else {
            this.contents.fillRect(btnX, btnY, btnW, btnH, 'rgba(30, 35, 45, 0.6)');
            ctx.save();
            ctx.strokeStyle = 'rgba(70, 80, 100, 0.4)';
            ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnW - 1, btnH - 1);
            ctx.restore();
            this.contents.fontSize = 11;
            this.changeTextColor(this.textColor(7));
            this.contents.drawText('[ LOCKED ]', btnX, btnY + 5, btnW, 16, 'center');
        }

        // Class Name & Tier
        this.contents.fontSize = 16;
        this.changeTextColor(this.normalColor());
        this.contents.drawText(node.cls.name, cardX + 56, cardY + 8, cardW - 64 - btnW - 10, 20, 'left');

        this.contents.fontSize = 11;
        this.changeTextColor(this.systemColor());
        var statusLabel = 'Tier ' + node.tier;
        if (node.status === 'current') statusLabel += ' • Active Class';
        else if (node.status === 'mastered') statusLabel += ' • Mastered';
        else if (node.status === 'available') statusLabel += ' • Available';
        else if (node.status === 'next') statusLabel += ' • Next Advancement';
        else statusLabel += ' • Locked';
        this.contents.drawText(statusLabel, cardX + 56, cardY + 30, cardW - 64 - btnW - 10, 16, 'left');

        // Divider
        this.contents.fillRect(cardX + 8, cardY + 54, cardW - 16, 1, 'rgba(255, 255, 255, 0.15)');

        // Header: Stat Traits
        this.contents.fontSize = 12;
        this.changeTextColor(this.systemColor());
        this.contents.drawText('PARAMETER TRAIT BONUSES', cardX + 10, cardY + 58, cardW - 20, 16, 'left');

        // Parameter Traits
        var traits = getClassParamTraits(node.cls);
        var lineY = cardY + 76;

        if (traits.length === 0) {
            this.changeTextColor(this.textColor(7));
            this.contents.fontSize = 11;
            this.contents.drawText('No parameter bonus traits in this class.', cardX + 10, lineY, cardW - 20, 16, 'left');
            lineY += 20;
        } else {
            this.contents.fontSize = 12;
            for (var t = 0; t < Math.min(traits.length, 5); t++) {
                var tr = traits[t];
                this.changeTextColor(this.systemColor());
                this.contents.drawText(tr.name, cardX + 12, lineY, cardW - 90, 16, 'left');
                this.changeTextColor(tr.isPositive ? this.powerUpColor() : this.powerDownColor());
                this.contents.drawText(tr.text, cardX + 12, lineY, cardW - 24, 16, 'right');
                lineY += 17;
            }
        }

        // Class Description if space permits
        var desc = getClassDescription(node.cls);
        if (desc && lineY < cardY + cardH - 32) {
            this.contents.fillRect(cardX + 8, lineY + 3, cardW - 16, 1, 'rgba(255, 255, 255, 0.10)');
            lineY += 8;
            this.contents.fontSize = 11;
            this.changeTextColor(this.normalColor());
            var lines = wrapText(desc, cardW - 24, this.textWidth.bind(this));
            for (var l = 0; l < Math.min(lines.length, 3); l++) {
                if (lineY + 14 > cardY + cardH) break;
                this.contents.drawText(lines[l], cardX + 12, lineY, cardW - 24, 14, 'left');
                lineY += 14;
            }
        }

        this.resetFontSettings();
    };

    Window_StatusClassTree.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this.resetFontSettings();
        if (!this._actor) return;

        if (!this._nodes || this._nodes.length === 0) {
            this.buildTree();
        }

        var W = this.contents.width;

        // Title
        this.contents.fontSize = 16;
        this.changeTextColor(this.systemColor());
        this.contents.drawText('JOB ADVANCEMENT TREE', 0, 4, W, 18, 'center');
        this.resetFontSettings();

        // 1. Connecting Lines
        this.drawConnectingLines();

        // 2. Nodes
        this.drawNodes();

        // 3. Detail Card
        this.drawDetailCard();
    };

    Window_StatusClassTree.prototype.hitTestNode = function(x, y) {
        if (!this._nodes) return -1;
        var r = 24;
        for (var i = 0; i < this._nodes.length; i++) {
            var n = this._nodes[i];
            var dx = x - n.cx;
            var dy = y - n.cy;
            if (dx * dx + dy * dy <= r * r) {
                return i;
            }
        }
        return -1;
    };

    Window_StatusClassTree.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        if (this.isOpenAndActive() && TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hit = this.hitTestNode(x, y);
            if (hit >= 0) {
                if (this._selectedIndex === hit) {
                    this.processOk();
                } else {
                    this.select(hit);
                    SoundManager.playCursor();
                }
            }
        }
    };

    Window_StatusClassTree.prototype.cursorDown = function(wrap) {
        if (!this._nodes || this._nodes.length === 0) return;
        var cur = this._nodes[this._selectedIndex];
        if (!cur) return;

        var nextTierNodes = this._nodes.filter(function(n) { return n.tier === cur.tier + 1; });
        var targetIndex = -1;

        if (nextTierNodes.length > 0) {
            nextTierNodes.sort(function(a, b) {
                return Math.abs(a.cx - cur.cx) - Math.abs(b.cx - cur.cx);
            });
            targetIndex = nextTierNodes[0].index;
        } else if (wrap) {
            targetIndex = 0;
        }

        if (targetIndex >= 0 && targetIndex !== this._selectedIndex) {
            this.select(targetIndex);
            SoundManager.playCursor();
        }
    };

    Window_StatusClassTree.prototype.cursorUp = function(wrap) {
        if (!this._nodes || this._nodes.length === 0) return;
        var cur = this._nodes[this._selectedIndex];
        if (!cur) return;

        var prevTierNodes = this._nodes.filter(function(n) { return n.tier === cur.tier - 1; });
        var targetIndex = -1;

        if (prevTierNodes.length > 0) {
            prevTierNodes.sort(function(a, b) {
                return Math.abs(a.cx - cur.cx) - Math.abs(b.cx - cur.cx);
            });
            targetIndex = prevTierNodes[0].index;
        } else if (wrap) {
            var maxTier = 1;
            this._nodes.forEach(function(n) { if (n.tier > maxTier) maxTier = n.tier; });
            var lastTierNodes = this._nodes.filter(function(n) { return n.tier === maxTier; });
            if (lastTierNodes.length > 0) {
                lastTierNodes.sort(function(a, b) {
                    return Math.abs(a.cx - cur.cx) - Math.abs(b.cx - cur.cx);
                });
                targetIndex = lastTierNodes[0].index;
            }
        }

        if (targetIndex >= 0 && targetIndex !== this._selectedIndex) {
            this.select(targetIndex);
            SoundManager.playCursor();
        }
    };

    Window_StatusClassTree.prototype.cursorRight = function(wrap) {
        if (!this._nodes || this._nodes.length === 0) return;
        var cur = this._nodes[this._selectedIndex];
        if (!cur) return;

        var sameTier = this._nodes.filter(function(n) { return n.tier === cur.tier; });
        var rightNodes = sameTier.filter(function(n) { return n.cx > cur.cx + 5; });
        rightNodes.sort(function(a, b) { return a.cx - b.cx; });

        var targetIndex = -1;
        if (rightNodes.length > 0) {
            targetIndex = rightNodes[0].index;
        } else if (wrap && sameTier.length > 1) {
            sameTier.sort(function(a, b) { return a.cx - b.cx; });
            targetIndex = sameTier[0].index;
        }

        if (targetIndex >= 0 && targetIndex !== this._selectedIndex) {
            this.select(targetIndex);
            SoundManager.playCursor();
        }
    };

    Window_StatusClassTree.prototype.cursorLeft = function(wrap) {
        if (!this._nodes || this._nodes.length === 0) return;
        var cur = this._nodes[this._selectedIndex];
        if (!cur) return;

        var sameTier = this._nodes.filter(function(n) { return n.tier === cur.tier; });
        var leftNodes = sameTier.filter(function(n) { return n.cx < cur.cx - 5; });
        leftNodes.sort(function(a, b) { return b.cx - a.cx; });

        var targetIndex = -1;
        if (leftNodes.length > 0) {
            targetIndex = leftNodes[0].index;
        } else if (wrap && sameTier.length > 1) {
            sameTier.sort(function(a, b) { return b.cx - a.cx; });
            targetIndex = sameTier[0].index;
        }

        if (targetIndex >= 0 && targetIndex !== this._selectedIndex) {
            this.select(targetIndex);
            SoundManager.playCursor();
        }
    };

    // -------------------------------------------------------------------------
    // Window_StatusClassConfirm
    // -------------------------------------------------------------------------

    function Window_StatusClassConfirm() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusClassConfirm.prototype = Object.create(Window_Command.prototype);
    Window_StatusClassConfirm.prototype.constructor = Window_StatusClassConfirm;

    Window_StatusClassConfirm.prototype.initialize = function() {
        this._actor = null;
        this._targetClass = null;
        this._className = '';
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = Math.floor((Graphics.boxWidth - width) / 2);
        var y = Math.floor((Graphics.boxHeight - height) / 2);
        Window_Command.prototype.initialize.call(this, x, y);
        this.openness = 0;
        this.deactivate();
    };

    Window_StatusClassConfirm.prototype.windowWidth = function() {
        return 480;
    };

    Window_StatusClassConfirm.prototype.windowHeight = function() {
        return 280;
    };

    Window_StatusClassConfirm.prototype.maxCols = function() {
        return 2;
    };

    Window_StatusClassConfirm.prototype.numVisibleRows = function() {
        return 1;
    };

    Window_StatusClassConfirm.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_StatusClassConfirm.prototype.makeCommandList = function() {
        this.addCommand('Ya', 'yes');
        this.addCommand('Tidak', 'no');
    };

    Window_StatusClassConfirm.prototype.setup = function(actor, cls) {
        this._actor = actor;
        this._targetClass = cls;
        var name = cls && cls.name ? String(cls.name) : '';
        if (name.indexOf(' - ') !== -1) {
            name = name.split(' - ')[1];
        }
        this._className = name;
        this.refresh();
        this.select(0);
    };

    Window_StatusClassConfirm.prototype.setTargetClass = function(cls, actor) {
        this.setup(actor || this._actor, cls);
    };

    Window_StatusClassConfirm.prototype.itemRect = function(index) {
        var rect = Window_Command.prototype.itemRect.call(this, index);
        rect.y += 200;
        return rect;
    };

    Window_StatusClassConfirm.prototype.drawHeader = function() {
        var W = this.contents.width;
        var iconIndex = getClassIconIndex(this._targetClass);
        var title = 'Ubah Class: ' + this._className;

        this.contents.fontSize = 16;
        this.changeTextColor(this.systemColor());
        var textW = this.textWidth(title);
        var totalW = 32 + 8 + textW;
        var startX = Math.max(8, Math.floor((W - totalW) / 2));

        this.drawIcon(iconIndex, startX, 2);
        this.drawText(title, startX + 38, 5, textW + 10, 'left');
        this.resetFontSettings();

        // Divider below header
        this.contents.fillRect(8, 38, W - 16, 1, 'rgba(255, 255, 255, 0.15)');
        // Divider above buttons
        this.contents.fillRect(8, 194, W - 16, 1, 'rgba(255, 255, 255, 0.15)');
    };

    Window_StatusClassConfirm.prototype.drawStatComparisons = function() {
        if (!this._actor || !this._targetClass) return;

        var W = this.contents.width;
        var startY = 44;
        var rowH = 24;
        var blockW = 380;
        var startX = Math.max(10, Math.floor((W - blockW) / 2));

        var nameW = 120;
        var curX = startX + 120;
        var curW = 55;
        var arrowX = curX + curW + 5;
        var arrowW = 30;
        var nextX = arrowX + arrowW + 5;
        var nextW = 55;
        var diffX = nextX + nextW + 8;
        var diffW = 80;

        for (var p = 2; p <= 7; p++) {
            var rowY = startY + (p - 2) * rowH;

            // Subtle zebra striping
            if ((p - 2) % 2 === 0) {
                this.contents.fillRect(startX - 6, rowY, blockW + 12, rowH, 'rgba(255, 255, 255, 0.04)');
            }

            var curVal = this._actor.param(p);
            var oldClassId = this._actor._classId;
            this._actor._classId = this._targetClass.id;
            var nextVal = this._actor.param(p);
            this._actor._classId = oldClassId;
            var diff = nextVal - curVal;

            this.contents.fontSize = 13;

            // 1. Param Name
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(p), startX, rowY + 1, nameW, 'left');

            // 2. Current Param Value
            this.changeTextColor(this.normalColor());
            this.drawText(curVal, curX, rowY + 1, curW, 'right');

            // 3. Arrow
            this.changeTextColor(this.textColor(7));
            this.drawText('\u2192', arrowX, rowY + 1, arrowW, 'center');

            // 4. New Param Value
            if (diff > 0) {
                this.changeTextColor(this.powerUpColor());
            } else if (diff < 0) {
                this.changeTextColor(this.powerDownColor());
            } else {
                this.changeTextColor(this.normalColor());
            }
            this.drawText(nextVal, nextX, rowY + 1, nextW, 'right');

            // 5. Difference (+X) or (-X)
            if (diff > 0) {
                this.changeTextColor(this.powerUpColor());
                this.drawText('(+' + diff + ')', diffX, rowY + 1, diffW, 'right');
            } else if (diff < 0) {
                this.changeTextColor(this.powerDownColor());
                this.drawText('(' + diff + ')', diffX, rowY + 1, diffW, 'right');
            } else {
                this.changeTextColor(this.textColor(7));
                this.drawText('( 0 )', diffX, rowY + 1, diffW, 'right');
            }
        }
        this.resetFontSettings();
    };

    Window_StatusClassConfirm.prototype.refresh = function() {
        Window_Command.prototype.refresh.call(this);
        if (this.contents && this._targetClass && this._actor) {
            this.drawHeader();
            this.drawStatComparisons();
        }
    };

    // -------------------------------------------------------------------------
    // Skill Notetag Helpers
    // -------------------------------------------------------------------------

    function getSkillDescription(skill) {
        if (!skill) return '';
        var note = skill.note || '';
        var m = note.match(/<Skill (?:Description|Desc)>([\s\S]*?)<\/Skill (?:Description|Desc)>/i);
        if (m) return m[1].trim();
        m = note.match(/<(?:Skill )?(?:Description|Desc):\s*([^>]+)>/i);
        if (m) return m[1].trim();
        return skill.description ? skill.description.trim() : '';
    }

    function getSkillDamage(skill) {
        if (!skill) return '';
        var note = skill.note || '';
        var m = note.match(/<(?:Skill )?Damage>([\s\S]*?)<\/(?:Skill )?Damage>/i);
        if (m) return m[1].trim();
        m = note.match(/<(?:Skill )?Damage:\s*([^>]+)>/i);
        if (m) return m[1].trim();
        return '';
    }

    function getSkillEffect(skill) {
        if (!skill) return '';
        var note = skill.note || '';
        var m = note.match(/<(?:Skill )?Effect>([\s\S]*?)<\/(?:Skill )?Effect>/i);
        if (m) return m[1].trim();
        m = note.match(/<(?:Skill )?(?:Effect|Efek):\s*([^>]+)>/i);
        if (m) return m[1].trim();
        return '';
    }

    function getSkillElement(skill) {
        if (!skill) return '';
        var note = skill.note || '';
        var m = note.match(/<(?:Skill )?(?:Element|Elemen):\s*([^>]+)>/i);
        if (m) return m[1].trim();
        if (skill.damage) {
            var elemId = skill.damage.elementId;
            if (elemId === -1) return 'Weapon';
            if (elemId > 0 && typeof $dataSystem !== 'undefined' && $dataSystem.elements) {
                return $dataSystem.elements[elemId] || '';
            }
        }
        return '';
    }

    function getSkillCost(skill) {
        if (!skill) return '';
        var note = skill.note || '';
        var m = note.match(/<(?:Skill )?(?:Cost|Biaya):\s*([^>]+)>/i);
        if (m) return m[1].trim();

        var mp = skill.mpCost || 0;
        var sp = skill.tpCost || 0;
        var mpName = (typeof TextManager !== 'undefined' && TextManager.mpA) ? TextManager.mpA : 'MP';
        var spName = (typeof TextManager !== 'undefined' && TextManager.tpA) ? TextManager.tpA : 'SP';

        if (mp > 0 && sp > 0) return mp + ' ' + mpName + ' / ' + sp + ' ' + spName;
        if (mp > 0) return mp + ' ' + mpName;
        if (sp > 0) return sp + ' ' + spName;
        return '0 ' + mpName;
    }

    function getSkillIconIndex(skill, actor) {
        if (!skill) return 74;
        if (skill.note) {
            var m = skill.note.match(/<(?:Skill )?Icon:\s*(\d+)>/i);
            if (m) return parseInt(m[1], 10);
        }
        if (skill.iconIndex > 0) return skill.iconIndex;

        if (skill.damage && skill.damage.elementId > 0) {
            var elem = skill.damage.elementId;
            if (elem === 2) return 64;  // Fire
            if (elem === 3) return 65;  // Water
            if (elem === 4) return 66;  // Earth
            if (elem === 5) return 67;  // Air
            if (elem === 6) return 68;  // Electric
            if (elem === 7) return 69;  // Ice
            if (elem === 10) return 74; // Holy
            if (elem === 11) return 80; // Dark
        }

        var cls = actor && actor.currentClass ? actor.currentClass() : null;
        if (cls) {
            var cIcon = getClassIconIndex(cls);
            if (cIcon > 0) return cIcon;
        }
        return 74;
    }

    function isPassiveSkill(skill) {
        if (!skill) return false;
        // In RPG Maker MV, occasion 3 means "Never" (passive / cannot be selected in battle or menu)
        if (skill.occasion === 3) return true;
        var note = skill.note || '';
        if (/<(?:Passive State|Passive|Auto Passive)>/i.test(note)) return true;
        if (/<Passive State:\s*\d+/i.test(note)) return true;
        if (/\[PLUGIN\]\s*YEP_AutoPassiveStates/i.test(note)) return true;
        return false;
    }

    // -------------------------------------------------------------------------
    // Window_StatusSkillList (Right panel: Skill Cards with Lock & Unlock details)
    // -------------------------------------------------------------------------

    function Window_StatusSkillList() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusSkillList.prototype = Object.create(Window_Selectable.prototype);
    Window_StatusSkillList.prototype.constructor = Window_StatusSkillList;

    Window_StatusSkillList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._lastClassId = 0;
        this._data = [];
        this._parentScene = null;
        this.deactivate();
        this.refresh();
    };

    Window_StatusSkillList.prototype.standardPadding = function() {
        return 12;
    };

    Window_StatusSkillList.prototype.headerHeight = function() {
        return 28;
    };

    Window_StatusSkillList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_StatusSkillList.prototype.itemHeight = function() {
        return 95;
    };

    Window_StatusSkillList.prototype.maxPageRows = function() {
        var pageHeight = this.height - this.padding * 2 - this.headerHeight();
        return Math.floor(pageHeight / this.itemHeight());
    };

    Window_StatusSkillList.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
        rect.y = this.headerHeight() + Math.floor(index / maxCols) * rect.height - this._scrollY;
        return rect;
    };

    Window_StatusSkillList.prototype.drawTitle = function() {
        var W = this.contents.width;
        this.contents.fontSize = 16;
        this.changeTextColor(this.systemColor());
        var title = (TAB_SKILLS || 'Skills').toUpperCase();
        this.contents.drawText(title, 0, 4, W, 18, 'center');
        this.resetFontSettings();
    };

    Window_StatusSkillList.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this.resetFontSettings();
        this.drawTitle();
        this.drawAllItems();
    };

    Window_StatusSkillList.prototype.isCursorMovable = function() {
        return this.isOpenAndActive();
    };

    Window_StatusSkillList.prototype.select = function(index) {
        Window_Selectable.prototype.select.call(this, index);
        this.refresh();
    };

    Window_StatusSkillList.prototype.activate = function() {
        Window_Selectable.prototype.activate.call(this);
        if (this.index() < 0 && this.maxItems() > 0) {
            this.select(0);
        } else {
            this.refresh();
        }
    };

    Window_StatusSkillList.prototype.deactivate = function() {
        Window_Selectable.prototype.deactivate.call(this);
        this.refresh();
    };

    Window_StatusSkillList.prototype.setActor = function(actor, force) {
        var classChanged = actor && this._lastClassId !== actor._classId;
        if (this._actor !== actor || classChanged || force) {
            this._actor = actor;
            this._lastClassId = actor ? actor._classId : 0;
            this.buildSkills();
            this.refresh();
            if (this.index() >= this.maxItems()) {
                this.select(Math.max(0, this.maxItems() - 1));
            }
        }
    };

    Window_StatusSkillList.prototype.updateCursor = function() {
        if (this.isOpenAndActive() && this.index() >= 0) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 5);
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }
    };

    Window_StatusSkillList.prototype.cursorDown = function(wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        if (index < 0) {
            this.select(0);
            return;
        }
        if (index < maxItems - 1 || wrap) {
            this.select((index + 1) % maxItems);
        }
    };

    Window_StatusSkillList.prototype.cursorUp = function(wrap) {
        var index = this.index();
        var maxItems = this.maxItems();
        if (index < 0) {
            this.select(0);
            return;
        }
        if (index > 0 || wrap) {
            this.select((index - 1 + maxItems) % maxItems);
        }
    };

    Window_StatusSkillList.prototype.cursorPagedown = function() {
        var index = this.index();
        var maxItems = this.maxItems();
        var page = this.maxPageRows();
        this.select(Math.min(maxItems - 1, (index < 0 ? 0 : index) + page));
    };

    Window_StatusSkillList.prototype.cursorPageup = function() {
        var index = this.index();
        var page = this.maxPageRows();
        this.select(Math.max(0, (index < 0 ? 0 : index) - page));
    };

    Window_StatusSkillList.prototype.processWheel = function() {
        if (this.visible && (this.isOpenAndActive() || this.isTouchedInsideFrame())) {
            var threshold = 20;
            if (TouchInput.wheelY >= threshold) {
                this.scrollDown();
            }
            if (TouchInput.wheelY <= -threshold) {
                this.scrollUp();
            }
        }
    };

    Window_StatusSkillList.prototype.processTouch = function() {
        if (this.visible && TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            if (!this.active) {
                this.activate();
                if (this._parentScene && this._parentScene._tabsWindow) {
                    this._parentScene._tabsWindow.deactivate();
                }
            }
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hitIndex = this.hitTest(x, y);
            if (hitIndex >= 0) {
                this.select(hitIndex);
                SoundManager.playCursor();
            }
        } else {
            Window_Selectable.prototype.processTouch.call(this);
        }
    };

    Window_StatusSkillList.prototype.buildSkills = function() {
        this._data = [];
        if (!this._actor) return;

        var actor = this._actor;
        var cls = actor.currentClass ? actor.currentClass() : null;
        var learnings = (cls && cls.learnings) ? cls.learnings : [];

        var list = [];
        var seen = {};

        // 1. Process current class learnings
        learnings.forEach(function(l) {
            if (!l || !l.skillId) return;
            var skill = $dataSkills[Number(l.skillId)];
            if (!skill) return;
            if (!skill.name || skill.name.trim() === '' || skill.name.indexOf('---') !== -1) return;

            var unlockLevel = Number(l.level || 1);
            var isLearned = false;

            if (typeof actor.isLearnedSkill === 'function') {
                isLearned = actor.isLearnedSkill(skill.id);
            }
            if (!isLearned && typeof actor.hasSkill === 'function') {
                isLearned = actor.hasSkill(skill.id);
            }
            if (!isLearned && actor.level >= unlockLevel) {
                isLearned = true;
            }

            if (!seen[skill.id]) {
                seen[skill.id] = true;
                list.push({
                    skill: skill,
                    unlockLevel: unlockLevel,
                    isLearned: isLearned
                });
            } else {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].skill.id === skill.id) {
                        if (unlockLevel < list[i].unlockLevel) {
                            list[i].unlockLevel = unlockLevel;
                        }
                        if (isLearned) list[i].isLearned = true;
                        break;
                    }
                }
            }
        });

        // 2. Include any other skills the actor has
        if (typeof actor.skills === 'function') {
            actor.skills().forEach(function(skill) {
                if (!skill || skill.id <= 2) return;
                if (!skill.name || skill.name.trim() === '' || skill.name.indexOf('---') !== -1) return;

                if (!seen[skill.id]) {
                    seen[skill.id] = true;
                    list.push({
                        skill: skill,
                        unlockLevel: 1,
                        isLearned: true
                    });
                }
            });
        }

        // 3. Sort skills by unlock level ascending
        list.sort(function(a, b) {
            if (a.unlockLevel !== b.unlockLevel) {
                return a.unlockLevel - b.unlockLevel;
            }
            return a.skill.id - b.skill.id;
        });

        this._data = list;
    };

    Window_StatusSkillList.prototype.item = function() {
        var it = this._data ? this._data[this.index()] : null;
        return it ? it.skill : null;
    };

    Window_StatusSkillList.prototype.currentSkill = function() {
        return this.item();
    };

    Window_StatusSkillList.prototype.isCurrentItemLearned = function() {
        var it = this._data ? this._data[this.index()] : null;
        return it ? !!it.isLearned : false;
    };

    Window_StatusSkillList.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (!item || !item.skill) return;

        var skill = item.skill;
        var isLearned = item.isLearned;
        var isSelected = (index === this.index());
        var rect = this.itemRect(index);

        var cardX = rect.x + 2;
        var cardY = rect.y + 2;
        var cardW = rect.width - 4;
        var cardH = rect.height - 5;

        var ctx = this.contents._context;

        // 1. Card Background
        var fillStyle = isLearned ? 'rgba(15, 25, 45, 0.88)' : 'rgba(20, 22, 28, 0.85)';
        if (isSelected && this.active) {
            fillStyle = isLearned ? 'rgba(24, 48, 86, 0.96)' : 'rgba(34, 36, 48, 0.94)';
        }
        this.contents.fillRect(cardX, cardY, cardW, cardH, fillStyle);

        // 2. Card Border
        ctx.save();
        if (isSelected && this.active) {
            ctx.strokeStyle = 'rgba(255, 195, 45, 0.95)';
            ctx.lineWidth = 2;
        } else if (isLearned) {
            ctx.strokeStyle = 'rgba(65, 115, 185, 0.45)';
            ctx.lineWidth = 1;
        } else {
            ctx.strokeStyle = 'rgba(75, 75, 85, 0.35)';
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);
        ctx.restore();

        // 3. Left Icon Box (Gambar 2 styling)
        var boxX = cardX + 6;
        var boxY = cardY + 5;
        var boxW = 58;
        var boxH = cardH - 10;

        ctx.save();
        ctx.fillStyle = isLearned ? 'rgba(20, 40, 70, 0.9)' : 'rgba(25, 28, 35, 0.85)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = isLearned ? 'rgba(70, 140, 220, 0.6)' : 'rgba(70, 75, 85, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
        ctx.restore();

        // Icon with fallback so it is never blank
        var iconIdx = getSkillIconIndex(skill, this._actor);
        var ix = boxX + Math.floor((boxW - 32) / 2);
        var iy = boxY + 5;
        this.contents.paintOpacity = isLearned ? 255 : 120;
        this.drawIcon(iconIdx, ix, iy);
        this.contents.paintOpacity = 255;

        // Middle Type Badge (PASIF / AKTIF)
        var isPassive = isPassiveSkill(skill);
        var typeBadgeX = boxX + 3;
        var typeBadgeY = boxY + 39;
        var typeBadgeW = boxW - 6;
        var typeBadgeH = 15;

        ctx.save();
        if (isPassive) {
            ctx.fillStyle = isLearned ? 'rgba(65, 45, 15, 0.92)' : 'rgba(40, 30, 15, 0.85)';
            ctx.fillRect(typeBadgeX, typeBadgeY, typeBadgeW, typeBadgeH);
            ctx.strokeStyle = isLearned ? 'rgba(250, 185, 45, 0.85)' : 'rgba(160, 120, 35, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(typeBadgeX + 0.5, typeBadgeY + 0.5, typeBadgeW - 1, typeBadgeH - 1);
            ctx.restore();
            this.contents.fontSize = 10;
            this.changeTextColor(isLearned ? this.textColor(14) : this.textColor(7));
            this.contents.drawText('PASIF', typeBadgeX, typeBadgeY - 2, typeBadgeW, 18, 'center');
        } else {
            ctx.fillStyle = isLearned ? 'rgba(15, 50, 80, 0.92)' : 'rgba(20, 35, 50, 0.85)';
            ctx.fillRect(typeBadgeX, typeBadgeY, typeBadgeW, typeBadgeH);
            ctx.strokeStyle = isLearned ? 'rgba(60, 190, 245, 0.85)' : 'rgba(50, 110, 140, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(typeBadgeX + 0.5, typeBadgeY + 0.5, typeBadgeW - 1, typeBadgeH - 1);
            ctx.restore();
            this.contents.fontSize = 10;
            this.changeTextColor(isLearned ? this.textColor(4) : this.textColor(7));
            this.contents.drawText('AKTIF', typeBadgeX, typeBadgeY - 2, typeBadgeW, 18, 'center');
        }

        // Bottom Level Badge in Icon Box
        var badgeX = boxX + 3;
        var badgeY = boxY + 57;
        var badgeW = boxW - 6;
        var badgeH = 17;

        ctx.save();
        if (isLearned) {
            ctx.fillStyle = 'rgba(25, 55, 95, 0.92)';
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
            ctx.strokeStyle = 'rgba(80, 160, 255, 0.75)';
            ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW - 1, badgeH - 1);
            ctx.restore();
            this.contents.fontSize = 11;
            this.changeTextColor(this.systemColor());
            this.contents.drawText('Lv ' + item.unlockLevel, badgeX, badgeY - 1, badgeW, 18, 'center');
        } else {
            ctx.fillStyle = 'rgba(45, 25, 30, 0.92)';
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
            ctx.strokeStyle = 'rgba(220, 70, 70, 0.7)';
            ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW - 1, badgeH - 1);
            ctx.restore();
            this.contents.fontSize = 10;
            this.changeTextColor(this.textColor(7));
            this.contents.drawText('LOCK', badgeX, badgeY - 1, badgeW, 18, 'center');
        }

        // 4. Right Content Area
        var rightX = boxX + boxW + 10;
        var rightW = cardW - (boxW + 20);

        // Baris 1: Nama Skill (full width, tidak berdesakan dengan cost)
        this.contents.fontSize = 15;
        this.changeTextColor(isLearned ? this.normalColor() : this.textColor(7));
        this.contents.drawText(skill.name, rightX, cardY + 4, rightW, 20, 'left');

        if (!isLearned) {
            // Saat skill terkunci: menutupi area cost, elemen & deskripsi
            var lockBoxX = rightX;
            var lockBoxY = cardY + 26;
            var lockBoxW = rightW;
            var lockBoxH = cardH - 31;

            this.contents.fillRect(lockBoxX, lockBoxY, lockBoxW, lockBoxH, 'rgba(32, 16, 20, 0.92)');
            ctx.save();
            ctx.strokeStyle = 'rgba(215, 60, 60, 0.7)';
            ctx.lineWidth = 1;
            ctx.strokeRect(lockBoxX + 0.5, lockBoxY + 0.5, lockBoxW - 1, lockBoxH - 1);
            ctx.restore();

            var lineH = 17;
            var yOffset = lockBoxY + Math.floor((lockBoxH - lineH * 2) / 2);

            this.contents.fontSize = 11;
            this.changeTextColor(this.textColor(7));
            this.contents.drawText('🔒 Terkunci (Unlock at Level ' + item.unlockLevel + ')', lockBoxX, yOffset, lockBoxW, lineH, 'center');

            this.contents.fontSize = 10;
            if (isPassive) {
                this.changeTextColor(this.textColor(14)); // Gold
                this.contents.drawText('Tipe: Skill Pasif', lockBoxX, yOffset + lineH, lockBoxW, lineH, 'center');
            } else {
                this.changeTextColor(this.textColor(4)); // Cyan
                this.contents.drawText('Tipe: Skill Aktif (Battle)', lockBoxX, yOffset + lineH, lockBoxW, lineH, 'center');
            }
        } else {
            // Baris 2: Keterangan Pasif / Aktif (Battle) serta Cost & Elemen
            var elem = getSkillElement(skill);
            var elemPart = elem ? 'Element: ' + elem : '';

            this.contents.fontSize = 10;
            if (isPassive) {
                var tagText = 'Skill Pasif (Selalu Aktif)';
                if (elemPart && elem !== 'Neutral') {
                    tagText = 'Skill Pasif • ' + elemPart;
                }
                this.changeTextColor(this.textColor(14)); // Amber / Gold
                this.contents.drawText(tagText, rightX, cardY + 24, rightW, 18, 'left');
            } else {
                var cost = getSkillCost(skill);
                var costPart = cost ? cost.replace(/^Cost:\s*/i, '') : '0 MP';
                var tagText = 'Skill Aktif (Battle) • ' + costPart;
                if (elemPart && elem !== 'Neutral') {
                    tagText = 'Aktif (Battle) • ' + costPart + ' • ' + elem;
                }
                this.changeTextColor(this.textColor(4)); // Cyan / Light Blue
                this.contents.drawText(tagText, rightX, cardY + 24, rightW, 18, 'left');
            }

            // Baris 3 & 4: Damage / Effect Badges & Deskripsi
            var damageText = getSkillDamage(skill);
            var effectText = getSkillEffect(skill);
            var descText = getSkillDescription(skill);

            var curY = cardY + 43;
            var hasBadges = false;

            if (damageText || effectText) {
                var badgeX2 = rightX;
                if (damageText) {
                    var cleanDamage = damageText.replace(/^(?:damage|dmg)\s*:\s*/i, '');
                    var dmgLabel = 'Damage: ' + cleanDamage;
                    this.contents.fontSize = 10;
                    var dw = Math.min(120, this.textWidth(dmgLabel) + 12);
                    this.contents.fillRect(badgeX2, curY, dw, 16, 'rgba(130, 35, 30, 0.8)');
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 95, 85, 0.85)';
                    ctx.strokeRect(badgeX2 + 0.5, curY + 0.5, dw - 1, 15);
                    ctx.restore();
                    this.changeTextColor(this.powerUpColor());
                    this.contents.drawText(dmgLabel, badgeX2 + 6, curY - 2, dw - 12, 18, 'left');
                    badgeX2 += dw + 6;
                    hasBadges = true;
                }
                if (effectText) {
                    var cleanEffect = effectText.replace(/^(?:effect|efek)\s*:\s*/i, '');
                    var ew = rightW - (badgeX2 - rightX);
                    this.contents.fontSize = 10;
                    this.changeTextColor(this.systemColor());
                    this.contents.drawText('• ' + cleanEffect, badgeX2, curY - 2, ew, 18, 'left');
                    hasBadges = true;
                }
            }

            // Description lines
            if (descText) {
                var descY = hasBadges ? (cardY + 63) : (cardY + 43);
                this.contents.fontSize = 11;
                this.changeTextColor(this.normalColor());
                var lines = wrapText(descText, rightW, this.textWidth.bind(this));
                var maxLines = hasBadges ? 2 : 3;
                for (var l = 0; l < Math.min(lines.length, maxLines); l++) {
                    if (descY + (l * 15) + 13 > cardY + cardH) break;
                    this.contents.drawText(lines[l], rightX, descY + (l * 15), rightW, 15, 'left');
                }
            }
        }

        this.resetFontSettings();
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
        this._currentTabSymbol = 'status';
    };

    Scene_Status.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        if (this._statusActor) {
            this._actor = this._statusActor;
            $gameParty.setMenuActor(this._statusActor);
        }

        this.createPartyWindow();
        this.createTabsWindow();

        this._portraitWindow = new Window_StatusPortrait(
            partyWidth(), this._tabsWindow.height, centerWidth(),
            Graphics.boxHeight - this._tabsWindow.height
        );
        this.addWindow(this._portraitWindow);

        this._infoWindow = new Window_StatusInfo(
            partyWidth() + centerWidth(), 0, rightWidth(), Graphics.boxHeight
        );
        this.addWindow(this._infoWindow);

        this._equipPreviewWindow = new Window_StatusEquipPreview(
            partyWidth() + centerWidth(), 0, rightWidth(), Graphics.boxHeight
        );
        this._equipPreviewWindow.setHandler('cancel', this.onEquipPreviewCancel.bind(this));
        this._equipPreviewWindow.hide();
        this.addWindow(this._equipPreviewWindow);

        this._classTreeWindow = new Window_StatusClassTree(
            partyWidth() + centerWidth(), 0, rightWidth(), Graphics.boxHeight
        );
        this._classTreeWindow.setHandler('cancel', this.onClassTreeCancel.bind(this));
        this._classTreeWindow.setHandler('ok',     this.onClassTreeOk.bind(this));
        this._classTreeWindow.hide();
        this.addWindow(this._classTreeWindow);

        this._skillListWindow = new Window_StatusSkillList(
            partyWidth() + centerWidth(), 0, rightWidth(), Graphics.boxHeight
        );
        this._skillListWindow._parentScene = this;
        this._skillListWindow.setHandler('cancel', this.onSkillListCancel.bind(this));
        this._skillListWindow.setHandler('ok',     this.onSkillListOk.bind(this));
        this._skillListWindow.hide();
        this.addWindow(this._skillListWindow);

        // Added last so the state tooltip renders above the other windows.
        this._statePopup = new Window_StatePopup();
        this.addWindow(this._statePopup);
        this._infoWindow.setStatePopup(this._statePopup);

        this._confirmWindow = new Window_StatusClassConfirm();
        this._confirmWindow.setHandler('yes',    this.onConfirmChangeYes.bind(this));
        this._confirmWindow.setHandler('no',     this.onConfirmChangeNo.bind(this));
        this._confirmWindow.setHandler('cancel', this.onConfirmChangeNo.bind(this));
        this.addWindow(this._confirmWindow);
        this._pendingClassNode = null;

        this.refreshAll();
    };

    Scene_Status.prototype.createPartyWindow = function() {
        this._partyWindow = new Window_StatusParty(
            0, 0, partyWidth(), Graphics.boxHeight
        );
        this._partyWindow.setHandler('actorChange', this.onPartyActorChange.bind(this));
        this.addWindow(this._partyWindow);
    };

    Scene_Status.prototype.createTabsWindow = function() {
        this._tabsWindow = new Window_StatusTabs(partyWidth(), 0);
        this._tabsWindow._onSelectHandler = this.onTabChange.bind(this);
        this._tabsWindow.setHandler('status', this.onTabStatus.bind(this));
        this._tabsWindow.setHandler('equip',  this.onTabEquip.bind(this));
        this._tabsWindow.setHandler('class',  this.onTabClass.bind(this));
        this._tabsWindow.setHandler('skills', this.onTabSkills.bind(this));
        this._tabsWindow.setHandler('cancel', this.popScene.bind(this));
        this._tabsWindow.setHandler('pageup',  this.previousActor.bind(this));
        this._tabsWindow.setHandler('pagedown', this.nextActor.bind(this));
        this.addWindow(this._tabsWindow);
    };

    Scene_Status.prototype.onTabChange = function(index, symbol) {
        this.updateRightPanel();
    };

    Scene_Status.prototype.updateRightPanel = function() {
        var symbol = (this._tabsWindow && this._tabsWindow.currentSymbol()) || 'status';
        if (symbol === 'equip') {
            if (this._infoWindow) this._infoWindow.hide();
            if (this._classTreeWindow) this._classTreeWindow.hide();
            if (this._skillListWindow) this._skillListWindow.hide();
            if (this._statePopup) this._statePopup.hide();
            if (this._equipPreviewWindow) {
                this._equipPreviewWindow.show();
                this._equipPreviewWindow.refresh();
            }
        } else if (symbol === 'class') {
            if (this._infoWindow) this._infoWindow.hide();
            if (this._equipPreviewWindow) this._equipPreviewWindow.hide();
            if (this._skillListWindow) this._skillListWindow.hide();
            if (this._statePopup) this._statePopup.hide();
            if (this._classTreeWindow) {
                this._classTreeWindow.show();
                this._classTreeWindow.refresh();
            }
        } else if (symbol === 'skills') {
            if (this._infoWindow) this._infoWindow.hide();
            if (this._equipPreviewWindow) this._equipPreviewWindow.hide();
            if (this._classTreeWindow) this._classTreeWindow.hide();
            if (this._statePopup) this._statePopup.hide();
            if (this._skillListWindow) {
                this._skillListWindow.show();
                this._skillListWindow.refresh();
            }
        } else {
            if (this._equipPreviewWindow) this._equipPreviewWindow.hide();
            if (this._classTreeWindow) this._classTreeWindow.hide();
            if (this._skillListWindow) this._skillListWindow.hide();
            if (this._infoWindow) {
                this._infoWindow.show();
                this._infoWindow.refresh();
            }
        }
    };

    Scene_Status.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (!$gameParty.members().length) return;
        if (this._tabsWindow && this._tabsWindow.active) {
            if (Input.isRepeated('up')) {
                this.changePartyActor(-1);
            } else if (Input.isRepeated('down')) {
                this.changePartyActor(1);
            }
        }
    };

    Scene_Status.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        var actor = $gameParty.menuActor();
        if (actor) this._actor = actor;
        this._tabsWindow.activate();
        this._tabsWindow.select(0);
        this.refreshAll();
        this.updateRightPanel();
    };

    Scene_Status.prototype.onTabStatus = function() {
        this._tabsWindow.activate();
        this.updateRightPanel();
    };

    Scene_Status.prototype.onTabEquip = function() {
        this._tabsWindow.deactivate();
        this._equipPreviewWindow.activate();
    };

    Scene_Status.prototype.onEquipPreviewCancel = function() {
        this._equipPreviewWindow.deactivate();
        this._tabsWindow.activate();
    };

    Scene_Status.prototype.onTabClass = function() {
        this._tabsWindow.deactivate();
        this._classTreeWindow.activate();
    };

    Scene_Status.prototype.onClassTreeCancel = function() {
        this._classTreeWindow.deactivate();
        this._tabsWindow.activate();
    };

    Scene_Status.prototype.onClassTreeOk = function() {
        var node = this._classTreeWindow.currentNode();
        var actor = this.actor();
        if (!node || !node.cls || !actor) {
            SoundManager.playBuzzer();
            this._classTreeWindow.activate();
            return;
        }

        if (node.classId === actor._classId) {
            SoundManager.playBuzzer();
            this._classTreeWindow.activate();
            return;
        }

        var canChange = false;
        if (typeof actor.nusvCanChangeClass === 'function') {
            canChange = actor.nusvCanChangeClass(node.classId);
        } else if (typeof actor.nusvIsClassUnlocked === 'function') {
            canChange = actor.nusvIsClassUnlocked(node.classId);
        }

        if (!canChange) {
            SoundManager.playBuzzer();
            this._classTreeWindow.activate();
            return;
        }

        this._pendingClassNode = node;
        this._classTreeWindow.deactivate();
        this._confirmWindow.setup(actor, node.cls);
        this._confirmWindow.open();
        this._confirmWindow.activate();
    };

    Scene_Status.prototype.onConfirmChangeYes = function() {
        var node = this._pendingClassNode;
        var actor = this.actor();
        this._confirmWindow.close();
        this._confirmWindow.deactivate();
        this._pendingClassNode = null;

        if (node && actor) {
            var success = false;
            if (typeof actor.nusvChangeClass === 'function') {
                success = actor.nusvChangeClass(node.classId);
            } else {
                actor.changeClass(node.classId, true);
                success = true;
            }

            if (success) {
                SoundManager.playEquip();
                this.refreshAll();
                this._classTreeWindow.activate();
                return;
            }
        }

        SoundManager.playBuzzer();
        this._classTreeWindow.activate();
    };

    Scene_Status.prototype.onConfirmChangeNo = function() {
        this._pendingClassNode = null;
        this._confirmWindow.close();
        this._confirmWindow.deactivate();
        this._classTreeWindow.activate();
    };

    Scene_Status.prototype.onTabSkills = function() {
        this._tabsWindow.deactivate();
        this._skillListWindow.activate();
        if (this._skillListWindow.index() < 0) {
            this._skillListWindow.select(0);
        }
        SoundManager.playOk();
    };

    Scene_Status.prototype.onSkillListCancel = function() {
        this._skillListWindow.deactivate();
        this._tabsWindow.activate();
        SoundManager.playCancel();
    };

    Scene_Status.prototype.onSkillListOk = function() {
        // Untuk saat ini skill belum bisa digunakan di luar pertempuran.
        // Memutar buzzer sebagai feedback audio standar RPG Maker.
        SoundManager.playBuzzer();
        this._skillListWindow.activate();
    };

    Scene_Status.prototype.openActorMenu = function(scene) {
        if (typeof scene !== 'function') {
            SoundManager.playBuzzer();
            this._tabsWindow.activate();
            return;
        }
        var actor = this.actor();
        if (actor) $gameParty.setMenuActor(actor);
        SceneManager.push(scene);
    };

    Scene_Status.prototype.changePartyActor = function(offset) {
        var members = $gameParty.members();
        if (members.length < 2) return;
        var index = (this._partyWindow.index() + offset + members.length) % members.length;
        this._partyWindow.select(index);
        this._partyWindow.refresh();
        this.onPartyActorChange();
    };

    Scene_Status.prototype.onPartyActorChange = function() {
        var actor = $gameParty.members()[this._partyWindow.index()];
        if (!actor) return;
        $gameParty.setMenuActor(actor);
        this._actor = actor;
        this.refreshAll();
    };

    Scene_Status.prototype.refreshAll = function() {
        var actor = this.actor();
        var index = $gameParty.members().indexOf(actor);
        if (this._partyWindow) {
            this._partyWindow.select(Math.max(0, index));
            this._partyWindow.refresh();
        }
        if (this._tabsWindow) this._tabsWindow.refresh();
        if (this._portraitWindow) this._portraitWindow.setActor(actor);
        if (this._infoWindow) this._infoWindow.setActor(actor);
        if (this._equipPreviewWindow) this._equipPreviewWindow.setActor(actor, true);
        if (this._classTreeWindow) this._classTreeWindow.setActor(actor, true);
        if (this._skillListWindow) this._skillListWindow.setActor(actor, true);
        this.updateRightPanel();
    };

    Scene_Status.prototype.onActorChange = function() {
        var actor = this.actor();
        var index = $gameParty.members().indexOf(actor);
        if (index >= 0 && this._partyWindow) this._partyWindow.select(index);
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
    NUSV.StatusScreen.Window_StatusParty = Window_StatusParty;
    NUSV.StatusScreen.Window_StatusDetail = Window_StatusDetail;
    NUSV.StatusScreen.Window_StatusPortrait = Window_StatusPortrait;
    NUSV.StatusScreen.Window_StatusInfo = Window_StatusInfo;
    NUSV.StatusScreen.Window_StatusEquipPreview = Window_StatusEquipPreview;
    NUSV.StatusScreen.Window_StatusClassTree = Window_StatusClassTree;
    NUSV.StatusScreen.Window_StatusClassConfirm = Window_StatusClassConfirm;
    NUSV.StatusScreen.Window_StatusSkillList = Window_StatusSkillList;
    NUSV.StatusScreen.Window_StatePopup = Window_StatePopup;
    NUSV.StatusScreen.Scene_Status = Scene_Status;
    NUSV.StatusScreen.portraitName = portraitName;
    NUSV.StatusScreen.version = '1.0.0';

})();
