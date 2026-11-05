/**
 * NUSV Database Studio - Entity Editor: editors/animation_editor.js
 * Visual Frame & Cell Animation Studio for RPG Maker MV (Animations.json)
 */

const AnimEditor = {
    // Current runtime state
    activeAnim: null,
    currentFrameIndex: 0,
    selectedCellIndex: 0,

    // Playback state
    isPlaying: false,
    isLooping: true,
    playbackSpeed: 1.0,
    isMuted: false,
    rafId: null,
    tickCounter: 0,
    ticksPerFrame: 4, // 15 FPS at 60Hz tick

    // Canvas & Context
    canvas: null,
    ctx: null,
    WIDTH: 1080,
    HEIGHT: 720,

    // Display options
    showOnionSkin: true,
    targetSilhouette: 'actor', // 'actor' | 'enemy' | 'cross' | 'none'
    showCrosshair: true,

    // Drag & Drop State
    dragState: {
        isDragging: false,
        startX: 0,
        startY: 0,
        cellStartX: 0,
        cellStartY: 0
    },

    // Caches
    imageCache: {},

    getImage: function(src) {
        if (!this.imageCache[src]) {
            const img = new Image();
            img.src = src;
            this.imageCache[src] = img;
        }
        return this.imageCache[src];
    }
};

/**
 * Initialize / Start visual animation canvas
 */
AnimEditor.initCanvas = function(canvasEl, anim) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.activeAnim = anim;

    // Ensure frames array exists and is valid
    if (!anim.frames || anim.frames.length === 0) {
        anim.frames = [[[-1, 0, 0, 100, 0, 0, 255, 0]]];
    }
    if (this.currentFrameIndex >= anim.frames.length) {
        this.currentFrameIndex = 0;
    }
    if (this.selectedCellIndex >= (anim.frames[this.currentFrameIndex] || []).length) {
        this.selectedCellIndex = 0;
    }

    // Attach mouse drag & drop listeners
    this.setupCanvasInteractions();

    // Start render loop
    this.startLoop();
};

/**
 * Stop RAF loop
 */
AnimEditor.stop = function() {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
};

/**
 * Continuous 60fps render loop
 */
AnimEditor.startLoop = function() {
    this.stop();
    const self = this;

    function step() {
        if (!self.canvas || !self.ctx) return;
        if (self.isPlaying) {
            if (++self.tickCounter >= Math.max(1, Math.round(self.ticksPerFrame / (self.playbackSpeed || 1)))) {
                self.tickCounter = 0;
                self.stepFrame(1);
            }
        }
        self.render();
        self.rafId = requestAnimationFrame(step);
    }

    this.rafId = requestAnimationFrame(step);
};

/**
 * Step frame forward or backward
 */
AnimEditor.stepFrame = function(delta) {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    const total = this.activeAnim.frames.length;
    if (total === 0) return;

    let next = this.currentFrameIndex + delta;
    if (next >= total) {
        if (this.isLooping || this.isPlaying) {
            next = 0;
        } else {
            next = total - 1;
            this.isPlaying = false;
        }
    } else if (next < 0) {
        next = total - 1;
    }

    this.currentFrameIndex = next;

    // Process Timings (Sound SE / Flashes)
    if (this.isPlaying && this.activeAnim.timings) {
        for (const tm of this.activeAnim.timings) {
            if (tm.frame === this.currentFrameIndex) {
                if (!this.isMuted && tm.se && tm.se.name && typeof SkillAnimator !== 'undefined') {
                    SkillAnimator.playSe(tm.se.name, tm.se.volume, tm.se.pitch);
                }
            }
        }
    }

    this.updateTimelineUI();
};

/**
 * Mouse drag & drop interactions on canvas
 */
AnimEditor.setupCanvasInteractions = function() {
    const canvas = this.canvas;
    if (!canvas || canvas._hasAnimListeners) return;
    canvas._hasAnimListeners = true;

    const self = this;

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        return {
            x: Math.round(mouseX - (self.WIDTH / 2)),
            y: Math.round(mouseY - (self.HEIGHT / 2))
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        if (self.isPlaying) return;
        const coords = getCoords(e);
        const frame = (self.activeAnim.frames || [])[self.currentFrameIndex] || [];

        // Hit-test cells in reverse order (top to bottom)
        let hitIdx = -1;
        for (let i = frame.length - 1; i >= 0; i--) {
            const cell = frame[i];
            if (!cell || cell[0] < 0) continue;
            const cx = cell[1] || 0;
            const cy = cell[2] || 0;
            const scale = (cell[3] || 100) / 100;
            const hitRadius = 96 * scale;

            const dist = Math.hypot(coords.x - cx, coords.y - cy);
            if (dist <= hitRadius) {
                hitIdx = i;
                break;
            }
        }

        if (hitIdx !== -1) {
            self.selectedCellIndex = hitIdx;
            const cell = frame[hitIdx];
            self.dragState = {
                isDragging: true,
                startX: coords.x,
                startY: coords.y,
                cellStartX: cell[1] || 0,
                cellStartY: cell[2] || 0
            };
            self.updateCellInspectorUI();
        } else {
            self.dragState.isDragging = false;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!self.dragState.isDragging || !self.activeAnim) return;
        const coords = getCoords(e);
        const dx = coords.x - self.dragState.startX;
        const dy = coords.y - self.dragState.startY;

        const frame = (self.activeAnim.frames || [])[self.currentFrameIndex];
        if (!frame || !frame[self.selectedCellIndex]) return;

        const cell = frame[self.selectedCellIndex];
        cell[1] = Math.round(self.dragState.cellStartX + dx);
        cell[2] = Math.round(self.dragState.cellStartY + dy);

        // Update inspector input fields in real time
        const inX = document.getElementById('cellPosX');
        const inY = document.getElementById('cellPosY');
        if (inX) inX.value = cell[1];
        if (inY) inY.value = cell[2];

        if (typeof setUnsaved === 'function') setUnsaved(true);
    });

    window.addEventListener('mouseup', () => {
        self.dragState.isDragging = false;
    });
};

