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
                        <span>${pai('sparkles')} Core Attribute Bonuses (EV)</span>
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
                        ${pai('sword')} Primary Combat Parameters
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
                            ${pai('zap')} Derived &amp; Mitigation Stats
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
                            <span style="color:var(--text-muted);">${pai('diamond-gem')} Gem Sockets:</span>
                            <span style="font-weight:700; color:#38bdf8;">${pai('diamond-gem').repeat(sockets)} (${sockets} Slot)</span>
                        </div>
                    ` : ''}
                    ${unleash ? `
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">${pai('zap')} Unleash Skill:</span>
                            <span style="font-weight:700; color:#facc15;">${escapeHtml(unleash)}</span>
                        </div>
                    ` : ''}
                    ${setName ? `
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">${pai('sparkles')} Item Set:</span>
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

    const seqMatch = note.match(/(?:<(?:setup|whole|target|follow|finish) action>[\s\S]*?<\/(?:setup|whole|target|follow|finish) action>\s*)+/i);
    const rawSeqText = seqMatch ? seqMatch[0].trim() : '';
    const hasCustomSeq = !!rawSeqText;

    const wtypes = State.system.weaponTypes || [];
    const wtName = wtypes[weapon.wtypeId] || '';

    container.innerHTML = `
        <!-- WEAPON PROPERTIES & STATS -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h2 title="Pengaturan spesifikasi dan daya serang senjata">${pai('sword')} Weapon: #${weapon.id} ${escapeHtml(weapon.name)}</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3); font-size:0.8rem; padding:3px 8px;">Tipe: ${escapeHtml(wtypes[weapon.wtypeId] || `Tipe ${weapon.wtypeId}`)}</span>
                    <span class="list-badge" style="color:${getRarityColor(rarity)}; border-color:${getRarityColor(rarity)}55; font-size:0.8rem; padding:3px 8px; font-weight:700;">${escapeHtml(rarity)}</span>
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
                                <label title="Harga beli di toko (harga jual default bernilai 50% dari harga beli) (Gold)">Price</label>
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
                            <label title="Wilayah atau kerajaan tempat senjata ini dibuat (&lt;NUSV Region&gt;)">Origin Region</label>
                            <input type="text" class="form-control" placeholder="Contoh: Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(weapon, 'NUSV Region', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Jurus yang berpeluang keluar secara otomatis saat melakukan serangan biasa (&lt;Unleash Skill&gt;)">Weapon Skill Unleash</label>
                            <input type="text" class="form-control" placeholder="Contoh: 15, 25%, 10" value="${escapeHtml(unleash)}" onchange="setTagVal(weapon, 'Unleash Skill', this.value);">
                            <div class="helper-text" title="Peluang jurus ini aktif saat karakter melancarkan serangan biasa">Triggered automatically during normal basic attacks.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PENGATURAN SERANGAN BIASA & ANIMASI SENJATA -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 title="Atur skill, efek visual (VFX), dan gerakan karakter saat menyerang dengan senjata ini">${pai('sword')} Serangan Biasa &amp; Animasi Senjata</h2>
                    <div class="helper-text" style="margin-top:2px;">
                        Pilih skill dasar, efek pukulan (VFX), dan gaya ayunan saat karakter memilih <strong>Attack</strong>.
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${hasCustomSeq ? `
                        <span class="badge-sub" style="color:#c084fc; background:var(--purple-dim); border-color:rgba(168,85,247,0.35);">
                            ${pai('video')} Override Khusus Aktif
                        </span>
                    ` : (customAttackSkillId > 0 ? `
                        <span class="badge-sub">
                            ${pai('target')} Skill #${customAttackSkillId}: ${escapeHtml((State.skills[customAttackSkillId] || {}).name || '')}
                        </span>
                    ` : `
                        <span class="list-badge">
                            Standar (Skill #1 Attack)
                        </span>
                    `)}
                </div>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; gap:14px;">
                <!-- 1. SKILL DASAR SAAT ATTACK -->
                <div class="form-group" style="margin-bottom:0;">
                    <label title="Skill yang otomatis dijalankan saat karakter memilih perintah Attack memakai senjata ini">1. Skill Dasar Saat Memilih &ldquo;Attack&rdquo;</label>
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        <select class="form-control" style="flex:1; min-width:220px;" onchange="onWeaponAttackSkillChange(this.value)">
                            <option value="0" ${!customAttackSkillId ? 'selected' : ''}>(Default: Skill #1 - Attack standar)</option>
                            <optgroup label="Preset Basic Attack per Tipe Senjata (#431 - #440)">
                                ${[1,2,3,4,5,6,7,8,9,10].map(tid => {
                                    const sid = 430 + tid;
                                    const s = State.skills[sid];
                                    if (!s) return '';
                                    return `<option value="${sid}" ${customAttackSkillId === sid ? 'selected' : ''}>#${sid} ${escapeHtml(s.name)}</option>`;
                                }).join('')}
                            </optgroup>
                            <optgroup label="Skill Lainnya">
                                ${State.skills.filter(s => s && s.id !== 1 && (s.id < 431 || s.id > 440)).map(s => `
                                    <option value="${s.id}" ${customAttackSkillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>
                                `).join('')}
                            </optgroup>
                        </select>
                        ${customAttackSkillId !== (430 + Math.min(10, Math.max(1, weapon.wtypeId || 1))) ? `
                            <button type="button" class="btn btn-secondary btn-sm" onclick="linkDefaultWeaponAttackSkill()" title="Hubungkan otomatis ke skill bawaan tipe ${escapeHtml(wtName || 'Senjata')}">
                                ${pai('target')} Ikut Tipe (${escapeHtml(wtName || 'Senjata')})
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-primary btn-sm" onclick="openVisualEditorForWeaponAttack()" title="Buka dan atur animasi gerakan skill ini secara visual di Action Sequence Editor">
                            ${pai('video')} Edit Animasi Visual
                        </button>
                    </div>
                    <div class="helper-text">
                        Animasi gerak &amp; kamera otomatis mengikuti skill di atas. Klik <strong>Edit Animasi Visual</strong> jika ingin mengubah gerakannya tanpa menulis kode.
                    </div>
                </div>

                <!-- 2. EFEK VISUAL (VFX) & GERAKAN KARAKTER -->
                <div class="grid-2">
                    <div class="form-group" style="margin-bottom:0;">
                        <label title="Efek visual percikan/tebasan (Animation) yang muncul di tubuh musuh saat serangan mengenai target (VFX)">2. Efek Pukulan</label>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <select class="form-control" onchange="weapon.animationId=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                <option value="0">(Ikut Pengaturan Skill)</option>
                                ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${weapon.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                            </select>
                            ${weapon.animationId > 0 ? `
                                <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimationInEditor(${weapon.animationId})" title="Buka efek animasi ini di Animation Studio">${pai('video')}</button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label title="Pose gerakan tangan karakter saat mengayunkan senjata di layar battle (Motion)">3. Gaya Ayunan Karakter</label>
                        <select class="form-control" onchange="onWeaponMotionChange(this.value)">
                            <option value="auto" ${weaponMotion === 'auto' ? 'selected' : ''}>Otomatis (Sesuai Tipe Senjata)</option>
                            <option value="swing" ${weaponMotion === 'swing' ? 'selected' : ''}>Tebasan (Swing)</option>
                            <option value="thrust" ${weaponMotion === 'thrust' ? 'selected' : ''}>Tusukan (Thrust)</option>
                            <option value="missile" ${weaponMotion === 'missile' ? 'selected' : ''}>Tembakan / Jarak Jauh (Missile)</option>
                        </select>
                    </div>
                </div>

                <!-- 3. OPSIONAL / LANJUTAN: OVERRIDE KOREOGRAFI KHUSUS SENJATA -->
                <details ${hasCustomSeq ? 'open' : ''} style="background:#0f1218; border:1px solid ${hasCustomSeq ? 'rgba(168,85,247,0.4)' : 'var(--border-color)'}; border-radius:var(--radius-sm); padding:10px 12px;">
                    <summary style="cursor:pointer; font-size:0.78rem; font-weight:600; color:${hasCustomSeq ? '#c084fc' : 'var(--text-muted)'}; user-select:none; display:flex; align-items:center; justify-content:space-between;">
                        <span>${pai('sliders')} Pengaturan Lanjutan: Timpa Koreografi Khusus Senjata Ini ${hasCustomSeq ? '(Aktif)' : '(Opsional)'}</span>
                    </summary>
                    <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
                        <div class="helper-text" style="margin-top:0;">
                            Isi bagian ini <strong>hanya jika</strong> senjata ini butuh gerakan/kamera berbeda dari skill dasarnya. Jika dikosongkan, senjata otomatis memakai animasi skill di atas.
                        </div>
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <select id="wepPresetSelect" class="form-control" style="flex:1; min-width:200px;" onchange="if(this.value) applyWeaponActionSequencePreset(this.value)">
                                <option value="">-- Terapkan Preset Gerakan Cepat --</option>
                                <optgroup label="Preset Umum">
                                    <option value="melee_dash">Melee Dash (Maju &amp; Tebas)</option>
                                    <option value="thrust_pierce">Thrust / Pierce (Maju &amp; Tusuk)</option>
                                    <option value="ranged_bow">Ranged / Bow (Tembak Jarak Jauh)</option>
                                    <option value="multi_strike">2x Multi-Strike (Tebas 2x)</option>
                                </optgroup>
                                <optgroup label="Preset 10 Tipe Senjata">
                                    <option value="long_sword">01. Long Sword (Tebas Berat &amp; Knockback)</option>
                                    <option value="sword">02. Sword (Maju Lincah &amp; Sabetan Cepat)</option>
                                    <option value="gloves">03. Gloves (Tinjuan 1-2x Dual Wield)</option>
                                    <option value="spear">04. Spear (Melompat &amp; Tusukan Tombak)</option>
                                    <option value="axe">05. Axe (Melompat Tinggi &amp; Hantaman Kapak)</option>
                                    <option value="staff">06. Staff (Maju Selangkah &amp; Proyektil Mana)</option>
                                    <option value="rune">07. Rune (Proyektil Mana 1-2x)</option>
                                    <option value="long_bow">08. Long Bow (Tarik Panah Jarak Jauh)</option>
                                    <option value="crossbow">09. Crossbow (Tembakan Beruntun 1-3x)</option>
                                    <option value="dagger">10. Dagger (Teleport Belakang &amp; Sabetan)</option>
                                </optgroup>
                            </select>
                            ${hasCustomSeq ? `
                                <button type="button" class="btn btn-danger btn-sm" onclick="clearWeaponActionSequence()" title="Hapus kode override dan kembali ikuti skill dasar">
                                    ${pai('trash')} Hapus Override
                                </button>
                            ` : ''}
                        </div>
                        <textarea class="form-control" rows="4" style="font-size:0.75rem;" onchange="onWeaponSeqChange(this.value)" placeholder="Kosongkan agar mengikuti skill dasar. Jika ingin override manual, tempelkan kode Action Sequence (<target action>...) di sini.">${escapeHtml(rawSeqText)}</textarea>
                    </div>
                </details>
            </div>
        </div>

        <!-- SISTEM STAT TERPADU NUSVANIR -->
        <div class="card">
            <div class="card-header">
                <h2>${pai('chart-bar')} Spesifikasi Stat &amp; Tempur Nusvanir</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">Unified stat system (Power, 6 Core Attributes &amp; Derived Stats).</span>
            </div>
            <div class="card-body">
                <!-- 1. WEAPON ATTACK POWER -->
                <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:8px;" title="Daya serang fisik dan sihir murni dari senjata">${pai('sword')} Weapon Direct Power:</div>
                <div class="grid-3" style="margin-bottom:16px;">
                    <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                        <label style="color:#fb923c;" title="Daya serang fisik murni dari senjata (params[2])"><span>${pai('sword')} Weapon ATK</span> <span style="font-size:0.75rem; color:var(--text-muted);">Weapon Physical ATK</span></label>
                        <input type="number" class="form-control" value="${weapon.params[2] || 0}" onchange="weapon.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #a78bfa;">
                        <label style="color:#a78bfa;" title="Daya serang magis murni dari senjata (params[4])"><span>${pai('wand')} Weapon MAT</span> <span style="font-size:0.75rem; color:var(--text-muted);">Weapon Magical ATK</span></label>
                        <input type="number" class="form-control" value="${weapon.params[4] || 0}" onchange="weapon.params[4]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                    <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                        <label style="color:#facc15;" title="Bonus kecepatan inisiatif giliran saat mengayunkan senjata ini (AGI, params[6])"><span>${pai('speed-fast')} Action Speed</span> <span style="font-size:0.75rem; color:var(--text-muted);">Attack Speed / Delay</span></label>
                        <input type="number" class="form-control" value="${weapon.params[6] || 0}" onchange="weapon.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                    </div>
                </div>

                <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;" title="Bonus atribut STR, INT, DEX, AGI, VIT, LUK dari perlengkapan ini">${pai('user')} 6 Core Attributes Bonus:</div>
                <div class="stat-grid-6" style="margin-bottom:16px;">
                    ${CORE_ATTRIBUTES.map(attr => `
                        <div class="stat-card-input">
                            <label style="color:${attr.color};"><span>${attr.icon} ${attr.code}</span> <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span></label>
                            <input type="text" class="form-control" placeholder="" value="${coreBonuses[attr.code]}" onchange="setTagVal(weapon, '${attr.code}', this.value);">
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
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
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
                            <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                        </div>
                    `).join('')}
                </div>

                <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;" title="Bonus mitigasi kerusakan dan penghindaran">${pai('shield')} Defense, Evasion &amp; Mitigation:</div>
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

                <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">${pai('sparkles')} Utilitas &amp; Penguatan Elemen:</div>
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
                        <label style="color:#f59e0b;"><span>${pai('fire')} Amplifikasi Elemen</span></label>
                        <div style="display:flex; gap:6px;">
                            <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="wepEleName" onchange="onWeaponElementAmplifyChange()">
                            <input type="text" class="form-control" placeholder="" value="${escapeHtml(eleVal)}" id="wepEleVal" style="width:90px;" onchange="onWeaponElementAmplifyChange()">
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
                        <label title="&lt;Sockets: X&gt;">Jumlah Soket Permata</label>
                        <input type="number" min="0" max="8" class="form-control" placeholder="" value="${sockets}" onchange="setTagVal(weapon, 'Sockets', this.value);">
                    </div>
                    <div class="form-group">
                        <label title="+X">Maksimal Tempa</label>
                        <input type="number" min="0" max="20" class="form-control" placeholder="" value="${upMax}" onchange="setTagVal(weapon, 'Upgrade Max', this.value);">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="form-group">
                        <label>% Sukses Tempa</label>
                        <input type="text" class="form-control" placeholder="" value="${upRate}" onchange="setTagVal(weapon, 'Upgrade Success', this.value);">
                    </div>
                    <div class="form-group">
                        <label title="Biaya emas yang dibutuhkan">Gold Cost</label>
                        <input type="number" class="form-control" placeholder="Gold" value="${upGold}" onchange="setTagVal(weapon, 'Upgrade Gold', this.value);">
                    </div>
                    <div class="form-group">
                        <label>Bonus ATK/Tempa</label>
                        <input type="text" class="form-control" placeholder="" value="${upAtk}" onchange="setTagVal(weapon, 'Upgrade ATK', this.value);">
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        ${renderTraitsCard(weapon, 'weapons')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">${pai('notes')} Raw Notetags (Direct Edit)</h2></div>
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
    State.selectedIndices['skills'] = skillId;
    if (skillId >= 431 && skillId <= 440) {
        State.skillClassFilter = 'weapon_attacks';
    } else {
        State.skillClassFilter = 'all';
    }
    if (typeof switchTab === 'function') {
        switchTab('skills');
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

    // Generate starter sequence for this weapon attack skill (Yanfly Battle Engine Core)
    let seq = '';
    if (isRanged) {
        seq = `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\nperform start\nwait for movement\n</setup action>\n\n<target action>\nmotion ${appMotion}: user\nattack animation: target\nwait for animation\naction effect: target\nwait for effect\n</target action>\n\n<finish action>\nimmortal: targets, false\nperform finish\n</finish action>`;
    } else {
        seq = `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\nperform start\nwait for movement\n</setup action>\n\n<target action>\nmove user: target, front, 18\nwait for movement\nmotion ${appMotion}: user\nattack animation: target\nwait for animation\naction effect: target\nshake screen: 2, 4, 10\nwait for effect\n</target action>\n\n<finish action>\nimmortal: targets, false\nperform finish\n</finish action>`;
    }
    newSkill.note = seq;

    State.skills[newId] = newSkill;

    // Link this skill to the weapon note
    let note = weapon.note || '';
    note = note.replace(/<skill_id:\s*\d+>\n?/gi, '').trim();
    note = `<skill_id: ${newId}>\n` + note;
    weapon.note = note;

    if (!State.modifiedTabs) State.modifiedTabs = new Set();
    State.modifiedTabs.add('weapons');
    State.modifiedTabs.add('skills');
    setUnsaved(true);

    if (typeof showToast === 'function') {
        showToast(`Skill #${newId} [${newSkill.name}] berhasil dibuat untuk senjata ini! Membuka di Skill Animator...`, 'success');
    }

    // Direct jump to Skill Animator
    openSkillInAnimator(newId);
}

const WEAPON_SEQ_PRESETS = {
    long_sword: {
        name: 'Long Sword',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmove user: target, front, 18, 20\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 12\nmove target: backward, 45, 8\nwait: 8\nmove target: home, 8\nwait: 10\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    sword: {
        name: 'Sword',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmove user: target, front, 18, 14\nwait for movement\nmotion swing: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 8\nwait: 12\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    gloves: {
        name: 'Gloves',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmove user: target, front, 14, 12\nwait for movement\nmotion thrust: user\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 10\nif user.isDualWield()\n  motion swing: user\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 3, 5, 8\n  wait: 10\nend\nwait: 8\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: return, 14\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    spear: {
        name: 'Spear',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\njump user: 120, 16\nmove user: target, front, 24, 16\nwait for movement\nmotion thrust: user\nwait: 8\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 10\nmove target: backward, 50, 8\nwait: 8\nmove target: home, 8\nwait: 10\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    axe: {
        name: 'Axe',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\njump user: 140, 18\nmove user: target, front, 18, 18\nwait for movement\nmotion swing: user\nwait: 12\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 4, 6, 14\nmove target: backward, 60, 8\nwait: 8\nmove target: home, 8\nwait: 12\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: return, 15\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    staff: {
        name: 'Staff',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmove user: forward, 30, 12\nwait for movement\nmotion chant: user\ncast animation\nwait: 16\nmotion swing: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 8\nwait: 15\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: home, 12\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    rune: {
        name: 'Rune',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmove user: forward, 25, 12\nwait for movement\nmotion chant: user\ncast animation\nwait: 14\nmotion spell: user\nwait: 8\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 8\nif user.isDualWield()\n  motion spell: user\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 2, 4, 6\n  wait: 8\nend\nwait: 10\n</target action>\n\n<finish action>\nimmortal: targets, false\nmove user: home, 12\nwait for movement\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    long_bow: {
        name: 'Long Bow',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmotion chant: user\nwait: 14\nmotion missile: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 3, 5, 10\nmove target: backward, 40, 8\nwait: 8\nmove target: home, 8\nwait: 12\n</target action>\n\n<finish action>\nimmortal: targets, false\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    crossbow: {
        name: 'Crossbow',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 120%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nmotion missile: user\nattack animation: target\nwait: 8\naction effect: target\nmotion damage: target\nshake screen: 1, 3, 5\nwait: 6\nmotion missile: user\nattack animation: target\nwait: 8\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 6\nif user.agi >= 30 || user.atk >= 40\n  motion missile: user\n  attack animation: target\n  wait: 8\n  action effect: target\n  motion damage: target\n  shake screen: 3, 5, 8\n  wait: 6\nend\nmove target: backward, 35, 8\nwait: 8\nmove target: home, 8\nwait: 10\n</target action>\n\n<finish action>\nimmortal: targets, false\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    dagger: {
        name: 'Dagger',
        seq: `<setup action>\nclear battle log\ndisplay action\nimmortal: targets, true\ncamera clamp off\ncamera focus: user, center, 25\nzoom: 125%, 25\nwait for camera\nwait for zoom\nwait: 6\n</setup action>\n\n<target action>\nopacity user: 0%, 5\nwait for opacity\nmove user: target, back base, 0\nopacity user: 100%, 5\nwait for opacity\nface user: backward\nmotion swing: user\nwait: 6\nattack animation: target\nwait for animation\naction effect: target\nmotion damage: target\nshake screen: 2, 4, 6\nwait: 6\nif user.isDualWield()\n  motion thrust: user\n  wait: 6\n  attack animation: target\n  wait for animation\n  action effect: target\n  motion damage: target\n  shake screen: 2, 4, 8\n  wait: 8\nend\nmove target: forward, 20, 6\nwait: 6\nmove target: home, 6\nwait: 6\n</target action>\n\n<finish action>\nimmortal: targets, false\nopacity user: 0%, 5\nwait for opacity\nmove user: home, 0\nface user: forward\nopacity user: 100%, 5\nwait for opacity\nreset camera: 30\nreset zoom: 30\nwait for camera\nwait for zoom\nperform finish\nclear battle log\n</finish action>`
    },
    melee_dash: {
        name: 'Melee Dash',
        seq: `<target action>\nmove user: target, front, 14, 15\nwait for movement\nmotion swing: user\nwait: 6\naction animation: target\naction effect: target\nwait for animation\nwait for effect\n</target action>`
    },
    thrust_pierce: {
        name: 'Thrust / Pierce',
        seq: `<target action>\nmove user: target, front, 18, 15\nwait for movement\nmotion thrust: user\nwait: 6\naction animation: target\naction effect: target\nwait for animation\nwait for effect\n</target action>`
    },
    ranged_bow: {
        name: 'Ranged / Bow',
        seq: `<target action>\nmotion missile: user\nwait: 10\naction animation: target\naction effect: target\nwait for animation\nwait for effect\n</target action>`
    },
    multi_strike: {
        name: '2x Multi-Strike',
        seq: `<target action>\nmove user: target, front, 14, 15\nwait for movement\nmotion swing: user\nwait: 6\naction animation: target\naction effect: target\nwait: 10\nmotion swing: user\nwait: 6\naction animation: target\naction effect: target\nwait for animation\nwait for effect\n</target action>`
    }
};

function applyWeaponActionSequencePreset(presetKey) {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon || !presetKey) return;
    const p = WEAPON_SEQ_PRESETS[presetKey];
    if (!p) return;

    let note = weapon.note || '';
    note = note.replace(/<setup action>[\s\S]*?<\/setup action>\n?/gi, '');
    note = note.replace(/<whole action>[\s\S]*?<\/whole action>\n?/gi, '');
    note = note.replace(/<target action>[\s\S]*?<\/target action>\n?/gi, '');
    note = note.replace(/<follow action>[\s\S]*?<\/follow action>\n?/gi, '');
    note = note.replace(/<finish action>[\s\S]*?<\/finish action>\n?/gi, '').trim();

    note = note ? note + '\n\n' + p.seq : p.seq;
    weapon.note = note.trim();
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Preset Action Sequence [${p.name}] diterapkan langsung pada ${weapon.name}!`, 'success');
    }
}

function onWeaponSeqChange(val) {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    let note = weapon.note || '';
    note = note.replace(/<setup action>[\s\S]*?<\/setup action>\n?/gi, '');
    note = note.replace(/<whole action>[\s\S]*?<\/whole action>\n?/gi, '');
    note = note.replace(/<target action>[\s\S]*?<\/target action>\n?/gi, '');
    note = note.replace(/<follow action>[\s\S]*?<\/follow action>\n?/gi, '');
    note = note.replace(/<finish action>[\s\S]*?<\/finish action>\n?/gi, '').trim();

    val = (val || '').trim();
    if (val) {
        note = note ? note + '\n\n' + val : val;
    }
    weapon.note = note.trim();
    setUnsaved(true);
    updateRawNoteTextarea();
}

function linkDefaultWeaponAttackSkill() {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    const wtype = Math.min(10, Math.max(1, weapon.wtypeId || 1));
    const targetSkillId = 430 + wtype;
    let note = weapon.note || '';
    note = note.replace(/<skill_id:\s*\d+>\n?/gi, '');
    note = note.replace(/<Attack Skill:\s*\d+>\n?/gi, '').trim();
    weapon.note = `<skill_id: ${targetSkillId}>\n` + note;
    setUnsaved(true);
    renderEditor();
    const skillName = State.skills[targetSkillId]?.name || `Skill #${targetSkillId}`;
    if (typeof showToast === 'function') {
        showToast(`Senjata ${weapon.name} dihubungkan ke [${skillName}]!`, 'success');
    }
}

function openVisualEditorForWeaponAttack() {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    let skillId = 1;
    const m = (weapon.note || '').match(/<(?:skill_id|Attack Skill):\s*(\d+)>/i);
    if (m) {
        skillId = parseInt(m[1], 10);
    } else {
        const wtype = Math.min(10, Math.max(1, weapon.wtypeId || 1));
        skillId = 430 + wtype;
        linkDefaultWeaponAttackSkill();
    }
    openSkillInAnimator(skillId);
}

function clearWeaponActionSequence() {
    const weapon = State.weapons[State.selectedIndex];
    if (!weapon) return;
    let note = weapon.note || '';
    note = note.replace(/<setup action>[\s\S]*?<\/setup action>\n?/gi, '');
    note = note.replace(/<whole action>[\s\S]*?<\/whole action>\n?/gi, '');
    note = note.replace(/<target action>[\s\S]*?<\/target action>\n?/gi, '');
    note = note.replace(/<follow action>[\s\S]*?<\/follow action>\n?/gi, '');
    note = note.replace(/<finish action>[\s\S]*?<\/finish action>\n?/gi, '').trim();
    weapon.note = note;
    setUnsaved(true);
    renderEditor();
    if (typeof showToast === 'function') {
        showToast(`Action sequence pada ${weapon.name} dihapus (kembali ke default)`, 'info');
    }
}

window.applyWeaponActionSequencePreset = applyWeaponActionSequencePreset;
window.clearWeaponActionSequence = clearWeaponActionSequence;
window.linkDefaultWeaponAttackSkill = linkDefaultWeaponAttackSkill;
window.openVisualEditorForWeaponAttack = openVisualEditorForWeaponAttack;
window.onWeaponSeqChange = onWeaponSeqChange;
window.onWeaponAttackSkillChange = onWeaponAttackSkillChange;
window.onWeaponMotionChange = onWeaponMotionChange;
window.openSkillInAnimator = openSkillInAnimator;
window.createNewSkillForWeapon = createNewSkillForWeapon;

// =====================================================================
// 4. ARMORS & ACCESSORIES EDITOR (MERGED NUSV STAT SYSTEM)
// =====================================================================
