/**
 * NUSV Database Studio - Entity Editor: editors/animation_editor.js
 * Visual Frame & Cell Animation Studio for RPG Maker MV (Animations.json)
 */

const AnimEditor = {
    // Current runtime state
    activeAnim: null,
    currentFrameIndex: 0,
    selectedCellIndex: 0,
    previewBattlerId: 1,

    // Playback state
    isPlaying: false,
    isLooping: true,
    playbackSpeed: 1.0,
    isMuted: false,
    rafId: null,
    lastFrameTime: 0,
    tickAccumulator: 0,
    ticksPerFrame: 4, // 15 FPS at 60Hz tick

    // Canvas & Context
    canvas: null,
    ctx: null,
    WIDTH: 1080,
    HEIGHT: 720,

    // Display options
    showOnionSkin: true,
    targetSilhouette: 'actor', // 'actor' | 'enemy' | 'cross' | 'none'
    combatDirection: 'user_to_enemy', // 'user_to_enemy' (serang kiri, default) | 'enemy_to_user' (serang kanan) | 'raw_unmirrored'
    mirrorTarget: true,
    showCrosshair: true,
    visualEffects: { targetFlash: null, screenFlash: null, hideRemaining: 0 },
    frameTimingsProcessed: false,
    audioContext: null,

    isMirroredDirection: function() {
        if (this.combatDirection === 'user_to_enemy') return true;
        if (this.combatDirection === 'enemy_to_user') return false;
        if (this.combatDirection === 'raw_unmirrored') return false;
        return Boolean(this.mirrorTarget);
    },

    setCombatDirection: function(val) {
        this.combatDirection = val;
        this.mirrorTarget = (val === 'user_to_enemy');
        if (this.ctx) this.render();
    },

    getCellDimensions: function(anim) {
        const a = anim || this.activeAnim;
        const isCustom = Boolean(a && (a.cellWidth > 0 || a.cellHeight > 0 || (a.columns > 0 && a.columns !== 5)));
        const cols = (a && a.columns > 0) ? parseInt(a.columns, 10) : 5;
        const rows = (a && a.rows > 0) ? parseInt(a.rows, 10) : 0;
        const cellW = (a && a.cellWidth > 0) ? parseInt(a.cellWidth, 10) : 192;
        const cellH = (a && a.cellHeight > 0) ? parseInt(a.cellHeight, 10) : 192;
        const maxCells = (a && a.maxCells > 0) ? parseInt(a.maxCells, 10) : (rows > 0 ? cols * rows : (cols === 5 && cellW === 192 ? 100 : cols * 20));
        return { isCustom, cols, rows, cellW, cellH, maxCells };
    },

    autoDetectGrid: function(anim) {
        const a = anim || this.activeAnim;
        if (!a || !a.animation1Name) {
            if (typeof showToast === 'function') showToast('Pilih Animation Graphic 1 terlebih dahulu!', 'info');
            return;
        }
        const img = this.getImage(`img/animations/${a.animation1Name}.png`);
        const runDetect = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            if (!w || !h) return;

            if (w === 960 && h % 192 === 0) {
                a.columns = 5;
                a.rows = Math.floor(h / 192);
                a.cellWidth = 192;
                a.cellHeight = 192;
                a.maxCells = a.columns * a.rows;
            } else {
                let bestCols = 5;
                let bestRows = Math.max(1, Math.floor(h / 192));
                let bestW = 192;
                let bestH = 192;
                let bestDiff = 99999;

                for (let c = 1; c <= 32; c++) {
                    if (w % c !== 0) continue;
                    const cw = w / c;
                    for (let r = 1; r <= 32; r++) {
                        if (h % r !== 0) continue;
                        const ch = h / r;
                        const diff = Math.abs(cw - ch);
                        if (cw >= 24 && cw <= 512 && ch >= 24 && ch <= 512) {
                            if (diff < bestDiff) {
                                bestDiff = diff;
                                bestCols = c;
                                bestRows = r;
                                bestW = cw;
                                bestH = ch;
                            }
                        }
                    }
                }

                a.columns = bestCols;
                a.rows = bestRows;
                a.cellWidth = bestW;
                a.cellHeight = bestH;
                a.maxCells = bestCols * bestRows;
            }

            if (typeof setUnsaved === 'function') setUnsaved(true);
            this.updateGridSummaryUI();
            if (typeof renderEditor === 'function') renderEditor();
            if (typeof showToast === 'function') {
                showToast(`⚡ Auto-Detect: ${a.columns} Kolom × ${a.rows} Baris (${a.cellWidth}×${a.cellHeight} px/sel)!`, 'success');
            }
        };

        if (img.complete && img.naturalWidth > 0) {
            runDetect();
        } else {
            img.onload = runDetect;
        }
    },

    updateGridSummaryUI: function() {
        const dims = this.getCellDimensions();
        const infoTag = document.getElementById('animViewportInfo');
        if (infoTag) {
            infoTag.textContent = `1080×720 • ${dims.cellW}×${dims.cellH} px`;
        }
        const gridSummary = document.getElementById('animGridSummaryBadge');
        if (gridSummary) {
            const rowText = dims.rows > 0 ? `${dims.rows} Baris` : 'Auto Baris';
            gridSummary.textContent = `${dims.cols} Kolom × ${rowText} (${dims.cellW}×${dims.cellH} px) • Maks: ${dims.maxCells} sel`;
        }
    },

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
    },

    getImageWithHue: function(src, hue) {
        const offset = ((Number(hue) || 0) % 360 + 360) % 360;
        if (!offset) return this.getImage(src);

        const key = `${src}#hue-${offset}`;
        if (this.imageCache[key]) return this.imageCache[key];

        const source = this.getImage(src);
        const canvas = document.createElement('canvas');
        canvas.width = 0;
        canvas.height = 0;
        this.imageCache[key] = canvas;

        const renderHue = () => {
            if (!source.complete || source.naturalWidth === 0) return;
            canvas.width = source.naturalWidth;
            canvas.height = source.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(source, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const min = Math.min(r, g, b);
                const max = Math.max(r, g, b);
                const lightness = (min + max) / 2;
                const delta = max - min;
                let hueValue = 0;
                let saturation = 0;

                if (delta > 0) {
                    if (r === max) hueValue = 60 * (((g - b) / delta + 6) % 6);
                    else if (g === max) hueValue = 60 * ((b - r) / delta + 2);
                    else hueValue = 60 * ((r - g) / delta + 4);
                    saturation = delta / (255 - Math.abs(2 * lightness - 255));
                }

                hueValue = (hueValue + offset) % 360;
                const chroma = (255 - Math.abs(2 * lightness - 255)) * saturation;
                const x = chroma * (1 - Math.abs((hueValue / 60) % 2 - 1));
                const m = lightness - chroma / 2;
                let rgb;
                if (hueValue < 60) rgb = [chroma, x, 0];
                else if (hueValue < 120) rgb = [x, chroma, 0];
                else if (hueValue < 180) rgb = [0, chroma, x];
                else if (hueValue < 240) rgb = [0, x, chroma];
                else if (hueValue < 300) rgb = [x, 0, chroma];
                else rgb = [chroma, 0, x];

                pixels[i] = rgb[0] + m;
                pixels[i + 1] = rgb[1] + m;
                pixels[i + 2] = rgb[2] + m;
            }
            context.putImageData(imageData, 0, 0);
        };

        if (source.complete) renderHue();
        else source.addEventListener('load', renderHue, { once: true });
        return canvas;
    }
};

/**
 * Initialize / Start visual animation canvas
 */
