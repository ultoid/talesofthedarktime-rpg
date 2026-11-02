/**
 * NUSV Database Studio - Entity Editor: editors/skill_editor.js
 */

function renderSkillStatPreview(container, skill) {
    if (!skill) return;
    const scopeNames = {
        0: 'None',
        1: '1 Enemy',
        2: 'All Enemies',
        3: '1 Random Enemy',
        4: '2 Random Enemies',
        5: '3 Random Enemies',
        6: '4 Random Enemies',
        7: '1 Ally (Alive)',
        8: 'All Allies (Alive)',
        9: '1 Ally (Dead)',
        10: 'All Allies (Dead)',
        11: 'The User'
    };
    const hitTypes = { 0: 'Certain Hit', 1: 'Physical Attack', 2: 'Magical Attack' };

    container.innerHTML = `
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <div style="font-size:0.75rem; color:#a78bfa; font-weight:700;">Skill Inspector</div>
                    <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${skill.id} ${escapeHtml(skill.name || 'Unnamed')}</h2>
                </div>
                <span class="badge" style="background:#a78bfa22; color:#a78bfa; border:1px solid #a78bfa55; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:9999px;">
                    ${hitTypes[skill.hitType] || 'Action'}
                </span>
            </div>
            <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                <!-- Resource Costs -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">MP Cost</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;">${skill.mpCost || 0}</div>
                    </div>
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #eab308;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">SP Cost</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#eab308;">${skill.tpCost || 0}</div>
                    </div>
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">SP Gain</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#f87171;">+${skill.tpGain || 0}</div>
                    </div>
                </div>

                <!-- Target Scope & Speed -->
                <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">🎯 Target Scope:</span>
                        <strong style="color:#f8fafc;">${scopeNames[skill.scope] || `Scope ${skill.scope}`}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">⚡ Speed (Priority):</span>
                        <strong style="color:#facc15;">${skill.speed > 0 ? `+${skill.speed}` : skill.speed}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">🎯 Success Rate:</span>
                        <strong style="color:#34d399;">${skill.successRate}%</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--text-muted);">🔄 Repeats:</span>
                        <strong style="color:#38bdf8;">${skill.repeats}x</strong>
                    </div>
                </div>

                <!-- Damage Formula -->
                ${skill.damage && skill.damage.type > 0 ? `
                    <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:8px; padding:10px;">
                        <div style="font-size:0.72rem; color:#f87171; font-weight:700; margin-bottom:4px;">💥 Damage Formula</div>
                        <code style="font-size:0.8rem; color:#fca5a5; display:block; word-break:break-all;">
                            ${escapeHtml(skill.damage.formula || '0')}
                        </code>
                        <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px;">
                            Variance: ±${skill.damage.variance || 0}% ${skill.damage.critical ? '• Can Critical' : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Description -->
                ${skill.description ? `
                    <div style="background:rgba(255,255,255,0.02); border-left:2px solid #a78bfa; padding:8px 10px; border-radius:0 6px 6px 0; font-size:0.78rem; color:#cbd5e1; font-style:italic;">
                        "${escapeHtml(skill.description)}"
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}



function renderSkillEditor(container, skill) {
    const note = skill.note || '';
    const isInstant = hasTag(note, 'Instant Cast');
    const instantVal = getTagVal(note, 'Instant Cast', isInstant ? 'Free' : 'None');
    const targetTag = getTagVal(note, 'Target', '');
    const wordWrap = hasTag(note, 'WordWrap');
    const desc = getTagVal(note, 'NUSV Desc', skill.description || '');

    const learnLvl = getTagVal(note, 'Learn Level', '');
    const learnJp = getTagVal(note, 'Learn JP', '');
    const learnGold = getTagVal(note, 'Learn Gold', '');
    const learnClass = getTagVal(note, 'Learn Class', '');
    const tier = getSkillTier(skill);
    const tmClasses = getSkillTmCompatibleClasses(skill);
    const isExclusive = isSkillExclusive(skill);
    const tmItem = getSkillTmItem(skill.id);
    const movepoolClass = getTagVal(note, 'Class Movepool', '');
    const tierLabels = {
        1: 'Tier 1 - Novice',
        2: 'Tier 2 - Basic',
        3: 'Tier 3 - Intermediate',
        4: 'Tier 4 - Advanced Promoted',
        5: 'Tier 5 - Master Specialist',
        6: 'Tier 6 - Transcendent Legend'
    };
    const learnItem = getTagVal(note, 'Learn Item', '');
    const learnSwitch = getTagVal(note, 'Learn Switch', '');
    const hideIfLearned = hasTag(note, 'Hide If Learned');
    const jpGain = getTagVal(note, 'JP Gain', '');

    const critDmg = getTagVal(note, 'Critical Damage', '');
    const armPen = getTagVal(note, 'Armor Penetration', '');
    const magPen = getTagVal(note, 'Magic Penetration', '');
    const dmgCap = getTagVal(note, 'Damage Cap', '');
    const bypassCap = hasTag(note, 'Bypass Damage Cap');

    skill.damage = skill.damage || { type: 0, elementId: 0, formula: '0', variance: 20, critical: false };
    skill.effects = skill.effects || [];

    const stypes = State.system.skillTypes || [];
    const elements = State.system.elements || [];
    const isOutOfBattle = (skill.occasion === 0 || skill.occasion === 2);

    container.innerHTML = `
        <!-- NUSVANIR SKILL MASTERY & SCROLL SYSTEM CARD -->
        <div class="card" style="border:1px solid #8b5cf655; background:linear-gradient(180deg, rgba(30,27,75,0.45) 0%, rgba(15,23,42,0.6) 100%); margin-bottom:16px;">
            <div class="card-header" style="border-bottom:1px solid #8b5cf633; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="color:#c4b5fd; font-size:1.05rem; display:flex; align-items:center; gap:8px;">
                    <span>🌟</span> Pembelajaran Jurus &amp; Scroll Pusaka (TM)
                </h2>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${isOutOfBattle ? `<span class="badge" style="background:#10b98122; color:#34d399; border:1px solid #10b98155; font-size:0.75rem; font-weight:700; padding:3px 8px;">📖 Grimoire / Luar Battle</span>` : ''}
                    <span class="badge" style="background:#8b5cf622; color:#c4b5fd; border:1px solid #8b5cf655; font-size:0.8rem; font-weight:700; padding:4px 10px; border-radius:9999px;">
                        ${tierLabels[tier] || 'Tier ' + (tier || 1)}
                    </span>
                </div>
            </div>
            <div class="card-body" style="padding:14px;">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:12px;">
                    <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px;">
                        <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">DIKUASAI ALAMI (LEVEL UP)</div>
                        <div style="font-size:0.95rem; font-weight:700; color:#38bdf8; margin-top:3px;">
                            ${escapeHtml(movepoolClass || learnClass || 'Universal')}
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px;">
                        <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">STATUS SCROLL (TM)</div>
                        <div style="font-size:0.95rem; font-weight:700; color:${isExclusive ? '#f87171' : '#34d399'}; margin-top:3px;">
                            ${isExclusive ? '★ Eksklusif (Tanpa Scroll)' : (tmItem ? `Item #${tmItem.id} (${escapeHtml(tmItem.name)})` : 'Tersedia via Scroll')}
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px;">
                        <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">SYARAT SENJATA</div>
                        <div style="font-size:0.95rem; font-weight:700; color:#fbbf24; margin-top:3px;">
                            ${(skill.requiredWtypeId1 === 0 && skill.requiredWtypeId2 === 0) ? 'Bebas / Tanpa Syarat Senjata' : ((State.system.weaponTypes[skill.requiredWtypeId1] || 'Senjata') + (skill.requiredWtypeId2 > 0 ? ' / ' + State.system.weaponTypes[skill.requiredWtypeId2] : ''))}
                        </div>
                    </div>
                </div>

                <div>
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; margin-bottom:6px;">
                        ${isExclusive ? '👑 HANYA DIKUASAI OLEH:' : `📜 KELAS YANG BISA MEMPELAJARI DARI SCROLL (${tmClasses.length} KELAS):`}
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${isExclusive ? `<span class="badge" style="background:#ef444422; color:#f87171; border:1px solid #ef444455; padding:4px 10px; font-weight:600;">Khusus ${escapeHtml(learnClass || 'Master')} (Jurus Pamungkas)</span>` : 
                        (tmClasses.length > 0 ? tmClasses.map(c => `<span class="badge" style="background:#10b98122; color:#34d399; border:1px solid #10b98155; padding:3px 9px; font-size:0.8rem; font-weight:600;">${escapeHtml(c)}</span>`).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Semua kelas yang kompatibel</span>')}
                    </div>
                </div>
            </div>
        </div>

        <!-- IDENTITAS & PENGGUNAAN SKILL -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan jurus, mantra sihir, dan formula kalkulasi damage">✨ Skill: #${skill.id} ${escapeHtml(skill.name)}</h2>
                <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(stypes[skill.stypeId] || `Tipe ${skill.stypeId}`)}</span>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Nama skill, jurus, atau mantra yang tampil di menu tempur">Skill Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(skill.name || '')}" onchange="skill.name=this.value; setUnsaved(true); renderSidebar();">
                            </div>
${renderIconPickerField('Icon Index', skill.iconIndex, "function(v){ skill.iconIndex=v; setUnsaved(true); renderEditor(); }", 'Pilih ikon skill dari IconSet')}
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Kategori tipe skill (misal Magic, Special, Martial Arts)">Skill Type (stypeId)</label>
                                <select class="form-control" onchange="skill.stypeId=parseInt(this.value,10); setUnsaved(true);">
                                    ${stypes.map((st, idx) => idx === 0 ? '' : `<option value="${idx}" ${skill.stypeId === idx ? 'selected' : ''}>${escapeHtml(st || `Tipe ${idx}`)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Jumlah Mana Points (MP) yang dibutuhkan untuk menggunakan skill">MP Cost</label>
                                <input type="number" min="0" class="form-control" value="${skill.mpCost || 0}" onchange="skill.mpCost=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Jumlah Stamina Points (SP) yang dibutuhkan untuk menggunakan skill">SP Cost (Stamina)</label>
                                <input type="number" min="0" class="form-control" value="${skill.tpCost || 0}" onchange="skill.tpCost=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Target penerima efek skill (1 Musuh, Semua Musuh, 1 Kawan, Semua Kawan, dll.)">Scope / Target</label>
                                <select class="form-control" onchange="skill.scope=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(SCOPE_NAMES).map(k => `<option value="${k}" ${skill.scope === parseInt(k,10) ? 'selected' : ''}>${SCOPE_NAMES[k]}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Kondisi di mana skill ini bisa digunakan (Selalu, Hanya Pertempuran, Hanya di Menu)">Occasion</label>
                                <select class="form-control" onchange="skill.occasion=parseInt(this.value,10); setUnsaved(true);">
                                    ${Object.keys(OCCASION_NAMES).map(k => `<option value="${k}" ${skill.occasion === parseInt(k,10) ? 'selected' : ''}>${OCCASION_NAMES[k]}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label title="Animasi visual yang dimainkan pada target saat skill dilancarkan">Skill Animation</label>
                            <select class="form-control" onchange="skill.animationId=parseInt(this.value,10); setUnsaved(true);">
                                <option value="0">(Tanpa Animasi)</option>
                                ${State.animations.filter(a => a).map(a => `<option value="${a.id}" ${skill.animationId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Deskripsi tampilan senjata dalam game di menu perlengkapan">Game Description</label>
                            <textarea class="form-control" rows="3" onchange="skill.description=this.value; setTagVal(skill, 'NUSV Desc', this.value);">${escapeHtml(skill.description || desc)}</textarea>
                        </div>

                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Skill langsung dieksekusi seketika tanpa menghabiskan giliran tempur">Instant Cast (&lt;Instant Cast&gt;)</label>
                                <select class="form-control" onchange="onSkillInstantChange(this.value)">
                                    <option value="None" ${(!isInstant && instantVal === 'None') ? 'selected' : ''} title="Mengkonsumsi giliran normal seperti biasa">Normal (Consumes Turn)</option>
                                    <option value="Free" ${(isInstant && (instantVal === 'Free' || instantVal === '')) ? 'selected' : ''}>Free Action (Tanpa Turn)</option>
                                    <option value="Turn" ${instantVal === 'Turn' ? 'selected' : ''}>Turn Khusus</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label title="Pembatasan target berdasarkan baris formasi (Baris Depan, Baris Belakang)">Target Row Formation (&lt;Target&gt;)</label>
                                <select class="form-control" onchange="setTagVal(skill, 'Target', this.value !== 'Default' ? this.value : '');">
                                    <option value="Default" ${targetTag === '' ? 'selected' : ''}>Default Scope</option>
                                    <option value="Ally Row" ${targetTag === 'Ally Row' ? 'selected' : ''}>Baris Teman</option>
                                    <option value="Enemy Row" ${targetTag === 'Enemy Row' ? 'selected' : ''} title="Menarget seluruh musuh pada satu baris">Enemy Row</option>
                                    <option value="Front Enemy Row" ${targetTag === 'Front Enemy Row' ? 'selected' : ''} title="Menarget musuh di baris depan">Front Enemy Row</option>
                                    <option value="Back Enemy Row" ${targetTag === 'Back Enemy Row' ? 'selected' : ''} title="Menarget musuh di baris belakang">Back Enemy Row</option>
                                    <option value="Everybody" ${targetTag === 'Everybody' ? 'selected' : ''}>Semua Battler</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Pengubah kecepatan inisiatif giliran saat merapal skill ini (nilai positif = lebih cepat)">Speed Modifier</label>
                                <input type="number" class="form-control" value="${skill.speed || 0}" onchange="skill.speed=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Persentase peluang keberhasilan aktivasi skill (default 100%)">Success Rate (%)</label>
                                <input type="number" min="0" max="100" class="form-control" value="${skill.successRate !== undefined ? skill.successRate : 100}" onchange="skill.successRate=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Jumlah pukulan berturut-turut yang dilancarkan dalam satu kali aksi">Repeats Count</label>
                                <input type="number" min="1" max="10" class="form-control" value="${skill.repeats || 1}" onchange="skill.repeats=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- FORMULA KERUSAKAN / PEMULIHAN (DAMAGE FORMULA) -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan formula perhitungan kerusakan, elemen serangan, dan variasi">💥 Damage Formula &amp; Elements</h2>
            </div>
            <div class="card-body">
                <div class="grid-4">
                    <div class="form-group">
                        <label title="Jenis efek kerusakan: Kerusakan HP, Kerusakan MP, Pemulihan HP, Serap HP, dll.">Damage Type</label>
                        <select class="form-control" onchange="skill.damage.type=parseInt(this.value,10); setUnsaved(true);">
                            ${Object.keys(DAMAGE_TYPES).map(k => `<option value="${k}" ${skill.damage.type === parseInt(k,10) ? 'selected' : ''}>${DAMAGE_TYPES[k]}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Elemen damage yang dihasilkan (Fisik, Api, Es, Petir, Cahaya, Kegelapan, dll.)">Damage Element</label>
                        <select class="form-control" onchange="skill.damage.elementId=parseInt(this.value,10); setUnsaved(true);">
                            <option value="-1" ${skill.damage.elementId === -1 ? 'selected' : ''} title="Mengikuti elemen senjata yang sedang digunakan">Normal Weapon Element</option>
                            <option value="0" ${skill.damage.elementId === 0 ? 'selected' : ''}>Tanpa Elemen (None)</option>
                            ${elements.map((el, idx) => idx === 0 ? '' : `<option value="${idx}" ${skill.damage.elementId === idx ? 'selected' : ''}>${escapeHtml(el)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Persentase fluktuasi acak hasil akhir damage (misal 20% berarti damage +/- 20%)">Damage Variance (%)</label>
                        <input type="number" min="0" max="100" class="form-control" value="${skill.damage.variance || 20}" onchange="skill.damage.variance=parseInt(this.value,10); setUnsaved(true);">
                    </div>
                    <div class="form-group" style="display:flex; align-items:center;">
                        <label class="checkbox-label" style="margin-top:16px;">
                            <input type="checkbox" ${skill.damage.critical ? 'checked' : ''} onchange="skill.damage.critical=this.checked; setUnsaved(true);">
                            <span title="Apakah serangan skill ini dapat menghasilkan pukulan kritikal">Allow Critical Hits</span>
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-top:10px;">
                    <label title="Rumus formula perhitungan damage (a = penyerang, b = target, misal: a.atk * 4 - b.def * 2)">Damage Formula (e.g. <code>a.atk * 4 - b.def * 2</code>)</label>
                    <input type="text" class="form-control" style="font-family:monospace; font-size:0.9rem; color:#60a5fa;" value="${escapeHtml(skill.damage.formula || '0')}" onchange="skill.damage.formula=this.value; setUnsaved(true);">
                </div>
            </div>
        </div>

        <!-- SKILL LEARNING & MODIFIERS -->
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h2 title="Syarat yang dibutuhkan untuk mempelajari skill ini">📚 Skill Learning Requirements</h2></div>
                <div class="card-body">
                    <div class="grid-3">
                        <div class="form-group">
                            <label title="Batas level paling rendah yang mungkin dimiliki musuh ini">Minimum Level Floor</label>
                            <input type="number" class="form-control" placeholder="Level" value="${learnLvl}" onchange="setTagVal(skill, 'Learn Level', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Jumlah Job Points (JP) yang dibutuhkan untuk mempelajari skill ini">JP Cost</label>
                            <input type="number" class="form-control" placeholder="JP" value="${learnJp}" onchange="setTagVal(skill, 'Learn JP', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Biaya emas yang dibutuhkan">Gold Cost</label>
                            <input type="number" class="form-control" placeholder="Gold" value="${learnGold}" onchange="setTagVal(skill, 'Learn Gold', this.value);">
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label title="Kelas tertentu yang disyaratkan untuk mempelajari skill ini">Prerequisite Class</label>
                            <select class="form-control" onchange="setTagVal(skill, 'Learn Class', this.value);">
                                <option value="" title="Dapat dipelajari oleh kelas apa pun">(Any Class)</option>
                                ${State.classes.filter(c => c).map(c => {
                                    const isSel = (learnClass === String(c.id) || (learnClass && c.name.toLowerCase() === learnClass.toLowerCase()));
                                    return `<option value="${c.id}" ${isSel ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label title="Jumlah JP yang didapatkan saat skill ini digunakan dalam pertempuran">JP Gain on Use (&lt;JP Gain&gt;)</label>
                            <input type="text" class="form-control" placeholder="+10" value="${jpGain}" onchange="setTagVal(skill, 'JP Gain', this.value);">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2 title="Pengaturan batas kerusakan maksimal dan pengabaian pertahanan">💥 Penetration &amp; Damage Cap</h2></div>
                <div class="card-body">
                    <div class="grid-3">
                        <div class="form-group">
                            <label>Bonus Crit Dmg</label>
                            <input type="text" class="form-control" placeholder="+25%" value="${critDmg}" onchange="setTagVal(skill, 'Critical Damage', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Modifikasi pengabaian persen pertahanan fisik target (<Armor Penetration: +X%>)">Armor Penetration Modifier</label>
                            <input type="text" class="form-control" placeholder="20%" value="${armPen}" onchange="setTagVal(skill, 'Armor Penetration', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Modifikasi pengabaian persen pertahanan sihir target (<Magic Penetration: +X%>)">Magic Penetration Modifier</label>
                            <input type="text" class="form-control" placeholder="20%" value="${magPen}" onchange="setTagVal(skill, 'Magic Penetration', this.value);">
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Batas Cap Damage</label>
                            <input type="number" class="form-control" placeholder="99999" value="${dmgCap}" onchange="setTagVal(skill, 'Damage Cap', this.value);">
                        </div>
                        <div class="form-group" style="display:flex; align-items:center;">
                            <label class="checkbox-label" style="margin-top:16px;">
                                <input type="checkbox" ${bypassCap ? 'checked' : ''} onchange="setBoolTag(skill, 'Bypass Damage Cap', this.checked);">
                                <span>Tembus Batas (&lt;Bypass Cap&gt;)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        
        <!-- REQUIRED WEAPONS & BATTLE MESSAGES -->
        <div class="card">
            <div class="card-header">
                <h2 title="Syarat tipe senjata yang harus dipakai dan pesan teks log pertempuran">⚔️ Requirements &amp; Battle Messages</h2>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div class="form-group">
                        <label title="Syarat tipe senjata utama 1">Required Weapon Type 1</label>
                        <select class="form-control" onchange="skill.requiredWtypeId1=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0">(None / Tanpa Syarat Senjata)</option>
                            ${(State.system.weaponTypes||[]).map((wt, i) => i === 0 ? '' : `<option value="${i}" ${skill.requiredWtypeId1 === i ? 'selected' : ''}>#${i} ${escapeHtml(wt)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label title="Syarat tipe senjata kedua 2 (opsional)">Required Weapon Type 2</label>
                        <select class="form-control" onchange="skill.requiredWtypeId2=parseInt(this.value,10); setUnsaved(true);">
                            <option value="0">(None / Tanpa Syarat Senjata)</option>
                            ${(State.system.weaponTypes||[]).map((wt, i) => i === 0 ? '' : `<option value="${i}" ${skill.requiredWtypeId2 === i ? 'selected' : ''}>#${i} ${escapeHtml(wt)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid-2" style="margin-top:10px;">
                    <div class="form-group">
                        <label title="Baris pesan 1 di log pertempuran">%1 = Nama Karakter, misal: %1 melepaskan jurus!</label>
                        <input type="text" class="form-control" placeholder="%1 melancarkan serangan!" value="${escapeHtml(skill.message1 || '')}" onchange="skill.message1=this.value; setUnsaved(true);">
                    </div>
                    <div class="form-group">
                        <label title="Baris pesan 2 di log pertempuran">Baris Pesan Tambahan 2</label>
                        <input type="text" class="form-control" placeholder="" value="${escapeHtml(skill.message2 || '')}" onchange="skill.message2=this.value; setUnsaved(true);">
                    </div>
                </div>
            </div>
        </div>

        ${renderEffectsCard(skill)}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(skill.note || '')}</textarea>
            </div>
        </div>
    `;
}



function onSkillInstantChange(val) {
    const skill = State.skills[State.selectedIndex];
    setBoolTag(skill, 'Instant Cast', false);
    setTagVal(skill, 'Instant Cast', null);
    if (val === 'Free') {
        setBoolTag(skill, 'Instant Cast', true);
    } else if (val === 'Turn') {
        setTagVal(skill, 'Instant Cast', 'Turn');
    }
}

// =====================================================================
// 6. ITEMS EDITOR
// =====================================================================
