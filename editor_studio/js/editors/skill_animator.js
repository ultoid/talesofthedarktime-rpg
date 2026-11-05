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
    isPlaying: false,
    isLooping: true,
    speed: 1.0,
    isMuted: false,
    currentTick: 0,
    totalTicks: 120,
    lastFrameTime: 0,
    currentPhase: 'idle', // 'idle' | 'cast' | 'approach' | 'attack' | 'reaction' | 'return'
    selectedStepIndex: 0, // Currently selected modular timeline block index

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

    // Preset Templates with Modular Sequencer Steps
    PRESETS: {
        melee: {
            name: '🗡️ Melee Strike',
            desc: 'Maju melesat ke depan musuh, tebasan senjata fisik, flinch & mundur kembali.',
            cast: { enabled: false, motion: 'chant', step: false, animId: 0, duration: 25, se: '' },
            attack: { target: 'target', approach: 'melee', motion: 'swing', distance: 50, posType: 'center', offsetX: 0, offsetY: -35, animId: 2, repeats: 1, interval: 10, shake: 'light', flash: 'none' },
            reaction: { type: 'flinch', flash: 'red', popupType: 'hp_damage', testValue: 850, se: 'Blow1' },
            steps: [
                { id: 'step_m1', type: 'move', name: '🏃 Maju Melee', duration: 14, approach: 'melee', distance: 50 },
                { id: 'step_a1', type: 'action', name: '⚔️ Tebasan Fisik', duration: 18, motion: 'swing', target: 'target', animId: 2, offsetX: 0, offsetY: -35, posType: 'center', se: 'Blow1', shake: 'light', flash: 'none', reaction: 'flinch', popupType: 'hp_damage' },
                { id: 'step_r1', type: 'return', name: '↩️ Mundur Kembali', duration: 14, approach: 'walk' }
            ]
        },
        combo: {
            name: '⚡ Multi-Slash Combo',
            desc: 'Melesat cepat, melancarkan 3x serangan berturut-turut, getaran layar kuat & knockback.',
            cast: { enabled: false, motion: 'skill', step: true, animId: 0, duration: 20, se: '' },
            attack: { target: 'target', approach: 'melee', motion: 'swing', distance: 45, posType: 'center', offsetX: 0, offsetY: -35, animId: 2, repeats: 3, interval: 12, shake: 'heavy', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'critical', testValue: 1850, se: 'Slash2' },
            steps: [
                { id: 'step_m1', type: 'move', name: '🏃 Dash Cepat', duration: 12, approach: 'melee', distance: 45 },
                { id: 'step_a1', type: 'action', name: '⚔️ Tebasan #1', duration: 12, motion: 'swing', target: 'target', animId: 2, offsetX: -15, offsetY: -30, posType: 'center', se: 'Slash1', shake: 'none', flash: 'none', reaction: 'flinch', popupType: 'hp_damage' },
                { id: 'step_a2', type: 'action', name: '⚔️ Tusukan #2', duration: 12, motion: 'thrust', target: 'target', animId: 2, offsetX: 15, offsetY: -40, posType: 'center', se: 'Slash2', shake: 'light', flash: 'none', reaction: 'flinch', popupType: 'hp_damage' },
                { id: 'step_a3', type: 'action', name: '💥 Finisher Slam', duration: 20, motion: 'swing', target: 'target', animId: 2, offsetX: 0, offsetY: -35, posType: 'center', se: 'Blow2', shake: 'heavy', flash: 'white', reaction: 'knockback', popupType: 'critical' },
                { id: 'step_r1', type: 'return', name: '↩️ Mundur Kembali', duration: 14, approach: 'walk' }
            ]
        },
        jump: {
            name: '🦘 High Jump Plunge',
            desc: 'Melompat melengkung tinggi ke udara, menukik tajam ke target, gempa layar kuat.',
            cast: { enabled: false, motion: 'wait', step: true, animId: 0, duration: 15, se: 'Jump1' },
            attack: { target: 'target', approach: 'jump', motion: 'thrust', distance: 40, posType: 'feet', offsetX: 0, offsetY: 0, animId: 2, repeats: 1, interval: 10, shake: 'heavy', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'critical', testValue: 1650, se: 'Blow2' },
            steps: [
                { id: 'step_m1', type: 'move', name: '🦘 Lompat Menukik', duration: 18, approach: 'jump', distance: 40 },
                { id: 'step_a1', type: 'action', name: '💥 Plunge Attack', duration: 20, motion: 'thrust', target: 'target', animId: 2, offsetX: 0, offsetY: 0, posType: 'feet', se: 'Blow2', shake: 'heavy', flash: 'white', reaction: 'knockback', popupType: 'critical' },
                { id: 'step_r1', type: 'return', name: '↩️ Lompat Balik', duration: 14, approach: 'jump' }
            ]
        },
        magic: {
            name: '🔮 Elemental Spell',
            desc: 'Fase casting dengan lingkaran sihir/aura, tetap di tempat, ledakan elemen di target & flash layar.',
            cast: { enabled: true, motion: 'chant', step: true, animId: 56, duration: 35, se: 'Magic1' },
            attack: { target: 'target', approach: 'ranged', motion: 'spell', distance: 50, posType: 'center', offsetX: 0, offsetY: -35, animId: 10, repeats: 1, interval: 12, shake: 'light', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'magical', testValue: 1240, se: 'Fire1' },
            steps: [
                { id: 'step_c1', type: 'cast', name: '🔮 Rapalan Mantra', duration: 25, motion: 'chant', animId: 56, se: 'Magic1', step: false },
                { id: 'step_a1', type: 'action', name: '✨ Ledakan Sihir', duration: 24, motion: 'spell', target: 'target', animId: 10, offsetX: 0, offsetY: -35, posType: 'center', se: 'Fire1', shake: 'light', flash: 'white', reaction: 'knockback', popupType: 'magical' }
            ]
        },
        ranged: {
            name: '🏹 Ranged Missile',
            desc: 'Maju selangkah, pose menembak (missile), proyektil skill mengenai musuh dari jauh.',
            cast: { enabled: false, motion: 'wait', step: true, animId: 0, duration: 15, se: '' },
            attack: { target: 'target', approach: 'step', motion: 'missile', distance: 50, posType: 'center', offsetX: 0, offsetY: -35, animId: 4, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'flinch', flash: 'red', popupType: 'hp_damage', testValue: 920, se: 'Blow1' },
            steps: [
                { id: 'step_m1', type: 'move', name: '🚶 Siaga 1 Langkah', duration: 10, approach: 'step', distance: 32 },
                { id: 'step_a1', type: 'action', name: '🏹 Tembakan Proyektil', duration: 20, motion: 'missile', target: 'target', animId: 4, offsetX: 0, offsetY: -35, posType: 'center', se: 'Blow1', shake: 'none', flash: 'none', reaction: 'flinch', popupType: 'hp_damage' },
                { id: 'step_r1', type: 'return', name: '↩️ Mundur Posisi', duration: 10, approach: 'walk' }
            ]
        },
        guard: {
            name: '🛡️ Guard / Defend',
            desc: 'Kuda-kuda bertahan (Guard), animasi perisai pada diri sendiri, popup GUARD tanpa flinch musuh.',
            cast: { enabled: false, motion: 'guard', step: false, animId: 0, duration: 15, se: '' },
            attack: { target: 'user', approach: 'ranged', motion: 'guard', distance: 0, posType: 'center', offsetX: 0, offsetY: -10, animId: 0, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'none', flash: 'none', popupType: 'guard', testValue: 0, se: 'Saint9' },
            steps: [
                { id: 'step_a1', type: 'action', name: '🛡️ Bertahan / Guard', duration: 25, motion: 'guard', target: 'user', animId: 0, offsetX: 0, offsetY: -10, posType: 'center', se: 'Saint9', shake: 'none', flash: 'none', reaction: 'none', popupType: 'guard' }
            ]
        },
        buff: {
            name: '💪 Self Buff / Focus',
            desc: 'Konsentrasi energi diri sendiri, aura berkilau, popup peningkatan stat / SP.',
            cast: { enabled: true, motion: 'chant', step: false, animId: 56, duration: 25, se: 'Up4' },
            attack: { target: 'user', approach: 'ranged', motion: 'skill', distance: 0, posType: 'head', offsetX: 0, offsetY: -10, animId: 56, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'none', flash: 'none', popupType: 'buff', testValue: 0, se: 'Recovery' },
            steps: [
                { id: 'step_c1', type: 'cast', name: '🔮 Meditasi Fokus', duration: 20, motion: 'skill', animId: 56, se: 'Up4', step: false },
                { id: 'step_a1', type: 'action', name: '✨ Pelepasan Aura', duration: 25, motion: 'skill', target: 'user', animId: 56, offsetX: 0, offsetY: -30, posType: 'head', se: 'Recovery', shake: 'none', flash: 'none', reaction: 'none', popupType: 'buff' }
            ]
        },
        heal: {
            name: '✨ Support / Heal',
            desc: 'Rancangan chant suci doa, aura cahaya pemulihan turun pada diri sendiri, pop-up angka hijau.',
            cast: { enabled: true, motion: 'chant', step: false, animId: 45, duration: 30, se: 'Heal1' },
            attack: { target: 'user', approach: 'ranged', motion: 'skill', distance: 0, posType: 'center', offsetX: 0, offsetY: 0, animId: 45, repeats: 1, interval: 10, shake: 'none', flash: 'none' },
            reaction: { type: 'none', flash: 'none', popupType: 'heal', testValue: 1500, se: 'Recovery' },
            steps: [
                { id: 'step_c1', type: 'cast', name: '🔮 Rapalan Suci', duration: 22, motion: 'chant', animId: 45, se: 'Heal1', step: false },
                { id: 'step_a1', type: 'action', name: '✨ Cahaya Pemulihan', duration: 25, motion: 'skill', target: 'user', animId: 45, offsetX: 0, offsetY: 0, posType: 'center', se: 'Recovery', shake: 'none', flash: 'none', reaction: 'none', popupType: 'heal' }
            ]
        },
        blink: {
            name: '🌀 Shadow Blink Strike',
            desc: 'Teleport kilat seketika di depan musuh, tebasan mematikan, gempa layar & knockback dahsyat.',
            cast: { enabled: true, motion: 'skill', step: false, animId: 0, duration: 15, se: 'Teleport' },
            attack: { target: 'target', approach: 'teleport', motion: 'thrust', distance: 45, posType: 'center', offsetX: 0, offsetY: 0, animId: 2, repeats: 2, interval: 14, shake: 'earthquake', flash: 'white' },
            reaction: { type: 'knockback', flash: 'white', popupType: 'critical', testValue: 3200, se: 'Blow2' },
            steps: [
                { id: 'step_c1', type: 'cast', name: '🌀 Siaga Bayangan', duration: 12, motion: 'skill', animId: 0, se: 'Teleport', step: false },
                { id: 'step_m1', type: 'move', name: '⚡ Teleport Blink', duration: 6, approach: 'teleport', distance: 45 },
                { id: 'step_a1', type: 'action', name: '⚔️ Tebasan Kilat', duration: 20, motion: 'thrust', target: 'target', animId: 2, offsetX: 0, offsetY: -35, posType: 'center', se: 'Blow2', shake: 'earthquake', flash: 'white', reaction: 'knockback', popupType: 'critical' },
                { id: 'step_r1', type: 'return', name: '⚡ Blink Kembali', duration: 8, approach: 'teleport' }
            ]
        }
    }
};

/**
 * Audio helper for SFX
 */
SkillAnimator.playSe = function (name, volume = 90, pitch = 100) {
    if (this.isMuted || !name) return;
    try {
        const audio = new Audio(`audio/se/${encodeURIComponent(name)}.ogg`);
        audio.volume = Math.max(0, Math.min(1, (volume / 100) * 0.7));
        audio.playbackRate = Math.max(0.5, Math.min(2.0, pitch / 100));
        audio.play().catch(() => { });
    } catch (e) {
        // Safe audio ignore
    }
};

SkillAnimator.getSeList = function () {
    if (State.audioSeList && Array.isArray(State.audioSeList) && State.audioSeList.length > 0) {
        return State.audioSeList;
    }
    if (typeof RPG_DEFAULT_SE_LIST !== 'undefined' && Array.isArray(RPG_DEFAULT_SE_LIST)) {
        return RPG_DEFAULT_SE_LIST;
    }
    return [];
};

SkillAnimator.renderSeSelect = function (currentVal, onchangeStr, id = '') {
    const list = this.getSeList();
    const cur = currentVal || '';
    const safeCur = escapeHtml(cur);
    return `
        <div style="display:flex; gap:4px; align-items:center;">
            <select ${id ? `id="${id}"` : ''} class="form-control" style="font-size:0.8rem; padding:4px 6px; flex:1; min-width:0;" onchange="${onchangeStr}">
                <option value="">(Tanpa Sound Effect / None)</option>
                ${list.map(s => `<option value="${s}" ${cur === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            <button type="button" class="btn btn-secondary btn-sm" onclick="SkillAnimator.playSe(${id ? `document.getElementById('${id}').value` : `'${safeCur}'`})" style="padding:2px 8px; flex-shrink:0;" title="Putar Suara (Preview)">🔊</button>
        </div>
    `;
};

SkillAnimator.activeKeyframeMode = 'start'; // 'start' (Keyframe A) or 'end' (Keyframe B)

SkillAnimator.selectKeyframe = function (mode) {
    this.activeKeyframeMode = mode === 'end' ? 'end' : 'start';
    this.render();
    const btnA = document.getElementById('btnKfModeStart');
    const btnB = document.getElementById('btnKfModeEnd');
    if (btnA) {
        btnA.style.borderColor = this.activeKeyframeMode !== 'end' ? '#10b981' : '#334155';
        btnA.style.background = this.activeKeyframeMode !== 'end' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.6)';
        btnA.style.color = this.activeKeyframeMode !== 'end' ? '#6ee7b7' : '#94a3b8';
    }
    if (btnB) {
        btnB.style.borderColor = this.activeKeyframeMode === 'end' ? '#f43f5e' : '#334155';
        btnB.style.background = this.activeKeyframeMode === 'end' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(15, 23, 42, 0.6)';
        btnB.style.color = this.activeKeyframeMode === 'end' ? '#fda4af' : '#94a3b8';
    }
};

SkillAnimator.applyKeyframePreset = function (presetName) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !cfg.steps[this.selectedStepIndex]) return;

    const step = cfg.steps[this.selectedStepIndex];
    if (presetName === 'static') {
        step.useKeyframes = false;
        step.endOffsetX = step.offsetX || 0;
        step.endOffsetY = step.offsetY !== undefined ? step.offsetY : -35;
        step.scaleEnd = step.scale || 100;
    } else if (presetName === 'projectile') {
        step.useKeyframes = true;
        step.offsetX = -180;
        step.offsetY = -35;
        step.scale = 75;
        step.endOffsetX = 0;
        step.endOffsetY = -35;
        step.scaleEnd = 120;
    } else if (presetName === 'pierce') {
        step.useKeyframes = true;
        step.offsetX = -50;
        step.offsetY = -35;
        step.scale = 90;
        step.endOffsetX = 60;
        step.endOffsetY = -35;
        step.scaleEnd = 130;
    } else if (presetName === 'fall') {
        step.useKeyframes = true;
        step.offsetX = 0;
        step.offsetY = -180;
        step.scale = 70;
        step.endOffsetX = 0;
        step.endOffsetY = 0;
        step.scaleEnd = 150;
    } else if (presetName === 'expand') {
        step.useKeyframes = true;
        step.scale = 40;
        step.scaleEnd = 200;
        step.endOffsetX = step.offsetX || 0;
        step.endOffsetY = step.offsetY !== undefined ? step.offsetY : -35;
    } else if (presetName === 'shrink') {
        step.useKeyframes = true;
        step.scale = 160;
        step.scaleEnd = 30;
        step.endOffsetX = step.offsetX || 0;
        step.endOffsetY = step.offsetY !== undefined ? step.offsetY : -35;
    }

    if (cfg.attack) {
        cfg.attack.offsetX = step.offsetX;
        cfg.attack.offsetY = step.offsetY;
        cfg.attack.scale = step.scale;
        cfg.attack.useKeyframes = step.useKeyframes;
        cfg.attack.endOffsetX = step.endOffsetX;
        cfg.attack.endOffsetY = step.endOffsetY;
        cfg.attack.scaleEnd = step.scaleEnd;
    }

    this.saveConfigToSkill(skill, cfg);
    this.update(true);
    this.render();
    if (typeof renderEditor === 'function') renderEditor();
    if (typeof showToast === 'function') showToast(`Preset lintasan keyframe diterapkan: ${presetName}`, 'info');
};

/**
 * Load & Cache Image
 */
SkillAnimator.getImage = function (src) {
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
SkillAnimator.getConfig = function (skill) {
    if (!skill) return JSON.parse(JSON.stringify(this.PRESETS.melee));

    const note = skill.note || '';

    // 1. Try reading clean embedded NUSV config
    const match = note.match(/<!--\s*NUSV_ACTION_CONFIG:\s*([\s\S]*?)\s*-->/);
    if (match) {
        try {
            const parsed = JSON.parse(match[1]);
            parsed.hasCustomSeq = true;
            if (!parsed.attack.target) {
                parsed.attack.target = (skill.scope === 11 || skill.id === 2 || /action animation:\s*user/i.test(note)) ? 'user' : 'target';
            }
            // Ensure modular steps array exists
            if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
                parsed.steps = this.generateDefaultStepsFromCfg(parsed, skill);
            }
            return parsed;
        } catch (e) {
            console.warn('Failed to parse embedded NUSV_ACTION_CONFIG', e);
        }
    }

    // 2. Check if skill has raw Yanfly Action Sequence tags
    const hasYanfly = /<target action>/i.test(note) || /<setup action>/i.test(note);

    // 3. Auto-detect appropriate archetype defaults based on skill properties
    let baseArchetype = 'melee';
    if (skill.id === 2 || (skill.name && /guard/i.test(skill.name))) {
        baseArchetype = 'guard';
    } else if (skill.scope === 11) { // 11 = The User
        baseArchetype = (skill.damage && skill.damage.type === 3) ? 'heal' : 'buff';
    } else if (skill.hitType === 2 || (skill.stypeId && skill.stypeId === 1)) {
        baseArchetype = 'magic';
    } else if (skill.damage && skill.damage.type === 3) {
        baseArchetype = 'heal';
    } else if (skill.repeats > 1) {
        baseArchetype = 'combo';
    }

    const cfg = JSON.parse(JSON.stringify(this.PRESETS[baseArchetype] || this.PRESETS.melee));
    cfg.hasCustomSeq = hasYanfly;
    cfg.attack.target = cfg.attack.target || ((skill.scope === 11 || skill.id === 2) ? 'user' : 'target');
    cfg.attack.animId = (skill.animationId !== undefined) ? skill.animationId : (cfg.attack.animId || 0);
    cfg.attack.repeats = skill.repeats || 1;

    // Check specific tags in note
    if (/action animation:\s*user/i.test(note) || /animation \d+:\s*user/i.test(note)) {
        cfg.attack.target = 'user';
    }
    if (/motion guard/i.test(note)) cfg.attack.motion = 'guard';
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

    cfg.steps = this.generateDefaultStepsFromCfg(cfg, skill);
    return cfg;
};

/**
 * Generate modular timeline step clips from config
 */
SkillAnimator.generateDefaultStepsFromCfg = function (cfg, skill) {
    const isSelf = (cfg.attack && cfg.attack.target === 'user') || (skill && (skill.scope === 11 || skill.id === 2));
    const steps = [];

    if (cfg.cast && cfg.cast.enabled) {
        steps.push({
            id: 'step_cast_' + Math.random().toString(36).substr(2, 5),
            type: 'cast',
            name: '🔮 Rapalan (Casting)',
            duration: parseInt(cfg.cast.duration, 10) || 15,
            motion: cfg.cast.motion || 'chant',
            animId: cfg.cast.animId || 0,
            flipX: !!(cfg.cast && cfg.cast.flipX),
            flipY: !!(cfg.cast && cfg.cast.flipY),
            se: cfg.cast.se || ''
        });
    }

    if (!isSelf && cfg.attack && cfg.attack.approach !== 'ranged') {
        steps.push({
            id: 'step_move_' + Math.random().toString(36).substr(2, 5),
            type: 'move',
            name: '🏃 Gerak (Move)',
            duration: parseInt(cfg.attack.approachDuration, 10) || 12,
            approach: cfg.attack.approach || 'melee',
            distance: parseInt(cfg.attack.distance, 10) || 50
        });
    }

    const repeats = Math.max(1, parseInt(cfg.attack && cfg.attack.repeats, 10) || 1);
    for (let r = 0; r < repeats; r++) {
        steps.push({
            id: 'step_action_' + r + '_' + Math.random().toString(36).substr(2, 5),
            type: 'action',
            name: repeats > 1 ? `⚔️ Serangan #${r + 1}` : '⚔️ Serangan / Aksi',
            duration: parseInt(cfg.attack && cfg.attack.duration, 10) || 18,
            motion: (cfg.attack && cfg.attack.motion) || (isSelf ? 'guard' : 'swing'),
            animId: (cfg.attack && cfg.attack.animId !== undefined) ? cfg.attack.animId : (skill && skill.animationId ? skill.animationId : 1),
            target: isSelf ? 'user' : 'target',
            offsetX: parseInt(cfg.attack && cfg.attack.offsetX, 10) || 0,
            offsetY: parseInt(cfg.attack && cfg.attack.offsetY, 10) || -35,
            scale: parseInt(cfg.attack && cfg.attack.scale, 10) || 100,
            useKeyframes: !!(cfg.attack && cfg.attack.useKeyframes),
            endOffsetX: parseInt(cfg.attack && cfg.attack.endOffsetX, 10) || 0,
            endOffsetY: parseInt(cfg.attack && cfg.attack.endOffsetY, 10) || -35,
            scaleEnd: parseInt(cfg.attack && cfg.attack.scaleEnd, 10) || 100,
            flipX: !!(cfg.attack && cfg.attack.flipX),
            flipY: !!(cfg.attack && cfg.attack.flipY),
            se: (cfg.reaction && cfg.reaction.se) || '',
            shake: (cfg.attack && cfg.attack.shake) || 'none',
            flash: (cfg.attack && cfg.attack.flash) || 'none'
        });
    }

    if (!isSelf && cfg.attack && cfg.attack.approach !== 'ranged') {
        steps.push({
            id: 'step_return_' + Math.random().toString(36).substr(2, 5),
            type: 'return',
            name: '↩️ Kembali (Return)',
            duration: parseInt(cfg.attack && cfg.attack.returnDuration, 10) || 14
        });
    }

    return steps;
};

