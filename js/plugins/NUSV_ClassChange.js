/*:
 * @plugindesc v1.1.0 NUSV Class Change - clean-room class change/progression system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Menu Command Name
 * @type text
 * @default Class
 *
 * @param Show In Menu
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Maintain Level
 * @type boolean
 * @on Keep current actor level
 * @off Use per-class level memory
 * @default true
 *
 * @param Restore HP MP
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Allow Same Class
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @help
 * ============================================================================
 * NUSV_ClassChange
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_ClassChangeCore source code.
 *
 * Purpose:
 * - provide a Class Change menu
 * - lock/unlock classes with requirements
 * - support class progression by Tier
 * - preserve or remember class levels
 * - support event/script based class unlocks
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_ClassChange
 *
 * If NUSV_JobPoints / NUSV_SkillLearn are added later, place them below this.
 *
 * ============================================================================
 * CLASS NOTETAGS
 * ============================================================================
 *
 * <Class Tier: 2>
 *   Informational tier value used by Nusvanir progression.
 *
 * <Class Max Level: 20>
 *   Actor cannot level above 20 while using this class.
 *   This caps the actor's normal max level for the active class.
 *
 * <Class Description>
 * Offensive fighter specializing in heavy weapons.
 * </Class Description>
 *
 * <Class Change Level: 20>
 *   Actor must be at least level 20.
 *
 * <Class Change Switch: 15>
 *   Switch 15 must be ON.
 *
 * <Class Change Item: 7>
 *   Party must possess Item ID 7.
 *
 * <Class Change Weapon: 5>
 *   Party must possess Weapon ID 5.
 *
 * <Class Change Armor: 8>
 *   Party must possess Armor ID 8.
 *
 * <Class Change From: 1>
 * <Class Change From: Fighter>
 *   Actor must currently be the specified class.
 *
 * <Class Change Actor: 3>
 *   Only Actor ID 3 can select this class.
 *
 * <Class Change Race: Avesari>
 *   Requires the actor to have matching race data.
 *
 * Race lookup tries:
 *   actor._nusvRace
 *   actor.actor().meta.Race
 *   <Race: Avesari> in Actor notes
 *
 * Multiple requirements can be combined.
 *
 * ============================================================================
 * CUSTOM REQUIREMENT
 * ============================================================================
 *
 * <Class Change Requirement>
 * condition = actor.level >= 30;
 * condition = condition && $gameSwitches.value(20);
 * </Class Change Requirement>
 *
 * Available:
 *
 *   actor
 *   user
 *   cls
 *   s = $gameSwitches._data
 *   v = $gameVariables._data
 *   condition
 *
 * ============================================================================
 * CLASS LOCKING
 * ============================================================================
 *
 * By default every class is available unless it has requirements OR is locked
 * by script/plugin command.
 *
 * Plugin Commands:
 *
 *   NUSVClass Unlock 5
 *   NUSVClass Lock 5
 *   NUSVClass Change 1 5
 *
 * Meaning:
 *
 *   Unlock Class ID 5 globally.
 *   Lock Class ID 5 globally.
 *   Change Actor ID 1 to Class ID 5.
 *
 * Script Calls:
 *
 *   $gameSystem.nusvUnlockClass(5);
 *   $gameSystem.nusvLockClass(5);
 *   $gameSystem.nusvIsClassUnlocked(5);
 *
 *   actor.nusvCanChangeClass(5);
 *   actor.nusvChangeClass(5);
 *   actor.nusvClassTier();
 *   actor.nusvClassMaxLevel();
 *
 * ============================================================================
 * CLASS LEVEL MEMORY
 * ============================================================================
 *
 * Maintain Level = ON
 *   Current actor level is kept when changing class.
 *
 * Maintain Level = OFF
 *   Each actor remembers a separate level for each class.
 *   When returning to a previous class, its remembered level is restored.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * Tier 5 and Tier 6 classes can remain non-playable simply by adding:
 *
 *   <Class Change Switch: 999>
 *
 * and never turning that switch ON until future implementation.
 *
 * Or lock them at game start using:
 *
 *   $gameSystem.nusvLockClass(classId);
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ClassChange = true;

var NUSV = NUSV || {};
NUSV.ClassChange = NUSV.ClassChange || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ClassChange';
    var params = PluginManager.parameters(pluginName);

    var menuName = String(params['Menu Command Name'] || 'Class');
    var showInMenu = String(params['Show In Menu'] || 'true') === 'true';
    var maintainLevel = String(params['Maintain Level'] || 'true') === 'true';
    var restoreHpMp = String(params['Restore HP MP'] || 'true') === 'true';
    var allowSameClass = String(params['Allow Same Class'] || 'false') === 'true';

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function multiline(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function classByName(name) {
        name = String(name || '').trim().toLowerCase();
        for (var i = 1; i < $dataClasses.length; ++i) {
            var cls = $dataClasses[i];
            if (cls && String(cls.name).toLowerCase() === name) return cls;
        }
        return null;
    }

    function resolveClass(raw) {
        if (raw == null) return null;
        var id = Number(raw);
        if (!isNaN(id) && $dataClasses[id]) return $dataClasses[id];
        return classByName(raw);
    }

    function classMaxLevel(cls) {
        var raw = noteValue(cls, 'Class Max Level');
        if (raw == null) return null;

        var value = Math.floor(Number(raw));
        return isNaN(value) ? null : Math.max(1, value);
    }

    function actorRace(actor) {
        if (!actor) return '';

        if (actor._nusvRace) return String(actor._nusvRace);

        var data = actor.actor ? actor.actor() : null;
        if (!data) return '';

        if (data.meta && data.meta.Race) return String(data.meta.Race);

        var raw = noteValue(data, 'Race');
        return raw != null ? String(raw) : '';
    }

    function hasExplicitRequirements(cls) {
        if (!cls || !cls.note) return false;
        return /<Class Change (Level|Switch|Item|Weapon|Armor|From|Actor|Race)\s*:/i.test(cls.note) ||
               /<Class Change Requirement>/i.test(cls.note);
    }

    // -------------------------------------------------------------------------
    // Game_System
    // -------------------------------------------------------------------------

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._nusvUnlockedClasses = this._nusvUnlockedClasses || {};
        this._nusvLockedClasses = this._nusvLockedClasses || {};
    };

    Game_System.prototype.nusvUnlockClass = function(classId) {
        classId = Number(classId);
        if (!$dataClasses[classId]) return;
        this._nusvUnlockedClasses = this._nusvUnlockedClasses || {};
        this._nusvLockedClasses = this._nusvLockedClasses || {};
        this._nusvUnlockedClasses[classId] = true;
        delete this._nusvLockedClasses[classId];
    };

    Game_System.prototype.nusvLockClass = function(classId) {
        classId = Number(classId);
        if (!$dataClasses[classId]) return;
        this._nusvUnlockedClasses = this._nusvUnlockedClasses || {};
        this._nusvLockedClasses = this._nusvLockedClasses || {};
        this._nusvLockedClasses[classId] = true;
        delete this._nusvUnlockedClasses[classId];
    };

    Game_System.prototype.nusvIsClassUnlocked = function(classId) {
        classId = Number(classId);
        this._nusvUnlockedClasses = this._nusvUnlockedClasses || {};
        this._nusvLockedClasses = this._nusvLockedClasses || {};

        if (this._nusvLockedClasses[classId]) return false;
        if (this._nusvUnlockedClasses[classId]) return true;

        var cls = $dataClasses[classId];
        if (!cls) return false;

        // Classes with no explicit requirements are open by default.
        return !hasExplicitRequirements(cls);
    };

    // -------------------------------------------------------------------------
    // Game_Actor
    // -------------------------------------------------------------------------

    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this._nusvClassLevels = this._nusvClassLevels || {};
        this._nusvClassLevels[this._classId] = this._level;
        this._nusvBaseLevel = this._nusvBaseLevel || this._level;
    };

    Game_Actor.prototype.nusvClassTier = function() {
        var cls = this.currentClass();
        var raw = noteValue(cls, 'Class Tier');
        var value = Number(raw);
        return isNaN(value) ? 0 : value;
    };

    Game_Actor.prototype.nusvClassMaxLevel = function(classId) {
        classId = Number(classId || this._classId);
        var cls = $dataClasses[classId];
        return classMaxLevel(cls);
    };

    var _Game_Actor_maxLevel = Game_Actor.prototype.maxLevel;
    Game_Actor.prototype.maxLevel = function() {
        var base = _Game_Actor_maxLevel ? _Game_Actor_maxLevel.call(this) : 99;
        var classMax = this.nusvClassMaxLevel ? this.nusvClassMaxLevel(this._classId) : null;
        if (classMax == null) return base;
        return Math.min(base, classMax);
    };

    Game_Actor.prototype.nusvClampLevelToClassMax = function(classId) {
        classId = Number(classId || this._classId);
        var classMax = this.nusvClassMaxLevel(classId);
        if (classMax == null || this._level <= classMax) return;

        this._level = classMax;
        this._exp[classId] = this.expForLevel(this._level);
        this.refresh();
    };

    Game_Actor.prototype.nusvClassLevel = function(classId) {
        classId = Number(classId || this._classId);
        var level;
        var maxLevel = this.nusvClassMaxLevel ? this.nusvClassMaxLevel(classId) : null;

        if (classId === this._classId || maintainLevel) {
            level = this.level;
            return maxLevel == null ? level : Math.min(level, maxLevel);
        }

        this._nusvClassLevels = this._nusvClassLevels || {};
        level = Number(this._nusvClassLevels[classId] || 1);
        return maxLevel == null ? level : Math.min(level, maxLevel);
    };

    Game_Actor.prototype.nusvBaseLevel = function() {
        this._nusvClassLevels = this._nusvClassLevels || {};

        var level = Math.max(1, Number(this._nusvBaseLevel || 0), Number(this._level || 1));
        Object.keys(this._nusvClassLevels).forEach(function(classId) {
            level = Math.max(level, Number(this._nusvClassLevels[classId] || 1));
        }, this);

        this._nusvBaseLevel = level;
        return level;
    };

    var _Game_Actor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function() {
        if (_Game_Actor_levelUp) _Game_Actor_levelUp.call(this);
        this.nusvClampLevelToClassMax(this._classId);
        this._nusvClassLevels = this._nusvClassLevels || {};
        this._nusvClassLevels[this._classId] = this._level;
        this._nusvBaseLevel = Math.max(Number(this._nusvBaseLevel || 1), this._level);
    };

    var _Game_Actor_levelDown = Game_Actor.prototype.levelDown;
    Game_Actor.prototype.levelDown = function() {
        if (_Game_Actor_levelDown) _Game_Actor_levelDown.call(this);
        this._nusvClassLevels = this._nusvClassLevels || {};
        this._nusvClassLevels[this._classId] = this._level;
    };

    Game_Actor.prototype.nusvCanChangeClass = function(classId) {
        classId = Number(classId);
        var cls = $dataClasses[classId];
        if (!cls) return false;

        if (!allowSameClass && this._classId === classId) return false;

        // Global lock/unlock.
        if ($gameSystem._nusvLockedClasses && $gameSystem._nusvLockedClasses[classId]) {
            return false;
        }
        if (!$gameSystem.nusvIsClassUnlocked(classId) && !hasExplicitRequirements(cls)) {
            return false;
        }

        var raw;

        raw = noteValue(cls, 'Class Change Actor');
        if (raw != null && Number(raw) !== this.actorId()) return false;

        raw = noteValue(cls, 'Class Change Level');
        if (raw != null && this.level < Number(raw)) return false;

        raw = noteValue(cls, 'Class Change Switch');
        if (raw != null && !$gameSwitches.value(Number(raw))) return false;

        raw = noteValue(cls, 'Class Change Item');
        if (raw != null) {
            var item = $dataItems[Number(raw)];
            if (!item || !$gameParty.hasItem(item)) return false;
        }

        raw = noteValue(cls, 'Class Change Weapon');
        if (raw != null) {
            var weapon = $dataWeapons[Number(raw)];
            if (!weapon || !$gameParty.hasItem(weapon, true)) return false;
        }

        raw = noteValue(cls, 'Class Change Armor');
        if (raw != null) {
            var armor = $dataArmors[Number(raw)];
            if (!armor || !$gameParty.hasItem(armor, true)) return false;
        }

        raw = noteValue(cls, 'Class Change From');
        if (raw != null) {
            var fromClass = resolveClass(raw);
            if (!fromClass || fromClass.id !== this._classId) return false;
        }

        raw = noteValue(cls, 'Class Change Race');
        if (raw != null) {
            if (actorRace(this).toLowerCase() !== String(raw).toLowerCase()) {
                return false;
            }
        }

        var code = multiline(cls, 'Class Change Requirement');
        if (code) {
            try {
                var actor = this;
                var user = actor;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                var condition = true;

                eval(code);

                if (!condition) return false;
            } catch (e) {
                console.error(pluginName + ': Class Change Requirement Error');
                console.error(cls);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    Game_Actor.prototype.nusvChangeClass = function(classId) {
        classId = Number(classId);
        if (!$dataClasses[classId]) return false;
        if (!this.nusvCanChangeClass(classId) && this._classId !== classId) return false;

        this._nusvClassLevels = this._nusvClassLevels || {};

        var oldClassId = this._classId;
        this._nusvClassLevels[oldClassId] = this._level;
        this._nusvBaseLevel = Math.max(this.nusvBaseLevel(), this._level);

        var oldHpRate = this.mhp > 0 ? this.hp / this.mhp : 1;
        var oldMpRate = this.mmp > 0 ? this.mp / this.mmp : 1;

        if (maintainLevel) {
            this.changeClass(classId, true);
            this.nusvClampLevelToClassMax(classId);
        } else {
            var targetLevel = this._nusvClassLevels[classId] || 1;
            this.changeClass(classId, false);
            var maxLevel = this.nusvClassMaxLevel(classId) || targetLevel;
            this._level = Math.min(maxLevel, Math.max(1, targetLevel));
            this.initExp();
            this._exp[classId] = this.expForLevel(this._level);
            this.refresh();
        }

        if (restoreHpMp) {
            this.setHp(this.mhp);
            this.setMp(this.mmp);
        } else {
            this.setHp(Math.max(1, Math.floor(this.mhp * oldHpRate)));
            this.setMp(Math.floor(this.mmp * oldMpRate));
        }

        this.refresh();
        return true;
    };

    Game_Actor.prototype.nusvClassDescription = function(classId) {
        var cls = $dataClasses[Number(classId)];
        if (!cls) return '';
        var text = multiline(cls, 'Class Description');
        return text || '';
    };

    // -------------------------------------------------------------------------
    // Plugin Commands
    // -------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toLowerCase() !== 'nusvclass') return;

        var sub = String(args[0] || '').toLowerCase();

        if (sub === 'unlock') {
            $gameSystem.nusvUnlockClass(Number(args[1]));
        } else if (sub === 'lock') {
            $gameSystem.nusvLockClass(Number(args[1]));
        } else if (sub === 'change') {
            var actor = $gameActors.actor(Number(args[1]));
            if (actor) actor.nusvChangeClass(Number(args[2]));
        }
    };

    // -------------------------------------------------------------------------
    // Class list window
    // -------------------------------------------------------------------------

    function Window_NUSVClassList() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVClassList.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVClassList.prototype.constructor = Window_NUSVClassList;

    Window_NUSVClassList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._data = [];
        this.refresh();
    };

    Window_NUSVClassList.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.select(0);
        }
    };

    Window_NUSVClassList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_NUSVClassList.prototype.item = function() {
        return this._data[this.index()];
    };

    Window_NUSVClassList.prototype.makeItemList = function() {
        this._data = [];
        if (!this._actor) return;

        for (var i = 1; i < $dataClasses.length; ++i) {
            var cls = $dataClasses[i];
            if (cls) this._data.push(cls);
        }
    };

    Window_NUSVClassList.prototype.isCurrentItemEnabled = function() {
        var cls = this.item();
        return !!(cls && this._actor && this._actor.nusvCanChangeClass(cls.id));
    };

    Window_NUSVClassList.prototype.drawItem = function(index) {
        var cls = this._data[index];
        if (!cls) return;

        var rect = this.itemRectForText(index);
        var enabled = this._actor && this._actor.nusvCanChangeClass(cls.id);
        var tier = Number(noteValue(cls, 'Class Tier') || 0);
        var isHeader = /^--.*--$/.test(String(cls.name || ''));
        var classLevel = this._actor && this._actor.nusvClassLevel ?
            this._actor.nusvClassLevel(cls.id) : 1;
        var classMax = this._actor && this._actor.nusvClassMaxLevel ?
            this._actor.nusvClassMaxLevel(cls.id) : null;
        var rightText = '';

        if (!isHeader) {
            rightText = 'Lv' + classLevel;
            if (classMax != null) rightText += '/' + classMax;
        }
        if (tier > 0) rightText += (rightText ? '  ' : '') + 'T' + tier;

        this.changePaintOpacity(enabled);
        this.drawText(cls.name, rect.x, rect.y, rect.width - 140, 'left');
        this.drawText(rightText, rect.x, rect.y, rect.width, 'right');

        this.changePaintOpacity(true);
    };

    Window_NUSVClassList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    Window_NUSVClassList.prototype.updateHelp = function() {
        if (!this._helpWindow) return;

        var cls = this.item();
        if (!cls || !this._actor) {
            this._helpWindow.setText('');
            return;
        }

        var desc = this._actor.nusvClassDescription(cls.id);
        if (!allowSameClass && this._actor._classId === cls.id) {
            if (desc) desc += '\n';
            desc += 'Already in this Class';
        } else if (!this._actor.nusvCanChangeClass(cls.id)) {
            if (desc) desc += '\n';
            desc += '[Locked / Requirements not met]';
        }

        this._helpWindow.setText(desc);
    };

    function Window_NUSVClassStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVClassStatus.prototype = Object.create(Window_MenuStatus.prototype);
    Window_NUSVClassStatus.prototype.constructor = Window_NUSVClassStatus;

    Window_NUSVClassStatus.prototype.numVisibleRows = function() {
        return Math.min(3, Math.max(1, $gameParty.members().length));
    };

    Window_NUSVClassStatus.prototype.drawItemImage = function(index) {
        var actor = $gameParty.members()[index];
        if (!actor) return;

        var rect = this.itemRect(index);
        var size = Math.min(104, rect.height - 8);
        var x = rect.x + 4;
        var y = rect.y + Math.floor((rect.height - size) / 2);

        this.changePaintOpacity(actor.isBattleMember ? actor.isBattleMember() : true);
        this.drawActorFace(actor, x, y, size, size);
        this.changePaintOpacity(true);
    };

    Window_NUSVClassStatus.prototype.drawItemStatus = function(index) {
        var actor = $gameParty.members()[index];
        if (!actor) return;

        var rect = this.itemRect(index);
        var x = rect.x + 120;
        var y = rect.y + Math.max(0, Math.floor((rect.height - this.lineHeight() * 2) / 2));
        var width = rect.width - x - this.textPadding();
        var cls = actor.currentClass ? actor.currentClass() : null;
        var className = cls && cls.name ? cls.name : '';
        var classLevel = actor.nusvClassLevel ? actor.nusvClassLevel() : actor.level;
        var classLevelText = className + ' Lv. ' + classLevel;

        this.drawActorName(actor, x, y, width);
        this.changeTextColor(this.systemColor());
        this.drawText(classLevelText, x, y + this.lineHeight(), width);
        this.resetTextColor();
    };

    function Window_NUSVClassConfirm() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVClassConfirm.prototype = Object.create(Window_Command.prototype);
    Window_NUSVClassConfirm.prototype.constructor = Window_NUSVClassConfirm;

    Window_NUSVClassConfirm.prototype.initialize = function() {
        this._className = '';
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = Math.floor((Graphics.boxWidth - width) / 2);
        var y = Math.floor((Graphics.boxHeight - height) / 2);
        Window_Command.prototype.initialize.call(this, x, y);
        this.hide();
        this.deactivate();
    };

    Window_NUSVClassConfirm.prototype.windowWidth = function() {
        return Math.min(560, Graphics.boxWidth);
    };

    Window_NUSVClassConfirm.prototype.numVisibleRows = function() {
        return 3;
    };

    Window_NUSVClassConfirm.prototype.makeCommandList = function() {
        this.addCommand('', 'message', false);
        this.addCommand('Yes', 'yes', true);
        this.addCommand('No', 'no', true);
    };

    Window_NUSVClassConfirm.prototype.setClass = function(cls) {
        this._className = cls && cls.name ? String(cls.name) : '';
        this.refresh();
        this.select(1);
    };

    Window_NUSVClassConfirm.prototype.drawItem = function(index) {
        if (index === 0) {
            var rect = this.itemRectForText(index);
            var text = 'Are you sure you want to change to ' + this._className + '?';
            this.changePaintOpacity(true);
            this.drawText(text, rect.x, rect.y, rect.width, 'center');
            return;
        }

        Window_Command.prototype.drawItem.call(this, index);
    };

    // -------------------------------------------------------------------------
    // Scene
    // -------------------------------------------------------------------------

    function Scene_NUSVClassChange() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVClassChange.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_NUSVClassChange.prototype.constructor = Scene_NUSVClassChange;

    Scene_NUSVClassChange.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_NUSVClassChange.prototype.createHelpWindow = function() {
        this._helpWindow = new Window_Help(3);
        this.addWindow(this._helpWindow);
    };

    Scene_NUSVClassChange.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createStatusWindow();
        this.createClassWindow();
        this.createConfirmWindow();
    };

    Scene_NUSVClassChange.prototype.createStatusWindow = function() {
        var wy = this._helpWindow.height;
        var ww = 320;
        var wh = Graphics.boxHeight - wy;

        this._statusWindow = new Window_NUSVClassStatus(0, wy);
        this._statusWindow.move(0, wy, ww, wh);
        this._statusWindow.createContents();
        this._statusWindow.refresh();
        this._statusWindow.setHandler('ok', this.onActorOk.bind(this));
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._statusWindow);
        this._statusWindow.activate();
        this._statusWindow.select($gameParty.menuActor().index());
    };

    Scene_NUSVClassChange.prototype.createClassWindow = function() {
        var wx = this._statusWindow.width;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth - wx;
        var wh = Graphics.boxHeight - wy;

        this._classWindow = new Window_NUSVClassList(wx, wy, ww, wh);
        this._classWindow.setHelpWindow(this._helpWindow);
        this._classWindow.setHandler('ok', this.onClassOk.bind(this));
        this._classWindow.setHandler('cancel', this.onClassCancel.bind(this));
        this.addWindow(this._classWindow);
    };

    Scene_NUSVClassChange.prototype.createConfirmWindow = function() {
        this._confirmWindow = new Window_NUSVClassConfirm();
        this._confirmWindow.setHandler('yes', this.onConfirmYes.bind(this));
        this._confirmWindow.setHandler('no', this.onConfirmNo.bind(this));
        this._confirmWindow.setHandler('cancel', this.onConfirmNo.bind(this));
        this.addWindow(this._confirmWindow);
        this._pendingClass = null;
    };

    Scene_NUSVClassChange.prototype.onActorOk = function() {
        var actor = $gameParty.members()[this._statusWindow.index()];
        if (!actor) return;

        $gameParty.setMenuActor(actor);
        this._classWindow.setActor(actor);
        this._classWindow.activate();
        this._classWindow.select(0);
        this._classWindow.callUpdateHelp();
    };

    Scene_NUSVClassChange.prototype.onClassOk = function() {
        var actor = $gameParty.menuActor();
        var cls = this._classWindow.item();

        if (!actor || !cls || !actor.nusvCanChangeClass(cls.id)) {
            SoundManager.playBuzzer();
            this._classWindow.activate();
            return;
        }

        this._pendingClass = cls;
        this._confirmWindow.setClass(cls);
        this._confirmWindow.show();
        this._confirmWindow.activate();
    };

    Scene_NUSVClassChange.prototype.onConfirmYes = function() {
        var actor = $gameParty.menuActor();
        var cls = this._pendingClass;

        this._confirmWindow.hide();
        this._confirmWindow.deactivate();
        this._pendingClass = null;

        if (actor && cls && actor.nusvChangeClass(cls.id)) {
            SoundManager.playEquip();
            this._statusWindow.refresh();
            this._classWindow.refresh();
        } else {
            SoundManager.playBuzzer();
        }

        this._classWindow.activate();
    };

    Scene_NUSVClassChange.prototype.onConfirmNo = function() {
        this._pendingClass = null;
        this._confirmWindow.hide();
        this._confirmWindow.deactivate();
        this._classWindow.activate();
    };

    Scene_NUSVClassChange.prototype.onClassCancel = function() {
        this._classWindow.deactivate();
        this._statusWindow.activate();
    };

    // -------------------------------------------------------------------------
    // Menu integration
    // -------------------------------------------------------------------------

    if (showInMenu) {
        var _Window_MenuCommand_addOriginalCommands =
            Window_MenuCommand.prototype.addOriginalCommands;

        Window_MenuCommand.prototype.addOriginalCommands = function() {
            _Window_MenuCommand_addOriginalCommands.call(this);
            this.addCommand(menuName, 'nusvClassChange', true);
        };

        var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler(
                'nusvClassChange',
                this.commandPersonal.bind(this)
            );
        };

        var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
        Scene_Menu.prototype.onPersonalOk = function() {
            if (this._commandWindow.currentSymbol() === 'nusvClassChange') {
                SceneManager.push(Scene_NUSVClassChange);
                return;
            }
            _Scene_Menu_onPersonalOk.call(this);
        };
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    window.Scene_NUSVClassChange = Scene_NUSVClassChange;
    window.Window_NUSVClassList = Window_NUSVClassList;
    window.Window_NUSVClassStatus = Window_NUSVClassStatus;
    window.Window_NUSVClassConfirm = Window_NUSVClassConfirm;

    NUSV.ClassChange.noteValue = noteValue;
    NUSV.ClassChange.multiline = multiline;
    NUSV.ClassChange.actorRace = actorRace;
    NUSV.ClassChange.classMaxLevel = classMaxLevel;
    NUSV.ClassChange.version = '1.1.0';

})();
