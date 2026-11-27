/**
 * NUSV Database Studio - Utility Helpers & Tag Parsers
 */


/**
 * Create a new blank dataset item adhering to RPG Maker MV / NUSV schema.
 */
function createBlankEntry(tab, id) {
    switch (tab) {
        case 'actors':
            return {
                id,
                name: '',
                nickname: '',
                classId: 1,
                initialLevel: 1,
                maxLevel: 99,
                description: '',
                profile: '',
                traits: [],
                equips: [0, 0, 0, 0, 0],
                note: '',
                battlerName: '',
                characterName: '',
                characterIndex: 0,
                faceName: '',
                faceIndex: 0
            };
        case 'classes':
            return {
                id,
                name: '',
                expParams: [30, 20, 30, 30],
                params: Array(8).fill(null).map(() => Array(100).fill(10)),
                learnings: [],
                traits: [],
                note: ''
            };
        case 'weapons':
            return {
                id,
                name: '',
                iconIndex: 0,
                description: '',
                wtypeId: 1,
                price: 0,
                params: [0, 0, 0, 0, 0, 0, 0, 0],
                traits: [],
                note: ''
            };
        case 'armors':
            return {
                id,
                name: '',
                iconIndex: 0,
                description: '',
                atypeId: 1,
                etypeId: 2,
                price: 0,
                params: [0, 0, 0, 0, 0, 0, 0, 0],
                traits: [],
                note: ''
            };
        case 'skills':
            return {
                id,
                name: '',
                iconIndex: 0,
                description: '',
                stypeId: 1,
                scope: 1,
                occasion: 0,
                mpCost: 0,
                tpCost: 0,
                speed: 0,
                successRate: 100,
                repeats: 1,
                tpGain: 0,
                hitType: 1,
                animationId: 0,
                damage: { type: 1, elementId: 0, formula: '0', variance: 20, critical: false },
                effects: [],
                note: ''
            };
        case 'items':
            return {
                id,
                name: '',
                iconIndex: 0,
                description: '',
                itypeId: 1,
                price: 0,
                consumable: true,
                scope: 7,
                occasion: 0,
                speed: 0,
                successRate: 100,
                repeats: 1,
                tpGain: 0,
                hitType: 0,
                animationId: 0,
                damage: { type: 0, elementId: 0, formula: '0', variance: 20, critical: false },
                effects: [],
                note: ''
            };
        case 'enemies':
            return {
                id,
                name: '',
                battlerName: '',
                battlerHue: 0,
                maxHp: 100,
                maxMp: 0,
                params: [100, 0, 10, 10, 10, 10, 10, 10],
                exp: 0,
                gold: 0,
                dropItems: [],
                actions: [],
                traits: [],
                note: ''
            };
        case 'states':
            return {
                id,
                name: '',
                iconIndex: 0,
                restriction: 0,
                priority: 50,
                motion: 0,
                overlay: 0,
                removeAtBattleEnd: true,
                removeByRestriction: false,
                autoRemovalTiming: 0,
                minTurns: 1,
                maxTurns: 1,
                removeByDamage: false,
                chanceByDamage: 100,
                removeByWalking: false,
                stepsToRemove: 100,
                message1: '',
                message2: '',
                message3: '',
                message4: '',
                traits: [],
                note: ''
            };
        default:
            return { id, name: '', note: '' };
    }
}