/**
 * Render animation frame on Canvas
 */
AnimEditor.render = function() {
    const ctx = this.ctx;
    const W = this.WIDTH;
    const H = this.HEIGHT;
    const originX = W / 2;
    const originY = H / 2;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // 1. Draw Checkerboard / Dark Arena Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Subtle Coordinate Grid
    if (this.showCrosshair) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += 48) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Major Crosshair (0, 0)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, H);
        ctx.moveTo(0, originY);
        ctx.lineTo(W, originY);
        ctx.stroke();
    }

    // 3. Draw Target Battler Silhouette
    this.drawTargetSilhouette(ctx, originX, originY);

    if (!this.activeAnim) {
        ctx.restore();
        return;
    }

    const anim = this.activeAnim;
    const frames = anim.frames || [];
    const currentFrame = frames[this.currentFrameIndex] || [];

    const img1 = anim.animation1Name ? this.getImage(`img/animations/${anim.animation1Name}.png`) : null;
    const img2 = anim.animation2Name ? this.getImage(`img/animations/${anim.animation2Name}.png`) : null;

    // 4. Draw Onion Skin (Previous Frame in Ghost Alpha)
    if (this.showOnionSkin && !this.isPlaying && this.currentFrameIndex > 0) {
        const prevFrame = frames[this.currentFrameIndex - 1] || [];
        ctx.save();
        for (const cell of prevFrame) {
            this.drawCell(ctx, cell, img1, img2, originX, originY, 0.22, false);
        }
        ctx.restore();
    }

    // 5. Draw Current Frame Cells
    for (let i = 0; i < currentFrame.length; i++) {
        const cell = currentFrame[i];
        const isSelected = (!this.isPlaying && i === this.selectedCellIndex);
        this.drawCell(ctx, cell, img1, img2, originX, originY, 1.0, isSelected);
    }

    // 6. Draw HUD info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(8, 8, 140, 24);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Frame ${this.currentFrameIndex + 1} / ${Math.max(1, frames.length)}`, 16, 24);

    ctx.restore();
};

/**
 * Draw Center Target Silhouette
 */
AnimEditor.drawTargetSilhouette = function(ctx, ox, oy) {
    if (this.targetSilhouette === 'none') return;

    if (this.targetSilhouette === 'actor') {
        const actorImg = this.getImage('img/sv_actors/Actor1_1.png');
        if (actorImg && actorImg.complete && actorImg.naturalWidth > 0) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            // Draw Harold in wait pose at center
            const cw = actorImg.naturalWidth / 9;
            const ch = actorImg.naturalHeight / 6;
            ctx.drawImage(actorImg, 0, 0, cw, ch, ox - cw / 2, oy - ch + 20, cw, ch);
            ctx.restore();
        }
    } else if (this.targetSilhouette === 'enemy') {
        const enemyImg = this.getImage('img/sv_enemies/Actor1_3.png');
        if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            const ew = Math.min(enemyImg.naturalWidth, 180);
            const eh = Math.min(enemyImg.naturalHeight, 180);
            ctx.drawImage(enemyImg, 0, 0, enemyImg.naturalWidth, enemyImg.naturalHeight, ox - ew / 2, oy - eh + 20, ew, eh);
            ctx.restore();
        }
    }

    // Origin Pivot Dot
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ox, oy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

/**
 * Draw Single Cell
 */
AnimEditor.drawCell = function(ctx, cell, img1, img2, originX, originY, alphaMult = 1.0, isSelected = false) {
    if (!cell) return;
    const pattern = cell[0];
    if (pattern < 0) return;

    const img = (pattern < 100) ? img1 : img2;
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cellW = 192;
    const cellH = 192;
    const subPattern = pattern % 100;
    const sx = (subPattern % 5) * cellW;
    const sy = Math.floor(subPattern / 5) * cellH;

    const x = originX + (cell[1] || 0);
    const y = originY + (cell[2] || 0);
    const scale = (cell[3] !== undefined ? cell[3] : 100) / 100;
    const rotation = ((cell[4] || 0) * Math.PI) / 180;
    const mirror = cell[5] ? -1 : 1;
    const opacity = ((cell[6] !== undefined ? cell[6] : 255) / 255) * alphaMult;
    const blendMode = cell[7] || 0;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (blendMode === 1) {
        ctx.globalCompositeOperation = 'lighter';
    } else if (blendMode === 2) {
        ctx.globalCompositeOperation = 'multiply';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale * mirror, scale);

    // Draw 192x192 centered
    ctx.drawImage(img, sx, sy, cellW, cellH, -cellW / 2, -cellH / 2, cellW, cellH);

    // If selected, draw selection bounding box & handles
    if (isSelected) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-cellW / 2, -cellH / 2, cellW, cellH);

        // Center cross
        ctx.setLineDash([]);
        ctx.strokeStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
};

/**
 * HTML Template for Animation Editor Workspace
 */
