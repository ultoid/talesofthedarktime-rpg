/*:
 * @plugindesc v1.0.0 NUSV Map Select Skill - select a learned skill from an actor and store its ID in a variable.
 * @author Ultoid
 *
 * @param Window Width
 * @type number
 * @default 560
 *
 * @param Window Height
 * @type number
 * @default 420
 *
 * @param Show Cost
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_MapSelectSkill
 * ============================================================================
 * Clean-room implementation written from scratch for Nusvanir.
 *
 * Purpose:
 * - show skills learned by a designated actor
 * - optionally filter by Skill Type
 * - save selected Skill ID into a variable
 * - cancel stores 0
 *
 * Plugin Command:
 *
 *   MapSelectSkill actorId skillTypeId variableId
 *
 * Examples:
 *
 *   MapSelectSkill 1 0 10
 *     Actor 1, ALL learned skill types, result -> Variable 10
 *
 *   MapSelectSkill 1 2 10
 *     Actor 1, Skill Type ID 2 only, result -> Variable 10
 *
 * Party-member shortcut:
 *
 *   MapSelectSkillParty partyIndex skillTypeId variableId
 *
 *   MapSelectSkillParty 1 2 10
 *     Party member #1, Skill Type 2, result -> Variable 10
 *
 * Result:
 *   Variable gets selected Skill ID.
 *   Cancel = 0.
 *
 * Recommended order:
 *   YEP_CoreEngine
 *   YEP_SkillCore      (optional)
 *   NUSV_MapSelectSkill
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_MapSelectSkill = true;
var NUSV = NUSV || {};
NUSV.MapSelectSkill = NUSV.MapSelectSkill || {};

(function() {
'use strict';

var pluginName = 'NUSV_MapSelectSkill';
var p = PluginManager.parameters(pluginName);
var WIN_W = Math.max(320, Number(p['Window Width'] || 560));
var WIN_H = Math.max(240, Number(p['Window Height'] || 420));
var SHOW_COST = String(p['Show Cost'] || 'true') === 'true';

function request(actorId, stypeId, variableId) {
    $gameTemp._nusvMapSelectSkill = {
        actorId: Number(actorId || 1),
        stypeId: Math.max(0, Number(stypeId || 0)),
        variableId: Math.max(1, Number(variableId || 1))
    };
    SceneManager.push(Scene_NUSVMapSelectSkill);
}

function Window_NUSVSkillSelect() { this.initialize.apply(this, arguments); }
Window_NUSVSkillSelect.prototype = Object.create(Window_SkillList.prototype);
Window_NUSVSkillSelect.prototype.constructor = Window_NUSVSkillSelect;

Window_NUSVSkillSelect.prototype.initialize = function(x,y,w,h) {
    Window_SkillList.prototype.initialize.call(this,x,y,w,h);
    var req = $gameTemp._nusvMapSelectSkill || {};
    this.setActor($gameActors.actor(req.actorId));
    this._stypeId = req.stypeId || 0;
    this.refresh();
    this.select(0);
};

Window_NUSVSkillSelect.prototype.includes = function(item) {
    if (!item) return false;
    if (this._stypeId <= 0) return true;
    return item.stypeId === this._stypeId;
};

Window_NUSVSkillSelect.prototype.isEnabled = function(item) {
    return !!item;
};

Window_NUSVSkillSelect.prototype.drawSkillCost = function(skill,x,y,width) {
    if (!SHOW_COST) return;
    Window_SkillList.prototype.drawSkillCost.call(this,skill,x,y,width);
};

function Scene_NUSVMapSelectSkill() { this.initialize.apply(this, arguments); }
Scene_NUSVMapSelectSkill.prototype = Object.create(Scene_MenuBase.prototype);
Scene_NUSVMapSelectSkill.prototype.constructor = Scene_NUSVMapSelectSkill;

Scene_NUSVMapSelectSkill.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    var req = $gameTemp._nusvMapSelectSkill || {};
    var actor = $gameActors.actor(req.actorId);
    if (!actor) {
        if (req.variableId) $gameVariables.setValue(req.variableId,0);
        $gameTemp._nusvMapSelectSkill = null;
        this.popScene();
        return;
    }
    var w = Math.min(WIN_W, Graphics.boxWidth);
    var h = Math.min(WIN_H, Graphics.boxHeight);
    var x = Math.floor((Graphics.boxWidth - w) / 2);
    var y = Math.floor((Graphics.boxHeight - h) / 2);
    this._skillWindow = new Window_NUSVSkillSelect(x,y,w,h);
    this._skillWindow.setHandler('ok',this.onOk.bind(this));
    this._skillWindow.setHandler('cancel',this.onCancel.bind(this));
    this.addWindow(this._skillWindow);
    this._skillWindow.activate();
};

Scene_NUSVMapSelectSkill.prototype.finish = function(value) {
    var req = $gameTemp._nusvMapSelectSkill;
    if (req) $gameVariables.setValue(req.variableId,Number(value || 0));
    $gameTemp._nusvMapSelectSkill = null;
    this.popScene();
};

Scene_NUSVMapSelectSkill.prototype.onOk = function() {
    var skill = this._skillWindow.item();
    this.finish(skill ? skill.id : 0);
};

Scene_NUSVMapSelectSkill.prototype.onCancel = function() { this.finish(0); };
window.Scene_NUSVMapSelectSkill = Scene_NUSVMapSelectSkill;

var _pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command,args) {
    _pluginCommand.call(this,command,args);
    var cmd = String(command).toLowerCase();
    if (cmd === 'mapselectskill') {
        request(args[0],args[1],args[2]);
    } else if (cmd === 'mapselectskillparty') {
        var index = Math.max(1,Number(args[0] || 1)) - 1;
        var actor = $gameParty.members()[index];
        request(actor ? actor.actorId() : 0,args[1],args[2]);
    }
};

NUSV.MapSelectSkill.open = request;
NUSV.MapSelectSkill.version = '1.0.0';

})();