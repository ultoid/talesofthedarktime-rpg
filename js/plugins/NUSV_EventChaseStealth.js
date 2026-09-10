/*:
 * @plugindesc v1.0.0 NUSV Event Chase Stealth - clean-room stealth extension for RPG Maker MV chase events.
 * @author Ultoid
 *
 * @param Default Stealth Duration
 * @type number
 * @min 0
 * @default 300
 *
 * @param Use Frames
 * @type boolean
 * @default true
 *
 * @param Stealth Regions
 * @type text
 * @default
 *
 * @param Region Grants Stealth
 * @type boolean
 * @default true
 *
 * @param Region Blocks Detection
 * @type boolean
 * @default true
 *
 * @param Show Stealth Switch
 * @type switch
 * @default 0
 *
 * @param Disable Dash While Stealth
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * NUSV_EventChaseStealth
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_EventChaseStealth source code.
 *
 * Goal:
 * - provide player Stealth Mode for chase/detection events
 * - timed or unlimited stealth
 * - stealth regions
 * - per-event detection bypass/block behavior
 * - integrate with YEP_EventChasePlayer if installed
 *
 * Official YEP concept this plugin aims to cover:
 * while in Stealth Mode, chase events should not detect/alert from the player.
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_EventChasePlayer
 *   NUSV_EventChaseStealth
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVStealth On
 *   Enables unlimited Stealth Mode.
 *
 * NUSVStealth Off
 *   Disables Stealth Mode.
 *
 * NUSVStealth Toggle
 *
 * NUSVStealth Time 300
 *   Enables timed stealth.
 *
 * NUSVStealth Add 120
 *   Adds duration to active timed stealth.
 *
 * NUSVStealth Set 600
 *   Sets timed stealth duration.
 *
 * NUSVStealth Clear
 *   Same as Off.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * $gamePlayer.nusvSetStealth(true)
 * $gamePlayer.nusvSetStealth(false)
 * $gamePlayer.nusvSetTimedStealth(300)
 * $gamePlayer.nusvAddStealthTime(120)
 * $gamePlayer.nusvIsStealth()
 * $gamePlayer.nusvStealthTime()
 *
 * ============================================================================
 * STEALTH REGIONS
 * ============================================================================
 *
 * Plugin Parameter:
 *
 *   Stealth Regions
 *
 * Example:
 *
 *   5,6,7
 *
 * If Region Grants Stealth = true:
 * standing on one of those region IDs counts as stealth.
 *
 * If Region Blocks Detection = true:
 * chase events also treat the player as hidden while on those regions.
 *
 * ============================================================================
 * EVENT NOTETAGS / COMMENTS
 * ============================================================================
 *
 * Put these in an Event's note-like page comments.
 * Use a COMMENT event command on the active page.
 *
 * <Ignore Stealth>
 *   This event can detect the player even while the player is in stealth.
 *
 * <Stealth Only>
 *   This event only reacts when player is NOT in stealth.
 *   This is mainly an explicit readability tag; default chase behavior already
 *   respects stealth.
 *
 * <Stealth Detect Region: 10>
 *   Event can still detect player in stealth if player stands on Region 10.
 *
 * <Stealth Block Region: 11>
 *   Event cannot detect player while player stands on Region 11.
 *
 * ============================================================================
 * EVENT PAGE COMMENT EXAMPLE
 * ============================================================================
 *
 * Comment:
 *   <Ignore Stealth>
 *
 * or
 *
 * Comment:
 *   <Stealth Block Region: 12>
 *
 * ============================================================================
 * SWITCH MIRROR
 * ============================================================================
 *
 * If "Show Stealth Switch" is set to a Switch ID, this plugin automatically
 * mirrors current effective stealth status to that switch.
 *
 * Useful for:
 * - UI icon
 * - Common Events
 * - map effects
 * - stealth tutorials
 *
 * ============================================================================
 * COMPATIBILITY
 * ============================================================================
 *
 * This plugin provides compatibility wrappers for common detection entry
 * points used by YEP_EventChasePlayer-style implementations:
 *
 *   Game_Event.prototype.updateChaseDistance
 *   Game_Event.prototype.canSeePlayer
 *   Game_Event.prototype.isNearThePlayer
 *
 * If YEP_EventChasePlayer is installed, put this plugin BELOW it.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_EventChaseStealth = true;

var NUSV = NUSV || {};
NUSV.EventChaseStealth = NUSV.EventChaseStealth || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_EventChaseStealth';
    var params = PluginManager.parameters(pluginName);

    function pBool(name, fallback) {
        var v = params[name];
        if (v === undefined || v === '') v = fallback;
        return String(v) === 'true';
    }

    function pNum(name, fallback) {
        var n = Number(params[name]);
        return isNaN(n) ? fallback : n;
    }

    function parseRegionList(text) {
        return String(text || '')
            .split(',')
            .map(function(x) { return Number(String(x).trim()); })
            .filter(function(x) { return x > 0; });
    }

    var DEFAULT_DURATION = Math.max(0, Math.floor(pNum('Default Stealth Duration', 300)));
    var USE_FRAMES = pBool('Use Frames', true);
    var STEALTH_REGIONS = parseRegionList(params['Stealth Regions']);
    var REGION_GRANTS_STEALTH = pBool('Region Grants Stealth', true);
    var REGION_BLOCKS_DETECTION = pBool('Region Blocks Detection', true);
    var STEALTH_SWITCH = Math.max(0, Math.floor(pNum('Show Stealth Switch', 0)));
    var DISABLE_DASH = pBool('Disable Dash While Stealth', false);

    // -------------------------------------------------------------------------
    // Game_Player
    // -------------------------------------------------------------------------

    var _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        _Game_Player_initialize.call(this);
        this._nusvStealthMode = false;
        this._nusvStealthTimed = false;
        this._nusvStealthTime = 0;
        this._nusvStealthTickCounter = 0;
    };

    Game_Player.prototype.nusvInitStealth = function() {
        if (this._nusvStealthMode === undefined) this._nusvStealthMode = false;
        if (this._nusvStealthTimed === undefined) this._nusvStealthTimed = false;
        if (this._nusvStealthTime === undefined) this._nusvStealthTime = 0;
        if (this._nusvStealthTickCounter === undefined) this._nusvStealthTickCounter = 0;
    };

    Game_Player.prototype.nusvRegionStealth = function() {
        if (!REGION_GRANTS_STEALTH) return false;
        return STEALTH_REGIONS.indexOf(this.regionId()) >= 0;
    };

    Game_Player.prototype.nusvIsStealth = function() {
        this.nusvInitStealth();
        return !!this._nusvStealthMode ||
               (this._nusvStealthTimed && this._nusvStealthTime > 0) ||
               this.nusvRegionStealth();
    };

    Game_Player.prototype.nusvSetStealth = function(value) {
        this.nusvInitStealth();
        this._nusvStealthMode = !!value;
        if (value) {
            this._nusvStealthTimed = false;
            this._nusvStealthTime = 0;
        }
        this.nusvSyncStealthSwitch();
    };

    Game_Player.prototype.nusvSetTimedStealth = function(value) {
        this.nusvInitStealth();
        value = Math.max(0, Math.floor(Number(value || DEFAULT_DURATION)));
        this._nusvStealthMode = false;
        this._nusvStealthTimed = value > 0;
        this._nusvStealthTime = value;
        this._nusvStealthTickCounter = 0;
        this.nusvSyncStealthSwitch();
    };

    Game_Player.prototype.nusvAddStealthTime = function(value) {
        this.nusvInitStealth();
        value = Math.floor(Number(value || 0));
        if (!this._nusvStealthTimed) {
            this._nusvStealthTimed = true;
            this._nusvStealthMode = false;
        }
        this._nusvStealthTime = Math.max(0, this._nusvStealthTime + value);
        if (this._nusvStealthTime <= 0) this._nusvStealthTimed = false;
        this.nusvSyncStealthSwitch();
    };

    Game_Player.prototype.nusvStealthTime = function() {
        this.nusvInitStealth();
        return Math.max(0, this._nusvStealthTime || 0);
    };

    Game_Player.prototype.nusvClearStealth = function() {
        this.nusvInitStealth();
        this._nusvStealthMode = false;
        this._nusvStealthTimed = false;
        this._nusvStealthTime = 0;
        this._nusvStealthTickCounter = 0;
        this.nusvSyncStealthSwitch();
    };

    Game_Player.prototype.nusvSyncStealthSwitch = function() {
        if (STEALTH_SWITCH > 0 && $gameSwitches) {
            $gameSwitches.setValue(STEALTH_SWITCH, this.nusvIsStealth());
        }
    };

    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        this.nusvUpdateStealthTimer();
        this.nusvSyncStealthSwitch();
    };

    Game_Player.prototype.nusvUpdateStealthTimer = function() {
        this.nusvInitStealth();
        if (!this._nusvStealthTimed || this._nusvStealthTime <= 0) return;

        if (USE_FRAMES) {
            this._nusvStealthTime--;
        } else {
            this._nusvStealthTickCounter++;
            if (this._nusvStealthTickCounter >= 60) {
                this._nusvStealthTickCounter = 0;
                this._nusvStealthTime--;
            }
        }

        if (this._nusvStealthTime <= 0) {
            this._nusvStealthTime = 0;
            this._nusvStealthTimed = false;
        }
    };

    if (DISABLE_DASH) {
        var _Game_Player_isDashing = Game_Player.prototype.isDashing;
        Game_Player.prototype.isDashing = function() {
            if (this.nusvIsStealth()) return false;
            return _Game_Player_isDashing.call(this);
        };
    }

    // -------------------------------------------------------------------------
    // Event page comments
    // -------------------------------------------------------------------------

    Game_Event.prototype.nusvStealthCommentText = function() {
        var page = this.page();
        if (!page || !page.list) return '';

        var text = '';
        for (var i = 0; i < page.list.length; i++) {
            var cmd = page.list[i];
            if (cmd && (cmd.code === 108 || cmd.code === 408)) {
                text += String(cmd.parameters[0] || '') + '\n';
            }
        }
        return text;
    };

    Game_Event.prototype.nusvIgnoresStealth = function() {
        return /<Ignore Stealth>/i.test(this.nusvStealthCommentText());
    };

    Game_Event.prototype.nusvStealthDetectRegion = function() {
        var m = /<Stealth Detect Region:\s*(\d+)\s*>/i.exec(this.nusvStealthCommentText());
        return m ? Number(m[1]) : 0;
    };

    Game_Event.prototype.nusvStealthBlockRegion = function() {
        var m = /<Stealth Block Region:\s*(\d+)\s*>/i.exec(this.nusvStealthCommentText());
        return m ? Number(m[1]) : 0;
    };

    Game_Event.prototype.nusvPlayerHiddenFromThisEvent = function() {
        if (!$gamePlayer) return false;

        var playerRegion = $gamePlayer.regionId();
        var blockRegion = this.nusvStealthBlockRegion();
        var detectRegion = this.nusvStealthDetectRegion();

        if (blockRegion > 0 && playerRegion === blockRegion) {
            return true;
        }

        if (REGION_BLOCKS_DETECTION &&
            STEALTH_REGIONS.indexOf(playerRegion) >= 0 &&
            !this.nusvIgnoresStealth()) {
            return true;
        }

        if (!$gamePlayer.nusvIsStealth()) {
            return false;
        }

        if (this.nusvIgnoresStealth()) {
            return false;
        }

        if (detectRegion > 0 && playerRegion === detectRegion) {
            return false;
        }

        return true;
    };

    // -------------------------------------------------------------------------
    // Compatibility wrappers
    // -------------------------------------------------------------------------

    if (Game_Event.prototype.updateChaseDistance) {
        var _Game_Event_updateChaseDistance = Game_Event.prototype.updateChaseDistance;
        Game_Event.prototype.updateChaseDistance = function() {
            if (this.nusvPlayerHiddenFromThisEvent()) {
                if (this._chaseRange !== undefined) this._chaseRange = 0;
                if (this._alertLock !== undefined) this._alertLock = 0;
                return;
            }
            return _Game_Event_updateChaseDistance.apply(this, arguments);
        };
    }

    if (Game_Event.prototype.canSeePlayer) {
        var _Game_Event_canSeePlayer = Game_Event.prototype.canSeePlayer;
        Game_Event.prototype.canSeePlayer = function() {
            if (this.nusvPlayerHiddenFromThisEvent()) return false;
            return _Game_Event_canSeePlayer.apply(this, arguments);
        };
    }

    if (Game_Event.prototype.isNearThePlayer) {
        var _Game_Event_isNearThePlayer = Game_Event.prototype.isNearThePlayer;
        Game_Event.prototype.isNearThePlayer = function() {
            if (this.nusvPlayerHiddenFromThisEvent()) return false;
            return _Game_Event_isNearThePlayer.apply(this, arguments);
        };
    }

    // Generic fallback helper for custom chase scripts.
    Game_Event.prototype.nusvCanDetectPlayer = function() {
        return !this.nusvPlayerHiddenFromThisEvent();
    };

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command || '').toLowerCase() !== 'nusvstealth') return;

        var action = String(args[0] || '').toLowerCase();

        if (action === 'on') {
            $gamePlayer.nusvSetStealth(true);
        } else if (action === 'off' || action === 'clear') {
            $gamePlayer.nusvClearStealth();
        } else if (action === 'toggle') {
            $gamePlayer.nusvSetStealth(!$gamePlayer.nusvIsStealth());
        } else if (action === 'time' || action === 'set') {
            $gamePlayer.nusvSetTimedStealth(Number(args[1] || DEFAULT_DURATION));
        } else if (action === 'add') {
            $gamePlayer.nusvAddStealthTime(Number(args[1] || 0));
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.EventChaseStealth.stealthRegions = function() {
        return STEALTH_REGIONS.slice();
    };

    NUSV.EventChaseStealth.version = '1.0.0';

})();