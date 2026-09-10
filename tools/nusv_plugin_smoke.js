const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

function noop() {}

global.window = global;
global.window.addEventListener = noop;
global.Imported = {
  YEP_CoreEngine: true,
  YEP_BattleEngineCore: true,
  YEP_SkillCore: true,
  YEP_ItemCore: true,
  YEP_EquipCore: true,
  YEP_EventChasePlayer: true,
  YEP_MainMenuManager: true
};
global.Yanfly = { Param: { ItemMaxWeapons: 100, ItemMaxArmors: 100 } };

function makeClass(name) {
  global[name] = function() {};
  global[name].prototype = {};
  global[name].prototype.constructor = global[name];
}

[
  'Game_Action',
  'Game_Actor',
  'Game_BattlerBase',
  'Game_Enemy',
  'Game_Event',
  'Game_Follower',
  'Game_Followers',
  'Game_Interpreter',
  'Game_Party',
  'Game_Player',
  'Game_System',
  'Game_Troop',
  'Scene_Battle',
  'Scene_Item',
  'Scene_Map',
  'Scene_Menu',
  'Scene_MenuBase',
  'Window_Base',
  'Window_BattleActor',
  'Window_BattleEnemy',
  'Window_BattleLog',
  'Window_Command',
  'Window_ItemCategory',
  'Window_ItemList',
  'Window_MenuActor',
  'Window_MenuCommand',
  'Window_MenuStatus',
  'Window_Options',
  'Window_PartyCommand',
  'Window_Selectable',
  'Window_SkillList',
  'Window_Help',
  'Sprite_Animation'
].forEach(makeClass);

Object.assign(Game_Action.prototype, {
  applyCritical: value => value * 3,
  applyGuard: value => value,
  applyVariance: value => value,
  calcElementRate: () => 1,
  evalDamageFormula: () => 0,
  friendsUnit: () => ({ members: () => [], aliveMembers: () => [] }),
  isForDeadFriend: () => false,
  isForFriend: () => false,
  isForOpponent: () => true,
  isMagical: () => false,
  isPhysical: () => true,
  item: () => ({ note: '', damage: { type: 1, variance: 0, critical: false } }),
  makeDamageValue: () => 0,
  makeTargets: () => [],
  needsSelection: () => false,
  numRepeats: () => 1,
  opponentsUnit: () => ({ members: () => [], aliveMembers: () => [] }),
  setAttack: noop,
  setItemObject: noop,
  subject: () => null
});

Object.assign(Game_Actor.prototype, {
  actor: () => ({ note: '', meta: {} }),
  actorId: () => 1,
  addedSkillTypes: () => [],
  changeClass: noop,
  currentClass: () => ({ id: 1, name: 'Class', note: '' }),
  equips: () => [],
  expForLevel: level => level,
  initExp: noop,
  isDead: () => false,
  isLearnedSkill: () => false,
  learnSkill: noop,
  paramPlus: () => 0,
  refresh: noop,
  setHp: noop,
  setMp: noop,
  setup: noop,
  traitObjects: () => []
});

Object.assign(Game_BattlerBase.prototype, {
  sparam: () => 1,
  traitObjects: () => [],
  xparam: () => 0
});

Object.assign(Game_Enemy.prototype, {
  enemy: () => ({ name: 'Enemy', note: '' }),
  exp: () => 0,
  gold: () => 0,
  name: () => 'Enemy',
  paramBase: () => 1,
  refresh: noop,
  setup: noop,
  traitObjects: () => []
});

Object.assign(Game_Event.prototype, {
  canSeePlayer: () => true,
  isNearThePlayer: () => true,
  page: () => ({ list: [] }),
  updateChaseDistance: noop
});

Object.assign(Game_Followers.prototype, { setup: noop });
Object.assign(Game_Interpreter.prototype, { pluginCommand: noop });
Object.assign(Game_Party.prototype, {
  addActor: noop,
  allItems: () => [],
  battleMembers: () => [],
  gold: () => 0,
  hasItem: () => false,
  inBattle: () => false,
  initialize: noop,
  items: () => [],
  loseGold: noop,
  loseItem: noop,
  members: () => [],
  numItems: () => 0
});
Object.assign(Game_Player.prototype, {
  initialize: noop,
  isDashing: () => false,
  isMoving: () => false,
  refresh: noop,
  regionId: () => 0,
  update: noop
});
Object.assign(Game_System.prototype, { initialize: noop });
Object.assign(Game_Troop.prototype, {
  deadMembers: () => [],
  members: () => []
});

