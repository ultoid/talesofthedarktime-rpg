/**
 * NUSV Database Studio - UI Navigation & Entry Management
 */

function ensureNavTabs() {
    const nav = document.querySelector('.nav-tabs');
    if (!nav) return;
    const tabBtns = Array.from(nav.querySelectorAll('.tab-btn'));
    const hasRaces = tabBtns.some(b => {
        const onclick = b.getAttribute('onclick') || '';
        return onclick.includes('races');
    });
    if (!hasRaces) {
        const clsBtn = tabBtns.find(b => {
            const onclick = b.getAttribute('onclick') || '';
            return onclick.includes('classes');
        });
        const raceBtn = document.createElement('button');
        raceBtn.className = 'tab-btn' + (State.currentTab === 'races' ? ' active' : '');
        raceBtn.setAttribute('onclick', "switchTab('races')");
        raceBtn.innerHTML = '🧬 Races';
        if (clsBtn && clsBtn.nextSibling) {
            nav.insertBefore(raceBtn, clsBtn.nextSibling);
        } else {
            nav.appendChild(raceBtn);
        }
    }

    if (typeof renderRaceEditor === 'undefined' && typeof document !== 'undefined' && document.head) {
        const existing = document.querySelector('script[src*="race_editor.js"]');
        if (!existing) {
            const s = document.createElement('script');
            s.src = 'editor_studio/js/editors/race_editor.js?t=' + Date.now();
            s.onload = () => {
                if (State.currentTab === 'races') renderEditor();
            };
            document.head.appendChild(s);
        }
    }
}

