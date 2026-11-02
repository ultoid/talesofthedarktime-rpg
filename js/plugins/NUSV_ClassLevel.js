/*:
 * @plugindesc v1.0.0 NUSV Class Level - Dual Level System (Base Level & Class Level) with Tier Caps and Class Stat Growth.
 * @author Ultoid
 *
 * @param Default Class EXP Rate
 * @desc Persentase Class EXP yang didapat dari musuh relatif terhadap Base EXP (1.0 = 100%, 0.7 = 70%).
 * @default 0.8
 *
 * @param Tier 1 Max Level
 * @desc Level maksimum untuk Class Tier 1.
 * @default 10
 *
 * @param Tier 2 Max Level
 * @desc Level maksimum untuk Class Tier 2.
 * @default 30
 *
 * @param Tier 3 Max Level
 * @desc Level maksimum untuk Class Tier 3.
 * @default 40
 *
 * @param Tier 4 Max Level
 * @desc Level maksimum untuk Class Tier 4.
 * @default 50
 *
 * @param Tier 5 Max Level
 * @desc Level maksimum untuk Class Tier 5.
 * @default 60
 *
 * @help
 * ============================================================================
 * NUSV_ClassLevel
 * ============================================================================
 *
 * Sistem Dua Tingkat Level (Dual Level System):
 *
 * 1. Base Level:
 *    - Level murni karakter dari Base EXP.
 *    - Memberikan 3 Stat Point bebas tiap naik level (dikelola oleh NUSV_StatSystem).
 *
 * 2. Class Level:
 *    - Level penguasaan profesi/Class yang sedang aktif dari Class EXP.
 *    - Menyimpan level independen untuk masing-masing Class saat berganti class.
 *    - Batas Level per Tier:
 *        * Tier 1 : Level 1 - 10
 *        * Tier 2 : Level 1 - 30
 *        * Tier 3 : Level 1 - 40
 *        * Tier 4 : Level 1 - 50
 *        * Tier 5 : Level 1 - 60 (Coming Soon)
 *    - Memberikan pertumbuhan Base Stat alami (Fixed Stat Growth) yang melekat
 *      pada Class tersebut.
 *    - Membuka skill baru di daftar Learnings class saat Class Level naik.
 *
 * ============================================================================
 * CLASS NOTETAGS
 * ============================================================================
 *
 * Menentukan pertumbuhan Base Stat alami per Class Level:
 *   <Class Stat Growth: STR +1.2, VIT +1.0, AGI +0.5>
 *   <Class Stat Growth: INT +1.5, MDF +0.8>
 *
 * Menentukan Tier Class (opsional jika sudah ada <Class Tier: X>):
 *   <Class Tier: 2>
 *
 * Menentukan batas level khusus per Class (override default Tier):
 *   <Class Max Level: 30>
 *
 * ============================================================================
 * ENEMY NOTETAGS
 * ============================================================================
 *
 * Menentukan Class EXP spesifik dari musuh:
 *   <Class EXP: 25>
 */

var Imported = Imported || {};
Imported.NUSV_ClassLevel = true;

