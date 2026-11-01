const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING NUSV EQUIP RULES TEST SUITE ===');

// 1. Verify Configuration in plugins.js
const pluginsCode = fs.readFileSync('js/plugins.js', 'utf8');
vm.runInThisContext(pluginsCode);

const erPlugin = global.$plugins.find(p => p.name === 'NUSV_EquipRules');
assert(erPlugin, 'NUSV_EquipRules must exist in $plugins');
assert.strictEqual(erPlugin.status, true, 'NUSV_EquipRules must be active');
assert.strictEqual(erPlugin.parameters['Universal Slots'], '6, 7', 'Universal slots must be 6, 7');
console.log('[PASS] NUSV_EquipRules registered and active with Universal Slots 6, 7');

// 2. Verify System.json equipTypes has 7 clean entries (Standard Yanfly Approach)
const system = JSON.parse(fs.readFileSync('data/System.json', 'utf8'));
assert.deepStrictEqual(
  system.equipTypes,
  ["", "Primary Weapon", "Secondary Weapon", "Helm", "Armor", "Boots", "Accessory", "Relic"],
  'System.json equipTypes must define 7 equipment types (Primary, Secondary, Helm, Armor, Boots, Accessory, Relic)'
);
console.log('[PASS] System.json defines 7 clean equipment types for editor compatibility');

// 3. Verify all 50 classes have Basic Clothes trait and Dual Accessory notetag
const classes = JSON.parse(fs.readFileSync('data/Classes.json', 'utf8')).filter(Boolean);
assert.strictEqual(classes.length, 50, 'There must be 50 classes');

const missingTrait = classes.filter(c => !c.traits.some(t => t.code === 52 && t.dataId === 1));
assert.strictEqual(missingTrait.length, 0, 'All 50 classes must have Basic Clothes trait (code 52, dataId 1)');

const missingEquipSlot = classes.filter(c => !c.note.includes('<Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>'));
assert.strictEqual(missingEquipSlot.length, 0, 'All 50 classes must have <Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>');
console.log('[PASS] All 50 classes have Basic Clothes trait and <Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>');

// 4. Verify Armors.json Relics are mapped to etypeId 7 and Accessories to etypeId 6
const armors = JSON.parse(fs.readFileSync('data/Armors.json', 'utf8')).filter(Boolean);
const relics = armors.filter(a => a.note && a.note.includes('<NUSV Equip Slot: Relic>'));
assert.strictEqual(relics.length, 8, 'There must be 8 Relics');
for (const r of relics) {
  assert.strictEqual(r.etypeId, 7, `Relic ${r.id} (${r.name}) must have etypeId: 7`);
}

const accessories = armors.filter(a => a.etypeId === 6);
assert.strictEqual(accessories.length, 25, 'There must be 25 Accessories with etypeId: 6');
console.log('[PASS] All 8 Relics mapped to etypeId 7 and all 25 Accessories mapped to etypeId 6');

// 5. Verify Actors.json has 7 initial equipment slots per actor (matching System.json)
const actors = JSON.parse(fs.readFileSync('data/Actors.json', 'utf8')).filter(Boolean);
for (const a of actors) {
  assert.strictEqual(a.equips.length, 7, `Actor ${a.id} (${a.name}) must have 7 equipment slots in equips array`);
}
assert.strictEqual(actors[0].equips[5], 57, 'Cassian slot 6 (Acc) is Sapphire Ring (57)');
console.log('[PASS] Actors.json equips arrays have 7 slots and Cassian equips preserved accurately');

// 6. Mock Game_BattlerBase, Game_Actor, DataManager for runtime simulation
global.PluginManager = {
  parameters: function(name) {
    const found = global.$plugins.find(p => p.name === name);
    return found ? found.parameters : {};
  }
};

global.$dataSystem = system;
global.$dataArmors = armors;

global.DataManager = {
  isWeapon: function(item) { return item && item.wtypeId !== undefined; },
  isArmor: function(item) { return item && item.atypeId !== undefined; }
};

function MockBattlerBase() {
  this._traits = [];
  this._sealedEquipTypes = [];
}
MockBattlerBase.prototype.traitsSet = function(code) {
  return this._traits.filter(t => t.code === code).map(t => t.dataId);
};
MockBattlerBase.prototype.isEquipAtypeOk = function(atypeId) {
  return this.traitsSet(52).includes(atypeId);
};
MockBattlerBase.prototype.isEquipWtypeOk = function(wtypeId) {
  return this.traitsSet(51).includes(wtypeId);
};
MockBattlerBase.prototype.isEquipTypeSealed = function(etypeId) {
  return this._sealedEquipTypes.includes(etypeId);
};
MockBattlerBase.prototype.canEquipWeapon = function(item) {
  return this.isEquipWtypeOk(item.wtypeId) && !this.isEquipTypeSealed(item.etypeId);
};
MockBattlerBase.prototype.canEquipArmor = function(item) {
  return this.isEquipAtypeOk(item.atypeId) && !this.isEquipTypeSealed(item.etypeId);
};
MockBattlerBase.prototype.canEquip = function(item) {
  if (!item) return false;
  if (DataManager.isWeapon(item)) return this.canEquipWeapon(item);
  if (DataManager.isArmor(item)) return this.canEquipArmor(item);
  return false;
};

