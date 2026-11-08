/**
 * NUSV Database Studio - Entity Editor: editors/battle_sequence_editor.js
 * 6-Phase Flowchart Timeline Visualizer & Modular Event-Command List Builder
 * for Yanfly Battle Engine Core & Action Sequence Packs 1/2/3.
 */

// ============================================================================
// 1. DATA PARSER: TEXT BLOCKS ⇄ COMMAND OBJECTS
// ============================================================================

function parseActionBlockCommands(blockText) {
    if (!blockText) return [];
    const lines = blockText.split(/\r?\n/);
    const commands = [];
    let indentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        let lower = line.toLowerCase();
        let icon = pai('sliders');
        let color = '#94a3b8';
        let display = line;
        let type = 'raw';

        if (lower === 'end') {
            indentLevel = Math.max(0, indentLevel - 1);
            icon = pai('git-branch');
            color = '#f59e0b';
            display = 'END (End of IF block)';
            type = 'end';
        } else if (lower.startsWith('else')) {
            icon = pai('git-branch');
            color = '#f59e0b';
            display = 'ELSE';
            type = 'else';
        } else if (lower.startsWith('if ')) {
            icon = pai('git-branch');
            color = '#f59e0b';
            display = 'IF ' + line.substring(3).trim();
            type = 'if';
        } else if (lower.startsWith('zoom:')) {
            icon = pai('camera');
            color = '#c084fc';
            display = 'Zoom Screen: ' + line.substring(5).trim();
            type = 'zoom';
        } else if (lower.startsWith('camera focus:')) {
            icon = pai('camera');
            color = '#c084fc';
            display = 'Camera Focus: ' + line.substring(13).trim();
            type = 'camera_focus';
        } else if (lower.startsWith('camera clamp')) {
            icon = pai('camera');
            color = '#c084fc';
            display = 'Camera Clamp: ' + line.substring(12).trim();
            type = 'camera_clamp';
        } else if (lower.startsWith('reset camera')) {
            icon = pai('camera');
            color = '#c084fc';
            display = 'Reset Camera' + (line.includes(':') ? ' (' + line.split(':')[1].trim() + 'f)' : '');
            type = 'reset_camera';
        } else if (lower.startsWith('reset zoom')) {
            icon = pai('camera');
            color = '#c084fc';
            display = 'Reset Zoom' + (line.includes(':') ? ' (' + line.split(':')[1].trim() + 'f)' : '');
            type = 'reset_zoom';
        } else if (lower.startsWith('move ')) {
            icon = pai('speed-fast');
            color = '#38bdf8';
            display = 'Move ' + line.substring(5).trim();
            type = 'move';
        } else if (lower.startsWith('jump ')) {
            icon = pai('arrow-up');
            color = '#38bdf8';
            display = 'Jump ' + line.substring(5).trim();
            type = 'jump';
        } else if (lower.startsWith('face ')) {
            icon = pai('eye');
            color = '#38bdf8';
            display = 'Face ' + line.substring(5).trim();
            type = 'face';
        } else if (lower.startsWith('opacity ')) {
            icon = pai('eye-off');
            color = '#38bdf8';
            display = 'Opacity ' + line.substring(8).trim();
            type = 'opacity';
        } else if (lower.startsWith('perform start')) {
            icon = pai('user');
            color = '#38bdf8';
            display = 'Perform Start Motion';
            type = 'perform_start';
        } else if (lower.startsWith('perform finish')) {
            icon = pai('user');
            color = '#38bdf8';
            display = 'Perform Finish Motion';
            type = 'perform_finish';
        } else if (lower.startsWith('motion ')) {
            icon = pai('sword');
            color = '#f87171';
            display = 'Motion: ' + line.substring(7).trim();
            type = 'motion';
        } else if (lower.startsWith('projectile weapon')) {
            icon = pai('speed-fast');
            color = '#38bdf8';
            display = 'Projectile Weapon: ' + (line.includes(':') ? line.split(':')[1].trim() : 'Auto Ranged / Magic');
            type = 'projectile_weapon';
        } else if (lower.startsWith('projectile animation')) {
            icon = pai('sparkles');
            color = '#a855f7';
            display = 'Projectile Animation: ' + (line.includes(':') ? line.split(':')[1].trim() : line.substring(20).trim());
            type = 'projectile_animation';
        } else if (lower.startsWith('projectile icon')) {
            icon = pai('target');
            color = '#f97316';
            display = 'Projectile Icon: ' + (line.includes(':') ? line.split(':')[1].trim() : line.substring(15).trim());
            type = 'projectile_icon';
        } else if (lower.startsWith('wait for projectile')) {
            icon = pai('clock');
            color = '#38bdf8';
            display = 'Wait for Projectile (Impact Sync)';
            type = 'wait_projectile';
        } else if (lower.startsWith('attack animation:')) {
            icon = pai('sparkles');
            color = '#c084fc';
            display = 'Attack Animation (Equipped Weapon): ' + line.split(':')[1].trim();
            type = 'attack_animation';
        } else if (lower.startsWith('action animation:')) {
            icon = pai('sparkles');
            color = '#c084fc';
            display = 'Action Animation (Database Skill): ' + line.split(':')[1].trim();
            type = 'action_animation';
        } else if (lower.startsWith('animation ')) {
            icon = pai('sparkles');
            color = '#c084fc';
            display = 'Direct Animation ' + line.substring(10).trim();
            type = 'direct_animation';
        } else if (lower.startsWith('cast animation')) {
            icon = pai('sparkles');
            color = '#c084fc';
            display = 'Cast Animation';
            type = 'cast_animation';
        } else if (lower.startsWith('action effect:')) {
            icon = pai('zap');
            color = '#ef4444';
            display = 'Action Effect (Deal Damage): ' + line.split(':')[1].trim();
            type = 'action_effect';
        } else if (lower.startsWith('immortal:')) {
            icon = pai('lock');
            color = '#ef4444';
            display = 'Immortal: ' + line.substring(9).trim();
            type = 'immortal';
        } else if (lower.startsWith('collapse:')) {
            icon = pai('skull');
            color = '#ef4444';
            display = 'Collapse: ' + line.substring(9).trim();
            type = 'collapse';
        } else if (lower.startsWith('death break')) {
            icon = pai('close');
            color = '#ef4444';
            display = 'Death Break (Stop if dead)';
            type = 'death_break';
        } else if (lower.startsWith('wait for ')) {
            icon = pai('clock');
            color = '#fbbf24';
            display = 'Wait for ' + line.substring(9).trim();
            type = 'wait_for';
        } else if (lower.startsWith('wait:')) {
            icon = pai('clock');
            color = '#fbbf24';
            display = 'Wait: ' + line.substring(5).trim() + ' frames';
            type = 'wait';
        } else if (lower.startsWith('shake screen:')) {
            icon = pai('zap');
            color = '#fb923c';
            display = 'Shake Screen: ' + line.substring(13).trim();
            type = 'shake_screen';
        } else if (lower.startsWith('flash screen:')) {
            icon = pai('zap');
            color = '#fb923c';
            display = 'Flash Screen: ' + line.substring(13).trim();
            type = 'flash_screen';
        } else if (lower.startsWith('tint screen:')) {
            icon = pai('moon');
            color = '#fb923c';
            display = 'Tint Screen: ' + line.substring(12).trim();
            type = 'tint_screen';
        } else if (lower.startsWith('se:')) {
            icon = pai('volume-3');
            color = '#fb923c';
            display = 'Play Sound Effect (SE): ' + line.substring(3).trim();
            type = 'se';
        } else if (lower.startsWith('clear battle log')) {
            icon = pai('notes');
            color = '#64748b';
            display = 'Clear Battle Log';
            type = 'clear_battle_log';
        } else if (lower.startsWith('display action')) {
            icon = pai('notes');
            color = '#64748b';
            display = 'Display Action Name';
            type = 'display_action';
        }

        commands.push({
            id: 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            raw: line,
            display: display,
            icon: icon,
            color: color,
            type: type,
            indent: indentLevel
        });

        if (lower.startsWith('if ') || lower.startsWith('else')) {
            indentLevel++;
        }
    }
    return commands;
}

function serializeCommandsToBlock(commands) {
    if (!commands || commands.length === 0) return '';
    let indent = 0;
    const lines = [];
    for (let i = 0; i < commands.length; i++) {
        let raw = commands[i].raw ? commands[i].raw.trim() : '';
        if (!raw) continue;
        let lower = raw.toLowerCase();
        if (lower === 'end') {
            indent = Math.max(0, indent - 1);
        } else if (lower.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        let prefix = '  '.repeat(indent);
        lines.push(prefix + raw);
        if (lower.startsWith('if ') || lower.startsWith('else')) {
            indent++;
        }
    }
    return lines.join('\n');
}

// Helper: Extract Action Sequence Block from Note
function getBlockTag(note, tag) {
    const regex = new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'i');
    const m = (note || '').match(regex);
    return m ? m[1].trim() : null;
}

// ============================================================================
// 2. PARSER: SKILL NOTE -> 6-PHASE STATE & COMMAND LISTS
// ============================================================================

function parseBecSkillState(note) {
    note = note || '';

    // --- FORM 1: PRE CONDITION ---
    let targetScope = '';
    const mTarget = note.match(/<Target:\s*([^>]+)>/i);
    if (mTarget) targetScope = mTarget[1].trim();

    let selectSide = '';
    if (/<Select Dead Allies>/i.test(note)) selectSide = 'Select Dead Allies';
    else if (/<Select Foes>/i.test(note)) selectSide = 'Select Foes';
    else if (/<Select Allies>/i.test(note)) selectSide = 'Select Allies';

    let userSelectRule = '';
    if (/<Only Select User>/i.test(note)) userSelectRule = 'Only Select User';
    else if (/<Cannot Select User>/i.test(note)) userSelectRule = 'Cannot Select User';

    let instantCast = '';
    if (/<No Instant Cast>/i.test(note)) instantCast = 'no_instant';
    else if (/<Instant Cast:\s*Turn>/i.test(note)) instantCast = 'turn';
    else if (/<Instant Cast>/i.test(note)) instantCast = 'free';

    let ctbSpeed = '';
    const mCtbSpd = note.match(/<CTB Speed:\s*([+-]?\d+%?)>/i);
    if (mCtbSpd) ctbSpeed = mCtbSpd[1].trim();

    let speedOverride = '';
    const mSpd = note.match(/<speed:\s*([+-]?\d+)>/i);
    if (mSpd) speedOverride = mSpd[1].trim();

    let castAnim = 0;
    const mCastAnim = note.match(/<Cast Animation:\s*(\d+)>/i);
    if (mCastAnim) castAnim = parseInt(mCastAnim[1], 10);

    let hpThreshold = '';
    const mHpBelow = note.match(/<Select HP Below:\s*(\d+%)>/i);
    const mHpAbove = note.match(/<Select HP Above:\s*(\d+%)>/i);
    if (mHpBelow) hpThreshold = 'below_' + mHpBelow[1];
    else if (mHpAbove) hpThreshold = 'above_' + mHpAbove[1];

    // --- FORM 2: SETUP ACTION (<setup action>) ---
    const setupText = getBlockTag(note, 'setup action');
    const hasSetup = setupText !== null;
    const setupCommands = parseActionBlockCommands(setupText);
    let setupImmortal = /immortal:\s*targets,\s*true/i.test(setupText || '');
    let setupBattleLog = '';
    if (/clear battle log/i.test(setupText || '') && /display action/i.test(setupText || '')) setupBattleLog = 'clear_display';
    else if (/display action/i.test(setupText || '')) setupBattleLog = 'display';
    else if (/clear battle log/i.test(setupText || '')) setupBattleLog = 'clear';

    let setupMovement = '';
    if (/move user:\s*target,\s*front/i.test(setupText || '')) setupMovement = 'dash_target';
    else if (/move user:\s*forward/i.test(setupText || '')) setupMovement = 'step_forward';
    else if (/perform start/i.test(setupText || '')) setupMovement = 'perform_start';
    else if (/jump user/i.test(setupText || '')) setupMovement = 'jump_ready';

    let setupMotion = '';
    const mSetupMotion = (setupText || '').match(/motion\s+(\w+):\s*user/i);
    if (mSetupMotion) setupMotion = mSetupMotion[1].toLowerCase();

    let setupCamera = '';
    if (/(?:zoom:\s*150%|camera clamp off)/i.test(setupText || '') && /camera focus:\s*user/i.test(setupText || '')) setupCamera = 'zoom_user_track';
    else if (/zoom:\s*125%/i.test(setupText || '') && /camera focus:\s*user/i.test(setupText || '')) setupCamera = 'zoom_user';
    else if (/zoom:\s*125%/i.test(setupText || '') && /camera focus:\s*target/i.test(setupText || '')) setupCamera = 'zoom_target';
    else if (/camera pan/i.test(setupText || '')) setupCamera = 'pan_center';

    let setupCastExec = '';
    if (/cast animation/i.test(setupText || '')) {
        setupCastExec = /wait for animation/i.test(setupText || '') ? 'wait' : 'nowait';
    }

    // --- FORM 3: WHOLE ACTION (<whole action>) ---
    const wholeText = getBlockTag(note, 'whole action');
    const hasWhole = wholeText !== null && wholeText.trim().length > 0;
    const wholeCommands = parseActionBlockCommands(wholeText);
    let wholeAoeAnim = 0;
    const mWholeAnim = (wholeText || '').match(/animation\s+(\d+):/i);
    if (mWholeAnim) wholeAoeAnim = parseInt(mWholeAnim[1], 10);

    let wholeScreenFx = '';
    if (/tint screen:\s*dark/i.test(wholeText || '')) wholeScreenFx = 'tint_dark';
    else if (/flash screen:\s*white/i.test(wholeText || '')) wholeScreenFx = 'flash_white';
    else if (/flash screen:\s*red/i.test(wholeText || '')) wholeScreenFx = 'flash_red';
    else if (/fade out/i.test(wholeText || '')) wholeScreenFx = 'fade_blink';

    let wholeCamera = '';
    if (/camera focus:\s*targets/i.test(wholeText || '')) wholeCamera = 'focus_targets';
    else if (/zoom:\s*80%/i.test(wholeText || '')) wholeCamera = 'zoom_out';
    else if (/zoom:\s*140%/i.test(wholeText || '')) wholeCamera = 'zoom_in';

    // --- FORM 4: TARGET ACTION (<target action>) ---
    const targetText = getBlockTag(note, 'target action');
    const hasTarget = targetText !== null;
    const targetCommands = parseActionBlockCommands(targetText);
    let targetApproach = '';
    if (/opacity user:\s*0/i.test(targetText || '') && /opacity user:\s*255/i.test(targetText || '')) targetApproach = 'blink';
    else if (/jump user/i.test(targetText || '')) targetApproach = 'jump_in';
    else if (/move user:\s*target,\s*back/i.test(targetText || '')) targetApproach = 'back_18';
    else if (/move user:\s*target,\s*front,\s*5/i.test(targetText || '')) targetApproach = 'front_5';
    else if (/move user:\s*target,\s*front/i.test(targetText || '')) targetApproach = 'front_18';

    let targetApproachSpeed = 'normal_18';
    const mSpeed = (targetText || '').match(/move user:\s*target,\s*(?:front|back),\s*\d+,\s*(\d+)/i);
    if (mSpeed) {
        const f = parseInt(mSpeed[1], 10);
        if (f >= 25) targetApproachSpeed = 'slow_28';
        else if (f <= 10) targetApproachSpeed = 'fast_8';
        else targetApproachSpeed = 'normal_18';
    }

    let targetMotion = '';
    const mTargetMotion = (targetText || '').match(/motion\s+(\w+):\s*user/i);
    if (mTargetMotion) targetMotion = mTargetMotion[1].toLowerCase();

    let targetStrikeHold = 'instant';
    if (/motion\s+\w+:\s*user\s*\n\s*wait:\s*24/i.test(targetText || '')) targetStrikeHold = 'hold_24';
    else if (/motion\s+\w+:\s*user\s*\n\s*wait:\s*12/i.test(targetText || '')) targetStrikeHold = 'hold_12';

    let targetAnimType = 'weapon_anim';
    let targetCustomAnim = 0;
    if (/action animation:\s*target/i.test(targetText || '')) {
        targetAnimType = 'skill_anim';
    } else if (/attack animation:\s*target/i.test(targetText || '')) {
        targetAnimType = 'weapon_anim';
    } else {
        const mDirectAnim = (targetText || '').match(/animation\s+(\d+):\s*target/i);
        if (mDirectAnim) {
            targetAnimType = 'custom_anim';
            targetCustomAnim = parseInt(mDirectAnim[1], 10);
        }
    }

    let targetRepeats = 1;
    const mEffectCount = (targetText || '').match(/action effect:\s*target/gi);
    if (mEffectCount && mEffectCount.length > 1) {
        targetRepeats = Math.min(5, mEffectCount.length);
    }

    let targetArmorPen = '';
    const mArmor = note.match(/<Armor Penetration:\s*(\d+%)>/i);
    if (mArmor) targetArmorPen = mArmor[1];

    let targetDamageCap = '';
    if (/<Bypass Damage Cap>/i.test(note)) targetDamageCap = 'bypass';
    else {
        const mCap = note.match(/<Damage Cap:\s*(\d+)>/i);
        if (mCap) targetDamageCap = mCap[1];
    }

    let targetCritMod = '';
    if (/<Critical Rate:\s*100%>/i.test(note)) targetCritMod = 'force_crit';
    else if (/<Critical Rate:\s*0%>/i.test(note)) targetCritMod = 'no_crit';
    else if (/<Critical Multiplier:\s*250%>/i.test(note)) targetCritMod = 'mult_250';
    else if (/<Critical Multiplier:\s*300%>/i.test(note)) targetCritMod = 'mult_300';

    let targetImpactFx = '';
    if (/shake screen/i.test(targetText || '') && /flash screen:\s*red/i.test(targetText || '')) targetImpactFx = 'shake_and_red';
    else if (/shake screen:\s*5/i.test(targetText || '')) targetImpactFx = 'shake_heavy';
    else if (/shake screen/i.test(targetText || '')) targetImpactFx = 'shake_light';
    else if (/flash screen:\s*white/i.test(targetText || '')) targetImpactFx = 'flash_white';
    else if (/flash screen:\s*red/i.test(targetText || '')) targetImpactFx = 'flash_red';

    let targetHitCamera = '';
    if (/camera focus:\s*target,\s*center/i.test(targetText || '')) targetHitCamera = 'cut_target';

    let targetRecoil = '';
    if (/motion damage:\s*target\s*\n.*wait:\s*20/i.test(targetText || '') || (/motion damage:\s*target/i.test(targetText || '') && /wait for effect\s*\n\s*wait:\s*20/i.test(targetText || ''))) {
        targetRecoil = 'slow_recoil_20';
    } else if (/motion damage:\s*target/i.test(targetText || '')) {
        targetRecoil = 'recoil_normal';
    }

    let targetDeathRule = '';
    if (/opacity target:\s*0%,\s*50/i.test(targetText || '') || /collapse:\s*target,\s*force/i.test(targetText || '')) {
        targetDeathRule = /opacity target/i.test(targetText || '') ? 'slow_fade_50' : 'instant_collapse';
    }

    // --- FORM 5: FOLLOW ACTION (<follow action>) ---
    const followText = getBlockTag(note, 'follow action');
    const hasFollow = followText !== null && followText.trim().length > 0;
    const followCommands = parseActionBlockCommands(followText);
    let followAnimId = 0;
    const mFollowAnim = (followText || '').match(/animation\s+(\d+):/i);
    if (mFollowAnim) followAnimId = parseInt(mFollowAnim[1], 10);
    let followExtraHit = /action effect/i.test(followText || '');
    let followWait = '';
    if (/wait:\s*35/i.test(followText || '')) followWait = 'wait_35';
    else if (/wait:\s*20/i.test(followText || '')) followWait = 'wait_20';
    else if (/wait:\s*10/i.test(followText || '')) followWait = 'wait_10';

    // --- FORM 6: FINISH ACTION & POST EFFECT (<finish action> + Post-Tags) ---
    const finishText = getBlockTag(note, 'finish action');
    const hasFinish = finishText !== null;
    const finishCommands = parseActionBlockCommands(finishText);
    let finishImmortalRelease = /immortal:\s*targets,\s*false/i.test(finishText || '');
    let finishReturnMove = '';
    if (/opacity user:\s*0/i.test(finishText || '') && /opacity user:\s*255/i.test(finishText || '')) finishReturnMove = 'return_blink';
    else if (/jump user/i.test(finishText || '')) finishReturnMove = 'return_jump';
    else if (/move user:\s*return,\s*25/i.test(finishText || '')) finishReturnMove = 'return_walk';
    else if (/move user:\s*return/i.test(finishText || '')) finishReturnMove = 'return_fast';
    else if (/perform finish/i.test(finishText || '')) finishReturnMove = 'stay';

    let finishResetCamera = '';
    if (/reset camera:\s*30/i.test(finishText || '') || /reset zoom:\s*30/i.test(finishText || '')) {
        finishResetCamera = 'smooth_30';
    } else if (/reset camera/i.test(finishText || '') || /reset zoom/i.test(finishText || '')) {
        finishResetCamera = 'instant';
    }

    let afterCtb = '';
    const mAfterCtb = note.match(/<After CTB:\s*([+-]?\d+%?)>/i);
    if (mAfterCtb) afterCtb = mAfterCtb[1].trim();

    let ctbOrderShift = '';
    const mCtbOrder = note.match(/<CTB Order:\s*([+-]?\d+)>/i);
    if (mCtbOrder) ctbOrderShift = mCtbOrder[1].trim();

    let unleashSkill = '';
    const mUnleash = note.match(/<Unleash Skill:\s*([^>]+)>/i);
    if (mUnleash) unleashSkill = mUnleash[1].trim();

    return {
        pre: { targetScope, selectSide, userSelectRule, instantCast, ctbSpeed, speedOverride, castAnim, hpThreshold },
        setup: { hasSetup, setupImmortal, setupBattleLog, setupMovement, setupMotion, setupCamera, setupCastExec },
        whole: { hasWhole, wholeAoeAnim, wholeScreenFx, wholeCamera },
        target: { 
            hasTarget, targetApproach, targetApproachSpeed, targetMotion, targetStrikeHold,
            targetAnimType, targetCustomAnim, targetRepeats, targetArmorPen, targetDamageCap,
            targetCritMod, targetImpactFx, targetHitCamera, targetRecoil, targetDeathRule 
        },
        follow: { hasFollow, followAnimId, followExtraHit, followWait },
        finish: { hasFinish, finishImmortalRelease, finishReturnMove, finishResetCamera, afterCtb, ctbOrderShift, unleashSkill },
        setupCommands: setupCommands,
        wholeCommands: wholeCommands,
        targetCommands: targetCommands,
        followCommands: followCommands,
        finishCommands: finishCommands
    };
}

