/*:
 * @plugindesc v1.0.0 NUSV Button Common Events - clean-room keyboard-to-common-event bindings for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Bindings
 * @type text
 * @default
 *
 * @param Map Only
 * @type boolean
 * @default true
 *
 * @param Forbid Default Bound Keys
 * @type boolean
 * @default true
 *
 * @param Allow During Event
 * @type boolean
 * @default false
 *
 * @param Trigger Mode
 * @type select
 * @option Triggered
 * @value triggered
 * @option Repeated
 * @value repeated
 * @default triggered
 *
 * @help
 * ============================================================================
 * NUSV_ButtonCommonEvents
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_ButtonCommonEvents source code.
 *
 * Purpose:
 * - bind keyboard keys to Common Events
 * - change bindings during gameplay
 * - clear bindings
 * - run a stored binding manually
 * - optionally protect RPG Maker MV's default control keys
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   NUSV_ButtonCommonEvents
 *
 * ============================================================================
 * DEFAULT BINDINGS
 * ============================================================================
 *
 * Plugin Parameter:
 *
 *   Default Bindings
 *
 * Format:
 *
 *   key:commonEventId,key:commonEventId
 *
 * Example:
 *
 *   1:10,2:11,H:20,J:21
 *
 * Means:
 *   Key 1 -> Common Event 10
 *   Key 2 -> Common Event 11
 *   H     -> Common Event 20
 *   J     -> Common Event 21
 *
 * ============================================================================
 * SUPPORTED KEY NAMES
 * ============================================================================
 *
 * Letters:
 *   A B C ... Z
 *
 * Number row:
 *   0 1 2 3 4 5 6 7 8 9
 *
 * Function keys:
 *   F1 ... F12
 *
 * Other useful keys:
 *   TAB
 *   SHIFT
 *   CTRL
 *   ALT
 *   SPACE
 *   ENTER
 *   ESC
 *   INSERT
 *   DELETE
 *   HOME
 *   END
 *   PAGEUP
 *   PAGEDOWN
 *   LEFT
 *   UP
 *   RIGHT
 *   DOWN
 *
 * Numpad:
 *   NUM0 ... NUM9
 *
 * Symbols:
 *   SEMICOLON
 *   EQUAL
 *   COMMA
 *   MINUS
 *   PERIOD
 *   SLASH
 *   BACKQUOTE
 *   LBRACKET
 *   BACKSLASH
 *   RBRACKET
 *   QUOTE
 *
 * ============================================================================
 * DEFAULT MV CONTROL KEYS
 * ============================================================================
 *
 * When "Forbid Default Bound Keys" = true, this plugin will not allow
 * assignment to keys commonly used by RPG Maker MV:
 *
 *   Z, X, SPACE, ENTER, ESC, INSERT
 *   SHIFT
 *   Q, W
 *   LEFT, UP, RIGHT, DOWN
 *   PAGEUP, PAGEDOWN
 *   NUM0, NUM2, NUM4, NUM6, NUM8
 *
 * This avoids breaking OK / Cancel / movement / dash / page controls.
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVButtonCE Bind H 10
 *   Bind H to Common Event 10.
 *
 * NUSVButtonCE Clear H
 *   Remove the binding from H.
 *
 * NUSVButtonCE ClearAll
 *   Remove all runtime bindings.
 *
 * NUSVButtonCE Reset
 *   Restore Default Bindings from plugin parameters.
 *
 * NUSVButtonCE Run H
 *   Run whichever Common Event is currently stored on H.
 *
 * NUSVButtonCE Enable
 * NUSVButtonCE Disable
 *
 * ============================================================================
 * SCRIPT ACCESS
 * ============================================================================
 *
 * NUSV.ButtonCommonEvents.bind('H', 10);
 * NUSV.ButtonCommonEvents.clear('H');
 * NUSV.ButtonCommonEvents.clearAll();
 * NUSV.ButtonCommonEvents.reset();
 * NUSV.ButtonCommonEvents.run('H');
 * NUSV.ButtonCommonEvents.eventId('H');
 *
 * ============================================================================
 * SAVE DATA
 * ============================================================================
 *
 * Runtime key assignments are stored on Game_System and saved with the game.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ButtonCommonEvents = true;

var NUSV = NUSV || {};
NUSV.ButtonCommonEvents = NUSV.ButtonCommonEvents || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ButtonCommonEvents';
    var params = PluginManager.parameters(pluginName);

    function pBool(name, fallback) {
        var value = params[name];
        if (value === undefined || value === '') value = fallback;
        return String(value) === 'true';
    }

    var DEFAULT_BINDINGS_TEXT = String(params['Default Bindings'] || '');
    var MAP_ONLY = pBool('Map Only', true);
    var FORBID_DEFAULT = pBool('Forbid Default Bound Keys', true);
    var ALLOW_DURING_EVENT = pBool('Allow During Event', false);
    var TRIGGER_MODE = String(params['Trigger Mode'] || 'triggered').toLowerCase();

    // -------------------------------------------------------------------------
    // Key database
    // -------------------------------------------------------------------------

    var KEY_CODES = {
        'BACKSPACE':8,
        'TAB':9,
        'ENTER':13,
        'SHIFT':16,
        'CTRL':17,
        'CONTROL':17,
        'ALT':18,
        'ESC':27,
        'ESCAPE':27,
        'SPACE':32,
        'PAGEUP':33,
        'PAGEDOWN':34,
        'END':35,
        'HOME':36,
        'LEFT':37,
        'UP':38,
        'RIGHT':39,
        'DOWN':40,
        'INSERT':45,
        'DELETE':46,

        '0':48,'1':49,'2':50,'3':51,'4':52,
        '5':53,'6':54,'7':55,'8':56,'9':57,

        'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,
        'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,
        'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,
        'V':86,'W':87,'X':88,'Y':89,'Z':90,

        'NUM0':96,'NUM1':97,'NUM2':98,'NUM3':99,'NUM4':100,
        'NUM5':101,'NUM6':102,'NUM7':103,'NUM8':104,'NUM9':105,

        'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,
        'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,

        'SEMICOLON':186,
        'EQUAL':187,
        'COMMA':188,
        'MINUS':189,
        'PERIOD':190,
        'SLASH':191,
        'BACKQUOTE':192,
        'LBRACKET':219,
        'BACKSLASH':220,
        'RBRACKET':221,
        'QUOTE':222
    };

    var DEFAULT_BOUND = {
        'Q':true,
        'W':true,
        'SHIFT':true,
        'Z':true,
        'X':true,
        'SPACE':true,
        'ENTER':true,
        'ESC':true,
        'ESCAPE':true,
        'INSERT':true,
        'PAGEUP':true,
        'PAGEDOWN':true,
        'LEFT':true,
        'UP':true,
        'RIGHT':true,
        'DOWN':true,
        'NUM0':true,
        'NUM2':true,
        'NUM4':true,
        'NUM6':true,
        'NUM8':true
    };

    function normalizeKey(key) {
        return String(key || '').trim().toUpperCase().replace(/\s+/g, '');
    }

    function isSupportedKey(key) {
        return KEY_CODES.hasOwnProperty(normalizeKey(key));
    }

    function isForbiddenKey(key) {
        return FORBID_DEFAULT && !!DEFAULT_BOUND[normalizeKey(key)];
    }

    function parseDefaultBindings() {
        var result = {};
        if (!DEFAULT_BINDINGS_TEXT) return result;

        DEFAULT_BINDINGS_TEXT.split(',').forEach(function(entry) {
            var parts = entry.split(':');
            if (parts.length < 2) return;

            var key = normalizeKey(parts[0]);
            var eventId = Number(parts[1] || 0);

            if (!isSupportedKey(key)) return;
            if (isForbiddenKey(key)) return;
            if (eventId <= 0) return;

            result[key] = eventId;
        });

        return result;
    }

    // -------------------------------------------------------------------------
    // Input tracking
    // -------------------------------------------------------------------------

    var keyDown = {};
    var keyTriggered = {};

    function onKeyDown(event) {
        var code = Number(event.keyCode || event.which || 0);
        if (!code) return;

        if (!keyDown[code]) {
            keyTriggered[code] = true;
        }

        keyDown[code] = true;
    }

    function onKeyUp(event) {
        var code = Number(event.keyCode || event.which || 0);
        if (!code) return;
        keyDown[code] = false;
    }

    function clearTriggers() {
        keyTriggered = {};
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function isPressedByName(name) {
        var code = KEY_CODES[normalizeKey(name)];
        if (!code) return false;

        if (TRIGGER_MODE === 'repeated') {
            return !!keyDown[code];
        }

        return !!keyTriggered[code];
    }

    // -------------------------------------------------------------------------
    // Game_System storage
    // -------------------------------------------------------------------------

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._nusvButtonCEBindings = parseDefaultBindings();
        this._nusvButtonCEEnabled = true;
    };

    Game_System.prototype.nusvInitButtonCE = function() {
        if (!this._nusvButtonCEBindings) {
            this._nusvButtonCEBindings = parseDefaultBindings();
        }
        if (this._nusvButtonCEEnabled === undefined) {
            this._nusvButtonCEEnabled = true;
        }
    };

    Game_System.prototype.nusvButtonCEBindings = function() {
        this.nusvInitButtonCE();
        return this._nusvButtonCEBindings;
    };

    Game_System.prototype.nusvButtonCEEnabled = function() {
        this.nusvInitButtonCE();
        return !!this._nusvButtonCEEnabled;
    };

    Game_System.prototype.nusvBindButtonCE = function(key, eventId) {
        this.nusvInitButtonCE();

        key = normalizeKey(key);
        eventId = Number(eventId || 0);

        if (!isSupportedKey(key)) {
            console.warn(pluginName + ': unsupported key "' + key + '".');
            return false;
        }

        if (isForbiddenKey(key)) {
            console.warn(pluginName + ': key "' + key + '" is protected by Forbid Default Bound Keys.');
            return false;
        }

        if (eventId <= 0 || !$dataCommonEvents[eventId]) {
            console.warn(pluginName + ': invalid Common Event ID ' + eventId + '.');
            return false;
        }

        this._nusvButtonCEBindings[key] = eventId;
        return true;
    };

    Game_System.prototype.nusvClearButtonCE = function(key) {
        this.nusvInitButtonCE();
        delete this._nusvButtonCEBindings[normalizeKey(key)];
    };

    Game_System.prototype.nusvClearAllButtonCE = function() {
        this._nusvButtonCEBindings = {};
    };

    Game_System.prototype.nusvResetButtonCE = function() {
        this._nusvButtonCEBindings = parseDefaultBindings();
    };

    Game_System.prototype.nusvButtonCEEventId = function(key) {
        this.nusvInitButtonCE();
        return Number(this._nusvButtonCEBindings[normalizeKey(key)] || 0);
    };

    // -------------------------------------------------------------------------
    // Running Common Events
    // -------------------------------------------------------------------------

    function canRunNow() {
        if (!$gameSystem || !$gameSystem.nusvButtonCEEnabled()) return false;

        if (MAP_ONLY && !(SceneManager._scene instanceof Scene_Map)) {
            return false;
        }

        if (!$gameMap || !$gamePlayer) return false;

        if (!ALLOW_DURING_EVENT && $gameMap.isEventRunning()) {
            return false;
        }

        if ($gameMessage && $gameMessage.isBusy()) {
            return false;
        }

        return true;
    }

    function reserveCommonEvent(eventId) {
        eventId = Number(eventId || 0);
        if (eventId <= 0 || !$dataCommonEvents[eventId]) return false;

        $gameTemp.reserveCommonEvent(eventId);
        return true;
    }

    function runKey(key) {
        if (!canRunNow()) return false;

        var eventId = $gameSystem.nusvButtonCEEventId(key);
        if (eventId <= 0) return false;

        return reserveCommonEvent(eventId);
    }

    // -------------------------------------------------------------------------
    // Scene_Map polling
    // -------------------------------------------------------------------------

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if (canRunNow()) {
            var bindings = $gameSystem.nusvButtonCEBindings();
            var keys = Object.keys(bindings);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                if (isPressedByName(key)) {
                    reserveCommonEvent(bindings[key]);

                    // One common event per frame to avoid collision.
                    break;
                }
            }
        }

        clearTriggers();
    };

    // Also clear transient trigger state when changing scene.
    var _SceneManager_changeScene = SceneManager.changeScene;
    SceneManager.changeScene = function() {
        clearTriggers();
        _SceneManager_changeScene.call(this);
    };

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command || '').toLowerCase() !== 'nusvbuttonce') return;

        var action = String(args[0] || '').toLowerCase();

        if (action === 'bind') {
            $gameSystem.nusvBindButtonCE(args[1], Number(args[2] || 0));

        } else if (action === 'clear') {
            $gameSystem.nusvClearButtonCE(args[1]);

        } else if (action === 'clearall') {
            $gameSystem.nusvClearAllButtonCE();

        } else if (action === 'reset') {
            $gameSystem.nusvResetButtonCE();

        } else if (action === 'run') {
            runKey(args[1]);

        } else if (action === 'enable') {
            $gameSystem._nusvButtonCEEnabled = true;

        } else if (action === 'disable') {
            $gameSystem._nusvButtonCEEnabled = false;
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.ButtonCommonEvents.bind = function(key, eventId) {
        return $gameSystem.nusvBindButtonCE(key, eventId);
    };

    NUSV.ButtonCommonEvents.clear = function(key) {
        $gameSystem.nusvClearButtonCE(key);
    };

    NUSV.ButtonCommonEvents.clearAll = function() {
        $gameSystem.nusvClearAllButtonCE();
    };

    NUSV.ButtonCommonEvents.reset = function() {
        $gameSystem.nusvResetButtonCE();
    };

    NUSV.ButtonCommonEvents.run = runKey;

    NUSV.ButtonCommonEvents.eventId = function(key) {
        return $gameSystem.nusvButtonCEEventId(key);
    };

    NUSV.ButtonCommonEvents.supportedKeys = function() {
        return Object.keys(KEY_CODES);
    };

    NUSV.ButtonCommonEvents.version = '1.0.0';

})();