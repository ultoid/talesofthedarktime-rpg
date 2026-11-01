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
                'Points Per Base Level': '3',
                'Base SP Value': '50',
                'Max Evasion Cap': '0.80',
                'Max Critical Cap': '0.85',
                'Base Critical Damage Multiplier': '1.5'
            })
        },
        Game_BattlerBase: function() {
            this._hp = 100;
            this._mp = 50;
            this._tp = 0;
        },
        Game_Battler: function() {
            context.Game_BattlerBase.call(this);
        },
        Game_Actor: function(id) {
            context.Game_Battler.call(this);
            this._actorId = id || 1;
            this._level = 1;
            this.setup(this._actorId);
        },
        Game_Enemy: function() {
            context.Game_Battler.call(this);
            this.atk = 40;
            this.def = 30;
            this.mat = 20;
            this.agi = 25;
        }
    };

    // Prototype chains
    context.Game_Battler.prototype = Object.create(context.Game_BattlerBase.prototype);
    context.Game_Battler.prototype.constructor = context.Game_Battler;

    context.Game_Actor.prototype = Object.create(context.Game_Battler.prototype);
    context.Game_Actor.prototype.constructor = context.Game_Actor;

    context.Game_Enemy.prototype = Object.create(context.Game_Battler.prototype);
    context.Game_Enemy.prototype.constructor = context.Game_Enemy;

    // Stubs for Game_BattlerBase
    context.Game_BattlerBase.prototype.maxTp = function() { return 100; };
    context.Game_BattlerBase.prototype.isPreserveTp = function() { return false; };
    context.Game_BattlerBase.prototype.recoverAll = function() {
        this._hp = 100;
        this._mp = 50;
    };
    context.Game_BattlerBase.prototype.refresh = function() {};

    // Stubs for Game_Battler
    context.Game_Battler.prototype.initTp = function() {
        this._tp = Math.floor(Math.random() * 25);
    };
    context.Game_Battler.prototype.onBattleStart = function() {
        if (!this.isPreserveTp()) {
            this.initTp();
        }
    };

    // Stubs for Game_Actor
    context.Game_Actor.prototype.setup = function(actorId) {
        this._actorId = actorId;
    };
    context.Game_Actor.prototype.levelUp = function() {
        this._level++;
    };
    context.Game_Actor.prototype.actor = function() {
        return { meta: {} };
    };
    context.Game_Actor.prototype.currentClass = function() {
        return { meta: {} };
    };
    context.Game_Actor.prototype.equips = function() {
        return [];
    };
    context.Game_Actor.prototype.states = function() {
        return [];
    };
    context.Game_Actor.prototype.paramBase = function(paramId) {
        return [450, 40, 20, 20, 10, 10, 15, 15][paramId] || 10;
    };
    context.Game_Actor.prototype.paramPlus = function(paramId) {
        return 0;
    };
    context.Game_Actor.prototype.xparam = function(id) {
        return 0;
    };
    context.Game_Actor.prototype.sparam = function(id) {
        return 1.0;
    };

    // Stubs for Game_Enemy
    context.Game_Enemy.prototype.param = function(id) {
        return [200, 0, this.atk, this.def, this.mat, 20, this.agi, 10][id] || 10;
    };

    // Stubs for Game_Action
    context.Game_Action = function() {};
    context.Game_Action.prototype.applyItemUserEffect = function(target) {};

    // Stubs for Game_Interpreter
    context.Game_Interpreter = function() {};
    context.Game_Interpreter.prototype.pluginCommand = function(command, args) {};

    const pluginCode = fs.readFileSync(path.join(root, 'js/plugins/NUSV_StatSystem.js'), 'utf8');
    vm.createContext(context);
    vm.runInContext(pluginCode, context);

    return context;
}

// Tests
const ctx = makeContext();
const actor = new ctx.Game_Actor(1);

// 1. Initial base stats check
assert.equal(actor.str, 10, 'Default base STR should be 10');
assert.equal(actor.vit, 10, 'Default base VIT should be 10');
assert.equal(actor.nusvStatPoints(), 0, 'Level 1 has 0 unallocated stat points');

// 2. Level up adds 3 stat points
actor.levelUp();
assert.equal(actor._level, 2);
assert.equal(actor.nusvStatPoints(), 3, 'Level 2 should have 3 unallocated stat points');

// 3. Allocate stat points
assert.equal(actor.canAllocateStat('str', 2), true);
assert.equal(actor.allocateStat('str', 2), true);
assert.equal(actor.str, 12, 'STR should now be 12 (10 base + 2 allocated)');
assert.equal(actor.nusvStatPoints(), 1, 'Remaining stat points should be 1');

// 4. Reset allocated stats
const refunded = actor.resetAllocatedStats();
assert.equal(refunded, 2, 'Should refund 2 allocated points');
assert.equal(actor.str, 10, 'STR should revert to base 10');
assert.equal(actor.nusvStatPoints(), 3, 'Stat points should be restored to 3');

// 5. Dynamic Max SP scaling
// Formula: BASE_SP_VALUE (50) + VIT * 5 + STR * 2
// With VIT=10, STR=10: 50 + 50 + 20 = 120 Max SP
assert.equal(actor.maxSp(), 120, 'Max SP should be 120 for 10 VIT and 10 STR');
assert.equal(actor.maxTp(), 120, 'maxTp() should equal maxSp()');

// Allocate 2 to VIT and 1 to STR
actor.allocateStat('vit', 2);
actor.allocateStat('str', 1);
// VIT=12, STR=11: 50 + 60 + 22 = 132 Max SP
assert.equal(actor.maxSp(), 132, 'Max SP should dynamically scale to 132');

// 6. SP Preservation & RecoverAll
actor._tp = 45;
actor.onBattleStart();
assert.equal(actor._tp, 45, 'SP should be preserved on battle start (not randomized)');

actor.recoverAll();
assert.equal(actor._tp, 132, 'RecoverAll should fully restore SP to maxSp');

// 7. Enemy safe fallback
const enemy = new ctx.Game_Enemy();
assert.equal(typeof enemy.str, 'number');
assert.ok(enemy.maxSp() >= 50, 'Enemy maxSp should have reasonable value');

console.log('NUSV_StatSystem unit tests passed successfully!');