// ============================================================================
// 3. GENERATOR: 6-PHASE STATE & COMMANDS -> CLEAN SKILL NOTE
// ============================================================================

function generateBecSkillNote(skill, state) {
    if (!state) return skill.note || '';

    // Filter baris notetag lama di luar action sequence blocks
    let oldNote = (skill.note || '');
    const seqBlocks = ['setup action', 'whole action', 'target action', 'follow action', 'finish action'];
    seqBlocks.forEach(sb => {
        oldNote = oldNote.replace(new RegExp('<' + sb + '>[\\s\\S]*?<\\/' + sb + '>', 'gi'), '');
    });

    // Bersihkan tag bawaan yang dikelola oleh 6-Phase Editor
    oldNote = oldNote.replace(/<Target:\s*[^>]+>/gi, '')
                     .replace(/<Select (?:Allies|Foes|Dead Allies)>/gi, '')
                     .replace(/<(?:Cannot|Only) Select User>/gi, '')
                     .replace(/<No Instant Cast>/gi, '')
                     .replace(/<Instant Cast(?::\s*Turn)?>/gi, '')
                     .replace(/<CTB Speed:\s*[^>]+>/gi, '')
                     .replace(/<speed:\s*[^>]+>/gi, '')
                     .replace(/<Cast Animation:\s*\d+>/gi, '')
                     .replace(/<Select HP (?:Below|Above):\s*\d+%>/gi, '')
                     .replace(/<Armor Penetration:\s*\d+%>/gi, '')
                     .replace(/<Damage Cap:\s*\d+>/gi, '')
                     .replace(/<Bypass Damage Cap>/gi, '')
                     .replace(/<Critical Rate:\s*\d+%>/gi, '')
                     .replace(/<Critical Multiplier:\s*\d+%>/gi, '')
                     .replace(/<After CTB:\s*[^>]+>/gi, '')
                     .replace(/<CTB Order:\s*[^>]+>/gi, '')
                     .replace(/<Unleash Skill:\s*[^>]+>/gi, '')
                     .trim();

    // 1. Pre-Condition Notetags
    const preTags = [];
    if (state.pre) {
        if (state.pre.targetScope) preTags.push(`<Target: ${state.pre.targetScope}>`);
        if (state.pre.selectSide) preTags.push(`<${state.pre.selectSide}>`);
        if (state.pre.userSelectRule) preTags.push(`<${state.pre.userSelectRule}>`);
        if (state.pre.instantCast === 'no_instant') preTags.push('<No Instant Cast>');
        else if (state.pre.instantCast === 'turn') preTags.push('<Instant Cast: Turn>');
        else if (state.pre.instantCast === 'free') preTags.push('<Instant Cast>');
        if (state.pre.ctbSpeed) preTags.push(`<CTB Speed: ${state.pre.ctbSpeed}>`);
        if (state.pre.speedOverride) preTags.push(`<speed: ${state.pre.speedOverride}>`);
        if (state.pre.castAnim > 0) preTags.push(`<Cast Animation: ${state.pre.castAnim}>`);
        if (state.pre.hpThreshold) {
            if (state.pre.hpThreshold.startsWith('below_')) preTags.push(`<Select HP Below: ${state.pre.hpThreshold.replace('below_', '')}>`);
            else if (state.pre.hpThreshold.startsWith('above_')) preTags.push(`<Select HP Above: ${state.pre.hpThreshold.replace('above_', '')}>`);
        }
    }

    // 2. Target Notetags (DamageCore & Critical)
    const targetTags = [];
    if (state.target) {
        if (state.target.targetArmorPen) targetTags.push(`<Armor Penetration: ${state.target.targetArmorPen}>`);
        if (state.target.targetDamageCap === 'bypass') targetTags.push('<Bypass Damage Cap>');
        else if (state.target.targetDamageCap) targetTags.push(`<Damage Cap: ${state.target.targetDamageCap}>`);
        if (state.target.targetCritMod === 'force_crit') targetTags.push('<Critical Rate: 100%>');
        else if (state.target.targetCritMod === 'no_crit') targetTags.push('<Critical Rate: 0%>');
        else if (state.target.targetCritMod === 'mult_250') targetTags.push('<Critical Multiplier: 250%>');
        else if (state.target.targetCritMod === 'mult_300') targetTags.push('<Critical Multiplier: 300%>');
    }

    // 3. Finish Notetags (CTB Post-Tags)
    const finishTags = [];
    if (state.finish) {
        if (state.finish.afterCtb) finishTags.push(`<After CTB: ${state.finish.afterCtb}>`);
        if (state.finish.ctbOrderShift) finishTags.push(`<CTB Order: ${state.finish.ctbOrderShift}>`);
        if (state.finish.unleashSkill) finishTags.push(`<Unleash Skill: ${state.finish.unleashSkill}>`);
    }

    // 4. Action Sequence Blocks (Prioritas: Serializer Command List, fallback legacy tags)
    const actionBlocks = [];

    // SETUP ACTION
    let setupBlockBody = '';
    if (state.setupCommands && state.setupCommands.length > 0) {
        setupBlockBody = serializeCommandsToBlock(state.setupCommands);
    } else if (state.setup && state.setup.hasSetup) {
        const lines = [];
        if (state.setup.setupImmortal) lines.push('immortal: targets, true');
        if (state.setup.setupBattleLog === 'clear_display') lines.push('clear battle log\ndisplay action');
        else if (state.setup.setupBattleLog === 'display') lines.push('display action');
        else if (state.setup.setupBattleLog === 'clear') lines.push('clear battle log');

        if (state.setup.setupMovement === 'step_forward') lines.push('move user: forward, 20, 15\nwait for movement');
        else if (state.setup.setupMovement === 'dash_target') lines.push('move user: target, front, 20\nwait for movement');
        else if (state.setup.setupMovement === 'perform_start') lines.push('perform start\nwait for movement');
        else if (state.setup.setupMovement === 'jump_ready') lines.push('jump user: 50, 15\nwait for movement');

        if (state.setup.setupMotion && state.setup.setupMotion !== 'default') lines.push(`motion ${state.setup.setupMotion}: user`);
        if (state.setup.setupCastExec === 'wait') lines.push('cast animation\nwait for animation');
        else if (state.setup.setupCastExec === 'nowait') lines.push('cast animation');

        if (state.setup.setupCamera === 'zoom_user_track') {
            lines.push('camera clamp off\nzoom: 150%, 20\ncamera focus: user, center, 20\nwait for camera\nwait for zoom');
        } else if (state.setup.setupCamera === 'zoom_user') {
            lines.push('zoom: 125%, 20\ncamera focus: user, center, 20\nwait for camera\nwait for zoom');
        } else if (state.setup.setupCamera === 'zoom_target') {
            lines.push('zoom: 125%, 20\ncamera focus: target, center, 20\nwait for camera\nwait for zoom');
        } else if (state.setup.setupCamera === 'pan_center') {
            lines.push('camera pan: center, 20\nwait for camera');
        }
        setupBlockBody = lines.join('\n');
    }
    if (setupBlockBody.trim() || (state.setup && state.setup.hasSetup)) {
        actionBlocks.push(`<setup action>\n${setupBlockBody}\n</setup action>`);
    }

    // WHOLE ACTION
    let wholeBlockBody = '';
    if (state.wholeCommands && state.wholeCommands.length > 0) {
        wholeBlockBody = serializeCommandsToBlock(state.wholeCommands);
    } else if (state.whole && state.whole.hasWhole) {
        const lines = [];
        if (state.whole.wholeAoeAnim > 0) lines.push(`animation ${state.whole.wholeAoeAnim}: all targets\nwait for animation`);
        if (state.whole.wholeScreenFx === 'tint_dark') lines.push('tint screen: dark, 20');
        else if (state.whole.wholeScreenFx === 'flash_white') lines.push('flash screen: white, 15');
        else if (state.whole.wholeScreenFx === 'flash_red') lines.push('flash screen: red, 15');
        else if (state.whole.wholeScreenFx === 'fade_blink') lines.push('fade out: 8\nfade in: 8');

        if (state.whole.wholeCamera === 'focus_targets') lines.push('camera focus: targets, center, 25');
        else if (state.whole.wholeCamera === 'zoom_out') lines.push('zoom: 80%, 25');
        else if (state.whole.wholeCamera === 'zoom_in') lines.push('zoom: 140%, 25\ncamera focus: targets');
        wholeBlockBody = lines.join('\n');
    }
    if (wholeBlockBody.trim() || (state.whole && state.whole.hasWhole)) {
        actionBlocks.push(`<whole action>\n${wholeBlockBody}\n</whole action>`);
    }

    // TARGET ACTION
    let targetBlockBody = '';
    if (state.targetCommands && state.targetCommands.length > 0) {
        targetBlockBody = serializeCommandsToBlock(state.targetCommands);
    } else if (state.target && state.target.hasTarget) {
        const lines = [];
        const speedSuffix = (state.target.targetApproachSpeed === 'slow_28') ? ', 28' 
                          : (state.target.targetApproachSpeed === 'fast_8') ? ', 8' : '';

        if (state.target.targetApproach === 'blink') {
            lines.push('opacity user: 0, 4\nwait: 4\nmove user: target, front, 0\nopacity user: 255, 4\nwait for movement');
        } else if (state.target.targetApproach === 'jump_in') {
            lines.push(`jump user: 120, 15\nmove user: target, front, 15${speedSuffix}\nwait for movement`);
        } else if (state.target.targetApproach === 'back_18') {
            lines.push(`move user: target, back, 18${speedSuffix}\nface user: forward\nwait for movement`);
        } else if (state.target.targetApproach === 'front_5') {
            lines.push(`move user: target, front, 5${speedSuffix}\nwait for movement`);
        } else if (state.target.targetApproach === 'front_18') {
            lines.push(`move user: target, front, 18${speedSuffix}\nwait for movement`);
        }

        const repeats = state.target.targetRepeats || 1;
        for (let r = 0; r < repeats; r++) {
            if (state.target.targetMotion && state.target.targetMotion !== 'default') {
                lines.push(`motion ${state.target.targetMotion}: user`);
                if (state.target.targetStrikeHold === 'hold_12') lines.push('wait: 12');
                else if (state.target.targetStrikeHold === 'hold_24') lines.push('wait: 24');
            }

            if (state.target.targetAnimType === 'weapon_anim') {
                lines.push('attack animation: target\nwait for animation');
            } else if (state.target.targetAnimType === 'custom_anim') {
                const animId = (state.target.targetCustomAnim && state.target.targetCustomAnim > 0) 
                    ? state.target.targetCustomAnim 
                    : ((skill && skill.animationId > 0) ? skill.animationId : 1);
                lines.push(`animation ${animId}: target\nwait for animation`);
            } else {
                lines.push('action animation: target\nwait for animation');
            }

            lines.push('action effect: target');
            if (r < repeats - 1) lines.push('wait: 8');
        }

        if (state.target.targetHitCamera === 'cut_target') {
            lines.push('camera focus: target, center, 15\nwait for camera');
        }

        if (state.target.targetRecoil === 'slow_recoil_20') {
            lines.push('motion damage: target');
            if (state.target.targetImpactFx === 'shake_and_red') lines.push('shake screen: 4, 6, 12\nflash screen: red, 10');
            else if (state.target.targetImpactFx === 'shake_heavy') lines.push('shake screen: 5, 8, 15');
            else if (state.target.targetImpactFx === 'shake_light') lines.push('shake screen: 3, 5, 12');
            else if (state.target.targetImpactFx === 'flash_red') lines.push('flash screen: red, 12');
            else if (state.target.targetImpactFx === 'flash_white') lines.push('flash screen: white, 10');
            lines.push('wait for effect\nwait: 20');
        } else {
            if (state.target.targetRecoil === 'recoil_normal') lines.push('motion damage: target');
            if (state.target.targetImpactFx === 'shake_and_red') lines.push('shake screen: 4, 6, 12\nflash screen: red, 10\nwait for effect');
            else if (state.target.targetImpactFx === 'shake_heavy') lines.push('shake screen: 5, 8, 15\nwait for effect');
            else if (state.target.targetImpactFx === 'shake_light') lines.push('shake screen: 2, 4, 10\nwait for effect');
            else if (state.target.targetImpactFx === 'flash_red') lines.push('flash screen: red, 12\nwait for effect');
            else if (state.target.targetImpactFx === 'flash_white') lines.push('flash screen: white, 10\nwait for effect');
            else lines.push('wait for effect');
        }

        if (state.target.targetDeathRule === 'slow_fade_50') {
            lines.push('if target.isDead()\n  opacity target: 0%, 50\n  wait for opacity\n  collapse: target, force\n  wait: 15\nend');
            if (state.target.targetHitCamera === 'cut_target') lines.push('camera focus: user, center, 20\nwait for camera\nwait: 10');
        } else if (state.target.targetDeathRule === 'instant_collapse') {
            lines.push('if target.isDead()\n  collapse: target, force\nend');
            if (state.target.targetHitCamera === 'cut_target') lines.push('camera focus: user, center, 20\nwait for camera');
        } else if (state.target.targetHitCamera === 'cut_target') {
            lines.push('camera focus: user, center, 20\nwait for camera');
        }
        targetBlockBody = lines.join('\n');
    }
    if (targetBlockBody.trim() || (state.target && state.target.hasTarget)) {
        actionBlocks.push(`<target action>\n${targetBlockBody}\n</target action>`);
    }

    // FOLLOW ACTION
    let followBlockBody = '';
    if (state.followCommands && state.followCommands.length > 0) {
        followBlockBody = serializeCommandsToBlock(state.followCommands);
    } else if (state.follow && state.follow.hasFollow) {
        const lines = [];
        if (state.follow.followAnimId > 0) lines.push(`animation ${state.follow.followAnimId}: target\nwait for animation`);
        if (state.follow.followExtraHit) lines.push('action effect: target\nwait for effect');
        if (state.follow.followWait === 'wait_35') lines.push('wait: 35');
        else if (state.follow.followWait === 'wait_20') lines.push('wait: 20');
        else if (state.follow.followWait === 'wait_10') lines.push('wait: 10');
        followBlockBody = lines.join('\n');
    }
    if (followBlockBody.trim() || (state.follow && state.follow.hasFollow)) {
        actionBlocks.push(`<follow action>\n${followBlockBody}\n</follow action>`);
    }

    // FINISH ACTION
    let finishBlockBody = '';
    if (state.finishCommands && state.finishCommands.length > 0) {
        finishBlockBody = serializeCommandsToBlock(state.finishCommands);
    } else if (state.finish && state.finish.hasFinish) {
        const lines = [];
        if (state.finish.finishImmortalRelease) lines.push('immortal: targets, false');

        if (state.finish.finishReturnMove === 'return_blink') {
            lines.push('opacity user: 0, 4\nwait: 4\nmove user: return, 0\nopacity user: 255, 4\nwait for movement\nperform finish');
        } else if (state.finish.finishReturnMove === 'return_jump') {
            lines.push('jump user: 80, 14\nmove user: return, 14\nwait for movement\nperform finish');
        } else if (state.finish.finishReturnMove === 'return_walk') {
            lines.push('move user: return, 25\nwait for movement\nperform finish');
        } else if (state.finish.finishReturnMove === 'return_fast') {
            lines.push('move user: return, 15\nwait for movement\nperform finish');
        } else if (state.finish.finishReturnMove === 'stay') {
            lines.push('perform finish');
        }

        if (state.finish.finishResetCamera === 'smooth_30') {
            lines.push('reset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom');
        } else if (state.finish.finishResetCamera === 'instant' || state.finish.finishResetCamera === true) {
            lines.push('reset camera\nreset zoom');
        }
        finishBlockBody = lines.join('\n');
    }
    if (finishBlockBody.trim() || (state.finish && state.finish.hasFinish)) {
        actionBlocks.push(`<finish action>\n${finishBlockBody}\n</finish action>`);
    }

    // Gabungkan Semua Elemen
    const parts = [];
    if (preTags.length > 0) parts.push(preTags.join('\n'));
    if (targetTags.length > 0) parts.push(targetTags.join('\n'));
    if (finishTags.length > 0) parts.push(finishTags.join('\n'));
    if (actionBlocks.length > 0) parts.push(actionBlocks.join('\n\n'));
    if (oldNote.trim()) parts.push(oldNote.trim());

    return parts.join('\n\n').trim();
}