[
  Window_Base,
  Window_Command,
  Window_Selectable,
  Window_ItemCategory,
  Window_ItemList,
  Window_MenuCommand,
  Window_Options,
  Window_PartyCommand,
  Window_SkillList,
  Window_Help
].forEach(klass => Object.assign(klass.prototype, {
  activate: noop,
  addCommand: noop,
  addOriginalCommands: noop,
  addVolumeOptions: noop,
  callUpdateHelp: noop,
  changePaintOpacity: noop,
  changeTextColor: noop,
  changeValue: noop,
  clearCommandList: noop,
  commandSymbol: () => '',
  createContents: noop,
  currentExt: () => null,
  currentSymbol: () => '',
  drawAllItems: noop,
  drawActorFace: noop,
  drawItemName: noop,
  drawText: noop,
  getConfigValue: () => 1,
  hide: noop,
  index: () => 0,
  initialize: noop,
  isEnabled: () => true,
  makeCommandList: noop,
  move: noop,
  processOk: noop,
  refresh: noop,
  resetScroll: noop,
  resetTextColor: noop,
  select: noop,
  selectLast: noop,
  setCategory: noop,
  setHandler: noop,
  setHelpWindow: noop,
  setItem: noop,
  setText: noop,
  show: noop,
  statusText: () => '',
  systemColor: () => '',
  normalColor: () => ''
}));

Object.assign(Scene_MenuBase.prototype, {
  addWindow: noop,
  create: noop,
  createHelpWindow: noop,
  initialize: noop,
  popScene: noop
});
Object.assign(Scene_Battle.prototype, {
  commandAttack: noop,
  createAllWindows: noop,
  createPartyCommandWindow: noop,
  onActorOk: noop,
  onEnemyOk: noop,
  onSelectAction: noop,
  refreshStatus: noop,
  startActorCommandSelection: noop
});
Object.assign(Scene_Item.prototype, {
  createCategoryWindow: noop,
  onCategoryOk: noop
});
Object.assign(Scene_Map.prototype, { update: noop });
Object.assign(Scene_Menu.prototype, {
  commandFormation: noop,
  commandPersonal: noop,
  createCommandWindow: noop,
  onPersonalOk: noop
});
Object.assign(Sprite_Animation.prototype, { updateMain: noop });

global.AudioManager = { playSe: noop };
global.BattleManager = {
  actor: () => null,
  displayRewards: noop,
  endAction: noop,
  gainRewards: noop,
  initMembers: noop,
  inputtingAction: () => new Game_Action(),
  processActionSequence: () => false,
  refreshStatus: noop,
  selectNextCommand: noop,
  startAction: noop,
  startInput: noop
};
global.ConfigManager = {
  applyData: noop,
  makeData: () => ({}),
  readFlag: (config, key) => !!config[key],
  save: noop
};
global.DataManager = {
  isArmor: item => !!item && item.kind === 'armor',
  isItem: item => !!item && item.kind === 'item',
  isSkill: item => !!item && item.kind === 'skill',
  isWeapon: item => !!item && item.kind === 'weapon'
};
global.Graphics = { boxHeight: 624, boxWidth: 816 };
global.Input = {};
global.PluginManager = { parameters: () => ({}) };
global.SceneManager = { _scene: null, changeScene: noop, push: noop };
global.SoundManager = { playBuzzer: noop, playCancel: noop, playEquip: noop, playOk: noop };
global.TextManager = {
  alwaysDash: 'Always Dash',
  armor: 'Armor',
  bgmVolume: 'BGM',
  bgsVolume: 'BGS',
  commandRemember: 'Command Remember',
  item: 'Item',
  keyItem: 'Key Item',
  meVolume: 'ME',
  seVolume: 'SE',
  weapon: 'Weapon'
};

global.$dataArmors = [null];
global.$dataClasses = [null, { id: 1, name: 'Class', note: '' }];
global.$dataCommonEvents = [null];
global.$dataItems = [null];
global.$dataSkills = [null];
global.$dataStates = [null];
global.$dataWeapons = [null];
global.$gameActors = { actor: () => new Game_Actor() };
global.$gameMap = { isEventRunning: () => false };
global.$gameMessage = { add: noop, isBusy: () => false };
global.$gameParty = new Game_Party();
global.$gamePlayer = new Game_Player();
global.$gameSwitches = { _data: [], setValue: noop, value: () => false };
global.$gameTemp = { reserveCommonEvent: noop };
global.$gameTroop = new Game_Troop();
global.$gameVariables = { _data: [], setValue: noop, value: () => 0 };

if (!Array.prototype.contains) {
  Array.prototype.contains = function(value) {
    return this.indexOf(value) >= 0;
  };
}
if (!Math.randomInt) {
  Math.randomInt = function(max) {
    return Math.floor(max * Math.random());
  };
}

const pluginsJs = fs.readFileSync(path.join(root, 'js', 'plugins.js'), 'utf8');
vm.runInThisContext(pluginsJs, { filename: 'js/plugins.js' });

const activeNusvPlugins = global.$plugins
  .filter(plugin => plugin.status && /^NUSV_/.test(plugin.name))
  .map(plugin => plugin.name);

let failures = 0;
for (const name of activeNusvPlugins) {
  const file = path.join(root, 'js', 'plugins', `${name}.js`);
  try {
    vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
    console.log(`OK ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}`);
    console.error(error && error.stack ? error.stack : error);
  }
}

process.exitCode = failures ? 1 : 0;
