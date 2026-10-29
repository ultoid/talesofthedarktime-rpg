/*:
 * @plugindesc v1.0.0 NUSV Stat System - 6 Base Stats (STR, INT, DEX, LUK, AGI, VIT), Stat Allocation, and Dynamic Derived Stats & SP System.
 * @author Ultoid
 *
 * @param Points Per Base Level
 * @desc Jumlah stat point yang didapatkan pemain setiap naik 1 Base Level.
 * @default 3
 *
 * @param Base SP Value
 * @desc Nilai dasar SP (Stamina Points) sebelum penambahan stat.
 * @default 50
 *
 * @param Max Evasion Cap
 * @desc Batas maksimum Evasion (dalam desimal, 0.80 = 80%).
 * @default 0.80
 *
 * @param Max Critical Cap
 * @desc Batas maksimum Critical Rate (dalam desimal, 0.85 = 85%).
 * @default 0.85
 *
 * @param Base Critical Damage Multiplier
 * @desc Pengali dasar Critical Damage (1.5 = 150%).
 * @default 1.5
 *
 * @help
 * ============================================================================
 * NUSV_StatSystem
 * ============================================================================
 *
 * Merombak sistem atribut menjadi 6 Base Stats dan Stat Turunan (Derived Stats):
 *
 * Base Stats:
 *   - STR (Strength)
 *   - INT (Intelligence)
 *   - DEX (Dexterity)
 *   - LUK (Luck)
 *   - AGI (Agility)
 *   - VIT (Vitality)
 *
 * Mekanisme Poin Stat:
 *   - Setiap kali karakter naik 1 Base Level, pemain mendapatkan Stat Points
 *     (default: 3 poin) yang bebas dialokasikan ke 6 Base Stats.
 *   - Terdapat fungsi untuk mereset poin stat (untuk item/NPC reset build).
 *
 * Stat Turunan (Derived Stats):
 *   - Max HP: Base Class HP + (VIT * 15) + (STR * 5) + Flat HP Item
 *   - Max MP: Base Class MP + (INT * 8) + Flat MP Item
 *   - Max SP: Base SP + (VIT * 5) + (STR * 2) + Flat SP Item
 *   - ATK:
 *       Senjata Ranged/Finesse (Bow, Crossbow, Dagger): (DEX * 2) + (STR * 0.5) + Weapon ATK
 *       Senjata Melee biasa: (STR * 2) + (DEX * 0.5) + Weapon ATK
 *   - DEF: Base DEF + (VIT * 1.5) + (STR * 0.5) + Armor DEF
 *   - MAT: Base MAT + (INT * 2) + Equip MAT
 *   - MDF: Base MDF + (INT * 1.2) + (VIT * 0.8) + Equip MDF
 *   - Action Speed (AGI): Base AGI + (AGI * 1.5) + Equip AGI
 *   - Hit Rate (HIT): 0.85 + (DEX * 0.002) + Equip HIT (Max 100%)
 *   - Evasion Rate (EVA): 0.02 + (AGI * 0.002) + (LUK * 0.0005) + Equip EVA (Max 80%)
 *   - Critical Rate (CRI): 0.03 + (DEX * 0.002) + (LUK * 0.001) + Equip CRI (Max 85%)
 *   - Critical Evasion (CEV): (LUK * 0.0015) + (VIT * 0.001) + Equip CEV
 *   - Critical Damage (CDMG): 1.5 + (STR * 0.003) + (DEX * 0.002) + Equip CDMG
 *   - Guard Efficiency (GRD): 1.0 + (VIT * 0.005) + Equip GRD
 *   - HP Regen (HRG): (VIT * 0.0003) + Equip HRG
 *   - MP Regen (MRG): (INT * 0.0003) + Equip MRG
 *   - SP Regen (TRG): 0.03 + (AGI * 0.0004) + (VIT * 0.0002) + Equip TRG
 *
 * Sistem SP (Stamina Points):
 *   - Menggantikan TP menjadi Stamina Points.
 *   - Nilai Max SP berskala secara dinamis sesuai stat karakter.
 *   - SP disimpan antar pertarungan (Preserve SP seperti halnya MP).
 *   - Saat tidur di penginapan / event Recover All, SP pulih penuh bersama HP dan MP.
 *
 * ============================================================================
 * NOTETAGS
 * ============================================================================
 *
 * Pada Actor / Class:
 *   <Base STR: 12>
 *   <Base INT: 8>
 *   <Base DEX: 10>
 *   <Base LUK: 10>
 *   <Base AGI: 11>
 *   <Base VIT: 12>
 *
 * Pada Weapon / Armor / State:
 *   <STR: +5>
 *   <INT: -2>
 *   <DEX: +3>
 *   <LUK: +1>
 *   <AGI: +4>
 *   <VIT: +5>
 *   <Max SP: +20>
 *   <Critical Damage: +25%>
 *
 * Pada Item:
 *   <Reset Stat Points>                 // Mereset seluruh alokasi stat karakter & refund poin 100%
 *
 * Plugin Commands:
 *   NUSVResetStats [actorId]            // Reset alokasi stat actor tertentu (atau leader jika kosong)
 *
 * Script Calls untuk Developer / Event:
 *   actor.nusvStatPoints()              // Cek sisa poin belum dialokasikan
 *   actor.allocateStat('str', 1)        // Alokasikan 1 poin ke STR
 *   actor.resetAllocatedStats()         // Reset semua alokasi poin
 *   actor.gainStatPoints(5)             // Tambah bonus poin (misal dari buku stat)
 */

