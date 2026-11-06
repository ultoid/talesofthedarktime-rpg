//=============================================================================
// NUSV_ProjectileEngine.js
//=============================================================================

/*:
 * @plugindesc v1.0.0 Universal Flying Projectile Engine for RPG Maker MV Action Sequences
 * @author Nusvanir Dev Team
 *
 * @help
 * ============================================================================
 * NUSV Projectile Engine — Universal Flying Projectiles
 * ============================================================================
 * This plugin provides a high-fidelity, extensible flying projectile engine
 * fully integrated into Yanfly Action Sequences (YEP_BattleEngineCore and
 * ActSeqPacks 1, 2, 3) and the NUSV Modular 6-Phase Event-Command Studio.
 *
 * It allows physical arrows, throwing weapons, magical bolts, and elemental
 * projectiles to visually fly across screen coordinates from source battlers
 * to destination targets along configurable parabolic arcs or direct vectors.
 *
 * ============================================================================
 * Action Sequence Syntax Cheat Sheet
 * ============================================================================
 *
 * 1. Automatic Weapon Projectile (detects weapon type & elemental traits):
 *    projectile weapon: start user, goal target, duration 16, arc 35
 *    projectile weapon: target, 16, 35
 *
 * 2. Database Animation Flying Projectile:
 *    projectile animation [id]: start user, goal target, duration 18, arc 25
 *    projectile animation 15: start user, goal target, duration 20, arc 15, impact 1
 *
 * 3. Icon Flying Projectile (IconSet.png, with auto-tangent rotation or spin):
 *    projectile icon [iconIndex]: start user, goal target, duration 16, arc 30, rotate
 *    projectile icon 161: start user, goal target, duration 14, arc 20, rotate, impact 4
 *    projectile icon 165: start user, goal target, duration 14, arc 10, spin 20
 *
 * 4. Waiting for Projectiles to Arrive:
 *    wait for projectile
 *    (Pauses sequence execution until all active missiles have landed on target)
 *
 * ============================================================================
 * Supported Argument Parameters (Key-Value or Shorthand):
 * ============================================================================
 * - start [user / target / screen / X Y]: Starting position (default: user)
 * - start offset [X Y]: Start pixel offset (e.g. start offset 20 -10)
 * - goal [target / user / screen / X Y]: Destination position (default: target)
 * - goal offset [X Y]: Goal pixel offset (e.g. goal offset 0 -20)
 * - duration [frames]: Flight travel duration in frames (default: 16)
 * - arc [pixels]: Parabolic arc height (default: 25, 0 = direct flat laser)
 * - rotate [true/false]: Automatically orient along flight trajectory tangent
 * - angle [degrees]: Rotation angle offset in degrees (default: 45 for MV icons)
 * - spin [degrees]: Continuous rotation speed in degrees per frame
 * - scale [multiplier]: Projectile visual scale (default: 1.0)
 * - impact [animationId]: Database animation ID to play on target on hit
 * - delay [frames]: Frames before projectile starts flying
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ProjectileEngine = true;

var NUSV = NUSV || {};
NUSV.Projectile = NUSV.Projectile || {};

(function () {
    'use strict';

    //=============================================================================
    // 1. Elemental & Weapon Trait Resolvers
    //=============================================================================

    // Animation mapping by RPG Maker MV Element ID:
    // 1: Neutral, 2: Fire, 3: Water, 4: Earth, 5: Air, 6: Electric, 7: Ice,
    // 8: Steel, 9: Sound, 10: Holy, 11: Dark
    NUSV.Projectile.ELEMENT_ANIMATIONS = {
        1: 56,  // Pix - Arcane Missiles Bolt
        2: 15,  // Pix - Fireball
        3: 28,  // Pix - Water Jet
        4: 31,  // Pix - Stone Spire
        5: 34,  // Pix - Emerald Gale Tornado
        6: 27,  // Pix - Plasma Ball
        7: 21,  // Pix - Ice Lance
        8: 4,   // Pix - Arrow Shot
        9: 11,  // Pix - Chi Shockwave
        10: 40, // Pix - Holy Smite
        11: 44  // Pix - Void Dark Orb
    };

    NUSV.Projectile.getWeaponElement = function (user, action) {
        if (!user) return 1;

        // 1. Explicit skill element
        if (action && action.item() && action.item().damage && action.item().damage.elementId > 0) {
            return action.item().damage.elementId;
        }

        // 2. Equipped weapon attack element trait (code 31)
        if (user.traitsWithId) {
            var traits = user.traitsWithId(Game_BattlerBase.TRAIT_ATTACK_ELEMENT, null);
            if (traits && traits.length > 0) {
                return traits[0].dataId;
            }
        }

        // 3. Inspect weapon items
        if (user.weapons) {
            var weapons = user.weapons();
            for (var i = 0; i < weapons.length; i++) {
                var w = weapons[i];
                if (!w || !w.traits) continue;
                for (var j = 0; j < w.traits.length; j++) {
                    if (w.traits[j].code === Game_BattlerBase.TRAIT_ATTACK_ELEMENT) {
                        return w.traits[j].dataId;
                    }
                }
            }
        }

        return 1; // Default to Neutral (Arcane)
    };

    //=============================================================================
    // 2. Trajectory Coordinate Helpers
    //=============================================================================

    function resolveBattlerScreenPos(battler, isGoal) {
        if (!battler) {
            return {
                x: Graphics.boxWidth / 2,
                y: Graphics.boxHeight / 2
            };
        }

        var x = (typeof battler.spritePosX === 'function') ? battler.spritePosX() : (battler._homeX || battler.x || 0);
        var y = (typeof battler.spritePosY === 'function') ? battler.spritePosY() : (battler._homeY || battler.y || 0);

        var isActor = battler.isActor ? battler.isActor() : false;
        var h = (typeof battler.spriteHeight === 'function') ? battler.spriteHeight() : (isActor ? 64 : 80);
        if (h <= 0) h = isActor ? 64 : 80;

        // Center on torso / chest
        var centerY = y - (h * 0.45);

        // User hand / weapon release point offset
        if (!isGoal) {
            if (isActor) {
                x -= 16; // Actors face left in sideview
            } else {
                x += 16; // Enemies face right
            }
        }

        return { x: Math.round(x), y: Math.round(centerY) };
    }

    //=============================================================================
    // 3. Sprite_ProjectileIcon (Icon-Based Missile: Arrows, Bolts, Daggers, Throwing Stars)
    //=============================================================================

    function Sprite_ProjectileIcon() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ProjectileIcon.prototype = Object.create(Sprite_Base.prototype);
    Sprite_ProjectileIcon.prototype.constructor = Sprite_ProjectileIcon;

    Sprite_ProjectileIcon.prototype.initialize = function (opts) {
        Sprite_Base.prototype.initialize.call(this);
        this._opts = opts || {};
        this._startX = opts.startX || 0;
        this._startY = opts.startY || 0;
        this._goalX = opts.goalX || 0;
        this._goalY = opts.goalY || 0;
        this._travelDuration = Math.max(1, opts.duration || 16);
        this._arc = (opts.arc !== undefined) ? opts.arc : 25;
        this._rotate = !!opts.rotate;
        this._angleOffset = (opts.angle !== undefined) ? (opts.angle * Math.PI / 180) : (Math.PI / 4); // 45 deg default for MV icons
        this._spin = (opts.spin !== undefined) ? (opts.spin * Math.PI / 180) : 0;
        this._scale = (opts.scale !== undefined) ? opts.scale : 1.0;
        this._impactAnim = opts.impact || 0;
        this._targetBattler = opts.targetBattler || null;
        this._delay = Math.max(0, opts.delay || 0);
        this._elapsed = 0;
        this._finished = false;
        this.z = 8; // Render above battlers

        this.setupIcon(opts.iconIndex || 161);
        this.updatePosition();
    };

    Sprite_ProjectileIcon.prototype.setupIcon = function (iconIndex) {
        this.bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth || 32;
        var ph = Window_Base._iconHeight || 32;
        var sx = (iconIndex % 16) * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.setFrame(sx, sy, pw, ph);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.scale.x = this._scale;
        this.scale.y = this._scale;
    };

    Sprite_ProjectileIcon.prototype.isFinished = function () {
        return this._finished;
    };

    Sprite_ProjectileIcon.prototype.update = function () {
        Sprite_Base.prototype.update.call(this);

        if (this._finished) return;

        if (this._delay > 0) {
            this._delay--;
            this.visible = false;
            return;
        }

        this.visible = true;
        this._elapsed++;

        this.updatePosition();

        if (this._elapsed >= this._travelDuration) {
            this.onArrival();
        }
    };

    Sprite_ProjectileIcon.prototype.updatePosition = function () {
        var p = Math.min(1.0, this._elapsed / this._travelDuration);

        // Parabolic trajectory
        var curX = this._startX + (this._goalX - this._startX) * p;
        var curY = this._startY + (this._goalY - this._startY) * p - (this._arc * 4 * p * (1 - p));

        this.x = curX;
        this.y = curY;

        // Rotation
        if (this._rotate) {
            var dx = this._goalX - this._startX;
            var dy = (this._goalY - this._startY) - (this._arc * 4 * (1 - 2 * p));
            this.rotation = Math.atan2(dy, dx) + this._angleOffset;
        } else if (this._spin !== 0) {
            this.rotation += this._spin;
        }
    };

    Sprite_ProjectileIcon.prototype.onArrival = function () {
        this._finished = true;
        this.visible = false;

        // Trigger impact animation on destination target
        if (this._impactAnim > 0 && this._targetBattler && typeof this._targetBattler.startAnimation === 'function') {
            this._targetBattler.startAnimation(this._impactAnim, false, 0);
        }

        if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    //=============================================================================
    // 4. Sprite_ProjectileAnimation (Database Animation Flying Across Coordinates)
    //=============================================================================

    function Sprite_ProjectileAnimation() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ProjectileAnimation.prototype = Object.create(Sprite_Animation.prototype);
    Sprite_ProjectileAnimation.prototype.constructor = Sprite_ProjectileAnimation;

    Sprite_ProjectileAnimation.prototype.initialize = function (opts) {
        Sprite_Animation.prototype.initialize.call(this);
        this._opts = opts || {};
        this._startX = opts.startX || 0;
        this._startY = opts.startY || 0;
        this._goalX = opts.goalX || 0;
        this._goalY = opts.goalY || 0;
        this._travelDuration = Math.max(1, opts.duration || 18);
        this._arc = (opts.arc !== undefined) ? opts.arc : 20;
        this._impactAnim = opts.impact || 0;
        this._targetBattler = opts.targetBattler || null;
        this._delay = Math.max(0, opts.delay || 0);
        this._elapsed = 0;
        this._finished = false;
        this.z = 8;

        var anim = $dataAnimations[opts.animId || 56];
        if (anim) {
            this.setup(this, anim, false, 0);
            // Synchronize animation rate with travel duration
            var totalFrames = Math.max(1, (anim.frames || []).length);
            this._rate = Math.max(1, Math.floor(this._travelDuration / totalFrames)) || 2;
            this.setupDuration();
        } else {
            this._finished = true;
        }

        this.updatePosition();
    };

    Sprite_ProjectileAnimation.prototype.isFinished = function () {
        return this._finished;
    };

    Sprite_ProjectileAnimation.prototype.updatePosition = function () {
        var p = Math.min(1.0, this._elapsed / this._travelDuration);
        var curX = this._startX + (this._goalX - this._startX) * p;
        var curY = this._startY + (this._goalY - this._startY) * p - (this._arc * 4 * p * (1 - p));

        this.x = curX;
        this.y = curY;
    };

    Sprite_ProjectileAnimation.prototype.update = function () {
        if (this._finished) return;

        if (this._delay > 0) {
            this._delay--;
            this.visible = false;
            return;
        }

        this.visible = true;
        this._elapsed++;

        this.updatePosition();
        Sprite_Animation.prototype.update.call(this);

        if (this._elapsed >= this._travelDuration) {
            this.onArrival();
        }
    };

    Sprite_ProjectileAnimation.prototype.onArrival = function () {
        this._finished = true;
        this.visible = false;

        if (this._impactAnim > 0 && this._targetBattler && typeof this._targetBattler.startAnimation === 'function') {
            this._targetBattler.startAnimation(this._impactAnim, false, 0);
        }

        if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    //=============================================================================
    // 5. BattleManager Projectile Management & Action Sequence Hooks
    //=============================================================================

    BattleManager._activeProjectiles = [];

    BattleManager.addProjectile = function (sprite) {
        if (!this._activeProjectiles) this._activeProjectiles = [];
        this._activeProjectiles.push(sprite);

        // Add to battle scene battlefield layer
        if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._battleField) {
            SceneManager._scene._spriteset._battleField.addChild(sprite);
        }
    };

    BattleManager.isProjectileFlying = function () {
        if (!this._activeProjectiles || this._activeProjectiles.length === 0) return false;
        this._activeProjectiles = this._activeProjectiles.filter(function (p) {
            return p && !p.isFinished() && (p._elapsed || 0) < 180; // 180 frame safety watchdog
        });
        return this._activeProjectiles.length > 0;
    };

    BattleManager.clearProjectiles = function () {
        if (this._activeProjectiles) {
            for (var i = 0; i < this._activeProjectiles.length; i++) {
                var p = this._activeProjectiles[i];
                if (p && p.parent) p.parent.removeChild(p);
            }
        }
        this._activeProjectiles = [];
    };

    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        this.clearProjectiles();
        _BattleManager_endAction.call(this);
    };

    // Parse Action Sequence argument array
    function parseProjectileArgs(actionArgs, defaultGoal) {
        var parsed = {
            start: 'user',
            goal: defaultGoal || 'target',
            duration: 16,
            arc: 25,
            rotate: false,
            angle: 45,
            spin: 0,
            scale: 1.0,
            impact: 0,
            delay: 0,
            startOffsetX: 0,
            startOffsetY: 0,
            goalOffsetX: 0,
            goalOffsetY: 0
        };

        if (!actionArgs || actionArgs.length === 0) return parsed;

        // Check positional format: [goal, duration, arc, rotate/impact]
        var isPositional = true;
        for (var k = 0; k < actionArgs.length; k++) {
            var tok = String(actionArgs[k] || '').toLowerCase();
            if (tok.startsWith('start') || tok.startsWith('goal') || tok.startsWith('dur') || tok.startsWith('arc') || tok.startsWith('impact') || tok.startsWith('spin')) {
                isPositional = false;
                break;
            }
        }

        if (isPositional) {
            if (actionArgs[0]) parsed.goal = String(actionArgs[0]).trim();
            if (actionArgs[1]) parsed.duration = parseInt(actionArgs[1], 10) || parsed.duration;
            if (actionArgs[2]) parsed.arc = parseInt(actionArgs[2], 10);
            if (actionArgs[3]) {
                var a3 = String(actionArgs[3]).trim().toLowerCase();
                if (a3 === 'rotate' || a3 === 'true') parsed.rotate = true;
                else parsed.impact = parseInt(a3, 10) || 0;
            }
            return parsed;
        }

        // Key-Value format
        for (var i = 0; i < actionArgs.length; i++) {
            var arg = String(actionArgs[i] || '').trim();
            var m;

            if ((m = arg.match(/^start\s+offset\s+([+-]?\d+)\s+([+-]?\d+)/i))) {
                parsed.startOffsetX = parseInt(m[1], 10) || 0;
                parsed.startOffsetY = parseInt(m[2], 10) || 0;
            } else if ((m = arg.match(/^start\s+(.*)/i))) {
                parsed.start = m[1].trim();
            } else if ((m = arg.match(/^goal\s+offset\s+([+-]?\d+)\s+([+-]?\d+)/i))) {
                parsed.goalOffsetX = parseInt(m[1], 10) || 0;
                parsed.goalOffsetY = parseInt(m[2], 10) || 0;
            } else if ((m = arg.match(/^goal\s+(.*)/i))) {
                parsed.goal = m[1].trim();
            } else if ((m = arg.match(/^(?:dur|duration)\s+(\d+)/i))) {
                parsed.duration = parseInt(m[1], 10) || parsed.duration;
            } else if ((m = arg.match(/^arc\s+([+-]?\d+)/i))) {
                parsed.arc = parseInt(m[1], 10);
            } else if (arg.match(/^rotate(?:\s+(true|yes|1))?/i)) {
                parsed.rotate = true;
            } else if ((m = arg.match(/^angle\s+([+-]?\d+)/i))) {
                parsed.angle = parseInt(m[1], 10);
            } else if ((m = arg.match(/^spin\s+([+-]?\d+)/i))) {
                parsed.spin = parseInt(m[1], 10);
            } else if ((m = arg.match(/^scale\s+([\d.]+)/i))) {
                parsed.scale = parseFloat(m[1]) || 1.0;
            } else if ((m = arg.match(/^impact\s+(\d+)/i))) {
                parsed.impact = parseInt(m[1], 10);
            } else if ((m = arg.match(/^delay\s+(\d+)/i))) {
                parsed.delay = parseInt(m[1], 10);
            }
        }

        return parsed;
    }

    // Resolves source battler & target battlers
    function resolveTargets(targetStr, defaultList) {
        var str = (targetStr || '').trim().toUpperCase();
        if (str === 'USER' || str === 'SUBJECT') return [BattleManager._subject];
        if (str === 'TARGET' || str === 'TARGETS') return BattleManager._targets || defaultList || [];
        if (typeof BattleManager.makeActionTargets === 'function') {
            return BattleManager.makeActionTargets(str);
        }
        return defaultList || [];
    }

    // Spawn Projectile instances for each destination target
    BattleManager.spawnProjectiles = function (type, idOrIdx, args) {
        var targets = resolveTargets(args.goal, this._targets);
        if (targets.length === 0) targets = [null]; // screen fallback

        var userBattler = resolveTargets(args.start, [this._subject])[0] || this._subject;
        var startCoords = resolveBattlerScreenPos(userBattler, false);
        startCoords.x += args.startOffsetX;
        startCoords.y += args.startOffsetY;

        for (var i = 0; i < targets.length; i++) {
            var tgt = targets[i];
            var goalCoords = resolveBattlerScreenPos(tgt, true);
            goalCoords.x += args.goalOffsetX;
            goalCoords.y += args.goalOffsetY;

            var opts = {
                startX: startCoords.x,
                startY: startCoords.y,
                goalX: goalCoords.x,
                goalY: goalCoords.y,
                duration: args.duration,
                arc: args.arc,
                rotate: args.rotate,
                angle: args.angle,
                spin: args.spin,
                scale: args.scale,
                impact: args.impact,
                targetBattler: tgt,
                delay: args.delay + (i * 2) // slight stagger for multi-target volleys
            };

            var sprite;
            if (type === 'icon') {
                opts.iconIndex = idOrIdx;
                sprite = new Sprite_ProjectileIcon(opts);
            } else {
                opts.animId = idOrIdx;
                sprite = new Sprite_ProjectileAnimation(opts);
            }

            this.addProjectile(sprite);
        }
    };

    //--- Hook processActionSequence ---
    var _BattleManager_processActionSequence = BattleManager.processActionSequence;
    BattleManager.processActionSequence = function (actionName, actionArgs) {
        actionName = (actionName || '').trim().toUpperCase();

        // 1. PROJECTILE WEAPON
        if (actionName === 'PROJECTILE WEAPON') {
            return this.actionProjectileWeapon(actionArgs);
        }

        // 2. PROJECTILE ANIMATION [id]
        if (actionName.match(/^PROJECTILE\s+ANIMATION(?:\s+(\d+))?/i)) {
            var animId = RegExp.$1 ? parseInt(RegExp.$1, 10) : 0;
            return this.actionProjectileAnimation(animId, actionArgs);
        }

        // 3. PROJECTILE ICON [iconIndex]
        if (actionName.match(/^PROJECTILE\s+ICON(?:\s+(\d+))?/i)) {
            var iconIndex = RegExp.$1 ? parseInt(RegExp.$1, 10) : 161;
            return this.actionProjectileIcon(iconIndex, actionArgs);
        }

        // 4. WAIT FOR PROJECTILE(S)
        if (actionName === 'WAIT FOR PROJECTILE' || actionName === 'WAIT FOR PROJECTILES') {
            return this.actionWaitForProjectile();
        }

        return _BattleManager_processActionSequence.call(this, actionName, actionArgs);
    };

    // Action Command Handlers
    BattleManager.actionProjectileAnimation = function (animId, actionArgs) {
        var args = parseProjectileArgs(actionArgs);
        if (!animId && actionArgs[0] && parseInt(actionArgs[0], 10)) {
            animId = parseInt(actionArgs.shift(), 10);
            args = parseProjectileArgs(actionArgs);
        }
        this.spawnProjectiles('animation', animId || 56, args);
        return true;
    };

    BattleManager.actionProjectileIcon = function (iconIndex, actionArgs) {
        var args = parseProjectileArgs(actionArgs);
        if (!iconIndex && actionArgs[0] && parseInt(actionArgs[0], 10)) {
            iconIndex = parseInt(actionArgs.shift(), 10);
            args = parseProjectileArgs(actionArgs);
        }
        if (args.rotate === undefined) args.rotate = true;
        this.spawnProjectiles('icon', iconIndex || 161, args);
        return true;
    };

    BattleManager.actionProjectileWeapon = function (actionArgs) {
        var user = this._subject;
        var weapons = (user && user.weapons) ? user.weapons().filter(function (w) { return !!w; }) : [];
        var weapon = weapons[0] || null;
        var wtypeId = weapon ? (weapon.wtypeId || 0) : 0;

        var args = parseProjectileArgs(actionArgs);

        if (wtypeId === 8) {
            // Long Bow: Flying Arrow with arching trajectory
            if (!args.arc) args.arc = 35;
            if (!args.duration) args.duration = 16;
            args.rotate = true;
            this.spawnProjectiles('animation', 4, args); // Pix - Arrow Shot
        } else if (wtypeId === 9) {
            // Crossbow: Rapid piercing bolt
            if (!args.arc) args.arc = 15;
            if (!args.duration) args.duration = 12;
            args.rotate = true;
            this.spawnProjectiles('animation', 4, args);
        } else if (wtypeId === 6 || wtypeId === 7) {
            // Staff (#6) or Rune (#7): Elemental magical spell missile
            var elemId = NUSV.Projectile.getWeaponElement(user, this._action);
            var animId = NUSV.Projectile.ELEMENT_ANIMATIONS[elemId] || 56;
            if (!args.arc) args.arc = (wtypeId === 6 ? 20 : 25);
            if (!args.duration) args.duration = (wtypeId === 6 ? 18 : 16);
            this.spawnProjectiles('animation', animId, args);
        } else {
            // Other weapon: throwing icon or neutral bolt
            var icon = weapon ? weapon.iconIndex : 161;
            args.rotate = true;
            this.spawnProjectiles('icon', icon, args);
        }

        return true;
    };

    BattleManager.actionWaitForProjectile = function () {
        if (this._logWindow) {
            this._logWindow.setWaitMode('projectile');
        }
        return false;
    };

    //--- Hook Window_BattleLog.prototype.updateWaitMode ---
    var _Window_BattleLog_updateWaitMode = Window_BattleLog.prototype.updateWaitMode;
    Window_BattleLog.prototype.updateWaitMode = function () {
        if (this._waitMode === 'projectile') {
            if (BattleManager.isProjectileFlying()) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Window_BattleLog_updateWaitMode.call(this);
    };

})();
