/*:
 * @plugindesc v1.0.0 NUSV Skill Learn - clean-room skill learning system for RPG Maker MV.
 * @author Ultoid
 *
 * @param Menu Command Name
 * @type text
 * @default Learn Skills
 *
 * @param Show In Menu
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Default Learn Cost JP
 * @type number
 * @min 0
 * @default 0
 *
 * @param Learn Sound
 * @type file
 * @dir audio/se/
 * @default Item3
 *
 * @help
 * ============================================================================
 * NUSV_SkillLearn
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_SkillLearnSystem source code.
 *
 * Purpose:
 * - provide a Learn Skills menu
 * - learn skills using JP / Gold / Items
 * - lock skills behind level, class, race, switch, learned skills, or custom JS
 * - integrate with NUSV_JobPoints and NUSV_ClassChange
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_ClassChange
 *   NUSV_JobPoints
 *   NUSV_SkillLearn
 *
 * ============================================================================
 * SKILL NOTETAGS
 * ============================================================================
 *
 * <Learn JP: 25>
 *   Costs 25 JP.
 *
 * <Learn Gold: 1000>
 *   Costs 1000 Gold.
 *
 * <Learn Item: 7, 2>
 *   Requires and consumes 2 of Item ID 7.
 *
 * <Learn Weapon: 5, 1>
 *   Requires and consumes 1 of Weapon ID 5.
 *
 * <Learn Armor: 8, 1>
 *   Requires and consumes 1 of Armor ID 8.
 *
 * <Learn Level: 20>
 *   Actor's current class level must be at least 20 if NUSV_ClassChange is
 *   active. Otherwise, actor level must be at least 20.
 *
 * <Learn Class: 5>
 * <Learn Class: Warrior>
 *   Actor must currently be that class.
 *
 * <Learn Race: Avesari>
 *   Actor must match the requested race.
 *
 * <Learn Switch: 25>
 *   Switch 25 must be ON.
 *
 * <Learn Skill: 30>
 *   Actor must already know Skill ID 30.
 *
 * <Learn Skill Type: 2>
 *   Actor must have the given Skill Type trait.
 *
 * <Hide If Learned>
 *   Skill is hidden after learning.
 *
 * <Learn Description>
 * Advanced sword technique unlocked through mastery.
 * </Learn Description>
 *
 * ============================================================================
 * CUSTOM REQUIREMENT
 * ============================================================================
 *
 * <Learn Requirement>
 * condition = actor.level >= 30;
 * condition = condition && actor.jp() >= 50;
 * </Learn Requirement>
 *
 * Available:
 *
 *   actor
 *   user
 *   skill
 *   s = $gameSwitches._data
 *   v = $gameVariables._data
 *   condition
 *
 * ============================================================================
 * CUSTOM COST
 * ============================================================================
 *
 * <Learn Cost Eval>
 * costOk = $gameVariables.value(10) >= 3;
 * </Learn Cost Eval>
 *
 * <Learn Cost Pay>
 * $gameVariables.setValue(10, $gameVariables.value(10) - 3);
 * </Learn Cost Pay>
 *
 * Use these for special currencies/material systems.
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * actor.nusvCanLearnSkill(skillId)
 * actor.nusvLearnSkill(skillId)
 * actor.nusvSkillLearnCost(skillId)
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVSkillLearn Open
 * NUSVSkillLearn Learn actorId skillId
 *
 * Example:
 *
 *   NUSVSkillLearn Learn 1 25
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_SkillLearn = true;

var NUSV = NUSV || {};
NUSV.SkillLearn = NUSV.SkillLearn || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_SkillLearn';
    var params = PluginManager.parameters(pluginName);

    var menuName = String(params['Menu Command Name'] || 'Learn Skills');
    var showInMenu = String(params['Show In Menu'] || 'true') === 'true';
    var defaultJpCost = Number(params['Default Learn Cost JP'] || 0);
    var learnSound = String(params['Learn Sound'] || 'Item3');

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function hasTag(obj, tag) {
        if (!obj || !obj.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(obj.note);
    }

    function multiline(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var m = obj.note.match(re);
        return m ? m[1].trim() : null;
    }

    function resolveClass(raw) {
        if (raw == null) return null;
        var id = Number(raw);
        if (!isNaN(id) && $dataClasses[id]) return $dataClasses[id];
        var name = String(raw).toLowerCase();
        for (var i = 1; i < $dataClasses.length; ++i) {
            if ($dataClasses[i] && String($dataClasses[i].name).toLowerCase() === name) {
                return $dataClasses[i];
            }
        }
        return null;
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

    function parsePair(raw) {
        if (raw == null) return null;
        var parts = String(raw).split(',');
        var id = Number(parts[0] || 0);
        var amount = Number(parts[1] || 1);
        if (!id || isNaN(amount)) return null;
        return { id: id, amount: Math.max(1, Math.floor(amount)) };
    }

    Game_Actor.prototype.nusvSkillLearnCost = function(skillId) {
        var skill = $dataSkills[Number(skillId)];
        if (!skill) return null;

        var jp = noteValue(skill, 'Learn JP');
        var gold = noteValue(skill, 'Learn Gold');
        var item = parsePair(noteValue(skill, 'Learn Item'));
        var weapon = parsePair(noteValue(skill, 'Learn Weapon'));
        var armor = parsePair(noteValue(skill, 'Learn Armor'));

        return {
            jp: jp != null ? Math.max(0, Number(jp) || 0) : defaultJpCost,
            gold: gold != null ? Math.max(0, Number(gold) || 0) : 0,
            item: item,
            weapon: weapon,
            armor: armor
        };
    };

    Game_Actor.prototype.nusvMeetsSkillLearnRequirements = function(skillId) {
        var skill = $dataSkills[Number(skillId)];
        if (!skill) return false;
        if (this.isLearnedSkill(skill.id)) return false;

        var raw;

        raw = noteValue(skill, 'Learn Level');
        if (raw != null) {
            var learnLevel = this.nusvClassLevel ? this.nusvClassLevel(this._classId) : this.level;
            if (learnLevel < Number(raw)) return false;
        }

        raw = noteValue(skill, 'Learn Class');
        if (raw != null) {
            var cls = resolveClass(raw);
            if (!cls || cls.id !== this._classId) return false;
        }

        raw = noteValue(skill, 'Learn Race');
        if (raw != null) {
            if (actorRace(this).toLowerCase() !== String(raw).toLowerCase()) return false;
        }

        raw = noteValue(skill, 'Learn Switch');
        if (raw != null && !$gameSwitches.value(Number(raw))) return false;

        raw = noteValue(skill, 'Learn Skill');
        if (raw != null && !this.isLearnedSkill(Number(raw))) return false;

        raw = noteValue(skill, 'Learn Skill Type');
        if (raw != null) {
            var stypeId = Number(raw);
            if (this.addedSkillTypes().indexOf(stypeId) < 0) return false;
        }

        var code = multiline(skill, 'Learn Requirement');
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
                console.error(pluginName + ': Learn Requirement Error');
                console.error(skill);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    Game_Actor.prototype.nusvCanPaySkillLearnCost = function(skillId) {
        var skill = $dataSkills[Number(skillId)];
        if (!skill) return false;

        var cost = this.nusvSkillLearnCost(skillId);
        if (!cost) return false;

        if (Imported.NUSV_JobPoints && this.jp) {
            if (this.jp() < cost.jp) return false;
        } else if (cost.jp > 0) {
            return false;
        }

        if ($gameParty.gold() < cost.gold) return false;

        if (cost.item) {
            var item = $dataItems[cost.item.id];
            if (!item || $gameParty.numItems(item) < cost.item.amount) return false;
        }

        if (cost.weapon) {
            var weapon = $dataWeapons[cost.weapon.id];
            if (!weapon || $gameParty.numItems(weapon) < cost.weapon.amount) return false;
        }

        if (cost.armor) {
            var armor = $dataArmors[cost.armor.id];
            if (!armor || $gameParty.numItems(armor) < cost.armor.amount) return false;
        }

        var code = multiline(skill, 'Learn Cost Eval');
        if (code) {
            try {
                var actor = this;
                var user = actor;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                var costOk = true;
                eval(code);
                if (!costOk) return false;
            } catch (e) {
                console.error(pluginName + ': Learn Cost Eval Error');
                console.error(skill);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    Game_Actor.prototype.nusvCanLearnSkill = function(skillId) {
        return this.nusvMeetsSkillLearnRequirements(skillId) &&
               this.nusvCanPaySkillLearnCost(skillId);
    };

    Game_Actor.prototype.nusvPaySkillLearnCost = function(skillId) {
        var skill = $dataSkills[Number(skillId)];
        if (!skill) return false;

        var cost = this.nusvSkillLearnCost(skillId);

        if (cost.jp > 0 && Imported.NUSV_JobPoints && this.loseJp) {
            this.loseJp(cost.jp);
        }

        if (cost.gold > 0) $gameParty.loseGold(cost.gold);

        if (cost.item) $gameParty.loseItem($dataItems[cost.item.id], cost.item.amount);
        if (cost.weapon) $gameParty.loseItem($dataWeapons[cost.weapon.id], cost.weapon.amount);
        if (cost.armor) $gameParty.loseItem($dataArmors[cost.armor.id], cost.armor.amount);

        var code = multiline(skill, 'Learn Cost Pay');
        if (code) {
            try {
                var actor = this;
                var user = actor;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                eval(code);
            } catch (e) {
                console.error(pluginName + ': Learn Cost Pay Error');
                console.error(skill);
                console.error(e);
            }
        }

        return true;
    };

    Game_Actor.prototype.nusvLearnSkill = function(skillId) {
        skillId = Number(skillId);
        if (!this.nusvCanLearnSkill(skillId)) return false;

        this.nusvPaySkillLearnCost(skillId);
        this.learnSkill(skillId);
        this.refresh();

        if (learnSound) {
            AudioManager.playSe({
                name: learnSound,
                volume: 90,
                pitch: 100,
                pan: 0
            });
        }

        return true;
    };

    // -------------------------------------------------------------------------
    // Nusvanir Kitab & Gulungan Pusaka (Skill Scrolls) Compatibility
    // -------------------------------------------------------------------------

    Game_Actor.prototype.nusvCanLearnTmSkill = function(skillId) {
        var skill = $dataSkills[Number(skillId)];
        if (!skill) return false;
        if (this.isLearnedSkill(skill.id)) return false;

        // Ultimate / Signature moves cannot be taught via scrolls
        if (hasTag(skill, 'Scroll Status: Exclusive') ||
            hasTag(skill, 'TM Status: Exclusive') ||
            (noteValue(skill, 'Skill Type') || '').toLowerCase() === 'ultimate') {
            return false;
        }

        var compatRaw = noteValue(skill, 'Scroll Compatible') || noteValue(skill, 'TM Compatible');
        if (!compatRaw) return true; // Universal if no restriction tag

        var allowedList = compatRaw.split(',').map(function(s) {
            return s.trim().toLowerCase();
        });

        var isClassAllowed = function(cName) {
            if (!cName) return false;
            var low = cName.toLowerCase();
            var short = low.replace(/^elementalist\s*-\s*/i, '');
            if (allowedList.indexOf(low) !== -1 || allowedList.indexOf(short) !== -1 || allowedList.indexOf('all') !== -1) {
                return true;
            }
            for (var i = 0; i < allowedList.length; i++) {
                if (allowedList[i].replace(/^elementalist\s*-\s*/i, '') === short) return true;
            }
            return false;
        };

        // 1. Check current active class
        var curClass = $dataClasses[this._classId];
        if (curClass && isClassAllowed(curClass.name)) return true;

        // 2. Check any unlocked/mastered classes (NUSV_ClassChange integration)
        var unlocked = this.nusvUnlockedClasses ? this.nusvUnlockedClasses() : {};
        for (var cid in unlocked) {
            if (unlocked[cid] && $dataClasses[cid]) {
                if (isClassAllowed($dataClasses[cid].name)) {
                    return true;
                }
            }
        }

        return false;
    };

    // Hook Game_Action.testItemEffect to enforce TM compatibility when using items!
    var _NUSV_SL_Game_Action_testItemEffect = Game_Action.prototype.testItemEffect;
    Game_Action.prototype.testItemEffect = function(target, effect) {
        if (effect.code === Game_Action.EFFECT_LEARN_SKILL) {
            if (!target || !target.isActor()) return false;
            if (target.isLearnedSkill(effect.dataId)) return false;
            return target.nusvCanLearnTmSkill(effect.dataId);
        }
        return _NUSV_SL_Game_Action_testItemEffect.call(this, target, effect);
    };

    // Window_MenuActor: Dim and disable actors who are unable to learn the selected TM item
    var _NUSV_SL_Window_MenuActor_isCurrentItemEnabled = Window_MenuActor.prototype.isCurrentItemEnabled;
    Window_MenuActor.prototype.isCurrentItemEnabled = function() {
        if (SceneManager._scene && typeof SceneManager._scene.item === 'function') {
            var item = SceneManager._scene.item();
            if (item && item.effects) {
                for (var i = 0; i < item.effects.length; i++) {
                    if (item.effects[i].code === Game_Action.EFFECT_LEARN_SKILL) {
                        var actor = $gameParty.members()[this.index()];
                        if (!actor) return false;
                        var action = new Game_Action($gameParty.menuActor() || actor);
                        action.setItemObject(item);
                        return action.testApply(actor);
                    }
                }
            }
        }
        return _NUSV_SL_Window_MenuActor_isCurrentItemEnabled ? _NUSV_SL_Window_MenuActor_isCurrentItemEnabled.call(this) : true;
    };

    // Window_MenuStatus: Draw TM status badge ([BISA BELAJAR] / [Sudah Tahu] / [Tidak Kompatibel])
    var _NUSV_SL_Window_MenuStatus_drawItemStatus = Window_MenuStatus.prototype.drawItemStatus;
    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        _NUSV_SL_Window_MenuStatus_drawItemStatus.call(this, index);

        if (SceneManager._scene && typeof SceneManager._scene.item === 'function') {
            var item = SceneManager._scene.item();
            if (item && item.effects) {
                var tmSkillId = 0;
                for (var i = 0; i < item.effects.length; i++) {
                    if (item.effects[i].code === Game_Action.EFFECT_LEARN_SKILL) {
                        tmSkillId = item.effects[i].dataId;
                        break;
                    }
                }
                if (tmSkillId > 0) {
                    var actor = $gameParty.members()[index];
                    if (actor) {
                        var rect = this.itemRect(index);
                        var badgeX = rect.x + rect.width - 165;
                        var badgeY = rect.y + 4;
                        var badgeWidth = 155;

                        if (actor.isLearnedSkill(tmSkillId)) {
                            this.changeTextColor(this.textColor(8)); // Dim grey
                            this.drawText('✔ Sudah Tahu', badgeX, badgeY, badgeWidth, 'right');
                        } else if (actor.nusvCanLearnTmSkill(tmSkillId)) {
                            this.changeTextColor(this.textColor(29)); // Bright cyan/green
                            this.drawText('★ BISA BELAJAR', badgeX, badgeY, badgeWidth, 'right');
                        } else {
                            this.changeTextColor(this.textColor(18)); // Dim red
                            this.drawText('✖ Tidak Kompatibel', badgeX, badgeY, badgeWidth, 'right');
                        }
                        this.resetTextColor();
                    }
                }
            }
        }
    };

    function Window_NUSVSkillLearnList() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVSkillLearnList.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVSkillLearnList.prototype.constructor = Window_NUSVSkillLearnList;

    Window_NUSVSkillLearnList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._data = [];
        this.refresh();
    };

    Window_NUSVSkillLearnList.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.select(0);
        }
    };

    Window_NUSVSkillLearnList.prototype.makeItemList = function() {
        this._data = [];
        if (!this._actor) return;

        var curClass = $dataClasses[this._actor._classId];
        var curClassName = curClass ? curClass.name.toLowerCase() : '';
        var unlocked = this._actor.nusvUnlockedClasses ? this._actor.nusvUnlockedClasses() : {};

        for (var i = 1; i < $dataSkills.length; ++i) {
            var skill = $dataSkills[i];
            if (!skill || !skill.name) continue;

            if (hasTag(skill, 'Hide If Learned') && this._actor.isLearnedSkill(skill.id)) continue;

            var targetClass = noteValue(skill, 'Learn Class');
            if (!targetClass) continue;

            var targetClsObj = resolveClass(targetClass);
            var targetClsId = targetClsObj ? targetClsObj.id : 0;
            var targetClsName = targetClass.trim().toLowerCase();

            // Filter to skills belonging to current class or unlocked classes
            var isCurrent = (targetClsId === this._actor._classId || targetClsName === curClassName);
            var isUnlocked = !!(unlocked[targetClsId]);

            if (isCurrent || isUnlocked) {
                this._data.push(skill);
            }
        }

        // Sort by Learn Level ascending, then skill ID
        this._data.sort(function(a, b) {
            var la = Number(noteValue(a, 'Learn Level') || 0);
            var lb = Number(noteValue(b, 'Learn Level') || 0);
            return la !== lb ? la - lb : a.id - b.id;
        });
    };

    Window_NUSVSkillLearnList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_NUSVSkillLearnList.prototype.item = function() {
        return this._data[this.index()];
    };

    Window_NUSVSkillLearnList.prototype.isCurrentItemEnabled = function() {
        var skill = this.item();
        return !!(skill && this._actor && this._actor.nusvCanLearnSkill(skill.id));
    };

    Window_NUSVSkillLearnList.prototype.drawItem = function(index) {
        var skill = this._data[index];
        if (!skill || !this._actor) return;

        var rect = this.itemRectForText(index);
        var isLearned = this._actor.isLearnedSkill(skill.id);
        var canLearn = this._actor.nusvCanLearnSkill(skill.id);

        this.changePaintOpacity(isLearned || canLearn);
        this.drawItemName(skill, rect.x, rect.y, rect.width - 150);

        if (isLearned) {
            this.changeTextColor(this.textColor(14)); // Gold/Cyan
            this.drawText('✔ Dikuasai', rect.x, rect.y, rect.width, 'right');
            this.resetTextColor();
        } else if (canLearn) {
            var cost = this._actor.nusvSkillLearnCost(skill.id);
            var text = [];
            if (cost.jp > 0) text.push(cost.jp + ' JP');
            if (cost.gold > 0) text.push(cost.gold + ' G');
            this.changeTextColor(this.textColor(0));
            this.drawText(text.join(' / '), rect.x, rect.y, rect.width, 'right');
            this.resetTextColor();
        } else {
            // Not learned, check level requirement
            var reqLvl = Number(noteValue(skill, 'Learn Level') || 0);
            var curLvl = this._actor.nusvClassLevel ? this._actor.nusvClassLevel(this._actor._classId) : this._actor.level;
            this.changePaintOpacity(false);
            if (curLvl < reqLvl) {
                this.changeTextColor(this.textColor(18)); // Reddish
                this.drawText('Butuh Lv ' + reqLvl, rect.x, rect.y, rect.width, 'right');
            } else {
                var cost = this._actor.nusvSkillLearnCost(skill.id);
                this.drawText(cost.jp + ' JP', rect.x, rect.y, rect.width, 'right');
            }
            this.resetTextColor();
        }
        this.changePaintOpacity(true);
    };

    Window_NUSVSkillLearnList.prototype.updateHelp = function() {
        if (!this._helpWindow) return;

        var skill = this.item();
        if (!skill) {
            this._helpWindow.setText('');
            return;
        }

        var customDesc = multiline(skill, 'Learn Description');
        var desc = customDesc || skill.description || '';

        var tier = noteValue(skill, 'Skill Tier') || '';
        var cls = noteValue(skill, 'Learn Class') || '';
        var lvl = noteValue(skill, 'Learn Level') || '';

        var costParts = [];
        if (skill.mpCost > 0) costParts.push(skill.mpCost + ' MP');
        if (skill.tpCost > 0) costParts.push(skill.tpCost + ' SP');
        var hpCost = noteValue(skill, 'HP Cost');
        if (hpCost) costParts.push(hpCost + ' HP');

        var header = '';
        if (cls) header += '[' + cls + (lvl ? ' Lv ' + lvl : '') + '] ';
        if (tier) header += '[Tier ' + tier + '] ';
        if (costParts.length > 0) header += '[Biaya: ' + costParts.join(' / ') + ']';

        var fullText = header ? header + '\n' + desc : desc;
        this._helpWindow.setText(fullText);
    };

    Window_NUSVSkillLearnList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    function Scene_NUSVSkillLearn() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVSkillLearn.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_NUSVSkillLearn.prototype.constructor = Scene_NUSVSkillLearn;

    Scene_NUSVSkillLearn.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_NUSVSkillLearn.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createStatusWindow();
        this.createSkillWindow();
    };

    Scene_NUSVSkillLearn.prototype.createStatusWindow = function() {
        var wy = this._helpWindow.height;
        var ww = 300;
        var wh = Graphics.boxHeight - wy;

        this._statusWindow = new Window_MenuStatus(0, wy);
        this._statusWindow.move(0, wy, ww, wh);
        this._statusWindow.createContents();
        this._statusWindow.refresh();
        this._statusWindow.setHandler('ok', this.onActorOk.bind(this));
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._statusWindow);
        this._statusWindow.activate();
        this._statusWindow.select($gameParty.menuActor().index());
    };

    Scene_NUSVSkillLearn.prototype.createSkillWindow = function() {
        var wx = this._statusWindow.width;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth - wx;
        var wh = Graphics.boxHeight - wy;

        this._skillWindow = new Window_NUSVSkillLearnList(wx, wy, ww, wh);
        this._skillWindow.setHelpWindow(this._helpWindow);
        this._skillWindow.setHandler('ok', this.onSkillOk.bind(this));
        this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
        this.addWindow(this._skillWindow);
    };

    Scene_NUSVSkillLearn.prototype.onActorOk = function() {
        var actor = $gameParty.members()[this._statusWindow.index()];
        if (!actor) return;

        $gameParty.setMenuActor(actor);
        this._skillWindow.setActor(actor);
        this._skillWindow.activate();
        this._skillWindow.select(0);
        this._skillWindow.callUpdateHelp();
    };

    Scene_NUSVSkillLearn.prototype.onSkillOk = function() {
        var actor = $gameParty.menuActor();
        var skill = this._skillWindow.item();

        if (actor && skill && actor.nusvLearnSkill(skill.id)) {
            this._statusWindow.refresh();
            this._skillWindow.refresh();
            this._skillWindow.activate();
        } else {
            SoundManager.playBuzzer();
            this._skillWindow.activate();
        }
    };

    Scene_NUSVSkillLearn.prototype.onSkillCancel = function() {
        this._skillWindow.deactivate();
        this._statusWindow.activate();
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toLowerCase() !== 'nusvskilllearn') return;

        var sub = String(args[0] || '').toLowerCase();

        if (sub === 'open') {
            SceneManager.push(Scene_NUSVSkillLearn);
        } else if (sub === 'learn') {
            var actor = $gameActors.actor(Number(args[1]));
            if (actor) actor.nusvLearnSkill(Number(args[2]));
        }
    };

    if (showInMenu) {
        var _Window_MenuCommand_addOriginalCommands =
            Window_MenuCommand.prototype.addOriginalCommands;

        Window_MenuCommand.prototype.addOriginalCommands = function() {
            _Window_MenuCommand_addOriginalCommands.call(this);
            this.addCommand(menuName, 'nusvSkillLearn', true);
        };

        var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler(
                'nusvSkillLearn',
                this.commandPersonal.bind(this)
            );
        };

        var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
        Scene_Menu.prototype.onPersonalOk = function() {
            if (this._commandWindow.currentSymbol() === 'nusvSkillLearn') {
                SceneManager.push(Scene_NUSVSkillLearn);
                return;
            }
            _Scene_Menu_onPersonalOk.call(this);
        };
    }

    window.Scene_NUSVSkillLearn = Scene_NUSVSkillLearn;
    window.Window_NUSVSkillLearnList = Window_NUSVSkillLearnList;

    NUSV.SkillLearn.noteValue = noteValue;
    NUSV.SkillLearn.multiline = multiline;
    NUSV.SkillLearn.actorRace = actorRace;
    NUSV.SkillLearn.version = '1.0.0';

})();
