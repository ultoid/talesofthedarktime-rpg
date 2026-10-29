const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

global.window = global;
global.require = require;
global.Imported = {};
global.NUSV = {};
global.PluginManager = {
    parameters: () => ({
        'Portrait Note Tag': 'Status Image',
        'Default Portrait Prefix': 'Hero_'
    })
};
global.Graphics = { boxWidth: 1080, boxHeight: 720 };
global.Window_Base = function() {};
global.Window_Base._faceWidth = 144;
global.Window_Base._faceHeight = 144;
global.Window_Base.prototype = {};
global.Window_Selectable = function() {};
global.Window_Selectable.prototype = Object.create(global.Window_Base.prototype);
global.Window_Command = function() {};
global.Window_Command.prototype = Object.create(global.Window_Selectable.prototype);
global.Scene_MenuBase = function() {};
global.Scene_MenuBase.prototype = {};
global.Scene_Status = function() {};
global.Scene_Status.prototype = Object.create(global.Scene_MenuBase.prototype);
global.ImageManager = {
    loadPicture: (name) => ({ name, isReady: () => true }),
    loadFace: (name) => ({ name, isReady: () => true })
};
global.SoundManager = { playOk: () => {}, playCancel: () => {}, playCursor: () => {} };
global.TextManager = {};

const code = fs.readFileSync('js/plugins/NUSV_StatusScreen.js', 'utf8');
vm.runInThisContext(code);

const portraitName = NUSV.StatusScreen.portraitName;
assert(typeof portraitName === 'function', 'portraitName must be exported');

// 1. Fighter (no notetag) returns '' (no automatic Hero_ prefix, safe fallback to face graphic)
const fighter = { name: () => 'FIGHTER', actor: () => ({ note: '<Second Accessory: Iron Ring>' }) };
assert.strictEqual(portraitName(fighter), '', 'FIGHTER with no notetag should return empty string (no crash)');

// 2. Actor with <Portrait: Avalerion_Paladin M>
const paladin = { name: () => 'FIGHTER', actor: () => ({ note: '<Portrait: Avalerion_Paladin M>' }) };
assert.strictEqual(portraitName(paladin), 'Avalerion_Paladin M', 'Should read <Portrait: ...>');

// 3. Actor with <Status Image: Hero_Cassian.png>
const cassianWithExt = { name: () => 'Hero', actor: () => ({ note: '<Status Image: Hero_Cassian.png>' }) };
assert.strictEqual(portraitName(cassianWithExt), 'Hero_Cassian', 'Should strip .png extension');

// 4. Cassian with <Portrait: Hero_Cassian>
const cassianTagged = { name: () => 'Cassian', actor: () => ({ note: '<Portrait: Hero_Cassian>' }) };
assert.strictEqual(portraitName(cassianTagged), 'Hero_Cassian', 'Cassian should resolve to Hero_Cassian via notetag');

// 5. Actor with class notetag
const classActor = {
    name: () => 'RandomGuy',
    actor: () => ({ note: '' }),
    currentClass: () => ({ note: '<Portrait: Avalerion_Priest F>' })
};
assert.strictEqual(portraitName(classActor), 'Avalerion_Priest F', 'Should read portrait from class note');

// 6. Non-existent file notetag logs warning and returns '' safely
const nonExistent = {
    name: () => 'Fighter',
    actor: () => ({ note: '<Portrait: DoesNotExistImage123>' })
};
assert.strictEqual(portraitName(nonExistent), '', 'Non-existent portrait tag should safely return empty string');

console.log('ALL NUSV_StatusScreen portrait resolution tests PASSED successfully!');
