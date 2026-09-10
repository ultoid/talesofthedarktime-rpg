/*:
 * @plugindesc v1.0.0 NUSV Party System - clean-room party management for RPG Maker MV.
 * @author Ultoid
 *
 * @param Max Battle Members
 * @type number
 * @min 1
 * @default 4
 *
 * @param Max Party Members
 * @type number
 * @min 1
 * @default 8
 *
 * @param Menu Command
 * @type text
 * @default Formation
 *
 * @param Add Menu Command
 * @type boolean
 * @default true
 *
 * @param Show Battle Formation
 * @type boolean
 * @default false
 *
 * @param Battle Formation Command
 * @type text
 * @default Formation
 *
 * @param Battle Cooldown
 * @type number
 * @min 0
 * @default 1
 *
 * @param Allow Empty Slots
 * @type boolean
 * @default true
 *
 * @param Show Reserve
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_PartySystem
 * ============================================================================
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_PartySystem source code.
 *
 * Core functions:
 * - dedicated Party/Formation scene
 * - active battle members + reserve members
 * - change maximum battle members
 * - lock actors
 * - require actors
 * - reorder/swap party members
 * - optional battle Formation command
 * - plugin commands intentionally mirror common Party System workflow
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   NUSV_PartySystem
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * OpenPartyMenu
 *   Opens the party formation scene.
 *
 * ShowBattleFormation
 * HideBattleFormation
 * EnableBattleFormation
 * DisableBattleFormation
 *
 * LockActor 3
 * LockActor 4 5 6
 *
 * UnlockActor 3
 * UnlockActor 4 5 6
 *
 * RequireActor 3
 * RequireActor 4 5 6
 *
 * UnrequireActor 3
 * UnrequireActor 4 5 6
 *
 * ChangePartyMax 5
 *   Changes maximum active battle members.
 *
 * ChangePartyTotalMax 8
 *   Changes maximum total party members accepted by this plugin.
 *
 * ============================================================================
 * LOCKED VS REQUIRED
 * ============================================================================
 *
 * Locked Actor:
 * - cannot be moved from its current party position.
 *
 * Required Actor:
 * - can be moved
 * - must remain within ACTIVE battle slots before leaving Party Menu.
 *
 * Do not require more actors than the maximum battle member count.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * $gameParty.nusvMaxBattleMembers()
 * $gameParty.nusvSetMaxBattleMembers(n)
 *
 * $gameParty.nusvLockActor(actorId)
 * $gameParty.nusvUnlockActor(actorId)
 * $gameParty.nusvRequireActor(actorId)
 * $gameParty.nusvUnrequireActor(actorId)
 *
 * $gameParty.nusvIsActorLocked(actorId)
 * $gameParty.nusvIsActorRequired(actorId)
 *
 * ============================================================================
 * BATTLE FORMATION
 * ============================================================================
 *
 * If enabled, "Formation" appears in the Party Command window.
 * It opens a compact swap window allowing active members to be swapped with
 * reserves. Locked actors cannot be selected.
 *
 * Battle Cooldown:
 * after a formation change, the battle Formation command is disabled for
 * the configured number of party-command openings.
 *
 * ============================================================================
 * SAVE COMPATIBILITY
 * ============================================================================
 *
 * Party data is stored on Game_Party and is saved normally.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_PartySystem = true;

var NUSV = NUSV || {};
NUSV.PartySystem = NUSV.PartySystem || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_PartySystem';
    var params = PluginManager.parameters(pluginName);

    function pBool(name, fallback) {
        var value = params[name];
        if (value === undefined || value === '') value = fallback;
        return String(value) === 'true';
    }

    function pNum(name, fallback) {
        var n = Number(params[name]);
        return isNaN(n) ? fallback : n;
    }

    var DEFAULT_BATTLE_MAX = Math.max(1, pNum('Max Battle Members', 4));
    var DEFAULT_TOTAL_MAX = Math.max(DEFAULT_BATTLE_MAX, pNum('Max Party Members', 8));
    var MENU_COMMAND = String(params['Menu Command'] || 'Formation');
    var ADD_MENU_COMMAND = pBool('Add Menu Command', true);
    var DEFAULT_SHOW_BATTLE = pBool('Show Battle Formation', false);
    var BATTLE_COMMAND = String(params['Battle Formation Command'] || 'Formation');
    var BATTLE_COOLDOWN = Math.max(0, pNum('Battle Cooldown', 1));
    var ALLOW_EMPTY = pBool('Allow Empty Slots', true);
    var SHOW_RESERVE = pBool('Show Reserve', true);

    // -------------------------------------------------------------------------
    // Game_System: global toggles
    // -------------------------------------------------------------------------

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._nusvShowBattleFormation = DEFAULT_SHOW_BATTLE;
        this._nusvEnableBattleFormation = true;
    };

    Game_System.prototype.nusvShowBattleFormation = function() {
        if (this._nusvShowBattleFormation === undefined) {
            this._nusvShowBattleFormation = DEFAULT_SHOW_BATTLE;
        }
        return !!this._nusvShowBattleFormation;
    };

    Game_System.prototype.nusvEnableBattleFormation = function() {
        if (this._nusvEnableBattleFormation === undefined) {
            this._nusvEnableBattleFormation = true;
        }
        return !!this._nusvEnableBattleFormation;
    };

    // -------------------------------------------------------------------------
    // Game_Party data
    // -------------------------------------------------------------------------

    var _Game_Party_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function() {
        _Game_Party_initialize.call(this);
        this._nusvMaxBattleMembers = DEFAULT_BATTLE_MAX;
        this._nusvMaxPartyMembers = DEFAULT_TOTAL_MAX;
        this._nusvLockedActors = {};
        this._nusvRequiredActors = {};
        this._nusvBattleFormationCooldown = 0;
    };

    Game_Party.prototype.nusvInitPartyData = function() {
        if (!this._nusvMaxBattleMembers) this._nusvMaxBattleMembers = DEFAULT_BATTLE_MAX;
        if (!this._nusvMaxPartyMembers) this._nusvMaxPartyMembers = DEFAULT_TOTAL_MAX;
        if (!this._nusvLockedActors) this._nusvLockedActors = {};
        if (!this._nusvRequiredActors) this._nusvRequiredActors = {};
        if (this._nusvBattleFormationCooldown === undefined) {
            this._nusvBattleFormationCooldown = 0;
        }
    };

    Game_Party.prototype.nusvMaxBattleMembers = function() {
        this.nusvInitPartyData();
        return Math.max(1, Number(this._nusvMaxBattleMembers || DEFAULT_BATTLE_MAX));
    };

    Game_Party.prototype.maxBattleMembers = function() {
        return this.nusvMaxBattleMembers();
    };

    Game_Party.prototype.nusvMaxPartyMembers = function() {
        this.nusvInitPartyData();
        return Math.max(this.nusvMaxBattleMembers(),
            Number(this._nusvMaxPartyMembers || DEFAULT_TOTAL_MAX));
    };

    Game_Party.prototype.nusvSetMaxBattleMembers = function(value) {
        this.nusvInitPartyData();
        value = Math.max(1, Math.floor(Number(value) || 1));
        this._nusvMaxBattleMembers = Math.min(value, this.nusvMaxPartyMembers());
        $gamePlayer.refresh();
    };

    Game_Party.prototype.nusvSetMaxPartyMembers = function(value) {
        this.nusvInitPartyData();
        value = Math.max(1, Math.floor(Number(value) || 1));
        this._nusvMaxPartyMembers = Math.max(value, this.nusvMaxBattleMembers());
    };

    Game_Party.prototype.nusvLockActor = function(actorId) {
        this.nusvInitPartyData();
        this._nusvLockedActors[Number(actorId)] = true;
    };

    Game_Party.prototype.nusvUnlockActor = function(actorId) {
        this.nusvInitPartyData();
        delete this._nusvLockedActors[Number(actorId)];
    };

    Game_Party.prototype.nusvRequireActor = function(actorId) {
        this.nusvInitPartyData();
        this._nusvRequiredActors[Number(actorId)] = true;
    };

    Game_Party.prototype.nusvUnrequireActor = function(actorId) {
        this.nusvInitPartyData();
        delete this._nusvRequiredActors[Number(actorId)];
    };

    Game_Party.prototype.nusvIsActorLocked = function(actorId) {
        this.nusvInitPartyData();
        return !!this._nusvLockedActors[Number(actorId)];
    };

    Game_Party.prototype.nusvIsActorRequired = function(actorId) {
        this.nusvInitPartyData();
        return !!this._nusvRequiredActors[Number(actorId)];
    };

    Game_Party.prototype.nusvRequiredActorIds = function() {
        this.nusvInitPartyData();
        return Object.keys(this._nusvRequiredActors).filter(function(id) {
            return !!this._nusvRequiredActors[id];
        }, this).map(Number);
    };

    Game_Party.prototype.nusvRequiredActorsActive = function() {
        var activeIds = this.battleMembers().map(function(actor) {
            return actor.actorId();
        });
        return this.nusvRequiredActorIds().every(function(id) {
            return activeIds.indexOf(id) >= 0;
        });
    };

    Game_Party.prototype.nusvCanMoveIndex = function(index) {
        var actor = this.members()[index];
        if (!actor) return ALLOW_EMPTY;
        return !this.nusvIsActorLocked(actor.actorId());
    };

    Game_Party.prototype.nusvSwapOrder = function(index1, index2) {
        this.nusvInitPartyData();
        index1 = Number(index1);
        index2 = Number(index2);
        if (index1 === index2) return true;
        if (index1 < 0 || index2 < 0) return false;
        if (index1 >= this._actors.length || index2 >= this._actors.length) return false;
        if (!this.nusvCanMoveIndex(index1) || !this.nusvCanMoveIndex(index2)) return false;

        var temp = this._actors[index1];
        this._actors[index1] = this._actors[index2];
        this._actors[index2] = temp;
        $gamePlayer.refresh();
        return true;
    };

    var _Game_Party_addActor = Game_Party.prototype.addActor;
    Game_Party.prototype.addActor = function(actorId) {
        this.nusvInitPartyData();
        if (this._actors.indexOf(actorId) < 0 &&
            this._actors.length >= this.nusvMaxPartyMembers()) {
            return;
        }
        _Game_Party_addActor.call(this, actorId);
    };

    Game_Party.prototype.nusvBattleFormationReady = function() {
        this.nusvInitPartyData();
        return this._nusvBattleFormationCooldown <= 0;
    };

    Game_Party.prototype.nusvStartFormationCooldown = function() {
        this._nusvBattleFormationCooldown = BATTLE_COOLDOWN;
    };

    Game_Party.prototype.nusvTickFormationCooldown = function() {
        this.nusvInitPartyData();
        if (this._nusvBattleFormationCooldown > 0) {
            this._nusvBattleFormationCooldown--;
        }
    };

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = String(command || '').toLowerCase();

        if (cmd === 'openpartymenu') {
            SceneManager.push(Scene_NUSVParty);
            return;
        }

        if (cmd === 'showbattleformation') {
            $gameSystem._nusvShowBattleFormation = true;
            return;
        }

        if (cmd === 'hidebattleformation') {
            $gameSystem._nusvShowBattleFormation = false;
            return;
        }

        if (cmd === 'enablebattleformation') {
            $gameSystem._nusvEnableBattleFormation = true;
            return;
        }

        if (cmd === 'disablebattleformation') {
            $gameSystem._nusvEnableBattleFormation = false;
            return;
        }

        if (cmd === 'changepartymax') {
            $gameParty.nusvSetMaxBattleMembers(Number(args[0] || 1));
            return;
        }

        if (cmd === 'changepartytotalmax') {
            $gameParty.nusvSetMaxPartyMembers(Number(args[0] || 1));
            return;
        }

        var ids = args.map(Number).filter(function(id) { return id > 0; });

        if (cmd === 'lockactor') {
            ids.forEach(function(id) { $gameParty.nusvLockActor(id); });
        } else if (cmd === 'unlockactor') {
            ids.forEach(function(id) { $gameParty.nusvUnlockActor(id); });
        } else if (cmd === 'requireactor') {
            ids.forEach(function(id) { $gameParty.nusvRequireActor(id); });
        } else if (cmd === 'unrequireactor') {
            ids.forEach(function(id) { $gameParty.nusvUnrequireActor(id); });
        }
    };

    // -------------------------------------------------------------------------
    // Dedicated Party Scene
    // -------------------------------------------------------------------------

    function Window_NUSVPartySlots() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVPartySlots.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVPartySlots.prototype.constructor = Window_NUSVPartySlots;

    Window_NUSVPartySlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._pendingIndex = -1;
        this.refresh();
        this.select(0);
    };

    Window_NUSVPartySlots.prototype.maxItems = function() {
        return $gameParty.members().length;
    };

    Window_NUSVPartySlots.prototype.itemHeight = function() {
        return 72;
    };

    Window_NUSVPartySlots.prototype.actorAt = function(index) {
        return $gameParty.members()[index];
    };

    function drawNusvActorSvBattler(win, actor, x, y, width, height) {
        if (!actor || !actor.battlerName ||
            typeof ImageManager === 'undefined' || !ImageManager.loadSvActor) {
            return false;
        }

        var battlerName = actor.battlerName();
        if (!battlerName) return false;

        var bitmap = ImageManager.loadSvActor(battlerName);
        if (bitmap && bitmap.addLoadListener && !bitmap.isReady()) {
            bitmap.addLoadListener(win.refresh.bind(win));
        }
        if (!bitmap || !bitmap.isReady()) return false;

        var frameWidth = bitmap.width / 9;
        var frameHeight = bitmap.height / 6;
        var motionIndex = 1; // wait
        var pattern = 1;
        var sx = ((motionIndex % 3) * 3 + pattern) * frameWidth;
        var sy = Math.floor(motionIndex / 3) * frameHeight;
        var scale = Math.min(width / frameWidth, height / frameHeight);
        var dw = Math.floor(frameWidth * scale);
        var dh = Math.floor(frameHeight * scale);
        var dx = x + Math.floor((width - dw) / 2);
        var dy = y + Math.floor((height - dh) / 2);

        win.contents.blt(bitmap, sx, sy, frameWidth, frameHeight, dx, dy, dw, dh);
        return true;
    }

    Window_NUSVPartySlots.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var actor = this.actorAt(index);
        if (!actor) return;

        var active = index < $gameParty.nusvMaxBattleMembers();
        var locked = $gameParty.nusvIsActorLocked(actor.actorId());
        var required = $gameParty.nusvIsActorRequired(actor.actorId());

        this.changePaintOpacity(!locked || index === this._pendingIndex);
        if (!drawNusvActorSvBattler(this, actor, rect.x, rect.y, 64, 64)) {
            this.drawActorFace(actor, rect.x, rect.y, 64, 64);
        }
        this.drawText(actor.name(), rect.x + 74, rect.y, rect.width - 74);

        var label = active ? 'ACTIVE' : 'RESERVE';
        if (locked) label += '  [LOCK]';
        else if (required) label += '  [REQ]';

        this.changeTextColor(active ? this.systemColor() : this.normalColor());
        this.drawText(label, rect.x + 74, rect.y + 30, rect.width - 74);
        this.resetTextColor();
        this.changePaintOpacity(true);
    };

    Window_NUSVPartySlots.prototype.setPendingIndex = function(index) {
        this._pendingIndex = index;
        this.refresh();
    };

    function Window_NUSVPartyHelp() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVPartyHelp.prototype = Object.create(Window_Base.prototype);
    Window_NUSVPartyHelp.prototype.constructor = Window_NUSVPartyHelp;

    Window_NUSVPartyHelp.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_NUSVPartyHelp.prototype.refresh = function() {
        this.contents.clear();
        var text = 'Select two members to swap. Locked actors cannot move.';
        this.drawText(text, 0, 0, this.contentsWidth());
        var text2 = 'Required actors must remain in ACTIVE slots.';
        this.drawText(text2, 0, this.lineHeight(), this.contentsWidth());
    };

    function Scene_NUSVParty() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVParty.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_NUSVParty.prototype.constructor = Scene_NUSVParty;

    Scene_NUSVParty.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._pendingIndex = -1;
    };

    Scene_NUSVParty.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);

        var helpH = 108;
        this._helpWindow = new Window_NUSVPartyHelp(
            0, 0, Graphics.boxWidth, helpH
        );
        this.addWindow(this._helpWindow);

        this._partyWindow = new Window_NUSVPartySlots(
            0, helpH, Graphics.boxWidth, Graphics.boxHeight - helpH
        );
        this._partyWindow.setHandler('ok', this.onPartyOk.bind(this));
        this._partyWindow.setHandler('cancel', this.onPartyCancel.bind(this));
        this.addWindow(this._partyWindow);
        this._partyWindow.activate();
        this._partyWindow.select(0);
    };

    Scene_NUSVParty.prototype.onPartyOk = function() {
        var index = this._partyWindow.index();
        var actor = this._partyWindow.actorAt(index);

        if (!actor || $gameParty.nusvIsActorLocked(actor.actorId())) {
            SoundManager.playBuzzer();
            this._partyWindow.activate();
            return;
        }

        if (this._pendingIndex < 0) {
            this._pendingIndex = index;
            this._partyWindow.setPendingIndex(index);
            SoundManager.playOk();
            this._partyWindow.activate();
            return;
        }

        if (this._pendingIndex === index) {
            this._pendingIndex = -1;
            this._partyWindow.setPendingIndex(-1);
            SoundManager.playCancel();
            this._partyWindow.activate();
            return;
        }

        if ($gameParty.nusvSwapOrder(this._pendingIndex, index)) {
            SoundManager.playEquip();
        } else {
            SoundManager.playBuzzer();
        }

        this._pendingIndex = -1;
        this._partyWindow.setPendingIndex(-1);
        this._partyWindow.activate();
    };

    Scene_NUSVParty.prototype.onPartyCancel = function() {
        if (this._pendingIndex >= 0) {
            this._pendingIndex = -1;
            this._partyWindow.setPendingIndex(-1);
            this._partyWindow.activate();
            return;
        }

        if (!$gameParty.nusvRequiredActorsActive()) {
            SoundManager.playBuzzer();
            this._partyWindow.activate();
            return;
        }

        this.popScene();
    };

    window.Scene_NUSVParty = Scene_NUSVParty;

    // -------------------------------------------------------------------------
    // Main Menu Integration
    // -------------------------------------------------------------------------

    if (ADD_MENU_COMMAND) {
        var _Window_MenuCommand_addFormationCommand =
            Window_MenuCommand.prototype.addFormationCommand;

        Window_MenuCommand.prototype.addFormationCommand = function() {
            var hasFormation = this._list && this._list.some(function(command) {
                return command.symbol === 'formation' || command.symbol === 'nusvParty';
            });

            if (hasFormation) return;

            if (MENU_COMMAND) {
                this.addCommand(MENU_COMMAND, 'nusvParty', this.isFormationEnabled());
            } else {
                _Window_MenuCommand_addFormationCommand.call(this);
            }
        };

        var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler('nusvParty',
                this.commandNusvParty.bind(this));
            this._commandWindow.setHandler('formation',
                this.commandNusvParty.bind(this));
        };

        Scene_Menu.prototype.commandNusvParty = function() {
            SceneManager.push(Scene_NUSVParty);
        };
    }

    // -------------------------------------------------------------------------
    // Followers
    // -------------------------------------------------------------------------

    Game_Followers.prototype.setup = function() {
        this._data = [];
        var max = Math.max(DEFAULT_TOTAL_MAX, $gameParty ? $gameParty.nusvMaxPartyMembers() : DEFAULT_TOTAL_MAX);
        for (var i = 1; i < max; i++) {
            this._data.push(new Game_Follower(i));
        }
    };

    // -------------------------------------------------------------------------
    // Battle Formation
    // -------------------------------------------------------------------------

    var _Window_PartyCommand_makeCommandList =
        Window_PartyCommand.prototype.makeCommandList;

    Window_PartyCommand.prototype.makeCommandList = function() {
        _Window_PartyCommand_makeCommandList.call(this);

        if ($gameSystem.nusvShowBattleFormation()) {
            var enabled = $gameSystem.nusvEnableBattleFormation() &&
                          $gameParty.nusvBattleFormationReady() &&
                          $gameParty.members().length > 1;
            this.addCommand(BATTLE_COMMAND, 'nusvFormation', enabled);
        }
    };

    function Window_NUSVBattleFormation() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVBattleFormation.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVBattleFormation.prototype.constructor = Window_NUSVBattleFormation;

    Window_NUSVBattleFormation.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._pendingIndex = -1;
        this.hide();
        this.deactivate();
        this.refresh();
    };

    Window_NUSVBattleFormation.prototype.maxItems = function() {
        return $gameParty.members().length;
    };

    Window_NUSVBattleFormation.prototype.drawItem = function(index) {
        var actor = $gameParty.members()[index];
        if (!actor) return;

        var rect = this.itemRectForText(index);
        var active = index < $gameParty.nusvMaxBattleMembers();
        var locked = $gameParty.nusvIsActorLocked(actor.actorId());

        this.changePaintOpacity(!locked);
        this.drawText(
            (active ? '[A] ' : '[R] ') + actor.name() + (locked ? ' [LOCK]' : ''),
            rect.x, rect.y, rect.width
        );
        this.changePaintOpacity(true);
    };

    Window_NUSVBattleFormation.prototype.setPendingIndex = function(index) {
        this._pendingIndex = index;
        this.refresh();
    };

    var _Scene_Battle_createPartyCommandWindow =
        Scene_Battle.prototype.createPartyCommandWindow;

    Scene_Battle.prototype.createPartyCommandWindow = function() {
        _Scene_Battle_createPartyCommandWindow.call(this);
        this._partyCommandWindow.setHandler(
            'nusvFormation', this.commandNusvFormation.bind(this)
        );
    };

    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);

        var w = Math.min(520, Graphics.boxWidth);
        var h = Math.min(Graphics.boxHeight - 96, 360);
        var x = Math.floor((Graphics.boxWidth - w) / 2);
        var y = Math.floor((Graphics.boxHeight - h) / 2);

        this._nusvFormationWindow =
            new Window_NUSVBattleFormation(x, y, w, h);

        this._nusvFormationWindow.setHandler(
            'ok', this.onNusvFormationOk.bind(this)
        );
        this._nusvFormationWindow.setHandler(
            'cancel', this.onNusvFormationCancel.bind(this)
        );

        this.addWindow(this._nusvFormationWindow);
        this._nusvFormationPendingIndex = -1;
    };

    Scene_Battle.prototype.commandNusvFormation = function() {
        this._partyCommandWindow.deactivate();
        this._nusvFormationWindow.refresh();
        this._nusvFormationWindow.show();
        this._nusvFormationWindow.activate();
        this._nusvFormationWindow.select(0);
    };

    Scene_Battle.prototype.onNusvFormationOk = function() {
        var index = this._nusvFormationWindow.index();
        var actor = $gameParty.members()[index];

        if (!actor || $gameParty.nusvIsActorLocked(actor.actorId())) {
            SoundManager.playBuzzer();
            this._nusvFormationWindow.activate();
            return;
        }

        if (this._nusvFormationPendingIndex < 0) {
            this._nusvFormationPendingIndex = index;
            SoundManager.playOk();
            this._nusvFormationWindow.activate();
            return;
        }

        if (this._nusvFormationPendingIndex === index) {
            this._nusvFormationPendingIndex = -1;
            SoundManager.playCancel();
            this._nusvFormationWindow.activate();
            return;
        }

        var changed = $gameParty.nusvSwapOrder(
            this._nusvFormationPendingIndex, index
        );

        if (changed) {
            $gameParty.nusvStartFormationCooldown();
            SoundManager.playEquip();
            this.refreshStatus();
            BattleManager.refreshStatus();
        } else {
            SoundManager.playBuzzer();
        }

        this._nusvFormationPendingIndex = -1;
        this._nusvFormationWindow.refresh();
        this._nusvFormationWindow.activate();
    };

    Scene_Battle.prototype.onNusvFormationCancel = function() {
        if (this._nusvFormationPendingIndex >= 0) {
            this._nusvFormationPendingIndex = -1;
            this._nusvFormationWindow.refresh();
            this._nusvFormationWindow.activate();
            return;
        }

        this._nusvFormationWindow.hide();
        this._nusvFormationWindow.deactivate();
        this._partyCommandWindow.activate();
    };

    var _BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        if ($gameParty && $gameParty.inBattle()) {
            $gameParty.nusvTickFormationCooldown();
        }
        _BattleManager_startInput.call(this);
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.PartySystem.Scene_Party = Scene_NUSVParty;
    NUSV.PartySystem.version = '1.0.0';

})();
