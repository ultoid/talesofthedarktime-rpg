const fs = require('fs');
const assert = require('assert');

console.log("Starting Class Passive Ability tests...");

const classesRaw = fs.readFileSync('data/Classes.json', 'utf8');
const classes = JSON.parse(classesRaw);

// Mock Game_Actor and $dataClasses
global.$dataClasses = classes;

function Game_Actor() {
    this._classId = 1;
}

Game_Actor.prototype.currentClass = function() {
    return $dataClasses[this._classId];
};

Game_Actor.prototype.nusvClassAbility = function(classId) {
    var cls = classId ? $dataClasses[Number(classId)] : this.currentClass();
    if (!cls || !cls.note) return '';
    var m = cls.note.match(/<Class Ability:\s*([^>]+)>/i);
    return m ? m[1].trim() : '';
};

Game_Actor.prototype.nusvClassAbilityDesc = function(classId) {
    var cls = classId ? $dataClasses[Number(classId)] : this.currentClass();
    if (!cls || !cls.note) return '';
    var m = cls.note.match(/<Class Ability Description>([\s\S]*?)<\/Class Ability Description>/i);
    if (m) return m[1].trim();
    var m2 = cls.note.match(/<Class Ability Desc:\s*([^>]+)>/i);
    return m2 ? m2[1].trim() : '';
};

const actor = new Game_Actor();

// Test actor in class 1 (Fighter)
assert.strictEqual(actor.nusvClassAbility(), "Battle Spirit", "Fighter ability must be Battle Spirit");
assert.ok(actor.nusvClassAbilityDesc().includes("P.ATK"), "Fighter description must mention P.ATK");

// Test specific class lookups
assert.strictEqual(actor.nusvClassAbility(2), "Heavy Impact", "Warrior ability must be Heavy Impact");
assert.strictEqual(actor.nusvClassAbility(17), "Mana Attunement", "Apprentice ability must be Mana Attunement");
assert.strictEqual(actor.nusvClassAbility(49), "Temporal Overwrite", "Chronomancer ability must be Temporal Overwrite");
assert.strictEqual(actor.nusvClassAbility(50), "Entropy Collapse", "Void Incarnate ability must be Entropy Collapse");

// Verify all 50 classes have valid abilities
let verifiedCount = 0;
for (let i = 1; i <= 50; i++) {
    const cls = classes[i];
    assert.ok(cls, `Class #${i} must exist`);
    const ab = actor.nusvClassAbility(i);
    const desc = actor.nusvClassAbilityDesc(i);
    assert.ok(ab.length > 0, `Class #${i} (${cls.name}) must have a Class Ability name`);
    assert.ok(desc.length > 0, `Class #${i} (${cls.name}) must have a Class Ability Description`);
    verifiedCount++;
}

console.log(`Verified all ${verifiedCount} classes have valid Class Ability names and descriptions!`);
console.log("Class Passive tests passed successfully!");

