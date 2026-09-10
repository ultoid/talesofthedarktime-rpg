/*:
 * @plugindesc v1.0.0 NUSV Difficulty Slider - clean-room difficulty presets & runtime scaling for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Difficulty
 * @type number
 * @min 1
 * @default 2
 *
 * @param Difficulty 1 Name
 * @type text
 * @default Easy
 *
 * @param Difficulty 2 Name
 * @type text
 * @default Normal
 *
 * @param Difficulty 3 Name
 * @type text
 * @default Hard
 *
 * @param Difficulty 4 Name
 * @type text
 * @default Nightmare
 *
 * @param Difficulty 1 Param Rate
 * @type number
 * @decimals 2
 * @default 80
 *
 * @param Difficulty 2 Param Rate
 * @type number
 * @decimals 2
 * @default 100
 *
 * @param Difficulty 3 Param Rate
 * @type number
 * @decimals 2
 * @default 125
 *
 * @param Difficulty 4 Param Rate
 * @type number
 * @decimals 2
 * @default 150
 *
 * @param Difficulty 1 EXP Rate
 * @type number
 * @decimals 2
 * @default 110
 *
 * @param Difficulty 2 EXP Rate
 * @type number
 * @decimals 2
 * @default 100
 *
 * @param Difficulty 3 EXP Rate
 * @type number
 * @decimals 2
 * @default 110
 *
 * @param Difficulty 4 EXP Rate
 * @type number
 * @decimals 2
 * @default 125
 *
 * @param Difficulty 1 Gold Rate
 * @type number
 * @decimals 2
 * @default 110
 *
 * @param Difficulty 2 Gold Rate
 * @type number
 * @decimals 2
 * @default 100
 *
 * @param Difficulty 3 Gold Rate
 * @type number
 * @decimals 2
 * @default 110
 *
 * @param Difficulty 4 Gold Rate
 * @type number
 * @decimals 2
 * @default 125
 *
 * @param Show In Options
 * @type boolean
 * @default true
 *
 * @param Option Name
 * @type text
 * @default Difficulty
 *
 * @help
 * ============================================================================
 * NUSV_DifficultySlider
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_DifficultySlider source code.
 *
 * Purpose:
 * - selectable difficulty presets
 * - persistent difficulty setting through ConfigManager
 * - enemy parameter scaling
 * - EXP and Gold reward scaling
 * - enemy-specific difficulty immunity or custom rates
 * - script/plugin-command access
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   NUSV_OptionsCore          (if used)
 *   YEP_BattleEngineCore
 *   NUSV_EnemyLevels         (if used)
 *   NUSV_DifficultySlider
 *
 * ============================================================================
 * GLOBAL DIFFICULTY PRESETS
 * ============================================================================
 *
 * Difficulty values are 1..4.
 *
 * Default presets:
 *
 * 1 Easy
 * 2 Normal
 * 3 Hard
 * 4 Nightmare
 *
 * Each preset has:
 *
 *   Param Rate
 *   EXP Rate
 *   Gold Rate
 *
 * Example:
 * Param Rate 125 = enemy parameters become 125%.
 *
 * ============================================================================
 * ENEMY NOTETAGS
 * ============================================================================
 *
 * <No Difficulty Scaling>
 *   Enemy ignores difficulty parameter scaling.
 *
 * <Difficulty Param Rate: 150%>
 *   Multiplies global difficulty parameter scaling by 150%.
 *
 * <Difficulty EXP Rate: 120%>
 *   Multiplies global EXP difficulty scaling by 120%.
 *
 * <Difficulty Gold Rate: 120%>
 *   Multiplies global Gold difficulty scaling by 120%.
 *
 * ============================================================================
 * DIFFICULTY-SPECIFIC ENEMY RATE
 * ============================================================================
 *
 * <Difficulty 3 Param Rate: 140%>
 * <Difficulty 4 Param Rate: 175%>
 *
 * Same syntax for:
 *
 * <Difficulty 3 EXP Rate: 120%>
 * <Difficulty 3 Gold Rate: 120%>
 *
 * These override the generic enemy difficulty modifiers for that specific
 * difficulty slot.
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVDifficulty Set 1
 * NUSVDifficulty Set 2
 * NUSVDifficulty Set 3
 * NUSVDifficulty Set 4
 *
 * NUSVDifficulty Next
 * NUSVDifficulty Previous
 *
 * ============================================================================
 * SCRIPT ACCESS
 * ============================================================================
 *
 * ConfigManager.nusvDifficulty
 *
 * NUSV.DifficultySlider.current()
 * NUSV.DifficultySlider.set(3)
 * NUSV.DifficultySlider.name()
 * NUSV.DifficultySlider.paramRate()
 * NUSV.DifficultySlider.expRate()
 * NUSV.DifficultySlider.goldRate()
 *
 * ============================================================================
 * NUSVANIR NOTE
 * ============================================================================
 *
 * This plugin scales enemy database stats AFTER EnemyLevels scaling.
 *
 * Example:
 * EnemyLevels gives an enemy 120 ATK.
 * Difficulty Hard = 125%.
 * Final ATK = 150.
 *
 * This keeps Tier/Rank + EnemyLevels + Difficulty as separate layers.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_DifficultySlider = true;

var NUSV = NUSV || {};
NUSV.DifficultySlider = NUSV.DifficultySlider || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_DifficultySlider';
    var params = PluginManager.parameters(pluginName);

    function pNum(name, fallback) {
        var n = Number(params[name]);
        return isNaN(n) ? fallback : n;
    }

    function pBool(name, fallback) {
        var value = params[name];
        if (value === undefined || value === '') value = fallback;
        return String(value) === 'true';
    }

    function pText(name, fallback) {
        var value = params[name];
        return value == null || value === '' ? fallback : String(value);
    }

    var DEFAULT_DIFFICULTY = Math.max(1, Math.min(4, pNum('Default Difficulty', 2)));
    var SHOW_IN_OPTIONS = pBool('Show In Options', true);
    var OPTION_NAME = pText('Option Name', 'Difficulty');

    var PRESETS = {
        1: {
            name: pText('Difficulty 1 Name', 'Easy'),
            paramRate: pNum('Difficulty 1 Param Rate', 80) / 100,
            expRate: pNum('Difficulty 1 EXP Rate', 110) / 100,
            goldRate: pNum('Difficulty 1 Gold Rate', 110) / 100
        },
        2: {
            name: pText('Difficulty 2 Name', 'Normal'),
            paramRate: pNum('Difficulty 2 Param Rate', 100) / 100,
            expRate: pNum('Difficulty 2 EXP Rate', 100) / 100,
            goldRate: pNum('Difficulty 2 Gold Rate', 100) / 100
        },
        3: {
            name: pText('Difficulty 3 Name', 'Hard'),
            paramRate: pNum('Difficulty 3 Param Rate', 125) / 100,
            expRate: pNum('Difficulty 3 EXP Rate', 110) / 100,
            goldRate: pNum('Difficulty 3 Gold Rate', 110) / 100
        },
        4: {
            name: pText('Difficulty 4 Name', 'Nightmare'),
            paramRate: pNum('Difficulty 4 Param Rate', 150) / 100,
            expRate: pNum('Difficulty 4 EXP Rate', 125) / 100,
            goldRate: pNum('Difficulty 4 Gold Rate', 125) / 100
        }
    };

    function clampDifficulty(value) {
        value = Math.round(Number(value || DEFAULT_DIFFICULTY));
        return Math.max(1, Math.min(4, value));
    }

    function currentDifficulty() {
        return clampDifficulty(ConfigManager.nusvDifficulty);
    }

    function currentPreset() {
        return PRESETS[currentDifficulty()];
    }

    function note(obj) {
        return obj && obj.note ? String(obj.note) : '';
    }

    function readPercentTag(obj, tag, fallback) {
        var re = new RegExp('<' + tag + ':\\s*([+\\-]?\\d+(?:\\.\\d+)?)%?\\s*>', 'i');
        var m = re.exec(note(obj));
        return m ? Number(m[1]) / 100 : fallback;
    }

    // -------------------------------------------------------------------------
    // ConfigManager
    // -------------------------------------------------------------------------

    ConfigManager.nusvDifficulty = DEFAULT_DIFFICULTY;

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this);
        config.nusvDifficulty = this.nusvDifficulty;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        this.nusvDifficulty = clampDifficulty(config.nusvDifficulty || DEFAULT_DIFFICULTY);
    };

    // -------------------------------------------------------------------------
    // Options Menu Integration
    // -------------------------------------------------------------------------

    if (SHOW_IN_OPTIONS) {
        var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
        Window_Options.prototype.makeCommandList = function() {
            _Window_Options_makeCommandList.call(this);

            var exists = this._list.some(function(cmd) {
                return cmd.symbol === 'nusvDifficulty';
            });

            if (!exists) {
                this.addCommand(OPTION_NAME, 'nusvDifficulty');
            }
        };

        var _Window_Options_statusText = Window_Options.prototype.statusText;
        Window_Options.prototype.statusText = function(index) {
            var symbol = this.commandSymbol(index);

            if (symbol === 'nusvDifficulty') {
                return PRESETS[clampDifficulty(this.getConfigValue(symbol))].name;
            }

            return _Window_Options_statusText.call(this, index);
        };

        var _Window_Options_processOk = Window_Options.prototype.processOk;
        Window_Options.prototype.processOk = function() {
            var symbol = this.commandSymbol(this.index());

            if (symbol === 'nusvDifficulty') {
                var value = clampDifficulty(this.getConfigValue(symbol) + 1);
                if (this.getConfigValue(symbol) >= 4) value = 1;
                this.changeValue(symbol, value);
                return;
            }

            _Window_Options_processOk.call(this);
        };

        var _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
        Window_Options.prototype.cursorRight = function(wrap) {
            var symbol = this.commandSymbol(this.index());

            if (symbol === 'nusvDifficulty') {
                var value = Math.min(4, clampDifficulty(this.getConfigValue(symbol)) + 1);
                this.changeValue(symbol, value);
                return;
            }

            _Window_Options_cursorRight.call(this, wrap);
        };

        var _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
        Window_Options.prototype.cursorLeft = function(wrap) {
            var symbol = this.commandSymbol(this.index());

            if (symbol === 'nusvDifficulty') {
                var value = Math.max(1, clampDifficulty(this.getConfigValue(symbol)) - 1);
                this.changeValue(symbol, value);
                return;
            }

            _Window_Options_cursorLeft.call(this, wrap);
        };
    }

    // -------------------------------------------------------------------------
    // Enemy difficulty modifiers
    // -------------------------------------------------------------------------

    Game_Enemy.prototype.nusvDifficultyParamRate = function() {
        var obj = this.enemy();

        if (/<No Difficulty Scaling>/i.test(note(obj))) {
            return 1.0;
        }

        var difficulty = currentDifficulty();
        var globalRate = PRESETS[difficulty].paramRate;

        var generic = readPercentTag(obj, 'Difficulty Param Rate', 1.0);
        var specific = readPercentTag(
            obj,
            'Difficulty ' + difficulty + ' Param Rate',
            null
        );

        var localRate = specific !== null ? specific : generic;
        return Math.max(0, globalRate * localRate);
    };

    Game_Enemy.prototype.nusvDifficultyExpRate = function() {
        var obj = this.enemy();
        var difficulty = currentDifficulty();
        var globalRate = PRESETS[difficulty].expRate;

        var generic = readPercentTag(obj, 'Difficulty EXP Rate', 1.0);
        var specific = readPercentTag(
            obj,
            'Difficulty ' + difficulty + ' EXP Rate',
            null
        );

        var localRate = specific !== null ? specific : generic;
        return Math.max(0, globalRate * localRate);
    };

    Game_Enemy.prototype.nusvDifficultyGoldRate = function() {
        var obj = this.enemy();
        var difficulty = currentDifficulty();
        var globalRate = PRESETS[difficulty].goldRate;

        var generic = readPercentTag(obj, 'Difficulty Gold Rate', 1.0);
        var specific = readPercentTag(
            obj,
            'Difficulty ' + difficulty + ' Gold Rate',
            null
        );

        var localRate = specific !== null ? specific : generic;
        return Math.max(0, globalRate * localRate);
    };

    var _Game_Enemy_paramBase = Game_Enemy.prototype.paramBase;
    Game_Enemy.prototype.paramBase = function(paramId) {
        var base = _Game_Enemy_paramBase.call(this, paramId);
        return Math.max(0, Math.round(base * this.nusvDifficultyParamRate()));
    };

    var _Game_Enemy_exp = Game_Enemy.prototype.exp;
    Game_Enemy.prototype.exp = function() {
        var base = _Game_Enemy_exp.call(this);
        return Math.max(0, Math.round(base * this.nusvDifficultyExpRate()));
    };

    var _Game_Enemy_gold = Game_Enemy.prototype.gold;
    Game_Enemy.prototype.gold = function() {
        var base = _Game_Enemy_gold.call(this);
        return Math.max(0, Math.round(base * this.nusvDifficultyGoldRate()));
    };

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command || '').toLowerCase() !== 'nusvdifficulty') return;

        var action = String(args[0] || '').toLowerCase();

        if (action === 'set') {
            ConfigManager.nusvDifficulty = clampDifficulty(Number(args[1] || DEFAULT_DIFFICULTY));
            ConfigManager.save();
        } else if (action === 'next') {
            ConfigManager.nusvDifficulty =
                ConfigManager.nusvDifficulty >= 4 ? 1 : ConfigManager.nusvDifficulty + 1;
            ConfigManager.save();
        } else if (action === 'previous') {
            ConfigManager.nusvDifficulty =
                ConfigManager.nusvDifficulty <= 1 ? 4 : ConfigManager.nusvDifficulty - 1;
            ConfigManager.save();
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.DifficultySlider.current = function() {
        return currentDifficulty();
    };

    NUSV.DifficultySlider.set = function(value) {
        ConfigManager.nusvDifficulty = clampDifficulty(value);
        ConfigManager.save();
    };

    NUSV.DifficultySlider.name = function() {
        return currentPreset().name;
    };

    NUSV.DifficultySlider.paramRate = function() {
        return currentPreset().paramRate;
    };

    NUSV.DifficultySlider.expRate = function() {
        return currentPreset().expRate;
    };

    NUSV.DifficultySlider.goldRate = function() {
        return currentPreset().goldRate;
    };

    NUSV.DifficultySlider.version = '1.0.0';

})();