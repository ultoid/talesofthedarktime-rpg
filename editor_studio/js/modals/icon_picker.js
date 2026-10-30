/**
 * NUSV Database Studio - Modal Controller: modals/icon_picker.js
 * Visual 32x32 Icon Picker for RPG Maker MV IconSet.png
 */

let currentIconPickerCallback = null;
let currentIconPickerSelectedIdx = 0;

/**
 * Render visual icon picker form field with preview box, index input, and IconSet button.
 */
function renderIconPickerField(label, iconIndex, onPickExpr, titleText = "Pilih ikon dari IconSet.png") {
    const safeIdx = parseInt(iconIndex, 10) || 0;
    const col = safeIdx % 16;
    const row = Math.floor(safeIdx / 16);
    const bgX = -col * 32;
    const bgY = -row * 32;

    return `
        <div class="form-group">
            <label title="${escapeHtml(titleText)}">${escapeHtml(label)}</label>
            <div style="display:flex; align-items:center; gap:8px;">
                <div class="icon-preview-box" title="Klik untuk membuka visual icon picker" onclick="openIconPickerModal(${safeIdx}, ${onPickExpr})">
                    <div class="icon-preview-sheet" style="background-position: ${bgX}px ${bgY}px;"></div>
                </div>
                <input type="number" min="0" max="9999" class="form-control" style="width:85px; font-weight:700;" value="${safeIdx}" 
                       onchange="const val=parseInt(this.value,10)||0; (${onPickExpr})(val);">
                <button type="button" class="btn btn-secondary btn-sm" onclick="openIconPickerModal(${safeIdx}, ${onPickExpr})" title="Buka IconSet Sheet">IconSet...</button>
            </div>
        </div>
    `;
}

/**
 * Open the visual icon picker modal. Supports both (callback) and (initialIdx, callback).
 */
function openIconPickerModal(initialValOrCallback, maybeCallback) {
    let callback = null;
    let initialIdx = 0;

    if (typeof initialValOrCallback === 'function') {
        callback = initialValOrCallback;
        initialIdx = parseInt(maybeCallback, 10) || 0;
    } else {
        initialIdx = parseInt(initialValOrCallback, 10) || 0;
        callback = maybeCallback;
    }

    currentIconPickerCallback = callback;
    currentIconPickerSelectedIdx = initialIdx;

    const modal = document.getElementById('iconPickerModal');
    if (!modal) return;

    // Reset search query
    const searchInput = document.getElementById('iconSearchInput');
    if (searchInput) searchInput.value = '';

    // Update modal header selection preview
    updateIconPickerSelectionPreview(initialIdx);

    // Populate and highlight icons in grid
    renderIconPickerGrid(initialIdx);

    modal.style.display = 'flex';
}

/**
 * Close icon picker modal.
 */
function closeIconPickerModal() {
    const modal = document.getElementById('iconPickerModal');
    if (modal) modal.style.display = 'none';
    currentIconPickerCallback = null;
}

/**
 * Update the preview box and label in the icon picker header.
 */
function updateIconPickerSelectionPreview(idx) {
    const sheet = document.getElementById('iconPickerPreviewSheet');
    const label = document.getElementById('iconPickerSelectedId');
    if (label) label.textContent = `#${idx}`;
    if (sheet) {
        const col = idx % 16;
        const row = Math.floor(idx / 16);
        sheet.style.backgroundPosition = `-${col * 32}px -${row * 32}px`;
    }
}

/**
 * Handle selecting an icon from the grid.
 */
function selectIconFromPicker(index, isConfirm = false) {
    currentIconPickerSelectedIdx = index;
    updateIconPickerSelectionPreview(index);

    // Update selected class on buttons
    const container = document.getElementById('iconGridContainer') || document.getElementById('iconPickerGrid');
    if (container) {
        const btns = container.querySelectorAll('.icon-tile-btn');
        btns.forEach(btn => {
            const btnIdx = parseInt(btn.dataset.iconId, 10);
            btn.classList.toggle('selected', btnIdx === index);
        });
    }

    if (isConfirm) {
        confirmIconSelection();
    }
}

/**
 * Apply the selected icon to the current item and close modal.
 */
function confirmIconSelection() {
    if (currentIconPickerCallback) {
        currentIconPickerCallback(currentIconPickerSelectedIdx);
    }
    closeIconPickerModal();
}

/**
 * Filter icons in the grid by numerical ID.
 */
function filterIconGrid(query) {
    const container = document.getElementById('iconGridContainer') || document.getElementById('iconPickerGrid');
    if (!container) return;
    const q = (query || '').trim().toLowerCase();
    const btns = container.querySelectorAll('.icon-tile-btn');

    btns.forEach(btn => {
        const id = btn.dataset.iconId || '';
        if (!q) {
            btn.style.display = 'inline-flex';
        } else {
            const matches = id.includes(q) || `#${id}`.includes(q);
            btn.style.display = matches ? 'inline-flex' : 'none';
        }
    });
}

/**
 * Render all 320 tiles from IconSet.png in the modal grid.
 */
function renderIconPickerGrid(initialSelectedIdx = 0) {
    const grid = document.getElementById('iconGridContainer') || document.getElementById('iconPickerGrid');
    if (!grid) return;

    // If grid already rendered, just update selected class and scroll into view
    if (grid.children.length >= 320) {
        const btns = grid.querySelectorAll('.icon-tile-btn');
        let selectedEl = null;
        btns.forEach(btn => {
            const btnIdx = parseInt(btn.dataset.iconId, 10);
            const isSel = btnIdx === initialSelectedIdx;
            btn.classList.toggle('selected', isSel);
            btn.style.display = 'inline-flex';
            if (isSel) selectedEl = btn;
        });
        if (selectedEl) {
            setTimeout(() => {
                selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
        return;
    }

    grid.innerHTML = '';
    const totalIcons = 320;
    let selectedEl = null;

    for (let i = 0; i < totalIcons; i++) {
        const col = i % 16;
        const row = Math.floor(i / 16);
        const bgX = -col * 32;
        const bgY = -row * 32;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-tile-btn ${i === initialSelectedIdx ? 'selected' : ''}`;
        btn.dataset.iconId = String(i);
        btn.title = `Icon #${i} (Klik untuk pilih, klik 2x untuk terapkan)`;

        btn.onmouseover = () => {
            const previewSheet = document.getElementById('iconPickerPreviewSheet');
            const previewId = document.getElementById('iconPickerSelectedId');
            if (previewSheet && previewId) {
                previewSheet.style.backgroundPosition = `${bgX}px ${bgY}px`;
                previewId.textContent = `#${i}`;
            }
        };

        btn.onmouseout = () => {
            updateIconPickerSelectionPreview(currentIconPickerSelectedIdx);
        };

        btn.onclick = () => selectIconFromPicker(i, false);
        btn.ondblclick = () => selectIconFromPicker(i, true);

        btn.innerHTML = `<div class="icon-preview-sheet" style="background-position: ${bgX}px ${bgY}px;"></div>`;
        grid.appendChild(btn);

        if (i === initialSelectedIdx) {
            selectedEl = btn;
        }
    }

    if (selectedEl) {
        setTimeout(() => {
            selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 50);
    }
}
