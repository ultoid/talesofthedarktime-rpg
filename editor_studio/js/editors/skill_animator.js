/**
 * NUSV Database Studio - Skill Battle & Action Sequence Animator
 * Sideview (SV) Real-time Battle Preview & Action Sequence Visual Editor
 */

const SkillAnimator = {
    // Canvas & Context
    canvas: null,
    ctx: null,
    rafId: null,

    // Playback state
    isPlaying: true,
    isLooping: true,
    speed: 1.0,
    isMuted: false,
    currentTick: 0,
    totalTicks: 120,
    lastFrameTime: 0,
    currentPhase: 'idle', // 'idle' | 'cast' | 'approach' | 'attack' | 'reaction' | 'return'

    // Scene actor & enemy configs
    activeSkill: null,
    selectedActorName: 'Actor1_1',
    selectedEnemyName: 'Actor1_3',
    selectedBattleback1: 'Cobblestones1',
    selectedBattleback2: 'Cobblestones2',

    // Asset Caches
    images: {},
    audioContext: null,
    audioCache: {},

    // Coordinates (Canvas 480x270 - 16:9)
    WIDTH: 480,
    HEIGHT: 270,
    actorHome: { x: 380, y: 190 },
    enemyHome: { x: 100, y: 190 },

    // Dynamic runtime state during sequence
    actorPos: { x: 380, y: 190 },
    actorMotion: 'wait', // 'walk' | 'wait' | 'chant' | 'guard' | 'damage' | 'evade' | 'thrust' | 'swing' | 'missile' | 'skill' | 'spell'
    actorPattern: 1, // 0, 1, 2
    actorPatternCount: 0,
    actorAlpha: 1.0,

    enemyPos: { x: 100, y: 190 },
    enemyFlinchOffset: { x: 0, y: 0 },
    enemyFlashColor: null, // [r, g, b, a]
    enemyAlpha: 1.0,
    enemyMotion: 'idle',

    // Screen effects
    screenShake: { power: 0, duration: 0, current: 0 },
    screenFlash: { color: [255, 255, 255, 0], duration: 0, current: 0 },

    // Damage Popups
    activePopups: [],

    // Current Active Animation Overlays
    castAnimPlayer: null,
    targetAnimPlayers: [],

    // Preset Templates
    PRESETS: {
        melee: {
            name: '🗡️ Melee Strike',
            desc: 'Maju melesat ke depan musuh, tebasan senjata fisik, flinch & mundur kembali.',
            cast: { enabled: false, motion: 'chant', step: false, animId: 0, duration: 25, se: '' },
            attack: { approach: 'melee', motion: 'swing', animId: 2, repeats: 1, interval: 10, shake: 'light', flash: 'none' },
            reaction: { type: 'flinch', flash: 'red', popupType: 'hp_damage', testValue: 850, se: 'Blow1' }
        },
        combo: {
            name: '⚡ Multi-Slash Combo',
            desc: 'Melesat cepat, melancarkan 3x serangan berturut-turut, getaran layar kuat & knockback.',
            cast: { enabled: false, motion: 'skill', step: true, animId: 0, duration: 20, se: '' },
            attack: { approach: 'melee', motion: 'swing', animId: 2, repeats: 3, interval: 12, shake: 'heavy', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'critical', testValue: 1850, se: 'Slash2' }
        },
        magic: {
            name: '🔮 Elemental Spell',
            desc: 'Fase casting dengan lingkaran sihir/aura, tetap di tempat, ledakan elemen di target & flash layar.',
            cast: { enabled: true, motion: 'chant', step: true, animId: 56, duration: 35, se: 'Magic1' },
            attack: { approach: 'ranged', motion: 'spell', animId: 10, repeats: 1, interval: 12, shake: 'light', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'magical', testValue: 1240, se: 'Fire1' }
        },
        ranged: {
            name: '🏹 Ranged Missile',
            desc: 'Maju selangkah, pose menembak (missile), proyektil skill mengenai musuh dari jauh.',
            cast: { enabled: false, motion: 'wait', step: true, animId: 0, duration: 15, se: '' },
            attack: { approach: 'step', motion: 'missile', animId: 4, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'flinch', flash: 'red', popupType: 'hp_damage', testValue: 920, se: 'Blow1' }
        },
        heal: {
            name: '✨ Support / Heal',
            desc: 'Rancangan chant suci doa, aura cahaya pemulihan turun pada diri sendiri, pop-up angka hijau.',
            cast: { enabled: true, motion: 'chant', step: false, animId: 45, duration: 30, se: 'Heal1' },
            attack: { approach: 'ranged', motion: 'skill', animId: 45, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'none', flash: 'none', popupType: 'heal', testValue: 1500, se: 'Recovery' }
        },
        blink: {
            name: '🌀 Shadow Blink Strike',
            desc: 'Teleport kilat seketika di depan musuh, tebasan mematikan, gempa layar & knockback dahsyat.',
            cast: { enabled: true, motion: 'skill', step: false, animId: 0, duration: 15, se: 'Teleport' },
            attack: { approach: 'teleport', motion: 'thrust', animId: 2, repeats: 2, interval: 14, shake: 'earthquake', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'critical', testValue: 3200, se: 'Blow2' }
        }
    }
};

/**
 * Audio helper for SFX
 */
SkillAnimator.playSe = function(name, volume = 90, pitch = 100) {
    if (this.isMuted || !name) return;
    try {
        const audio = new Audio(`audio/se/${encodeURIComponent(name)}.ogg`);
        audio.volume = Math.max(0, Math.min(1, (volume / 100) * 0.7));
        audio.playbackRate = Math.max(0.5, Math.min(2.0, pitch / 100));
        audio.play().catch(() => {});
    } catch (e) {
        // Safe audio ignore
    }
};

/**
 * Load & Cache Image
 */
SkillAnimator.getImage = function(src) {
    if (!this.images[src]) {
        const img = new Image();
        img.src = src;
        this.images[src] = img;
    }
    return this.images[src];
};

/**
 * Extract or generate default Action Sequence Configuration for a skill
 */