var Imported = Imported || {};
Imported.NUSV_StatSystem = true;

var NUSV = NUSV || {};
NUSV.StatSystem = NUSV.StatSystem || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_StatSystem') || {};
    var POINTS_PER_LEVEL = Number(parameters['Points Per Base Level'] || 3);
    var BASE_SP_VALUE = Number(parameters['Base SP Value'] || 50);
    var MAX_EVA_CAP = Number(parameters['Max Evasion Cap'] || 0.80);
    var MAX_CRI_CAP = Number(parameters['Max Critical Cap'] || 0.85);
    var BASE_CRIT_DMG = Number(parameters['Base Critical Damage Multiplier'] || 1.5);

    NUSV.StatSystem.BASE_STAT_KEYS = ['str', 'int', 'dex', 'luk', 'agi', 'vit'];

    // -------------------------------------------------------------------------
    // Helper Parser for Notetags
    // -------------------------------------------------------------------------
    function parseMetaStat(meta, key) {
        if (!meta) return 0;
        var val = meta[key.toUpperCase()] || meta[key.toLowerCase()] || meta[key];
        if (val === undefined || val === null) return 0;
        return Number(val) || 0;
    }

    function parseMetaBonus(meta, key) {
        if (!meta) return 0;
        var val = meta[key.toUpperCase()] || meta[key.toLowerCase()] || meta[key];
        if (val === undefined || val === null) return 0;
        if (typeof val === 'string') {
            val = val.replace('+', '').trim();
        }
        return Number(val) || 0;
    }

    // -------------------------------------------------------------------------
    // Game_BattlerBase - SP (Stamina) Overrides & Helpers
    // -------------------------------------------------------------------------
    Game_BattlerBase.prototype.maxSp = function() {
        return 100;
    };

    var _Game_BattlerBase_maxTp = Game_BattlerBase.prototype.maxTp;
    Game_BattlerBase.prototype.maxTp = function() {
        return this.maxSp();
    };

    var _Game_BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
    Game_BattlerBase.prototype.recoverAll = function() {
        _Game_BattlerBase_recoverAll.call(this);
        this._tp = this.maxTp(); // SP recovers to max alongside HP and MP
    };

    // -------------------------------------------------------------------------
    // Game_BattlerBase - SP Preservation (Like MP)
    // -------------------------------------------------------------------------
    Game_BattlerBase.prototype.isPreserveTp = function() {
        return true; // SP is preserved between battles like MP
    };

    // -------------------------------------------------------------------------
    // Game_Actor - Base Stats, Allocation, & Dynamic Derived Stats
    // -------------------------------------------------------------------------
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        this._nusvAllocatedStats = { str: 0, int: 0, dex: 0, luk: 0, agi: 0, vit: 0 };
        this._nusvStatPoints = 0;
        _Game_Actor_setup.call(this, actorId);
        
        // Initial stat points from starting level
        var baseLvl = this._level || 1;
        this._nusvStatPoints = Math.max(0, (baseLvl - 1) * POINTS_PER_LEVEL);
        
        // Initialize SP full like MP on character creation
        this._tp = this.maxTp();
    };

    var _Game_Actor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function() {
        _Game_Actor_levelUp.call(this);
        this._nusvStatPoints = (this._nusvStatPoints || 0) + POINTS_PER_LEVEL;
    };

    Game_Actor.prototype.nusvStatPoints = function() {
        return this._nusvStatPoints || 0;
    };

    Game_Actor.prototype.gainStatPoints = function(amount) {
        this._nusvStatPoints = Math.max(0, (this._nusvStatPoints || 0) + (Number(amount) || 0));
    };

    Game_Actor.prototype.nusvAllocatedStat = function(statKey) {
        this._nusvAllocatedStats = this._nusvAllocatedStats || { str: 0, int: 0, dex: 0, luk: 0, agi: 0, vit: 0 };
        var k = String(statKey).toLowerCase();
        return this._nusvAllocatedStats[k] || 0;
    };

    Game_Actor.prototype.canAllocateStat = function(statKey, amount) {
        amount = amount || 1;
        return this.nusvStatPoints() >= amount;
    };

    Game_Actor.prototype.allocateStat = function(statKey, amount) {
        amount = amount || 1;
        var k = String(statKey).toLowerCase();
        var validKey = Array.prototype.includes ? NUSV.StatSystem.BASE_STAT_KEYS.includes(k) : NUSV.StatSystem.BASE_STAT_KEYS.indexOf(k) >= 0;
        if (!validKey) return false;
        if (!this.canAllocateStat(k, amount)) return false;

        this._nusvAllocatedStats = this._nusvAllocatedStats || { str: 0, int: 0, dex: 0, luk: 0, agi: 0, vit: 0 };
        this._nusvAllocatedStats[k] = (this._nusvAllocatedStats[k] || 0) + amount;
        this._nusvStatPoints = Math.max(0, this._nusvStatPoints - amount);
        this.refresh();
        return true;
    };

    Game_Actor.prototype.resetAllocatedStats = function() {
        this._nusvAllocatedStats = this._nusvAllocatedStats || { str: 0, int: 0, dex: 0, luk: 0, agi: 0, vit: 0 };
        var refunded = 0;
        for (var i = 0; i < NUSV.StatSystem.BASE_STAT_KEYS.length; i++) {
            var k = NUSV.StatSystem.BASE_STAT_KEYS[i];
            refunded += (this._nusvAllocatedStats[k] || 0);
            this._nusvAllocatedStats[k] = 0;
        }
        this._nusvStatPoints = (this._nusvStatPoints || 0) + refunded;
        this.refresh();
        return refunded;
    };

    // -------------------------------------------------------------------------
    // Stat Reset Item & Action Integration
    // -------------------------------------------------------------------------
    var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        if (target && target.isActor && target.isActor()) {
            var item = this.item();
            if (item && item.meta && (item.meta['Reset Stat Points'] || item.meta['Reset Stats'] || item.meta['Stat Reset'])) {
                target.resetAllocatedStats();
                if (typeof SoundManager !== 'undefined' && SoundManager.playUseItem) {
                    SoundManager.playUseItem();
                }
            }
        }
    };

    var _Game_Action_hasItemAnyValidEffect = Game_Action.prototype.hasItemAnyValidEffect;
    Game_Action.prototype.hasItemAnyValidEffect = function(target) {
        var item = this.item();
        if (item && item.meta && (item.meta['Reset Stat Points'] || item.meta['Reset Stats'] || item.meta['Stat Reset'])) {
            return target && target.isActor && target.isActor();
        }
        return _Game_Action_hasItemAnyValidEffect.call(this, target);
    };

    // Plugin Command: NUSVResetStats [actorId]
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'NUSVResetStats' || command === 'ResetStats') {
            var actorId = args && args[0] ? Number(args[0]) : 0;
            var actor = actorId > 0 && typeof $gameActors !== 'undefined' ? $gameActors.actor(actorId) : ($gameParty ? $gameParty.leader() : null);
            if (actor && typeof actor.resetAllocatedStats === 'function') {
                actor.resetAllocatedStats();
            }
        }
    };

    // --- Base Stat Value Calculation ---
    Game_Actor.prototype.nusvBaseStat = function(statKey) {
        var k = String(statKey).toLowerCase();
        var actorObj = this.actor();
        var classObj = this.currentClass();

        // 1. Initial baseline from actor or class note tag (default: 10)
        var base = 10;
        if (actorObj && actorObj.meta) {
            var bVal = parseMetaStat(actorObj.meta, 'Base ' + k.toUpperCase());
            if (bVal > 0) base = bVal;
        }
        if (classObj && classObj.meta) {
            var cbVal = parseMetaStat(classObj.meta, 'Base ' + k.toUpperCase());
            if (cbVal > 0) base = cbVal;
        }

        // 2. Player allocated points
        var allocated = this.nusvAllocatedStat(k);

        // 3. Class Level growth bonus (hook for Tahap 2 / NUSV_ClassLevel)
        var classGrowth = 0;
        if (typeof this.nusvClassStatBonus === 'function') {
            classGrowth = this.nusvClassStatBonus(k);
        }

        // 4. Equipment bonus
        var equipBonus = 0;
        var equips = this.equips ? this.equips() : [];
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item && item.meta) {
                equipBonus += parseMetaBonus(item.meta, k);
            }
        }

        // 5. State bonus
        var stateBonus = 0;
        var states = this.states ? this.states() : [];
        for (var j = 0; j < states.length; j++) {
            var st = states[j];
            if (st && st.meta) {
                stateBonus += parseMetaBonus(st.meta, k);
            }
        }

        return Math.max(1, Math.round(base + allocated + classGrowth + equipBonus + stateBonus));
    };

    // Shorthand getters on Game_Actor
    Object.defineProperties(Game_Actor.prototype, {
        str: { get: function() { return this.nusvBaseStat('str'); }, configurable: true },
        int: { get: function() { return this.nusvBaseStat('int'); }, configurable: true },
        dex: { get: function() { return this.nusvBaseStat('dex'); }, configurable: true },
        luk: { get: function() { return this.nusvBaseStat('luk'); }, configurable: true },
        agi: { get: function() { return this.nusvBaseStat('agi'); }, configurable: true },
        vit: { get: function() { return this.nusvBaseStat('vit'); }, configurable: true }
    });

    // Fallback getters for Game_Enemy so battle formulas are safe
    Object.defineProperties(Game_Enemy.prototype, {
        str: { get: function() { return Math.max(1, Math.round(this.atk * 0.5)); }, configurable: true },
        int: { get: function() { return Math.max(1, Math.round(this.mat * 0.5)); }, configurable: true },
        dex: { get: function() { return Math.max(1, Math.round(this.agi * 0.5)); }, configurable: true },
        luk: { get: function() { return Math.max(1, this.param(7)); }, configurable: true },
        agi: { get: function() { return Math.max(1, Math.round(this.param(6) * 0.6)); }, configurable: true },
        vit: { get: function() { return Math.max(1, Math.round(this.def * 0.5)); }, configurable: true }
    });

    Game_Enemy.prototype.maxSp = function() {
        return Math.max(50, Math.round(BASE_SP_VALUE + (this.vit * 5) + (this.str * 2)));
    };

    // Helper to detect ranged or finesse weapons (Bow, Crossbow, Dagger)
    Game_Actor.prototype.isFinesseWeaponUser = function() {
        var weapons = this.weapons ? this.weapons() : [];
        for (var i = 0; i < weapons.length; i++) {
            var w = weapons[i];
            if (w) {
                // Weapon Type IDs: 8 = Long Bow, 9 = Crossbow, 10 = Dagger
                if (w.wtypeId === 8 || w.wtypeId === 9 || w.wtypeId === 10) {
                    return true;
                }
                if (w.meta && (w.meta.Finesse || w.meta.Ranged)) {
                    return true;
                }
            }
        }
        return false;
    };

    // -------------------------------------------------------------------------
    // Derived Stats (Primary Params 0..7)
    // -------------------------------------------------------------------------
    Game_Actor.prototype.maxSp = function() {
        var flatBonus = 0;
        var equips = this.equips ? this.equips() : [];
        for (var i = 0; i < equips.length; i++) {
            if (equips[i] && equips[i].meta) {
                flatBonus += parseMetaBonus(equips[i].meta, 'Max SP');
            }
        }
        var baseSp = BASE_SP_VALUE + (this.vit * 5) + (this.str * 2);
        return Math.max(10, Math.round(baseSp + flatBonus));
    };

    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        return value;
    };

    var _Game_Actor_paramBase = Game_Actor.prototype.paramBase;
    Game_Actor.prototype.paramBase = function(paramId) {
        // Class curve base values
        var baseFromClass = _Game_Actor_paramBase.call(this, paramId);

        switch (paramId) {
            case 0: // Max HP
                return Math.round(baseFromClass + (this.vit * 15) + (this.str * 5));
            case 1: // Max MP
                return Math.round(baseFromClass + (this.int * 8));
            case 2: // ATK (Physical Attack)
                if (this.isFinesseWeaponUser()) {
                    return Math.round(baseFromClass + (this.dex * 2) + (this.str * 0.5));
                } else {
                    return Math.round(baseFromClass + (this.str * 2) + (this.dex * 0.5));
                }
            case 3: // DEF (Physical Defense)
                return Math.round(baseFromClass + (this.vit * 1.5) + (this.str * 0.5));
            case 4: // MAT (Magic Attack)
                return Math.round(baseFromClass + (this.int * 2));
            case 5: // MDF (Magic Defense)
                return Math.round(baseFromClass + (this.int * 1.2) + (this.vit * 0.8));
            case 6: // AGI (Action Speed)
                return Math.round(baseFromClass + (this.agi * 1.5));
            case 7: // LUK (Luck)
                return Math.round(baseFromClass + this.luk);
            default:
                return baseFromClass;
        }
    };

    // -------------------------------------------------------------------------
    // Derived Stats (X-Params: HIT, EVA, CRI, CEV, HRG, MRG, TRG)
    // -------------------------------------------------------------------------
    var _Game_Actor_xparam = Game_Actor.prototype.xparam;
    Game_Actor.prototype.xparam = function(xparamId) {
        var base = _Game_Actor_xparam.call(this, xparamId);

        switch (xparamId) {
            case 0: // HIT Rate
                var hitVal = base + 0.85 + (this.dex * 0.002);
                return Math.min(1.0, hitVal);
            case 1: // EVA (Evasion Rate)
                var evaVal = base + 0.02 + (this.agi * 0.002) + (this.luk * 0.0005);
                return Math.min(MAX_EVA_CAP, evaVal);
            case 2: // CRI (Critical Rate)
                var criVal = base + 0.03 + (this.dex * 0.002) + (this.luk * 0.001);
                return Math.min(MAX_CRI_CAP, criVal);
            case 3: // CEV (Critical Evasion)
                return base + (this.luk * 0.0015) + (this.vit * 0.001);
            case 7: // HRG (HP Regeneration)
                return base + (this.vit * 0.0003);
            case 8: // MRG (MP Regeneration)
                return base + (this.int * 0.0003);
            case 9: // TRG (SP Regeneration)
                return base + 0.03 + (this.agi * 0.0004) + (this.vit * 0.0002);
            default:
                return base;
        }
    };

    // -------------------------------------------------------------------------
    // Derived Stats (S-Params: GRD)
    // -------------------------------------------------------------------------
    var _Game_Actor_sparam = Game_Actor.prototype.sparam;
    Game_Actor.prototype.sparam = function(sparamId) {
        var base = _Game_Actor_sparam.call(this, sparamId);
        if (sparamId === 1) { // GRD (Guard Effect Rate)
            return base * (1.0 + (this.vit * 0.005));
        }
        return base;
    };

    // -------------------------------------------------------------------------
    // Critical Damage Multiplier (CDMG)
    // -------------------------------------------------------------------------
    Game_BattlerBase.prototype.criticalMultiplier = function() {
        return BASE_CRIT_DMG;
    };

    Game_Actor.prototype.criticalMultiplier = function() {
        var equipBonus = 0;
        var equips = this.equips ? this.equips() : [];
        for (var i = 0; i < equips.length; i++) {
            if (equips[i] && equips[i].meta) {
                var cMeta = equips[i].meta['Critical Damage'];
                if (cMeta) {
                    var strVal = String(cMeta).replace('%', '').trim();
                    equipBonus += (Number(strVal) || 0) * 0.01;
                }
            }
        }
        var statBonus = (this.str * 0.003) + (this.dex * 0.002);
        return BASE_CRIT_DMG + statBonus + equipBonus;
    };

})();