function renderAnimationEditor(container, anim) {
    if (!anim) {
        container.innerHTML = `<div class="empty-state">Pilih animasi dari sidebar untuk mengedit.</div>`;
        return;
    }

    const animImages = State.animationImages || [];
    const positionNames = { 0: 'Atas Kepala (Top/Head)', 1: 'Pusat Tubuh (Center)', 2: 'Bawah Kaki (Bottom/Feet)', 3: 'Layar Penuh (Screen)' };

    container.innerHTML = `
        <!-- HEADER IDENTITAS ANIMASI -->
        <div class="card" style="border:1px solid #f472b655; background:linear-gradient(180deg, rgba(80,7,36,0.35) 0%, rgba(15,23,42,0.6) 100%); margin-bottom:14px;">
            <div class="card-header" style="border-bottom:1px solid #f472b633; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.2rem;">💥</span>
                    <div>
                        <h2 style="font-size:1.05rem; color:#fbcfe8; margin:0;">Animation #${anim.id}: ${escapeHtml(anim.name || 'Unnamed')}</h2>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Visual Frame-by-Frame Spritesheet Animation Studio</div>
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="btn btn-sm btn-secondary" onclick="openAnimAutoFillModal()" title="Isi urutan frame otomatis dari potongan spritesheet">
                        🪄 Auto-Fill Urutan
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="openAnimBatchShiftModal()" title="Geser koordinat atau skala seluruh sel di semua frame">
                        ⚙️ Batch Modifiers
                    </button>
                    <button type="button" class="btn btn-sm" onclick="saveActiveDataset()" style="font-weight:700; background:linear-gradient(135deg, #ec4899 0%, #db2777 100%); color:#fff; border:1px solid #f472b6; box-shadow:0 0 12px rgba(236,72,153,0.35);" title="Simpan seluruh perubahan animasi langsung ke file database game (Animations.json)">
                        💾 Simpan ke Project
                    </button>
                </div>
            </div>

            <div class="card-body" style="padding:12px;">
                <div class="grid-3">
                    <div class="form-group" style="margin:0;">
                        <label title="Nama animasi">Animation Name</label>
                        <input type="text" class="form-control" value="${escapeHtml(anim.name || '')}" onchange="anim.name=this.value; setUnsaved(true); renderSidebar();">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="File gambar animasi 1 di folder img/animations/">Animation Graphic 1</label>
                        <select class="form-control" onchange="anim.animation1Name=this.value; setUnsaved(true); AnimEditor.render(); renderSidebar();">
                            <option value="">(None)</option>
                            ${animImages.map(f => {
                                const base = f.replace(/\.png$/i, '');
                                return `<option value="${base}" ${anim.animation1Name === base ? 'selected' : ''}>${base}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="Posisi penempatan animasi pada target">Target Position</label>
                        <select class="form-control" onchange="anim.position=parseInt(this.value,10); setUnsaved(true);">
                            ${Object.keys(positionNames).map(k => `<option value="${k}" ${anim.position === parseInt(k,10) ? 'selected' : ''}>${positionNames[k]}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- CANVAS STAGE & TIMELINE SCRUBBER -->
        <div class="card" style="margin-bottom:14px; overflow:hidden;">
            <div class="card-header" style="padding:8px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:0.75rem; color:#38bdf8; font-weight:700;">CANVAS STAGE</span>
                    <span id="animFrameBadge" class="badge" style="background:#0284c722; color:#38bdf8; border:1px solid #0284c755; font-size:0.7rem; padding:2px 8px;">Frame 1</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem;">
                    <label class="checkbox-label" style="font-size:0.72rem; margin:0;" title="Tampilkan bayangan frame sebelumnya untuk mempermudah perataan gerakan">
                        <input type="checkbox" ${AnimEditor.showOnionSkin ? 'checked' : ''} onchange="AnimEditor.showOnionSkin=this.checked; AnimEditor.render();">
                        <span>Ghost / Onion Skin</span>
                    </label>
                    <label class="checkbox-label" style="font-size:0.72rem; margin:0;">
                        <input type="checkbox" ${AnimEditor.showCrosshair ? 'checked' : ''} onchange="AnimEditor.showCrosshair=this.checked; AnimEditor.render();">
                        <span>Grid &amp; Origin</span>
                    </label>
                    <select class="form-control" style="width:auto; padding:2px 6px; font-size:0.72rem; height:auto;" onchange="AnimEditor.targetSilhouette=this.value; AnimEditor.render();">
                        <option value="actor" ${AnimEditor.targetSilhouette === 'actor' ? 'selected' : ''}>Siluet: Hero (Actor)</option>
                        <option value="enemy" ${AnimEditor.targetSilhouette === 'enemy' ? 'selected' : ''}>Siluet: Musuh (Enemy)</option>
                        <option value="none" ${AnimEditor.targetSilhouette === 'none' ? 'selected' : ''}>Siluet: Tanpa Siluet</option>
                    </select>
                </div>
            </div>

            <!-- Canvas Viewport -->
            <div style="position:relative; width:100%; aspect-ratio:3/2; max-height:480px; background:#000; display:flex; justify-content:center; align-items:center; overflow:hidden; border-radius:6px; box-shadow:inset 0 0 20px rgba(0,0,0,0.8);">
                <canvas id="animEditorCanvas" width="1080" height="720" style="width:100%; height:100%; display:block; cursor:crosshair; image-rendering:pixelated;"></canvas>
            </div>

            <!-- Playback & Frame Scrubber Bar -->
            <div style="padding:10px 14px; background:rgba(15,23,42,0.95); border-top:1px solid var(--border-color); display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button type="button" id="animPlayBtn" class="btn btn-sm btn-primary" onclick="AnimEditor.togglePlay()" style="padding:4px 12px; font-size:0.75rem;">
                            ${AnimEditor.isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.currentFrameIndex=0; AnimEditor.updateTimelineUI();" style="padding:4px 8px; font-size:0.75rem;" title="Ke Frame 1">⏮</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.stepFrame(-1)" style="padding:4px 8px; font-size:0.75rem;" title="Frame Sebelumnya">◀</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.stepFrame(1)" style="padding:4px 8px; font-size:0.75rem;" title="Frame Berikutnya">▶</button>
                        <button type="button" id="animLoopBtn" class="btn btn-sm btn-secondary" onclick="AnimEditor.toggleLoop()" style="padding:4px 8px; font-size:0.75rem;">
                            ${AnimEditor.isLooping ? '🔄 Loop: ON' : '🔄 Loop: OFF'}
                        </button>
                    </div>

                    <!-- Speed & SE -->
                    <div style="display:flex; gap:8px; align-items:center;">
                        <select class="form-control" style="width:auto; padding:2px 6px; font-size:0.75rem; height:auto;" onchange="AnimEditor.playbackSpeed=parseFloat(this.value);">
                            <option value="0.5">0.5x Slow</option>
                            <option value="1.0" selected>1.0x Normal</option>
                            <option value="1.5">1.5x Fast</option>
                            <option value="2.0">2.0x Turbo</option>
                        </select>
                        <button type="button" id="animMuteBtn" class="btn btn-sm btn-secondary" onclick="AnimEditor.toggleMute()" style="padding:4px 8px; font-size:0.75rem;">🔊 SE</button>
                    </div>

                    <!-- Frame Actions -->
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.addNewFrame()" style="padding:4px 8px; font-size:0.75rem; color:#34d399;" title="Tambah frame baru di posisi berikutnya">➕ Tambah Frame</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.cloneCurrentFrame()" style="padding:4px 8px; font-size:0.75rem;" title="Duplikasi seluruh sel di frame aktif ke frame baru">📋 Clone Frame</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.deleteCurrentFrame()" style="padding:4px 8px; font-size:0.75rem; color:#f87171;" title="Hapus frame aktif">🗑️ Hapus</button>
                    </div>
                </div>

                <!-- Horizontal Frame Thumb Scrubber -->
                <div id="animFrameStrip" style="display:flex; gap:4px; overflow-x:auto; padding:4px 0; max-width:100%; scrollbar-width:thin;">
                    <!-- Dynamically populated frame pills -->
                </div>
            </div>
        </div>

        <!-- CELL PROPERTIES & INSPECTOR -->
        <div id="animCellInspectorContainer">
            <!-- Dynamically populated cell inspector -->
        </div>

        <!-- CELL PATTERN PICKER MODAL -->
        <div id="animPatternPickerModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeAnimPatternPicker();">
            <div class="modal-card" style="max-width:900px; width:95vw; max-height:85vh;">
                <div class="modal-header">
                    <h3>🖼️ Pilih Potongan Sel dari Spritesheet</h3>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="closeAnimPatternPicker()">✕ Tutup</button>
                </div>
                <div class="modal-body" style="padding:14px; overflow:auto; max-height:70vh;">
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">
                        💡 Klik pada salah satu kotak sel berukuran 192×192 di bawah ini untuk memasukkannya ke sel yang sedang Anda pilih.
                    </div>
                    <div id="animSheetGridContainer" style="display:flex; justify-content:center;">
                        <!-- Dynamically populated sheet canvas -->
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const cvs = document.getElementById('animEditorCanvas');
        if (cvs) {
            AnimEditor.initCanvas(cvs, anim);
            AnimEditor.updateTimelineUI();
            AnimEditor.updateCellInspectorUI();
        }
    }, 40);
}

/**
 * Update the horizontal timeline frame scrubber strip
 */
AnimEditor.updateTimelineUI = function() {
    const strip = document.getElementById('animFrameStrip');
    const badge = document.getElementById('animFrameBadge');
    if (!this.activeAnim || !this.activeAnim.frames) return;

    const frames = this.activeAnim.frames;
    if (badge) {
        badge.textContent = `Frame ${this.currentFrameIndex + 1} / ${frames.length}`;
    }

    if (strip) {
        strip.innerHTML = frames.map((f, idx) => {
            const isSel = (idx === this.currentFrameIndex);
            const cellCount = (f || []).filter(c => c && c[0] >= 0).length;
            return `
                <button type="button" class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AnimEditor.currentFrameIndex=${idx}; AnimEditor.updateTimelineUI(); AnimEditor.updateCellInspectorUI();"
                        style="padding:3px 8px; font-size:0.72rem; min-width:44px; display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink:0;">
                    <span>F${idx + 1}</span>
                    <span style="font-size:0.62rem; color:${isSel ? '#fff' : 'var(--text-muted)'};">${cellCount} sel</span>
                </button>
            `;
        }).join('');

        // Ensure active frame button is in view
        const activeBtn = strip.children[this.currentFrameIndex];
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }
};

/**
 * Update the Cell Inspector UI panel for the active frame
 */
AnimEditor.updateCellInspectorUI = function() {
    const container = document.getElementById('animCellInspectorContainer');
    if (!container || !this.activeAnim || !this.activeAnim.frames) return;

    const frames = this.activeAnim.frames;
    const currentFrame = frames[this.currentFrameIndex] || [];

    if (this.selectedCellIndex >= currentFrame.length && currentFrame.length > 0) {
        this.selectedCellIndex = currentFrame.length - 1;
    }

    const cell = currentFrame[this.selectedCellIndex] || null;

    const blendNames = {
        0: '0: Normal',
        1: '1: Additive (Lighter / Kilau Bersinar)',
        2: '2: Multiply (Gelap / Shadow)',
        3: '3: Screen'
    };

    container.innerHTML = `
        <div class="card" style="border:1px solid var(--border-color); margin-bottom:14px;">
            <div class="card-header" style="padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:0.95rem;">🎯</span>
                    <div>
                        <strong style="color:#f8fafc; font-size:0.85rem;">Inspektor Sel (Frame #${this.currentFrameIndex + 1})</strong>
                        <span style="font-size:0.72rem; color:var(--text-muted); margin-left:6px;">${currentFrame.length} Sel Aktif</span>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.addCellToFrame()" style="color:#34d399; font-size:0.75rem; padding:4px 8px;">
                        ➕ Tambah Sel
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.cloneCurrentCell()" style="font-size:0.75rem; padding:4px 8px;">
                        📋 Clone
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.deleteCurrentCell()" style="color:#f87171; font-size:0.75rem; padding:4px 8px;">
                        🗑️ Hapus Sel
                    </button>
                </div>
            </div>

            <div class="card-body" style="padding:14px;">
                <!-- Cell Selector Tabs -->
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">
                    ${currentFrame.map((c, idx) => {
                        const isSel = (idx === this.selectedCellIndex);
                        const pat = c[0] >= 0 ? `P:${c[0]}` : 'Kosong';
                        return `
                            <button type="button" class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}" 
                                    onclick="AnimEditor.selectedCellIndex=${idx}; AnimEditor.updateCellInspectorUI(); AnimEditor.render();"
                                    style="padding:4px 10px; font-size:0.75rem;">
                                Sel #${idx + 1} (${pat})
                            </button>
                        `;
                    }).join('')}
                    ${currentFrame.length === 0 ? '<span style="color:var(--text-muted); font-size:0.8rem;">(Frame ini belum memiliki sel)</span>' : ''}
                </div>

                ${cell ? `
                    <!-- ACTIVE CELL FORM CONTROLS -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
                        
                        <!-- 1. PATTERN & GRAPHIC -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <strong style="font-size:0.8rem; color:#38bdf8;">1. Pola Sel (Spritesheet Pattern)</strong>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Nomor Pola (Pattern Index)</label>
                                <div style="display:flex; gap:6px;">
                                    <input type="number" id="cellPattern" min="-1" max="199" class="form-control" value="${cell[0]}" 
                                           onchange="cell[0]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render(); AnimEditor.updateTimelineUI();">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimPatternPicker()" style="white-space:nowrap; padding:4px 8px; font-size:0.75rem;" title="Buka modal spritesheet untuk memilih potongan sel">
                                        🖼️ Pilih Visual
                                    </button>
                                </div>
                            </div>
                            <div style="font-size:0.68rem; color:var(--text-muted);">
                                💡 Kotak sel 192×192 dihitung dari kiri ke kanan (0 s/d 99). Nilai -1 = Kosong.
                            </div>
                        </div>

                        <!-- 2. POSITION (X, Y) -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.8rem; color:#fbbf24;">2. Posisi (X, Y Offset)</strong>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="cell[1]=0; cell[2]=0; setUnsaved(true); AnimEditor.updateCellInspectorUI(); AnimEditor.render();" style="padding:1px 6px; font-size:0.68rem;">
                                    🎯 Reset (0, 0)
                                </button>
                            </div>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Posisi X (Horizontal)</label>
                                    <input type="number" id="cellPosX" min="-400" max="400" class="form-control" value="${cell[1] || 0}" 
                                           onchange="cell[1]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Posisi Y (Vertikal)</label>
                                    <input type="number" id="cellPosY" min="-400" max="400" class="form-control" value="${cell[2] || 0}" 
                                           onchange="cell[2]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                </div>
                            </div>
                            <div style="font-size:0.68rem; color:var(--text-muted);">
                                💡 Anda juga bisa langsung mengklik dan menggeser (drag) sel pada layar kanvas di atas!
                            </div>
                        </div>

                        <!-- 3. SCALE & ROTATION -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <strong style="font-size:0.8rem; color:#a78bfa;">3. Ukuran &amp; Rotasi</strong>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Ukuran Skala (%)</label>
                                    <input type="number" min="10" max="400" class="form-control" value="${cell[3] !== undefined ? cell[3] : 100}" 
                                           onchange="cell[3]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Rotasi Derajat (°)</label>
                                    <input type="number" min="0" max="360" class="form-control" value="${cell[4] || 0}" 
                                           onchange="cell[4]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                </div>
                            </div>
                            <div style="display:flex; gap:4px; margin-top:2px;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="cell[4]=0; setUnsaved(true); AnimEditor.updateCellInspectorUI(); AnimEditor.render();" style="flex:1; padding:2px; font-size:0.68rem;">0°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="cell[4]=90; setUnsaved(true); AnimEditor.updateCellInspectorUI(); AnimEditor.render();" style="flex:1; padding:2px; font-size:0.68rem;">90°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="cell[4]=180; setUnsaved(true); AnimEditor.updateCellInspectorUI(); AnimEditor.render();" style="flex:1; padding:2px; font-size:0.68rem;">180°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="cell[4]=270; setUnsaved(true); AnimEditor.updateCellInspectorUI(); AnimEditor.render();" style="flex:1; padding:2px; font-size:0.68rem;">270°</button>
                            </div>
                        </div>

                        <!-- 4. OPACITY, BLEND & MIRROR -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <strong style="font-size:0.8rem; color:#f472b6;">4. Tampilan &amp; Efek Visual</strong>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Opasitas (0 - 255)</label>
                                    <input type="number" min="0" max="255" class="form-control" value="${cell[6] !== undefined ? cell[6] : 255}" 
                                           onchange="cell[6]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Cermin (Flip Horizontal)</label>
                                    <label class="checkbox-label" style="font-size:0.75rem; margin-top:6px;">
                                        <input type="checkbox" ${cell[5] ? 'checked' : ''} onchange="cell[5]=this.checked ? 1 : 0; setUnsaved(true); AnimEditor.render();">
                                        <span>Mirror Horizontal</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Mode Campuran (Blend Mode)</label>
                                <select class="form-control" onchange="cell[7]=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                                    ${Object.keys(blendNames).map(k => `<option value="${k}" ${(cell[7] || 0) === parseInt(k,10) ? 'selected' : ''}>${blendNames[k]}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

/**
 * Right Sidebar Inspector (Timings SE & Flash, Info, Stats)
 */
function renderAnimationStatPreview(container, anim) {
    if (!anim) return;

    container.innerHTML = `
        <!-- SOUND SE & FLASH TIMINGS INSPECTOR -->
        <div class="card" style="margin-bottom:12px; border:1px solid #38bdf855; overflow:hidden;">
            <div class="card-header" style="padding:10px 14px; background:rgba(12,74,110,0.4); display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">🔊</span>
                    <div>
                        <div style="font-size:0.7rem; color:#38bdf8; font-weight:700;">TIMINGS &amp; AUDIO</div>
                        <h3 style="font-size:0.95rem; margin:0; color:#fff; font-weight:700;">Sound Effect &amp; Flash</h3>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick="AnimEditor.addTiming()" style="padding:3px 8px; font-size:0.72rem;">
                    ➕ Tambah
                </button>
            </div>

            <div class="card-body" style="padding:12px; display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto;">
                ${(anim.timings && anim.timings.length > 0) ? anim.timings.map((tm, idx) => {
                    const seName = tm.se ? tm.se.name : '';
                    return `
                        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="color:#facc15;">Frame #${(tm.frame || 0) + 1}</strong>
                                <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.deleteTiming(${idx})" style="padding:1px 6px; font-size:0.65rem; color:#f87171;">✕</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:var(--text-muted);">Audio SE:</span>
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span style="color:#38bdf8; font-weight:600;">${seName || '(Tanpa SE)'}</span>
                                    ${seName ? `<button type="button" class="btn btn-sm btn-secondary" onclick="SkillAnimator.playSe('${seName}')" style="padding:1px 6px; font-size:0.65rem;">🔊</button>` : ''}
                                </div>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">Flash Scope:</span>
                                <span>${['None', 'Target', 'Screen', 'Hide Target'][tm.flashScope] || 'None'} (${tm.flashDuration || 0}f)</span>
                            </div>
                        </div>
                    `;
                }).join('') : `
                    <div style="color:var(--text-muted); font-size:0.78rem; text-align:center; padding:12px;">
                        Belum ada timing suara atau flash layar pada animasi ini.
                    </div>
                `}
            </div>
        </div>

        <!-- QUICK SUMMARY CARD -->
        <div class="card" style="margin-bottom:0;">
            <div class="card-header" style="padding:10px 14px;">
                <div>
                    <div style="font-size:0.72rem; color:#f472b6; font-weight:700;">ANIMATION SUMMARY</div>
                    <h2 style="font-size:1.05rem; margin:2px 0 0 0; color:#fff;">#${anim.id} ${escapeHtml(anim.name || '')}</h2>
                </div>
            </div>
            <div class="card-body" style="padding:12px; display:flex; flex-direction:column; gap:8px; font-size:0.78rem;">
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">🎞️ Total Frames:</span>
                    <strong style="color:#38bdf8;">${(anim.frames || []).length} Frames</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">🖼️ Sheet 1:</span>
                    <strong style="color:#facc15;">${anim.animation1Name || '(None)'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">📍 Posisi:</span>
                    <strong style="color:#f8fafc;">${['Top', 'Center', 'Feet', 'Screen'][anim.position] || 'Center'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">⚡ Timings:</span>
                    <strong style="color:#4ade80;">${(anim.timings || []).length} Events</strong>
                </div>
            </div>
        </div>
    `;
}

/**
 * Playback Control functions
 */
AnimEditor.togglePlay = function() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('animPlayBtn');
    if (btn) btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
};

AnimEditor.toggleLoop = function() {
    this.isLooping = !this.isLooping;
    const btn = document.getElementById('animLoopBtn');
    if (btn) btn.textContent = this.isLooping ? '🔄 Loop: ON' : '🔄 Loop: OFF';
};

AnimEditor.toggleMute = function() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('animMuteBtn');
    if (btn) btn.textContent = this.isMuted ? '🔇 SE Muted' : '🔊 SE';
};

/**
 * Frame management
 */
AnimEditor.addNewFrame = function() {
    if (!this.activeAnim) return;
    this.activeAnim.frames = this.activeAnim.frames || [];
    // Insert new frame with default empty or copy of first cell
    this.activeAnim.frames.splice(this.currentFrameIndex + 1, 0, [[0, 0, 0, 100, 0, 0, 255, 0]]);
    this.currentFrameIndex++;
    this.selectedCellIndex = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
};

AnimEditor.cloneCurrentFrame = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    const cur = this.activeAnim.frames[this.currentFrameIndex] || [];
    const copy = JSON.parse(JSON.stringify(cur));
    this.activeAnim.frames.splice(this.currentFrameIndex + 1, 0, copy);
    this.currentFrameIndex++;
    this.selectedCellIndex = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
};

AnimEditor.deleteCurrentFrame = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    if (this.activeAnim.frames.length <= 1) {
        if (typeof showToast === 'function') showToast('Animasi harus memiliki minimal 1 frame!', 'error');
        return;
    }
    this.activeAnim.frames.splice(this.currentFrameIndex, 1);
    if (this.currentFrameIndex >= this.activeAnim.frames.length) {
        this.currentFrameIndex = this.activeAnim.frames.length - 1;
    }
    this.selectedCellIndex = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
};

/**
 * Cell management
 */
AnimEditor.addCellToFrame = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    const frame = this.activeAnim.frames[this.currentFrameIndex];
    if (!frame) return;
    frame.push([0, 0, 0, 100, 0, 0, 255, 0]);
    this.selectedCellIndex = frame.length - 1;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateCellInspectorUI();
    this.render();
};

