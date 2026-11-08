/**
 * NUSV Database Studio - Entity Editor: editors/class_editor.js
 */

function onClassIVInput(code, val) {
    const cls = window.currentItem || getActiveItem();
    if (!cls) return;
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 5;
    num = Math.max(1, Math.min(10, num));
    setTagVal(cls, `Base ${code}`, num);

    // Update live grade badge in middle column
    const info = getIVGradeInfo(num);
    const lbl = document.getElementById(`cls-iv-label-${code}`);
    if (lbl) {
        lbl.innerText = `+${info.rate.toFixed(1)}/Lv`;
        lbl.style.color = info.color;
    }
    const gradeBadge = document.getElementById(`cls-iv-grade-${code}`);
    if (gradeBadge) {
        gradeBadge.innerText = `Grade ${info.grade}`;
        gradeBadge.style.background = info.color;
    }

    updateClassSimulationLive();
}



function onClassBaseStatInput(clsOrCode, codeOrVal, maybeVal) {
    let cls, code, val;
    if (maybeVal !== undefined) {
        cls = (typeof clsOrCode === 'object' && clsOrCode) ? clsOrCode : (window.currentItem || getActiveItem());
        code = codeOrVal;
        val = maybeVal;
    } else {
        cls = window.currentItem || getActiveItem();
        code = clsOrCode;
        val = codeOrVal;
    }
    if (!cls) return;
    return onClassIVInput(code, val);
}



function onClassSimLevelChange(lvl) {
    const cls = State.classes[State.selectedIndex];
    const currentTier = cls ? (parseInt(getTagVal(cls.note || '', 'Class Tier', '1'), 10) || 1) : 1;
    const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
    const maxLvl = cls ? (parseInt(getTagVal(cls.note || '', 'Class Max Level', ''), 10) || defaultMaxLvl) : defaultMaxLvl;
    const val = Math.max(1, Math.min(maxLvl, parseInt(lvl, 10) || 1));
    State.classTabSimLevel = val;
    const slider = document.getElementById('classSimSlider');
    if (slider && parseInt(slider.value, 10) !== val) slider.value = val;
    const input = document.getElementById('classSimInput');
    if (input && parseInt(input.value, 10) !== val) input.value = val;
    const badge = document.getElementById('classSimLevelBadge');
    if (badge) badge.innerText = `Job Lv ${val} / ${maxLvl}`;
    updateClassSimulationLive();
}

function onClassRightTabChange(tab) {
    State.classRightTab = tab;
    const badge = document.getElementById('classRightTabBadge');
    const tabTreeBtn = document.getElementById('classRightTabTreeBtn');
    const tabScrollBtn = document.getElementById('classRightTabScrollBtn');
    const cls = State.classes[State.selectedIndex];
    const lvl = State.classTabSimLevel || 1;
    const compats = cls ? getClassCompatibleScrollItems(cls.name) : [];

    if (tabTreeBtn) {
        tabTreeBtn.className = `btn btn-sm ${tab !== 'scrolls' ? 'btn-primary' : 'btn-secondary'}`;
    }
    if (tabScrollBtn) {
        tabScrollBtn.className = `btn btn-sm ${tab === 'scrolls' ? 'btn-primary' : 'btn-secondary'}`;
    }
    if (badge) {
        badge.innerText = tab === 'scrolls' ? `Kompatibel (${compats.length})` : `Job Lv 1 - ${lvl}`;
    }
    updateClassSimulationLive();
}

let currentRightScrollQuery = '';

function onFilterRightScrolls(query) {
    currentRightScrollQuery = (query || '').toLowerCase().trim();
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    const compats = getClassCompatibleScrollItems(cls.name);
    renderClassRightScrollItems(compats);
}

