/*:
 * @plugindesc Custom State Effects for Tales of The Dark Time (Ultoid).
 * @author Ultoid / Nusvanir
 * 
 * @param Poison State ID
 * @type state
 * @default 12
 * 
 * @param Burn State ID
 * @type state
 * @default 13
 * 
 * @param Paralyze State ID
 * @type state
 * @default 15
 * 
 * @param Paralyze Stun ID
 * @type state
 * @default 19
 * 
 * @param Confuse State ID
 * @type state
 * @default 17
 * 
 * @param Chill State ID
 * @type state
 * @default 20
 * 
 * @param Freeze State ID
 * @type state
 * @default 21
 * 
 * @param Ice Element ID
 * @type number
 * @default 7
 * 
 * @param Shadow State ID
 * @type state
 * @default 22
 * 
 * @param Fear State ID
 * @type state
 * @default 24
 * 
 * @param Taunt State ID
 * @type state
 * @default 31
 * 
 * @help
 * Plugin ini menangani semua efek state custom untuk Tales of the Dark Time:
 * - Poison (12): DoT 1/16 MHP
 * - Burn (13): DoT 1/12 MHP
 * - Paralyze (15): 10% peluang Stun (19) di awal turn/aksi
 * - Confuse (17): 10% peluang menyerang diri sendiri, sisanya random ally
 * - Chill (20) & Freeze (21): 50% freeze jika diserang es (7)
 * - Shadow (22): Hilang saat menyerang lawan
 * - Fear (24): 50% batal aksi
 * - Taunt (31): Semua lawan dipaksa menyerang target ini, dan target hanya bisa Attack.
 */

