/*:
 * @plugindesc v1.1.0 NUSV Damage Core - clean-room damage core for RPG Maker MV.
 * @author Ultoid
 *
 * @param Default Damage Cap
 * @type number
 * @min 0
 * @default 9999
 *
 * @param Default Heal Cap
 * @type number
 * @min 0
 * @default 9999
 *
 * @param Enable Damage Cap
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param Round Final Damage
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @help
 * ============================================================================
 * NUSV_DamageCore
 * ============================================================================
 *
 * Clean-room implementation written from scratch for Nusvanir.
 * It does NOT contain or copy code from YEP_DamageCore.
 *
 * Goal:
 * - provide a familiar Damage Core workflow
 * - support multiline damage formulas
 * - support damage/heal caps
 * - support bypassing caps
 * - keep compatibility with standard RPG Maker MV damage calculation
 *
 * Recommended order:
 *
 *   YEP_CoreEngine
 *   YEP_BattleEngineCore
 *   YEP_SkillCore
 *   NUSV_DamageCore
 *   other battle plugins
 *
 * ============================================================================
 * SKILL / ITEM NOTETAGS
 * ============================================================================
 *
 * 1. Multiline Damage Formula
 *
 * <Damage Formula>
 * value = a.atk * 4;
 * value -= b.def * 2;
 * </Damage Formula>
 *
 * Available variables:
 *
 *   a       = action subject
 *   b       = target
 *   user    = action subject
 *   subject = action subject
 *   target  = target
 *   item    = current skill/item
 *   s       = $gameSwitches._data
 *   v       = $gameVariables._data
 *   value   = resulting base damage
 *
 * The formula should assign the result to "value".
 *
 * Example:
 *
 * <Damage Formula>
 * value = a.atk * 5 - b.def * 2;
 * if (b.isStateAffected(10)) value *= 1.25;
 * </Damage Formula>
 *
 *
 * 2. Damage Cap
 *
 * <Damage Cap: 50000>
 *
 * Limits positive damage from that skill/item to 50000.
 *
 *
 * 3. Heal Cap
 *
 * <Heal Cap: 50000>
 *
 * Limits healing from that skill/item to 50000.
 *
 *
 * 4. Bypass Damage Cap
 *
 * <Bypass Damage Cap>
 *
 * Ignores damage and healing caps for that skill/item.
 *
 * ============================================================================
 * ACTOR / CLASS / ENEMY / WEAPON / ARMOR / STATE NOTETAGS
 * ============================================================================
 *
 * These trait objects can also use:
 *
 * <Damage Cap: 50000>
 * <Heal Cap: 50000>
 * <Bypass Damage Cap>
 *
 * Battler-side caps are combined as follows:
 * - the highest applicable Damage Cap is used
 * - the highest applicable Heal Cap is used
 * - if any applicable trait has <Bypass Damage Cap>, caps are bypassed
 *
 * Skill/item-specific caps take priority over battler-side caps.
 *
 * ============================================================================
 * NUSVIR EXTENSIONS
 * ============================================================================
 *
 * Optional extra notetags provided for Nusvanir.
 *
 * <Armor Penetration: 15%>
 *   Physical damage ignores 15% of target DEF in standard-style formulas
 *   that use the helper function below.
 *
 * <Magic Penetration: 15%>
 *   Magical damage ignores 15% of target MDF in formulas using the helper.
 *
 * <Critical Damage: +25%>
 *   Adds +25% to the default critical multiplier.
 *
 * These may be placed on Skills, Items, Actors, Classes, Enemies,
 * Weapons, Armors, or States.
 *
 * Formula helper functions:
 *
 *   nusvDef(b)
 *   nusvMdf(b)
 *
 * Example:
 *
 * <Damage Formula>
 * value = a.atk * 4 - nusvDef(b) * 2;
 * </Damage Formula>
 *
 * If the action/subject has <Armor Penetration: 25%>,
 * nusvDef(b) returns 75% of the target's DEF.
 *
 * ============================================================================
 * MP/SP GAIN POPUPS
 * ============================================================================
 *
 * When a battler gains MP or SP during battle, an extra popup is shown:
 *
 *   +10 MP
 *   +10 SP
 *
 * A gain that is fully absorbed by the maximum value shows:
 *
 *   MP Max
 *   SP Max
 *
 * The popup only shows the amount that was actually gained after the cap is
 * applied, and MP/SP gains outside of battle show nothing. The built-in
 * recovery popup for the same gain is suppressed so only one popup is shown.
 *
 * ============================================================================
 * NOTES
 * ============================================================================
 *
 * - Standard MV formula field still works when no <Damage Formula> is present.
 * - Element Rate, PDR/MDR, REC, Critical, Variance, and Guard are still applied.
 * - Damage type follows the normal RPG Maker MV database setting.
 * - This plugin is designed for RPG Maker MV.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.NUSV_DamageCore = true;

var NUSV = NUSV || {};
NUSV.DamageCore = NUSV.DamageCore || {};

(function() {
    'use strict';

    var pluginName = 'NUSV_DamageCore';
    var params = PluginManager.parameters(pluginName);

    NUSV.DamageCore.defaultDamageCap = Number(params['Default Damage Cap'] || 9999);
    NUSV.DamageCore.defaultHealCap = Number(params['Default Heal Cap'] || 9999);
    NUSV.DamageCore.enableDamageCap = String(params['Enable Damage Cap'] || 'true') === 'true';
    NUSV.DamageCore.roundFinalDamage = String(params['Round Final Damage'] || 'true') === 'true';

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    NUSV.DamageCore.noteValue = function(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '\\s*:\\s*([^>]+)>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    };

    NUSV.DamageCore.hasTag = function(obj, tag) {
        if (!obj || !obj.note) return false;
        var re = new RegExp('<' + tag + '>', 'i');
        return re.test(obj.note);
    };

    NUSV.DamageCore.percentValue = function(obj, tag) {
        var raw = this.noteValue(obj, tag);
        if (raw == null) return 0;
        raw = raw.replace(/\s/g, '');
        var value = parseFloat(raw.replace('%', ''));
        if (isNaN(value)) return 0;
        return value / 100;
    };

    NUSV.DamageCore.signedPercentValue = function(obj, tag) {
        return this.percentValue(obj, tag);
    };

    NUSV.DamageCore.multilineTag = function(obj, tag) {
        if (!obj || !obj.note) return null;
        var re = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
        var match = obj.note.match(re);
        return match ? match[1].trim() : null;
    };

    NUSV.DamageCore.traitObjects = function(battler) {
        if (!battler || !battler.traitObjects) return [];
        return battler.traitObjects().filter(function(obj) {
            return !!obj;
        });
    };

    NUSV.DamageCore.actionObjects = function(action) {
        var result = [];
        if (action && action.item && action.item()) result.push(action.item());
        if (action && action.subject) {
            var subject = action.subject();
            result = result.concat(this.traitObjects(subject));
        }
        return result;
    };

    NUSV.DamageCore.highestTagNumber = function(objects, tag, fallback) {
        var found = [];
        objects.forEach(function(obj) {
            var raw = NUSV.DamageCore.noteValue(obj, tag);
            if (raw != null) {
                var n = Number(raw);
                if (!isNaN(n)) found.push(n);
            }
        });
        if (found.length <= 0) return fallback;
        return Math.max.apply(null, found);
    };

    NUSV.DamageCore.anyHasTag = function(objects, tag) {
        return objects.some(function(obj) {
            return NUSV.DamageCore.hasTag(obj, tag);
        });
    };

    NUSV.DamageCore.sumPercentTag = function(objects, tag) {
        return objects.reduce(function(sum, obj) {
            return sum + NUSV.DamageCore.percentValue(obj, tag);
        }, 0);
    };

    // -------------------------------------------------------------------------
    // Action Notetag Access
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvDamageFormula = function() {
        return NUSV.DamageCore.multilineTag(this.item(), 'Damage Formula');
    };

    Game_Action.prototype.nusvBypassDamageCap = function() {
        var item = this.item();
        if (NUSV.DamageCore.hasTag(item, 'Bypass Damage Cap')) return true;
        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.anyHasTag(objects, 'Bypass Damage Cap');
    };

    Game_Action.prototype.nusvDamageCap = function() {
        var itemRaw = NUSV.DamageCore.noteValue(this.item(), 'Damage Cap');
        if (itemRaw != null && !isNaN(Number(itemRaw))) return Number(itemRaw);

        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.highestTagNumber(
            objects,
            'Damage Cap',
            NUSV.DamageCore.defaultDamageCap
        );
    };

    Game_Action.prototype.nusvHealCap = function() {
        var itemRaw = NUSV.DamageCore.noteValue(this.item(), 'Heal Cap');
        if (itemRaw != null && !isNaN(Number(itemRaw))) return Number(itemRaw);

        var objects = NUSV.DamageCore.traitObjects(this.subject());
        return NUSV.DamageCore.highestTagNumber(
            objects,
            'Heal Cap',
            NUSV.DamageCore.defaultHealCap
        );
    };

    Game_Action.prototype.nusvArmorPenetration = function() {
        return Math.max(
            0,
            NUSV.DamageCore.sumPercentTag(
                NUSV.DamageCore.actionObjects(this),
                'Armor Penetration'
            )
        );
    };

    Game_Action.prototype.nusvMagicPenetration = function() {
        return Math.max(
            0,
            NUSV.DamageCore.sumPercentTag(
                NUSV.DamageCore.actionObjects(this),
                'Magic Penetration'
            )
        );
    };

    Game_Action.prototype.nusvCriticalBonus = function() {
        return NUSV.DamageCore.sumPercentTag(
            NUSV.DamageCore.actionObjects(this),
            'Critical Damage'
        );
    };

    // -------------------------------------------------------------------------
    // Damage Formula
    // -------------------------------------------------------------------------

    var _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
    Game_Action.prototype.evalDamageFormula = function(target) {
        var customFormula = this.nusvDamageFormula();
        if (!customFormula) {
            return _Game_Action_evalDamageFormula.call(this, target);
        }

        try {
            var item = this.item();
            var a = this.subject();
            var b = target;
            var user = a;
            var subject = a;
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var value = 0;
            var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
            var action = this;

            var nusvDef = function(t) {
                if (!t) return 0;
                var pen = Math.min(1, Math.max(0, action.nusvArmorPenetration()));
                return t.def * (1 - pen);
            };

            var nusvMdf = function(t) {
                if (!t) return 0;
                var pen = Math.min(1, Math.max(0, action.nusvMagicPenetration()));
                return t.mdf * (1 - pen);
            };

            // Clean-room formula evaluator.
            // The content of customFormula comes from the developer's own database.
            eval(customFormula);

            value = Number(value);
            if (isNaN(value)) value = 0;
            return Math.max(value, 0) * sign;
        } catch (e) {
            console.error(pluginName + ': Damage Formula Error');
            console.error(this.item());
            console.error(e);
            return 0;
        }
    };

    // -------------------------------------------------------------------------
    // Critical
    // -------------------------------------------------------------------------

    var _Game_Action_applyCritical = Game_Action.prototype.applyCritical;
    Game_Action.prototype.applyCritical = function(damage) {
        var base = _Game_Action_applyCritical.call(this, damage);
        var bonus = this.nusvCriticalBonus();
        if (!bonus) return base;

        // Default MV critical is x3. The bonus is additive to the multiplier:
        // +25% => x3.25 instead of x3.00
        var normalCriticalMultiplier = 3.0;
        var desiredMultiplier = normalCriticalMultiplier + bonus;
        if (normalCriticalMultiplier === 0) return base;
        return base * (desiredMultiplier / normalCriticalMultiplier);
    };

    // -------------------------------------------------------------------------
    // Final Damage Flow
    // -------------------------------------------------------------------------

    Game_Action.prototype.nusvApplyDamageCap = function(value) {
        if (!NUSV.DamageCore.enableDamageCap) return value;
        if (this.nusvBypassDamageCap()) return value;

        if (value > 0) {
            var damageCap = Math.max(0, this.nusvDamageCap());
            if (damageCap > 0) value = Math.min(value, damageCap);
        } else if (value < 0) {
            var healCap = Math.max(0, this.nusvHealCap());
            if (healCap > 0) value = Math.max(value, -healCap);
        }

        return value;
    };

    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        // Reproduce the standard MV damage flow so the cap is guaranteed
        // to happen at the final stage, after guard/variance/critical.
        var item = this.item();
        var baseValue = this.evalDamageFormula(target);
        var value = baseValue * this.calcElementRate(target);

        if (this.isPhysical()) value *= target.pdr;
        if (this.isMagical()) value *= target.mdr;
        if (baseValue < 0) value *= target.rec;
        if (critical) value = this.applyCritical(value);

        value = this.applyVariance(value, item.damage.variance);
        value = this.applyGuard(value, target);
        value = this.nusvApplyDamageCap(value);

        if (NUSV.DamageCore.roundFinalDamage) {
            value = Math.round(value);
        }

        return value;
    };

    // -------------------------------------------------------------------------
    // MP/SP Gain Popups (Turn / Action End Unified Notifications)
    // -------------------------------------------------------------------------

    // Native damage popups only cover MP/SP loss. Resource gains are accumulated
    // throughout an action sequence and displayed at action/turn end as a single,
    // crisp notification (e.g. "+10 SP") instead of stacking during strikes.
    // Zero gains (e.g. already full SP/MP) are completely suppressed.

    var resourceGainPopupFontSize = 24;
    var resourceGainPopupFontFace = 'BattleFont, sans-serif';

    Game_Battler.prototype.nusvResourceGainPopups = function() {
        if (!this._nusvResourceGainPopups) this._nusvResourceGainPopups = [];
        return this._nusvResourceGainPopups;
    };

    Game_Battler.prototype.nusvHasResourceGainPopups = function() {
        return this.nusvResourceGainPopups().length > 0;
    };

    Game_Battler.prototype.nusvClearResourceGainPopups = function() {
        this._nusvResourceGainPopups = [];
    };

    Game_Battler.prototype.nusvPendingResourceGains = function() {
        if (!this._nusvPendingResourceGains) {
            this._nusvPendingResourceGains = { mp: 0, tp: 0 };
        }
        return this._nusvPendingResourceGains;
    };

    Game_Battler.prototype.nusvClearPendingResourceGains = function() {
        this._nusvPendingResourceGains = { mp: 0, tp: 0 };
    };

    Game_Battler.prototype.nusvRecordResourceGain = function(type, amount) {
        if (typeof $gameParty === 'undefined' || !$gameParty.inBattle() || !amount || amount <= 0) return;
        var pending = this.nusvPendingResourceGains();
        if (type === 'tp') {
            pending.tp += Math.round(amount);
        } else if (type === 'mp') {
            pending.mp += Math.round(amount);
        }
    };

    // Backward compatibility helper
    Game_Battler.prototype.nusvRecordResourceGainPopup = function(type, amount) {
        this.nusvRecordResourceGain(type, amount);
    };

    Game_Battler.prototype.nusvFlushPendingResourcePopups = function() {
        if (!this._nusvPendingResourceGains) return;
        if (this.isDead && this.isDead()) {
            this.nusvClearPendingResourceGains();
            return;
        }
        var pending = this._nusvPendingResourceGains;
        var popups = this.nusvResourceGainPopups();

        if (pending.tp > 0) {
            popups.push({ type: 'tp', amount: pending.tp });
        }
        if (pending.mp > 0) {
            popups.push({ type: 'mp', amount: pending.mp });
        }

        this.nusvClearPendingResourceGains();
    };

    Game_Battler.prototype.nusvResourceGainPopupLabel = function(type) {
        if (type === 'tp') {
            return (typeof TextManager !== 'undefined' && TextManager.tpA) ? TextManager.tpA : 'SP';
        }
        return (typeof TextManager !== 'undefined' && TextManager.mpA) ? TextManager.mpA : 'MP';
    };

    Game_Battler.prototype.nusvResourceGainPopupText = function(popup) {
        var label = this.nusvResourceGainPopupLabel(popup.type);
        return '+' + popup.amount + ' ' + label;
    };

    var _Game_Battler_gainMp = Game_Battler.prototype.gainMp;
    Game_Battler.prototype.gainMp = function(value) {
        var before = this.mp;
        _Game_Battler_gainMp.call(this, value);
        var actualGain = this.mp - before;
        if (actualGain > 0) this.nusvRecordResourceGain('mp', actualGain);
    };

    var _Game_Battler_gainTp = Game_Battler.prototype.gainTp;
    Game_Battler.prototype.gainTp = function(value) {
        var before = this.tp;
        _Game_Battler_gainTp.call(this, value);
        var actualGain = this.tp - before;
        if (actualGain > 0) this.nusvRecordResourceGain('tp', actualGain);
    };

    var _Game_Battler_gainSilentTp = Game_Battler.prototype.gainSilentTp;
    Game_Battler.prototype.gainSilentTp = function(value) {
        var before = this.tp;
        _Game_Battler_gainSilentTp.call(this, value);
        var actualGain = this.tp - before;
        if (actualGain > 0) this.nusvRecordResourceGain('tp', actualGain);
    };

    var _Game_Battler_startDamagePopup = Game_Battler.prototype.startDamagePopup;
    Game_Battler.prototype.startDamagePopup = function() {
        // Native damage popups only cover MP damage/loss.
        // MP gains are deferred to action/turn end for clean, unified display.
        if (this._result && this._result.mpDamage < 0) {
            this._result.mpDamage = 0;
        }
        _Game_Battler_startDamagePopup.call(this);
    };

    var _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        _Game_Battler_onTurnEnd.call(this);
        this.nusvFlushPendingResourcePopups();
    };

    if (typeof BattleManager !== 'undefined') {
        BattleManager.nusvHasAnyPendingResourceGains = function() {
            if (!this.allBattleMembers) return false;
            var members = this.allBattleMembers();
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (m && m._nusvPendingResourceGains) {
                    if (m._nusvPendingResourceGains.tp > 0 || m._nusvPendingResourceGains.mp > 0) {
                        return true;
                    }
                }
            }
            return false;
        };

        BattleManager.nusvFlushAllPendingResourcePopups = function() {
            if (this.allBattleMembers) {
                var members = this.allBattleMembers();
                for (var i = 0; i < members.length; i++) {
                    var battler = members[i];
                    if (battler && battler.nusvFlushPendingResourcePopups) {
                        battler.nusvFlushPendingResourcePopups();
                    }
                }
            }
        };

        // When finish actions are prepared, ensure:
        // 1. PERFORM FINISH (sprites start returning to home position)
        // 2. WAIT FOR MOVEMENT (wait until actor & targets reach home position)
        // 3. NUSV RESOURCE GAIN (spawn SP/MP popup at home position & wait before turn end)
        var _BattleManager_createFinishActions = BattleManager.createFinishActions;
        BattleManager.createFinishActions = function() {
            _BattleManager_createFinishActions.call(this);
            if (!this._actionList) this._actionList = [];
            var list = this._actionList;

            var alreadyHasNusvGain = false;
            var performFinishIdx = -1;
            var hasWaitMovementAfter = false;

            for (var i = 0; i < list.length; i++) {
                var cmd = (list[i][0] || '').toUpperCase();
                if (cmd === 'NUSV RESOURCE GAIN') {
                    alreadyHasNusvGain = true;
                } else if (cmd === 'PERFORM FINISH') {
                    performFinishIdx = i;
                } else if (performFinishIdx >= 0 && (cmd === 'WAIT FOR MOVEMENT' || cmd === 'WAIT FOR MOVEMENT: USER')) {
                    hasWaitMovementAfter = true;
                }
            }

            if (!alreadyHasNusvGain) {
                if (performFinishIdx < 0) {
                    list.push(['PERFORM FINISH', []]);
                    performFinishIdx = list.length - 1;
                }
                if (!hasWaitMovementAfter) {
                    list.splice(performFinishIdx + 1, 0, ['WAIT FOR MOVEMENT', []]);
                }
                list.push(['NUSV RESOURCE GAIN', []]);
            }
        };

        // Hook action sequence to execute NUSV RESOURCE GAIN
        var _BattleManager_processActionSequence = BattleManager.processActionSequence;
        BattleManager.processActionSequence = function(actionName, actionArgs) {
            if (actionName === 'NUSV RESOURCE GAIN') {
                return this.actionNusvResourceGain();
            }
            return _BattleManager_processActionSequence.call(this, actionName, actionArgs);
        };

        BattleManager.actionNusvResourceGain = function() {
            var hasGains = this.nusvHasAnyPendingResourceGains();
            this.nusvFlushAllPendingResourcePopups();
            if (hasGains) {
                // Actor is now at home position (posisi awal).
                // Wait 35 frames (~0.58s) so the player clearly sees the SP/MP
                // gain notification floating up before the turn finishes/switches.
                if (this.actionWait) {
                    return this.actionWait(35);
                } else if (this._logWindow) {
                    this._logWindow._waitCount = 35;
                    return false;
                }
            }
            return true;
        };

        var _BattleManager_endAction = BattleManager.endAction;
        BattleManager.endAction = function() {
            this.nusvFlushAllPendingResourcePopups();
            _BattleManager_endAction.call(this);
        };

        var _BattleManager_endBattle = BattleManager.endBattle;
        BattleManager.endBattle = function(result) {
            if (this.allBattleMembers) {
                var members = this.allBattleMembers();
                for (var i = 0; i < members.length; i++) {
                    var battler = members[i];
                    if (battler) {
                        if (battler.nusvClearPendingResourceGains) battler.nusvClearPendingResourceGains();
                        if (battler.nusvClearResourceGainPopups) battler.nusvClearResourceGainPopups();
                    }
                }
            }
            _BattleManager_endBattle.call(this, result);
        };
    }

    Sprite_Damage.prototype.nusvSetupResourceGainPopup = function(battler, popup, index) {
        var text = battler.nusvResourceGainPopupText(popup);
        var isTp = popup.type === 'tp';
        var fontSize = resourceGainPopupFontSize;
        var tw = Math.ceil(text.length * (fontSize * 0.75)) + 40;
        var th = fontSize + 16;
        var bitmap = new Bitmap(tw, th);
        var ctx = bitmap._context;

        bitmap.fontFace = resourceGainPopupFontFace;
        bitmap.fontSize = fontSize;
        bitmap.fontBold = true;
        bitmap.textColor = isTp ? '#FACC15' : '#00E5FF';
        bitmap.outlineColor = isTp ? '#451A03' : '#082F49';
        bitmap.outlineWidth = 4;

        if (ctx) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;
        }

        bitmap.drawText(text, 0, 0, tw, th, 'center');

        var sprite = new Sprite(bitmap);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1.0;
        sprite.x = 0;
        sprite.y = 0;
        sprite.dy = -1.2;
        sprite.scale.x = 1.15;
        sprite.scale.y = 1.15;
        this._duration = 65;
        this.addChild(sprite);
    };

    Sprite_Battler.prototype.nusvCreateResourceGainSprite = function(battler, popup, index) {
        var sprite = new Sprite_Damage();
        var yOffset = (index || 0) * 26;
        sprite.x = this.x + this.damageOffsetX();
        sprite.y = this.y + this.damageOffsetY() - yOffset;
        sprite.nusvSetupResourceGainPopup(battler, popup, index);
        if (this.pushDamageSprite) {
            this.pushDamageSprite(sprite);
        } else {
            this._damages.push(sprite);
        }
        if (BattleManager._spriteset) {
            BattleManager._spriteset.addChild(sprite);
        } else if (this.parent) {
            this.parent.addChild(sprite);
        }
    };

    Sprite_Battler.prototype.nusvUpdateResourceGainPopups = function() {
        var battler = this._battler;
        if (!battler || !battler.nusvHasResourceGainPopups()) return;
        if (battler.isSpriteVisible && !battler.isSpriteVisible()) {
            battler.nusvClearResourceGainPopups();
            return;
        }
        var popups = battler.nusvResourceGainPopups();
        var index = 0;
        while (popups.length > 0) {
            this.nusvCreateResourceGainSprite(battler, popups.shift(), index);
            index++;
        }
    };

    var _Sprite_Battler_updateDamagePopup = Sprite_Battler.prototype.updateDamagePopup;
    Sprite_Battler.prototype.updateDamagePopup = function() {
        _Sprite_Battler_updateDamagePopup.call(this);
        this.nusvUpdateResourceGainPopups();
    };

    // -------------------------------------------------------------------------
    // Script-call helpers
    // -------------------------------------------------------------------------

    NUSV.DamageCore.version = '1.2.0';

})();
