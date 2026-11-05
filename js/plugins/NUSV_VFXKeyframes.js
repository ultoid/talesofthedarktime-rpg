//=============================================================================
// NUSV_VFXKeyframes.js
//=============================================================================

/*:
 * @plugindesc v1.1.0 NUSV VFX Keyframe Engine & Animation Synchronizer for RPG Maker MV
 * @author Nusvanir Dev Team
 *
 * @help
 * ============================================================================
 * NUSV VFX Keyframes & Animation Trajectory Synchronizer
 * ============================================================================
 * This plugin allows RPG Maker MV animations to execute custom trajectory
 * keyframes, scale tweening, flips, and adaptive frame rates configured in
 * the Antigravity Skill Animation Studio.
 *
 * Key features:
 * - Real-time flight path interpolation between shooter (User) and recipient (Target).
 * - Full support for keyframe duration, easing curves, and scaling.
 * - Handles both projectile / ranged attacks and target-centered melee / self effects.
 */

(function () {
    'use strict';

    var activeNusvConfig = null;

    // --- Helper to parse config from note ---
    function parseNusvConfig(obj) {
        if (!obj || !obj.note) return null;
        var match = obj.note.match(/<!--\s*NUSV_ACTION_CONFIG:\s*([\s\S]*?)\s*-->/i);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                console.warn('[NUSV_VFXKeyframes] JSON parse error in note:', e);
            }
        }
        return null;
    }

    // --- BattleManager Hooks ---
    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        activeNusvConfig = null;
        if (this._subject) {
            var action = this._subject.currentAction();
            if (action && action.item()) {
                activeNusvConfig = parseNusvConfig(action.item());
            }
        }
        _BattleManager_startAction.call(this);
    };

    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        _BattleManager_endAction.call(this);
        activeNusvConfig = null;
    };

    // --- Sprite_Animation Setup Hook ---
    var _Sprite_Animation_setup = Sprite_Animation.prototype.setup;
    Sprite_Animation.prototype.setup = function (target, animation, mirror, delay) {
        _Sprite_Animation_setup.call(this, target, animation, mirror, delay);

        this._nusvConfig = null;
        this._nusvElapsedTicks = 0;

        if (this._animation && activeNusvConfig) {
            var cfg = null;
            var animId = this._animation.id;

            // Match action step by animId
            if (activeNusvConfig.steps && Array.isArray(activeNusvConfig.steps)) {
                for (var i = 0; i < activeNusvConfig.steps.length; i++) {
                    var s = activeNusvConfig.steps[i];
                    if (s && s.type === 'action' && Number(s.animId) === Number(animId)) {
                        cfg = s;
                        break;
                    }
                }
                // Fallback to any action step if animId was 0 or unassigned
                if (!cfg) {
                    for (var j = 0; j < activeNusvConfig.steps.length; j++) {
                        var st = activeNusvConfig.steps[j];
                        if (st && st.type === 'action') {
                            cfg = st;
                            break;
                        }
                    }
                }
            }
            if (!cfg && activeNusvConfig.attack) {
                if (Number(activeNusvConfig.attack.animId) === Number(animId) || !activeNusvConfig.steps) {
                    cfg = activeNusvConfig.attack;
                }
            }

            if (cfg) {
                this._nusvConfig = cfg;
                var totalFrames = Math.max(1, (this._animation.frames || []).length);

                // Adaptive / Custom Frame Rate & Lifetime Synchronizer
                if (cfg.useKeyframes) {
                    // For projectiles / flight keyframes, animate smoothly over the travel duration
                    var kfDur = Math.max(1, parseInt(cfg.kfDuration !== undefined ? cfg.kfDuration : 10, 10));
                    if (cfg.animRate && cfg.animRate !== 'auto') {
                        this._rate = Math.max(1, parseInt(cfg.animRate, 10) || 2);
                    } else {
                        this._rate = Math.max(1, Math.min(4, Math.floor(kfDur / totalFrames)));
                    }
                    this.setupDuration();
                } else {
                    // For stationary / melee animations, auto-fit to step duration (matches editor studio)
                    var stepDur = parseInt(cfg.duration, 10) || (totalFrames * 2);
                    if (cfg.animRate && cfg.animRate !== 'auto') {
                        this._rate = Math.max(1, parseInt(cfg.animRate, 10) || 2);
                    } else {
                        this._rate = Math.max(1, Math.min(4, Math.floor(stepDur / totalFrames)));
                    }
                    this.setupDuration();
                }
            }
        }
    };

    // --- Track elapsed animation ticks & terminate on arrival ---
    var _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;
    Sprite_Animation.prototype.updateMain = function () {
        if (this.isPlaying() && this.isReady() && this._delay <= 0) {
            this._nusvElapsedTicks = (this._nusvElapsedTicks || 0) + 1;

            if (this._nusvConfig) {
                if (this._nusvConfig.useKeyframes) {
                    var kfStart = Math.max(0, parseInt(this._nusvConfig.kfStart || 0, 10));
                    var kfDur = Math.max(1, parseInt(this._nusvConfig.kfDuration !== undefined ? this._nusvConfig.kfDuration : 10, 10));
                    // When projectile reaches target, finish immediately so it does not linger as a phantom effect
                    if (this._nusvElapsedTicks > kfStart + kfDur) {
                        this._duration = 0;
                        if (this._cellSprites) {
                            for (var c1 = 0; c1 < this._cellSprites.length; c1++) {
                                this._cellSprites[c1].visible = false;
                            }
                        }
                        return;
                    }
                } else if (this._nusvConfig.duration) {
                    var maxTicks = parseInt(this._nusvConfig.duration, 10);
                    // When step duration expires, cleanly terminate any leftover frames
                    if (this._nusvElapsedTicks > maxTicks) {
                        this._duration = 0;
                        if (this._cellSprites) {
                            for (var c2 = 0; c2 < this._cellSprites.length; c2++) {
                                this._cellSprites[c2].visible = false;
                            }
                        }
                        return;
                    }
                }
            }
        }
        _Sprite_Animation_updateMain.call(this);
    };

    // --- Suppress premature target flash during projectile flight (matches editor preview) ---
    var _Sprite_Animation_processTimingData = Sprite_Animation.prototype.processTimingData;
    Sprite_Animation.prototype.processTimingData = function (timing) {
        if (this._nusvConfig && this._nusvConfig.useKeyframes) {
            var kfStart = Math.max(0, parseInt(this._nusvConfig.kfStart || 0, 10));
            var kfDur = Math.max(1, parseInt(this._nusvConfig.kfDuration !== undefined ? this._nusvConfig.kfDuration : 10, 10));
            // While projectile is flying to target, do not flash target prematurely
            if (this._nusvElapsedTicks < (kfStart + kfDur) && timing.flashScope === 1) {
                if (!this._duplicated && timing.se) {
                    AudioManager.playSe(timing.se);
                }
                return;
            }
        }
        _Sprite_Animation_processTimingData.call(this, timing);
    };

    // --- Progress & Easing Calculation ---
    Sprite_Animation.prototype.nusvProgress = function () {
        if (!this._nusvConfig) return 0;
        var cfg = this._nusvConfig;
        if (!cfg.useKeyframes) return 0;

        var kfStart = Math.max(0, parseInt(cfg.kfStart || 0, 10));
        var kfDur = Math.max(1, parseInt(cfg.kfDuration !== undefined ? cfg.kfDuration : 10, 10));
        var elapsed = this._nusvElapsedTicks || 0;

        var rawP = 0;
        if (elapsed <= kfStart) rawP = 0;
        else if (elapsed >= kfStart + kfDur) rawP = 1;
        else rawP = (elapsed - kfStart) / kfDur;

        var easing = cfg.kfEasing || 'ease-out';
        if (easing === 'ease-out' || easing === 'fast') return 1 - Math.pow(1 - rawP, 2);
        if (easing === 'ease-in' || easing === 'accel') return Math.pow(rawP, 2);
        if (easing === 'ease-in-out' || easing === 'smooth') {
            return rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2;
        }
        return rawP;
    };

    // --- Dynamic Position Interpolation (World Space Flight Path) ---
    var _Sprite_Animation_updatePosition = Sprite_Animation.prototype.updatePosition;
    Sprite_Animation.prototype.updatePosition = function () {
        _Sprite_Animation_updatePosition.call(this);

        if (!this._nusvConfig) return;
        var cfg = this._nusvConfig;

        // Target coordinates (tX, tY) in world/screen space
        var tX = this.x;
        var tY = this.y;

        // User / Shooter coordinates (uX, uY)
        var uX = tX;
        var uY = tY;
        var user = BattleManager._subject;
        if (user) {
            var userSprite = null;
            if (typeof BattleManager.getSprite === 'function') {
                userSprite = BattleManager.getSprite(user);
            }
            if (!userSprite && SceneManager._scene && SceneManager._scene._spriteset) {
                var ss = SceneManager._scene._spriteset;
                if (user.isActor && user.isActor()) {
                    var actList = ss._actorSprites || [];
                    userSprite = actList[user.index()];
                } else if (user.isEnemy && user.isEnemy()) {
                    var eneList = ss._enemySprites || [];
                    userSprite = eneList[user.index()];
                }
            }
            if (userSprite) {
                uX = userSprite.x;
                uY = userSprite.y - (userSprite.height ? userSprite.height / 2 : 35);
            } else if (user.isActor && user.isActor()) {
                uX = Graphics.boxWidth - 160;
                uY = Graphics.boxHeight / 2;
            }
        }

        var isSelf = (cfg.target === 'user') || (uX === tX && uY === tY);

        if (!cfg.useKeyframes) {
            var ox = parseInt(cfg.offsetX || 0, 10);
            var oy = parseInt(cfg.offsetY !== undefined ? cfg.offsetY : -35, 10);
            if (cfg.posType === 'screen') {
                this.x = Graphics.boxWidth / 2 + ox;
                this.y = Graphics.boxHeight / 2 + oy;
            } else {
                if (this._mirror) ox = -ox;
                this.x += ox;
                this.y += oy;
            }
            return;
        }

        // Preview editor coordinates mapping:
        // In the studio canvas (480x270): Shooter = (380, 155), Target = (100, 155)
        var pBaseX = 100;
        var pBaseY = 155;
        if (cfg.posType === 'screen') {
            pBaseX = 240;
            pBaseY = 135;
        } else if (cfg.posType === 'head') {
            pBaseY = 125;
        } else if (cfg.posType === 'feet') {
            pBaseY = 190;
        }
        if (cfg.target === 'user') {
            pBaseX = 380;
            pBaseY = 155;
        }

        var pStartX = pBaseX + parseInt(cfg.offsetX || 0, 10);
        var pStartY = pBaseY + parseInt(cfg.offsetY !== undefined ? cfg.offsetY : -35, 10);

        var pEndX = pBaseX + parseInt(cfg.endOffsetX !== undefined ? cfg.endOffsetX : (cfg.offsetX || 0), 10);
        var pEndY = pBaseY + parseInt(cfg.endOffsetY !== undefined ? cfg.endOffsetY : (cfg.offsetY !== undefined ? cfg.offsetY : -35), 10);

        // Normalized flight ratios along vector from Shooter (380) to Target (100)
        // Vector dx = 100 - 380 = -280
        var startRatio = (pStartX - 380) / -280.0;
        var endRatio = (pEndX - 380) / -280.0;
        var startOy = pStartY - 155;
        var endOy = pEndY - 155;

        var p = this.nusvProgress();

        if (isSelf) {
            var curOx = Math.round(parseInt(cfg.offsetX || 0, 10) + (parseInt(cfg.endOffsetX || 0, 10) - parseInt(cfg.offsetX || 0, 10)) * p);
            var curOy = Math.round(parseInt(cfg.offsetY || -35, 10) + (parseInt(cfg.endOffsetY || -35, 10) - parseInt(cfg.offsetY || -35, 10)) * p);
            this.x = uX + curOx;
            this.y = uY + curOy;
        } else {
            var curRatio = startRatio + (endRatio - startRatio) * p;
            var curOy = startOy + (endOy - startOy) * p;

            this.x = Math.round(uX + (tX - uX) * curRatio);
            this.y = Math.round(uY + (tY - uY) * curRatio + curOy);
        }
    };

    // --- Dynamic Scale & Flip per Cell Sprite ---
    var _Sprite_Animation_updateCellSprite = Sprite_Animation.prototype.updateCellSprite;
    Sprite_Animation.prototype.updateCellSprite = function (sprite, cell) {
        _Sprite_Animation_updateCellSprite.call(this, sprite, cell);

        if (this._nusvConfig && sprite.visible) {
            var cfg = this._nusvConfig;
            var startScale = parseInt(cfg.scale !== undefined ? cfg.scale : 100, 10);
            var curScale = startScale;

            if (cfg.useKeyframes) {
                var p = this.nusvProgress();
                var endScale = parseInt(cfg.scaleEnd !== undefined ? cfg.scaleEnd : startScale, 10);
                curScale = Math.round(startScale + (endScale - startScale) * p);
            }

            var scaleMul = curScale / 100.0;
            sprite.scale.x *= scaleMul;
            sprite.scale.y *= scaleMul;

            if (cfg.flipX && !this._mirror) {
                sprite.scale.x *= -1;
            }
            if (cfg.flipY) {
                sprite.scale.y *= -1;
            }
        }
    };

})();
