const fs = require('fs');

console.log('=== NUSV SYSTEM MASTER RE-APPLY SCRIPT ===');

// -----------------------------------------------------------------------------
// 1. System.json
// -----------------------------------------------------------------------------
const sys = JSON.parse(fs.readFileSync('data/System.json', 'utf8'));
sys.equipTypes = ['', 'Primary Weapon', 'Secondary Weapon', 'Helm', 'Armor', 'Boots', 'Accessory', 'Relic'];
if (sys.testBattlers) {
  sys.testBattlers.forEach(tb => {
    if (tb.equips && tb.equips.length === 8) {
      tb.equips = [tb.equips[0], tb.equips[1], tb.equips[2], tb.equips[3], tb.equips[4], tb.equips[5], tb.equips[7]];
    }
  });
}
fs.writeFileSync('data/System.json', JSON.stringify(sys));
console.log('[1/6] System.json: 7 equipment types set, testBattlers synced.');

// -----------------------------------------------------------------------------
// 2. Armors.json (Accessories etypeId: 6, Relics etypeId: 7)
// -----------------------------------------------------------------------------
const armors = JSON.parse(fs.readFileSync('data/Armors.json', 'utf8'));
let relicCount = 0;
let accCount = 0;
for (let i = 1; i < armors.length; i++) {
  const a = armors[i];
  if (!a) continue;
  if (a.note && a.note.includes('<NUSV Equip Slot: Relic>')) {
    a.etypeId = 7;
    relicCount++;
  } else if (a.etypeId === 6 || (a.note && a.note.includes('Accessory'))) {
    a.etypeId = 6;
    accCount++;
  }
}
fs.writeFileSync('data/Armors.json', JSON.stringify(armors));
console.log(`[2/6] Armors.json: ${accCount} Accessories (type 6), ${relicCount} Relics (type 7) synced.`);

// -----------------------------------------------------------------------------
// 3. Weapons.json (36 2H weapons seal Secondary Weapon)
// -----------------------------------------------------------------------------
const weapons = JSON.parse(fs.readFileSync('data/Weapons.json', 'utf8'));
let twoHandCount = 0;
for (let i = 1; i < weapons.length; i++) {
  const w = weapons[i];
  if (!w) continue;
  if (w.note && w.note.includes('<NUSV Hand Slot: 2H Primary+Secondary>')) {
    if (!w.traits) w.traits = [];
    if (!w.traits.some(t => t.code === 54 && t.dataId === 2)) {
      w.traits.push({ code: 54, dataId: 2, value: 1 });
    }
    twoHandCount++;
  }
}
fs.writeFileSync('data/Weapons.json', JSON.stringify(weapons));
console.log(`[3/6] Weapons.json: ${twoHandCount} Two-Handed weapons sealed Secondary Weapon.`);

// -----------------------------------------------------------------------------
// 4. Classes.json (Basic Clothes, Equip Slot notetag, Magic Dual Wield & Rune)
// -----------------------------------------------------------------------------
const classes = JSON.parse(fs.readFileSync('data/Classes.json', 'utf8'));
const magicClassIds = [
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 49, 50
];

for (let i = 1; i < classes.length; i++) {
  const c = classes[i];
  if (!c) continue;

  // Basic Clothes trait (code 52, dataId 1)
  if (!c.traits) c.traits = [];
  if (!c.traits.some(t => t.code === 52 && t.dataId === 1)) {
    c.traits.push({ code: 52, dataId: 1, value: 1 });
  }

  // Equip Slot notetag
  if (!c.note.includes('<Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>')) {
    if (c.note.includes('<Equip Slot:')) {
      c.note = c.note.replace(/<Equip Slot:[^>]+>/i, '<Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>');
    } else {
      c.note = (c.note ? c.note + '\n' : '') + '<Equip Slot: 1, 2, 3, 4, 5, 6, 6, 7>';
    }
  }

  // Magic Path Dual Wield & Rune
  if (magicClassIds.includes(c.id)) {
    if (!c.traits.some(t => t.code === 51 && t.dataId === 7)) {
      c.traits.push({ code: 51, dataId: 7, value: 1 }); // Equip Rune
    }
    if (!c.traits.some(t => t.code === 55 && t.dataId === 1)) {
      c.traits.push({ code: 55, dataId: 1, value: 1 }); // Dual Wield
    }
  }
}
fs.writeFileSync('data/Classes.json', JSON.stringify(classes));
console.log('[4/6] Classes.json: 50/50 Basic Clothes, Dual Acc slots, 24/24 Magic Dual Wield & Rune synced.');

// -----------------------------------------------------------------------------
// 5. Actors.json (7 Initial Equip slots, Cassian equipment preserved)
// -----------------------------------------------------------------------------
const actors = JSON.parse(fs.readFileSync('data/Actors.json', 'utf8'));
for (let i = 1; i < actors.length; i++) {
  const a = actors[i];
  if (!a) continue;
  if (a.equips.length === 8) {
    a.equips = [a.equips[0], a.equips[1], a.equips[2], a.equips[3], a.equips[4], a.equips[5], a.equips[7]];
  }
}
fs.writeFileSync('data/Actors.json', JSON.stringify(actors));
console.log('[5/6] Actors.json: 7 equipment slots preserved for all actors.');

// -----------------------------------------------------------------------------
// 6. Update .bak safety copies
// -----------------------------------------------------------------------------
fs.copyFileSync('data/System.json', 'data/System.json.bak');
fs.copyFileSync('data/Armors.json', 'data/Armors.json.bak');
fs.copyFileSync('data/Weapons.json', 'data/Weapons.json.bak');
fs.copyFileSync('data/Classes.json', 'data/Classes.json.bak');
fs.copyFileSync('data/Actors.json', 'data/Actors.json.bak');
console.log('[6/6] Backups (.bak) updated.');

console.log('\n>>> MASTER RE-APPLY FINISHED SUCCESSFULLY! <<<');

