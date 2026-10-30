/**
 * NUSV Database Studio - Modal Controller: modals/graphic_modal.js
 */

function renderFacePreviewHtml(faceName, faceIndex) {
    if (!faceName) {
        return '<div class="empty-preview" title="Belum ada gambar wajah yang dipilih">No Face Graphic<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
    }
    const idx = Number(faceIndex) || 0;
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const posX = (col / 3.0) * 100.0;
    const posY = (row / 1.0) * 100.0;
    const url = `img/faces/${encodeURIComponent(faceName)}.png`;
    return `<div class="pixel-sprite face-frame" style="background-image: url('${url}'); background-size: 400% 200%; background-position: ${posX.toFixed(1)}% ${posY.toFixed(1)}%;" title="Wajah Indeks ${idx} (Klik untuk buka sheet)"></div>`;
}



function renderCharPreviewHtml(charName, charIndex) {
    if (!charName) {
        return '<div class="empty-preview" title="Belum ada sprite berjalan yang dipilih">No Character Sprite<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
    }
    const isSingle = charName.startsWith('$');
    const url = `img/characters/${encodeURIComponent(charName)}.png`;
    if (isSingle) {
        return `<div class="pixel-sprite char-frame" style="background-image: url('${url}'); background-size: 300% 400%; background-position: 50% 0%;" title="Single Character Sprite ($)"></div>`;
    }
    const idx = Number(charIndex) || 0;
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const frameX = col * 3 + 1; // standing frame down
    const frameY = row * 4 + 0; // facing down
    const posX = (frameX / 11.0) * 100.0;
    const posY = (frameY / 7.0) * 100.0;
    return `<div class="pixel-sprite char-frame" style="background-image: url('${url}'); background-size: 1200% 800%; background-position: ${posX.toFixed(1)}% ${posY.toFixed(1)}%;" title="Sprite Indeks ${idx} (Klik untuk buka sheet)"></div>`;
}



function renderSvPreviewHtml(svName) {
    if (!svName) {
        return '<div class="empty-preview" title="Belum ada battler tempur yang dipilih">No Battler Graphic<br><span style="font-size:0.7rem; color:var(--text-muted);">Choose below</span></div>';
    }
    const url = `img/sv_actors/${encodeURIComponent(svName)}.png`;
    return `<div class="pixel-sprite sv-frame" style="background-image: url('${url}'); background-size: 900% 600%; background-position: 0% 0%;" title="[SV] Idle Battler Pose"></div>`;
}



function onActorFaceChange(val) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    actor.faceName = val.replace(/\.png$/i, '');
    setUnsaved(true);
    updateActorGraphicsLive();
}



function onActorFaceIndexChange(idx) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    actor.faceIndex = Number(idx);
    setUnsaved(true);
    updateActorGraphicsLive();
}



function onActorCharChange(val) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    actor.characterName = val.replace(/\.png$/i, '');
    setUnsaved(true);
    updateActorGraphicsLive();
}



function onActorCharIndexChange(idx) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    actor.characterIndex = Number(idx);
    setUnsaved(true);
    updateActorGraphicsLive();
}



function onActorSvChange(val) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;
    actor.battlerName = val.replace(/\.png$/i, '');
    setUnsaved(true);
    updateActorGraphicsLive();
}



function updateActorGraphicsLive() {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;

    // Update Face Box
    const faceBox = document.getElementById('facePreviewBox');
    if (faceBox) faceBox.innerHTML = renderFacePreviewHtml(actor.faceName, actor.faceIndex || 0);
    const faceBadge = document.getElementById('faceIndexLabel');
    if (faceBadge) faceBadge.innerText = `Index ${actor.faceIndex || 0}`;

    document.querySelectorAll('#faceIndexGrid .idx-btn').forEach((btn, i) => {
        btn.classList.toggle('active', Number(actor.faceIndex || 0) === i);
    });

    // Update Character Box
    const charBox = document.getElementById('charPreviewBox');
    if (charBox) charBox.innerHTML = renderCharPreviewHtml(actor.characterName, actor.characterIndex || 0);
    const charBadge = document.getElementById('charIndexLabel');
    const isSingle = (actor.characterName || '').startsWith('$');
    if (charBadge) charBadge.innerText = isSingle ? 'Single ($)' : `Index ${actor.characterIndex || 0}`;

    document.querySelectorAll('#charIndexGrid .idx-btn').forEach((btn, i) => {
        btn.disabled = isSingle;
        btn.classList.toggle('active', Number(actor.characterIndex || 0) === i && !isSingle);
    });

    // Update SV Box
    const svBox = document.getElementById('svPreviewBox');
    if (svBox) svBox.innerHTML = renderSvPreviewHtml(actor.battlerName);
}



