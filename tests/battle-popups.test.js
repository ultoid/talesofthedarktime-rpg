const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING NUSV BATTLE POPUPS TEST SUITE ===');

// -----------------------------------------------------------------------------
// 1. Verify Configuration in plugins.js
// -----------------------------------------------------------------------------
const pluginsCode = fs.readFileSync('js/plugins.js', 'utf8');
vm.runInThisContext(pluginsCode);

const popupsPlugin = global.$plugins.find(p => p.name === 'NUSV_BattlePopups');
assert(popupsPlugin, 'NUSV_BattlePopups must exist in $plugins');
assert.strictEqual(popupsPlugin.status, true, 'NUSV_BattlePopups must be active');
assert.strictEqual(popupsPlugin.parameters['Popup Font Face'], 'BattleFont, sans-serif', 'Popup Font Face must be "BattleFont, sans-serif"');
assert.strictEqual(popupsPlugin.parameters['Damage Font Size'], '28', 'Damage Font Size must be 28');
assert.strictEqual(popupsPlugin.parameters['Critical Font Size'], '34', 'Critical Font Size must be 34');
assert.strictEqual(popupsPlugin.parameters['Heal Font Size'], '26', 'Heal Font Size must be 26');
assert.strictEqual(popupsPlugin.parameters['Miss Font Size'], '22', 'Miss Font Size must be 22');
assert.strictEqual(popupsPlugin.parameters['Overhead Offset'], '20', 'Overhead Offset must be 20');
assert.strictEqual(popupsPlugin.parameters['Popup Duration'], '65', 'Popup Duration must be 65');
assert.strictEqual(popupsPlugin.parameters['Enemy Name Font Size'], '16', 'Enemy Name Font Size must be 16');
console.log('[PASS] NUSV_BattlePopups plugin registered and parameters verified');

const becPlugin = global.$plugins.find(p => p.name === 'YEP_BattleEngineCore');
assert(becPlugin, 'YEP_BattleEngineCore must exist in $plugins');
assert.strictEqual(becPlugin.parameters['Popup Duration'], '65', 'BEC Popup Duration calibrated to 65');
assert.strictEqual(becPlugin.parameters['Critical Popup'], '255, 215, 0, 180', 'BEC Critical Popup calibrated to Gold RGBA');
assert.strictEqual(becPlugin.parameters['Critical Duration'], '40', 'BEC Critical Duration calibrated to 40');
assert.strictEqual(becPlugin.parameters['Enemy Font Size'], '16', 'BEC Enemy Font Size calibrated to 16');
console.log('[PASS] YEP_BattleEngineCore popup & typography parameters synchronized');

// -----------------------------------------------------------------------------
// 2. Font Definition Verification
// -----------------------------------------------------------------------------
const cssContent = fs.readFileSync('fonts/gamefont.css', 'utf8');
assert(cssContent.includes('font-family: BattleFont'), 'gamefont.css must define BattleFont');
assert(cssContent.includes('final-fantasy-advance-ds.otf'), 'BattleFont must point to final-fantasy-advance-ds.otf');
assert(fs.existsSync('fonts/final-fantasy-advance-ds.otf'), 'final-fantasy-advance-ds.otf must exist on disk');