/**
 * Convert structured configuration into Yanfly Action Sequence blocks
 */
SkillAnimator.generateYanflySequence = function (cfg, skill) {
    const lines = [];
    const isSelfGlobal = (cfg.attack && cfg.attack.target === 'user') || (skill && (skill.scope === 11 || skill.id === 2));

    // === SETUP ACTION ===
    lines.push('<setup action>');
    lines.push('clear battle log');
    lines.push('display action');
    lines.push('immortal: targets, true');
    lines.push('perform start');
    lines.push('wait for movement');
    lines.push('</setup action>');
    lines.push('');

    // === TARGET ACTION ===
    lines.push('<target action>');

    if (cfg.steps && Array.isArray(cfg.steps) && cfg.steps.length > 0) {
        // Modular Sequence Generation from Dynamic Steps
        for (let i = 0; i < cfg.steps.length; i++) {
            const step = cfg.steps[i];
            const dur = Math.max(1, parseInt(step.duration, 10) || 15);

            if (step.type === 'cast') {
                if (step.step) {
                    lines.push('move user: forward, 32, 10');
                    lines.push('wait for movement');
                }
                lines.push(`motion ${step.motion || 'chant'}: user`);
                if (step.animId > 0) {
                    const castMirror = step.flipX ? ', mirror' : '';
                    lines.push(`animation ${step.animId}: user${castMirror}`);
                }
                if (step.se) {
                    lines.push(`se: ${step.se}, 80, 100, 0`);
                }
                lines.push(`wait: ${dur}`);

            } else if (step.type === 'move') {
                const app = step.approach || 'melee';
                if (app === 'melee') {
                    lines.push(`move user: target, front, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'behind') {
                    lines.push(`move user: target, back, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'step') {
                    lines.push(`move user: forward, 32, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'jump') {
                    lines.push(`jump user: 60, ${dur}`);
                    lines.push(`move user: target, front, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'jump_behind') {
                    lines.push(`jump user: 60, ${dur}`);
                    lines.push(`move user: target, back, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'teleport') {
                    lines.push('opacity user: 0, 4');
                    lines.push('wait: 4');
                    lines.push('move user: target, front, 1');
                    lines.push('wait for movement');
                    lines.push('opacity user: 255, 4');
                    lines.push('wait: 4');
                } else if (app === 'teleport_behind') {
                    lines.push('opacity user: 0, 4');
                    lines.push('wait: 4');
                    lines.push('move user: target, back, 1');
                    lines.push('wait for movement');
                    lines.push('opacity user: 255, 4');
                    lines.push('wait: 4');
                }

            } else if (step.type === 'action') {
                const targetToken = (step.target === 'user') ? 'user' : 'target';
                lines.push(`motion ${step.motion || (targetToken === 'user' ? 'guard' : 'swing')}: user`);

                const mirrorTag = step.flipX ? ', mirror' : '';
                if (step.animId > 0) {
                    lines.push(`animation ${step.animId}: ${targetToken}${mirrorTag}`);
                } else {
                    lines.push(`action animation: ${targetToken}${mirrorTag}`);
                }

                // Calculate Hit Impact Timing for projectile / keyframes
                const kfStart = Math.max(0, parseInt(step.kfStart || 0, 10));
                const kfDur = Math.max(1, parseInt(step.kfDuration !== undefined ? step.kfDuration : Math.min(8, dur), 10));
                const defaultHit = step.useKeyframes ? (kfStart + kfDur) : parseInt(step.fxDelay || 0, 10);
                const hitDelay = Math.max(0, parseInt(step.hitDelay !== undefined ? step.hitDelay : defaultHit, 10));

                if (hitDelay > 0 && hitDelay < dur) {
                    lines.push(`wait: ${hitDelay}`);
                }

                lines.push(`action effect: ${targetToken}`);

                if (targetToken !== 'user') {
                    if (step.reaction === 'knockback') {
                        lines.push('enemy effect: targets, whiten');
                    }
                    // Note: 'flinch' is already natively handled by RPG Maker MV's performDamage() blink effect
                }

                if (step.se) {
                    lines.push(`se: ${step.se}, 80, 100, 0`);
                }

                if (step.shake === 'light') {
                    lines.push('shake screen: 2, 5, 10');
                } else if (step.shake === 'heavy') {
                    lines.push('shake screen: 4, 7, 15');
                } else if (step.shake === 'earthquake') {
                    lines.push('shake screen: 7, 9, 25');
                }

                if (step.flash === 'white') {
                    lines.push('flash screen: white, 10');
                } else if (step.flash === 'red') {
                    lines.push('flash screen: red, 12');
                } else if (step.flash === 'gold') {
                    lines.push('flash screen: 255, 215, 0, 180, 15');
                }

                const remainWait = Math.max(1, dur - hitDelay);
                lines.push(`wait: ${remainWait}`);

            } else if (step.type === 'return') {
                const app = step.approach || 'walk';
                if (app === 'jump') {
                    lines.push(`jump user: 50, ${dur}`);
                    lines.push(`move user: home, ${dur}`);
                    lines.push('wait for movement');
                } else if (app === 'teleport') {
                    lines.push('opacity user: 0, 4');
                    lines.push('wait: 4');
                    lines.push('move user: home, 1');
                    lines.push('wait for movement');
                    lines.push('opacity user: 255, 4');
                    lines.push('wait: 4');
                } else {
                    lines.push(`move user: home, ${dur}`);
                    lines.push('wait for movement');
                }
            }
        }
    } else {
        // Fallback for legacy
        const targetToken = isSelfGlobal ? 'user' : 'target';
        const approach = (cfg.attack && cfg.attack.approach) || 'melee';
        if (!isSelfGlobal && approach === 'melee') {
            lines.push('move user: target, front, 18');
            lines.push('wait for movement');
        }
        lines.push(`motion ${(cfg.attack && cfg.attack.motion) || 'swing'}: user`);
        const legMirror = (cfg.attack && cfg.attack.flipX) ? ', mirror' : '';
        lines.push(`action animation: ${targetToken}${legMirror}`);
        lines.push(`action effect: ${targetToken}`);
        lines.push('wait for animation');
    }

    lines.push('</target action>');
    lines.push('');

    // === FINISH ACTION ===
    lines.push('<finish action>');
    lines.push('immortal: targets, false');
    lines.push('move user: home, 14');
    lines.push('wait for movement');
    lines.push('perform finish');
    lines.push('clear battle log');
    lines.push('</finish action>');

    return lines.join('\n');
};

/**
 * Apply and save configuration to skill note
 */
SkillAnimator.saveConfigToSkill = function (skill, cfg) {
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

    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('skills');
    State.modifiedTabs.add('skill_animator');
    if (typeof setUnsaved === 'function') setUnsaved(true);
    if (typeof showToast === 'function') {
        showToast('Sequence aksi SV diperbarui ke Skill #' + skill.id, 'success');
    }
};

/**
 * Revert / Clear action sequence back to default MV flow
 */
SkillAnimator.clearSequenceFromSkill = function (skill) {
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
    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('skills');
    State.modifiedTabs.add('skill_animator');
    if (typeof setUnsaved === 'function') setUnsaved(true);
    if (typeof showToast === 'function') {
        showToast('Action sequence dikembalikan ke default standar RPG Maker MV.', 'info');
    }
};

/**
 * Initialize / Start SV Battle Simulation Canvas
 */
SkillAnimator.initPreview = function (canvasEl, skill) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.ctx = canvasEl.getContext('2d');
    this.activeSkill = skill;

    this.stop();

    // Reset sequence ticker
    this.currentTick = 0;
    this.lastFrameTime = performance.now();
    this.isPlaying = false; // Only play when user explicitly clicks Play
    this.activePopups = [];
    this.castAnimPlayer = null;
    this.targetAnimPlayers = [];
    this.scrubAnimPlayer = null;

    const playBtn = document.getElementById('svPlayBtn');
    if (playBtn) playBtn.textContent = '▶ Play';

    // Preload battleback and actor
    this.getImage(`img/battlebacks1/${this.selectedBattleback1}.png`);
    this.getImage(`img/battlebacks2/${this.selectedBattleback2}.png`);
    this.getImage(`img/sv_actors/${this.selectedActorName}.png`);
    this.getImage(`img/sv_enemies/${this.selectedEnemyName}.png`);
    this.getImage(`img/enemies/${this.selectedEnemyName}.png`);

    const cfg = this.getConfig(skill);
    if (cfg.attack.animId > 0 && State.animations && State.animations[cfg.attack.animId]) {
        const a = State.animations[cfg.attack.animId];
        if (a.animation1Name) this.getImage(`img/animations/${a.animation1Name}.png`);
        if (a.animation2Name) this.getImage(`img/animations/${a.animation2Name}.png`);
    }
    if (cfg.cast.animId > 0 && State.animations && State.animations[cfg.cast.animId]) {
        const ca = State.animations[cfg.cast.animId];
        if (ca.animation1Name) this.getImage(`img/animations/${ca.animation1Name}.png`);
        if (ca.animation2Name) this.getImage(`img/animations/${ca.animation2Name}.png`);
    }

    // Setup Direct Canvas Drag & Drop Gizmo Interactions
    this.setupCanvasMouseInteractions(this.canvas);

    // Paint initial frame immediately
    try {
        this.update(true);
        this.render();
    } catch (e) {
        console.warn("SkillAnimator initial draw warning:", e);
    }

    this.startLoop();
};

/**
 * Direct Canvas Drag & Drop for VFX Keyframe Positioning
 */
SkillAnimator.setupCanvasMouseInteractions = function (canvasEl) {
    if (!canvasEl || canvasEl._hasMouseDrag) return;
    canvasEl._hasMouseDrag = true;
    const self = this;
    let isDragging = false;

    function getCoords(e) {
        const rect = canvasEl.getBoundingClientRect();
        const scaleX = self.WIDTH / rect.width;
        const scaleY = self.HEIGHT / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function applyDrag(pt) {
        const cfg = self.getConfig(self.activeSkill);
        if (!cfg.steps || cfg.steps.length === 0) return;

        // Find active action step: either selected step or first action step
        let actionStep = cfg.steps[self.selectedStepIndex];
        if (!actionStep || actionStep.type !== 'action') {
            const idx = cfg.steps.findIndex(s => s.type === 'action');
            if (idx !== -1) {
                self.selectedStepIndex = idx;
                actionStep = cfg.steps[idx];
            }
        }
        if (!actionStep) return;

        const isSelf = actionStep.target === 'user';
        let baseX = isSelf ? self.actorPos.x : (self.enemyHome.x + self.enemyFlinchOffset.x);
        let baseY = isSelf ? self.actorPos.y : self.enemyHome.y;

        const posType = actionStep.posType || 'center';
        let anchorOffsetY = -35;
        if (posType === 'head') anchorOffsetY = -65;
        else if (posType === 'feet') anchorOffsetY = 0;
        else if (posType === 'screen') { baseX = self.WIDTH / 2; baseY = self.HEIGHT / 2; anchorOffsetY = 0; }

        const ox = Math.round(Math.max(-250, Math.min(250, pt.x - baseX)));
        const oy = Math.round(Math.max(-250, Math.min(250, pt.y - (baseY + anchorOffsetY))));

        if (actionStep.useKeyframes && self.activeKeyframeMode === 'end') {
            actionStep.endOffsetX = ox;
            actionStep.endOffsetY = oy;
            if (cfg.attack) {
                cfg.attack.endOffsetX = ox;
                cfg.attack.endOffsetY = oy;
            }
            const inEndX = document.getElementById('stepActionEndOffsetX');
            const inEndY = document.getElementById('stepActionEndOffsetY');
            const lblEnd = document.getElementById('stepActionEndCoordsLabel');
            if (inEndX) inEndX.value = ox;
            if (inEndY) inEndY.value = oy;
            if (lblEnd) lblEnd.textContent = `(X:${ox >= 0 ? '+' : ''}${ox}, Y:${oy >= 0 ? '+' : ''}${oy})`;
        } else {
            actionStep.offsetX = ox;
            actionStep.offsetY = oy;
            if (cfg.attack) {
                cfg.attack.offsetX = ox;
                cfg.attack.offsetY = oy;
            }
            const inX = document.getElementById('stepActionOffsetX');
            const inY = document.getElementById('stepActionOffsetY');
            const lbl = document.getElementById('stepActionCoordsLabel');
            if (inX) inX.value = ox;
            if (inY) inY.value = oy;
            if (lbl) lbl.textContent = `(X:${ox >= 0 ? '+' : ''}${ox}, Y:${oy >= 0 ? '+' : ''}${oy})`;
        }

        self.saveConfigToSkill(self.activeSkill, cfg);
        self.update(true);
        self.render();
        self.updateTimelineUI();
    }

    canvasEl.addEventListener('mousedown', (e) => {
        isDragging = true;
        self.isDraggingGizmo = true;
        canvasEl.style.cursor = 'grabbing';
        self.isPlaying = false;
        const playBtn = document.getElementById('svPlayBtn');
        if (playBtn) playBtn.textContent = '▶ Play';

        const pt = getCoords(e);
        const cfg = self.getConfig(self.activeSkill);
        const actionStep = cfg.steps && cfg.steps[self.selectedStepIndex];
        if (actionStep && actionStep.type === 'action' && actionStep.useKeyframes) {
            const isSelf = actionStep.target === 'user';
            let baseX = isSelf ? self.actorPos.x : (self.enemyHome.x + self.enemyFlinchOffset.x);
            let baseY = isSelf ? self.actorPos.y : self.enemyHome.y;
            const posType = actionStep.posType || 'center';
            let anchorOffsetY = -35;
            if (posType === 'head') anchorOffsetY = -65;
            else if (posType === 'feet') anchorOffsetY = 0;
            else if (posType === 'screen') { baseX = self.WIDTH / 2; baseY = self.HEIGHT / 2; anchorOffsetY = 0; }

            const startX = baseX + (actionStep.offsetX || 0);
            const startY = baseY + anchorOffsetY + (actionStep.offsetY !== undefined ? actionStep.offsetY : -35);
            const endX = baseX + (actionStep.endOffsetX !== undefined ? actionStep.endOffsetX : (actionStep.offsetX || 0));
            const endY = baseY + anchorOffsetY + (actionStep.endOffsetY !== undefined ? actionStep.endOffsetY : (actionStep.offsetY !== undefined ? actionStep.offsetY : -35));

            const distStart = Math.hypot(pt.x - startX, pt.y - startY);
            const distEnd = Math.hypot(pt.x - endX, pt.y - endY);

            // Automatically select closer keyframe if within proximity
            if (distEnd < distStart && distEnd < 45) {
                self.selectKeyframe('end');
            } else if (distStart < 45) {
                self.selectKeyframe('start');
            }
        }

        applyDrag(pt);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !self.canvas) return;
        applyDrag(getCoords(e));
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            self.isDraggingGizmo = false;
            if (canvasEl) canvasEl.style.cursor = 'crosshair';
            const cfg = self.getConfig(self.activeSkill);
            const step = cfg.steps && cfg.steps[self.selectedStepIndex];
            if (step && typeof showToast === 'function') {
                const kfLabel = (step.useKeyframes && self.activeKeyframeMode === 'end') ? 'Keyframe B (Titik Akhir)' : 'Keyframe A (Titik Awal)';
                const curX = (step.useKeyframes && self.activeKeyframeMode === 'end') ? (step.endOffsetX || 0) : (step.offsetX || 0);
                const curY = (step.useKeyframes && self.activeKeyframeMode === 'end') ? (step.endOffsetY !== undefined ? step.endOffsetY : -35) : (step.offsetY !== undefined ? step.offsetY : -35);
                showToast(`${kfLabel} Posisi VFX: (X:${curX >= 0 ? '+' : ''}${curX}, Y:${curY >= 0 ? '+' : ''}${curY})`, 'success');
            }
        }
    });
};

/**
 * Stop active render loop
 */
SkillAnimator.stop = function () {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
};

/**
 * Start 60fps RAF loop
 */
SkillAnimator.startLoop = function () {
    this.stop();
    const self = this;

    function step(now) {
        if (!self.canvas || !self.ctx) return;
        const delta = now - self.lastFrameTime;
        // Run roughly ~60 ticks per second modified by speed
        const tickInterval = 1000 / (60 * (self.speed || 1.0));

        if (delta >= tickInterval) {
            self.lastFrameTime = now;
            try {
                if (self.isPlaying) {
                    self.update();
                }
                self.render();
            } catch (err) {
                console.error("SkillAnimator loop step error:", err);
            }
        }
        self.rafId = requestAnimationFrame(step);
    }

    this.rafId = requestAnimationFrame(step);
};

/**
 * Calculate dynamic modular sequence choreography
 */
/**
 * Compute actor's baseline position resulting from prior choreography steps
 */
SkillAnimator.getActorPosBeforeStep = function (steps, targetIdx) {
    let px = this.actorHome.x - 48; // RPG Maker MV perform start baseline
    let py = this.actorHome.y;
    if (!steps || targetIdx <= 0) return { x: px, y: py };

    for (let i = 0; i < targetIdx && i < steps.length; i++) {
        const s = steps[i];
        if (s.type === 'cast') {
            if (s.step) px = (this.actorHome.x - 48) - 28;
        } else if (s.type === 'move') {
            const app = s.approach || 'melee';
            const dist = parseInt(s.distance, 10) || 50;
            if (app === 'melee' || app === 'jump' || app === 'teleport') {
                px = this.enemyHome.x + dist;
            } else if (app === 'behind' || app === 'jump_behind' || app === 'teleport_behind') {
                px = this.enemyHome.x - dist;
            } else if (app === 'step') {
                px = px - 32;
            }
            // 'ranged' leaves px unchanged
        } else if (s.type === 'return') {
            px = this.actorHome.x - 48;
            py = this.actorHome.y;
        }
        // 'action' does not alter character position (stays where it was left)
    }
    return { x: px, y: py };
};

SkillAnimator.update = function (isManual = false) {
    const cfg = this.getConfig(this.activeSkill);
    if (!cfg.steps || !Array.isArray(cfg.steps) || cfg.steps.length === 0) {
        cfg.steps = this.generateDefaultStepsFromCfg(cfg, this.activeSkill);
    }

    const SETUP_TICKS = 12; // RPG Maker MV Sprite_Actor perform start (12f forward step)
    const FINISH_TICKS = 12; // RPG Maker MV Sprite_Actor perform finish (12f backward step)

    // Compute cumulative timeline boundaries for every modular step starting after perform start
    let accum = SETUP_TICKS;
    for (let i = 0; i < cfg.steps.length; i++) {
        const step = cfg.steps[i];
        step.startTick = accum;
        const dur = Math.max(1, parseInt(step.duration, 10) || 15);
        step.endTick = accum + dur;
        accum = step.endTick;
    }
    const finishStart = accum;
    const finishEnd = finishStart + FINISH_TICKS;
    this.totalTicks = finishEnd + 4;
    const t = this.currentTick;

    // Find which step is active at current tick
    let activeStep = null;
    let activeStepIdx = -1;
    for (let i = 0; i < cfg.steps.length; i++) {
        if (t >= cfg.steps[i].startTick && t < cfg.steps[i].endTick) {
            activeStep = cfg.steps[i];
            activeStepIdx = i;
            break;
        }
    }
    const baseActorPos = (activeStepIdx >= 0) ? this.getActorPosBeforeStep(cfg.steps, activeStepIdx) : { x: this.actorHome.x - 48, y: this.actorHome.y };

    if (t < 0) {
        // --- Standby before sequence starts ---
        this.currentPhase = 'idle';
        this.targetAnimPlayers = [];
        this.scrubAnimPlayer = null;
        this.actorPos.x = this.actorHome.x;
        this.actorPos.y = this.actorHome.y;
        this.actorMotion = 'wait';
        this.actorAlpha = 1.0;
        this.enemyPos.x = this.enemyHome.x;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;

    } else if (t < SETUP_TICKS) {
        // --- RPG Maker MV Setup Action: perform start (Step forward 48px) ---
        this.currentPhase = 'setup';
        this.targetAnimPlayers = [];
        this.scrubAnimPlayer = null;
        const p = Math.max(0, Math.min(1, t / SETUP_TICKS));
        this.actorPos.x = this.actorHome.x - Math.round(48 * p);
        this.actorPos.y = this.actorHome.y;
        this.actorMotion = 'walk';
        this.actorAlpha = 1.0;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;

    } else if (t >= finishStart && t < finishEnd) {
        // --- RPG Maker MV Finish Action: perform finish (Step back 48px to Home) ---
        this.currentPhase = 'finish';
        this.targetAnimPlayers = [];
        this.scrubAnimPlayer = null;
        const p = Math.max(0, Math.min(1, (t - finishStart) / FINISH_TICKS));
        this.actorPos.x = (this.actorHome.x - 48) + Math.round(48 * p);
        this.actorPos.y = this.actorHome.y;
        this.actorMotion = 'walk';
        this.actorAlpha = 1.0;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;

    } else if (t >= finishEnd) {
        // --- Finished sequence / loop standby ---
        this.currentPhase = 'idle';
        this.targetAnimPlayers = [];
        this.scrubAnimPlayer = null;
        this.actorPos.x = this.actorHome.x;
        this.actorPos.y = this.actorHome.y;
        this.actorMotion = 'wait';
        this.actorAlpha = 1.0;
        this.enemyFlinchOffset.x = 0;
        this.enemyFlinchOffset.y = 0;
        this.enemyFlashColor = null;

    } else if (activeStep) {
        const dur = Math.max(1, parseInt(activeStep.duration, 10) || 15);
        const p = Math.max(0, Math.min(1, (t - activeStep.startTick) / dur));

        if (activeStep.type === 'cast') {
            this.currentPhase = 'cast';
            this.actorMotion = activeStep.motion || 'chant';
            const basePx = this.actorHome.x - 48;
            this.actorPos.x = activeStep.step ? (basePx - Math.min(28, p * 28)) : basePx;
            this.actorPos.y = this.actorHome.y;
            this.actorAlpha = 1.0;
            this.scrubAnimPlayer = null;

            if (!isManual && t === activeStep.startTick + 1 && activeStep.se) {
                this.playSe(activeStep.se);
            }

            if (activeStep.animId > 0 && State.animations && State.animations[activeStep.animId]) {
                const anim = State.animations[activeStep.animId];
                if (!isManual && !this.castAnimPlayer) {
                    this.castAnimPlayer = {
                        anim: anim,
                        img1: anim.animation1Name ? this.getImage(`img/animations/${anim.animation1Name}.png`) : null,
                        img2: anim.animation2Name ? this.getImage(`img/animations/${anim.animation2Name}.png`) : null,
                        frameIndex: 0,
                        rate: 4,
                        rateCounter: 0,
                        target: 'user',
                        flipX: !!activeStep.flipX,
                        flipY: !!activeStep.flipY
                    };
                } else if (isManual || !this.isPlaying) {
                    const frameIdx = Math.min((anim.frames || []).length - 1, Math.max(0, Math.floor((t - activeStep.startTick) / 4)));
                    this.castAnimPlayer = {
                        anim: anim,
                        img1: anim.animation1Name ? this.getImage(`img/animations/${anim.animation1Name}.png`) : null,
                        img2: anim.animation2Name ? this.getImage(`img/animations/${anim.animation2Name}.png`) : null,
                        frameIndex: frameIdx,
                        rate: 4,
                        rateCounter: 0,
                        target: 'user',
                        flipX: !!activeStep.flipX,
                        flipY: !!activeStep.flipY
                    };
                }
            } else {
                this.castAnimPlayer = null;
            }

        } else if (activeStep.type === 'move') {
            this.currentPhase = 'approach';
            this.castAnimPlayer = null;
            this.scrubAnimPlayer = null;
            const approach = activeStep.approach || 'melee';
            const dist = parseInt(activeStep.distance, 10) || 50;
            const startX = baseActorPos.x;
            let endX = startX;

            if (approach === 'melee' || approach === 'jump' || approach === 'teleport') {
                endX = this.enemyHome.x + dist;
            } else if (approach === 'behind' || approach === 'jump_behind' || approach === 'teleport_behind') {
                endX = this.enemyHome.x - dist;
            } else if (approach === 'step') {
                endX = startX - 32;
            } else {
                endX = startX;
            }

            if (approach === 'jump' || approach === 'jump_behind') {
                this.actorPos.x = startX + (endX - startX) * p;
                this.actorPos.y = this.actorHome.y - 55 * Math.sin(p * Math.PI);
                this.actorMotion = 'skill';
                this.actorAlpha = 1.0;
            } else if (approach === 'teleport' || approach === 'teleport_behind') {
                if (p < 0.5) {
                    this.actorAlpha = Math.max(0, 1 - p * 2);
                    this.actorPos.x = startX;
                } else {
                    this.actorAlpha = Math.min(1, (p - 0.5) * 2);
                    this.actorPos.x = endX;
                }
                this.actorPos.y = this.actorHome.y;
                this.actorMotion = 'wait';
            } else if (approach === 'ranged') {
                this.actorPos.x = startX;
                this.actorPos.y = this.actorHome.y;
                this.actorMotion = 'wait';
                this.actorAlpha = 1.0;
            } else { // 'melee', 'behind', 'step'
                this.actorPos.x = startX + (endX - startX) * p;
                this.actorPos.y = this.actorHome.y;
                this.actorMotion = 'walk';
                this.actorAlpha = 1.0;
            }

        } else if (activeStep.type === 'action') {
            this.currentPhase = 'attack';
            this.castAnimPlayer = null;
            const isSelf = activeStep.target === 'user';
            this.actorMotion = activeStep.motion || (isSelf ? 'guard' : 'swing');
            // Actor stays in position (determined strictly by prior Move block or stays at Home!)
            this.actorPos.x = baseActorPos.x;
            this.actorPos.y = baseActorPos.y;
            this.actorAlpha = 1.0;

            // Calculate dynamic keyframe interpolation for position & scaling
            const dur = Math.max(1, parseInt(activeStep.duration, 10) || 15);
            const localT = t - activeStep.startTick;
            const startX = parseInt(activeStep.offsetX, 10) || 0;
            const startY = parseInt(activeStep.offsetY !== undefined ? activeStep.offsetY : -35, 10);
            const startScale = parseInt(activeStep.scale !== undefined ? activeStep.scale : 100, 10);

            let curOx = startX;
            let curOy = startY;
            let curScale = startScale;

            const kfStart = Math.max(0, parseInt(activeStep.kfStart || 0, 10));
            const kfDur = Math.max(1, parseInt(activeStep.kfDuration !== undefined ? activeStep.kfDuration : Math.min(6, dur), 10));
            const easing = activeStep.kfEasing || 'ease-out';

            if (activeStep.useKeyframes) {
                let rawP = 0;
                if (localT <= kfStart) {
                    rawP = 0;
                } else if (localT >= kfStart + kfDur) {
                    rawP = 1;
                } else {
                    rawP = (localT - kfStart) / kfDur;
                }

                let p = rawP;
                if (easing === 'ease-out' || easing === 'fast') {
                    p = 1 - Math.pow(1 - rawP, 2);
                } else if (easing === 'ease-in' || easing === 'accel') {
                    p = Math.pow(rawP, 2);
                } else if (easing === 'ease-in-out' || easing === 'smooth') {
                    p = rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2;
                }

                const endX = parseInt(activeStep.endOffsetX !== undefined ? activeStep.endOffsetX : startX, 10);
                const endY = parseInt(activeStep.endOffsetY !== undefined ? activeStep.endOffsetY : startY, 10);
                const endScale = parseInt(activeStep.scaleEnd !== undefined ? activeStep.scaleEnd : startScale, 10);
                curOx = Math.round(startX + (endX - startX) * p);
                curOy = Math.round(startY + (endY - startY) * p);
                curScale = Math.round(startScale + (endScale - startScale) * p);
            }

            // Sync live offsets to active target animation players
            for (const p of this.targetAnimPlayers) {
                if (p.stepRef === activeStep) {
                    p.offsetX = curOx;
                    p.offsetY = curOy;
                    p.scale = curScale;
                }
            }

            // Timeline Timing Delays
            const seDelay = Math.max(0, parseInt(activeStep.seDelay || 0, 10));
            const fxDelay = Math.max(0, parseInt(activeStep.fxDelay || 0, 10));
            const defaultHit = activeStep.useKeyframes ? (kfStart + kfDur) : fxDelay;
            const hitDelay = Math.max(0, parseInt(activeStep.hitDelay !== undefined ? activeStep.hitDelay : defaultHit, 10));

            const seTick = activeStep.startTick + seDelay;
            const fxTick = activeStep.startTick + fxDelay;
            const hitTick = activeStep.startTick + hitDelay;

            if (!isManual) {
                // Audio SE trigger
                if (t === seTick && activeStep.se) {
                    this.playSe(activeStep.se);
                }

                // Spawn Target Animation at action start (calculate adaptive rate for sync)
                if (t === activeStep.startTick) {
                    const animId = activeStep.animId || 0;
                    if (animId > 0 && State.animations && State.animations[animId]) {
                        const anim = State.animations[animId];
                        const totalFrames = Math.max(1, (anim.frames || []).length);
                        let customRate = 2; // Default fast 30 FPS
                        if (activeStep.animRate && activeStep.animRate !== 'auto') {
                            customRate = Math.max(1, parseInt(activeStep.animRate, 10) || 2);
                        } else {
                            // Auto-fit rate to step duration
                            customRate = Math.max(1, Math.min(4, Math.floor(dur / totalFrames)));
                        }

                        this.targetAnimPlayers.push({
                            anim: anim,
                            img1: anim.animation1Name ? this.getImage(`img/animations/${anim.animation1Name}.png`) : null,
                            img2: anim.animation2Name ? this.getImage(`img/animations/${anim.animation2Name}.png`) : null,
                            frameIndex: 0,
                            rate: customRate,
                            rateCounter: 0,
                            target: isSelf ? 'user' : 'enemy',
                            posType: activeStep.posType || 'center',
                            flipX: !!activeStep.flipX,
                            flipY: !!activeStep.flipY,
                            stepRef: activeStep,
                            offsetX: curOx,
                            offsetY: curOy,
                            scale: curScale
                        });
                    }
                }

                // Screen Flash & Shake trigger
                if (t === fxTick) {
                    if (activeStep.shake === 'light') this.screenShake = { power: 3, duration: 10, current: 10 };
                    else if (activeStep.shake === 'heavy') this.screenShake = { power: 6, duration: 15, current: 15 };
                    else if (activeStep.shake === 'earthquake') this.screenShake = { power: 10, duration: 25, current: 25 };

                    if (activeStep.flash === 'white') this.screenFlash = { color: [255, 255, 255, 0.6], duration: 10, current: 10 };
                    else if (activeStep.flash === 'red') this.screenFlash = { color: [239, 68, 68, 0.6], duration: 12, current: 12 };
                    else if (activeStep.flash === 'gold') this.screenFlash = { color: [245, 158, 11, 0.6], duration: 14, current: 14 };
                }

                // Enemy reaction / damage popup trigger
                if (t === hitTick) {
                    this.triggerStepReaction(activeStep);
                }
            } else if (isManual || !this.isPlaying) {
                this.targetAnimPlayers = []; // Clear live running players during manual scrubbing
                const animId = activeStep.animId || 0;
                if (animId > 0 && State.animations && State.animations[animId]) {
                    const anim = State.animations[animId];
                    const totalFrames = Math.max(1, (anim.frames || []).length);
                    let customRate = 2;
                    if (activeStep.animRate && activeStep.animRate !== 'auto') {
                        customRate = Math.max(1, parseInt(activeStep.animRate, 10) || 2);
                    } else {
                        customRate = Math.max(1, Math.min(4, Math.floor(dur / totalFrames)));
                    }
                    const frameIdx = Math.min(totalFrames - 1, Math.max(0, Math.floor(localT / customRate)));
                    this.scrubAnimPlayer = {
                        anim: anim,
                        img1: anim.animation1Name ? this.getImage(`img/animations/${anim.animation1Name}.png`) : null,
                        img2: anim.animation2Name ? this.getImage(`img/animations/${anim.animation2Name}.png`) : null,
                        frameIndex: frameIdx,
                        rate: customRate,
                        rateCounter: 0,
                        target: isSelf ? 'user' : 'enemy',
                        posType: activeStep.posType || 'center',
                        flipX: !!activeStep.flipX,
                        flipY: !!activeStep.flipY,
                        stepRef: activeStep,
                        offsetX: curOx,
                        offsetY: curOy,
                        scale: curScale
                    };
                } else {
                    this.scrubAnimPlayer = null;
                }
            }

        } else if (activeStep.type === 'return') {
            this.currentPhase = 'return';
            this.castAnimPlayer = null;
            this.scrubAnimPlayer = null;
            const startX = baseActorPos.x;
            const endX = this.actorHome.x - 48; // Returns to battle-ready step-forward spot
            const approach = activeStep.approach || 'walk';

            if (approach === 'teleport') {
                if (p < 0.5) {
                    this.actorAlpha = Math.max(0, 1 - p * 2);
                    this.actorPos.x = startX;
                } else {
                    this.actorAlpha = Math.min(1, (p - 0.5) * 2);
                    this.actorPos.x = endX;
                }
                this.actorPos.y = this.actorHome.y;
                this.actorMotion = 'wait';
            } else if (approach === 'jump') {
                this.actorPos.x = startX + (endX - startX) * p;
                this.actorPos.y = this.actorHome.y - 35 * Math.sin(p * Math.PI);
                this.actorMotion = 'walk';
                this.actorAlpha = 1.0;
            } else {
                this.actorPos.x = startX + (endX - startX) * p;
                this.actorPos.y = this.actorHome.y;
                this.actorMotion = 'walk';
                this.actorAlpha = 1.0;
            }
        }
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
                        if (tm.flashColor && tm.flashColor.length >= 4) {
                            const flashAlpha = Math.max(0, Math.min(1, tm.flashColor[3] / 255));
                            const flashDur = Math.max(1, (tm.flashDuration || 3) * (p.rate || 2));
                            if (tm.flashScope === 1) {
                                this.enemyFlashColor = [tm.flashColor[0], tm.flashColor[1], tm.flashColor[2], flashAlpha];
                                setTimeout(() => { this.enemyFlashColor = null; }, flashDur * 16.6);
                            } else if (tm.flashScope === 2) {
                                this.screenFlash = {
                                    color: [tm.flashColor[0], tm.flashColor[1], tm.flashColor[2], flashAlpha],
                                    duration: flashDur,
                                    current: flashDur
                                };
                            }
                        }
                    }
                }
            }

            if (p.frameIndex >= (p.anim.frames || []).length) {
                this.targetAnimPlayers.splice(i, 1);
                continue;
            }
        }

        // Interpolate animated position and scale for active keyframe movement (HONORS kfDuration & kfEasing!)
        if (p.stepRef && p.stepRef.useKeyframes) {
            const step = p.stepRef;
            const dur = Math.max(1, parseInt(step.duration, 10) || 15);
            const localT = Math.max(0, this.currentTick - (step.startTick || 0));
            const startX = parseInt(step.offsetX, 10) || 0;
            const startY = parseInt(step.offsetY !== undefined ? step.offsetY : -35, 10);
            const startScale = parseInt(step.scale !== undefined ? step.scale : 100, 10);

            const kfStart = Math.max(0, parseInt(step.kfStart || 0, 10));
            const kfDur = Math.max(1, parseInt(step.kfDuration !== undefined ? step.kfDuration : Math.min(6, dur), 10));
            const easing = step.kfEasing || 'ease-out';

            let rawP = 0;
            if (localT <= kfStart) rawP = 0;
            else if (localT >= kfStart + kfDur) rawP = 1;
            else rawP = (localT - kfStart) / kfDur;

            let prog = rawP;
            if (easing === 'ease-out' || easing === 'fast') prog = 1 - Math.pow(1 - rawP, 2);
            else if (easing === 'ease-in' || easing === 'accel') prog = Math.pow(rawP, 2);
            else if (easing === 'ease-in-out' || easing === 'smooth') prog = rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2;

            const endX = parseInt(step.endOffsetX !== undefined ? step.endOffsetX : startX, 10);
            const endY = parseInt(step.endOffsetY !== undefined ? step.endOffsetY : startY, 10);
            const endScale = parseInt(step.scaleEnd !== undefined ? step.scaleEnd : startScale, 10);

            p.offsetX = Math.round(startX + (endX - startX) * prog);
            p.offsetY = Math.round(startY + (endY - startY) * prog);
            p.scale = Math.round(startScale + (endScale - startScale) * prog);
        } else if (p.stepRef) {
            p.offsetX = parseInt(p.stepRef.offsetX, 10) || 0;
            p.offsetY = parseInt(p.stepRef.offsetY !== undefined ? p.stepRef.offsetY : -35, 10);
            p.scale = parseInt(p.stepRef.scale !== undefined ? p.stepRef.scale : 100, 10);
        }
    }

    // Increment Sequence Progress
    if (!isManual) {
        this.currentTick++;
        if (this.currentTick >= this.totalTicks) {
            if (this.isLooping) {
                this.currentTick = 0;
            } else {
                this.currentTick = this.totalTicks;
                this.isPlaying = false;
                const btn = document.getElementById('svPlayBtn');
                if (btn) btn.textContent = '▶ Play';
            }
        }
    }

    this.updatePhaseIndicator();
    this.updateTimelineUI();
};

SkillAnimator.triggerEnemyReaction = function (cfg) {
    const rx = cfg.reaction || {};
    const isSelf = (cfg.attack && cfg.attack.target === 'user') || (this.activeSkill && (this.activeSkill.scope === 11 || this.activeSkill.id === 2));

    // 1. Physical offset (Enemy flinch only if attacking enemy)
    if (!isSelf) {
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
    }

    // 3. Sound
    if (rx.se) {
        this.playSe(rx.se);
    }

    // 4. Damage Popup / Status Indicator
    const val = rx.testValue || 0;
    const isCrit = rx.popupType === 'critical';
    const isHeal = rx.popupType === 'heal';
    const isMagic = rx.popupType === 'magical';
    const isGuard = rx.popupType === 'guard';
    const isBuff = rx.popupType === 'buff';
    const isSp = rx.popupType === 'sp_gain';

    let color = '#f87171'; // physical red
    let popupText = '-' + (val || 1250).toLocaleString();

    if (isCrit) { color = '#facc15'; popupText = 'CRIT ' + (val || 1850).toLocaleString(); }
    if (isHeal) { color = '#34d399'; popupText = '+' + (val || 1500).toLocaleString(); }
    if (isMagic) { color = '#67e8f9'; popupText = '-' + (val || 1240).toLocaleString(); }
    if (isGuard) { color = '#38bdf8'; popupText = '🛡️ GUARD'; }
    if (isBuff) { color = '#c084fc'; popupText = '✨ BUFF UP'; }
    if (isSp) { color = '#facc15'; popupText = '+' + (val || 20) + ' SP'; }

    const targetX = isSelf ? (this.actorPos.x + (Math.random() - 0.5) * 10) : (this.enemyHome.x + (Math.random() - 0.5) * 20);
    const targetY = isSelf ? (this.actorPos.y - 70) : (this.enemyHome.y - 70);

    this.activePopups.push({
        text: popupText,
        isCrit: isCrit,
        x: targetX,
        y: targetY,
        vy: 3.5,
        opacity: 1.0,
        color: color
    });
};

SkillAnimator.triggerStepReaction = function (step) {
    if (!step) return;
    const isSelf = step.target === 'user';

    // Physical flinch on enemy
    if (!isSelf) {
        const rx = step.reaction || 'flinch';
        if (rx === 'flinch') {
            this.enemyFlinchOffset.x = -16;
            this.enemyFlashColor = [239, 68, 68, 0.7];
        } else if (rx === 'knockback') {
            this.enemyFlinchOffset.x = -38;
            this.enemyFlashColor = [255, 255, 255, 0.85];
        } else if (rx === 'tremble') {
            this.enemyFlinchOffset.x = (Math.random() > 0.5 ? 8 : -8);
            this.enemyFlashColor = [239, 68, 68, 0.5];
        }
        setTimeout(() => { this.enemyFlashColor = null; }, 120);
    }

    // Popup
    const popupType = step.popupType || (isSelf ? 'guard' : 'hp_damage');
    let color = '#f87171';
    let popupText = '-1,250';
    let isCrit = false;

    if (popupType === 'critical') { color = '#facc15'; popupText = 'CRIT 2,850'; isCrit = true; }
    else if (popupType === 'heal') { color = '#34d399'; popupText = '+1,500'; }
    else if (popupType === 'magical') { color = '#67e8f9'; popupText = '-1,420'; }
    else if (popupType === 'guard') { color = '#38bdf8'; popupText = '🛡️ GUARD'; }
    else if (popupType === 'buff') { color = '#c084fc'; popupText = '✨ BUFF UP'; }

    const targetX = isSelf ? (this.actorPos.x + (Math.random() - 0.5) * 10) : (this.enemyHome.x + (Math.random() - 0.5) * 20);
    const targetY = isSelf ? (this.actorPos.y - 70) : (this.enemyHome.y - 70);

    this.activePopups.push({
        text: popupText,
        isCrit: isCrit,
        x: targetX,
        y: targetY,
        vy: 3.5,
        opacity: 1.0,
        color: color
    });
};

/**
 * Main Canvas Render Function
 */
SkillAnimator.render = function () {
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

    // 6. Draw Active Target Animations (on User or Enemy)
    const cfg = this.getConfig(this.activeSkill);
    const isSelf = (cfg.attack && cfg.attack.target === 'user') || (this.activeSkill && (this.activeSkill.scope === 11 || this.activeSkill.id === 2));
    const animsToDraw = (!this.isPlaying && this.scrubAnimPlayer) ? [this.scrubAnimPlayer] : this.targetAnimPlayers;

    for (const player of animsToDraw) {
        let baseX = (player.target === 'user') ? this.actorPos.x : (this.enemyHome.x + this.enemyFlinchOffset.x);
        let baseY = (player.target === 'user') ? this.actorPos.y : this.enemyHome.y;

        const posType = player.posType || (cfg.attack && cfg.attack.posType) || 'center';
        let anchorOffsetY = -35;
        if (posType === 'head') anchorOffsetY = -65;
        else if (posType === 'feet') anchorOffsetY = 0;
        else if (posType === 'screen') { baseX = W / 2; baseY = H / 2; anchorOffsetY = 0; }

        const ox = parseInt(player.offsetX !== undefined ? player.offsetX : ((cfg.attack && cfg.attack.offsetX) || 0), 10);
        const oy = parseInt(player.offsetY !== undefined ? player.offsetY : ((cfg.attack && cfg.attack.offsetY) || 0), 10);

        this.drawAnimationPlayer(ctx, player, baseX + ox, baseY + anchorOffsetY + oy);
    }

    // 6b. Draw Visual Target Reticles & Motion Trajectory (when paused, scrubbing, or dragging gizmo)
    if (!this.isPlaying || this.isDraggingGizmo) {
        const step = (cfg.steps && cfg.steps[this.selectedStepIndex]) || (cfg.steps && cfg.steps.find(s => s.type === 'action')) || cfg.attack;
        const isSelfStep = (step && step.target === 'user') || isSelf;
        let retX = isSelfStep ? this.actorPos.x : (this.enemyHome.x + this.enemyFlinchOffset.x);
        let retY = isSelfStep ? this.actorPos.y : this.enemyHome.y;
        const posType = (step && step.posType) || 'center';
        let anchorOffsetY = -35;
        if (posType === 'head') anchorOffsetY = -65;
        else if (posType === 'feet') anchorOffsetY = 0;
        else if (posType === 'screen') { retX = W / 2; retY = H / 2; anchorOffsetY = 0; }

        const startOx = parseInt((step && step.offsetX) || 0, 10);
        const startOy = parseInt((step && step.offsetY !== undefined) ? step.offsetY : -35, 10);
        const startScale = parseInt((step && step.scale !== undefined) ? step.scale : 100, 10);
        const startX = retX + startOx;
        const startY = retY + anchorOffsetY + startOy;

        const useKf = !!(step && step.useKeyframes);
        const endOx = parseInt((step && step.endOffsetX !== undefined) ? step.endOffsetX : startOx, 10);
        const endOy = parseInt((step && step.endOffsetY !== undefined) ? step.endOffsetY : startOy, 10);
        const endScale = parseInt((step && step.scaleEnd !== undefined) ? step.scaleEnd : startScale, 10);
        const endX = retX + endOx;
        const endY = retY + anchorOffsetY + endOy;

        ctx.save();

        if (useKf) {
            // 1. Draw Trajectory Line from Start to End
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            const grad = ctx.createLinearGradient(startX, startY, endX, endY);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(1, '#f43f5e');
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Arrow head at End
            const angle = Math.atan2(endY - startY, endX - startX);
            const arrowLen = 10;
            ctx.setLineDash([]);
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowLen * Math.cos(angle - Math.PI / 6), endY - arrowLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - arrowLen * Math.cos(angle + Math.PI / 6), endY - arrowLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            // 2. Draw Current Progress Ghost Reticle
            const dur = Math.max(1, parseInt(step.duration, 10) || 15);
            const localT = this.currentTick - (step.startTick || 0);
            const kfStart = Math.max(0, parseInt(step.kfStart || 0, 10));
            const kfDur = Math.max(1, parseInt(step.kfDuration !== undefined ? step.kfDuration : Math.min(6, dur), 10));
            const easing = step.kfEasing || 'ease-out';

            let rawP = 0;
            if (localT <= kfStart) rawP = 0;
            else if (localT >= kfStart + kfDur) rawP = 1;
            else rawP = (localT - kfStart) / kfDur;

            let p = rawP;
            if (easing === 'ease-out' || easing === 'fast') p = 1 - Math.pow(1 - rawP, 2);
            else if (easing === 'ease-in' || easing === 'accel') p = Math.pow(rawP, 2);
            else if (easing === 'ease-in-out' || easing === 'smooth') p = rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2;

            const curX = startX + (endX - startX) * p;
            const curY = startY + (endY - startY) * p;
            const curScale = startScale + (endScale - startScale) * p;

            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Ghost ring for current scale
            const curRadius = Math.max(10, Math.min(48, 20 * (curScale / 100)));
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.arc(curX, curY, curRadius, 0, Math.PI * 2);
            ctx.stroke();

            // 3. Draw End Reticle (🔴 Keyframe B)
            const isEndActive = this.activeKeyframeMode === 'end';
            const endRadius = Math.max(12, Math.min(45, 20 * (endScale / 100)));
            ctx.setLineDash(isEndActive ? [3, 2] : [4, 4]);
            ctx.strokeStyle = isEndActive ? '#fb7185' : 'rgba(244, 63, 94, 0.7)';
            ctx.lineWidth = isEndActive ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.arc(endX, endY, endRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(endX, endY, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(endX - 16, endY); ctx.lineTo(endX + 16, endY);
            ctx.moveTo(endX, endY - 16); ctx.lineTo(endX, endY + 16);
            ctx.stroke();

            // End Label
            ctx.fillStyle = isEndActive ? '#fda4af' : '#fb7185';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🔴 B(Akhir): (${endOx >= 0 ? '+' : ''}${endOx}, ${endOy >= 0 ? '+' : ''}${endOy}) [${endScale}%]`, endX, endY + endRadius + 11);

            // 4. Draw Start Reticle (🟢 Keyframe A)
            const isStartActive = this.activeKeyframeMode !== 'end';
            const startRadius = Math.max(12, Math.min(45, 20 * (startScale / 100)));
            ctx.setLineDash(isStartActive ? [3, 2] : [4, 4]);
            ctx.strokeStyle = isStartActive ? '#34d399' : 'rgba(16, 185, 129, 0.7)';
            ctx.lineWidth = isStartActive ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.arc(startX, startY, startRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(startX, startY, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(startX - 16, startY); ctx.lineTo(startX + 16, startY);
            ctx.moveTo(startX, startY - 16); ctx.lineTo(startX, startY + 16);
            ctx.stroke();

            // Start Label
            ctx.fillStyle = isStartActive ? '#6ee7b7' : '#34d399';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🟢 A(Awal): (${startOx >= 0 ? '+' : ''}${startOx}, ${startOy >= 0 ? '+' : ''}${startOy}) [${startScale}%]`, startX, startY - startRadius - 4);

        } else {
            // Single Static Target Reticle
            const singleRadius = Math.max(12, Math.min(45, 20 * (startScale / 100)));
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(startX, startY, singleRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.arc(startX, startY, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(startX - 24, startY); ctx.lineTo(startX + 24, startY);
            ctx.moveTo(startX, startY - 24); ctx.lineTo(startX, startY + 24);
            ctx.stroke();

            // Label Tag
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            const stepLabel = (step && step.name) ? step.name : 'VFX';
            let flipTags = '';
            if (step && step.flipX) flipTags += ' [↔ Flip X]';
            if (step && step.flipY) flipTags += ' [↕ Flip Y]';
            ctx.fillText(`🎯 ${stepLabel} (${startOx >= 0 ? '+' : ''}${startOx}, ${startOy >= 0 ? '+' : ''}${startOy}) [${startScale}%]${flipTags}`, startX, startY - singleRadius - 4);
        }

        ctx.restore();
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
SkillAnimator.drawShadow = function (x, y) {
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
SkillAnimator.drawActor = function (ctx) {
    const img = this.getImage(`img/sv_actors/${this.selectedActorName}.png`);
    if (!img || !img.complete || img.naturalWidth === 0) {
        // Draw elegant placeholder while spritesheet loads
        ctx.save();
        ctx.fillStyle = '#8b5cf6aa';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.actorPos.x, this.actorPos.y - 28, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ACTOR', this.actorPos.x, this.actorPos.y - 25);
        ctx.restore();
        return;
    }

    // Standard MV SV Battler Motion Indices
    const MOTION_INDEX = {
        walk: 0, wait: 1, chant: 2, guard: 3, damage: 4, evade: 5,
        thrust: 6, swing: 7, missile: 8, attack: 7, skill: 9, spell: 10, item: 11,
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

    // Render weapon sprite during swing, thrust, or missile motions (matches RPG Maker MV Sprite_Weapon)
    if (this.actorMotion === 'swing' || this.actorMotion === 'thrust' || this.actorMotion === 'missile') {
        const weaponImg = this.getImage('img/system/Weapons1.png');
        if (weaponImg && weaponImg.complete && weaponImg.naturalWidth > 0) {
            // Weapon index in Weapons1: 1=Sword (swing), 4=Spear (thrust), 8=Bow (missile)
            let wIdx = 1;
            if (this.actorMotion === 'thrust') wIdx = 4;
            if (this.actorMotion === 'missile') wIdx = 8;

            const wW = 96;
            const wH = 64;
            const wCol = (Math.floor((wIdx - 1) / 6) * 3) + pattern;
            const wRow = (wIdx - 1) % 6;
            ctx.drawImage(weaponImg, wCol * wW, wRow * wH, wW, wH, this.actorPos.x - 48, this.actorPos.y - 56, wW, wH);
        }
    }

    ctx.restore();
};

/**
 * Draw Enemy Battler
 */
SkillAnimator.drawEnemy = function (ctx) {
    let img = this.getImage(`img/sv_enemies/${this.selectedEnemyName}.png`);
    if (!img || !img.complete || img.naturalWidth === 0) {
        img = this.getImage(`img/enemies/${this.selectedEnemyName}.png`);
    }

    const ex = this.enemyHome.x + this.enemyFlinchOffset.x;
    const ey = this.enemyHome.y + this.enemyFlinchOffset.y;

    if (!img || !img.complete || img.naturalWidth === 0) {
        // Draw elegant placeholder while spritesheet loads
        ctx.save();
        ctx.fillStyle = '#ef4444aa';
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, ey - 28, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ENEMY', ex, ey - 25);
        ctx.restore();
        return;
    }

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
SkillAnimator.drawAnimationPlayer = function (ctx, player, targetX, targetY) {
    if (!player || !player.anim) return;

    const frames = player.anim.frames || [];
    if (player.frameIndex >= frames.length) return;

    const frame = frames[player.frameIndex];
    if (!frame || !Array.isArray(frame)) return;

    const cellW = 192;
    const cellH = 192;

    const flipX = !!player.flipX;
    const flipY = !!player.flipY;
    const fx = flipX ? -1 : 1;
    const fy = flipY ? -1 : 1;
    const rotMult = fx * fy;
    const vfxScale = (player.scale !== undefined ? player.scale : 100) / 100;

    for (const cell of frame) {
        if (!cell) continue;
        const pattern = cell[0];
        if (pattern < 0) continue;

        const img = (pattern < 100) ? (player.img1 || player.img) : (player.img2 || player.img1 || player.img);
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const subPattern = pattern % 100;
        const sx = (subPattern % 5) * cellW;
        const sy = Math.floor(subPattern / 5) * cellH;

        const x = targetX + (cell[1] || 0) * fx * vfxScale;
        const y = targetY + (cell[2] || 0) * fy * vfxScale;
        const scale = ((cell[3] !== undefined ? cell[3] : 100) / 100) * 0.75 * vfxScale;
        const rotation = (((cell[4] || 0) * rotMult) * Math.PI) / 180;
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
        ctx.scale(scale * mirror * fx, scale * fy);

        ctx.drawImage(img, sx, sy, cellW, cellH, -cellW / 2, -cellH / 2, cellW, cellH);
        ctx.restore();
    }
};

/**
 * Update visual phase pill badge in toolbar
 */
SkillAnimator.updatePhaseIndicator = function () {
    const badge = document.getElementById('svPhaseIndicator');
    if (!badge) return;

    const phaseNames = {
        idle: '⏸ Standby',
        setup: '🚀 Setup: Step Forward',
        cast: '🔮 F1: Casting',
        approach: '🏃 F2A: Maju',
        attack: '⚔️ F2B: Serang',
        reaction: '💥 F3: Reaksi',
        return: '↩️ F4: Mundur',
        finish: '🏁 Finish: Step Back'
    };

    const phaseColors = {
        idle: '#94a3b8',
        setup: '#818cf8',
        cast: '#c084fc',
        approach: '#38bdf8',
        attack: '#f87171',
        reaction: '#facc15',
        return: '#4ade80',
        finish: '#a78bfa'
    };

    badge.textContent = phaseNames[this.currentPhase] || this.currentPhase;
    badge.style.color = phaseColors[this.currentPhase] || '#f8fafc';
    badge.style.borderColor = (phaseColors[this.currentPhase] || '#334155') + '66';
    badge.style.whiteSpace = 'nowrap';
    badge.style.fontSize = '0.68rem';
    badge.style.padding = '2px 8px';
};

/**
 * Update Interactive Timeline Scrubber & Frame Number
 */
SkillAnimator.updateTimelineUI = function () {
    const textEl = document.getElementById('svCurrentFrameText');
    if (textEl) {
        textEl.textContent = `${this.currentTick}f / ${this.totalTicks}f`;
    }
    const capText = document.getElementById('capcutCurrentFrameText');
    if (capText) {
        capText.textContent = `${this.currentTick}f / ${this.totalTicks}f`;
    }
    const slider = document.getElementById('svTimelineSlider');
    if (slider) {
        slider.max = this.totalTicks || 75;
        slider.value = this.currentTick;
    }
    const needle = document.getElementById('capcutPlayheadNeedle');
    if (needle) {
        const pct = (this.currentTick / Math.max(1, this.totalTicks)) * 100;
        needle.style.left = `${pct}%`;
    }
};

/**
 * Setup Click & Drag Scrubbing on CapCut Timeline Tracks
 */
SkillAnimator.setupTimelineScrubInteractions = function (el) {
    if (!el || el._hasScrub) return;
    el._hasScrub = true;
    const self = this;
    let isScrubbing = false;

    let activeDragPill = null;
    let dragType = null;
    let dragStepIdx = -1;
    let dragInitialVal = 0;
    let dragStartX = 0;

    function handleScrub(e) {
        if (activeDragPill) return;
        const rect = el.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left);
        const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const tick = Math.round(p * (self.totalTicks || 75));

        self.isPlaying = false;
        const btn = document.getElementById('svPlayBtn');
        if (btn) btn.textContent = '▶ Play';

        self.currentTick = tick;
        self.update(true);
        self.render();
    }

    el.addEventListener('mousedown', (e) => {
        const pill = e.target.closest('[data-drag-type]');
        if (pill) {
            e.preventDefault();
            e.stopPropagation();
            activeDragPill = pill;
            dragType = pill.getAttribute('data-drag-type');
            dragStepIdx = parseInt(pill.getAttribute('data-step-idx'), 10);
            dragStartX = e.clientX;
            document.body.style.cursor = 'ew-resize';

            const cfg = self.getConfig(self.activeSkill);
            const step = cfg.steps && cfg.steps[dragStepIdx];
            if (!step) return;

            if (dragType === 'se') {
                dragInitialVal = parseInt(step.seDelay || 0, 10);
            } else if (dragType === 'fx') {
                dragInitialVal = parseInt(step.fxDelay || 0, 10);
            } else if (dragType === 'kf') {
                dragInitialVal = parseInt(step.kfStart || 0, 10);
            }
            return;
        }

        isScrubbing = true;
        handleScrub(e);
    });

    window.addEventListener('mousemove', (e) => {
        if (activeDragPill) {
            const cfg = self.getConfig(self.activeSkill);
            const step = cfg.steps && cfg.steps[dragStepIdx];
            if (!step) return;

            const rect = el.getBoundingClientRect();
            const totalWidthPx = rect.width;
            const pxPerTick = totalWidthPx / Math.max(1, self.totalTicks);
            const deltaX = e.clientX - dragStartX;
            const deltaTicks = Math.round(deltaX / pxPerTick);
            const dur = Math.max(1, parseInt(step.duration, 10) || 15);

            if (dragType === 'se') {
                const newVal = Math.max(0, Math.min(dur - 1, dragInitialVal + deltaTicks));
                step.seDelay = newVal;
                const leftPct = ((step.startTick + newVal) / self.totalTicks) * 100;
                activeDragPill.style.left = `${leftPct}%`;
                const badge = activeDragPill.querySelector('.drag-badge');
                if (badge) badge.textContent = `+${newVal}f`;

                const inRange = document.getElementById('stepActionSeDelayRange');
                const inNum = document.getElementById('stepActionSeDelay');
                if (inRange) inRange.value = newVal;
                if (inNum) inNum.value = newVal;

            } else if (dragType === 'fx') {
                const newVal = Math.max(0, Math.min(dur - 1, dragInitialVal + deltaTicks));
                step.fxDelay = newVal;
                const leftPct = ((step.startTick + newVal) / self.totalTicks) * 100;
                activeDragPill.style.left = `${leftPct}%`;
                const badge = activeDragPill.querySelector('.drag-badge');
                if (badge) badge.textContent = `+${newVal}f`;

                const inRange = document.getElementById('stepActionFxDelayRange');
                const inNum = document.getElementById('stepActionFxDelay');
                if (inRange) inRange.value = newVal;
                if (inNum) inNum.value = newVal;

            } else if (dragType === 'kf') {
                const kfDur = parseInt(step.kfDuration !== undefined ? step.kfDuration : Math.min(6, dur), 10);
                const newVal = Math.max(0, Math.min(dur - kfDur, dragInitialVal + deltaTicks));
                step.kfStart = newVal;
                const leftPct = ((step.startTick + newVal) / self.totalTicks) * 100;
                activeDragPill.style.left = `${leftPct}%`;
                const badge = activeDragPill.querySelector('.drag-badge');
                if (badge) badge.textContent = `⚡${kfDur}f (+${newVal}f)`;
                const inNum = document.getElementById('stepActionKfStart');
                if (inNum) inNum.value = newVal;
            }

            self.saveConfigToSkill(self.activeSkill, cfg);
            return;
        }

        if (isScrubbing) handleScrub(e);
    });

    window.addEventListener('mouseup', () => {
        if (activeDragPill) {
            activeDragPill = null;
            document.body.style.cursor = '';
            const cfg = self.getConfig(self.activeSkill);
            self.saveConfigToSkill(self.activeSkill, cfg);
            self.update(true);
            self.render();
            self.updateTimelineUI();
            if (typeof renderEditor === 'function') renderEditor();
        }
        isScrubbing = false;
    });
};

/**
 * Modular Sequencer Step Management Methods
 */
SkillAnimator.addStep = function (type) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps) cfg.steps = [];

    const animId = skill.animationId || (State.animations && State.animations[1] ? 1 : 0);
    const count = cfg.steps.filter(s => s.type === type).length + 1;
    let newStep = null;

    if (type === 'cast') {
        newStep = {
            id: 'step_cast_' + Math.random().toString(36).substr(2, 5),
            type: 'cast',
            name: `🔮 Rapalan #${count}`,
            duration: 15,
            motion: 'chant',
            animId: 0,
            flipX: false,
            flipY: false,
            se: 'Magic1',
            step: false
        };
    } else if (type === 'move') {
        newStep = {
            id: 'step_move_' + Math.random().toString(36).substr(2, 5),
            type: 'move',
            name: `🏃 Gerak #${count}`,
            duration: 14,
            approach: 'melee',
            distance: 50
        };
    } else if (type === 'action') {
        const isSelf = skill.scope === 11 || skill.id === 2;
        newStep = {
            id: 'step_action_' + Math.random().toString(36).substr(2, 5),
            type: 'action',
            name: `⚔️ Aksi #${count}`,
            duration: 18,
            motion: isSelf ? 'guard' : 'swing',
            target: isSelf ? 'user' : 'target',
            animId: animId,
            offsetX: 0,
            offsetY: -35,
            scale: 100,
            useKeyframes: false,
            endOffsetX: 0,
            endOffsetY: -35,
            scaleEnd: 100,
            flipX: false,
            flipY: false,
            posType: 'center',
            se: 'Blow1',
            shake: 'none',
            flash: 'none',
            reaction: 'flinch',
            popupType: isSelf ? 'guard' : 'hp_damage'
        };
    } else if (type === 'return') {
        newStep = {
            id: 'step_return_' + Math.random().toString(36).substr(2, 5),
            type: 'return',
            name: `↩️ Kembali #${count}`,
            duration: 14,
            approach: 'walk'
        };
    }

    if (newStep) {
        cfg.steps.push(newStep);
        this.selectedStepIndex = cfg.steps.length - 1;
        this.saveConfigToSkill(skill, cfg);
        if (typeof renderEditor === 'function') renderEditor();
        if (typeof showToast === 'function') showToast(`Blok baru [${newStep.name}] ditambahkan ke timeline!`, 'success');
    }
};

SkillAnimator.removeStep = function (index) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || cfg.steps.length <= 1) {
        if (typeof showToast === 'function') showToast('Timeline minimal harus memiliki 1 tahapan blok!', 'warning');
        return;
    }

    const removed = cfg.steps.splice(index, 1)[0];
    if (this.selectedStepIndex >= cfg.steps.length) {
        this.selectedStepIndex = cfg.steps.length - 1;
    }
    this.saveConfigToSkill(skill, cfg);
    if (typeof renderEditor === 'function') renderEditor();
    if (typeof showToast === 'function') showToast(`Blok [${removed.name}] dihapus dari timeline.`, 'info');
};

SkillAnimator.moveStep = function (index, delta) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps) return;

    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= cfg.steps.length) return;

    const temp = cfg.steps[index];
    cfg.steps[index] = cfg.steps[targetIdx];
    cfg.steps[targetIdx] = temp;

    this.selectedStepIndex = targetIdx;
    this.saveConfigToSkill(skill, cfg);
    if (typeof renderEditor === 'function') renderEditor();
};

SkillAnimator.cloneStep = function (index) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !cfg.steps[index]) return;

    const cloned = JSON.parse(JSON.stringify(cfg.steps[index]));
    cloned.id = 'step_' + cloned.type + '_' + Math.random().toString(36).substr(2, 5);
    cloned.name = (cloned.name || 'Step') + ' (Salinan)';
    cfg.steps.splice(index + 1, 0, cloned);

    this.selectedStepIndex = index + 1;
    this.saveConfigToSkill(skill, cfg);
    if (typeof renderEditor === 'function') renderEditor();
    if (typeof showToast === 'function') showToast(`Blok diduplikasi: ${cloned.name}`, 'success');
};

