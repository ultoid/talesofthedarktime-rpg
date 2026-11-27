/**
 * NUSV Database Studio - Entity Editor: editors/armor_editor.js
 */

function renderArmorEditor(container, armor) {
    ensureItemParams(armor);
    const note = armor.note || '';
    const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
    const customType = getTagVal(note, 'NUSV Armor Type', '');
    const region = getTagVal(note, 'NUSV Region', '');
    const desc = getTagVal(note, 'NUSV Desc', armor.description || '');

    const setName = getTagVal(note, 'NUSV Set Name', '');
    const set2 = getTagVal(note, 'NUSV Set Bonus 2', '');
    const set3 = getTagVal(note, 'NUSV Set Bonus 3', '');
    const set4 = getTagVal(note, 'NUSV Set Bonus 4', '');

    const sockets = getTagVal(note, 'Sockets', '');
    const upMax = getTagVal(note, 'Upgrade Max', '');
    const upSuccess = getTagVal(note, 'Upgrade Success', '');
    const upDef = getTagVal(note, 'Upgrade DEF', '');
    const upMdf = getTagVal(note, 'Upgrade MDF', '');

    const coreBonuses = {};
    CORE_ATTRIBUTES.forEach(a => {
        coreBonuses[a.code] = getTagVal(note, a.code, '');
    });

    const derivedValues = {};
    DERIVED_STAT_DEFS.forEach(d => {
        derivedValues[d.key] = getTagVal(note, d.key, '');
    });

    const eleMatch = note.match(/<Element Amplify ([^:>]+):[ ]*(.+?)>/i);
    const eleName = eleMatch ? eleMatch[1] : '';
    const eleVal = eleMatch ? eleMatch[2] : '';

    const atypes = State.system.armorTypes || [];
    const slotNames = {
        1: 'Weapon Slot (Khusus)',
        2: 'Shield / Secondary (Slot 2)',
        3: 'Helm / Kepala (Slot 3)',
        4: 'Armor / Baju (Slot 4)',
        5: 'Footwear / Boots (Slot 5)',
        6: 'Accessory (Slot 6)',
        7: 'Relic (Slot 7)'
    };

    container.innerHTML = `
        <!-- IDENTITAS & TIPE PELINDUNG -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h2 title="Pengaturan spesifikasi perlindungan dan aksesoris">${armor.etypeId === 6 ? `${pai('diamond-gem')} Accessory` : (armor.etypeId === 7 ? `${pai('wand')} Relic` : `${pai('shield')} Armor`)}: #${armor.id} ${escapeHtml(armor.name)}</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3); font-size:0.8rem; padding:3px 8px;">${slotNames[armor.etypeId] || `Slot ${armor.etypeId}`}</span>
                    <span class="list-badge" style="color:${getRarityColor(rarity)}; border-color:${getRarityColor(rarity)}55; font-size:0.8rem; padding:3px 8px; font-weight:700;">${escapeHtml(rarity)}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama pelindung atau aksesoris yang ditampilkan di inventaris">Armor Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(armor.name || '')}" onchange="armor.name=this.value; setUnsaved(true); renderSidebar();">
                            </div>
${renderIconPickerField('Icon Index', armor.iconIndex, "function(v){ armor.iconIndex=v; setUnsaved(true); renderEditor(); }", 'Pilih ikon armor dari IconSet')}
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kategori slot perlengkapan: Perisai/Secondary, Helm, Baju Zirah, Sepatu, Aksesoris, atau Relik">Equipment Slot (etypeId)</label>
                                <select class="form-control" onchange="armor.etypeId=parseInt(this.value,10); setUnsaved(true); renderSidebar(); renderEditor();">
                                    <option value="2" ${armor.etypeId === 2 ? 'selected' : ''}>2 - Secondary / Shield</option>
                                    <option value="3" ${armor.etypeId === 3 ? 'selected' : ''}>3 - Helm</option>
                                    <option value="4" ${armor.etypeId === 4 ? 'selected' : ''}>4 - Armor</option>
                                    <option value="5" ${armor.etypeId === 5 ? 'selected' : ''}>5 - Boots</option>
                                    <option value="6" ${armor.etypeId === 6 ? 'selected' : ''}>6 - Accessory</option>
                                    <option value="7" ${armor.etypeId === 7 ? 'selected' : ''}>7 - Relic</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Tipe material pelindung (misal Zirah Berat, Ringan, Kain, Perisai)">Armor Type (atypeId)</label>
                                <select class="form-control" onchange="armor.atypeId=parseInt(this.value,10); setUnsaved(true);">
                                    ${atypes.map((at, idx) => idx === 0 ? '' : `<option value="${idx}" ${armor.atypeId === idx ? 'selected' : ''}>${escapeHtml(at || `Tipe ${idx}`)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                <input type="number" min="0" class="form-control" value="${armor.price || 0}" onchange="armor.price=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                <select class="form-control" onchange="setTagVal(armor, 'NUSV Rarity', this.value); renderSidebar();">
                                    ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Sub-kategori bebas perlengkapan (misal Gauntlet, Cloak, Ring, Amulet)">Custom Sub-Type</label>
                                <input type="text" class="form-control" placeholder="Shield, Ring, Talisman..." value="${escapeHtml(customType)}" onchange="setTagVal(armor, 'NUSV Armor Type', this.value);">
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                            <textarea class="form-control" rows="3" onchange="armor.description=this.value; setTagVal(armor, 'NUSV Desc', this.value);">${escapeHtml(armor.description || desc)}</textarea>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama set perlengkapan untuk mengaktifkan bonus set saat dipakai bersamaan">Set Name (&lt;NUSV Set Name&gt;)</label>
                                <input type="text" class="form-control" placeholder="Mandala Guard Set" value="${escapeHtml(setName)}" onchange="setTagVal(armor, 'NUSV Set Name', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Wilayah atau kerajaan asal perlengkapan">Origin Region</label>
                                <input type="text" class="form-control" placeholder="Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(armor, 'NUSV Region', this.value);">
                            </div>
                        </div>

                        <div class="form-group">
                            <label title="Bonus atribut khusus yang aktif jika menggunakan beberapa perlengkapan dari set yang sama">Set Bonus Effects (2-Set / 3-Set / 4-Set)</label>
                            <div class="grid-3">
                                <input type="text" class="form-control" placeholder="2-Set..." value="${escapeHtml(set2)}" onchange="setTagVal(armor, 'NUSV Set Bonus 2', this.value);">
                                <input type="text" class="form-control" placeholder="3-Set..." value="${escapeHtml(set3)}" onchange="setTagVal(armor, 'NUSV Set Bonus 3', this.value);">
                                <input type="text" class="form-control" placeholder="4-Set..." value="${escapeHtml(set4)}" onchange="setTagVal(armor, 'NUSV Set Bonus 4', this.value);">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SISTEM STAT TERPADU NUSVANIR -->
        <div class="card">
            <div class="card-header">
                <h2>${pai('chart-bar')} Spesifikasi Stat &amp; Pertahanan Nusvanir</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">Unified stat system (Protection, 6 Core Attributes &amp; Derived Stats).</span>
            </div>
            <div class="card-body">
                <!-- 1. DAYA PERTAHANAN & VITAL LANGSUNG -->
                <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:8px;">${pai('shield')} Nilai Proteksi &amp; Kapasitas Vital:</div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px; margin-bottom:16px;">
                    <div class="stat-card-input" style="border-left: 3px solid #34d399;">
                        <label style="color:#34d399;">
                            <span>${pai('shield')} Armor DEF</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya tahan fisik murni dari pelindung (params[3])">Armor Physical DEF</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[3] || 0}" onchange="armor.params[3]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #38bdf8;">
                        <label style="color:#38bdf8;">
                            <span>${pai('shield')} Armor MDF</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya tahan sihir murni dari pelindung (params[5])">Armor Magical MDF</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[5] || 0}" onchange="armor.params[5]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #f87171;">
                        <label style="color:#f87171;">
                            <span>${pai('heart')} Max HP</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kapasitas darah maksimal (params[0])">Max HP Bonus</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[0] || 0}" onchange="armor.params[0]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #60a5fa;">
                        <label style="color:#60a5fa;">
                            <span>${pai('drop')} Max MP</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kapasitas mana maksimal (params[1])">Max MP Bonus</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[1] || 0}" onchange="armor.params[1]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                        <label style="color:#facc15;">
                            <span>${pai('speed-fast')} Action Speed</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kecepatan inisiatif giliran (params[6])">Movement Speed Bonus</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[6] || 0}" onchange="armor.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    ${armor.etypeId === 2 ? `
                    <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                        <label style="color:#fb923c;">
                            <span>${pai('sword')} Shield ATK</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang saat menggunakan teknik hantaman perisai">Shield Bash ATK</span>
                        </label>
                        <input type="number" class="form-control" value="${armor.params[2] || 0}" onchange="armor.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>` : ''}
                </div>

                <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;" title="Bonus atribut STR, INT, DEX, AGI, VIT, LUK dari perlengkapan ini">${pai('user')} 6 Core Attributes Bonus:</div>
                <div class="stat-grid-6" style="margin-bottom:16px;">
                    ${CORE_ATTRIBUTES.map(attr => `
                        <div class="stat-card-input">
                            <label style="color:${attr.color};">
                                <span>${attr.icon} ${attr.code}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                            </label>
                            ${statValueInput(coreBonuses[attr.code], false, `setTagVal(armor, '${attr.code}', this.value);`)}
                        </div>
                    `).join('')}
                </div>

                <!-- 3. STAT TURUNAN NUSVANIR -->
                <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">${pai('drop')} Vitalitas &amp; Regenerasi per Giliran:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            ${statValueInput(derivedValues[d.key], d.key !== 'Max SP', `setTagVal(armor, '${d.key}', this.value);`)}
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;" title="Bonus mitigasi kerusakan, penghindaran, dan tangkisan">${pai('shield')} Defense, Evasion &amp; Mitigation:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            ${statValueInput(derivedValues[d.key], d.key !== 'Max SP', `setTagVal(armor, '${d.key}', this.value);`)}
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;" title="Bonus akurasi, kritikal, dan penetrasi armor musuh">${pai('target')} Precision, Critical &amp; Penetration:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            ${statValueInput(derivedValues[d.key], d.key !== 'Max SP', `setTagVal(armor, '${d.key}', this.value);`)}
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">${pai('sparkles')} Utilitas &amp; Penguatan Elemen:</div>
                <div class="grid-3">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            ${statValueInput(derivedValues[d.key], d.key !== 'Max SP', `setTagVal(armor, '${d.key}', this.value);`)}
                        </div>
                    `).join('')}
                    <div class="stat-card-input">
                        <label style="color:#f59e0b;">
                            <span>${pai('fire')} Amplifikasi Elemen</span>
                        </label>
                        <div style="display:flex; gap:6px;">
                            <select class="form-control" id="armEleName" onchange="onArmorElementAmplifyChange()" style="min-width:0;">
                                <option value="">Pilih elemen</option>
                                ${eleName && !(State.system.elements || []).some(el => el && el.toLowerCase() === eleName.toLowerCase()) ? `<option value="${escapeHtml(eleName)}" selected>${escapeHtml(eleName)}</option>` : ''}
                                ${(State.system.elements || []).map((el, i) => i && el ? `<option value="${escapeHtml(el)}" ${el.toLowerCase() === eleName.toLowerCase() ? 'selected' : ''}>${escapeHtml(el)}</option>` : '').join('')}
                            </select>
                            <div style="width:120px; flex-shrink:0;">${statValueInput(eleVal, true, 'onArmorElementAmplifyChange()', 'id="armEleVal"')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SOKET & TEMPA -->
        <div class="card">
            <div class="card-header"><h2 title="Pengaturan soket permata dan sistem penempaan pandai besi">${pai('diamond-gem')} Gem Sockets &amp; Refining</h2></div>
            <div class="card-body">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                        ${refiningValueInput(`<input type="number" min="0" max="8" class="form-control" placeholder="" value="${sockets}" onchange="setTagVal(armor, 'Sockets', this.value);">`)}
                    </div>
                    <div class="form-group">
                        <label>Maksimal Tempa (+X)</label>
                        ${refiningValueInput(`<input type="number" min="0" max="20" class="form-control" placeholder="" value="${upMax}" onchange="setTagVal(armor, 'Upgrade Max', this.value);">`)}
                    </div>
                </div>
                <div class="grid-3">
                    <div class="form-group">
                        <label>% Sukses Tempa</label>
                        ${refiningValueInput(`<input type="text" class="form-control" placeholder="" value="${upSuccess}" onchange="setTagVal(armor, 'Upgrade Success', this.value);">`)}
                    </div>
                    <div class="form-group">
                        <label>Bonus DEF/Tempa</label>
                        ${refiningValueInput(`<input type="text" class="form-control" placeholder="" value="${upDef}" onchange="setTagVal(armor, 'Upgrade DEF', this.value);">`)}
                    </div>
                    <div class="form-group">
                        <label>Bonus MDF/Tempa</label>
                        ${refiningValueInput(`<input type="text" class="form-control" placeholder="" value="${upMdf}" onchange="setTagVal(armor, 'Upgrade MDF', this.value);">`)}
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        ${renderTraitsCard(armor, 'armors')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">${pai('notes')} Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(armor.note || '')}</textarea>
            </div>
        </div>
    `;
}



function onArmorElementAmplifyChange() {
    const armor = State.armors[State.selectedIndex];
    let note = armor.note || '';
    note = note.replace(/<Element Amplify [^:>]+:[ ]*.+?>\n?/gi, '').trim();
    const name = document.getElementById('armEleName').value.trim();
    const val = document.getElementById('armEleVal').value.trim();
    if (name && val) {
        note = `<Element Amplify ${name}: ${val}>\n` + note;
    }
    armor.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}

// =====================================================================
// 5. SKILLS EDITOR
// =====================================================================
