const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function makeContext() {
    function Game_Battler() {
        this.mp = 30;
        this.mmp = 50;
        this.tp = 40;
        this._nusvResourceGainPopups = [];
        this._damagePopup = [];
        this._result = { hpAffected: false, mpDamage: 0 };
    }
    Game_Battler.prototype.setMp = function(value) {
        this.mp = Math.max(0, Math.min(this.mmp, value));
    };
    Game_Battler.prototype.setTp = function(value) {
        this.tp = Math.max(0, Math.min(100, value));
    };
    Game_Battler.prototype.maxTp = function() {
        return 100;
    };
    Game_Battler.prototype.gainMp = function(value) {
        this._result.mpDamage = -value;
        this.setMp(this.mp + value);
    };
    Game_Battler.prototype.gainTp = function(value) {
        this.setTp(this.tp + value);
    };
    Game_Battler.prototype.gainSilentTp = function(value) {
        this.setTp(this.tp + value);
    };
    Game_Battler.prototype.startDamagePopup = function() {
        if (this._result.mpDamage !== 0) {
            this._damagePopup.push({
                hpAffected: false,
                mpDamage: this._result.mpDamage
            });
        }
    };

    function Sprite_Damage() {
        this.children = [];
    }
    Sprite_Damage.prototype.addChild = function(sprite) {
        this.children.push(sprite);
    };

    function Sprite_Battler(battler) {
        this._battler = battler;
        this._damages = [];
        this.x = 100;
        this.y = 200;
    }
    Sprite_Battler.prototype.updateDamagePopup = function() {};
    Sprite_Battler.prototype.damageOffsetX = function() {
        return 5;
    };
    Sprite_Battler.prototype.damageOffsetY = function() {
        return -10;
    };
    Sprite_Battler.prototype.pushDamageSprite = function(sprite) {
        this._damages.push(sprite);
    };

    function Bitmap(width, height) {
        this.width = width;
        this.height = height;
    }
    Bitmap.prototype.drawText = function(text) {
        this.drawnText = text;
    };

    function Sprite(bitmap) {
        this.bitmap = bitmap;
        this.anchor = {};
    }

    function Window_Base() {}
    Window_Base.prototype.standardFontFace = function() {
        return 'GameFont';
    };

    const context = vm.createContext({
        Bitmap,
        BattleManager: { _spriteset: { addChild() {} } },
        Game_Battler,
        Sprite,
        Sprite_Battler,
        Sprite_Damage,
        TextManager: { mpA: 'MP', tpA: 'SP' },
        Window_Base,
        $gameParty: { inBattle: () => true }
    });
    const damageCore = fs.readFileSync(path.join(root, 'js/plugins/NUSV_DamageCore.js'), 'utf8');
    const start = damageCore.indexOf('    // MP/SP Gain Popups');
    const end = damageCore.indexOf('    // Script-call helpers', start);
    assert.ok(start >= 0 && end > start, 'MP/SP popup implementation must exist in DamageCore');
    vm.runInContext(damageCore.slice(start, end), context);
    return context;
}

const context = makeContext();
const battler = new context.Game_Battler();
battler.gainMp(10);
battler.gainTp(10);
battler.startDamagePopup();
battler.startDamagePopup();
assert.equal(battler._nusvResourceGainPopups[0].amount, 10);
assert.equal(battler._nusvResourceGainPopups[1].amount, 10);
assert.equal(battler._damagePopup.length, 0);
assert.equal(battler._damagePopup.length, 0);

const sprite = new context.Sprite_Battler(battler);
sprite.updateDamagePopup();
assert.equal(sprite._damages[0].children[0].bitmap.drawnText, '+10 MP');
assert.equal(sprite._damages[1].children[0].bitmap.drawnText, '+10 SP');
assert.equal(sprite._damages[0].x, 105);
assert.equal(sprite._damages[0].y, 190);

const capped = new context.Game_Battler();
capped.mp = 48;
capped.gainMp(10);
assert.equal(capped.mp, 50);
assert.equal(capped._nusvResourceGainPopups[0].amount, 2);

const full = new context.Game_Battler();
full.mp = 50;
full.tp = 100;
full.gainMp(10);
full.gainSilentTp(10);
const fullSprite = new context.Sprite_Battler(full);
fullSprite.updateDamagePopup();
assert.equal(fullSprite._damages[0].children[0].bitmap.drawnText, 'MP Max');
assert.equal(fullSprite._damages[1].children[0].bitmap.drawnText, 'SP Max');

context.$gameParty.inBattle = () => false;
const outsideBattle = new context.Game_Battler();
outsideBattle.gainMp(10);
outsideBattle.gainTp(10);
assert.equal(outsideBattle._nusvResourceGainPopups.length, 0);

console.log('Resource gain popups: MP/SP gains, capped gains, full resources, and out-of-battle cases passed.');