/*:
 * @plugindesc v1.0.0 NUSV CTB Calibration - Clean-room CTB visual & pacing enhancements for YEP_X_BattleSysCTB.
 * @author Ultoid
 *
 * @param Fallback Enemy Icon
 * @desc Icon Index yang digunakan jika musuh tidak memiliki sprite battler statis dan tidak ada <CTB Icon: x>.
 * @default 76
 *
 * @param Enhanced Face Crop
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Perjelas tampilan wajah karakter di CTB icon dengan fokus pada area kepala/wajah (bukan mengecilkan seluruh torso).
 * @default true
 *
 * @param Letter Font Size
 * @type number
 * @min 10
 * @max 24
 * @desc Ukuran font untuk huruf identifikasi musuh jamak (A, B, C) agar tidak menutupi ikon.
 * @default 14
 *
 * @help
 * ============================================================================
 * NUSV_CTBCalibration
 * ============================================================================
 *
 * Plugin kalibrasi dan penyempurnaan visual untuk YEP_X_BattleSysCTB.
 *
 * Fitur:
 * 1. Fallback Enemy Icon:
 *    Mencegah ikon antrean CTB musuh kosong/transparan apabila database enemy
 *    belum memiliki battler image statis. Menggunakan icon 76 (Crossed Swords)
 *    atau icon sesuai parameter plugin sebagai fallback otomatis.
 *
 * 2. Enhanced Face Cropping:
 *    Memotong dan memfokuskan grafik wajah aktor 144x144 ke area wajah/mata
 *    sehingga ekspresi karakter tampak tajam dan jelas di bar antrean giliran
 *    tanpa terdistorsi atau terlalu kecil.
 *
 * 3. Anti-Overlap Plural Enemy Letters:
 *    Menyesuaikan ukuran font dan posisi huruf musuh (A, B, C) ke sudut kanan
 *    bawah dengan outline tegas, sehingga tidak menutupi gambar ikon utama.
 *
 * Urutan Plugin:
 *   YEP_BattleEngineCore
 *   YEP_X_BattleSysCTB
 *   NUSV_CTBCalibration
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_CTBCalibration = true;

var NUSV = NUSV || {};
NUSV.CTBCalibration = NUSV.CTBCalibration || {};
NUSV.CTBCalibration.version = 1.0;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_CTBCalibration');
    var fallbackEnemyIcon = Number(parameters['Fallback Enemy Icon'] || 76);
    var enhancedFaceCrop = String(parameters['Enhanced Face Crop'] || 'true').toLowerCase() === 'true';
    var letterFontSize = Number(parameters['Letter Font Size'] || 14);

    // Pastikan Window_CTBIcon telah terdefinisi oleh YEP_X_BattleSysCTB
    if (typeof Window_CTBIcon === 'undefined') {
        return;
    }

    // -------------------------------------------------------------------------
    // 1. Fallback Enemy Icon Handling
    // -------------------------------------------------------------------------
    var _Window_CTBIcon_updateBattler = Window_CTBIcon.prototype.updateBattler;
    Window_CTBIcon.prototype.updateBattler = function() {
        _Window_CTBIcon_updateBattler.call(this);

        if (!this._battler || !this._battler.isEnemy()) return;

        // Jika musuh tidak memiliki icon khusus dan tidak memiliki battler image
        var hasExplicitIcon = this._iconIndex > 0;
        var hasValidBattlerImage = false;

        if (this.isUsingSVBattler()) {
            hasValidBattlerImage = !!this._battler.svBattlerName();
        } else {
            hasValidBattlerImage = !!this._battler.battlerName() && this._battler.battlerName().trim() !== '';
        }

        if (!hasExplicitIcon && !hasValidBattlerImage) {
            this._iconIndex = fallbackEnemyIcon;
            this._image = ImageManager.loadSystem('IconSet');
            this._redraw = true;
        }
    };

    // -------------------------------------------------------------------------
    // 2. Enhanced Face Cropping for Actor Portraits
    // -------------------------------------------------------------------------
    if (enhancedFaceCrop) {
        Window_CTBIcon.prototype.redrawActorFace = function() {
            var faceIndex = this._battler.faceIndex();
            var bitmap = this._image;
            if (!bitmap || bitmap.width <= 0) return;

            var pw = Window_Base._faceWidth;   // 144
            var ph = Window_Base._faceHeight;  // 144

            // Fokus pada area atas-tengah face sprite (area wajah & mata ~80% dari kotak)
            var cropW = Math.floor(pw * 0.82);
            var cropH = Math.floor(ph * 0.82);

            var sx = (faceIndex % 4) * pw + Math.floor((pw - cropW) / 2);
            var sy = Math.floor(faceIndex / 4) * ph + Math.floor(ph * 0.06);

            var dw = this.contents.width - 8;
            var dh = this.contents.height - 8;
            var dx = 4;
            var dy = 4;

            this.contents.blt(bitmap, sx, sy, cropW, cropH, dx, dy, dw, dh);
        };
    }

    // -------------------------------------------------------------------------
    // 3. Crisp, Non-Overlapping Enemy Plural Letters (A, B, C)
    // -------------------------------------------------------------------------
    Window_CTBIcon.prototype.redrawLetter = function() {
        if (!this._battler || !this._battler.isEnemy()) return;
        if (!this._battler._plural) return;

        var letter = this._battler._letter;
        if (!letter) return;

        var prevFontSize = this.contents.fontSize;
        var prevOutlineWidth = this.contents.outlineWidth;
        var prevOutlineColor = this.contents.outlineColor;

        this.contents.fontSize = letterFontSize;
        this.contents.outlineWidth = 3;
        this.contents.outlineColor = 'rgba(0, 0, 0, 0.85)';

        var dy = this.contents.height - letterFontSize - 4;
        this.drawText(letter, 0, dy, this.contents.width - 4, 'right');

        this.contents.fontSize = prevFontSize;
        this.contents.outlineWidth = prevOutlineWidth;
        this.contents.outlineColor = prevOutlineColor;
    };

})();

