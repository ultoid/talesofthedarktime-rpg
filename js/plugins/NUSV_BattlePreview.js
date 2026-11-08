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
 * - Equips/learns the selected skill on the chosen actor with infinite MP/SP
 * - Automatically executes the skill against target enemies/dummies
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
    NUSV_BattlePreview.autoCast = getQueryParam('autoCast') !== '0' && getQueryParam('autoCast') !== 'false';
    NUSV_BattlePreview.mute = getQueryParam('mute') === '1' || getQueryParam('mute') === 'true';
    NUSV_BattlePreview.speedMultiplier = parseFloat(getQueryParam('speed')) || 1.0;
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
                ', Troop #' + NUSV_BattlePreview.troopId);

    // ========================================================================
    // 2. ENGINE BOOT HOOKS
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

    NUSV_BattlePreview.ensureWeaponEquipped = function(actor) {
        if (!actor || (actor.weapons && actor.weapons().length > 0)) return;
        if (!$dataWeapons) return;
        for (var wId = 1; wId < $dataWeapons.length; wId++) {
            var w = $dataWeapons[wId];
            if (w && w.name && typeof actor.isEquipWtypeOk === 'function' && actor.isEquipWtypeOk(w.wtypeId)) {
                actor.changeEquip(0, w);
                break;
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

        // 2. Configure 4-Member Party with chosen Actor as Leader (Slot 0)
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
            NUSV_BattlePreview.ensureWeaponEquipped(leaderActor);
            leaderActor.recoverAll();
            leaderActor.gainHp(9999);
            leaderActor.gainMp(9999);
            leaderActor.gainTp(100);
            leaderActor.learnSkill(NUSV_BattlePreview.skillId);
            $gameParty.addActor(mainActorId);
        }

        // Fill companion slots from test battlers (up to 4 members)
        if ($dataSystem && $dataSystem.testBattlers) {
            $dataSystem.testBattlers.forEach(function(tb) {
                if (tb && tb.actorId > 0 && tb.actorId !== mainActorId && $gameParty.members().length < 4) {
                    var companion = $gameActors.actor(tb.actorId);
                    if (companion) {
                        companion.changeLevel(tb.level || 50, false);
                        if (tb.equips) companion.initEquips(tb.equips);
                        NUSV_BattlePreview.ensureWeaponEquipped(companion);
                        companion.recoverAll();
                        $gameParty.addActor(tb.actorId);
                    }
                }
            });
        }

        // 3. Configure Troop
        var troopId = NUSV_BattlePreview.troopId;
        if (troopId > 0) {
            BattleManager.setup(troopId, true, false);
            BattleManager.setBattleTest(true);
            $gameTroop.setup(troopId);
            $gameTroop.members().forEach(function(enemy) {
                if (enemy) {
                    enemy.recoverAll();
                    enemy.gainHp(999999);
                    // Reposition for 1080x720 canvas if default RPG Maker MV X coordinate is too close to left
                    if (enemy._screenX !== undefined && enemy._screenX < 260) {
                        enemy._screenX = Math.round(enemy._screenX * (1080 / 816));
                        if (enemy._screenX < 260) enemy._screenX = 260;
                    }
                }
            });
        }

        // 4. Mute BGM/BGS if requested
        if (NUSV_BattlePreview.mute) {
            AudioManager.stopBgm();
            AudioManager.stopBgs();
        }
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
    // 4. SCENE BATTLE START & AUTO-CAST
    // ========================================================================

    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        if (NUSV_BattlePreview.isActive()) {
            NUSV_BattlePreview.isBattleReady = true;

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
                }, 500);
            }
        }
    };

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

    // ========================================================================
    // 6. ACTION EXECUTION & REPLAY CONTROLLER
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
        NUSV_BattlePreview.ensureWeaponEquipped(actor);

        // 2. Ensure enemy is alive and healthy
        if ($gameTroop && $gameTroop.members) {
            $gameTroop.members().forEach(function(enemy) {
                if (enemy) {
                    if (enemy.isDead()) enemy.revive();
                    enemy.recoverAll();
                    enemy.gainHp(999999);
                    if (typeof enemy.performFinish === 'function') enemy.performFinish();
                    if (typeof enemy.setActionState === 'function') enemy.setActionState('undecided');
                }
            });
        }

        // 3. Reset ASP3 camera/zoom if present
        if (typeof BattleManager.actionResetCamera === 'function') {
            try {
                BattleManager.actionResetCamera([0]);
                BattleManager.actionResetZoom([0]);
            } catch (err) {}
        }

        // 4. Reset battler position and motion
        if (actor.spriteReturnHome) {
            try { actor.spriteReturnHome(); } catch(e) {}
        }
        if (typeof actor.performFinish === 'function') {
            actor.performFinish();
        }
        if (typeof actor.setActionState === 'function') {
            actor.setActionState('undecided');
        }

        // 5. Clear old action queue
        BattleManager._actionList = [];
        BattleManager._targets = [];
        BattleManager._action = null;

        // 6. Determine target index based on scope
        var targetIndex = 0;
        var isForFriend = [7, 8, 9, 10, 11].indexOf(skill.scope) >= 0;
        if (isForFriend) {
            targetIndex = 0;
        } else {
            var aliveEnemies = $gameTroop.aliveMembers();
            if (aliveEnemies.length > 0) {
                targetIndex = aliveEnemies[0].index();
            } else {
                targetIndex = 0;
            }
        }

        // 7. Force Action & Process Immediately (Bypass CTB Wait Phase)
        actor.clearActions();
        actor.forceAction(skillId, targetIndex);
        BattleManager.forceAction(actor);
        if (typeof BattleManager.processForcedAction === 'function') {
            BattleManager.processForcedAction();
        }
        if (typeof BattleManager.isTickBased === 'function' && BattleManager.isTickBased()) {
            BattleManager._phase = 'action';
        }

        // Notify parent modal
        if (typeof window !== 'undefined' && window.parent && window.parent.BattlePreviewModal) {
            try {
                window.parent.BattlePreviewModal.onSkillFired(skill);
            } catch (e) {}
        }

        console.log('[NUSV_BattlePreview] Replaying Skill #' + skillId + ' (' + skill.name + ')');
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
    // 8. DYNAMIC ACTOR / TROOP SWITCHING
    // ========================================================================

    NUSV_BattlePreview.switchActor = function(newActorId) {
        NUSV_BattlePreview.actorId = parseInt(newActorId, 10) || 1;
        var currentActors = $gameParty._actors.slice();
        var filtered = currentActors.filter(function(id) { return id !== NUSV_BattlePreview.actorId; });
        $gameParty._actors = [NUSV_BattlePreview.actorId].concat(filtered);

        var actor = $gameParty.leader();
        if (actor) {
            if (actor.level < 50) actor.changeLevel(50, false);
            NUSV_BattlePreview.ensureWeaponEquipped(actor);
            actor.recoverAll();
            actor.gainHp(9999);
            actor.gainMp(9999);
            actor.gainTp(100);
            actor.learnSkill(NUSV_BattlePreview.skillId);
        }
        if (SceneManager._scene instanceof Scene_Battle && typeof SceneManager._scene.refreshStatus === 'function') {
            SceneManager._scene.refreshStatus();
        }
        NUSV_BattlePreview.replaySkill();
    };

    NUSV_BattlePreview.switchTroop = function(newTroopId) {
        NUSV_BattlePreview.troopId = parseInt(newTroopId, 10) || 2;
        if (SceneManager._scene instanceof Scene_Battle) {
            BattleManager.setup(NUSV_BattlePreview.troopId, true, false);
            BattleManager.setBattleTest(true);
            $gameTroop.setup(NUSV_BattlePreview.troopId);
            $gameTroop.members().forEach(function(enemy) {
                if (enemy) {
                    enemy.recoverAll();
                    enemy.gainHp(999999);
                    if (enemy._screenX !== undefined && enemy._screenX < 260) {
                        enemy._screenX = Math.round(enemy._screenX * (1080 / 816));
                        if (enemy._screenX < 260) enemy._screenX = 260;
                    }
                }
            });
            SceneManager.goto(Scene_Battle);
        }
    };

})();
