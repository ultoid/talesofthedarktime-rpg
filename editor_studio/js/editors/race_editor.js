/**
 * NUSV Database Studio - Entity Editor: editors/race_editor.js
 * Manages Race profiles, Nature stat modifiers (▲ +10%, ● 100%, ▼ -10%),
 * Racial Signature Abilities, and automatic synchronization with RPG Maker States.
 */

function onRaceFieldChange(race, field, val) {
    if (!race) return;
    race[field] = val;
    setUnsaved(true);
    updateRaceStateSync(race);
    renderSidebar();
}

function onRaceModifierChange(race, statKey, mode) {
    if (!race) return;
    race.modifiers = race.modifiers || { str: 1.0, int: 1.0, dex: 1.0, luk: 1.0, agi: 1.0, vit: 1.0 };
    race.natureTags = race.natureTags || { str: '=', int: '=', dex: '=', luk: '=', agi: '=', vit: '=' };

    const k = statKey.toLowerCase();
    if (mode === '+') {
        race.modifiers[k] = 1.10;
        race.natureTags[k] = '+';
    } else if (mode === '-') {
        race.modifiers[k] = 0.90;
        race.natureTags[k] = '-';
    } else {
        race.modifiers[k] = 1.00;
        race.natureTags[k] = '=';
    }

    setUnsaved(true);
    updateRaceStateSync(race);

    // Re-render UI & Preview
    const container = document.getElementById('panelContainer');
    if (container) renderRaceEditor(container, race);
    const previewContainer = document.getElementById('statPreviewContainer');
    if (previewContainer) renderRaceStatPreview(previewContainer, race);
    renderSidebar();
}

function updateRaceStateSync(race) {
    if (!race || !race.stateId || !State.states || !State.states[race.stateId]) return;
    const st = State.states[race.stateId];
    st.name = `Ras: ${race.name}`;
    st.iconIndex = race.iconIndex || 0;

    const mods = race.modifiers || {};
    const strRate = (mods.str || 1.0).toFixed(2);
    const intRate = (mods.int || 1.0).toFixed(2);
    const dexRate = (mods.dex || 1.0).toFixed(2);
    const lukRate = (mods.luk || 1.0).toFixed(2);
    const agiRate = (mods.agi || 1.0).toFixed(2);
    const vitRate = (mods.vit || 1.0).toFixed(2);

    const noteLines = [
        `<Race: ${race.name}>`,
        `<Race Key: ${race.name.toLowerCase()}>`,
        `<Race Group: ${race.group || 'Suku Bumi'}>`,
        `<STR Rate: ${strRate}>`,
        `<INT Rate: ${intRate}>`,
        `<DEX Rate: ${dexRate}>`,
        `<LUK Rate: ${lukRate}>`,
        `<AGI Rate: ${agiRate}>`,
        `<VIT Rate: ${vitRate}>`,
        `<Description>\n${race.description || ''}\n</Description>`
    ];

    st.note = noteLines.join('\n');
    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('states');
    State.modifiedTabs.add('races');
}

function getRacialSynergies(race) {
    if (!race || !race.natureTags) return [];
    const tags = race.natureTags;
    const synergies = [];

    if (tags.str === '+' && tags.vit === '+') synergies.push('Warrior', 'Berserker', 'Champion', 'Squire');
    else if (tags.str === '+') synergies.push('Warrior', 'Berserker', 'Dragoon', 'Mercenary');
    
    if (tags.int === '+' && tags.agi === '+') synergies.push('Aeromancer', 'Mage', 'Magician');
    else if (tags.int === '+' && tags.luk === '+') synergies.push('Warlock', 'Necromancer', 'Occultist');
    else if (tags.int === '+') synergies.push('Archmage', 'Pyromancer', 'Mage', 'Acolyte');

    if (tags.agi === '+' && tags.dex === '+') synergies.push('Scout', 'Archer', 'Thief', 'Rogue', 'Assassin', 'Windrunner');
    else if (tags.dex === '+') synergies.push('Sniper', 'Ranger', 'Archer');
    else if (tags.agi === '+') synergies.push('Monk', 'Brahma', 'Shadow Walker');

    if (tags.vit === '+' && tags.int === '+') synergies.push('Paladin', 'Holy Knight', 'High Priest', 'Cleric');
    else if (tags.vit === '+') synergies.push('Knight', 'Shield Protector');

    if (tags.str === '=' && tags.int === '=' && tags.agi === '=') {
        synergies.push('Semua Profesi (Adaptif Sempurna)');
    }

    return Array.from(new Set(synergies)).slice(0, 5);
}

