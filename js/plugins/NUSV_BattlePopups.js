/*:
 * @plugindesc v1.0.1 NUSV Battle Popups - HD Vector typography, overhead positioning & clean battle indicators.
 * @author Ultoid
 *
 * @param Popup Font Face
 * @desc Font family yang digunakan untuk angka damage dan teks popup (pisahkan dengan koma).
 * @default BattleFont, sans-serif
 *
 * @param Damage Font Size
 * @type number
 * @min 16
 * @max 48
 * @desc Ukuran font untuk damage normal.
 * @default 28
 *
 * @param Critical Font Size
 * @type number
 * @min 20
 * @max 64
 * @desc Ukuran font untuk critical hit damage.
 * @default 34
 *
 * @param Heal Font Size
 * @type number
 * @min 16
 * @max 48
 * @desc Ukuran font untuk pemulihan HP (Heal).
 * @default 26
 *
 * @param Miss Font Size
 * @type number
 * @min 14
 * @max 36
 * @desc Ukuran font untuk popup MISS / EVADE.
 * @default 22
 *
 * @param Overhead Offset
 * @type number
 * @min 0
 * @max 100
 * @desc Jarak aman di atas kepala battler (pixel) agar popup dan nama tidak menutupi badan karakter.
 * @default 20
 *
 * @param Popup Duration
 * @type number
 * @min 30
 * @max 180
 * @desc Durasi kemunculan popup angka (dalam frame, 65 frame ~ 1.08 detik).
 * @default 65
 *
 * @param Enemy Name Font Size
 * @type number
 * @min 12
 * @max 24
 * @desc Ukuran font nama musuh saat Visual Enemy Select.
 * @default 16
 *
 * @help
 * ============================================================================
 * NUSV_BattlePopups
 * ============================================================================
 *
 * Plugin perombakan visual popup pertarungan untuk RPG Maker MV + YEP_BattleEngineCore.
 *
 * Fitur Utama:
 * 1. Tipografi Vektor Berkualitas Tinggi (HD Typography):
 *    - Menggantikan sistem raster bitmap kuno (Damage.png bawaan MV) dengan
 *      teks vektor beresolusi tinggi menggunakan font BattleFont (retro RPG).
 *    - Outline tebal (5px) dan drop shadow pekat memastikan angka selalu kontras
 *      dan terbaca jelas di segala latar arena pertempuran.
 *    - Pembedaan Warna Stat Terstandar:
 *      * Damage ke Musuh: Putih bersih (#FFFFFF) ber-outline pekat (#111111).
 *      * Damage ke Anggota Party: Coral/Merah peringatan (#FF6B6B).
 *      * Critical Hit: Emas cemerlang (#FFD700) dilengkapi lencana "CRITICAL!".
 *      * HP Heal: Hijau zamrud cerah (#2ECC71) dengan tanda "+".
 *      * MP Damage: Ungu amethyst (#A855F7).
 *      * MP Heal: Biru langit/Cyan (#00E5FF).
 *      * Miss / Evade: Perak halus (#E5E7EB) miring (italic).
 *
 * 2. Posisi Di Atas Kepala Battler (Overhead Positioning):
 *    - Angka damage tidak lagi menutupi tubuh, wajah, atau animasi tebasan battler.
 *    - Spawns tepat di atas kepala battler (-spriteHeight - overheadOffset).
 *    - Serangan beruntun (combo/multi-hit) mengalir naik secara bertingkat
 *      dengan rapi (+22px stagger), tanpa bertumpukan.
 *
 * 3. Animasi Cepat & Responsif:
 *    - Durasi disetel ke 65 frame (~1 detik) dengan pop-in bounce halus,
 *      upward float, dan fade-out elegan.
 *
 * 4. Overhead Enemy Nameplate:
 *    - Nama musuh pada Visual Enemy Select dipindahkan dari area kaki/badan
 *      ke atas kepala musuh dengan plat semi-transparan (dark pill) elegan.
 *
 * Urutan Plugin:
 *   YEP_BattleEngineCore
 *   NUSV_DamageCore
 *   NUSV_BattlePopups
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_BattlePopups = true;

var NUSV = NUSV || {};
NUSV.BattlePopups = NUSV.BattlePopups || {};
NUSV.BattlePopups.version = 1.01;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('NUSV_BattlePopups');
    var popupFontFace = String(parameters['Popup Font Face'] || 'BattleFont, sans-serif');
    var damageFontSize = Number(parameters['Damage Font Size'] || 28);
    var criticalFontSize = Number(parameters['Critical Font Size'] || 34);
    var healFontSize = Number(parameters['Heal Font Size'] || 26);
    var missFontSize = Number(parameters['Miss Font Size'] || 22);
    var overheadOffset = Number(parameters['Overhead Offset'] || 20);
    var popupDuration = Number(parameters['Popup Duration'] || 65);
    var enemyNameFontSize = Number(parameters['Enemy Name Font Size'] || 16);

    // Support fontBold & strokeRect on Bitmap
    if (typeof Bitmap !== 'undefined') {
        var _Bitmap_initialize = Bitmap.prototype.initialize;
        Bitmap.prototype.initialize = function(width, height) {
            _Bitmap_initialize.call(this, width, height);
            this.fontBold = false;
        };

        Bitmap.prototype._makeFontNameText = function() {
            var italic = this.fontItalic ? 'italic ' : '';
            var bold = this.fontBold ? 'bold ' : '';
            return italic + bold + this.fontSize + 'px ' + this.fontFace;
        };

        Bitmap.prototype.strokeRect = function(x, y, width, height, color, lineWidth) {
            var context = this._context;
            if (context) {
                context.save();
                context.strokeStyle = color || '#ffffff';
                context.lineWidth = lineWidth || 1;
                context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
                context.restore();
                if (typeof this._setDirty === 'function') {
                    this._setDirty();
                }
            }
        };
    }

    // Preload BattleFont in Graphics system if available
    if (typeof Graphics !== 'undefined' && typeof Graphics.loadFont === 'function') {
        Graphics.loadFont('BattleFont', 'fonts/final-fantasy-advance-ds.otf');
    }

    // -------------------------------------------------------------------------
    // 1. Overhead Position Calculation for Battler Popups
    // -------------------------------------------------------------------------
    Sprite_Battler.prototype.damageOffsetY = function() {
        var h = 0;
        if (typeof this.spriteHeight === 'function') {
            h = this.spriteHeight();
        } else if (this._mainSprite && this._mainSprite.height) {
            h = this._mainSprite.height;
        } else if (this.bitmap && this.bitmap.height) {
            h = this.bitmap.height;
        }
        h = Math.max(64, h);
        return -h - overheadOffset;
    };

    Sprite_Actor.prototype.damageOffsetY = function() {
        var h = (typeof this.spriteHeight === 'function') ? this.spriteHeight() : 64;
        return -Math.max(64, h) - overheadOffset;
    };

    Sprite_Enemy.prototype.damageOffsetY = function() {
        var h = (typeof this.spriteHeight === 'function') ? this.spriteHeight() : 80;
        return -Math.max(64, h) - overheadOffset;
    };

    // Stagger multiple stacked popups upward so they never overlap
    Sprite_Battler.prototype.pushDamageSprite = function(sprite) {
        var staggerOffset = 22;
        if (this._damages) {
            for (var i = 0; i < this._damages.length; i++) {
                this._damages[i].y -= staggerOffset;
            }
            this._damages.push(sprite);
        }
    };

    // -------------------------------------------------------------------------
    // 2. High-Definition Vector Sprite_Damage
    // -------------------------------------------------------------------------
    var _Sprite_Damage_initialize = Sprite_Damage.prototype.initialize;
    Sprite_Damage.prototype.initialize = function() {
        _Sprite_Damage_initialize.call(this);
        this._duration = popupDuration;
        this._nusvMaxDuration = popupDuration;
    };

    Sprite_Damage.prototype.isPlaying = function() {
        return this._duration > 0;
    };

    // Active busy threshold for battle flow & turn pacing (only block for first 22 frames)
    Sprite_Damage.prototype.isPopupBusy = function() {
        return this._duration > Math.max(0, popupDuration - 22);
    };

    // Override Sprite_Battler.prototype.isPopupPlaying from YEP_BattleEngineCore
    // Allows damage numbers to continue smooth drifting & fade-out while releasing the battle turn queue
    Sprite_Battler.prototype.isPopupPlaying = function() {
        if (!this._damages || this._damages.length === 0) return false;
        return this._damages.some(function(damage) {
            return damage.isPopupBusy ? damage.isPopupBusy() : damage.isPlaying();
        });
    };

    // Replace setup with clean HD vector renderer
    Sprite_Damage.prototype.setup = function(target) {
        if (!target) return;
        this._result = (typeof target.shiftDamagePopup === 'function') ? target.shiftDamagePopup() : target.result();
        var result = this._result;
        if (!result) return;

        if (result.missed || result.evaded) {
            this.nusvCreateTextPopup(result.evaded ? 'EVADE' : 'MISS', {
                fontSize: missFontSize,
                textColor: '#E5E7EB',
                outlineColor: '#1F2937',
                italic: true
            });
        } else if (result.hpAffected) {
            var val = result.hpDamage;
            var isCrit = !!result.critical;
            var isHeal = val < 0;
            var isAlly = (typeof target.isActor === 'function') ? target.isActor() : false;

            var text = (isHeal ? '+' : '') + Math.abs(val).toLocaleString();
            var size = isCrit ? criticalFontSize : (isHeal ? healFontSize : damageFontSize);

            var color = '#FFFFFF';
            var outline = '#111111';

            if (isCrit) {
                color = '#FFD700'; // Gold
                outline = '#3E2723';
            } else if (isHeal) {
                color = '#2ECC71'; // Vibrant Emerald
                outline = '#064E3B';
            } else if (isAlly) {
                color = '#FF6B6B'; // Coral Red for incoming damage to party
                outline = '#4A0E17';
            }

            this.nusvCreateNumberPopup(text, {
                fontSize: size,
                textColor: color,
                outlineColor: outline,
                isCrit: isCrit,
                isHeal: isHeal
            });
        } else if (target.isAlive && target.isAlive() && result.mpDamage !== 0) {
            var mpVal = result.mpDamage;
            var isMpHeal = mpVal < 0;
            var mpText = (isMpHeal ? '+' : '') + Math.abs(mpVal).toLocaleString() + ' MP';
            this.nusvCreateTextPopup(mpText, {
                fontSize: healFontSize,
                textColor: isMpHeal ? '#00E5FF' : '#A855F7',
                outlineColor: isMpHeal ? '#0C4A6E' : '#3B0764',
                isHeal: isMpHeal
            });
        }
    };

    Sprite_Damage.prototype.nusvCreateNumberPopup = function(text, config) {
        var fontSize = config.fontSize || damageFontSize;
        var isCrit = !!config.isCrit;

        // Hitung dimensi canvas
        var tw = Math.ceil(text.length * (fontSize * 0.72)) + 48;
        var th = fontSize + 16;
        if (isCrit) th += 20;

        var bitmap = new Bitmap(tw, th);
        var ctx = bitmap._context;

        bitmap.fontFace = popupFontFace;

        // Render Critical badge if critical hit
        if (isCrit) {
            bitmap.fontSize = 13;
            bitmap.fontBold = true;
            bitmap.fontItalic = false;
            bitmap.textColor = '#FF3B30';
            bitmap.outlineColor = '#000000';
            bitmap.outlineWidth = 3;
            bitmap.drawText('CRITICAL!', 0, 0, tw, 18, 'center');
        }

        var textY = isCrit ? 20 : 0;
        bitmap.fontSize = fontSize;
        bitmap.fontBold = true;
        bitmap.fontItalic = false;
        bitmap.textColor = config.textColor || '#FFFFFF';
        bitmap.outlineColor = config.outlineColor || '#111111';
        bitmap.outlineWidth = 5;

        // Subtle drop shadow for clarity
        if (ctx) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;
        }

        bitmap.drawText(text, 0, textY, tw, fontSize + 8, 'center');

        var sprite = new Sprite(bitmap);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1.0;
        sprite.x = 0;
        sprite.y = 0;
        sprite.dy = -1.5;
        sprite.scale.x = isCrit ? 1.25 : 1.15;
        sprite.scale.y = isCrit ? 1.25 : 1.15;

        this.addChild(sprite);
    };

    Sprite_Damage.prototype.nusvCreateTextPopup = function(text, config) {
        var fontSize = config.fontSize || missFontSize;
        var tw = Math.ceil(text.length * (fontSize * 0.75)) + 40;
        var th = fontSize + 16;

        var bitmap = new Bitmap(tw, th);
        var ctx = bitmap._context;

        bitmap.fontFace = popupFontFace;
        bitmap.fontSize = fontSize;
        bitmap.fontBold = true;
        bitmap.fontItalic = !!config.italic;
        bitmap.textColor = config.textColor || '#E5E7EB';
        bitmap.outlineColor = config.outlineColor || '#1F2937';
        bitmap.outlineWidth = 4;

        if (ctx) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 2;
        }

        bitmap.drawText(text, 0, 0, tw, th, 'center');

        var sprite = new Sprite(bitmap);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1.0;
        sprite.x = 0;
        sprite.y = 0;
        sprite.dy = -1.2;
        sprite.scale.x = 1.1;
        sprite.scale.y = 1.1;

        this.addChild(sprite);
    };

    // Smooth snappy update animation: gentle bounce-in, upward drift, and fade-out
    Sprite_Damage.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._duration > 0) {
            this._duration--;

            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.dy) {
                    child.y += child.dy;
                    child.dy += 0.04; // decelerate upward velocity
                    if (child.dy > -0.2) child.dy = -0.2; // gentle persistent drift
                }
                // Return scale to 1.0
                if (child.scale && child.scale.x > 1.0) {
                    child.scale.x = Math.max(1.0, child.scale.x - 0.02);
                    child.scale.y = Math.max(1.0, child.scale.y - 0.02);
                }
            }

            // Smooth fade-out in final 18 frames
            if (this._duration < 18) {
                this.opacity = Math.max(0, Math.floor((this._duration / 18) * 255));
            }

            if (this._duration <= 0 && this.parent) {
                this.parent.removeChild(this);
            }
        }
    };

    // -------------------------------------------------------------------------
    // 3. Clean Overhead Enemy Nameplate for Visual Enemy Select
    // -------------------------------------------------------------------------
    function applyEnemyVisualSelectOverrides() {
        if (typeof Window_EnemyVisualSelect === 'undefined') return;

        Window_EnemyVisualSelect.prototype.refresh = function() {
            this.contents.clear();
            if (!this._battler || !this._showEnemyName || this._battler.isHidden()) return;
            this._requestRefresh = false;

            var name = this._battler.name();
            this.contents.fontSize = enemyNameFontSize;
            this.contents.fontFace = popupFontFace;
            this.contents.fontBold = true;

            var tw = Math.ceil(this.textWidth(name)) + 24;
            var th = 26;
            var dx = Math.floor((this.contents.width - tw) / 2);
            var dy = 0;

            // Draw dark glass pill container
            this.contents.fillRect(dx, dy, tw, th, 'rgba(15, 23, 42, 0.82)');

            // Draw subtle glowing border using standard fillRect (100% crash-proof across all platforms)
            var borderColor = 'rgba(255, 255, 255, 0.25)';
            this.contents.fillRect(dx, dy, tw, 1, borderColor);
            this.contents.fillRect(dx, dy + th - 1, tw, 1, borderColor);
            this.contents.fillRect(dx, dy, 1, th, borderColor);
            this.contents.fillRect(dx + tw - 1, dy, 1, th, borderColor);

            // Draw crisp name text
            this.contents.textColor = '#F8FAFC';
            this.contents.outlineColor = '#0F172A';
            this.contents.outlineWidth = 3;
            this.drawText(name, dx, dy - 2, tw, th, 'center');
        };

        Window_EnemyVisualSelect.prototype.updateWindowPosition = function() {
            if (!this._battler) return;
            var spriteH = (typeof this._battler.spriteHeight === 'function') ? this._battler.spriteHeight() : 64;
            this.x = Math.floor(-1 * this.width / 2 + this._battler.spritePosX());
            // Posisi nama melayang bersih 38px di atas kepala musuh (bebas tabrakan dengan sprite)
            this.y = Math.floor(this._battler.spritePosY() - spriteH - this.standardPadding() - 38);
            if (this._minX !== undefined && this._maxX !== undefined) {
                this.x = this.x.clamp(this._minX, this._maxX);
            }
            if (this._minY !== undefined && this._maxY !== undefined) {
                this.y = this.y.clamp(this._minY, this._maxY);
            }
        };
    }

    applyEnemyVisualSelectOverrides();

})();
