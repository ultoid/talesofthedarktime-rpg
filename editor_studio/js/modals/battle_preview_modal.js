/**
 * NUSV Database Studio - Modal Controller: modals/battle_preview_modal.js
 * 100% Native Real-Engine RPG Maker MV Battle Preview Sandbox
 */

var BattlePreviewModal = {
    currentSkillId: null,
    actorId: 1,
    troopId: 2,
    speed: 1.0,
    mute: false,
    autoCast: true,
    liveSkillData: null,
    isReady: false
};

function openBattlePreviewModal(skillId) {
    if (!skillId) {
        if (typeof State !== 'undefined' && State.currentTab === 'skills' && State.selectedIndex) {
            skillId = State.selectedIndex;
        } else if (typeof State !== 'undefined' && State.currentSkillId) {
            skillId = State.currentSkillId;
        } else {
            skillId = 1;
        }
    }
    skillId = Number(skillId);
    BattlePreviewModal.currentSkillId = skillId;

    const skill = (typeof State !== 'undefined' && State.skills && State.skills[skillId]) 
        ? State.skills[skillId] 
        : { id: skillId, name: 'Skill #' + skillId };

    // 1. Capture live unsaved edits from active editor (Skills tab or BEC Sequence tab)
    let liveSkill = Object.assign({}, skill);
    if (typeof getBecActiveSkill === 'function') {
        const becSkill = getBecActiveSkill();
        if (becSkill && Number(becSkill.id) === skillId) {
            liveSkill = Object.assign({}, becSkill);
        }
    }
    if (typeof State !== 'undefined' && State.currentTab === 'skills' && Number(State.selectedIndex) === skillId) {
        if (typeof parseBecSkillState === 'function' && typeof generateBecSkillNote === 'function') {
            const becState = parseBecSkillState(liveSkill.note || '');
            liveSkill.note = generateBecSkillNote(liveSkill, becState);
        }
    }
    BattlePreviewModal.liveSkillData = liveSkill;
    BattlePreviewModal.isReady = false;

    // 2. Populate Actor Dropdown
    const actorSelect = document.getElementById('bpActorSelect');
    if (actorSelect && typeof State !== 'undefined' && State.actors) {
        const validActors = State.actors.filter(a => a && a.id);
        actorSelect.innerHTML = validActors.map(a => 
            `<option value="${a.id}" ${Number(a.id) === Number(BattlePreviewModal.actorId) ? 'selected' : ''}>${a.id}. ${escapeHtml(a.name || 'Actor #' + a.id)}</option>`
        ).join('');
    }

    // 3. Populate Troop Dropdown
    const troopSelect = document.getElementById('bpTroopSelect');
    if (troopSelect && typeof State !== 'undefined' && State.troops) {
        const validTroops = State.troops.filter(t => t && t.id && t.name);
        troopSelect.innerHTML = validTroops.map(t => 
            `<option value="${t.id}" ${Number(t.id) === Number(BattlePreviewModal.troopId) ? 'selected' : ''}>${t.id}. ${escapeHtml(t.name)}</option>`
        ).join('');
    }

    // 4. Update Header Details
    const skillBadge = document.getElementById('bpSkillBadge');
    if (skillBadge) {
        const iconHtml = (typeof renderIconHtml === 'function' && skill.iconIndex) 
            ? renderIconHtml(skill.iconIndex, 0.75) 
            : pai('sword');
        skillBadge.innerHTML = `${iconHtml} <strong style="color:#fff; font-size:0.95rem;">#${skill.id} ${escapeHtml(skill.name || 'Unnamed')}</strong>`;
    }

    // 5. Update Status & Speed UI
    BattlePreviewModal.updateStatus('Memuat Engine RPG Maker MV & Scene_Battle...', 'loading');
    BattlePreviewModal.updateSpeedUi();
    BattlePreviewModal.updateMuteUi();
    BattlePreviewModal.updateAutoCastUi();

    // 6. Show Modal
    const modal = document.getElementById('battlePreviewModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    // 7. Load Real Game Engine in Iframe
    BattlePreviewModal.loadIframe();
}

BattlePreviewModal.loadIframe = function() {
    const iframe = document.getElementById('battlePreviewIframe');
    if (!iframe) return;

    const url = `index.html?skillPreview=${this.currentSkillId}&actorId=${this.actorId}&troopId=${this.troopId}&speed=${this.speed}&mute=${this.mute ? 1 : 0}&autoCast=${this.autoCast ? 1 : 0}&_t=${Date.now()}`;
    iframe.src = url;
};

BattlePreviewModal.replay = function() {
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.NUSV_BattlePreview) {
        if (this.liveSkillData) {
            iframe.contentWindow.NUSV_BattlePreview.applyLiveSkill(this.liveSkillData);
        }
        iframe.contentWindow.NUSV_BattlePreview.replaySkill();
        this.updateStatus('Mengeksekusi ulang aksi skill...', 'active');
    } else {
        this.loadIframe();
    }
};