// ============================================================================
// 4. MAIN RENDER FUNCTION: 6-PHASE EVENT-COMMAND BUILDER
// ============================================================================

function renderBattleEngineVisualizer(skill) {
    if (!skill) return '';

    const note = skill.note || '';
    const state = parseBecSkillState(note);
    const animList = (State.animations || []).filter(a => a && a.id);

    // Kumpulkan status badge aktif untuk Flowchart
    const isPreActive = Boolean(state.pre.targetScope || state.pre.selectSide || state.pre.userSelectRule || state.pre.instantCast || state.pre.ctbSpeed || state.pre.speedOverride || state.pre.castAnim || state.pre.hpThreshold);
    const isSetupActive = state.setupCommands.length > 0 || state.setup.hasSetup;
    const isWholeActive = state.wholeCommands.length > 0 || state.whole.hasWhole;
    const isTargetActive = state.targetCommands.length > 0 || state.target.hasTarget;
    const isFollowActive = state.followCommands.length > 0 || state.follow.hasFollow;
    const isFinishActive = state.finishCommands.length > 0 || state.finish.hasFinish || state.finish.afterCtb || state.finish.ctbOrderShift || state.finish.unleashSkill;

    return `
        <!-- BATTLE ENGINE CORE & 6-PHASE EVENT COMMAND BUILDER -->
        <div class="card" style="border:1px solid #8b5cf655; background:linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(11,15,25,0.98) 100%); margin-bottom:16px; overflow:hidden;">
            
            <!-- HEADER -->
            <div class="card-header" style="background:linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(15,23,42,0.85) 100%); padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.4rem;">${pai('sword')}</span>
                    <div>
                        <div style="font-size:0.7rem; color:#c084fc; font-weight:700; letter-spacing:0.5px;">BATTLE ENGINE CORE &amp; ACTION SEQUENCES STUDIO</div>
                        <h2 style="font-size:1.05rem; margin:0; color:#fff; font-weight:700;">Modular 6-Phase Event-Command Builder</h2>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <!-- 10 WEAPON ATTACK PRESETS DROPDOWN -->
                    <div style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.35); border:1px solid #818cf855; border-radius:6px; padding:2px 8px;">
                        <span style="font-size:0.73rem; color:#c7d2fe; font-weight:700;">${pai('package')} Preset Senjata:</span>
                        <select class="form-control" style="font-size:0.75rem; padding:2px 6px; width:auto; max-width:210px; background:#1e1b4b; border-color:#818cf8; color:#e0e7ff; font-weight:600;" onchange="if(this.value){applyBecWeaponTypePreset(this.value); this.value='';}">
                            <option value="">-- Muat 10 Preset Senjata --</option>
                            <option value="long_sword">01. Long Sword (Heavy + Knockback)</option>
                            <option value="sword">02. Sword (Slashing Dash)</option>
                            <option value="gloves">03. Gloves (1-2x Multi-Punch)</option>
                            <option value="spear">04. Spear (Leap Thrust + Knockback)</option>
                            <option value="axe">05. Axe (Leap Heavy Chop + Knockback)</option>
                            <option value="staff">06. Staff (Step, Chant &amp; Mana Bolt)</option>
                            <option value="rune">07. Rune (1-2x Rune Magic Bolts)</option>
                            <option value="long_bow">08. Long Bow (Draw &amp; Piercing Shot)</option>
                            <option value="crossbow">09. Crossbow (1-3x Rapid Volley)</option>
                            <option value="dagger">10. Dagger (Behind Shadowstep &amp; Dual)</option>
                        </select>
                    </div>

                    <button type="button" class="btn btn-primary btn-sm" onclick="openBattlePreviewModal(State.currentSkillId || (State.skills && State.skills[State.selectedIndex] && State.skills[State.selectedIndex].id))" style="padding:4px 12px; font-size:0.75rem; background:linear-gradient(135deg, #ec4899, #8b5cf6); border:none; font-weight:700; display:flex; align-items:center; gap:5px; box-shadow:0 2px 10px rgba(236,72,153,0.35); border-radius:6px;" title="Uji langsung skill & urutan aksi ini di engine battle asli">
                        ${pai('sword')} Test di Layar Battle
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="copyBecSequenceToClipboard()" style="padding:4px 10px; font-size:0.75rem;" title="Copy all action sequences and notetags to clipboard">
                        ${pai('copy')} Copy Notetags
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="resetBecSequenceToDefault()" style="padding:4px 10px; font-size:0.75rem; color:#f87171; border:1px solid #ef444444;" title="Clear all custom action sequence blocks and reset to standard RPG Maker MV flow">
                        ${pai('repeat')} Reset to Default MV
                    </button>
                </div>
            </div>

            <div class="card-body" style="padding:16px; display:flex; flex-direction:column; gap:16px;">
                
                <!-- ========================================================= -->
                <!-- 1. TIMELINE FLOWCHART 6-PHASE                             -->
                <!-- ========================================================= -->
                <div style="background:rgba(0,0,0,0.4); border:1px solid #334155; border-radius:10px; padding:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #334155;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.1rem;">${pai('clock')}</span>
                            <div>
                                <strong style="color:#f8fafc; font-size:0.88rem;">Action Sequence Execution Flowchart</strong>
                                <div style="font-size:0.72rem; color:var(--text-muted);">Klik node mana saja untuk langsung lompat ke kanvas perintah fase tersebut.</div>
                            </div>
                        </div>
                    </div>

                    <div class="bec-flowchart-track" style="display:flex; align-items:stretch; gap:6px; overflow-x:auto; padding-bottom:6px;">
                        
                        <!-- NODE 1 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_pre')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isPreActive ? 'rgba(56,189,248,0.12)' : '#0f172a'}; border:1px solid ${isPreActive ? '#38bdf8' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#38bdf8;">PHASE 1</span>
                                    <span style="font-size:0.6rem; color:#38bdf8; font-weight:700;">${isPreActive ? '● ACTIVE' : '○ DEFAULT'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">PRE CONDITION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Target, CTB &amp; Cast</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#7dd3fc;">
                                ${getPreSummaryBadges(state.pre)}
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; color:#64748b; font-size:0.9rem;">${pai('arrow-right')}</div>

                        <!-- NODE 2 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_setup')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isSetupActive ? 'rgba(168,85,247,0.12)' : '#0f172a'}; border:1px solid ${isSetupActive ? '#a855f7' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#a855f7;">PHASE 2</span>
                                    <span style="font-size:0.6rem; color:#a855f7; font-weight:700;">${isSetupActive ? '● ACTIVE' : '○ EMPTY'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">SETUP ACTION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Opening &amp; Framing</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#d8b4fe;">
                                ${pai('notes')} ${state.setupCommands.length} Commands
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; color:#64748b; font-size:0.9rem;">${pai('arrow-right')}</div>

                        <!-- NODE 3 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_whole')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isWholeActive ? 'rgba(56,189,248,0.12)' : '#0f172a'}; border:1px solid ${isWholeActive ? '#38bdf8' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#38bdf8;">PHASE 3</span>
                                    <span style="font-size:0.6rem; color:#38bdf8; font-weight:700;">${isWholeActive ? '● ACTIVE' : '○ EMPTY'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">WHOLE ACTION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Mass AoE &amp; Screen FX</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#7dd3fc;">
                                ${pai('notes')} ${state.wholeCommands.length} Commands
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; color:#64748b; font-size:0.9rem;">${pai('arrow-right')}</div>

                        <!-- NODE 4 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_target')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isTargetActive ? 'rgba(239,68,68,0.12)' : '#0f172a'}; border:1px solid ${isTargetActive ? '#ef4444' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#ef4444;">PHASE 4</span>
                                    <span style="font-size:0.6rem; color:#ef4444; font-weight:700;">${isTargetActive ? '● ACTIVE' : '○ EMPTY'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">TARGET ACTION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Core Strike &amp; Damage</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#fca5a5;">
                                ${pai('notes')} ${state.targetCommands.length} Commands
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; color:#64748b; font-size:0.9rem;">${pai('arrow-right')}</div>

                        <!-- NODE 5 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_follow')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isFollowActive ? 'rgba(234,179,8,0.12)' : '#0f172a'}; border:1px solid ${isFollowActive ? '#eab308' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#eab308;">PHASE 5</span>
                                    <span style="font-size:0.6rem; color:#eab308; font-weight:700;">${isFollowActive ? '● ACTIVE' : '○ EMPTY'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">FOLLOW ACTION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Follow-up Combo &amp; Pause</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#fde047;">
                                ${pai('notes')} ${state.followCommands.length} Commands
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; color:#64748b; font-size:0.9rem;">${pai('arrow-right')}</div>

                        <!-- NODE 6 -->
                        <div class="bec-node-btn" onclick="scrollToBecSection('becSec_finish')" 
                             style="cursor:pointer; flex:1; min-width:145px; background:${isFinishActive ? 'rgba(16,185,129,0.12)' : '#0f172a'}; border:1px solid ${isFinishActive ? '#10b981' : '#334155'}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                    <span style="font-size:0.65rem; font-weight:700; color:#10b981;">PHASE 6</span>
                                    <span style="font-size:0.6rem; color:#10b981; font-weight:700;">${isFinishActive ? '● ACTIVE' : '○ EMPTY'}</span>
                                </div>
                                <div style="font-size:0.78rem; font-weight:700; color:#fff;">FINISH ACTION</div>
                                <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Return &amp; Recovery</div>
                            </div>
                            <div style="margin-top:6px; padding-top:4px; border-top:1px dashed #334155; font-size:0.62rem; color:#a7f3d0;">
                                ${pai('notes')} ${state.finishCommands.length} Commands
                            </div>
                        </div>

                    </div>
                </div>

                <!-- ========================================================= -->
                <!-- 2. THE 6 MODULAR CANVASES & EVENT COMMAND LISTS           -->
                <!-- ========================================================= -->
                <div style="display:flex; flex-direction:column; gap:16px;">
                    
                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 1: PRE CONDITION                                -->
                    <!-- ---------------------------------------------------- -->
                    <div id="becSec_pre" style="background:rgba(15,23,42,0.6); border:1px solid #0284c7; border-radius:8px; padding:12px 14px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #334155; padding-bottom:6px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:1.1rem;">${pai('target')}</span>
                                <div>
                                    <strong style="color:#38bdf8; font-size:0.88rem;">1. PRE CONDITION (Targeting, CTB Speed &amp; Cast Timing)</strong>
                                    <div style="font-size:0.7rem; color:var(--text-muted);">Skill target restrictions, CTB casting speeds, and cast animation notetags.</div>
                                </div>
                            </div>
                            <span class="badge" style="background:#07598544; color:#7dd3fc; font-size:0.7rem;">Notetags &amp; Pre-Tags</span>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">Custom Target Selection Scope:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#38bdf8;" onchange="onBecStateFieldChange('pre', 'targetScope', this.value)">
                                    <option value="" ${!state.pre.targetScope ? 'selected' : ''}>-- Default RPG Maker MV Scope --</option>
                                    <option value="All Foes" ${state.pre.targetScope === 'All Foes' ? 'selected' : ''}>All Foes (Yanfly Scope)</option>
                                    <option value="Random 2 Foes" ${state.pre.targetScope === 'Random 2 Foes' ? 'selected' : ''}>Random 2 Foes</option>
                                    <option value="Random 3 Foes" ${state.pre.targetScope === 'Random 3 Foes' ? 'selected' : ''}>Random 3 Foes</option>
                                    <option value="All Allies" ${state.pre.targetScope === 'All Allies' ? 'selected' : ''}>All Allies</option>
                                    <option value="All Allies But User" ${state.pre.targetScope === 'All Allies But User' ? 'selected' : ''}>All Allies Except User</option>
                                    <option value="Everybody" ${state.pre.targetScope === 'Everybody' ? 'selected' : ''}>Everybody (All Battlers)</option>
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;Target: scope&gt;</div>
                            </div>

                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">Selectable Side Restriction:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#38bdf8;" onchange="onBecStateFieldChange('pre', 'selectSide', this.value)">
                                    <option value="" ${!state.pre.selectSide ? 'selected' : ''}>-- Normal Scope Restrictions --</option>
                                    <option value="Select Foes" ${state.pre.selectSide === 'Select Foes' ? 'selected' : ''}>Select Foes Only</option>
                                    <option value="Select Allies" ${state.pre.selectSide === 'Select Allies' ? 'selected' : ''}>Select Allies Only</option>
                                    <option value="Select Dead Allies" ${state.pre.selectSide === 'Select Dead Allies' ? 'selected' : ''}>Select Dead Allies (Revive)</option>
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;Select Foes/Allies&gt;</div>
                            </div>

                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">Instant Cast Execution:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#38bdf8;" onchange="onBecStateFieldChange('pre', 'instantCast', this.value)">
                                    <option value="" ${!state.pre.instantCast ? 'selected' : ''}>-- Normal Turn Consumption --</option>
                                    <option value="free" ${state.pre.instantCast === 'free' ? 'selected' : ''}>Instant Cast (Does NOT consume turn)</option>
                                    <option value="turn" ${state.pre.instantCast === 'turn' ? 'selected' : ''}>Instant Cast: Turn (Per-turn limited)</option>
                                    <option value="no_instant" ${state.pre.instantCast === 'no_instant' ? 'selected' : ''}>Prohibit Instant Cast</option>
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;Instant Cast&gt;</div>
                            </div>

                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">CTB Charging Speed Mod:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#38bdf8;" onchange="onBecStateFieldChange('pre', 'ctbSpeed', this.value)">
                                    <option value="" ${!state.pre.ctbSpeed ? 'selected' : ''}>-- Normal CTB Speed (100%) --</option>
                                    <option value="200%" ${state.pre.ctbSpeed === '200%' ? 'selected' : ''}>Fast Cast (200% CTB Speed)</option>
                                    <option value="150%" ${state.pre.ctbSpeed === '150%' ? 'selected' : ''}>Quick Cast (150% CTB Speed)</option>
                                    <option value="75%" ${state.pre.ctbSpeed === '75%' ? 'selected' : ''}>Slight Cast Delay (75% CTB Speed)</option>
                                    <option value="50%" ${state.pre.ctbSpeed === '50%' ? 'selected' : ''}>Heavy Cast Delay (50% CTB Speed)</option>
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;CTB Speed: x%&gt;</div>
                            </div>

                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">Chanting / Cast Animation ID:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#c084fc;" onchange="onBecStateFieldChange('pre', 'castAnim', parseInt(this.value, 10))">
                                    <option value="0" ${!state.pre.castAnim ? 'selected' : ''}>-- No Cast Animation (0) --</option>
                                    ${animList.map(a => `
                                        <option value="${a.id}" ${state.pre.castAnim === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>
                                    `).join('')}
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;Cast Animation: id&gt;</div>
                            </div>

                            <div>
                                <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:3px;">Target HP Threshold Condition:</label>
                                <select class="form-control" style="font-size:0.78rem; padding:4px 8px; color:#38bdf8;" onchange="onBecStateFieldChange('pre', 'hpThreshold', this.value)">
                                    <option value="" ${!state.pre.hpThreshold ? 'selected' : ''}>-- None / No HP Condition --</option>
                                    <option value="below_25%" ${state.pre.hpThreshold === 'below_25%' ? 'selected' : ''}>Target HP Below 25% (Critical)</option>
                                    <option value="below_50%" ${state.pre.hpThreshold === 'below_50%' ? 'selected' : ''}>Target HP Below 50% (Half HP)</option>
                                    <option value="above_50%" ${state.pre.hpThreshold === 'above_50%' ? 'selected' : ''}>Target HP Above 50%</option>
                                    <option value="above_80%" ${state.pre.hpThreshold === 'above_80%' ? 'selected' : ''}>Target HP Above 80% (Pristine)</option>
                                </select>
                                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">Notetag: &lt;Select HP Below/Above: x%&gt;</div>
                            </div>
                        </div>
                    </div>

                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 2: SETUP ACTION CANVAS                          -->
                    <!-- ---------------------------------------------------- -->
                    ${renderBecActionCanvas({
                        phaseKey: 'setup',
                        title: '2. SETUP ACTION (Stage Setup & Opening Choreography)',
                        desc: 'Opening commands before user strikes. Camera framing, immortal lock, opening steps, and battle log.',
                        tag: '<setup action>',
                        borderColor: '#9333ea',
                        headerColor: '#c084fc',
                        badgeBg: '#581c8744',
                        badgeColor: '#d8b4fe',
                        icon: pai('user'),
                        commands: state.setupCommands,
                        presetTypes: ['standard_start']
                    })}

                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 3: WHOLE ACTION CANVAS                          -->
                    <!-- ---------------------------------------------------- -->
                    ${renderBecActionCanvas({
                        phaseKey: 'whole',
                        title: '3. WHOLE ACTION (Mass AoE & Arena Atmosphere)',
                        desc: 'Collective action before striking individual targets. Ideal for weather effects, meteor storm, or battlefield-wide visuals.',
                        tag: '<whole action>',
                        borderColor: '#0284c7',
                        headerColor: '#38bdf8',
                        badgeBg: '#07598544',
                        badgeColor: '#7dd3fc',
                        icon: pai('earth'),
                        commands: state.wholeCommands,
                        presetTypes: ['aoe_blast', 'dark_arena']
                    })}

                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 4: TARGET ACTION CANVAS                         -->
                    <!-- ---------------------------------------------------- -->
                    ${renderBecActionCanvas({
                        phaseKey: 'target',
                        title: '4. TARGET ACTION (Core Strike, Damage & Impact Reaction)',
                        desc: 'Main execution against targets: melee dashes, weapon swings, animation timing, damage effect, recoil, and fatal death fade.',
                        tag: '<target action>',
                        borderColor: '#dc2626',
                        headerColor: '#f87171',
                        badgeBg: '#7f1d1d44',
                        badgeColor: '#fca5a5',
                        icon: pai('sword'),
                        commands: state.targetCommands,
                        presetTypes: ['standard_melee', 'ranged_missile']
                    })}

                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 5: FOLLOW ACTION CANVAS                         -->
                    <!-- ---------------------------------------------------- -->
                    ${renderBecActionCanvas({
                        phaseKey: 'follow',
                        title: '5. FOLLOW ACTION (Follow-up Combo & Dramatic Pause)',
                        desc: 'Secondary effects, second burst animations, and freeze-frame dramatic pauses after the main hit.',
                        tag: '<follow action>',
                        borderColor: '#ca8a04',
                        headerColor: '#facc15',
                        badgeBg: '#713f1244',
                        badgeColor: '#fde047',
                        icon: pai('zap'),
                        commands: state.followCommands,
                        presetTypes: ['pause_20', 'extra_burst']
                    })}

                    <!-- ---------------------------------------------------- -->
                    <!-- FORM 6: FINISH ACTION CANVAS                         -->
                    <!-- ---------------------------------------------------- -->
                    ${renderBecActionCanvas({
                        phaseKey: 'finish',
                        title: '6. FINISH ACTION & POST EFFECT (Resolution, Return & Recovery)',
                        desc: 'Releasing immortal lock, returning to home position, resetting camera zoom, and CTB post-action cooldown.',
                        tag: '<finish action>',
                        borderColor: '#059669',
                        headerColor: '#34d399',
                        badgeBg: '#064e3b44',
                        badgeColor: '#a7f3d0',
                        icon: pai('flag'),
                        commands: state.finishCommands,
                        presetTypes: ['quick_return'],
                        extraHtml: `
                            <div style="margin-top:12px; padding-top:12px; border-top:1px dashed #334155; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
                                <div>
                                    <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Post-Action CTB Gauge (After CTB):</label>
                                    <select class="form-control" style="font-size:0.75rem; padding:3px 8px; color:#34d399;" onchange="onBecStateFieldChange('finish', 'afterCtb', this.value)">
                                        <option value="" ${!state.finish.afterCtb ? 'selected' : ''}>-- Default CTB Recovery --</option>
                                        <option value="80%" ${state.finish.afterCtb === '80%' ? 'selected' : ''}>Fast Recovery (80% Gauge Remaining)</option>
                                        <option value="50%" ${state.finish.afterCtb === '50%' ? 'selected' : ''}>Semi-Fast (50% Gauge Remaining)</option>
                                        <option value="0%" ${state.finish.afterCtb === '0%' ? 'selected' : ''}>Standard (0% Gauge Remaining)</option>
                                        <option value="-30%" ${state.finish.afterCtb === '-30%' ? 'selected' : ''}>Exhaustion (-30% Penalty)</option>
                                    </select>
                                    <div style="font-size:0.65rem; color:var(--text-muted);">&lt;After CTB: x%&gt;</div>
                                </div>
                                <div>
                                    <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Target Turn Shift (CTB Order):</label>
                                    <select class="form-control" style="font-size:0.75rem; padding:3px 8px; color:#34d399;" onchange="onBecStateFieldChange('finish', 'ctbOrderShift', this.value)">
                                        <option value="" ${!state.finish.ctbOrderShift ? 'selected' : ''}>-- Do Not Shift Target Turn --</option>
                                        <option value="-1" ${state.finish.ctbOrderShift === '-1' ? 'selected' : ''}>Delay Target Turn (-1 Order)</option>
                                        <option value="+1" ${state.finish.ctbOrderShift === '+1' ? 'selected' : ''}>Advance Target Turn (+1 Order)</option>
                                    </select>
                                    <div style="font-size:0.65rem; color:var(--text-muted);">&lt;CTB Order: +/-x&gt;</div>
                                </div>
                            </div>
                        `
                    })}

                </div>

                <!-- ========================================================= -->
                <!-- 3. RAW NOTETAG DRAWER                                     -->
                <!-- ========================================================= -->
                <details style="background:rgba(0,0,0,0.5); border:1px solid #334155; border-radius:8px; padding:10px 14px;">
                    <summary style="cursor:pointer; color:#94a3b8; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <span>${pai('notes')}</span> Raw Action Sequence Notetags View &amp; Direct Editor
                    </summary>
                    <div style="margin-top:10px;">
                        <textarea class="form-control" rows="8" style="font-family:monospace; font-size:0.78rem; width:100%; resize:vertical; background:#0b0f19; color:#a7f3d0;" onchange="onBecRawNoteChange(this.value)">${escapeHtml(skill.note || '')}</textarea>
                        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;">
                            ${pai('circle-info')} Tip: Perubahan di kanvas command list akan otomatis disinkronkan ke kotak teks notetag ini.
                        </div>
                    </div>
                </details>

            </div>
        </div>

        <!-- ============================================================= -->
        <!-- COMMAND PICKER & PARAMETER MODAL                              -->
        <!-- ============================================================= -->
        <div id="becCommandModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:99999; justify-content:center; align-items:center;">
            <div style="background:#0f172a; border:1px solid #8b5cf6; border-radius:10px; width:90%; max-width:580px; box-shadow:0 0 24px rgba(0,0,0,0.8); overflow:hidden; display:flex; flex-direction:column;">
                
                <!-- Modal Header -->
                <div style="background:linear-gradient(135deg, rgba(30,27,75,0.9) 0%, rgba(15,23,42,0.95) 100%); padding:12px 16px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="bec_modal_icon" style="font-size:1.2rem;">${pai('plus')}</span>
                        <strong id="bec_modal_title" style="color:#fff; font-size:0.9rem;">Tambah Perintah Action Sequence</strong>
                    </div>
                    <button type="button" onclick="closeBecCommandModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">${pai('close')}</button>
                </div>

                <!-- Modal Body -->
                <div style="padding:16px; display:flex; flex-direction:column; gap:14px; max-height:75vh; overflow-y:auto;">
                    
                    <!-- Command Type Selector -->
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:4px;">Pilih Jenis Perintah Action Sequence:</label>
                        <select id="bec_modal_cmd_type" class="form-control" style="font-size:0.8rem; padding:6px 10px; color:#38bdf8;" onchange="onBecModalCommandTypeChange(this.value)">
                            
                            <optgroup label="Pergerakan &amp; Posisi (Movement &amp; Position)">
                                <option value="move">Move Battler (user/target ke posisi tertentu)</option>
                                <option value="jump">Jump Battler (lompat di tempat / ke target)</option>
                                <option value="face">Face Battler (menghadap target / ke depan)</option>
                                <option value="opacity">Opacity / Fade Out / In (transparansi)</option>
                                <option value="perform_start">Perform Start (pose siap tempur default)</option>
                                <option value="perform_finish">Perform Finish (pose selesai serangan)</option>
                            </optgroup>

                            <optgroup label="Pose &amp; Animasi (Motion &amp; Animations)">
                                <option value="motion">Battler Motion (swing, thrust, chant, skill, damage...)</option>
                                <option value="action_animation">Action Animation (animasi skill dari database)</option>
                                <option value="attack_animation">Attack Animation (animasi senjata yang dipakai)</option>
                                <option value="direct_animation">Direct Animation ID (pilih ID animasi visual tertentu)</option>
                                <option value="cast_animation">Cast Animation (tampilkan animasi casting)</option>
                            </optgroup>

                            <optgroup label="Proyektil &amp; Serangan Jarak Jauh (Flying Projectile)">
                                <option value="projectile_weapon">Projectile Weapon (Otomatis Panah / Sihir Elemen)</option>
                                <option value="projectile_animation">Projectile Animation ID (Animasi Visual Meluncur ke Target)</option>
                                <option value="projectile_icon">Projectile Icon (Icon Panah / Baut / Pisau Meluncur)</option>
                                <option value="wait_projectile">Wait for Projectile (Tunggu Proyektil Mendarat di Target)</option>
                            </optgroup>

                            <optgroup label="Serangan, Efek &amp; Damage (Impact &amp; Damage)">
                                <option value="action_effect">Action Effect (eksekusi damage &amp; popup hit ke target)</option>
                                <option value="immortal">Immortal Lock (kunci HP agar target tidak mati prematur)</option>
                                <option value="collapse">Collapse (runtuhkan / matikan target)</option>
                                <option value="death_break">Death Break (hentikan jurus jika user tewas)</option>
                            </optgroup>

                            <optgroup label="Kamera &amp; Layar Dinamis (Camera &amp; Zoom)">
                                <option value="camera_focus">Camera Focus (fokus sorot kamera ke user/target)</option>
                                <option value="zoom">Zoom Screen (perbesar / perkecil skala layar)</option>
                                <option value="camera_clamp">Camera Clamp (matikan batasan pinggir layar)</option>
                                <option value="reset_camera_zoom">Reset Camera &amp; Zoom (kembalikan zoom &amp; kamera ke normal)</option>
                                <option value="reset_camera">Reset Camera Saja</option>
                                <option value="reset_zoom">Reset Zoom Saja</option>
                            </optgroup>

                            <optgroup label="Waktu &amp; Jeda (Timings &amp; Waits)">
                                <option value="wait">Wait (tahan / jeda sejumlah frames)</option>
                                <option value="wait_movement">Wait for Movement (tunggu battler selesai bergerak)</option>
                                <option value="wait_animation">Wait for Animation (tunggu animasi visual selesai)</option>
                                <option value="wait_effect">Wait for Effect (tunggu efek damage selesai)</option>
                                <option value="wait_camera">Wait for Camera (tunggu kamera selesai bergerak)</option>
                                <option value="wait_zoom">Wait for Zoom (tunggu zoom selesai)</option>
                            </optgroup>

                            <optgroup label="Efek Suasana &amp; Suara (Screen &amp; Audio)">
                                <option value="shake_screen">Shake Screen (guncang layar)</option>
                                <option value="flash_screen">Flash Screen (kilatan cahaya layar)</option>
                                <option value="tint_screen">Tint Screen (ubah warna suasana layar)</option>
                                <option value="se">Play Sound Effect (SE)</option>
                                <option value="clear_battle_log">Clear Battle Log (bersihkan teks log)</option>
                                <option value="display_action">Display Action (tampilkan banner nama skill)</option>
                            </optgroup>

                            <optgroup label="Logika Percabangan (Flow &amp; Branching)">
                                <option value="if_target_dead">IF: target.isDead() (jika target tewas)</option>
                                <option value="if_user_dead">IF: user.isDead() (jika user tewas)</option>
                                <option value="if_custom">IF: Kondisi Kustom (ekspresi JS)</option>
                                <option value="else">ELSE</option>
                                <option value="end">END (penutup blok IF)</option>
                            </optgroup>

                            <optgroup label="Perintah Bebas / Custom">
                                <option value="raw">Raw Command (ketik perintah Yanfly apa saja secara bebas)</option>
                            </optgroup>

                        </select>
                    </div>

                    <!-- Dynamic Parameter Fields Container -->
                    <div id="bec_modal_params" style="background:rgba(0,0,0,0.3); border:1px solid #334155; border-radius:6px; padding:12px;">
                        <!-- Injected dynamically via renderBecModalParams() -->
                    </div>

                    <!-- Live Code Preview Box -->
                    <div>
                        <label style="font-size:0.72rem; color:#94a3b8; font-weight:600; display:block; margin-bottom:3px;">Kode Yanfly Action Sequence yang Dihasilkan:</label>
                        <pre id="bec_modal_preview" style="background:#070b14; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-family:monospace; font-size:0.76rem; color:#4ade80; margin:0; min-height:36px; white-space:pre-wrap;"></pre>
                    </div>

                </div>

                <!-- Modal Footer -->
                <div style="background:#0b0f19; padding:10px 16px; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:8px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="closeBecCommandModal()" style="font-size:0.75rem; padding:5px 12px;">
                        Batal
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="saveBecCommandModal()" style="font-size:0.75rem; padding:5px 16px; font-weight:600; background:#8b5cf6;">
                        ${pai('check')} Simpan Perintah
                    </button>
                </div>

            </div>
        </div>
    `;
}

// ============================================================================
// 5. HELPER: RENDER ACTION CANVAS LIST
// ============================================================================

function renderBecActionCanvas(cfg) {
    const commands = cfg.commands || [];
    const hasCommands = commands.length > 0;

    let presetButtonsHtml = '';
    if (cfg.presetTypes && cfg.presetTypes.length > 0) {
        presetButtonsHtml = cfg.presetTypes.map(pt => {
            if (pt === 'standard_start') {
                return `<button type="button" class="btn btn-secondary btn-sm" onclick="applyBecPhasePreset('${cfg.phaseKey}', 'standard_start')" style="font-size:0.7rem; padding:2px 8px;" title="Muat Setup Standar: Perform Start">${pai('speed-fast')} Preset Default Start</button>`;
            } else if (pt === 'standard_melee') {
                return `<button type="button" class="btn btn-secondary btn-sm" onclick="applyBecPhasePreset('${cfg.phaseKey}', 'standard_melee')" style="font-size:0.7rem; padding:2px 8px;" title="Muat Melee Standar: Maju 15f, Tebas, Mundur">${pai('sword')} Preset Melee Normal</button>`;
            } else if (pt === 'ranged_missile') {
                return `<button type="button" class="btn btn-secondary btn-sm" onclick="applyBecPhasePreset('${cfg.phaseKey}', 'ranged_missile')" style="font-size:0.7rem; padding:2px 8px;" title="Muat Ranged Standar: Diam di tempat, Tembak Peluru">${pai('target')} Preset Ranged</button>`;
            } else if (pt === 'quick_return') {
                return `<button type="button" class="btn btn-secondary btn-sm" onclick="applyBecPhasePreset('${cfg.phaseKey}', 'quick_return')" style="font-size:0.7rem; padding:2px 8px;" title="Muat Return Standar">${pai('arrow-left')} Preset Return Fast</button>`;
            }
            return '';
        }).join('');
    }

    return `
        <div id="becSec_${cfg.phaseKey}" style="background:rgba(15,23,42,0.6); border:1px solid ${cfg.borderColor}; border-radius:8px; padding:12px 14px;">
            
            <!-- Canvas Header -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #334155; padding-bottom:6px; flex-wrap:wrap; gap:6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">${cfg.icon}</span>
                    <div>
                        <strong style="color:${cfg.headerColor}; font-size:0.88rem;">${cfg.title}</strong>
                        <div style="font-size:0.7rem; color:var(--text-muted);">${cfg.desc}</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span class="badge" style="background:${cfg.badgeBg}; color:${cfg.badgeColor}; font-size:0.7rem;">${cfg.tag}</span>
                    <span class="badge" style="background:rgba(0,0,0,0.4); color:#94a3b8; font-size:0.7rem;">${commands.length} Commands</span>
                </div>
            </div>

            <!-- Command List Container -->
            <div class="bec-canvas-body">
                ${!hasCommands ? `
                    <!-- Empty State -->
                    <div style="text-align:center; padding:18px 12px; background:rgba(15,23,42,0.3); border:1px dashed #334155; border-radius:6px; margin-bottom:8px;">
                        <div style="font-size:0.78rem; color:#64748b; margin-bottom:8px;">(Belum ada perintah aksi pada fase ini)</div>
                        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-primary btn-sm" onclick="openBecCommandModal('${cfg.phaseKey}')" style="font-size:0.75rem; padding:4px 12px;">
                                ${pai('plus')} Tambah Perintah Baru
                            </button>
                            ${presetButtonsHtml}
                        </div>
                    </div>
                ` : `
                    <!-- Populated Command List -->
                    <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:8px;">
                        ${commands.map((cmd, idx) => `
                            <div class="bec-cmd-row" 
                                 draggable="true" 
                                 data-phase="${cfg.phaseKey}" 
                                 data-index="${idx}"
                                 ondragstart="onBecCmdDragStart(event, '${cfg.phaseKey}', ${idx})"
                                 ondragover="onBecCmdDragOver(event)"
                                 ondragenter="onBecCmdDragEnter(event)"
                                 ondragleave="onBecCmdDragLeave(event)"
                                 ondrop="onBecCmdDrop(event, '${cfg.phaseKey}', ${idx})"
                                 ondragend="onBecCmdDragEnd(event)"
                                 style="display:flex; align-items:center; justify-content:space-between; background:rgba(15,23,42,0.7); border:1px solid #334155; border-radius:6px; padding:5px 10px; margin-left:${cmd.indent * 18}px; gap:8px;">
                                <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                                    <span class="bec-drag-handle" title="Tahan dan geser (Drag &amp; Drop) untuk mengubah urutan posisi" style="cursor:grab; color:#64748b; font-size:1rem; user-select:none; display:inline-flex; align-items:center; padding:0 2px;">
                                        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                            <circle cx="2.5" cy="2.5" r="1.3"/><circle cx="7.5" cy="2.5" r="1.3"/>
                                            <circle cx="2.5" cy="7" r="1.3"/><circle cx="7.5" cy="7" r="1.3"/>
                                            <circle cx="2.5" cy="11.5" r="1.3"/><circle cx="7.5" cy="11.5" r="1.3"/>
                                        </svg>
                                    </span>
                                    <span style="color:#64748b; font-size:0.72rem; min-width:20px;">${idx + 1}.</span>
                                    <span style="font-size:0.95rem;">${cmd.icon}</span>
                                    <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                        <span style="font-size:0.78rem; font-weight:600; color:${cmd.color};">${escapeHtml(cmd.display)}</span>
                                        <span style="font-size:0.67rem; color:#64748b; font-family:monospace; margin-left:8px;">${escapeHtml(cmd.raw)}</span>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openBecCommandModal('${cfg.phaseKey}', ${idx})" title="Edit Perintah" style="padding:2px 7px; font-size:0.7rem; color:#38bdf8;">${pai('edit')}</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="duplicateBecCommand('${cfg.phaseKey}', ${idx})" title="Duplikat Perintah" style="padding:2px 6px; font-size:0.7rem;">${pai('copy')}</button>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="deleteBecCommand('${cfg.phaseKey}', ${idx})" title="Hapus Perintah" style="padding:2px 6px; font-size:0.7rem; color:#ef4444;">${pai('trash')}</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Toolbar Below List -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; gap:8px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="openBecCommandModal('${cfg.phaseKey}')" style="font-size:0.75rem; padding:4px 12px; font-weight:600;">
                            ${pai('plus')} Tambah Perintah Baru
                        </button>
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            ${cfg.phaseKey === 'target' ? `
                                <select class="form-control" style="font-size:0.7rem; padding:2px 6px; width:auto; background:#1e1b4b; border-color:#818cf8; color:#c7d2fe; font-weight:600;" onchange="if(this.value){applyBecWeaponTypePreset(this.value); this.value='';}">
                                    <option value="">Preset Basic Attack Senjata...</option>
                                    <option value="long_sword">01. Long Sword (Heavy + Knockback)</option>
                                    <option value="sword">02. Sword (Slashing Dash)</option>
                                    <option value="gloves">03. Gloves (1-2x Multi-Punch)</option>
                                    <option value="spear">04. Spear (Leap Thrust + Knockback)</option>
                                    <option value="axe">05. Axe (Leap Heavy Chop + Knockback)</option>
                                    <option value="staff">06. Staff (Step, Chant &amp; Mana Bolt)</option>
                                    <option value="rune">07. Rune (1-2x Rune Magic Bolts)</option>
                                    <option value="long_bow">08. Long Bow (Draw &amp; Piercing Shot)</option>
                                    <option value="crossbow">09. Crossbow (1-3x Rapid Volley)</option>
                                    <option value="dagger">10. Dagger (Behind Shadowstep &amp; Dual)</option>
                                </select>
                            ` : ''}
                            ${presetButtonsHtml}
                            <button type="button" class="btn btn-secondary btn-sm" onclick="clearBecPhaseCommands('${cfg.phaseKey}')" style="font-size:0.7rem; padding:3px 8px; color:#f87171; border:1px solid #ef444433;" title="Kosongkan semua baris aksi fase ini">
                                ${pai('trash')} Kosongkan Fase
                            </button>
                        </div>
                    </div>
                `}

                ${cfg.extraHtml || ''}
            </div>

        </div>
    `;
}

// ============================================================================
// 6. FLOWCHART SUMMARY HELPERS
// ============================================================================

function getPreSummaryBadges(pre) {
    const list = [];
    if (pre.instantCast === 'free') list.push(`${pai('zap')} Instant`);
    else if (pre.instantCast === 'turn') list.push(`${pai('zap')} Instant(T)`);
    if (pre.ctbSpeed) list.push(`${pai('clock')} CTB ${pre.ctbSpeed}`);
    if (pre.targetScope) list.push(`${pai('target')} ${pre.targetScope}`);
    if (pre.castAnim > 0) list.push(`${pai('sparkles')} Cast #${pre.castAnim}`);
    if (list.length === 0) return '<span style="color:#64748b; font-style:italic;">(Standard MV)</span>';
    return list.slice(0, 3).join(', ') + (list.length > 3 ? ` (+${list.length - 3})` : '');
}

// ============================================================================
// 7. MODAL CONTROLLER & DYNAMIC PARAMETER FORMS (MANUAL NUMERICAL INPUTS)
// ============================================================================

let becActiveModal = {
    phaseKey: 'target',
    editIndex: null,
    cmdType: 'move'
};

function openBecCommandModal(phaseKey, editIndex) {
    becActiveModal.phaseKey = phaseKey || 'target';
    becActiveModal.editIndex = (typeof editIndex === 'number' && editIndex >= 0) ? editIndex : null;

    const modal = document.getElementById('becCommandModal');
    if (!modal) return;

    const isEdit = becActiveModal.editIndex !== null;
    const skill = getBecActiveSkill();
    const state = skill ? parseBecSkillState(skill.note || '') : null;
    const commands = (state && state[phaseKey + 'Commands']) ? state[phaseKey + 'Commands'] : [];

    let initialRaw = '';
    if (isEdit && commands[becActiveModal.editIndex]) {
        initialRaw = commands[becActiveModal.editIndex].raw || '';
    }

    // Tentukan command type awal
    let cmdType = 'move';
    if (isEdit) {
        cmdType = detectCommandTypeFromRaw(initialRaw);
    } else {
        if (phaseKey === 'setup') cmdType = 'zoom';
        else if (phaseKey === 'whole') cmdType = 'direct_animation';
        else if (phaseKey === 'target') cmdType = 'move';
        else if (phaseKey === 'follow') cmdType = 'wait';
        else if (phaseKey === 'finish') cmdType = 'reset_camera_zoom';
    }
    becActiveModal.cmdType = cmdType;

    // Update Header Modal
    const titleEl = document.getElementById('bec_modal_title');
    const iconEl = document.getElementById('bec_modal_icon');
    if (titleEl) titleEl.innerText = isEdit ? `Edit Perintah Aksi (Baris #${becActiveModal.editIndex + 1})` : `Tambah Perintah Baru ke ${phaseKey.toUpperCase()}`;
    if (iconEl) iconEl.innerHTML = isEdit ? pai('edit') : pai('plus');

    const typeSelect = document.getElementById('bec_modal_cmd_type');
    if (typeSelect) typeSelect.value = cmdType;

    // Render Form Parameter & Set Existing Values
    renderBecModalParams(cmdType, initialRaw);
    onBecModalParamChange();

    modal.style.display = 'flex';
}

function closeBecCommandModal() {
    const modal = document.getElementById('becCommandModal');
    if (modal) modal.style.display = 'none';
}

function detectCommandTypeFromRaw(raw) {
    raw = (raw || '').trim().toLowerCase();
    if (raw.startsWith('zoom:')) return 'zoom';
    if (raw.startsWith('camera focus:')) return 'camera_focus';
    if (raw.startsWith('camera clamp')) return 'camera_clamp';
    if (raw.startsWith('reset camera') && raw.includes('reset zoom')) return 'reset_camera_zoom';
    if (raw.startsWith('reset camera')) return 'reset_camera';
    if (raw.startsWith('reset zoom')) return 'reset_zoom';
    if (raw.startsWith('move ')) return 'move';
    if (raw.startsWith('jump ')) return 'jump';
    if (raw.startsWith('face ')) return 'face';
    if (raw.startsWith('opacity ')) return 'opacity';
    if (raw.startsWith('perform start')) return 'perform_start';
    if (raw.startsWith('perform finish')) return 'perform_finish';
    if (raw.startsWith('motion ')) return 'motion';
    if (raw.startsWith('attack animation:')) return 'attack_animation';
    if (raw.startsWith('action animation:')) return 'action_animation';
    if (raw.startsWith('animation ')) return 'direct_animation';
    if (raw.startsWith('cast animation')) return 'cast_animation';
    if (raw.startsWith('projectile weapon')) return 'projectile_weapon';
    if (raw.startsWith('projectile animation')) return 'projectile_animation';
    if (raw.startsWith('projectile icon')) return 'projectile_icon';
    if (raw.startsWith('wait for projectile')) return 'wait_projectile';
    if (raw.startsWith('action effect:')) return 'action_effect';
    if (raw.startsWith('immortal:')) return 'immortal';
    if (raw.startsWith('collapse:')) return 'collapse';
    if (raw.startsWith('death break')) return 'death_break';
    if (raw === 'wait for movement') return 'wait_movement';
    if (raw === 'wait for animation') return 'wait_animation';
    if (raw === 'wait for effect') return 'wait_effect';
    if (raw === 'wait for camera') return 'wait_camera';
    if (raw === 'wait for zoom') return 'wait_zoom';
    if (raw.startsWith('wait:')) return 'wait';
    if (raw.startsWith('shake screen:')) return 'shake_screen';
    if (raw.startsWith('flash screen:')) return 'flash_screen';
    if (raw.startsWith('tint screen:')) return 'tint_screen';
    if (raw.startsWith('se:')) return 'se';
    if (raw.startsWith('clear battle log')) return 'clear_battle_log';
    if (raw.startsWith('display action')) return 'display_action';
    if (raw.includes('target.isdead()')) return 'if_target_dead';
    if (raw.includes('user.isdead()')) return 'if_user_dead';
    if (raw.startsWith('if ')) return 'if_custom';
    if (raw === 'else') return 'else';
    if (raw === 'end') return 'end';
    return 'raw';
}

function onBecModalCommandTypeChange(cmdType) {
    becActiveModal.cmdType = cmdType;
    renderBecModalParams(cmdType, '');
    onBecModalParamChange();
}

// Render dynamic input fields based on command type
function renderBecModalParams(cmdType, existingRaw) {
    const container = document.getElementById('bec_modal_params');
    if (!container) return;

    let html = '';
    const animList = (State.animations || []).filter(a => a && a.id);

    switch (cmdType) {
        case 'zoom': {
            let scale = '150';
            let frames = '20';
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/zoom:\s*(\d+)%?,\s*(\d+)/i);
                if (m) { scale = m[1]; frames = m[2]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Skala Zoom (%):</label>
                        <input type="number" id="bec_p_zoom_scale" class="form-control" value="${scale}" min="10" max="500" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Ketik manual (misal: 150 = 150% zoom-in)</div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi Zoom (Frames):</label>
                        <input type="number" id="bec_p_zoom_frames" class="form-control" value="${frames}" min="0" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">60 frames = 1 detik</div>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_zoom_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for zoom</code> setelah baris ini</span>
                    </label>
                </div>
            `;
            break;
        }

        case 'camera_focus': {
            let target = 'target';
            let point = 'center';
            let frames = '15';
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/camera focus:\s*(\w+),\s*(\w+),\s*(\d+)/i);
                if (m) { target = m[1].toLowerCase(); point = m[2].toLowerCase(); frames = m[3]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Target Kamera:</label>
                        <select id="bec_p_cam_target" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="target" ${target === 'target' ? 'selected' : ''}>Target (Musuh)</option>
                            <option value="user" ${target === 'user' ? 'selected' : ''}>User (Karakter)</option>
                            <option value="targets" ${target === 'targets' ? 'selected' : ''}>Targets (Semua)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Titik Sorot:</label>
                        <select id="bec_p_cam_point" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="center" ${point === 'center' ? 'selected' : ''}>Center (Tengah)</option>
                            <option value="base" ${point === 'base' ? 'selected' : ''}>Base (Kaki)</option>
                            <option value="head" ${point === 'head' ? 'selected' : ''}>Head (Kepala)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_cam_frames" class="form-control" value="${frames}" min="0" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_cam_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for camera</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'move': {
            let subject = 'user';
            let dest = 'target';
            let pos = 'front';
            let offset = '18';
            let frames = '28';
            let hasWait = true;
            if (existingRaw) {
                const lower = existingRaw.toLowerCase();
                if (lower.includes('backward')) {
                    dest = 'backward';
                    const m = existingRaw.match(/move\s+(\w+):\s*backward(?:,\s*(\d+))?(?:,\s*(\d+))?/i);
                    if (m) {
                        subject = m[1].toLowerCase();
                        offset = m[2] || '40';
                        if (m[3]) frames = m[3];
                    }
                } else if (lower.includes('forward')) {
                    dest = 'forward';
                    const m = existingRaw.match(/move\s+(\w+):\s*forward(?:,\s*(\d+))?(?:,\s*(\d+))?/i);
                    if (m) {
                        subject = m[1].toLowerCase();
                        offset = m[2] || '30';
                        if (m[3]) frames = m[3];
                    }
                } else if (lower.includes('return') || lower.includes('home')) {
                    dest = 'home';
                    const m = existingRaw.match(/move\s+(\w+):\s*(?:return|home)(?:,\s*(\d+))?/i);
                    if (m) {
                        subject = m[1].toLowerCase();
                        if (m[2]) frames = m[2];
                    }
                } else {
                    const m = existingRaw.match(/move\s+(\w+):\s*(\w+),\s*(\w+),\s*(\d+)(?:,\s*(\d+))?/i);
                    if (m) {
                        subject = m[1].toLowerCase();
                        dest = m[2].toLowerCase();
                        pos = m[3].toLowerCase();
                        offset = m[4];
                        if (m[5]) frames = m[5];
                    }
                }
            }
            html = `
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
                    <div>
                        <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Subjek:</label>
                        <select id="bec_p_move_subject" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            <option value="user" ${subject === 'user' ? 'selected' : ''}>User</option>
                            <option value="target" ${subject === 'target' ? 'selected' : ''}>Target</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Tujuan:</label>
                        <select id="bec_p_move_dest" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            <option value="target" ${dest === 'target' ? 'selected' : ''}>Target (Musuh)</option>
                            <option value="home" ${dest === 'home' ? 'selected' : ''}>Home / Return (Posisi Awal)</option>
                            <option value="backward" ${dest === 'backward' ? 'selected' : ''}>Backward (Mundur / Knockback)</option>
                            <option value="forward" ${dest === 'forward' ? 'selected' : ''}>Forward (Maju)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Posisi Relatif:</label>
                        <select id="bec_p_move_pos" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            <option value="front" ${pos === 'front' ? 'selected' : ''}>Front (Depan)</option>
                            <option value="back" ${pos === 'back' ? 'selected' : ''}>Back (Belakang)</option>
                            <option value="center" ${pos === 'center' ? 'selected' : ''}>Center (Tengah)</option>
                            <option value="base" ${pos === 'base' ? 'selected' : ''}>Base (Bawah)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Offset Jarak (px):</label>
                        <input type="number" id="bec_p_move_offset" class="form-control" value="${offset}" style="font-size:0.78rem; padding:4px 6px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.73rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_move_frames" class="form-control" value="${frames}" min="0" max="600" style="font-size:0.78rem; padding:4px 6px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_move_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for movement</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'jump': {
            let subject = 'user';
            let height = '120';
            let frames = '15';
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/jump\s+(\w+):\s*(\d+),\s*(\d+)/i);
                if (m) { subject = m[1].toLowerCase(); height = m[2]; frames = m[3]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Subjek Lompat:</label>
                        <select id="bec_p_jump_subject" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="user" ${subject === 'user' ? 'selected' : ''}>User</option>
                            <option value="target" ${subject === 'target' ? 'selected' : ''}>Target</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Tinggi Lompatan (px):</label>
                        <input type="number" id="bec_p_jump_height" class="form-control" value="${height}" min="10" max="500" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_jump_frames" class="form-control" value="${frames}" min="1" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_jump_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for movement</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'projectile_weapon': {
            let start = 'user';
            let goal = 'target';
            let duration = '16';
            let arc = '25';
            let hasWait = true;
            if (existingRaw) {
                const mStart = existingRaw.match(/start\s+(\w+)/i);
                if (mStart) start = mStart[1].toLowerCase();
                const mGoal = existingRaw.match(/goal\s+(\w+)/i);
                if (mGoal) goal = mGoal[1].toLowerCase();
                const mDur = existingRaw.match(/dur(?:ation)?\s+(\d+)/i);
                if (mDur) duration = mDur[1];
                const mArc = existingRaw.match(/arc\s+([+-]?\d+)/i);
                if (mArc) arc = mArc[1];
            }
            html = `
                <div style="background:rgba(56,189,248,0.08); border:1px solid #38bdf833; border-radius:6px; padding:10px; margin-bottom:12px;">
                    <div style="font-size:0.78rem; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:6px;">
                        <span>${pai('speed-fast')}</span> Proyektil Otomatis Senjata (Adaptive Weapon Projectile)
                    </div>
                    <div style="font-size:0.68rem; color:#94a3b8; margin-top:2px;">
                        Secara otomatis mendeteksi tipe senjata (Bow = Panah, Crossbow = Baut cepat, Staff/Rune = Peluru Sihir Elemen sesuai atribut elemen senjata).
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Asal Peluncuran (Start):</label>
                        <select id="bec_p_proj_start" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="user" ${start === 'user' ? 'selected' : ''}>User (Karakter Penyerang)</option>
                            <option value="target" ${start === 'target' ? 'selected' : ''}>Target (Musuh)</option>
                            <option value="screen" ${start === 'screen' ? 'selected' : ''}>Screen (Tengah Layar)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Tujuan Meluncur (Goal):</label>
                        <select id="bec_p_proj_goal" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="target" ${goal === 'target' ? 'selected' : ''}>Target (Sasaran Serangan)</option>
                            <option value="user" ${goal === 'user' ? 'selected' : ''}>User (Kembali ke Karakter)</option>
                            <option value="screen" ${goal === 'screen' ? 'selected' : ''}>Screen (Tengah Layar)</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi Terbang (Frames):</label>
                        <input type="number" id="bec_p_proj_duration" class="form-control" value="${duration}" min="1" max="180" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">16f = ~0.26s, 12f = tembakan kilat</div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Ketinggian Lengkungan / Arc (px):</label>
                        <input type="number" id="bec_p_proj_arc" class="form-control" value="${arc}" min="-200" max="300" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">0 = Lurus / Laser, 25-35 = Melengkung ke atas</div>
                    </div>
                </div>
                <div style="margin-top:10px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_proj_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for projectile</code> (tunggu mendarat sebelum beri damage)</span>
                    </label>
                </div>
            `;
            break;
        }

        case 'projectile_animation': {
            let animId = '15';
            let start = 'user';
            let goal = 'target';
            let duration = '18';
            let arc = '20';
            let impact = '0';
            let hasWait = true;
            if (existingRaw) {
                const mAnim = existingRaw.match(/projectile\s+animation\s+(\d+)/i);
                if (mAnim) animId = mAnim[1];
                const mStart = existingRaw.match(/start\s+(\w+)/i);
                if (mStart) start = mStart[1].toLowerCase();
                const mGoal = existingRaw.match(/goal\s+(\w+)/i);
                if (mGoal) goal = mGoal[1].toLowerCase();
                const mDur = existingRaw.match(/dur(?:ation)?\s+(\d+)/i);
                if (mDur) duration = mDur[1];
                const mArc = existingRaw.match(/arc\s+([+-]?\d+)/i);
                if (mArc) arc = mArc[1];
                const mImp = existingRaw.match(/impact\s+(\d+)/i);
                if (mImp) impact = mImp[1];
            }
            html = `
                <div style="margin-bottom:10px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Pilih Animasi Database yang Meluncur:</label>
                    <select id="bec_p_proj_anim_id" class="form-control" style="font-size:0.8rem; padding:5px 8px; color:#a855f7; font-weight:600;" onchange="onBecModalParamChange()">
                        ${animList.map(a => `<option value="${a.id}" ${String(a.id) === String(animId) ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name || 'Unnamed')}</option>`).join('')}
                    </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Asal (Start):</label>
                        <select id="bec_p_proj_anim_start" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="user" ${start === 'user' ? 'selected' : ''}>User</option>
                            <option value="target" ${start === 'target' ? 'selected' : ''}>Target</option>
                            <option value="screen" ${start === 'screen' ? 'selected' : ''}>Screen</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Tujuan (Goal):</label>
                        <select id="bec_p_proj_anim_goal" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="target" ${goal === 'target' ? 'selected' : ''}>Target</option>
                            <option value="user" ${goal === 'user' ? 'selected' : ''}>User</option>
                            <option value="screen" ${goal === 'screen' ? 'selected' : ''}>Screen</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_proj_anim_dur" class="form-control" value="${duration}" min="1" max="180" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Lengkungan / Arc (px):</label>
                        <input type="number" id="bec_p_proj_anim_arc" class="form-control" value="${arc}" min="-200" max="300" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Impact Anim (Hit):</label>
                        <select id="bec_p_proj_anim_impact" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="0" ${impact === '0' ? 'selected' : ''}>-- Tanpa Impact --</option>
                            ${animList.map(a => `<option value="${a.id}" ${String(a.id) === String(impact) ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name || 'Unnamed')}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_proj_anim_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for projectile</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'projectile_icon': {
            let iconIndex = '161';
            let start = 'user';
            let goal = 'target';
            let duration = '16';
            let arc = '30';
            let rotate = true;
            let spin = '0';
            let impact = '0';
            let hasWait = true;
            if (existingRaw) {
                const mIcon = existingRaw.match(/projectile\s+icon\s+(\d+)/i);
                if (mIcon) iconIndex = mIcon[1];
                const mStart = existingRaw.match(/start\s+(\w+)/i);
                if (mStart) start = mStart[1].toLowerCase();
                const mGoal = existingRaw.match(/goal\s+(\w+)/i);
                if (mGoal) goal = mGoal[1].toLowerCase();
                const mDur = existingRaw.match(/dur(?:ation)?\s+(\d+)/i);
                if (mDur) duration = mDur[1];
                const mArc = existingRaw.match(/arc\s+([+-]?\d+)/i);
                if (mArc) arc = mArc[1];
                const mSpin = existingRaw.match(/spin\s+([+-]?\d+)/i);
                if (mSpin) spin = mSpin[1];
                const mImp = existingRaw.match(/impact\s+(\d+)/i);
                if (mImp) impact = mImp[1];
                if (existingRaw.includes('rotate false')) rotate = false;
            }
            html = `
                <div style="display:grid; grid-template-columns:120px 1fr; gap:12px; margin-bottom:10px; align-items:center;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Icon Index:</label>
                        <input type="number" id="bec_p_proj_icon_idx" class="form-control" value="${iconIndex}" min="0" max="3000" style="font-size:0.85rem; padding:5px 8px; color:#f97316; font-weight:700;" oninput="onBecModalParamChange()">
                    </div>
                    <div style="font-size:0.7rem; color:#94a3b8;">
                        Gunakan nomor IconSet (contoh: 161 = Panah, 198 = Crossbow Bolt, 165 = Pisau/Dagger, 176 = Shuriken).
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Asal (Start):</label>
                        <select id="bec_p_proj_icon_start" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="user" ${start === 'user' ? 'selected' : ''}>User</option>
                            <option value="target" ${start === 'target' ? 'selected' : ''}>Target</option>
                            <option value="screen" ${start === 'screen' ? 'selected' : ''}>Screen</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Tujuan (Goal):</label>
                        <select id="bec_p_proj_icon_goal" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="target" ${goal === 'target' ? 'selected' : ''}>Target</option>
                            <option value="user" ${goal === 'user' ? 'selected' : ''}>User</option>
                            <option value="screen" ${goal === 'screen' ? 'selected' : ''}>Screen</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_proj_icon_dur" class="form-control" value="${duration}" min="1" max="180" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Lengkungan / Arc (px):</label>
                        <input type="number" id="bec_p_proj_icon_arc" class="form-control" value="${arc}" min="-200" max="300" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Spin Speed (°/f):</label>
                        <input type="number" id="bec_p_proj_icon_spin" class="form-control" value="${spin}" min="0" max="180" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_proj_icon_rotate" ${rotate ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Auto-Rotate Tangent (Arahkan mata panah / ujung tombak mengikuti kurva terbang)</span>
                    </label>
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_proj_icon_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for projectile</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'wait_projectile': {
            html = `
                <div style="background:rgba(56,189,248,0.08); border:1px solid #38bdf833; border-radius:6px; padding:12px;">
                    <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        <span>${pai('clock')}</span> Wait for Projectile (Sinkronisasi Mendarat)
                    </div>
                    <div style="font-size:0.72rem; color:#cbd5e1; line-height:1.4;">
                        Perintah ini menahan eksekusi fase hingga seluruh proyektil atau anak panah yang meluncur di udara tiba di sasaran. Sangat penting diletakkan tepat sebelum perintah <code>action effect: target</code> agar damage dan animasi impact meletus tepat saat proyektil menabrak target!
                    </div>
                </div>
            `;
            break;
        }

        case 'wait': {
            let frames = '12';
            if (existingRaw) {
                const m = existingRaw.match(/wait:\s*(\d+)/i);
                if (m) frames = m[1];
            }
            html = `
                <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi Jeda (Frames):</label>
                    <input type="number" id="bec_p_wait_frames" class="form-control" value="${frames}" min="1" max="600" style="font-size:0.85rem; padding:6px 10px; width:100%; max-width:200px;" oninput="onBecModalParamChange()">
                    <div style="font-size:0.67rem; color:var(--text-muted); margin-top:3px;">Ketik manual nilai frame (misal: 12 frames, 20 frames, 60 frames = 1 detik).</div>
                </div>
            `;
            break;
        }

        case 'opacity': {
            let target = 'target';
            let opacity = '0';
            let frames = '50';
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/opacity\s+(\w+):\s*(\d+)%?,\s*(\d+)/i);
                if (m) { target = m[1].toLowerCase(); opacity = m[2]; frames = m[3]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Battler Target:</label>
                        <select id="bec_p_opacity_target" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="target" ${target === 'target' ? 'selected' : ''}>Target (Musuh)</option>
                            <option value="user" ${target === 'user' ? 'selected' : ''}>User (Karakter)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Nilai Opacity (%):</label>
                        <input type="number" id="bec_p_opacity_val" class="form-control" value="${opacity}" min="0" max="100" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">0% = Menghilang, 100% = Solid</div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_opacity_frames" class="form-control" value="${frames}" min="1" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_opacity_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for opacity</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'motion': {
            let pose = 'swing';
            let subject = 'user';
            if (existingRaw) {
                const m = existingRaw.match(/motion\s+(\w+):\s*(\w+)/i);
                if (m) { pose = m[1].toLowerCase(); subject = m[2].toLowerCase(); }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Pose Motion Sideview:</label>
                        <select id="bec_p_motion_pose" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="swing" ${pose === 'swing' ? 'selected' : ''}>Swing (Tebasan Senjata)</option>
                            <option value="thrust" ${pose === 'thrust' ? 'selected' : ''}>Thrust (Tusukan Tombak/Pedang)</option>
                            <option value="missile" ${pose === 'missile' ? 'selected' : ''}>Missile (Menembak / Memanah)</option>
                            <option value="skill" ${pose === 'skill' ? 'selected' : ''}>Skill (Pose Jurus)</option>
                            <option value="spell" ${pose === 'spell' ? 'selected' : ''}>Spell (Lepaskan Mantra)</option>
                            <option value="chant" ${pose === 'chant' ? 'selected' : ''}>Chant (Pose Merapal Sihir)</option>
                            <option value="damage" ${pose === 'damage' ? 'selected' : ''}>Damage (Flinch / Kena Serang)</option>
                            <option value="guard" ${pose === 'guard' ? 'selected' : ''}>Guard (Pose Bertahan)</option>
                            <option value="evade" ${pose === 'evade' ? 'selected' : ''}>Evade (Menghindar)</option>
                            <option value="wait" ${pose === 'wait' ? 'selected' : ''}>Wait (Stance Siaga)</option>
                            <option value="walk" ${pose === 'walk' ? 'selected' : ''}>Walk (Melangkah)</option>
                            <option value="victory" ${pose === 'victory' ? 'selected' : ''}>Victory (Pose Menang)</option>
                            <option value="escape" ${pose === 'escape' ? 'selected' : ''}>Escape (Pose Kabur)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Subjek Battler:</label>
                        <select id="bec_p_motion_subject" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="user" ${subject === 'user' ? 'selected' : ''}>User (Karakter Penyerang)</option>
                            <option value="target" ${subject === 'target' ? 'selected' : ''}>Target (Musuh)</option>
                        </select>
                    </div>
                </div>
            `;
            break;
        }

        case 'direct_animation': {
            let animId = '1';
            let target = 'target';
            let isMirror = false;
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/animation\s+(\d+):\s*(\w+)(?:,\s*(\w+))?/i);
                if (m) {
                    animId = m[1];
                    target = m[2].toLowerCase();
                    if (m[3] && m[3].toLowerCase() === 'mirror') isMirror = true;
                }
            }
            html = `
                <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Pilih Animasi Database:</label>
                        <select id="bec_p_anim_id" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            ${animList.map(a => `<option value="${a.id}" ${String(a.id) === String(animId) ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Target:</label>
                        <select id="bec_p_anim_target" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            <option value="target" ${target === 'target' ? 'selected' : ''}>Target</option>
                            <option value="user" ${target === 'user' ? 'selected' : ''}>User</option>
                            <option value="all targets" ${target === 'all targets' ? 'selected' : ''}>All Targets</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Mirror Visual:</label>
                        <select id="bec_p_anim_mirror" class="form-control" style="font-size:0.78rem; padding:4px 6px;" onchange="onBecModalParamChange()">
                            <option value="false" ${!isMirror ? 'selected' : ''}>Normal</option>
                            <option value="true" ${isMirror ? 'selected' : ''}>Mirror (Balik)</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_anim_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for animation</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'shake_screen': {
            let power = '3';
            let speed = '5';
            let duration = '12';
            if (existingRaw) {
                const m = existingRaw.match(/shake screen:\s*(\d+),\s*(\d+),\s*(\d+)/i);
                if (m) { power = m[1]; speed = m[2]; duration = m[3]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Power (Kekuatan):</label>
                        <input type="number" id="bec_p_shake_power" class="form-control" value="${power}" min="1" max="10" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Speed (Frekuensi):</label>
                        <input type="number" id="bec_p_shake_speed" class="form-control" value="${speed}" min="1" max="10" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_shake_frames" class="form-control" value="${duration}" min="1" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
            `;
            break;
        }

        case 'flash_screen': {
            let color = 'white';
            let duration = '10';
            if (existingRaw) {
                const m = existingRaw.match(/flash screen:\s*(\w+),\s*(\d+)/i);
                if (m) { color = m[1].toLowerCase(); duration = m[2]; }
            }
            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Warna Kilatan:</label>
                        <select id="bec_p_flash_color" class="form-control" style="font-size:0.8rem; padding:4px 8px;" onchange="onBecModalParamChange()">
                            <option value="white" ${color === 'white' ? 'selected' : ''}>Putih (White Flash)</option>
                            <option value="red" ${color === 'red' ? 'selected' : ''}>Merah Darah (Red Blood)</option>
                            <option value="blue" ${color === 'blue' ? 'selected' : ''}>Biru Energi (Blue)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi (Frames):</label>
                        <input type="number" id="bec_p_flash_frames" class="form-control" value="${duration}" min="1" max="600" style="font-size:0.8rem; padding:4px 8px;" oninput="onBecModalParamChange()">
                    </div>
                </div>
            `;
            break;
        }

        case 'reset_camera_zoom': {
            let frames = '30';
            let hasWait = true;
            if (existingRaw) {
                const m = existingRaw.match(/reset (?:camera|zoom):\s*(\d+)/i);
                if (m) frames = m[1];
            }
            html = `
                <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Durasi Reset Smooth (Frames):</label>
                    <input type="number" id="bec_p_reset_frames" class="form-control" value="${frames}" min="0" max="600" style="font-size:0.85rem; padding:6px 10px; width:100%; max-width:200px;" oninput="onBecModalParamChange()">
                    <div style="font-size:0.67rem; color:var(--text-muted); margin-top:3px;">Secara halus mengembalikan kamera dan zoom out ke ukuran normal (30 frames = 0.5 detik).</div>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.75rem; color:#cbd5e1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="bec_p_reset_wait" ${hasWait ? 'checked' : ''} onchange="onBecModalParamChange()">
                        <span>Otomatis sisipkan: <code>wait for camera</code> &amp; <code>wait for zoom</code></span>
                    </label>
                </div>
            `;
            break;
        }

        case 'if_custom': {
            let expr = 'user.isDualWield()';
            if (existingRaw) {
                const m = existingRaw.match(/if\s+(.*)/i);
                if (m) expr = m[1].trim();
            }
            html = `
                <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Kondisi IF (JavaScript Expression):</label>
                    <input type="text" id="bec_p_if_expr" class="form-control" value="${escapeHtml(expr)}" style="font-size:0.82rem; padding:5px 8px; font-family:monospace; color:#38bdf8;" oninput="onBecModalParamChange()">
                    <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px; margin-bottom:6px;">Klik salah satu shortcut kondisi umum di bawah:</div>
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                        <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.68rem; padding:2px 8px; color:#a7f3d0;" onclick="document.getElementById('bec_p_if_expr').value='user.isDualWield()'; onBecModalParamChange();">user.isDualWield()</button>
                        <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.68rem; padding:2px 8px; color:#fca5a5;" onclick="document.getElementById('bec_p_if_expr').value='target.isDead()'; onBecModalParamChange();">target.isDead()</button>
                        <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.68rem; padding:2px 8px; color:#fed7aa;" onclick="document.getElementById('bec_p_if_expr').value='user.hpRate() < 0.25'; onBecModalParamChange();">user.hpRate() &lt; 0.25</button>
                        <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.68rem; padding:2px 8px; color:#e9d5ff;" onclick="document.getElementById('bec_p_if_expr').value='user.agi >= 30 || user.atk >= 40'; onBecModalParamChange();">user.agi &gt;= 30 || user.atk &gt;= 40</button>
                    </div>
                </div>
            `;
            break;
        }

        case 'raw': {
            html = `
                <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">Perintah Yanfly Mentah (Raw Action Sequence Command):</label>
                    <input type="text" id="bec_p_raw_input" class="form-control" value="${escapeHtml(existingRaw || '')}" placeholder="contoh: se: SoundName, 80, 100, 0" style="font-size:0.85rem; padding:6px 10px; font-family:monospace;" oninput="onBecModalParamChange()">
                    <div style="font-size:0.67rem; color:var(--text-muted); margin-top:3px;">Anda dapat mengetik perintah Action Sequence Yanfly apa pun secara bebas.</div>
                </div>
            `;
            break;
        }

        default: {
            html = `
                <div style="font-size:0.78rem; color:#cbd5e1;">
                    Perintah <code>${cmdType}</code> tidak memerlukan parameter tambahan.
                </div>
            `;
            break;
        }
    }

    container.innerHTML = html;
}

// Build generated Yanfly action code lines based on current inputs
function buildModalYanflyLines() {
    const cmdType = becActiveModal.cmdType;
    const lines = [];

    switch (cmdType) {
        case 'zoom': {
            const scale = document.getElementById('bec_p_zoom_scale')?.value || '150';
            const frames = document.getElementById('bec_p_zoom_frames')?.value || '20';
            lines.push(`zoom: ${scale}%, ${frames}`);
            if (document.getElementById('bec_p_zoom_wait')?.checked) lines.push('wait for zoom');
            break;
        }
        case 'camera_focus': {
            const target = document.getElementById('bec_p_cam_target')?.value || 'target';
            const point = document.getElementById('bec_p_cam_point')?.value || 'center';
            const frames = document.getElementById('bec_p_cam_frames')?.value || '15';
            lines.push(`camera focus: ${target}, ${point}, ${frames}`);
            if (document.getElementById('bec_p_cam_wait')?.checked) lines.push('wait for camera');
            break;
        }
        case 'camera_clamp': {
            lines.push('camera clamp off');
            break;
        }
        case 'reset_camera_zoom': {
            const frames = document.getElementById('bec_p_reset_frames')?.value || '30';
            lines.push(`reset camera: ${frames}\nreset zoom: ${frames}`);
            if (document.getElementById('bec_p_reset_wait')?.checked) lines.push('wait for camera\nwait for zoom');
            break;
        }
        case 'reset_camera': {
            lines.push('reset camera: 20\nwait for camera');
            break;
        }
        case 'reset_zoom': {
            lines.push('reset zoom: 20\nwait for zoom');
            break;
        }
        case 'move': {
            const subject = document.getElementById('bec_p_move_subject')?.value || 'user';
            const dest = document.getElementById('bec_p_move_dest')?.value || 'target';
            const pos = document.getElementById('bec_p_move_pos')?.value || 'front';
            const offset = document.getElementById('bec_p_move_offset')?.value || '18';
            const frames = document.getElementById('bec_p_move_frames')?.value || '28';
            if (dest === 'home') {
                lines.push(`move ${subject}: return, ${frames}`);
            } else if (dest === 'backward') {
                lines.push(`move ${subject}: backward, ${offset}, ${frames}`);
            } else if (dest === 'forward') {
                lines.push(`move ${subject}: forward, ${offset}, ${frames}`);
            } else {
                lines.push(`move ${subject}: ${dest}, ${pos}, ${offset}, ${frames}`);
            }
            if (document.getElementById('bec_p_move_wait')?.checked) lines.push('wait for movement');
            break;
        }
        case 'jump': {
            const subject = document.getElementById('bec_p_jump_subject')?.value || 'user';
            const height = document.getElementById('bec_p_jump_height')?.value || '120';
            const frames = document.getElementById('bec_p_jump_frames')?.value || '15';
            lines.push(`jump ${subject}: ${height}, ${frames}`);
            if (document.getElementById('bec_p_jump_wait')?.checked) lines.push('wait for movement');
            break;
        }
        case 'face': {
            lines.push('face user: forward');
            break;
        }
        case 'opacity': {
            const target = document.getElementById('bec_p_opacity_target')?.value || 'target';
            const opacity = document.getElementById('bec_p_opacity_val')?.value || '0';
            const frames = document.getElementById('bec_p_opacity_frames')?.value || '50';
            lines.push(`opacity ${target}: ${opacity}%, ${frames}`);
            if (document.getElementById('bec_p_opacity_wait')?.checked) lines.push('wait for opacity');
            break;
        }
        case 'perform_start': lines.push('perform start\nwait for movement'); break;
        case 'perform_finish': lines.push('perform finish'); break;
        case 'motion': {
            const pose = document.getElementById('bec_p_motion_pose')?.value || 'swing';
            const subject = document.getElementById('bec_p_motion_subject')?.value || 'user';
            lines.push(`motion ${pose}: ${subject}`);
            break;
        }
        case 'action_animation': lines.push('action animation: target\nwait for animation'); break;
        case 'attack_animation': lines.push('attack animation: target\nwait for animation'); break;
        case 'direct_animation': {
            const animId = document.getElementById('bec_p_anim_id')?.value || '1';
            const target = document.getElementById('bec_p_anim_target')?.value || 'target';
            const isMirror = document.getElementById('bec_p_anim_mirror')?.value === 'true';
            lines.push(`animation ${animId}: ${target}${isMirror ? ', mirror' : ''}`);
            if (document.getElementById('bec_p_anim_wait')?.checked) lines.push('wait for animation');
            break;
        }
        case 'cast_animation': lines.push('cast animation\nwait for animation'); break;
        case 'action_effect': lines.push('action effect: target\nwait for effect'); break;
        case 'immortal': lines.push('immortal: targets, true'); break;
        case 'collapse': lines.push('collapse: target, force\nwait: 15'); break;
        case 'death_break': lines.push('death break'); break;
        case 'projectile_weapon': {
            const start = document.getElementById('bec_p_proj_start')?.value || 'user';
            const goal = document.getElementById('bec_p_proj_goal')?.value || 'target';
            const dur = document.getElementById('bec_p_proj_duration')?.value || '16';
            const arc = document.getElementById('bec_p_proj_arc')?.value || '25';
            lines.push(`projectile weapon: start ${start}, goal ${goal}, duration ${dur}, arc ${arc}`);
            if (document.getElementById('bec_p_proj_wait')?.checked) lines.push('wait for projectile');
            break;
        }
        case 'projectile_animation': {
            const animId = document.getElementById('bec_p_proj_anim_id')?.value || '15';
            const start = document.getElementById('bec_p_proj_anim_start')?.value || 'user';
            const goal = document.getElementById('bec_p_proj_anim_goal')?.value || 'target';
            const dur = document.getElementById('bec_p_proj_anim_dur')?.value || '18';
            const arc = document.getElementById('bec_p_proj_anim_arc')?.value || '20';
            const impact = document.getElementById('bec_p_proj_anim_impact')?.value || '0';
            let line = `projectile animation ${animId}: start ${start}, goal ${goal}, duration ${dur}, arc ${arc}`;
            if (impact && impact !== '0') line += `, impact ${impact}`;
            lines.push(line);
            if (document.getElementById('bec_p_proj_anim_wait')?.checked) lines.push('wait for projectile');
            break;
        }
        case 'projectile_icon': {
            const iconIdx = document.getElementById('bec_p_proj_icon_idx')?.value || '161';
            const start = document.getElementById('bec_p_proj_icon_start')?.value || 'user';
            const goal = document.getElementById('bec_p_proj_icon_goal')?.value || 'target';
            const dur = document.getElementById('bec_p_proj_icon_dur')?.value || '16';
            const arc = document.getElementById('bec_p_proj_icon_arc')?.value || '30';
            const spin = document.getElementById('bec_p_proj_icon_spin')?.value || '0';
            const rotate = document.getElementById('bec_p_proj_icon_rotate')?.checked;
            let line = `projectile icon ${iconIdx}: start ${start}, goal ${goal}, duration ${dur}, arc ${arc}`;
            if (rotate) line += ', rotate';
            if (spin && spin !== '0') line += `, spin ${spin}`;
            lines.push(line);
            if (document.getElementById('bec_p_proj_icon_wait')?.checked) lines.push('wait for projectile');
            break;
        }
        case 'wait_projectile': {
            lines.push('wait for projectile');
            break;
        }

        case 'wait': {
            const frames = document.getElementById('bec_p_wait_frames')?.value || '12';
            lines.push(`wait: ${frames}`);
            break;
        }
        case 'wait_movement': lines.push('wait for movement'); break;
        case 'wait_animation': lines.push('wait for animation'); break;
        case 'wait_effect': lines.push('wait for effect'); break;
        case 'wait_camera': lines.push('wait for camera'); break;
        case 'wait_zoom': lines.push('wait for zoom'); break;
        case 'shake_screen': {
            const p = document.getElementById('bec_p_shake_power')?.value || '3';
            const s = document.getElementById('bec_p_shake_speed')?.value || '5';
            const d = document.getElementById('bec_p_shake_frames')?.value || '12';
            lines.push(`shake screen: ${p}, ${s}, ${d}`);
            break;
        }
        case 'flash_screen': {
            const color = document.getElementById('bec_p_flash_color')?.value || 'white';
            const d = document.getElementById('bec_p_flash_frames')?.value || '10';
            lines.push(`flash screen: ${color}, ${d}`);
            break;
        }
        case 'tint_screen': lines.push('tint screen: dark, 20'); break;
        case 'se': lines.push('se: Blow1, 80, 100, 0'); break;
        case 'clear_battle_log': lines.push('clear battle log'); break;
        case 'display_action': lines.push('display action'); break;
        case 'if_target_dead': lines.push('if target.isDead()'); break;
        case 'if_user_dead': lines.push('if user.isDead()'); break;
        case 'if_custom': {
            const expr = document.getElementById('bec_p_if_expr')?.value || 'user.isDualWield()';
            lines.push(`if ${expr.trim()}`);
            break;
        }
        case 'else': lines.push('else'); break;
        case 'end': lines.push('end'); break;

        case 'raw': {
            const rawVal = document.getElementById('bec_p_raw_input')?.value || '';
            if (rawVal.trim()) lines.push(rawVal.trim());
            break;
        }
    }

    return lines.join('\n');
}

function onBecModalParamChange() {
    const previewEl = document.getElementById('bec_modal_preview');
    if (!previewEl) return;
    const code = buildModalYanflyLines();
    previewEl.innerText = code || '(Kosong)';
}

function saveBecCommandModal() {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const code = buildModalYanflyLines();
    if (!code.trim()) {
        showToast('Tidak ada baris perintah yang dihasilkan.', 'warning');
        return;
    }

    const state = parseBecSkillState(skill.note || '');
    const phaseKey = becActiveModal.phaseKey || 'target';
    const commandsKey = phaseKey + 'Commands';
    const newCmds = parseActionBlockCommands(code);

    if (becActiveModal.editIndex !== null && becActiveModal.editIndex >= 0) {
        // Mode Edit: Ganti baris pada index tersebut
        state[commandsKey].splice(becActiveModal.editIndex, 1, ...newCmds);
    } else {
        // Mode Tambah Baru: Sisipkan di akhir list
        state[commandsKey].push(...newCmds);
    }

    // Generate notetag baru dan simpan
    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    closeBecCommandModal();
    renderEditor();
    showToast(`Perintah berhasil disimpan ke ${phaseKey.toUpperCase()}!`, 'success');
}

// ============================================================================
// 8. LIST ROW ACTIONS: DRAG & DROP REORDER, DUPLICATE, DELETE, PRESETS
// ============================================================================

let _becDragState = null;

function onBecCmdDragStart(event, phaseKey, index) {
    _becDragState = { phaseKey, index };
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify({ phaseKey, index }));
    }
    const rowEl = event.currentTarget;
    if (rowEl) {
        setTimeout(() => rowEl.classList.add('bec-dragging'), 0);
    }
}

function onBecCmdDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
    const rowEl = event.currentTarget;
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    const isBottom = event.clientY > (rect.top + rect.height / 2);
    rowEl.classList.toggle('bec-drag-over-top', !isBottom);
    rowEl.classList.toggle('bec-drag-over-bottom', isBottom);
}

