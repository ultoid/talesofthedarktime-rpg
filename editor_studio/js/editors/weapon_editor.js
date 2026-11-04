/**
 * NUSV Database Studio - Entity Editor: editors/weapon_editor.js
 */

function renderEquipmentStatPreview(container, item, type) {
    if (!item) return;
    const note = item.note || '';
    const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
    const rarityColors = {
        'Common': '#94a3b8',
        'Uncommon': '#22c55e',
        'Rare': '#3b82f6',
        'Epic': '#a855f7',
        'Legendary': '#f59e0b',
        'Mythic': '#ef4444'
    };
    const rColor = rarityColors[rarity] || '#94a3b8';

    const coreBonuses = [];
    CORE_ATTRIBUTES.forEach(a => {
        const val = getTagVal(note, a.code, '');
        if (val) {
            coreBonuses.push({ attr: a, val: val.startsWith('+') || val.startsWith('-') ? val : `+${val}` });
        }
    });

    const derivedBonuses = [];
    DERIVED_STAT_DEFS.forEach(d => {
        const val = getTagVal(note, d.key, '');
        if (val) {
            derivedBonuses.push({ def: d, val: val.startsWith('+') || val.startsWith('-') ? val : `+${val}` });
        }
    });

    const pNames = ['MHP', 'MMP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
    const paramBonuses = [];
    if (item.params) {
        item.params.forEach((p, idx) => {
            if (p !== 0) paramBonuses.push({ name: pNames[idx], val: p > 0 ? `+${p}` : `${p}` });
        });
    }

    const sockets = parseInt(getTagVal(note, 'Sockets', '0'), 10) || 0;
    const unleash = getTagVal(note, 'Unleash Skill', '');
    const setName = getTagVal(note, 'Set', '');
    const desc = getTagVal(note, 'NUSV Desc', item.description || '');

    container.innerHTML = `
        <!-- EQUIPMENT INSPECTOR CARD -->
        <div class="card" style="border: 1px solid ${rColor}; box-shadow: 0 0 16px ${rColor}22; margin-bottom:0;">
            <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), ${rColor}15); padding:10px 14px;">
                <div>
                    <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px; color:${rColor}; font-weight:700;">
                        ${escapeHtml(rarity)} ${type === 'weapon' ? 'Weapon' : 'Armor'}
                    </div>
                    <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">
                        #${item.id} ${escapeHtml(item.name || 'Unnamed')}
                    </h2>
                </div>
                <span class="badge" style="background:${rColor}22; color:${rColor}; border:1px solid ${rColor}66; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                    ${escapeHtml(rarity)}
                </span>
            </div>
            <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                <!-- EV Core Attribute Modifiers -->
                <div>
                    <div style="font-size:0.75rem; font-weight:700; color:#38bdf8; margin-bottom:6px; display:flex; justify-content:space-between;">
                        <span>⭐ Core Attribute Bonuses (EV)</span>
                        <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">&lt;STR: +X&gt; etc.</span>
                    </div>
                    ${coreBonuses.length === 0 ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Tidak ada bonus Core Attribute langsung</div>` : `
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                            ${coreBonuses.map(b => `
                                <div class="stat-card-input" style="border-left: 2px solid ${b.attr.color}; padding:4px 8px;">
                                    <span style="font-size:0.7rem; color:${b.attr.color}; font-weight:700;">${b.attr.icon} ${b.attr.code}</span>
                                    <div style="font-size:1.05rem; font-weight:700; color:#fff;">${escapeHtml(b.val)}</div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Combat Parameters -->
                <div>
                    <div style="font-size:0.75rem; font-weight:700; color:#10b981; margin-bottom:6px;">
                        ⚔️ Primary Combat Parameters
                    </div>
                    ${paramBonuses.length === 0 ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Tidak ada flat params (ATK/DEF/dll = 0)</div>` : `
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${paramBonuses.map(p => `
                                <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:4px 10px; font-size:0.8rem;">
                                    <span style="color:var(--text-muted); font-size:0.72rem; margin-right:4px;">${p.name}:</span>
                                    <strong style="color:#f8fafc;">${p.val}</strong>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Derived Combat Stats -->
                ${derivedBonuses.length > 0 ? `
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; color:#fb923c; margin-bottom:6px;">
                            ⚡ Derived &amp; Mitigation Stats
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                            ${derivedBonuses.map(d => `
                                <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:4px 8px; font-size:0.75rem; display:flex; justify-content:space-between;">
                                    <span style="color:var(--text-muted);">${d.def.name}:</span>
                                    <strong style="color:#fb923c;">${escapeHtml(d.val)}</strong>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Special Traits & Sockets -->
                <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                    ${sockets > 0 ? `
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">💎 Gem Sockets:</span>
                            <span style="font-weight:700; color:#38bdf8;">${'🔷 '.repeat(sockets)} (${sockets} Slot)</span>
                        </div>
                    ` : ''}
                    ${unleash ? `
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">⚡ Unleash Skill:</span>
                            <span style="font-weight:700; color:#facc15;">${escapeHtml(unleash)}</span>
                        </div>
                    ` : ''}
                    ${setName ? `
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">✨ Item Set:</span>
                            <span style="font-weight:700; color:#c084fc;">${escapeHtml(setName)}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Lore & Description -->
                ${desc ? `
                    <div style="background:rgba(255,255,255,0.02); border-left:2px solid ${rColor}; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic; line-height:1.4;">
                        "${escapeHtml(desc)}"
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}



function renderWeaponEditor(container, weapon) {
    ensureItemParams(weapon);
    const note = weapon.note || '';
    const is2H = note.includes('2H Primary+Secondary') || (weapon.traits && weapon.traits.some(t => t.code === 54 && t.dataId === 2));
    const isDual = note.includes('Dual-compatible Primary/Secondary');
    const handType = is2H ? '2H' : (isDual ? 'Dual' : '1H');

    const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
    const acquisition = getTagVal(note, 'NUSV Acquisition', '');
    const region = getTagVal(note, 'NUSV Region', '');
    const desc = getTagVal(note, 'NUSV Desc', weapon.description || '');

    const sockets = getTagVal(note, 'Sockets', '');
    const upMax = getTagVal(note, 'Upgrade Max', '');
    const upRate = getTagVal(note, 'Upgrade Success', '');
    const upGold = getTagVal(note, 'Upgrade Gold', '');
    const upAtk = getTagVal(note, 'Upgrade ATK', '');
    const upMat = getTagVal(note, 'Upgrade MAT', '');
    const unleash = getTagVal(note, 'Unleash Skill', '');

    const coreBonuses = {};
    CORE_ATTRIBUTES.forEach(a => {
        coreBonuses[a.code] = getTagVal(note, a.code, '');
    });

    const derivedValues = {};
    DERIVED_STAT_DEFS.forEach(d => {
        derivedValues[d.key] = getTagVal(note, d.key, '');
    });

    const eleMatch = note.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
    const eleName = eleMatch ? eleMatch[1] : '';
    const eleVal = eleMatch ? eleMatch[2] : '';

    const skillIdMatch = note.match(/<skill_id:\s*(\d+)>/i) || note.match(/<Unleash Skill:\s*(\d+)(?:,\s*100%)?>/i);
    const customAttackSkillId = skillIdMatch ? parseInt(skillIdMatch[1], 10) : 0;

    const motionMatch = note.match(/<Weapon Motion:\s*([a-zA-Z]+)>/i);
    const weaponMotion = motionMatch ? motionMatch[1].toLowerCase() : 'auto';

    const seqMatch = note.match(/<target action>[\s\S]*?<\/target action>/i) || note.match(/<setup action>[\s\S]*?<\/finish action>/i);
    const rawSeqText = seqMatch ? seqMatch[0] : '';
    const hasCustomSeq = !!rawSeqText;

    const wtypes = State.system.weaponTypes || [];

    container.innerHTML = `
        <!-- WEAPON PROPERTIES & STATS -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h2 title="Pengaturan spesifikasi dan daya serang senjata">⚔️ Weapon: #${weapon.id} ${escapeHtml(weapon.name)}</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3); font-size:0.8rem; padding:3px 8px;">Tipe: ${escapeHtml(wtypes[weapon.wtypeId] || `Tipe ${weapon.wtypeId}`)}</span>
                    <span class="list-badge" style="color:${getRarityColor(rarity)}; border-color:${getRarityColor(rarity)}55; font-size:0.8rem; padding:3px 8px; font-weight:700;">★ ${escapeHtml(rarity)}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama senjata yang ditampilkan di inventaris dan jendela status">Weapon Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(weapon.name || '')}" onchange="weapon.name=this.value; setUnsaved(true); renderSidebar();">
                            </div>
${renderIconPickerField('Icon Index', weapon.iconIndex, "function(v){ weapon.iconIndex=v; setUnsaved(true); renderEditor(); }", 'Pilih ikon senjata dari IconSet')}
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kategori senjata (misal Pedang, Busur, Tongkat Sihir, Belati)">Weapon Type</label>
                                <select class="form-control" onchange="weapon.wtypeId=parseInt(this.value,10); setUnsaved(true);">
                                    ${wtypes.map((wt, idx) => idx === 0 ? '' : `<option value="${idx}" ${weapon.wtypeId === idx ? 'selected' : ''}>${escapeHtml(wt || `Tipe ${idx}`)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli)">Price (Gold)</label>
                                <input type="number" min="0" class="form-control" value="${weapon.price || 0}" onchange="weapon.price=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Animasi visual yang dimainkan saat karakter mengayunkan senjata biasa">Attack Animation</label>
                                <select class="form-control" onchange="weapon.animationId=parseInt(this.value,10); setUnsaved(true);">
                                    <option value="0" title="Menggunakan animasi tebasan default bawaan">(Default Normal Attack)</option>
                                    ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${weapon.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label title="Apakah senjata ini dipegang dengan satu tangan (1-Handed) atau dua tangan (2-Handed)">Hand Slot Rule</label>
                            <select class="form-control" onchange="onWeaponHandChange(this.value)">
                                <option value="1H" ${handType === '1H' ? 'selected' : ''}>1H Primary (Satu Tangan Normal)</option>
                                <option value="2H" ${handType === '2H' ? 'selected' : ''}>2H Primary+Secondary (Dua Tangan / Kunci Off-Hand)</option>
                                <option value="Dual" ${handType === 'Dual' ? 'selected' : ''} title="Dapat dipasang di slot senjata utama maupun slot kedua">Dual-compatible (Can Dual Wield)</option>
                            </select>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Tingkat kelangkaan barang (Common, Uncommon, Rare, Epic, Legendary, Mythic)">Item Rarity</label>
                                <select class="form-control" onchange="setTagVal(weapon, 'NUSV Rarity', this.value); renderSidebar();">
                                    ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Keterangan cara mendapatkan senjata (Drop, Crafting, Quest, Toko)">Acquisition Method</label>
                                <input type="text" class="form-control" placeholder="Drop, Craft, Quest..." value="${escapeHtml(acquisition)}" onchange="setTagVal(weapon, 'NUSV Acquisition', this.value);">
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                            <textarea class="form-control" rows="3" onchange="weapon.description=this.value; setTagVal(weapon, 'NUSV Desc', this.value);">${escapeHtml(weapon.description || desc)}</textarea>
                        </div>
                        <div class="form-group">
                            <label title="Wilayah atau kerajaan tempat senjata ini dibuat">Origin Region (&lt;NUSV Region&gt;)</label>
                            <input type="text" class="form-control" placeholder="Contoh: Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(weapon, 'NUSV Region', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Jurus yang berpeluang keluar secara otomatis saat melakukan serangan biasa">Weapon Skill Unleash (&lt;Unleash Skill&gt;)</label>
                            <input type="text" class="form-control" placeholder="Contoh: 15, 25%, 10" value="${escapeHtml(unleash)}" onchange="setTagVal(weapon, 'Unleash Skill', this.value);">
                            <div class="helper-text" title="Peluang jurus ini aktif saat karakter melancarkan serangan biasa">Triggered automatically during normal basic attacks.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ⚔️ PENGATURAN SERANGAN BIASA SENJATA (NORMAL ATTACK CUSTOMIZATION) -->
        <div class="card" style="border: 1px solid rgba(56, 189, 248, 0.4); background: #070e1b; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(56,189,248,0.2); padding-bottom:8px;">
                <div>
                    <h2 style="color:#38bdf8; font-size:0.95rem; display:flex; align-items:center; gap:8px; margin:0;">
                        <span>⚔️</span> Kustomisasi Serangan Biasa Senjata (Normal Attack)
                    </h2>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                        Tentukan skill pengganti, animasi visual, motion, dan koreografi khusus saat memilih perintah "Attack" memakai senjata ini.
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${customAttackSkillId > 0 ? `
                        <span class="list-badge" style="background:#0284c722; color:#38bdf8; border-color:#38bdf8; font-size:0.72rem; padding:2px 8px; font-weight:700;">
                            🎯 Skill #${customAttackSkillId}: ${escapeHtml((State.skills[customAttackSkillId] || {}).name || '')}
                        </span>
                    ` : (hasCustomSeq ? `
                        <span class="list-badge" style="background:#c084fc22; color:#c084fc; border-color:#c084fc; font-size:0.72rem; padding:2px 8px; font-weight:700;">
                            🎬 Custom Action Sequence
                        </span>
                    ` : `
                        <span class="list-badge" style="color:var(--text-muted); border-color:#334155; font-size:0.72rem; padding:2px 8px;">
                            Standar (Skill #1 Attack)
                        </span>
                    `)}
                </div>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; gap:12px;">
                <!-- KONTROL SKILL PENGGANTI & SHORTCUT BUAT/EDIT -->
                <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.2); border-radius:8px; padding:10px 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                        <label style="font-size:0.78rem; font-weight:700; color:#38bdf8; margin:0;">
                            🎯 Skill Serangan Biasa Senjata (&lt;skill_id: ID&gt;)
                        </label>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-sm btn-primary" onclick="openSkillInAnimator(${customAttackSkillId || 1})" style="padding:3px 10px; font-size:0.72rem; font-weight:700;">
                                🎬 Buka di Skill Animation Editor
                            </button>
                            ${!customAttackSkillId ? `
                                <button type="button" class="btn btn-sm" onclick="createNewSkillForWeapon()" style="background:#10b98122; border:1px solid #10b981; color:#6ee7b7; padding:3px 10px; font-size:0.72rem; font-weight:700;" title="Otomatis duplikasi & buat skill baru khusus untuk senjata ini dan buka di Skill Animator">
                                    + Buat Skill Khusus Senjata Ini
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px; align-items:flex-end;">
                        <div>
                            <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">Skill yang Dipakai Saat Perintah Attack</label>
                            <select class="form-control" style="font-size:0.8rem; padding:4px 8px; color:#38bdf8; font-weight:600;" onchange="onWeaponAttackSkillChange(this.value)">
                                <option value="0" ${!customAttackSkillId ? 'selected' : ''}>(Default: Skill #1 - Attack standar)</option>
                                ${State.skills.filter(s => s && s.id !== 1).map(s => `
                                    <option value="${s.id}" ${customAttackSkillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">Animasi Visual Serangan (VFX)</label>
                            <div style="display:flex; gap:4px;">
                                <select class="form-control" style="font-size:0.8rem; padding:4px 6px;" onchange="weapon.animationId=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                    <option value="0">(Default / Sesuai Skill)</option>
                                    ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${weapon.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                                ${weapon.animationId > 0 ? `
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimationInEditor(${weapon.animationId})" style="padding:2px 6px; font-size:0.7rem; color:#38bdf8;" title="Edit animasi ini di Animation Studio">🎨</button>
                                ` : ''}
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:2px;">Motion Aktor (&lt;Weapon Motion&gt;)</label>
                            <select class="form-control" style="font-size:0.8rem; padding:4px 6px;" onchange="onWeaponMotionChange(this.value)">
                                <option value="auto" ${weaponMotion === 'auto' ? 'selected' : ''}>Otomatis (Tipe Senjata)</option>
                                <option value="swing" ${weaponMotion === 'swing' ? 'selected' : ''}>swing (Tebasan)</option>
                                <option value="thrust" ${weaponMotion === 'thrust' ? 'selected' : ''}>thrust (Tusukan)</option>
                                <option value="missile" ${weaponMotion === 'missile' ? 'selected' : ''}>missile (Tembakan/Jarak Jauh)</option>
                            </select>
                        </div>
                    </div>
                    <div style="font-size:0.68rem; color:var(--text-muted); margin-top:6px;">
                        💡 <span style="color:#94a3b8;">Saat bertarung, karakter yang memilih <strong>Attack</strong> dengan senjata ini akan langsung menjalankan skill yang dipilih di atas (didukung plugin <code>WeaponSkill.js</code> &amp; <code>NUSV_WeaponUnleash.js</code>).</span>
                    </div>
                </div>

                <!-- KOREOGRAFI ACTION SEQUENCE LANGSUNG DI SENJATA -->
                <div style="background:rgba(192,132,252,0.05); border:1px solid rgba(192,132,252,0.2); border-radius:8px; padding:10px 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                        <div>
                            <strong style="color:#c084fc; font-size:0.78rem;">⚡ Koreografi Action Sequence Khusus pada Senjata (Yanfly Override)</strong>
                            <div style="font-size:0.68rem; color:var(--text-muted);">Jika disetel, sequence ini langsung menimpa gaya serang Skill #1 saat senjata ini dipakai.</div>
                        </div>
                        <!-- 1-CLICK PRESETS -->
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-xs" onclick="applyWeaponActionSequencePreset('melee')" style="background:#0284c733; border:1px solid #38bdf8; color:#e0f2fe; padding:2px 8px; font-size:0.7rem;">
                                🗡️ Melee Dash
                            </button>
                            <button type="button" class="btn btn-xs" onclick="applyWeaponActionSequencePreset('thrust')" style="background:#05966933; border:1px solid #10b981; color:#d1fae5; padding:2px 8px; font-size:0.7rem;">
                                🏹 Thrust / Pierce
                            </button>
                            <button type="button" class="btn btn-xs" onclick="applyWeaponActionSequencePreset('ranged')" style="background:#7c3aed33; border:1px solid #c084fc; color:#ede9fe; padding:2px 8px; font-size:0.7rem;">
                                🎯 Ranged / Bow
                            </button>
                            <button type="button" class="btn btn-xs" onclick="applyWeaponActionSequencePreset('combo')" style="background:#ea580c33; border:1px solid #fb923c; color:#ffedd5; padding:2px 8px; font-size:0.7rem;">
                                ⚡ 2x Multi-Strike
                            </button>
                            ${hasCustomSeq ? `
                                <button type="button" class="btn btn-xs btn-danger" onclick="clearWeaponActionSequence()" style="padding:2px 8px; font-size:0.7rem;">
                                    🧹 Hapus Sequence
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${hasCustomSeq ? `
                        <textarea class="form-control" rows="5" style="font-family:monospace; font-size:0.72rem; color:#f8fafc; background:#04060c;" readonly>${escapeHtml(rawSeqText)}</textarea>
                    ` : `
                        <div style="font-size:0.72rem; color:var(--text-muted); font-style:italic;">
                            Senjata ini belum memiliki Action Sequence tersendiri (mengikuti Skill #1 atau Skill khusus di atas). Klik salah satu tombol preset di atas untuk memasang koreografi langsung pada senjata ini.
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- 📊 SISTEM STAT TERPADU NUSVANIR -->
        <div class="card">
            <div class="card-header">
                <h2>📊 Spesifikasi Stat &amp; Tempur Nusvanir</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">Unified stat system (Power, 6 Core Attributes &amp; Derived Stats).</span>
            </div>
            <div class="card-body">
                <!-- 1. WEAPON ATTACK POWER -->
                <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:8px;" title="Daya serang fisik dan sihir murni dari senjata">⚔️ Weapon Direct Power:</div>
                <div class="grid-3" style="margin-bottom:16px;">
                    <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                        <label style="color:#fb923c;">
                            <span>⚔️ Weapon ATK</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang fisik murni dari senjata (params[2])">Weapon Physical ATK</span>
                        </label>
                        <input type="number" class="form-control" value="${weapon.params[2] || 0}" onchange="weapon.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #a78bfa;">
                        <label style="color:#a78bfa;">
                            <span>🔮 Weapon MAT</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Daya serang magis murni dari senjata (params[4])">Weapon Magical ATK</span>
                        </label>
                        <input type="number" class="form-control" value="${weapon.params[4] || 0}" onchange="weapon.params[4]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                        <label style="color:#facc15;">
                            <span>⚡ Action Speed (AGI)</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);" title="Bonus kecepatan inisiatif giliran saat mengayunkan senjata ini (params[6])">Attack Speed / Delay</span>
                        </label>
                        <input type="number" class="form-control" value="${weapon.params[6] || 0}" onchange="weapon.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                </div>

                <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;" title="Bonus atribut STR, INT, DEX, AGI, VIT, LUK dari perlengkapan ini">💪 6 Core Attributes Bonus:</div>
                <div class="stat-grid-6" style="margin-bottom:16px;">
                    ${CORE_ATTRIBUTES.map(attr => `
                        <div class="stat-card-input">
                            <label style="color:${attr.color};">
                                <span>${attr.icon} ${attr.code}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                            </label>
                            <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(weapon, '${attr.code}', this.value);">
                        </div>
                    `).join('')}
                </div>

                <!-- 3. STAT TURUNAN NUSVANIR -->
                <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">💧 Vitalitas &amp; Regenerasi per Giliran:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;" title="Bonus akurasi, kritikal, dan penetrasi armor musuh">🎯 Precision, Critical &amp; Penetration:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;" title="Bonus mitigasi kerusakan dan penghindaran">🛡️ Defense, Evasion &amp; Mitigation:</div>
                <div class="stat-grid-8" style="margin-bottom:16px;">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">✨ Utilitas &amp; Penguatan Elemen:</div>
                <div class="grid-3">
                    ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                        <div class="stat-card-input">
                            <label style="color:${d.color};">
                                <span>${d.icon} ${d.name}</span>
                            </label>
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                        </div>
                    `).join('')}
                    <div class="stat-card-input">
                        <label style="color:#f59e0b;">
                            <span>🔥 Amplifikasi Elemen</span>
                        </label>
                        <div style="display:flex; gap:6px;">
                            <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="wepEleName" onchange="onWeaponElementAmplifyChange()">
                            <input type="text" class="form-control" placeholder="+15%" value="${escapeHtml(eleVal)}" id="wepEleVal" style="width:90px;" onchange="onWeaponElementAmplifyChange()">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SOKET & TEMPA -->
        <div class="card">
            <div class="card-header"><h2 title="Pengaturan soket permata dan sistem penempaan pandai besi">💎 Gem Sockets &amp; Refining</h2></div>
            <div class="card-body">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                        <input type="number" min="0" max="8" class="form-control" placeholder="0" value="${sockets}" onchange="setTagVal(weapon, 'Sockets', this.value);">
                    </div>
                    <div class="form-group">
                        <label>Maksimal Tempa (+X)</label>
                        <input type="number" min="0" max="20" class="form-control" placeholder="10" value="${upMax}" onchange="setTagVal(weapon, 'Upgrade Max', this.value);">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="form-group">
                        <label>% Sukses Tempa</label>
                        <input type="text" class="form-control" placeholder="90%" value="${upRate}" onchange="setTagVal(weapon, 'Upgrade Success', this.value);">
                    </div>
                    <div class="form-group">
                        <label title="Biaya emas yang dibutuhkan">Gold Cost</label>
                        <input type="number" class="form-control" placeholder="Gold" value="${upGold}" onchange="setTagVal(weapon, 'Upgrade Gold', this.value);">
                    </div>
                    <div class="form-group">
                        <label>Bonus ATK/Tempa</label>
                        <input type="text" class="form-control" placeholder="+3" value="${upAtk}" onchange="setTagVal(weapon, 'Upgrade ATK', this.value);">
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        ${renderTraitsCard(weapon, 'weapons')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(weapon.note || '')}</textarea>
            </div>
        </div>
    `;
}



function onWeaponElementAmplifyChange() {
    const weapon = State.weapons[State.selectedIndex];
    let note = weapon.note || '';
    note = note.replace(/<Element Amplify [a-zA-Z]+:[ ]*.+?>\n?/gi, '').trim();
    const name = document.getElementById('wepEleName').value.trim();
    const val = document.getElementById('wepEleVal').value.trim();
    if (name && val) {
        note = `<Element Amplify ${name}: ${val}>\n` + note;
    }
    weapon.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}



function onWeaponHandChange(type) {
    const weapon = State.weapons[State.selectedIndex];
    weapon.traits = weapon.traits || [];

    setTagVal(weapon, 'NUSV Hand Slot', null);

    if (type === '2H') {
        setTagVal(weapon, 'NUSV Hand Slot', '2H Primary+Secondary');
        if (!weapon.traits.some(t => t.code === 54 && t.dataId === 2)) {
            weapon.traits.push({ code: 54, dataId: 2, value: 1 });
        }
    } else if (type === 'Dual') {
        setTagVal(weapon, 'NUSV Hand Slot', 'Dual-compatible Primary/Secondary');
        weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
    } else {
        setTagVal(weapon, 'NUSV Hand Slot', '1H Primary');
        weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
    }
    renderEditor();
}

/**
 * Normal Attack Customization Helpers for Weapons
 */
function openSkillInAnimator(skillId) {
    if (!skillId) skillId = 1;
    State.selectedIndices = State.selectedIndices || {};
    State.selectedIndices['skill_animator'] = skillId;
    State.selectedIndices['skills'] = skillId;
    if (typeof switchTab === 'function') {
        switchTab('skill_animator');
    }
}

function onWeaponAttackSkillChange(skillId) {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    skillId = parseInt(skillId, 10) || 0;
    let note = weapon.note || '';

    // Remove existing <skill_id:...>
    note = note.replace(/<skill_id:\s*\d+>\n?/gi, '').trim();

    if (skillId > 0 && skillId !== 1) {
        note = `<skill_id: ${skillId}>\n` + note;
    }
    weapon.note = note;
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(skillId > 0 && skillId !== 1 ? `Serangan biasa senjata diarahkan ke Skill #${skillId}` : `Serangan biasa senjata kembali ke default (Skill #1)`, 'info');
    }
}

function onWeaponMotionChange(motion) {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    let note = weapon.note || '';
    note = note.replace(/<Weapon Motion:\s*[a-zA-Z]+>\n?/gi, '').trim();
    if (motion && motion !== 'auto') {
        note = `<Weapon Motion: ${motion}>\n` + note;
    }
    weapon.note = note;
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Motion serangan diubah: ${motion === 'auto' ? 'Otomatis' : motion}`, 'info');
    }
}

function createNewSkillForWeapon() {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;

    // Base template from Skill #1 or generic attack
    const baseSkill = State.skills[1] || {
        id: 1,
        name: 'Attack',
        animationId: 2,
        damage: { type: 1, formula: 'Math.max(1, a.atk - (b.def * 0.75))', variance: 20, critical: true },
        scope: 1,
        occasion: 1,
        speed: 0,
        successRate: 100,
        repeats: 1,
        tpGain: 10,
        hitType: 1
    };

    const newSkill = JSON.parse(JSON.stringify(baseSkill));
    
    // Find next available free ID in State.skills
    let newId = State.skills.length;
    while (State.skills[newId]) newId++;
    newSkill.id = newId;
    newSkill.name = `${weapon.name} Attack`;
    newSkill.description = `Serangan biasa khusus menggunakan senjata ${weapon.name}.`;
    newSkill.animationId = weapon.animationId || baseSkill.animationId || 2;
    newSkill.stypeId = 0; // Skill Type: None (so it's never locked by seal skill type)

    // Customize motion/approach based on weapon type
    const wtypes = State.system.weaponTypes || [];
    const wtName = (wtypes[weapon.wtypeId] || '').toLowerCase();
    const isRanged = wtName.includes('bow') || wtName.includes('busur') || wtName.includes('gun') || wtName.includes('rune');
    const isSpear = wtName.includes('spear') || wtName.includes('tombak') || wtName.includes('lance') || wtName.includes('dagger') || wtName.includes('belati');

    const appMotion = isRanged ? 'missile' : (isSpear ? 'thrust' : 'swing');
    const appType = isRanged ? 'ranged' : 'melee';

    // Generate starter sequence for this weapon attack skill
    const newCfg = {
        hasCustomSeq: true,
        cast: { enabled: false, motion: 'chant', step: false, animId: 0, duration: 15, se: '' },
        attack: {
            target: 'target',
            approach: appType,
            motion: appMotion,
            distance: isRanged ? 0 : 50,
            animId: newSkill.animationId,
            posType: 'center',
            offsetX: 0,
            offsetY: -35,
            repeats: 1,
            interval: 10,
            shake: 'light',
            flash: 'none'
        },
        reaction: {
            type: 'flinch',
            flash: 'red',
            popupType: 'hp_damage',
            testValue: 0,
            se: 'Blow1'
        },
        steps: [
            ...(isRanged ? [] : [{ id: 'step_m1', type: 'move', name: '🏃 Gerak Maju', duration: 14, approach: 'melee', distance: 50 }]),
            {
                id: 'step_a1',
                type: 'action',
                name: '⚔️ Serangan',
                duration: 18,
                motion: appMotion,
                target: 'target',
                animId: newSkill.animationId,
                offsetX: 0,
                offsetY: -35,
                posType: 'center',
                se: 'Blow1',
                shake: 'light',
                flash: 'none',
                reaction: 'flinch',
                popupType: 'hp_damage'
            },
            ...(isRanged ? [] : [{ id: 'step_r1', type: 'return', name: '↩️ Kembali', duration: 14, approach: 'walk' }])
        ]
    };

    if (typeof SkillAnimator !== 'undefined' && SkillAnimator.saveConfigToSkill) {
        SkillAnimator.saveConfigToSkill(newSkill, newCfg);
    }

    State.skills[newId] = newSkill;

    // Link this skill to the weapon note
    let note = weapon.note || '';
    note = note.replace(/<skill_id:\s*\d+>\n?/gi, '').trim();
    note = `<skill_id: ${newId}>\n` + note;
    weapon.note = note;

    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('weapons');
    State.modifiedTabs.add('skills');
    State.modifiedTabs.add('skill_animator');
    setUnsaved(true);

    if (typeof showToast === 'function') {
        showToast(`Skill #${newId} [${newSkill.name}] berhasil dibuat untuk senjata ini! Membuka di Skill Animator...`, 'success');
    }

    // Direct jump to Skill Animator
    openSkillInAnimator(newId);
}

const WEAPON_SEQ_PRESETS = {
    melee: {
        name: '🗡️ Melee Dash',
        seq: `<target action>\nmove user: target, front, 14\nwait for movement\nmotion swing: user\naction animation: target\naction effect: target\nwait for animation\n</target action>`
    },
    thrust: {
        name: '🏹 Thrust / Pierce',
        seq: `<target action>\nmove user: target, front, 12\nwait for movement\nmotion thrust: user\naction animation: target\naction effect: target\nenemy effect: targets, blink\nwait for animation\n</target action>`
    },
    ranged: {
        name: '🎯 Ranged / Bow',
        seq: `<target action>\nmotion missile: user\naction animation: target\naction effect: target\nwait for animation\n</target action>`
    },
    combo: {
        name: '⚡ 2x Multi-Strike',
        seq: `<target action>\nmove user: target, front, 14\nwait for movement\nmotion swing: user\naction animation: target\naction effect: target\nwait: 8\nmotion thrust: user\naction animation: target\naction effect: target\nwait for animation\n</target action>`
    }
};

function applyWeaponActionSequencePreset(presetKey) {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    const p = WEAPON_SEQ_PRESETS[presetKey];
    if (!p) return;

    let note = weapon.note || '';
    note = note.replace(/<setup action>[\s\S]*?<\/setup action>\n?/gi, '');
    note = note.replace(/<target action>[\s\S]*?<\/target action>\n?/gi, '');
    note = note.replace(/<finish action>[\s\S]*?<\/finish action>\n?/gi, '').trim();

    note = note + '\n\n' + p.seq;
    weapon.note = note.trim();
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Preset Action Sequence [${p.name}] diterapkan langsung pada ${weapon.name}!`, 'success');
    }
}

function clearWeaponActionSequence() {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    let note = weapon.note || '';
    note = note.replace(/<setup action>[\s\S]*?<\/setup action>\n?/gi, '');
    note = note.replace(/<target action>[\s\S]*?<\/target action>\n?/gi, '');
    note = note.replace(/<finish action>[\s\S]*?<\/finish action>\n?/gi, '').trim();
    weapon.note = note;
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Action sequence pada ${weapon.name} dihapus (kembali ke default)`, 'info');
    }
}

// =====================================================================
// 4. ARMORS & ACCESSORIES EDITOR (MERGED NUSV STAT SYSTEM)
// =====================================================================