// Verify that BattleFont, sans-serif does NOT trigger GameFontBaseline downward shift
const gameFontRegex = /(^|,)\s*["']?GameFont["']?\s*(,|$)/i;
assert.strictEqual(
  gameFontRegex.test('BattleFont, sans-serif'),
  false,
  'BattleFont must not trigger Minecraftia baseline offset'
);
console.log('[PASS] BattleFont definition and font metrics isolation verified');

// -----------------------------------------------------------------------------
// 3. Mock MV & Environment to Test NUSV_BattlePopups Plugin Code
// -----------------------------------------------------------------------------
global.PluginManager = {
  parameters: function(name) {
    const found = global.$plugins.find(p => p.name === name);
    return found ? found.parameters : {};
  }
};

global.Graphics = {
  boxWidth: 1080,
  boxHeight: 720,
  loadFont: function(name, url) {}
};

// Mock Sprite hierarchy
function MockSprite(bitmap) {
  this.bitmap = bitmap;
  this.children = [];
  this.anchor = { x: 0, y: 0 };
  this.scale = { x: 1, y: 1 };
  this.x = 0;
  this.y = 0;
  this.opacity = 255;
  this.parent = null;
}
MockSprite.prototype.addChild = function(child) {
  child.parent = this;
  this.children.push(child);
};
MockSprite.prototype.removeChild = function(child) {
  const idx = this.children.indexOf(child);
  if (idx >= 0) {
    this.children.splice(idx, 1);
    child.parent = null;
  }
};
MockSprite.prototype.update = function() {};

global.Sprite = MockSprite;

function MockBitmap(w, h) {
  this.width = w;
  this.height = h;
  this.fontFace = '';
  this.fontSize = 16;
  this.fontBold = false;
  this.fontItalic = false;
  this.textColor = '';
  this.outlineColor = '';
  this.outlineWidth = 0;
  this._drawnTexts = [];
  this._context = {
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    save: function() {},
    restore: function() {},
    strokeRect: function() {}
  };
}
MockBitmap.prototype._makeFontNameText = function() {
  var italic = this.fontItalic ? 'italic ' : '';
  var bold = this.fontBold ? 'bold ' : '';
  return italic + bold + this.fontSize + 'px ' + this.fontFace;
};
MockBitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
  this._drawnTexts.push({
    text: text,
    x: x,
    y: y,
    fontSize: this.fontSize,
    textColor: this.textColor,
    outlineColor: this.outlineColor,
    outlineWidth: this.outlineWidth,
    fontBold: this.fontBold,
    fontItalic: this.fontItalic
  });
};
MockBitmap.prototype.fillRect = function() {};
MockBitmap.prototype.clear = function() {
  this._drawnTexts = [];
};

global.Bitmap = MockBitmap;

// Mock Sprite_Battler, Sprite_Actor, Sprite_Enemy, Sprite_Damage
function MockSprite_Battler() {
  MockSprite.call(this);
  this._damages = [];
}
MockSprite_Battler.prototype = Object.create(MockSprite.prototype);
global.Sprite_Battler = MockSprite_Battler;

function MockSprite_Actor() {
  MockSprite_Battler.call(this);
}
MockSprite_Actor.prototype = Object.create(MockSprite_Battler.prototype);
global.Sprite_Actor = MockSprite_Actor;

function MockSprite_Enemy() {
  MockSprite_Battler.call(this);
}
MockSprite_Enemy.prototype = Object.create(MockSprite_Battler.prototype);
global.Sprite_Enemy = MockSprite_Enemy;

function MockSprite_Damage() {
  MockSprite.call(this);
  this.initialize.apply(this, arguments);
}
MockSprite_Damage.prototype = Object.create(MockSprite.prototype);
MockSprite_Damage.prototype.constructor = MockSprite_Damage;
MockSprite_Damage.prototype.initialize = function() {
  this._duration = 0;
};
global.Sprite_Damage = MockSprite_Damage;

// Mock Window_Base & Window_EnemyVisualSelect
function MockWindow_Base() {
  this.contents = new MockBitmap(200, 100);
  this.x = 0;
  this.y = 0;
  this.width = 100;
  this.height = 100;
  this._minX = 0;
  this._maxX = 1080;
  this._minY = 0;
  this._maxY = 720;
}
MockWindow_Base.prototype.standardPadding = function() { return 18; };
MockWindow_Base.prototype.textWidth = function(text) { return text.length * 9; };
MockWindow_Base.prototype.drawText = function(text, x, y, width, align) {
  this.contents.drawText(text, x, y, width, 24, align);
};
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

global.Window_Base = MockWindow_Base;

function MockWindow_EnemyVisualSelect() {
  MockWindow_Base.call(this);
  this._battler = null;
  this._showEnemyName = true;
  this._requestRefresh = false;
}
MockWindow_EnemyVisualSelect.prototype = Object.create(MockWindow_Base.prototype);
global.Window_EnemyVisualSelect = MockWindow_EnemyVisualSelect;

// Load and execute NUSV_BattlePopups.js in the mock environment
const popupsCode = fs.readFileSync('js/plugins/NUSV_BattlePopups.js', 'utf8');
vm.runInThisContext(popupsCode);

// -----------------------------------------------------------------------------
// 4. Test Overhead Positioning & Multi-Hit Staggering
// -----------------------------------------------------------------------------
const actorSprite = new Sprite_Actor();
actorSprite.spriteHeight = function() { return 64; };
assert.strictEqual(
  actorSprite.damageOffsetY(),
  -84,
  'Actor damageOffsetY must be -(64 + 20) = -84px (overhead clearance)'
);