function onBecCmdDragEnter(event) {
    event.preventDefault();
}

function onBecCmdDragLeave(event) {
    const rowEl = event.currentTarget;
    if (rowEl) {
        rowEl.classList.remove('bec-drag-over-top', 'bec-drag-over-bottom');
    }
}

function onBecCmdDrop(event, targetPhase, targetIndex) {
    event.preventDefault();
    const rowEl = event.currentTarget;
    if (rowEl) {
        rowEl.classList.remove('bec-drag-over-top', 'bec-drag-over-bottom');
    }

    let srcPhase = _becDragState ? _becDragState.phaseKey : null;
    let srcIndex = _becDragState ? _becDragState.index : -1;

    if (!srcPhase || srcIndex < 0) {
        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain') || '{}');
            srcPhase = data.phaseKey;
            srcIndex = data.index;
        } catch (e) {}
    }

    if (srcPhase !== targetPhase || srcIndex < 0) return;

    const rect = rowEl ? rowEl.getBoundingClientRect() : null;
    const isBottom = rect ? (event.clientY > (rect.top + rect.height / 2)) : false;

    let destinationIndex = isBottom ? targetIndex + 1 : targetIndex;
    if (srcIndex < destinationIndex) {
        destinationIndex--; // Compensate for item removed earlier in array
    }

    if (srcIndex !== destinationIndex) {
        reorderBecCommand(targetPhase, srcIndex, destinationIndex);
    }
}