SkillAnimator.getConfig = function(skill) {
    if (!skill) return JSON.parse(JSON.stringify(this.PRESETS.melee));

    const note = skill.note || '';

    // 1. Try reading clean embedded NUSV config
    const match = note.match(/<!--\s*NUSV_ACTION_CONFIG:\s*([\s\S]*?)\s*-->/);
    if (match) {
        try {
            const parsed = JSON.parse(match[1]);
            parsed.hasCustomSeq = true;
            return parsed;
        } catch (e) {
            console.warn('Failed to parse embedded NUSV_ACTION_CONFIG', e);
        }
    }

    // 2. Check if skill has raw Yanfly Action Sequence tags
    const hasYanfly = /<target action>/i.test(note) || /<setup action>/i.test(note);

    // 3. Auto-detect appropriate archetype defaults based on skill properties
    let baseArchetype = 'melee';
    if (skill.hitType === 2 || (skill.stypeId && skill.stypeId === 1)) {
        baseArchetype = 'magic';
    } else if (skill.damage && skill.damage.type === 3) {
        baseArchetype = 'heal';
    } else if (skill.repeats > 1) {
        baseArchetype = 'combo';
    }

    const cfg = JSON.parse(JSON.stringify(this.PRESETS[baseArchetype]));
    cfg.hasCustomSeq = hasYanfly;
    cfg.attack.animId = skill.animationId || cfg.attack.animId || 1;
    cfg.attack.repeats = skill.repeats || 1;

    // Check specific tags in note
    if (/motion missile/i.test(note)) cfg.attack.motion = 'missile';
    if (/motion thrust/i.test(note)) cfg.attack.motion = 'thrust';
    if (/motion skill/i.test(note)) cfg.attack.motion = 'skill';
    if (/motion spell/i.test(note)) cfg.attack.motion = 'spell';
    if (/motion swing/i.test(note)) cfg.attack.motion = 'swing';

    if (/motion chant/i.test(note)) {
        cfg.cast.enabled = true;
        cfg.cast.motion = 'chant';
    }

    if (/shake screen/i.test(note)) cfg.attack.shake = 'heavy';
    if (/flash screen/i.test(note)) cfg.attack.flash = 'white';

    return cfg;
};

/**
 * Convert structured configuration into Yanfly Action Sequence blocks
 */
SkillAnimator.generateYanflySequence = function(cfg, skill) {
    const lines = [];

    // === SETUP ACTION ===
    lines.push('<setup action>');
    lines.push('clear battle log');
    lines.push('display action');
    lines.push('immortal: targets, true');
    lines.push('perform start');

    if (cfg.cast && cfg.cast.enabled) {
        if (cfg.cast.step) {
            lines.push('move user: forward, 32, 10');
            lines.push('wait for movement');
        }
        lines.push(`motion ${cfg.cast.motion || 'chant'}: user`);
        if (cfg.cast.animId > 0) {
            lines.push(`animation ${cfg.cast.animId}: user`);
        }
        if (cfg.cast.se) {
            lines.push(`se: ${cfg.cast.se}, 80, 100, 0`);
        }
        lines.push(`wait: ${cfg.cast.duration || 25}`);
    } else {
        lines.push('wait for movement');
    }
    lines.push('</setup action>');
    lines.push('');

    // === TARGET ACTION ===
    lines.push('<target action>');
    const approach = cfg.attack.approach || 'melee';
    if (approach === 'melee') {
        lines.push('move user: target, front, 18');
        lines.push('wait for movement');
    } else if (approach === 'step') {
        lines.push('move user: forward, 32, 10');
        lines.push('wait for movement');
    } else if (approach === 'teleport') {
        lines.push('opacity user: 0, 4');
        lines.push('wait: 4');
        lines.push('move user: target, front, 1');
        lines.push('wait for movement');
        lines.push('opacity user: 255, 4');
        lines.push('wait: 4');
    }

    const repeats = Math.max(1, parseInt(cfg.attack.repeats, 10) || 1);
    const interval = Math.max(4, parseInt(cfg.attack.interval, 10) || 10);
    const motion = cfg.attack.motion || 'swing';

    for (let r = 0; r < repeats; r++) {
        lines.push(`motion ${motion}: user`);
        lines.push('action animation: target');
        lines.push('action effect: target');

        if (cfg.reaction && cfg.reaction.flash === 'red') {
            lines.push('enemy effect: targets, blink');
        } else if (cfg.reaction && cfg.reaction.flash === 'white') {
            lines.push('enemy effect: targets, whiten');
        }

        if (r < repeats - 1) {
            lines.push(`wait: ${interval}`);
        }
    }

    lines.push('wait for animation');

    // Shake & Flash
    if (cfg.attack.shake === 'light') {
        lines.push('shake screen: 2, 5, 10');
    } else if (cfg.attack.shake === 'heavy') {
        lines.push('shake screen: 4, 7, 15');
    } else if (cfg.attack.shake === 'earthquake') {
        lines.push('shake screen: 7, 9, 25');
    }

    if (cfg.attack.flash === 'white') {
        lines.push('flash screen: white, 10');
    } else if (cfg.attack.flash === 'red') {
        lines.push('flash screen: red, 12');
    } else if (cfg.attack.flash === 'gold') {
        lines.push('flash screen: 255, 215, 0, 180, 15');
    }

    lines.push('</target action>');
    lines.push('');

    // === FINISH ACTION ===
    lines.push('<finish action>');
    lines.push('immortal: targets, false');
    if (approach === 'melee' || approach === 'step' || approach === 'teleport') {
        lines.push('move user: home, 16');
        lines.push('wait for movement');
    }
    lines.push('perform finish');
    lines.push('clear battle log');
    lines.push('</finish action>');

    return lines.join('\n');
};

/**
 * Apply and save configuration to skill note
 */
SkillAnimator.saveConfigToSkill = function(skill, cfg) {
    if (!skill) return;

    // 1. Strip existing action sequence tags and embedded config
    let note = (skill.note || '')
        .replace(/<!--\s*NUSV_ACTION_CONFIG:[\s\S]*?-->/g, '')
        .replace(/<setup action>[\s\S]*?<\/setup action>/gi, '')
        .replace(/<whole action>[\s\S]*?<\/whole action>/gi, '')
        .replace(/<target action>[\s\S]*?<\/target action>/gi, '')
        .replace(/<follow action>[\s\S]*?<\/follow action>/gi, '')
        .replace(/<finish action>[\s\S]*?<\/finish action>/gi, '')
        .trim();

    // 2. Generate new sequence
    const seqText = this.generateYanflySequence(cfg, skill);
    const configComment = `<!-- NUSV_ACTION_CONFIG: ${JSON.stringify(cfg)} -->`;

    // 3. Append to note
    skill.note = (note ? note + '\n\n' : '') + configComment + '\n' + seqText;

    // 4. Synchronize core skill fields
    if (cfg.attack.animId !== undefined) {
        skill.animationId = parseInt(cfg.attack.animId, 10);
    }
    if (cfg.attack.repeats !== undefined) {
        skill.repeats = parseInt(cfg.attack.repeats, 10);
    }

    if (typeof setUnsaved === 'function') setUnsaved(true);
    if (typeof showToast === 'function') {
        showToast('Sequence aksi SV diperbarui ke Skill #' + skill.id, 'success');
    }
};

/**
 * Revert / Clear action sequence back to default MV flow
 */
