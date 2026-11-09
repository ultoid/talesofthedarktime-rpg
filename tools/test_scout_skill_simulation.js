const fs = require('fs');
const assert = require('assert');

console.log("=== SIMULATING SCOUT COMBAT & SKILL KIT ===");

const classes = JSON.parse(fs.readFileSync('data/Classes.json', 'utf8'));
const skills = JSON.parse(fs.readFileSync('data/Skills.json', 'utf8'));
const weapons = JSON.parse(fs.readFileSync('data/Weapons.json', 'utf8'));
const items = JSON.parse(fs.readFileSync('data/Items.json', 'utf8'));

const scoutClass = classes[39];
assert.strictEqual(scoutClass.name, 'Scout');

// 1. Check Skill parity between Quick Shot & Quick Stab
const quickShot = skills[188];
const quickStab = skills[189];

console.log("\n[1] Verifying parity between Quick Shot & Quick Stab:");
console.log(`  Quick Shot TP Cost: ${quickShot.tpCost} | Damage: ${quickShot.damage.formula}`);
console.log(`  Quick Stab TP Cost: ${quickStab.tpCost} | Damage: ${quickStab.damage.formula}`);
assert.strictEqual(quickShot.tpCost, quickStab.tpCost, "TP Cost must match");
assert.strictEqual(quickShot.damage.formula, quickStab.damage.formula, "Damage formula must match");
assert.strictEqual(quickShot.damage.type, quickStab.damage.type);
assert.strictEqual(quickShot.damage.elementId, quickStab.damage.elementId);
assert.strictEqual(quickShot.scope, quickStab.scope);
assert.strictEqual(quickShot.hitType, quickStab.hitType);
assert.strictEqual(quickShot.successRate, quickStab.successRate);

// 2. Weapon Requirements
console.log("\n[2] Verifying Weapon Requirements:");
console.log(`  Quick Shot reqWtypeId1: ${quickShot.requiredWtypeId1} (8=Long Bow), reqWtypeId2: ${quickShot.requiredWtypeId2} (9=Crossbow)`);
console.log(`  Quick Stab reqWtypeId1: ${quickStab.requiredWtypeId1} (10=Dagger), reqWtypeId2: ${quickStab.requiredWtypeId2} (0=None)`);
assert.strictEqual(quickShot.requiredWtypeId1, 8, "Quick Shot requires Long Bow");
assert.strictEqual(quickShot.requiredWtypeId2, 9, "Quick Shot requires Crossbow");
assert.strictEqual(quickStab.requiredWtypeId1, 10, "Quick Stab requires Dagger");
assert.strictEqual(quickStab.requiredWtypeId2, 0, "Quick Stab only allows Dagger");

// 3. New Skill: Mark Target
const markTarget = skills[441];
console.log("\n[3] Verifying New Skill [Mark Target] (#441):");
assert(markTarget, "Mark Target skill must exist at #441");
console.log(`  Name: ${markTarget.name}`);
console.log(`  Icon: ${markTarget.iconIndex} (Critical / Marked Symbol)`);
console.log(`  Scope: ${markTarget.scope} (1 Enemy)`);
console.log(`  Hit Type: ${markTarget.hitType} (Certain Hit)`);
console.log(`  TP Cost: ${markTarget.tpCost}`);
console.log(`  Effects:`, markTarget.effects);
assert.strictEqual(markTarget.effects.length, 1);
assert.strictEqual(markTarget.effects[0].dataId, 25, "Inflicts State 25: Marked");

// 4. Scroll Item #586
const scrollItem = items[586];
console.log("\n[4] Verifying Scroll Item #586:");
assert(scrollItem, "Scroll item 586 must exist");
console.log(`  Item Name: ${scrollItem.name}`);
console.log(`  Learn Skill Effect:`, scrollItem.effects);
assert.strictEqual(scrollItem.effects[0].dataId, 441, "Scroll must teach Skill 441");

// 5. RPG Maker MV isSkillWtypeOk simulation
function isSkillWtypeOk(skill, equippedWtypeId) {
    const w1 = skill.requiredWtypeId1;
    const w2 = skill.requiredWtypeId2;
    if ((w1 === 0 && w2 === 0) ||
        (w1 > 0 && equippedWtypeId === w1) ||
        (w2 > 0 && equippedWtypeId === w2)) {
        return true;
    }
    return false;
}

const scoutLearnedSkills = scoutClass.learnings.map(l => skills[l.skillId]);
console.log("\n[5] Simulating Battle Usability per Weapon (Target: 4 usable skills each):");

const weaponScenarios = [
    { name: "Long Bow (Pine Longbow, wtype 8)", wtypeId: 8 },
    { name: "Crossbow (Iron Crossbow, wtype 9)", wtypeId: 9 },
    { name: "Dagger (Iron Dagger, wtype 10)", wtypeId: 10 }
];

weaponScenarios.forEach(sc => {
    console.log(`\n  Scenario: Equipping ${sc.name}`);
    const usable = [];
    const disabled = [];
    scoutLearnedSkills.forEach(sk => {
        const ok = isSkillWtypeOk(sk, sc.wtypeId);
        if (ok) {
            usable.push(sk.name);
        } else {
            disabled.push(sk.name);
        }
    });
    console.log(`    Usable Skills (${usable.length}):`, usable.join(", "));
    console.log(`    Disabled Skills (${disabled.length}):`, disabled.join(", "));
    assert.strictEqual(usable.length, 4, `Weapon ${sc.name} must have exactly 4 usable skills`);
    assert.strictEqual(disabled.length, 1, `Weapon ${sc.name} must have exactly 1 disabled skill`);
});

console.log("\n>>> ALL TEST SIMULATIONS PASSED PERFECTLY! <<<");
