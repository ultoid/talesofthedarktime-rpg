/*:
 * @plugindesc v1.0.0 NUSV Options Core - clean-room expanded Options menu for RPG Maker MV.
 * @author Ultoid
 *
 * @param Show Always Dash
 * @type boolean
 * @default true
 *
 * @param Show Command Remember
 * @type boolean
 * @default true
 *
 * @param Show BGM Volume
 * @type boolean
 * @default true
 *
 * @param Show BGS Volume
 * @type boolean
 * @default true
 *
 * @param Show ME Volume
 * @type boolean
 * @default true
 *
 * @param Show SE Volume
 * @type boolean
 * @default true
 *
 * @param Add Auto Dash
 * @type boolean
 * @default false
 *
 * @param Add Battle Log Speed
 * @type boolean
 * @default true
 *
 * @param Add Animation Speed
 * @type boolean
 * @default true
 *
 * @param Battle Log Speed Default
 * @type number
 * @min 1
 * @max 5
 * @default 3
 *
 * @param Animation Speed Default
 * @type number
 * @min 1
 * @max 5
 * @default 3
 *
 * @help
 * ============================================================================
 * NUSV_OptionsCore
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_OptionsCore source code.
 *
 * Purpose:
 * - reorganize and expand the Options menu
 * - hide/show default option commands
 * - add custom boolean/range options
 * - expose persistent config values for other NUSV plugins
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   NUSV_OptionsCore
 *
 * ============================================================================
 * BUILT-IN OPTIONS
 * ============================================================================
 *
 * This plugin can show/hide:
 *
 *   Always Dash
 *   Command Remember
 *   BGM Volume
 *   BGS Volume
 *   ME Volume
 *   SE Volume
 *
 * ============================================================================
 * NUSV OPTIONS
 * ============================================================================
 *
 * Auto Dash
 *   Optional extra boolean setting.
 *
 * Battle Log Speed
 *   Range 1..5.
 *   Other plugins can read:
 *     ConfigManager.nusvBattleLogSpeed
 *
 * Animation Speed
 *   Range 1..5.
 *   Other plugins can read:
 *     ConfigManager.nusvAnimationSpeed
 *
 * ============================================================================
 * SCRIPT ACCESS
 * ============================================================================
 *
 * ConfigManager.nusvAutoDash
 * ConfigManager.nusvBattleLogSpeed
 * ConfigManager.nusvAnimationSpeed
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_OptionsCore = true;

var NUSV = NUSV || {};
NUSV.OptionsCore = NUSV.OptionsCore || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_OptionsCore';
    var params = PluginManager.parameters(pluginName);

    function pbool(name, fallback) {
        return String(params[name] != null ? params[name] : fallback) === 'true';
    }

    function pnum(name, fallback) {
        var n = Number(params[name]);
        return isNaN(n) ? fallback : n;
    }

    var showAlwaysDash = pbool('Show Always Dash', true);
    var showCommandRemember = pbool('Show Command Remember', true);
    var showBgm = pbool('Show BGM Volume', true);
    var showBgs = pbool('Show BGS Volume', true);
    var showMe = pbool('Show ME Volume', true);
    var showSe = pbool('Show SE Volume', true);

    var addAutoDash = pbool('Add Auto Dash', false);
    var addBattleLogSpeed = pbool('Add Battle Log Speed', true);
    var addAnimationSpeed = pbool('Add Animation Speed', true);

    var defaultBattleLogSpeed = Math.max(1, Math.min(5, pnum('Battle Log Speed Default', 3)));
    var defaultAnimationSpeed = Math.max(1, Math.min(5, pnum('Animation Speed Default', 3)));

    // -------------------------------------------------------------------------
    // ConfigManager
    // -------------------------------------------------------------------------

    ConfigManager.nusvAutoDash = false;
    ConfigManager.nusvBattleLogSpeed = defaultBattleLogSpeed;
    ConfigManager.nusvAnimationSpeed = defaultAnimationSpeed;

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this);
        config.nusvAutoDash = this.nusvAutoDash;
        config.nusvBattleLogSpeed = this.nusvBattleLogSpeed;
        config.nusvAnimationSpeed = this.nusvAnimationSpeed;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);

        this.nusvAutoDash = this.readFlag(config, 'nusvAutoDash');
        this.nusvBattleLogSpeed = this.nusvReadNumber(
            config, 'nusvBattleLogSpeed', defaultBattleLogSpeed, 1, 5
        );
        this.nusvAnimationSpeed = this.nusvReadNumber(
            config, 'nusvAnimationSpeed', defaultAnimationSpeed, 1, 5
        );
    };

    ConfigManager.nusvReadNumber = function(config, name, fallback, min, max) {
        var value = Number(config[name]);
        if (isNaN(value)) value = fallback;
        return Math.max(min, Math.min(max, value));
    };

    // -------------------------------------------------------------------------
    // Options command list
    // -------------------------------------------------------------------------

    Window_Options.prototype.makeCommandList = function() {
        if (showAlwaysDash) this.addCommand(TextManager.alwaysDash, 'alwaysDash');
        if (showCommandRemember) this.addCommand(TextManager.commandRemember, 'commandRemember');

        if (addAutoDash) {
            this.addCommand('Auto Dash', 'nusvAutoDash');
        }

        if (addBattleLogSpeed) {
            this.addCommand('Battle Log Speed', 'nusvBattleLogSpeed');
        }

        if (addAnimationSpeed) {
            this.addCommand('Animation Speed', 'nusvAnimationSpeed');
        }

        if (showBgm || showBgs || showMe || showSe) {
            this.addVolumeOptions();
        }
    };

    var _Window_Options_addVolumeOptions = Window_Options.prototype.addVolumeOptions;
    Window_Options.prototype.addVolumeOptions = function() {
        if (showBgm) this.addCommand(TextManager.bgmVolume, 'bgmVolume');
        if (showBgs) this.addCommand(TextManager.bgsVolume, 'bgsVolume');
        if (showMe) this.addCommand(TextManager.meVolume, 'meVolume');
        if (showSe) this.addCommand(TextManager.seVolume, 'seVolume');
    };

    // -------------------------------------------------------------------------
    // Status display
    // -------------------------------------------------------------------------

    var _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function(index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);

        if (symbol === 'nusvBattleLogSpeed' || symbol === 'nusvAnimationSpeed') {
            return String(value);
        }

        return _Window_Options_statusText.call(this, index);
    };

    // -------------------------------------------------------------------------
    // Cursor / OK behavior
    // -------------------------------------------------------------------------

    var _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        var index = this.index();
        var symbol = this.commandSymbol(index);

        if (symbol === 'nusvBattleLogSpeed' || symbol === 'nusvAnimationSpeed') {
            var value = this.getConfigValue(symbol);
            value += 1;
            if (value > 5) value = 1;
            value = this.nusvClampRange(symbol, value);
            this.changeValue(symbol, value);
            return;
        }

        _Window_Options_processOk.call(this);
    };

    var _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function(wrap) {
        var symbol = this.commandSymbol(this.index());

        if (symbol === 'nusvBattleLogSpeed' || symbol === 'nusvAnimationSpeed') {
            var value = this.getConfigValue(symbol);
            this.changeValue(symbol, this.nusvClampRange(symbol, value + 1));
            return;
        }

        _Window_Options_cursorRight.call(this, wrap);
    };

    var _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function(wrap) {
        var symbol = this.commandSymbol(this.index());

        if (symbol === 'nusvBattleLogSpeed' || symbol === 'nusvAnimationSpeed') {
            var value = this.getConfigValue(symbol);
            this.changeValue(symbol, this.nusvClampRange(symbol, value - 1));
            return;
        }

        _Window_Options_cursorLeft.call(this, wrap);
    };

    Window_Options.prototype.nusvClampRange = function(symbol, value) {
        if (symbol === 'nusvBattleLogSpeed') {
            return Math.max(1, Math.min(5, value));
        }
        if (symbol === 'nusvAnimationSpeed') {
            return Math.max(1, Math.min(5, value));
        }
        return value;
    };

    // -------------------------------------------------------------------------
    // Optional Auto Dash behavior
    // -------------------------------------------------------------------------

    var _Game_Player_isDashing = Game_Player.prototype.isDashing;
    Game_Player.prototype.isDashing = function() {
        if (addAutoDash && ConfigManager.nusvAutoDash) {
            if (this.isMoving()) return true;
        }
        return _Game_Player_isDashing.call(this);
    };

    // -------------------------------------------------------------------------
    // Optional speed hooks
    // -------------------------------------------------------------------------

    if (typeof Window_BattleLog !== 'undefined') {
        var _Window_BattleLog_messageSpeed = Window_BattleLog.prototype.messageSpeed;
        Window_BattleLog.prototype.messageSpeed = function() {
            var base = _Window_BattleLog_messageSpeed ?
                _Window_BattleLog_messageSpeed.call(this) : 16;

            var speed = Number(ConfigManager.nusvBattleLogSpeed || 3);
            var factorMap = {1:1.6, 2:1.3, 3:1.0, 4:0.75, 5:0.55};
            return Math.max(1, Math.round(base * factorMap[speed]));
        };
    }

    if (typeof Sprite_Animation !== 'undefined') {
        var _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;
        Sprite_Animation.prototype.updateMain = function() {
            var speed = Number(ConfigManager.nusvAnimationSpeed || 3);
            var repeats = speed <= 3 ? 1 : (speed - 2);

            for (var i = 0; i < repeats; i++) {
                _Sprite_Animation_updateMain.call(this);
            }
        };
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.OptionsCore.version = '1.0.0';

})();