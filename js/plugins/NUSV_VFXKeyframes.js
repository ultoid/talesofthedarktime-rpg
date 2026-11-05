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

    // --- Dynamic Position Interpolation (Synchronized 1:1 with Studio at 1080x720) ---
    var _Sprite_Animation_updatePosition = Sprite_Animation.prototype.updatePosition;
    Sprite_Animation.prototype.updatePosition = function () {
        if (!this._nusvConfig) {
            _Sprite_Animation_updatePosition.call(this);
            return;
        }

        var cfg = this._nusvConfig;

        // 1. Resolve Battler Reference (User or Target)
        var isTargetUser = (cfg.target === 'user');
        var targetBattlerSprite = null;

        if (isTargetUser) {
            var user = BattleManager._subject;
            if (user && SceneManager._scene && SceneManager._scene._spriteset) {
                var ss = SceneManager._scene._spriteset;
                if (user.isActor && user.isActor()) {
                    var actList = ss._actorSprites || [];
                    targetBattlerSprite = actList[user.index()];
                } else if (user.isEnemy && user.isEnemy()) {
                    var eneList = ss._enemySprites || [];
                    targetBattlerSprite = eneList[user.index()];
                }
            }
        }
        if (!targetBattlerSprite) {
            targetBattlerSprite = this._target;
        }

        // 2. Resolve Ground Base Coordinates (x, y)
        var baseX = Graphics.boxWidth / 2;
        var baseY = Graphics.boxHeight / 2;
        var battlerH = 64;
        var isActor = false;

        var battler = null;
        if (targetBattlerSprite) {
            if (targetBattlerSprite._battler) {
                battler = targetBattlerSprite;
            } else if (targetBattlerSprite.parent && targetBattlerSprite.parent._battler) {
                battler = targetBattlerSprite.parent;
            }
        }

        if (battler) {
            baseX = battler.x;
            baseY = battler.y;
            isActor = battler.isActor ? battler.isActor() : (battler._battler && battler._battler.isActor && battler._battler.isActor());
            battlerH = battler.height || (isActor ? 64 : 120);
        } else if (targetBattlerSprite) {
            baseX = targetBattlerSprite.x;
            baseY = targetBattlerSprite.y;
            if (targetBattlerSprite.parent && this.parent === targetBattlerSprite.parent.parent) {
                baseX += targetBattlerSprite.parent.x;
                baseY += targetBattlerSprite.parent.y;
            }
        }

        // 3. Anchor Offset (Unified 1:1 with SkillAnimator)
        var posType = cfg.posType || 'center';
        var anchorOffsetY = -35;
        if (posType === 'head') {
            anchorOffsetY = isActor ? -64 : -100;
        } else if (posType === 'feet') {
            anchorOffsetY = 0;
        } else if (posType === 'center') {
            anchorOffsetY = -35;
        } else if (posType === 'screen') {
            baseX = Graphics.boxWidth / 2;
            baseY = Graphics.boxHeight / 2;
            anchorOffsetY = 0;
        }

        // 4. Static / Non-Keyframe Position
        var ox = parseInt(cfg.offsetX || 0, 10);
        var oy = parseInt(cfg.offsetY !== undefined ? cfg.offsetY : 0, 10);

        if (!cfg.useKeyframes) {
            this.x = baseX + ox;
            this.y = baseY + anchorOffsetY + oy;
            return;
        }

        // 5. Keyframe Flight Trajectory
        var endOx = parseInt(cfg.endOffsetX !== undefined ? cfg.endOffsetX : ox, 10);
        var endOy = parseInt(cfg.endOffsetY !== undefined ? cfg.endOffsetY : oy, 10);

        var p = this.nusvProgress();
        var curOx = ox + (endOx - ox) * p;
        var curOy = oy + (endOy - oy) * p;

        this.x = Math.round(baseX + curOx);
        this.y = Math.round(baseY + anchorOffsetY + curOy);
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