SkillAnimator.selectStep = function (index) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !cfg.steps[index]) return;

    this.selectedStepIndex = index;
    const step = cfg.steps[index];

    this.currentTick = step.startTick !== undefined ? step.startTick : 0;
    this.isPlaying = false;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = '▶ Play';

    this.update(true);
    this.render();

    if (typeof renderEditor === 'function') renderEditor();
};

SkillAnimator.updateSelectedStepField = function (field, value) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !cfg.steps[this.selectedStepIndex]) return;

    const step = cfg.steps[this.selectedStepIndex];
    step[field] = value;

    if (step.type === 'action') {
        if (field === 'animId') cfg.attack.animId = value;
        if (field === 'motion') cfg.attack.motion = value;
        if (field === 'target') cfg.attack.target = value;
        if (field === 'offsetX') cfg.attack.offsetX = value;
        if (field === 'offsetY') cfg.attack.offsetY = value;
        if (field === 'scale') cfg.attack.scale = value;
        if (field === 'useKeyframes') cfg.attack.useKeyframes = value;
        if (field === 'endOffsetX') cfg.attack.endOffsetX = value;
        if (field === 'endOffsetY') cfg.attack.endOffsetY = value;
        if (field === 'scaleEnd') cfg.attack.scaleEnd = value;
        if (field === 'flipX') cfg.attack.flipX = value;
        if (field === 'flipY') cfg.attack.flipY = value;
    } else if (step.type === 'cast') {
        if (field === 'motion') cfg.cast.motion = value;
        if (field === 'animId') cfg.cast.animId = value;
        if (field === 'se') cfg.cast.se = value;
        if (field === 'scale') cfg.cast.scale = value;
        if (field === 'flipX') cfg.cast.flipX = value;
        if (field === 'flipY') cfg.cast.flipY = value;
    }

    this.saveConfigToSkill(skill, cfg);
    this.update(true);
    this.render();
    this.updateTimelineUI();

    const yanflyEl = document.getElementById('yanflySeqPreview');
    if (yanflyEl) {
        yanflyEl.value = this.generateYanflySequence(cfg, skill);
    }
};