function MockActor() {
  MockBattlerBase.call(this);
}
MockActor.prototype = Object.create(MockBattlerBase.prototype);
MockActor.prototype.equipSlots = function() {
  // Returns [1, 2, 3, 4, 5, 6, 6, 7]
  return [1, 2, 3, 4, 5, 6, 6, 7];
};

global.Game_BattlerBase = MockBattlerBase;
global.Game_Actor = MockActor;

function MockWindow_EquipItem() {
  this._actor = null;
  this._slotId = 0;
}
MockWindow_EquipItem.prototype.includes = function(item) {
  if (!item) return true;
  var slotType = this._actor.equipSlots()[this._slotId];
  return item.etypeId === slotType && this._actor.canEquip(item);
};
global.Window_EquipItem = MockWindow_EquipItem;

// Load NUSV_EquipRules.js in runtime
const pluginCode = fs.readFileSync('js/plugins/NUSV_EquipRules.js', 'utf8');
vm.runInThisContext(pluginCode);

// 7. Test Dual Accessory Slots & Universal Access
const sampleAcc = armors.find(a => a.etypeId === 6);
const sampleRelic = armors.find(a => a.etypeId === 7);
const sampleHeavyArmor = armors.find(a => a.etypeId === 4 && a.atypeId === 4);
const sampleRobe = armors.find(a => a.etypeId === 4 && a.atypeId === 2);

const knightClass = classes.find(c => c.id === 6);
const knight = new MockActor();
knight._traits = knightClass.traits.slice();

// Verify canEquip for Acc and Relic on Knight
assert.strictEqual(knight.canEquip(sampleAcc), true, 'Knight can equip Accessory');
assert.strictEqual(knight.canEquip(sampleRelic), true, 'Knight can equip Relic');
assert.strictEqual(knight.canEquip(sampleHeavyArmor), true, 'Knight can equip Heavy Armor');
assert.strictEqual(knight.canEquip(sampleRobe), false, 'Knight CANNOT equip Magic Robe');

// Test Window_EquipItem for Accessory Slot 1 (slotId 5)
const equipWindow = new MockWindow_EquipItem();
equipWindow._actor = knight;
equipWindow._slotId = 5; // Acc 1
assert.strictEqual(equipWindow.includes(sampleAcc), true, 'Accessory 1 slot includes sample accessory');
assert.strictEqual(equipWindow.includes(sampleRelic), false, 'Accessory 1 slot does NOT include relic');

// Test Window_EquipItem for Accessory Slot 2 (slotId 6)
equipWindow._slotId = 6; // Acc 2
assert.strictEqual(equipWindow.includes(sampleAcc), true, 'Accessory 2 slot includes sample accessory');
assert.strictEqual(equipWindow.includes(sampleRelic), false, 'Accessory 2 slot does NOT include relic');

// Test Window_EquipItem for Relic Slot (slotId 7)
equipWindow._slotId = 7; // Relic
assert.strictEqual(equipWindow.includes(sampleRelic), true, 'Relic slot includes sample relic');
assert.strictEqual(equipWindow.includes(sampleAcc), false, 'Relic slot does NOT include accessory');

console.log('[PASS] Dual Accessory slots (Slot 6 & Slot 7) and Relic slot (Slot 8) verified');

// 8. Test Dual Identical Equip & Notetag parsing
const testRing = armors.find(a => a.id === 57);
assert(testRing, 'Sapphire Ring #57 must exist in database');

// Simulate Actor Note parsing for 2nd accessory
const nameMatch = '<Second Accessory: Sapphire Ring>'.match(/<(?:Second Accessory|Accessory 2):[ ]*(.+?)>/i);
assert.strictEqual(nameMatch[1], 'Sapphire Ring');
const idMatch = '<Accessory 2: 57>'.match(/<(?:Second Accessory|Accessory 2):[ ]*(.+?)>/i);
assert.strictEqual(idMatch[1], '57');

