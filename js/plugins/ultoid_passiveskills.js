/*:
 * @plugindesc Custom Passive Skills Extension for Nusvanir - applies passive states from notetags.
 * @author Nusvanir
 *
 * @help
 * Usage:
 *  - Add the following notetag to Skills, Actors, or Classes' Note box:
 *      <Passive State: 24>
 *    or for multiple states:
 *      <Passive State: 24, 25, 30>
 *
 * Behavior:
 *  - When an actor learns/has a skill (or belongs to a class / has an actor-level tag)
 *    that includes one or more <Passive State: x> tags, the specified State IDs
 *    are applied permanently as passive states (their parameter modifiers work
 *    normally).
 *  - Passive states are applied silently (they will not trigger "state added"
 *    popups at battle start).
 *  - When the skill is forgotten or the source tag is removed (e.g., class change),
 *    the passive state(s) added by this plugin are removed.
 *
 * Notes:
 *  - The plugin only adds/removes state IDs that are listed in the notes.
 *  - It tracks which states it added so it does not remove states applied
 *    by other game systems.
 *
 * Compatibility:
 *  - The plugin aliases a few small Game_Actor methods (`setup`, `learnSkill`,
 *    `forgetSkill`, `changeClass`) to trigger passive state updates. It is
 *    written to minimize conflicts with other plugins.
 */

(function() {
    'use strict';

    var pluginName = 'ultoid_passiveskills';

    // --- Data parsing -------------------------------------------------
    var _ult_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_ult_DataManager_isDatabaseLoaded.call(this)) {
            return false;
        }
        if (!this._ult_passives_parsed) {
            this._ult_passives_parsed = true;
            parsePassiveNotetags($dataActors);
            parsePassiveNotetags($dataClasses);
            parsePassiveNotetags($dataSkills);
        }
        return true;
    };

    function parsePassiveNotetags(dataArray) {
        if (!dataArray) return;
        for (var i = 1; i < dataArray.length; i++) {
            var obj = dataArray[i];
            if (!obj || !obj.note) continue;
            var matches = obj.note.match(/<Passive State:\s*([\d,\s]+)\s*>/gi);
            var out = [];
            if (matches) {
                for (var m = 0; m < matches.length; m++) {
                    var match = /<Passive State:\s*([\d,\s]+)\s*>/i.exec(matches[m]);
                    if (match && match[1]) {
                        var parts = match[1].split(',');
                        for (var p = 0; p < parts.length; p++) {
                            var id = parseInt(parts[p], 10);
                            if (!isNaN(id) && id > 0) out.push(id);
                        }
                    }
                }
            }
            // Remove duplicates and assign
            if (out.length > 0) {
                obj.passiveStates = uniqueArray(out);
            } else {
                obj.passiveStates = [];
            }
        }
    }

    function uniqueArray(arr) {
        var seen = {};
        var res = [];
        for (var i = 0; i < arr.length; i++) {
            var v = arr[i];
            if (!seen[v]) { seen[v] = true; res.push(v); }
        }
        return res;
    }

    // --- Game_Actor: passive state management -------------------------

    Game_Actor.prototype._ult_passiveInit = function() {
        if (!this._ult_passiveStateIds) this._ult_passiveStateIds = [];
    };

    Game_Actor.prototype.updatePassiveStates = function() {
        this._ult_passiveInit();

        var desired = [];

        // Actor-level tags
        var aData = $dataActors[this.actorId()];
        if (aData && aData.passiveStates) desired = desired.concat(aData.passiveStates);

        // Class-level tags
        var cData = this.currentClass();
        if (cData && cData.passiveStates) desired = desired.concat(cData.passiveStates);

        // Skills the actor currently has (learned/available)
        var skills = this.skills();
        for (var i = 0; i < skills.length; i++) {
            var sk = skills[i];
            if (sk && sk.passiveStates) desired = desired.concat(sk.passiveStates);
        }

        desired = uniqueArray(desired || []);

        var currently = this._ult_passiveStateIds || [];

        // Add new passive states (tracked separately so we can remove them later)
        for (var j = 0; j < desired.length; j++) {
            var sid = desired[j];
            if (!this._ult_passiveStateIds.contains(sid)) {
                // Only add if not already present in battler states
                if (this._states.indexOf(sid) === -1) {
                    this._states.push(sid);
                }
                this._ult_passiveStateIds.push(sid);
            }
        }

        // Remove passive states that are no longer desired
        for (var k = 0; k < currently.length; k++) {
            var oldId = currently[k];
            if (desired.indexOf(oldId) === -1) {
                var idx = this._states.indexOf(oldId);
                if (idx !== -1) {
                    this._states.splice(idx, 1);
                }
            }
        }

        // Set tracked list to desired
        this._ult_passiveStateIds = desired.slice();

        // Refresh actor so parameter changes take effect
        this.refresh();
    };

    // Helper: array contains polyfill for MV (if not present)
    if (!Array.prototype.contains) {
        Array.prototype.contains = function(value) {
            return this.indexOf(value) !== -1;
        };
    }

    // --- Aliases: trigger updates when actor data changes -------------
    var _ult_Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _ult_Game_Actor_setup.call(this, actorId);
        this.updatePassiveStates();
    };

    var _ult_Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
    Game_Actor.prototype.learnSkill = function(skillId) {
        _ult_Game_Actor_learnSkill.call(this, skillId);
        this.updatePassiveStates();
    };

    var _ult_Game_Actor_forgetSkill = Game_Actor.prototype.forgetSkill;
    Game_Actor.prototype.forgetSkill = function(skillId) {
        _ult_Game_Actor_forgetSkill.call(this, skillId);
        this.updatePassiveStates();
    };

    var _ult_Game_Actor_changeClass = Game_Actor.prototype.changeClass;
    Game_Actor.prototype.changeClass = function(classId, keepExp) {
        _ult_Game_Actor_changeClass.call(this, classId, keepExp);
        this.updatePassiveStates();
    };

    // Also update when actor gains/loses states by other means? We avoid
    // aliasing too many methods; most common flows are covered above.

})();