SkillAnimator.clearSequenceFromSkill = function(skill) {
    if (!skill) return;
    let note = (skill.note || '')
        .replace(/<!--\s*NUSV_ACTION_CONFIG:[\s\S]*?-->/g, '')
        .replace(/<setup action>[\s\S]*?<\/setup action>/gi, '')
        .replace(/<whole action>[\s\S]*?<\/whole action>/gi, '')
        .replace(/<target action>[\s\S]*?<\/target action>/gi, '')
        .replace(/<follow action>[\s\S]*?<\/follow action>/gi, '')
        .replace(/<finish action>[\s\S]*?<\/finish action>/gi, '')
        .trim();

    skill.note = note;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    if (typeof showToast === 'function') {
        showToast('Action sequence dikembalikan ke default standar RPG Maker MV.', 'info');
    }
};

/**
 * Initialize / Start SV Battle Simulation Canvas
 */
SkillAnimator.initPreview = function(canvasEl, skill) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.activeSkill = skill;

    this.stop();

    // Reset sequence ticker
    this.currentTick = 0;
    this.lastFrameTime = performance.now();
    this.isPlaying = true;
    this.activePopups = [];
    this.castAnimPlayer = null;
    this.targetAnimPlayers = [];

    // Preload battleback and actor
    this.getImage(`img/battlebacks1/${this.selectedBattleback1}.png`);
    this.getImage(`img/battlebacks2/${this.selectedBattleback2}.png`);
    this.getImage(`img/sv_actors/${this.selectedActorName}.png`);
    this.getImage(`img/sv_enemies/${this.selectedEnemyName}.png`);
    this.getImage(`img/enemies/${this.selectedEnemyName}.png`);

    const cfg = this.getConfig(skill);
    if (cfg.attack.animId > 0 && State.animations[cfg.attack.animId]) {
        const a = State.animations[cfg.attack.animId];
        if (a.animation1Name) this.getImage(`img/animations/${a.animation1Name}.png`);
    }
    if (cfg.cast.animId > 0 && State.animations[cfg.cast.animId]) {
        const ca = State.animations[cfg.cast.animId];
        if (ca.animation1Name) this.getImage(`img/animations/${ca.animation1Name}.png`);
    }

    this.startLoop();
};

/**
 * Stop active render loop
 */
SkillAnimator.stop = function() {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
};

/**
 * Start 60fps RAF loop
 */
SkillAnimator.startLoop = function() {
    this.stop();
    const self = this;

    function step(now) {
        if (!self.canvas || !self.ctx) return;
        const delta = now - self.lastFrameTime;
        // Run roughly ~60 ticks per second modified by speed
        const tickInterval = 1000 / (60 * (self.speed || 1.0));

        if (delta >= tickInterval) {
            self.lastFrameTime = now;
            if (self.isPlaying) {
                self.update();
            }
            self.render();
        }
        self.rafId = requestAnimationFrame(step);
    }

    this.rafId = requestAnimationFrame(step);
};

/**
 * Calculate dynamic sequence choreography
 */