(function() {
    var parameters = PluginManager.parameters('ultoid_stateeffect');
    var POISON_ID = Number(parameters['Poison State ID'] || 12);
    var BURN_ID = Number(parameters['Burn State ID'] || 13);
    var PARALYZE_ID = Number(parameters['Paralyze State ID'] || 15);
    var STUN_ID = Number(parameters['Paralyze Stun ID'] || 19);
    var CONFUSE_ID = Number(parameters['Confuse State ID'] || 17);
    var CHILL_ID = Number(parameters['Chill State ID'] || 20);
    var FREEZE_ID = Number(parameters['Freeze State ID'] || 21);
    var ICE_ELEM_ID = Number(parameters['Ice Element ID'] || 7);
    var SHADOW_ID = Number(parameters['Shadow State ID'] || 22);
    var FEAR_ID = Number(parameters['Fear State ID'] || 24);
    var TAUNT_ID = Number(parameters['Taunt State ID'] || 31);

    // =========================================================================
    // DoT (Poison & Burn)
    // =========================================================================
    var _Game_Battler_regenerateAll = Game_Battler.prototype.regenerateAll;
    Game_Battler.prototype.regenerateAll = function() {
        _Game_Battler_regenerateAll.call(this);
        if (this.isAlive()) {
            var damage = 0;
            if (this.isStateAffected(POISON_ID)) {
                damage += Math.ceil(this.mhp / 16);
            }
            if (this.isStateAffected(BURN_ID)) {
                damage += Math.ceil(this.mhp / 12);
            }
            
            if (damage > 0) {
                this.gainHp(-damage);
                this.startDamagePopup();
                this.clearResult();
                if (this.isDead()) {
                    this.performCollapse();
                }
            }
        }
    };

    // =========================================================================
    // Taunt - Restriction (Pokemon style: hanya skill yang memberikan damage)
    // =========================================================================
    var _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
        if (this.isStateAffected(TAUNT_ID)) {
            // Izinkan Normal Attack dan Guard
            if (skill.id !== this.attackSkillId() && skill.id !== this.guardSkillId()) {
                // Cek apakah skill melukai lawan (HP/MP Damage atau Drain)
                var isDamaging = [1, 2, 5, 6].indexOf(skill.damage.type) >= 0;
                if (!isDamaging) {
                    return false; // Kunci jika skill tidak melukai (buff/debuff murni)
                }
            }
        }
        return _Game_BattlerBase_meetsSkillConditions.call(this, skill);
    };
    
    // Taunt Target Selection (Memaksa lawan untuk menyerang taunter)
    var _Game_Unit_randomTarget = Game_Unit.prototype.randomTarget;
    Game_Unit.prototype.randomTarget = function() {
        var taunters = this.aliveMembers().filter(function(member) {
            return member.isStateAffected(TAUNT_ID);
        });
        if (taunters.length > 0) {
            return taunters[Math.floor(Math.random() * taunters.length)];
        }
        return _Game_Unit_randomTarget.call(this);
    };

    var _Game_Unit_smoothTarget = Game_Unit.prototype.smoothTarget;
    Game_Unit.prototype.smoothTarget = function(index) {
        var taunters = this.aliveMembers().filter(function(member) {
            return member.isStateAffected(TAUNT_ID);
        });
        if (taunters.length > 0) {
            return taunters[0]; 
        }
        return _Game_Unit_smoothTarget.call(this, index);
    };

    // =========================================================================
    // Action / Turn Start Effects (Paralyze, Confuse, Fear)
    // =========================================================================
    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        var subject = this._subject;
        
        if (!subject) return _BattleManager_startAction.call(this);

        // Fear Effect (50% Chance to skip)
        if (subject.isStateAffected(FEAR_ID)) {
            if (Math.random() < 0.50) {
                subject.clearActions();
                this._logWindow.addText(subject.name() + " terlalu takut untuk menyerang!");
                // Force end action processing for this subject
                this._phase = 'turn';
                return; 
            }
        }

        // Paralyze Effect (10% Chance to skip/Stun)
        if (subject.isStateAffected(PARALYZE_ID)) {
            if (Math.random() < 0.10) {
                subject.addState(STUN_ID);
                subject.clearActions();
                this._logWindow.addText(subject.name() + " kejang akibat Paralyze dan tidak bisa bergerak!");
                this._phase = 'turn';
                return;
            }
        }
        
        _BattleManager_startAction.call(this);
        
        // Confuse Effect (10% target self, else normal random ally)
        // Dijalankan setelah startAction bawaan memanggil action.makeTargets() 
        // sehingga kita bisa memanipulasi this._targets
        if (subject.isStateAffected(CONFUSE_ID)) {
            if (Math.random() < 0.10) {
                // 10% serang diri sendiri
                this._targets = [subject];
                this._logWindow.addText(subject.name() + " menyerang dirinya sendiri karena kebingungan!");
            } else {
                // 90% serang teman acak
                var allies = subject.friendsUnit().aliveMembers();
                if (allies.length > 0) {
                    var randomAlly = allies[Math.floor(Math.random() * allies.length)];
                    this._targets = [randomAlly];
                }
            }
        }
    };

    // =========================================================================
    // React Effect (Chill -> Freeze)
    // =========================================================================
    var _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function(target, value) {
        _Game_Action_executeDamage.call(this, target, value);
        
        // Memastikan ini adalah damage, bukan heal, dan target terkena Chill (20)
        if (value > 0 && target.isStateAffected(CHILL_ID)) {
            var elements = [];
            if (this.item().damage.elementId < 0) {
                elements = this.subject().attackElements();
            } else {
                elements.push(this.item().damage.elementId);
            }
            
            if (elements.indexOf(ICE_ELEM_ID) >= 0) {
                if (Math.random() < 0.50) {
                    target.removeState(CHILL_ID);
                    target.addState(FREEZE_ID);
                }
            }
        }
    };

    // =========================================================================
    // Conclude Effect (Shadow State)
    // =========================================================================
    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        var subject = this._subject;
        var action = this._action;
        
        // Hilang jika action menargetkan lawan
        if (subject && subject.isStateAffected(SHADOW_ID) && action && action.isForOpponent()) {
            subject.removeState(SHADOW_ID);
        }
        
        _BattleManager_endAction.call(this);
    };
})();
