const fs = require('fs');
const vm = require('vm');

const note = `<NUSV Bestiary Group: Alam Liar>
<NUSV Enemy Rank: Normal>
<Sideview Battler: sv_alam liar_babi hutan>
<Sideview Folder: sv_enemies>
<Sideview Frames: 8>
<Sideview Frame Speed: 8>
<Sideview No Mirror>
<Sideview Collapse>`;

// Load real plugin parameters from plugins.js
const pluginsJs = fs.readFileSync('js/plugins.js', 'utf8');
vm.runInThisContext(pluginsJs);
const sveConfig = global.$plugins.find(p => p.name === 'YEP_X_AnimatedSVEnemies');

global.PluginManager = {
  parameters: function(name) {
    if (name === 'YEP_X_AnimatedSVEnemies') {
      return sveConfig.parameters;
    }
    return {};
  }
};

global.Imported = { YEP_BattleEngineCore: true };
global.Yanfly = {
  BEC: { version: 1.51 },
  Util: {
    getRandomElement: function(arr) { return arr[0]; }
  }
};
global.DataManager = {
  isDatabaseLoaded: function() { return true; }
};
global.Game_Party = function() {};
global.Game_Party.prototype = {};
global.Game_Enemy = function() {};
global.Game_Enemy.prototype = {};
global.Game_Battler = function() {};
global.Game_Battler.prototype = {};
global.Sprite_Enemy = function() {};
global.Sprite_Enemy.prototype = {
  initMembers: function() {},
  setBattler: function() {},
  update: function() {},
  updateBitmap: function() {},
  updateFrame: function() {},
  updateCollapse: function() {}
};
global.Sprite_Battler = function() {};
global.Sprite_Battler.prototype = {
  setMirror: function() {},
  updateFrame: function() {},
  updateBitmap: function() {}
};
global.Sprite_Animation = function() {};
global.Sprite_Animation.prototype = {};
global.Sprite_Actor = { MOTIONS: { walk: { loop: true } } };
global.ImageManager = {};

Array.prototype.contains = function(element) { return this.indexOf(element) !== -1; };

const pluginCode = fs.readFileSync('js/plugins/YEP_X_AnimatedSVEnemies.js', 'utf8');
vm.runInThisContext(pluginCode);

const mockEnemyData = { note: note };
const mockGroup = [null, mockEnemyData];

DataManager.processSVENotetags1(mockGroup);

console.log('TEST RESULT:');
console.log('sideviewBattler:', mockEnemyData.sideviewBattler);
console.log('sideviewFolder:', mockEnemyData.sideviewFolder);
console.log('sideviewFrames:', mockEnemyData.sideviewFrames);
console.log('sideviewFrameSpeed:', mockEnemyData.sideviewFrameSpeed);
console.log('sideviewNoMirror:', mockEnemyData.sideviewNoMirror);
console.log('sideviewCollapse:', mockEnemyData.sideviewCollapse);

// Test Game_Enemy prototype integration
const enemy = new Game_Enemy();
enemy.enemy = function() { return mockEnemyData; };
enemy.hasSVBattler = function() { return true; };

console.log('Game_Enemy sideviewFrames:', enemy.sideviewFrames());
console.log('Game_Enemy sideviewRows:', enemy.sideviewRows());
console.log('Game_Enemy sideviewFolder:', enemy.sideviewFolder());
console.log('Game_Enemy sideviewNoMirror:', enemy.sideviewNoMirror());
console.log('Game_Enemy spriteScaleX (should be positive 1):', enemy.spriteScaleX());

// Test Sprite_Enemy setMirror
const sprite = new Sprite_Enemy();
sprite._svBattlerEnabled = true;
sprite._enemy = enemy;
let mirrorApplied = null;
global.Sprite_Battler.prototype.setMirror = function(val) { mirrorApplied = val; };
sprite.setMirror(false);
console.log('Sprite_Enemy setMirror with NoMirror (should be false):', mirrorApplied);

if (
  mockEnemyData.sideviewBattler[0] === 'sv_alam liar_babi hutan' &&
  mockEnemyData.sideviewFolder === 'sv_enemies' &&
  mockEnemyData.sideviewFrames === 8 &&
  mockEnemyData.sideviewFrameSpeed === 8 &&
  mockEnemyData.sideviewNoMirror === true &&
  mockEnemyData.sideviewCollapse === true &&
  enemy.sideviewFrames() === 8 &&
  enemy.sideviewNoMirror() === true &&
  enemy.spriteScaleX() === 1 &&
  mirrorApplied === false
) {
  console.log('\n>>> ALL ASSERTIONS PASSED! PLUGIN MODIFICATION IS 100% OPERATIONAL! <<<');
} else {
  console.error('\n>>> ASSERTION FAILED! <<<');
  process.exit(1);
}