function getIVGradeInfo(val) {
    const r = Math.max(1, Math.min(10, parseInt(val, 10) || 5));
    if (r >= 10) return { grade: 'S', color: '#ec4899', rate: 2.0, label: 'Grade S (+2.0/Lv) Max' };
    if (r >= 8) return { grade: 'A', color: '#a855f7', rate: Math.round((1.6 + (r - 8) * 0.2) * 10) / 10, label: `Grade A (+${(1.6 + (r - 8) * 0.2).toFixed(1)}/Lv) High` };
    if (r >= 6) return { grade: 'B', color: '#3b82f6', rate: Math.round((1.2 + (r - 6) * 0.2) * 10) / 10, label: `Grade B (+${(1.2 + (r - 6) * 0.2).toFixed(1)}/Lv) Balanced` };
    if (r >= 4) return { grade: 'C', color: '#10b981', rate: Math.round((0.8 + (r - 4) * 0.2) * 10) / 10, label: `Grade C (+${(0.8 + (r - 4) * 0.2).toFixed(1)}/Lv) Moderate` };
    if (r >= 2) return { grade: 'D', color: '#f59e0b', rate: Math.round((0.4 + (r - 2) * 0.2) * 10) / 10, label: `Grade D (+${(0.4 + (r - 2) * 0.2).toFixed(1)}/Lv) Low` };
    return { grade: 'E', color: '#94a3b8', rate: 0.2, label: 'Grade E (+0.2/Lv) Minimal' };
}



function ensureItemParams(item) {
    if (!item.params || !Array.isArray(item.params) || item.params.length < 8) {
        item.params = [0, 0, 0, 0, 0, 0, 0, 0];
    }
}



function ensureClassParams(cls) {
    if (!cls.params || !Array.isArray(cls.params) || cls.params.length < 8) {
        cls.params = [
            Array(100).fill(400), Array(100).fill(40),
            Array(100).fill(15), Array(100).fill(15),
            Array(100).fill(10), Array(100).fill(10),
            Array(100).fill(12), Array(100).fill(10)
        ];
    }
    for (let p = 0; p < 8; p++) {
        if (!Array.isArray(cls.params[p]) || cls.params[p].length < 100) {
            const arr = Array(100).fill(10);
            if (Array.isArray(cls.params[p])) {
                for (let i = 0; i < cls.params[p].length; i++) arr[i] = cls.params[p][i];
            }
            cls.params[p] = arr;
        }
    }
}

// Universal Notetag Utilities


function getTagVal(note, tag, defVal = '') {
    if (!note) return defVal;
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = note.match(new RegExp('<' + escaped + ':[ ]*(.+?)>', 'i'));
    return m ? m[1].trim() : defVal;
}



function hasTag(note, tag) {
    if (!note) return false;
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('<' + escaped + '>', 'i').test(note);
}



function normalizeStatInput(input, percent) {
    const start = input.selectionStart;
    const oldValue = input.value;
    let value = oldValue.replace(/[^0-9.+-]/g, '');
    const sign = value.startsWith('-') ? '-' : value.startsWith('+') ? '+' : '';
    value = value.replace(/[+-]/g, '');
    const parts = value.split('.');
    value = sign + parts.shift() + (parts.length ? '.' + parts.join('') : '');
    const addSign = !sign && /\d/.test(value);
    if (addSign) value = '+' + value;
    input.value = value + (percent && /\d/.test(value) ? '%' : '');
    const cursor = Math.min(start + (addSign ? 1 : 0), value.length);
    input.setSelectionRange(cursor, cursor);
}

