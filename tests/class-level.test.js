const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function makeContext() {
    const context = {
        Imported: {},
        NUSV: {},
        PluginManager: {
            parameters: () => ({
                'Default Class EXP Rate': '0.8',
                'Tier 1 Max Level': '10',
                'Tier 2 Max Level': '30',
                'Tier 3 Max Level': '40',
                'Tier 4 Max Level': '50',
                'Tier 5 Max Level': '60'
            })
        },
        $dataClasses: [
            null,
            {
                id: 1,
                name: 'Fighter',
                note: '<Class Tier: 1>\n<Class Stat Growth: STR +1.5, VIT +1.0>',
                meta: { 'Class Tier': '1' },
                learnings: [
                    { level: 1, skillId: 10 },
                    { level: 3, skillId: 11 },
                    { level: 10, skillId: 12 }
                ]
            },
            {
                id: 2,
                name: 'Warrior',
                note: '<Class Tier: 2>\n<Class Stat Growth: STR +2.0, VIT +1.5>',
                meta: { 'Class Tier': '2' },
                learnings: [
                    { level: 15, skillId: 20 }
                ]
            }
        ],
        Game_Actor: function(id) {
            this._actorId = id || 1;
            this._level = 5; // Base Level = 5
            this._classId = 1; // Class Fighter (Tier 1)
            this._skills = [];
            this.setup(this._actorId);
        },
        Game_Enemy: function() {
            this.enemy = () => ({ meta: {} });
            this.exp = () => 100;
        },
        BattleManager: {
            makeRewards: function() { this._rewards = {}; },
            gainExp: function() {}
        },
        $gameTroop: {
            members: () => []
        },
        $gameParty: {
            allMembers: () => []
        }
    };

    context.Game_Actor.prototype.setup = function(id) {};
    context.Game_Actor.prototype.currentClass = function() {
        return context.$dataClasses[this._classId];
    };
    context.Game_Actor.prototype.refresh = function() {};
    context.Game_Actor.prototype.learnSkill = function(skillId) {
        if (!this._skills.includes(skillId)) {
            this._skills.push(skillId);
        }
    };

    const pluginCode = fs.readFileSync(path.join(root, 'js/plugins/NUSV_ClassLevel.js'), 'utf8');
    vm.createContext(context);
    vm.runInContext(pluginCode, context);

    return context;
}

const ctx = makeContext();
const actor = new ctx.Game_Actor(1);

// 1. Initial Class Level check
assert.equal(actor.classLevel(1), 1, 'Initial class level should be 1');
assert.equal(actor._level, 5, 'Base level should remain 5');
assert.equal(actor.classMaxLevel(1), 10, 'Tier 1 max level should be 10');
assert.equal(actor.classMaxLevel(2), 30, 'Tier 2 max level should be 30');

// 2. Class stat growth calculation
// Level 1 gives 0 bonus.
assert.equal(actor.nusvClassStatBonus('str'), 0, 'Level 1 has 0 bonus');

// 3. Gain Class EXP to level up
// Level 3 should learn skill 11
actor.gainClassExp(300);
assert.ok(actor.classLevel(1) >= 3, 'Class Level should have reached at least 3');
assert.ok(actor._skills.includes(11), 'Actor should have learned skill 11 upon reaching Lv 3');

// Check STR bonus at Level 3: (3 - 1) * 1.5 = 3
const strBonus = actor.nusvClassStatBonus('str');
assert.ok(strBonus >= 3, `STR bonus should be at least 3 (actual: ${strBonus})`);

// 4. Test Tier 1 Cap (cannot exceed Lv 10)
actor.gainClassExp(999999);
assert.equal(actor.classLevel(1), 10, 'Tier 1 class level must be capped at 10');
assert.ok(actor._skills.includes(12), 'Actor should learn level 10 skill');
assert.equal(actor._level, 5, 'Base level should remain completely untouched by class EXP');

console.log('NUSV_ClassLevel unit tests passed successfully!');
