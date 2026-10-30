/**
 * NUSV Database Studio - UI Navigation & Entry Management
 */

function switchTab(tabKey) {
    if (typeof stopEnemyBattlerAnimation === 'function') {
        stopEnemyBattlerAnimation();
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

function setSkillClassFilter(filterVal) {
    State.skillClassFilter = filterVal;
    if (filterVal !== 'all') {
        const currentSkill = State.skills[State.selectedIndex];
        const isMatch = (skill) => {
            if (!skill) return false;
            if (filterVal === 'basic') {
                return !State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === skill.id));
            }
            const cid = parseInt(filterVal, 10);
            const cls = State.classes[cid];
            return cls && cls.learnings && cls.learnings.some(l => l.skillId === skill.id);
        };

        if (!isMatch(currentSkill)) {
            const firstMatch = State.skills.findIndex((s, idx) => idx > 0 && isMatch(s));
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
            const basicCount = State.skills.filter(s => s && !State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === s.id))).length;

            let classOptions = '';
            (State.classes || []).forEach(c => {
                if (!c) return;
                const learnedCount = (c.learnings || []).length;
                const tier = getTagVal(c.note, 'Class Tier', '1');
                classOptions += `<option value="${c.id}" ${String(f) === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)} (T${tier}) (${learnedCount})</option>`;
            });

            filterContainer.innerHTML = `
                <select class="form-control" onchange="setSkillClassFilter(this.value)" title="Filter skill berdasarkan profesi / kelas yang mempelajarinya">
                    <option value="all" ${f === 'all' ? 'selected' : ''}>✨ Semua Kelas (All Skills) (${totalCount})</option>
                    <option value="basic" ${f === 'basic' ? 'selected' : ''}>🌐 Skill Dasar / Universal (${basicCount})</option>
                    ${classOptions}
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
        } else {
            filterContainer.style.display = 'none';
        }
    }

    items.forEach((item, index) => {
        if (!item) return;
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
            if (State.skillClassFilter === 'basic') {
                const isLearned = State.classes.some(c => c && c.learnings && c.learnings.some(l => l.skillId === item.id));
                if (isLearned) return;
            } else {
                const targetClassId = parseInt(State.skillClassFilter, 10);
                const cls = State.classes[targetClassId];
                const hasSkill = cls && cls.learnings && cls.learnings.some(l => l.skillId === item.id);
                if (!hasSkill) return;
            }
        }
        if (State.currentTab === 'items' && State.itemCategoryFilter && State.itemCategoryFilter !== 'all') {
            if (getItemCategory(item) !== State.itemCategoryFilter) return;
        }
        if (State.currentTab === 'states' && State.stateCategoryFilter && State.stateCategoryFilter !== 'all') {
            if (getStateCategory(item) !== State.stateCategoryFilter) return;
        }
        if (query && !String(item.name).toLowerCase().includes(query) && !String(item.id).includes(query)) {
            return;
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

        let extraTag = '';
        if (State.currentTab === 'classes') {
            const t = getTagVal(item.note, 'Class Tier', '1');
            extraTag = `<span class="list-badge">T${t}</span>`;
        } else if (State.currentTab === 'weapons') {
            const wtypes = (State.system && State.system.weaponTypes) ? State.system.weaponTypes : [];
            const wtName = wtypes[item.wtypeId] || '';
            if (wtName) extraTag = `<span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3);">${escapeHtml(wtName)}</span>`;
        } else if (State.currentTab === 'armors') {
            const slotNames = { 2: 'Shield', 3: 'Helm', 4: 'Armor', 5: 'Boots', 6: 'Accessory', 7: 'Relic' };
            const sName = slotNames[item.etypeId] || '';
            if (sName) extraTag = `<span class="list-badge" style="color:#94a3b8; border-color:rgba(148,163,184,0.3);">${escapeHtml(sName)}</span>`;
        } else if (State.currentTab === 'skills') {
            const classIds = getSkillClassIds(item.id);
            if (classIds.length > 0) {
                const clsName = State.classes[classIds[0]]?.name || `Cls #${classIds[0]}`;
                const more = classIds.length > 1 ? ` +${classIds.length - 1}` : '';
                extraTag = `<span class="list-badge" style="color:#a78bfa; border-color:rgba(167,139,250,0.3);">${escapeHtml(clsName)}${more}</span>`;
            }
        } else if (State.currentTab === 'items') {
            const cat = getItemCategory(item);
            if (cat) extraTag = `<span class="list-badge" style="color:#fbbf24; border-color:rgba(251,191,36,0.3);">${escapeHtml(cat)}</span>`;
        } else if (State.currentTab === 'states') {
            const cat = getStateCategory(item);
            if (cat === 'Passive') {
                extraTag = `<span class="list-badge" style="color:#c084fc; border-color:rgba(192,132,252,0.3);">Passive</span>`;
            } else if (cat === 'Status Effect') {
                extraTag = `<span class="list-badge" style="color:#f87171; border-color:rgba(248,113,113,0.3);">Status Effect</span>`;
            } else if (cat === 'Skill Effect') {
                extraTag = `<span class="list-badge" style="color:#38bdf8; border-color:rgba(56,189,248,0.3);">Skill Effect</span>`;
            }
        }

        div.innerHTML = `
            <span class="list-id">#${item.id}</span>
            <span class="list-name">${escapeHtml(item.name || '(Empty)')}</span>
            ${extraTag}
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
            if (statTitle) statTitle.innerHTML = '📖 Skill Inspector';
            if (statSub) statSub.innerText = 'Combat Resolution & Scope';
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
