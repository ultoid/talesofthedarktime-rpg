/**
 * NUSV Database Studio - Entity Editor: editors/state_editor.js
 */

function renderStateStatPreview(container, state) {
    if (!state) return;
    container.innerHTML = `
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <div style="font-size:0.75rem; color:#ec4899; font-weight:700;">State / Status Effect</div>
                    <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${state.id} ${escapeHtml(state.name || 'Unnamed')}</h2>
                </div>
                <span class="badge" style="background:#ec489922; color:#ec4899; border:1px solid #ec489955; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                    Priority: ${state.priority || 0}
                </span>
            </div>
            <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);"><i class="pai-clock"></i> Duration:</span>
                        <strong style="color:#f8fafc;">${state.minTurns === state.maxTurns ? `${state.minTurns} Turns` : `${state.minTurns} - ${state.maxTurns} Turns`}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);"><i class="pai-sword"></i> Remove by Damage:</span>
                        <strong style="color:#facc15;">${state.removeByDamage ? `${state.chanceByDamage}%` : 'No'}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);"><i class="pai-speed-fast"></i> Remove by Walking:</span>
                        <strong style="color:#38bdf8;">${state.removeByWalking ? `${state.stepsToRemove} Steps` : 'No'}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =====================================================================
// 3. WEAPONS EDITOR (MERGED NUSV STAT SYSTEM)
// =====================================================================


function renderStateEditor(container, state) {
    const note = state.note || '';
    const currentCat = getStateCategory(state);
    const currentDesc = getTagVal(note, 'NUSV Desc', state.description || '');

    const critDmg = getTagVal(note, 'Critical Damage', '');
    const armPen = getTagVal(note, 'Armor Penetration', '');
    const magPen = getTagVal(note, 'Magic Penetration', '');
    const pdr = getTagVal(note, 'PDR Plus', '');
    const mdr = getTagVal(note, 'MDR Plus', '');
    const hit = getTagVal(note, 'HIT Plus', '');
    const eva = getTagVal(note, 'EVA Plus', '');
    const cri = getTagVal(note, 'CRI Plus', '');
    const grd = getTagVal(note, 'GRD Plus', '');
    const cnt = getTagVal(note, 'CNT Plus', '');

    const coreBonuses = {};
    CORE_ATTRIBUTES.forEach(a => {
        coreBonuses[a.code] = getTagVal(note, a.code, '');
    });
    const maxSpBonus = getTagVal(note, 'Max SP', '');

    const RESTRICTIONS = {
        0: 'None (Free Action)',
        1: 'Attack an Enemy',
        2: 'Attack Anyone',
        3: 'Serang Teman (Attack Ally)',
        4: 'Cannot Move'
    };

    const REMOVAL_TIMINGS = {
        0: 'Tidak Otomatis (None)',
        1: 'Akhir Aksi Battler (Action End)',
        2: 'Akhir Putaran Turn (Turn End)'
    };

    container.innerHTML = `
        <!-- STATE IDENTITY & RESTRICTIONS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan efek status, buff, debuff, dan durasi"><i class="pai-diamond-gem"></i> State: #${state.id} ${escapeHtml(state.name)}</h2>
                <span style="font-size:0.85rem; color:var(--text-muted);">Prioritas: ${state.priority}</span>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama status efek yang ditampilkan saat pertarungan atau menu status">State Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(state.name || '')}" onchange="state.name=this.value; setUnsaved(true); renderSidebar();">
                            </div>
${renderIconPickerField('Icon Index', state.iconIndex, "function(v){ state.iconIndex=v; setUnsaved(true); renderEditor(); }", 'Pilih ikon status dari IconSet')}
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Klasifikasi status: Passive, Status Effect, atau Skill Effect">Kategori State (&lt;State Category&gt;)</label>
                                <select class="form-control" onchange="setTagVal(state, 'State Category', this.value); setTagVal(state, 'NUSV Category', this.value); setUnsaved(true); renderSidebar();">
                                    <option value="Passive" ${currentCat === 'Passive' ? 'selected' : ''}>Passive (Kemampuan Pasif / Trait Khusus)</option>
                                    <option value="Status Effect" ${currentCat === 'Status Effect' ? 'selected' : ''}>Status Effect (Status Ailment / Kondisi Buruk)</option>
                                    <option value="Skill Effect" ${currentCat === 'Skill Effect' ? 'selected' : ''}>Skill Effect (Efek Tempur / Buff &amp; Debuff)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Urutan prioritas penulisan ikon jika battler terkena banyak status sekaligus">Display Priority (1-100)</label>
                                <input type="number" min="1" max="100" class="form-control" value="${state.priority || 50}" onchange="state.priority=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>

                        <div class="form-group">
                            <label title="Batasan aksi yang dialami battler (misal Tidak Bisa Bergerak, Serang Kawan, dll.)">Action Restriction</label>
                            <select class="form-control" onchange="state.restriction=parseInt(this.value,10); setUnsaved(true);">
                                ${Object.keys(RESTRICTIONS).map(k => `<option value="${k}" ${state.restriction === parseInt(k,10) ? 'selected' : ''}>${RESTRICTIONS[k]}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Penjelasan efek status yang muncul saat kursor diarahkan ke ikon status di game">Tooltip Description (&lt;NUSV Desc&gt;)</label>
                            <textarea class="form-control" rows="4" onchange="setTagVal(state, 'NUSV Desc', this.value);">${escapeHtml(currentDesc)}</textarea>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kapan status ini berpeluang dilepas secara otomatis (Akhir Aksi, Akhir Giliran, atau Tidak)">Auto-Removal Timing</label>
                                <select class="form-control" onchange="state.autoRemovalTiming=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(REMOVAL_TIMINGS).map(k => `<option value="${k}" ${state.autoRemovalTiming === parseInt(k,10) ? 'selected' : ''}>${REMOVAL_TIMINGS[k]}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Min Turns</label>
                                <input type="number" min="0" class="form-control" value="${state.minTurns || 1}" onchange="state.minTurns=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label>Max Turns</label>
                                <input type="number" min="0" class="form-control" value="${state.maxTurns || 1}" onchange="state.maxTurns=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>

                        <div class="grid-2" style="margin-top:6px;">
                            <label class="checkbox-label">
                                <input type="checkbox" ${state.removeAtBattleEnd ? 'checked' : ''} onchange="state.removeAtBattleEnd=this.checked; setUnsaved(true);">
                                <span title="Apakah status ini otomatis dihapus saat pertarungan berakhir">Remove at Battle End</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" ${state.removeByRestriction ? 'checked' : ''} onchange="state.removeByRestriction=this.checked; setUnsaved(true);">
                                <span title="Dilepas jika battler mengalami batasan aksi lain">Remove by Restriction</span>
                            </label>
                        </div>
                        <div class="grid-2" style="margin-top:8px;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${state.removeByDamage ? 'checked' : ''} onchange="state.removeByDamage=this.checked; setUnsaved(true); renderEditor();">
                                    <span>Remove by Damage</span>
                                </label>
                                ${state.removeByDamage ? `
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <label style="font-size:0.75rem; margin:0;">Peluang:</label>
                                        <input type="number" min="0" max="100" class="form-control" style="width:70px; padding:2px;" value="${state.chanceByDamage || 100}" onchange="state.chanceByDamage=parseInt(this.value,10); setUnsaved(true);">
                                        <span style="font-size:0.75rem;">%</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${state.removeByWalking ? 'checked' : ''} onchange="state.removeByWalking=this.checked; setUnsaved(true); renderEditor();">
                                    <span>Remove by Walking</span>
                                </label>
                                ${state.removeByWalking ? `
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <label style="font-size:0.75rem; margin:0;">Langkah:</label>
                                        <input type="number" min="1" class="form-control" style="width:80px; padding:2px;" value="${state.stepsToRemove || 100}" onchange="state.stepsToRemove=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODIFIKASI ATRIBUT NUSVANIR -->
        <div class="card">
            <div class="card-header">
                <h2><i class="pai-chart-bar-big"></i> Modifikasi Atribut Stat Nusvanir</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">&lt;STR: +X / -X&gt; etc. Active while state is afflicted on battler.</span>
            </div>
            <div class="card-body">
                <div class="stat-grid-6">
                    ${CORE_ATTRIBUTES.map(attr => `
                        <div class="stat-card-input">
                            <label style="color:${attr.color};">
                                <span>${attr.icon} ${attr.code}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                            </label>
                            ${statValueInput(coreBonuses[attr.code], false, `setTagVal(state, '${attr.code}', this.value);`)}
                        </div>
                    `).join('')}
                </div>
                <div class="form-group" style="margin-top:12px; max-width:240px;">
                    <label title="Modifikasi nilai kapasitas stamina maksimal (<Max SP: +X>)">Max SP Modifier (&lt;Max SP&gt;)</label>
                    ${statValueInput(maxSpBonus, false, `setTagVal(state, 'Max SP', this.value);`)}
                </div>
            </div>
        </div>

        <!-- MODIFIKASI TEMPUR EKSTRA -->
        <div class="card">
            <div class="card-header"><h2><i class="pai-sword"></i> Modifikasi Parameter Tempur Ekstra</h2></div>
            <div class="card-body">
                <div class="grid-3">
                    <div class="form-group">
                        <label title="Modifikasi pengali kerusakan saat menghasilkan kritikal (<Critical Damage: +X%>)">Critical Damage Modifier</label>
                        ${statValueInput(critDmg, true, `setTagVal(state, 'Critical Damage', this.value);`)}
                    </div>
                    <div class="form-group">
                        <label title="Modifikasi pengabaian persen pertahanan fisik target (<Armor Penetration: +X%>)">Armor Penetration Modifier</label>
                        ${statValueInput(armPen, true, `setTagVal(state, 'Armor Penetration', this.value);`)}
                    </div>
                    <div class="form-group">
                        <label title="Modifikasi pengabaian persen pertahanan sihir target (<Magic Penetration: +X%>)">Magic Penetration Modifier</label>
                        ${statValueInput(magPen, true, `setTagVal(state, 'Magic Penetration', this.value);`)}
                    </div>
                </div>

                <div class="grid-4" style="margin-top:10px;">
                    <div class="form-group">
                        <label title="Modifikasi pengurangan persen kerusakan fisik yang diterima (<PDR Plus: +X%>)">Physical Damage Reduction Modifier</label>
                        ${statValueInput(pdr, true, `setTagVal(state, 'PDR Plus', this.value);`)}
                    </div>
                    <div class="form-group">
                        <label title="Modifikasi pengurangan persen kerusakan sihir yang diterima (<MDR Plus: +X%>)">Magical Damage Reduction Modifier</label>
                        ${statValueInput(mdr, true, `setTagVal(state, 'MDR Plus', this.value);`)}
                    </div>
                    <div class="form-group">
                        <label title="Modifikasi akurasi serangan fisik (<HIT Plus: +X%>)">Hit Rate Modifier</label>
                        ${statValueInput(hit, true, `setTagVal(state, 'HIT Plus', this.value);`)}
                    </div>
                    <div class="form-group">
                        <label title="Modifikasi peluang menghindari serangan fisik (<EVA Plus: +X%>)">Evasion Rate Modifier</label>
                        ${statValueInput(eva, true, `setTagVal(state, 'EVA Plus', this.value);`)}
                    </div>
                </div>
            </div>
        </div>

        
        <!-- BATTLE LOG MESSAGES -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pesan teks yang muncul di log pertempuran saat status aktif atau sembuh"><i class="pai-message"></i> Battle Log Messages</h2>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div class="form-group">
                        <label title="Saat pahlawan/kawan terkena status">%1 = Nama Karakter Terkena Status</label>
                        <input type="text" class="form-control" placeholder="%1 terkena racun!" value="${escapeHtml(state.message1 || '')}" onchange="state.message1=this.value; setUnsaved(true);">
                    </div>
                    <div class="form-group">
                        <label title="Saat musuh terkena status">%1 = Nama Musuh Terkena Status</label>
                        <input type="text" class="form-control" placeholder="%1 terkena racun!" value="${escapeHtml(state.message2 || '')}" onchange="state.message2=this.value; setUnsaved(true);">
                    </div>
                </div>
                <div class="grid-2" style="margin-top:10px;">
                    <div class="form-group">
                        <label title="Pesan saat status masih bertahan">%1 = Nama Battler Masih Terpengaruh</label>
                        <input type="text" class="form-control" placeholder="%1 masih teracuni!" value="${escapeHtml(state.message3 || '')}" onchange="state.message3=this.value; setUnsaved(true);">
                    </div>
                    <div class="form-group">
                        <label title="Pesan saat status terangkat/sembuh">%1 = Nama Battler Sembuh</label>
                        <input type="text" class="form-control" placeholder="Racun pada %1 telah sembuh!" value="${escapeHtml(state.message4 || '')}" onchange="state.message4=this.value; setUnsaved(true);">
                    </div>
                </div>
            </div>
        </div>

        <!-- SIDEVIEW COMBAT VISUALS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Animasi visual gerak samping (Sideview) saat status ini aktif"><i class="pai-user"></i> Sideview Visuals &amp; Motion</h2>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div class="form-group">
                        <label title="Pose animasi battler saat status ini aktif">SV Motion</label>
                        <select class="form-control" onchange="state.motion=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0" ${state.motion === 0 ? 'selected' : ''}>0 - Normal (Pose Berdiri Biasa)</option>
                            <option value="1" ${state.motion === 1 ? 'selected' : ''}>1 - Abnormal (Pose Melemah / Terhuyung)</option>
                            <option value="2" ${state.motion === 2 ? 'selected' : ''}>2 - Sleep (Pose Tertidur / Tunduk)</option>
                            <option value="3" ${state.motion === 3 ? 'selected' : ''}>3 - Dead (Pose Tumbang)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Efek visual overlay di atas kepala battler">SV Overlay</label>
                        <select class="form-control" onchange="state.overlay=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0" ${state.overlay === 0 ? 'selected' : ''}>0 - None (Tanpa Overlay)</option>
                            <option value="1" ${state.overlay === 1 ? 'selected' : ''}>1 - Poison (Gelembung Racun Ungu)</option>
                            <option value="2" ${state.overlay === 2 ? 'selected' : ''}>2 - Blind (Simbol Silau Kebutaan)</option>
                            <option value="3" ${state.overlay === 3 ? 'selected' : ''}>3 - Silence (Simbol Hening/Bungkam)</option>
                            <option value="4" ${state.overlay === 4 ? 'selected' : ''}>4 - Confusion (Pusing / Tanda Tanya)</option>
                            <option value="5" ${state.overlay === 5 ? 'selected' : ''}>5 - Rage (Tanda Emosi / Marah)</option>
                            <option value="6" ${state.overlay === 6 ? 'selected' : ''}>6 - Charm (Ikon Hati Cinta)</option>
                            <option value="7" ${state.overlay === 7 ? 'selected' : ''}>7 - Sleep (Huruf Zzz Tidur)</option>
                            <option value="8" ${state.overlay === 8 ? 'selected' : ''}>8 - Paralyze (Kilat Listrik Lumpuh)</option>
                            <option value="9" ${state.overlay === 9 ? 'selected' : ''}>9 - Curse (Kutukan Gelap)</option>
                            <option value="10" ${state.overlay === 10 ? 'selected' : ''}>10 - Fear (Ketakutan)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        ${renderTraitsCard(state, 'states')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag"><i class="pai-note"></i> Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(state.note || '')}</textarea>
            </div>
        </div>
    `;
}

// =====================================================================
// SAVE & BACKUP HANDLER
// =====================================================================