const enemySprite = new Sprite_Enemy();
enemySprite.spriteHeight = function() { return 140; };
assert.strictEqual(
  enemySprite.damageOffsetY(),
  -160,
  'Enemy damageOffsetY must be -(140 + 20) = -160px (overhead clearance)'
);

// Multi-hit staggering test
const hit1 = new Sprite_Damage();
hit1.y = 0;
enemySprite.pushDamageSprite(hit1);
assert.strictEqual(enemySprite._damages.length, 1);
assert.strictEqual(hit1.y, 0);

const hit2 = new Sprite_Damage();
hit2.y = 0;
enemySprite.pushDamageSprite(hit2);
assert.strictEqual(enemySprite._damages.length, 2);
assert.strictEqual(hit1.y, -22, 'Hit 1 must shift upward by 22px when Hit 2 arrives');
assert.strictEqual(hit2.y, 0, 'Hit 2 spawns at baseline');

const hit3 = new Sprite_Damage();
hit3.y = 0;
enemySprite.pushDamageSprite(hit3);
assert.strictEqual(hit1.y, -44, 'Hit 1 must shift to -44px');
assert.strictEqual(hit2.y, -22, 'Hit 2 must shift to -22px');
assert.strictEqual(hit3.y, 0, 'Hit 3 spawns at baseline');
console.log('[PASS] Overhead positioning and multi-hit cascading verified');

// -----------------------------------------------------------------------------
// 5. Test Sprite_Damage Vector Typography & Visual Distinction
// -----------------------------------------------------------------------------
// A. Enemy damage (White #FFFFFF, outline #111111, size 28)
const dmgEnemy = new Sprite_Damage();
const mockEnemyTarget = {
  isActor: function() { return false; },
  isAlive: function() { return true; },
  result: function() {
    return { missed: false, evaded: false, hpAffected: true, hpDamage: 520, critical: false, mpDamage: 0 };
  }
};
dmgEnemy.setup(mockEnemyTarget);
assert.strictEqual(dmgEnemy.children.length, 1);
const enemyNumberDrawn = dmgEnemy.children[0].bitmap._drawnTexts[0];
assert.strictEqual(enemyNumberDrawn.text, '520');
assert.strictEqual(enemyNumberDrawn.textColor, '#FFFFFF', 'Enemy damage must be crisp white #FFFFFF');
assert.strictEqual(enemyNumberDrawn.outlineColor, '#111111');
assert.strictEqual(enemyNumberDrawn.fontSize, 28);
assert.strictEqual(enemyNumberDrawn.fontBold, true);

// B. Party member incoming damage (Coral #FF6B6B, outline #4A0E17, size 28)
const dmgAlly = new Sprite_Damage();
const mockAllyTarget = {
  isActor: function() { return true; },
  isAlive: function() { return true; },
  result: function() {
    return { missed: false, evaded: false, hpAffected: true, hpDamage: 380, critical: false, mpDamage: 0 };
  }
};
dmgAlly.setup(mockAllyTarget);
const allyNumberDrawn = dmgAlly.children[0].bitmap._drawnTexts[0];
assert.strictEqual(allyNumberDrawn.text, '380');
assert.strictEqual(allyNumberDrawn.textColor, '#FF6B6B', 'Ally damage must be warning coral #FF6B6B');
assert.strictEqual(allyNumberDrawn.outlineColor, '#4A0E17');

// C. Critical hit (Gold #FFD700, size 34, with CRITICAL! badge)
const dmgCrit = new Sprite_Damage();
const mockCritTarget = {
  isActor: function() { return false; },
  isAlive: function() { return true; },
  result: function() {
    return { missed: false, evaded: false, hpAffected: true, hpDamage: 1250, critical: true, mpDamage: 0 };
  }
};
dmgCrit.setup(mockCritTarget);
const critTexts = dmgCrit.children[0].bitmap._drawnTexts;
assert.strictEqual(critTexts.length, 2, 'Critical popup must include CRITICAL! badge + damage number');
assert.strictEqual(critTexts[0].text, 'CRITICAL!');
assert.strictEqual(critTexts[0].textColor, '#FF3B30');
assert.strictEqual(critTexts[1].text, '1,250');
assert.strictEqual(critTexts[1].textColor, '#FFD700', 'Critical damage must be gold #FFD700');
assert.strictEqual(critTexts[1].fontSize, 34);

