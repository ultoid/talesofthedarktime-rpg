/*:
 * @plugindesc v1.0.0 NUSV Weapon Unleash - clean-room attack replacement/unleash system for RPG Maker MV.
 * @author OpenAI for Nusvanir
 *
 * @param Default Priority
 * @type number
 * @default 0
 *
 * @param Log Errors
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_WeaponUnleash
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_WeaponUnleash source code.
 *
 * Purpose:
 * - replace the normal Attack command with special skills
 * - support random proc chance
 * - support conditional unleash logic
 * - work from Actor / Class / Weapon / Armor / State notes
 * - preserve WeaponSkill.js behavior as fallback if installed
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   WeaponSkill.js              (optional)
 *   NUSV_WeaponUnleash
 *
 * ============================================================================
 * SIMPLE NOTETAGS
 * ============================================================================
 *
 * You can place these on:
 *   Actor, Class, Weapon, Armor, State
 *
 * <Unleash Skill: 15>
 *   Always replaces Attack with Skill ID 15.
 *
 * <Unleash Skill: 15, 25%>
 *   25% chance to replace Attack with Skill ID 15.
 *
 * <Unleash Skill: 15, 25%, 10>
 *   25% chance, Priority 10.
 *
 * Format:
 *   <Unleash Skill: skillId>
 *   <Unleash Skill: skillId, rate%>
 *   <Unleash Skill: skillId, rate%, priority>
 *
 * ============================================================================
 * ADVANCED BLOCK NOTETAGS
 * ============================================================================
 *
 * <Unleash Entry>
 * skill = 15;
 * rate = 0.25;
 * priority = 10;
 * condition = user.hpRate() <= 0.5;
 * </Unleash Entry>
 *
 * Available variables:
 *   user     = actor using Attack
 *   a        = actor using Attack
 *   subject  = actor using Attack
 *   item     = note source object (weapon/class/state/etc.)
 *   s        = $gameSwitches._data
 *   v        = $gameVariables._data
 *   skill    = result skill id
 *   rate     = chance (0.25 or 25 both valid)
 *   priority = numeric priority
 *   condition = boolean
 *
 * Another example:
 *
 * <Unleash Entry>
 * skill = 28;
 * rate = 40;
 * priority = 20;
 * condition = user.isStateAffected(15);
 * </Unleash Entry>
 *
 * ============================================================================
 * HOW PRIORITY WORKS
 * ============================================================================
 *
 * All valid unleash entries are collected.
 * Higher priority entries are checked first.
 * The first entry that successfully procs becomes the Attack skill.
 *
 * If nothing procs:
 * - falls back to WeaponSkill.js result if that plugin is installed
 * - otherwise falls back to default Attack skill
 *
 * ============================================================================
 * EXAMPLES
 * ============================================================================
 *
 * Weapon note:
 *   <Unleash Skill: 101, 20%>
 *
 * State note:
 *   <Unleash Skill: 150, 100%, 50>
 *
 * Class note:
 *   <Unleash Entry>
 *   skill = 220;
 *   rate = 35;
 *   priority = 15;
 *   condition = user.level >= 20 && user.hpRate() <= 0.5;
 *   </Unleash Entry>
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * This plugin changes only the Attack command behavior.
 * It does not automatically change Guard, skill costs, or AI.
 *
 * If your unleashed attack targets allies / all enemies / no target,
 * this plugin also adjusts battle command flow so Attack behaves correctly.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_WeaponUnleash = true;

var NUSV = NUSV || {};
NUSV.WeaponUnleash = NUSV.WeaponUnleash || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_WeaponUnleash';
    var params = PluginManager.parameters(pluginName);
    var defaultPriority = Number(params['Default Priority'] || 0);
    var logErrors = String(params['Log Errors'] || 'true') === 'true';

    function logError(label, error, obj) {
        if (!logErrors || !console) return;
        console.error(pluginName + ': ' + label);
        if (obj) console.error(obj);
        if (error) console.error(error);
    }

    function parsePercent(raw, fallback) {
        if (raw == null || raw === '') return fallback;
        var text = String(raw).trim();
        var num = Number(text.replace('%', ''));
        if (isNaN(num)) return fallback;
        if (text.indexOf('%') >= 0 || num > 1) return num / 100;
        return num;
    }

    function noteText(obj) {
        return obj && obj.note ? String(obj.note) : '';
    }

    function traitObjects(actor) {
        if (!actor || !actor.traitObjects) return [];
        return actor.traitObjects().filter(Boolean);
    }

    function parseSimpleEntries(obj) {
        var text = noteText(obj);
        var list = [];
        var re = /<Unleash Skill:\s*(\d+)(?:\s*,\s*([+\-]?\d+(?:\.\d+)?%?))?(?:\s*,\s*([+\-]?\d+(?:\.\d+)?))?\s*>/ig;
        var match;
        while ((match = re.exec(text))) {
            list.push({
                source: obj,
                skillId: Number(match[1]),
                rate: parsePercent(match[2], 1.0),
                priority: match[3] != null ? Number(match[3]) : defaultPriority,
                condition: true
            });
        }
        return list;
    }

    function parseAdvancedEntries(obj, actor) {
        var text = noteText(obj);
        var list = [];
        var re = /<Unleash Entry>([\s\S]*?)<\/Unleash Entry>/ig;
        var match;

        while ((match = re.exec(text))) {
            var code = String(match[1] || '').trim();
            try {
                var user = actor;
                var a = actor;
                var subject = actor;
                var item = obj;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;

                var skill = 0;
                var rate = 1.0;
                var priority = defaultPriority;
                var condition = true;

                eval(code);

                var normalizedRate = Number(rate);
                if (isNaN(normalizedRate)) normalizedRate = 1.0;
                if (normalizedRate > 1) normalizedRate = normalizedRate / 100;

                list.push({
                    source: obj,
                    skillId: Number(skill || 0),
                    rate: Math.max(0, normalizedRate),
                    priority: Number(priority || 0),
                    condition: !!condition
                });
            } catch (e) {
                logError('Unleash Entry Eval Error', e, obj);
            }
        }

        return list.filter(function(entry) {
            return entry.skillId > 0 && entry.condition;
        });
    }

    function allEntries(actor) {
        var entries = [];
        var objects = traitObjects(actor);

        // Keep source order stable for equal priority.
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var simple = parseSimpleEntries(obj);
            var advanced = parseAdvancedEntries(obj, actor);

            simple.forEach(function(entry, index) {
                entry._sourceIndex = i * 100 + index;
                entries.push(entry);
            });
            advanced.forEach(function(entry, index) {
                entry._sourceIndex = i * 100 + 50 + index;
                entries.push(entry);
            });
        }

        return entries.filter(function(entry) {
            return entry.skillId > 0 && entry.condition;
        });
    }

    function chooseUnleashSkill(actor) {
        var entries = allEntries(actor);
        if (!entries.length) return 0;

        entries.sort(function(a, b) {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a._sourceIndex - b._sourceIndex;
        });

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (Math.random() < entry.rate) {
                return entry.skillId;
            }
        }

        return 0;
    }

    // Save fallback after other plugins above this already changed attackSkillId.
    var _Game_Actor_attackSkillId = Game_Actor.prototype.attackSkillId;

    Game_Actor.prototype.nusvBaseAttackSkillId = function() {
        return _Game_Actor_attackSkillId.call(this);
    };

    Game_Actor.prototype.attackSkillId = function() {
        var skillId = chooseUnleashSkill(this);
        if (skillId > 0) return skillId;
        return this.nusvBaseAttackSkillId();
    };

    // Keep Attack command selection flow compatible with special target types.
    var _Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
    Scene_Battle.prototype.commandAttack = function() {
        BattleManager.inputtingAction().setAttack();
        var action = BattleManager.inputtingAction();

        if (action.needsSelection() && action.isForOpponent()) {
            _Scene_Battle_commandAttack.call(this);
            return;
        }

        this.onSelectAction();
    };

    NUSV.WeaponUnleash.parseSimpleEntries = parseSimpleEntries;
    NUSV.WeaponUnleash.parseAdvancedEntries = parseAdvancedEntries;
    NUSV.WeaponUnleash.allEntries = allEntries;
    NUSV.WeaponUnleash.chooseUnleashSkill = chooseUnleashSkill;
    NUSV.WeaponUnleash.version = '1.0.0';

})();