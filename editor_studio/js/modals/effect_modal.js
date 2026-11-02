/**
 * NUSV Database Studio - Modal Controller: modals/effect_modal.js
 */

let currentEffectEditingIdx = -1;


let currentEffectItemRef = null;



function renderEffectsCard(item) {
    const effects = item.effects || [];
    return `
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 title="Efek-efek khusus saat skill atau item ini berhasil diluncurkan">✨ RPG Maker MV Effects (${effects.length})</h2>
                    <div style="font-size:0.75rem; color:var(--text-muted);">HP/MP Recovery, Apply/Remove State, Buff/Debuff, Common Event trigger, etc.</div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="openEffectModal(-1)" title="Tambah efek baru">➕ Add Effect</button>
            </div>
            <div class="card-body">
                ${effects.length === 0 ? `<div style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Belum ada efek tambahan. Klik "+ Add Effect" untuk menambahkan aksi pemulihan, status, buff, atau common event.</div>` : `
                    <table class="data-table" style="font-size:0.85rem; width:100%;">
                        <thead>
                            <tr>
                                <th style="width:25%;">Kategori</th>
                                <th>Rincian Efek</th>
                                <th style="width:110px; text-align:right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${effects.map((eff, idx) => `
                                <tr>
                                    <td><span class="badge-cat">${(((typeof EFFECT_CATEGORIES !== 'undefined' ? EFFECT_CATEGORIES : {})[eff.code])||{}).cat || 'Effect'}</span> <strong style="font-size:0.8rem; color:#94a3b8;">#${eff.code}</strong></td>
                                    <td>${formatEffect(eff)}</td>
                                    <td style="text-align:right;">
                                        <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" onclick="openEffectModal(${idx})" title="Edit efek ini">✏️</button>
                                        <button type="button" class="btn btn-danger btn-sm" style="padding:2px 6px;" onclick="removeEffect(${idx})" title="Hapus efek ini">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>
        </div>
    `;
}



function openEffectModal(idx) {
    const item = getActiveItem();
    if (!item) return;
    item.effects = item.effects || [];
    currentEffectEditingIdx = idx;
    currentEffectItemRef = item;

    const codeSelect = document.getElementById('effectCodeSelect');
    const effCategories = (typeof EFFECT_CATEGORIES !== 'undefined' ? EFFECT_CATEGORIES : {}); codeSelect.innerHTML = Object.keys(effCategories).map(k => `
        <option value="${k}">[${effCategories[k].cat}] ${effCategories[k].name}</option>
    `).join('');

    if (idx >= 0 && item.effects[idx]) {
        codeSelect.value = item.effects[idx].code;
    } else {
        codeSelect.value = '11';
    }
    onEffectCodeChange();
    openModal('effectModal');
}



function onEffectCodeChange() {
    const code = parseInt(document.getElementById('effectCodeSelect').value, 10);
    const effCategories = (typeof EFFECT_CATEGORIES !== 'undefined' ? EFFECT_CATEGORIES : {}); const def = effCategories[code] || {};
    const container = document.getElementById('effectValueContainer');
    const eff = (currentEffectEditingIdx >= 0 && currentEffectItemRef.effects[currentEffectEditingIdx]) ? currentEffectItemRef.effects[currentEffectEditingIdx] : { code: code, dataId: 0, value1: 0, value2: 0 };

    let html = '';
    if (def.isHpRecover || def.isMpRecover) {
        const pct = Math.round((eff.value1 || 0) * 100);
        html += `
            <div class="grid-2">
                <div class="form-group">
                    <label>Pemulihan Persentase (%)</label>
                    <input type="number" id="effVal1" class="form-control" value="${pct}">
                </div>
                <div class="form-group">
                    <label>Pemulihan Poin Tetap (Flat Points)</label>
                    <input type="number" id="effVal2" class="form-control" value="${eff.value2 || 0}">
                </div>
            </div>
        `;
    } else if (def.isTpGain) {
        html += `
            <div class="form-group">
                <label>Jumlah SP (Stamina Points) yang Didapat</label>
                <input type="number" min="0" max="100" id="effVal1" class="form-control" value="${eff.value1 || 10}">
            </div>
        `;
    } else if (code === 21 || code === 22) {
        html += `
            <div class="form-group">
                <label>Pilih Status Efek (State)</label>
                <select id="effDataId" class="form-control">
                    ${State.states.filter(s => s).map(s => `<option value="${s.id}" ${eff.dataId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Peluang Keberhasilan (%)</label>
                <input type="number" min="0" max="100" id="effVal1" class="form-control" value="${Math.round((eff.value1 !== undefined ? eff.value1 : 1.0) * 100)}">
            </div>
        `;
    } else if (code === 31 || code === 32) {
        html += `
            <div class="form-group">
                <label>Pilih Parameter</label>
                <select id="effDataId" class="form-control">
                    ${PARAM_DEFS.map(p => `<option value="${p.id}" ${eff.dataId === p.id ? 'selected' : ''}>${p.icon} ${p.code} (${p.name})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Durasi Efek (Jumlah Turn Giliran)</label>
                <input type="number" min="1" max="99" id="effVal1" class="form-control" value="${eff.value1 || 3}">
            </div>
        `;
    } else if (code === 33 || code === 34 || code === 42) {
        html += `
            <div class="form-group">
                <label>Pilih Parameter</label>
                <select id="effDataId" class="form-control">
                    ${PARAM_DEFS.map(p => `<option value="${p.id}" ${eff.dataId === p.id ? 'selected' : ''}>${p.icon} ${p.code} (${p.name})</option>`).join('')}
                </select>
            </div>
        `;
        if (code === 42) {
            html += `
                <div class="form-group">
                    <label>Poin Peningkatan Permanen</label>
                    <input type="number" min="1" id="effVal1" class="form-control" value="${eff.value1 || 1}">
                </div>
            `;
        }
    } else if (code === 43) {
        html += `
            <div class="form-group">
                <label>Pilih Skill yang Dipelajari</label>
                <select id="effDataId" class="form-control">
                    ${State.skills.filter(s => s).map(s => `<option value="${s.id}" ${eff.dataId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (code === 44) {
        html += `
            <div class="form-group">
                <label>Pilih Common Event yang Dijalankan</label>
                <select id="effDataId" class="form-control">
                    ${(State.commonEvents||[]).filter(c => c).map(c => `<option value="${c.id}" ${eff.dataId === c.id ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`).join('')}
                </select>
            </div>
        `;
    }
    container.innerHTML = html;
}



function applyEffectFromModal() {
    if (!currentEffectItemRef) return;
    const code = parseInt(document.getElementById('effectCodeSelect').value, 10);
    const effCategories = (typeof EFFECT_CATEGORIES !== 'undefined' ? EFFECT_CATEGORIES : {}); const def = effCategories[code] || {};
    const dataIdEl = document.getElementById('effDataId');
    const dataId = dataIdEl ? parseInt(dataIdEl.value, 10) : 0;
    const v1El = document.getElementById('effVal1');
    const v2El = document.getElementById('effVal2');
    let v1 = 0;
    let v2 = 0;

    if (def.isHpRecover || def.isMpRecover) {
        v1 = (parseFloat(v1El ? v1El.value : 0) || 0) / 100;
        v2 = parseInt(v2El ? v2El.value : 0, 10) || 0;
    } else if (def.isTpGain || code === 42) {
        v1 = parseInt(v1El ? v1El.value : 0, 10) || 0;
    } else if (code === 21 || code === 22) {
        v1 = (parseFloat(v1El ? v1El.value : 100) || 0) / 100;
    } else if (code === 31 || code === 32) {
        v1 = parseInt(v1El ? v1El.value : 1, 10) || 1;
    }

    const newEff = { code: code, dataId: dataId, value1: v1, value2: v2 };
    if (currentEffectEditingIdx >= 0 && currentEffectEditingIdx < currentEffectItemRef.effects.length) {
        currentEffectItemRef.effects[currentEffectEditingIdx] = newEff;
    } else {
        currentEffectItemRef.effects.push(newEff);
    }

    closeModal('effectModal');
    setUnsaved(true);
    renderEditor();
    showToast("Efek berhasil disimpan!");
}



function removeEffect(idx) {
    const item = getActiveItem();
    if (!item || !item.effects) return;
    item.effects.splice(idx, 1);
    setUnsaved(true);
    renderEditor();
    showToast("Efek dihapus.");
}

// --- CLASS PARAMETER CURVES GENERATOR ---