function stepStatValue(button, step) {
    const input = button.parentElement.parentElement.querySelector('input');
    const current = parseFloat(input.value) || 0;
    const decimals = (String(current).split('.')[1] || '').length;
    const value = Number((current + step).toFixed(decimals));
    input.value = (value >= 0 ? '+' : '') + value;
    normalizeStatInput(input, input.dataset.percent === 'true');
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function statValueInput(value, percent, change, extra = '') {
    return `<div style="display:flex; gap:4px; min-width:0;">
        <input type="text" inputmode="decimal" data-percent="${percent}" class="form-control" style="min-width:0;" value="${escapeHtml(String(value || ''))}" oninput="normalizeStatInput(this, ${percent})" onchange="normalizeStatInput(this, ${percent}); ${change}" ${extra}>
        <span style="display:flex; flex-direction:column;">
            <button type="button" title="Naikkan nilai" aria-label="Naikkan nilai" onclick="stepStatValue(this, 1)" style="flex:1; line-height:1; cursor:pointer;">&#9650;</button>
            <button type="button" title="Turunkan nilai" aria-label="Turunkan nilai" onclick="stepStatValue(this, -1)" style="flex:1; line-height:1; cursor:pointer;">&#9660;</button>
        </span>
    </div>`;
}

function stepRefiningValue(button, step) {
    const input = button.parentElement.parentElement.querySelector('input');
    const current = parseFloat(input.value) || 0;
    let value = current + step;
    if (input.hasAttribute('min')) value = Math.max(Number(input.min), value);
    if (input.hasAttribute('max')) value = Math.min(Number(input.max), value);
    const decimals = (String(current).split('.')[1] || '').length;
    value = Number(value.toFixed(decimals));
    const suffix = input.value.trim().endsWith('%') ? '%' : '';
    input.value = value + suffix;
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function refiningValueInput(input) {
    return `<div class="numeric-step-control" style="display:flex; gap:4px; min-width:0;">${input}
        <span style="display:flex; flex-direction:column;">
            <button type="button" title="Naikkan nilai" aria-label="Naikkan nilai" onclick="stepRefiningValue(this, 1)" style="flex:1; line-height:1; cursor:pointer;">&#9650;</button>
            <button type="button" title="Turunkan nilai" aria-label="Turunkan nilai" onclick="stepRefiningValue(this, -1)" style="flex:1; line-height:1; cursor:pointer;">&#9660;</button>
        </span>
    </div>`;
}

function addNumberSteppers(root) {
    const inputs = [];
    if (root.nodeType === 1 && root.matches('input[type="number"]')) inputs.push(root);
    if (root.querySelectorAll) inputs.push(...root.querySelectorAll('input[type="number"]'));
    inputs.forEach(input => {
        if (!input.isConnected || input.closest('.numeric-step-control')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'numeric-step-control';
        wrapper.style.cssText = 'display:inline-flex; gap:4px; min-width:0; max-width:100%; vertical-align:middle;';
        if (!input.style.width) wrapper.style.width = '100%';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        input.style.minWidth = '0';
        const buttons = document.createElement('span');
        buttons.style.cssText = 'display:flex; flex-direction:column;';
        [1, -1].forEach(direction => {
            const button = document.createElement('button');
            button.type = 'button';
            button.title = button.ariaLabel = direction > 0 ? 'Naikkan nilai' : 'Turunkan nilai';
            button.textContent = direction > 0 ? '\u25b2' : '\u25bc';
            button.style.cssText = 'flex:1; line-height:1; cursor:pointer;';
            button.addEventListener('click', () => {
                if (input.disabled || input.readOnly) return;
                const step = input.step && input.step !== 'any' ? Number(input.step) : 1;
                const current = Number(input.value || 0);
                let value = current + direction * step;
                if (input.hasAttribute('min')) value = Math.max(Number(input.min), value);
                if (input.hasAttribute('max')) value = Math.min(Number(input.max), value);
                input.value = String(Number(value.toFixed(10)));
                input.dispatchEvent(new Event('input', { bubbles: true }));
                if (input.isConnected) input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            buttons.appendChild(button);
        });
        wrapper.appendChild(buttons);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    addNumberSteppers(document);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(addNumberSteppers)))
        .observe(document.body, { childList: true, subtree: true });
});

function setTagVal(itemOrTag, tagOrVal, maybeVal) {
    let item, tag, val;
    if (maybeVal !== undefined) {
        item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
        tag = tagOrVal;
        val = maybeVal;
    } else {
        item = window.currentItem || getActiveItem();
        tag = itemOrTag;
        val = tagOrVal;
    }
    if (!item) return;

    let note = item.note || '';
    const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('<' + escaped + ':[ ]*.*?>\\n?', 'gi');
    note = note.replace(regex, '').trim();
    if (val !== null && val !== undefined && String(val).trim() !== '') {
        note = `<${tag}: ${String(val).trim()}>\n` + note;
    }
    item.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}



function setBoolTag(itemOrTag, tagOrBool, maybeBool) {
    let item, tag, enabled;
    if (maybeBool !== undefined) {
        item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
        tag = tagOrBool;
        enabled = maybeBool;
    } else {
        item = window.currentItem || getActiveItem();
        tag = itemOrTag;
        enabled = tagOrBool;
    }
    if (!item) return;

    let note = item.note || '';
    const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('<' + escaped + '>\\n?', 'gi');
    note = note.replace(regex, '').trim();
    if (enabled) {
        note = `<${tag}>\n` + note;
    }
    item.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}



function setBlockTag(itemOrTag, tagOrContent, maybeContent) {
    let item, tag, content;
    if (maybeContent !== undefined) {
        item = (typeof itemOrTag === 'object' && itemOrTag) ? itemOrTag : (window.currentItem || getActiveItem());
        tag = tagOrContent;
        content = maybeContent;
    } else {
        item = window.currentItem || getActiveItem();
        tag = itemOrTag;
        content = tagOrContent;
    }
    if (!item) return;

    let note = item.note || '';
    const escaped = String(tag).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('<' + escaped + '>[\\s\\S]*?<\\/' + escaped + '>\\n?', 'gi');
    note = note.replace(regex, '').trim();
    if (content && String(content).trim()) {
        note = `<${tag}>\n${String(content).trim()}\n</${tag}>\n` + note;
    }
    item.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}



function getBlockTag(note, tag, defVal = '') {
    if (!note) return defVal;
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = note.match(new RegExp('<' + escaped + '>([\\s\\S]*?)<\\/' + escaped + '>', 'i'));
    return m ? m[1].trim() : defVal;
}



function updateRawNoteTextarea() {
    const el = document.getElementById('rawNoteTextarea');
    const items = getActiveList();
    const item = items[State.selectedIndex];
    if (el && item) {
        el.value = item.note || '';
    }
}



function onRawNoteInput(val) {
    const items = getActiveList();
    const item = items[State.selectedIndex];
    if (!item) return;
    item.note = val;
    setUnsaved(true);
    renderEditor();
}



function parsePercent(val) {
    if (!val) return 0;
    const clean = String(val).replace('%', '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num / 100.0;
}



function parseBonusNum(val) {
    if (!val) return 0;
    const clean = String(val).replace('+', '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}



function formatTrait(tr) {
    const def = TRAIT_CATEGORIES[tr.code];
    if (!def) return `Unknown Trait (${tr.code}, ${tr.dataId}, ${tr.value})`;
    let target = '';
    if (def.hasDataId === 'element') target = (State.system.elements||[])[tr.dataId] || `Element #${tr.dataId}`;
    else if (def.hasDataId === 'param') target = (PARAM_DEFS[tr.dataId]||{}).name || `Param #${tr.dataId}`;
    else if (def.hasDataId === 'xparam') target = XPARAM_NAMES[tr.dataId] || `ExParam #${tr.dataId}`;
    else if (def.hasDataId === 'sparam') target = SPARAM_NAMES[tr.dataId] || `SpParam #${tr.dataId}`;
    else if (def.hasDataId === 'state') target = (State.states[tr.dataId]||{}).name ? `#${tr.dataId} ${State.states[tr.dataId].name}` : `State #${tr.dataId}`;
    else if (def.hasDataId === 'stype') target = (State.system.skillTypes||[])[tr.dataId] || `SkillType #${tr.dataId}`;
    else if (def.hasDataId === 'skill') target = (State.skills[tr.dataId]||{}).name ? `#${tr.dataId} ${State.skills[tr.dataId].name}` : `Skill #${tr.dataId}`;
    else if (def.hasDataId === 'wtype') target = (State.system.weaponTypes||[])[tr.dataId] || `WeaponType #${tr.dataId}`;
    else if (def.hasDataId === 'atype') target = (State.system.armorTypes||[])[tr.dataId] || `ArmorType #${tr.dataId}`;
    else if (def.hasDataId === 'etype') target = (State.system.equipTypes||[])[tr.dataId] || `EquipSlot #${tr.dataId}`;
    else if (def.hasDataId === 'slotType') target = 'Dual Wield (Physical & Magic Rune)';
    else if (def.hasDataId === 'flag') target = ['Auto Battle', 'Guard', 'Substitute', 'Preserve SP (Stamina Points)'][tr.dataId] || `Flag #${tr.dataId}`;
    else if (def.hasDataId === 'collapse') target = ['Normal', 'Boss', 'Instant', 'Disappear'][tr.dataId] || `Collapse #${tr.dataId}`;
    else if (def.hasDataId === 'ability') target = ['Encounter Half', 'Encounter None', 'Cancel Surprise', 'Raise Preemptive', 'Gold Double', 'Drop Item Double'][tr.dataId] || `Ability #${tr.dataId}`;

    let valStr = '';
    if (def.isPercent) valStr = ` <strong style="color:#38bdf8;">* ${Math.round(tr.value * 100)}%</strong>`;
    else if (def.isPercentFloat) valStr = ` <strong style="color:#38bdf8;">+ ${(tr.value * 100).toFixed(1)}%</strong>`;
    else if (def.isFlatInt) valStr = ` <strong style="color:#38bdf8;">+ ${tr.value}</strong>`;

    return `<strong>${def.name}</strong>: ${target}${valStr}`;
}



function formatEffect(eff) {
    const categories = (typeof EFFECT_CATEGORIES !== 'undefined') ? EFFECT_CATEGORIES : {};
    const def = categories[eff.code] || {};
    if (!def.name && !def.cat) return `Effect #${eff.code} (Data: ${eff.dataId}, V1: ${eff.value1}, V2: ${eff.value2})`;
    if (def.isHpRecover) return `Pulihkan HP: <strong style="color:#22c55e;">${Math.round(eff.value1 * 100)}%</strong> + <strong style="color:#22c55e;">${eff.value2} Poin</strong>`;
    if (def.isMpRecover) return `Pulihkan MP: <strong style="color:#38bdf8;">${Math.round(eff.value1 * 100)}%</strong> + <strong style="color:#38bdf8;">${eff.value2} Poin</strong>`;
    if (def.isTpGain) return `Tambahkan SP (Stamina): <strong style="color:#eab308;">${eff.value1} Poin</strong>`;
    if (eff.code === 21) {
        const s = State.states[eff.dataId];
        return `Beri Status: <strong>#${eff.dataId} ${s ? escapeHtml(s.name) : 'State'}</strong> (${Math.round(eff.value1 * 100)}% Peluang)`;
    }
    if (eff.code === 22) {
        const s = State.states[eff.dataId];
        return `Hapus Status: <strong>#${eff.dataId} ${s ? escapeHtml(s.name) : 'State'}</strong> (${Math.round(eff.value1 * 100)}% Peluang)`;
    }
    if (eff.code === 31) {
        const p = PARAM_DEFS[eff.dataId] || { name: 'Param' };
        return `Add Buff: <strong>${p.name}</strong> selama <strong>${eff.value1} Turns</strong>`;
    }
    if (eff.code === 32) {
        const p = PARAM_DEFS[eff.dataId] || { name: 'Param' };
        return `Add Debuff: <strong>${p.name}</strong> selama <strong>${eff.value1} Turns</strong>`;
    }
    if (eff.code === 33) return `Remove Buff: <strong>${(PARAM_DEFS[eff.dataId]||{}).name || 'Param'}</strong>`;
    if (eff.code === 34) return `Remove Debuff: <strong>${(PARAM_DEFS[eff.dataId]||{}).name || 'Param'}</strong>`;
    if (eff.code === 41) return `Special Effect: <strong>Escape dari Pertarungan</strong>`;
    if (eff.code === 42) return `Permanent Stat Growth: <strong>${(PARAM_DEFS[eff.dataId]||{}).name || 'Param'} +${eff.value1}</strong>`;
    if (eff.code === 43) {
        const sk = State.skills[eff.dataId];
        return `Pelajari Skill Baru: <strong>#${eff.dataId} ${sk ? escapeHtml(sk.name) : 'Skill'}</strong>`;
    }
    if (eff.code === 44) {
        const ce = (State.commonEvents||[])[eff.dataId];
        return `Trigger Common Event: <strong>#${eff.dataId} ${ce ? escapeHtml(ce.name) : 'Event'}</strong>`;
    }
    return `${def.name || 'Efek #' + eff.code}`;
}



/**
 * Renders a crisp Pixel Art Icon HTML string using pixelarticons.
 * @param {string} name - The icon name without prefix (e.g. 'sword', 'shield', 'heart')
 * @param {string} extraClass - Additional CSS classes
 * @param {string} style - Inline CSS style
 */
function pai(name, extraClass = '', style = '') {
    if (!name) return '';
    return `<i class="pai-${name}${extraClass ? ' ' + extraClass : ''}"${style ? ` style="${style}"` : ''}></i>`;
}

function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let icon = '<i class="pai-circle-info"></i>';
    if (type === 'success') icon = '<i class="pai-check"></i>';
    else if (type === 'error') icon = '<i class="pai-close"></i>';
    else if (type === 'warning') icon = '<i class="pai-warning-diamond"></i>';

    // Clean any accidental unicode emojis from the toast message string
    const cleanMsg = String(message || '').replace(/[\u{1F300}-\u{1FAFF}]|[\u2600-\u27BF]|[\u2300-\u23FF]/gu, '').trim();

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${typeof escapeHtml === 'function' ? escapeHtml(cleanMsg) : cleanMsg}</span>
    `;

    container.appendChild(toast);

    // Limit maximum stacked toasts to 5 to avoid screen clutter
    while (container.children.length > 5) {
        container.removeChild(container.firstChild);
    }

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 220);
    }, duration);
}


// Real-time Indonesian description on hover


function calculateExpForLevel(level, expParams) {
    if (level <= 1) return 0;
    const basis = expParams[0] || 30;
    const extra = expParams[1] || 20;
    const acc_a = expParams[2] || 30;
    const acc_b = expParams[3] || 30;
    return Math.round(
        basis * (Math.pow(level - 1, 0.9 + acc_a / 250)) * level * (level + 1) /
        (6 + Math.pow(level, 2) / 50 / acc_b) + (level - 1) * extra
    );
}



function formatExpNum(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return Math.round(num / 1000) + 'k';
    return String(num);
}



function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getItemCategory(item) {
    if (!item) return '';
    const note = item.note || '';
    const cat = getTagVal(note, 'Menu Category') || getTagVal(note, 'NUSV Category') || getTagVal(note, 'Category');
    if (cat) return cat.trim();
    if (item.itypeId === 2) return 'Key Item';
    if (item.consumable || (item.occasion >= 0 && item.occasion <= 2)) return 'Consumable';
    return 'Material';
}

function getStateCategory(state) {
    if (!state) return '';
    const note = state.note || '';
    const explicit = getTagVal(note, 'State Category') || getTagVal(note, 'NUSV Category') || getTagVal(note, 'NUSV Type');
    if (explicit) {
        if (/passive/i.test(explicit) || explicit === '3') return 'Passive';
        if (/status/i.test(explicit) || explicit === '2') return 'Status Effect';
        if (/skill/i.test(explicit) || explicit === '1') return 'Skill Effect';
        return explicit;
    }
    const name = (state.name || '').toLowerCase();
    const noteLower = note.toLowerCase();
    if (noteLower.includes('passive') || name.includes('passive') || name.includes('mastery') || name.includes('instinct') || name.includes('reflex') || name.includes('covenant') || state.id >= 180) {
        return 'Passive';
    }
    const statusKeywords = ['poison', 'burn', 'bleed', 'paralyze', 'sleep', 'confuse', 'curse', 'stun', 'chill', 'freeze', 'blind', 'fear', 'silence', 'root', 'death', 'ailment'];
    if (statusKeywords.some(kw => name.includes(kw))) {
        return 'Status Effect';
    }
    return 'Skill Effect';
}

function getSkillClassIds(skillId) {
    const list = [];
    (State.classes || []).forEach(c => {
        if (!c || !c.learnings) return;
        if (c.learnings.some(l => l.skillId === skillId)) {
            list.push(c.id);
        }
    });
    return list;
}


function getRarityColor(rarity) {
    switch (String(rarity || '').toLowerCase()) {
        case 'uncommon': return '#22c55e'; // Green
        case 'rare': return '#38bdf8';     // Cyan/Blue
        case 'epic': return '#c084fc';     // Purple
        case 'legendary': return '#f59e0b';// Gold/Orange
        case 'mythic': return '#ef4444';   // Crimson/Red
        default: return '#94a3b8';         // Silver/Gray (Common)
    }
}

function getSkillTier(skill) {
    if (!skill || !skill.note) return 0;
    const m = skill.note.match(/<Skill Tier:\s*(\d+)>/i);
    return m ? parseInt(m[1], 10) : 0;
}

function getSkillTmCompatibleClasses(skill) {
    if (!skill || !skill.note) return [];
    const m = skill.note.match(/<(?:Scroll|TM) Compatible:\s*([^>]+)>/i);
    if (!m) return [];
    return m[1].split(',').map(s => s.trim()).filter(Boolean);
}

function isSkillExclusive(skill) {
    if (!skill || !skill.note) return false;
    return /<(?:Scroll|TM) Status:\s*Exclusive>/i.test(skill.note) ||
           /<Skill Type:\s*Ultimate>/i.test(skill.note);
}

function getSkillTmItem(skillId) {
    if (!State.items) return null;
    return State.items.find(it => it && it.effects && it.effects.some(e => e.code === 43 && e.dataId === skillId)) || null;
}

function renderIconInline(iconIndex, size = 24) {
    const safeIdx = parseInt(iconIndex, 10) || 0;
    const col = safeIdx % 16;
    const row = Math.floor(safeIdx / 16);
    const bgX = -col * 32;
    const bgY = -row * 32;
    const scale = size / 32;
    return `
        <div style="width:${size}px; height:${size}px; overflow:hidden; display:inline-block; vertical-align:middle; flex-shrink:0; border-radius:4px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08);">
            <div class="icon-preview-sheet" style="background-position: ${bgX}px ${bgY}px; transform: scale(${scale}); transform-origin: 0 0; width:32px; height:32px;"></div>
        </div>
    `;
}

function getClassCompatibleScrollItems(className) {
    if (!className || !State.items) return [];
    const target = className.trim().toLowerCase();
    const shortTarget = target.replace(/^elementalist\s*-\s*/i, '');
    const list = [];
    const seenSkillIds = new Set();
    
    for (const it of State.items) {
        if (!it || !it.note) continue;
        const m = it.note.match(/<(?:Scroll|TM) Compatible:\s*([^>]+)>/i);
        if (!m) continue;
        const classes = m[1].split(',').map(s => s.trim().toLowerCase());
        const isCompat = classes.includes(target) || 
                         classes.includes(shortTarget) || 
                         classes.some(c => c.replace(/^elementalist\s*-\s*/i, '') === shortTarget) ||
                         classes.includes('all');
        if (isCompat) {
            const eff = (it.effects || []).find(e => e.code === 43);
            const skillId = eff ? eff.dataId : 0;
            if (skillId && !seenSkillIds.has(skillId)) {
                seenSkillIds.add(skillId);
                const skill = State.skills ? State.skills[skillId] : null;
                list.push({ item: it, skill: skill });
            }
        }
    }
    return list;
}

function navigateToSkill(skillId) {
    if (!skillId) return;
    if (typeof switchTab === 'function') {
        switchTab('skills');
        State.selectedIndex = skillId;
        if (typeof renderSidebar === 'function') renderSidebar();
        if (typeof renderEditor === 'function') renderEditor();
        showToast(`Membuka Skill #${skillId}`, 'info');
    }
}

function navigateToItem(itemId) {
    if (!itemId) return;
    if (typeof switchTab === 'function') {
        switchTab('items');
        State.selectedIndex = itemId;
        if (typeof renderSidebar === 'function') renderSidebar();
        if (typeof renderEditor === 'function') renderEditor();
        showToast(`Membuka Item #${itemId}`, 'info');
    }
}