function renderRaceEditor(container, race) {
    if (!race) return;

    const groupColors = {
        'Suku Bumi': '#38bdf8',
        'Wuru Loka': '#f59e0b',
        'Arkahyan': '#ec4899',
        'Drahkthar': '#a855f7'
    };
    const groupColor = groupColors[race.group] || '#38bdf8';
    const mods = race.modifiers || { str: 1.0, int: 1.0, dex: 1.0, luk: 1.0, agi: 1.0, vit: 1.0 };
    const tags = race.natureTags || { str: '=', int: '=', dex: '=', luk: '=', agi: '=' };
    const synergies = getRacialSynergies(race);

    container.innerHTML = `
        <!-- HEADER IDENTITY -->
        <div class="card" style="border-top: 4px solid ${groupColor};">
            <div class="card-header">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h2 style="font-size:1.3rem; font-weight:800; color:#fff;">🧬 ${escapeHtml(race.name)}</h2>
                        <span class="badge" style="background:${groupColor}22; color:${groupColor}; border:1px solid ${groupColor}44; font-weight:700;">
                            ${escapeHtml(race.group || 'Suku Bumi')}
                        </span>
                        <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-muted);">
                            State ID: #${race.stateId || '—'}
                        </span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                        ${escapeHtml(race.englishName || race.name)} — Ras &amp; Karakteristik Fisiologis Alam Nusvanir
                    </p>
                </div>
            </div>
            <div class="card-body">
                <div class="grid-3">
                    <div class="form-group">
                        <label>Nama Resmi Ras</label>
                        <input type="text" class="form-control" value="${escapeHtml(race.name || '')}" 
                               onchange="onRaceFieldChange(window.currentItem, 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Nama Internasional / Sub-Ras</label>
                        <input type="text" class="form-control" value="${escapeHtml(race.englishName || '')}" 
                               onchange="onRaceFieldChange(window.currentItem, 'englishName', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Golongan Alam (Realm / Group)</label>
                        <select class="form-control" onchange="onRaceFieldChange(window.currentItem, 'group', this.value)">
                            <option value="Suku Bumi" ${race.group === 'Suku Bumi' ? 'selected' : ''}>Suku Bumi (Daratan Utama)</option>
                            <option value="Wuru Loka" ${race.group === 'Wuru Loka' ? 'selected' : ''}>Wuru Loka (Makhluk Eksotis / Liar)</option>
                            <option value="Arkahyan" ${race.group === 'Arkahyan' ? 'selected' : ''}>Arkahyan (Surgawi / Cahaya)</option>
                            <option value="Drahkthar" ${race.group === 'Drahkthar' ? 'selected' : ''}>Drahkthar (Entitas Gelap / Iblis)</option>
                        </select>
                    </div>
                </div>

                <div class="grid-2" style="margin-top:12px;">
                    <div class="form-group">
                        <label>Icon Index RPG Maker</label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="number" class="form-control" style="width:100px; text-align:center; font-weight:700;" 
                                   value="${race.iconIndex || 0}" 
                                   onchange="onRaceFieldChange(window.currentItem, 'iconIndex', parseInt(this.value, 10) || 0)">
                            <button class="btn btn-secondary btn-sm" onclick="openIconPicker((idx) => { onRaceFieldChange(window.currentItem, 'iconIndex', idx); renderRaceEditor(container, window.currentItem); })">
                                🎨 Pilih Icon (#${race.iconIndex || 0})
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>State Link RPG Maker</label>
                        <input type="number" class="form-control" style="width:120px; text-align:center; font-weight:700;" 
                               value="${race.stateId || 0}" 
                               onchange="onRaceFieldChange(window.currentItem, 'stateId', parseInt(this.value, 10) || 0)">
                    </div>
                </div>
            </div>
        </div>

        <!-- NATURE STAT MODIFIER MATRIX -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 style="font-size:1.1rem; font-weight:700; color:#fff;">📊 Nature Stat Matrix (Modifikasi 6 Core Stats)</h2>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                        Mempengaruhi total stat akhir karakter secara persentase (<span style="color:#10b981; font-weight:700;">▲ +10%</span>, 
                        <span style="color:#94a3b8; font-weight:700;">● Netral 100%</span>, atau 
                        <span style="color:#ef4444; font-weight:700;">▼ -10%</span>).
                    </p>
                </div>
            </div>
            <div class="card-body">
                <div class="stat-grid-6">
                    ${CORE_ATTRIBUTES.map(attr => {
                        const code = attr.code.toLowerCase();
                        const tag = tags[code] || '=';
                        const modVal = mods[code] || 1.0;

                        let badgeColor = '#64748b';
                        let badgeText = '● Netral (1.00x)';
                        if (tag === '+') {
                            badgeColor = '#10b981';
                            badgeText = '▲ Naik (+10%)';
                        } else if (tag === '-') {
                            badgeColor = '#ef4444';
                            badgeText = '▼ Turun (-10%)';
                        }

                        return `
                            <div class="stat-card-input" style="border-left: 3px solid ${attr.color}; display:flex; flex-direction:column; justify-content:space-between; min-height:140px; padding:10px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <span style="color:${attr.color}; font-weight:800; font-size:0.9rem;">${attr.icon} ${attr.code}</span>
                                        <span class="badge" style="background:${badgeColor}22; color:${badgeColor}; border:1px solid ${badgeColor}55; font-size:0.7rem; font-weight:700; padding:2px 6px;">
                                            ${badgeText}
                                        </span>
                                    </div>
                                    <div style="font-size:0.72rem; color:var(--text-muted);">${attr.name}</div>
                                </div>

                                <div style="margin-top:10px;">
                                    <div style="display:flex; gap:4px; justify-content:space-between;">
                                        <button class="btn btn-sm ${tag === '+' ? 'btn-primary' : 'btn-secondary'}" 
                                                style="flex:1; padding:4px 2px; font-size:0.75rem; font-weight:700; ${tag === '+' ? 'background:#10b981; border-color:#059669;' : ''}"
                                                onclick="onRaceModifierChange(window.currentItem, '${code}', '+')" title="Bonus +10% ${attr.name}">
                                            ▲ +10%
                                        </button>
                                        <button class="btn btn-sm ${tag === '=' ? 'btn-primary' : 'btn-secondary'}" 
                                                style="flex:1; padding:4px 2px; font-size:0.75rem; font-weight:700; ${tag === '=' ? 'background:#475569; border-color:#334155;' : ''}"
                                                onclick="onRaceModifierChange(window.currentItem, '${code}', '=')" title="Netral (100%)">
                                            ● 0%
                                        </button>
                                        <button class="btn btn-sm ${tag === '-' ? 'btn-primary' : 'btn-secondary'}" 
                                                style="flex:1; padding:4px 2px; font-size:0.75rem; font-weight:700; ${tag === '-' ? 'background:#ef4444; border-color:#dc2626;' : ''}"
                                                onclick="onRaceModifierChange(window.currentItem, '${code}', '-')" title="Penalti -10% ${attr.name}">
                                            ▼ -10%
                                        </button>
                                    </div>
                                    <div style="font-size:0.7rem; text-align:center; color:var(--text-muted); margin-top:5px; font-family:monospace;">
                                        Multiplier: <strong>${modVal.toFixed(2)}x</strong>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- LORE & DESKRIPSI DUNIA NUSVANIR -->
        <div class="card">
            <div class="card-header">
                <h2 style="font-size:1.1rem; font-weight:700; color:#fff;">📜 Lore &amp; Fisiologi Ras (Nusvanir Compendium)</h2>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <textarea class="form-control" rows="4" style="line-height:1.5; font-size:0.88rem;"
                              placeholder="Deskripsi peradaban, fisiologi, umur biologis, dan peran dalam dunia Nusvanir..."
                              onchange="onRaceFieldChange(window.currentItem, 'description', this.value)">${escapeHtml(race.description || '')}</textarea>
                </div>
                <div style="margin-top:10px; background:rgba(0,0,0,0.2); border-radius:6px; padding:10px;">
                    <div style="font-size:0.78rem; font-weight:700; color:#38bdf8; margin-bottom:4px;">🎯 Rekomendasi Sinergi Profesi:</div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        ${synergies.map(s => `<span class="badge" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; font-size:0.75rem;">${escapeHtml(s)}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRaceStatPreview(container, race) {
    if (!race) return;

    const groupColors = {
        'Suku Bumi': '#38bdf8',
        'Wuru Loka': '#f59e0b',
        'Arkahyan': '#ec4899',
        'Drahkthar': '#a855f7'
    };
    const groupColor = groupColors[race.group] || '#38bdf8';
    const mods = race.modifiers || { str: 1.0, int: 1.0, dex: 1.0, luk: 1.0, agi: 1.0, vit: 1.0 };
    const tags = race.natureTags || {};

    const upStats = CORE_ATTRIBUTES.filter(a => tags[a.code.toLowerCase()] === '+');
    const downStats = CORE_ATTRIBUTES.filter(a => tags[a.code.toLowerCase()] === '-');
    const neutralStats = CORE_ATTRIBUTES.filter(a => tags[a.code.toLowerCase()] === '=');

    container.innerHTML = `
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:16px;">
            <div style="text-align:center; padding-bottom:12px; border-bottom:1px solid #1e293b; margin-bottom:12px;">
                <div style="font-size:2rem; margin-bottom:4px;">🧬</div>
                <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">${escapeHtml(race.name)}</h3>
                <span class="badge" style="background:${groupColor}22; color:${groupColor}; border:1px solid ${groupColor}44; font-size:0.75rem;">
                    ${escapeHtml(race.group || 'Suku Bumi')}
                </span>
            </div>

            <!-- NATURE MATRIX SUMMARY -->
            <div style="margin-bottom:16px;">
                <div style="font-size:0.8rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">
                    Racial Stat Affinities
                </div>
                
                <div style="background:#1e293b; border-radius:6px; padding:8px 12px; margin-bottom:6px;">
                    <span style="color:#10b981; font-weight:700; font-size:0.82rem;">▲ Keunggulan (+10%):</span>
                    <div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                        ${upStats.length ? upStats.map(s => `<span class="badge" style="background:#10b98122; color:#34d399; border:1px solid #10b98144;">${s.icon} ${s.code}</span>`).join('') : '<span style="font-size:0.75rem; color:#64748b;">Tidak ada</span>'}
                    </div>
                </div>

                <div style="background:#1e293b; border-radius:6px; padding:8px 12px; margin-bottom:6px;">
                    <span style="color:#ef4444; font-weight:700; font-size:0.82rem;">▼ Kelemahan (-10%):</span>
                    <div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                        ${downStats.length ? downStats.map(s => `<span class="badge" style="background:#ef444422; color:#f87171; border:1px solid #ef444444;">${s.icon} ${s.code}</span>`).join('') : '<span style="font-size:0.75rem; color:#64748b;">Tidak ada</span>'}
                    </div>
                </div>

                <div style="background:#1e293b; border-radius:6px; padding:8px 12px;">
                    <span style="color:#94a3b8; font-weight:700; font-size:0.82rem;">● Netral (100%):</span>
                    <div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                        ${neutralStats.map(s => `<span class="badge" style="background:#334155; color:#cbd5e1;">${s.icon} ${s.code}</span>`).join('')}
                    </div>
                </div>
            </div>

            <!-- RPG MAKER STATE LINK -->
            <div style="font-size:0.72rem; color:#64748b; text-align:center;">
                Tersinkronisasi ke State ID: <strong>#${race.stateId || '—'}</strong>
            </div>
        </div>
    `;
}