SkillAnimator.update = function() {
    const cfg = this.getConfig(this.activeSkill);
    const castEnabled = cfg.cast && cfg.cast.enabled;
    const castDuration = castEnabled ? (cfg.cast.duration || 30) : 0;
    const approach = cfg.attack.approach || 'melee';
    const repeats = Math.max(1, parseInt(cfg.attack.repeats, 10) || 1);
    const interval = Math.max(4, parseInt(cfg.attack.interval, 10) || 12);
    const attackMotionDuration = 18;
    const attackTotalDuration = (repeats - 1) * interval + attackMotionDuration;
    const approachDuration = (approach === 'melee') ? 16 : (approach === 'teleport' ? 6 : 10);
    const returnDuration = (approach === 'melee' || approach === 'step' || approach === 'teleport') ? 16 : 6;

    // Concrete Contact / Strike Positions
    const meleeContactX = this.enemyHome.x + 55;
    const stepContactX = this.actorHome.x - 32;
    const teleportContactX = this.enemyHome.x + 50;
    const attackContactX = (approach === 'melee') ? meleeContactX :
                           (approach === 'step') ? stepContactX :
                           (approach === 'teleport') ? teleportContactX : this.actorHome.x;

    // Timeline Boundaries
    const tIdleStart = 0;
    const tCastStart = tIdleStart + 8;
    const tCastEnd = tCastStart + castDuration;
    const tApproachStart = tCastEnd;
    const tApproachEnd = tApproachStart + (approach === 'ranged' ? 0 : approachDuration);
    const tAttackStart = tApproachEnd;
    const tAttackEnd = tAttackStart + attackTotalDuration;
    const tReturnStart = tAttackEnd; // Immediate return after attack completes
    const tReturnEnd = tReturnStart + returnDuration;
    const tTotalEnd = tReturnEnd + 15;

    this.totalTicks = tTotalEnd;
    const t = this.currentTick;

    // === PHASE DETERMINATION & CHOREOGRAPHY ===
    if (t < tCastStart) {
        // --- 0. IDLE STANDBY ---
        this.currentPhase = 'idle';
        this.actorPos.x = this.actorHome.x;
        this.actorPos.y = this.actorHome.y;
        this.actorMotion = 'wait';
        this.actorAlpha = 1.0;
        this.enemyPos.x = this.enemyHome.x;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;

    } else if (t < tCastEnd) {
        // --- 1. CASTING PHASE ---
        this.currentPhase = 'cast';
        const p = (t - tCastStart) / Math.max(1, castDuration);
        if (cfg.cast.step) {
            this.actorPos.x = this.actorHome.x - Math.min(28, p * 28);
        } else {
            this.actorPos.x = this.actorHome.x;
        }
        this.actorMotion = cfg.cast.motion || 'chant';

        if (t === tCastStart + 1 && cfg.cast.se) {
            this.playSe(cfg.cast.se);
        }

        if (cfg.cast.animId > 0 && !this.castAnimPlayer) {
            const anim = State.animations[cfg.cast.animId];
            if (anim) {
                this.castAnimPlayer = {
                    anim: anim,
                    img: this.getImage(`img/animations/${anim.animation1Name}.png`),
                    frameIndex: 0,
                    rate: 4,
                    rateCounter: 0,
                    target: 'user'
                };
            }
        }

    } else if (t < tApproachEnd) {
        // --- 2. APPROACHING PHASE ---
        this.currentPhase = 'approach';
        this.castAnimPlayer = null;
        const p = Math.max(0, Math.min(1, (t - tApproachStart) / Math.max(1, approachDuration)));
        const startX = cfg.cast.step ? (this.actorHome.x - 28) : this.actorHome.x;

        if (approach === 'melee' || approach === 'step') {
            this.actorPos.x = startX + (attackContactX - startX) * p;
            this.actorMotion = 'walk';
            this.actorAlpha = 1.0;
        } else if (approach === 'teleport') {
            if (p < 0.5) {
                this.actorAlpha = Math.max(0, 1 - p * 2);
                this.actorPos.x = startX;
            } else {
                this.actorPos.x = attackContactX;
                this.actorAlpha = (p - 0.5) * 2;
            }
            this.actorMotion = 'skill';
        } else {
            this.actorPos.x = this.actorHome.x;
            this.actorMotion = 'wait';
        }

    } else if (t < tAttackEnd) {
        // --- 3. ATTACKING / ACTION EXECUTION ---
        this.currentPhase = 'attack';
        this.actorMotion = cfg.attack.motion || 'swing';
        this.actorPos.x = attackContactX; // Locked exactly at target contact position
        this.actorAlpha = 1.0;

        const relTick = t - tAttackStart;
        for (let r = 0; r < repeats; r++) {
            const hitFrame = r * interval;
            if (relTick === hitFrame) {
                const animId = cfg.attack.animId || this.activeSkill.animationId || 1;
                const anim = State.animations[animId];
                if (anim && anim.animation1Name) {
                    this.targetAnimPlayers.push({
                        anim: anim,
                        img: this.getImage(`img/animations/${anim.animation1Name}.png`),
                        frameIndex: 0,
                        rate: 4,
                        rateCounter: 0,
                        target: 'enemy'
                    });
                }

                if (cfg.attack.shake === 'light') {
                    this.screenShake = { power: 3, duration: 10, current: 10 };
                } else if (cfg.attack.shake === 'heavy') {
                    this.screenShake = { power: 6, duration: 15, current: 15 };
                } else if (cfg.attack.shake === 'earthquake') {
                    this.screenShake = { power: 10, duration: 25, current: 25 };
                }

                if (cfg.attack.flash === 'white') {
                    this.screenFlash = { color: [255, 255, 255, 0.6], duration: 10, current: 10 };
                } else if (cfg.attack.flash === 'red') {
                    this.screenFlash = { color: [239, 68, 68, 0.6], duration: 12, current: 12 };
                } else if (cfg.attack.flash === 'gold') {
                    this.screenFlash = { color: [245, 158, 11, 0.6], duration: 14, current: 14 };
                }

                this.triggerEnemyReaction(cfg);
            }
        }

    } else if (t < tReturnEnd) {
        // --- 4. RETURN / RECOVERY ---
        this.currentPhase = 'return';
        const p = Math.max(0, Math.min(1, (t - tReturnStart) / Math.max(1, returnDuration)));

        if (approach === 'melee' || approach === 'step' || approach === 'teleport') {
            // Directly returns from attackContactX back to actorHome.x with smooth interpolation
            this.actorPos.x = attackContactX + (this.actorHome.x - attackContactX) * p;
            this.actorMotion = 'walk';
            this.actorAlpha = 1.0;
        } else {
            this.actorPos.x = this.actorHome.x;
            this.actorMotion = 'wait';
        }

    } else {
        // --- 5. FINISH & STANDBY ---
        this.currentPhase = 'idle';
        this.actorPos.x = this.actorHome.x;
        this.actorMotion = 'wait';
        this.actorAlpha = 1.0;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;
    }

    // Update Actor Sprite Walk Pattern Cycle
    if (++this.actorPatternCount >= 8) {
        this.actorPatternCount = 0;
        this.actorPattern = (this.actorPattern + 1) % 3;
    }

    // Update Enemy Reaction Flinch Decay
    if (this.enemyFlinchOffset.x !== 0) {
        this.enemyFlinchOffset.x *= 0.85;
        if (Math.abs(this.enemyFlinchOffset.x) < 0.5) this.enemyFlinchOffset.x = 0;
    }

    // Update Screen Shake & Flash Decay
    if (this.screenShake.current > 0) this.screenShake.current--;
    if (this.screenFlash.current > 0) this.screenFlash.current--;

    // Update Popups
    for (let i = this.activePopups.length - 1; i >= 0; i--) {
        const pop = this.activePopups[i];
        pop.y -= pop.vy;
        pop.vy *= 0.92;
        pop.opacity -= 0.02;
        if (pop.opacity <= 0) {
            this.activePopups.splice(i, 1);
        }
    }

    // Update Cast Animation Player
    if (this.castAnimPlayer) {
        if (++this.castAnimPlayer.rateCounter >= (this.castAnimPlayer.rate || 4)) {
            this.castAnimPlayer.rateCounter = 0;
            this.castAnimPlayer.frameIndex++;
            if (this.castAnimPlayer.frameIndex >= (this.castAnimPlayer.anim.frames || []).length) {
                this.castAnimPlayer = null;
            }
        }
    }

    // Update Target Animation Players
    for (let i = this.targetAnimPlayers.length - 1; i >= 0; i--) {
        const p = this.targetAnimPlayers[i];
        if (++p.rateCounter >= (p.rate || 4)) {
            p.rateCounter = 0;
            p.frameIndex++;

            if (p.anim.timings) {
                for (const tm of p.anim.timings) {
                    if (tm.frame === p.frameIndex) {
                        if (tm.se && tm.se.name) {
                            this.playSe(tm.se.name, tm.se.volume, tm.se.pitch);
                        }
                    }
                }
            }

            if (p.frameIndex >= (p.anim.frames || []).length) {
                this.targetAnimPlayers.splice(i, 1);
            }
        }
    }

    // Increment Sequence Progress
    this.currentTick++;
    if (this.currentTick >= this.totalTicks) {
        if (this.isLooping) {
            this.currentTick = 0;
        } else {
            this.currentTick = this.totalTicks;
            this.isPlaying = false;
        }
    }

    this.updatePhaseIndicator();
};

SkillAnimator.triggerEnemyReaction = function(cfg) {
    const rx = cfg.reaction || {};

    // 1. Physical offset
    if (rx.type === 'flinch') {
        this.enemyFlinchOffset.x = -16;
    } else if (rx.type === 'knockback') {
        this.enemyFlinchOffset.x = -38;
    } else if (rx.type === 'tremble') {
        this.enemyFlinchOffset.x = (Math.random() > 0.5 ? 8 : -8);
    }

    // 2. Flash
    if (rx.flash === 'red') {
        this.enemyFlashColor = [239, 68, 68, 0.7];
    } else if (rx.flash === 'white') {
        this.enemyFlashColor = [255, 255, 255, 0.85];
    }
    setTimeout(() => { this.enemyFlashColor = null; }, 120);

    // 3. Sound
    if (rx.se) {
        this.playSe(rx.se);
    }

    // 4. Damage Popup
    const val = rx.testValue || 1250;
    const isCrit = rx.popupType === 'critical';
    const isHeal = rx.popupType === 'heal';
    const isMagic = rx.popupType === 'magical';

    let color = '#f87171'; // physical red
    let prefix = '-';
    if (isCrit) color = '#facc15'; // gold
    if (isHeal) { color = '#34d399'; prefix = '+'; } // green
    if (isMagic) color = '#67e8f9'; // cyan

    this.activePopups.push({
        text: prefix + val.toLocaleString(),
        isCrit: isCrit,
        x: this.enemyHome.x + (Math.random() - 0.5) * 20,
        y: this.enemyHome.y - 70,
        vy: 3.5,
        opacity: 1.0,
        color: color
    });
};