function renderClassRightTreeList(cls, lvl) {
    const container = document.getElementById('cls-sim-skills-container');
    if (!container) return;
    const learnings = (cls.learnings || []).slice().sort((a, b) => a.level - b.level);
    if (learnings.length === 0) {
        container.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); padding:12px; text-align:center;">(Belum ada jurus yang terdaftar di kelas ini)</div>`;
        return;
    }

    container.innerHTML = learnings.map(l => {
        const isUnlocked = l.level <= lvl;
        const sk = State.skills ? State.skills[l.skillId] : null;
        const name = sk ? sk.name : `Skill #${l.skillId}`;
        const iconIdx = sk ? sk.iconIndex : 0;
        const costParts = [];
        if (sk && sk.mpCost > 0) costParts.push(`${sk.mpCost} MP`);
        if (sk && sk.tpCost > 0) costParts.push(`${sk.tpCost} SP`);
        const costStr = costParts.length > 0 ? costParts.join(' / ') : '0 Cost';
        const noteText = l.note || (sk ? sk.description : '');

        return `
            <div style="background:${isUnlocked ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.3)'}; border:1px solid ${isUnlocked ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:6px 8px; margin-bottom:6px; transition:all 0.15s; ${isUnlocked ? '' : 'opacity:0.65;'}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="badge" style="background:${isUnlocked ? '#10b98133' : 'rgba(148,163,184,0.15)'}; color:${isUnlocked ? '#34d399' : '#94a3b8'}; border:1px solid ${isUnlocked ? '#10b98155' : 'rgba(148,163,184,0.3)'}; font-weight:700; font-size:0.7rem; padding:1px 6px;">
                            ${isUnlocked ? `${pai('check')} Lv ${l.level}` : `${pai('lock')} Lv ${l.level}`}
                        </span>
                        ${renderIconInline(iconIdx, 22)}
                        <span style="font-weight:700; font-size:0.8rem; color:${isUnlocked ? '#38bdf8' : '#cbd5e1'}; cursor:pointer; text-decoration:underline;" onclick="navigateToSkill(${l.skillId})" title="Klik untuk membuka Skill #${l.skillId} di Skill Editor">
                            ${escapeHtml(name)}
                        </span>
                    </div>
                    <span style="font-size:0.7rem; font-weight:700; color:#f59e0b;">${costStr}</span>
                </div>
                ${noteText ? `<div style="font-size:0.68rem; color:var(--text-muted); margin-left:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(noteText)}</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderClassRightScrollsList(compats) {
    const container = document.getElementById('cls-sim-skills-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="margin-bottom:8px;">
            <input type="text" id="cls-right-scroll-search" placeholder="Cari scroll jurus..." class="form-control" 
                   style="padding:4px 8px; font-size:0.75rem; width:100%; border-radius:6px;" 
                   value="${escapeHtml(currentRightScrollQuery)}" oninput="onFilterRightScrolls(this.value)">
        </div>
        <div id="cls-right-scrolls-items" style="max-height:220px; overflow-y:auto;"></div>
    `;
    renderClassRightScrollItems(compats);
}

function renderClassRightScrollItems(compats) {
    const itemsEl = document.getElementById('cls-right-scrolls-items');
    if (!itemsEl) return;
    const cls = State.classes[State.selectedIndex];
    const naturalSkillIds = new Set((cls ? cls.learnings || [] : []).map(l => l.skillId));
    
    const query = currentRightScrollQuery;
    const filtered = compats.filter(({ item, skill }) => {
        if (!query) return true;
        const itName = (item.name || '').toLowerCase();
        const skName = skill ? (skill.name || '').toLowerCase() : '';
        const desc = (item.description || '').toLowerCase();
        return itName.includes(query) || skName.includes(query) || desc.includes(query);
    });

    if (filtered.length === 0) {
        itemsEl.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); padding:10px; text-align:center;">Tidak ada jurus yang cocok "${escapeHtml(query)}"</div>`;
        return;
    }

    itemsEl.innerHTML = filtered.map(({ item, skill }) => {
        const isNatural = skill && naturalSkillIds.has(skill.id);
        const costParts = [];
        if (skill && skill.mpCost > 0) costParts.push(`${skill.mpCost} MP`);
        if (skill && skill.tpCost > 0) costParts.push(`${skill.tpCost} SP`);
        const costStr = costParts.length > 0 ? costParts.join(' / ') : '0 Cost';
        const isMagic = skill ? (skill.stypeId === 1 || skill.stypeId === 2) : item.name.includes('Kitab');
        const origClass = getTagVal(item.note || '', 'Original Class', '');

        return `
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 8px; margin-bottom:5px; font-size:0.78rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                    <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                        ${renderIconInline(item.iconIndex, 22)}
                        <span style="font-weight:700; color:${isMagic ? '#c4b5fd' : '#38bdf8'}; cursor:pointer; text-decoration:underline;" onclick="navigateToItem(${item.id})" title="Klik untuk membuka Item #${item.id} di Item Editor">
                            ${escapeHtml(item.name)}
                        </span>
                    </div>
                    <span style="font-size:0.7rem; font-weight:700; color:#f59e0b; flex-shrink:0;">${costStr}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; color:var(--text-muted);">
                    <span>${origClass ? `Asal: <strong style="color:#cbd5e1;">${escapeHtml(origClass)}</strong>` : (skill ? escapeHtml(skill.name) : '')}</span>
                    <span class="badge" style="background:${isNatural ? '#10b98122' : '#3b82f622'}; color:${isNatural ? '#34d399' : '#60a5fa'}; border:1px solid ${isNatural ? '#10b98144' : '#3b82f644'}; font-size:0.65rem; padding:1px 5px;">
                        ${isNatural ? 'Alami' : 'Lintas Profesi'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

let classMainScrollQuery = '';
let classMainScrollCategory = 'all';

function onClassMainScrollSearch(val) {
    classMainScrollQuery = (val || '').toLowerCase().trim();
    renderClassMainScrollGrid();
}

function onClassMainScrollCategory(val) {
    classMainScrollCategory = val || 'all';
    const allBtn = document.getElementById('clsMainScrollCatAll');
    const physBtn = document.getElementById('clsMainScrollCatPhys');
    const magicBtn = document.getElementById('clsMainScrollCatMagic');
    if (allBtn) allBtn.className = `btn btn-sm ${classMainScrollCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`;
    if (physBtn) physBtn.className = `btn btn-sm ${classMainScrollCategory === 'phys' ? 'btn-primary' : 'btn-secondary'}`;
    if (magicBtn) magicBtn.className = `btn btn-sm ${classMainScrollCategory === 'magic' ? 'btn-primary' : 'btn-secondary'}`;
    renderClassMainScrollGrid();
}

function renderClassMainScrollGrid() {
    const grid = document.getElementById('classScrollMainGrid');
    if (!grid) return;
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    const compats = getClassCompatibleScrollItems(cls.name);
    const naturalSkillIds = new Set((cls.learnings || []).map(l => l.skillId));

    const q = classMainScrollQuery;
    const cat = classMainScrollCategory;

    const filtered = compats.filter(({ item, skill }) => {
        const isMagic = skill ? (skill.stypeId === 1 || skill.stypeId === 2) : false;
        if (cat === 'phys' && isMagic) return false;
        if (cat === 'magic' && !isMagic) return false;
        if (!q) return true;
        const itName = (item.name || '').toLowerCase();
        const skName = skill ? (skill.name || '').toLowerCase() : '';
        const desc = (item.description || '').toLowerCase();
        return itName.includes(q) || skName.includes(q) || desc.includes(q);
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; color:var(--text-muted); padding:24px;">Tidak ditemukan scroll yang cocok dengan pencarian.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(({ item, skill }) => {
        const isNatural = skill && naturalSkillIds.has(skill.id);
        const costParts = [];
        if (skill && skill.mpCost > 0) costParts.push(`${skill.mpCost} MP`);
        if (skill && skill.tpCost > 0) costParts.push(`${skill.tpCost} SP`);
        const costStr = costParts.length > 0 ? costParts.join(' / ') : '0 Cost';
        const isMagic = skill ? (skill.stypeId === 1 || skill.stypeId === 2) : false;
        const origClass = getTagVal(item.note || '', 'Original Class', '');
        const tier = getTagVal(item.note || '', 'Skill Tier', '1');

        return `
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s;" onmouseenter="this.style.borderColor='rgba(139,92,246,0.5)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)'">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="badge" style="background:${isMagic ? '#8b5cf622' : '#3b82f622'}; color:${isMagic ? '#c4b5fd' : '#60a5fa'}; border:1px solid ${isMagic ? '#8b5cf644' : '#3b82f644'}; font-size:0.7rem; font-weight:700;">
                            ${isMagic ? `${pai('sparkles')} Sihir` : `${pai('sword')} Fisik`} • Scroll Tier ${tier}
                        </span>
                        <span class="badge" style="background:${isNatural ? '#10b98122' : '#f59e0b22'}; color:${isNatural ? '#34d399' : '#fbbf24'}; border:1px solid ${isNatural ? '#10b98144' : '#f59e0b44'}; font-size:0.65rem;">
                            ${isNatural ? 'Bawaan Alami' : 'Lintas Profesi'}
                        </span>
                    </div>

                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        ${renderIconInline(item.iconIndex, 28)}
                        <div style="overflow:hidden;">
                            <div style="font-weight:700; font-size:0.85rem; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${escapeHtml(item.name)}
                            </div>
                            <div style="font-size:0.72rem; color:#f59e0b; font-weight:600;">
                                ${skill ? `${escapeHtml(skill.name)} (${costStr})` : costStr}
                            </div>
                        </div>
                    </div>

                    <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.3; margin-bottom:8px; max-height:36px; overflow:hidden; text-overflow:ellipsis;">
                        ${escapeHtml(item.description || '')}
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; margin-top:4px;">
                    <span style="font-size:0.68rem; color:#94a3b8;">
                        ${origClass ? `Asal: <strong style="color:#cbd5e1;">${escapeHtml(origClass)}</strong>` : ''}
                    </span>
                    <div style="display:flex; gap:4px;">
                        ${skill ? `<button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:0.7rem;" onclick="navigateToSkill(${skill.id})" title="Buka skill ini di Skill Editor">${pai('zap')} Skill</button>` : ''}
                        <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:0.7rem;" onclick="navigateToItem(${item.id})" title="Buka item ini di Item Editor">${pai('book')} Item</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateClassSimulationLive() {
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    const note = cls.note || '';
    const currentTier = parseInt(getTagVal(note, 'Class Tier', '1'), 10) || 1;
    const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
    const maxLvl = parseInt(getTagVal(note, 'Class Max Level', ''), 10) || defaultMaxLvl;
    const lvl = Math.max(1, Math.min(maxLvl, State.classTabSimLevel || 1));

    const growthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
    const manualGrowthStr = getTagVal(note, 'Class Stat Growth', '');
    if (manualGrowthStr) {
        manualGrowthStr.split(',').forEach(part => {
            const p = part.trim();
            let m = p.match(/\+?\s*([\d.]+)\s*([A-Za-z]{3})/);
            if (m) {
                const code = m[2].toUpperCase();
                if (growthRates[code] !== undefined) growthRates[code] = parseFloat(m[1]) || 0;
                return;
            }
            m = p.match(/([A-Za-z]{3})\s*\+?\s*([\d.]+)/);
            if (m) {
                const code = m[1].toUpperCase();
                if (growthRates[code] !== undefined) growthRates[code] = parseFloat(m[2]) || 0;
            }
        });
    }

    CORE_ATTRIBUTES.forEach(attr => {
        const rawIV = parseInt(getTagVal(note, `Base ${attr.code}`, '5'), 10) || 5;
        const iv = Math.max(1, Math.min(10, rawIV));
        const ivInfo = getIVGradeInfo(iv);

        const rate = (manualGrowthStr && growthRates[attr.code] > 0) ? growthRates[attr.code] : ivInfo.rate;
        const growth = Math.round(rate * (lvl - 1) * 10) / 10;
        const total = Math.max(1, Math.round(iv + growth));

        const el = document.getElementById(`cls-sim-${attr.code}`);
        if (el) el.innerText = total;

        const elCard = document.getElementById(`cls-sim-${attr.code}-card`);
        if (elCard) {
            elCard.title = `Bonus Stat dari Profesi: ${attr.name} (${attr.code})
Rumus: Class IV Rating + Growth × (JobLv - 1)
Rincian: IV ${iv} (Grade ${ivInfo.grade}, +${rate}/Lv) + Pertumbuhan ${growth} (Job Lv ${lvl}) = Total +${total}`;
        }
    });

    // Update Class Base Params
    ensureClassParams(cls);
    const mhpEl = document.getElementById('cls-sim-mhp');
    if (mhpEl) mhpEl.innerText = (cls.params && cls.params[0] && cls.params[0][lvl]) ? cls.params[0][lvl] : '450';
    const mmpEl = document.getElementById('cls-sim-mmp');
    if (mmpEl) mmpEl.innerText = (cls.params && cls.params[1] && cls.params[1][lvl]) ? cls.params[1][lvl] : '40';
    const defEl = document.getElementById('cls-sim-def');
    if (defEl) defEl.innerText = (cls.params && cls.params[3] && cls.params[3][lvl]) ? cls.params[3][lvl] : '15';

    // Update Class Passive Ability in right column
    const abilityContainer = document.getElementById('cls-sim-ability-container');
    if (abilityContainer) {
        const abName = getTagVal(note, 'Class Ability', '');
        const abDesc = getBlockTag(note, 'Class Ability Description', '') || getTagVal(note, 'Class Ability Desc', '');
        if (abName) {
            abilityContainer.innerHTML = `
                <div style="font-weight:700; font-size:0.85rem; color:#fde047; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                    <span>${pai('zap')}</span> <span>${escapeHtml(abName)}</span>
                </div>
                <div style="font-size:0.75rem; color:#cbd5e1; line-height:1.4;">
                    ${escapeHtml(abDesc || '(Deskripsi belum diisi)')}
                </div>
            `;
        } else {
            abilityContainer.innerHTML = `
                <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">
                    (Belum ada pasif kelas yang dikonfigurasi)
                </div>
            `;
        }
    }

    // Update Right Column Content (Tree or Scrolls)
    const isScrolls = State.classRightTab === 'scrolls';
    if (isScrolls) {
        const compats = getClassCompatibleScrollItems(cls.name);
        renderClassRightScrollsList(compats);
    } else {
        renderClassRightTreeList(cls, lvl);
    }
}



function renderClassSkillTreeRoadmap(cls) {
    const learnings = (cls.learnings || []).slice().sort((a, b) => a.level - b.level);
    if (learnings.length === 0) {
        return `
            <div style="background:rgba(0,0,0,0.25); border:1px dashed rgba(255,255,255,0.15); border-radius:8px; padding:16px; text-align:center; color:var(--text-muted); font-size:0.8rem;">
                Belum ada alur skill tree yang didaftarkan untuk kelas ini. Klik "+ Add Skill Learning" di bawah untuk menambahkan.
            </div>
        `;
    }

    const nodesHtml = learnings.map((l, idx) => {
        const sk = State.skills ? State.skills[l.skillId] : null;
        const name = sk ? sk.name : `Skill #${l.skillId}`;
        const iconIdx = sk ? sk.iconIndex : 0;
        const costParts = [];
        if (sk && sk.mpCost > 0) costParts.push(`${sk.mpCost} MP`);
        if (sk && sk.tpCost > 0) costParts.push(`${sk.tpCost} SP`);
        const costStr = costParts.length > 0 ? costParts.join(' / ') : '0 Cost';
        const tier = sk ? getTagVal(sk.note || '', 'Skill Tier', '1') : '1';
        const isLast = idx === learnings.length - 1;

        return `
            <div style="display:flex; align-items:center;">
                <div style="background:rgba(15, 23, 42, 0.85); border:1px solid rgba(56, 189, 248, 0.35); border-radius:10px; padding:10px 14px; min-width:185px; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s;" onmouseenter="this.style.borderColor='#38bdf8'; this.style.transform='translateY(-2px)'" onmouseleave="this.style.borderColor='rgba(56, 189, 248, 0.35)'; this.style.transform='none'">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="badge" style="background:#10b98122; color:#34d399; border:1px solid #10b98144; font-weight:700; font-size:0.72rem;">
                            Lv ${l.level}
                        </span>
                        <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">Tier ${tier}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        ${renderIconInline(iconIdx, 26)}
                        <div style="overflow:hidden;">
                            <div style="font-weight:700; font-size:0.83rem; color:#f8fafc; cursor:pointer; text-decoration:underline; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" onclick="navigateToSkill(${l.skillId})" title="Buka Skill #${l.skillId} di Skill Editor">
                                ${escapeHtml(name)}
                            </div>
                            <div style="font-size:0.7rem; color:#f59e0b; font-weight:600;">${costStr}</div>
                        </div>
                    </div>
                    ${l.note ? `<div style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(l.note)}">${escapeHtml(l.note)}</div>` : ''}
                </div>
                ${!isLast ? `
                    <div style="display:flex; align-items:center; justify-content:center; padding:0 8px; color:#38bdf8; font-size:1.2rem; font-weight:bold; flex-shrink:0;">
                        ${pai('arrow-right')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div style="overflow-x:auto; padding:10px 4px 14px 4px; display:flex; align-items:center; gap:2px; margin-bottom:14px; scrollbar-width:thin;">
            ${nodesHtml}
        </div>
    `;
}

function renderClassEditor(container, cls) {
    ensureClassParams(cls);
    const note = cls.note || '';

    const currentTier = getTagVal(note, 'Class Tier', '1');
    const currentMaxLvl = getTagVal(note, 'Class Max Level', '');
    const currentFrom = getTagVal(note, 'Class Change From', '0');
    const currentChangeLvl = getTagVal(note, 'Class Change Level', '');
    const currentChangeItem = getTagVal(note, 'Class Change Item', '');
    const currentChangeSwitch = getTagVal(note, 'Class Change Switch', '');
    const currentIcon = getTagVal(note, 'Class Icon', '0');
    const currentDesc = getBlockTag(note, 'Class Description', '');
    const currentGrowth = getTagVal(note, 'Class Stat Growth', '');
    const currentAbility = getTagVal(note, 'Class Ability', '');
    const currentAbilityDesc = getBlockTag(note, 'Class Ability Description', '') || getTagVal(note, 'Class Ability Desc', '');

    const classTier = parseInt(currentTier, 10) || 1;
    const defaultMaxLvl = classTier === 1 ? 10 : (classTier === 2 ? 30 : (classTier === 3 ? 40 : (classTier === 4 ? 50 : (classTier === 5 ? 60 : 99))));
    const classMaxLvl = parseInt(currentMaxLvl, 10) || defaultMaxLvl;
    State.classTabSimLevel = Math.max(1, Math.min(State.classTabSimLevel || 1, classMaxLvl));
    const simClassLevel = State.classTabSimLevel;

    cls.expParams = cls.expParams || [30, 20, 30, 30];
    cls.learnings = cls.learnings || [];

    const coreStats = {};
    CORE_ATTRIBUTES.forEach(attr => {
        coreStats[attr.code] = getTagVal(note, `Base ${attr.code}`, '10');
    });

    const classFromOptions = [`<option value="0" ${currentFrom === '0' ? 'selected' : ''} title="Kelas dasar tanpa prasyarat kelas sebelumnya">(None - Base Class)</option>`];
    State.classes.forEach(c => {
        if (!c || c.id === cls.id) return;
        classFromOptions.push(`<option value="${c.id}" ${currentFrom === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`);
    });

    container.innerHTML = `
        <!-- CLASS PROFILE & SETTINGS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan spesifikasi kelas dan pertumbuhan stat">${pai('shield')} Class: #${cls.id} ${escapeHtml(cls.name)}</h2>
                <span style="font-size:0.85rem; color:var(--text-muted);">Tier ${currentTier}</span>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="form-group">
                            <label title="Nama kelas atau profesi yang ditampilkan di game">Class Name</label>
                            <input type="text" class="form-control" value="${escapeHtml(cls.name || '')}" onchange="cls.name=this.value; setUnsaved(true); renderSidebar();">
                        </div>
                        <div class="form-group">
                            <label title="Tingkatan tier kelas dari Tier 1 (Novice) hingga Tier 6 (Mythic)">Class Progression Tier</label>
                            <select class="form-control" onchange="setTagVal(cls, 'Class Tier', this.value); renderSidebar(); renderEditor();">
                                <option value="1" ${currentTier === '1' ? 'selected' : ''} title="Kelas pemula / dasar tanpa prasyarat">Tier 1 - Novice</option>
                                <option value="2" ${currentTier === '2' ? 'selected' : ''} title="Kelas tingkat lanjutan setelah menguasai Tier 1">Tier 2 - Apprentice</option>
                                <option value="3" ${currentTier === '3' ? 'selected' : ''} title="Kelas spesialisasi cabang dengan kemampuan mendalam">Tier 3 - Adept</option>
                                <option value="4" ${currentTier === '4' ? 'selected' : ''} title="Kelas tingkat master dengan penguasaan tinggi">Tier 4 - Master / Expert</option>
                                <option value="5" ${currentTier === '5' ? 'selected' : ''} title="Kelas legendaris dengan jurus berkekuatan luar biasa">Tier 5 - Paragon</option>
                                <option value="6" ${currentTier === '6' ? 'selected' : ''} title="Kelas puncak transenden / mitologis">Tier 6 - Mythic</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label title="ID kelas prasyarat yang harus dikuasai sebelum dapat berganti ke kelas ini">Prerequisite Class (&lt;Class Change From: ID&gt;)</label>
                            <select class="form-control" onchange="setTagVal(cls, 'Class Change From', this.value !== '0' ? this.value : '');">
                                ${classFromOptions.join('')}
                            </select>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label title="Level minimal yang harus dicapai pada kelas sebelumnya sebelum promosi">Required Level for Promotion</label>
                                <input type="number" class="form-control" placeholder="Lv" value="${currentChangeLvl}" onchange="setTagVal(cls, 'Class Change Level', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Nama atau ID item promosi khusus yang dibutuhkan untuk membuka kelas ini">Required Promotion Item</label>
                                <input type="number" class="form-control" placeholder="Item ID" value="${currentChangeItem}" onchange="setTagVal(cls, 'Class Change Item', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="ID sakelar cerita yang harus aktif agar kelas ini terbuka">Required Story Switch ID</label>
                                <input type="number" class="form-control" placeholder="Switch" value="${currentChangeSwitch}" onchange="setTagVal(cls, 'Class Change Switch', this.value);">
                            </div>
                        </div>

                        <div class="form-group">
                            <label title="Batas maksimal level khusus untuk kelas ini jika berbeda dari normal">Custom Max Level (&lt;Class Max Level: X&gt;)</label>
                            <input type="number" class="form-control" placeholder="Default sesuai Tier" value="${currentMaxLvl}" onchange="setTagVal(cls, 'Class Max Level', this.value);">
                        </div>
                    </div>

                    <div>
                        <div class="form-group">
                            <label title="Indeks ikon visual kelas untuk menu tampilan antarmuka">Class Icon Index (&lt;Class Icon: ID&gt;)</label>
                            <input type="number" class="form-control" value="${currentIcon}" onchange="setTagVal(cls, 'Class Icon', this.value);">
                        </div>

                        

                        <div class="form-group">
                            <label title="Deskripsi kisah latar belakang dan gaya bertarung kelas ini">Class Lore &amp; Description (&lt;Class Description&gt;)</label>
                            <textarea class="form-control" rows="4" onchange="setBlockTag(cls, 'Class Description', this.value);">${escapeHtml(currentDesc)}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CLASS PASSIVE ABILITY (INNATE CLASS ABILITY) -->
        <div class="card" style="border-left: 3px solid #f59e0b; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.08);">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <h2 title="Kemampuan pasif bawaan khusus yang aktif selama karakter berada di kelas/profesi ini">${pai('sparkles')} Class Passive Ability (Innate Ability)</h2>
                    <span class="badge" style="background:rgba(245,158,11,0.2); color:#fbbf24; font-size:0.75rem;">1 Active per Class (Evolution)</span>
                </div>
                <span style="font-size:0.8rem; color:var(--text-muted);">Aktif otomatis di pertempuran saat karakter menggunakan kelas ini</span>
            </div>
            <div class="card-body">
                <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px; line-height:1.4;">
                    Kemampuan pasif bertarung bawaan profesi. Saat karakter promosi ke Tier berikutnya, pasif kelas sebelumnya akan berevolusi menjadi pasif kelas baru yang lebih kuat.
                </p>
                <div class="form-group" style="margin-bottom:12px;">
                    <label title="Nama kemampuan pasif kelas dalam bahasa Inggris (contoh: Battle Spirit, Heavy Impact, Elemental Overload)">
                        Passive Ability Name (&lt;Class Ability: Name&gt;)
                    </label>
                    <input type="text" class="form-control" style="font-weight:700; color:#fbbf24;" placeholder="Contoh: Battle Spirit" 
                           value="${escapeHtml(currentAbility)}" 
                           oninput="setTagVal(cls, 'Class Ability', this.value); renderSidebar(); updateClassSimulationLive();" 
                           onchange="setTagVal(cls, 'Class Ability', this.value); renderSidebar(); updateClassSimulationLive();">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label title="Deskripsi mekanik efek tempur pasif dalam bahasa Indonesia">
                        Passive Ability Description (&lt;Class Ability Description&gt;)
                    </label>
                    <textarea class="form-control" rows="3" placeholder="Contoh: Meningkatkan P.ATK sebesar +8%. Saat HP di bawah 50%, memulihkan +2 SP ekstra setiap giliran." 
                              oninput="setTagVal(cls, 'Class Ability Desc', ''); setBlockTag(cls, 'Class Ability Description', this.value); updateClassSimulationLive();" 
                              onchange="setTagVal(cls, 'Class Ability Desc', ''); setBlockTag(cls, 'Class Ability Description', this.value); updateClassSimulationLive();">${escapeHtml(currentAbilityDesc)}</textarea>
                    <div class="helper-text">Format teks mendukung penjelasan bonus parameter (P.ATK, M.ATK, DEF, dsb.) dan pemicu kondisi tempur.</div>
                </div>
            </div>
        </div>

        <!-- CLASS STAT APTITUDE (IV SCALING 1 - 10) -->
        <div class="card">
            <div class="card-header">
                <div style="display:flex; align-items:center; gap:8px;">
                    <h2 title="Aptitude profesi berskala 1 - 10 (Potensi Pertumbuhan Stat)">${pai('trophy')} Class Stat Aptitude Rating (Skala 1 - 10)</h2>
                    <span class="badge" style="background:rgba(59,130,246,0.2); color:#60a5fa; font-size:0.75rem;">Stat Aptitude Model</span>
                </div>
                <span style="font-size:0.8rem; color:var(--text-muted);">Menentukan stat awal Lv 1 &amp; scaling stat per Job Level</span>
            </div>
            <div class="card-body">
                <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px; line-height:1.4;">
                    Setiap profesi memiliki kecenderungan stat bawaan (IV) berskala <strong>1 sampai 10</strong>. 
                    Nilai ini otomatis menentukan tambahan stat di Lv 1 (+IV) serta <em>growth rate</em> per level job (+IV ÷ 5 per Lv).
                </p>
                <div class="stat-grid-6">
                    ${CORE_ATTRIBUTES.map(attr => {
                        const rawVal = parseInt(coreStats[attr.code], 10) || 5;
                        const iv = Math.max(1, Math.min(10, rawVal));
                        const ivInfo = getIVGradeInfo(iv);
                        return `
                            <div class="stat-card-input" style="border-left: 3px solid ${attr.color}; display:flex; flex-direction:column; justify-content:space-between; min-height:130px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <span style="color:${attr.color}; font-weight:700; font-size:0.85rem;">${attr.icon} ${attr.code}</span>
                                        <span class="badge" id="cls-iv-grade-${attr.code}" style="background:${ivInfo.color}; color:#fff; font-size:0.72rem; font-weight:700; padding:1px 6px; border-radius:4px;">
                                            Grade ${ivInfo.grade}
                                        </span>
                                    </div>
                                    <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:6px;">${attr.name}</div>
                                </div>
                                <div>
                                    <div style="display:flex; gap:6px; align-items:center;">
                                        <input type="number" min="1" max="10" class="form-control" style="font-size:1.1rem; font-weight:700; text-align:center; padding:4px;" 
                                               value="${iv}" oninput="onClassIVInput('${attr.code}', this.value)" onchange="onClassIVInput('${attr.code}', this.value)">
                                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">/ 10</span>
                                    </div>
                                    <div style="font-size:0.68rem; color:${ivInfo.color}; margin-top:4px; font-weight:600;" id="cls-iv-label-${attr.code}">
                                        +${ivInfo.rate.toFixed(1)}/Lv
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="form-group" style="margin-top:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label title="Override manual jika ingin pertumbuhan stat berbeda dari formula IV bawaan">
                            ${pai('sliders')} Override Manual Stat Growth per Level (&lt;Class Stat Growth&gt;)
                        </label>
                        <span style="font-size:0.75rem; color:var(--text-muted);">(Opsional)</span>
                    </div>
                    <input type="text" class="form-control" placeholder="Biarkan kosong untuk auto-calculate dari IV (+IV/5 per level), atau isi misal: STR +1.5, VIT +1.0" 
                           value="${escapeHtml(currentGrowth)}" 
                           oninput="setTagVal(cls, 'Class Stat Growth', this.value); updateClassSimulationLive();" 
                           onchange="setTagVal(cls, 'Class Stat Growth', this.value); updateClassSimulationLive();">
                    <div class="helper-text">Jika dikosongkan, editor otomatis menghitung pertumbuhan stat berdasarkan skala IV 1 - 10 di atas.</div>
                </div>
            </div>
        </div>

        <!-- CLASS SKILL TREE & LEVEL PROGRESSION -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 title="Alur Skill Tree dan pohon keahlian profesi yang terbuka seiring kenaikan level">${pai('list')} Class Skill Tree &amp; Level Progression</h2>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Peta alur jurus yang otomatis dipelajari saat mencapai level tertentu</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="addClassLearning();" title="Tambah skill baru yang dipelajari pada level tertentu">${pai('plus')} Add Skill Learning</button>
            </div>
            <div class="card-body">
                <div style="font-size:0.8rem; font-weight:700; color:#38bdf8; margin-bottom:4px;">${pai('map')} Visual Skill Tree Roadmap:</div>
                ${renderClassSkillTreeRoadmap(cls)}

                <div style="font-size:0.8rem; font-weight:700; color:#cbd5e1; margin-bottom:8px; margin-top:10px;">${pai('list')} Tabel Level Belajar (Editable):</div>
                <div style="overflow-x:auto;">
                    <table class="stat-table">
                        <thead>
                            <tr>
                                <th style="width:20%;">Level Belajar</th>
                                <th style="width:50%;">Skill yang Didapat</th>
                                <th style="width:20%;">Catatan / Notetag</th>
                                <th style="width:10%; text-align:right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cls.learnings.length === 0 ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:16px;">Belum ada skill yang dipelajari. Klik "+ Add Skill Learning" di atas.</td></tr>` : ''}
                            ${cls.learnings.map((l, i) => `
                                <tr>
                                    <td>
                                        <input type="number" min="1" max="99" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${l.level || 1}" onchange="cls.learnings[${i}].level=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                    </td>
                                    <td>
                                        <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="cls.learnings[${i}].skillId=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                            ${State.skills.filter(s => s).map(s => `<option value="${s.id}" ${l.skillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="text" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${escapeHtml(l.note || '')}" onchange="cls.learnings[${i}].note=this.value; setUnsaved(true);">
                                    </td>
                                    <td style="text-align:right;">
                                        <button class="btn btn-danger btn-sm" onclick="removeClassLearning(${i});">${pai('trash')}</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- SCROLL KOMPATIBEL (SEMUA SKILL YANG DAPAT DIPELAJARI) -->
        <div class="card" style="margin-top:16px; border: 1px solid rgba(139, 92, 246, 0.4); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
            <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h2 title="Daftar Scroll jurus yang dapat dipelajari oleh kelas ini (habis pakai)">${pai('book')} Scroll Kompatibel (Semua Skill yang Dapat Dipelajari)</h2>
                        <span class="badge" style="background:rgba(139,92,246,0.2); color:#c4b5fd; border:1px solid rgba(139,92,246,0.4); font-size:0.75rem;" id="classScrollCountBadge">
                            ${(getClassCompatibleScrollItems(cls.name) || []).length} Scroll Tersedia
                        </span>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        Scroll jurus pusaka yang dapat dipelajari secara permanen oleh <strong>${escapeHtml(cls.name)}</strong>. Scroll akan hilang/habis pakai setelah dipelajari.
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <div style="display:flex; gap:4px;">
                        <button type="button" id="clsMainScrollCatAll" class="btn btn-sm ${classMainScrollCategory === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="onClassMainScrollCategory('all')" style="font-size:0.75rem; padding:3px 8px;">Semua</button>
                        <button type="button" id="clsMainScrollCatPhys" class="btn btn-sm ${classMainScrollCategory === 'phys' ? 'btn-primary' : 'btn-secondary'}" onclick="onClassMainScrollCategory('phys')" style="font-size:0.75rem; padding:3px 8px;">${pai('sword')} Jurus Fisik</button>
                        <button type="button" id="clsMainScrollCatMagic" class="btn btn-sm ${classMainScrollCategory === 'magic' ? 'btn-primary' : 'btn-secondary'}" onclick="onClassMainScrollCategory('magic')" style="font-size:0.75rem; padding:3px 8px;">${pai('sparkles')} Sihir &amp; Khusus</button>
                    </div>
                    <input type="text" class="form-control" style="width:180px; font-size:0.75rem; padding:4px 8px;" placeholder="Filter nama / jurus..." value="${escapeHtml(classMainScrollQuery)}" oninput="onClassMainScrollSearch(this.value)">
                </div>
            </div>
            <div class="card-body">
                <div id="classScrollMainGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-height:480px; overflow-y:auto; padding-right:4px;">
                    <!-- Populated dynamically by renderClassMainScrollGrid -->
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        
        <!-- INTERACTIVE EXP PROGRESSION CURVE & GRAPH -->
        <div class="card" style="margin-top:16px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 20px rgba(56, 189, 248, 0.1);">
            <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <h2 title="Kurva visual perkembangan EXP yang dibutuhkan untuk naik level dari Lv 1 sampai Lv 99">${pai('chart-line')} Class EXP Progression Curve &amp; Visual Graph</h2>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Interactive real-time graph plotting Total EXP and Level scaling.</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" class="btn btn-sm btn-secondary" onclick="toggleExpTableModal()" title="Lihat tabel rincian EXP per level (Lv 1 - 99)">${pai('list')} View Lv 1-99 Table</button>
                </div>
            </div>
            <div class="card-body">
                <div class="grid-2" style="gap:20px; align-items:start;">
                    <!-- LEFT: 4 PARAMETERS & SLIDERS -->
                    <div>
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:12px;">${pai('sliders')} EXP Formula Parameters (Curve Controls):</div>

                        <!-- Param 1: Base Value -->
                        <div class="form-group" style="margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="margin:0; font-size:0.82rem;" title="Nilai dasar pengali kurva EXP (standar 10-50)">Base Value</label>
                                <span id="expParamBadge0" class="badge-sub">${cls.expParams[0] || 30}</span>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="range" min="10" max="50" value="${cls.expParams[0] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                       oninput="onExpParamChange(0, this.value)">
                                <input type="number" min="10" max="50" value="${cls.expParams[0] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                       id="expInputNum0" onchange="onExpParamChange(0, this.value)">
                            </div>
                        </div>

                        <!-- Param 2: Extra Value -->
                        <div class="form-group" style="margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="margin:0; font-size:0.82rem;" title="Tambahan EXP linier datar per level (standar 10-50)">Extra Value</label>
                                <span id="expParamBadge1" class="badge-sub">${cls.expParams[1] || 20}</span>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="range" min="10" max="50" value="${cls.expParams[1] || 20}" class="form-control" style="flex:1; cursor:pointer;" 
                                       oninput="onExpParamChange(1, this.value)">
                                <input type="number" min="10" max="50" value="${cls.expParams[1] || 20}" class="form-control" style="width:70px; text-align:center;" 
                                       id="expInputNum1" onchange="onExpParamChange(1, this.value)">
                            </div>
                        </div>

                        <!-- Param 3: Acceleration A -->
                        <div class="form-group" style="margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="margin:0; font-size:0.82rem;" title="Percepatan kurva eksponensial untuk level menengah ke atas">Acceleration A</label>
                                <span id="expParamBadge2" class="badge-sub">${cls.expParams[2] || 30}</span>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="range" min="10" max="50" value="${cls.expParams[2] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                       oninput="onExpParamChange(2, this.value)">
                                <input type="number" min="10" max="50" value="${cls.expParams[2] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                       id="expInputNum2" onchange="onExpParamChange(2, this.value)">
                            </div>
                        </div>

                        <!-- Param 4: Acceleration B -->
                        <div class="form-group" style="margin-bottom:14px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="margin:0; font-size:0.82rem;" title="Peredam kecuraman kurva pada level tinggi">Acceleration B</label>
                                <span id="expParamBadge3" class="badge-sub">${cls.expParams[3] || 30}</span>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="range" min="10" max="50" value="${cls.expParams[3] || 30}" class="form-control" style="flex:1; cursor:pointer;" 
                                       oninput="onExpParamChange(3, this.value)">
                                <input type="number" min="10" max="50" value="${cls.expParams[3] || 30}" class="form-control" style="width:70px; text-align:center;" 
                                       id="expInputNum3" onchange="onExpParamChange(3, this.value)">
                            </div>
                        </div>

                        <!-- Presets -->
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">Quick Curve Presets:</div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([20, 10, 20, 20])" title="Kurva cepat: naik level lebih mudah">${pai('speed-fast')} Fast (Easy)</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([30, 20, 30, 30])" title="Kurva seimbang standar RPG Maker">${pai('sliders')} Normal (Standard)</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([40, 25, 35, 30])" title="Kurva lambat: butuh grinding lebih banyak">${pai('shield')} Hard (Steep)</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="applyExpPreset([25, 10, 45, 25])" title="Kurva lambat di awal, eksponensial di akhir">${pai('crown')} Late Bloomer</button>
                        </div>
                    </div>

                    <!-- RIGHT: LIVE CANVAS GRAPH -->
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <div style="font-size:0.82rem; font-weight:700; color:#38bdf8;">${pai('chart-line')} Live Progression Graph (Lv 1 - 99):</div>
                            <div id="expHoverTooltip" style="font-size:0.75rem; color:#facc15; font-weight:600; min-height:18px;">Hover graph to view level details</div>
                        </div>

                        <div class="exp-canvas-wrapper">
                            <canvas id="expCurveCanvas" width="580" height="230" style="width:100%; height:100%; display:block; cursor:crosshair;"></canvas>
                        </div>

                        <!-- Milestones Grid -->
                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-top:10px;">
                            <div class="stat-card-input" style="padding:8px; text-align:center;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Lv 10 Total EXP</div>
                                <div style="font-size:0.95rem; font-weight:700; color:#38bdf8;" id="milestoneExp10">-</div>
                            </div>
                            <div class="stat-card-input" style="padding:8px; text-align:center;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Lv 30 Total EXP</div>
                                <div style="font-size:0.95rem; font-weight:700; color:#60a5fa;" id="milestoneExp30">-</div>
                            </div>
                            <div class="stat-card-input" style="padding:8px; text-align:center;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Lv 50 Total EXP</div>
                                <div style="font-size:0.95rem; font-weight:700; color:#a78bfa;" id="milestoneExp50">-</div>
                            </div>
                            <div class="stat-card-input" style="padding:8px; text-align:center;">
                                <div style="font-size:0.7rem; color:var(--text-muted);">Lv 99 Max EXP</div>
                                <div style="font-size:0.95rem; font-weight:700; color:#facc15;" id="milestoneExp99">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CLASS PARAMETER CURVES (LV 1 - 99) -->
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 title="Kurva nilai 8 parameter RPG Maker MV dari Level 1 sampai 99">${pai('chart-line')} Class Parameter Curves (Lv 1 - 99)</h2>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Nilai parameter MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK pada setiap level</div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="openClassParamsCurveModal(0)" title="Buka generator kalkulasi kurva otomatis untuk level 1 - 99">${pai('zap')} Quick Curve Generator...</button>
            </div>
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="data-table" style="font-size:0.85rem; width:100%;">
                        <thead>
                            <tr>
                                <th style="width:16%;">Parameter</th>
                                <th style="width:14%; text-align:right;">Lv 1</th>
                                <th style="width:14%; text-align:right;">Lv 20</th>
                                <th style="width:14%; text-align:right;">Lv 40</th>
                                <th style="width:14%; text-align:right;">Lv 60</th>
                                <th style="width:14%; text-align:right;">Lv 80</th>
                                <th style="width:14%; text-align:right;">Lv 99</th>
                                <th style="width:14%; text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${PARAM_DEFS.map(p => {
                                const vals = cls.params[p.id] || [];
                                return `
                                    <tr>
                                        <td style="font-weight:700; color:${p.color};">${p.icon} ${p.code} (${p.name})</td>
                                        <td style="text-align:right; font-weight:600;">${vals[1] || 0}</td>
                                        <td style="text-align:right;">${vals[20] || 0}</td>
                                        <td style="text-align:right;">${vals[40] || 0}</td>
                                        <td style="text-align:right;">${vals[60] || 0}</td>
                                        <td style="text-align:right;">${vals[80] || 0}</td>
                                        <td style="text-align:right; font-weight:700; color:#38bdf8;">${vals[99] || 0}</td>
                                        <td style="text-align:center;">
                                            <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="openClassParamsCurveModal(${p.id})" title="Generate kurva khusus ${p.code}">Edit Curve</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        ${renderTraitsCard(cls, 'classes')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">${pai('notes')} Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value); updateClassSimulationLive();">${escapeHtml(cls.note || '')}</textarea>
            </div>
        </div>
    `;

    setTimeout(updateClassSimulationLive, 10);
    setTimeout(renderClassMainScrollGrid, 15);
    setTimeout(drawExpCurveGraph, 20);
}



function addClassLearning() {
    const cls = State.classes[State.selectedIndex];
    cls.learnings = cls.learnings || [];
    cls.learnings.push({ level: 1, skillId: 1, note: '' });
    setUnsaved(true);
    renderEditor();
}



function removeClassLearning(index) {
    const cls = State.classes[State.selectedIndex];
    if (cls.learnings && cls.learnings[index]) {
        cls.learnings.splice(index, 1);
        setUnsaved(true);
        renderEditor();
    }
}

// =====================================================================
// RIGHT COLUMN PREVIEW RENDERERS (HASIL STAT AKHIR & INSPECTORS)
// =====================================================================



function renderClassStatPreview(container, cls) {
    ensureClassParams(cls);
    const note = cls.note || '';
    const currentTier = parseInt(getTagVal(note, 'Class Tier', '1'), 10) || 1;
    const defaultMaxLvl = currentTier === 1 ? 10 : (currentTier === 2 ? 30 : (currentTier === 3 ? 40 : (currentTier === 4 ? 50 : (currentTier === 5 ? 60 : 99))));
    const classMaxLvl = parseInt(getTagVal(note, 'Class Max Level', ''), 10) || defaultMaxLvl;
    State.classTabSimLevel = Math.max(1, Math.min(State.classTabSimLevel || 1, classMaxLvl));
    const simLvl = State.classTabSimLevel;
    State.classRightTab = State.classRightTab || 'tree';
    const compats = typeof getClassCompatibleScrollItems === 'function' ? getClassCompatibleScrollItems(cls.name) : [];
    const isScrolls = State.classRightTab === 'scrolls';

    container.innerHTML = `
        <!-- 1. JOB LEVEL SIMULATOR -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <h2 style="font-size:0.85rem; margin:0;">${pai('sliders')} Job Level Simulation</h2>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Simulasi pertumbuhan profesi murni</div>
                </div>
                <span id="classSimLevelBadge" class="badge-sub" style="font-size:0.85rem; font-weight:700; color:#c084fc; background:rgba(192,132,252,0.15); border-color:rgba(192,132,252,0.3); padding:3px 10px;">
                    Job Lv ${simLvl} / ${classMaxLvl}
                </span>
            </div>
            <div class="card-body" style="padding:10px 14px;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <input type="range" min="1" max="${classMaxLvl}" value="${simLvl}" class="form-control" style="flex:1; cursor:pointer;" 
                           id="classSimSlider" oninput="onClassSimLevelChange(this.value)">
                    <input type="number" min="1" max="${classMaxLvl}" value="${simLvl}" class="form-control" style="width:65px; text-align:center; font-weight:700;" 
                           id="classSimInput" onchange="onClassSimLevelChange(this.value)">
                </div>
            </div>
        </div>

        <!-- 1.5 ACTIVE CLASS PASSIVE ABILITY -->
        <div class="card" style="margin-bottom:0; border: 1px solid rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.05);">
            <div class="card-header" style="padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:0.95rem;">${pai('sparkles')}</span>
                    <h2 style="font-size:0.85rem; margin:0; color:#fbbf24;">Class Passive Ability</h2>
                </div>
                <span class="badge" style="background:rgba(245,158,11,0.2); color:#fbbf24; font-size:0.7rem; font-weight:700; border:1px solid rgba(245,158,11,0.3);">Innate</span>
            </div>
            <div class="card-body" style="padding:10px 12px;" id="cls-sim-ability-container">
                <!-- Populated dynamically by updateClassSimulationLive -->
            </div>
        </div>

        <!-- 2. TOTAL ATTRIBUTE BONUSES FROM THIS CLASS AT CURRENT JOB LEVEL -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 14px;">
                <h2 style="font-size:0.85rem; margin:0; color:#38bdf8;">${pai('chart-bar')} Bonus Atribut Kelas (Lv ${simLvl})</h2>
            </div>
            <div class="card-body" style="padding:10px 14px;">
                <div class="stat-grid-6">
                                        ${CORE_ATTRIBUTES.map(attr => `
                        <div class="stat-card-input" id="cls-sim-${attr.code}-card" style="border-left: 2px solid ${attr.color}; padding:6px 8px; cursor:help;" data-hover-name="Bonus ${attr.name} (${attr.code})" title="Bonus Stat dari Profesi&#10;Rumus: Class IV + Growth × (JobLv - 1)">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:${attr.color}; font-weight:700; font-size:0.75rem;">${attr.icon} ${attr.code}</span>
                                <span style="font-size:1.15rem; font-weight:700; color:${attr.color};" id="cls-sim-${attr.code}">0</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- 3. RPG MAKER BASE CURVES PREVIEW -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 14px;">
                <h2 style="font-size:0.85rem; margin:0; color:#10b981;">${pai('chart-line')} Baseline Class Params (Lv ${simLvl})</h2>
            </div>
            <div class="card-body" style="padding:10px 14px;">
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                                        <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171; cursor:help;" data-hover-name="Base MHP Profesi" title="Kurva dasar HP bawaan profesi dari tabel parameter RPG Maker pada Job Level ini">
                        <div style="font-size:0.7rem; color:var(--text-muted);">Base MHP</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#f87171;" id="cls-sim-mhp">0</div>
                    </div>
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa; cursor:help;" data-hover-name="Base MMP Profesi" title="Kurva dasar Mana / MP bawaan profesi dari tabel parameter RPG Maker pada Job Level ini">
                        <div style="font-size:0.7rem; color:var(--text-muted);">Base MMP</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;" id="cls-sim-mmp">0</div>
                    </div>
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #34d399; cursor:help;" data-hover-name="Base DEF Profesi" title="Kurva dasar Pertahanan bawaan profesi dari tabel parameter RPG Maker pada Job Level ini">
                        <div style="font-size:0.7rem; color:var(--text-muted);">Base DEF</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#34d399;" id="cls-sim-def">0</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. SKILL TREE & KITAB / GULUNGAN KOMPATIBEL -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:8px 12px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="font-size:0.85rem; margin:0; color:#eab308;">${pai('sparkles')} Jurus &amp; Kemampuan Kelas</h2>
                    <span id="classRightTabBadge" class="badge-sub" style="font-size:0.75rem; font-weight:700;">
                        ${isScrolls ? `Kompatibel (${compats.length})` : `Job Lv 1 - ${simLvl}`}
                    </span>
                </div>
                <div style="display:flex; gap:6px;">
                    <button type="button" id="classRightTabTreeBtn" class="btn btn-sm ${!isScrolls ? 'btn-primary' : 'btn-secondary'}" style="flex:1; font-size:0.72rem; padding:4px 6px;" onclick="onClassRightTabChange('tree')" title="Lihat alur Skill Tree alami yang dipelajari saat naik Job Level">
                        ${pai('list')} Skill Tree (${(cls.learnings || []).length})
                    </button>
                    <button type="button" id="classRightTabScrollBtn" class="btn btn-sm ${isScrolls ? 'btn-primary' : 'btn-secondary'}" style="flex:1; font-size:0.72rem; padding:4px 6px;" onclick="onClassRightTabChange('scrolls')" title="Lihat Scroll jurus yang bisa dipelajari kelas ini (habis pakai)">
                        ${pai('book')} Scroll (${compats.length})
                    </button>
                </div>
            </div>
            <div class="card-body" style="padding:8px 12px; max-height:260px; overflow-y:auto;" id="cls-sim-skills-container">
                <!-- Populated dynamically by updateClassSimulationLive -->
            </div>
        </div>
    `;

    setTimeout(updateClassSimulationLive, 10);
}



function onExpParamChange(paramIndex, value) {
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    cls.expParams = cls.expParams || [30, 20, 30, 30];
    const val = Math.max(10, Math.min(50, parseInt(value, 10) || 10));
    cls.expParams[paramIndex] = val;

    // Sync slider and number input
    const badge = document.getElementById(`expParamBadge${paramIndex}`);
    if (badge) badge.innerText = val;
    const numInput = document.getElementById(`expInputNum${paramIndex}`);
    if (numInput && numInput.value != val) numInput.value = val;

    setUnsaved(true);
    drawExpCurveGraph();
    updateExpMilestones();
}



function applyExpPreset(params) {
    const cls = State.classes[State.selectedIndex];
    if (!cls || !Array.isArray(params)) return;
    cls.expParams = [...params];

    for (let i = 0; i < 4; i++) {
        const badge = document.getElementById(`expParamBadge${i}`);
        if (badge) badge.innerText = params[i];
        const numInput = document.getElementById(`expInputNum${i}`);
        if (numInput) numInput.value = params[i];
        const slider = document.querySelector(`input[type="range"][oninput*="onExpParamChange(${i}"]`);
        if (slider) slider.value = params[i];
    }

    setUnsaved(true);
    drawExpCurveGraph();
    updateExpMilestones();
    showToast('Preset Kurva EXP diterapkan!', 'info');
}



function updateExpMilestones() {
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    const p = cls.expParams || [30, 20, 30, 30];

    const exp10 = calculateExpForLevel(10, p);
    const exp30 = calculateExpForLevel(30, p);
    const exp50 = calculateExpForLevel(50, p);
    const exp99 = calculateExpForLevel(99, p);

    const m10 = document.getElementById('milestoneExp10');
    if (m10) m10.innerText = exp10.toLocaleString();
    const m30 = document.getElementById('milestoneExp30');
    if (m30) m30.innerText = exp30.toLocaleString();
    const m50 = document.getElementById('milestoneExp50');
    if (m50) m50.innerText = exp50.toLocaleString();
    const m99 = document.getElementById('milestoneExp99');
    if (m99) m99.innerText = exp99.toLocaleString();
}



let expHoverLevel = null;



function drawExpCurveGraph(hoverX = null) {
    const canvas = document.getElementById('expCurveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;

    const p = cls.expParams || [30, 20, 30, 30];
    const maxLevel = 99;
    const maxExp = calculateExpForLevel(maxLevel, p);

    // Responsive sizing
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height))) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
    }

    const w = canvas.width;
    const h = canvas.height;
    const padL = 52;
    const padR = 24;
    const padT = 20;
    const padB = 30;
    const graphW = w - padL - padR;
    const graphH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // Gridlines & Y-Axis Labels
    const ySteps = 4;
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.font = '10px sans-serif';

    for (let i = 0; i <= ySteps; i++) {
        const ratio = i / ySteps;
        const y = padT + graphH * (1 - ratio);
        const val = Math.round(maxExp * ratio);

        ctx.strokeStyle = i === 0 ? '#334155' : 'rgba(51, 65, 85, 0.4)';
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(formatExpNum(val), padL - 8, y + 3);
    }

    // X-Axis Labels (Levels)
    const xMilestones = [1, 20, 40, 60, 80, 99];
    ctx.textAlign = 'center';

    xMilestones.forEach(lv => {
        const x = padL + ((lv - 1) / (maxLevel - 1)) * graphW;
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, h - padB);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Lv ${lv}`, x, h - padB + 16);
    });

    // Calculate Curve Points
    const points = [];
    for (let lv = 1; lv <= maxLevel; lv++) {
        const expVal = calculateExpForLevel(lv, p);
        const x = padL + ((lv - 1) / (maxLevel - 1)) * graphW;
        const y = padT + graphH * (1 - (maxExp > 0 ? (expVal / maxExp) : 0));
        points.push({ lv, x, y, exp: expVal });
    }

    // Filled Gradient Area under curve
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padB);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, h - padB);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Glowing Curve Line
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();

    // Hover crosshair & tooltip
    if (hoverX !== null && hoverX >= padL && hoverX <= w - padR) {
        const ratioX = (hoverX - padL) / graphW;
        const targetLv = Math.max(1, Math.min(99, Math.round(1 + ratioX * 98)));
        const pt = points[targetLv - 1];

        if (pt) {
            // Vertical dashed line
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pt.x, padT);
            ctx.lineTo(pt.x, h - padB);
            ctx.stroke();
            ctx.restore();

            // Dot on curve
            ctx.save();
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Update tooltip bar above graph
            const nextLvExp = targetLv < 99 ? (calculateExpForLevel(targetLv + 1, p) - pt.exp) : 0;
            const tooltipEl = document.getElementById('expHoverTooltip');
            if (tooltipEl) {
                tooltipEl.innerHTML = `${pai('target')} <strong style="color:#fff;">Level ${targetLv}</strong> • Total EXP: <span style="color:#38bdf8;">${pt.exp.toLocaleString()}</span> • Next Lv: <span style="color:#a78bfa;">+${nextLvExp.toLocaleString()} EXP</span>`;
            }
        }
    }
}