AnimEditor.cloneCurrentCell = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    const frame = this.activeAnim.frames[this.currentFrameIndex];
    if (!frame || !frame[this.selectedCellIndex]) return;
    const copy = JSON.parse(JSON.stringify(frame[this.selectedCellIndex]));
    copy[1] = (copy[1] || 0) + 16; // offset slightly
    copy[2] = (copy[2] || 0) + 16;
    frame.push(copy);
    this.selectedCellIndex = frame.length - 1;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateCellInspectorUI();
    this.render();
};

AnimEditor.deleteCurrentCell = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    const frame = this.activeAnim.frames[this.currentFrameIndex];
    if (!frame) return;
    frame.splice(this.selectedCellIndex, 1);
    if (this.selectedCellIndex >= frame.length) {
        this.selectedCellIndex = Math.max(0, frame.length - 1);
    }
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateCellInspectorUI();
    this.render();
};

/**
 * Timing management
 */
AnimEditor.addTiming = function() {
    if (!this.activeAnim) return;
    this.activeAnim.timings = this.activeAnim.timings || [];
    this.activeAnim.timings.push({
        frame: this.currentFrameIndex,
        se: { name: 'Blow1', volume: 90, pitch: 100, pan: 0 },
        flashScope: 1, // Target
        flashColor: [255, 255, 255, 200],
        flashDuration: 5
    });
    if (typeof setUnsaved === 'function') setUnsaved(true);
    const prev = document.getElementById('statPreviewContainer');
    if (prev) renderAnimationStatPreview(prev, this.activeAnim);
};