function onBecCmdDragEnd(event) {
    _becDragState = null;
    document.querySelectorAll('.bec-cmd-row').forEach(el => {
        el.classList.remove('bec-dragging', 'bec-drag-over-top', 'bec-drag-over-bottom');
    });
}

function reorderBecCommand(phaseKey, fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    const commands = state[phaseKey + 'Commands'] || [];
    if (fromIndex < 0 || fromIndex >= commands.length) return;
    if (toIndex < 0 || toIndex >= commands.length) return;

    const [moved] = commands.splice(fromIndex, 1);
    commands.splice(toIndex, 0, moved);

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Urutan perintah baris #${fromIndex + 1} dipindah ke baris #${toIndex + 1}!`, 'info');
    }
}

function moveBecCommand(phaseKey, index, direction) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    const commands = state[phaseKey + 'Commands'] || [];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= commands.length) return;

    const temp = commands[index];
    commands[index] = commands[targetIdx];
    commands[targetIdx] = temp;

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
}

function duplicateBecCommand(phaseKey, index) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    const commands = state[phaseKey + 'Commands'] || [];
    if (!commands[index]) return;

    const clone = JSON.parse(JSON.stringify(commands[index]));
    clone.id = 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    commands.splice(index + 1, 0, clone);

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast('Perintah berhasil diduplikasi!', 'info');
}

