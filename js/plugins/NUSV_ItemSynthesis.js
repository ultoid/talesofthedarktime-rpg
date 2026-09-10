/*:
 * @plugindesc v1.0.0 NUSV Item Synthesis - clean-room crafting/synthesis system for RPG Maker MV.
 * @author OpenAI for Nusvanir
 *
 * @param Menu Command Name
 * @type text
 * @default Synthesis
 *
 * @param Show In Menu
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Default Craft Amount
 * @type number
 * @min 1
 * @default 1
 *
 * @param Craft Sound
 * @type file
 * @dir audio/se/
 * @default Item3
 *
 * @param Show Locked Recipes
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @help
 * ============================================================================
 * NUSV_ItemSynthesis
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy YEP_ItemSynthesis source code.
 *
 * Purpose:
 * - crafting / synthesis for Items, Weapons, and Armors
 * - recipes defined directly in database notetags
 * - material and gold requirements
 * - optional recipe unlocks
 * - custom conditions and custom payment logic
 *
 * Recommended plugin order:
 *
 *   YEP_CoreEngine
 *   YEP_ItemCore
 *   YEP_EquipCore
 *   NUSV_ItemSynthesis
 *
 * ============================================================================
 * RECIPE OUTPUT NOTETAGS
 * ============================================================================
 *
 * Put these notetags on the ITEM / WEAPON / ARMOR you want to craft.
 *
 * <Synthesis Recipe>
 * Item 5: 3
 * Item 8: 1
 * Gold: 500
 * </Synthesis Recipe>
 *
 * The output is the database object containing the recipe.
 *
 * ============================================================================
 * MATERIAL TYPES
 * ============================================================================
 *
 * Inside <Synthesis Recipe>:
 *
 * Item 5: 3
 * Weapon 2: 1
 * Armor 4: 2
 * Gold: 1000
 *
 * ============================================================================
 * OUTPUT AMOUNT
 * ============================================================================
 *
 * <Synthesis Amount: 3>
 *
 * ============================================================================
 * SYNTHESIS CATEGORY
 * ============================================================================
 *
 * <Synthesis Category: Alchemy>
 * <Synthesis Category: Forge>
 * <Synthesis Category: Cooking>
 *
 * ============================================================================
 * RECIPE UNLOCKING
 * ============================================================================
 *
 * <Synthesis Unlock Switch: 25>
 * <Synthesis Unlock Item: 50>
 * <Synthesis Unlock Skill: 30>
 * <Synthesis Unlock Class: 5>
 *
 * ============================================================================
 * CUSTOM CONDITION
 * ============================================================================
 *
 * <Synthesis Requirement>
 * condition = $gameVariables.value(10) >= 3;
 * </Synthesis Requirement>
 *
 * ============================================================================
 * CUSTOM COST
 * ============================================================================
 *
 * <Synthesis Cost Eval>
 * costOk = $gameVariables.value(15) >= 2;
 * </Synthesis Cost Eval>
 *
 * <Synthesis Cost Pay>
 * $gameVariables.setValue(15, $gameVariables.value(15) - 2);
 * </Synthesis Cost Pay>
 *
 * ============================================================================
 * CUSTOM EFFECT AFTER CRAFT
 * ============================================================================
 *
 * <Synthesis Effect>
 * $gameVariables.setValue(20, $gameVariables.value(20) + 1);
 * </Synthesis Effect>
 *
 * ============================================================================
 * SCRIPT CALLS
 * ============================================================================
 *
 * NUSV.ItemSynthesis.canCraft($dataItems[5])
 * NUSV.ItemSynthesis.craft($dataItems[5])
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * NUSVSynthesis Open
 * NUSVSynthesis Craft Item 5
 * NUSVSynthesis Craft Weapon 2
 * NUSVSynthesis Craft Armor 4
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_ItemSynthesis = true;

var NUSV = NUSV || {};
NUSV.ItemSynthesis = NUSV.ItemSynthesis || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_ItemSynthesis';
    var params = PluginManager.parameters(pluginName);

    var menuName = String(params['Menu Command Name'] || 'Synthesis');
    var showInMenu = String(params['Show In Menu'] || 'true') === 'true';
    var defaultCraftAmount = Math.max(1, Number(params['Default Craft Amount'] || 1));
    var craftSound = String(params['Craft Sound'] || 'Item3');
    var showLockedRecipes = String(params['Show Locked Recipes'] || 'false') === 'true';

    function noteValue(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    }

    function multiline(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    }

    function databaseObject(type, id) {
        id = Number(id);
        if (!id || id < 1) return null;
        type = String(type || '').toLowerCase();
        if (type === 'item') return $dataItems[id];
        if (type === 'weapon') return $dataWeapons[id];
        if (type === 'armor') return $dataArmors[id];
        return null;
    }

    function parseRecipe(obj) {
        var result = { ingredients: [], gold: 0 };
        var block = multiline(obj, 'Synthesis Recipe');
        if (!block) return result;

        block.split(/\r?\n/).forEach(function(line) {
            line = line.trim();
            if (!line) return;

            var gold = line.match(/^Gold\s*:\s*(\d+)$/i);
            if (gold) {
                result.gold += Math.max(0, Number(gold[1]) || 0);
                return;
            }

            var entry = line.match(/^(Item|Weapon|Armor)\s+(\d+)\s*:\s*(\d+)$/i);
            if (entry) {
                result.ingredients.push({
                    type: String(entry[1]).toLowerCase(),
                    id: Number(entry[2]),
                    amount: Math.max(1, Number(entry[3]) || 1)
                });
            }
        });

        return result;
    }

    function recipeExists(obj) {
        return !!multiline(obj, 'Synthesis Recipe');
    }

    function outputAmount(obj) {
        var raw = noteValue(obj, 'Synthesis Amount');
        var amount = raw != null ? Number(raw) : defaultCraftAmount;
        if (isNaN(amount)) amount = defaultCraftAmount;
        return Math.max(1, Math.floor(amount));
    }

    function category(obj) {
        return noteValue(obj, 'Synthesis Category') || 'General';
    }

    function partyKnowsSkill(skillId) {
        skillId = Number(skillId);
        return $gameParty.members().some(function(actor) {
            return actor && actor.isLearnedSkill && actor.isLearnedSkill(skillId);
        });
    }

    function partyHasClass(classId) {
        classId = Number(classId);
        return $gameParty.members().some(function(actor) {
            return actor && actor._classId === classId;
        });
    }

    NUSV.ItemSynthesis.isRecipeUnlocked = function(obj) {
        if (!obj || !recipeExists(obj)) return false;

        var raw = noteValue(obj, 'Synthesis Unlock Switch');
        if (raw != null && !$gameSwitches.value(Number(raw))) return false;

        raw = noteValue(obj, 'Synthesis Unlock Item');
        if (raw != null) {
            var unlockItem = $dataItems[Number(raw)];
            if (!unlockItem || !$gameParty.hasItem(unlockItem)) return false;
        }

        raw = noteValue(obj, 'Synthesis Unlock Skill');
        if (raw != null && !partyKnowsSkill(Number(raw))) return false;

        raw = noteValue(obj, 'Synthesis Unlock Class');
        if (raw != null && !partyHasClass(Number(raw))) return false;

        var code = multiline(obj, 'Synthesis Requirement');
        if (code) {
            try {
                var item = obj;
                var party = $gameParty;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                var condition = true;
                eval(code);
                if (!condition) return false;
            } catch (e) {
                console.error(pluginName + ': Synthesis Requirement Error');
                console.error(obj);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    NUSV.ItemSynthesis.recipe = function(obj) {
        return parseRecipe(obj);
    };

    NUSV.ItemSynthesis.hasMaterials = function(obj) {
        if (!obj || !recipeExists(obj)) return false;

        var recipe = parseRecipe(obj);
        if ($gameParty.gold() < recipe.gold) return false;

        for (var i = 0; i < recipe.ingredients.length; ++i) {
            var ing = recipe.ingredients[i];
            var data = databaseObject(ing.type, ing.id);
            if (!data) return false;
            if ($gameParty.numItems(data) < ing.amount) return false;
        }

        var code = multiline(obj, 'Synthesis Cost Eval');
        if (code) {
            try {
                var item = obj;
                var party = $gameParty;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                var costOk = true;
                eval(code);
                if (!costOk) return false;
            } catch (e) {
                console.error(pluginName + ': Synthesis Cost Eval Error');
                console.error(obj);
                console.error(e);
                return false;
            }
        }

        return true;
    };

    NUSV.ItemSynthesis.canCraft = function(obj) {
        return this.isRecipeUnlocked(obj) && this.hasMaterials(obj);
    };

    NUSV.ItemSynthesis.payCost = function(obj) {
        var recipe = parseRecipe(obj);

        if (recipe.gold > 0) $gameParty.loseGold(recipe.gold);

        recipe.ingredients.forEach(function(ing) {
            var data = databaseObject(ing.type, ing.id);
            if (data) $gameParty.loseItem(data, ing.amount);
        });

        var code = multiline(obj, 'Synthesis Cost Pay');
        if (code) {
            try {
                var item = obj;
                var party = $gameParty;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                eval(code);
            } catch (e) {
                console.error(pluginName + ': Synthesis Cost Pay Error');
                console.error(obj);
                console.error(e);
            }
        }
    };

    NUSV.ItemSynthesis.craft = function(obj) {
        if (!this.canCraft(obj)) return false;

        this.payCost(obj);

        var amount = outputAmount(obj);
        $gameParty.gainItem(obj, amount);

        var code = multiline(obj, 'Synthesis Effect');
        if (code) {
            try {
                var item = obj;
                var party = $gameParty;
                var s = $gameSwitches._data;
                var v = $gameVariables._data;
                eval(code);
            } catch (e) {
                console.error(pluginName + ': Synthesis Effect Error');
                console.error(obj);
                console.error(e);
            }
        }

        if (craftSound) {
            AudioManager.playSe({
                name: craftSound,
                volume: 90,
                pitch: 100,
                pan: 0
            });
        }

        return true;
    };

    NUSV.ItemSynthesis.allRecipes = function() {
        var result = [];
        [$dataItems, $dataWeapons, $dataArmors].forEach(function(group) {
            for (var i = 1; i < group.length; ++i) {
                var obj = group[i];
                if (obj && recipeExists(obj)) result.push(obj);
            }
        });
        return result;
    };

    NUSV.ItemSynthesis.visibleRecipes = function() {
        return this.allRecipes().filter(function(obj) {
            return showLockedRecipes || NUSV.ItemSynthesis.isRecipeUnlocked(obj);
        });
    };

    function Window_NUSVSynthesisList() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVSynthesisList.prototype = Object.create(Window_Selectable.prototype);
    Window_NUSVSynthesisList.prototype.constructor = Window_NUSVSynthesisList;

    Window_NUSVSynthesisList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._data = [];
        this.refresh();
    };

    Window_NUSVSynthesisList.prototype.makeItemList = function() {
        this._data = NUSV.ItemSynthesis.visibleRecipes();
    };

    Window_NUSVSynthesisList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_NUSVSynthesisList.prototype.item = function() {
        return this._data[this.index()];
    };

    Window_NUSVSynthesisList.prototype.isCurrentItemEnabled = function() {
        var obj = this.item();
        return !!(obj && NUSV.ItemSynthesis.canCraft(obj));
    };

    Window_NUSVSynthesisList.prototype.drawItem = function(index) {
        var obj = this._data[index];
        if (!obj) return;

        var rect = this.itemRectForText(index);
        var enabled = NUSV.ItemSynthesis.canCraft(obj);

        this.changePaintOpacity(enabled);
        this.drawItemName(obj, rect.x, rect.y, rect.width - 150);

        var amount = outputAmount(obj);
        var rightText = '[' + category(obj) + ']';
        if (amount > 1) rightText += ' x' + amount;

        this.drawText(rightText, rect.x, rect.y, rect.width, 'right');
        this.changePaintOpacity(true);
    };

    Window_NUSVSynthesisList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    function Window_NUSVSynthesisInfo() {
        this.initialize.apply(this, arguments);
    }

    Window_NUSVSynthesisInfo.prototype = Object.create(Window_Base.prototype);
    Window_NUSVSynthesisInfo.prototype.constructor = Window_NUSVSynthesisInfo;

    Window_NUSVSynthesisInfo.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._item = null;
    };

    Window_NUSVSynthesisInfo.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_NUSVSynthesisInfo.prototype.refresh = function() {
        this.contents.clear();
        var obj = this._item;
        if (!obj) return;

        var y = 0;
        this.drawText('Recipe', 0, y, this.contentsWidth(), 'left');
        y += this.lineHeight();

        var recipe = parseRecipe(obj);

        recipe.ingredients.forEach(function(ing) {
            var data = databaseObject(ing.type, ing.id);
            var owned = data ? $gameParty.numItems(data) : 0;
            var name = data ? data.name : '[Invalid ID]';

            this.drawText(
                name + '  ' + owned + '/' + ing.amount,
                12,
                y,
                this.contentsWidth() - 12,
                'left'
            );
            y += this.lineHeight();
        }, this);

        if (recipe.gold > 0) {
            this.drawText(
                'Gold  ' + $gameParty.gold() + '/' + recipe.gold,
                12,
                y,
                this.contentsWidth() - 12,
                'left'
            );
            y += this.lineHeight();
        }

        y += 6;
        this.drawText('Output: x' + outputAmount(obj), 0, y, this.contentsWidth(), 'left');
    };

    function Scene_NUSVSynthesis() {
        this.initialize.apply(this, arguments);
    }

    Scene_NUSVSynthesis.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_NUSVSynthesis.prototype.constructor = Scene_NUSVSynthesis;

    Scene_NUSVSynthesis.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_NUSVSynthesis.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createListWindow();
        this.createInfoWindow();
    };

    Scene_NUSVSynthesis.prototype.createListWindow = function() {
        var wy = this._helpWindow.height;
        var ww = Math.floor(Graphics.boxWidth * 0.60);
        var wh = Graphics.boxHeight - wy;

        this._listWindow = new Window_NUSVSynthesisList(0, wy, ww, wh);
        this._listWindow.setHelpWindow(this._helpWindow);
        this._listWindow.setHandler('ok', this.onRecipeOk.bind(this));
        this._listWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._listWindow);

        this._listWindow.activate();
        this._listWindow.select(0);
    };

    Scene_NUSVSynthesis.prototype.createInfoWindow = function() {
        var wx = this._listWindow.width;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth - wx;
        var wh = Graphics.boxHeight - wy;

        this._infoWindow = new Window_NUSVSynthesisInfo(wx, wy, ww, wh);
        this.addWindow(this._infoWindow);

        var scene = this;
        var _update = this._listWindow.update;
        this._listWindow.update = function() {
            _update.call(this);
            scene.refreshInfo();
        };

        this.refreshInfo();
    };

    Scene_NUSVSynthesis.prototype.refreshInfo = function() {
        if (!this._listWindow || !this._infoWindow) return;
        var obj = this._listWindow.item();
        this._infoWindow.setItem(obj);
        this._helpWindow.setText(obj ? (obj.description || '') : '');
    };

    Scene_NUSVSynthesis.prototype.onRecipeOk = function() {
        var obj = this._listWindow.item();

        if (obj && NUSV.ItemSynthesis.craft(obj)) {
            this._listWindow.refresh();
            this._infoWindow.refresh();
            this._listWindow.activate();
        } else {
            SoundManager.playBuzzer();
            this._listWindow.activate();
        }
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toLowerCase() !== 'nusvsynthesis') return;

        var sub = String(args[0] || '').toLowerCase();

        if (sub === 'open') {
            SceneManager.push(Scene_NUSVSynthesis);
            return;
        }

        if (sub === 'craft') {
            var type = String(args[1] || '').toLowerCase();
            var id = Number(args[2] || 0);
            var obj = databaseObject(type, id);
            if (obj) NUSV.ItemSynthesis.craft(obj);
        }
    };

    if (showInMenu) {
        var _Window_MenuCommand_addOriginalCommands =
            Window_MenuCommand.prototype.addOriginalCommands;

        Window_MenuCommand.prototype.addOriginalCommands = function() {
            _Window_MenuCommand_addOriginalCommands.call(this);
            this.addCommand(menuName, 'nusvSynthesis', true);
        };

        var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler(
                'nusvSynthesis',
                this.commandNusvSynthesis.bind(this)
            );
        };

        Scene_Menu.prototype.commandNusvSynthesis = function() {
            SceneManager.push(Scene_NUSVSynthesis);
        };
    }

    window.Scene_NUSVSynthesis = Scene_NUSVSynthesis;
    window.Window_NUSVSynthesisList = Window_NUSVSynthesisList;
    window.Window_NUSVSynthesisInfo = Window_NUSVSynthesisInfo;

    NUSV.ItemSynthesis.noteValue = noteValue;
    NUSV.ItemSynthesis.multiline = multiline;
    NUSV.ItemSynthesis.databaseObject = databaseObject;
    NUSV.ItemSynthesis.outputAmount = outputAmount;
    NUSV.ItemSynthesis.category = category;
    NUSV.ItemSynthesis.version = '1.0.0';

})();