function initExpCanvasListeners() {
    const canvas = document.getElementById('expCurveCanvas');
    if (!canvas || canvas.dataset.hasListener) return;
    canvas.dataset.hasListener = 'true';

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        drawExpCurveGraph(x);
    });

    canvas.addEventListener('mouseleave', () => {
        drawExpCurveGraph(null);
        const tooltipEl = document.getElementById('expHoverTooltip');
        if (tooltipEl) tooltipEl.innerText = 'Hover graph to view level details';
    });
}



function toggleExpTableModal() {
    const cls = State.classes[State.selectedIndex];
    if (!cls) return;
    const p = cls.expParams || [30, 20, 30, 30];
    const modal = document.getElementById('expTableModal');
    const titleEl = document.getElementById('expTableModalTitle');
    const bodyEl = document.getElementById('expTableModalBody');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.innerText = `${cls.name || 'Class'} - Level by Level EXP Table (Lv 1 - 99)`;
    let rowsHtml = '';
    let prevTotal = 0;

    for (let lv = 1; lv <= 99; lv++) {
        const total = calculateExpForLevel(lv, p);
        const next = lv < 99 ? (calculateExpForLevel(lv + 1, p) - total) : 0;
        rowsHtml += `
            <tr>
                <td style="text-align:center; font-weight:700; color:var(--accent);">Lv ${lv}</td>
                <td style="text-align:right; color:#a78bfa;">${next.toLocaleString()}</td>
                <td style="text-align:right; font-weight:700; color:#38bdf8;">${total.toLocaleString()}</td>
            </tr>
        `;
    }

    bodyEl.innerHTML = rowsHtml;
    modal.style.display = 'flex';
}



function closeExpTableModal() {
    const modal = document.getElementById('expTableModal');
    if (modal) modal.style.display = 'none';
}
