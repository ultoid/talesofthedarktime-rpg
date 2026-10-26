/*:
 * @plugindesc v1.0.0 NUSV Main Menu Bridge - compatibility bridge for YEP_MainMenuManager and NUSV menu plugins.
 * @author Ultoid
 *
 * @param Class Command
 * @type text
 * @default Class
 *
 * @param Learn Skills Command
 * @type text
 * @default Learn Skills
 *
 * @param Synthesis Command
 * @type text
 * @default Synthesis
 *
 * @param Party Command
 * @type text
 * @default Formation
 *
 * @param Party Menu Command
 * @type text
 * @default Party
 *
 * @param Add Class Command
 * @type boolean
 * @default true
 *
 * @param Add Learn Skills Command
 * @type boolean
 * @default true
 *
 * @param Add Synthesis Command
 * @type boolean
 * @default true
 *
 * @param Add Party Command
 * @type boolean
 * @default true
 *
 * @param Debug Warnings
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_MainMenuBridge
 * ============================================================================
 *
 * Clean compatibility bridge for:
 *
 *   YEP_MainMenuManager
 *   NUSV_ClassChange
 *   NUSV_SkillLearn
 *   NUSV_ItemSynthesis
 *   NUSV_PartySystem
 *
 * WHY THIS EXISTS
 * ----------------------------------------------------------------------------
 * YEP_MainMenuManager can rebuild the menu command list and some of its
 * default Class entries specifically check Imported.YEP_ClassChangeCore.
 *
 * Nusvanir uses NUSV_ClassChange instead.
 *
 * This bridge does NOT modify YEP_MainMenuManager. It runs after the menu
 * plugins and safely restores/adds NUSV commands and handlers.
 *
 * ============================================================================
 * REQUIRED ORDER
 * ============================================================================
 *
 * Place this BELOW every plugin it bridges:
 *
 *   YEP_MainMenuManager
 *   ...
 *   NUSV_ItemSynthesis
 *   NUSV_ClassChange
 *   NUSV_SkillLearn
 *   NUSV_PartySystem
 *   NUSV_MainMenuBridge
 *
 * It should be the LAST plugin that modifies the main menu.
 *
 * ============================================================================
 * COMMAND SYMBOLS
 * ============================================================================
 *
 * Class        : nusvClass
 * Learn Skills : nusvSkillLearn
 * Synthesis    : nusvSynthesis
 * Formation    : nusvParty
 *
 * The bridge checks for an existing command before adding one, so it will
 * not intentionally duplicate a command already added by a NUSV plugin.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_MainMenuBridge = true;

var NUSV = NUSV || {};
NUSV.MainMenuBridge = NUSV.MainMenuBridge || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_MainMenuBridge';
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

    var TEXT_CLASS = pText('Class Command', 'Class');
    var TEXT_SKILL = pText('Learn Skills Command', 'Learn Skills');
    var TEXT_SYNTH = pText('Synthesis Command', 'Synthesis');
    var TEXT_PARTY = pText('Party Command', 'Formation');
    var TEXT_PARTY_MENU = pText('Party Menu Command', 'Party');

    var ADD_CLASS = pBool('Add Class Command', true);
    var ADD_SKILL = pBool('Add Learn Skills Command', true);
    var ADD_SYNTH = pBool('Add Synthesis Command', true);
    var ADD_PARTY = pBool('Add Party Command', true);
    var DEBUG = pBool('Debug Warnings', true);

    function warn(message) {
        if (DEBUG && window.console && console.warn) {
            console.warn(pluginName + ': ' + message);
        }
    }

    function hasCommand(win, symbols) {
        if (!win || !win._list) return false;
        if (!Array.isArray(symbols)) symbols = [symbols];

        return win._list.some(function(cmd) {
            return symbols.indexOf(cmd.symbol) >= 0;
        });
    }

    function imported(name) {
        return !!Imported[name];
    }

    function firstScene(names) {
        for (var i = 0; i < names.length; i++) {
            if (typeof window[names[i]] === 'function') {
                return window[names[i]];
            }
        }
        return null;
    }

    /*
     * Candidate names cover the naming pattern used across NUSV plugins.
     * If a future version renames a scene, add the new global name here.
     */
    function classScene() {
        return firstScene([
            'Scene_NUSVClassChange',
            'Scene_NUSV_ClassChange',
            'Scene_NUSVClass'
        ]);
    }

    function skillLearnScene() {
        return firstScene([
            'Scene_NUSVSkillLearn',
            'Scene_NUSV_SkillLearn',
            'Scene_NUSVLearnSkills'
        ]);
    }

    function synthesisScene() {
        return firstScene([
            'Scene_NUSVSynthesis',
            'Scene_NUSVItemSynthesis',
            'Scene_NUSV_ItemSynthesis'
        ]);
    }

    function partyScene() {
        return firstScene([
            'Scene_NUSVParty',
            'Scene_NUSVPartySystem',
            'Scene_NUSV_Party'
        ]);
    }

    /*
     * The standalone Status command becomes a Party command. It is renamed and
     * promoted above the Inventory command so the menu reads:
     * Party, Inventory, Skills, ...
     */
    function promotePartyMenuCommand(win) {
        if (!win || !win._list) return;
        var index = -1;
        for (var i = 0; i < win._list.length; i++) {
            if (win._list[i].symbol === 'status') {
                index = i;
                break;
            }
        }
        if (index < 0) return;
        var command = win._list.splice(index, 1)[0];
        command.name = TEXT_PARTY_MENU;
        win._list.unshift(command);
    }

    // -------------------------------------------------------------------------
    // Window_MenuCommand
    // -------------------------------------------------------------------------

    var _Window_MenuCommand_makeCommandList =
        Window_MenuCommand.prototype.makeCommandList;

    Window_MenuCommand.prototype.makeCommandList = function() {
        _Window_MenuCommand_makeCommandList.call(this);

        /*
         * Class
         * Also regard YEP's "class" symbol as already present, so we don't
         * create two visually identical Class commands if the user later
         * changes MainMenuManager settings.
         */
        if (ADD_CLASS && imported('NUSV_ClassChange')) {
            if (!hasCommand(this, ['nusvClassChange', 'nusvClass', 'class'])) {
                this.addCommand(TEXT_CLASS, 'nusvClass', !!classScene());
            }
        }

        if (ADD_SKILL && imported('NUSV_SkillLearn')) {
            if (!hasCommand(this, ['nusvSkillLearn', 'learnSkills'])) {
                this.addCommand(TEXT_SKILL, 'nusvSkillLearn', !!skillLearnScene());
            }
        }

        if (ADD_SYNTH && imported('NUSV_ItemSynthesis')) {
            if (!hasCommand(this, ['nusvSynthesis', 'synthesis'])) {
                this.addCommand(TEXT_SYNTH, 'nusvSynthesis', !!synthesisScene());
            }
        }

        /*
         * PartySystem v1 uses symbol "nusvParty". We also detect the native
         * "formation" symbol to prevent duplicated Formation commands.
         */
        if (ADD_PARTY && imported('NUSV_PartySystem')) {
            if (!hasCommand(this, ['nusvParty', 'formation'])) {
                this.addCommand(TEXT_PARTY, 'nusvParty', !!partyScene());
            }
        }

        promotePartyMenuCommand(this);
    };

    // -------------------------------------------------------------------------
    // Scene_Menu handlers
    // -------------------------------------------------------------------------

    var _Scene_Menu_createCommandWindow =
        Scene_Menu.prototype.createCommandWindow;

    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);

        if (!this._commandWindow) return;

        if (ADD_CLASS && imported('NUSV_ClassChange')) {
            this._commandWindow.setHandler(
                'nusvClass',
                this.nusvBridgeOpenClass.bind(this)
            );
        }

        if (ADD_SKILL && imported('NUSV_SkillLearn')) {
            this._commandWindow.setHandler(
                'nusvSkillLearn',
                this.nusvBridgeOpenSkillLearn.bind(this)
            );
        }

        if (ADD_SYNTH && imported('NUSV_ItemSynthesis')) {
            this._commandWindow.setHandler(
                'nusvSynthesis',
                this.nusvBridgeOpenSynthesis.bind(this)
            );
        }

        if (ADD_PARTY && imported('NUSV_PartySystem')) {
            this._commandWindow.setHandler(
                'nusvParty',
                this.nusvBridgeOpenParty.bind(this)
            );
            this._commandWindow.setHandler(
                'formation',
                this.nusvBridgeOpenParty.bind(this)
            );
        }

        if (hasCommand(this._commandWindow, 'status')) {
            this._commandWindow.setHandler(
                'status',
                this.nusvBridgeOpenPartyMenu.bind(this)
            );
        }
    };

    /*
     * Class Change and Skill Learn are actor-based systems.
     * We preserve the standard RPG Maker workflow:
     * command -> actor selection -> scene.
     */
    Scene_Menu.prototype.nusvBridgeOpenClass = function() {
        var scene = classScene();

        if (!scene) {
            warn('NUSV_ClassChange is active, but its Scene class was not found.');
            SoundManager.playBuzzer();
            this._commandWindow.activate();
            return;
        }

        this._nusvBridgePersonalScene = scene;
        this._statusWindow.selectLast();
        this._statusWindow.setHandler(
            'ok',
            this.nusvBridgePersonalOk.bind(this)
        );
        this._statusWindow.setHandler(
            'cancel',
            this.nusvBridgePersonalCancel.bind(this)
        );
        this._statusWindow.show();
        this._statusWindow.activate();
        this._statusWindow.select(0);
    };

    Scene_Menu.prototype.nusvBridgeOpenSkillLearn = function() {
        var scene = skillLearnScene();

        if (!scene) {
            warn('NUSV_SkillLearn is active, but its Scene class was not found.');
            SoundManager.playBuzzer();
            this._commandWindow.activate();
            return;
        }

        this._nusvBridgePersonalScene = scene;
        this._statusWindow.setHandler(
            'ok',
            this.nusvBridgePersonalOk.bind(this)
        );
        this._statusWindow.setHandler(
            'cancel',
            this.nusvBridgePersonalCancel.bind(this)
        );
        this._statusWindow.show();
        this._statusWindow.activate();
        this._statusWindow.select(0);
    };

    Scene_Menu.prototype.nusvBridgePersonalOk = function() {
        var scene = this._nusvBridgePersonalScene;

        if (!scene) {
            SoundManager.playBuzzer();
            this._statusWindow.activate();
            return;
        }

        var actor = $gameParty.members()[this._statusWindow.index()];
        if (actor) {
            $gameParty.setMenuActor(actor);
        }

        this._statusWindow.hide();
        SceneManager.push(scene);
    };

    Scene_Menu.prototype.nusvBridgePersonalCancel = function() {
        this._nusvBridgePersonalScene = null;
        this._statusWindow.hide();
        this._statusWindow.deselect();
        this._commandWindow.activate();
    };

    Scene_Menu.prototype.nusvBridgeOpenSynthesis = function() {
        var scene = synthesisScene();

        if (!scene) {
            warn('NUSV_ItemSynthesis is active, but its Scene class was not found.');
            SoundManager.playBuzzer();
            this._commandWindow.activate();
            return;
        }

        SceneManager.push(scene);
    };

    Scene_Menu.prototype.nusvBridgeOpenParty = function() {
        var scene = partyScene();

        if (!scene) {
            warn('NUSV_PartySystem is active, but its Scene class was not found.');
            SoundManager.playBuzzer();
            this._commandWindow.activate();
            return;
        }

        SceneManager.push(scene);
    };

    Scene_Menu.prototype.nusvBridgeOpenPartyMenu = function() {
        partyMenuIndex = 0;
        SceneManager.push(Scene_NUSVPartyMenu);
    };

    // -------------------------------------------------------------------------
    // Main Menu Status
    // -------------------------------------------------------------------------

    function actorBaseLevel(actor) {
        return actor && actor.nusvBaseLevel ? actor.nusvBaseLevel() : actor.level;
    }

    function actorClassLevel(actor) {
        return actor && actor.nusvClassLevel ? actor.nusvClassLevel() : actor.level;
    }

    Window_Base.prototype.nusvDrawActorLevelLine = function(label, value, x, y, width) {
        this.changeTextColor(this.systemColor());
        this.drawText(label, x, y, width);
        this.resetTextColor();
        this.drawText(String(value), x, y, width, 'right');
    };

    function getBasicStatusStates(actor) {
        if (!actor || !actor.states) return [];
        return actor.states().filter(function(st) {
            if (!st || st.id <= 0) return false;
            if (st.id === 2 || st.id === 3) return false; // Exclude Defend (id: 2) & divider (id: 3)
            if (actor.isPassiveState && actor.isPassiveState(st.id)) return false;
            if (st.note && /<passive|passive state/i.test(st.note)) return false;
            return st.iconIndex > 0;
        });
    }

    var _Window_MenuStatus_drawItemStatus =
        Window_MenuStatus.prototype.drawItemStatus;

    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        var actor = $gameParty.members()[index];
        if (!actor) {
            _Window_MenuStatus_drawItemStatus.call(this, index);
            return;
        }

        var rect = this.itemRect(index);
        var faceWidth = Window_Base._faceWidth || 144;
        var hasYanflyParam = typeof Yanfly !== 'undefined' && Yanfly.Param;
        var padding = hasYanflyParam && Yanfly.Param.WindowPadding ?
            Yanfly.Param.WindowPadding : this.standardPadding();
        var textPadding = this.textPadding ? this.textPadding() : 6;
        var lineHeight = this.lineHeight();
        var x = rect.x + padding + faceWidth;
        var y = hasYanflyParam && Yanfly.Param.MenuTpGauge ?
            Math.floor(rect.y) :
            Math.floor(rect.y + rect.height / 2 - lineHeight * 1.5);
        var width = rect.width - x - textPadding;
        var x2 = x + faceWidth + textPadding * 2;
        var width2 = Math.max(180, width - faceWidth - textPadding * 3);
        var leftWidth = Math.max(120, x2 - x - textPadding);

        // Highlight if this member is currently selected in formation swap mode
        if (this._pendingSwapIndex === index) {
            this.contents.fillRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4, 'rgba(255, 215, 0, 0.16)');
            var bx = rect.x + 2;
            var by = rect.y + 2;
            var bw = rect.width - 4;
            var bh = rect.height - 4;
            this.contents.fillRect(bx, by, bw, 2, '#ffd700');
            this.contents.fillRect(bx, by + bh - 2, bw, 2, '#ffd700');
            this.contents.fillRect(bx, by, 2, bh, '#ffd700');
            this.contents.fillRect(bx + bw - 2, by, 2, bh, '#ffd700');
        }

        this.drawActorName(actor, x, y, leftWidth);
        if (this._pendingSwapIndex === index) {
            this.changeTextColor('#ffd700');
            this.drawText('[SWAP]', x + Math.min(leftWidth - 56, this.textWidth(actor.name()) + 8), y, 56);
            this.resetTextColor();
        }

        this.nusvDrawActorLevelLine('Base Lv', actorBaseLevel(actor), x, y + lineHeight, leftWidth);
        this.nusvDrawActorLevelLine('Class Lv', actorClassLevel(actor), x, y + lineHeight * 2, leftWidth);

        // Draw Class Name with bounded width so it does not overlap state icons
        var cls = actor.currentClass ? actor.currentClass() : null;
        var className = cls && cls.name ? cls.name : '';
        var classWidth = Math.min(130, width2);
        this.drawActorClass(actor, x2, y, classWidth);

        // Draw basic status effect icons (excluding Defend & passive states)
        var basicStates = getBasicStatusStates(actor);
        var iconSize = Window_Base._iconWidth || 32;
        var iconX = x2 + Math.max(classWidth + 12, this.textWidth(className) + 16);
        var maxIconX = rect.x + rect.width - padding - iconSize;
        for (var s = 0; s < basicStates.length; s++) {
            if (iconX <= maxIconX) {
                this.drawIcon(basicStates[s].iconIndex, iconX, y);
                iconX += iconSize + 4;
            }
        }

        this.drawActorHp(actor, x2, y + lineHeight, width2);
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
        if (hasYanflyParam && Yanfly.Param.MenuTpGauge) {
            this.drawActorTp(actor, x2, y + lineHeight * 3, width2);
        }
    };

    // -------------------------------------------------------------------------
    // Compatibility: YEP MainMenuManager's built-in "class" command
    // -------------------------------------------------------------------------
    /*
     * The current project configuration uses symbol "class" with a Show
     * expression that checks Imported.YEP_ClassChangeCore. If the user later
     * changes that Show expression so the command appears, this handler makes
     * that command open NUSV_ClassChange instead of requiring YEP's Scene_Class.
     */
    var _Scene_Menu_createCommandWindow2 =
        Scene_Menu.prototype.createCommandWindow;

    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow2.call(this);

        if (imported('NUSV_ClassChange') &&
            !imported('YEP_ClassChangeCore') &&
            this._commandWindow &&
            hasCommand(this._commandWindow, 'class')) {

            this._commandWindow.setHandler(
                'class',
                this.nusvBridgeOpenClass.bind(this)
            );
        }
    };

    // -------------------------------------------------------------------------
    // Party Action Popup Window
    // -------------------------------------------------------------------------

    function Window_NUSVPartyAction() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVPartyAction.prototype = Object.create(Window_Command.prototype);
    Window_NUSVPartyAction.prototype.constructor = Window_NUSVPartyAction;

    Window_NUSVPartyAction.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = Math.floor((Graphics.boxWidth - width) / 2);
        var y = Math.floor((Graphics.boxHeight - height) / 2);
        Window_Command.prototype.initialize.call(this, x, y);
        this.openness = 0;
        this.hide();
        this.deactivate();
    };

    Window_NUSVPartyAction.prototype.windowWidth = function() {
        return 240;
    };

    Window_NUSVPartyAction.prototype.numVisibleRows = function() {
        return 4;
    };

    Window_NUSVPartyAction.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_NUSVPartyAction.prototype.makeCommandList = function() {
        var hasMultiple = $gameParty ? $gameParty.members().length > 1 : false;
        this.addCommand('Detail', 'detail', true);
        this.addCommand('Change Position', 'changePosition', hasMultiple);
        this.addCommand('Item', 'item', true);
        this.addCommand('Cancel', 'cancel', true);
    };

    Window_NUSVPartyAction.prototype.popupAt = function(x, y) {
        this.x = x;
        this.y = y;
        this.refresh();
        this.select(0);
        this.openness = 255;
        this.show();
        this.activate();
    };

    Window_NUSVPartyAction.prototype.closePopup = function() {
        this.deactivate();
        this.openness = 0;
        this.hide();
    };

    // -------------------------------------------------------------------------
    // Party Menu (full-screen party list)
    // -------------------------------------------------------------------------

    var PARTY_HEADER_HEIGHT = 72;

    /*
     * The party menu scene is rebuilt from its constructor every time the
     * scene manager returns to it (SceneManager.pop does new sceneClass()),
     * so the selected row cannot live on the scene instance. Keep it here, in
     * the plugin closure, to stay on the member chosen before opening Status.
     */
    var partyMenuIndex = 0;

    /*
     * Shown by the Party command. It fills the screen with the same actor
     * window used by the main menu, placed under a "Party" title. Choosing a
     * member opens an action menu (Detail, Change Position, Item, Cancel).
     */
    function Scene_NUSVPartyMenu() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVPartyMenu.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_NUSVPartyMenu.prototype.constructor = Scene_NUSVPartyMenu;

    Scene_NUSVPartyMenu.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._swapIndex = -1;
        this.createPartyHeader();
        this.createMemberWindow();
        this.createActionWindow();
    };

    Scene_NUSVPartyMenu.prototype.createPartyHeader = function() {
        var header = new Window_Base(0, 0, Graphics.boxWidth, PARTY_HEADER_HEIGHT);
        header.changeTextColor(header.systemColor());
        header.contents.fontSize = 28;
        header.drawText(TEXT_PARTY_MENU, header.textPadding(), 0, header.contents.width);
        this._headerWindow = header;
        this.addWindow(header);
    };

    Scene_NUSVPartyMenu.prototype.createMemberWindow = function() {
        var y = PARTY_HEADER_HEIGHT;
        var window = new Window_MenuStatus(0, y);
        window.move(0, y, Graphics.boxWidth, Graphics.boxHeight - y);
        window.createContents();
        window.reserveFaceImages();
        window.setHandler('ok', this.onMemberOk.bind(this));
        window.setHandler('cancel', this.onMemberCancel.bind(this));
        this._memberWindow = window;
        this.addWindow(window);
    };

    Scene_NUSVPartyMenu.prototype.createActionWindow = function() {
        this._actionWindow = new Window_NUSVPartyAction();
        this._actionWindow.setHandler('detail', this.onActionDetail.bind(this));
        this._actionWindow.setHandler('changePosition', this.onActionChangePosition.bind(this));
        this._actionWindow.setHandler('item', this.onActionItem.bind(this));
        this._actionWindow.setHandler('cancel', this.onActionCancel.bind(this));
        this.addWindow(this._actionWindow);
    };

    Scene_NUSVPartyMenu.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        this._swapIndex = -1;
        this._memberWindow._pendingSwapIndex = -1;
        this._memberWindow.refresh();
        this._memberWindow.activate();
        var max = this._memberWindow.maxItems();
        if (max <= 0) {
            this._memberWindow.select(-1);
            return;
        }
        var index = partyMenuIndex;
        if (index >= max) {
            index = max - 1;
        }
        this._memberWindow.select(index);
    };

    Scene_NUSVPartyMenu.prototype.onMemberOk = function() {
        var index = this._memberWindow.index();

        // Formation swap mode: second member selected
        if (this._swapIndex >= 0) {
            var targetIndex = index;
            if (targetIndex !== this._swapIndex) {
                $gameParty.swapOrder(this._swapIndex, targetIndex);
                SoundManager.playEquip();
                partyMenuIndex = targetIndex;
            } else {
                SoundManager.playCancel();
            }
            this._swapIndex = -1;
            this._memberWindow._pendingSwapIndex = -1;
            this._memberWindow.refresh();
            this._memberWindow.activate();
            return;
        }

        var actor = $gameParty.members()[index];
        if (!actor) {
            SoundManager.playBuzzer();
            this._memberWindow.activate();
            return;
        }

        // Open Action popup
        this._memberWindow.deactivate();
        var rect = this._memberWindow.itemRect(index);
        var targetY = this._memberWindow.y + rect.y + Math.floor((rect.height - this._actionWindow.height) / 2);
        targetY = Math.max(PARTY_HEADER_HEIGHT + 8, Math.min(Graphics.boxHeight - this._actionWindow.height - 8, targetY));
        var targetX = Math.floor((Graphics.boxWidth - this._actionWindow.width) / 2);

        this._actionWindow.popupAt(targetX, targetY);
    };

    Scene_NUSVPartyMenu.prototype.onMemberCancel = function() {
        if (this._swapIndex >= 0) {
            this._swapIndex = -1;
            this._memberWindow._pendingSwapIndex = -1;
            SoundManager.playCancel();
            this._memberWindow.refresh();
            this._memberWindow.activate();
            return;
        }
        this.popScene();
    };

    Scene_NUSVPartyMenu.prototype.onActionDetail = function() {
        var index = this._memberWindow.index();
        var actor = $gameParty.members()[index];
        if (actor) {
            $gameParty.setMenuActor(actor);
        }
        partyMenuIndex = index;
        this._actionWindow.closePopup();
        SceneManager.push(Scene_Status);
    };

    Scene_NUSVPartyMenu.prototype.onActionChangePosition = function() {
        this._swapIndex = this._memberWindow.index();
        this._memberWindow._pendingSwapIndex = this._swapIndex;
        this._actionWindow.closePopup();
        this._memberWindow.refresh();
        this._memberWindow.activate();
    };

    Scene_NUSVPartyMenu.prototype.onActionItem = function() {
        partyMenuIndex = this._memberWindow.index();
        this._actionWindow.closePopup();
        if (typeof Scene_NUSVInventory !== 'undefined') {
            Scene_NUSVInventory._itemOnlyMode = true;
            SceneManager.push(Scene_NUSVInventory);
        } else {
            SceneManager.push(Scene_Item);
        }
    };

    Scene_NUSVPartyMenu.prototype.onActionCancel = function() {
        this._actionWindow.closePopup();
        this._memberWindow.activate();
    };

    // -------------------------------------------------------------------------
    // Main Menu Layout
    // -------------------------------------------------------------------------
    /*
     * The main menu keeps only the command list visible. The party status
     * window stays hidden until an actor has to be chosen (Skill / Equip /
     * Status / Learn Skills / Class), and the gold window is pinned to the
     * top-right corner.
     */

    var _Scene_Menu_createStatusWindow =
        Scene_Menu.prototype.createStatusWindow;

    Scene_Menu.prototype.createStatusWindow = function() {
        _Scene_Menu_createStatusWindow.call(this);

        if (this._statusWindow) {
            this._statusWindow.hide();
        }
    };

    function nusvHideStatusWindow(scene) {
        if (scene._statusWindow) scene._statusWindow.hide();
    }

    var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;

    Scene_Menu.prototype.onPersonalOk = function() {
        _Scene_Menu_onPersonalOk.call(this);
        nusvHideStatusWindow(this);
    };

    var _Scene_Menu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;

    Scene_Menu.prototype.onPersonalCancel = function() {
        _Scene_Menu_onPersonalCancel.call(this);
        nusvHideStatusWindow(this);
    };

    var _Scene_Menu_repositionWindows = Scene_Menu.prototype.repositionWindows;

    Scene_Menu.prototype.repositionWindows = function() {
        if (_Scene_Menu_repositionWindows) {
            _Scene_Menu_repositionWindows.call(this);
        }

        if (this._goldWindow) {
            this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
            this._goldWindow.y = 0;
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.MainMenuBridge.classScene = classScene;
    NUSV.MainMenuBridge.skillLearnScene = skillLearnScene;
    NUSV.MainMenuBridge.synthesisScene = synthesisScene;
    NUSV.MainMenuBridge.partyScene = partyScene;
    NUSV.MainMenuBridge.partyMenuScene = Scene_NUSVPartyMenu;
    NUSV.MainMenuBridge.version = '1.0.0';

})();