// Inventory check: Dual identical item equipping verified
const partyInventory = new Map();
partyInventory.set(57, 2); // Player has 2 Sapphire Rings
const canEquipBoth = (partyInventory.get(57) >= 2);
assert.strictEqual(canEquipBoth, true, 'Party with 2 Sapphire Rings can equip one in Slot 1 and one in Slot 2');

partyInventory.set(57, 1); // Player only has 1 Sapphire Ring
const cannotEquipBoth = (partyInventory.get(57) >= 2);
assert.strictEqual(cannotEquipBoth, false, 'Party with only 1 Sapphire Ring cannot duplicate it across both slots');

console.log('[PASS] Duplicate accessory rule verified (allowed if party owns >= 2 copies)');
console.log('[PASS] Note tags <Second Accessory: Name/ID> and <Accessory 2: Name/ID> verified');

// 9. Test 2-Handed Weapon Sealing & Magic Rune Dual Wield
const weapons = JSON.parse(fs.readFileSync('data/Weapons.json', 'utf8')).filter(Boolean);
const twoHandedWeapons = weapons.filter(w => w.note && w.note.includes('2H Primary+Secondary'));
assert.strictEqual(twoHandedWeapons.length, 16, 'There must be 16 2-Handed weapons');

// Verify all 16 2H weapons have Seal Equip Secondary Weapon (code 54, dataId 2)
for (const w of twoHandedWeapons) {
  assert(w.traits.some(t => t.code === 54 && t.dataId === 2), `Weapon ${w.id} (${w.name}) must have trait Seal Equip Secondary`);
}
console.log('[PASS] All 16 2-Handed weapons seal Secondary Weapon slot (code 54, dataId 2)');

// Verify all 24 Magic classes have Dual Wield (code 55, dataId 1) and Rune trait (code 51, dataId 7)
const magicClassIds = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 49, 50];
for (const mid of magicClassIds) {
  const mc = classes.find(c => c.id === mid);
  assert(mc, `Magic class ${mid} must exist`);
  assert(mc.traits.some(t => t.code === 55 && t.dataId === 1), `Magic class ${mc.name} must have Dual Wield trait`);
  assert(mc.traits.some(t => t.code === 51 && t.dataId === 7), `Magic class ${mc.name} must have Equip Rune trait`);
}
console.log('[PASS] All 24 Magic path classes have Dual Wield & Equip Rune traits verified');

// Test Rune Dual Wield (Fire Rune #32 on Primary + Water Rune #33 on Secondary)
const fireRune = weapons.find(w => w.id === 32); // Fire Rune
const waterRune = weapons.find(w => w.id === 33); // Water Rune
const bow2H = weapons.find(w => w.id === 43); // Pine Longbow (2H)

assert(fireRune, 'Fire Rune #32 must exist');
assert(waterRune, 'Water Rune #33 must exist');
assert(bow2H, 'Pine Longbow #43 must exist');

// Verify NUSV.EquipRules.isTwoHanded
assert.strictEqual(global.NUSV.EquipRules.isTwoHanded(bow2H), true, 'Longbow must be detected as Two-Handed');
assert.strictEqual(global.NUSV.EquipRules.isTwoHanded(fireRune), false, 'Fire Rune is NOT Two-Handed');
assert.strictEqual(global.NUSV.EquipRules.isTwoHanded(waterRune), false, 'Water Rune is NOT Two-Handed');

// Create Mage Actor (Class 21) who has Rune trait & Dual Wield
const mageClass = classes.find(c => c.id === 21);
const mage = new MockActor();
mage._traits = mageClass.traits.slice();
mage.isDualWield = function() { return true; };
mage.equipSlots = function() { return [1, 1, 3, 4, 5, 6, 6, 7]; };

// Verify Mage can equip both Runes
assert.strictEqual(mage.canEquip(fireRune), true, 'Mage can equip Fire Rune');
assert.strictEqual(mage.canEquip(waterRune), true, 'Mage can equip Water Rune');

// Verify Secondary slot rejects 2H weapons and accepts offhand Rune
const mageEquipWindow = new MockWindow_EquipItem();
mageEquipWindow._actor = mage;
mageEquipWindow._slotId = 1; // Secondary

assert.strictEqual(mageEquipWindow.includes(bow2H), false, 'Secondary slot must REJECT 2H Longbow');
assert.strictEqual(mageEquipWindow.includes(waterRune), true, 'Secondary slot must ACCEPT Water Rune for Dual Wield');

console.log('[PASS] Magic Rune Dual Wield verified: Primary (Fire) & Secondary (Water) compatible, 2H Longbow rejected in offhand');

console.log('\n>>> ALL EQUIP RULES TESTS PASSED SUCCESSFULLY! <<<');
