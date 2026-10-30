/**
 * NUSV Database Studio - Entity Editor: editors/enemy_editor.js
 */

function renderEnemyStatPreview(container, enemy) {
    if (!enemy) return;
    const p = enemy.params || [100, 10, 10, 10, 10, 10, 10, 10];
    container.innerHTML = `
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <div style="font-size:0.75rem; color:#ef4444; font-weight:700;">Enemy Combat Stats</div>
                    <h2 style="font-size:1.1rem; margin:2px 0 0 0; color:#fff;">#${enemy.id} ${escapeHtml(enemy.name || 'Unnamed')}</h2>
                </div>
            </div>
            <div class="card-body" style="padding:12px 14px; display:flex; flex-direction:column; gap:12px;">
                <!-- Primary Stats -->
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #f87171;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">Max HP</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#f87171;">${p[0].toLocaleString()}</div>
                    </div>
                    <div class="stat-card-input" style="padding:6px 8px; border-left:2px solid #60a5fa;">
                        <div style="font-size:0.7rem; color:var(--text-muted);">Max MP</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#60a5fa;">${p[1].toLocaleString()}</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #fb923c;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">ATK</div>
                        <div style="font-size:1rem; font-weight:700; color:#fb923c;">${p[2]}</div>
                    </div>
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #34d399;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">DEF</div>
                        <div style="font-size:1rem; font-weight:700; color:#34d399;">${p[3]}</div>
                    </div>
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #a78bfa;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">MAT</div>
                        <div style="font-size:1rem; font-weight:700; color:#a78bfa;">${p[4]}</div>
                    </div>
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #38bdf8;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">MDF</div>
                        <div style="font-size:1rem; font-weight:700; color:#38bdf8;">${p[5]}</div>
                    </div>
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #facc15;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">AGI</div>
                        <div style="font-size:1rem; font-weight:700; color:#facc15;">${p[6]}</div>
                    </div>
                    <div class="stat-card-input" style="padding:5px 6px; border-left:2px solid #4ade80;">
                        <div style="font-size:0.68rem; color:var(--text-muted);">LUK</div>
                        <div style="font-size:1rem; font-weight:700; color:#4ade80;">${p[7]}</div>
                    </div>
                </div>

                <!-- Rewards -->
                <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:0.78rem; display:flex; justify-content:space-around;">
                    <div>
                        <span style="color:var(--text-muted);">EXP Reward:</span>
                        <strong style="color:#38bdf8; margin-left:4px;">${(enemy.exp || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                        <span style="color:var(--text-muted);">Gold Drop:</span>
                        <strong style="color:#facc15; margin-left:4px;">${(enemy.gold || 0).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function renderEnemyEditor(container, enemy) {
    ensureItemParams(enemy);
    const note = enemy.note || '';
    const lvlTag = getTagVal(note, 'Enemy Level', 'Party');
    const variance = getTagVal(note, 'Level Variance', '0');
    const minLvl = getTagVal(note, 'Minimum Level', '');
    const maxLvl = getTagVal(note, 'Maximum Level', '');
    const noLvlScale = hasTag(note, 'No Level Scaling');
    const noDiffScale = hasTag(note, 'No Difficulty Scaling');

    const paramGrowth = getTagVal(note, 'Param Growth', '');
    const expGrowth = getTagVal(note, 'EXP Growth', '');
    const goldGrowth = getTagVal(note, 'Gold Growth', '');

    const enemyType = getTagVal(note, 'NUSV Enemy Type', '') || getTagVal(note, 'Enemy Type', '');
    const enemyRank = getTagVal(note, 'NUSV Enemy Rank', 'Normal');
    const tier = getTagVal(note, 'NUSV Tier', '1');
    const element = getTagVal(note, 'NUSV Element', '');
    const weakness = getTagVal(note, 'NUSV Weakness', '');
    const classExp = getTagVal(note, 'Class EXP', '');
    const jp = getTagVal(note, 'JP', '');

    enemy.dropItems = enemy.dropItems || [
        { kind: 0, dataId: 1, denominator: 1 },
        { kind: 0, dataId: 1, denominator: 1 },
        { kind: 0, dataId: 1, denominator: 1 }
    ];
    enemy.actions = enemy.actions || [];

    container.innerHTML = `
        <!-- ENEMY IDENTITY & GRAPHICS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Pengaturan parameter tempur dan perilaku AI musuh">👾 Enemy: #${enemy.id} ${escapeHtml(enemy.name)}</h2>
                <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(enemyRank)} • Tier ${tier}</span>
            </div>
            <div class="card-body">
                <div class="grid-2">
                    <div>
                        <div class="form-group">
                            <label title="Nama musuh yang ditampilkan saat pertarungan">Enemy Name</label>
                            <input type="text" class="form-control" value="${escapeHtml(enemy.name || '')}" onchange="enemy.name=this.value; setUnsaved(true); renderSidebar();">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Jumlah pengalaman EXP yang diperoleh tim saat musuh ini berhasil dikalahkan">EXP Reward</label>
                                <input type="number" min="0" class="form-control" value="${enemy.exp || 0}" onchange="enemy.exp=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                            <div class="form-group">
                                <label title="Jumlah mata uang emas yang dijatuhkan saat musuh dikalahkan">Gold Reward</label>
                                <input type="number" min="0" class="form-control" value="${enemy.gold || 0}" onchange="enemy.gold=parseInt(this.value,10); setUnsaved(true);">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label title="Kategori ras monster (misal Beast, Undead, Demon, Humanoid)">Enemy Race Type</label>
                                <input type="text" class="form-control" placeholder="Beast, Undead, Demon..." value="${escapeHtml(enemyType)}" onchange="setTagVal(enemy, 'NUSV Enemy Type', this.value); setTagVal(enemy, 'Enemy Type', this.value);">
                            </div>
                            <div class="form-group">
                                <label title="Tingkatan ancaman musuh: Normal, Elite, Mini-Boss, World Boss, Raid Boss">Threat Rank</label>
                                <select class="form-control" onchange="setTagVal(enemy, 'NUSV Enemy Rank', this.value);">
                                    ${['Normal', 'Elite', 'Mini-Boss', 'Boss', 'World Boss'].map(r => `<option value="${r}" ${enemyRank === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="form-group" style="margin-bottom:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="margin-bottom:0;" title="Pilih gambar battler monster tempur samping (SV) dari folder img/sv_enemies/">⚔️ Select SV Battler Graphic</label>
                                <span id="enemyBattlerTypeBadge" class="badge" style="font-size:0.7rem; padding:2px 7px; background:#1e293b; color:#93c5fd; border:1px solid rgba(59, 130, 246, 0.4); border-radius:4px;">Detecting...</span>
                            </div>
                            <select id="enemyBattlerSelect" class="form-control" onchange="onEnemyBattlerChange(this.value)">
                                <option value="">(Kosong / No Battler)</option>
                                ${State.enemiesPics.map(e => {
                                    const clean = e.replace(/\.png$/i, '');
                                    return `<option value="${clean}" ${enemy.battlerName === clean ? 'selected' : ''}>${e}</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <!-- LIVE ANIMATED BATTLE STAGE CANVAS -->
                        <div class="enemy-battle-stage" style="position:relative; width:100%; height:160px; background:radial-gradient(ellipse at 50% 75%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 65%, rgba(2, 6, 23, 1) 100%); border:1px solid rgba(59, 130, 246, 0.3); border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 3px 12px rgba(0,0,0,0.6);">
                            <canvas id="enemyBattlerCanvas" width="400" height="180" style="width:100%; height:100%; image-rendering:pixelated; display:block;"></canvas>
                            
                            <div id="enemyBattlerEmpty" class="portrait-empty" style="display:none; color:var(--text-muted); font-size:0.85rem; text-align:center; position:absolute;">
                                <span>👾 Tidak ada gambar battler</span><br>
                                <span style="font-size:0.75rem; color:#64748b;">Pilih file battler pada daftar di atas</span>
                            </div>

                            <!-- Live Frame Indicator Badge (Top-Right) -->
                            <div id="enemyBattlerFrameIndicator" style="position:absolute; top:8px; right:8px; font-size:0.7rem; font-weight:600; padding:2px 8px; background:rgba(15, 23, 42, 0.85); color:#67e8f9; border:1px solid rgba(56, 189, 248, 0.35); border-radius:12px; pointer-events:none;">
                                Frame: 1 / 1
                            </div>

                            <!-- Image Dimensions Badge (Top-Left) -->
                            <div id="enemyBattlerDimIndicator" style="position:absolute; top:8px; left:8px; font-size:0.7rem; color:#94a3b8; background:rgba(15, 23, 42, 0.85); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.08); pointer-events:none;">
                                0 × 0
                            </div>
                        </div>

                        <!-- LIVE BATTLE CONTROLS & TAG CONFIGURATION -->
                        <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; gap:6px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
                                <div style="display:flex; gap:4px; align-items:center;">
                                    <button type="button" id="enemyAnimPlayPauseBtn" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:4px 8px;" onclick="toggleEnemyAnimPlayPause()" title="Jeda atau lanjutkan animasi">
                                        ⏸ Pause
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:4px 7px;" onclick="stepEnemyAnimFrame()" title="Maju 1 frame berikutnya">
                                        ⏭ Step
                                    </button>
                                </div>

                                <button type="button" id="enemyAnimMirrorBtn" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:4px 8px;" onclick="toggleEnemyFacingMirror()" title="Balik arah menghadap (Kanan / Kiri). Sinkron dengan tag <Sideview No Mirror>">
                                    ⇄ Facing: Kanan
                                </button>

                                <div style="display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--text-muted);">
                                    <span>Zoom:</span>
                                    <select id="enemyAnimScaleSelect" class="form-control" style="font-size:0.75rem; padding:2px 4px; height:24px; width:65px;" onchange="setEnemyAnimScale(this.value)">
                                        <option value="fit" selected>Fit</option>
                                        <option value="1">1x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Sideview Frames & Speed Parameters -->
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(0,0,0,0.25); padding:6px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                                <div class="form-group" style="margin-bottom:0;">
                                    <label style="font-size:0.7rem; color:var(--text-muted); margin-bottom:2px;" title="Jumlah frame animasi horizontal. Tag: <Sideview Frames: X>">Sideview Frames:</label>
                                    <input type="number" id="enemySvFramesInput" class="form-control" min="1" max="64" style="font-size:0.75rem; padding:2px 6px; height:26px;" value="${parseInt(getTagVal(enemy.note, 'Sideview Frames', '1')) || 1}" onchange="onEnemySvFramesChange(this.value)">
                                </div>
                                <div class="form-group" style="margin-bottom:0;">
                                    <label style="font-size:0.7rem; color:var(--text-muted); margin-bottom:2px;" title="Kecepatan pergantian frame dalam ticks (~60 FPS / X). Nilai standar: 8. Tag: <Sideview Frame Speed: X>">Frame Speed (ticks):</label>
                                    <input type="number" id="enemySvSpeedInput" class="form-control" min="1" max="60" style="font-size:0.75rem; padding:2px 6px; height:26px;" value="${parseInt(getTagVal(enemy.note, 'Sideview Frame Speed', '8')) || 8}" onchange="onEnemySvSpeedChange(this.value)">
                                </div>
                            </div>

                            <!-- 9x6 Motion Selector (Visible only when 9x6 SV battler sheet is detected) -->
                            <div id="enemySvMotionRow" style="display:none; align-items:center; gap:6px; background:rgba(59, 130, 246, 0.12); padding:4px 8px; border-radius:4px; border:1px solid rgba(59, 130, 246, 0.25);">
                                <label style="font-size:0.72rem; color:#93c5fd; margin-bottom:0; white-space:nowrap;">Motion Pose (9x6):</label>
                                <select id="enemySvMotionSelect" class="form-control" style="font-size:0.75rem; padding:2px 4px; height:24px;" onchange="onEnemySvMotionChange(this.value)">
                                    <option value="0">Walk / Idle (Row 0)</option>
                                    <option value="1">Wait / Standby (Row 1)</option>
                                    <option value="2">Chant / Ready (Row 2)</option>
                                    <option value="3">Guard (Row 3)</option>
                                    <option value="4">Damage (Row 4)</option>
                                    <option value="5">Evade (Row 5)</option>
                                    <option value="6">Thrust (Row 6)</option>
                                    <option value="7">Swing (Row 7)</option>
                                    <option value="8">Missile / Shoot (Row 8)</option>
                                    <option value="9">Skill (Row 9)</option>
                                    <option value="10">Spell (Row 10)</option>
                                    <option value="11">Item (Row 11)</option>
                                    <option value="12">Escape (Row 12)</option>
                                    <option value="13">Victory (Row 13)</option>
                                    <option value="14">Dying (Row 14)</option>
                                    <option value="15">Abnormal (Row 15)</option>
                                    <option value="16">Sleep (Row 16)</option>
                                    <option value="17">Dead / Fallen (Row 17)</option>
                                </select>
                            </div>
                        </div>
                    </div></div>
                </div>
            </div>
        </div>

        <!-- ENEMY BASE PARAMETERS -->
        <div class="card">
            <div class="card-header">
                <h2 title="Parameter tempur dasar musuh">📊 Enemy Base Parameters</h2>
                <span style="font-size:0.8rem; color:var(--text-muted);">Base combat parameter values for this enemy.</span>
            </div>
            <div class="card-body">
                <div class="stat-grid-8">
                    ${PARAM_DEFS.map(p => `
                        <div class="stat-card-input">
                            <label style="color:${p.color};">
                                <span>${p.icon} ${p.code}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${p.name}</span>
                            </label>
                            <input type="number" min="0" class="form-control" value="${enemy.params[p.id] || 0}" onchange="enemy.params[${p.id}]=parseInt(this.value,10)||0; setUnsaved(true);">
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        
        <!-- DROP ITEMS (3 SLOTS) -->
        <div class="card">
            <div class="card-header">
                <h2 title="Daftar barang rampasan yang dijatuhkan saat musuh ini dikalahkan">🎁 Drop Items (Spoils of War)</h2>
            </div>
            <div class="card-body">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width:10%;" title="Nomor slot drop (Slot 1, 2, atau 3)">Slot</th>
                            <th style="width:25%;" title="Kategori barang rampasan: Item biasa, Senjata, atau Pelindung/Zirah">Drop Kind</th>
                            <th style="width:40%;" title="Pilih barang spesifik yang dijatuhkan">Item Name</th>
                            <th style="width:25%;" title="Peluang drop 1 banding N (contoh: 1 = 100%, 2 = 50%, 10 = 10%)">Probability (1 / N)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[0, 1, 2].map(slotIdx => {
                            const d = enemy.dropItems[slotIdx] || { kind: 0, dataId: 1, denominator: 1 };
                            enemy.dropItems[slotIdx] = d;

                            let optionsHtml = '<option value="0">(None)</option>';
                            if (d.kind === 1) { // Item
                                optionsHtml += State.items.filter(it => it).map(it => `<option value="${it.id}" ${d.dataId === it.id ? 'selected' : ''}>#${it.id} ${escapeHtml(it.name)}</option>`).join('');
                            } else if (d.kind === 2) { // Weapon
                                optionsHtml += State.weapons.filter(w => w).map(w => `<option value="${w.id}" ${d.dataId === w.id ? 'selected' : ''}>#${w.id} ${escapeHtml(w.name)}</option>`).join('');
                            } else if (d.kind === 3) { // Armor
                                optionsHtml += State.armors.filter(a => a).map(a => `<option value="${a.id}" ${d.dataId === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('');
                            }

                            return `
                                <tr>
                                    <td style="font-weight:700; color:var(--accent);">Drop ${slotIdx + 1}</td>
                                    <td>
                                        <select class="form-control" onchange="enemy.dropItems[${slotIdx}].kind=parseInt(this.value); enemy.dropItems[${slotIdx}].dataId=1; setUnsaved(true); renderEditor();">
                                            <option value="0" ${d.kind === 0 ? 'selected' : ''}>None</option>
                                            <option value="1" ${d.kind === 1 ? 'selected' : ''}>Item</option>
                                            <option value="2" ${d.kind === 2 ? 'selected' : ''}>Weapon</option>
                                            <option value="3" ${d.kind === 3 ? 'selected' : ''}>Armor</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select class="form-control" ${d.kind === 0 ? 'disabled' : ''} onchange="enemy.dropItems[${slotIdx}].dataId=parseInt(this.value); setUnsaved(true);">
                                            ${optionsHtml}
                                        </select>
                                    </td>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:6px;">
                                            <span style="color:var(--text-muted); font-size:0.85rem;">1 /</span>
                                            <input type="number" min="1" max="1000" class="form-control" value="${d.denominator || 1}" ${d.kind === 0 ? 'disabled' : ''} onchange="enemy.dropItems[${slotIdx}].denominator=Math.max(1, parseInt(this.value) || 1); setUnsaved(true);">
                                            <span style="color:var(--text-muted); font-size:0.75rem;">(${Math.round(100 / (d.denominator || 1))}%)</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>


        <!-- ACTION PATTERNS (AI) -->
        <div class="card">
            <div class="card-header">
                <h2 title="Daftar pola aksi kecerdasan buatan (AI) musuh dalam pertarungan">⚔️ Enemy Action Patterns (AI)</h2>
                <button class="btn btn-secondary btn-sm" onclick="addEnemyAction();" title="Tambah pola aksi baru ke daftar kecerdasan buatan musuh">➕ Add Action Pattern</button>
            </div>
            <div class="card-body">
                <div style="overflow-x:auto;">
                    <table class="stat-table">
                        <thead>
                            <tr>
                                <th style="width:45%;">Skill yang Digunakan</th>
                                <th style="width:20%;">Rating Prioritas (1-9)</th>
                                <th style="width:25%;" title="Kondisi pemicu agar skill ini dipilih oleh AI musuh">Usage Condition</th>
                                <th style="width:10%; text-align:right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${enemy.actions.length === 0 ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:16px;">No action patterns configured. Click "+ Add Action Pattern" above.</td></tr>` : ''}
                            ${enemy.actions.map((act, i) => `
                                <tr>
                                    <td>
                                        <select class="form-control" style="padding:4px 8px; font-size:0.85rem;" onchange="enemy.actions[${i}].skillId=parseInt(this.value,10); setUnsaved(true);">
                                            ${State.skills.filter(s => s).map(s => `<option value="${s.id}" ${act.skillId === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" min="1" max="9" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${act.rating || 5}" onchange="enemy.actions[${i}].rating=parseInt(this.value,10); setUnsaved(true);">
                                    </td>
                                    <td>
                                        <div style="display:flex; flex-direction:column; gap:4px;">
                                            <select class="form-control" style="padding:4px 8px; font-size:0.82rem;" onchange="enemy.actions[${i}].conditionType=parseInt(this.value,10); setUnsaved(true); renderEditor();">
                                                <option value="0" ${act.conditionType === 0 ? 'selected' : ''}>0 - Selalu (Always)</option>
                                                <option value="1" ${act.conditionType === 1 ? 'selected' : ''}>1 - Berdasarkan Turn (A + B * X)</option>
                                                <option value="2" ${act.conditionType === 2 ? 'selected' : ''}>2 - By Enemy HP %</option>
                                                <option value="3" ${act.conditionType === 3 ? 'selected' : ''}>3 - By Enemy MP %</option>
                                                <option value="4" ${act.conditionType === 4 ? 'selected' : ''}>4 - When State Active</option>
                                                <option value="5" ${act.conditionType === 5 ? 'selected' : ''}>5 - By Party Level</option>
                                                <option value="6" ${act.conditionType === 6 ? 'selected' : ''}>6 - By Switch On</option>
                                            </select>
                                            <!-- Condition parameter inputs -->
                                            ${act.conditionType === 1 ? `
                                                <div style="display:flex; gap:4px; align-items:center; font-size:0.75rem;">
                                                    <span>Turn</span>
                                                    <input type="number" min="0" class="form-control" style="width:50px; padding:2px;" value="${act.conditionParam1||0}" onchange="enemy.actions[${i}].conditionParam1=parseInt(this.value,10); setUnsaved(true);">
                                                    <span>+</span>
                                                    <input type="number" min="0" class="form-control" style="width:50px; padding:2px;" value="${act.conditionParam2||0}" onchange="enemy.actions[${i}].conditionParam2=parseInt(this.value,10); setUnsaved(true);">
                                                    <span>* X</span>
                                                </div>
                                            ` : act.conditionType === 2 || act.conditionType === 3 ? `
                                                <div style="display:flex; gap:4px; align-items:center; font-size:0.75rem;">
                                                    <input type="number" min="0" max="100" class="form-control" style="width:55px; padding:2px;" value="${Math.round((act.conditionParam1||0)*100)}" onchange="enemy.actions[${i}].conditionParam1=parseInt(this.value,10)/100; setUnsaved(true);">
                                                    <span>% ~</span>
                                                    <input type="number" min="0" max="100" class="form-control" style="width:55px; padding:2px;" value="${Math.round((act.conditionParam2||1)*100)}" onchange="enemy.actions[${i}].conditionParam2=parseInt(this.value,10)/100; setUnsaved(true);">
                                                    <span>%</span>
                                                </div>
                                            ` : act.conditionType === 4 ? `
                                                <select class="form-control" style="padding:2px 4px; font-size:0.75rem;" onchange="enemy.actions[${i}].conditionParam1=parseInt(this.value,10); setUnsaved(true);">
                                                    ${State.states.filter(s => s).map(s => `<option value="${s.id}" ${act.conditionParam1 === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                                </select>
                                            ` : act.conditionType === 5 ? `
                                                <div style="display:flex; gap:4px; align-items:center; font-size:0.75rem;">
                                                    <span>Min Level:</span>
                                                    <input type="number" min="1" max="99" class="form-control" style="width:60px; padding:2px;" value="${act.conditionParam1||1}" onchange="enemy.actions[${i}].conditionParam1=parseInt(this.value,10); setUnsaved(true);">
                                                </div>
                                            ` : act.conditionType === 6 ? `
                                                <div style="display:flex; gap:4px; align-items:center; font-size:0.75rem;">
                                                    <span>Switch ID:</span>
                                                    <input type="number" min="1" class="form-control" style="width:70px; padding:2px;" value="${act.conditionParam1||1}" onchange="enemy.actions[${i}].conditionParam1=parseInt(this.value,10); setUnsaved(true);">
                                                </div>
                                            ` : ''}
                                        </div>
                                    </td>
                                    <td style="text-align:right;">
                                        <button class="btn btn-danger btn-sm" onclick="removeEnemyAction(${i});">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- LEVEL SCALING & HADIAH NUSVANIR -->
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h2 title="Pengaturan penyesuaian level musuh berdasarkan party pemain">📈 Enemy Level Scaling</h2></div>
                <div class="card-body">
                    <div class="form-group">
                        <label title="Metode penentuan level musuh: Tetap (Fixed), Skala Party, atau Rentang Level">Enemy Level Scaling Mode</label>
                        <input type="text" class="form-control" placeholder="Party, atau 10, atau 5 to 15" value="${escapeHtml(lvlTag)}" onchange="setTagVal(enemy, 'Enemy Level', this.value);">
                    </div>
                    <div class="grid-3">
                        <div class="form-group">
                            <label title="Variasi acak tingkat level musuh di sekitar level rata-rata party">Level Variance (±X)</label>
                            <input type="number" class="form-control" value="${variance}" onchange="setTagVal(enemy, 'Level Variance', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Batas level paling rendah yang mungkin dimiliki musuh ini">Minimum Level Floor</label>
                            <input type="number" class="form-control" value="${minLvl}" onchange="setTagVal(enemy, 'Minimum Level', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Batas level paling tinggi yang mungkin dicapai musuh ini">Maximum Level Cap</label>
                            <input type="number" class="form-control" value="${maxLvl}" onchange="setTagVal(enemy, 'Maximum Level', this.value);">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2 title="Hadiah pengalaman kelas, job points, dan drop batu jiwa monster">🎁 Nusvanir Special Rewards</h2></div>
                <div class="card-body">
                    <div class="grid-2">
                        <div class="form-group">
                            <label title="EXP kelas khusus yang diberikan musuh ini">Class EXP Reward</label>
                            <input type="number" class="form-control" placeholder="25" value="${classExp}" onchange="setTagVal(enemy, 'Class EXP', this.value);">
                        </div>
                        <div class="form-group">
                            <label title="Poin keahlian (JP) yang didapatkan party">Job Points (JP) Reward</label>
                            <input type="number" class="form-control" placeholder="20" value="${jp}" onchange="setTagVal(enemy, 'JP', this.value);">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- NOTETAG MENTAH -->
        ${renderTraitsCard(enemy, 'enemies')}

        <div class="card">
            <div class="card-header"><h2 title="Editor teks langsung untuk seluruh notetag">📝 Raw Notetags (Direct Edit)</h2></div>
            <div class="card-body">
                <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(enemy.note || '')}</textarea>
            </div>
        </div>
    `;

    // Initialize interactive animated SV battler preview
    setTimeout(() => {
        initEnemyBattlerAnimation(enemy);
    }, 0);
}



function addEnemyAction() {
    const enemy = State.enemies[State.selectedIndex];
    enemy.actions = enemy.actions || [];
    enemy.actions.push({ skillId: 1, rating: 5, conditionType: 0, conditionParam1: 0, conditionParam2: 0 });
    setUnsaved(true);
    renderEditor();
}



function removeEnemyAction(index) {
    const enemy = State.enemies[State.selectedIndex];
    if (enemy.actions && enemy.actions[index]) {
        enemy.actions.splice(index, 1);
        setUnsaved(true);
        renderEditor();
    }
}

// =====================================================================
// 8. STATES EDITOR
// =====================================================================


// =====================================================================
// LIVE ANIMATED ENEMY SV BATTLER CONTROLLER
// =====================================================================

let currentEnemyAnim = {
    rafId: null,
    img: null,
    imgSrc: '',
    frames: 1,
    rows: 1,
    speed: 8,
    type: 'static', // 'custom_strip' | 'mv_sv_actor' | 'static'
    motionIndex: 0,
    currentFrame: 0,
    lastTickTime: 0,
    isPlaying: true,
    isMirrored: false,
    scale: 'fit',
    naturalWidth: 0,
    naturalHeight: 0
};

/**
 * Stop any active animated enemy battler loop cleanly.
 */
function stopEnemyBattlerAnimation() {
    if (currentEnemyAnim.rafId) {
        cancelAnimationFrame(currentEnemyAnim.rafId);
        currentEnemyAnim.rafId = null;
    }
}

/**
 * Initialize and start the live animated SV battler preview.
 */
function initEnemyBattlerAnimation(enemy) {
    stopEnemyBattlerAnimation();

    const canvas = document.getElementById('enemyBattlerCanvas');
    const emptyEl = document.getElementById('enemyBattlerEmpty');
    const frameInd = document.getElementById('enemyBattlerFrameIndicator');
    const dimInd = document.getElementById('enemyBattlerDimIndicator');
    const typeBadge = document.getElementById('enemyBattlerTypeBadge');
    const motionRow = document.getElementById('enemySvMotionRow');
    const mirrorBtn = document.getElementById('enemyAnimMirrorBtn');
    const framesInput = document.getElementById('enemySvFramesInput');
    const speedInput = document.getElementById('enemySvSpeedInput');

    if (!canvas) return;

    if (!enemy || !enemy.battlerName) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (frameInd) frameInd.style.display = 'none';
        if (dimInd) dimInd.style.display = 'none';
        if (typeBadge) {
            typeBadge.textContent = 'Tanpa Battler';
            typeBadge.style.color = 'var(--text-muted)';
            typeBadge.style.borderColor = 'var(--border-color)';
        }
        if (motionRow) motionRow.style.display = 'none';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (frameInd) frameInd.style.display = 'block';
    if (dimInd) dimInd.style.display = 'block';

    const note = enemy.note || '';
    const noteFrames = parseInt(getTagVal(note, 'Sideview Frames', '0'), 10) || 0;
    const noteSpeed = parseInt(getTagVal(note, 'Sideview Frame Speed', '8'), 10) || 8;
    const noteRows = parseInt(getTagVal(note, 'Sideview Rows', '1'), 10) || 1;
    const hasNoMirror = hasTag(note, 'Sideview No Mirror') || hasTag(note, 'Sideview Facing Right');

    // Default mirror: In MV battles, enemies face right towards heroes.
    // If <Sideview No Mirror> is set, the sprite was already drawn facing right (e.g. boar), so do NOT mirror.
    // If not set, standard battlers facing left are mirrored horizontally.
    currentEnemyAnim.isMirrored = !hasNoMirror;
    if (mirrorBtn) {
        mirrorBtn.textContent = currentEnemyAnim.isMirrored ? '⇄ Facing: Mirrored (Kanan)' : '⇄ Facing: Asli (Kanan)';
    }

    currentEnemyAnim.speed = noteSpeed;
    if (speedInput) speedInput.value = noteSpeed;

    const img = new Image();
    const primarySrc = `img/sv_enemies/${encodeURIComponent(enemy.battlerName)}.png`;
    const fallbackSrc = `img/enemies/${encodeURIComponent(enemy.battlerName)}.png`;

    img.onload = () => {
        currentEnemyAnim.img = img;
        currentEnemyAnim.naturalWidth = img.naturalWidth;
        currentEnemyAnim.naturalHeight = img.naturalHeight;

        if (dimInd) {
            dimInd.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
        }

        // Auto-detect battler structure
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        if (noteFrames > 0) {
            currentEnemyAnim.type = 'custom_strip';
            currentEnemyAnim.frames = noteFrames;
            currentEnemyAnim.rows = noteRows || 1;
        } else if (w % 9 === 0 && h % 6 === 0 && (w / 9) === (h / 6)) {
            // Standard RPG Maker MV Sideview Actor Sheet (9 cols x 6 rows)
            currentEnemyAnim.type = 'mv_sv_actor';
            currentEnemyAnim.frames = 3;
            currentEnemyAnim.rows = 6;
        } else if (w / h >= 1.8) {
            // Single-row horizontal sprite strip
            const autoFrames = Math.max(1, Math.round(w / h));
            currentEnemyAnim.type = 'custom_strip';
            currentEnemyAnim.frames = autoFrames;
            currentEnemyAnim.rows = 1;
        } else {
            // Static single-frame battler
            currentEnemyAnim.type = 'static';
            currentEnemyAnim.frames = 1;
            currentEnemyAnim.rows = 1;
        }

        if (framesInput) {
            framesInput.value = currentEnemyAnim.frames;
        }

        // Update Type Badge & Controls
        if (typeBadge) {
            if (currentEnemyAnim.type === 'custom_strip') {
                typeBadge.textContent = `🎞️ Strip (${currentEnemyAnim.frames} F)`;
                typeBadge.style.color = '#67e8f9';
                typeBadge.style.borderColor = '#06b6d4';
            } else if (currentEnemyAnim.type === 'mv_sv_actor') {
                typeBadge.textContent = '⚔️ MV SV Actor (9×6)';
                typeBadge.style.color = '#a78bfa';
                typeBadge.style.borderColor = '#8b5cf6';
            } else {
                typeBadge.textContent = '🖼️ Static Battler';
                typeBadge.style.color = '#94a3b8';
                typeBadge.style.borderColor = 'rgba(255,255,255,0.15)';
            }
        }

        if (motionRow) {
            motionRow.style.display = currentEnemyAnim.type === 'mv_sv_actor' ? 'flex' : 'none';
        }

        currentEnemyAnim.isPlaying = true;
        currentEnemyAnim.currentFrame = 0;
        currentEnemyAnim.lastTickTime = performance.now();

        const playBtn = document.getElementById('enemyAnimPlayPauseBtn');
        if (playBtn) playBtn.textContent = '⏸ Pause';

        updateEnemyFrameBadge();
        startEnemyAnimLoop();
    };

    img.onerror = () => {
        if (img.src.includes('img/sv_enemies/')) {
            img.src = fallbackSrc;
        } else {
            if (emptyEl) {
                emptyEl.innerHTML = `<span>⚠️ Gagal memuat file: ${escapeHtml(enemy.battlerName)}.png</span>`;
                emptyEl.style.display = 'block';
            }
            if (typeBadge) {
                typeBadge.textContent = 'File Not Found';
                typeBadge.style.color = '#f87171';
                typeBadge.style.borderColor = '#ef4444';
            }
        }
    };

    img.src = primarySrc;
}

/**
 * Start or restart the continuous animation loop.
 */
function startEnemyAnimLoop() {
    stopEnemyBattlerAnimation();

    function loop(now) {
        const canvas = document.getElementById('enemyBattlerCanvas');
        if (!canvas || !currentEnemyAnim.img) {
            stopEnemyBattlerAnimation();
            return;
        }

        if (currentEnemyAnim.isPlaying && currentEnemyAnim.frames > 1) {
            // Tick duration in ms (where 1 tick at 60 FPS is ~16.67ms)
            const tickMs = Math.max(2, currentEnemyAnim.speed) * (1000 / 60);
            if (now - currentEnemyAnim.lastTickTime >= tickMs) {
                currentEnemyAnim.currentFrame++;
                currentEnemyAnim.lastTickTime = now;
                updateEnemyFrameBadge();
            }
        }

        renderEnemyBattlerFrame();
        currentEnemyAnim.rafId = requestAnimationFrame(loop);
    }

    currentEnemyAnim.rafId = requestAnimationFrame(loop);
}

/**
 * Render the current frame of the battler onto the canvas stage.
 */
function renderEnemyBattlerFrame() {
    const canvas = document.getElementById('enemyBattlerCanvas');
    if (!canvas || !currentEnemyAnim.img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const groundY = Math.floor(canvas.height * 0.84);
    const centerX = Math.floor(canvas.width * 0.5);

    let sx = 0, sy = 0, sw = currentEnemyAnim.naturalWidth, sh = currentEnemyAnim.naturalHeight;

    if (currentEnemyAnim.type === 'custom_strip') {
        const fIndex = currentEnemyAnim.currentFrame % Math.max(1, currentEnemyAnim.frames);
        sw = Math.floor(currentEnemyAnim.naturalWidth / Math.max(1, currentEnemyAnim.frames));
        sh = Math.floor(currentEnemyAnim.naturalHeight / Math.max(1, currentEnemyAnim.rows));
        sx = fIndex * sw;
        sy = 0;
    } else if (currentEnemyAnim.type === 'mv_sv_actor') {
        const motionIndex = currentEnemyAnim.motionIndex || 0;
        const patternSeq = [0, 1, 2, 1];
        const pattern = patternSeq[currentEnemyAnim.currentFrame % patternSeq.length];
        sw = Math.floor(currentEnemyAnim.naturalWidth / 9);
        sh = Math.floor(currentEnemyAnim.naturalHeight / 6);
        const cx = Math.floor(motionIndex / 6) * 3 + pattern;
        const cy = motionIndex % 6;
        sx = cx * sw;
        sy = cy * sh;
    }

    // Determine destination scale
    let scale = 1;
    if (currentEnemyAnim.scale === 'fit') {
        const maxW = canvas.width * 0.72;
        const maxH = canvas.height * 0.76;
        scale = Math.min(maxW / sw, maxH / sh, 1.85);
    } else {
        scale = parseFloat(currentEnemyAnim.scale) || 1;
    }

    const dw = Math.round(sw * scale);
    const dh = Math.round(sh * scale);
    const dx = Math.round(centerX - dw / 2);
    const dy = Math.max(8, Math.round(groundY - dh));

    // 1. Draw soft battler shadow ellipse
    const shadowRx = Math.min(Math.round(dw * 0.38), 90);
    const shadowRy = Math.max(5, Math.round(shadowRx * 0.28));
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 2, shadowRx, shadowRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // 2. Draw sprite frame
    ctx.save();
    if (currentEnemyAnim.isMirrored) {
        ctx.translate(centerX, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(currentEnemyAnim.img, sx, sy, sw, sh, -dw / 2, dy, dw, dh);
    } else {
        ctx.drawImage(currentEnemyAnim.img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
}

/**
 * Update the live frame badge in the top-right corner of the stage.
 */
function updateEnemyFrameBadge() {
    const badge = document.getElementById('enemyBattlerFrameIndicator');
    if (!badge) return;

    if (currentEnemyAnim.type === 'custom_strip') {
        const total = Math.max(1, currentEnemyAnim.frames);
        const curr = (currentEnemyAnim.currentFrame % total) + 1;
        badge.textContent = `Frame: ${curr} / ${total}`;
    } else if (currentEnemyAnim.type === 'mv_sv_actor') {
        const curr = (currentEnemyAnim.currentFrame % 4) + 1;
        badge.textContent = `Pose ${currentEnemyAnim.motionIndex} [${curr}/4]`;
    } else {
        badge.textContent = 'Static (1×1)';
    }
}

/**
 * Toggle Pause / Play on the preview animation.
 */
function toggleEnemyAnimPlayPause() {
    currentEnemyAnim.isPlaying = !currentEnemyAnim.isPlaying;
    const btn = document.getElementById('enemyAnimPlayPauseBtn');
    if (btn) {
        btn.textContent = currentEnemyAnim.isPlaying ? '⏸ Pause' : '▶ Play';
    }
}

/**
 * Advance animation by exactly one frame (useful when paused).
 */
function stepEnemyAnimFrame() {
    currentEnemyAnim.isPlaying = false;
    currentEnemyAnim.currentFrame++;
    const btn = document.getElementById('enemyAnimPlayPauseBtn');
    if (btn) btn.textContent = '▶ Play';
    updateEnemyFrameBadge();
    renderEnemyBattlerFrame();
}

/**
 * Toggle facing direction (mirror flip) and synchronize with <Sideview No Mirror> tag.
 */
function toggleEnemyFacingMirror() {
    const enemy = State.enemies[State.selectedIndex];
    if (!enemy) return;

    currentEnemyAnim.isMirrored = !currentEnemyAnim.isMirrored;

    const btn = document.getElementById('enemyAnimMirrorBtn');
    if (btn) {
        btn.textContent = currentEnemyAnim.isMirrored ? '⇄ Facing: Mirrored (Kanan)' : '⇄ Facing: Asli (Kanan)';
    }

    // If NOT mirrored, we add <Sideview No Mirror> so the game doesn't flip it.
    // If mirrored, we remove <Sideview No Mirror> so the game applies its default flip.
    if (!currentEnemyAnim.isMirrored) {
        setBoolTag(enemy, 'Sideview No Mirror', true);
    } else {
        setBoolTag(enemy, 'Sideview No Mirror', false);
    }

    setUnsaved(true);
    updateRawNoteTextarea();
    renderEnemyBattlerFrame();
}

/**
 * Set preview zoom scale (fit, 1x, 1.5x, 2x).
 */
function setEnemyAnimScale(scale) {
    currentEnemyAnim.scale = scale;
    renderEnemyBattlerFrame();
}

/**
 * User changed Sideview Frames input -> update animation & <Sideview Frames: X> tag.
 */
function onEnemySvFramesChange(val) {
    const enemy = State.enemies[State.selectedIndex];
    if (!enemy) return;
    const num = Math.max(1, parseInt(val, 10) || 1);
    currentEnemyAnim.frames = num;
    currentEnemyAnim.type = num > 1 ? 'custom_strip' : 'static';

    setTagVal(enemy, 'Sideview Frames', String(num));
    setUnsaved(true);
    updateRawNoteTextarea();

    const typeBadge = document.getElementById('enemyBattlerTypeBadge');
    if (typeBadge) {
        typeBadge.textContent = num > 1 ? `🎞️ Strip (${num} F)` : '🖼️ Static Battler';
    }

    updateEnemyFrameBadge();
    renderEnemyBattlerFrame();
}

/**
 * User changed Sideview Frame Speed input -> update animation speed & <Sideview Frame Speed: X> tag.
 */
function onEnemySvSpeedChange(val) {
    const enemy = State.enemies[State.selectedIndex];
    if (!enemy) return;
    const num = Math.max(1, parseInt(val, 10) || 8);
    currentEnemyAnim.speed = num;

    setTagVal(enemy, 'Sideview Frame Speed', String(num));
    setUnsaved(true);
    updateRawNoteTextarea();
}

/**
 * User changed motion pose for 9x6 SV Actor sheet.
 */
function onEnemySvMotionChange(val) {
    currentEnemyAnim.motionIndex = parseInt(val, 10) || 0;
    currentEnemyAnim.currentFrame = 0;
    updateEnemyFrameBadge();
    renderEnemyBattlerFrame();
}

/**
 * User changed battler graphic selection -> update enemy, sync tags, and reload animation.
 */
function onEnemyBattlerChange(battlerFile) {
    const enemy = State.enemies[State.selectedIndex];
    if (!enemy) return;

    const clean = battlerFile.replace(/\.png$/i, '');
    enemy.battlerName = clean;

    if (clean) {
        setTagVal(enemy, 'Sideview Battler', clean);
        setTagVal(enemy, 'Sideview Folder', 'sv_enemies');
    } else {
        setTagVal(enemy, 'Sideview Battler', '');
    }

    setUnsaved(true);
    renderSidebar();
    initEnemyBattlerAnimation(enemy);
    updateRawNoteTextarea();
}