AnimEditor.deleteTiming = function(idx) {
    if (!this.activeAnim || !this.activeAnim.timings) return;
    this.activeAnim.timings.splice(idx, 1);
    if (typeof setUnsaved === 'function') setUnsaved(true);
    const prev = document.getElementById('statPreviewContainer');
    if (prev) renderAnimationStatPreview(prev, this.activeAnim);
};

/**
 * Visual Spritesheet Pattern Picker Modal
 */
function openAnimPatternPicker() {
    const modal = document.getElementById('animPatternPickerModal');
    const container = document.getElementById('animSheetGridContainer');
    if (!modal || !container || !AnimEditor.activeAnim) return;

    const anim = AnimEditor.activeAnim;
    if (!anim.animation1Name) {
        if (typeof showToast === 'function') showToast('Pilih Animation Graphic 1 terlebih dahulu!', 'info');
        return;
    }

    const img = AnimEditor.getImage(`img/animations/${anim.animation1Name}.png`);
    img.onload = () => buildPatternGrid();
    if (img.complete && img.naturalWidth > 0) buildPatternGrid();

    function buildPatternGrid() {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const cellW = 192;
        const cellH = 192;
        const cols = 5;
        const rows = Math.ceil(h / cellH);
        const totalPatterns = cols * rows;

        // Render preview canvas with grid overlay
        const cvs = document.createElement('canvas');
        cvs.width = w;
        cvs.height = h;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Draw grid lines and index badges
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px sans-serif';

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const pat = r * cols + c;
                const x = c * cellW;
                const y = r * cellH;
                ctx.strokeRect(x, y, cellW, cellH);

                // Badge
                ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                ctx.fillRect(x + 4, y + 4, 38, 24);
                ctx.fillStyle = '#facc15';
                ctx.fillText(`#${pat}`, x + 8, y + 21);
            }
        }

        cvs.style.width = '100%';
        cvs.style.maxWidth = `${w}px`;
        cvs.style.height = 'auto';
        cvs.style.cursor = 'pointer';
        cvs.style.imageRendering = 'pixelated';

        cvs.onclick = (e) => {
            const rect = cvs.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * w;
            const clickY = ((e.clientY - rect.top) / rect.height) * h;
            const col = Math.floor(clickX / cellW);
            const row = Math.floor(clickY / cellH);
            const pat = row * cols + col;

            const frame = (AnimEditor.activeAnim.frames || [])[AnimEditor.currentFrameIndex];
            if (frame && frame[AnimEditor.selectedCellIndex]) {
                frame[AnimEditor.selectedCellIndex][0] = pat;
                if (typeof setUnsaved === 'function') setUnsaved(true);
                AnimEditor.updateCellInspectorUI();
                AnimEditor.render();
                closeAnimPatternPicker();
                if (typeof showToast === 'function') showToast(`Pola #${pat} dipilih!`, 'success');
            }
        };

        container.innerHTML = '';
        container.appendChild(cvs);
    }

    modal.style.display = 'flex';
}