/**
 * Main Canvas Render Function
 */
SkillAnimator.render = function() {
    const ctx = this.ctx;
    const W = this.WIDTH;
    const H = this.HEIGHT;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Apply Screen Shake
    if (this.screenShake.current > 0) {
        const p = this.screenShake.power;
        const ox = (Math.random() - 0.5) * p * 2;
        const oy = (Math.random() - 0.5) * p * 2;
        ctx.translate(ox, oy);
    }

    // 1. Draw Battle Backgrounds
    const bb1 = this.getImage(`img/battlebacks1/${this.selectedBattleback1}.png`);
    const bb2 = this.getImage(`img/battlebacks2/${this.selectedBattleback2}.png`);

    if (bb1 && bb1.complete && bb1.naturalWidth > 0) {
        ctx.drawImage(bb1, 0, 0, W, H);
    } else {
        // Fallback stylish battle arena gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.65, '#1e1b4b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    if (bb2 && bb2.complete && bb2.naturalWidth > 0) {
        ctx.drawImage(bb2, 0, 0, W, H);
    }

    // Ground Plane Shadow line
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, H - 45, W, 45);

    // 2. Draw Battler Shadows
    this.drawShadow(this.actorPos.x, this.actorPos.y);
    this.drawShadow(this.enemyHome.x + this.enemyFlinchOffset.x, this.enemyHome.y);

    // 3. Draw Enemy
    this.drawEnemy(ctx);

    // 4. Draw Actor (SV Battler 9x6)
    this.drawActor(ctx);

    // 5. Draw Active Cast Animation (on User)
    if (this.castAnimPlayer) {
        this.drawAnimationPlayer(ctx, this.castAnimPlayer, this.actorPos.x, this.actorPos.y - 25);
    }

    // 6. Draw Active Target Animations (on Enemy)
    for (const player of this.targetAnimPlayers) {
        this.drawAnimationPlayer(ctx, player, this.enemyHome.x + this.enemyFlinchOffset.x, this.enemyHome.y - 35);
    }

    // 7. Draw Damage Popups
    for (const pop of this.activePopups) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pop.opacity);
        ctx.font = pop.isCrit ? 'bold 18px sans-serif' : 'bold 15px sans-serif';
        ctx.textAlign = 'center';

        // Dark outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(pop.text, pop.x, pop.y);

        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);

        if (pop.isCrit) {
            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#fef08a';
            ctx.strokeText('CRITICAL!', pop.x, pop.y - 14);
            ctx.fillText('CRITICAL!', pop.x, pop.y - 14);
        }
        ctx.restore();
    }

    // 8. Draw Screen Flash
    if (this.screenFlash.current > 0) {
        const f = this.screenFlash;
        const alpha = (f.current / f.duration) * (f.color[3] || 0.6);
        ctx.fillStyle = `rgba(${f.color[0]}, ${f.color[1]}, ${f.color[2]}, ${alpha})`;
        ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
};

/**
 * Draw Ground Shadow
 */
