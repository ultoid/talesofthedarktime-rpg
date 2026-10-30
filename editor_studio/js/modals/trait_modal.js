/**
 * NUSV Database Studio - Modal Controller: modals/trait_modal.js
 */

let activeTraitTab = 'Rate';


let activeTraitCode = 11;


let currentTraitEditingIdx = -1;


let currentTraitItemRef = null;



function getTabForTraitCode(code) {
    for (const [tab, list] of Object.entries(TRAIT_TAB_DEFS)) {
        if (list.some(item => item.code === code)) return tab;
    }
    return 'Rate';
}



function renderTraitsCard(item, tab) {
    const traits = item.traits || [];
    return `
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 title="Ciri khas (Traits) RPG Maker MV & NUSV: ketahanan elemen, status, buff/debuff, dan fitur khusus battler">🧬 Traits / Ciri Khas (${traits.length})</h2>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Element Rate, Parameter Scaling, Ex/Sp-Params, Equip Slots, etc.</div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="openTraitModal(-1)" title="Tambah trait baru">➕ Add Trait</button>
            </div>
            <div class="card-body">
                ${traits.length === 0 ? `<div style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Belum ada Trait. Klik "+ Add Trait" untuk menambahkan ciri khas.</div>` : `
                    <table class="data-table" style="font-size:0.85rem; width:100%;">
                        <thead>
                            <tr>
                                <th style="width:25%;">Kategori</th>
                                <th>Efek / Nilai Trait (NUSV Specs)</th>
                                <th style="width:110px; text-align:right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${traits.map((tr, idx) => `
                                <tr>
                                    <td><span class="badge-cat">${(TRAIT_CATEGORIES[tr.code]||{}).cat || 'Trait'}</span> <strong style="font-size:0.8rem; color:#94a3b8;">#${tr.code}</strong></td>
                                    <td>${formatTrait(tr)}</td>
                                    <td style="text-align:right;">
                                        <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;" onclick="openTraitModal(${idx})" title="Edit trait ini">✏️</button>
                                        <button type="button" class="btn btn-danger btn-sm" style="padding:2px 6px;" onclick="removeTrait(${idx})" title="Hapus trait ini">🗑️</button>
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



function renderTraitModalBody() {
    const container = document.getElementById('traitTabContainer');
    if (!container) return;

    let html = '';
    for (const [tabName, options] of Object.entries(TRAIT_TAB_DEFS)) {
        html += `<div id="traitTabPanel_${tabName}" class="trait-tab-panel" style="display:${tabName === activeTraitTab ? 'block' : 'none'};">`;
        for (const opt of options) {
            const code = opt.code;
            html += `
                <div class="trait-option-row" id="tr_row_${code}" onclick="selectTraitRadio(${code}, event)" style="display:flex; align-items:center; gap:12px; padding:9px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; margin-bottom:8px; cursor:pointer; transition:all 0.15s ease;">
                    <div style="display:flex; align-items:center;">
                        <input type="radio" name="trait_radio_option" id="tr_radio_${code}" value="${code}" onchange="onTraitRadioChange(${code})" style="cursor:pointer; transform:scale(1.2);">
                    </div>
                    <label for="tr_radio_${code}" style="min-width:130px; margin:0; font-weight:600; font-size:0.86rem; cursor:pointer; color:var(--text-bright);">${opt.label}</label>
                    <div style="flex:1; display:flex; align-items:center; gap:8px;">
            `;

            // Data selector
            if (opt.hasData === 'element') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${(State.system.elements||[]).map((el, i) => i === 0 ? '' : `<option value="${i}">#${i} ${escapeHtml(el)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'param') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${PARAM_DEFS.map(p => `<option value="${p.id}">${p.icon} ${p.code} (${p.name})</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'xparam') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${XPARAM_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'sparam') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${SPARAM_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'state') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${State.states.filter(s => s).map(s => `<option value="${s.id}">#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'stype') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${(State.system.skillTypes||[]).map((st, i) => i === 0 ? '' : `<option value="${i}">#${i} ${escapeHtml(st)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'skill') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${State.skills.filter(s => s).map(s => `<option value="${s.id}">#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'wtype') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${(State.system.weaponTypes||[]).map((wt, i) => i === 0 ? '' : `<option value="${i}">#${i} ${escapeHtml(wt)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'atype') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${(State.system.armorTypes||[]).map((at, i) => i === 0 ? '' : `<option value="${i}">#${i} ${escapeHtml(at)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'etype') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        ${(State.system.equipTypes||[]).map((et, i) => i === 0 ? '' : `<option value="${i}">#${i} ${escapeHtml(et)}</option>`).join('')}
                    </select>
                `;
            } else if (opt.hasData === 'slotType') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        <option value="1">Dual Wield (Physical &amp; Magic Rune Dual Wield)</option>
                    </select>
                `;
            } else if (opt.hasData === 'flag') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        <option value="0">Auto Battle (Battler Bertindak Otomatis)</option>
                        <option value="1">Guard (Selalu dalam Posisi Bertahan)</option>
                        <option value="2">Substitute (Melindungi Teman yang Sedang Sekarat)</option>
                        <option value="3">Preserve SP (Stamina Points Tetap Tersimpan Antar Pertarungan)</option>
                    </select>
                `;
            } else if (opt.hasData === 'collapse') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        <option value="0">Normal (Standar)</option>
                        <option value="1">Boss (Efek Hancur Boss Dramatis)</option>
                        <option value="2">Instant (Lenyap Seketika)</option>
                        <option value="3">Disappear (Tanpa Animasi)</option>
                    </select>
                `;
            } else if (opt.hasData === 'ability') {
                html += `
                    <select id="tr_data_${code}" class="form-control" style="flex:1;" onclick="event.stopPropagation();">
                        <option value="0">Encounter Half (Peluang Pertemuan Musuh Berkurang 50%)</option>
                        <option value="1">Encounter None (Bebas Pertemuan Musuh)</option>
                        <option value="2">Cancel Surprise (Cegah Serangan Kejutan Musuh)</option>
                        <option value="3">Raise Preemptive (Tingkatkan Peluang Serang Dulu)</option>
                        <option value="4">Gold Double (Emas / Uang Hasil Pertarungan x2)</option>
                        <option value="5">Drop Item Double (Peluang Drop Barang Musuh x2)</option>
                    </select>
                `;
            }

            // Value input
            if (opt.hasVal === 'percent') {
                html += `
                    <span style="font-weight:bold; color:var(--text-muted); margin:0 4px;">${opt.op || '*'}</span>
                    <div style="display:flex; align-items:center; gap:4px;" onclick="event.stopPropagation();">
                        <input type="number" id="tr_val_${code}" class="form-control" style="width:75px; text-align:right;" value="${opt.defVal !== undefined ? opt.defVal : 100}">
                        <span style="font-size:0.85rem; color:var(--text-muted);">%</span>
                    </div>
                `;
            } else if (opt.hasVal === 'percentFloat') {
                html += `
                    <span style="font-weight:bold; color:var(--text-muted); margin:0 4px;">${opt.op || '+'}</span>
                    <div style="display:flex; align-items:center; gap:4px;" onclick="event.stopPropagation();">
                        <input type="number" step="0.1" id="tr_val_${code}" class="form-control" style="width:75px; text-align:right;" value="${opt.defVal !== undefined ? opt.defVal : 0}">
                        <span style="font-size:0.85rem; color:var(--text-muted);">%</span>
                    </div>
                `;
            } else if (opt.hasVal === 'flatInt') {
                html += `
                    <span style="font-weight:bold; color:var(--text-muted); margin:0 4px;">${opt.op || '+'}</span>
                    <div style="display:flex; align-items:center; gap:4px;" onclick="event.stopPropagation();">
                        <input type="number" id="tr_val_${code}" class="form-control" style="width:75px; text-align:right;" value="${opt.defVal !== undefined ? opt.defVal : 0}">
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }
        html += `</div>`;
    }

    container.innerHTML = html;
}



function switchTraitTab(tabName) {
    activeTraitTab = tabName;
    document.querySelectorAll('.trait-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    for (const t of Object.keys(TRAIT_TAB_DEFS)) {
        const p = document.getElementById('traitTabPanel_' + t);
        if (p) p.style.display = (t === tabName) ? 'block' : 'none';
    }

    const tabOptions = TRAIT_TAB_DEFS[tabName] || [];
    const hasCurrent = tabOptions.some(o => o.code === activeTraitCode);
    if (!hasCurrent && tabOptions.length > 0) {
        selectTraitRadio(tabOptions[0].code);
    } else {
        updateTraitRadioStyles();
    }
}



function selectTraitRadio(code, event) {
    activeTraitCode = code;
    const radio = document.getElementById('tr_radio_' + code);
    if (radio) radio.checked = true;
    updateTraitRadioStyles();
}



function onTraitRadioChange(code) {
    activeTraitCode = code;
    updateTraitRadioStyles();
}



function updateTraitRadioStyles() {
    for (const [tabName, options] of Object.entries(TRAIT_TAB_DEFS)) {
        for (const opt of options) {
            const code = opt.code;
            const row = document.getElementById('tr_row_' + code);
            const radio = document.getElementById('tr_radio_' + code);
            const dataEl = document.getElementById('tr_data_' + code);
            const valEl = document.getElementById('tr_val_' + code);

            const isSelected = (code === activeTraitCode);
            if (radio) radio.checked = isSelected;

            if (row) {
                if (isSelected) {
                    row.style.borderColor = '#38bdf8';
                    row.style.background = 'rgba(56, 189, 248, 0.08)';
                    row.style.opacity = '1.0';
                } else {
                    row.style.borderColor = 'rgba(255,255,255,0.06)';
                    row.style.background = 'transparent';
                    row.style.opacity = '0.45';
                }
            }

            if (dataEl) dataEl.disabled = !isSelected;
            if (valEl) valEl.disabled = !isSelected;
        }
    }
}



function openTraitModal(idx) {
    const item = getActiveItem();
    if (!item) return;
    item.traits = item.traits || [];
    currentTraitEditingIdx = idx;
    currentTraitItemRef = item;

    renderTraitModalBody();

    if (idx >= 0 && item.traits[idx]) {
        const tr = item.traits[idx];
        const targetTab = getTabForTraitCode(tr.code);
        switchTraitTab(targetTab);
        activeTraitCode = tr.code;

        const dataEl = document.getElementById('tr_data_' + tr.code);
        if (dataEl) dataEl.value = tr.dataId !== undefined ? tr.dataId.toString() : '0';

        const valEl = document.getElementById('tr_val_' + tr.code);
        if (valEl) {
            const opt = (TRAIT_TAB_DEFS[targetTab] || []).find(o => o.code === tr.code) || {};
            if (opt.hasVal === 'percent') {
                valEl.value = Math.round((tr.value !== undefined ? tr.value : 1.0) * 100);
            } else if (opt.hasVal === 'percentFloat') {
                valEl.value = ((tr.value !== undefined ? tr.value : 0) * 100).toFixed(1);
            } else if (opt.hasVal === 'flatInt') {
                valEl.value = tr.value !== undefined ? tr.value : 0;
            }
        }
    } else {
        switchTraitTab('Rate');
        selectTraitRadio(11);
    }

    updateTraitRadioStyles();
    openModal('traitModal');
}



function applyTraitFromModal() {
    if (!currentTraitItemRef) return;
    const code = activeTraitCode;
    const tabName = getTabForTraitCode(code);
    const opt = (TRAIT_TAB_DEFS[tabName] || []).find(o => o.code === code) || {};

    const dataEl = document.getElementById('tr_data_' + code);
    const dataId = dataEl ? parseInt(dataEl.value, 10) : 0;

    const valEl = document.getElementById('tr_val_' + code);
    let value = 0;

    if (opt.hasVal === 'percent') {
        value = (parseFloat(valEl ? valEl.value : 100) || 0) / 100;
    } else if (opt.hasVal === 'percentFloat') {
        value = (parseFloat(valEl ? valEl.value : 0) || 0) / 100;
    } else if (opt.hasVal === 'flatInt') {
        value = parseInt(valEl ? valEl.value : 0, 10) || 0;
    } else if (opt.hasData === 'slotType') {
        value = 1;
    }

    const newTrait = { code: code, dataId: dataId, value: value };
    if (currentTraitEditingIdx >= 0 && currentTraitEditingIdx < currentTraitItemRef.traits.length) {
        currentTraitItemRef.traits[currentTraitEditingIdx] = newTrait;
    } else {
        currentTraitItemRef.traits.push(newTrait);
    }

    closeModal('traitModal');
    setUnsaved(true);
    renderEditor();
    showToast("Trait berhasil disimpan!");
}



function removeTrait(idx) {
    const item = getActiveItem();
    if (!item || !item.traits) return;
    item.traits.splice(idx, 1);
    setUnsaved(true);
    renderEditor();
    showToast("Trait dihapus.");
}

// --- EFFECTS CARD & MODAL HANDLER (SKILLS & ITEMS) ---