function closeAnimPatternPicker() {
    const modal = document.getElementById('animPatternPickerModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Auto-Fill frames sequentially from spritesheet
 */
function openAnimAutoFillModal() {
    if (!AnimEditor.activeAnim) return;
    const anim = AnimEditor.activeAnim;
    const countStr = prompt(`Masukkan jumlah frame yang ingin dibuat secara otomatis berurutan dari spritesheet (misal: 12):`, '12');
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < 1 || count > 100) {
        alert('Jumlah frame harus antara 1 sampai 100');
        return;
    }

    anim.frames = [];
    for (let i = 0; i < count; i++) {
        anim.frames.push([
            [i, 0, 0, 100, 0, 0, 255, 0] // Pattern i, centered, 100% scale
        ]);
    }

    AnimEditor.currentFrameIndex = 0;
    AnimEditor.selectedCellIndex = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    AnimEditor.updateTimelineUI();
    AnimEditor.updateCellInspectorUI();
    AnimEditor.render();
    if (typeof renderSidebar === 'function') renderSidebar();
    if (typeof showToast === 'function') showToast(`Berhasil membuat ${count} frame berurutan dari pola 0 s/d ${count - 1}!`, 'success');
}

/**
 * Batch Modifier Modal: Shift coordinates or Scale all cells
 */
function openAnimBatchShiftModal() {
    if (!AnimEditor.activeAnim || !AnimEditor.activeAnim.frames) return;
    const anim = AnimEditor.activeAnim;
    const choice = prompt("Pilih operasi batch modifier:\n1. Geser Posisi X/Y Semua Sel\n2. Ubah Skala % Semua Sel\n\nKetik 1 atau 2:", "1");
    if (choice === "1") {
        const dxStr = prompt("Geser X sebesar berapa pixel? (misal: +20 atau -20):", "0");
        const dyStr = prompt("Geser Y sebesar berapa pixel? (misal: +20 atau -20):", "0");
        const dx = parseInt(dxStr, 10) || 0;
        const dy = parseInt(dyStr, 10) || 0;
        if (dx === 0 && dy === 0) return;

        for (const frame of anim.frames) {
            for (const cell of frame) {
                if (cell && cell[0] >= 0) {
                    cell[1] = (cell[1] || 0) + dx;
                    cell[2] = (cell[2] || 0) + dy;
                }
            }
        }
        if (typeof setUnsaved === 'function') setUnsaved(true);
        AnimEditor.updateCellInspectorUI();
        AnimEditor.render();
        if (typeof showToast === 'function') showToast(`Berhasil menggeser seluruh sel X:${dx}, Y:${dy}!`, 'success');
    } else if (choice === "2") {
        const scaleStr = prompt("Masukkan nilai skala persen baru untuk semua sel (misal: 120):", "100");
        const scale = parseInt(scaleStr, 10);
        if (isNaN(scale) || scale < 10) return;

        for (const frame of anim.frames) {
            for (const cell of frame) {
                if (cell && cell[0] >= 0) {
                    cell[3] = scale;
                }
            }
        }
        if (typeof setUnsaved === 'function') setUnsaved(true);
        AnimEditor.updateCellInspectorUI();
        AnimEditor.render();
        if (typeof showToast === 'function') showToast(`Berhasil mengubah skala seluruh sel menjadi ${scale}%!`, 'success');
    }
}

/**
 * Shortcut from Skill Editor: Open specific animation in Animation Studio
 */
function openAnimationInEditor(animId) {
    animId = parseInt(animId, 10) || 0;
    switchTab('animations');
    
    let targetIdx = -1;
    if (animId > 0 && Array.isArray(State.animations)) {
        targetIdx = State.animations.findIndex(a => a && a.id === animId);
    }
    
    if (targetIdx !== -1) {
        State.selectedIndex = targetIdx;
        if (!State.selectedIndices) State.selectedIndices = {};
        State.selectedIndices.animations = targetIdx;
        renderSidebar();
        renderEditor();
        if (typeof showToast === 'function') {
            showToast(`Membuka Animasi #${animId} di Visual Animation Studio...`, 'info');
        }
    } else {
        // Fallback to first available animation
        State.selectedIndex = 1;
        if (!State.selectedIndices) State.selectedIndices = {};
        State.selectedIndices.animations = 1;
        renderSidebar();
        renderEditor();
        if (typeof showToast === 'function') {
            if (animId <= 0) {
                showToast('Skill ini belum memiliki animasi visual (Tanpa Animasi). Membuka Animation Studio #1...', 'info');
            } else {
                showToast(`Animasi #${animId} tidak ditemukan. Membuka Animation Studio #1...`, 'warning');
            }
        }
    }
}

/**
 * Clean stop when navigating away
 */
function stopAnimationEditorLoop() {
    AnimEditor.stop();
}

if (typeof window !== 'undefined') {
    window.AnimEditor = AnimEditor;
}

