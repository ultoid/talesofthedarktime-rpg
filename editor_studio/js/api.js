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
                <div style="font-size:2.2rem;">⚠️</div>
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
                <div>🐧 <strong>Linux:</strong> Jalankan <code>./run_editor.sh</code> di terminal</div>
                <div>🪟 <strong>Windows:</strong> Double-click <code>run_editor.bat</code></div>
                <div style="margin-top:6px;color:#94a3b8;">Atau ketik: <code>python3 tools/nusv_editor_server.py</code></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="document.getElementById('serverOfflineBanner').remove()">Tutup Notifikasi</button>
                <a href="http://localhost:5050/" class="btn btn-primary" style="text-decoration:none;display:inline-flex;align-items:center;">🌐 Buka http://localhost:5050</a>
                <a href="http://127.0.0.1:5050/" class="btn btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;">🌐 Buka 127.0.0.1</a>
                <button class="btn btn-secondary" onclick="reloadAllData()">🔄 Coba Hubungkan Ulang</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize application with auto-detection for file:// protocol


async function reloadAllData() {
    showToast('Loading project database...', 'info');
    let dataLoaded = false;
    try {
        const [pics, faces, chars, svs, enes, act, cls, wep, arm, ski, itm, ene, sta, anim, sys, ce] = await Promise.all([
            fetch(getApiUrl('/api/images/pictures')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/faces')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/characters')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/sv_actors')).then(r => r.json()).catch(() => []),
            fetch(getApiUrl('/api/images/sv_enemies')).then(r => r.json()).catch(() => []),
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
            fetch(getApiUrl('/api/data/CommonEvents.json')).then(r => r.json()).catch(() => [])
        ]);
        State.commonEvents = ce || [];

        State.pictures = pics || [];
        State.faces = faces || [];
        State.characters = chars || [];
        State.svActors = svs || [];
        State.enemiesPics = enes || [];

        State.actors = act || [];
        State.classes = cls || [];
        State.weapons = wep || [];
        State.armors = arm || [];
        State.skills = ski || [];
        State.items = itm || [];
        State.enemies = ene || [];
        State.states = sta || [];
        State.animations = anim || [];
        State.system = sys || {};

        dataLoaded = true;
        const banner = document.getElementById('serverOfflineBanner');
        if (banner) banner.remove();
    } catch (err) {
        console.error('Fetch error:', err);
        showToast('Failed to load data. Ensure tools/nusv_editor_server.py is running!', 'error');
        showServerOfflineModal();
        return;
    }

    if (dataLoaded) {
        try {
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



async function saveActiveDataset() {
    const tabMap = {
        actors: { filename: 'Actors.json', data: () => State.actors },
        classes: { filename: 'Classes.json', data: () => State.classes },
        weapons: { filename: 'Weapons.json', data: () => State.weapons },
        armors: { filename: 'Armors.json', data: () => State.armors },
        skills: { filename: 'Skills.json', data: () => State.skills },
        items: { filename: 'Items.json', data: () => State.items },
        enemies: { filename: 'Enemies.json', data: () => State.enemies },
        states: { filename: 'States.json', data: () => State.states }
    };

    // Collect all modified tabs and the current active tab
    const tabsToSave = new Set(State.modifiedTabs || []);
    if (State.currentTab && tabMap[State.currentTab]) {
        tabsToSave.add(State.currentTab);
    }

    if (tabsToSave.size === 0) {
        showToast('Tidak ada perubahan untuk disimpan.', 'info');
        return;
    }

    let savedFiles = [];
    for (const tab of tabsToSave) {
        const info = tabMap[tab];
        if (!info) continue;
        const filename = info.filename;
        const data = info.data();
        if (!data) continue;

        showToast(`Menyimpan ${filename}...`, 'info');
        try {
            const res = await fetch(getApiUrl(`/api/save/${filename}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.status === 'ok') {
                savedFiles.push(filename);
            } else {
                throw new Error(result.message || 'Gagal menyimpan');
            }
        } catch (err) {
            console.error(err);
            showToast(`Gagal menyimpan ${filename}: ${err.message}`, 'error');
            return;
        }
    }

    if (savedFiles.length > 0) {
        setUnsaved(false);
        showToast(`Berhasil menyimpan ${savedFiles.join(', ')} (backup otomatis tersimpan)!`, 'success');
    }
}