function deleteBecCommand(phaseKey, index) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    const commands = state[phaseKey + 'Commands'] || [];
    if (!commands[index]) return;

    commands.splice(index, 1);
    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast('Perintah dihapus dari list!', 'info');
}

function clearBecPhaseCommands(phaseKey) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    if (!confirm(`Kosongkan semua baris aksi pada fase ${phaseKey.toUpperCase()}?`)) return;

    const state = parseBecSkillState(skill.note || '');
    state[phaseKey + 'Commands'] = [];
    if (state[phaseKey]) state[phaseKey]['has' + phaseKey.charAt(0).toUpperCase() + phaseKey.slice(1)] = false;

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast(`Fase ${phaseKey.toUpperCase()} berhasil dikosongkan!`, 'success');
}

function applyBecPhasePreset(phaseKey, presetType) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    let code = '';

    if (presetType === 'cinematic_setup') {
        code = 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\nzoom: 150%, 30\ncamera focus: user, center, 30\nwait for camera\nwait for zoom\nwait: 10';
    } else if (presetType === 'standard_start') {
        code = 'clear battle log\ndisplay action\nimmortal: targets, true\nperform start\nwait for movement';
    } else if (presetType === 'cinematic_target') {
        code = 'move user: target, front, 18, 28\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\ncamera focus: target, center, 15\nwait for camera\nmotion damage: target\nshake screen: 3, 5, 12\nwait for effect\nwait: 20\nif target.isDead()\n  opacity target: 0%, 50\n  wait for opacity\n  collapse: target, force\n  wait: 15\nend\ncamera focus: user, center, 20\nwait for camera\nwait: 10';
    } else if (presetType === 'standard_melee') {
        code = 'move user: target, front, 18, 15\nwait for movement\nmotion swing: user\nattack animation: target\nwait for animation\naction effect: target\nwait for effect';
    } else if (presetType === 'ranged_missile') {
        code = 'motion missile: user\naction animation: target\nwait for animation\naction effect: target\nwait for effect';
    } else if (presetType === 'cinematic_finish') {
        code = 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log';
    } else if (presetType === 'quick_return') {
        code = 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 20\nreset zoom: 20\nwait for camera\nwait for zoom\nperform finish\nclear battle log';
    }

    state[phaseKey + 'Commands'] = parseActionBlockCommands(code);
    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast(`Preset ${presetType} berhasil dimuat ke ${phaseKey.toUpperCase()}!`, 'success');
}

