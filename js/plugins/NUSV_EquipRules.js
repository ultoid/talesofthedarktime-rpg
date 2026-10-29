/*:
 * @plugindesc v1.2.0 NUSV Equip Rules - Dual Wield (Physical & Magic Rune Dual Wield), 2-Handed Weapon Sealing, Dual Accessory & Universal Relic.
 * @author Ultoid
 *
 * @param Universal Slots
 * @desc Slot Equipment Types yang dapat dipakai bebas oleh semua kelas tanpa batasan Armor Type (pisahkan dengan koma).
 * @default 6, 7
 *
 * @help
 * ============================================================================
 * NUSV_EquipRules
 * ============================================================================
 *
 * Plugin ini mengelola aturan pemakaian perlengkapan (Equip Rules) untuk game
 * Tales of The Dark Time:
 *
 * 1. Mekanisme 1-Handed (1H) vs 2-Handed (2H):
 *    - Senjata bertanda <NUSV Hand Slot: 2H Primary+Secondary> atau trait segel
 *      (Long Sword, Axe, Spear, Staff, Long Bow, Crossbow) memakan dua tangan.
 *    - Memasang senjata 2H di tangan utama (Slot 1) otomatis MENYEGEL slot
 *      Secondary Weapon (Slot 2) dan melepas perisai/offhand ke tas.
 *    - Senjata 2H TIDAK BISA dipasang di Slot 2 (tangan kiri).
 *
 * 2. Dual Wield (Fisik & Sihir / Rune Dual Wield):
 *    - Kelas Fisik Dual Wield (Assassin, Shadow Walker):
 *      Dapat memasang Dagger, 1H Sword, atau Gloves di kedua tangan.
 *    - Kelas Sihir Dual Wield (Seluruh 24 kelas sihir pengguna Rune):
 *      Dapat memasang Rune di tangan kanan (Primary) dan Rune lain di tangan
 *      kiri (Secondary), misal Rune Api di kanan dan Rune Air di kiri.
 *    - Jika penyihir memakai Staff (senjata 2H), slot kedua otomatis tersegel.
 *
 * 3. Dual Accessory Slots:
 *    - Setiap karakter memiliki 2 slot Aksesori in-game.
 *    - Kedua slot sama-sama membaca seluruh koleksi aksesori.
 *    - Pemain diperbolehkan memakai aksesori kembar selama memiliki stok >= 2.
 *    - Mendukung notetag aktor:
 *      <Second Accessory: Nama Item / ID>
 *      <Accessory 2: Nama Item / ID>
 *
 * 4. Universal Relic & Accessory Access:
 *    - Seluruh kelas dapat menggunakan Aksesori dan Relik tanpa batasan Armor Type.
 *
 * Urutan Plugin:
 *   YEP_EquipCore
 *   NUSV_EquipRules
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_EquipRules = true;

var NUSV = NUSV || {};
NUSV.EquipRules = NUSV.EquipRules || {};
NUSV.EquipRules.version = 1.2;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_EquipRules');
    var rawUniversal = String(parameters['Universal Slots'] || '6, 7');
    var universalSlots = rawUniversal.split(',').map(function(s) {
        return parseInt(s.trim(), 10);
    }).filter(function(n) {
        return !isNaN(n);
    });

    // -------------------------------------------------------------------------
    // 1. Two-Handed (2H) & Off-hand Compatibility Helpers
    // -------------------------------------------------------------------------
    NUSV.EquipRules.isTwoHanded = function(item) {
        if (!item) return false;
        if (typeof DataManager !== 'undefined' && !DataManager.isWeapon(item)) return false;
        if (item.wtypeId === undefined) return false;
        if (item.note && item.note.indexOf('2H Primary+Secondary') >= 0) return true;
        if (item.traits && item.traits.some(function(t) { return t.code === 54 && t.dataId === 2; })) return true;
        return false;
    };

    NUSV.EquipRules.canEquipInOffhand = function(item) {
        if (!item) return true;
        // 2H weapons can NEVER be equipped in Secondary/Off-hand slot
        if (NUSV.EquipRules.isTwoHanded(item)) return false;
        return true;
    };

    // -------------------------------------------------------------------------
    // 2. Default Equip Slots: [1, 2, 3, 4, 5, 6, 6, 7]
    // -------------------------------------------------------------------------
    if (typeof DataManager !== 'undefined') {
        DataManager.setDefaultEquipSlots = function(obj) {
            obj.equipSlots = [1, 2, 3, 4, 5, 6, 6, 7];
        };
    }

    // -------------------------------------------------------------------------
    // 3. Universal Armor Equipment Check (Accessories: 6, Relics: 7)
    // -------------------------------------------------------------------------
    var _Game_BattlerBase_canEquipArmor = Game_BattlerBase.prototype.canEquipArmor;
    Game_BattlerBase.prototype.canEquipArmor = function(item) {
        if (!item) return false;
        if (universalSlots.indexOf(item.etypeId) >= 0) {
            return !this.isEquipTypeSealed(item.etypeId);
        }
        return _Game_BattlerBase_canEquipArmor.call(this, item);
    };

    // -------------------------------------------------------------------------
    // 4. Two-Handed Weapon Auto-Unequip & Validation
    // -------------------------------------------------------------------------
    if (typeof Game_Actor !== 'undefined') {
        var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
        Game_Actor.prototype.changeEquip = function(slotId, item) {
            // If equipping a 2H weapon in Primary Weapon (slot 0), auto-unequip Secondary Weapon (slot 1)
            if (slotId === 0 && NUSV.EquipRules.isTwoHanded(item)) {
                if (this.equips()[1]) {
                    _Game_Actor_changeEquip.call(this, 1, null);
                }
            }
            // Disallow equipping 2H weapon in Secondary Weapon (slot 1)
            if (slotId === 1 && NUSV.EquipRules.isTwoHanded(item)) {
                return;
            }
            _Game_Actor_changeEquip.call(this, slotId, item);
        };

        // ---------------------------------------------------------------------
        // 5. Initial Equipment Setup: Map default equips and support notetags
        // ---------------------------------------------------------------------
        var _Game_Actor_initEquips = Game_Actor.prototype.initEquips;
        Game_Actor.prototype.initEquips = function(equips) {
            _Game_Actor_initEquips.call(this, equips);

            // If initial primary weapon is 2H, ensure secondary weapon slot is clear
            if (this.equips()[0] && NUSV.EquipRules.isTwoHanded(this.equips()[0])) {
                if (this.equips()[1]) {
                    this.changeEquip(1, null);
                }
            }

            // Check if actor has notetag for 2nd accessory (supports ID or Name)
            var actorObj = this.actor();
            if (actorObj && actorObj.note) {
                var match = actorObj.note.match(/<(?:Second Accessory|Accessory 2):[ ]*(.+?)>/i);
                if (match) {
                    var val = match[1].trim();
                    var secAcc = null;
                    if (/^\d+$/.test(val)) {
                        secAcc = $dataArmors[parseInt(val, 10)];
                    } else if (typeof $dataArmors !== 'undefined') {
                        for (var a = 1; a < $dataArmors.length; a++) {
                            if ($dataArmors[a] && $dataArmors[a].name && $dataArmors[a].name.toLowerCase() === val.toLowerCase()) {
                                secAcc = $dataArmors[a];
                                break;
                            }
                        }
                    }
                    if (secAcc && this.canEquip(secAcc)) {
                        var slots = this.equipSlots();
                        var count = 0;
                        for (var i = 0; i < slots.length; i++) {
                            if (slots[i] === 6) {
                                count++;
                                if (count === 2) {
                                    this.changeEquip(i, secAcc);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    // -------------------------------------------------------------------------
    // 6. Window_EquipItem Filter (Filter 2H weapons out of offhand slot)
    // -------------------------------------------------------------------------
    if (typeof Window_EquipItem !== 'undefined') {
        var _Window_EquipItem_includes = Window_EquipItem.prototype.includes;
        Window_EquipItem.prototype.includes = function(item) {
            if (item && this._actor && this._slotId === 1) {
                // Secondary Weapon slot can never take 2H weapons
                if (NUSV.EquipRules.isTwoHanded(item)) return false;
            }
            return _Window_EquipItem_includes.call(this, item);
        };
    }

})();