BattlePreviewModal.changeSpeed = function(newSpeed) {
    this.speed = parseFloat(newSpeed) || 1.0;
    this.updateSpeedUi();
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.NUSV_BattlePreview) {
        iframe.contentWindow.NUSV_BattlePreview.setSpeed(this.speed);
    }
};

BattlePreviewModal.updateSpeedUi = function() {
    ['0.5', '1.0', '2.0'].forEach(s => {
        const btn = document.getElementById(`bpSpeedBtn_${s}`);
        if (btn) {
            if (parseFloat(s) === this.speed) {
                btn.style.background = 'linear-gradient(135deg, #8b5cf6, #d946ef)';
                btn.style.borderColor = '#c084fc';
                btn.style.color = '#fff';
                btn.style.fontWeight = '700';
            } else {
                btn.style.background = 'rgba(15,23,42,0.6)';
                btn.style.borderColor = '#334155';
                btn.style.color = '#94a3b8';
                btn.style.fontWeight = 'normal';
            }
        }
    });
};

BattlePreviewModal.toggleMute = function() {
    this.mute = !this.mute;
    this.updateMuteUi();
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.NUSV_BattlePreview) {
        iframe.contentWindow.NUSV_BattlePreview.setMute(this.mute);
    }
};

BattlePreviewModal.updateMuteUi = function() {
    const btn = document.getElementById('bpMuteBtn');
    if (btn) {
        btn.innerHTML = this.mute ? `${pai('volume-x')} Mute` : `${pai('volume-3')} Audio`;
        btn.style.color = this.mute ? '#f87171' : '#38bdf8';
        btn.style.borderColor = this.mute ? '#ef444455' : '#0284c755';
    }
};

BattlePreviewModal.toggleAutoCast = function() {
    this.autoCast = !this.autoCast;
    this.updateAutoCastUi();
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.NUSV_BattlePreview) {
        iframe.contentWindow.NUSV_BattlePreview.autoCast = this.autoCast;
    }
};

BattlePreviewModal.updateAutoCastUi = function() {
    const btn = document.getElementById('bpAutoCastBtn');
    if (btn) {
        btn.innerHTML = this.autoCast ? `${pai('zap')} Auto: ON` : `${pai('pause')} Auto: OFF`;
        btn.style.color = this.autoCast ? '#facc15' : '#94a3b8';
    }
};

BattlePreviewModal.onActorChange = function(newActorId) {
    this.actorId = parseInt(newActorId, 10) || 1;
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.NUSV_BattlePreview) {
        iframe.contentWindow.NUSV_BattlePreview.switchActor(this.actorId);
    } else {
        this.loadIframe();
    }
};

BattlePreviewModal.onTroopChange = function(newTroopId) {
    this.troopId = parseInt(newTroopId, 10) || 2;
    this.loadIframe();
};

BattlePreviewModal.onBattleReady = function() {
    this.isReady = true;
    this.updateStatus('Engine Aktif & Siap Tempur', 'ready');
};

BattlePreviewModal.onSkillFired = function(skill) {
    this.updateStatus(`Menyerang target dengan "${escapeHtml(skill.name)}"`, 'active');
    setTimeout(() => {
        if (this.isReady) {
            this.updateStatus('Siap untuk Replay', 'ready');
        }
    }, 2500);
};

BattlePreviewModal.updateStatus = function(text, stateClass) {
    const statusEl = document.getElementById('bpStatusIndicator');
    if (!statusEl) return;
    let icon = pai('clock');
    if (stateClass === 'ready') {
        icon = pai('check');
        statusEl.style.color = '#4ade80';
    } else if (stateClass === 'active') {
        icon = pai('sword');
        statusEl.style.color = '#facc15';
    } else {
        statusEl.style.color = '#94a3b8';
    }
    statusEl.innerHTML = `${icon} <span>${text}</span>`;
};

function closeBattlePreviewModal() {
    const modal = document.getElementById('battlePreviewModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const iframe = document.getElementById('battlePreviewIframe');
    if (iframe) {
        iframe.src = 'about:blank';
    }
    BattlePreviewModal.isReady = false;
}
