/**
 * NUSV Database Studio - API Client & Data Persistence
 */

function getApiUrl(endpoint) {
    // If running from file://, origin null, or different port/host (e.g. Live Server on 5500),
    // always route API requests to the Python editor server on port 5050 using 127.0.0.1 to avoid IPv6 issues.
    if (window.location.protocol === 'file:' || window.location.origin === 'null' || window.location.port !== '5050') {
        return 'http://127.0.0.1:5050' + endpoint;
    }
    return endpoint;
}



function showServerOfflineModal() {
    if (document.getElementById('serverOfflineBanner')) return;
    const modal = document.createElement('div');
    modal.id = 'serverOfflineBanner';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:20px;';
    modal.innerHTML = `
        <div style="background:#1e293b;border:2px solid #ef4444;border-radius:12px;max-width:580px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.8);color:#f8fafc;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div style="font-size:2.2rem;color:#ef4444;"><i class="pai-warning-diamond"></i></div>
                <div>
                    <h2 style="font-size:1.25rem;font-weight:700;color:#f87171;">Server Database Belum Berjalan / Tidak Terhubung</h2>
                    <p style="font-size:0.85rem;color:#94a3b8;">Tidak dapat memuat file JSON database project</p>
                </div>
            </div>
            <p style="font-size:0.9rem;line-height:1.5;margin-bottom:16px;color:#cbd5e1;">
                Editor web ini memerlukan backend lokal (<strong>tools/nusv_editor_server.py</strong>) agar dapat membaca data game dan menyimpan perubahan langsung ke file JSON project.
            </p>
            <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:12px;font-family:monospace;font-size:0.85rem;margin-bottom:20px;line-height:1.7;">
                <div style="color:#38bdf8;font-weight:600;margin-bottom:4px;">Cara Menjalankan Server Backend:</div>
                <div><i class="pai-terminal"></i> <strong>Linux:</strong> Jalankan <code>./run_editor.sh</code> di terminal</div>
                <div><i class="pai-device-laptop"></i> <strong>Windows:</strong> Double-click <code>run_editor.bat</code></div>
                <div style="margin-top:6px;color:#94a3b8;">Atau ketik: <code>python3 tools/nusv_editor_server.py</code></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="document.getElementById('serverOfflineBanner').remove()">Tutup Notifikasi</button>
                <a href="http://localhost:5050/" class="btn btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;"><i class="pai-external-link"></i> Buka http://localhost:5050</a>
                <a href="http://127.0.0.1:5050/" class="btn btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;"><i class="pai-external-link"></i> Buka 127.0.0.1</a>
                <button class="btn btn-secondary" onclick="reloadAllData()"><i class="pai-reload"></i> Coba Hubungkan Ulang</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize application with auto-detection for file:// protocol

function showLoadingOverlay(msg = 'Memuat database project...') {
    let overlay = document.getElementById('globalLoadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'globalLoadingOverlay';
        overlay.className = 'global-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner-box">
                <div class="loading-spinner"></div>
                <div class="loading-text" id="globalLoadingText">${typeof escapeHtml === 'function' ? escapeHtml(msg) : msg}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const textEl = document.getElementById('globalLoadingText');
        if (textEl) textEl.textContent = msg;
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('globalLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

async function reloadAllData() {
    showLoadingOverlay('Memuat seluruh data database project...');
    showToast('Loading project database...', 'info');
    let dataLoaded = false;
    try {
        const [pics, faces, chars, svs, enes, animPics, seAudio, act, cls, wep, arm, ski, itm, ene, sta, anim, sys, ce, rce, troops, pluginScript] = await Promise.all([
            fetch(getApiUrl('/api/images/pictures')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/faces')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/characters')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/sv_actors')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/sv_enemies')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/animations')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/audio/se')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/data/Actors.json')).then(r => { if (!r.ok) throw new Error('Failed to load Actors.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Classes.json')).then(r => { if (!r.ok) throw new Error('Failed to load Classes.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Weapons.json')).then(r => { if (!r.ok) throw new Error('Failed to load Weapons.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Armors.json')).then(r => { if (!r.ok) throw new Error('Failed to load Armors.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Skills.json')).then(r => { if (!r.ok) throw new Error('Failed to load Skills.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Items.json')).then(r => { if (!r.ok) throw new Error('Failed to load Items.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Enemies.json')).then(r => { if (!r.ok) throw new Error('Failed to load Enemies.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/States.json')).then(r => { if (!r.ok) throw new Error('Failed to load States.json'); return r.json(); }),
            fetch(getApiUrl('/api/data/Animations.json')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/data/System.json')).then(r => r.json()).catch(() => ({})),
            fetch(getApiUrl('/api/data/CommonEvents.json')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/data/Races.json')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/data/Troops.json')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/js/plugins.js')).then(r => r.ok ? r.text() : '').catch(() => '')
        ]);
        State.commonEvents = ce || [];

        State.pictures = pics || [];
        State.faces = faces || [];
        State.characters = chars || [];
        State.svActors = svs || [];
        State.enemiesPics = enes || [];
        State.animationImages = animPics || [];
        State.audioSeList = (seAudio && seAudio.length > 0) ? seAudio : (typeof RPG_DEFAULT_SE_LIST !== 'undefined' ? RPG_DEFAULT_SE_LIST : []);

        State.actors = act || [];
        State.classes = cls || [];
        State.races = rce || [];
        State.weapons = wep || [];
        State.armors = arm || [];
        State.skills = ski || [];
        State.items = itm || [];
        State.enemies = ene || [];
        State.troops = troops || [];
        State.states = sta || [];
        State.animations = anim || [];
        State.system = sys || {};
        try {
            const pluginsStart = pluginScript.indexOf('var $plugins');
            const arrayStart = pluginScript.indexOf('[', pluginsStart);
            const arrayEnd = pluginScript.lastIndexOf(']');
            const pluginList = arrayStart >= 0 && arrayEnd > arrayStart
                ? JSON.parse(pluginScript.slice(arrayStart, arrayEnd + 1))
                : [];
            State.pluginParameters = Object.fromEntries(pluginList.map(plugin => [plugin.name, plugin.parameters || {}]));
        } catch (error) {
            State.pluginParameters = {};
            console.warn('Plugin configuration could not be loaded for battle preview:', error);
        }

        dataLoaded = true;
        const banner = document.getElementById('serverOfflineBanner');
        if (banner) banner.remove();
    } catch (err) {
        console.error('Fetch error:', err);
        showToast('Failed to load data. Ensure tools/nusv_editor_server.py is running!', 'error');
        showServerOfflineModal();
        return;
    } finally {
        hideLoadingOverlay();
    }

    if (dataLoaded) {
        try {
            if (typeof ensureNavTabs === 'function') ensureNavTabs();
            setUnsaved(false);
            renderSidebar();
            renderEditor();
            showToast('Database loaded successfully!', 'success');
        } catch (renderErr) {
            console.error('Render error:', renderErr);
            showToast('Render error: ' + renderErr.message, 'error');
        }
    }
}



let _isSavingDataset = false;

async function saveActiveDataset() {
    if (_isSavingDataset) {
        console.warn('[saveActiveDataset] Save operation already in progress. Ignoring duplicate trigger.');
        return;
    }
    _isSavingDataset = true;

    // 1. Commit any currently focused input/field
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        try {
            document.activeElement.blur();
        } catch (_) {}
    }

    const tabMap = {
        actors: { filename: 'Actors.json', data: () => State.actors },
        classes: { filename: 'Classes.json', data: () => State.classes },
        races: { filename: 'Races.json', data: () => State.races },
        weapons: { filename: 'Weapons.json', data: () => State.weapons },
        armors: { filename: 'Armors.json', data: () => State.armors },
        skills: { filename: 'Skills.json', data: () => State.skills },
        items: { filename: 'Items.json', data: () => State.items },
        enemies: { filename: 'Enemies.json', data: () => State.enemies },
        states: { filename: 'States.json', data: () => State.states },
        animations: { filename: 'Animations.json', data: () => State.animations }
    };

    // Collect all tabs to save: explicitly modified tabs + current active tab
    const tabsToSave = new Set(State.modifiedTabs || []);
    if (State.currentTab) {
        tabsToSave.add(State.currentTab);
    }

    // Map unique files to save: filename -> data
    const filesToSave = new Map();
    for (const tab of tabsToSave) {
        const info = tabMap[tab];
        if (!info) continue;
        const filename = info.filename;
        const data = info.data();
        if (filename && data) {
            filesToSave.set(filename, data);
        }
    }

    if (filesToSave.size === 0) {
        showToast('Tidak ada data tab yang valid untuk disimpan.', 'warning');
        return;
    }

    // Visual button feedback
    const saveBtns = document.querySelectorAll('button[onclick*="saveActiveDataset"]');
    saveBtns.forEach(btn => {
        btn.disabled = true;
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '⏳ Menyimpan...';
    });

    let savedFiles = [];
    try {
        for (const [filename, data] of filesToSave.entries()) {
            showToast(`Menyimpan ${filename}...`, 'info');
            const res = await fetch(getApiUrl(`/api/save/${filename}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result && result.status === 'ok') {
                savedFiles.push(filename);
            } else {
                throw new Error((result && result.message) || `Gagal menyimpan ${filename}`);
            }
        }

        if (savedFiles.length > 0) {
            setUnsaved(false);
            showToast(`Berhasil menyimpan ${savedFiles.join(', ')} ke project!`, 'success');
        }
    } catch (err) {
        console.error('[saveActiveDataset Error]', err);
        showToast(`Gagal menyimpan database: ${err.message}`, 'error');
        if (typeof showServerOfflineModal === 'function' && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
            showServerOfflineModal();
        }
    } finally {
        _isSavingDataset = false;
        saveBtns.forEach(btn => {
            btn.disabled = false;
            if (btn.dataset.originalHtml) {
                btn.innerHTML = btn.dataset.originalHtml;
            }
        });
    }
}

// Global keyboard shortcut: Ctrl+S / Cmd+S to save to project
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            saveActiveDataset();
        }
    });
}