// D. HP Heal (Green #2ECC71, size 26, prefixed with '+')
const dmgHeal = new Sprite_Damage();
const mockHealTarget = {
  isActor: function() { return true; },
  isAlive: function() { return true; },
  result: function() {
    return { missed: false, evaded: false, hpAffected: true, hpDamage: -450, critical: false, mpDamage: 0 };
  }
};
dmgHeal.setup(mockHealTarget);
const healText = dmgHeal.children[0].bitmap._drawnTexts[0];
assert.strictEqual(healText.text, '+450');
assert.strictEqual(healText.textColor, '#2ECC71', 'HP Heal must be vibrant emerald #2ECC71');
assert.strictEqual(healText.fontSize, 26);

// E. Miss / Evade (Silver #E5E7EB, italic, size 22)
const dmgMiss = new Sprite_Damage();
const mockMissTarget = {
  isActor: function() { return false; },
  isAlive: function() { return true; },
  result: function() {
    return { missed: true, evaded: false, hpAffected: false, hpDamage: 0, critical: false, mpDamage: 0 };
  }
};
dmgMiss.setup(mockMissTarget);
const missText = dmgMiss.children[0].bitmap._drawnTexts[0];
assert.strictEqual(missText.text, 'MISS');
assert.strictEqual(missText.textColor, '#E5E7EB');
assert.strictEqual(missText.fontItalic, true);
assert.strictEqual(missText.fontSize, 22);

console.log('[PASS] Sprite_Damage HD Vector typography, badge & color rendering verified');

// -----------------------------------------------------------------------------
// 6. Test Animation & Fade-Out Lifecycle
// -----------------------------------------------------------------------------
const animDamage = new Sprite_Damage();
animDamage.setup(mockEnemyTarget);
assert.strictEqual(animDamage._duration, 65, 'Duration starts at 65 frames');
assert.strictEqual(animDamage.isPlaying(), true, 'isPlaying() must be true initially');

// Advance 50 frames (15 frames left -> in fade out window)
for (let f = 0; f < 50; f++) {
  animDamage.update();
}
assert.strictEqual(animDamage._duration, 15);
assert.strictEqual(animDamage.isPlaying(), true);
assert(animDamage.opacity < 255, 'Opacity must fade out in final 18 frames');

// Advance to finish
for (let f = 0; f < 15; f++) {
  animDamage.update();
}
assert.strictEqual(animDamage._duration, 0);
assert.strictEqual(animDamage.isPlaying(), false, 'isPlaying() must be false when duration reaches 0');
console.log('[PASS] Animation lifecycle, pop-in and fade-out behavior verified');

// -----------------------------------------------------------------------------
// 7. Test Window_EnemyVisualSelect Overhead Positioning
// -----------------------------------------------------------------------------
const visualSelectWin = new Window_EnemyVisualSelect();
visualSelectWin._battler = {
  name: function() { return 'Babi Hutan Alpha'; },
  isHidden: function() { return false; },
  spritePosX: function() { return 650; },
  spritePosY: function() { return 420; },
  spriteHeight: function() { return 90; }
};

visualSelectWin.updateWindowPosition();
// Battler feet at Y = 420, spriteHeight = 90 => Battler top (head) at Y = 330
// this.y = 420 - 90 - 18 - 38 = 274
// Screen Y of contents = 274 + 18 = 292
// Margin above head = 330 - 292 = 38px
assert.strictEqual(visualSelectWin.y, 274);
const battlerHeadY = 420 - 90;
const nameplateScreenY = visualSelectWin.y + visualSelectWin.standardPadding();
assert(
  nameplateScreenY < battlerHeadY,
  'Nameplate must hover completely above the battler head (' + nameplateScreenY + ' < ' + battlerHeadY + ')'
);
assert.strictEqual(
  battlerHeadY - nameplateScreenY,
  38,
  'Nameplate must provide clean 38px clearance above head'
);

// Refresh nameplate rendering
visualSelectWin.refresh();
assert(visualSelectWin.contents._drawnTexts.length > 0);
const nameDrawn = visualSelectWin.contents._drawnTexts[0];
assert.strictEqual(nameDrawn.text, 'Babi Hutan Alpha');
assert.strictEqual(nameDrawn.textColor, '#F8FAFC');
assert.strictEqual(visualSelectWin.contents.fontSize, 16);
console.log('[PASS] Window_EnemyVisualSelect overhead positioning and nameplate styling verified');

console.log('\n>>> ALL BATTLE POPUPS TESTS PASSED SUCCESSFULLY! <<<');
