//=============================================================================
// NUSV_OctoBattleHUD.js
//=============================================================================

/*:
 * @plugindesc v1.1.0 NUSV Octo Battle HUD - Octopath Traveler II Inspired Minimalist Battle UI with Character Portraits.
 * @author Ultoid
 *
 * @param ---Party Status---
 * @default
 *
 * @param Status Width
 * @parent ---Party Status---
 * @type number
 * @min 240
 * @max 360
 * @desc Lebar jendela status party (Top-Right panel).
 * @default 280
 *
 * @param Status Top Margin
 * @parent ---Party Status---
 * @type number
 * @min 0
 * @max 100
 * @desc Jarak dari tepi atas layar (pixel).
 * @default 16
 *
 * @param Status Right Margin
 * @parent ---Party Status---
 * @type number
 * @min 0
 * @max 100
 * @desc Jarak dari tepi kanan layar (pixel).
 * @default 16
 *
 * @param Card Height
 * @parent ---Party Status---
 * @type number
 * @min 70
 * @max 120
 * @desc Tinggi kartu tiap anggota party (cukup untuk portrait & 3 gauges HP, MP, SP tanpa bertumpukan).
 * @default 92
 *
 * @param Portrait Size
 * @parent ---Party Status---
 * @type number
 * @min 36
 * @max 64
 * @desc Ukuran kotak foto/portrait karakter (pixel).
 * @default 48
 *
 * @param Show Boost Pips
 * @parent ---Party Status---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Tampilkan bulatan Boost Pips (BP) di samping nama karakter (Octopath style).
 * @default true
 *
 * @param Max Boost Pips
 * @parent ---Party Status---
 * @type number
 * @min 3
 * @max 8
 * @desc Jumlah maksimal orbs/pips boost (standar Octopath = 5).
 * @default 5
 *
 * @param ---Command Window---
 * @default
 *
 * @param Floating Command Window
 * @parent ---Command Window---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Tempatkan menu aksi melayang tepat di samping karakter aktif (bukan di pojok kiri bawah).
 * @default true
 *
 * @param Command Width
 * @parent ---Command Window---
 * @type number
 * @min 140
 * @max 240
 * @desc Lebar jendela menu aksi melayang.
 * @default 180
 *
 * @param ---Sub-Menus---
 * @default
 *
 * @param Compact Sub Menus
 * @parent ---Sub-Menus---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Buat jendela Skill, Item, dan Help kompak di sudut kiri-bawah (tidak memenuhi seluruh layar).
 * @default true
 *
 * @param Sub Menu Width
 * @parent ---Sub-Menus---
 * @type number
 * @min 220
 * @max 500
 * @desc Lebar jendela Skill & Item kompak (pas di samping Actor Command).
 * @default 270
 *
 * @param Sub Menu Height
 * @parent ---Sub-Menus---
 * @type number
 * @min 140
 * @max 300
 * @desc Tinggi jendela Skill & Item kompak (pas 4 baris opsi).
 * @default 170
 *
 * @param ---Enemy Status---
 * @default
 *
 * @param Show Enemy Status
 * @parent ---Enemy Status---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Tampilkan status HUD di bawah musuh (Nama, Active States, HP Bar, Level Badge).
 * @default true
 *
 * @param Shield Mode
 * @parent ---Enemy Status---
 * @type select
 * @option Enemy Level (Tameng menampilkan Level musuh)
 * @value level
 * @option None (Tanpa tameng, hanya Nama, State, dan HP Bar)
 * @value none
 * @desc Tampilan tameng di samping nama musuh.
 * @default level
 *
 * @param Enemy Status Offset X
 * @parent ---Enemy Status---
 * @type number
 * @min -200
 * @max 200
 * @desc Geser posisi horizontal status musuh (pixel).
 * @default -40
 *
 * @param Enemy Status Offset Y
 * @parent ---Enemy Status---
 * @type number
 * @min -100
 * @max 200
 * @desc Geser posisi vertikal status musuh dari kaki/ground (pixel).
 * @default 8
 *
 * @param Hide Visual Select Overhead Name
 * @parent ---Enemy Status---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Sembunyikan plat nama overhead bawaan Visual Enemy Select agar bersih (nama sudah ada di bawah musuh).
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_OctoBattleHUD - Octopath Traveler II Inspired Battle HUD
 * ============================================================================
 *
 * Plugin ini merombak total tampilan antarmuka pertempuran (Battle HUD)
 * agar menyerupai estetika modern HD-2D Octopath Traveler II:
 *
 * 1. Top-Right Party Status Panel dengan Character Portraits:
 *    - Kartu obsidian glass vertikal di sudut kanan atas.
 *    - Setiap kartu memiliki foto wajah karakter (portrait avatar).
 *    - Indikator giliran aktif (glowing cyan accent bar).
 *    - 5 Boost Pips (BP orbs) yang terisi proporsional dengan TP.
 *    - Bar HP dan SP ultra-slim dengan angka nilai yang rapi tanpa overlap.
 *
 * 2. Top Bar CTB Timeline Harmonization:
 *    - Antrean giliran CTB disejajarkan rapi dari kiri ke kanan di bagian atas,
 *      sehingga tidak lagi menabrak atau menumpuk di atas status party.
 *
 * 3. Floating Actor Command Window:
 *    - Menu aksi melayang di samping sprite karakter aktif.
 *    - Sorotan highlight kursor modern dengan aksen bercahaya.
 *
 * 4. Compact Tactical Sub-Menus:
 *    - Jendela Skill & Item berukuran kompak di sudut kiri-bawah.
 *
 * 5. Under-Enemy Status UI & Break System:
 *    - Lambang perisai logam biru (Shield Emblem) dengan angka pertahanan Break.
 *    - Label status "VULNERABLE" atau "BROKEN".
 *    - Baris slot kelemahan (Weakness icons) dengan status penemuan [?] dan ikon.
 *    - Nama musuh dan slim HP bar tepat di bawah musuh.
 *    - Mekanik Break: Saat perisai 0, musuh mengalami Break (Stun + 1.5x damage).
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_OctoBattleHUD = true;

var NUSV = NUSV || {};
NUSV.OctoBattleHUD = NUSV.OctoBattleHUD || {};

(function() {
    "use strict";

    //=============================================================================
    // Parameter Parsing
    //=============================================================================
    var params = PluginManager.parameters('NUSV_OctoBattleHUD');

    NUSV.OctoBattleHUD.statusWidth = parseInt(params['Status Width']) || 280;
    NUSV.OctoBattleHUD.statusTopMargin = parseInt(params['Status Top Margin']) || 16;
    NUSV.OctoBattleHUD.statusRightMargin = parseInt(params['Status Right Margin']) || 16;
    NUSV.OctoBattleHUD.cardHeight = parseInt(params['Card Height']) || 92;
    NUSV.OctoBattleHUD.portraitSize = parseInt(params['Portrait Size']) || 48;
    NUSV.OctoBattleHUD.showBoostPips = String(params['Show Boost Pips'] || 'false').trim().toLowerCase() === 'true';
    NUSV.OctoBattleHUD.maxBoostPips = parseInt(params['Max Boost Pips']) || 5;

    NUSV.OctoBattleHUD.floatingCommand = String(params['Floating Command Window'] || 'true').trim().toLowerCase() === 'true';
    NUSV.OctoBattleHUD.commandWidth = parseInt(params['Command Width']) || 145;

    NUSV.OctoBattleHUD.compactSubMenus = String(params['Compact Sub Menus'] || 'true').trim().toLowerCase() === 'true';
    NUSV.OctoBattleHUD.subMenuWidth = parseInt(params['Sub Menu Width']) || 270;
    NUSV.OctoBattleHUD.subMenuHeight = parseInt(params['Sub Menu Height']) || 184;

    NUSV.OctoBattleHUD.showEnemyStatus = String(params['Show Enemy Status'] || 'true').trim().toLowerCase() === 'true';
    NUSV.OctoBattleHUD.shieldMode = String(params['Shield Mode'] || 'level').trim().toLowerCase();
    NUSV.OctoBattleHUD.enemyStatusOffsetX = parseInt(params['Enemy Status Offset X']) || -40;
    NUSV.OctoBattleHUD.enemyStatusOffsetY = parseInt(params['Enemy Status Offset Y']) || 8;
    NUSV.OctoBattleHUD.hideOverheadName = String(params['Hide Visual Select Overhead Name'] || 'true').trim().toLowerCase() === 'true';

    // Helper: Draw modern rounded rectangle
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        if (width <= 0 || height <= 0) return;
        radius = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    //=============================================================================
    // Window_BattleStatus (Octopath Top-Right Panel with Character Portraits)
    //=============================================================================
    var _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = Graphics.boxWidth - width - NUSV.OctoBattleHUD.statusRightMargin;
        var y = NUSV.OctoBattleHUD.statusTopMargin;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.opacity = 0; // Transparent default frame, custom glass rendering
        this.backOpacity = 0;
        this.openness = 255;
        this.refresh();
    };

    Window_BattleStatus.prototype.standardPadding = function() {
        return 0; // Seamless edge-to-edge canvas rendering for custom glowing cards
    };

    Window_BattleStatus.prototype.windowWidth = function() {
        return 300;
    };

    Window_BattleStatus.prototype.windowHeight = function() {
        var rows = this.numVisibleRows();
        return (rows * 79) + 30;
    };

    Window_BattleStatus.prototype.numVisibleRows = function() {
        return Math.max(1, Math.min(4, $gameParty ? $gameParty.battleMembers().length : 4));
    };

    Window_BattleStatus.prototype.maxCols = function() {
        return 1;
    };

    Window_BattleStatus.prototype.maxItems = function() {
        return $gameParty ? $gameParty.battleMembers().length : 0;
    };

    Window_BattleStatus.prototype.itemHeight = function() {
        return 74;
    };

    Window_BattleStatus.prototype.itemRect = function(index) {
        var activeActor = BattleManager.actor();
        var members = $gameParty ? $gameParty.battleMembers() : [];
        var activeIdx = -1;
        for (var i = 0; i < members.length; i++) {
            if (members[i] === activeActor) {
                activeIdx = i;
                break;
            }
        }

        var cardH = 74;
        var cardHZoom = 88; // 120% subtle zoom, perfectly clear of actor sprites
        var spacing = 5;
        var y = 0;
        for (var j = 0; j < index; j++) {
            y += (j === activeIdx ? cardHZoom : cardH) + spacing;
        }

        var isActive = (index === activeIdx);
        var rect = new Rectangle();
        // Active card expands 30px to the left (x=0, w=300). Inactive cards tuck neatly to the right (x=30, w=270).
        rect.width = isActive ? 300 : 270;
        rect.height = isActive ? cardHZoom : cardH;
        rect.x = isActive ? 0 : 30;
        rect.y = y;
        return rect;
    };

    Window_BattleStatus.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0); // Hide standard white cursor rectangle (custom cards have glowing borders)
    };

    var _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
    Window_BattleStatus.prototype.update = function() {
        if (_Window_BattleStatus_update) _Window_BattleStatus_update.call(this);
        var currentActor = BattleManager.actor();
        if (this._lastActiveActor !== currentActor) {
            this._lastActiveActor = currentActor;
            this.refresh();
        }
    };

    var _Window_BattleStatus_select = Window_BattleStatus.prototype.select;
    Window_BattleStatus.prototype.select = function(index) {
        var oldIndex = this._index;
        _Window_BattleStatus_select.call(this, index);
        if (oldIndex !== index) {
            this.refresh();
        }
    };

    Window_BattleStatus.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        this.drawAllItems();
    };

    Window_BattleStatus.prototype.drawItem = function(index) {
        var actor = $gameParty.battleMembers()[index];
        if (!actor) return;
        var rect = this.itemRect(index);
        var isSelected = (this.index() === index);
        var isActive = (BattleManager.actor() === actor);

        var ctx = this.contents.context;
        ctx.save();

        // 1. Obsidian Glass Card Background
        var bgGradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
        if (isActive) {
            bgGradient.addColorStop(0, 'rgba(24, 38, 62, 0.96)');
            bgGradient.addColorStop(1, 'rgba(14, 22, 38, 0.92)');
        } else if (isSelected) {
            bgGradient.addColorStop(0, 'rgba(30, 42, 64, 0.90)');
            bgGradient.addColorStop(1, 'rgba(16, 24, 38, 0.84)');
        } else {
            bgGradient.addColorStop(0, 'rgba(12, 16, 26, 0.80)');
            bgGradient.addColorStop(1, 'rgba(8, 12, 20, 0.74)');
        }

        var cardRadius = isActive ? 10 : 8;
        drawRoundedRect(ctx, rect.x, rect.y, rect.width, rect.height, cardRadius);
        ctx.fillStyle = bgGradient;
        ctx.fill();

        // Card Border
        ctx.lineWidth = isActive ? 2 : 1;
        if (isActive) {
            ctx.strokeStyle = '#38BDF8'; // Bright Cyan glow for active turn
        } else if (isSelected) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.80)'; // Amber glow for selection target
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        }
        ctx.stroke();

        // Left Accent Bar for Active Turn
        if (isActive) {
            ctx.beginPath();
            ctx.moveTo(rect.x + 3, rect.y + 8);
            ctx.lineTo(rect.x + 3, rect.y + rect.height - 8);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#38BDF8';
            ctx.stroke();
        }

        ctx.restore();

        // 2. Character Portrait / Avatar on the Left (56px zoomed active vs 46px standard)
        var pSize = isActive ? 56 : 46;
        var pX = rect.x + 8;
        var pY = rect.y + (isActive ? 5 : 4);
        this.drawOctoPortrait(actor, pX, pY, pSize, isActive, isSelected);

        // State Badges placed directly under the portrait avatar
        var stateIcons = (actor.allIcons && typeof actor.allIcons === 'function') ? actor.allIcons() : [];
        if (stateIcons.length > 0) {
            var stateY = pY + pSize + (isActive ? 4 : 3);
            var iconSize = isActive ? 16 : 14;
            var iconSpacing = iconSize + 3;
            var maxDisplay = Math.min(2, stateIcons.length);
            for (var s = 0; s < maxDisplay; s++) {
                var sxPos = pX + (s * iconSpacing);
                this.drawOctoStateIcon(stateIcons[s], sxPos, stateY, iconSize);
            }
        }

        // 3. Right Area (Name, HP, MP, SP Gauges)
        var contentX = pX + pSize + (isActive ? 10 : 8);
        var contentWidth = (rect.x + rect.width) - contentX - (isActive ? 10 : 8);

        // Line 1: Actor Name
        var nameY = rect.y + (isActive ? 4 : 3);
        this.contents.fontFace = 'BattleFont, sans-serif';
        this.contents.fontSize = isActive ? 14 : 12;
        this.contents.fontBold = true;
        this.changeTextColor(isActive ? '#FDE047' : '#F8FAFC');
        this.contents.drawText(actor.name(), contentX, nameY, contentWidth, isActive ? 16 : 14, 'left');

        // Line 2: HP Gauge & Values
        var hpY = rect.y + (isActive ? 22 : 18);
        this.drawOctoGauge(
            contentX,
            hpY,
            contentWidth,
            'HP',
            actor.hp,
            actor.mhp,
            actor.hpRate() > 0.5 ? '#10B981' : (actor.hpRate() > 0.25 ? '#F59E0B' : '#EF4444'),
            actor.hpRate() > 0.5 ? '#34D399' : (actor.hpRate() > 0.25 ? '#FBBF24' : '#F87171'),
            isActive
        );

        // Line 3: MP Gauge & Values (Arcane Cyan)
        var mpY = rect.y + (isActive ? 41 : 34);
        this.drawOctoGauge(
            contentX,
            mpY,
            contentWidth,
            'MP',
            actor.mp,
            actor.mmp,
            '#0284C7',
            '#38BDF8',
            isActive
        );

        // Line 4: SP Gauge & Values (Golden Amber - in Nusvanir, mapped to actor.tp)
        var spY = rect.y + (isActive ? 60 : 50);
        var maxSp = (typeof actor.maxSp === 'function') ? actor.maxSp() :
                    ((typeof actor.maxTp === 'function') ? actor.maxTp() : 100);
        var currentSp = Math.floor(actor.tp || 0);
        this.drawOctoGauge(
            contentX,
            spY,
            contentWidth,
            'SP',
            currentSp,
            maxSp,
            '#D97706',
            '#FBBF24',
            isActive
        );
    };

    // Draw Sleek Mini State Icon with Capsule Background
    Window_BattleStatus.prototype.drawOctoStateIcon = function(iconIndex, x, y, size) {
        var bitmap = ImageManager.loadSystem('IconSet');
        if (!bitmap) return;
        var pw = Window_Base._iconWidth || 32;
        var ph = Window_Base._iconHeight || 32;
        var sx = (iconIndex % 16) * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        var ctx = this.contents.context;
        ctx.save();
        drawRoundedRect(ctx, x - 1, y - 1, size + 2, size + 2, 3);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.70)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    };

    // Draw Character Face Portrait (Avatar Box)
    Window_BattleStatus.prototype.drawOctoPortrait = function(actor, x, y, size, isActive, isSelected) {
        if (!actor || typeof actor.faceName !== 'function') return;
        var faceName = actor.faceName();
        if (!faceName) return;

        var bitmap = ImageManager.loadFace(faceName);
        if (!bitmap) return;

        // If bitmap is still loading asynchronously, refresh when loaded
        if (bitmap.width <= 0) {
            bitmap.addLoadListener(this.refresh.bind(this));
            return;
        }

        var ctx = this.contents.context;
        ctx.save();

        // 1. Avatar Frame Background
        drawRoundedRect(ctx, x, y, size, size, 6);
        ctx.fillStyle = 'rgba(10, 15, 26, 0.95)';
        ctx.fill();

        // 2. Avatar Border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isActive ? '#38BDF8' : (isSelected ? '#FBBF24' : 'rgba(255, 255, 255, 0.22)');
        ctx.stroke();

        // 3. Clip and Draw Face Texture
        ctx.save();
        drawRoundedRect(ctx, x + 1, y + 1, size - 2, size - 2, 5);
        if (ctx.clip) ctx.clip();

        var pw = Window_Base._faceWidth;   // 144
        var ph = Window_Base._faceHeight;  // 144
        var cropW = Math.floor(pw * 0.82);
        var cropH = Math.floor(ph * 0.82);

        var faceIndex = actor.faceIndex();
        var sx = (faceIndex % 4) * pw + Math.floor((pw - cropW) / 2);
        var sy = Math.floor(faceIndex / 4) * ph + Math.floor(ph * 0.08);

        this.contents.blt(bitmap, sx, sy, cropW, cropH, x + 1, y + 1, size - 2, size - 2);
        ctx.restore();

        ctx.restore();
    };

    // Draw Octopath 5-Pip Boost Orbs
    Window_BattleStatus.prototype.drawOctoBoostPips = function(actor, startX, centerY) {
        var maxPips = NUSV.OctoBattleHUD.maxBoostPips;
        var filledPips = Math.min(maxPips, Math.floor((actor.tp || 0) / (100 / maxPips)));
        var pipSpacing = 10;
        var pipRadius = 3;

        var ctx = this.contents.context;
        ctx.save();

        for (var i = 0; i < maxPips; i++) {
            var px = startX + (i * pipSpacing);
            var py = centerY;
            var isFilled = (i < filledPips);

            ctx.beginPath();
            ctx.arc(px, py, pipRadius, 0, Math.PI * 2);
            if (isFilled) {
                ctx.fillStyle = '#F59E0B'; // Amber glow
                ctx.shadowColor = '#FBBF24';
                ctx.shadowBlur = 4;
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        ctx.restore();
    };

    // Draw Ultra-Slim Modern Gauge (Octopath Style, zero vertical overlap, responsive to active zoom)
    Window_BattleStatus.prototype.drawOctoGauge = function(x, y, width, label, current, max, color1, color2, isZoomed) {
        var ctx = this.contents.context;
        var barHeight = isZoomed ? 4 : 3;
        var textHeight = isZoomed ? 12 : 11;

        // 1. Text Line (Label on left, value on right) with explicit textHeight to prevent MV 36px font stretch
        this.contents.fontFace = 'BattleFont, sans-serif';
        this.contents.fontSize = isZoomed ? 11 : 10;
        this.contents.fontBold = true;
        var labelColor = '#94A3B8';
        if (label === 'MP') {
            labelColor = '#38BDF8';
        } else if (label === 'SP') {
            labelColor = '#F59E0B';
        }
        this.changeTextColor(labelColor);
        this.contents.drawText(label, x, y, 22, textHeight, 'left');

        // Numeric Values (e.g. 710 / 966)
        var valText = (typeof Yanfly !== 'undefined' && Yanfly.Util && Yanfly.Util.toGroup) ?
            (Yanfly.Util.toGroup(current) + " / " + Yanfly.Util.toGroup(max)) :
            (current + " / " + max);

        this.contents.fontSize = isZoomed ? 11 : 10;
        this.contents.fontBold = false;
        this.changeTextColor('#F1F5F9');
        this.contents.drawText(valText, x + 24, y, width - 24, textHeight, 'right');

        // 2. Bar Line (drawn cleanly 2px BELOW text baseline)
        var barY = y + textHeight + 2;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        drawRoundedRect(ctx, x, barY, width, barHeight, 2);
        ctx.fill();

        // Bar Fill
        var rate = max > 0 ? Math.min(1.0, Math.max(0.0, current / max)) : 0;
        var fillWidth = Math.floor(width * rate);
        if (fillWidth > 0) {
            var grad = ctx.createLinearGradient(x, barY, x + fillWidth, barY);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            ctx.fillStyle = grad;
            drawRoundedRect(ctx, x, barY, fillWidth, barHeight, 2);
            ctx.fill();
        }
        ctx.restore();
    };

    // Keep Status Window anchored at Top-Right
    var _Scene_Battle_updateWindowPositions = Scene_Battle.prototype.updateWindowPositions;
    Scene_Battle.prototype.updateWindowPositions = function() {
        if (this._statusWindow) {
            var targetX = Graphics.boxWidth - this._statusWindow.width - NUSV.OctoBattleHUD.statusRightMargin;
            var targetY = NUSV.OctoBattleHUD.statusTopMargin;
            this._statusWindow.x = targetX;
            this._statusWindow.y = targetY;

            // In victory phase, hide status window so results UI has clean space
            if (BattleManager._victoryPhase) {
                this._statusWindow.visible = false;
            } else {
                this._statusWindow.visible = true;
            }
        }
        if (Scene_Battle.prototype.updateWindowPositionsCTB) {
            return;
        }
        if (_Scene_Battle_updateWindowPositions) _Scene_Battle_updateWindowPositions.call(this);
    };

    // Helper: Draw modern 45-degree diamond (rhombus)
    function drawDiamondPath(ctx, cx, cy, r) {
        if (r <= 0) return;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
    }

    // Helper: Determine dynamic "NEXT TURN" split index
    NUSV.OctoBattleHUD.getCTBSplitIndex = function() {
        if (!BattleManager || !BattleManager.ctbTurnOrder) return -1;
        var order = BattleManager.ctbTurnOrder();
        if (!order || order.length <= 4) return -1;
        var seen = {};
        for (var i = 0; i < order.length; i++) {
            var b = order[i];
            if (!b) continue;
            var key = b.isActor() ? ('a_' + b.actorId()) : ('e_' + b.index());
            if (seen[key]) return i;
            seen[key] = true;
        }
        var partyCount = $gameParty ? $gameParty.aliveMembers().length : 4;
        return Math.min(order.length - 1, Math.max(3, partyCount));
    };

    //=============================================================================
    // Octopath Diamond CTB Turn Order Timeline
    //=============================================================================
    if (typeof Window_CTBIcon !== 'undefined') {
        var _Window_CTBIcon_initialize = Window_CTBIcon.prototype.initialize;
        Window_CTBIcon.prototype.initialize = function(mainSprite) {
            _Window_CTBIcon_initialize.call(this, mainSprite);
            this.width = 72;
            this.height = 72;
            this.opacity = 0;
            this._prevTurnIndex = -1;
        };

        Window_CTBIcon.prototype.iconWidth = function() {
            return 72;
        };

        Window_CTBIcon.prototype.iconHeight = function() {
            return 72;
        };

        Window_CTBIcon.prototype.standardPadding = function() {
            return 0;
        };

        Window_CTBIcon.prototype.standardBackOpacity = function() {
            return 0;
        };

        var _Window_CTBIcon_update = Window_CTBIcon.prototype.update;
        Window_CTBIcon.prototype.update = function() {
            _Window_CTBIcon_update.call(this);
            if (this._battler && BattleManager.ctbTurnOrder) {
                var curIdx = BattleManager.ctbTurnOrder().indexOf(this._battler);
                if (curIdx !== this._prevTurnIndex) {
                    this._prevTurnIndex = curIdx;
                    this._redraw = true;
                }
            }
        };

        Window_CTBIcon.prototype.updateRedraw = function() {
            if (!this._redraw) return;
            if (!this._image) return;
            if (this._image.width <= 0) return;
            this._redraw = false;
            this.contents.clear();
            this.drawOctoDiamond();
        };

        Window_CTBIcon.prototype.drawOctoDiamond = function() {
            if (!this._battler || !BattleManager.ctbTurnOrder) return;
            var order = BattleManager.ctbTurnOrder();
            var index = order.indexOf(this._battler);
            if (index < 0) return;

            var isCurrent = (index === 0);
            var isEnemy = this._battler.isEnemy();
            var cx = 36;
            var cy = 36;
            var r = isCurrent ? 26 : 17; // Big diamond vs Queue diamond

            var ctx = this.contents.context;
            ctx.save();

            // 1. Current Turn: Radiant light flare behind diamond
            if (isCurrent) {
                var flareGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 35);
                flareGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
                flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0.00)');
                ctx.fillStyle = flareGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, 35, 0, Math.PI * 2);
                ctx.fill();
            }

            // 2. Diamond Background Fill & Clip
            ctx.save();
            drawDiamondPath(ctx, cx, cy, r - 1.5);
            if (ctx.clip) ctx.clip();

            if (isCurrent) {
                ctx.fillStyle = 'rgba(10, 20, 38, 0.95)';
            } else if (isEnemy) {
                ctx.fillStyle = 'rgba(40, 10, 14, 0.92)';
            } else {
                ctx.fillStyle = 'rgba(12, 24, 42, 0.92)';
            }
            ctx.fillRect(0, 0, 72, 72);

            // 3. Draw Battler Texture Inside Clipped Diamond
            if (this._iconIndex > 0) {
                var pw = Window_Base._iconWidth;
                var ph = Window_Base._iconHeight;
                var sx = (this._iconIndex % 16) * pw;
                var sy = Math.floor(this._iconIndex / 16) * ph;
                var iconBitmap = ImageManager.loadSystem('IconSet');
                var drawSize = isCurrent ? 36 : 24;
                this.contents.blt(iconBitmap, sx, sy, pw, ph, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
            } else if (this._battler.isActor()) {
                var faceIndex = this._battler.faceIndex();
                var faceBitmap = this._image;
                if (faceBitmap && faceBitmap.width > 0) {
                    var pw = Window_Base._faceWidth;  // 144
                    var ph = Window_Base._faceHeight; // 144
                    var cropW = Math.floor(pw * 0.76);
                    var cropH = Math.floor(ph * 0.76);
                    var sx = (faceIndex % 4) * pw + Math.floor((pw - cropW) / 2);
                    var sy = Math.floor(faceIndex / 4) * ph + Math.floor(ph * 0.08);

                    var drawW = isCurrent ? 44 : 28;
                    var drawH = isCurrent ? 44 : 28;
                    this.contents.blt(faceBitmap, sx, sy, cropW, cropH, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
                }
            } else if (this._battler.isEnemy()) {
                var enemyBitmap = this._image;
                if (enemyBitmap && enemyBitmap.width > 0) {
                    var sw = enemyBitmap.width;
                    var sh = enemyBitmap.height;
                    if (this.isUsingSVBattler && this.isUsingSVBattler()) {
                        sw = enemyBitmap.width / 9;
                        sh = enemyBitmap.height / 6;
                    }
                    var drawSize = isCurrent ? 42 : 28;
                    this.contents.blt(enemyBitmap, 0, 0, sw, sh, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
                }

                // Ruby bottom glow for enemies
                var rubyGrad = ctx.createLinearGradient(cx, cy, cx, cy + r);
                rubyGrad.addColorStop(0, 'rgba(239, 68, 68, 0.0)');
                rubyGrad.addColorStop(1, 'rgba(239, 68, 68, 0.65)');
                ctx.fillStyle = rubyGrad;
                ctx.fillRect(0, 0, 72, 72);
            }

            ctx.restore(); // End clipping

            // 4. Diamond Borders (Neon Glow)
            if (isCurrent) {
                // Outer Diamond (Bright White/Cyan Glow)
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.6;
                ctx.shadowColor = '#38BDF8';
                ctx.shadowBlur = 8;
                drawDiamondPath(ctx, cx, cy, r);
                ctx.stroke();

                // Inner Diamond Ring
                ctx.strokeStyle = '#38BDF8';
                ctx.lineWidth = 1.2;
                ctx.shadowBlur = 0;
                drawDiamondPath(ctx, cx, cy, r - 4);
                ctx.stroke();
            } else if (isEnemy) {
                ctx.strokeStyle = '#EF4444';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
                ctx.shadowBlur = 4;
                drawDiamondPath(ctx, cx, cy, r);
                ctx.stroke();
            } else {
                ctx.strokeStyle = '#38BDF8';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
                ctx.shadowBlur = 4;
                drawDiamondPath(ctx, cx, cy, r);
                ctx.stroke();
            }

            // 5. Plural Enemy Letter (A, B, C)
            if (isEnemy && this._battler._plural && this._battler._letter) {
                ctx.save();
                this.contents.fontFace = 'BattleFont, sans-serif';
                this.contents.fontSize = 11;
                this.contents.fontBold = true;
                this.contents.outlineWidth = 2.5;
                this.contents.outlineColor = 'rgba(0,0,0,0.9)';
                this.changeTextColor('#FFFFFF');
                this.drawText(this._battler._letter, cx - 10, cy + r - 12, 20, 'center');
                ctx.restore();
            }

            ctx.restore();
        };

        // Smooth Destination X along Horizontal Diamond Rail
        Window_CTBIcon.prototype.updateDestinationX = function() {
            if (!this._battler || this._battler.isDead()) return;
            if (!BattleManager.ctbTurnOrder) return;
            var order = BattleManager.ctbTurnOrder();
            var index = order.indexOf(this._battler);
            if (index < 0) index = order.length + 5;

            var splitIdx = NUSV.OctoBattleHUD.getCTBSplitIndex();
            var rBig = 26;
            var rSmall = 17;
            var startX = 52; // Big diamond center

            var cx = startX;
            if (index > 0) {
                var rightTip0 = startX + rBig;
                cx = rightTip0 + rSmall + (index - 1) * (2 * rSmall);
                if (splitIdx > 0 && index >= splitIdx) {
                    cx += 42; // Gap for NEXT TURN header
                }
            }

            // Window center is at (36, 36)
            this._destinationX = Math.round(cx - 36);
        };

        Window_CTBIcon.prototype.destinationY = function() {
            var topCenterY = 40; // Rail height
            var y = topCenterY - 36;
            if (this._battler && this._battler.isSelected && this._battler.isSelected()) {
                y -= 6;
            }
            return y;
        };
    }

    //=============================================================================
    // Sprite_OctoCTBRail (Metallic Connecting Rail & "NEXT TURN" Banner)
    //=============================================================================
    function Sprite_OctoCTBRail() {
        this.initialize.apply(this, arguments);
    }
    Sprite_OctoCTBRail.prototype = Object.create(Sprite.prototype);
    Sprite_OctoCTBRail.prototype.constructor = Sprite_OctoCTBRail;

    Sprite_OctoCTBRail.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.boxWidth, 80);
        this.z = 0;
        this._lastOrderKey = '';
    };

    Sprite_OctoCTBRail.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!BattleManager.isCTB || !BattleManager.isCTB()) {
            this.visible = false;
            return;
        }
        if (BattleManager._victoryPhase || BattleManager._escaped) {
            this.visible = false;
            return;
        }
        this.visible = true;

        var order = BattleManager.ctbTurnOrder ? BattleManager.ctbTurnOrder() : [];
        var key = order.map(function(b) {
            return b ? (b.isActor() ? ('a' + b.actorId()) : ('e' + b.index())) : '';
        }).join(',');

        if (key !== this._lastOrderKey) {
            this._lastOrderKey = key;
            this.refreshRail(order);
        }
    };

    Sprite_OctoCTBRail.prototype.refreshRail = function(order) {
        this.bitmap.clear();
        if (!order || order.length === 0) return;

        var ctx = this.bitmap.context;
        ctx.save();

        var railY = 40;
        var startX = 22; // Left tip of big diamond
        var splitIdx = NUSV.OctoBattleHUD.getCTBSplitIndex();
        var rBig = 26;
        var rSmall = 17;

        var totalIcons = order.length;
        var lastIdx = totalIcons - 1;
        var lastCX = 52 + rBig + rSmall + (lastIdx - 1) * (2 * rSmall);
        if (splitIdx > 0 && lastIdx >= splitIdx) lastCX += 42;
        var endX = lastCX + rSmall + 16;

        // 1. Horizontal thin metallic rail
        ctx.beginPath();
        ctx.moveTo(startX, railY);
        ctx.lineTo(endX, railY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. "NEXT TURN" Header with chevron banner
        if (splitIdx > 0 && splitIdx < order.length) {
            var gapStartX = 52 + rBig + rSmall + (splitIdx - 1) * (2 * rSmall) - rSmall;
            var textX = gapStartX + 4;
            var textY = 16;

            this.bitmap.fontFace = 'BattleFont, sans-serif';
            this.bitmap.fontSize = 10;
            this.bitmap.fontBold = true;
            this.bitmap.textColor = '#94A3B8';
            this.bitmap.drawText('► NEXT TURN', textX, textY, 80, 16, 'left');
        }

        ctx.restore();
    };

    // Attach Rail Sprite to Scene_Battle
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        if (BattleManager.isCTB && BattleManager.isCTB()) {
            this._octoCTBRail = new Sprite_OctoCTBRail();
            this.addChild(this._octoCTBRail);
        }
    };

    //=============================================================================
    // Harmonized Sideview Actor Positioning (No Collisions with Top-Right Status HUD)
    //=============================================================================
    var _Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
    Sprite_Actor.prototype.setActorHome = function(index) {
        _Sprite_Actor_setActorHome.call(this, index);
        if ($gameSystem && $gameSystem.isSideView && $gameSystem.isSideView()) {
            var partySize = ($gameParty && typeof $gameParty.maxBattleMembers === 'function') ? $gameParty.maxBattleMembers() : 4;
            var baseY = 395; // Placed comfortably below Top-Right Status HUD (HUD ends at Y ≈ 275)
            var stepY = 46;
            var stepX = 32;
            var baseX = Graphics.boxWidth - 16 - (partySize + 2) * 32;
            this._homeX = baseX + (index * stepX);
            this._homeY = baseY + (index * stepY);
            if (this._actor && this._actor.setBattlePosition) {
                this._actor.setBattlePosition(this._homeX, this._homeY);
            }
        }
    };

    //=============================================================================
    // Window_PartyCommand (Tactical Octopath Obsidian Glass Styling)
    //=============================================================================
    var _Window_PartyCommand_initialize = Window_PartyCommand.prototype.initialize;
    Window_PartyCommand.prototype.initialize = function() {
        _Window_PartyCommand_initialize.call(this);
        this.width = NUSV.OctoBattleHUD.commandWidth;
        this.height = this.fittingHeight(this.numVisibleRows());
        this.opacity = 0; // Transparent frame, custom glass styling
        this.backOpacity = 0;
    };

    Window_PartyCommand.prototype.windowWidth = function() {
        return NUSV.OctoBattleHUD.commandWidth;
    };

    Window_PartyCommand.prototype.numVisibleRows = function() {
        return 4;
    };

    Window_PartyCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0); // Hide standard flashing white rectangle
    };

    var _Window_PartyCommand_select = Window_PartyCommand.prototype.select;
    Window_PartyCommand.prototype.select = function(index) {
        var oldIndex = this._index;
        _Window_PartyCommand_select.call(this, index);
        if (oldIndex !== index) {
            this.refresh();
        }
    };

    var _Window_PartyCommand_activate = Window_PartyCommand.prototype.activate;
    Window_PartyCommand.prototype.activate = function() {
        _Window_PartyCommand_activate.call(this);
        this.refresh();
    };

    var _Window_PartyCommand_deactivate = Window_PartyCommand.prototype.deactivate;
    Window_PartyCommand.prototype.deactivate = function() {
        _Window_PartyCommand_deactivate.call(this);
        this.refresh();
    };

    Window_PartyCommand.prototype.setup = function() {
        this.clearCommandList();
        this.makeCommandList();
        this.height = this.fittingHeight(Math.min(4, Math.max(2, this.maxItems())));
        if (!this.contents || this.contents.width !== this.contentsWidth() || this.contents.height !== this.contentsHeight()) {
            this.createContents();
        }
        this.refresh();
        this.select(0);
        if (NUSV.OctoBattleHUD.floatingCommand) {
            this.updateFloatingPosition();
        } else {
            this.x = 24;
            this.y = Graphics.boxHeight - this.height - 24;
        }
        this.activate();
        this.open();
    };

    Window_PartyCommand.prototype.updateFloatingPosition = function() {
        var leader = ($gameParty && $gameParty.battleMembers().length > 0) ? $gameParty.battleMembers()[0] : null;
        var targetX = Graphics.boxWidth * 0.70;
        var targetY = Graphics.boxHeight * 0.45;

        var sprite = null;
        var minSpriteX = 9999;
        if (BattleManager._spriteset && BattleManager._spriteset._actorSprites) {
            var sprites = BattleManager._spriteset._actorSprites;
            for (var i = 0; i < sprites.length; i++) {
                if (sprites[i]._battler) {
                    var sx = sprites[i].x;
                    if (sprites[i].parent) {
                        try {
                            sx = sprites[i].parent.toGlobal(new Point(sprites[i].x, sprites[i].y)).x;
                        } catch (e) {}
                    }
                    if (sx < minSpriteX) minSpriteX = sx;
                }
                if (sprites[i]._battler === leader) {
                    sprite = sprites[i];
                }
            }
        }

        if (sprite && sprite.parent) {
            try {
                var pos = sprite.parent.toGlobal(new Point(sprite.x, sprite.y));
                targetX = pos.x;
                targetY = pos.y;
            } catch (e) {
                targetX = sprite.x;
                targetY = sprite.y;
            }
        } else if (leader && typeof leader.spritePosX === 'function') {
            targetX = leader.spritePosX();
            targetY = leader.spritePosY();
        }

        // Float to the front/left of party leader (locked safely before all character sprites)
        var cmdX = targetX - this.width - 24;
        var cmdY = targetY - (this.height / 2);

        if (minSpriteX < 9000) {
            var safeRight = minSpriteX - this.width - 24;
            if (cmdX > safeRight) cmdX = safeRight;
        }

        var minX = 420;
        var maxX = Graphics.boxWidth - this.width - 20;
        var minY = 290; // Keep strictly clear of Top-Right Status HUD
        var maxY = Graphics.boxHeight - this.height - 20;

        this.x = Math.max(minX, Math.min(maxX, cmdX));
        this.y = Math.max(minY, Math.min(maxY, cmdY));
    };

    var _Window_PartyCommand_refresh = Window_PartyCommand.prototype.refresh;
    Window_PartyCommand.prototype.refresh = function() {
        if (!this.contents || this.contents.width !== this.contentsWidth() || this.contents.height !== this.contentsHeight()) {
            this.createContents();
        }
        if (_Window_PartyCommand_refresh) {
            _Window_PartyCommand_refresh.call(this);
        } else if (Window_Command.prototype.refresh) {
            Window_Command.prototype.refresh.call(this);
        }
        if (!this.contents) return;

        var ctx = this.contents.context;
        ctx.save();
        // Background Glass Box
        var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
        bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
        bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
        drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
        ctx.fillStyle = bg;
        ctx.fill();

        // Elegant Border
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Re-draw items on top of glass background
        this.drawAllItems();
    };

    Window_PartyCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        var isEnabled = this.isCommandEnabled(index);
        var isCur = (this.index() === index);
        var isActive = this.active;

        this.changePaintOpacity(isEnabled);

        var ctx = this.contents.context;
        ctx.save();

        if (isCur && isActive) {
            // Active Selection: Glowing cyan background pill & left vertical accent bar
            var glow = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.30)');
            glow.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
            drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
            ctx.fillStyle = glow;
            ctx.fill();

            // Left indicator bar
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(rect.x - 2, rect.y + 3, 3, rect.height - 6);
        } else if (isCur && !isActive) {
            // Parent command when deactivated
            var soft = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
            soft.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
            soft.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
            drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
            ctx.fillStyle = soft;
            ctx.fill();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.50)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();

        this.contents.fontFace = 'BattleFont, sans-serif';
        this.contents.fontSize = 15;
        this.contents.fontBold = isCur;

        if (isCur && isActive) {
            this.changeTextColor('#FFFFFF');
        } else if (isCur && !isActive) {
            this.changeTextColor('#E2E8F0');
        } else {
            this.changeTextColor(isActive ? '#94A3B8' : '#64748B');
        }

        var textX = isCur ? (rect.x + 6) : rect.x;
        var text = (isCur && isActive ? '► ' : '') + this.commandName(index);
        this.contents.drawText(text, textX, rect.y, rect.width - 6, rect.height, align);
    };

    //=============================================================================
    // Window_ActorCommand (Floating with Dynamic Octopath Selection Highlight)
    //=============================================================================
    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this);
        this.width = NUSV.OctoBattleHUD.commandWidth;
        this.height = this.fittingHeight(this.numVisibleRows());
        this.opacity = 0; // Transparent frame, custom glass styling
        this.backOpacity = 0;
    };

    Window_ActorCommand.prototype.windowWidth = function() {
        return NUSV.OctoBattleHUD.commandWidth;
    };

    Window_ActorCommand.prototype.numVisibleRows = function() {
        return 4;
    };

    Window_ActorCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0); // Hide standard flashing white rectangle
    };

    var _Window_ActorCommand_select = Window_ActorCommand.prototype.select;
    Window_ActorCommand.prototype.select = function(index) {
        var oldIndex = this._index;
        _Window_ActorCommand_select.call(this, index);
        if (oldIndex !== index) {
            this.refresh();
        }
    };

    var _Window_ActorCommand_activate = Window_ActorCommand.prototype.activate;
    Window_ActorCommand.prototype.activate = function() {
        _Window_ActorCommand_activate.call(this);
        if (NUSV.OctoBattleHUD.floatingCommand) {
            this.updateFloatingPosition();
        }
        this.refresh();
    };

    var _Window_ActorCommand_deactivate = Window_ActorCommand.prototype.deactivate;
    Window_ActorCommand.prototype.deactivate = function() {
        _Window_ActorCommand_deactivate.call(this);
        this.refresh();
    };

    Window_ActorCommand.prototype.setup = function(actor) {
        this._actor = actor;
        this.clearCommandList();
        this.makeCommandList();
        this.height = this.fittingHeight(Math.min(5, this.maxItems()));
        if (!this.contents || this.contents.width !== this.contentsWidth() || this.contents.height !== this.contentsHeight()) {
            this.createContents();
        }
        this.refresh();
        this.selectLast();
        this._isShifted = false;
        if (NUSV.OctoBattleHUD.floatingCommand) {
            this.updateFloatingPosition();
            if (this._normalX !== undefined) {
                this.x = this._normalX;
                this.y = this._normalY;
                this._targetX = this._normalX;
                this._targetY = this._normalY;
            }
        }
        this.activate();
        this.open();
    };

    Window_ActorCommand.prototype.updateFloatingPosition = function() {
        if (!this._actor) return;

        var targetX = Graphics.boxWidth * 0.70;
        var targetY = Graphics.boxHeight * 0.45;

        // Obtain battler sprite screen coordinate and leftmost sprite X
        var sprite = null;
        var minSpriteX = 9999;
        if (BattleManager._spriteset && BattleManager._spriteset._actorSprites) {
            var sprites = BattleManager._spriteset._actorSprites;
            for (var i = 0; i < sprites.length; i++) {
                if (sprites[i]._battler) {
                    var sx = sprites[i].x;
                    if (sprites[i].parent) {
                        try {
                            sx = sprites[i].parent.toGlobal(new Point(sprites[i].x, sprites[i].y)).x;
                        } catch (e) {}
                    }
                    if (sx < minSpriteX) minSpriteX = sx;
                }
                if (sprites[i]._battler === this._actor) {
                    sprite = sprites[i];
                }
            }
        }

        if (sprite && sprite.parent) {
            try {
                var pos = sprite.parent.toGlobal(new Point(sprite.x, sprite.y));
                targetX = pos.x;
                targetY = pos.y;
            } catch (e) {
                targetX = sprite.x;
                targetY = sprite.y;
            }
        } else if (this._actor.spritePosX) {
            targetX = this._actor.spritePosX();
            targetY = this._actor.spritePosY();
        }

        // Float to the front/left of actor (locked safely with generous clearance before character sprites)
        var cmdX = targetX - this.width - 64;
        var cmdY = targetY - (this.height / 2);

        // Crucial safety check: Ensure right edge of command window NEVER touches or overlaps ANY character sprite
        if (minSpriteX < 9000) {
            var safeRight = minSpriteX - this.width - 64;
            if (cmdX > safeRight) {
                cmdX = safeRight;
            }
        }

        // Screen boundary safety clamping
        var minX = 220; // Keep strictly clear of enemy space
        var maxX = Graphics.boxWidth - this.width - 20;
        var minY = 290; // Keep strictly clear of Top-Right Status HUD
        var maxY = Graphics.boxHeight - this.height - 20;

        this._normalX = Math.max(minX, Math.min(maxX, cmdX));
        this._normalY = Math.max(minY, Math.min(maxY, cmdY));

        if (!this._isShifted) {
            this._targetX = this._normalX;
            this._targetY = this._normalY;
            if (this.x === 0 || isNaN(this.x)) {
                this.x = this._normalX;
                this.y = this._normalY;
            }
        }
    };

    Window_ActorCommand.prototype.shiftToLeft = function(subWidth, gap) {
        this._isShifted = true;
        gap = (gap !== undefined) ? gap : 6;
        subWidth = subWidth || NUSV.OctoBattleHUD.subMenuWidth;

        var base = (this._normalX !== undefined) ? this._normalX : this.x;
        var shifted = base - (subWidth + gap);

        // Safety clamp so command window never leaves visible playfield
        var minLeft = 50;
        if (shifted < minLeft) {
            shifted = minLeft;
        }

        this._targetX = shifted;
        this._targetY = (this._normalY !== undefined) ? this._normalY : this.y;
    };

    Window_ActorCommand.prototype.restoreNormalPosition = function(instant) {
        this._isShifted = false;
        if (this._normalX !== undefined) {
            this._targetX = this._normalX;
            this._targetY = this._normalY;
            if (instant) {
                this.x = this._normalX;
                this.y = this._normalY;
            }
        }
    };

    var _Window_ActorCommand_update = Window_ActorCommand.prototype.update;
    Window_ActorCommand.prototype.update = function() {
        if (_Window_ActorCommand_update) _Window_ActorCommand_update.call(this);
        if (this._targetX !== undefined) {
            if (Math.abs(this.x - this._targetX) > 0.5) {
                this.x += (this._targetX - this.x) * 0.35;
            } else {
                this.x = this._targetX;
            }
        }
        if (this._targetY !== undefined) {
            if (Math.abs(this.y - this._targetY) > 0.5) {
                this.y += (this._targetY - this.y) * 0.35;
            } else {
                this.y = this._targetY;
            }
        }
    };

    // Custom Glass Rendering for Actor Command Window
    var _Window_ActorCommand_refresh = Window_ActorCommand.prototype.refresh;
    Window_ActorCommand.prototype.refresh = function() {
        if (!this.contents || this.contents.width !== this.contentsWidth() || this.contents.height !== this.contentsHeight()) {
            this.createContents();
        }
        if (_Window_ActorCommand_refresh) {
            _Window_ActorCommand_refresh.call(this);
        } else if (Window_Command.prototype.refresh) {
            Window_Command.prototype.refresh.call(this);
        }
        if (!this.contents) return;

        var ctx = this.contents.context;
        ctx.save();
        // Background Glass Box
        var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
        bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
        bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
        drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
        ctx.fillStyle = bg;
        ctx.fill();

        // Elegant Border
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Re-draw items on top of glass background
        this.drawAllItems();
    };

    // Dynamic selection highlight for command items (Octopath Style)
    Window_ActorCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        var isEnabled = this.isCommandEnabled(index);
        var isCur = (this.index() === index);
        var isActive = this.active;

        this.changePaintOpacity(isEnabled);

        var ctx = this.contents.context;
        ctx.save();

        if (isCur && isActive) {
            // Active Selection: Glowing cyan background pill & left vertical accent bar
            var glow = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.30)');
            glow.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
            drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
            ctx.fillStyle = glow;
            ctx.fill();

            // Left indicator bar
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(rect.x - 2, rect.y + 3, 3, rect.height - 6);
        } else if (isCur && !isActive) {
            // Parent chosen command while in sub-menu (e.g. Skill window is open)
            var soft = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
            soft.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
            soft.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
            drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
            ctx.fillStyle = soft;
            ctx.fill();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.50)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();

        this.contents.fontFace = 'BattleFont, sans-serif';
        this.contents.fontSize = 15;
        this.contents.fontBold = isCur;

        if (isCur && isActive) {
            this.changeTextColor('#FFFFFF');
        } else if (isCur && !isActive) {
            this.changeTextColor('#E2E8F0');
        } else {
            this.changeTextColor(isActive ? '#94A3B8' : '#64748B');
        }

        var textX = isCur ? (rect.x + 6) : rect.x;
        var text = (isCur && isActive ? '► ' : '') + this.commandName(index);
        this.contents.drawText(text, textX, rect.y, rect.width - 6, rect.height, align);
    };

    //=============================================================================
    // Compact Tactical Sub-Menus (Skill, Item, & Help Windows in Octopath Glass)
    //=============================================================================
    if (NUSV.OctoBattleHUD.compactSubMenus) {
        // --- 1. Suppress / Hide Help Window in Battle (per user instruction: no clunky clipped description window) ---
        var _Scene_Battle_createHelpWindow = Scene_Battle.prototype.createHelpWindow;
        Scene_Battle.prototype.createHelpWindow = function() {
            _Scene_Battle_createHelpWindow.call(this);
            if (this._helpWindow) {
                this._helpWindow.visible = false;
                this._helpWindow.opacity = 0;
                this._helpWindow.backOpacity = 0;
                this._helpWindow.y = -9999;
            }
        };

        var _Window_Help_show = Window_Help.prototype.show;
        Window_Help.prototype.show = function() {
            if ($gameParty && $gameParty.inBattle()) {
                this.visible = false;
                return;
            }
            if (_Window_Help_show) _Window_Help_show.call(this);
        };

        var _Window_Help_open = Window_Help.prototype.open;
        Window_Help.prototype.open = function() {
            if ($gameParty && $gameParty.inBattle()) {
                this.openness = 0;
                this.visible = false;
                return;
            }
            if (_Window_Help_open) _Window_Help_open.call(this);
        };

        var _Window_Help_refresh = Window_Help.prototype.refresh;
        Window_Help.prototype.refresh = function() {
            if ($gameParty && $gameParty.inBattle()) {
                if (this.contents) this.contents.clear();
                return;
            }
            if (_Window_Help_refresh) _Window_Help_refresh.call(this);
        };

        // --- 2. Window_BattleSkill Glass Styling ---
        var _Window_BattleSkill_initialize = Window_BattleSkill.prototype.initialize;
        Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
            _Window_BattleSkill_initialize.call(this, x, y, width, height);
            this.opacity = 0; // Transparent standard frame
            this.backOpacity = 0;
        };

        Window_BattleSkill.prototype.standardPadding = function() {
            return 12;
        };

        Window_BattleSkill.prototype.standardFontFace = function() {
            return 'BattleFont, sans-serif';
        };

        Window_BattleSkill.prototype.standardFontSize = function() {
            return 13;
        };

        Window_BattleSkill.prototype.costWidth = function() {
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 12;
            return Math.max(62, this.textWidth(' 999SP '));
        };

        Window_BattleSkill.prototype.maxCols = function() {
            return 1;
        };

        Window_BattleSkill.prototype.updateCursor = function() {
            this.setCursorRect(0, 0, 0, 0); // Hide default cursor sprite
        };

        var _Window_BattleSkill_select = Window_BattleSkill.prototype.select;
        Window_BattleSkill.prototype.select = function(index) {
            var oldIndex = this._index;
            _Window_BattleSkill_select.call(this, index);
            if (oldIndex !== index) {
                this.refresh();
            }
        };

        var _Window_BattleSkill_refresh = Window_BattleSkill.prototype.refresh;
        Window_BattleSkill.prototype.refresh = function() {
            _Window_BattleSkill_refresh.call(this);
            if (!this.contents) return;

            var ctx = this.contents.context;
            ctx.save();
            var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
            bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
            bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
            drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
            ctx.fillStyle = bg;
            ctx.fill();

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            this.drawAllItems();
        };

        Window_BattleSkill.prototype.drawTpCost = function(skill, wx, wy, dw) {
            if (!this._actor || this._actor.skillTpCost(skill) <= 0) return dw;
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 12;
            this.changeTextColor(this.textColor(Yanfly.Param.SCCTpTextColor || 29));
            var fmt = Yanfly.Param.SCCTpFormat || '%1%2';
            var text = fmt.format(Yanfly.Util.toGroup(this._actor.skillTpCost(skill)), TextManager.tpA);
            this.drawText(text, wx, wy, dw, 'right');
            var returnWidth = dw - this.textWidth(text) - (Yanfly.Param.SCCCostPadding || 4);
            this.resetFontSettings();
            return returnWidth;
        };

        Window_BattleSkill.prototype.drawMpCost = function(skill, wx, wy, dw) {
            if (!this._actor || this._actor.skillMpCost(skill) <= 0) return dw;
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 12;
            this.changeTextColor(this.textColor(Yanfly.Param.SCCMpTextColor || 23));
            var fmt = Yanfly.Param.SCCMpFormat || '%1%2';
            var text = fmt.format(Yanfly.Util.toGroup(this._actor.skillMpCost(skill)), TextManager.mpA);
            this.drawText(text, wx, wy, dw, 'right');
            var returnWidth = dw - this.textWidth(text) - (Yanfly.Param.SCCCostPadding || 4);
            this.resetFontSettings();
            return returnWidth;
        };

        Window_BattleSkill.prototype.drawItem = function(index) {
            var skill = this._data[index];
            if (!skill) return;
            var rect = this.itemRect(index);
            var isCur = (this.index() === index && this.active);

            var ctx = this.contents.context;
            ctx.save();
            if (isCur) {
                var glow = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
                glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
                glow.addColorStop(1, 'rgba(56, 189, 248, 0.06)');
                drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
                ctx.fillStyle = glow;
                ctx.fill();

                ctx.fillStyle = '#38BDF8';
                ctx.fillRect(rect.x - 2, rect.y + 3, 3, rect.height - 6);
            }
            ctx.restore();

            this.resetFontSettings();
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 13;
            var costWidth = this.costWidth();
            this.changePaintOpacity(this.isEnabled(skill));
            var textX = rect.x + (isCur ? 4 : 0);
            var textWidth = rect.width - costWidth - (isCur ? 4 : 0) - 4;
            this.drawItemName(skill, textX, rect.y, textWidth);
            this.drawSkillCost(skill, rect.x, rect.y, rect.width - 2);
            this.changePaintOpacity(1);
        };

        // --- 3. Window_BattleItem Glass Styling with Practical Filter Tabs (All, Healing, Battle, Key) ---
        var _Window_BattleItem_initialize = Window_BattleItem.prototype.initialize;
        Window_BattleItem.prototype.initialize = function(x, y, width, height) {
            _Window_BattleItem_initialize.call(this, x, y, width, height);
            this.opacity = 0; // Transparent standard frame
            this.backOpacity = 0;
            this._tabs = [
                { key: 'all', label: 'All' },
                { key: 'healing', label: 'Healing' },
                { key: 'battle', label: 'Battle' },
                { key: 'key', label: 'Key Item' }
            ];
            this._tabIndex = 0;
            this._category = 'all';
        };

        Window_BattleItem.getItemCategory = function(item) {
            if (!item) return 'none';
            if (item.itypeId === 2) return 'key';
            var note = (item.note || '').toLowerCase();
            if (note.includes('<nusv category: key item>') || note.includes('<item category: grimoire>')) {
                return 'key';
            }
            if (note.includes('recovery') || note.includes('revival') || note.includes('status cure') || note.includes('heal')) {
                return 'healing';
            }
            if (item.damage && (item.damage.type === 3 || item.damage.type === 4)) {
                return 'healing';
            }
            if (Array.isArray(item.effects)) {
                var isHeal = item.effects.some(function(eff) {
                    return eff.code === 11 || eff.code === 12 || eff.code === 13 || eff.code === 22;
                });
                if (isHeal) return 'healing';
            }
            return 'battle';
        };

        Window_BattleItem.prototype.includes = function(item) {
            if (!item) return false;
            if (this._category === 'key') {
                return Window_BattleItem.getItemCategory(item) === 'key';
            }
            if (!$gameParty.canUse(item)) return false;
            if (!this._category || this._category === 'all') {
                return true;
            }
            return Window_BattleItem.getItemCategory(item) === this._category;
        };

        Window_BattleItem.prototype.isEnabled = function(item) {
            return $gameParty.canUse(item);
        };

        Window_BattleItem.prototype.standardPadding = function() {
            return 12;
        };

        Window_BattleItem.prototype.standardFontFace = function() {
            return 'BattleFont, sans-serif';
        };

        Window_BattleItem.prototype.standardFontSize = function() {
            return 13;
        };

        Window_BattleItem.prototype.headerHeight = function() {
            return 28;
        };

        Window_BattleItem.prototype.itemHeight = function() {
            return 34;
        };

        Window_BattleItem.prototype.maxCols = function() {
            return 1;
        };

        Window_BattleItem.prototype.updateCursor = function() {
            this.setCursorRect(0, 0, 0, 0); // Hide default cursor sprite
        };

        Window_BattleItem.prototype.itemRect = function(index) {
            var rect = new Rectangle();
            var maxCols = this.maxCols();
            rect.width = this.itemWidth();
            rect.height = this.itemHeight();
            rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
            rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY + this.headerHeight();
            return rect;
        };

        Window_BattleItem.prototype.maxPageRows = function() {
            var pageHeight = this.height - this.padding * 2 - this.headerHeight();
            return Math.max(1, Math.floor(pageHeight / this.itemHeight()));
        };

        Window_BattleItem.prototype.setCategory = function(catKey) {
            if (this._category !== catKey) {
                this._category = catKey;
                for (var i = 0; i < this._tabs.length; i++) {
                    if (this._tabs[i].key === catKey) {
                        this._tabIndex = i;
                        break;
                    }
                }
                this.resetScroll();
                this._scrollY = 0;
                this.refresh();
                this.select(this._data && this._data.length > 0 ? 0 : -1);
            }
        };

        Window_BattleItem.prototype.nextCategory = function() {
            this._tabIndex = (this._tabIndex + 1) % this._tabs.length;
            if (typeof SoundManager !== 'undefined' && SoundManager.playCursor) {
                SoundManager.playCursor();
            }
            this.setCategory(this._tabs[this._tabIndex].key);
        };

        Window_BattleItem.prototype.prevCategory = function() {
            this._tabIndex = (this._tabIndex - 1 + this._tabs.length) % this._tabs.length;
            if (typeof SoundManager !== 'undefined' && SoundManager.playCursor) {
                SoundManager.playCursor();
            }
            this.setCategory(this._tabs[this._tabIndex].key);
        };

        Window_BattleItem.prototype.cursorRight = function(wrap) {
            this.nextCategory();
        };

        Window_BattleItem.prototype.cursorLeft = function(wrap) {
            this.prevCategory();
        };

        Window_BattleItem.prototype.processPagedown = function() {
            this.nextCategory();
        };

        Window_BattleItem.prototype.processPageup = function() {
            this.prevCategory();
        };

        var _Window_BattleItem_onTouch = Window_BattleItem.prototype.onTouch;
        Window_BattleItem.prototype.onTouch = function(triggered) {
            if (typeof TouchInput !== 'undefined' && TouchInput.isTriggered()) {
                var x = this.canvasToLocalX(TouchInput.x) - this.standardPadding();
                var y = this.canvasToLocalY(TouchInput.y) - this.standardPadding();
                if (y >= 0 && y <= this.headerHeight()) {
                    var numTabs = this._tabs.length;
                    var w = this.contents.width;
                    var tabSlotW = w / numTabs;
                    var clickedTab = Math.floor(x / tabSlotW);
                    if (clickedTab >= 0 && clickedTab < numTabs) {
                        this._tabIndex = clickedTab;
                        if (typeof SoundManager !== 'undefined' && SoundManager.playCursor) {
                            SoundManager.playCursor();
                        }
                        this.setCategory(this._tabs[clickedTab].key);
                        return;
                    }
                }
            }
            if (_Window_BattleItem_onTouch) {
                _Window_BattleItem_onTouch.call(this, triggered);
            }
        };

        var _Window_BattleItem_show = Window_BattleItem.prototype.show;
        Window_BattleItem.prototype.show = function() {
            if (!this._category) {
                this._category = 'all';
                this._tabIndex = 0;
            }
            if (_Window_BattleItem_show) {
                _Window_BattleItem_show.call(this);
            }
            if (this._data && this._data.length > 0) {
                this.select(0);
            } else {
                this.select(-1);
            }
        };

        var _Window_BattleItem_select = Window_BattleItem.prototype.select;
        Window_BattleItem.prototype.select = function(index) {
            var oldIndex = this._index;
            _Window_BattleItem_select.call(this, index);
            if (oldIndex !== index) {
                this.refresh();
            }
        };

        Window_BattleItem.prototype.drawHeaderTabs = function() {
            var ctx = this.contents.context;
            var w = this.contents.width;
            var numTabs = this._tabs.length;
            var gap = 4;
            var totalGaps = (numTabs - 1) * gap;
            var tabW = Math.floor((w - totalGaps) / numTabs);
            var tabH = 20;
            var tabY = 4;

            for (var i = 0; i < numTabs; i++) {
                var tab = this._tabs[i];
                var tabX = i * (tabW + gap);
                var isActive = (this._tabIndex === i);

                ctx.save();
                if (isActive) {
                    var tabGrad = ctx.createLinearGradient(tabX, tabY, tabX, tabY + tabH);
                    tabGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
                    tabGrad.addColorStop(1, 'rgba(14, 165, 233, 0.18)');
                    drawRoundedRect(ctx, tabX, tabY, tabW, tabH, 4);
                    ctx.fillStyle = tabGrad;
                    ctx.fill();

                    ctx.strokeStyle = '#38BDF8';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Glowing bottom accent indicator
                    ctx.fillStyle = '#38BDF8';
                    ctx.fillRect(tabX + Math.floor(tabW / 2) - 8, tabY + tabH - 2, 16, 2);
                } else {
                    drawRoundedRect(ctx, tabX, tabY, tabW, tabH, 4);
                    ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
                    ctx.fill();

                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                ctx.restore();

                this.contents.fontFace = 'BattleFont, sans-serif';
                this.contents.fontSize = 11;
                this.changeTextColor(isActive ? '#FFFFFF' : '#94A3B8');
                this.contents.drawText(tab.label, tabX, tabY - 1, tabW, tabH, 'center');
            }

            // Subtle divider line separating tab header from item rows
            ctx.save();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.20)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(4, this.headerHeight() - 1);
            ctx.lineTo(w - 4, this.headerHeight() - 1);
            ctx.stroke();
            ctx.restore();
            this.resetFontSettings();
        };

        var _Window_BattleItem_refresh = Window_BattleItem.prototype.refresh;
        Window_BattleItem.prototype.refresh = function() {
            if (this.makeItemList) {
                this.makeItemList();
            }
            _Window_BattleItem_refresh.call(this);
            if (!this.contents) return;

            var ctx = this.contents.context;
            ctx.save();
            var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
            bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
            bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
            drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
            ctx.fillStyle = bg;
            ctx.fill();

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            this.drawHeaderTabs();

            if (!this._data || this._data.length === 0) {
                this.contents.fontFace = 'BattleFont, sans-serif';
                this.contents.fontSize = 12;
                this.changeTextColor('#64748B');
                this.contents.drawText('(No Items)', 0, this.headerHeight() + 30, this.contents.width, 24, 'center');
                this.resetFontSettings();
                return;
            }

            this.drawAllItems();
        };

        Window_BattleItem.prototype.numberWidth = function() {
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 12;
            return Math.max(48, this.textWidth(' : 99 '));
        };

        Window_BattleItem.prototype.drawItemNumber = function(item, x, y, width) {
            if (this.needsNumber()) {
                this.contents.fontFace = 'BattleFont, sans-serif';
                this.contents.fontSize = 12;
                this.changeTextColor('#94A3B8');
                this.drawText('×', x, y, width - this.textWidth(' 99'), 'right');
                this.changeTextColor('#F8FAFC');
                this.drawText($gameParty.numItems(item), x, y, width, 'right');
                this.resetFontSettings();
            }
        };

        Window_BattleItem.prototype.drawItem = function(index) {
            var item = this._data[index];
            if (!item) return;
            var rect = this.itemRect(index);
            var isCur = (this.index() === index && this.active);

            var ctx = this.contents.context;
            ctx.save();
            if (isCur) {
                var glow = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
                glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
                glow.addColorStop(1, 'rgba(56, 189, 248, 0.06)');
                drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
                ctx.fillStyle = glow;
                ctx.fill();

                ctx.fillStyle = '#38BDF8';
                ctx.fillRect(rect.x - 2, rect.y + 3, 3, rect.height - 6);
            }
            ctx.restore();

            this.resetFontSettings();
            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 13;
            var numberWidth = this.numberWidth();
            this.changePaintOpacity(this.isEnabled(item));
            var textX = rect.x + (isCur ? 4 : 0);
            var textWidth = rect.width - numberWidth - (isCur ? 4 : 0) - 4;
            this.drawItemName(item, textX, rect.y, textWidth);
            this.drawItemNumber(item, rect.x, rect.y, rect.width - 2);
            this.changePaintOpacity(1);
        };

        // --- 4. Scene_Battle Layout Repositioning (Dynamic Slide Left + Right Sub-Menu) ---
        Scene_Battle.prototype.updateSubMenuPosition = function(menuWin) {
            var sw = NUSV.OctoBattleHUD.subMenuWidth;
            var sh = NUSV.OctoBattleHUD.subMenuHeight;
            var gap = 6;

            // When opening sub-menu (skill/item), shift initial menu (Actor Command) to the left!
            if (this._actorCommandWindow) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.deactivate();
                this._actorCommandWindow.shiftToLeft(sw, gap);

                var targetSubX = this._actorCommandWindow._targetX + this._actorCommandWindow.width + gap;
                var targetSubY = this._actorCommandWindow._targetY + Math.floor((this._actorCommandWindow.height - sh) / 2);
                targetSubY = Math.max(48, Math.min(Graphics.boxHeight - sh - 20, targetSubY));

                menuWin.x = targetSubX;
                menuWin.y = targetSubY;
            } else {
                menuWin.x = 430;
                menuWin.y = Graphics.boxHeight - sh - 20;
            }

            menuWin.width = sw;
            menuWin.height = sh;
            menuWin.opacity = 0;
            menuWin.backOpacity = 0;
            if (!menuWin.contents || menuWin.contents.width !== menuWin.contentsWidth() || menuWin.contents.height !== menuWin.contentsHeight()) {
                menuWin.createContents();
            }
            menuWin.refresh();

            // Suppress / hide description window completely
            if (this._helpWindow) {
                this._helpWindow.hide();
                this._helpWindow.visible = false;
                this._helpWindow.y = -9999;
            }
        };

        var _Scene_Battle_createSkillWindow = Scene_Battle.prototype.createSkillWindow;
        Scene_Battle.prototype.createSkillWindow = function() {
            _Scene_Battle_createSkillWindow.call(this);
            this.updateSubMenuPosition(this._skillWindow);
            this._skillWindow.hide();
        };

        var _Scene_Battle_createItemWindow = Scene_Battle.prototype.createItemWindow;
        Scene_Battle.prototype.createItemWindow = function() {
            _Scene_Battle_createItemWindow.call(this);
            this.updateSubMenuPosition(this._itemWindow);
            this._itemWindow.hide();
        };

        // When entering Skill or Item selection, keep Actor Command visible and smoothly shift left
        var _Scene_Battle_commandSkill = Scene_Battle.prototype.commandSkill;
        Scene_Battle.prototype.commandSkill = function() {
            this.updateSubMenuPosition(this._skillWindow);
            _Scene_Battle_commandSkill.call(this);
        };

        var _Scene_Battle_commandItem = Scene_Battle.prototype.commandItem;
        Scene_Battle.prototype.commandItem = function() {
            this.updateSubMenuPosition(this._itemWindow);
            _Scene_Battle_commandItem.call(this);
        };

        var _Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
        Scene_Battle.prototype.commandAttack = function() {
            if (this._actorCommandWindow) {
                this._actorCommandWindow.hide();
                this._actorCommandWindow.deactivate();
            }
            if (_Scene_Battle_commandAttack) _Scene_Battle_commandAttack.call(this);
        };

        // When canceling Skill or Item, smoothly restore Actor Command beside the character
        var _Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
        Scene_Battle.prototype.onSkillCancel = function() {
            if (_Scene_Battle_onSkillCancel) {
                _Scene_Battle_onSkillCancel.call(this);
            } else {
                this._skillWindow.hide();
            }
            if (this._helpWindow) this._helpWindow.hide();
            if (this._actorCommandWindow) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.activate();
                this._actorCommandWindow.restoreNormalPosition();
            }
        };

        var _Scene_Battle_onItemCancel = Scene_Battle.prototype.onItemCancel;
        Scene_Battle.prototype.onItemCancel = function() {
            if (_Scene_Battle_onItemCancel) {
                _Scene_Battle_onItemCancel.call(this);
            } else {
                this._itemWindow.hide();
            }
            if (this._helpWindow) this._helpWindow.hide();
            if (this._actorCommandWindow) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.activate();
                this._actorCommandWindow.restoreNormalPosition();
            }
        };

        var _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
        Scene_Battle.prototype.onEnemyCancel = function() {
            if (_Scene_Battle_onEnemyCancel) _Scene_Battle_onEnemyCancel.call(this);
            if (this._helpWindow) this._helpWindow.hide();
            if (this._skillWindow && this._skillWindow.active) {
                this._skillWindow.show();
                if (this._actorCommandWindow) {
                    this._actorCommandWindow.show();
                    this._actorCommandWindow.deactivate();
                    this._actorCommandWindow.shiftToLeft(NUSV.OctoBattleHUD.subMenuWidth, 6);
                }
            } else if (this._itemWindow && this._itemWindow.active) {
                this._itemWindow.show();
                if (this._actorCommandWindow) {
                    this._actorCommandWindow.show();
                    this._actorCommandWindow.deactivate();
                    this._actorCommandWindow.shiftToLeft(NUSV.OctoBattleHUD.subMenuWidth, 6);
                }
            } else if (this._actorCommandWindow && this._actorCommandWindow.active) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.restoreNormalPosition();
            }
        };

        var _Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
        Scene_Battle.prototype.onActorCancel = function() {
            if (_Scene_Battle_onActorCancel) _Scene_Battle_onActorCancel.call(this);
            if (this._helpWindow) this._helpWindow.hide();
            if (this._skillWindow && this._skillWindow.active) {
                this._skillWindow.show();
                if (this._actorCommandWindow) {
                    this._actorCommandWindow.show();
                    this._actorCommandWindow.deactivate();
                    this._actorCommandWindow.shiftToLeft(NUSV.OctoBattleHUD.subMenuWidth, 6);
                }
            } else if (this._itemWindow && this._itemWindow.active) {
                this._itemWindow.show();
                if (this._actorCommandWindow) {
                    this._actorCommandWindow.show();
                    this._actorCommandWindow.deactivate();
                    this._actorCommandWindow.shiftToLeft(NUSV.OctoBattleHUD.subMenuWidth, 6);
                }
            } else if (this._actorCommandWindow && this._actorCommandWindow.active) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.restoreNormalPosition();
            }
        };

        var _Scene_Battle_onSkillOk = Scene_Battle.prototype.onSkillOk;
        Scene_Battle.prototype.onSkillOk = function() {
            if (this._helpWindow) this._helpWindow.hide();
            if (_Scene_Battle_onSkillOk) _Scene_Battle_onSkillOk.call(this);
        };

        var _Scene_Battle_onItemOk = Scene_Battle.prototype.onItemOk;
        Scene_Battle.prototype.onItemOk = function() {
            if (this._helpWindow) this._helpWindow.hide();
            if (_Scene_Battle_onItemOk) _Scene_Battle_onItemOk.call(this);
        };

        var _Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
        Scene_Battle.prototype.startActorCommandSelection = function() {
            if (_Scene_Battle_startActorCommandSelection) _Scene_Battle_startActorCommandSelection.call(this);
            if (this._skillWindow) this._skillWindow.hide();
            if (this._itemWindow) this._itemWindow.hide();
            if (this._helpWindow) this._helpWindow.hide();
            if (this._actorCommandWindow) {
                this._actorCommandWindow.restoreNormalPosition(true);
                this._actorCommandWindow.show();
                this._actorCommandWindow.activate();
            }
        };

        // --- 4. Window_BattleEnemy Glass Styling (Target Window fallback) ---
        var _Window_BattleEnemy_initialize = Window_BattleEnemy.prototype.initialize;
        Window_BattleEnemy.prototype.initialize = function(x, y) {
            _Window_BattleEnemy_initialize.call(this, x, y);
            this.opacity = 0;
        };

        Window_BattleEnemy.prototype.updateCursor = function() {
            this.setCursorRect(0, 0, 0, 0);
        };

        var _Window_BattleEnemy_select = Window_BattleEnemy.prototype.select;
        Window_BattleEnemy.prototype.select = function(index) {
            var oldIndex = this._index;
            _Window_BattleEnemy_select.call(this, index);
            if (oldIndex !== index) this.refresh();
        };

        var _Window_BattleEnemy_refresh = Window_BattleEnemy.prototype.refresh;
        Window_BattleEnemy.prototype.refresh = function() {
            _Window_BattleEnemy_refresh.call(this);
            if (!this.contents) return;

            var ctx = this.contents.context;
            ctx.save();
            var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
            bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
            bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
            drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
            ctx.fillStyle = bg;
            ctx.fill();

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            this.drawAllItems();
        };

        Window_BattleEnemy.prototype.drawItem = function(index) {
            this.resetTextColor();
            var name = (this._enemies && this._enemies[index]) ? this._enemies[index].name() : '';
            var rect = this.itemRectForText(index);
            var isCur = (this.index() === index);
            var isActive = this.active;

            var ctx = this.contents.context;
            ctx.save();
            if (isCur && isActive) {
                var glow = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
                glow.addColorStop(0, 'rgba(239, 68, 68, 0.30)');
                glow.addColorStop(1, 'rgba(239, 68, 68, 0.08)');
                drawRoundedRect(ctx, rect.x - 2, rect.y + 1, rect.width + 4, rect.height - 2, 4);
                ctx.fillStyle = glow;
                ctx.fill();

                ctx.fillStyle = '#EF4444';
                ctx.fillRect(rect.x - 2, rect.y + 3, 3, rect.height - 6);
            }
            ctx.restore();

            this.contents.fontFace = 'BattleFont, sans-serif';
            this.contents.fontSize = 15;
            this.contents.fontBold = isCur;
            this.changeTextColor(isCur ? '#FFFFFF' : '#E2E8F0');
            var textX = isCur ? (rect.x + 6) : rect.x;
            var text = (isCur && isActive ? '► ' : '') + name;
            this.contents.drawText(text, textX, rect.y, rect.width - 6, rect.height, 'left');
        };

        // --- 5. Formation Window Obsidian Glass Styling (from NUSV_PartySystem) ---
        var _Scene_Battle_createAllWindows_OctoFormation = Scene_Battle.prototype.createAllWindows;
        Scene_Battle.prototype.createAllWindows = function() {
            _Scene_Battle_createAllWindows_OctoFormation.call(this);
            if (this._nusvFormationWindow) {
                var win = this._nusvFormationWindow;
                win.opacity = 0;
                win.updateCursor = function() { this.setCursorRect(0, 0, 0, 0); };
                var _orig_f_refresh = win.refresh;
                win.refresh = function() {
                    _orig_f_refresh.call(this);
                    if (!this.contents) return;
                    var ctx = this.contents.context;
                    ctx.save();
                    var bg = ctx.createLinearGradient(0, 0, this.contents.width, this.contents.height);
                    bg.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
                    bg.addColorStop(1, 'rgba(10, 15, 28, 0.90)');
                    drawRoundedRect(ctx, 0, 0, this.contents.width, this.contents.height, 8);
                    ctx.fillStyle = bg;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.restore();
                    this.drawAllItems();
                };
            }
        };
    }

    //=============================================================================
    // Helper: Draw Pointed Metallic Shield Path
    //=============================================================================
    function drawShieldPath(ctx, x, y, w, h) {
        var r = 5;
        var tipY = y + h;
        var midX = x + w / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        if (ctx.quadraticCurveTo) {
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h * 0.58);
            ctx.quadraticCurveTo(x + w * 0.9, y + h * 0.82, midX, tipY);
            ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.82, x, y + h * 0.58);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
        } else {
            ctx.lineTo(x + w, y);
            ctx.lineTo(x + w, y + h * 0.6);
            ctx.lineTo(midX, tipY);
            ctx.lineTo(x, y + h * 0.6);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    //=============================================================================
    // Sprite_EnemyOctoStatus (Nusvanir Under-Enemy Status UI)
    // - Line 1: Enemy Name (Replaces "VULNERABLE", glows gold when targeted)
    // - Line 2: Active States / Debuffs (Only shown if enemy is afflicted)
    // - Line 3: Ultra-Slim HP Gauge
    // - Left Badge: Optional Metallic Shield indicating Enemy Level
    //=============================================================================
    function Sprite_EnemyOctoStatus() {
        this.initialize.apply(this, arguments);
    }
    Sprite_EnemyOctoStatus.prototype = Object.create(Sprite.prototype);
    Sprite_EnemyOctoStatus.prototype.constructor = Sprite_EnemyOctoStatus;
    NUSV.OctoBattleHUD.Sprite_EnemyOctoStatus = Sprite_EnemyOctoStatus;

    Sprite_EnemyOctoStatus.prototype.initialize = function(enemySprite) {
        if (Sprite.prototype.initialize) {
            Sprite.prototype.initialize.call(this);
        }
        this._enemySprite = enemySprite;
        this._enemy = enemySprite ? enemySprite._enemy : null;
        this.bitmap = new Bitmap(220, 56);
        this.z = 10;
        this.opacity = 255;

        this._cachedLevel = -1;
        this._cachedHp = -1;
        this._cachedSelected = null;
        this._cachedIconKey = '';

        this.refresh();
    };

    Sprite_EnemyOctoStatus.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this._enemySprite || !this._enemySprite._enemy) {
            this.visible = false;
            return;
        }
        this._enemy = this._enemySprite._enemy;

        this.updatePosition();
        this.updateVisibility();
        this.updateDirtyState();
    };

    Sprite_EnemyOctoStatus.prototype.updatePosition = function() {
        var bx = this._enemySprite.x;
        var by = this._enemySprite.y;
        this.x = Math.round(bx + NUSV.OctoBattleHUD.enemyStatusOffsetX);
        this.y = Math.round(by + NUSV.OctoBattleHUD.enemyStatusOffsetY);
    };

    Sprite_EnemyOctoStatus.prototype.updateVisibility = function() {
        if (!this._enemy || this._enemy.isDead() || this._enemy.isHidden() || BattleManager._victoryPhase) {
            this.opacity = Math.max(0, this.opacity - 20);
            if (this.opacity <= 0) this.visible = false;
        } else {
            this.visible = true;
            this.opacity = Math.min(255, this.opacity + 25);
        }
    };

    Sprite_EnemyOctoStatus.prototype.updateDirtyState = function() {
        if (!this._enemy) return;

        var curHp = this._enemy.hp;
        var curSelected = (this._enemy.isSelected && this._enemy.isSelected());
        var curLvl = (typeof this._enemy.nusvEnemyLevel === 'function') ? this._enemy.nusvEnemyLevel() : (this._enemy.level || 1);
        var icons = this._enemy.allIcons ? this._enemy.allIcons() : [];
        var iconKey = icons.join(',');

        if (this._enemy._octoNeedRedraw ||
            curHp !== this._cachedHp ||
            curSelected !== this._cachedSelected ||
            curLvl !== this._cachedLevel ||
            iconKey !== this._cachedIconKey) {

            this._enemy._octoNeedRedraw = false;
            this._cachedHp = curHp;
            this._cachedSelected = curSelected;
            this._cachedLevel = curLvl;
            this._cachedIconKey = iconKey;

            this.refresh();
        }
    };

    Sprite_EnemyOctoStatus.prototype.refresh = function() {
        this.bitmap.clear();
        if (!this._enemy) return;

        var ctx = this.bitmap.context;
        ctx.save();

        var enemy = this._enemy;
        var isSelected = (enemy.isSelected && enemy.isSelected());
        var hasShield = (NUSV.OctoBattleHUD.shieldMode === 'level');

        // 1. Optional Shield Emblem (Enemy Level Badge)
        var contentX = 4;
        if (hasShield) {
            var sx = 4;
            var sy = 2;
            var sw = 24;
            var sh = 30;

            drawShieldPath(ctx, sx, sy, sw, sh);
            var shieldGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
            shieldGrad.addColorStop(0, '#2563EB');
            shieldGrad.addColorStop(1, '#1E3A8A');
            ctx.fillStyle = shieldGrad;
            ctx.fill();

            // Glowing Shield Border
            ctx.lineWidth = 1.5;
            if (isSelected) {
                ctx.strokeStyle = '#67E8F9';
                ctx.shadowColor = '#38BDF8';
                ctx.shadowBlur = 6;
            } else {
                ctx.strokeStyle = '#93C5FD';
                ctx.shadowColor = '#60A5FA';
                ctx.shadowBlur = 3;
            }
            ctx.stroke();

            // Inner Shield Inset Line
            drawShieldPath(ctx, sx + 2, sy + 2, sw - 4, sh - 4);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.shadowBlur = 0;
            ctx.stroke();

            ctx.restore();

            // Enemy Level Number Inside Shield
            var enemyLvl = (typeof enemy.nusvEnemyLevel === 'function') ? enemy.nusvEnemyLevel() : (enemy.level || 1);
            this.bitmap.fontFace = 'BattleFont, sans-serif';
            this.bitmap.fontSize = 12;
            this.bitmap.fontBold = true;
            this.bitmap.textColor = '#FFFFFF';
            this.bitmap.outlineColor = '#0F172A';
            this.bitmap.outlineWidth = 2.5;
            this.bitmap.drawText(String(enemyLvl), sx, sy + 3, sw, 20, 'center');

            contentX = sx + sw + 7;
        } else {
            ctx.restore();
        }

        // 2. Enemy Name (Replaces "VULNERABLE")
        var nameY = 2;
        var nameText = (isSelected ? '► ' : '') + enemy.name();
        this.bitmap.fontFace = 'BattleFont, sans-serif';
        this.bitmap.fontSize = 13;
        this.bitmap.fontBold = true;
        this.bitmap.textColor = isSelected ? '#FDE047' : '#F1F5F9';
        this.bitmap.outlineColor = 'rgba(10, 15, 26, 0.95)';
        this.bitmap.outlineWidth = 3;
        this.bitmap.drawText(nameText, contentX, nameY, 170, 16, 'left');

        // 3. Active States / Status Debuffs (Only rendered if afflicted)
        var icons = enemy.allIcons ? enemy.allIcons() : [];
        var hasStates = (icons.length > 0);
        var hpY = nameY + 20;

        if (hasStates) {
            var stateY = nameY + 18;
            var boxSize = 20;
            var boxGap = 4;
            var iconBitmap = ImageManager.loadSystem('IconSet');
            var maxIcons = Math.min(6, icons.length);

            for (var i = 0; i < maxIcons; i++) {
                var iconIdx = icons[i];
                var bx = contentX + i * (boxSize + boxGap);

                ctx.save();
                // Rounded Obsidian Glass Slot
                drawRoundedRect(ctx, bx, stateY, boxSize, boxSize, 3);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.fill();

                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
                ctx.stroke();
                ctx.restore();

                // Draw Active State Icon from IconSet
                if (iconBitmap && iconBitmap.width > 0) {
                    var sxIcon = (iconIdx % 16) * 32;
                    var syIcon = Math.floor(iconIdx / 16) * 32;
                    this.bitmap.blt(iconBitmap, sxIcon, syIcon, 32, 32, bx + 2, stateY + 2, 16, 16);
                } else if (iconBitmap) {
                    iconBitmap.addLoadListener(this.refresh.bind(this));
                }
            }

            hpY = stateY + boxSize + 4;
        }

        // 4. Ultra-Slim Modern HP Gauge Bar
        var barW = 100;
        var barH = 3;
        var hpRate = enemy.hpRate();

        ctx.save();
        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        drawRoundedRect(ctx, contentX, hpY, barW, barH, 1.5);
        ctx.fill();

        // Fill
        var fillW = Math.max(0, Math.floor(barW * hpRate));
        if (fillW > 0) {
            ctx.fillStyle = hpRate > 0.5 ? '#10B981' : (hpRate > 0.25 ? '#F59E0B' : '#EF4444');
            drawRoundedRect(ctx, contentX, hpY, fillW, barH, 1.5);
            ctx.fill();
        }
        ctx.restore();
    };

    //=============================================================================
    // Spriteset_Battle Integration (Attach Status Sprites to _battleField)
    //=============================================================================
    var _Spriteset_Battle_createEnemies = Spriteset_Battle.prototype.createEnemies;
    Spriteset_Battle.prototype.createEnemies = function() {
        _Spriteset_Battle_createEnemies.call(this);
        if (NUSV.OctoBattleHUD.showEnemyStatus) {
            this.createOctoEnemyStatusSprites();
        }
    };

    Spriteset_Battle.prototype.createOctoEnemyStatusSprites = function() {
        this._octoEnemyStatusSprites = [];
        if (!this._enemySprites || !this._battleField) return;
        for (var i = 0; i < this._enemySprites.length; i++) {
            var enemySprite = this._enemySprites[i];
            if (!enemySprite) continue;
            var statusSprite = new Sprite_EnemyOctoStatus(enemySprite);
            this._octoEnemyStatusSprites.push(statusSprite);
            this._battleField.addChild(statusSprite);
        }
    };

    // Optional: Suppress redundant overhead Visual Select nameplate
    if (NUSV.OctoBattleHUD.hideOverheadName && typeof Window_EnemyVisualSelect !== 'undefined') {
        Window_EnemyVisualSelect.prototype.refresh = function() {
            this.contents.clear();
        };
    }

})();
