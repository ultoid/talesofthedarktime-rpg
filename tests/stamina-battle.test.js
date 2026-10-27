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
                'Guard Base SP Recovery Rate': '0.15',
                'On-Hit SP Recovery Multiplier': '0.5'
            })
        },
        Game_Action: function(subject) {
            this._subject = subject;
        },
        Game_Battler: function() {
            this._tp = 20;
            this.vit = 14;
            this.trg = 0.05; // 5% SP regen
            this.tcr = 1.0;
            this._popups = 0;
        }
    };

    context.Game_Action.prototype.applyItemUserEffect = function(target) {};
    context.Game_Action.prototype.isGuard = function() { return true; };
    context.Game_Action.prototype.subject = function() { return this._subject; };

    context.Game_Battler.prototype.maxTp = function() { return 150; };
    context.Game_Battler.prototype.gainTp = function(val) { this._tp += val; };
    context.Game_Battler.prototype.startDamagePopup = function() { this._popups++; };

    const pluginCode = fs.readFileSync(path.join(root, 'js/plugins/NUSV_StaminaBattle.js'), 'utf8');
    vm.createContext(context);
    vm.runInContext(pluginCode, context);

    return context;
}

const ctx = makeContext();
const battler = new ctx.Game_Battler();

// 1. Guard recovery test
// Max SP = 150. trg = 0.05.
// recoveryRate = 0.15 + (0.05 * 2) = 0.25 (25% of Max SP)
// Amount = 150 * 0.25 = 38 SP
const beforeGuard = battler._tp;
battler.performGuardStaminaRecovery();
const gainedFromGuard = battler._tp - beforeGuard;
assert.equal(gainedFromGuard, 38, 'Guard should recover 38 SP (25% of 150 Max SP)');
assert.ok(battler._popups > 0, 'Damage popup should be triggered for SP gain');

// 2. On-Hit Adrenaline recovery test
// damageRate = 0.30 (lost 30% HP)
const beforeHit = battler._tp;
battler.chargeTpByDamage(0.30);
const gainedFromHit = battler._tp - beforeHit;
assert.ok(gainedFromHit > 0, 'Should gain positive SP on being hit');
// Expected: 150 * 0.30 * 0.5 * endurance (1.06) * regen (1.25) * 1.0 ≈ 29 SP
assert.ok(gainedFromHit >= 25 && gainedFromHit <= 35, `Gained from hit should be ~29 (got: ${gainedFromHit})`);

console.log('NUSV_StaminaBattle unit tests passed successfully!');