var NUSV = NUSV || {};
NUSV.ClassLevel = NUSV.ClassLevel || {};
NUSV.Levels = NUSV.Levels || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_ClassLevel') || {};
    var CLASS_EXP_RATE = Number(parameters['Default Class EXP Rate'] || 0.8);
    var TIER_CAPS = {
        1: Number(parameters['Tier 1 Max Level'] || 10),
        2: Number(parameters['Tier 2 Max Level'] || 30),
        3: Number(parameters['Tier 3 Max Level'] || 40),
        4: Number(parameters['Tier 4 Max Level'] || 50),
        5: Number(parameters['Tier 5 Max Level'] || 60)
    };

    // -------------------------------------------------------------------------
    // Helper: Parse Class Stat Growth Notetag
    // -------------------------------------------------------------------------
    function parseClassStatGrowth(classObj) {
        if (!classObj) return {};
        if (classObj._nusvStatGrowthCache) return classObj._nusvStatGrowthCache;

        var growth = {};
        var note = classObj.note || '';
        var match = note.match(/<Class Stat Growth:[ ]*([^>]+)>/i);
        if (match) {
            var entries = match[1].split(',');
            for (var i = 0; i < entries.length; i++) {
                var p = entries[i].trim();
                var m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/i);
                if (m) {
                    growth[m[2].toLowerCase()] = parseFloat(m[1]) || 0;
                    continue;
                }
                m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/i);
                if (m) {
                    growth[m[1].toLowerCase()] = parseFloat(m[2]) || 0;
                }
            }
        }

        // Fill any unassigned stat with Class Stat Aptitude rate (Base ATTR * 0.2)
        var attrs = ['str', 'int', 'dex', 'luk', 'agi', 'vit'];
        for (var a = 0; a < attrs.length; a++) {
            var k = attrs[a];
            if (growth[k] === undefined) {
                var baseTag = note.match(new RegExp('<Base\\s+' + k.toUpperCase() + ':\\s*(\\d+)>', 'i'));
                if (baseTag) {
                    var baseVal = parseInt(baseTag[1], 10) || 1;
                    growth[k] = Math.round(baseVal * 0.2 * 10) / 10;
                } else {
                    growth[k] = (k === 'luk') ? 0.3 : 0.5;
                }
            }
        }

        classObj._nusvStatGrowthCache = growth;
        return growth;
    }

    function getClassTier(classObj) {
        if (!classObj) return 1;
        if (classObj.meta && classObj.meta['Class Tier']) {
            return Number(classObj.meta['Class Tier']) || 1;
        }
        return 1;
    }

    function getClassMaxLevel(classObj) {
        if (!classObj) return 10;
        if (classObj.meta && classObj.meta['Class Max Level']) {
            return Number(classObj.meta['Class Max Level']) || 10;
        }
        var tier = getClassTier(classObj);
        return TIER_CAPS[tier] || 10;
    }

    // -------------------------------------------------------------------------
    // Global Database & Helper API: NUSV.Levels
    // -------------------------------------------------------------------------
    function resolveActor(target) {
        if (!target) return null;
        if (typeof target === 'object' && typeof target.actorId === 'function') return target;
        if (typeof target === 'number' && typeof $gameActors !== 'undefined' && $gameActors) {
            return $gameActors.actor(target);
        }
        return null;
    }

    NUSV.Levels.resolveActor = resolveActor;

    // Base Level APIs
    NUSV.Levels.baseLevel = function(target) {
        var a = resolveActor(target);
        return a ? (a._level || a.level || 1) : 1;
    };
    NUSV.Levels.getBaseLevel = NUSV.Levels.baseLevel;

    NUSV.Levels.setBaseLevel = function(target, level) {
        var a = resolveActor(target);
        if (!a) return;
        var max = a.maxLevel ? a.maxLevel() : 99;
        var newLevel = Math.max(1, Math.min(max, Math.round(Number(level) || 1)));
        a._level = newLevel;
        if (a._exp && a._classId && typeof a.expForLevel === 'function') {
            a._exp[a._classId] = a.expForLevel(newLevel);
        }
        a.refresh();
    };

    // Class Level APIs
    NUSV.Levels.classLevel = function(target, classId) {
        var a = resolveActor(target);
        if (!a) return 1;
        return a.classLevel(classId);
    };
    NUSV.Levels.getClassLevel = NUSV.Levels.classLevel;

    NUSV.Levels.currentClassLevel = function(target) {
        var a = resolveActor(target);
        if (!a) return 1;
        return a.currentClassLevel();
    };
    NUSV.Levels.getCurrentClassLevel = NUSV.Levels.currentClassLevel;

    NUSV.Levels.setClassLevel = function(target, classId, level) {
        var a = resolveActor(target);
        if (!a) return;
        a.setClassLevel(classId, level);
    };

    NUSV.Levels.classMaxLevel = function(target, classId) {
        var a = resolveActor(target);
        if (a) return a.classMaxLevel(classId);
        var cls = typeof $dataClasses !== 'undefined' ? $dataClasses[Number(classId || 1)] : null;
        return getClassMaxLevel(cls);
    };
    NUSV.Levels.getClassMaxLevel = NUSV.Levels.classMaxLevel;

    NUSV.Levels.classTier = function(classId) {
        var cls = typeof $dataClasses !== 'undefined' ? $dataClasses[Number(classId || 1)] : null;
        return getClassTier(cls);
    };
    NUSV.Levels.getClassTier = NUSV.Levels.classTier;

    NUSV.Levels.classExp = function(target, classId) {
        var a = resolveActor(target);
        return a ? a.classExp(classId) : 0;
    };
    NUSV.Levels.getClassExp = NUSV.Levels.classExp;

    NUSV.Levels.classNextLevelExp = function(target, classId) {
        var a = resolveActor(target);
        return a ? a.classNextLevelExp(classId) : 0;
    };
    NUSV.Levels.getClassNextLevelExp = NUSV.Levels.classNextLevelExp;

    NUSV.Levels.gainClassExp = function(target, amount, classId) {
        var a = resolveActor(target);
        if (a) a.gainClassExp(amount, classId);
    };

    NUSV.Levels.isClassMastered = function(target, classId) {
        var a = resolveActor(target);
        return a ? a.isClassMastered(classId) : false;
    };

    NUSV.Levels.allClassData = function(target) {
        var a = resolveActor(target);
        return a ? a.allClassData() : {};
    };
    NUSV.Levels.getAllClassData = NUSV.Levels.allClassData;

    // -------------------------------------------------------------------------
    // Game_Enemy - Class EXP Reward
    // -------------------------------------------------------------------------
    Game_Enemy.prototype.classExp = function() {
        var enemyObj = this.enemy();
        if (enemyObj && enemyObj.meta && enemyObj.meta['Class EXP']) {
            return Number(enemyObj.meta['Class EXP']) || 0;
        }
        return Math.max(1, Math.round(this.exp() * CLASS_EXP_RATE));
    };

    // -------------------------------------------------------------------------
    // Game_Actor - Class Level Tracking, Curve, & Stat Bonus Hook
    // -------------------------------------------------------------------------
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        this._nusvClassData = {};
        _Game_Actor_setup.call(this, actorId);
        this.initClassData(this._classId);
    };

    Game_Actor.prototype.baseLevel = function() {
        return this._level || 1;
    };

    Game_Actor.prototype.setBaseLevel = function(level) {
        NUSV.Levels.setBaseLevel(this, level);
    };

    Game_Actor.prototype.initClassData = function(classId) {
        classId = Number(classId || this._classId);
        this._nusvClassData = this._nusvClassData || {};
        if (!this._nusvClassData[classId]) {
            var initialLevel = 1;
            // Backwards compatibility migration from legacy _nusvClassLevels
            if (this._nusvClassLevels && this._nusvClassLevels[classId]) {
                initialLevel = Math.max(1, Number(this._nusvClassLevels[classId]));
            }
            this._nusvClassData[classId] = {
                level: initialLevel,
                exp: this.classExpForLevel(initialLevel)
            };
        }
        // Mirror to _nusvClassLevels so any legacy code reading it stays in sync
        this._nusvClassLevels = this._nusvClassLevels || {};
        this._nusvClassLevels[classId] = this._nusvClassData[classId].level;
    };

    Game_Actor.prototype.currentClassLevel = function() {
        return this.classLevel(this._classId);
    };

    Game_Actor.prototype.classLevel = function(classId) {
        classId = Number(classId || this._classId);
        this.initClassData(classId);
        return this._nusvClassData[classId].level || 1;
    };

    // Global alias so nusvClassLevel always returns the real class level
    Game_Actor.prototype.nusvClassLevel = function(classId) {
        return this.classLevel(classId);
    };

    Game_Actor.prototype.classExp = function(classId) {
        classId = Number(classId || this._classId);
        this.initClassData(classId);
        return this._nusvClassData[classId].exp || 0;
    };

    Game_Actor.prototype.classMaxLevel = function(classId) {
        classId = Number(classId || this._classId);
        var classObj = typeof $dataClasses !== 'undefined' ? $dataClasses[classId] : null;
        return getClassMaxLevel(classObj);
    };

    Game_Actor.prototype.nusvClassMaxLevel = function(classId) {
        return this.classMaxLevel(classId);
    };

    Game_Actor.prototype.classTier = function(classId) {
        classId = Number(classId || this._classId);
        var classObj = typeof $dataClasses !== 'undefined' ? $dataClasses[classId] : null;
        return getClassTier(classObj);
    };

    Game_Actor.prototype.nusvClassTier = function(classId) {
        return this.classTier(classId);
    };

    Game_Actor.prototype.isClassMastered = function(classId) {
        classId = Number(classId || this._classId);
        return this.classLevel(classId) >= this.classMaxLevel(classId);
    };

    Game_Actor.prototype.setClassLevel = function(classId, level) {
        classId = Number(classId || this._classId);
        this.initClassData(classId);
        var max = this.classMaxLevel(classId);
        level = Math.max(1, Math.min(max, Math.round(Number(level) || 1)));
        this._nusvClassData[classId].level = level;
        this._nusvClassData[classId].exp = this.classExpForLevel(level);
        this._nusvClassLevels = this._nusvClassLevels || {};
        this._nusvClassLevels[classId] = level;

        if (this._classId === classId) {
            if (typeof this.nusvRefreshClassLearnedSkills === 'function') {
                this.nusvRefreshClassLearnedSkills();
            } else {
                this.onClassLevelUp(classId, level);
            }
            this.refresh();
        }
    };

    Game_Actor.prototype.allClassData = function() {
        this._nusvClassData = this._nusvClassData || {};
        var result = {};
        for (var k in this._nusvClassData) {
            if (this._nusvClassData.hasOwnProperty(k)) {
                var cId = Number(k);
                result[cId] = {
                    level: this._nusvClassData[k].level,
                    exp: this._nusvClassData[k].exp,
                    maxLevel: this.classMaxLevel(cId),
                    tier: this.classTier(cId),
                    mastered: this.isClassMastered(cId)
                };
            }
        }
        return result;
    };

    // Class EXP required formula for a given level
    Game_Actor.prototype.classExpForLevel = function(level) {
        if (level <= 1) return 0;
        // Moderate exponential curve for class progression
        return Math.round(35 * Math.pow(level - 1, 1.65));
    };

    Game_Actor.prototype.classNextLevelExp = function(classId) {
        classId = Number(classId || this._classId);
        var lvl = this.classLevel(classId);
        var max = this.classMaxLevel(classId);
        if (lvl >= max) return 0;
        return this.classExpForLevel(lvl + 1);
    };

    Game_Actor.prototype.gainClassExp = function(amount, classId) {
        classId = Number(classId || this._classId);
        this.initClassData(classId);
        var data = this._nusvClassData[classId];
        var maxLvl = this.classMaxLevel(classId);

        if (data.level >= maxLvl) return; // At max class tier cap

        data.exp += Math.max(0, Math.round(amount));

        var leveledUp = false;
        while (data.level < maxLvl && data.exp >= this.classExpForLevel(data.level + 1)) {
            data.level++;
            leveledUp = true;
            this._nusvClassLevels = this._nusvClassLevels || {};
            this._nusvClassLevels[classId] = data.level;
            this.onClassLevelUp(classId, data.level);
        }
        if (leveledUp) {
            if (this._classId === classId && typeof this.nusvRefreshClassLearnedSkills === 'function') {
                this.nusvRefreshClassLearnedSkills();
            }
        }
        this.refresh();
    };

    Game_Actor.prototype.onClassLevelUp = function(classId, newLevel) {
        var classObj = typeof $dataClasses !== 'undefined' ? $dataClasses[classId] : null;
        if (!classObj) return;

        // Learn class skills matching new class level
        var learnings = classObj.learnings || [];
        for (var i = 0; i < learnings.length; i++) {
            var l = learnings[i];
            if (l.level === newLevel) {
                this.learnSkill(l.skillId);
            }
        }
    };

    // Hook to NUSV_StatSystem: bonus to base stats from Class Level
    Game_Actor.prototype.nusvClassStatBonus = function(statKey) {
        var classObj = this.currentClass();
        if (!classObj) return 0;
        var growth = parseClassStatGrowth(classObj);
        var rate = growth[statKey.toLowerCase()] || 0;
        var cLevel = this.currentClassLevel();
        // Bonus = (Class Level - 1) * growth rate
        return Math.max(0, Math.round((cLevel - 1) * rate));
    };

    // -------------------------------------------------------------------------
    // Battle Rewards Integration (Base EXP + Class EXP)
    // -------------------------------------------------------------------------
    var _BattleManager_makeRewards = BattleManager.makeRewards;
    BattleManager.makeRewards = function() {
        _BattleManager_makeRewards.call(this);
        this._rewards.classExp = $gameTroop.members().reduce(function(sum, enemy) {
            return sum + (enemy.isDead() && typeof enemy.classExp === 'function' ? enemy.classExp() : 0);
        }, 0);
    };

    var _BattleManager_gainExp = BattleManager.gainExp;
    BattleManager.gainExp = function() {
        _BattleManager_gainExp.call(this);
        var classExp = this._rewards ? (this._rewards.classExp || 0) : 0;
        if (classExp > 0) {
            $gameParty.allMembers().forEach(function(actor) {
                if (actor.isAlive && actor.isAlive() && typeof actor.gainClassExp === 'function') {
                    actor.gainClassExp(classExp);
                }
            });
        }
    };

})();
