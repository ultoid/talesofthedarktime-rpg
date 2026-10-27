/*:
 * @plugindesc v1.0.0 NUSV Stamina Battle - Guard Stamina Recovery, On-Hit Adrenaline SP Recovery, and In-Battle Stamina Mechanics.
 * @author Ultoid
 *
 * @param Guard Base SP Recovery Rate
 * @desc Persentase Max SP yang langsung pulih saat melakukan aksi Guard/Defend (0.15 = 15%).
 * @default 0.15
 *
 * @param On-Hit SP Recovery Multiplier
 * @desc Pengali pemulihan SP saat terkena serangan musuh berdasarkan persentase HP berkurang dan VIT.
 * @default 0.5
 *
 * @help
 * ============================================================================
 * NUSV_StaminaBattle
 * ============================================================================
 *
 * Mengimplementasikan mekanik pertempuran berbasis Stamina (SP):
 *
 * 1. Guard / Defend Stamina Surge:
 *    - Saat karakter memilih aksi Guard (bertahan), karakter mengambil napas
 *      dan memfokuskan tenaga.
 *    - Segera meregenerasi Stamina sebesar:
 *        Max SP * (Guard Rate + (SP Regen * 2))
 *    - Menampilkan damage popup "+X SP" di layar pertarungan.
 *
 * 2. On-Hit Adrenaline SP Recovery:
 *    - Saat menerima serangan/damage dari musuh, tubuh memicu lonjakan adrenalin
 *      dan daya tahan (Endurance).
 *    - SP yang dipulihkan proporsional terhadap damage yang diterima, stat VIT,
 *      dan stat SP Regen (TRG) karakter, bukan rumus flat lama.
 */

var Imported = Imported || {};
Imported.NUSV_StaminaBattle = true;

var NUSV = NUSV || {};
NUSV.StaminaBattle = NUSV.StaminaBattle || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_StaminaBattle') || {};
    var GUARD_BASE_RATE = Number(parameters['Guard Base SP Recovery Rate'] || 0.15);
    var ON_HIT_MULT = Number(parameters['On-Hit SP Recovery Multiplier'] || 0.5);

    // -------------------------------------------------------------------------
    // Guard Action - Stamina Recovery Hook
    // -------------------------------------------------------------------------
    var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        
        // Check if this action is Guard (Skill #2 or has Guard effect)
        if (this.isGuard && this.isGuard()) {
            this.subject().performGuardStaminaRecovery();
        }
    };

    Game_Battler.prototype.performGuardStaminaRecovery = function() {
        var trgRate = (typeof this.trg === 'number') ? this.trg : 0.03;
        var recoveryRate = GUARD_BASE_RATE + (trgRate * 2);
        var amount = Math.max(1, Math.round(this.maxTp() * recoveryRate));

        this.gainTp(amount);
        if (typeof this.startDamagePopup === 'function') {
            this.startDamagePopup();
        }
    };

    // -------------------------------------------------------------------------
    // On-Hit Adrenaline SP Recovery Override
    // -------------------------------------------------------------------------
    Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
        if (!damageRate || damageRate <= 0) return;

        var vit = (typeof this.vit === 'number') ? this.vit : 10;
        var trg = (typeof this.trg === 'number') ? this.trg : 0.03;
        var tcr = (typeof this.tcr === 'number') ? this.tcr : 1.0;

        // Endurance scales with VIT (+1% per point above 10)
        var endurance = 1.0 + Math.max(0, (vit - 10) * 0.015);
        // SP Regen multiplier
        var regenScale = 1.0 + (trg * 5);

        // Calculate dynamic stamina recovery from taking hit
        var gainRate = damageRate * ON_HIT_MULT * endurance * regenScale * tcr;
        var value = Math.max(1, Math.floor(this.maxTp() * gainRate));

        this.gainTp(value);
        if (typeof this.startDamagePopup === 'function') {
            this.startDamagePopup();
        }
    };

})();
