/*:
 * @plugindesc v1.0.1 NUSV Enemy Levels - clean-room enemy level & scaling system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Level
 * @type number
 * @min 1
 * @default 1
 *
 * @param Minimum Level
 * @type number
 * @min 1
 * @default 1
 *
 * @param Maximum Level
 * @type number
 * @min 1
 * @default 99
 *
 * @param Use Party Level
 * @type boolean
 * @default false
 *
 * @param Party Level Mode
 * @type select
 * @option Average
 * @value average
 * @option Highest
 * @value highest
 * @option Lowest
 * @value lowest
 * @default average
 *
 * @param Default Level Variance
 * @type number
 * @min 0
 * @default 0
 *
 * @param Default Param Growth
 * @type number
 * @decimals 2
 * @default 0
 *
 * @param Default EXP Growth
 * @type number
 * @decimals 2
 * @default 0
 *
 * @param Default Gold Growth
 * @type number
 * @decimals 2
 * @default 0
 *
 * @param Show Level In Name
 * @type boolean
 * @default false
 *
 * @param Level Name Format
 * @type text
 * @default %1 Lv.%2
 *
 * @help
 * ============================================================================
 * NUSV_EnemyLevels
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_EnemyLevels source code.
 *
 * Purpose:
 * - give enemies a Level value
 * - fixed, ranged, party-based, or formula-based enemy levels
 * - minimum / maximum level limits
 * - optional level variance
 * - scale parameters, EXP, and Gold by level
 * - expose enemy.level for formulas and other plugins
 * - runtime level changes through plugin commands
 *
 * This plugin is designed so Nusvanir's existing Tier/Rank balancing is NOT
 * changed unless you explicitly enable growth values or add growth notetags.
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   NUSV_EnemyLevels
 *
 * ============================================================================
 * BASIC ENEMY NOTETAGS
 * ============================================================================
 *
 * <Enemy Level: 10>
 *   Fixed Level 10.
 *
 * <Enemy Level: 5 to 12>
 *   Random Level between 5 and 12.
 *
 * <Enemy Level: Party>
 *   Uses party level according to Party Level Mode.
 *
 * <Minimum Level: 5>
 * <Maximum Level: 30>
 *
 * <Level Variance: 2>
 *   Final level receives a random -2..+2 variance.
 *
 * <No Level Scaling>
 *   Enemy still has a level, but stats / EXP / Gold are not scaled.
 *
 * ============================================================================
 * CUSTOM LEVEL FORMULA
 * ============================================================================
 *
 * <Enemy Level Formula>
 * level = Math.floor(partyLevel + v[10]);
 * </Enemy Level Formula>
 *
 * Available:
 *   enemy       = current Game_Enemy
 *   party       = $gameParty
 *   partyLevel  = calculated party level
 *   s           = $gameSwitches._data
 *   v           = $gameVariables._data
 *   level       = result level
 *
 * ============================================================================
 * PARAMETER GROWTH
 * ============================================================================
 *
 * Growth is percentage PER level above Level 1.
 *
 * Example:
 *
 * <Param Growth: 3%>
 *
 * At Level 10:
 *   multiplier = 1 + (9 * 0.03) = 1.27
 *
 * Individual parameter growth:
 *
 * <MHP Growth: 5%>
 * <MMP Growth: 3%>
 * <ATK Growth: 4%>
 * <DEF Growth: 4%>
 * <MAT Growth: 4%>
 * <MDF Growth: 4%>
 * <AGI Growth: 2%>
 * <LUK Growth: 2%>
 *
 * Individual growth overrides <Param Growth>.
 *
 * ============================================================================
 * REWARD GROWTH
 * ============================================================================
 *
 * <EXP Growth: 10%>
 * <Gold Growth: 5%>
 *
 * Growth is also calculated per level above Level 1.
 *
 * ============================================================================
 * NUSVANIR RECOMMENDATION
 * ============================================================================
 *
 * Nusvanir already has Tier + Rank baseline stats.
 *
 * Therefore:
 * - leave Default Param Growth = 0
 * - leave Default EXP Growth = 0
 * - leave Default Gold Growth = 0
 *
 * Only give scaling to enemies that specifically need adaptive levels.
 *
 * Example:
 *
 * <Enemy Level: Party>
 * <Minimum Level: 10>
 * <Maximum Level: 25>
 * <Param Growth: 2%>
 * <EXP Growth: 4%>
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * Commands work during battle.
 * Troop index starts at 1.
 *
 * NUSVEnemyLevel Set 1 20
 *   Sets troop member #1 to Level 20.
 *
 * NUSVEnemyLevel Add 1 5
 *   Adds 5 levels to troop member #1.
 *
 * NUSVEnemyLevel Reset 1
 *   Recalculates troop member #1 from database notetags.
 *
 * ============================================================================
 * SCRIPT / FORMULA ACCESS
 * ============================================================================
 *
 * enemy.level
 * enemy.nusvEnemyLevel()
 * enemy.nusvSetEnemyLevel(20)
 * enemy.nusvAddEnemyLevel(5)
 * enemy.nusvResetEnemyLevel()
 *
 * Skill damage formula example:
 *
 * a.level * 10 + a.atk * 4 - b.def * 2
 *
 * Game_Enemy exposes level through this plugin.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_EnemyLevels = true;

var NUSV = NUSV || {};
NUSV.EnemyLevels = NUSV.EnemyLevels || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_EnemyLevels';
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

    var DEFAULT_LEVEL = Math.max(1, pNum('Default Level', 1));
    var GLOBAL_MIN = Math.max(1, pNum('Minimum Level', 1));
    var GLOBAL_MAX = Math.max(GLOBAL_MIN, pNum('Maximum Level', 99));
    var USE_PARTY_LEVEL = pBool('Use Party Level', false);
    var PARTY_LEVEL_MODE = String(params['Party Level Mode'] || 'average').toLowerCase();
    var DEFAULT_VARIANCE = Math.max(0, Math.floor(pNum('Default Level Variance', 0)));

    var DEFAULT_PARAM_GROWTH = pNum('Default Param Growth', 0) / 100;
    var DEFAULT_EXP_GROWTH = pNum('Default EXP Growth', 0) / 100;
    var DEFAULT_GOLD_GROWTH = pNum('Default Gold Growth', 0) / 100;

    var SHOW_LEVEL_NAME = pBool('Show Level In Name', false);
    var LEVEL_NAME_FORMAT = String(params['Level Name Format'] || '%1 Lv.%2');

    var PARAM_CODES = ['MHP','MMP','ATK','DEF','MAT','MDF','AGI','LUK'];

    function note(obj) {
        return obj && obj.note ? String(obj.note) : '';
    }

    function readNumberTag(obj, tag, fallback) {
        var re = new RegExp('<' + tag + ':\\s*([+\\-]?\\d+(?:\\.\\d+)?)\\s*>', 'i');
        var m = re.exec(note(obj));
        return m ? Number(m[1]) : fallback;
    }

    function readPercentTag(obj, tag, fallback) {
        var re = new RegExp('<' + tag + ':\\s*([+\\-]?\\d+(?:\\.\\d+)?)%?\\s*>', 'i');
        var m = re.exec(note(obj));
        if (!m) return fallback;
        return Number(m[1]) / 100;
    }

    function calculatePartyLevel() {
        var members = $gameParty ? $gameParty.battleMembers() : [];
        if (!members || members.length === 0) return DEFAULT_LEVEL;

        var levels = members.map(function(actor) {
            return Number(actor.level || 1);
        });

        if (PARTY_LEVEL_MODE === 'highest') {
            return Math.max.apply(null, levels);
        }

        if (PARTY_LEVEL_MODE === 'lowest') {
            return Math.min.apply(null, levels);
        }

        var total = levels.reduce(function(sum, value) {
            return sum + value;
        }, 0);

        return Math.max(1, Math.round(total / levels.length));
    }

    function baseLevelFromNote(gameEnemy) {
        var obj = gameEnemy.enemy();
        var text = note(obj);
        var pLevel = calculatePartyLevel();
        var level = USE_PARTY_LEVEL ? pLevel : DEFAULT_LEVEL;

        var range = /<Enemy Level:\s*(\d+)\s+to\s+(\d+)\s*>/i.exec(text);
        if (range) {
            var min = Number(range[1]);
            var max = Number(range[2]);
            if (max < min) {
                var temp = min;
                min = max;
                max = temp;
            }
            level = min + Math.randomInt(max - min + 1);
        } else {
            var fixed = /<Enemy Level:\s*(\d+)\s*>/i.exec(text);
            var party = /<Enemy Level:\s*Party\s*>/i.test(text);

            if (fixed) {
                level = Number(fixed[1]);
            } else if (party) {
                level = pLevel;
            }
        }

        var formula = /<Enemy Level Formula>([\s\S]*?)<\/Enemy Level Formula>/i.exec(text);
        if (formula) {
            try {
                var enemy = gameEnemy;
                var partyObj = $gameParty;
                var partyLevelValue = pLevel;
                var partyLevel_ = pLevel;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;

                // documented variable name
                var partyLevel = partyLevelValue;

                eval(String(formula[1] || '').trim());
            } catch (e) {
                console.error(pluginName + ': Enemy Level Formula error', obj, e);
            }
        }

        return Number(level || DEFAULT_LEVEL);
    }

    function finalCalculatedLevel(gameEnemy) {
        var obj = gameEnemy.enemy();
        var level = baseLevelFromNote(gameEnemy);

        var minLevel = readNumberTag(obj, 'Minimum Level', GLOBAL_MIN);
        var maxLevel = readNumberTag(obj, 'Maximum Level', GLOBAL_MAX);

        minLevel = Math.max(GLOBAL_MIN, minLevel);
        maxLevel = Math.min(GLOBAL_MAX, Math.max(minLevel, maxLevel));

        var variance = Math.max(0,
            Math.floor(readNumberTag(obj, 'Level Variance', DEFAULT_VARIANCE)));

        if (variance > 0) {
            level += Math.randomInt(variance * 2 + 1) - variance;
        }

        level = Math.round(level);
        return Math.max(minLevel, Math.min(maxLevel, level));
    }

    // -------------------------------------------------------------------------
    // Game_Enemy level
    // -------------------------------------------------------------------------

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this._nusvEnemyLevelOverride = null;
        this._nusvEnemyLevel = finalCalculatedLevel(this);
    };

    Game_Enemy.prototype.nusvEnemyLevel = function() {
        if (this._nusvEnemyLevelOverride !== null &&
            this._nusvEnemyLevelOverride !== undefined) {
            return this._nusvEnemyLevelOverride;
        }

        if (!this._nusvEnemyLevel) {
            this._nusvEnemyLevel = finalCalculatedLevel(this);
        }

        return this._nusvEnemyLevel;
    };

    Object.defineProperty(Game_Enemy.prototype, 'level', {
        get: function() {
            return this.nusvEnemyLevel();
        },
        configurable: true
    });

    Game_Enemy.prototype.nusvClampEnemyLevel = function(value) {
        var obj = this.enemy();
        var minLevel = Math.max(GLOBAL_MIN,
            readNumberTag(obj, 'Minimum Level', GLOBAL_MIN));
        var maxLevel = Math.min(GLOBAL_MAX,
            Math.max(minLevel, readNumberTag(obj, 'Maximum Level', GLOBAL_MAX)));

        value = Math.round(Number(value || minLevel));
        return Math.max(minLevel, Math.min(maxLevel, value));
    };

    Game_Enemy.prototype.nusvSetEnemyLevel = function(value) {
        this._nusvEnemyLevelOverride = this.nusvClampEnemyLevel(value);
        this.refresh();
    };

    Game_Enemy.prototype.nusvAddEnemyLevel = function(value) {
        this.nusvSetEnemyLevel(this.level + Number(value || 0));
    };

    Game_Enemy.prototype.nusvResetEnemyLevel = function() {
        this._nusvEnemyLevelOverride = null;
        this._nusvEnemyLevel = finalCalculatedLevel(this);
        this.refresh();
    };

    // -------------------------------------------------------------------------
    // Parameter Scaling
    // -------------------------------------------------------------------------

    function noScaling(gameEnemy) {
        return /<No Level Scaling>/i.test(note(gameEnemy.enemy()));
    }

    function genericParamGrowth(gameEnemy) {
        return readPercentTag(gameEnemy.enemy(), 'Param Growth', DEFAULT_PARAM_GROWTH);
    }

    function paramGrowth(gameEnemy, paramId) {
        var code = PARAM_CODES[paramId];
        if (!code) return genericParamGrowth(gameEnemy);
        return readPercentTag(
            gameEnemy.enemy(),
            code + ' Growth',
            genericParamGrowth(gameEnemy)
        );
    }

    function growthMultiplier(level, growth) {
        return Math.max(0, 1 + Math.max(0, level - 1) * growth);
    }

    var _Game_Enemy_paramBase = Game_Enemy.prototype.paramBase;
    Game_Enemy.prototype.paramBase = function(paramId) {
        var base = _Game_Enemy_paramBase.call(this, paramId);

        if (noScaling(this)) return base;

        var growth = paramGrowth(this, paramId);
        if (!growth) return base;

        return Math.max(0, Math.round(
            base * growthMultiplier(this.level, growth)
        ));
    };

    // -------------------------------------------------------------------------
    // EXP / Gold Scaling
    // -------------------------------------------------------------------------

    var _Game_Enemy_exp = Game_Enemy.prototype.exp;
    Game_Enemy.prototype.exp = function() {
        var base = _Game_Enemy_exp.call(this);

        if (noScaling(this)) return base;

        var growth = readPercentTag(this.enemy(), 'EXP Growth', DEFAULT_EXP_GROWTH);
        if (!growth) return base;

        return Math.max(0, Math.round(
            base * growthMultiplier(this.level, growth)
        ));
    };

    var _Game_Enemy_gold = Game_Enemy.prototype.gold;
    Game_Enemy.prototype.gold = function() {
        var base = _Game_Enemy_gold.call(this);

        if (noScaling(this)) return base;

        var growth = readPercentTag(this.enemy(), 'Gold Growth', DEFAULT_GOLD_GROWTH);
        if (!growth) return base;

        return Math.max(0, Math.round(
            base * growthMultiplier(this.level, growth)
        ));
    };

    // -------------------------------------------------------------------------
    // Display enemy level in name
    // -------------------------------------------------------------------------

    if (SHOW_LEVEL_NAME) {
        var _Game_Enemy_name = Game_Enemy.prototype.name;
        Game_Enemy.prototype.name = function() {
            var base = _Game_Enemy_name.call(this);
            return LEVEL_NAME_FORMAT
                .replace('%1', base)
                .replace('%2', String(this.level));
        };
    }

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command || '').toLowerCase() !== 'nusvenemylevel') return;
        if (!$gameParty || !$gameParty.inBattle()) return;

        var action = String(args[0] || '').toLowerCase();
        var index = Number(args[1] || 0) - 1;
        var enemy = $gameTroop.members()[index];

        if (!enemy) return;

        if (action === 'set') {
            enemy.nusvSetEnemyLevel(Number(args[2] || 1));
        } else if (action === 'add') {
            enemy.nusvAddEnemyLevel(Number(args[2] || 0));
        } else if (action === 'reset') {
            enemy.nusvResetEnemyLevel();
        }
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    NUSV.EnemyLevels.partyLevel = calculatePartyLevel;
    NUSV.EnemyLevels.finalCalculatedLevel = finalCalculatedLevel;
    NUSV.EnemyLevels.version = '1.0.1';

})();