SkillAnimator.drawShadow = function(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

/**
 * Draw Animated SV Actor from 9x6 Spritesheet
 */
SkillAnimator.drawActor = function(ctx) {
    const img = this.getImage(`img/sv_actors/${this.selectedActorName}.png`);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Standard MV SV Battler Motion Indices
    const MOTION_INDEX = {
        walk: 0, wait: 1, chant: 2, guard: 3, damage: 4, evade: 5,
        thrust: 6, swing: 7, missile: 8, skill: 9, spell: 10, item: 11,
        escape: 12, victory: 13, dying: 14, abnormal: 15, sleep: 16, dead: 17
    };

    const motionIdx = MOTION_INDEX[this.actorMotion] !== undefined ? MOTION_INDEX[this.actorMotion] : 1;
    const pattern = this.actorPattern; // 0, 1, 2

    const cw = img.naturalWidth / 9;
    const ch = img.naturalHeight / 6;
    const cx = Math.floor(motionIdx / 6) * 3 + pattern;
    const cy = motionIdx % 6;

    ctx.save();
    ctx.globalAlpha = this.actorAlpha;
    ctx.imageSmoothingEnabled = false;

    // Draw centered on anchor (x, y)
    const drawW = cw;
    const drawH = ch;
    ctx.drawImage(img, cx * cw, cy * ch, cw, ch, this.actorPos.x - drawW / 2, this.actorPos.y - drawH + 4, drawW, drawH);

    ctx.restore();
};

/**
 * Draw Enemy Battler
 */
SkillAnimator.drawEnemy = function(ctx) {
    let img = this.getImage(`img/sv_enemies/${this.selectedEnemyName}.png`);
    if (!img || !img.complete || img.naturalWidth === 0) {
        img = this.getImage(`img/enemies/${this.selectedEnemyName}.png`);
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ex = this.enemyHome.x + this.enemyFlinchOffset.x;
    const ey = this.enemyHome.y + this.enemyFlinchOffset.y;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Idle subtle breath float
    const floatY = Math.sin(this.currentTick * 0.1) * 2;

    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

    // If it's an SV actor sheet (9x6)
    if (sw % 9 === 0 && sh % 6 === 0 && (sw / 9) === (sh / 6)) {
        const cw = sw / 9;
        const ch = sh / 6;
        const pattern = Math.floor((this.currentTick / 10) % 3);
        sx = pattern * cw;
        sy = 0;
        sw = cw;
        sh = ch;
    }

    const drawW = Math.min(sw, 96);
    const drawH = Math.min(sh, 96);

    ctx.drawImage(img, sx, sy, sw, sh, ex - drawW / 2, ey - drawH + floatY, drawW, drawH);

    // Apply Hit Flash Tint
    if (this.enemyFlashColor) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `rgba(${this.enemyFlashColor[0]}, ${this.enemyFlashColor[1]}, ${this.enemyFlashColor[2]}, ${this.enemyFlashColor[3]})`;
        ctx.fillRect(ex - drawW / 2, ey - drawH + floatY, drawW, drawH);
        ctx.restore();
    }

    ctx.restore();
};

/**
 * Draw RPG Maker MV Animation Cell Sprites
 */
SkillAnimator.drawAnimationPlayer = function(ctx, player, targetX, targetY) {
    if (!player || !player.anim || !player.img || !player.img.complete || player.img.naturalWidth === 0) return;

    const frames = player.anim.frames || [];
    if (player.frameIndex >= frames.length) return;

    const frame = frames[player.frameIndex];
    if (!frame || !Array.isArray(frame)) return;

    const cellW = 192;
    const cellH = 192;

    for (const cell of frame) {
        const pattern = cell[0];
        if (pattern < 0) continue;

        const sx = (pattern % 5) * cellW;
        const sy = Math.floor((pattern % 100) / 5) * cellH;

        const x = targetX + (cell[1] || 0);
        const y = targetY + (cell[2] || 0);
        const scale = ((cell[3] !== undefined ? cell[3] : 100) / 100) * 0.75;
        const rotation = ((cell[4] || 0) * Math.PI) / 180;
        const mirror = cell[5] ? -1 : 1;
        const opacity = Math.max(0, Math.min(1, (cell[6] !== undefined ? cell[6] : 255) / 255));
        const blendMode = cell[7] || 0;

        ctx.save();
        ctx.globalAlpha = opacity;
        if (blendMode === 1) {
            ctx.globalCompositeOperation = 'lighter'; // Additive blend for magic glow
        } else if (blendMode === 2) {
            ctx.globalCompositeOperation = 'multiply';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.translate(x, y);
        if (rotation !== 0) ctx.rotate(rotation);
        ctx.scale(scale * mirror, scale);

        ctx.drawImage(player.img, sx, sy, cellW, cellH, -cellW / 2, -cellH / 2, cellW, cellH);
        ctx.restore();
    }
};

/**
 * Update visual phase pill badge in toolbar
 */
SkillAnimator.updatePhaseIndicator = function() {
    const badge = document.getElementById('svPhaseIndicator');
    if (!badge) return;

    const phaseNames = {
        idle: '⏸ Standby',
        cast: '🔮 F1: Casting',
        approach: '🏃 F2A: Maju',
        attack: '⚔️ F2B: Serang',
        reaction: '💥 F3: Reaksi',
        return: '↩️ Selesai'
    };

    const phaseColors = {
        idle: '#94a3b8',
        cast: '#c084fc',
        approach: '#38bdf8',
        attack: '#f87171',
        reaction: '#facc15',
        return: '#4ade80'
    };

    badge.textContent = phaseNames[this.currentPhase] || this.currentPhase;
    badge.style.color = phaseColors[this.currentPhase] || '#f8fafc';
    badge.style.borderColor = (phaseColors[this.currentPhase] || '#334155') + '66';
    badge.style.whiteSpace = 'nowrap';
    badge.style.fontSize = '0.68rem';
    badge.style.padding = '2px 8px';
};

SkillAnimator.renderStudioPanel = function(skill) {
    if (!skill) return '';
    const cfg = this.getConfig(skill);
    const yanflySeq = this.generateYanflySequence(cfg, skill);
    const hasCustom = !!cfg.hasCustomSeq;

    const animList = (State.animations || []).filter(a => a);

    return `
        <div class="card" style="border:1px solid #8b5cf655; background:linear-gradient(180deg, rgba(30,27,75,0.35) 0%, rgba(15,23,42,0.6) 100%); margin-bottom:16px;">
            <div class="card-header" style="border-bottom:1px solid #8b5cf633; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.15rem;">⚔️</span>
                    <div>
                        <h2 style="font-size:1.05rem; color:#c4b5fd; margin:0;">Sideview Battle &amp; Skill Animation Studio</h2>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Konfigurasi koreografi fase casting, attacking, dan reaksi musuh (SV Flow)</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    ${hasCustom ? `
                        <span class="badge" style="background:#10b98122; color:#34d399; border:1px solid #10b98155; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            ✨ Custom Sequence Aktif
                        </span>
                    ` : `
                        <span class="badge" style="background:#64748b22; color:#94a3b8; border:1px solid #64748b55; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                            Standard MV Flow
                        </span>
                    `}
                </div>
            </div>

            <div class="card-body" style="padding:14px; display:flex; flex-direction:column; gap:14px;">
                <!-- 1-CLICK PRESET TEMPLATES -->
                <div>
                    <div style="font-size:0.75rem; font-weight:700; color:#cbd5e1; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>⚡ PRESET TEMPLATE SIAP PAKAI (1-KLIK)</span>
                        <span style="font-size:0.7rem; color:var(--text-muted); font-weight:normal;">Pilih template untuk otomatis mengatur seluruh fase koreografi</span>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px;">
                        ${Object.keys(this.PRESETS).map(key => {
                            const p = this.PRESETS[key];
                            return `
                                <button type="button" class="btn btn-secondary btn-sm" onclick="applySkillPreset('${key}')" 
                                        style="display:flex; flex-direction:column; align-items:flex-start; text-align:left; padding:8px 10px; border:1px solid var(--border-color); background:rgba(0,0,0,0.3);"
                                        title="${escapeHtml(p.desc)}">
                                    <strong style="color:#67e8f9; font-size:0.8rem;">${p.name}</strong>
                                    <span style="font-size:0.68rem; color:var(--text-muted); margin-top:2px; line-height:1.2;">${escapeHtml(p.desc.slice(0, 48))}...</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 3-PHASE SEQUENCER TABS / ACCORDION -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap:12px;">
                    
                    <!-- FASE 1: CASTING -->
                    <div style="background:rgba(0,0,0,0.25); border:1px solid #c084fc44; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #c084fc22; padding-bottom:6px;">
                            <strong style="color:#c084fc; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                                <span>🔮</span> FASE 1: CASTING
                            </strong>
                            <label class="checkbox-label" style="font-size:0.75rem; margin:0;">
                                <input type="checkbox" id="cfgCastEnabled" ${cfg.cast.enabled ? 'checked' : ''} onchange="onSkillPhaseFieldChange()">
                                <span>Aktifkan Rapalan</span>
                            </label>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Motion Aktor</label>
                                <select id="cfgCastMotion" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="chant" ${cfg.cast.motion === 'chant' ? 'selected' : ''}>chant (Merapal Sihir)</option>
                                    <option value="skill" ${cfg.cast.motion === 'skill' ? 'selected' : ''}>skill (Konsentrasi Jurus)</option>
                                    <option value="wait" ${cfg.cast.motion === 'wait' ? 'selected' : ''}>wait (Siaga Tempur)</option>
                                    <option value="guard" ${cfg.cast.motion === 'guard' ? 'selected' : ''}>guard (Kuda-kuda Tahan)</option>
                                    <option value="spell" ${cfg.cast.motion === 'spell' ? 'selected' : ''}>spell (Pose Mantra)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Posisi Tubuh</label>
                                <select id="cfgCastStep" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="true" ${cfg.cast.step ? 'selected' : ''}>Maju 1 Langkah (32px)</option>
                                    <option value="false" ${!cfg.cast.step ? 'selected' : ''}>Tetap di Tempat (Home)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.72rem;">Animasi Cast pada User (Aura / Circle)</label>
                            <select id="cfgCastAnimId" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                <option value="0">(Tanpa Animasi Cast)</option>
                                ${animList.map(a => `<option value="${a.id}" ${cfg.cast.animId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Durasi Rapalan (Frames)</label>
                                <input type="number" id="cfgCastDuration" min="10" max="90" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.cast.duration || 25}" onchange="onSkillPhaseFieldChange()">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Sound SE Cast</label>
                                <div style="display:flex; gap:4px;">
                                    <input type="text" id="cfgCastSe" class="form-control" style="font-size:0.8rem; padding:4px 6px;" value="${escapeHtml(cfg.cast.se || '')}" placeholder="Magic1" onchange="onSkillPhaseFieldChange()">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="SkillAnimator.playSe(document.getElementById('cfgCastSe').value)" style="padding:2px 8px;" title="Putar SE">🔊</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FASE 2: ATTACKING -->
                    <div style="background:rgba(0,0,0,0.25); border:1px solid #f8717144; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f8717122; padding-bottom:6px;">
                            <strong style="color:#f87171; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                                <span>⚔️</span> FASE 2: ATTACKING (AKSI JURUS)
                            </strong>
                            <span style="font-size:0.7rem; color:var(--text-muted);">Eksekusi Serangan</span>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Pendekatan (Approach)</label>
                                <select id="cfgAttackApproach" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="melee" ${cfg.attack.approach === 'melee' ? 'selected' : ''}>Melesat ke Target (Melee)</option>
                                    <option value="ranged" ${cfg.attack.approach === 'ranged' ? 'selected' : ''}>Tetap di Posisi (Ranged/Sihir)</option>
                                    <option value="step" ${cfg.attack.approach === 'step' ? 'selected' : ''}>Maju Selangkah (Step)</option>
                                    <option value="teleport" ${cfg.attack.approach === 'teleport' ? 'selected' : ''}>Teleport Blink Seketika</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Motion Serang Aktor</label>
                                <select id="cfgAttackMotion" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="swing" ${cfg.attack.motion === 'swing' ? 'selected' : ''}>swing (Tebasan Senjata)</option>
                                    <option value="thrust" ${cfg.attack.motion === 'thrust' ? 'selected' : ''}>thrust (Tusukan Tombak/Pedang)</option>
                                    <option value="missile" ${cfg.attack.motion === 'missile' ? 'selected' : ''}>missile (Menembak Busur/Pistol)</option>
                                    <option value="skill" ${cfg.attack.motion === 'skill' ? 'selected' : ''}>skill (Jurus Fisik/Pukulan)</option>
                                    <option value="spell" ${cfg.attack.motion === 'spell' ? 'selected' : ''}>spell (Pelepasan Mantra Sihir)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.72rem;">Animasi Visual Target (Skill Animation)</label>
                            <select id="cfgAttackAnimId" class="form-control" style="font-size:0.8rem; padding:4px 8px; color:#38bdf8;" onchange="onSkillPhaseFieldChange()">
                                <option value="0">(Tanpa Animasi)</option>
                                ${animList.map(a => `<option value="${a.id}" ${cfg.attack.animId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Jumlah Pukulan (Repeats)</label>
                                <input type="number" id="cfgAttackRepeats" min="1" max="10" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.attack.repeats || 1}" onchange="onSkillPhaseFieldChange()">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Jeda Antar Pukulan (F)</label>
                                <input type="number" id="cfgAttackInterval" min="4" max="30" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.attack.interval || 12}" onchange="onSkillPhaseFieldChange()">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Screen Shake (Getar Layar)</label>
                                <select id="cfgAttackShake" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="none" ${cfg.attack.shake === 'none' ? 'selected' : ''}>Tanpa Getar</option>
                                    <option value="light" ${cfg.attack.shake === 'light' ? 'selected' : ''}>Ringan (Light 2px)</option>
                                    <option value="heavy" ${cfg.attack.shake === 'heavy' ? 'selected' : ''}>Kuat (Heavy 6px)</option>
                                    <option value="earthquake" ${cfg.attack.shake === 'earthquake' ? 'selected' : ''}>Gempa Dahsyat (10px)</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Screen Flash (Kilat Layar)</label>
                                <select id="cfgAttackFlash" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="none" ${cfg.attack.flash === 'none' ? 'selected' : ''}>Tanpa Flash</option>
                                    <option value="white" ${cfg.attack.flash === 'white' ? 'selected' : ''}>Kilatan Putih Terang</option>
                                    <option value="red" ${cfg.attack.flash === 'red' ? 'selected' : ''}>Kilatan Merah Darah</option>
                                    <option value="gold" ${cfg.attack.flash === 'gold' ? 'selected' : ''}>Kilatan Emas Petir</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- FASE 3: REAKSI MUSUH -->
                    <div style="background:rgba(0,0,0,0.25); border:1px solid #facc1544; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #facc1522; padding-bottom:6px;">
                            <strong style="color:#facc15; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                                <span>💥</span> FASE 3: REAKSI MUSUH (HIT)
                            </strong>
                            <span style="font-size:0.7rem; color:var(--text-muted);">Impact &amp; Damage</span>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Respon Fisik Musuh</label>
                                <select id="cfgReactionType" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="flinch" ${cfg.reaction.type === 'flinch' ? 'selected' : ''}>Flinch Mundur (16px)</option>
                                    <option value="knockback" ${cfg.reaction.type === 'knockback' ? 'selected' : ''}>Knockback Terpental (38px)</option>
                                    <option value="tremble" ${cfg.reaction.type === 'tremble' ? 'selected' : ''}>Tremble Getar Hebat</option>
                                    <option value="none" ${cfg.reaction.type === 'none' ? 'selected' : ''}>Tanpa Gerakan</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Efek Flash Musuh</label>
                                <select id="cfgReactionFlash" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="red" ${cfg.reaction.flash === 'red' ? 'selected' : ''}>Blink Merah (Hit Damage)</option>
                                    <option value="white" ${cfg.reaction.flash === 'white' ? 'selected' : ''}>Whiten Putih (Critical)</option>
                                    <option value="none" ${cfg.reaction.flash === 'none' ? 'selected' : ''}>Tanpa Flash</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Tipe Damage Popup</label>
                                <select id="cfgReactionPopupType" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="hp_damage" ${cfg.reaction.popupType === 'hp_damage' ? 'selected' : ''}>💥 Physical HP Damage (Red)</option>
                                    <option value="magical" ${cfg.reaction.popupType === 'magical' ? 'selected' : ''}>🔮 Magical Damage (Cyan)</option>
                                    <option value="critical" ${cfg.reaction.popupType === 'critical' ? 'selected' : ''}>⚡ Critical Hit (Gold)</option>
                                    <option value="heal" ${cfg.reaction.popupType === 'heal' ? 'selected' : ''}>✨ HP Heal (Green)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Nilai Uji Coba Damage</label>
                                <input type="number" id="cfgReactionTestValue" min="1" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.reaction.testValue || 1250}" onchange="onSkillPhaseFieldChange()">
                            </div>
                        </div>

                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.72rem;">Sound SE Kena Hit (Hit Sound)</label>
                            <div style="display:flex; gap:4px;">
                                <input type="text" id="cfgReactionSe" class="form-control" style="font-size:0.8rem; padding:4px 6px;" value="${escapeHtml(cfg.reaction.se || '')}" placeholder="Blow1" onchange="onSkillPhaseFieldChange()">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="SkillAnimator.playSe(document.getElementById('cfgReactionSe').value)" style="padding:2px 8px;" title="Putar SE">🔊</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACTIONS & CODE INSPECTOR -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:6px; border-top:1px solid var(--border-color);">
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="resetSkillSequenceToDefault()" style="color:#f87171;" title="Hapus seluruh custom action sequence dan kembali ke default MV">
                            🔄 Reset ke Default Standar MV
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="copySkillSequenceToClipboard()" title="Salin notetag action sequence">
                            📋 Salin Notetag Sequence
                        </button>
                    </div>

                    <details style="width:100%; margin-top:8px;">
                        <summary style="font-size:0.75rem; color:#a78bfa; cursor:pointer; font-weight:700;">
                            📝 Tampilkan / Periksa Raw Yanfly Action Sequence Code (&lt;setup action&gt;, &lt;target action&gt;, &lt;finish action&gt;)
                        </summary>
                        <textarea id="yanflySeqPreview" readonly class="form-control" rows="8" 
                                  style="font-family:monospace; font-size:0.75rem; color:#38bdf8; background:#080c14; margin-top:8px;">${escapeHtml(yanflySeq)}</textarea>
                    </details>
                </div>
            </div>
        </div>
    `;
};

/**
 * Handle field changes in the Action Studio
 */
function onSkillPhaseFieldChange() {
    const skill = State.skills[State.selectedIndex];
    if (!skill) return;

    const cfg = {
        hasCustomSeq: true,
        cast: {
            enabled: document.getElementById('cfgCastEnabled').checked,
            motion: document.getElementById('cfgCastMotion').value,
            step: document.getElementById('cfgCastStep').value === 'true',
            animId: parseInt(document.getElementById('cfgCastAnimId').value, 10) || 0,
            duration: parseInt(document.getElementById('cfgCastDuration').value, 10) || 25,
            se: document.getElementById('cfgCastSe').value.trim()
        },
        attack: {
            approach: document.getElementById('cfgAttackApproach').value,
            motion: document.getElementById('cfgAttackMotion').value,
            animId: parseInt(document.getElementById('cfgAttackAnimId').value, 10) || 0,
            repeats: parseInt(document.getElementById('cfgAttackRepeats').value, 10) || 1,
            interval: parseInt(document.getElementById('cfgAttackInterval').value, 10) || 12,
            shake: document.getElementById('cfgAttackShake').value,
            flash: document.getElementById('cfgAttackFlash').value
        },
        reaction: {
            type: document.getElementById('cfgReactionType').value,
            flash: document.getElementById('cfgReactionFlash').value,
            popupType: document.getElementById('cfgReactionPopupType').value,
            testValue: parseInt(document.getElementById('cfgReactionTestValue').value, 10) || 1250,
            se: document.getElementById('cfgReactionSe').value.trim()
        }
    };

    // Save and recompile to skill note
    SkillAnimator.saveConfigToSkill(skill, cfg);

    // Update raw textarea preview if open
    const txt = document.getElementById('yanflySeqPreview');
    if (txt) {
        txt.value = SkillAnimator.generateYanflySequence(cfg, skill);
    }

    // Update Raw Note if displayed
    const rawNote = document.getElementById('rawNoteTextarea');
    if (rawNote) rawNote.value = skill.note || '';

    // Replay preview immediately
    SkillAnimator.currentTick = 0;
    SkillAnimator.isPlaying = true;
    const playBtn = document.getElementById('svPlayBtn');
    if (playBtn) playBtn.textContent = '⏸ Pause';
}

/**
 * Apply 1-Click Preset to Skill
 */
function applySkillPreset(presetKey) {
    const skill = State.skills[State.selectedIndex];
    if (!skill) return;

    const preset = SkillAnimator.PRESETS[presetKey];
    if (!preset) return;

    const cfg = JSON.parse(JSON.stringify(preset));
    cfg.hasCustomSeq = true;

    // Preserve existing target animation if already defined
    if (skill.animationId > 0 && presetKey !== 'heal') {
        cfg.attack.animId = skill.animationId;
    }

    SkillAnimator.saveConfigToSkill(skill, cfg);

    // Refresh Editor & Preview
    if (typeof renderEditor === 'function') {
        renderEditor();
    }
}

/**
 * Reset Sequence to Default MV
 */
function resetSkillSequenceToDefault() {
    const skill = State.skills[State.selectedIndex];
    if (!skill) return;
    SkillAnimator.clearSequenceFromSkill(skill);
    if (typeof renderEditor === 'function') renderEditor();
}

/**
 * Copy Sequence notetag
 */
function copySkillSequenceToClipboard() {
    const skill = State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = SkillAnimator.getConfig(skill);
    const seq = SkillAnimator.generateYanflySequence(cfg, skill);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(seq).then(() => {
            showToast('Notetag sequence berhasil disalin ke clipboard!', 'success');
        });
    }
}

/**
 * Playback Toolbar functions
 */
function toggleSkillAnimPlay() {
    SkillAnimator.isPlaying = !SkillAnimator.isPlaying;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = SkillAnimator.isPlaying ? '⏸ Pause' : '▶ Play';
}

function replaySkillAnim() {
    SkillAnimator.currentTick = 0;
    SkillAnimator.isPlaying = true;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = '⏸ Pause';
}

function toggleSkillAnimLoop() {
    SkillAnimator.isLooping = !SkillAnimator.isLooping;
    const btn = document.getElementById('svLoopBtn');
    if (btn) btn.textContent = SkillAnimator.isLooping ? '🔄 Loop: ON' : '🔄 Loop: OFF';
}

function setSkillAnimSpeed(val) {
    SkillAnimator.speed = val || 1.0;
}

function toggleSkillAnimMute() {
    SkillAnimator.isMuted = !SkillAnimator.isMuted;
    const btn = document.getElementById('svMuteBtn');
    if (btn) btn.textContent = SkillAnimator.isMuted ? '🔇 SE Muted' : '🔊 SE';
}

/**
 * Clean cleanup when switching away from Skills tab
 */
function stopSkillBattleAnimation() {
    SkillAnimator.stop();
}


if (typeof window !== 'undefined') window.SkillAnimator = SkillAnimator;
