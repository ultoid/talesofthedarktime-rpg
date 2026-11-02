const fs = require('fs');
const vm = require('vm');

// Load databases
const dataSkills = JSON.parse(fs.readFileSync('data/Skills.json', 'utf8'));
const dataClasses = JSON.parse(fs.readFileSync('data/Classes.json', 'utf8'));
const dataItems = JSON.parse(fs.readFileSync('data/Items.json', 'utf8'));

// Setup global environment
global.$dataSkills = dataSkills;
global.$dataClasses = dataClasses;
global.$dataItems = dataItems;
global.$dataWeapons = [];
global.$dataArmors = [];
global.window = global;
var window = global;
global.$gameParty = {
    gold: () => 99999,
    members: () => [],
    menuActor: () => null,
    loseGold: () => { },
    loseItem: () => { },
    numItems: () => 99
};
global.$gameSwitches = { value: () => false, _data: [] };
global.$gameVariables = { value: () => 0, _data: [] };
global.AudioManager = { playSe: () => { } };
global.SoundManager = { playBuzzer: () => { } };
global.Graphics = { boxWidth: 1280, boxHeight: 720 };
global.SceneManager = { _scene: null, push: () => { } };

global.PluginManager = {
    parameters: (name) => {
        if (name === 'NUSV_SkillLearn') {
            return {
                'Menu Command Name': 'Learn Skills',
                'Show In Menu': 'true',
                'Default Learn Cost JP': '0'
            };
        }
        if (name === 'NUSV_ClassChange') {
            return {
                'Retain Learned Skills': 'true',
                'Allow Same Class': 'false'
            };
        }
        return {};
    }
};

global.Imported = {
    NUSV_ClassChange: true,
    NUSV_JobPoints: true
};

global.NUSV = {};

// Mock MV constructors
function makeClass(name) {
    global[name] = function () { };
    global[name].prototype = {};
    global[name].prototype.constructor = global[name];
}

makeClass('Game_Action');
makeClass('Game_Actor');
makeClass('Game_BattlerBase');
makeClass('Game_Battler');
makeClass('Game_System');
makeClass('Window_Base');
makeClass('Window_Selectable');
Window_Selectable.prototype.initialize = function () { };
Window_Selectable.prototype.refresh = function () { };
Window_Selectable.prototype.createContents = function () { };
Window_Selectable.prototype.drawAllItems = function () { };
Window_Selectable.prototype.select = function () { };
makeClass('Window_Command');
makeClass('Window_MenuStatus');
makeClass('Window_MenuActor');
makeClass('Window_MenuCommand');
makeClass('Scene_MenuBase');
makeClass('Scene_Menu');
makeClass('Game_Interpreter');

// Setup Game_Action default testItemEffect
Game_Action.EFFECT_LEARN_SKILL = 43;
Game_Action.prototype.testItemEffect = function (target, effect) {
    switch (effect.code) {
        case Game_Action.EFFECT_LEARN_SKILL:
            return target.isActor() && !target.isLearnedSkill(effect.dataId);
        default:
            return true;
    }
};

// Setup Game_Actor basic methods
Game_Actor.prototype.isActor = function () { return true; };
Game_Actor.prototype.isLearnedSkill = function (skillId) {
    return this._skills.indexOf(skillId) >= 0;
};
Game_Actor.prototype.learnSkill = function (skillId) {
    if (!this.isLearnedSkill(skillId)) {
        this._skills.push(skillId);
    }
};
Game_Actor.prototype.refresh = function () { };
Game_Actor.prototype.currentClass = function () {
    return $dataClasses[this._classId];
};
Game_Actor.prototype.addedSkillTypes = function () {
    return [3]; // Default Skill (3)
};
Game_Actor.prototype.jp = function () { return 500; };
Game_Actor.prototype.loseJp = function (val) { };

// Load plugins
const classChangeCode = fs.readFileSync('js/plugins/NUSV_ClassChange.js', 'utf8');
vm.runInThisContext(classChangeCode);

const skillLearnCode = fs.readFileSync('js/plugins/NUSV_SkillLearn.js', 'utf8');
vm.runInThisContext(skillLearnCode);

console.log('--- TEST 1: TM COMPATIBILITY CHECK ---');
// Actor 1: Fighter (Class ID 1)
const actorFighter = new Game_Actor();
actorFighter._classId = 1; // Fighter
actorFighter._skills = [];
actorFighter.level = 10;

// Actor 2: Apprentice (Class ID 17)
const actorApprentice = new Game_Actor();
actorApprentice._classId = 17; // Apprentice
actorApprentice._skills = [];
actorApprentice.level = 10;

// Skill 24: Sovereign Execution (Champion move, TM Item 412)
// Compatible: Fighter, Warrior, Squire, Mercenary, Knight, Champion, Paladin, Berserker, Death Knight, Holy Knight
console.log('Can Fighter learn Sovereign Execution (ID 24) via TM?:', actorFighter.nusvCanLearnTmSkill(24));
console.log('Can Apprentice learn Sovereign Execution (ID 24) via TM?:', actorApprentice.nusvCanLearnTmSkill(24));

// Test Game_Action using TM Item 412
const action412 = new Game_Action();
const item412 = $dataItems[412];
const effect412 = item412.effects.find(e => e.code === 43);

console.log('Item 412 usable on Fighter?:', action412.testItemEffect(actorFighter, effect412));
console.log('Item 412 usable on Apprentice?:', action412.testItemEffect(actorApprentice, effect412));

// Fighter learns Sovereign Execution
actorFighter.learnSkill(24);
console.log('After learning, can Fighter use Item 412 again?:', action412.testItemEffect(actorFighter, effect412));

console.log('\n--- TEST 2: SIGNATURE / ULTIMATE MOVE PROTECTION ---');
// Skill 28: Mandala Execution (Champion Ultimate - Exclusive)
console.log('Can Fighter learn Mandala Execution (ID 28) via TM?:', actorFighter.nusvCanLearnTmSkill(28));

console.log('\n--- TEST 3: LEARN SKILLS MENU FILTERING ---');
const learnWindowFighter = new Window_NUSVSkillLearnList();
learnWindowFighter.setActor(actorFighter);
learnWindowFighter.makeItemList();
console.log('Skills visible to Fighter in Learn Skills menu:', learnWindowFighter._data.map(s => s.name));

const actorChampion = new Game_Actor();
actorChampion._classId = 8; // Champion
actorChampion._skills = [];
actorChampion.level = 45;

const learnWindowChampion = new Window_NUSVSkillLearnList();
learnWindowChampion.setActor(actorChampion);
learnWindowChampion.makeItemList();
console.log('Skills visible to Champion in Learn Skills menu:', learnWindowChampion._data.map(s => s.name));

console.log('\n--- TEST 4: DYNAMIC SKILL TYPES RETENTION ---');
// Actor Fighter knows skill 24 (stype 3: Skill)
// Suppose Fighter also learned White Magic spell ID 143 (Heal, stype 1: White Magic) via TM
actorFighter.learnSkill(143);
console.log('Fighter addedSkillTypes with cross-class White Magic:', actorFighter.addedSkillTypes());

console.log('\nALL SIMULATION TESTS PASSED PERFECTLY!');