function openGraphicSheetModal(type) {
    const actor = State.actors[State.selectedIndex];
    if (!actor) return;

    const modal = document.getElementById('graphicModal');
    const titleEl = document.getElementById('graphicModalTitle');
    const bodyEl = document.getElementById('graphicModalBody');
    if (!modal || !titleEl || !bodyEl) return;

    if (type === 'face') {
        if (!actor.faceName) {
            showToast('Pilih file Face Graphic terlebih dahulu di dropdown!', 'info');
            return;
        }
        titleEl.innerText = `Select Face Frame: ${actor.faceName}.png`;
        const url = `img/faces/${encodeURIComponent(actor.faceName)}.png`;
        const currentIdx = Number(actor.faceIndex) || 0;

        // 4 cols x 2 rows
        let cellsHtml = '';
        for (let idx = 0; idx < 8; idx++) {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const left = (col * 25).toFixed(1);
            const top = (row * 50).toFixed(1);
            const isSel = idx === currentIdx ? 'selected' : '';
            cellsHtml += `
                <div class="sheet-click-cell ${isSel}" style="left:${left}%; top:${top}%; width:25%; height:50%;" 
                     onclick="onActorFaceIndexChange(${idx}); closeGraphicModal(); showToast('Face Index diubah ke ${idx}', 'success');"
                     title="Klik untuk memilih wajah index #${idx}">
                    <span class="sheet-cell-badge">Face #${idx}</span>
                </div>
            `;
        }

        bodyEl.innerHTML = `
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                Klik pada kotak wajah yang ingin kamu gunakan untuk karakter ini (Index 0 - 7):
            </div>
            <div class="sheet-canvas-container" style="width:576px; height:288px; max-width:100%;">
                <img src="${url}" style="width:100%; height:100%; object-fit:fill; image-rendering:pixelated; display:block;">
                ${cellsHtml}
            </div>
        `;
        modal.style.display = 'flex';

    } else if (type === 'character') {
        if (!actor.characterName) {
            showToast('Pilih file Character Sprite terlebih dahulu di dropdown!', 'info');
            return;
        }
        const isSingle = actor.characterName.startsWith('$');
        titleEl.innerText = `Select Character Frame: ${actor.characterName}.png`;
        const url = `img/characters/${encodeURIComponent(actor.characterName)}.png`;

        if (isSingle) {
            bodyEl.innerHTML = `
                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                    Ini adalah spritesheet satu karakter tunggal ($prefix).
                </div>
                <div class="sheet-canvas-container" style="max-height:400px; max-width:100%;">
                    <img src="${url}" style="max-height:380px; image-rendering:pixelated; display:block;">
                </div>
            `;
        } else {
            const currentIdx = Number(actor.characterIndex) || 0;
            // 4 cols x 2 rows
            let cellsHtml = '';
            for (let idx = 0; idx < 8; idx++) {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                const left = (col * 25).toFixed(1);
                const top = (row * 50).toFixed(1);
                const isSel = idx === currentIdx ? 'selected' : '';
                cellsHtml += `
                    <div class="sheet-click-cell ${isSel}" style="left:${left}%; top:${top}%; width:25%; height:50%;" 
                         onclick="onActorCharIndexChange(${idx}); closeGraphicModal(); showToast('Character Index diubah ke ${idx}', 'success');"
                         title="Klik untuk memilih karakter index #${idx}">
                        <span class="sheet-cell-badge">Char #${idx}</span>
                    </div>
                `;
            }

            bodyEl.innerHTML = `
                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-align:center;">
                    Klik pada blok karakter yang ingin digunakan dari sheet ini (Index 0 - 7):
                </div>
                <div class="sheet-canvas-container" style="width:576px; height:384px; max-width:100%;">
                    <img src="${url}" style="width:100%; height:100%; object-fit:fill; image-rendering:pixelated; display:block;">
                    ${cellsHtml}
                </div>
            `;
        }
        modal.style.display = 'flex';
    }
}



function closeGraphicModal() {
    const modal = document.getElementById('graphicModal');
    if (modal) modal.style.display = 'none';
}


// ==========================================
// EXP CURVE CALCULATION & CANVAS VISUALIZER
// ==========================================