SkillAnimator.changeSelectedStepDuration = function (delta) {
    const skill = this.activeSkill || State.skills[State.selectedIndex];
    if (!skill) return;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !cfg.steps[this.selectedStepIndex]) return;

    const step = cfg.steps[this.selectedStepIndex];
    step.duration = Math.max(4, Math.min(120, (parseInt(step.duration, 10) || 15) + delta));

    this.saveConfigToSkill(skill, cfg);
    if (typeof renderEditor === 'function') renderEditor();
};

/**
 * Save Current Studio Configuration
 */
/**
 * Synchronize Current Studio Configuration to Skill in Memory
 */
SkillAnimator.syncCurrentStudioConfig = function () {
    const skill = this.activeSkill || (State.skills && State.skills[State.selectedIndex]);
    if (!skill) return null;
    const cfg = this.getConfig(skill);
    this.saveConfigToSkill(skill, cfg);

    // If this skill is linked to a weapon, ensure the weapon has the unleash note tag and is marked modified
    if (State.weapons) {
        for (const w of State.weapons) {
            if (w && w.note && (w.note.includes(`<skill_id: ${skill.id}>`) || w.note.includes(`<skill_id:${skill.id}>`))) {
                if (!w.note.includes(`<Unleash Skill: ${skill.id}`)) {
                    w.note = `<Unleash Skill: ${skill.id}>\n` + w.note;
                }
                if (!State.modifiedTabs) State.modifiedTabs = new Set();
                State.modifiedTabs.add('weapons');
            }
        }
    }

    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('skills');
    State.modifiedTabs.add('skill_animator');
    return skill;
};

