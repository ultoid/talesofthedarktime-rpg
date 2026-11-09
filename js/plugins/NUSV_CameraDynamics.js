//=============================================================================
// NUSV_CameraDynamics.js
//=============================================================================

/*:
 * @plugindesc v1.0.0 NUSV Camera Dynamics - Organic Easing & Spring Physics for Battle Camera & Zoom (Octopath Style).
 * @author NUSV
 *
 * @param ---Camera Easing---
 * @default
 *
 * @param Camera Easing
 * @parent ---Camera Easing---
 * @type select
 * @option EaseInOutCubic
 * @option EaseOutQuart
 * @option EaseOutQuint
 * @option SpringDamp
 * @option SmoothStep
 * @option Linear
 * @desc Easing formula for camera panning & focusing.
 * @default EaseInOutCubic
 *
 * @param Zoom Easing
 * @parent ---Camera Easing---
 * @type select
 * @option EaseInOutCubic
 * @option EaseOutQuart
 * @option EaseOutQuint
 * @option SpringDamp
 * @option SmoothStep
 * @option Linear
 * @desc Easing formula for battle zoom in / zoom out.
 * @default EaseInOutCubic
 *
 * @param ---Spring Dynamics---
 * @default
 *
 * @param Spring Damping Ratio
 * @parent ---Spring Dynamics---
 * @type number
 * @decimals 2
 * @min 0.10
 * @max 2.00
 * @desc Damping ratio (zeta). 1.0 = critically damped (no overshoot), < 1.0 = subtle organic spring bounce.
 * @default 0.88
 *
 * @param Spring Frequency
 * @parent ---Spring Dynamics---
 * @type number
 * @decimals 1
 * @min 1.0
 * @max 20.0
 * @desc Natural oscillation frequency (omega) for spring physics.
 * @default 7.0
 *
 * @param ---Tracking & Trauma---
 * @default
 *
 * @param Tracking Damping
 * @parent ---Tracking & Trauma---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Enable soft spring follow when battlers step forward during idle/action turns.
 * @default true
 *
 * @param Tracking Damping Rate
 * @parent ---Tracking & Trauma---
 * @type number
 * @decimals 2
 * @min 0.05
 * @max 0.50
 * @desc Damping responsiveness per frame for idle tracking (0.15 - 0.22 recommended).
 * @default 0.18
 *
 * @param Trauma Screen Shake
 * @parent ---Tracking & Trauma---
 * @type boolean
 * @on YES
 * @off NO
 * @desc Upgrade linear screen shake into quadratic decay trauma shake (Octopath style).
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_CameraDynamics - Organic Easing & Spring Physics
 * ============================================================================
 *
 * Plugin ini meng-upgrade pergerakan kamera dan zoom pertempuran dari
 * interpolasi linear kaku (default RPG Maker MV / Yanfly ActSeqPack3)
 * menjadi kurva Easing & Spring Dynamics organik (gaya Octopath Traveler II).
 *
 * 1. ZERO BREAKING CHANGE:
 *    - 100% kompatibel dengan semua action sequences Yanfly yang sudah ada.
 *    - Perintah 'wait for camera' dan 'wait for zoom' tetap selesai tepat waktu
 *      sesuai durasi frame yang ditentukan.
 *
 * 2. ACTION SEQUENCE COMMANDS:
 *    Anda dapat mengganti kurva easing secara dinamis di dalam action sequence:
 *
 *    camera easing: easeInOutCubic
 *    camera easing: easeOutQuart
 *    camera easing: springDamp
 *    camera easing: linear
 *
 *    zoom easing: easeInOutCubic
 *    zoom easing: springDamp
 *
 *    camera spring: 0.85, 7.0   (format: dampingRatio, frequency)
 *    reset camera easing       (mengembalikan ke setting default plugin)
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_CameraDynamics = true;

var NUSV = NUSV || {};
NUSV.CameraDynamics = NUSV.CameraDynamics || {};

(function() {
    "use strict";

    //=============================================================================
    // Parameter Parsing
    //=============================================================================
    var params = PluginManager.parameters('NUSV_CameraDynamics');

    NUSV.CameraDynamics.defaultCameraEasing = String(params['Camera Easing'] || 'EaseInOutCubic').trim();
    NUSV.CameraDynamics.defaultZoomEasing = String(params['Zoom Easing'] || 'EaseInOutCubic').trim();
    NUSV.CameraDynamics.defaultSpringZeta = parseFloat(params['Spring Damping Ratio']) || 0.88;
    NUSV.CameraDynamics.defaultSpringOmega = parseFloat(params['Spring Frequency']) || 7.0;
    NUSV.CameraDynamics.trackingDamping = String(params['Tracking Damping'] || 'true').trim().toLowerCase() === 'true';
    NUSV.CameraDynamics.trackingDampingRate = parseFloat(params['Tracking Damping Rate']) || 0.18;
    NUSV.CameraDynamics.traumaShake = String(params['Trauma Screen Shake'] || 'true').trim().toLowerCase() === 'true';

    // Runtime state (can be modified by action sequences)
    NUSV.CameraDynamics.cameraEasingType = NUSV.CameraDynamics.defaultCameraEasing;
    NUSV.CameraDynamics.zoomEasingType = NUSV.CameraDynamics.defaultZoomEasing;
    NUSV.CameraDynamics.springZeta = NUSV.CameraDynamics.defaultSpringZeta;
    NUSV.CameraDynamics.springOmega = NUSV.CameraDynamics.defaultSpringOmega;

    NUSV.CameraDynamics.resetEasingDefaults = function() {
        this.cameraEasingType = this.defaultCameraEasing;
        this.zoomEasingType = this.defaultZoomEasing;
        this.springZeta = this.defaultSpringZeta;
        this.springOmega = this.defaultSpringOmega;
    };

    //=============================================================================
    // Mathematical Easing & Spring Functions
    //=============================================================================
    var Easing = {
        easeInOutCubic: function(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
        easeOutQuart: function(t) {
            return 1 - Math.pow(1 - t, 4);
        },
        easeOutQuint: function(t) {
            return 1 - Math.pow(1 - t, 5);
        },
        smoothStep: function(t) {
            return t * t * (3 - 2 * t);
        },
        smootherStep: function(t) {
            return t * t * t * (t * (6 * t - 15) + 10);
        },
        springDamp: function(t, zeta, omega) {
            if (t <= 0) return 0;
            if (t >= 1) return 1;
            zeta = (typeof zeta === 'number') ? zeta : NUSV.CameraDynamics.springZeta;
            omega = (typeof omega === 'number') ? omega : NUSV.CameraDynamics.springOmega;
            var wd = (zeta < 1.0) ? omega * Math.sqrt(1.0 - zeta * zeta) : 0.001;
            var decay = Math.exp(-zeta * omega * t);
            var raw = 1.0 - decay * (Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t));
            var decay1 = Math.exp(-zeta * omega);
            var raw1 = 1.0 - decay1 * (Math.cos(wd) + (zeta * omega / wd) * Math.sin(wd));
            return raw / raw1;
        },
        linear: function(t) {
            return t;
        }
    };

    NUSV.CameraDynamics.applyEasing = function(t, typeName) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        var key = (typeName || '').toLowerCase().replace(/[-_]/g, '');
        if (key === 'easeinoutcubic' || key === 'cubic') return Easing.easeInOutCubic(t);
        if (key === 'easeoutquart' || key === 'quart') return Easing.easeOutQuart(t);
        if (key === 'easeoutquint' || key === 'quint') return Easing.easeOutQuint(t);
        if (key === 'springdamp' || key === 'spring') return Easing.springDamp(t);
        if (key === 'smoothstep') return Easing.smoothStep(t);
        if (key === 'smootherstep') return Easing.smootherStep(t);
        if (key === 'linear') return Easing.linear(t);
        return Easing.easeInOutCubic(t);
    };

    //=============================================================================
    // BattleManager Action Sequence Extensions
    //=============================================================================
    var _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        NUSV.CameraDynamics.resetEasingDefaults();
        _BattleManager_setup.call(this, troopId, canEscape, canLose);
    };

    var _BattleManager_resetCamera = BattleManager.resetCamera;
    BattleManager.resetCamera = function(duration) {
        if ($gameScreen) {
            $gameScreen._cameraMaxDuration = 0;
            $gameScreen._cameraElapsed = 0;
        }
        _BattleManager_resetCamera.call(this, duration);
    };

    var _BattleManager_processActionSequence = BattleManager.processActionSequence;
    BattleManager.processActionSequence = function(actionName, actionArgs) {
        var name = (actionName || '').toUpperCase();
        if (name === 'CAMERA EASING') {
            if (actionArgs && actionArgs[0]) {
                NUSV.CameraDynamics.cameraEasingType = String(actionArgs[0]).trim();
            }
            return true;
        }
        if (name === 'ZOOM EASING') {
            if (actionArgs && actionArgs[0]) {
                NUSV.CameraDynamics.zoomEasingType = String(actionArgs[0]).trim();
            }
            return true;
        }
        if (name === 'CAMERA SPRING') {
            if (actionArgs) {
                if (actionArgs[0]) NUSV.CameraDynamics.springZeta = parseFloat(actionArgs[0]) || 0.88;
                if (actionArgs[1]) NUSV.CameraDynamics.springOmega = parseFloat(actionArgs[1]) || 7.0;
            }
            return true;
        }
        if (name === 'RESET CAMERA EASING') {
            NUSV.CameraDynamics.resetEasingDefaults();
            return true;
        }
        return _BattleManager_processActionSequence.call(this, actionName, actionArgs);
    };

    //=============================================================================
    // Game_Screen - Enhanced Camera & Zoom Interpolation
    //=============================================================================
    var _Game_Screen_clearZoom = Game_Screen.prototype.clearZoom;
    Game_Screen.prototype.clearZoom = function() {
        if (_Game_Screen_clearZoom) _Game_Screen_clearZoom.call(this);
        this._cameraMaxDuration = 0;
        this._cameraElapsed = 0;
        this._zoomMaxDuration = 0;
        this._zoomElapsed = 0;
    };

    var _Game_Screen_setCameraDuration = Game_Screen.prototype.setCameraDuration;
    Game_Screen.prototype.setCameraDuration = function(duration) {
        if (_Game_Screen_setCameraDuration) {
            _Game_Screen_setCameraDuration.call(this, duration);
        } else {
            if (Array.isArray(duration)) duration = duration[0];
            duration = parseInt(duration);
            this._cameraDuration = isNaN(duration) ? 0 : duration;
        }

        var d = this._cameraDuration || 0;
        this._cameraMaxDuration = d;
        this._cameraElapsed = 0;
        this._cameraStartX = (this._zoomX !== undefined && !isNaN(this._zoomX)) ? this._zoomX : Graphics.boxWidth / 2;
        this._cameraStartY = (this._zoomY !== undefined && !isNaN(this._zoomY)) ? this._zoomY : Graphics.boxHeight / 2;
    };

    var _Game_Screen_startBattleZoom = Game_Screen.prototype.startBattleZoom;
    Game_Screen.prototype.startBattleZoom = function(scale, duration) {
        if (_Game_Screen_startBattleZoom) {
            _Game_Screen_startBattleZoom.call(this, scale, duration);
        } else {
            this._zoomScaleTarget = scale;
            this._zoomDuration = duration;
        }

        var d = this._zoomDuration || 0;
        this._zoomMaxDuration = d;
        this._zoomElapsed = 0;
        this._zoomScaleStart = (this._zoomScale !== undefined && !isNaN(this._zoomScale)) ? this._zoomScale : 1.0;
    };

    // Upgrade Battle Camera Update
    Game_Screen.prototype.updateBattleCamera = function() {
        if (!$gameParty.inBattle()) return;
        if (this._zoomX === undefined || this._zoomX === 0) this._zoomX = Graphics.boxWidth / 2;
        if (this._zoomY === undefined || this._zoomY === 0) this._zoomY = Graphics.boxHeight / 2;

        var tx = BattleManager.cameraX();
        var ty = BattleManager.cameraY();

        if (this._cameraDuration > 0) {
            if (!this._cameraMaxDuration || this._cameraMaxDuration <= 0) {
                this._cameraMaxDuration = this._cameraDuration;
                this._cameraStartX = this._zoomX;
                this._cameraStartY = this._zoomY;
                this._cameraElapsed = 0;
            }

            this._cameraElapsed = (this._cameraElapsed || 0) + 1;
            var progress = Math.min(1.0, Math.max(0.0, this._cameraElapsed / this._cameraMaxDuration));
            var k = NUSV.CameraDynamics.applyEasing(progress, NUSV.CameraDynamics.cameraEasingType);

            this._zoomX = this._cameraStartX + (tx - this._cameraStartX) * k;
            this._zoomY = this._cameraStartY + (ty - this._cameraStartY) * k;

            this._cameraDuration--;
            if (this._cameraDuration === 0) {
                this._zoomX = tx;
                this._zoomY = ty;
                if (BattleManager._cameraResettingClamp) {
                    BattleManager._cameraClamp = true;
                    BattleManager._cameraResettingClamp = false;
                }
            }
        } else {
            // Neutral / Tracking Phase: Apply soft spring damping when battlers step forward
            if (NUSV.CameraDynamics.trackingDamping && !BattleManager._cameraResettingClamp) {
                var rate = NUSV.CameraDynamics.trackingDampingRate;
                var dx = tx - this._zoomX;
                var dy = ty - this._zoomY;
                if (Math.abs(dx) > 0.05) {
                    this._zoomX += dx * rate;
                } else {
                    this._zoomX = tx;
                }
                if (Math.abs(dy) > 0.05) {
                    this._zoomY += dy * rate;
                } else {
                    this._zoomY = ty;
                }
            } else {
                this._zoomX = tx;
                this._zoomY = ty;
            }
        }
    };

    // Upgrade Zoom Update
    Game_Screen.prototype.updateZoom = function() {
        if (this._zoomDuration > 0) {
            if (!this._zoomMaxDuration || this._zoomMaxDuration <= 0) {
                this._zoomMaxDuration = this._zoomDuration;
                this._zoomScaleStart = (this._zoomScale !== undefined && !isNaN(this._zoomScale)) ? this._zoomScale : 1.0;
                this._zoomElapsed = 0;
            }

            this._zoomElapsed = (this._zoomElapsed || 0) + 1;
            var progress = Math.min(1.0, Math.max(0.0, this._zoomElapsed / this._zoomMaxDuration));
            var k = NUSV.CameraDynamics.applyEasing(progress, NUSV.CameraDynamics.zoomEasingType);

            var target = this._zoomScaleTarget;
            this._zoomScale = this._zoomScaleStart + (target - this._zoomScaleStart) * k;

            this._zoomDuration--;
            if (this._zoomDuration === 0) {
                this._zoomScale = this._zoomScaleTarget;
            }
        }
    };

    //=============================================================================
    // Game_Screen - Enhanced Trauma Screen Shake (Octopath Style)
    //=============================================================================
    var _Game_Screen_startShake = Game_Screen.prototype.startShake;
    Game_Screen.prototype.startShake = function(power, speed, duration) {
        _Game_Screen_startShake.call(this, power, speed, duration);
        this._shakeMaxDuration = duration;
    };

    Game_Screen.prototype.updateShake = function() {
        if (this._shakeDuration > 0) {
            if (NUSV.CameraDynamics.traumaShake && this._shakeMaxDuration > 0) {
                var progress = this._shakeDuration / this._shakeMaxDuration; // 1.0 -> 0.0
                var trauma = progress * progress; // Quadratic decay
                var currentPower = this._shakePower * trauma;
                var delta = (currentPower * this._shakeSpeed * this._shakeDirection) / 10;

                if (this._shakeDuration <= 1) {
                    this._shake = 0;
                } else {
                    this._shake += delta;
                }

                if (this._shake > currentPower * 2) {
                    this._shakeDirection = -1;
                }
                if (this._shake < -currentPower * 2) {
                    this._shakeDirection = 1;
                }
            } else {
                var delta = (this._shakePower * this._shakeSpeed * this._shakeDirection) / 10;
                if (this._shakeDuration <= 1 && this._shake * (this._shake + delta) < 0) {
                    this._shake = 0;
                } else {
                    this._shake += delta;
                }
                if (this._shake > this._shakePower * 2) {
                    this._shakeDirection = -1;
                }
                if (this._shake < - this._shakePower * 2) {
                    this._shakeDirection = 1;
                }
            }

            this._shakeDuration--;
            if (this._shakeDuration === 0) {
                this._shake = 0;
            }
        }
    };

})();