function switchTab(tabKey) {
    ensureNavTabs();
    if (typeof stopEnemyBattlerAnimation === 'function') {
        stopEnemyBattlerAnimation();
    }
    if (typeof stopSkillBattleAnimation === 'function') {
        stopSkillBattleAnimation();
    }
    if (typeof stopAnimationEditorLoop === 'function') {
        stopAnimationEditorLoop();
    }

    // 1. Simpan index seleksi tab sebelumnya
    if (State.currentTab) {
        State.selectedIndices = State.selectedIndices || {};
        State.selectedIndices[State.currentTab] = State.selectedIndex || 1;
    }

    // 2. Berpindah ke tab baru
    State.currentTab = tabKey;

    // 3. Pulihkan index terakhir yang dipilih pada tab ini (default 1 jika belum pernah)
    State.selectedIndices = State.selectedIndices || {};
    const rememberedIdx = State.selectedIndices[tabKey] || 1;
    const list = getActiveList();
    State.selectedIndex = (list && rememberedIdx < list.length) ? rememberedIdx : 1;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabKey));
    });
    document.getElementById('searchInput').value = '';
    renderSidebar();
    renderEditor();

    // 4. Gulir sidebar otomatis ke posisi item yang sedang aktif
    setTimeout(() => {
        const listEl = document.getElementById('sidebarList');
        if (listEl) {
            const activeEl = listEl.querySelector('.list-item.active');
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, 30);
}




function setClassTierFilter(filterVal) {
    State.classTierFilter = filterVal;
    if (filterVal !== 'all') {
        const currentClass = State.classes[State.selectedIndex];
        const currentTier = currentClass ? (getTagVal(currentClass.note, 'Class Tier', '1') || '1') : '';
        if (currentTier !== String(filterVal)) {
            const firstMatch = State.classes.findIndex((c, idx) => idx > 0 && c && String(getTagVal(c.note, 'Class Tier', '1') || '1') === String(filterVal));
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.classes = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setRaceGroupFilter(filterVal) {
    State.raceGroupFilter = filterVal;
    if (filterVal !== 'all') {
        const currentRace = (State.races || [])[State.selectedIndex];
        if (!currentRace || currentRace.group !== filterVal) {
            const firstMatch = (State.races || []).findIndex((r, idx) => idx > 0 && r && r.group === filterVal);
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.races = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setWeaponTypeFilter(filterVal) {
    State.weaponTypeFilter = filterVal;
    if (filterVal !== 'all') {
        const currentWep = State.weapons[State.selectedIndex];
        if (!currentWep || String(currentWep.wtypeId) !== String(filterVal)) {
            const firstMatch = State.weapons.findIndex((w, idx) => idx > 0 && w && String(w.wtypeId) === String(filterVal));
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.weapons = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setArmorSlotFilter(filterVal) {
    State.armorSlotFilter = filterVal;
    if (filterVal !== 'all') {
        const currentArm = State.armors[State.selectedIndex];
        if (!currentArm || String(currentArm.etypeId) !== String(filterVal)) {
            const firstMatch = State.armors.findIndex((a, idx) => idx > 0 && a && String(a.etypeId) === String(filterVal));
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.armors = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function skillMatchesFilter(skill, filterVal) {
    if (!skill) return false;
    if (!filterVal || filterVal === 'all') return true;
    if (filterVal === 'player_skills') {
        return (State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === skill.id)) || skill.id <= 2) && skill.id <= 232;
    }
    if (filterVal === 'enemy_skills') {
        const isPlayer = (State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === skill.id)) || skill.id <= 2) && skill.id <= 232;
        return !isPlayer && skill.id < 426;
    }
    if (filterVal === 'grimoire_skills') {
        return skill.id >= 426;
    }
    if (filterVal === 'basic') {
        return !State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === skill.id));
    }
    if (filterVal === 'tm_available') {
        return !isSkillExclusive(skill) && getSkillTmCompatibleClasses(skill).length > 0;
    }
    if (filterVal === 'exclusive_ult') {
        return isSkillExclusive(skill);
    }
    if (filterVal.startsWith('tier_')) {
        const t = parseInt(filterVal.replace('tier_', ''), 10);
        return getSkillTier(skill) === t;
    }
    if (filterVal.startsWith('cls_')) {
        const cid = parseInt(filterVal.replace('cls_', ''), 10);
        const cls = State.classes[cid];
        return cls && cls.learnings && cls.learnings.some(l => l.skillId === skill.id);
    }
    if (filterVal.startsWith('compat_')) {
        const cname = filterVal.replace('compat_', '').toLowerCase();
        const tmClasses = getSkillTmCompatibleClasses(skill);
        const isLearned = State.classes.some(c => c && c.name.toLowerCase() === cname && c.learnings && c.learnings.some(l => l.skillId === skill.id));
        return isLearned || tmClasses.some(tc => tc.toLowerCase() === cname);
    }
    // Fallback old numeric class ID
    const cid = parseInt(filterVal, 10);
    if (!isNaN(cid) && cid > 0) {
        const cls = State.classes[cid];
        return cls && cls.learnings && cls.learnings.some(l => l.skillId === skill.id);
    }
    return true;
}

function setSkillClassFilter(filterVal) {
    State.skillClassFilter = filterVal;
    if (filterVal !== 'all') {
        const currentSkill = State.skills[State.selectedIndex];
        if (!skillMatchesFilter(currentSkill, filterVal)) {
            const firstMatch = State.skills.findIndex((s, idx) => idx > 0 && skillMatchesFilter(s, filterVal));
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.skills = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setItemCategoryFilter(filterVal) {
    State.itemCategoryFilter = filterVal;
    if (filterVal !== 'all') {
        const currentItem = State.items[State.selectedIndex];
        if (getItemCategory(currentItem) !== filterVal) {
            const firstMatch = State.items.findIndex((itm, idx) => idx > 0 && itm && getItemCategory(itm) === filterVal);
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.items = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setStateCategoryFilter(filterVal) {
    State.stateCategoryFilter = filterVal;
    if (filterVal !== 'all') {
        const currentState = State.states[State.selectedIndex];
        if (getStateCategory(currentState) !== filterVal) {
            const firstMatch = State.states.findIndex((st, idx) => idx > 0 && st && getStateCategory(st) === filterVal);
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.states = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function setArmorSlotFilter(filterVal) {
    State.armorSlotFilter = filterVal;
    if (filterVal !== 'all') {
        const currentArm = State.armors[State.selectedIndex];
        if (!currentArm || String(currentArm.etypeId) !== String(filterVal)) {
            const firstMatch = State.armors.findIndex((a, idx) => idx > 0 && a && String(a.etypeId) === String(filterVal));
            if (firstMatch !== -1) {
                State.selectedIndex = firstMatch;
                State.selectedIndices = State.selectedIndices || {};
                State.selectedIndices.armors = firstMatch;
                renderEditor();
            }
        }
    }
    renderSidebar();
}

function renderSidebar() {
    ensureNavTabs();
    const listEl = document.getElementById('sidebarList');
    listEl.innerHTML = '';
    const items = getActiveList();
    const query = (document.getElementById('searchInput').value || '').toLowerCase();

        const filterContainer = document.getElementById('sidebarFilters');
    if (filterContainer) {
        if (State.currentTab === 'classes') {
            filterContainer.style.display = 'flex';
            const f = State.classTierFilter || 'all';
            const tiers = [
                { id: 'all', name: '🛡️ Semua Tier Kelas (All Tiers)' },
                { id: '1', name: '🌱 Tier 1 - Base / Novice' },
                { id: '2', name: '⚔️ Tier 2 - Advanced' },
                { id: '3', name: '🎖️ Tier 3 - Elite' },
                { id: '4', name: '👑 Tier 4 - Master' },
                { id: '5', name: '🌟 Tier 5 - Grandmaster' },
                { id: '6', name: '🌌 Tier 6 - Pinnacle' }
            ];
            const totalCount = State.classes.filter(c => c).length;
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setClassTierFilter(this.value)" title="Filter kelas berdasarkan tingkatan Tier">
                    ${tiers.map(t => {
                        const count = t.id === 'all'
                            ? totalCount
                            : State.classes.filter(c => c && String(getTagVal(c.note, 'Class Tier', '1') || '1') === String(t.id)).length;
                        return `<option value="${t.id}" ${String(f) === String(t.id) ? 'selected' : ''}>${t.name} (${count})</option>`;
                    }).join('')}
                </select>
            `;
        } else if (State.currentTab === 'weapons') {
            filterContainer.style.display = 'flex';
            const f = State.weaponTypeFilter || 'all';
            const wtypes = (State.system && State.system.weaponTypes) ? State.system.weaponTypes : [];
            const icons = {
                'Sword': '⚔️',
                'Long Sword': '🗡️',
                'Gloves': '🥊',
                'Spear': '🔱',
                'Axe': '🪓',
                'Staff': '🪄',
                'Rune': '🔮',
                'Long Bow': '🏹',
                'Crossbow': '🎯',
                'Dagger': '🗡️',
                'Bow': '🏹',
                'Mace': '🔨',
                'Gun': '🔫',
                'Wand': '🪄'
            };
            const totalCount = State.weapons.filter(w => w).length;
            let optionsHtml = `<option value="all" ${f === 'all' ? 'selected' : ''}>⚔️ Semua Tipe Senjata (All Weapons) (${totalCount})</option>`;
            for (let i = 1; i < wtypes.length; i++) {
                const wt = wtypes[i];
                if (!wt) continue;
                const icon = icons[wt] || '⚔️';
                const count = State.weapons.filter(w => w && String(w.wtypeId) === String(i)).length;
                optionsHtml += `<option value="${i}" ${String(f) === String(i) ? 'selected' : ''}>${icon} ${escapeHtml(wt)} (${count})</option>`;
            }
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setWeaponTypeFilter(this.value)" title="Pilih filter tipe senjata">
                    ${optionsHtml}
                </select>
            `;
        } else if (State.currentTab === 'armors') {
            filterContainer.style.display = 'flex';
            const f = State.armorSlotFilter || 'all';
            const slots = [
                { id: 'all', name: '🛡️ Semua Slot Armor (All Slots)' },
                { id: '2', name: '🛡️ Shields (Tangan Kiri / Slot 2)' },
                { id: '3', name: '🎩 Helms (Kepala / Slot 3)' },
                { id: '4', name: '🥋 Body Armor (Badan / Slot 4)' },
                { id: '5', name: '👢 Boots (Kaki / Slot 5)' },
                { id: '6', name: '💍 Accessories (Aksesoris / Slot 6)' },
                { id: '7', name: '🔮 Relics (Pusaka Relik / Slot 7)' }
            ];
            const totalCount = State.armors.filter(a => a).length;
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setArmorSlotFilter(this.value)" title="Pilih filter kategori slot armor">
                    ${slots.map(s => {
                        const count = s.id === 'all' 
                            ? totalCount 
                            : State.armors.filter(a => a && String(a.etypeId) === String(s.id)).length;
                        return `<option value="${s.id}" ${f === s.id ? 'selected' : ''}>${s.name} (${count})</option>`;
                    }).join('')}
                </select>
            `;
        } else if (State.currentTab === 'skills') {
            filterContainer.style.display = 'flex';
            const f = State.skillClassFilter || 'all';
            const totalCount = State.skills.filter(s => s).length;
            const playerSkillsCount = State.skills.filter(s => s && skillMatchesFilter(s, 'player_skills')).length;
            const tmCount = State.skills.filter(s => s && !isSkillExclusive(s) && getSkillTmCompatibleClasses(s).length > 0).length;
            const ultCount = State.skills.filter(s => s && isSkillExclusive(s)).length;
            const enemySkillsCount = State.skills.filter(s => s && skillMatchesFilter(s, 'enemy_skills')).length;
            const grimoireCount = State.skills.filter(s => s && skillMatchesFilter(s, 'grimoire_skills')).length;

            let classLearnOptions = '';
            let classCompatOptions = '';
            (State.classes || []).forEach(c => {
                if (!c) return;
                const learnedCount = (c.learnings || []).length;
                const tier = getTagVal(c.note, 'Class Tier', '1');
                const valCls = `cls_${c.id}`;
                classLearnOptions += `<option value="${valCls}" ${f === valCls || f === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)} (T${tier}) (${learnedCount})</option>`;

                const cnameLower = c.name.toLowerCase();
                const compatCount = State.skills.filter(s => s && skillMatchesFilter(s, `compat_${cnameLower}`)).length;
                const valCompat = `compat_${cnameLower}`;
                classCompatOptions += `<option value="${valCompat}" ${f === valCompat ? 'selected' : ''}>${escapeHtml(c.name)} (${compatCount} Jurus)</option>`;
            });

            filterContainer.innerHTML = `
                <select class="form-control" onchange="setSkillClassFilter(this.value)" title="Filter skill berdasarkan kategori, tier, atau profesi">
                    <option value="player_skills" ${f === 'player_skills' ? 'selected' : ''}>⚔️ Skill Kelas Pemain (${playerSkillsCount})</option>
                    <option value="tm_available" ${f === 'tm_available' ? 'selected' : ''}>📜 Memiliki Scroll (${tmCount})</option>
                    <option value="exclusive_ult" ${f === 'exclusive_ult' ? 'selected' : ''}>👑 Jurus Pamungkas Eksklusif (${ultCount})</option>
                    <option value="enemy_skills" ${f === 'enemy_skills' ? 'selected' : ''}>👾 Aksi Monster & Musuh (${enemySkillsCount})</option>
                    <option value="grimoire_skills" ${f === 'grimoire_skills' ? 'selected' : ''}>📖 Grimoire Lapangan (${grimoireCount})</option>
                    <option value="all" ${f === 'all' ? 'selected' : ''}>✨ Semua Skill (${totalCount})</option>
                    <optgroup label="--- Filter Berdasarkan Tier ---">
                        <option value="tier_1" ${f === 'tier_1' ? 'selected' : ''}>Tier 1 - Novice</option>
                        <option value="tier_2" ${f === 'tier_2' ? 'selected' : ''}>Tier 2 - Basic</option>
                        <option value="tier_3" ${f === 'tier_3' ? 'selected' : ''}>Tier 3 - Intermediate</option>
                        <option value="tier_4" ${f === 'tier_4' ? 'selected' : ''}>Tier 4 - Advanced Promoted</option>
                        <option value="tier_5" ${f === 'tier_5' ? 'selected' : ''}>Tier 5 - Master Specialist</option>
                        <option value="tier_6" ${f === 'tier_6' ? 'selected' : ''}>Tier 6 - Transcendent Legend</option>
                    </optgroup>
                    <optgroup label="--- Dikuasai Alami (Level-Up) ---">
                        ${classLearnOptions}
                    </optgroup>
                    <optgroup label="--- Kompatibel Scroll (Jurus Tambahan) ---">
                        ${classCompatOptions}
                    </optgroup>
                </select>
            `;
        } else if (State.currentTab === 'items') {
            filterContainer.style.display = 'flex';
            const f = State.itemCategoryFilter || 'all';
            const categories = [
                { id: 'all', name: '🧪 Semua Kategori Item (All Categories)' },
                { id: 'Consumable', name: '🧪 Consumable (Konsumsi / Obat)' },
                { id: 'Material', name: '🪵 Material (Bahan Baku Monster / Alam)' },
                { id: 'Forge', name: '⚒️ Forge (Bahan Tempa / Logam / Kristal)' },
                { id: 'Valuable', name: '💎 Valuable (Barang Berharga / Harta)' },
                { id: 'Key Item', name: '🗝️ Key Item (Barang Kunci / Quest)' }
            ];
            const totalCount = State.items.filter(i => i).length;
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setItemCategoryFilter(this.value)" title="Filter item berdasarkan kategori inventori">
                    ${categories.map(cat => {
                        const count = cat.id === 'all'
                            ? totalCount
                            : State.items.filter(i => i && getItemCategory(i) === cat.id).length;
                        return `<option value="${cat.id}" ${f === cat.id ? 'selected' : ''}>${cat.name} (${count})</option>`;
                    }).join('')}
                </select>
            `;
        } else if (State.currentTab === 'states') {
            filterContainer.style.display = 'flex';
            const f = State.stateCategoryFilter || 'all';
            const categories = [
                { id: 'all', name: '💫 Semua Kategori State (All States)' },
                { id: 'Passive', name: '🟣 Passive (Pasif / Trait Khusus)' },
                { id: 'Status Effect', name: '🩸 Status Effect (Status Ailment / Buruk)' },
                { id: 'Skill Effect', name: '⚡ Skill Effect (Efek Tempur / Buff & Debuff)' }
            ];
            const totalCount = State.states.filter(s => s).length;
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setStateCategoryFilter(this.value)" title="Filter state berdasarkan klasifikasi: Passive, Status Effect, atau Skill Effect">
                    ${categories.map(cat => {
                        const count = cat.id === 'all'
                            ? totalCount
                            : State.states.filter(s => s && getStateCategory(s) === cat.id).length;
                        return `<option value="${cat.id}" ${f === cat.id ? 'selected' : ''}>${cat.name} (${count})</option>`;
                    }).join('')}
                </select>
            `;
        } else if (State.currentTab === 'races') {
            filterContainer.style.display = 'flex';
            const f = State.raceGroupFilter || 'all';
            const groups = [
                { id: 'all', name: '🧬 Semua Golongan Ras' },
                { id: 'Suku Bumi', name: '🌍 Suku Bumi (Daratan Utama)' },
                { id: 'Wuru Loka', name: '🐾 Wuru Loka (Makhluk Eksotis/Liar)' },
                { id: 'Arkahyan', name: '✨ Arkahyan (Surgawi/Cahaya)' },
                { id: 'Drahkthar', name: '🌑 Drahkthar (Entitas Gelap/Iblis)' }
            ];
            const totalCount = (State.races || []).filter(r => r).length;
            filterContainer.innerHTML = `
                <select class="form-control" onchange="setRaceGroupFilter(this.value)" title="Filter ras berdasarkan golongan alam">
                    ${groups.map(g => {
                        const count = g.id === 'all'
                            ? totalCount
                            : (State.races || []).filter(r => r && r.group === g.id).length;
                        return `<option value="${g.id}" ${f === g.id ? 'selected' : ''}>${g.name} (${count})</option>`;
                    }).join('')}
                </select>
            `;
        } else {
            filterContainer.style.display = 'none';
        }
    }

    items.forEach((item, index) => {
        if (!item) return;
        if (State.currentTab === 'races' && State.raceGroupFilter && State.raceGroupFilter !== 'all') {
            if (item.group !== State.raceGroupFilter) return;
        }
        if (State.currentTab === 'classes' && State.classTierFilter && State.classTierFilter !== 'all') {
            const t = getTagVal(item.note, 'Class Tier', '1') || '1';
            if (String(t) !== String(State.classTierFilter)) return;
        }
        if (State.currentTab === 'armors' && State.armorSlotFilter && State.armorSlotFilter !== 'all') {
            if (String(item.etypeId) !== String(State.armorSlotFilter)) return;
        }
        if (State.currentTab === 'weapons' && State.weaponTypeFilter && State.weaponTypeFilter !== 'all') {
            if (String(item.wtypeId) !== String(State.weaponTypeFilter)) return;
        }
        if (State.currentTab === 'skills' && State.skillClassFilter && State.skillClassFilter !== 'all') {
            if (!skillMatchesFilter(item, State.skillClassFilter)) return;
        }
        if (State.currentTab === 'items' && State.itemCategoryFilter && State.itemCategoryFilter !== 'all') {
            if (getItemCategory(item) !== State.itemCategoryFilter) return;
        }
        if (State.currentTab === 'states' && State.stateCategoryFilter && State.stateCategoryFilter !== 'all') {
            if (getStateCategory(item) !== State.stateCategoryFilter) return;
        }
        if (query && !String(item.name).toLowerCase().includes(query) && !String(item.id).includes(query)) {
            if (State.currentTab === 'classes') {
                const ab = getTagVal(item.note, 'Class Ability', '').toLowerCase();
                if (!ab.includes(query)) return;
            } else {
                return;
            }
        }

        const div = document.createElement('div');
        div.className = `list-item ${index === State.selectedIndex ? 'active' : ''}`;
        div.onclick = () => {
            State.selectedIndex = index;
            State.selectedIndices = State.selectedIndices || {};
            State.selectedIndices[State.currentTab] = index;
            renderSidebar();
            renderEditor();
        };

        let mainBadge = '';
        let subBadges = [];

        if (State.currentTab === 'classes') {
            const t = getTagVal(item.note, 'Class Tier', '1');
            const ab = getTagVal(item.note, 'Class Ability', '');
            mainBadge = `<span class="list-badge">T${t}</span>`;
            if (ab) {
                subBadges.push(`<span class="list-badge" style="color:#fbbf24; border-color:rgba(245,158,11,0.3); font-size:0.65rem;" title="Class Ability: ${escapeHtml(ab)}">✨ ${escapeHtml(ab)}</span>`);
            }
        } else if (State.currentTab === 'weapons') {
            const wtypes = (State.system && State.system.weaponTypes) ? State.system.weaponTypes : [];
            const wtName = wtypes[item.wtypeId] || '';
            if (wtName) subBadges.push(`<span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3);">${escapeHtml(wtName)}</span>`);
        } else if (State.currentTab === 'armors') {
            const slotNames = { 2: 'Shield', 3: 'Helm', 4: 'Armor', 5: 'Boots', 6: 'Accessory', 7: 'Relic' };
            const sName = slotNames[item.etypeId] || '';
            if (sName) subBadges.push(`<span class="list-badge" style="color:#94a3b8; border-color:rgba(148,163,184,0.3);">${escapeHtml(sName)}</span>`);
        } else if (State.currentTab === 'skills') {
            const tier = getSkillTier(item);
            const classIds = getSkillClassIds(item.id);
            const tmClasses = getSkillTmCompatibleClasses(item);
            const isExclusive = isSkillExclusive(item);

            if (tier > 0) {
                mainBadge = `<span class="list-badge" style="color:#f59e0b; border-color:rgba(245,158,11,0.3); font-weight:700;">T${tier}</span>`;
            }
            if (classIds.length > 0) {
                const clsName = State.classes[classIds[0]]?.name || `Cls #${classIds[0]}`;
                subBadges.push(`<span class="list-badge" style="color:#a78bfa; border-color:rgba(167,139,250,0.3);">${escapeHtml(clsName)}</span>`);
            }
            if (isExclusive) {
                subBadges.push(`<span class="list-badge" style="color:#ef4444; border-color:rgba(239,68,68,0.3); font-weight:700;">★ Ult</span>`);
            } else if (tmClasses.length > 0) {
                subBadges.push(`<span class="list-badge" style="color:#10b981; border-color:rgba(16,185,129,0.3);" title="Kompatibel TM: ${escapeHtml(tmClasses.join(', '))}">+${tmClasses.length} TM</span>`);
            }
        } else if (State.currentTab === 'items') {
            const cat = getItemCategory(item);
            if (cat) subBadges.push(`<span class="list-badge" style="color:#fbbf24; border-color:rgba(251,191,36,0.3);">${escapeHtml(cat)}</span>`);
        } else if (State.currentTab === 'states') {
            const cat = getStateCategory(item);
            if (cat === 'Passive') {
                subBadges.push(`<span class="list-badge" style="color:#c084fc; border-color:rgba(192,132,252,0.3);">Passive</span>`);
            } else if (cat === 'Status Effect') {
                subBadges.push(`<span class="list-badge" style="color:#f87171; border-color:rgba(248,113,113,0.3);">Status Effect</span>`);
            } else if (cat === 'Skill Effect') {
                subBadges.push(`<span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3);">Skill Effect</span>`);
            }
        } else if (State.currentTab === 'races') {
            const grp = item.group || '';
            const grpColors = {
                'Suku Bumi': '#38bdf8',
                'Wuru Loka': '#f59e0b',
                'Arkahyan': '#ec4899',
                'Drahkthar': '#a855f7'
            };
            const col = grpColors[grp] || '#94a3b8';
            subBadges.push(`<span class="list-badge" style="color:${col}; border-color:${col}40;">${escapeHtml(grp)}</span>`);
        } else if (State.currentTab === 'animations') {
            const frameCount = (item.frames || []).length;
            const graphicName = item.animation1Name || '';
            mainBadge = `<span class="list-badge" style="color:#f472b6; border-color:rgba(244,114,182,0.3); font-weight:700;">${frameCount}F</span>`;
            if (graphicName) {
                subBadges.push(`<span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3); font-size:0.65rem;">${escapeHtml(graphicName)}</span>`);
            }
        }

        const subRowHtml = subBadges.length > 0 ? `<div class="list-sub-row">${subBadges.join('')}</div>` : '';

        div.innerHTML = `
            <div class="list-main-row">
                <span class="list-id">#${item.id}</span>
                <span class="list-name" title="${escapeHtml(item.name || '')}">${escapeHtml(item.name || '(Empty)')}</span>
                ${mainBadge}
            </div>
            ${subRowHtml}
        `;
        listEl.appendChild(div);
    });

    // Pertahankan scroll sidebar agar item yang aktif terlihat
    const activeEl = listEl.querySelector('.list-item.active');
    if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
    }
}



function filterItems() {
    renderSidebar();
}



function renderEditor() {
    const container = document.getElementById('panelContainer');
    const previewContainer = document.getElementById('statPreviewContainer');
    const statTitle = document.getElementById('statSidebarTitle');
    const statSub = document.getElementById('statSidebarSubtitle');
    const items = getActiveList();
    const item = items[State.selectedIndex];

    if (!item) {
        container.innerHTML = `<div style="text-align:center; padding:60px; color:var(--text-muted);" title="Silakan pilih salah satu data di sidebar sebelah kiri untuk mulai mengedit">Select an item from the left sidebar to edit.</div>`;
        if (previewContainer) previewContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Pilih item dari daftar untuk melihat pratinjau stat.</div>`;
        return;
    }

    // Expose active item to window scope so inline event handlers (e.g. setTagVal(cls, ...))
    // always find the current object without throwing ReferenceError
    window.currentItem = item;
    window.actor = item;
    window.cls = item;
    window.weapon = item;
    window.armor = item;
    window.skill = item;
    window.item = item;
    window.enemy = item;
    window.state = item;
    window.race = item;

    if (State.currentTab !== 'enemies' && typeof stopEnemyBattlerAnimation === 'function') {
        stopEnemyBattlerAnimation();
    }

    switch (State.currentTab) {
        case 'actors': 
            if (statTitle) statTitle.innerHTML = '📊 Hasil Stat Akhir &amp; Build';
            if (statSub) statSub.innerText = 'Dual-Level Simulation';
            renderActorEditor(container, item); 
            if (previewContainer) renderActorStatPreview(previewContainer, item);
            break;
        case 'classes': 
            if (statTitle) statTitle.innerHTML = '📈 Class Stat Scaling (IV)';
            if (statSub) statSub.innerText = 'Job Level Simulation';
            renderClassEditor(container, item); 
            if (previewContainer) renderClassStatPreview(previewContainer, item);
            break;
        case 'races': 
            if (statTitle) statTitle.innerHTML = '🧬 Nature Stat Modifier';
            if (statSub) statSub.innerText = 'Racial Attributes & Nature Matrix';
            if (typeof renderRaceEditor === 'function') {
                renderRaceEditor(container, item); 
                if (previewContainer) renderRaceStatPreview(previewContainer, item);
            } else {
                container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Memuat komponen editor ras...</div>`;
                const scriptEl = document.createElement('script');
                scriptEl.src = 'editor_studio/js/editors/race_editor.js?t=' + Date.now();
                scriptEl.onload = () => {
                    if (typeof renderRaceEditor === 'function') {
                        renderRaceEditor(container, item);
                        if (previewContainer) renderRaceStatPreview(previewContainer, item);
                    }
                };
                document.head.appendChild(scriptEl);
            }
            break;
        case 'weapons': 
            if (statTitle) statTitle.innerHTML = '⚔️ Weapon Stat Inspector';
            if (statSub) statSub.innerText = 'Equipment Power & Attributes';
            renderWeaponEditor(container, item); 
            if (previewContainer) renderEquipmentStatPreview(previewContainer, item, 'weapon');
            break;
        case 'armors': 
            if (statTitle) statTitle.innerHTML = '🛡️ Armor Stat Inspector';
            if (statSub) statSub.innerText = 'Defense & Stat Modifiers';
            renderArmorEditor(container, item); 
            if (previewContainer) renderEquipmentStatPreview(previewContainer, item, 'armor');
            break;
        case 'skills': 
            if (statTitle) statTitle.innerHTML = '⚔️ Live Battle & Skill Inspector';
            if (statSub) statSub.innerText = 'Sideview Combat Simulation';
            renderSkillEditor(container, item); 
            if (previewContainer) renderSkillStatPreview(previewContainer, item);
            break;
        case 'items': 
            if (statTitle) statTitle.innerHTML = '🧪 Item Inspector';
            if (statSub) statSub.innerText = 'Effect & Value Preview';
            renderItemEditor(container, item); 
            if (previewContainer) renderItemStatPreview(previewContainer, item);
            break;
        case 'enemies': 
            if (statTitle) statTitle.innerHTML = '👾 Enemy Combat Stats';
            if (statSub) statSub.innerText = 'Combat Balance & Drops';
            renderEnemyEditor(container, item); 
            if (previewContainer) renderEnemyStatPreview(previewContainer, item);
            break;
        case 'states': 
            if (statTitle) statTitle.innerHTML = '✨ State / Status Effect';
            if (statSub) statSub.innerText = 'Buff / Debuff / Passive';
            renderStateEditor(container, item); 
            if (previewContainer) renderStateStatPreview(previewContainer, item);
            break;
        case 'animations': 
            if (statTitle) statTitle.innerHTML = '💥 Animation Inspector &amp; Timings';
            if (statSub) statSub.innerText = 'SE Audio, Flashes &amp; Cells';
            if (typeof renderAnimationEditor === 'function') {
                renderAnimationEditor(container, item);
                if (previewContainer) renderAnimationStatPreview(previewContainer, item);
            }
            break;
    }
}

// =====================================================================
// ACTOR STAT SIMULATION ENGINE
// =====================================================================


function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}



function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}



/**
 * Tambah entri baru di paling akhir daftar dataset aktif.
 */
function addNewEntry() {
    const list = getActiveList();
    if (!list) return;
    const newId = list.length;
    const item = createBlankEntry(State.currentTab, newId);
    list.push(item);
    State.selectedIndex = newId;
    setUnsaved(true);
    renderSidebar();
    renderEditor();
    showToast(`Entri baru #${newId} berhasil ditambahkan!`, 'success');
}

/**
 * Gandakan (clone) entri yang sedang dipilih ke posisi paling akhir.
 */
function cloneSelectedEntry() {
    const list = getActiveList();
    const curr = getActiveItem();
    if (!list || !curr) return;
    const newId = list.length;
    const cloned = JSON.parse(JSON.stringify(curr));
    cloned.id = newId;
    cloned.name = (cloned.name || '') + ' (Copy)';
    list.push(cloned);
    State.selectedIndex = newId;
    setUnsaved(true);
    renderSidebar();
    renderEditor();
    showToast(`Entri #${curr.id} berhasil digandakan ke #${newId}!`, 'success');
}

/**
 * Hapus entri yang sedang dipilih (atau kosongkan jika di tengah-tengah daftar).
 */
function deleteSelectedEntry() {
    const list = getActiveList();
    const curr = getActiveItem();
    if (!list || !curr) return;
    if (list.length <= 2) {
        showToast('Tidak bisa menghapus entri terakhir!', 'warning');
        return;
    }
    if (!confirm(`Hapus entri #${curr.id} (${curr.name || 'Tanpa Nama'})?`)) {
        return;
    }
    if (curr.id === list.length - 1) {
        list.pop();
        if (State.selectedIndex >= list.length) {
            State.selectedIndex = list.length - 1;
        }
    } else {
        const blank = createBlankEntry(State.currentTab, curr.id);
        list[curr.id] = blank;
    }
    setUnsaved(true);
    renderSidebar();
    renderEditor();
    showToast(`Entri #${curr.id} berhasil dihapus/dikosongkan!`, 'info');
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureNavTabs);
    } else {
        ensureNavTabs();
    }
}