const BEC_WEAPON_ATTACK_PRESETS = {
    long_sword: {
        id: 431,
        wtype: 1,
        name: 'Long Sword',
        label: '01. Long Sword (Heavy Dash + Knockback)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'move user: target, front, 18, 20\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 12\nmove target: backward, 45, 8\nwait: 8\nmove target: home, 8\nwait: 10',
        finish: 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    sword: {
        id: 432,
        wtype: 2,
        name: 'Sword',
        label: '02. Sword (Slashing Dash)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'move user: target, front, 18, 14\nwait for movement\nmotion swing: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 8\nwait: 12',
        finish: 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    gloves: {
        id: 433,
        wtype: 3,
        name: 'Gloves',
        label: '03. Gloves (1-2x Multi-Punch Dual-Wield)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'move user: target, front, 14, 12\nwait for movement\nmotion thrust: user\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 10\nif user.isDualWield()\n  motion swing: user\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 3, 5, 8\n  wait: 10\nend\nwait: 8',
        finish: 'immortal: targets, false\nmove user: return, 14\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    spear: {
        id: 434,
        wtype: 4,
        name: 'Spear',
        label: '04. Spear (Leap Thrust + Knockback)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'jump user: 120, 16\nmove user: target, front, 24, 16\nwait for movement\nmotion thrust: user\nwait: 8\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 10\nmove target: backward, 50, 8\nwait: 8\nmove target: home, 8\nwait: 10',
        finish: 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    axe: {
        id: 435,
        wtype: 5,
        name: 'Axe',
        label: '05. Axe (Leap Heavy Chop + Knockback)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'jump user: 140, 18\nmove user: target, front, 18, 18\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 4, 6, 14\nmove target: backward, 60, 8\nwait: 8\nmove target: home, 8\nwait: 12',
        finish: 'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    staff: {
        id: 436,
        wtype: 6,
        name: 'Staff',
        label: '06. Staff (Step, Chant Arc & Mana Bolt)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'move user: forward, 30, 12\nwait for movement\nmotion chant: user\ncast animation\nwait: 16\nmotion swing: user\nwait: 6\nprojectile weapon: start user, goal target, duration 18, arc 20\nwait for projectile\nattack animation: target\nwait for animation\ncamera focus: target, center, 15\nwait for camera\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 8\nwait: 15',
        finish: 'immortal: targets, false\nmove user: home, 12\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    rune: {
        id: 437,
        wtype: 7,
        name: 'Rune',
        label: '07. Rune (Step, 1-2x Rune Magic Bolts)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'move user: forward, 25, 12\nwait for movement\nmotion chant: user\ncast animation\nwait: 14\nmotion spell: user\nwait: 8\nprojectile weapon: start user, goal target, duration 16, arc 25\nwait for projectile\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 8\nif user.isDualWield()\n  motion spell: user\n  projectile weapon: start user, goal target, duration 16, arc -20\n  wait for projectile\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 2, 4, 6\n  wait: 8\nend\nwait: 10',
        finish: 'immortal: targets, false\nmove user: home, 12\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    long_bow: {
        id: 438,
        wtype: 8,
        name: 'Long Bow',
        label: '08. Long Bow (Stationary Draw & Piercing Arrow)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'motion chant: user\nwait: 14\nmotion missile: user\nwait: 6\nprojectile weapon: start user, goal target, duration 16, arc 35\nwait for projectile\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 10\nmove target: backward, 40, 8\nwait: 8\nmove target: home, 8\nwait: 12',
        finish: 'immortal: targets, false\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    crossbow: {
        id: 439,
        wtype: 9,
        name: 'Crossbow',
        label: '09. Crossbow (Stationary 1-3x Rapid Volley)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'motion missile: user\nprojectile weapon: start user, goal target, duration 12, arc 15\nwait for projectile\nattack animation: target\nwait: 4\naction effect: target\nmotion damage: target\nshake screen: 1, 3, 5\nwait: 6\nmotion missile: user\nprojectile weapon: start user, goal target, duration 12, arc 20\nwait for projectile\nattack animation: target\nwait: 4\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 6\nif user.agi >= 30 || user.atk >= 40\n  motion missile: user\n  projectile weapon: start user, goal target, duration 10, arc 10\n  wait for projectile\n  attack animation: target\n  wait: 4\n  action effect: target\n  motion damage: target\n  shake screen: 3, 5, 8\n  wait: 6\nend\nmove target: backward, 35, 8\nwait: 8\nmove target: home, 8\nwait: 10',
        finish: 'immortal: targets, false\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    },
    dagger: {
        id: 440,
        wtype: 10,
        name: 'Dagger',
        label: '10. Dagger (Behind Shadowstep & Dual Slits)',
        setup: 'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6',
        target: 'opacity user: 0%, 5\nwait for opacity\nmove user: target, back base, 0\nopacity user: 100%, 5\nwait for opacity\nface user: backward\nmotion swing: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 6\nif user.isDualWield()\n  motion thrust: user\n  wait: 6\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 2, 4, 8\n  wait: 8\nend\nmove target: forward, 20, 6\nwait: 6\nmove target: home, 6\nwait: 6',
        finish: 'immortal: targets, false\nopacity user: 0%, 5\nwait for opacity\nmove user: home, 0\nface user: forward\nopacity user: 100%, 5\nwait for opacity\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    }
};

function applyBecWeaponTypePreset(presetKey) {
    const skill = getBecActiveSkill();
    if (!skill) return;
    const p = BEC_WEAPON_ATTACK_PRESETS[presetKey];
    if (!p) return;

    const state = parseBecSkillState(skill.note || '');
    state.setupCommands = parseActionBlockCommands(p.setup);
    state.targetCommands = parseActionBlockCommands(p.target);
    state.finishCommands = parseActionBlockCommands(p.finish);

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast(`Preset Basic Attack [${p.name}] berhasil diterapkan! Setiap perintah kini dapat diedit visual di bawah.`, 'success');
}

// Global 1-Click Cinematic Preset
function applyCinematicSlowMoPreset() {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');

    // Setup Action
    state.setupCommands = parseActionBlockCommands(
        'clear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\nzoom: 150%, 30\ncamera focus: user, center, 20\nwait for camera\nwait for zoom'
    );

    // Target Action
    state.targetCommands = parseActionBlockCommands(
        'move user: target, front, 18, 28\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\ncamera focus: target, center, 15\nwait for camera\nmotion damage: target\nshake screen: 3, 5, 12\nwait for effect\nwait: 20\nif target.isDead()\n  opacity target: 0%, 50\n  wait for opacity\n  collapse: target, force\n  wait: 15\nend\ncamera focus: user, center, 20\nwait for camera\nwait: 10'
    );

    // Finish Action
    state.finishCommands = parseActionBlockCommands(
        'immortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log'
    );

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast(`Cinematic Slow-Mo Preset diterapkan ke Skill #${skill.id}!`, 'success');
}

// ============================================================================
// 9. EVENT HANDLERS & STATE MUTATORS
// ============================================================================

function getBecActiveSkill() {
    if (typeof getActiveItem === 'function') {
        const item = getActiveItem();
        if (item && State.currentTab === 'skills') return item;
    }
    if (typeof State !== 'undefined' && State.skills) {
        return State.skills[State.selectedIndex] || State.skills[1] || null;
    }
    return null;
}

function onBecStateFieldChange(phase, field, value) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    if (state[phase]) {
        state[phase][field] = value;
    }

    // Legacy synchronization jika user memanggil onBecStateFieldChange dari test
    if (phase === 'target' && field === 'targetApproach') {
        let line = 'move user: target, front, 18';
        if (value === 'jump_in') line = 'jump user: 120, 15\nmove user: target, front, 15';
        else if (value === 'back_18') line = 'move user: target, back, 18';
        const existing = state.targetCommands.find(c => c.type === 'move' || c.type === 'jump');
        if (existing) {
            existing.raw = line;
        } else {
            state.targetCommands.unshift(...parseActionBlockCommands(line));
        }
    } else if (phase === 'target' && field === 'targetMotion') {
        const line = `motion ${value}: user`;
        const existing = state.targetCommands.find(c => c.type === 'motion');
        if (existing) {
            existing.raw = line;
        } else {
            state.targetCommands.push(...parseActionBlockCommands(line));
        }
    }

    const newNote = generateBecSkillNote(skill, state);
    skill.note = newNote;
    setUnsaved(true);
    renderEditor();
    showToast(`Phase ${phase.toUpperCase()}: ${field} updated!`, 'info');
}

function onBecTargetAnimChange(value) {
    const skill = getBecActiveSkill();
    if (!skill) return;

    const state = parseBecSkillState(skill.note || '');
    let line = 'attack animation: target';
    if (value === 'skill_anim') line = 'action animation: target';
    else if (value && value.startsWith('anim_')) {
        const id = parseInt(value.replace('anim_', ''), 10) || 1;
        line = `animation ${id}: target`;
    }

    const existingIdx = state.targetCommands.findIndex(c => c.type.includes('animation'));
    if (existingIdx >= 0) {
        state.targetCommands[existingIdx] = parseActionBlockCommands(line)[0];
    } else {
        state.targetCommands.push(...parseActionBlockCommands(line));
    }

    skill.note = generateBecSkillNote(skill, state);
    setUnsaved(true);
    renderEditor();
    showToast('Attack Animation updated!', 'info');
}

function onBecTargetAnimTypeChange(type) {
    onBecTargetAnimChange(type);
}

function scrollToBecSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow = '0 0 16px rgba(168,85,247,0.6)';
        setTimeout(() => {
            el.style.boxShadow = 'none';
        }, 1200);
    }
}

function resetBecSequenceToDefault() {
    const skill = getBecActiveSkill();
    if (!skill) return;

    if (!confirm(`Reset Skill #${skill.id} (${skill.name}) ke default RPG Maker MV flow? Semua blok Action Sequence akan dikosongkan.`)) {
        return;
    }

    let note = skill.note || '';
    const seqBlocks = ['setup action', 'whole action', 'target action', 'follow action', 'finish action'];
    seqBlocks.forEach(sb => {
        note = note.replace(new RegExp('<' + sb + '>[\\s\\S]*?<\\/' + sb + '>', 'gi'), '').trim();
    });

    skill.note = note.trim();
    setUnsaved(true);
    renderEditor();
    showToast(`Skill #${skill.id} berhasil di-reset ke default!`, 'success');
}

function copyBecSequenceToClipboard() {
    const skill = getBecActiveSkill();
    if (!skill) return;
    const note = skill.note || '';
    if (!note.trim()) {
        showToast('Tidak ada notetag action sequence pada skill ini untuk disalin.', 'warning');
        return;
    }
    navigator.clipboard.writeText(note).then(() => {
        showToast('Notetag Action Sequence berhasil disalin ke clipboard!', 'success');
    }).catch(err => {
        showToast('Gagal menyalin: ' + err, 'error');
    });
}

function onBecRawNoteChange(val) {
    const skill = getBecActiveSkill();
    if (!skill) return;
    skill.note = val.trim();
    setUnsaved(true);
    renderEditor();
}

// Global window registrations
window.renderBattleEngineVisualizer = renderBattleEngineVisualizer;
window.parseBecSkillState = parseBecSkillState;
window.generateBecSkillNote = generateBecSkillNote;
window.getBecActiveSkill = getBecActiveSkill;
window.onBecStateFieldChange = onBecStateFieldChange;
window.onBecTargetAnimChange = onBecTargetAnimChange;
window.onBecTargetAnimTypeChange = onBecTargetAnimTypeChange;
window.scrollToBecSection = scrollToBecSection;
window.resetBecSequenceToDefault = resetBecSequenceToDefault;
window.copyBecSequenceToClipboard = copyBecSequenceToClipboard;
window.onBecRawNoteChange = onBecRawNoteChange;
window.applyCinematicSlowMoPreset = applyCinematicSlowMoPreset;
window.BEC_WEAPON_ATTACK_PRESETS = BEC_WEAPON_ATTACK_PRESETS;
window.applyBecWeaponTypePreset = applyBecWeaponTypePreset;

// Event-Command List & Modal Window Registrations
window.openBecCommandModal = openBecCommandModal;
window.closeBecCommandModal = closeBecCommandModal;
window.onBecModalCommandTypeChange = onBecModalCommandTypeChange;
window.onBecModalParamChange = onBecModalParamChange;
window.saveBecCommandModal = saveBecCommandModal;
window.moveBecCommand = moveBecCommand;
window.reorderBecCommand = reorderBecCommand;
window.onBecCmdDragStart = onBecCmdDragStart;
window.onBecCmdDragOver = onBecCmdDragOver;
window.onBecCmdDragEnter = onBecCmdDragEnter;
window.onBecCmdDragLeave = onBecCmdDragLeave;
window.onBecCmdDrop = onBecCmdDrop;
window.onBecCmdDragEnd = onBecCmdDragEnd;
window.duplicateBecCommand = duplicateBecCommand;
window.deleteBecCommand = deleteBecCommand;
window.clearBecPhaseCommands = clearBecPhaseCommands;
window.applyBecPhasePreset = applyBecPhasePreset;
