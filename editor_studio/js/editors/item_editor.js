/**
 * NUSV Database Studio - Entity Editor: editors/item_editor.js
 */

function renderItemStatPreview(container, item) {
    if (!item) return;
    container.innerHTML = `
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <div style="font-size:0.75rem; color:#34d399; font-weight:700;">Item Inspector</div>
                    <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${item.id} ${escapeHtml(item.name || 'Unnamed')}</h2>
                </div>
                <span class="badge" style="background:#34d39922; color:#34d399; border:1px solid #34d39955; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                    ${item.consumable ? 'Consumable' : 'Key Item'}
                </span>
            </div>
            <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">💰 Price:</span>
                        <strong style="color:#facc15;">${(item.price || 0).toLocaleString()} Gold</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">🎯 Occasion:</span>
                        <strong style="color:#f8fafc;">${['Always', 'Battle Only', 'Menu Only', 'Never'][item.occasion] || 'Always'}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">🔄 Repeats:</span>
                        <strong style="color:#38bdf8;">${item.repeats}x</strong>
                    </div>
                </div>

                ${item.description ? `
                    <div style="background:rgba(255,255,255,0.02); border-left:2px solid #34d399; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic;">
                        "${escapeHtml(item.description)}"
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}



function renderItemEditor(container, item) {
    const note = item.note || '';
    const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
    const menuCat = getItemCategory(item);
    const subCat = getTagVal(note, 'NUSV Subcategory', '');
    const region = getTagVal(note, 'NUSV Region', '');
    const source = getTagVal(note, 'NUSV Source', '');
    const desc = getTagVal(note, 'NUSV Desc', item.description || '');

    const isSocket = hasTag(note, 'Socket Item');
    const socketWeapOnly = hasTag(note, 'Socket Weapon Only');
    const socketArmOnly = hasTag(note, 'Socket Armor Only');
    let socketTarget = 'Any';
    if (socketWeapOnly) socketTarget = 'Weapon';
    else if (socketArmOnly) socketTarget = 'Armor';

    const sockAtk = getTagVal(note, 'Socket ATK', '');
    const sockDef = getTagVal(note, 'Socket DEF', '');
    const sockMat = getTagVal(note, 'Socket MAT', '');
    const sockMdf = getTagVal(note, 'Socket MDF', '');
    const sockMhp = getTagVal(note, 'Socket MHP', '');
    const sockMmp = getTagVal(note, 'Socket MMP', '');

    const synCat = getTagVal(note, 'Synthesis Category', '');
    const synAmt = getTagVal(note, 'Synthesis Amount', '');

    container.innerHTML = `
        <!-- IDENTITAS & PROPERTI ITEM -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h2 title="Pengaturan barang konsumsi, permata soket, dan item kunci">🧪 Item: #${item.id} ${escapeHtml(item.name)}</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="list-badge" style="color:#fbbf24; border-color:rgba(251,191,36,0.3); font-size:0.8rem; padding:3px 8px;">${escapeHtml(menuCat)}</span>
                    <span class="list-badge" style="color:${getRarityColor(rarity)}; border-color:${getRarityColor(rarity)}55; font-size:0.8rem; padding:3px 8px; font-weight:700;">★ ${escapeHtml(rarity)}</span>
                    <span style="font-size:0.85rem; color:var(--text-muted);">${item.consumable ? 'Consumable' : 'Reusable'} • Harga: ${item.price} G</span>
                </div>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama barang atau ramuan yang ditampilkan di inventaris">Item Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(item.name || '')}" onchange="item.name=this.value; setUnsaved(true); renderSidebar();">
                            </div>
${renderIconPickerField('Icon Index', item.iconIndex, "function(v){ item.iconIndex=v; setUnsaved(true); renderEditor(); }", 'Pilih ikon item dari IconSet')}
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kategori barang: Regular Item, Key Item (Barang Kunci), Hidden Item A, Hidden Item B">Item Type (itypeId)</label>
                                <select class="form-control" onchange="item.itypeId=parseInt(this.value,10); setUnsaved(true);">
                                    <option value="1" ${item.itypeId === 1 ? 'selected' : ''}>1 - Item Regular</option>
                                    <option value="2" ${item.itypeId === 2 ? 'selected' : ''}>2 - Key Item (Kunci/Penting)</option>
                                    <option value="3" ${item.itypeId === 3 ? 'selected' : ''}>3 - Hidden A</option>
                                    <option value="4" ${item.itypeId === 4 ? 'selected' : ''}>4 - Hidden B</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                <input type="number" min="0" class="form-control" value="${item.price || 0}" onchange="item.price=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Apakah barang akan berkurang atau langsung habis setelah digunakan satu kali">Consumable</label>
                                <select class="form-control" onchange="item.consumable=(this.value==='1'); setUnsaved(true);">
                                    <option value="1" ${item.consumable ? 'selected' : ''}>Ya (Consumable)</option>
                                    <option value="0" ${!item.consumable ? 'selected' : ''}>Tidak (Reusable)</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Target penerima efek skill (1 Musuh, Semua Musuh, 1 Kawan, Semua Kawan, dll.)">Scope / Target</label>
                                <select class="form-control" onchange="item.scope=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(SCOPE_NAMES).map(k => `<option value="${k}" ${item.scope === parseInt(k,10) ? 'selected' : ''}>${SCOPE_NAMES[k]}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Kapan barang ini dapat digunakan (Selalu, Hanya Pertempuran, Hanya di Menu)">Occasion</label>
                                <select class="form-control" onchange="item.occasion=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(OCCASION_NAMES).map(k => `<option value="${k}" ${item.occasion === parseInt(k,10) ? 'selected' : ''}>${OCCASION_NAMES[k]}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                            <textarea class="form-control" rows="3" onchange="item.description=this.value; setTagVal(item, 'NUSV Desc', this.value);">${escapeHtml(item.description || desc)}</textarea>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                <select class="form-control" onchange="setTagVal(item, 'NUSV Rarity', this.value); renderSidebar();">
                                    ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Pilih kategori menu untuk sistem inventori dan tas item">Kategori Menu (&lt;Menu Category&gt;)</label>
                                <select class="form-control" onchange="setTagVal(item, 'Menu Category', this.value); setTagVal(item, 'NUSV Category', this.value); setTagVal(item, 'Category', this.value); setUnsaved(true); renderSidebar();">
                                    <option value="Consumable" ${menuCat === 'Consumable' ? 'selected' : ''}>🧪 Consumable (Obat / Makanan / Potion)</option>
                                    <option value="Material" ${menuCat === 'Material' ? 'selected' : ''}>🪵 Material (Bahan Alam / Monster)</option>
                                    <option value="Forge" ${menuCat === 'Forge' ? 'selected' : ''}>⚒️ Forge (Bahan Tempa / Logam / Kristal)</option>
                                    <option value="Valuable" ${menuCat === 'Valuable' ? 'selected' : ''}>💎 Valuable (Barang Berharga / Harta / Jual)</option>
                                    <option value="Key Item" ${menuCat === 'Key Item' ? 'selected' : ''}>🗝️ Key Item (Barang Penting / Quest)</option>
                                    ${!['Consumable', 'Material', 'Forge', 'Valuable', 'Key Item'].includes(menuCat) && menuCat ? `<option value="${escapeHtml(menuCat)}" selected>${escapeHtml(menuCat)} (Custom)</option>` : ''}
                                </select>
                            </div>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label>Sub-Kategori</label>
                                <input type="text" class="form-control" placeholder="Herb, Ore..." value="${escapeHtml(subCat)}" onchange="setTagVal(item, 'NUSV Subcategory', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Wilayah atau kerajaan tempat item ini ditemukan">Origin Region</label>
                                <input type="text" class="form-control" placeholder="Nusvanir..." value="${escapeHtml(region)}" onchange="setTagVal(item, 'NUSV Region', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Sumber / Asal</label>
                                <input type="text" class="form-control" placeholder="Drop, Quest..." value="${escapeHtml(source)}" onchange="setTagVal(item, 'NUSV Source', this.value);">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PERMATA SOKET & SINTESIS -->
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h2 title="Pengaturan properti batu permata untuk soket perlengkapan">💎 Gem Socket Configuration</h2></div>
                <div class="card-body">
                    <div class="grid-2">
                        <label class="checkbox-label">
                            <input type="checkbox" ${isSocket ? 'checked' : ''} onchange="setBoolTag(item, 'Socket Item', this.checked);">
                            <span style="font-weight:700; color:var(--accent);" title="Tandai jika barang ini adalah batu permata yang dapat dipasang ke slot soket senjata/zirah">Socket Gem Item</span>
                        </label>
                        <select class="form-control" onchange="onItemSocketTargetChange(this.value)">
                            <option value="Any" ${socketTarget === 'Any' ? 'selected' : ''} title="Batu permata dapat dipasang di senjata maupun zirah">Any (Weapons &amp; Armors)</option>
                            <option value="Weapon" ${socketTarget === 'Weapon' ? 'selected' : ''} title="Batu permata hanya dapat dipasang di senjata">Weapons Only</option>
                            <option value="Armor" ${socketTarget === 'Armor' ? 'selected' : ''} title="Batu permata hanya dapat dipasang di zirah/pelindung">Armors Only</option>
                        </select>
                    </div>
                    <div class="stat-grid-6" style="margin-top:10px;">
                        <div class="stat-card-input">
                            <label style="color:#fb923c;">⚔️ ATK</label>
                            <input type="text" class="form-control" placeholder="+5" value="${sockAtk}" onchange="setTagVal(item, 'Socket ATK', this.value);">
                        </div>
                        <div class="stat-card-input" style="border-left: 2px solid #34d399;">
                            <label style="color:#34d399;">🛡️ DEF</label>
                            <input type="text" class="form-control" placeholder="+5" value="${sockDef}" onchange="setTagVal(item, 'Socket DEF', this.value);">
                        </div>
                        <div class="stat-card-input" style="border-left: 2px solid #a78bfa;">
                            <label style="color:#a78bfa;">🔮 MAT</label>
                            <input type="text" class="form-control" placeholder="+5" value="${sockMat}" onchange="setTagVal(item, 'Socket MAT', this.value);">
                        </div>
                        <div class="stat-card-input" style="border-left: 2px solid #38bdf8;">
                            <label style="color:#38bdf8;">🔰 MDF</label>
                            <input type="text" class="form-control" placeholder="+5" value="${sockMdf}" onchange="setTagVal(item, 'Socket MDF', this.value);">
                        </div>
                        <div class="stat-card-input" style="border-left: 2px solid #f87171;">
                            <label style="color:#f87171;">❤️ HP</label>
                            <input type="text" class="form-control" placeholder="+50" value="${sockMhp}" onchange="setTagVal(item, 'Socket MHP', this.value);">
                        </div>
                        <div class="stat-card-input" style="border-left: 2px solid #60a5fa;">
                            <label style="color:#60a5fa;">💧 MP</label>
                            <input type="text" class="form-control" placeholder="+20" value="${sockMmp}" onchange="setTagVal(item, 'Socket MMP', this.value);">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>🔨 Sintesis / Crafting (NUSV_ItemSynthesis)</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Kategori Resep (&lt;Synthesis Category: ...&gt;)</label>
                        <input type="text" class="form-control" placeholder="Forge, Alchemy, Cooking..." value="${escapeHtml(synCat)}" onchange="setTagVal(item, 'Synthesis Category', this.value);">
                    </div>
                    <div class="form-group">
                        <label>Jumlah Hasil Buatan (&lt;Synthesis Amount: X&gt;)</label>
                        <input type="number" min="1" class="form-control" placeholder="1" value="${synAmt}" onchange="setTagVal(item, 'Synthesis Amount', this.value);">
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        
        <!-- INVOCATION & DAMAGE FORMULA -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan peluncuran, akurasi, dan animasi penggunaan barang">🎯 Invocation &amp; Execution</h2>
            </div>
            <div class="card-body">
                <div class="grid-3">
                    <div class="form-group">
                        <label title="Tipe serangan akurasi: Pasti Kena, Fisik, atau Magis">Hit Type</label>
                        <select class="form-control" onchange="item.hitType=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0" ${item.hitType === 0 ? 'selected' : ''}>0 - Certain Hit (Pasti Kena)</option>
                            <option value="1" ${item.hitType === 1 ? 'selected' : ''}>1 - Physical Attack (Fisik)</option>
                            <option value="2" ${item.hitType === 2 ? 'selected' : ''}>2 - Magical Attack (Sihir/Magis)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Animasi visual saat barang digunakan">Animation</label>
                        <select class="form-control" onchange="item.animationId=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0">(Tanpa Animasi)</option>
                            ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${item.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Tambahan poin stamina (SP) saat item digunakan">SP Gain (Stamina)</label>
                        <input type="number" min="0" max="100" class="form-control" value="${item.tpGain || 0}" onchange="item.tpGain=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                </div>
                <div class="grid-3" style="margin-top:10px;">
                    <div class="form-group">
                        <label title="Pengubah kecepatan inisiatif giliran">Speed Modifier</label>
                        <input type="number" class="form-control" value="${item.speed || 0}" onchange="item.speed=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                    <div class="form-group">
                        <label title="Persentase peluang keberhasilan aktivasi (default 100%)">Success Rate (%)</label>
                        <input type="number" min="0" max="100" class="form-control" value="${item.successRate !== undefined ? item.successRate : 100}" onchange="item.successRate=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                    <div class="form-group">
                        <label title="Jumlah pengulangan efek">Repeats Count</label>
                        <input type="number" min="1" max="10" class="form-control" value="${item.repeats || 1}" onchange="item.repeats=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan efek damage jika item menghasilkan luka atau pemulihan">💥 Damage Formula &amp; Elements</h2>
            </div>
            <div class="card-body">
                <div class="grid-4">
                    <div class="form-group">
                        <label>Damage Type</label>
                        <select class="form-control" onchange="item.damage=item.damage||{}; item.damage.type=parseInt(this.value,10); setUnsaved(true);">
                            ${Object.keys(DAMAGE_TYPES).map(k => `<option value="${k}" ${(item.damage||{}).type === parseInt(k,10) ? 'selected' : ''}>${DAMAGE_TYPES[k]}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Damage Element</label>
                        <select class="form-control" onchange="item.damage=item.damage||{}; item.damage.elementId=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0" ${(item.damage||{}).elementId === 0 ? 'selected' : ''}>Tanpa Elemen (None)</option>
                            ${(State.system.elements||[]).map((el, idx) => idx === 0 ? '' : `<option value="${idx}" ${(item.damage||{}).elementId === idx ? 'selected' : ''}>${escapeHtml(el)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Damage Variance (%)</label>
                        <input type="number" min="0" max="100" class="form-control" value="${(item.damage||{}).variance || 20}" onchange="item.damage=item.damage||{}; item.damage.variance=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                    <div class="form-group" style="display:flex; align-items:center;">
                        <label class="checkbox-label" style="margin-top:16px;">
                            <input type="checkbox" ${(item.damage||{}).critical ? 'checked' : ''} onchange="item.damage=item.damage||{}; item.damage.critical=this.checked; setUnsaved(true);">
                            <span>Allow Critical</span>
                        </label>
                    </div>
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label>Damage Formula (e.g. <code>b.mhp * 0.25 + 100</code>)</label>
                    <input type="text" class="form-control" style="font-family:monospace; font-size:0.9rem; color:#60a5fa;" 
                           value="${escapeHtml((item.damage||{}).formula || '0')}" 
                           onchange="item.damage=item.damage||{}; item.damage.formula=this.value; setUnsaved(true);">
                </div>
            </div>
        </div>

        ${renderEffectsCard(item)}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(item.note || '')}</textarea>
            </div>
        </div>
    `;
}



function onItemSocketTargetChange(val) {
    const item = State.items[State.selectedIndex];
    setBoolTag(item, 'Socket Weapon Only', false);
    setBoolTag(item, 'Socket Armor Only', false);
    if (val === 'Weapon') {
        setBoolTag(item, 'Socket Weapon Only', true);
    } else if (val === 'Armor') {
        setBoolTag(item, 'Socket Armor Only', true);
    }
}

// =====================================================================
// 7. ENEMIES EDITOR
// =====================================================================
