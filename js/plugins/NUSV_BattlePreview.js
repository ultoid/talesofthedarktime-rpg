//=============================================================================
// NUSV_BattlePreview.js
//=============================================================================

/*:
 * @plugindesc v1.0.0 Real-Engine In-Game Battle Preview & Sandbox for Database Studio
 * @author NUSV Team
 *
 * @help
 * ============================================================================
 * NUSV Battle Preview Bridge (RPG Maker MV)
 * ============================================================================
 * This plugin connects the RPG Maker MV game engine directly to Database
 * Studio for 100% accurate, native in-game battle previews.
 *
 * When active (via ?skillPreview=ID in the URL):
 * - Boots directly into Scene_Battle bypassing title screens
 * - 1v1 Solo Duel Sandbox: exactly 1 chosen Actor vs 1 chosen Enemy Dummy
 * - Equips/learns the selected skill on the chosen actor with infinite MP/SP
 * - Native Action Pipeline: matches in-game playtest camera, zoom, and sequences
 * - Prevents premature Victory/Defeat screens (immortal dummy)
 * - Supports live unsaved notetag/action-sequence updates without page reload
 * - Supports instant replay and real-time speed scaling (0.5x, 1x, 2x)
 * - Safely does nothing in regular game play (zero overhead outside preview)
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_BattlePreview = true;

var NUSV_BattlePreview = NUSV_BattlePreview || {};

(function() {
    'use strict';

    // ========================================================================
    // 1. QUERY PARAMETER EXTRACTION & STATE
    // ========================================================================

    function getQueryParam(name) {
        if (typeof window === 'undefined' || !window.location) return null;
        var search = window.location.search;
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(search);
        return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
    }

    var previewParam = getQueryParam('skillPreview') || getQueryParam('skillId');
    NUSV_BattlePreview._active = Boolean(previewParam || getQueryParam('btest_preview'));
    NUSV_BattlePreview.skillId = parseInt(previewParam, 10) || 1;
    NUSV_BattlePreview.actorId = parseInt(getQueryParam('actorId'), 10) || 1;
    NUSV_BattlePreview.troopId = parseInt(getQueryParam('troopId'), 10) || 2;
    NUSV_BattlePreview.enemyId = parseInt(getQueryParam('enemyId'), 10) || NUSV_BattlePreview.troopId || 2;
    NUSV_BattlePreview.autoCast = getQueryParam('autoCast') !== '0' && getQueryParam('autoCast') !== 'false';
    NUSV_BattlePreview.mute = getQueryParam('mute') === '1' || getQueryParam('mute') === 'true';
    NUSV_BattlePreview.speedMultiplier = parseFloat(getQueryParam('speed')) || 1.0;
    NUSV_BattlePreview.soloMode = getQueryParam('solo') !== '0' && getQueryParam('solo') !== 'false';
    NUSV_BattlePreview.showHud = getQueryParam('hud') === '1' || getQueryParam('hud') === 'true';
    NUSV_BattlePreview.isBattleReady = false;

    NUSV_BattlePreview.isActive = function() {
        return Boolean(this._active);
    };

    if (!NUSV_BattlePreview.isActive()) {
        // Normal game execution - exit early
        return;
    }

    console.log('[NUSV_BattlePreview] Activated for Skill #' + NUSV_BattlePreview.skillId + 
                ', Actor #' + NUSV_BattlePreview.actorId + 
                ', Enemy #' + NUSV_BattlePreview.enemyId);

    // ========================================================================
    // 2. ENGINE BOOT HOOKS & RESTRICTION BYPASS
    // ========================================================================

    var _DataManager_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
        if (NUSV_BattlePreview.isActive()) {
            for (var i = 0; i < this._databaseFiles.length; i++) {
                var name = this._databaseFiles[i].name;
                var src = this._databaseFiles[i].src;
                this.loadDataFile(name, src);
            }
            return;
        }
        _DataManager_loadDatabase.call(this);
    };

    var _DataManager_isBattleTest = DataManager.isBattleTest;
    DataManager.isBattleTest = function() {
        if (NUSV_BattlePreview.isActive()) return true;
        return _DataManager_isBattleTest.call(this);
    };

    var _Scene_Boot_isGameFontLoaded = Scene_Boot.prototype.isGameFontLoaded;
    Scene_Boot.prototype.isGameFontLoaded = function() {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Scene_Boot_isGameFontLoaded ? _Scene_Boot_isGameFontLoaded.call(this) : true;
    };

    var _DataManager_setupBattleTest = DataManager.setupBattleTest;
    DataManager.setupBattleTest = function() {
        _DataManager_setupBattleTest.call(this);
        if (NUSV_BattlePreview.isActive()) {
            NUSV_BattlePreview.setupPreviewBattle();
        }
    };

    // Regardless of equipment or requirements, always allow the previewed skill to be cast
    var _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Game_BattlerBase_meetsSkillConditions.call(this, skill);
    };

    var _Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
    Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Game_BattlerBase_canPaySkillCost.call(this, skill);
    };

    // Suppress unrequested cast animation in battle preview unless explicitly requested via <Cast Animation: X>
    var _BattleManager_actionCastAnimation = BattleManager.actionCastAnimation;
    BattleManager.actionCastAnimation = function() {
        if (NUSV_BattlePreview.isActive()) {
            var item = this._action ? this._action.item() : null;
            if (!item || !item.note) return true;
            var match = /<Cast Animation:\s*(\d+)>/i.exec(item.note);
            if (!match || parseInt(match[1], 10) <= 0) {
                return true; // Skip unrequested automatic cast animation
            }
        }
        return _BattleManager_actionCastAnimation.call(this);
    };

    // Ensure attack animations play accurately based on equipped weapon or weapon type
    var _Game_Actor_attackAnimationId1 = Game_Actor.prototype.attackAnimationId1;
    Game_Actor.prototype.attackAnimationId1 = function() {
        var id = _Game_Actor_attackAnimationId1.call(this);
        if (id > 0) return id;
        var weapons = this.weapons ? this.weapons() : [];
        if (weapons && weapons.length > 0 && weapons[0]) {
            var w = weapons[0];
            if (w.animationId > 0) return w.animationId;
            var map = { 1: 6, 2: 2, 3: 11, 4: 3, 5: 6, 6: 56, 7: 25, 8: 4, 9: 4, 10: 7 };
            if (map[w.wtypeId]) return map[w.wtypeId];
        }
        return 1;
    };

    // Ensure preview actor can freely equip any weapon or armor regardless of class restrictions
    var _Game_BattlerBase_canEquip = Game_BattlerBase.prototype.canEquip;
    Game_BattlerBase.prototype.canEquip = function(item) {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Game_BattlerBase_canEquip.call(this, item);
    };

    var _Game_BattlerBase_canEquipWeapon = Game_BattlerBase.prototype.canEquipWeapon;
    Game_BattlerBase.prototype.canEquipWeapon = function(item) {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Game_BattlerBase_canEquipWeapon.call(this, item);
    };

    var _Game_BattlerBase_isEquipWtypeOk = Game_BattlerBase.prototype.isEquipWtypeOk;
    Game_BattlerBase.prototype.isEquipWtypeOk = function(wtypeId) {
        if (NUSV_BattlePreview.isActive()) return true;
        return _Game_BattlerBase_isEquipWtypeOk.call(this, wtypeId);
    };

    var _Game_Actor_releaseUnequippableItems = Game_Actor.prototype.releaseUnequippableItems;
    Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
        if (NUSV_BattlePreview.isActive()) return;
        _Game_Actor_releaseUnequippableItems.call(this, forcing);
    };

    NUSV_BattlePreview.ensureWeaponEquipped = function(actor, skillId) {
        if (!actor || !$dataWeapons) return;
        var targetWtype = 0;
        if (skillId >= 431 && skillId <= 440) {
            targetWtype = skillId - 430;
        } else if ($dataSkills && $dataSkills[skillId]) {
            targetWtype = $dataSkills[skillId].requiredWtypeId1 || 0;
        }
        if (targetWtype > 0) {
            for (var wId = 1; wId < $dataWeapons.length; wId++) {
                var w = $dataWeapons[wId];
                if (w && w.name && w.wtypeId === targetWtype) {
                    actor.forceChangeEquip(0, w);
                    return;
                }
            }
        }
        if (actor.weapons && actor.weapons().length > 0 && actor.weapons()[0]) return;
        for (var wId = 1; wId < $dataWeapons.length; wId++) {
            var w = $dataWeapons[wId];
            if (w && w.name) {
                actor.forceChangeEquip(0, w);
                return;
            }
        }
    };

    NUSV_BattlePreview.setupPreviewBattle = function() {
        // 1. Sync Live Skill from parent window if available
        if (typeof window !== 'undefined' && window.parent && window.parent.BattlePreviewModal) {
            var liveSkill = window.parent.BattlePreviewModal.liveSkillData;
            if (liveSkill && Number(liveSkill.id) === Number(NUSV_BattlePreview.skillId)) {
                NUSV_BattlePreview.applyLiveSkill(liveSkill);
            }
        }

        // 2. Configure Party with EXACTLY ONE Actor (1v1 Solo Duel)
        $gameParty._actors = [];
        var mainActorId = NUSV_BattlePreview.actorId;
        var leaderActor = $gameActors.actor(mainActorId);
        if (leaderActor) {
            var testBattler = null;
            if ($dataSystem && $dataSystem.testBattlers) {
                for (var i = 0; i < $dataSystem.testBattlers.length; i++) {
                    var tb = $dataSystem.testBattlers[i];
                    if (tb && tb.actorId === mainActorId) {
                        testBattler = tb;
                        break;
                    }
                }
            }
            var targetLevel = testBattler ? testBattler.level : 50;
            leaderActor.changeLevel(targetLevel, false);
            if (testBattler && testBattler.equips && testBattler.equips.length > 0) {
                leaderActor.initEquips(testBattler.equips);
            }
            NUSV_BattlePreview.ensureWeaponEquipped(leaderActor, NUSV_BattlePreview.skillId);
            leaderActor.recoverAll();
            leaderActor.gainHp(9999);
            leaderActor.gainMp(9999);
            leaderActor.gainTp(100);
            leaderActor.learnSkill(NUSV_BattlePreview.skillId);
            $gameParty.addActor(mainActorId);
        }

        // 3. Configure Troop with EXACTLY ONE Enemy Dummy (1v1 Solo Duel)
        BattleManager.setup(1, true, false);
        BattleManager.setBattleTest(true);
        $gameTroop.setup(1);

        var enemyId = NUSV_BattlePreview.enemyId || 2;
        if (!$dataEnemies || !$dataEnemies[enemyId] || !$dataEnemies[enemyId].name) {
            enemyId = 2; // Default to Babi Hutan
        }
        NUSV_BattlePreview.enemyId = enemyId;

        var dummyEnemy = new Game_Enemy(enemyId, 280, 440);
        dummyEnemy.recoverAll();
        dummyEnemy.gainHp(999999);
        $gameTroop._enemies = [dummyEnemy];
        $gameTroop.makeUniqueNames();

        // 4. Mute BGM/BGS if requested
        if (NUSV_BattlePreview.mute) {
            AudioManager.stopBgm();
            AudioManager.stopBgs();
        }

        NUSV_BattlePreview.applyHudVisibility();
    };

    NUSV_BattlePreview.applyHudVisibility = function() {
        if (!SceneManager._scene || !(SceneManager._scene instanceof Scene_Battle)) return;
        var scene = SceneManager._scene;
        if (scene._statusWindow) {
            scene._statusWindow.visible = NUSV_BattlePreview.showHud;
        }
        var battlerSprites = (scene._spriteset && scene._spriteset._battlerSprites) ? scene._spriteset._battlerSprites : [];
        battlerSprites.forEach(function(s) {
            if (s && s._ctbIcon) s._ctbIcon.visible = NUSV_BattlePreview.showHud;
        });
    };

    NUSV_BattlePreview.setHud = function(visible) {
        NUSV_BattlePreview.showHud = Boolean(visible);
        NUSV_BattlePreview.applyHudVisibility();
    };

    // ========================================================================
    // 3. SPEED CONTROL (0.5x, 1.0x, 2.0x, etc.)
    // ========================================================================

    var _SceneManager_updateMain = SceneManager.updateMain;
    SceneManager.updateMain = function() {
        if (NUSV_BattlePreview.isActive() && NUSV_BattlePreview.speedMultiplier !== 1.0) {
            var newTime = this._getTimeInMsWithoutMobileSafari();
            var fTime = (newTime - this._currentTime) / 1000;
            if (fTime > 0.25) fTime = 0.25;
            this._currentTime = newTime;
            this._accumulator += fTime * NUSV_BattlePreview.speedMultiplier;
            while (this._accumulator >= this._deltaTime) {
                this.updateInputData();
                this.changeScene();
                this.updateScene();
                this._accumulator -= this._deltaTime;
            }
            this.renderScene();
            this.requestUpdate();
            return;
        }
        _SceneManager_updateMain.call(this);
    };

    NUSV_BattlePreview.setSpeed = function(multiplier) {
        NUSV_BattlePreview.speedMultiplier = Math.max(0.1, Math.min(4.0, Number(multiplier) || 1.0));
        console.log('[NUSV_BattlePreview] Speed set to ' + NUSV_BattlePreview.speedMultiplier + 'x');
    };

    NUSV_BattlePreview.setMute = function(isMuted) {
        NUSV_BattlePreview.mute = Boolean(isMuted);
        if (NUSV_BattlePreview.mute) {
            AudioManager.stopBgm();
            AudioManager.stopBgs();
            AudioManager.stopMe();
        } else {
            BattleManager.playBattleBgm();
        }
    };

    // ========================================================================
    // 4. SCENE BATTLE START & HUD HOOKS
    // ========================================================================

    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        if (NUSV_BattlePreview.isActive()) {
            NUSV_BattlePreview.isBattleReady = true;
            NUSV_BattlePreview.applyHudVisibility();

            // Notify parent modal that battle engine is live
            if (typeof window !== 'undefined' && window.parent && window.parent.BattlePreviewModal) {
                try {
                    window.parent.BattlePreviewModal.onBattleReady();
                } catch (e) {
                    console.warn('[NUSV_BattlePreview] Failed to notify parent modal:', e);
                }
            }

            if (NUSV_BattlePreview.autoCast) {
                setTimeout(function() {
                    NUSV_BattlePreview.replaySkill();
                }, 100);
            }
        }
    };

    var _Scene_Battle_updateStatusWindow = Scene_Battle.prototype.updateStatusWindow;
    Scene_Battle.prototype.updateStatusWindow = function() {
        if (NUSV_BattlePreview.isActive() && !NUSV_BattlePreview.showHud) {
            if (this._statusWindow) this._statusWindow.visible = false;
            return;
        }
        _Scene_Battle_updateStatusWindow.call(this);
    };

    var _Window_BattleStatus_isOpen = Window_BattleStatus.prototype.isOpen;
    Window_BattleStatus.prototype.isOpen = function() {
        if (NUSV_BattlePreview.isActive() && !NUSV_BattlePreview.showHud) return false;
        return _Window_BattleStatus_isOpen.call(this);
    };

    var _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
    Window_BattleStatus.prototype.update = function() {
        _Window_BattleStatus_update.call(this);
        if (NUSV_BattlePreview.isActive() && !NUSV_BattlePreview.showHud) {
            this.visible = false;
        }
    };

    if (typeof Window_CTBIcon !== 'undefined') {
        var _Window_CTBIcon_update = Window_CTBIcon.prototype.update;
        Window_CTBIcon.prototype.update = function() {
            if (NUSV_BattlePreview.isActive() && !NUSV_BattlePreview.showHud) {
                this.visible = false;
                return;
            }
            _Window_CTBIcon_update.call(this);
        };
    }

    // ========================================================================
    // 5. IMMORTAL DUMMY & BATTLE CONTINUITY
    // ========================================================================

    var _BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if (NUSV_BattlePreview.isActive()) {
            // Revive any fallen members so the sandbox never terminates abruptly
            if ($gameTroop && $gameTroop.members) {
                $gameTroop.members().forEach(function(enemy) {
                    if (enemy && enemy.isDead()) {
                        enemy.revive();
                        enemy.recoverAll();
                        enemy.gainHp(999999);
                    }
                });
            }
            if ($gameParty && $gameParty.members) {
                $gameParty.members().forEach(function(act) {
                    if (act && act.isDead()) {
                        act.revive();
                        act.recoverAll();
                    }
                });
            }
            return false;
        }
        return _BattleManager_checkBattleEnd.call(this);
    };

    var _Game_Enemy_die = Game_Enemy.prototype.die;
    Game_Enemy.prototype.die = function() {
        if (NUSV_BattlePreview.isActive()) {
            this._hp = 1;
            return;
        }
        _Game_Enemy_die.call(this);
    };

    var _Game_Troop_setupBattleEvent = Game_Troop.prototype.setupBattleEvent;
    Game_Troop.prototype.setupBattleEvent = function() {
        if (NUSV_BattlePreview.isActive()) return;
        _Game_Troop_setupBattleEvent.call(this);
    };

    // Disable background CTB ticks during preview to prevent turn clock desync
    if (typeof BattleManager.updateCTBPhase === 'function') {
        var _BattleManager_updateCTBPhase = BattleManager.updateCTBPhase;
        BattleManager.updateCTBPhase = function() {
            if (NUSV_BattlePreview.isActive()) return;
            _BattleManager_updateCTBPhase.call(this);
        };
    }

    // Intercept BattleManager.endAction so the preview returns gracefully to idle pose
    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        if (NUSV_BattlePreview.isActive()) {
            if (this._subject) {
                this._subject.onAllActionsEnd();
            }
            this._phase = 'previewIdle';
            if (typeof window !== 'undefined' && window.parent && window.parent.BattlePreviewModal) {
                try {
                    window.parent.BattlePreviewModal.onSkillCompleted();
                } catch (e) {}
            }
            return;
        }
        _BattleManager_endAction.call(this);
    };

    // ========================================================================
    // 6. ACTION EXECUTION & REPLAY CONTROLLER (NATIVE PIPELINE)
    // ========================================================================

    NUSV_BattlePreview.replaySkill = function() {
        var actor = $gameParty ? $gameParty.leader() : null;
        if (!actor) return;
        var skillId = NUSV_BattlePreview.skillId;
        var skill = $dataSkills ? $dataSkills[skillId] : null;
        if (!skill) return;

        // 1. Refuel actor resources & verify weapon
        actor.recoverAll();
        actor.gainHp(9999);
        actor.gainMp(9999);
        actor.gainTp(100);
        actor.learnSkill(skillId);
        NUSV_BattlePreview.ensureWeaponEquipped(actor, skillId);

        // 2. Ensure enemy dummy is alive and healthy at home position
        if ($gameTroop && $gameTroop.members) {
            $gameTroop.members().forEach(function(enemy) {
                if (enemy) {
                    if (enemy.isDead()) enemy.revive();
                    enemy.recoverAll();
                    enemy.gainHp(999999);
                    if (enemy.spriteReturnHome) {
                        try { enemy.spriteReturnHome(); } catch (e) {}
                    }
                    if (typeof enemy.performFinish === 'function') enemy.performFinish();
                    if (typeof enemy.setActionState === 'function') enemy.setActionState('undecided');
                }
            });
        }

        // 3. Reset battler position and motion
        if (actor.spriteReturnHome) {
            try { actor.spriteReturnHome(); } catch(e) {}
        }
        if (typeof actor.performFinish === 'function') {
            actor.performFinish();
        }
        if (typeof actor.setActionState === 'function') {
            actor.setActionState('undecided');
        }

        // 4. Reset ASP3 camera/zoom INSTANTLY (0 frames - NO background tweens or clamp triggers!)
        if ($gameScreen) {
            $gameScreen.clearZoom();
            $gameScreen._cameraDuration = 0;
            $gameScreen._zoomDuration = 0;
            $gameScreen._zoomScaleTarget = 1.0;
            $gameScreen._zoomScale = 1.0;
            $gameScreen._zoomX = Graphics.boxWidth / 2;
            $gameScreen._zoomY = Graphics.boxHeight / 2;
        }
        BattleManager._cameraX = Graphics.boxWidth / 2;
        BattleManager._cameraY = Graphics.boxHeight / 2;
        BattleManager._cameraOffsetX = 0;
        BattleManager._cameraOffsetY = 0;
        BattleManager._cameraFocusGroup = [];
        BattleManager._cameraFocusPosX = 'BASE';
        BattleManager._cameraFocusPosY = 'BASE';
        BattleManager._cameraClamp = true;
        BattleManager._cameraResettingClamp = false;

        // 5. Clean action queue and busy state
        BattleManager._actionList = [];
        BattleManager._targets = [];
        BattleManager._action = null;
        BattleManager._subject = null;
        BattleManager._processingForcedAction = false;
        if (BattleManager._logWindow) {
            BattleManager._logWindow.clear();
        }

        // 6. Build valid Game_Action natively
        var action = new Game_Action(actor);
        action.setSkill(skillId);
        var isForFriend = [7, 8, 9, 10, 11].indexOf(skill.scope) >= 0;
        action.setTarget(isForFriend ? 0 : 0);
        actor._actions = [action];

        // 7. Start Action through Yanfly's NATIVE startAction pipeline
        // (Identical to in-game playtest: setup -> whole -> target -> follow -> finish)
        BattleManager._subject = actor;
        BattleManager._action = action;
        BattleManager.startAction();

        // Notify parent modal
        if (typeof window !== 'undefined' && window.parent && window.parent.BattlePreviewModal) {
            try {
                window.parent.BattlePreviewModal.onSkillFired(skill);
            } catch (e) {}
        }

        console.log('[NUSV_BattlePreview] Replaying Skill #' + skillId + ' (' + skill.name + ') natively');
    };

    // ========================================================================
    // 7. LIVE UNSAVED SKILL DATA SYNCHRONIZATION
    // ========================================================================

    NUSV_BattlePreview.applyLiveSkill = function(skillData) {
        if (!skillData || !skillData.id || !$dataSkills) return;
        var targetSkill = $dataSkills[skillData.id];
        if (!targetSkill) return;

        // Merge live attributes into memory database
        Object.assign(targetSkill, skillData);
        targetSkill.actionsMade = false;

        // Re-process Yanfly Action Sequences from updated note text
        if (typeof DataManager.processMELODYNotetags === 'function') {
            DataManager.processMELODYNotetags([null, targetSkill]);
        }
        if (typeof DataManager.processBECNotetags1 === 'function') {
            DataManager.processBECNotetags1([null, targetSkill]);
        }
        if (typeof DataManager.processBECNotetags2 === 'function') {
            DataManager.processBECNotetags2([null, targetSkill]);
        }
        if (typeof DataManager.processBECNotetags3 === 'function') {
            DataManager.processBECNotetags3([null, targetSkill]);
        }

        console.log('[NUSV_BattlePreview] Applied live unsaved changes for Skill #' + skillData.id);
    };

    // ========================================================================
    // 8. DYNAMIC ACTOR / ENEMY SWITCHING
    // ========================================================================

    NUSV_BattlePreview.switchActor = function(newActorId) {
        NUSV_BattlePreview.actorId = parseInt(newActorId, 10) || 1;
        NUSV_BattlePreview.setupPreviewBattle();
        if (SceneManager._scene && SceneManager._scene._spriteset) {
            var spriteset = SceneManager._scene._spriteset;
            if (spriteset._actorSprites) {
                spriteset._actorSprites.forEach(function(sp) {
                    if (sp && sp.parent) sp.parent.removeChild(sp);
                });
            }
            spriteset.createActors();
        }
        NUSV_BattlePreview.replaySkill();
    };

    NUSV_BattlePreview.switchEnemy = function(newEnemyId) {
        NUSV_BattlePreview.enemyId = parseInt(newEnemyId, 10) || 2;
        NUSV_BattlePreview.setupPreviewBattle();
        if (SceneManager._scene && SceneManager._scene._spriteset) {
            var spriteset = SceneManager._scene._spriteset;
            if (spriteset._enemySprites) {
                spriteset._enemySprites.forEach(function(sp) {
                    if (sp && sp.parent) sp.parent.removeChild(sp);
                });
            }
            spriteset.createEnemies();
        }
        NUSV_BattlePreview.replaySkill();
    };

    NUSV_BattlePreview.switchTroop = function(newTroopId) {
        NUSV_BattlePreview.switchEnemy(newTroopId);
    };

})();