/**
 * Save Current Studio Configuration and Persist to Disk
 */
SkillAnimator.saveCurrentStudioConfig = async function () {
    const skill = this.syncCurrentStudioConfig();
    if (!skill) return;

    if (typeof saveActiveDataset === 'function') {
        await saveActiveDataset();
    } else if (typeof showToast === 'function') {
        showToast('Koreografi blok modular berhasil disimpan ke Skill #' + skill.id, 'success');
    }
};

/**
 * Render Studio Tab (Modular CapCut-Style Keyframe Workspace)
 */
SkillAnimator.renderStudioTab = function (container, skill) {
    if (!container || !skill) return;
    this.activeSkill = skill;
    const cfg = this.getConfig(skill);
    if (!cfg.steps || !Array.isArray(cfg.steps) || cfg.steps.length === 0) {
        cfg.steps = this.generateDefaultStepsFromCfg(cfg, skill);
    }

    const animList = (State.animations || []).filter(a => a);

    // Check if this skill is linked as a custom weapon attack skill
    const linkedWeapon = State.weapons ? State.weapons.find(w => w && w.note && (new RegExp(`<skill_id:\\s*${skill.id}>`, 'i').test(w.note) || new RegExp(`<Unleash Skill:\\s*${skill.id}\\b`, 'i').test(w.note))) : null;

    // Compute cumulative timeline boundaries (Immediate 0-lag start)
    let accum = 0;
    for (let i = 0; i < cfg.steps.length; i++) {
        const s = cfg.steps[i];
        s.startTick = accum;
        s.endTick = accum + (parseInt(s.duration, 10) || 15);
        accum = s.endTick;
    }
    const totalTicks = accum + 4;
    this.totalTicks = totalTicks;

    if (this.selectedStepIndex < 0 || this.selectedStepIndex >= cfg.steps.length) {
        this.selectedStepIndex = 0;
    }
    const selStep = cfg.steps[this.selectedStepIndex] || cfg.steps[0];

    const TYPE_THEMES = {
        cast: { name: 'Rapalan (Cast)', icon: '🔮', bg: 'rgba(139,92,246,0.25)', border: '#8b5cf6', text: '#c4b5fd' },
        move: { name: 'Gerak (Move)', icon: '🏃', bg: 'rgba(14,165,233,0.25)', border: '#0ea5e9', text: '#7dd3fc' },
        action: { name: 'Aksi / VFX', icon: '⚔️', bg: 'rgba(244,63,94,0.25)', border: '#f43f5e', text: '#fda4af' },
        return: { name: 'Kembali (Return)', icon: '↩️', bg: 'rgba(234,179,8,0.25)', border: '#eab308', text: '#fef08a' }
    };

    container.innerHTML = `
        <div class="skill-animation-studio" style="display:flex; flex-direction:column; gap:12px;">
            <!-- TOP TOOLBAR: Skill info, Presets, Actions -->
            <div class="card" style="margin-bottom:0; background:linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(15,23,42,0.9) 100%); border:1px solid #8b5cf644; padding:12px 16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.4rem;">🎬</span>
                        <div>
                            <div style="font-size:0.7rem; color:#c084fc; font-weight:700; letter-spacing:0.5px;">BLOK MODULAR TIMELINE &amp; KEYFRAME STUDIO</div>
                            <h2 style="font-size:1.2rem; margin:0; color:#fff; font-weight:700;">#${skill.id} ${escapeHtml(skill.name || 'Unnamed')}</h2>
                            ${skill.id === 1 ? `
                                <div style="margin-top:4px; display:inline-flex; align-items:center; gap:8px; background:rgba(56,189,248,0.12); border:1px solid #38bdf855; border-radius:6px; padding:2px 8px;">
                                    <span style="font-size:0.72rem; color:#7dd3fc;">⚔️ Ini Skill #1 (Attack Standar). Ingin atur serangan khusus per senjata?</span>
                                    <button type="button" class="btn btn-xs btn-primary" onclick="switchTab('weapons')" style="font-size:0.68rem; padding:1px 6px; font-weight:700;">
                                        Tab Weapons ➔
                                    </button>
                                </div>
                            ` : (linkedWeapon ? `
                                <div style="margin-top:4px; display:inline-flex; align-items:center; gap:8px; background:rgba(250,204,21,0.12); border:1px solid #facc1555; border-radius:6px; padding:2px 8px;">
                                    <span style="font-size:0.72rem; color:#fde047;">⚔️ Serangan khusus untuk: <strong>${escapeHtml(linkedWeapon.name)}</strong></span>
                                    <button type="button" class="btn btn-xs btn-secondary" onclick="State.selectedIndices = State.selectedIndices || {}; State.selectedIndices['weapons'] = ${linkedWeapon.id}; switchTab('weapons');" style="font-size:0.68rem; padding:1px 6px;">
                                        Lihat Senjata ➔
                                    </button>
                                </div>
                            ` : '')}
                        </div>
                    </div>
                    <!-- Quick 1-Click Archetypes -->
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('melee')" title="Melee Strike">🗡️ Melee</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('combo')" title="Combo Slash">⚡ Combo</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('jump')" title="High Jump Plunge">🦘 Jump</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('magic')" title="Magic Spell">🔮 Magic</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('ranged')" title="Ranged Missile">🏹 Ranged</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('guard')" title="Guard (Self)">🛡️ Guard</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('buff')" title="Buff (Self)">✨ Buff</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="applySkillPreset('blink')" title="Teleport Blink">🌀 Blink</button>
                    </div>
                    <!-- Actions -->
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn btn-sm" onclick="SkillAnimator.saveCurrentStudioConfig()" style="font-weight:700; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#fff; border:1px solid #34d399; box-shadow:0 0 12px rgba(16,185,129,0.35);" title="Simpan animasi & langsung terapkan ke file database game (Skills.json & Weapons.json)">💾 Simpan ke Game (Project)</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="copySkillSequenceToClipboard()" title="Salin notetag ke clipboard">📋 Copy Tag</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="resetSkillSequenceToDefault()" style="color:#f87171;" title="Reset sequence ke MV default">🔄 Reset</button>
                    </div>
                </div>
            </div>

            <!-- MAIN BATTLE CANVAS VIEWPORT -->
            <div class="card" style="margin-bottom:0; background:#020617; border:1px solid #8b5cf644; overflow:hidden;">
                <div style="position:relative; width:100%; aspect-ratio:16/9; max-height:360px; background:#000; overflow:hidden;">
                    <canvas id="svBattleCanvas" width="480" height="270" style="width:100%; height:100%; display:block; image-rendering:pixelated; cursor:crosshair;"></canvas>
                    
                    <!-- Canvas Overlay Gizmo Hint & Keyframe Switcher -->
                    <div style="position:absolute; top:8px; left:8px; background:rgba(2,6,23,0.88); border:1px solid #38bdf866; border-radius:6px; padding:3px 8px; font-size:0.7rem; color:#67e8f9; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(0,0,0,0.6); z-index:10;">
                        <span>🎯 <strong>Keyframe Drag:</strong></span>
                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.selectKeyframe('start')" style="padding:1px 7px; font-size:0.68rem; font-weight:700; border-radius:4px; border:1px solid ${SkillAnimator.activeKeyframeMode !== 'end' ? '#10b981' : '#334155'}; background:${SkillAnimator.activeKeyframeMode !== 'end' ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}; color:${SkillAnimator.activeKeyframeMode !== 'end' ? '#6ee7b7' : '#94a3b8'};">🟢 Titik Awal</button>
                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.selectKeyframe('end')" style="padding:1px 7px; font-size:0.68rem; font-weight:700; border-radius:4px; border:1px solid ${SkillAnimator.activeKeyframeMode === 'end' ? '#f43f5e' : '#334155'}; background:${SkillAnimator.activeKeyframeMode === 'end' ? 'rgba(244, 63, 94, 0.3)' : 'transparent'}; color:${SkillAnimator.activeKeyframeMode === 'end' ? '#fda4af' : '#94a3b8'};">🔴 Titik Akhir</button>
                    </div>

                    <!-- Active Phase Pill -->
                    <div id="svPhaseIndicator" style="position:absolute; top:8px; right:8px; background:#1e1b4b; border:1px solid #8b5cf6; font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:9999px; color:#f8fafc; pointer-events:none;">
                        ⏸ Standby
                    </div>
                </div>

                <!-- PLAYBACK TRANSPORT BAR -->
                <div style="padding:8px 14px; background:rgba(15,23,42,0.9); border-top:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" id="svPlayBtn" class="btn btn-sm btn-primary" onclick="toggleSkillAnimPlay()" style="padding:4px 12px; font-size:0.75rem; font-weight:700;">${SkillAnimator.isPlaying ? '⏸ Pause' : '▶ Play'}</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="replaySkillAnim()" style="padding:4px 10px; font-size:0.75rem;">⏮ Replay</button>
                        <button type="button" id="svLoopBtn" class="btn btn-sm btn-secondary" onclick="toggleSkillAnimLoop()" style="padding:4px 10px; font-size:0.75rem;">🔄 Loop: ON</button>
                        <select class="form-control" style="width:auto; padding:3px 6px; font-size:0.75rem; height:auto;" onchange="setSkillAnimSpeed(parseFloat(this.value));">
                            <option value="0.5">0.5x Slow</option>
                            <option value="1.0" selected>1.0x Normal</option>
                            <option value="1.5">1.5x Fast</option>
                            <option value="2.0">2.0x Turbo</option>
                        </select>
                        <button type="button" id="svMuteBtn" class="btn btn-sm btn-secondary" onclick="toggleSkillAnimMute()" style="padding:4px 8px; font-size:0.75rem;">🔊 SE</button>
                    </div>

                    <!-- Frame Step & Scrubber Readout -->
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="stepSkillAnim(-1)" style="padding:3px 8px; font-size:0.75rem;">⏮ -1f</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="stepSkillAnim(1)" style="padding:3px 8px; font-size:0.75rem;">+1f ⏭</button>
                        <div style="background:#090d16; border:1px solid #334155; padding:4px 12px; border-radius:6px; font-family:monospace; font-size:0.82rem; font-weight:700; color:#38bdf8;">
                            ⏱️ <span id="svCurrentFrameText">0f / ${totalTicks}f</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODULAR SEQUENCER TIMELINE TRACKS (CAPCUT STYLE) -->
            <div class="card" style="margin-bottom:0; background:#070b14; border:1px solid #1e293b; padding:12px; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="font-size:0.85rem; color:#f8fafc; letter-spacing:0.5px;">🎞️ MULTI-BLOCK SEQUENCER TIMELINE</strong>
                        <div style="font-size:0.68rem; color:var(--text-muted);">Klik blok untuk memilih &amp; edit properti di bawah, atau klik timeline untuk scrubbing waktu</div>
                    </div>
                    <!-- 4 MODULAR ADD BUTTONS -->
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-sm" onclick="SkillAnimator.addStep('cast')" style="background:rgba(192,132,252,0.18); border:1px solid #c084fc; color:#e9d5ff; font-weight:700; padding:4px 10px;">
                            + 🔮 Rapalan (Cast)
                        </button>
                        <button type="button" class="btn btn-sm" onclick="SkillAnimator.addStep('move')" style="background:rgba(56,189,248,0.18); border:1px solid #38bdf8; color:#bae6fd; font-weight:700; padding:4px 10px;">
                            + 🏃 Gerak (Move)
                        </button>
                        <button type="button" class="btn btn-sm" onclick="SkillAnimator.addStep('action')" style="background:rgba(244,63,94,0.18); border:1px solid #f43f5e; color:#fecdd3; font-weight:700; padding:4px 10px;">
                            + ⚔️ Aksi / VFX (Action)
                        </button>
                        <button type="button" class="btn btn-sm" onclick="SkillAnimator.addStep('return')" style="background:rgba(245,158,11,0.18); border:1px solid #f59e0b; color:#fef3c7; font-weight:700; padding:4px 10px;">
                            + ↩️ Kembali (Return)
                        </button>
                    </div>
                </div>

                <!-- Timeline Tracks Container -->
                <div id="capcutTimelineTracks" style="position:relative; width:100%; user-select:none; cursor:pointer; background:#090d16; border:1px solid #1e293b; border-radius:6px; overflow:hidden;">
                    <!-- Vertical Needle Playhead Line -->
                    <div id="capcutPlayheadNeedle" style="position:absolute; top:0; bottom:0; width:2px; background:#a855f7; z-index:30; pointer-events:none; left:0%;">
                        <div style="position:absolute; top:0; left:-5px; width:12px; height:12px; background:#a855f7; border-radius:50%; box-shadow:0 0 10px #a855f7;"></div>
                    </div>

                    <!-- TRACK 0: MODULAR CLIPS (BLOCK SEQUENCER) -->
                    <div style="display:flex; height:46px; border-bottom:1px solid #1e293b; background:rgba(0,0,0,0.4); padding:4px 0;">
                        <div style="width:110px; flex-shrink:0; font-size:0.68rem; font-weight:700; color:#cbd5e1; padding-left:8px; border-right:1px solid #1e293b; display:flex; align-items:center;">
                            🎞️ Blok Koreografi
                        </div>
                        <div style="flex:1; position:relative; height:100%; display:flex; align-items:center; padding:0 4px; gap:3px;">
                            ${cfg.steps.map((st, idx) => {
                                const th = TYPE_THEMES[st.type] || TYPE_THEMES.action;
                                const isSel = (idx === SkillAnimator.selectedStepIndex);
                                const pct = (st.duration / totalTicks) * 100;
                                return `
                                    <div onclick="SkillAnimator.selectStep(${idx})"
                                         style="flex: ${st.duration} 0 0; min-width:85px; height:100%; background:${th.bg}; border: ${isSel ? '2px solid #38bdf8' : '1px solid ' + th.border}; border-radius:4px; padding:2px 6px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:${isSel ? '0 0 10px rgba(56,189,248,0.5)' : 'none'}; cursor:pointer; position:relative; overflow:hidden;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-weight:700; font-size:0.68rem; color:${th.text}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                                ${escapeHtml(st.name || th.name)}
                                            </span>
                                            <span style="font-family:monospace; font-size:0.62rem; color:#94a3b8; background:rgba(0,0,0,0.5); padding:1px 3px; border-radius:2px;">
                                                ${st.duration}f
                                            </span>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                                            <div style="display:flex; gap:2px;">
                                                <button type="button" class="btn btn-xs" onclick="event.stopPropagation(); SkillAnimator.moveStep(${idx}, -1)" title="Geser ke kiri" style="padding:0 3px; font-size:0.55rem; background:rgba(0,0,0,0.4); border:none; color:#cbd5e1;">◀</button>
                                                <button type="button" class="btn btn-xs" onclick="event.stopPropagation(); SkillAnimator.moveStep(${idx}, 1)" title="Geser ke kanan" style="padding:0 3px; font-size:0.55rem; background:rgba(0,0,0,0.4); border:none; color:#cbd5e1;">▶</button>
                                            </div>
                                            <div style="display:flex; gap:2px;">
                                                <button type="button" class="btn btn-xs" onclick="event.stopPropagation(); SkillAnimator.cloneStep(${idx})" title="Duplikasi blok ini" style="padding:0 3px; font-size:0.55rem; background:rgba(0,0,0,0.4); border:none; color:#67e8f9;">📋</button>
                                                <button type="button" class="btn btn-xs" onclick="event.stopPropagation(); SkillAnimator.removeStep(${idx})" title="Hapus blok ini" style="padding:0 3px; font-size:0.55rem; background:rgba(0,0,0,0.4); border:none; color:#f87171;">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- TRACK 1: ACTOR MOTION -->
                    <div style="display:flex; align-items:center; height:32px; border-bottom:1px solid #1e293b; background:rgba(255,255,255,0.01);">
                        <div style="width:110px; flex-shrink:0; font-size:0.68rem; font-weight:700; color:#94a3b8; padding-left:8px; border-right:1px solid #1e293b;">
                            🎭 Motion
                        </div>
                        <div style="flex:1; position:relative; height:100%; display:flex; align-items:center;">
                            ${cfg.steps.map((st) => {
                                const leftPct = (st.startTick / totalTicks) * 100;
                                const widthPct = (st.duration / totalTicks) * 100;
                                let motionLabel = st.motion || 'wait';
                                if (st.type === 'move') motionLabel = (st.approach || 'walk');
                                if (st.type === 'return') motionLabel = 'return';
                                return `
                                    <div style="position:absolute; left:${leftPct}%; width:${widthPct}%; height:20px; background:rgba(100,116,139,0.2); border:1px solid #64748b55; border-radius:3px; font-size:0.62rem; color:#cbd5e1; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                        ${motionLabel}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- TRACK 2: VFX ANIMATION KEYFRAME (◆) -->
                    <div style="display:flex; align-items:center; height:34px; border-bottom:1px solid #1e293b; background:rgba(255,255,255,0.02);">
                        <div style="width:110px; flex-shrink:0; font-size:0.68rem; font-weight:700; color:#38bdf8; padding-left:8px; border-right:1px solid #1e293b;">
                            ✨ VFX Keyframe
                        </div>
                        <div style="flex:1; position:relative; height:100%; display:flex; align-items:center;">
                            ${cfg.steps.map((st, stepIdx) => {
                                if (!st.animId || st.animId <= 0) return '';
                                const aName = (State.animations && State.animations[st.animId]) ? State.animations[st.animId].name : 'Anim';
                                const sX = st.offsetX || 0;
                                const sY = st.offsetY !== undefined ? st.offsetY : -35;
                                const sScale = st.scale || 100;
                                const isKf = !!st.useKeyframes;
                                const kfStart = Math.max(0, parseInt(st.kfStart || 0, 10));
                                const kfDur = Math.max(1, parseInt(st.kfDuration !== undefined ? st.kfDuration : (isKf ? Math.min(6, st.duration) : st.duration), 10));

                                const clipStartTick = isKf ? (st.startTick + kfStart) : st.startTick;
                                const clipDur = isKf ? kfDur : st.duration;
                                const leftPct = (clipStartTick / totalTicks) * 100;
                                const widthPct = Math.max(4, (clipDur / totalTicks) * 100);

                                const eX = st.endOffsetX !== undefined ? st.endOffsetX : sX;
                                const eY = st.endOffsetY !== undefined ? st.endOffsetY : sY;
                                const eScale = st.scaleEnd !== undefined ? st.scaleEnd : sScale;

                                return `
                                    <div data-drag-type="${isKf ? 'kf' : ''}" data-step-idx="${stepIdx}"
                                         title="${isKf ? `Klik &amp; Geser horizontal untuk mengatur start time gerak (+${kfStart}f, durasi ${kfDur}f)` : 'VFX Animation Clip'}"
                                         style="position:absolute; left:${leftPct}%; width:${widthPct}%; height:22px; background:linear-gradient(90deg, rgba(56,189,248,0.3) 0%, rgba(99,102,241,0.35) 100%); border:1px solid #38bdf8; border-radius:3px; font-size:0.62rem; color:#e0f2fe; display:flex; align-items:center; justify-content:space-between; padding:0 6px; box-shadow:0 0 8px rgba(56,189,248,0.25); cursor:${isKf ? 'ew-resize' : 'default'}; z-index:8; user-select:none;">
                                        <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">◆ #${st.animId} ${escapeHtml(aName)}${st.flipX ? ' ↔️' : ''}${st.flipY ? ' ↕️' : ''}</span>
                                        ${isKf ? `
                                            <span class="drag-badge" style="font-family:monospace; font-size:0.56rem; color:#6ee7b7; background:rgba(0,0,0,0.65); padding:1px 4px; border-radius:2px; white-space:nowrap; margin-left:4px; border:1px solid rgba(110,231,183,0.3);">
                                                ⚡${kfDur}f (+${kfStart}f) | 🟢➔🔴
                                            </span>
                                        ` : `
                                            <span style="font-family:monospace; font-size:0.58rem; color:#67e8f9; background:rgba(0,0,0,0.5); padding:1px 3px; border-radius:2px; white-space:nowrap; margin-left:4px;">
                                                (${sX >= 0 ? '+' : ''}${sX}, ${sY >= 0 ? '+' : ''}${sY}) [${sScale}%]
                                            </span>
                                        `}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- TRACK 3: AUDIO SE (DRAGGABLE PILL) -->
                    <div style="display:flex; align-items:center; height:30px; border-bottom:1px solid #1e293b; background:rgba(255,255,255,0.01);">
                        <div style="width:110px; flex-shrink:0; font-size:0.68rem; font-weight:700; color:#4ade80; padding-left:8px; border-right:1px solid #1e293b;">
                            🔊 Audio SE
                        </div>
                        <div style="flex:1; position:relative; height:100%; display:flex; align-items:center;">
                            ${cfg.steps.map((st, stepIdx) => {
                                if (!st.se) return '';
                                const seDelay = Math.max(0, parseInt(st.seDelay || 0, 10));
                                const leftPct = ((st.startTick + seDelay) / totalTicks) * 100;
                                return `
                                    <div data-drag-type="se" data-step-idx="${stepIdx}"
                                         title="Klik &amp; Geser horizontal untuk mengatur timing audio di CapCut timeline (+${seDelay}f)"
                                         style="position:absolute; left:${leftPct}%; height:20px; padding:0 8px; background:#15803d; border:1px solid #4ade80; border-radius:4px; font-size:0.62rem; color:#f0fdf4; display:flex; align-items:center; gap:4px; cursor:ew-resize; box-shadow:0 2px 6px rgba(0,0,0,0.5); z-index:10; user-select:none;">
                                        <span>🔊 ${escapeHtml(st.se)}</span>
                                        <span class="drag-badge" style="font-family:monospace; font-size:0.56rem; background:rgba(0,0,0,0.55); padding:1px 4px; border-radius:3px; color:#86efac; font-weight:700;">+${seDelay}f</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- TRACK 4: SCREEN FX (DRAGGABLE PILL) -->
                    <div style="display:flex; align-items:center; height:30px; background:rgba(255,255,255,0.02);">
                        <div style="width:110px; flex-shrink:0; font-size:0.68rem; font-weight:700; color:#facc15; padding-left:8px; border-right:1px solid #1e293b;">
                            📳 Screen FX
                        </div>
                        <div style="flex:1; position:relative; height:100%; display:flex; align-items:center;">
                            ${cfg.steps.map((st, stepIdx) => {
                                const hasShake = st.shake && st.shake !== 'none';
                                const hasFlash = st.flash && st.flash !== 'none';
                                if (!hasShake && !hasFlash) return '';
                                const fxDelay = Math.max(0, parseInt(st.fxDelay || 0, 10));
                                const leftPct = ((st.startTick + fxDelay) / totalTicks) * 100;
                                return `
                                    <div data-drag-type="fx" data-step-idx="${stepIdx}"
                                         title="Klik &amp; Geser horizontal untuk mengatur timing Flash/Shake (+${fxDelay}f)"
                                         style="position:absolute; left:${leftPct}%; height:20px; padding:0 8px; background:#a16207; border:1px solid #facc15; border-radius:4px; font-size:0.62rem; color:#fef08a; display:flex; align-items:center; gap:4px; cursor:ew-resize; box-shadow:0 2px 6px rgba(0,0,0,0.5); z-index:10; user-select:none;">
                                        ${hasShake ? `<span>📳 ${st.shake}</span>` : ''}
                                        ${hasFlash ? `<span>⚡ ${st.flash}</span>` : ''}
                                        <span class="drag-badge" style="font-family:monospace; font-size:0.56rem; background:rgba(0,0,0,0.55); padding:1px 4px; border-radius:3px; color:#fde047; font-weight:700;">+${fxDelay}f</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- SELECTED STEP INSPECTOR (DYNAMIC PROPERTI BLOK TERPILIH) -->
            ${(() => {
                const stepTheme = TYPE_THEMES[selStep.type] || TYPE_THEMES.action;
                return `
                <div class="card" style="margin-bottom:0; background:rgba(15,23,42,0.8); border:2px solid ${stepTheme.border}; padding:14px; display:flex; flex-direction:column; gap:12px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${stepTheme.border}44; padding-bottom:8px; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.3rem;">${stepTheme.icon}</span>
                            <div>
                                <h3 style="margin:0; font-size:0.95rem; color:${stepTheme.text}; font-weight:700;">
                                    EDIT BLOK: ${escapeHtml(selStep.name || stepTheme.name)}
                                </h3>
                                <div style="font-size:0.68rem; color:var(--text-muted);">Tahapan urutan #${SkillAnimator.selectedStepIndex + 1} dari ${cfg.steps.length} total blok</div>
                            </div>
                        </div>

                        <!-- Duration Stepper -->
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.75rem; color:var(--text-muted);">Durasi Blok:</span>
                            <div style="display:flex; align-items:center; gap:4px; background:#090d16; border:1px solid #334155; padding:2px 6px; border-radius:6px;">
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.changeSelectedStepDuration(-2)" style="padding:1px 6px; font-weight:700;">-</button>
                                <span style="font-family:monospace; font-weight:700; color:${stepTheme.text}; font-size:0.85rem; min-width:32px; text-align:center;">${selStep.duration}f</span>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.changeSelectedStepDuration(2)" style="padding:1px 6px; font-weight:700;">+</button>
                            </div>
                        </div>
                    </div>

                    <!-- Step Specific Form Controls -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
                        <div>
                            <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Label Nama Blok</label>
                            <input type="text" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${escapeHtml(selStep.name || '')}" onchange="SkillAnimator.updateSelectedStepField('name', this.value)">
                        </div>

                        ${selStep.type === 'cast' ? `
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Motion Aktor</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="SkillAnimator.updateSelectedStepField('motion', this.value)">
                                    <option value="chant" ${selStep.motion === 'chant' ? 'selected' : ''}>chant (Rapal Sihir)</option>
                                    <option value="skill" ${selStep.motion === 'skill' ? 'selected' : ''}>skill (Konsentrasi Jurus)</option>
                                    <option value="spell" ${selStep.motion === 'spell' ? 'selected' : ''}>spell (Pose Mantra)</option>
                                    <option value="guard" ${selStep.motion === 'guard' ? 'selected' : ''}>guard (Kuda-kuda Tahan)</option>
                                    <option value="wait" ${selStep.motion === 'wait' ? 'selected' : ''}>wait (Siaga Tempur)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Animasi VFX Cast (pada User)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; color:#c084fc;" onchange="SkillAnimator.updateSelectedStepField('animId', parseInt(this.value, 10))">
                                    <option value="0">(Tanpa Animasi VFX)</option>
                                    ${animList.map(a => `<option value="${a.id}" ${selStep.animId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Sound Effect (SE)</label>
                                ${SkillAnimator.renderSeSelect(selStep.se, "SkillAnimator.updateSelectedStepField('se', this.value); SkillAnimator.playSe(this.value);")}
                                <div style="margin-top:6px; background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.25); border-radius:6px; padding:6px 10px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label style="font-size:0.72rem; color:#86efac; font-weight:700; margin:0;">
                                            ⏱️ Waktu Mulai Suara (Audio Timing):
                                        </label>
                                        <span style="font-family:monospace; font-size:0.75rem; color:#4ade80; font-weight:700;">+${selStep.seDelay || 0}f (Frame ke-${(selStep.seDelay || 0) + 1})</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <input type="range" id="stepActionSeDelayRange" min="0" max="${Math.max(1, selStep.duration - 1)}" value="${selStep.seDelay || 0}"
                                               style="flex:1; accent-color:#22c55e;"
                                               oninput="SkillAnimator.updateSelectedStepField('seDelay', parseInt(this.value, 10)); this.nextElementSibling.value = this.value; SkillAnimator.updateTimelineUI();">
                                        <input type="number" id="stepActionSeDelay" min="0" max="${Math.max(1, selStep.duration - 1)}" value="${selStep.seDelay || 0}"
                                               class="form-control" style="width:55px; font-size:0.75rem; padding:2px 4px; text-align:center;"
                                               onchange="SkillAnimator.updateSelectedStepField('seDelay', parseInt(this.value, 10) || 0); SkillAnimator.updateTimelineUI();">
                                    </div>
                                    <div style="display:flex; gap:4px; margin-top:4px; font-size:0.65rem; flex-wrap:wrap;">
                                        <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.updateSelectedStepField('seDelay', 0); SkillAnimator.updateTimelineUI();" style="padding:1px 6px;">⏮ Frame Awal (0f)</button>
                                        <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.updateSelectedStepField('seDelay', Math.round(${selStep.duration} / 2)); SkillAnimator.updateTimelineUI();" style="padding:1px 6px;">🎯 Tengah (${Math.round(selStep.duration / 2)}f)</button>
                                        ${selStep.useKeyframes ? `
                                            <button type="button" class="btn btn-xs btn-primary" onclick="SkillAnimator.updateSelectedStepField('seDelay', Math.min(${selStep.duration - 1}, ${(selStep.kfStart || 0) + (selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration))})); SkillAnimator.updateTimelineUI();" style="padding:1px 6px; font-weight:700;">💥 Tabrakan VFX (${Math.min(selStep.duration - 1, (selStep.kfStart || 0) + (selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)))}f)</button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="grid-column: 1 / -1; display:flex; align-items:center; gap:16px; margin-top:2px; padding-top:6px; border-top:1px dashed rgba(192,132,252,0.25); flex-wrap:wrap;">
                                <span style="font-size:0.72rem; color:#c084fc; font-weight:700;">🔄 Transformasi Animasi:</span>
                                <label class="checkbox-label" style="font-size:0.75rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <input type="checkbox" ${selStep.flipX ? 'checked' : ''} onchange="SkillAnimator.updateSelectedStepField('flipX', this.checked); this.nextElementSibling.style.color = this.checked ? '#c084fc' : 'var(--text-muted)'; this.nextElementSibling.style.fontWeight = this.checked ? '700' : 'normal';">
                                    <span style="color:${selStep.flipX ? '#c084fc' : 'var(--text-muted)'}; font-weight:${selStep.flipX ? '700' : 'normal'};">↔️ Flip Horizontal</span>
                                </label>
                                <label class="checkbox-label" style="font-size:0.75rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <input type="checkbox" ${selStep.flipY ? 'checked' : ''} onchange="SkillAnimator.updateSelectedStepField('flipY', this.checked); this.nextElementSibling.style.color = this.checked ? '#c084fc' : 'var(--text-muted)'; this.nextElementSibling.style.fontWeight = this.checked ? '700' : 'normal';">
                                    <span style="color:${selStep.flipY ? '#c084fc' : 'var(--text-muted)'}; font-weight:${selStep.flipY ? '700' : 'normal'};">↕️ Flip Vertikal</span>
                                </label>
                            </div>
                        ` : ''}

                        ${selStep.type === 'move' ? `
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Gaya &amp; Tujuan Gerak (Approach)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; font-weight:700; color:#38bdf8;" onchange="SkillAnimator.updateSelectedStepField('approach', this.value)">
                                    <option value="melee" ${selStep.approach === 'melee' ? 'selected' : ''}>🏃 Melesat ke Depan Musuh (Melee Dash Front)</option>
                                    <option value="behind" ${selStep.approach === 'behind' ? 'selected' : ''}>⚡ Menembus ke Belakang Musuh (Dash Behind)</option>
                                    <option value="jump" ${selStep.approach === 'jump' ? 'selected' : ''}>🦘 Melompat Busur ke Depan Musuh (Arc Jump Front)</option>
                                    <option value="jump_behind" ${selStep.approach === 'jump_behind' ? 'selected' : ''}>🦘 Melompat Busur ke Belakang Musuh (Jump Behind)</option>
                                    <option value="step" ${selStep.approach === 'step' ? 'selected' : ''}>🚶 Maju Selangkah Saja (Step Forward 32px)</option>
                                    <option value="teleport" ${selStep.approach === 'teleport' ? 'selected' : ''}>🌀 Teleport Blink ke Depan Musuh</option>
                                    <option value="teleport_behind" ${selStep.approach === 'teleport_behind' ? 'selected' : ''}>🌀 Teleport Blink ke Belakang Musuh</option>
                                    <option value="ranged" ${selStep.approach === 'ranged' ? 'selected' : ''}>⏹️ Tetap di Tempat (Stay at Home)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Jarak Kontak ke Musuh (px)</label>
                                <input type="number" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${selStep.distance !== undefined ? selStep.distance : 50}" onchange="SkillAnimator.updateSelectedStepField('distance', parseInt(this.value, 10) || 50)">
                            </div>
                        ` : ''}

                        ${selStep.type === 'action' ? `
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Sasaran Target Aksi (VFX &amp; Damage)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; font-weight:700; color:#38bdf8;" onchange="SkillAnimator.updateSelectedStepField('target', this.value)">
                                    <option value="target" ${selStep.target !== 'user' ? 'selected' : ''}>👾 Musuh / Target (Enemy)</option>
                                    <option value="user" ${selStep.target === 'user' ? 'selected' : ''}>👤 Diri Sendiri (User / Self / Guard)</option>
                                </select>
                                <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px; line-height:1.2;">
                                    💡 Karakter <strong>tetap di posisinya</strong> (tidak otomatis maju). Lokasi karakter sepenuhnya diatur oleh blok <strong>🏃 Gerak (Move)</strong>.
                                </div>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Motion Aktor</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="SkillAnimator.updateSelectedStepField('motion', this.value)">
                                    <option value="attack" ${selStep.motion === 'attack' ? 'selected' : ''}>attack (Otomatis Sesuai Tipe Senjata Karakter)</option>
                                    <option value="swing" ${selStep.motion === 'swing' ? 'selected' : ''}>swing (Tebasan Senjata)</option>
                                    <option value="thrust" ${selStep.motion === 'thrust' ? 'selected' : ''}>thrust (Tusukan Senjata)</option>
                                    <option value="missile" ${selStep.motion === 'missile' ? 'selected' : ''}>missile (Menembak Proyektil)</option>
                                    <option value="guard" ${selStep.motion === 'guard' ? 'selected' : ''}>guard (Bertahan / Tameng)</option>
                                    <option value="skill" ${selStep.motion === 'skill' ? 'selected' : ''}>skill (Konsentrasi Jurus)</option>
                                    <option value="spell" ${selStep.motion === 'spell' ? 'selected' : ''}>spell (Pelepasan Sihir)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Animasi Visual (VFX)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; color:#38bdf8; font-weight:700;" onchange="SkillAnimator.updateSelectedStepField('animId', parseInt(this.value, 10))">
                                    <option value="0">(Tanpa Animasi VFX)</option>
                                    ${animList.map(a => `<option value="${a.id}" ${selStep.animId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Kecepatan Putar Animasi (VFX FPS)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; color:#38bdf8; font-weight:700;" onchange="SkillAnimator.updateSelectedStepField('animRate', this.value)">
                                    <option value="auto" ${(!selStep.animRate || selStep.animRate === 'auto') ? 'selected' : ''}>🎯 Auto-Sync (Pas dengan Durasi Blok)</option>
                                    <option value="1" ${selStep.animRate === '1' ? 'selected' : ''}>🚀 Ultra Cepat (1 tick / 60 FPS)</option>
                                    <option value="2" ${selStep.animRate === '2' ? 'selected' : ''}>⚡ Cepat (2 ticks / 30 FPS)</option>
                                    <option value="3" ${selStep.animRate === '3' ? 'selected' : ''}>🏃 Sedang (3 ticks / 20 FPS)</option>
                                    <option value="4" ${selStep.animRate === '4' ? 'selected' : ''}>🐢 Standar MV (4 ticks / 15 FPS)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Sound Effect (SE)</label>
                                ${SkillAnimator.renderSeSelect(selStep.se, "SkillAnimator.updateSelectedStepField('se', this.value); SkillAnimator.playSe(this.value);")}
                            </div>
                        ` : ''}

                        ${selStep.type === 'return' ? `
                            <div>
                                <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Gaya Kembali ke Posisi Awal (Return)</label>
                                <select class="form-control" style="font-size:0.8rem; padding:4px 8px; font-weight:700; color:#f59e0b;" onchange="SkillAnimator.updateSelectedStepField('approach', this.value)">
                                    <option value="walk" ${selStep.approach === 'walk' ? 'selected' : ''}>🚶 Jalan Mundur Mulus (Walk Return)</option>
                                    <option value="jump" ${selStep.approach === 'jump' ? 'selected' : ''}>🦘 Melompat Balik Busur (Jump Return)</option>
                                    <option value="teleport" ${selStep.approach === 'teleport' ? 'selected' : ''}>🌀 Teleport Blink Balik</option>
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <!-- IF ACTION STEP: DIRECT CANVAS DRAG & DROP POSITIONING & SCALING KEYFRAMES -->
                    ${selStep.type === 'action' ? `
                        <div style="background:rgba(56,189,248,0.06); border:1px solid #38bdf855; border-radius:8px; padding:12px; margin-top:6px;">
                            <!-- Header & Mode Toggle -->
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:1.15rem;">🎬</span>
                                    <div>
                                        <strong style="color:#38bdf8; font-size:0.85rem;">Keyframe Posisi &amp; Scaling VFX</strong>
                                        <div style="font-size:0.68rem; color:var(--text-muted);">Sistem Keyframe Titik Awal ➔ Akhir (After Effects / Premiere Pro / CapCut)</div>
                                    </div>
                                </div>
                                
                                <label class="checkbox-label" style="font-size:0.75rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:6px; background:#0b1329; border:1px solid #38bdf877; padding:4px 10px; border-radius:6px;">
                                    <input type="checkbox" ${selStep.useKeyframes ? 'checked' : ''} onchange="SkillAnimator.updateSelectedStepField('useKeyframes', this.checked); if (typeof renderEditor === 'function') renderEditor();">
                                    <span style="color:${selStep.useKeyframes ? '#38bdf8' : 'var(--text-muted)'}; font-weight:700;">✨ Aktifkan Gerak Keyframe (A ➔ B)</span>
                                </label>
                            </div>

                            <!-- KEYFRAME SPEED & DURATION CONTROL (CAPCUT STYLE) -->
                            ${selStep.useKeyframes ? `
                                <div style="background:#070d1e; border:1px solid #38bdf855; border-radius:6px; padding:10px; margin-bottom:12px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <div style="display:flex; align-items:center; gap:6px;">
                                            <span style="font-size:1rem;">⚡</span>
                                            <strong style="color:#38bdf8; font-size:0.8rem;">Kecepatan &amp; Durasi Gerak Keyframe (A ➔ B)</strong>
                                        </div>
                                        <span style="font-family:monospace; font-size:0.78rem; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 8px; border-radius:4px; border:1px solid #38bdf844;">
                                            ${selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)}f (${Math.round(((selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)) / 60) * 1000)}ms)
                                        </span>
                                    </div>
                                    <div style="font-size:0.68rem; color:var(--text-muted); margin-bottom:8px;">
                                        Mengatur seberapa cepat VFX melesat dari titik A ke titik B. Tidak perlu menunggu sampai seluruh frame blok selesai!
                                    </div>

                                    <!-- Quick Speed Buttons -->
                                    <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
                                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.updateSelectedStepField('kfDuration', 3); SkillAnimator.updateTimelineUI();" style="font-size:0.7rem; padding:3px 8px; background:#ef444422; border:1px solid #ef4444; color:#fca5a5;">
                                            🚀 Kilat (3f)
                                        </button>
                                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.updateSelectedStepField('kfDuration', 6); SkillAnimator.updateTimelineUI();" style="font-size:0.7rem; padding:3px 8px; background:#f59e0b22; border:1px solid #f59e0b; color:#fde047; font-weight:700;">
                                            🏹 Cepat (6f) [Rekomendasi]
                                        </button>
                                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.updateSelectedStepField('kfDuration', 10); SkillAnimator.updateTimelineUI();" style="font-size:0.7rem; padding:3px 8px; background:#38bdf822; border:1px solid #38bdf8; color:#bae6fd;">
                                            🏃 Sedang (10f)
                                        </button>
                                        <button type="button" class="btn btn-xs" onclick="SkillAnimator.updateSelectedStepField('kfDuration', ${selStep.duration}); SkillAnimator.updateTimelineUI();" style="font-size:0.7rem; padding:3px 8px; background:#64748b22; border:1px solid #64748b; color:#cbd5e1;">
                                            🐢 Penuh (${selStep.duration}f)
                                        </button>
                                    </div>

                                    <!-- Sliders for Duration & Start Frame -->
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                        <div>
                                            <label style="font-size:0.7rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                                                <span>Durasi Tempuh (Frames)</span>
                                                <span id="lblKfDur" style="color:#38bdf8; font-weight:700;">${selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)}f</span>
                                            </label>
                                            <input type="range" min="1" max="${selStep.duration}" value="${selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)}"
                                                   style="width:100%; accent-color:#38bdf8;"
                                                   oninput="SkillAnimator.updateSelectedStepField('kfDuration', parseInt(this.value, 10)); document.getElementById('lblKfDur').textContent = this.value + 'f'; SkillAnimator.updateTimelineUI();">
                                        </div>
                                        <div>
                                            <label style="font-size:0.7rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                                                <span>Frame Mulai Gerak</span>
                                                <span id="lblKfStart" style="color:#38bdf8; font-weight:700;">+${selStep.kfStart || 0}f</span>
                                            </label>
                                            <input type="range" id="stepActionKfStart" min="0" max="${Math.max(0, selStep.duration - (selStep.kfDuration || 6))}" value="${selStep.kfStart || 0}"
                                                   style="width:100%; accent-color:#38bdf8;"
                                                   oninput="SkillAnimator.updateSelectedStepField('kfStart', parseInt(this.value, 10)); document.getElementById('lblKfStart').textContent = '+' + this.value + 'f'; SkillAnimator.updateTimelineUI();">
                                        </div>
                                    </div>

                                    <!-- Easing Option -->
                                    <div style="margin-top:8px;">
                                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">Kurva Kecepatan Gerak (Easing):</label>
                                        <select class="form-control" style="font-size:0.75rem; padding:3px 8px; color:#38bdf8; font-weight:700;" onchange="SkillAnimator.updateSelectedStepField('kfEasing', this.value)">
                                            <option value="ease-out" ${(!selStep.kfEasing || selStep.kfEasing === 'ease-out') ? 'selected' : ''}>⚡ Ease-Out (Melesat Cepat di Awal - Direkomendasikan Serangan)</option>
                                            <option value="ease-in" ${selStep.kfEasing === 'ease-in' ? 'selected' : ''}>🚀 Ease-In (Mulai Pelan, Makin Cepat di Akhir)</option>
                                            <option value="ease-in-out" ${selStep.kfEasing === 'ease-in-out' ? 'selected' : ''}>🌀 Ease-In-Out (Mulus Luwes)</option>
                                            <option value="linear" ${selStep.kfEasing === 'linear' ? 'selected' : ''}>⏹️ Linear (Kecepatan Konstan)</option>
                                        </select>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Target Keyframe Mode Switcher (Pill Buttons) -->
                            ${selStep.useKeyframes ? `
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; background:#070d1e; padding:6px 10px; border-radius:6px; border:1px solid #1e293b; flex-wrap:wrap;">
                                    <span style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">🎯 Edit Titik Canvas:</span>
                                    <button type="button" id="btnKfModeStart" class="btn btn-xs" onclick="SkillAnimator.selectKeyframe('start')" style="font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:5px; border:1px solid ${SkillAnimator.activeKeyframeMode !== 'end' ? '#10b981' : '#334155'}; background:${SkillAnimator.activeKeyframeMode !== 'end' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; color:${SkillAnimator.activeKeyframeMode !== 'end' ? '#6ee7b7' : '#94a3b8'};">
                                        🟢 Keyframe A (Titik Awal)
                                    </button>
                                    <button type="button" id="btnKfModeEnd" class="btn btn-xs" onclick="SkillAnimator.selectKeyframe('end')" style="font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:5px; border:1px solid ${SkillAnimator.activeKeyframeMode === 'end' ? '#f43f5e' : '#334155'}; background:${SkillAnimator.activeKeyframeMode === 'end' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; color:${SkillAnimator.activeKeyframeMode === 'end' ? '#fda4af' : '#94a3b8'};">
                                        🔴 Keyframe B (Titik Akhir)
                                    </button>
                                    <span style="font-size:0.68rem; color:#64748b; margin-left:auto;">💡 Klik &amp; geser titik langsung di canvas preview</span>
                                </div>
                            ` : ''}

                            <!-- Keyframe Parameters Grid -->
                            <div style="display:grid; grid-template-columns: ${selStep.useKeyframes ? '1fr 1fr' : '1fr'}; gap:12px;">
                                <!-- KEYFRAME A (START) -->
                                <div style="background:#090f20; border:1px solid ${SkillAnimator.activeKeyframeMode !== 'end' && selStep.useKeyframes ? '#10b98177' : '#1e293b'}; border-radius:6px; padding:10px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                        <strong style="color:#10b981; font-size:0.78rem;">🟢 ${selStep.useKeyframes ? 'Keyframe A: Titik Awal (Start)' : 'Titik Posisi &amp; Ukuran VFX'}</strong>
                                        <span id="stepActionCoordsLabel" style="font-family:monospace; font-weight:700; color:#6ee7b7; font-size:0.75rem; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:3px;">
                                            (X:${selStep.offsetX >= 0 ? '+' : ''}${selStep.offsetX || 0}, Y:${selStep.offsetY !== undefined ? (selStep.offsetY >= 0 ? '+' : '') + selStep.offsetY : '-35'})
                                        </span>
                                    </div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                                        <div>
                                            <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Offset X (Kiri/Kanan)</label>
                                            <input type="number" id="stepActionOffsetX" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${selStep.offsetX || 0}" onchange="SkillAnimator.updateSelectedStepField('offsetX', parseInt(this.value, 10) || 0)">
                                        </div>
                                        <div>
                                            <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Offset Y (Atas/Bawah)</label>
                                            <input type="number" id="stepActionOffsetY" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${selStep.offsetY !== undefined ? selStep.offsetY : -35}" onchange="SkillAnimator.updateSelectedStepField('offsetY', parseInt(this.value, 10) || 0)">
                                        </div>
                                    </div>
                                    <div style="margin-top:8px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                            <label style="font-size:0.68rem; color:var(--text-muted);">Skala VFX ${selStep.useKeyframes ? 'Awal' : ''} (%)</label>
                                            <span style="font-family:monospace; font-size:0.75rem; font-weight:700; color:#10b981;">${selStep.scale || 100}%</span>
                                        </div>
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <input type="range" min="20" max="300" step="5" value="${selStep.scale || 100}" style="flex:1; accent-color:#10b981;" oninput="this.nextElementSibling.value = this.value; SkillAnimator.updateSelectedStepField('scale', parseInt(this.value, 10));">
                                            <input type="number" min="20" max="300" class="form-control" style="width:65px; font-size:0.75rem; padding:2px 4px; text-align:center;" value="${selStep.scale || 100}" onchange="this.previousElementSibling.value = this.value; SkillAnimator.updateSelectedStepField('scale', parseInt(this.value, 10) || 100);">
                                        </div>
                                    </div>
                                </div>

                                <!-- KEYFRAME B (END) -->
                                ${selStep.useKeyframes ? `
                                    <div style="background:#090f20; border:1px solid ${SkillAnimator.activeKeyframeMode === 'end' ? '#f43f5e77' : '#1e293b'}; border-radius:6px; padding:10px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                            <strong style="color:#f43f5e; font-size:0.78rem;">🔴 Keyframe B: Titik Akhir (End)</strong>
                                            <span id="stepActionEndCoordsLabel" style="font-family:monospace; font-weight:700; color:#fda4af; font-size:0.75rem; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:3px;">
                                                (X:${(selStep.endOffsetX !== undefined ? selStep.endOffsetX : (selStep.offsetX || 0)) >= 0 ? '+' : ''}${selStep.endOffsetX !== undefined ? selStep.endOffsetX : (selStep.offsetX || 0)}, Y:${(selStep.endOffsetY !== undefined ? selStep.endOffsetY : (selStep.offsetY !== undefined ? selStep.offsetY : -35)) >= 0 ? '+' : ''}${selStep.endOffsetY !== undefined ? selStep.endOffsetY : (selStep.offsetY !== undefined ? selStep.offsetY : -35)})
                                            </span>
                                        </div>
                                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                                            <div>
                                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Offset X Akhir</label>
                                                <input type="number" id="stepActionEndOffsetX" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${selStep.endOffsetX !== undefined ? selStep.endOffsetX : (selStep.offsetX || 0)}" onchange="SkillAnimator.updateSelectedStepField('endOffsetX', parseInt(this.value, 10) || 0)">
                                            </div>
                                            <div>
                                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Offset Y Akhir</label>
                                                <input type="number" id="stepActionEndOffsetY" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${selStep.endOffsetY !== undefined ? selStep.endOffsetY : (selStep.offsetY !== undefined ? selStep.offsetY : -35)}" onchange="SkillAnimator.updateSelectedStepField('endOffsetY', parseInt(this.value, 10) || 0)">
                                            </div>
                                        </div>
                                        <div style="margin-top:8px;">
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                                <label style="font-size:0.68rem; color:var(--text-muted);">Skala VFX Akhir (%)</label>
                                                <span style="font-family:monospace; font-size:0.75rem; font-weight:700; color:#f43f5e;">${selStep.scaleEnd !== undefined ? selStep.scaleEnd : (selStep.scale || 100)}%</span>
                                            </div>
                                            <div style="display:flex; align-items:center; gap:8px;">
                                                <input type="range" min="20" max="300" step="5" value="${selStep.scaleEnd !== undefined ? selStep.scaleEnd : (selStep.scale || 100)}" style="flex:1; accent-color:#f43f5e;" oninput="this.nextElementSibling.value = this.value; SkillAnimator.updateSelectedStepField('scaleEnd', parseInt(this.value, 10));">
                                                <input type="number" min="20" max="300" class="form-control" style="width:65px; font-size:0.75rem; padding:2px 4px; text-align:center;" value="${selStep.scaleEnd !== undefined ? selStep.scaleEnd : (selStep.scale || 100)}" onchange="this.previousElementSibling.value = this.value; SkillAnimator.updateSelectedStepField('scaleEnd', parseInt(this.value, 10) || 100);">
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- PRESET GERAK CEPAT (QUICK MOTION PRESETS) -->
                            <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(56,189,248,0.25); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <span style="font-size:0.72rem; color:#38bdf8; font-weight:700;">🚀 Preset Lintasan:</span>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('projectile')" title="Dari Posisi Karakter melesat ke Target">🏹 Proyektil (User ➔ Target)</button>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('pierce')" title="Menembus dari depan ke belakang target">⚡ Tebasan Tembus</button>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('fall')" title="Jatuh dari langit ke tanah">🌧️ Jatuh dari Langit</button>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('expand')" title="Meledak membesar (40% ke 200%)">💥 Ledakan Zoom In</button>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('shrink')" title="Menyusut mengecil">🌀 Zoom Out</button>
                                <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.applyKeyframePreset('static')" style="color:#94a3b8;" title="Reset ke 1 titik tanpa perpindahan">⏹️ Statis (Diam)</button>
                            </div>

                            <!-- ANCHOR & FLIP CONTROLS -->
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:10px; padding-top:8px; border-top:1px dashed rgba(56,189,248,0.25);">
                                <div>
                                    <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Titik Tumpuan (Anchor)</label>
                                    <select class="form-control" style="font-size:0.8rem; padding:3px 6px;" onchange="SkillAnimator.updateSelectedStepField('posType', this.value)">
                                        <option value="center" ${selStep.posType === 'center' ? 'selected' : ''}>Pusat Tubuh (Center)</option>
                                        <option value="head" ${selStep.posType === 'head' ? 'selected' : ''}>Atas Kepala (Head)</option>
                                        <option value="feet" ${selStep.posType === 'feet' ? 'selected' : ''}>Kaki / Tanah (Feet)</option>
                                        <option value="screen" ${selStep.posType === 'screen' ? 'selected' : ''}>Tengah Layar (Screen)</option>
                                    </select>
                                </div>
                                <div style="display:flex; flex-direction:column; justify-content:center; gap:6px;">
                                    <label class="checkbox-label" style="font-size:0.75rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                        <input type="checkbox" ${selStep.flipX ? 'checked' : ''} onchange="SkillAnimator.updateSelectedStepField('flipX', this.checked); this.nextElementSibling.style.color = this.checked ? '#38bdf8' : 'var(--text-muted)'; this.nextElementSibling.style.fontWeight = this.checked ? '700' : 'normal';">
                                        <span style="color:${selStep.flipX ? '#38bdf8' : 'var(--text-muted)'}; font-weight:${selStep.flipX ? '700' : 'normal'};">↔️ Flip Horizontal</span>
                                    </label>
                                    <label class="checkbox-label" style="font-size:0.75rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                        <input type="checkbox" ${selStep.flipY ? 'checked' : ''} onchange="SkillAnimator.updateSelectedStepField('flipY', this.checked); this.nextElementSibling.style.color = this.checked ? '#38bdf8' : 'var(--text-muted)'; this.nextElementSibling.style.fontWeight = this.checked ? '700' : 'normal';">
                                        <span style="color:${selStep.flipY ? '#38bdf8' : 'var(--text-muted)'}; font-weight:${selStep.flipY ? '700' : 'normal'};">↕️ Flip Vertikal</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Screen FX & Reaksi -->
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; margin-top:2px;">
                            <div>
                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Screen Shake</label>
                                <select class="form-control" style="font-size:0.75rem; padding:3px 6px;" onchange="SkillAnimator.updateSelectedStepField('shake', this.value)">
                                    <option value="none" ${selStep.shake === 'none' ? 'selected' : ''}>Tanpa Getar</option>
                                    <option value="light" ${selStep.shake === 'light' ? 'selected' : ''}>Ringan (Light 2px)</option>
                                    <option value="heavy" ${selStep.shake === 'heavy' ? 'selected' : ''}>Kuat (Heavy 6px)</option>
                                    <option value="earthquake" ${selStep.shake === 'earthquake' ? 'selected' : ''}>Gempa Dahsyat (10px)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Screen Flash</label>
                                <select class="form-control" style="font-size:0.75rem; padding:3px 6px;" onchange="SkillAnimator.updateSelectedStepField('flash', this.value)">
                                    <option value="none" ${selStep.flash === 'none' ? 'selected' : ''}>Tanpa Flash</option>
                                    <option value="white" ${selStep.flash === 'white' ? 'selected' : ''}>Kilatan Putih Terang</option>
                                    <option value="red" ${selStep.flash === 'red' ? 'selected' : ''}>Kilatan Merah Darah</option>
                                    <option value="gold" ${selStep.flash === 'gold' ? 'selected' : ''}>Kilatan Emas Petir</option>
                                </select>
                            </div>
                            <div style="grid-column: 1 / -1; margin-top:4px; background:rgba(234,179,8,0.06); border:1px solid rgba(234,179,8,0.25); border-radius:6px; padding:6px 10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <label style="font-size:0.72rem; color:#fde047; font-weight:700; margin:0;">
                                        ⏱️ Waktu Mulai Flash &amp; Layar Getar (Screen FX Timing):
                                    </label>
                                    <span style="font-family:monospace; font-size:0.75rem; color:#facc15; font-weight:700;">+${selStep.fxDelay || 0}f (Frame ke-${(selStep.fxDelay || 0) + 1})</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <input type="range" id="stepActionFxDelayRange" min="0" max="${Math.max(1, selStep.duration - 1)}" value="${selStep.fxDelay || 0}"
                                           style="flex:1; accent-color:#eab308;"
                                           oninput="SkillAnimator.updateSelectedStepField('fxDelay', parseInt(this.value, 10)); this.nextElementSibling.value = this.value; SkillAnimator.updateTimelineUI();">
                                        <input type="number" id="stepActionFxDelay" min="0" max="${Math.max(1, selStep.duration - 1)}" value="${selStep.fxDelay || 0}"
                                           class="form-control" style="width:55px; font-size:0.75rem; padding:2px 4px; text-align:center;"
                                           onchange="SkillAnimator.updateSelectedStepField('fxDelay', parseInt(this.value, 10) || 0); SkillAnimator.updateTimelineUI();">
                                </div>
                                <div style="display:flex; gap:4px; margin-top:4px; font-size:0.65rem; flex-wrap:wrap;">
                                    <button type="button" class="btn btn-xs btn-secondary" onclick="SkillAnimator.updateSelectedStepField('fxDelay', 0); SkillAnimator.updateTimelineUI();" style="padding:1px 6px;">⏮ Frame Awal (0f)</button>
                                    ${selStep.useKeyframes ? `
                                        <button type="button" class="btn btn-xs btn-primary" onclick="SkillAnimator.updateSelectedStepField('fxDelay', Math.min(${selStep.duration - 1}, ${(selStep.kfStart || 0) + (selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration))})); SkillAnimator.updateTimelineUI();" style="padding:1px 6px; font-weight:700;">💥 Tabrakan VFX (${Math.min(selStep.duration - 1, (selStep.kfStart || 0) + (selStep.kfDuration !== undefined ? selStep.kfDuration : Math.min(6, selStep.duration)))}f)</button>
                                    ` : ''}
                                </div>
                            </div>
                            <div>
                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Reaksi Musuh</label>
                                <select class="form-control" style="font-size:0.75rem; padding:3px 6px;" onchange="SkillAnimator.updateSelectedStepField('reaction', this.value)">
                                    <option value="flinch" ${selStep.reaction === 'flinch' ? 'selected' : ''}>Flinch Mundur (16px)</option>
                                    <option value="knockback" ${selStep.reaction === 'knockback' ? 'selected' : ''}>Knockback Terpental (38px)</option>
                                    <option value="tremble" ${selStep.reaction === 'tremble' ? 'selected' : ''}>Tremble Getar Hebat</option>
                                    <option value="none" ${selStep.reaction === 'none' ? 'selected' : ''}>Tanpa Gerakan</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.68rem; color:var(--text-muted); display:block; margin-bottom:2px;">Tipe Popup Indikator</label>
                                <select class="form-control" style="font-size:0.75rem; padding:3px 6px;" onchange="SkillAnimator.updateSelectedStepField('popupType', this.value)">
                                    <option value="hp_damage" ${selStep.popupType === 'hp_damage' ? 'selected' : ''}>💥 Physical HP Damage</option>
                                    <option value="critical" ${selStep.popupType === 'critical' ? 'selected' : ''}>⚡ Critical Hit (Gold)</option>
                                    <option value="magical" ${selStep.popupType === 'magical' ? 'selected' : ''}>🔮 Magical Damage (Cyan)</option>
                                    <option value="heal" ${selStep.popupType === 'heal' ? 'selected' : ''}>✨ HP Recovery / Heal</option>
                                    <option value="guard" ${selStep.popupType === 'guard' ? 'selected' : ''}>🛡️ Guard (Bertahan)</option>
                                    <option value="buff" ${selStep.popupType === 'buff' ? 'selected' : ''}>✨ Buff / Status Up</option>
                                </select>
                            </div>
                        </div>
                    ` : ''}
                </div>
                `;
            })()}
        </div>
    `;

    setTimeout(() => {
        const cvs = document.getElementById('svBattleCanvas');
        if (cvs) {
            SkillAnimator.initPreview(cvs, skill);
        }
        const tracksEl = document.getElementById('capcutTimelineTracks');
        if (tracksEl) {
            SkillAnimator.setupTimelineScrubInteractions(tracksEl);
        }
    }, 40);
};

/**
 * Render Studio Sidebar Inspector
 */
SkillAnimator.renderStudioSidebar = function (previewContainer, skill) {
    if (!previewContainer || !skill) return;
    const cfg = this.getConfig(skill);
    const yanflySeq = this.generateYanflySequence(cfg, skill);

    const svActors = (State.svActors && State.svActors.length > 0) ? State.svActors : ['Actor1_1', 'Actor1_2', 'Actor1_3', 'Actor2_1', 'Actor2_2'];
    const enemies = (State.enemiesPics && State.enemiesPics.length > 0) ? State.enemiesPics : ['Actor1_3', 'Actor1_4', 'Actor1_5', 'Actor2_1'];

    previewContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <!-- Scene Battler & Arena Customizers -->
            <div class="card" style="padding:10px 12px; margin-bottom:0;">
                <h4 style="margin:0 0 8px 0; font-size:0.8rem; color:#c084fc;">🎭 Battlers &amp; Arena</h4>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">SV Actor:</label>
                        <select class="form-control" style="padding:3px 6px; font-size:0.75rem; height:auto;"
                                onchange="SkillAnimator.selectedActorName=this.value; SkillAnimator.getImage('img/sv_actors/' + this.value + '.png'); SkillAnimator.render();">
                            ${svActors.map(a => {
                                const name = a.replace(/\.png$/i, '');
                                return `<option value="${name}" ${SkillAnimator.selectedActorName === name ? 'selected' : ''}>${name}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">SV Enemy:</label>
                        <select class="form-control" style="padding:3px 6px; font-size:0.75rem; height:auto;"
                                onchange="SkillAnimator.selectedEnemyName=this.value; SkillAnimator.getImage('img/sv_enemies/' + this.value + '.png'); SkillAnimator.getImage('img/enemies/' + this.value + '.png'); SkillAnimator.render();">
                            ${enemies.map(e => {
                                const name = e.replace(/\.png$/i, '');
                                return `<option value="${name}" ${SkillAnimator.selectedEnemyName === name ? 'selected' : ''}>${name}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">Arena Background:</label>
                        <select class="form-control" style="padding:3px 6px; font-size:0.75rem; height:auto;"
                                onchange="SkillAnimator.selectedBattleback1=this.value; SkillAnimator.selectedBattleback2=this.value.replace('1','2'); SkillAnimator.getImage('img/battlebacks1/' + this.value + '.png'); SkillAnimator.render();">
                            <option value="Cobblestones1" ${SkillAnimator.selectedBattleback1 === 'Cobblestones1' ? 'selected' : ''}>Cobblestones</option>
                            <option value="Castle1" ${SkillAnimator.selectedBattleback1 === 'Castle1' ? 'selected' : ''}>Castle</option>
                            <option value="Clouds" ${SkillAnimator.selectedBattleback1 === 'Clouds' ? 'selected' : ''}>Clouds</option>
                            <option value="Grassland" ${SkillAnimator.selectedBattleback1 === 'Grassland' ? 'selected' : ''}>Grassland</option>
                            <option value="Desert" ${SkillAnimator.selectedBattleback1 === 'Desert' ? 'selected' : ''}>Desert</option>
                            <option value="Wasteland" ${SkillAnimator.selectedBattleback1 === 'Wasteland' ? 'selected' : ''}>Wasteland</option>
                            <option value="Lava" ${SkillAnimator.selectedBattleback1 === 'Lava' ? 'selected' : ''}>Lava</option>
                            <option value="Snow" ${SkillAnimator.selectedBattleback1 === 'Snow' ? 'selected' : ''}>Snow</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Yanfly Action Sequence Compiled Code -->
            <div class="card" style="padding:10px 12px; margin-bottom:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h4 style="margin:0; font-size:0.8rem; color:#a78bfa;">📜 Yanfly Action Sequence</h4>
                    <span class="badge" style="font-size:0.65rem; background:#10b98122; color:#34d399; border:1px solid #10b98155;">Auto-Sync</span>
                </div>
                <textarea id="yanflySeqPreview" readonly class="form-control" style="font-family:monospace; font-size:0.68rem; line-height:1.4; height:240px; resize:vertical; background:#020617; color:#93c5fd;">${escapeHtml(yanflySeq)}</textarea>
            </div>
        </div>
    `;
};

SkillAnimator.renderStudioPanel = function (skill) {
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
                <!-- DEDICATED STUDIO JUMP BANNER -->
                <div style="background:linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(56,189,248,0.2) 100%); border:1px solid #8b5cf666; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div style="font-size:0.72rem; color:#c084fc; font-weight:700; letter-spacing:0.5px;">CAPCUT-STYLE TIMELINE &amp; KEYFRAME STUDIO</div>
                        <div style="font-size:0.95rem; font-weight:700; color:#fff;">Buka di Tab "Skill Animation Editor" untuk Pengalaman Terbaik</div>
                        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Edit 4 segmen (Casting, Move, Attack, Return), atur durasi frame, dan drag &amp; drop letak efek langsung di layar canvas!</div>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="switchTab('skill_animator')" style="font-weight:700; padding:8px 16px; background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); white-space:nowrap; display:flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(139,92,246,0.3);">
                        <span>🎬</span> Buka Skill Animation Editor
                    </button>
                </div>

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
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                <label style="font-size:0.72rem; margin:0;">Animasi Cast pada User (Aura / Circle)</label>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimationInEditor(document.getElementById('cfgCastAnimId') ? document.getElementById('cfgCastAnimId').value : 0)" style="padding:1px 6px; font-size:0.65rem; color:#c084fc;" title="Buka dan modifikasi visual animasi cast ini di Animation Studio">🎨 Edit Cast VFX</button>
                            </div>
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
                                ${SkillAnimator.renderSeSelect(cfg.cast.se, "onSkillPhaseFieldChange(); SkillAnimator.playSe(this.value);", "cfgCastSe")}
                            </div>
                        </div>
                    </div>

                    <!-- FASE 2: ATTACKING -->
                    <div style="background:rgba(0,0,0,0.25); border:1px solid #f8717144; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f8717122; padding-bottom:6px;">
                            <strong style="color:#f87171; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                                <span>⚔️</span> FASE 2: ATTACKING (AKSI JURUS)
                            </strong>
                            <span style="font-size:0.7rem; color:var(--text-muted);">Eksekusi Serangan / Aksi</span>
                        </div>

                        <!-- TARGET SCOPE SELECTION -->
                        <div class="form-group" style="margin:0; background:rgba(56,189,248,0.06); border:1px solid #38bdf844; border-radius:6px; padding:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="font-size:0.75rem; color:#67e8f9; font-weight:700; margin:0;">🎯 Sasaran Aksi &amp; Animasi (Target Scope)</label>
                                <span style="font-size:0.68rem; color:#94a3b8;">Tujuan efek visual &amp; aksi</span>
                            </div>
                            <select id="cfgAttackTarget" class="form-control" style="font-size:0.8rem; padding:4px 8px; border-color:#38bdf8; color:#67e8f9; font-weight:600;" onchange="onSkillTargetScopeChange(this.value)">
                                <option value="target" ${cfg.attack.target !== 'user' ? 'selected' : ''}>👾 Musuh / Target Serangan (Enemy Target)</option>
                                <option value="user" ${cfg.attack.target === 'user' ? 'selected' : ''}>👤 Diri Sendiri / Karakter (User / Self — Guard, Buff, Heal)</option>
                            </select>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Pendekatan (Approach)</label>
                                <select id="cfgAttackApproach" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="melee" ${cfg.attack.approach === 'melee' ? 'selected' : ''}>Melesat ke Target (Melee)</option>
                                    <option value="jump" ${cfg.attack.approach === 'jump' ? 'selected' : ''}>Melompat Tinggi ke Target (Arc Jump)</option>
                                    <option value="ranged" ${cfg.attack.approach === 'ranged' ? 'selected' : ''}>Tetap di Posisi (Ranged/Sihir/Guard)</option>
                                    <option value="step" ${cfg.attack.approach === 'step' ? 'selected' : ''}>Maju Selangkah (Step 32px)</option>
                                    <option value="teleport" ${cfg.attack.approach === 'teleport' ? 'selected' : ''}>Teleport Blink Seketika</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Motion Aksi Aktor</label>
                                <select id="cfgAttackMotion" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="attack" ${cfg.attack.motion === 'attack' ? 'selected' : ''}>attack (Otomatis Sesuai Tipe Senjata)</option>
                                    <option value="swing" ${cfg.attack.motion === 'swing' ? 'selected' : ''}>swing (Tebasan Senjata)</option>
                                    <option value="thrust" ${cfg.attack.motion === 'thrust' ? 'selected' : ''}>thrust (Tusukan Senjata)</option>
                                    <option value="missile" ${cfg.attack.motion === 'missile' ? 'selected' : ''}>missile (Menembak Busur/Pistol)</option>
                                    <option value="guard" ${cfg.attack.motion === 'guard' ? 'selected' : ''}>guard (Kuda-kuda Bertahan / Tameng)</option>
                                    <option value="skill" ${cfg.attack.motion === 'skill' ? 'selected' : ''}>skill (Konsentrasi Jurus / Fisik)</option>
                                    <option value="spell" ${cfg.attack.motion === 'spell' ? 'selected' : ''}>spell (Pelepasan Mantra Sihir)</option>
                                </select>
                            </div>
                        </div>

                        <!-- JARAK KONTAK & TITIK TUMPUAN ANIMASI -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;" title="Jarak karakter berhenti di depan target (piksel)">Jarak Kontak Karakter (px)</label>
                                <input type="number" id="cfgAttackDistance" min="10" max="150" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.attack.distance !== undefined ? cfg.attack.distance : 50}" onchange="onSkillPhaseFieldChange()">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;" title="Posisi tumpuan munculnya animasi VFX pada target">Titik Tumpuan VFX (Anchor)</label>
                                <select id="cfgAttackPosType" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="center" ${cfg.attack.posType === 'center' ? 'selected' : ''}>Pusat Tubuh (Center)</option>
                                    <option value="head" ${cfg.attack.posType === 'head' ? 'selected' : ''}>Atas Kepala (Head)</option>
                                    <option value="feet" ${cfg.attack.posType === 'feet' ? 'selected' : ''}>Kaki / Alas Tanah (Feet)</option>
                                    <option value="screen" ${cfg.attack.posType === 'screen' ? 'selected' : ''}>Tengah Layar (Screen)</option>
                                </select>
                            </div>
                        </div>

                        <!-- OFFSET GESER VFX X & Y -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; background:rgba(0,0,0,0.2); border:1px dashed rgba(56,189,248,0.3); border-radius:6px; padding:6px 8px;">
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.7rem; color:#38bdf8;" title="Geser posisi animasi ke kiri (-) atau kanan (+)">📐 Offset VFX X (Kiri/Kanan px)</label>
                                <input type="number" id="cfgAttackOffsetX" min="-200" max="200" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${cfg.attack.offsetX || 0}" onchange="onSkillPhaseFieldChange()">
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.7rem; color:#38bdf8;" title="Geser posisi animasi ke atas (-) atau bawah (+)">📐 Offset VFX Y (Atas/Bawah px)</label>
                                <input type="number" id="cfgAttackOffsetY" min="-200" max="200" class="form-control" style="font-size:0.8rem; padding:3px 6px;" value="${cfg.attack.offsetY || 0}" onchange="onSkillPhaseFieldChange()">
                            </div>
                            <div style="grid-column: 1 / -1; display:flex; align-items:center; gap:16px; margin-top:2px; padding-top:4px; border-top:1px dashed rgba(56,189,248,0.2);">
                                <span style="font-size:0.7rem; color:#38bdf8; font-weight:700;">🔄 Transformasi:</span>
                                <label class="checkbox-label" style="font-size:0.72rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:4px;">
                                    <input type="checkbox" id="cfgAttackFlipX" ${cfg.attack.flipX ? 'checked' : ''} onchange="onSkillPhaseFieldChange()">
                                    <span style="color:${cfg.attack.flipX ? '#38bdf8' : 'var(--text-muted)'}; font-weight:${cfg.attack.flipX ? '700' : 'normal'};">↔️ Flip Horizontal</span>
                                </label>
                                <label class="checkbox-label" style="font-size:0.72rem; margin:0; cursor:pointer; display:flex; align-items:center; gap:4px;">
                                    <input type="checkbox" id="cfgAttackFlipY" ${cfg.attack.flipY ? 'checked' : ''} onchange="onSkillPhaseFieldChange()">
                                    <span style="color:${cfg.attack.flipY ? '#38bdf8' : 'var(--text-muted)'}; font-weight:${cfg.attack.flipY ? '700' : 'normal'};">↕️ Flip Vertikal</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" style="margin:0;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                <label style="font-size:0.72rem; margin:0;">Animasi Visual Target (Skill Animation)</label>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimationInEditor(document.getElementById('cfgAttackAnimId') ? document.getElementById('cfgAttackAnimId').value : 0)" style="padding:1px 6px; font-size:0.65rem; color:#38bdf8;" title="Buka dan modifikasi visual animasi serangan ini di Animation Studio">🎨 Edit VFX</button>
                            </div>
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
                                <label style="font-size:0.72rem;">Tipe Popup Indikator</label>
                                <select id="cfgReactionPopupType" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onSkillPhaseFieldChange()">
                                    <option value="hp_damage" ${cfg.reaction.popupType === 'hp_damage' ? 'selected' : ''}>💥 Physical HP Damage (Red -)</option>
                                    <option value="magical" ${cfg.reaction.popupType === 'magical' ? 'selected' : ''}>🔮 Magical Damage (Cyan -)</option>
                                    <option value="critical" ${cfg.reaction.popupType === 'critical' ? 'selected' : ''}>⚡ Critical Hit (Gold -)</option>
                                    <option value="heal" ${cfg.reaction.popupType === 'heal' ? 'selected' : ''}>✨ HP Recovery / Heal (Green +)</option>
                                    <option value="guard" ${cfg.reaction.popupType === 'guard' ? 'selected' : ''}>🛡️ Guard (Bertahan - Biru Muda)</option>
                                    <option value="buff" ${cfg.reaction.popupType === 'buff' ? 'selected' : ''}>🌟 Buff / Status Up (Ungu)</option>
                                    <option value="sp_gain" ${cfg.reaction.popupType === 'sp_gain' ? 'selected' : ''}>⚡ SP Recovery (Gold +)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Nilai Uji Coba Angka</label>
                                <input type="number" id="cfgReactionTestValue" min="0" class="form-control" style="font-size:0.8rem; padding:4px 8px;" value="${cfg.reaction.testValue || 0}" onchange="onSkillPhaseFieldChange()">
                            </div>
                        </div>

                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.72rem;">Sound SE Kena Hit / Efek</label>
                            ${SkillAnimator.renderSeSelect(cfg.reaction.se, "onSkillPhaseFieldChange(); SkillAnimator.playSe(this.value);", "cfgReactionSe")}
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
 * Handle Target Scope Change (Enemy vs Self/User)
 */
function onSkillTargetScopeChange(val) {
    if (val === 'user') {
        const app = document.getElementById('cfgAttackApproach');
        if (app) app.value = 'ranged'; // Tetap di tempat
        const mot = document.getElementById('cfgAttackMotion');
        if (mot && (mot.value === 'swing' || mot.value === 'thrust' || mot.value === 'missile')) {
            mot.value = 'guard'; // Default to guard
        }
        const pop = document.getElementById('cfgReactionPopupType');
        if (pop && pop.value === 'hp_damage') {
            pop.value = 'guard';
        }
        const rx = document.getElementById('cfgReactionType');
        if (rx) rx.value = 'none';
        const fl = document.getElementById('cfgReactionFlash');
        if (fl) fl.value = 'none';
    }
    onSkillPhaseFieldChange();
}

/**
 * Handle field changes in the Action Studio
 */
function onSkillPhaseFieldChange() {
    const skill = State.skills[State.selectedIndex];
    if (!skill) return;

    const targetVal = document.getElementById('cfgAttackTarget') ? document.getElementById('cfgAttackTarget').value : 'target';

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
            target: targetVal,
            approach: document.getElementById('cfgAttackApproach').value,
            motion: document.getElementById('cfgAttackMotion').value,
            distance: parseInt(document.getElementById('cfgAttackDistance') ? document.getElementById('cfgAttackDistance').value : 50, 10) || 50,
            animId: parseInt(document.getElementById('cfgAttackAnimId').value, 10) || 0,
            posType: document.getElementById('cfgAttackPosType') ? document.getElementById('cfgAttackPosType').value : 'center',
            offsetX: parseInt(document.getElementById('cfgAttackOffsetX') ? document.getElementById('cfgAttackOffsetX').value : 0, 10) || 0,
            offsetY: parseInt(document.getElementById('cfgAttackOffsetY') ? document.getElementById('cfgAttackOffsetY').value : 0, 10) || 0,
            flipX: document.getElementById('cfgAttackFlipX') ? document.getElementById('cfgAttackFlipX').checked : false,
            flipY: document.getElementById('cfgAttackFlipY') ? document.getElementById('cfgAttackFlipY').checked : false,
            repeats: parseInt(document.getElementById('cfgAttackRepeats').value, 10) || 1,
            interval: parseInt(document.getElementById('cfgAttackInterval').value, 10) || 12,
            shake: document.getElementById('cfgAttackShake').value,
            flash: document.getElementById('cfgAttackFlash').value
        },
        reaction: {
            type: document.getElementById('cfgReactionType').value,
            flash: document.getElementById('cfgReactionFlash').value,
            popupType: document.getElementById('cfgReactionPopupType').value,
            testValue: parseInt(document.getElementById('cfgReactionTestValue').value, 10) || 0,
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

    // Update preview without auto-playing
    SkillAnimator.update(true);
    SkillAnimator.render();
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
    if (skill.animationId > 0 && presetKey !== 'heal' && presetKey !== 'guard' && presetKey !== 'buff') {
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
    if (SkillAnimator.isPlaying) {
        if (SkillAnimator.currentTick >= (SkillAnimator.totalTicks || 75)) {
            SkillAnimator.currentTick = 0;
            SkillAnimator.castAnimPlayer = null;
            SkillAnimator.targetAnimPlayers = [];
            SkillAnimator.scrubAnimPlayer = null;
        }
    }
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = SkillAnimator.isPlaying ? '⏸ Pause' : '▶ Play';
}

function replaySkillAnim() {
    SkillAnimator.currentTick = 0;
    SkillAnimator.castAnimPlayer = null;
    SkillAnimator.targetAnimPlayers = [];
    SkillAnimator.scrubAnimPlayer = null;
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

function stepSkillAnim(delta) {
    SkillAnimator.isPlaying = false;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = '▶ Play';

    SkillAnimator.currentTick = Math.max(0, Math.min(SkillAnimator.totalTicks || 75, SkillAnimator.currentTick + delta));
    SkillAnimator.update(true);
    SkillAnimator.render();
}

function onSvTimelineScrub(val) {
    SkillAnimator.isPlaying = false;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = '▶ Play';

    SkillAnimator.currentTick = Math.max(0, Math.min(SkillAnimator.totalTicks || 75, parseInt(val, 10)));
    SkillAnimator.update(true);
    SkillAnimator.render();
}

function jumpToSkillPhase(phaseKey) {
    const cfg = SkillAnimator.getConfig(SkillAnimator.activeSkill);
    const castEnabled = cfg.cast && cfg.cast.enabled;
    const castDuration = castEnabled ? (cfg.cast.duration || 30) : 0;
    const isSelf = (cfg.attack && cfg.attack.target === 'user') || (SkillAnimator.activeSkill && (SkillAnimator.activeSkill.scope === 11 || SkillAnimator.activeSkill.id === 2));
    const approach = isSelf ? 'ranged' : (cfg.attack.approach || 'melee');
    const approachDuration = isSelf ? 0 : ((approach === 'melee' || approach === 'jump') ? 16 : (approach === 'teleport' ? 6 : 10));

    let targetTick = 0;
    if (phaseKey === 'cast') {
        targetTick = 8;
    } else if (phaseKey === 'approach') {
        targetTick = 8 + castDuration;
    } else if (phaseKey === 'attack') {
        targetTick = 8 + castDuration + (approach === 'ranged' ? 0 : approachDuration);
    } else if (phaseKey === 'return') {
        const repeats = Math.max(1, parseInt(cfg.attack.repeats, 10) || 1);
        const interval = Math.max(4, parseInt(cfg.attack.interval, 10) || 12);
        const attackTotalDuration = (repeats - 1) * interval + 18;
        targetTick = 8 + castDuration + (approach === 'ranged' ? 0 : approachDuration) + attackTotalDuration;
    }

    SkillAnimator.currentTick = targetTick;
    SkillAnimator.isPlaying = false;
    const btn = document.getElementById('svPlayBtn');
    if (btn) btn.textContent = '▶ Play';
    SkillAnimator.update(true);
    SkillAnimator.render();
}

/**
 * Clean cleanup when switching away from Skills tab
 */
function stopSkillBattleAnimation() {
    SkillAnimator.stop();
}


if (typeof window !== 'undefined') window.SkillAnimator = SkillAnimator;