AnimEditor.initCanvas = function(canvasEl, anim) {
    if (!canvasEl) return;
    if (this.activeAnim !== anim) {
        this.visualEffects = { targetFlash: null, screenFlash: null, hideRemaining: 0 };
        this.frameTimingsProcessed = false;
    }
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

AnimEditor.processFrameTimings = function(frameIndex) {
    if (!this.activeAnim) return;
    const timings = (this.activeAnim.timings || []).filter(timing => Number(timing.frame) === frameIndex);

    for (const timing of timings) {
        const color = Array.isArray(timing.flashColor) ? timing.flashColor : [255, 255, 255, 255];
        const duration = Math.max(0, Number(timing.flashDuration) || 0);
        const effect = {
            color: color,
            alpha: Math.max(0, Math.min(255, Number(color[3]) || 0)) / 255,
            opacity: Math.max(0, Math.min(255, Number(color[3]) || 0)) / 255,
            remaining: Math.max(1, duration),
            duration: Math.max(1, duration)
        };

        if (duration > 0 && Number(timing.flashScope) === 1) this.visualEffects.targetFlash = { ...effect };
        else if (duration > 0 && Number(timing.flashScope) === 2) this.visualEffects.screenFlash = { ...effect };
        else if (Number(timing.flashScope) === 3) {
            this.visualEffects.hideRemaining = duration || Math.max(1, this.activeAnim.frames.length - frameIndex);
        }

        if (!this.isMuted && timing.se && timing.se.name) {
            this.playTimingSE(timing.se);
        }
    }

    this.frameTimingsProcessed = true;
    this.render();
};

AnimEditor.advanceVisualEffects = function() {
    for (const key of ['targetFlash', 'screenFlash']) {
        const effect = this.visualEffects[key];
        if (!effect) continue;
        effect.remaining--;
        if (effect.remaining <= 0) {
            this.visualEffects[key] = null;
        } else {
            effect.opacity = effect.alpha * effect.remaining / effect.duration;
        }
    }
    if (this.visualEffects.hideRemaining > 0) this.visualEffects.hideRemaining--;
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

    function step(timestamp) {
        if (!self.canvas || !self.ctx) return;
        if (self.isPlaying) {
            if (self.lastFrameTime === 0) self.lastFrameTime = timestamp;
            const elapsed = Math.min(250, Math.max(0, timestamp - self.lastFrameTime));
            const frameDuration = (1000 / 60) * self.ticksPerFrame / (self.playbackSpeed || 1);
            self.lastFrameTime = timestamp;
            self.tickAccumulator += elapsed;
            while (self.tickAccumulator + 0.001 >= frameDuration) {
                self.tickAccumulator = Math.max(0, self.tickAccumulator - frameDuration);
                self.stepFrame(1);
                if (!self.isPlaying) break;
            }
        } else {
            self.lastFrameTime = timestamp;
            self.tickAccumulator = 0;
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

    if (this.isPlaying) {
        this.advanceVisualEffects();
        this.processFrameTimings(this.currentFrameIndex);
    } else {
        this.visualEffects = { targetFlash: null, screenFlash: null, hideRemaining: 0 };
        this.frameTimingsProcessed = false;
    }

    this.updateTimelineUI();
};

AnimEditor.selectFrame = function(frameIndex) {
    if (!this.activeAnim || !this.activeAnim.frames) return;
    this.currentFrameIndex = Math.max(0, Math.min(this.activeAnim.frames.length - 1, frameIndex));
    this.visualEffects = { targetFlash: null, screenFlash: null, hideRemaining: 0 };
    this.frameTimingsProcessed = false;
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
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
        const origin = self.getPreviewOrigin();
        return {
            x: Math.round(mouseX - origin.x),
            y: Math.round(mouseY - origin.y)
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        if (self.isPlaying) return;
        const coords = getCoords(e);
        const frame = (self.activeAnim.frames || [])[self.currentFrameIndex] || [];

        // Hit-test cells in reverse order (top to bottom)
        let hitIdx = -1;
        const dims = self.getCellDimensions();
        const hitRadiusBase = Math.max(dims.cellW, dims.cellH) / 2;
        const targetMirror = self.isMirroredDirection() ? -1 : 1;
        for (let i = frame.length - 1; i >= 0; i--) {
            const cell = frame[i];
            if (!cell || cell[0] < 0) continue;
            const cx = (cell[1] || 0) * targetMirror;
            const cy = cell[2] || 0;
            const scale = (cell[3] || 100) / 100;
            const hitRadius = hitRadiusBase * scale;

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

        const targetMirror = self.isMirroredDirection() ? -1 : 1;
        const cell = frame[self.selectedCellIndex];
        cell[1] = Math.round(self.dragState.cellStartX + dx * targetMirror);
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

AnimEditor.getPreviewOrigin = function() {
    const centerX = this.WIDTH / 2;
    const centerY = this.HEIGHT / 2;
    const position = Number(this.activeAnim && this.activeAnim.position);

    if (position === 3) {
        return { x: centerX, y: centerY };
    }

    const battler = this.ensurePreviewBattler();
    const targetImage = battler ? this.getImage(battler.imagePath) : null;
    const targetHeight = targetImage && targetImage.complete && targetImage.naturalHeight > 0
        ? Math.min(targetImage.naturalHeight / battler.rows, 180)
        : (this.targetSilhouette === 'enemy' ? 180 : 64);

    const targetBaseY = centerY + 20;
    let y = targetBaseY;
    if (position === 0) {
        y -= targetHeight;
    } else if (position === 1) {
        y -= targetHeight / 2;
    }

    return { x: centerX, y: y };
};

AnimEditor.getPreviewBattlers = function() {
    if (this.targetSilhouette === 'actor') {
        return (State.actors || []).filter(actor => actor && actor.id > 0 && actor.battlerName).map(actor => ({
            id: actor.id,
            name: actor.name || `Actor ${actor.id}`,
            imagePath: `img/sv_actors/${actor.battlerName}.png`,
            columns: 9,
            rows: 6
        }));
    }
    if (this.targetSilhouette === 'enemy') {
        return (State.enemies || []).filter(enemy => enemy && enemy.id > 0).map(enemy => {
            const imageName = getTagVal(enemy.note, 'Sideview Battler', '').split(/[|,]/)[0].trim();
            if (!imageName) return null;
            const folder = getTagVal(enemy.note, 'Sideview Folder', 'sv_actors') || 'sv_actors';
            const frameCount = parseInt(getTagVal(enemy.note, 'Sideview Frames', '0'), 10) || 0;
            const rows = frameCount > 0 ? (parseInt(getTagVal(enemy.note, 'Sideview Rows', '1'), 10) || 1) : 6;
            return {
                id: enemy.id,
                name: enemy.name || `Enemy ${enemy.id}`,
                imagePath: `img/${folder}/${imageName}.png`,
                columns: frameCount > 0 ? frameCount : 9,
                rows: rows
            };
        }).filter(Boolean);
    }
    return [];
};

AnimEditor.ensurePreviewBattler = function() {
    const battlers = this.getPreviewBattlers();
    if (!battlers.some(battler => battler.id === Number(this.previewBattlerId))) {
        this.previewBattlerId = battlers.length ? battlers[0].id : 0;
    }
    return battlers.find(battler => battler.id === Number(this.previewBattlerId)) || null;
};

AnimEditor.findBattlePreviewSkills = function(targetAnim) {
    const anim = targetAnim || this.activeAnim || (State.animations || [])[State.selectedIndices?.animations || State.selectedIndex];
    if (!anim) return [];
    const animId = Number(anim.id);
    return (State.skills || []).filter(skill => {
        if (!skill || skill.id <= 0) return false;
        if (Number(skill.animationId) === animId) return true;
        const note = skill.note || '';
        return new RegExp(`animation\\s+${animId}:`, 'i').test(note) || new RegExp(`<Cast Animation:\\s*${animId}>`, 'i').test(note);
    });
};

AnimEditor.findBattlePreviewSkill = function(targetAnim) {
    const list = this.findBattlePreviewSkills(targetAnim);
    return list.length > 0 ? list[0] : null;
};

AnimEditor.navigateToSkillBattlePreview = function(skill) {
    if (!skill) return;
    this.closeSkillSelectModal();
    State.selectedIndices = State.selectedIndices || {};
    State.selectedIndices.skills = skill.id;
    State.selectedIndex = skill.id;
    switchTab('skills');
    if (typeof openBattlePreviewModal === 'function') {
        openBattlePreviewModal(skill.id);
    }
};

AnimEditor.openBattlePreview = function(skillId) {
    if (skillId) {
        const skill = (State.skills || [])[skillId];
        if (skill) {
            this.navigateToSkillBattlePreview(skill);
            return;
        }
    }
    const anim = this.activeAnim || (State.animations || [])[State.selectedIndices?.animations || State.selectedIndex];
    const skills = this.findBattlePreviewSkills(anim);
    if (skills.length === 0) {
        if (typeof showToast === 'function') showToast(`Tidak ada skill yang memakai Animation #${anim?.id}.`, 'info');
        return;
    }
    if (skills.length === 1) {
        this.navigateToSkillBattlePreview(skills[0]);
        return;
    }
    this.showSkillSelectModal(skills);
};

AnimEditor.showSkillSelectModal = function(skills) {
    let modal = document.getElementById('animSkillSelectModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'animSkillSelectModal';
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) AnimEditor.closeSkillSelectModal(); };
        document.body.appendChild(modal);
    }
    const anim = this.activeAnim || (State.animations || [])[State.selectedIndices?.animations || State.selectedIndex];
    const animId = anim ? anim.id : 0;
    const animName = anim ? anim.name : '';
    modal.innerHTML = `
        <div class="modal-card" style="width: 520px; max-width: 92vw;">
            <div class="modal-header">
                <h3>🎮 Pilih Skill untuk Preview Battle Sequence</h3>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.closeSkillSelectModal()">✕</button>
            </div>
            <div class="modal-body" style="padding: 16px; max-height: 60vh; overflow-y: auto; display: block;">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                    Ditemukan <strong style="color:#f8fafc;">${skills.length}</strong> skill yang menggunakan Animation #${animId} (<em>${escapeHtml(animName)}</em>):
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${skills.map(s => {
                        const iconOffset = s.iconIndex ? `-${(s.iconIndex % 16) * 24}px -${Math.floor(s.iconIndex / 16) * 24}px` : '0 0';
                        const iconHtml = s.iconIndex 
                            ? `<span style="display:inline-block; width:24px; height:24px; vertical-align:middle; background:url('img/system/IconSet.png') ${iconOffset} / calc(24px * 16) no-repeat; image-rendering:pixelated;"></span>`
                            : '✨';
                        return `
                            <button type="button" class="btn btn-secondary" style="text-align: left; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(30,41,59,0.7); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;"
                                    onclick="AnimEditor.openBattlePreview(${s.id})">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span>${iconHtml}</span>
                                    <div>
                                        <div style="font-weight: 600; color: #f8fafc; font-size: 0.9rem;">#${s.id} ${escapeHtml(s.name || 'Unnamed')}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(s.description || '')}</div>
                                    </div>
                                </div>
                                <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 600;">Buka ➔</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="modal-footer" style="padding: 10px 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.closeSkillSelectModal()">Batal</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

AnimEditor.closeSkillSelectModal = function() {
    const modal = document.getElementById('animSkillSelectModal');
    if (modal) modal.style.display = 'none';
};

/**
 * Render animation frame on Canvas
 */
AnimEditor.render = function() {
    if (!this.ctx) {
        this.canvas = document.getElementById('animEditorCanvas');
        if (this.canvas) this.ctx = this.canvas.getContext('2d');
    }
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W = this.WIDTH;
    const H = this.HEIGHT;
    const originX = W / 2;
    const originY = H / 2;
    const previewOrigin = this.getPreviewOrigin();

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
        ctx.moveTo(previewOrigin.x, 0);
        ctx.lineTo(previewOrigin.x, H);
        ctx.moveTo(0, previewOrigin.y);
        ctx.lineTo(W, previewOrigin.y);
        ctx.stroke();
    }

    // 3. Draw Target Battler Silhouette
    this.drawTargetSilhouette(ctx, originX, originY);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(previewOrigin.x, previewOrigin.y, 3, 0, Math.PI * 2);
    ctx.fill();

    if (!this.activeAnim) {
        ctx.restore();
        return;
    }

    const anim = this.activeAnim;
    const frames = anim.frames || [];
    const currentFrame = frames[this.currentFrameIndex] || [];

    const img1 = anim.animation1Name
        ? this.getImageWithHue(`img/animations/${anim.animation1Name}.png`, anim.animation1Hue)
        : null;
    const img2 = anim.animation2Name
        ? this.getImageWithHue(`img/animations/${anim.animation2Name}.png`, anim.animation2Hue)
        : null;

    // 4. Draw Onion Skin (Previous Frame in Ghost Alpha)
    if (this.showOnionSkin && !this.isPlaying && this.currentFrameIndex > 0) {
        const prevFrame = frames[this.currentFrameIndex - 1] || [];
        ctx.save();
        for (const cell of prevFrame) {
            this.drawCell(ctx, cell, img1, img2, previewOrigin.x, previewOrigin.y, 0.22, false);
        }
        ctx.restore();
    }

    // 5. Draw Current Frame Cells
    for (let i = 0; i < currentFrame.length; i++) {
        const cell = currentFrame[i];
        const isSelected = (!this.isPlaying && i === this.selectedCellIndex);
        this.drawCell(ctx, cell, img1, img2, previewOrigin.x, previewOrigin.y, 1.0, isSelected);
    }

    const screenFlash = this.visualEffects.screenFlash;
    if (screenFlash && screenFlash.opacity > 0) {
        ctx.fillStyle = `rgba(${screenFlash.color[0]}, ${screenFlash.color[1]}, ${screenFlash.color[2]}, ${screenFlash.opacity})`;
        ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
};

/**
 * Draw Center Target Silhouette
 */
AnimEditor.drawTargetSilhouette = function(ctx, ox, oy) {
    if (this.targetSilhouette === 'none' || this.visualEffects.hideRemaining > 0) return;

    const battler = this.ensurePreviewBattler();
    if (!battler) return;
    const targetImage = this.getImage(battler.imagePath);
    if (!targetImage || !targetImage.complete || targetImage.naturalWidth === 0) return;

    const frameWidth = targetImage.naturalWidth / battler.columns;
    const frameHeight = targetImage.naturalHeight / battler.rows;
    const baseY = oy + 20;

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(ox, baseY);

    // In Sideview combat:
    // - Actor stands on right side facing LEFT towards oncoming attacks (facing = 1)
    // - Enemy stands on left side facing RIGHT towards oncoming attacks (facing = -1)
    const battlerFacing = (this.targetSilhouette === 'enemy') ? -1 : 1;
    ctx.scale(battlerFacing, 1);
    ctx.drawImage(targetImage, 0, 0, frameWidth, frameHeight, -frameWidth / 2, -frameHeight, frameWidth, frameHeight);

    const flash = this.visualEffects.targetFlash;
    if (flash && flash.opacity > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = flash.opacity;
        ctx.fillStyle = `rgb(${flash.color[0]}, ${flash.color[1]}, ${flash.color[2]})`;
        ctx.fillRect(-frameWidth / 2, -frameHeight, frameWidth, frameHeight);
    }
    ctx.restore();
};

/**
 * Draw Single Cell
 */
AnimEditor.drawCell = function(ctx, cell, img1, img2, originX, originY, alphaMult = 1.0, isSelected = false) {
    if (!cell) return;
    const pattern = cell[0];
    if (pattern < 0) return;

    const dims = this.getCellDimensions();
    const cellW = dims.cellW;
    const cellH = dims.cellH;
    const cols = dims.cols;
    const maxCells = dims.maxCells;

    const isSheet2 = (pattern >= maxCells);
    const subPattern = isSheet2 ? (pattern - maxCells) : pattern;
    const img = isSheet2 ? img2 : img1;
    const isHueCanvas = img instanceof HTMLCanvasElement;
    if (!img || (isHueCanvas ? img.width === 0 : !img.complete || img.naturalWidth === 0)) return;

    const sx = (subPattern % cols) * cellW;
    const sy = Math.floor(subPattern / cols) * cellH;

    const targetMirror = this.isMirroredDirection() ? -1 : 1;
    const x = originX + (cell[1] || 0) * targetMirror;
    const y = originY + (cell[2] || 0);
    const scale = (cell[3] !== undefined ? cell[3] : 100) / 100;
    const rotation = ((cell[4] || 0) * targetMirror * Math.PI) / 180;
    const mirror = (cell[5] ? -1 : 1) * targetMirror;
    const opacity = ((cell[6] !== undefined ? cell[6] : 255) / 255) * alphaMult;
    const blendMode = cell[7] || 0;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (blendMode === 1) {
        ctx.globalCompositeOperation = 'lighter';
    } else if (blendMode === 2) {
        ctx.globalCompositeOperation = 'multiply';
    } else if (blendMode === 3) {
        ctx.globalCompositeOperation = 'screen';
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
    const dims = AnimEditor.getCellDimensions(anim);

    container.innerHTML = `
        <!-- HEADER IDENTITAS ANIMASI & ASET -->
        <div class="card" style="border:1px solid #f472b655; background:linear-gradient(180deg, rgba(80,7,36,0.35) 0%, rgba(15,23,42,0.6) 100%); margin-bottom:14px;">
            <div class="card-header" style="border-bottom:1px solid #f472b633; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.2rem;">💥</span>
                    <div>
                        <h2 style="font-size:1.05rem; color:#fbcfe8; margin:0;">Animation #${anim.id}: ${escapeHtml(anim.name || 'Unnamed')}</h2>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Visual Frame-by-Frame Spritesheet Animation Studio</div>
                    </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="btn btn-sm btn-secondary" onclick="openAnimAutoFillModal()" title="Isi urutan frame otomatis dari potongan spritesheet">
                        🪄 Auto-Fill Urutan
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="openAnimBatchShiftModal()" title="Geser koordinat atau skala seluruh sel di semua frame">
                        ⚙️ Batch Modifiers
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.openBattlePreview()" title="Buka sequence skill yang menggunakan animasi ini di Battle Preview">
                        🎮 Preview di Battle Sequence
                    </button>
                    <button type="button" class="btn btn-sm" onclick="saveActiveDataset()" style="font-weight:700; background:linear-gradient(135deg, #ec4899 0%, #db2777 100%); color:#fff; border:1px solid #f472b6; box-shadow:0 0 12px rgba(236,72,153,0.35);" title="Simpan seluruh perubahan animasi langsung ke file database game (Animations.json)">
                        💾 Simpan ke Project
                    </button>
                </div>
            </div>

            <div class="card-body" style="padding:14px; display:flex; flex-direction:column; gap:12px;">
                <!-- Row 1: Core Graphic & Placement Assets -->
                <div class="grid-3" style="gap:10px;">
                    <div class="form-group" style="margin:0;">
                        <label title="Nama animasi">Nama Animasi (Name)</label>
                        <input type="text" class="form-control" value="${escapeHtml(anim.name || '')}" onchange="anim.name=this.value; setUnsaved(true); renderSidebar();">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="File gambar animasi 1 di folder img/animations/">Animation Graphic 1 (Utama)</label>
                        <select class="form-control" onchange="anim.animation1Name=this.value; setUnsaved(true); AnimEditor.autoDetectGrid(anim); AnimEditor.render(); renderSidebar();">
                            <option value="">(None)</option>
                            ${animImages.map(f => {
                                const base = f.replace(/\.png$/i, '');
                                return `<option value="${base}" ${anim.animation1Name === base ? 'selected' : ''}>${base}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="Hue bitmap pertama sesuai Bitmap.rotateHue RPG Maker MV">Graphic 1 Hue (°)</label>
                        <input type="number" min="0" max="359" class="form-control" value="${anim.animation1Hue || 0}" onchange="anim.animation1Hue=parseInt(this.value,10)||0; setUnsaved(true); AnimEditor.render();">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="Posisi penempatan animasi pada target">Posisi Target (Position)</label>
                        <select class="form-control" onchange="anim.position=parseInt(this.value,10); setUnsaved(true); AnimEditor.render();">
                            ${Object.keys(positionNames).map(k => `<option value="${k}" ${anim.position === parseInt(k,10) ? 'selected' : ''}>${positionNames[k]}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="File gambar animasi 2 di folder img/animations/">Animation Graphic 2 (Sekunder)</label>
                        <select class="form-control" onchange="anim.animation2Name=this.value; setUnsaved(true); AnimEditor.render(); renderSidebar();">
                            <option value="">(None)</option>
                            ${animImages.map(f => {
                                const base = f.replace(/\.png$/i, '');
                                return `<option value="${base}" ${anim.animation2Name === base ? 'selected' : ''}>${base}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label title="Hue bitmap kedua sesuai Bitmap.rotateHue RPG Maker MV">Graphic 2 Hue (°)</label>
                        <input type="number" min="0" max="359" class="form-control" value="${anim.animation2Hue || 0}" onchange="anim.animation2Hue=parseInt(this.value,10)||0; setUnsaved(true); AnimEditor.render();">
                    </div>
                </div>

                <!-- Row 2: CUSTOM SPRITESHEET GRID SETTINGS -->
                <div style="padding:10px 14px; background:rgba(15,23,42,0.6); border:1px solid rgba(56,189,248,0.25); border-radius:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.78rem; font-weight:700; color:#38bdf8;">📐 Grid Spritesheet &amp; Ukuran Sel (Custom Frame Slice)</span>
                            <span id="animGridSummaryBadge" style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted); padding:2px 6px; background:rgba(255,255,255,0.04); border-radius:3px; border:1px solid var(--border-subtle);">
                                ${dims.cols} Kolom × ${dims.rows > 0 ? `${dims.rows} Baris` : 'Auto Baris'} (${dims.cellW}×${dims.cellH} px) • Maks: ${dims.maxCells} sel
                            </span>
                        </div>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.autoDetectGrid(anim)" style="font-size:0.72rem; padding:3px 8px; color:#38bdf8;" title="Deteksi otomatis pembagian kolom, baris, dan ukuran sel dari resolusi file gambar Graphic 1">
                                ⚡ Auto-Detect dari Gambar
                            </button>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="anim.columns=5; anim.rows=0; anim.cellWidth=192; anim.cellHeight=192; anim.maxCells=100; setUnsaved(true); AnimEditor.updateGridSummaryUI(); renderEditor();" style="font-size:0.72rem; padding:3px 8px;" title="Reset ke standar RPG Maker MV (5 Kolom x 192x192 px)">
                                🔄 Reset MV Default (192×192)
                            </button>
                        </div>
                    </div>
                    <div class="grid-4" style="gap:8px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem;" title="Jumlah kolom per baris spritesheet (bawaan MV: 5)">Banyak Kolom (Cols)</label>
                            <input type="number" min="1" max="50" class="form-control" style="font-size:0.75rem; padding:3px 6px;" value="${anim.columns || 5}" 
                                   onchange="anim.columns=parseInt(this.value,10)||5; setUnsaved(true); AnimEditor.updateGridSummaryUI(); AnimEditor.render();">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem;" title="Jumlah baris dalam spritesheet (0 = otomatis sesuai tinggi gambar)">Banyak Baris (Rows)</label>
                            <input type="number" min="0" max="50" class="form-control" style="font-size:0.75rem; padding:3px 6px;" value="${anim.rows || 0}" placeholder="0 (Auto)" 
                                   onchange="anim.rows=parseInt(this.value,10)||0; setUnsaved(true); AnimEditor.updateGridSummaryUI(); AnimEditor.render();">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem;" title="Lebar per potongan sel/frame animasi dalam pixel (bawaan MV: 192 px)">Lebar Sel / W (px)</label>
                            <input type="number" min="8" max="1024" step="2" class="form-control" style="font-size:0.75rem; padding:3px 6px;" value="${anim.cellWidth || 192}" 
                                   onchange="anim.cellWidth=parseInt(this.value,10)||192; setUnsaved(true); AnimEditor.updateGridSummaryUI(); AnimEditor.render();">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem;" title="Tinggi per potongan sel/frame animasi dalam pixel (bawaan MV: 192 px)">Tinggi Sel / H (px)</label>
                            <input type="number" min="8" max="1024" step="2" class="form-control" style="font-size:0.75rem; padding:3px 6px;" value="${anim.cellHeight || 192}" 
                                   onchange="anim.cellHeight=parseInt(this.value,10)||192; setUnsaved(true); AnimEditor.updateGridSummaryUI(); AnimEditor.render();">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CANVAS STAGE & TIMELINE SCRUBBER -->
        <div class="card" style="margin-bottom:14px; overflow:hidden; border:1px solid var(--border-color);">
            <!-- Stage Header Toolbar -->
            <div class="card-header" style="padding:10px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; background:rgba(16,19,27,0.95); border-bottom:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:0.82rem; font-weight:700; color:#f1f5f9; letter-spacing:0.3px;">Stage Viewport</span>
                    <span id="animViewportInfo" style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted); padding:2px 6px; background:rgba(255,255,255,0.04); border-radius:3px; border:1px solid var(--border-subtle); white-space:nowrap;">1080×720 • ${dims.cellW}×${dims.cellH} px</span>
                </div>
                
                <div style="display:flex; align-items:center; gap:10px; font-size:0.75rem; flex-wrap:wrap;">
                    <!-- Display Toggles -->
                    <div style="display:flex; align-items:center; gap:8px; padding-right:8px; border-right:1px solid var(--border-color);">
                        <label class="checkbox-label" style="font-size:0.72rem; margin:0; cursor:pointer;" title="Tampilkan bayangan frame sebelumnya (Onion Skin) untuk mempermudah animasi gerak halus">
                            <input type="checkbox" ${AnimEditor.showOnionSkin ? 'checked' : ''} onchange="AnimEditor.showOnionSkin=this.checked; AnimEditor.render();">
                            <span>Ghost / Onion Skin</span>
                        </label>
                        <label class="checkbox-label" style="font-size:0.72rem; margin:0; cursor:pointer;" title="Tampilkan garis bantu origin & kisi grid">
                            <input type="checkbox" ${AnimEditor.showCrosshair ? 'checked' : ''} onchange="AnimEditor.showCrosshair=this.checked; AnimEditor.render();">
                            <span>Grid &amp; Origin</span>
                        </label>
                    </div>

                    <!-- Combat Direction -->
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:0.7rem; color:var(--text-muted); white-space:nowrap;">Arah:</span>
                        <select class="form-control" style="width:auto; padding:3px 8px; font-size:0.72rem; height:auto; font-weight:600; background:#0b0e14; color:#38bdf8; border-color:rgba(56,189,248,0.3);" 
                                onchange="AnimEditor.setCombatDirection(this.value);" title="Arah serangan animasi dalam pertempuran Sideview">
                            <option value="user_to_enemy" ${AnimEditor.combatDirection === 'user_to_enemy' ? 'selected' : ''}>⚔️ Serang Kiri (Hero ➔ Musuh)</option>
                            <option value="enemy_to_user" ${AnimEditor.combatDirection === 'enemy_to_user' ? 'selected' : ''}>🛡️ Serang Kanan (Musuh ➔ Hero)</option>
                            <option value="raw_unmirrored" ${AnimEditor.combatDirection === 'raw_unmirrored' ? 'selected' : ''}>📁 Format Asli Database</option>
                        </select>
                    </div>

                    <!-- Target Silhouette & Battler -->
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:0.7rem; color:var(--text-muted); white-space:nowrap;">Target:</span>
                        <select class="form-control" style="width:auto; padding:3px 8px; font-size:0.72rem; height:auto; background:#0b0e14;" onchange="AnimEditor.targetSilhouette=this.value; if(this.value==='enemy'){AnimEditor.setCombatDirection('user_to_enemy');} AnimEditor.render();">
                            <option value="actor" ${AnimEditor.targetSilhouette === 'actor' ? 'selected' : ''}>Hero (Actor)</option>
                            <option value="enemy" ${AnimEditor.targetSilhouette === 'enemy' ? 'selected' : ''}>Musuh (Enemy)</option>
                            <option value="none" ${AnimEditor.targetSilhouette === 'none' ? 'selected' : ''}>Tanpa Siluet</option>
                        </select>
                        <select class="form-control" style="width:auto; max-width:140px; padding:3px 8px; font-size:0.72rem; height:auto; background:#0b0e14;" onchange="AnimEditor.previewBattlerId=parseInt(this.value,10); AnimEditor.render();" title="Pilih battler dari database untuk preview siluet">
                            ${AnimEditor.getPreviewBattlers().map(battler => `<option value="${battler.id}" ${Number(AnimEditor.previewBattlerId) === battler.id ? 'selected' : ''}>${escapeHtml(battler.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Canvas Viewport -->
            <div style="position:relative; width:100%; aspect-ratio:3/2; max-height:480px; background:#000; display:flex; justify-content:center; align-items:center; overflow:hidden; border-radius:0; box-shadow:inset 0 0 24px rgba(0,0,0,0.85);">
                <canvas id="animEditorCanvas" width="1080" height="720" style="width:100%; height:100%; display:block; cursor:crosshair; image-rendering:pixelated;"></canvas>
            </div>

            <!-- Playback & Frame Scrubber Bar -->
            <div style="padding:10px 14px; background:rgba(15,23,42,0.95); border-top:1px solid var(--border-color); display:flex; flex-direction:column; gap:10px;">
                <!-- Row 1: Transport & Primary Controls -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <!-- Group 1: Transport & Frame Pill -->
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button type="button" id="animPlayBtn" class="btn btn-sm btn-primary" onclick="AnimEditor.togglePlay()" style="padding:5px 14px; font-size:0.75rem; font-weight:600; display:flex; align-items:center; gap:4px;">
                            ${AnimEditor.isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.currentFrameIndex=0; AnimEditor.updateTimelineUI(); AnimEditor.render();" style="padding:5px 8px; font-size:0.75rem;" title="Ke Frame 1">⏮</button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.stepFrame(-1); AnimEditor.render();" style="padding:5px 8px; font-size:0.75rem;" title="Frame Sebelumnya">◀</button>
                        
                        <!-- Dedicated Non-wrapping Frame Counter Pill -->
                        <div id="animFrameBadge" style="white-space:nowrap; flex-shrink:0; font-family:var(--font-mono); font-weight:700; font-size:0.78rem; padding:4px 12px; background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-sm); min-width:96px; text-align:center; user-select:none; letter-spacing:0.3px;">
                            Frame 1 / ${Math.max(1, (anim.frames || []).length)}
                        </div>

                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.stepFrame(1); AnimEditor.render();" style="padding:5px 8px; font-size:0.75rem;" title="Frame Berikutnya">▶</button>
                        <button type="button" id="animLoopBtn" class="btn btn-sm btn-secondary" onclick="AnimEditor.toggleLoop()" style="padding:5px 9px; font-size:0.75rem;">
                            ${AnimEditor.isLooping ? '🔄 Loop: ON' : '🔄 Loop: OFF'}
                        </button>
                    </div>

                    <!-- Group 2: Speed & SE -->
                    <div style="display:flex; gap:8px; align-items:center;">
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:0.7rem; color:var(--text-muted);">Speed:</span>
                            <select class="form-control" style="width:auto; padding:3px 8px; font-size:0.72rem; height:auto; background:#0b0e14;" onchange="AnimEditor.playbackSpeed=parseFloat(this.value); AnimEditor.tickAccumulator=0;">
                                <option value="0.5">0.5x Slow</option>
                                <option value="1.0" selected>1.0x MV (15 FPS)</option>
                                <option value="2.0">2.0x Fast (30 FPS)</option>
                                <option value="3.0">3.0x Max (45 FPS)</option>
                            </select>
                        </div>
                        <button type="button" id="animMuteBtn" class="btn btn-sm btn-secondary" onclick="AnimEditor.toggleMute()" style="padding:4px 10px; font-size:0.75rem;">
                            ${AnimEditor.isMuted ? '🔇 SE Muted' : '🔊 SE Audio'}
                        </button>
                    </div>

                    <!-- Group 3: Frame Management Actions -->
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.addNewFrame()" style="padding:4px 9px; font-size:0.75rem; color:#34d399;" title="Tambah frame baru di posisi berikutnya">
                            ➕ Tambah Frame
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.cloneCurrentFrame()" style="padding:4px 9px; font-size:0.75rem;" title="Duplikasi seluruh sel di frame aktif ke frame baru">
                            📋 Clone
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.deleteCurrentFrame()" style="padding:4px 9px; font-size:0.75rem; color:#f87171;" title="Hapus frame aktif">
                            🗑️ Hapus
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="AnimEditor.flipEntireAnimationHorizontal()" style="padding:4px 9px; font-size:0.75rem; color:#facc15;" title="Balikkan orientasi semua frame animasi secara horizontal di database">
                            ⇄ Balik Horizontal
                        </button>
                    </div>
                </div>

                <!-- Row 2: Horizontal Timeline Frame Scrubber Strip -->
                <div id="animFrameStrip" style="display:flex; gap:6px; overflow-x:auto; padding:4px 2px; max-width:100%; scrollbar-width:thin;">
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
            <div class="modal-card" style="max-width:920px; width:95vw; max-height:85vh;">
                <div class="modal-header">
                    <h3>🖼️ Pilih Potongan Sel dari Spritesheet</h3>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="closeAnimPatternPicker()">✕ Tutup</button>
                </div>
                <div class="modal-body" style="padding:14px; overflow:auto; max-height:70vh;">
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">
                        💡 Klik pada salah satu kotak sel di bawah ini untuk memasukkannya ke sel yang sedang Anda pilih.
                    </div>
                    <div id="animSheetGridContainer" style="display:flex; justify-content:center;">
                        <!-- Dynamically populated sheet canvas -->
                    </div>
                </div>
            </div>
        </div>
    `;

    const cvs = document.getElementById('animEditorCanvas');
    if (cvs) {
        AnimEditor.initCanvas(cvs, anim);
        AnimEditor.updateTimelineUI();
        AnimEditor.updateCellInspectorUI();
    }
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
        badge.textContent = `Frame ${this.currentFrameIndex + 1} / ${Math.max(1, frames.length)}`;
    }

    if (strip) {
        if (strip.children.length !== frames.length) {
            strip.innerHTML = frames.map((f, idx) => {
                const isSel = (idx === this.currentFrameIndex);
                const cellCount = (f || []).filter(c => c && c[0] >= 0).length;
                return `
                    <button type="button" class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="AnimEditor.selectFrame(${idx});"
                            style="padding:4px 8px; font-size:0.72rem; min-width:48px; display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink:0; border-radius:4px; ${isSel ? 'border-color:var(--accent, #e59b2c); box-shadow:0 0 8px rgba(229,155,44,0.35);' : ''}">
                        <span style="font-weight:700; font-family:var(--font-mono);">F${idx + 1}</span>
                        <span style="font-size:0.62rem; color:${isSel ? '#fff' : 'var(--text-muted)'};">${cellCount > 0 ? `${cellCount} sel` : '0 sel'}</span>
                    </button>
                `;
            }).join('');
        } else {
            // High-performance class toggling during playback
            for (let i = 0; i < strip.children.length; i++) {
                const btn = strip.children[i];
                const isSel = (i === this.currentFrameIndex);
                if (isSel) {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-primary');
                    btn.style.borderColor = 'var(--accent, #e59b2c)';
                    btn.style.boxShadow = '0 0 8px rgba(229,155,44,0.35)';
                    const countSpan = btn.children[1];
                    if (countSpan) countSpan.style.color = '#fff';
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-secondary');
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                    const countSpan = btn.children[1];
                    if (countSpan) countSpan.style.color = 'var(--text-muted)';
                }
            }
        }

        // Ensure active frame button is in view
        const activeBtn = strip.children[this.currentFrameIndex];
        if (activeBtn) {
            const sRect = strip.getBoundingClientRect();
            const bRect = activeBtn.getBoundingClientRect();
            if (bRect.left < sRect.left || bRect.right > sRect.right) {
                activeBtn.scrollIntoView({ behavior: this.isPlaying ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }
};

/**
 * Helper to retrieve currently selected cell array [pattern, x, y, scale, rotation, mirror, opacity, blend]
 */
AnimEditor.getCurrentCell = function() {
    if (!this.activeAnim || !this.activeAnim.frames) return null;
    const frame = this.activeAnim.frames[this.currentFrameIndex];
    if (!frame) return null;
    return frame[this.selectedCellIndex] || null;
};

/**
 * Update property of currently selected cell with real-time feedback
 */
AnimEditor.updateCellProp = function(propIdx, value, shouldRerenderTimeline = false) {
    const cell = this.getCurrentCell();
    if (!cell) return;
    
    cell[propIdx] = value;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    
    // If pattern changed, update the tab label in real time
    if (propIdx === 0) {
        const container = document.getElementById('animCellInspectorContainer');
        if (container) {
            const tabs = container.querySelectorAll('.card-body > div:first-child button');
            if (tabs && tabs[this.selectedCellIndex]) {
                const patText = value >= 0 ? `Pola ${value}` : 'Kosong';
                tabs[this.selectedCellIndex].textContent = `Layer #${this.selectedCellIndex + 1} (${patText})`;
            }
        }
        if (shouldRerenderTimeline) {
            this.updateTimelineUI();
        }
    }
    
    this.render();
};

/**
 * Reset selected cell offset back to origin (0, 0)
 */
AnimEditor.resetCellPosition = function() {
    const cell = this.getCurrentCell();
    if (!cell) return;
    cell[1] = 0;
    cell[2] = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    const inX = document.getElementById('cellPosX');
    const inY = document.getElementById('cellPosY');
    if (inX) inX.value = 0;
    if (inY) inY.value = 0;
    this.render();
};

/**
 * Set selected cell rotation degrees
 */
AnimEditor.setCellRotation = function(deg) {
    this.updateCellProp(4, deg);
    const rotInput = document.getElementById('cellRotation');
    if (rotInput) rotInput.value = deg;
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
    window.cell = cell; // Expose as safety fallback
    const dims = this.getCellDimensions();

    const blendNames = {
        0: '0: Normal',
        1: '1: Additive (Lighter / Kilau Bersinar)',
        2: '2: Multiply (Gelap / Shadow)',
        3: '3: Screen'
    };

    container.innerHTML = `
        <div class="card" style="border:1px solid var(--border-color); margin-bottom:14px;">
            <div class="card-header" style="padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:0.95rem;">🎯</span>
                    <div>
                        <strong style="color:#f8fafc; font-size:0.85rem;">Inspektor Layer &amp; Sel (Frame #${this.currentFrameIndex + 1})</strong>
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
                        const pat = c[0] >= 0 ? `Pola ${c[0]}` : 'Kosong';
                        return `
                            <button type="button" class="btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}" 
                                    onclick="AnimEditor.selectedCellIndex=${idx}; AnimEditor.updateCellInspectorUI(); AnimEditor.render();"
                                    style="padding:4px 10px; font-size:0.75rem; ${isSel ? 'border-color:var(--accent, #e59b2c);' : ''}">
                                Layer #${idx + 1} (${pat})
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
                                           oninput="AnimEditor.updateCellProp(0, parseInt(this.value,10), true);"
                                           onchange="AnimEditor.updateCellProp(0, parseInt(this.value,10), true);">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openAnimPatternPicker()" style="white-space:nowrap; padding:4px 8px; font-size:0.75rem;" title="Buka modal spritesheet untuk memilih potongan sel">
                                        🖼️ Pilih Visual
                                    </button>
                                </div>
                            </div>
                            <div style="font-size:0.68rem; color:var(--text-muted);">
                                💡 Kotak sel ${dims.cellW}×${dims.cellH} dihitung dari kiri ke kanan (0 s/d ${dims.maxCells - 1}). Nilai -1 = Kosong.
                            </div>
                        </div>

                        <!-- 2. POSITION (X, Y) -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.8rem; color:#fbbf24;">2. Posisi (X, Y Offset)</strong>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.resetCellPosition();" style="padding:1px 6px; font-size:0.68rem;">
                                    🎯 Reset (0, 0)
                                </button>
                            </div>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Posisi X (Horizontal)</label>
                                    <input type="number" id="cellPosX" min="-400" max="400" class="form-control" value="${cell[1] || 0}" 
                                           oninput="AnimEditor.updateCellProp(1, parseInt(this.value,10)||0);"
                                           onchange="AnimEditor.updateCellProp(1, parseInt(this.value,10)||0);">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Posisi Y (Vertikal)</label>
                                    <input type="number" id="cellPosY" min="-400" max="400" class="form-control" value="${cell[2] || 0}" 
                                           oninput="AnimEditor.updateCellProp(2, parseInt(this.value,10)||0);"
                                           onchange="AnimEditor.updateCellProp(2, parseInt(this.value,10)||0);">
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
                                    <input type="number" id="cellScale" min="10" max="400" class="form-control" value="${cell[3] !== undefined ? cell[3] : 100}" 
                                           oninput="AnimEditor.updateCellProp(3, parseInt(this.value,10)||100);"
                                           onchange="AnimEditor.updateCellProp(3, parseInt(this.value,10)||100);">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Rotasi Derajat (°)</label>
                                    <input type="number" id="cellRotation" min="0" max="360" class="form-control" value="${cell[4] || 0}" 
                                           oninput="AnimEditor.updateCellProp(4, parseInt(this.value,10)||0);"
                                           onchange="AnimEditor.updateCellProp(4, parseInt(this.value,10)||0);">
                                </div>
                            </div>
                            <div style="display:flex; gap:4px; margin-top:2px;">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.setCellRotation(0);" style="flex:1; padding:2px; font-size:0.68rem;">0°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.setCellRotation(90);" style="flex:1; padding:2px; font-size:0.68rem;">90°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.setCellRotation(180);" style="flex:1; padding:2px; font-size:0.68rem;">180°</button>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="AnimEditor.setCellRotation(270);" style="flex:1; padding:2px; font-size:0.68rem;">270°</button>
                            </div>
                        </div>

                        <!-- 4. OPACITY, BLEND & MIRROR -->
                        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                            <strong style="font-size:0.8rem; color:#f472b6;">4. Tampilan &amp; Efek Visual</strong>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Opasitas (0 - 255)</label>
                                    <input type="number" id="cellOpacity" min="0" max="255" class="form-control" value="${cell[6] !== undefined ? cell[6] : 255}" 
                                           oninput="AnimEditor.updateCellProp(6, Math.max(0, Math.min(255, parseInt(this.value,10)||0)));"
                                           onchange="AnimEditor.updateCellProp(6, Math.max(0, Math.min(255, parseInt(this.value,10)||0)));">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label style="font-size:0.72rem;">Cermin (Flip Horizontal)</label>
                                    <label class="checkbox-label" style="font-size:0.75rem; margin-top:6px;">
                                        <input type="checkbox" id="cellMirror" ${cell[5] ? 'checked' : ''} onchange="AnimEditor.updateCellProp(5, this.checked ? 1 : 0);">
                                        <span>Mirror Horizontal</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group" style="margin:0;">
                                <label style="font-size:0.72rem;">Mode Campuran (Blend Mode)</label>
                                <select id="cellBlend" class="form-control" onchange="AnimEditor.updateCellProp(7, parseInt(this.value,10)||0);">
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
    const audioList = State.audioSeList || [];

    container.innerHTML = `
        <!-- SOUND SE & FLASH TIMINGS INSPECTOR -->
        <div class="card" style="margin-bottom:12px; border:1px solid #38bdf855; overflow:hidden;">
            <div class="card-header" style="padding:10px 14px; background:rgba(12,74,110,0.4); display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">🔊</span>
                    <div>
                        <div style="font-size:0.7rem; color:#38bdf8; font-weight:700;">Timings &amp; Audio</div>
                        <h3 style="font-size:0.95rem; margin:0; color:#fff; font-weight:700;">Sound Effect &amp; Flash</h3>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick="AnimEditor.addTiming()" style="padding:3px 8px; font-size:0.72rem;">
                    ➕ Tambah
                </button>
            </div>

            <div class="card-body" style="padding:12px; display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto;">
                ${(anim.timings && anim.timings.length > 0) ? anim.timings.map((tm, idx) => {
                    const se = tm.se || { name: '', volume: 90, pitch: 100, pan: 0 };
                    const seName = se.name || '';
                    const color = tm.flashColor || [255, 255, 255, 255];
                    const colorHex = `#${color.slice(0, 3).map(channel => Math.max(0, Math.min(255, Number(channel) || 0)).toString(16).padStart(2, '0')).join('')}`;
                    return `
                        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="color:#facc15;">Timing #${idx + 1}</strong>
                                <button type="button" class="btn btn-sm btn-danger" onclick="AnimEditor.deleteTiming(${idx})" title="Hapus timing">✕</button>
                            </div>
                            <div class="grid-3">
                                <div class="form-group" style="margin:0;">
                                    <label>Frame (0-${Math.max(0, (anim.frames || []).length - 1)})</label>
                                    <input type="number" min="0" max="${Math.max(0, (anim.frames || []).length - 1)}" class="form-control" value="${tm.frame || 0}" onchange="AnimEditor.updateTiming(${idx}, 'frame', this.value)">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label>Flash Scope</label>
                                    <select class="form-control" onchange="AnimEditor.updateTiming(${idx}, 'flashScope', this.value)">
                                        ${['None', 'Target', 'Screen', 'Hide Target'].map((name, scope) => `<option value="${scope}" ${Number(tm.flashScope || 0) === scope ? 'selected' : ''}>${name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label>Durasi Flash (frame)</label>
                                    <input type="number" min="0" max="60" class="form-control" value="${tm.flashDuration || 0}" onchange="AnimEditor.updateTiming(${idx}, 'flashDuration', this.value)">
                                </div>
                            </div>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label>Sound Effect</label>
                                    <div style="display:flex; gap:6px;">
                                        <select class="form-control" onchange="AnimEditor.updateTiming(${idx}, 'se.name', this.value)">
                                            <option value="">(Tanpa SE)</option>
                                            ${audioList.map(entry => {
                                                const name = typeof entry === 'string' ? entry : entry.name;
                                                return name ? `<option value="${escapeHtml(name)}" ${seName === name ? 'selected' : ''}>${escapeHtml(name)}</option>` : '';
                                            }).join('')}
                                        </select>
                                        <button type="button" class="btn btn-secondary" onclick="AnimEditor.previewTimingSE(${idx})" title="Putar SE">🔊</button>
                                    </div>
                                </div>
                                <div class="grid-3">
                                    <div class="form-group" style="margin:0;">
                                        <label>Volume</label>
                                        <input type="number" min="0" max="100" class="form-control" value="${se.volume ?? 90}" onchange="AnimEditor.updateTiming(${idx}, 'se.volume', this.value)">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Pitch</label>
                                        <input type="number" min="50" max="150" class="form-control" value="${se.pitch ?? 100}" onchange="AnimEditor.updateTiming(${idx}, 'se.pitch', this.value)">
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label>Pan</label>
                                        <input type="number" min="-100" max="100" class="form-control" value="${se.pan ?? 0}" onchange="AnimEditor.updateTiming(${idx}, 'se.pan', this.value)">
                                    </div>
                                </div>
                            </div>
                            <div class="grid-2">
                                <div class="form-group" style="margin:0;">
                                    <label>Warna Flash</label>
                                    <input type="color" class="form-control" value="${colorHex}" onchange="AnimEditor.updateTimingColor(${idx}, this.value)">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label>Alpha (0-255)</label>
                                    <input type="number" min="0" max="255" class="form-control" value="${color[3] ?? 255}" onchange="AnimEditor.updateTiming(${idx}, 'flashAlpha', this.value)">
                                </div>
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
                    <div style="font-size:0.72rem; color:#f472b6; font-weight:700;">Ringkasan Animasi</div>
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
    if (this.isPlaying) {
        this.lastFrameTime = 0;
        if (!this.frameTimingsProcessed) this.processFrameTimings(this.currentFrameIndex);
    }
    const btn = document.getElementById('animPlayBtn');
    if (btn) btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
};

AnimEditor.updateTiming = function(index, field, value) {
    const timing = this.activeAnim && this.activeAnim.timings && this.activeAnim.timings[index];
    if (!timing) return;

    if (field.startsWith('se.')) {
        timing.se = timing.se || { name: '', volume: 90, pitch: 100, pan: 0 };
        const key = field.slice(3);
        timing.se[key] = key === 'name' ? value : Number(value);
    } else if (field === 'flashAlpha') {
        timing.flashColor = timing.flashColor || [255, 255, 255, 255];
        timing.flashColor[3] = Math.max(0, Math.min(255, Number(value) || 0));
    } else if (field === 'frame') {
        timing.frame = Math.max(0, Math.min(this.activeAnim.frames.length - 1, Number(value) || 0));
    } else {
        timing[field] = Number(value) || 0;
    }

    if (typeof setUnsaved === 'function') setUnsaved(true);
    const preview = document.getElementById('statPreviewContainer');
    if (preview) renderAnimationStatPreview(preview, this.activeAnim);
};

AnimEditor.updateTimingColor = function(index, hex) {
    const timing = this.activeAnim && this.activeAnim.timings && this.activeAnim.timings[index];
    if (!timing) return;
    timing.flashColor = timing.flashColor || [255, 255, 255, 255];
    timing.flashColor[0] = parseInt(hex.slice(1, 3), 16);
    timing.flashColor[1] = parseInt(hex.slice(3, 5), 16);
    timing.flashColor[2] = parseInt(hex.slice(5, 7), 16);
    if (typeof setUnsaved === 'function') setUnsaved(true);
    const preview = document.getElementById('statPreviewContainer');
    if (preview) renderAnimationStatPreview(preview, this.activeAnim);
};

AnimEditor.playTimingSE = function(se) {
    if (!se || !se.name) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        new Audio(`audio/se/${encodeURIComponent(se.name)}.ogg`).play().catch(() => {});
        return;
    }

    try {
        const context = this.audioContext || (this.audioContext = new AudioContextClass());
        if (!context.createStereoPanner) {
            new Audio(`audio/se/${encodeURIComponent(se.name)}.ogg`).play().catch(() => {});
            return;
        }
        const audio = new Audio(`audio/se/${encodeURIComponent(se.name)}.ogg`);
        audio.volume = Math.max(0, Math.min(1, (Number(se.volume ?? 90) / 100) * 0.7));
        audio.playbackRate = Math.max(0.5, Math.min(2, Number(se.pitch ?? 100) / 100));
        const source = context.createMediaElementSource(audio);
        const panner = context.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, Number(se.pan || 0) / 100));
        source.connect(panner);
        panner.connect(context.destination);
        audio.addEventListener('ended', () => {
            source.disconnect();
            panner.disconnect();
        }, { once: true });
        context.resume().then(() => audio.play()).catch(() => {
            source.disconnect();
            panner.disconnect();
        });
    } catch (error) {
        new Audio(`audio/se/${encodeURIComponent(se.name)}.ogg`).play().catch(() => {});
    }
};

AnimEditor.previewTimingSE = function(index) {
    const timing = this.activeAnim && this.activeAnim.timings && this.activeAnim.timings[index];
    if (timing && timing.se) this.playTimingSE(timing.se);
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
    const insertIndex = this.currentFrameIndex + 1;
    // Insert new frame with default empty or copy of first cell
    this.activeAnim.frames.splice(insertIndex, 0, [[0, 0, 0, 100, 0, 0, 255, 0]]);
    (this.activeAnim.timings || []).forEach(timing => {
        if (timing.frame >= insertIndex) timing.frame++;
    });
    this.currentFrameIndex = insertIndex;
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
    const insertIndex = this.currentFrameIndex + 1;
    this.activeAnim.frames.splice(insertIndex, 0, copy);
    (this.activeAnim.timings || []).forEach(timing => {
        if (timing.frame >= insertIndex) timing.frame++;
    });
    this.currentFrameIndex = insertIndex;
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
    const removedIndex = this.currentFrameIndex;
    this.activeAnim.frames.splice(removedIndex, 1);
    this.activeAnim.timings = (this.activeAnim.timings || [])
        .filter(timing => timing.frame !== removedIndex)
        .map(timing => {
            if (timing.frame > removedIndex) timing.frame--;
            return timing;
        });
    if (this.currentFrameIndex >= this.activeAnim.frames.length) {
        this.currentFrameIndex = this.activeAnim.frames.length - 1;
    }
    this.selectedCellIndex = 0;
    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
    const preview = document.getElementById('statPreviewContainer');
    if (preview) renderAnimationStatPreview(preview, this.activeAnim);
};

AnimEditor.flipEntireAnimationHorizontal = function() {
    if (!this.activeAnim || !this.activeAnim.frames || this.activeAnim.frames.length === 0) return;
    if (!confirm('Apakah Anda yakin ingin membalikkan posisi (koordinat X, rotasi, & cermin) seluruh sel pada SEMUA frame animasi ini secara horizontal di database?')) return;

    this.activeAnim.frames.forEach(frame => {
        if (!Array.isArray(frame)) return;
        frame.forEach(cell => {
            if (!Array.isArray(cell) || cell[0] < 0) return;
            // Invert X offset
            if (cell[1] !== undefined) cell[1] = -cell[1];
            // Invert rotation angle (0-360)
            if (cell[4] !== undefined && cell[4] !== 0) cell[4] = (360 - cell[4]) % 360;
            // Toggle cell mirror flag
            cell[5] = cell[5] ? 0 : 1;
        });
    });

    if (typeof setUnsaved === 'function') setUnsaved(true);
    this.updateTimelineUI();
    this.updateCellInspectorUI();
    this.render();
    if (typeof showToast === 'function') {
        showToast('Seluruh frame animasi berhasil dibalik horizontal!', 'success');
    }
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
        const dims = AnimEditor.getCellDimensions(anim);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const cellW = dims.cellW;
        const cellH = dims.cellH;
        const cols = dims.cols;
        const rows = (dims.rows > 0) ? dims.rows : Math.max(1, Math.floor(h / cellH));
        const totalPatterns = cols * rows;

        // Render preview canvas with grid overlay
        const cvs = document.createElement('canvas');
        cvs.width = w;
        cvs.height = h;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Draw grid lines and index badges
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = Math.max(1, Math.min(2, Math.floor(cellW / 64)));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const pat = r * cols + c;
                const x = c * cellW;
                const y = r * cellH;
                ctx.strokeRect(x, y, cellW, cellH);

                // Badge dynamically scaled to cell size
                const fontSize = Math.max(8, Math.min(14, Math.floor(cellW * 0.22)));
                ctx.font = `bold ${fontSize}px sans-serif`;
                const badgeW = Math.max(22, Math.min(38, Math.floor(cellW * 0.45)));
                const badgeH = Math.max(12, Math.min(20, Math.floor(cellH * 0.3)));
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                ctx.fillRect(x + 2, y + 2, badgeW, badgeH);
                ctx.fillStyle = '#facc15';
                ctx.fillText(`#${pat}`, x + 4, y + badgeH - 3);
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
            const col = Math.min(cols - 1, Math.max(0, Math.floor(clickX / cellW)));
            const row = Math.min(rows - 1, Math.max(0, Math.floor(clickY / cellH)));
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
    const dims = AnimEditor.getCellDimensions(anim);
    const defaultCount = dims.rows > 0 ? (dims.cols * dims.rows) : 12;
    const countStr = prompt(`Masukkan jumlah frame yang ingin dibuat secara otomatis berurutan dari spritesheet (misal: ${defaultCount}):`, String(defaultCount));
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < 1 || count > 200) {
        alert('Jumlah frame harus antara 1 sampai 200');
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

