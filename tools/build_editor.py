#!/usr/bin/env python3
"""
Generates the complete, rich NUSV Game Database Studio (editor.html)
with visual UI controls for ALL notetags across Actors, Classes, Weapons, Armors,
Skills, Items, Enemies, and States.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT_DIR / "editor.html"

HTML_CONTENT = r'''<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NUSV Database Extended Studio</title>
    <style>
        :root {
            --bg-color: #0b0f19;
            --sidebar-bg: #111827;
            --card-bg: #1e293b;
            --card-header: #0f172a;
            --border-color: #334155;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --accent-glow: rgba(59, 130, 246, 0.3);
            --gold: #f59e0b;
            --green: #10b981;
            --red: #ef4444;
            --purple: #8b5cf6;
            --cyan: #06b6d4;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --input-bg: #0f172a;
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: var(--font-family);
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Top Navbar */
        header {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand h1 {
            font-size: 1.15rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #60a5fa, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand span {
            font-size: 0.75rem;
            background: #1e293b;
            padding: 2px 8px;
            border-radius: 9999px;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
        }

        .unsaved-badge {
            display: none;
            font-size: 0.75rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid var(--red);
            color: #fca5a5;
            padding: 2px 8px;
            border-radius: 9999px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .nav-tabs {
            display: flex;
            gap: 4px;
            overflow-x: auto;
            max-width: 65%;
            padding: 2px 0;
        }

        .tab-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 600;
            white-space: nowrap;
            transition: all 0.2s ease;
        }

        .tab-btn:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
            color: #fff;
            background: var(--card-bg);
            border-color: var(--border-color);
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-primary {
            background: var(--accent);
            color: white;
            box-shadow: 0 0 15px var(--accent-glow);
        }

        .btn-primary:hover {
            background: var(--accent-hover);
        }

        .btn-secondary {
            background: #1e293b;
            color: var(--text-main);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: #334155;
        }

        /* Layout Grid */
        main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Left Sidebar (Item List) */
        .sidebar {
            width: 290px;
            background: var(--sidebar-bg);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            flex-shrink: 0;
        }

        .search-box {
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(0,0,0,0.1);
        }

        .search-input {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            outline: none;
        }

        .search-input:focus {
            border-color: var(--accent);
        }

        .item-list {
            flex: 1;
            overflow-y: auto;
            padding: 6px;
        }

        .list-item {
            padding: 8px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.15s ease;
            font-size: 0.85rem;
            margin-bottom: 2px;
        }

        .list-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .list-item.active {
            background: var(--card-bg);
            border-left: 3px solid var(--accent);
            font-weight: 600;
        }

        .list-id {
            color: var(--text-muted);
            font-size: 0.75rem;
            font-family: monospace;
            width: 32px;
            flex-shrink: 0;
        }

        .list-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
        }

        .list-badge {
            font-size: 0.7rem;
            padding: 1px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-muted);
            flex-shrink: 0;
        }

        /* Workspace Content */
        .workspace {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            background: radial-gradient(circle at top right, rgba(30, 41, 59, 0.5), transparent 70%);
        }

        .panel-container {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding-bottom: 60px;
        }

        /* Cards */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .card-header {
            background: var(--card-header);
            border-bottom: 1px solid var(--border-color);
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-header h2 {
            font-size: 1.05rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .card-body {
            padding: 16px 18px;
        }

        /* Form elements */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 14px;
        }

        .grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }

        .stat-grid-6 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 10px;
            margin-top: 8px;
        }

        .stat-card-input {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .stat-card-input label {
            font-size: 0.8rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .form-group {
            margin-bottom: 14px;
        }

        .form-group:last-child {
            margin-bottom: 0;
        }

        .form-group label {
            display: block;
            font-size: 0.82rem;
            font-weight: 600;
            margin-bottom: 5px;
            color: #cbd5e1;
        }

        .form-control {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            outline: none;
            transition: border-color 0.15s ease;
        }

        .form-control:focus {
            border-color: var(--accent);
        }

        textarea.form-control {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            line-height: 1.45;
            resize: vertical;
        }

        .helper-text {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 4px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            cursor: pointer;
            user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        /* Portrait & Preview Box */
        .portrait-preview-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0b1120;
            border: 1px dashed var(--border-color);
            border-radius: 8px;
            height: 220px;
            overflow: hidden;
            position: relative;
        }

        .portrait-img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
        }

        .portrait-empty {
            color: var(--text-muted);
            font-size: 0.8rem;
            text-align: center;
            padding: 12px;
        }

        /* Equip Slot Grid */
        .equip-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
        }

        .equip-slot-item {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
        }

        .slot-title {
            font-size: 0.78rem;
            font-weight: 700;
            color: #93c5fd;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Tables & Sliders */
        .stat-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            margin-top: 8px;
        }

        .stat-table th, .stat-table td {
            padding: 8px 10px;
            border-bottom: 1px solid var(--border-color);
            text-align: left;
        }

        .stat-table th {
            background: rgba(15, 23, 42, 0.9);
            color: var(--text-muted);
            font-weight: 600;
        }

        .stat-table tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        .slider-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
        }

        
        .stat-grid-8 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(115px, 1fr));
            gap: 10px;
            margin-top: 8px;
        }

        .filter-pills {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(0, 0, 0, 0.2);
        }

        .filter-pill {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
        }

        .filter-pill:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
        }

        .filter-pill.active {
            color: white;
            background: var(--accent);
            border-color: var(--accent);
            font-weight: 600;
        }

        /* Toast */
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid var(--accent);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .toast.success { border-left-color: var(--green); }
        .toast.error { border-left-color: var(--red); }
    </style>
</head>
<body>

    <!-- Header Navbar -->
    <header>
        <div class="brand">
            <h1>NUSV Extended Studio</h1>
            <span>v2.0 Visual Database</span>
            <div id="unsavedBadge" class="unsaved-badge">Perubahan Belum Disimpan</div>
        </div>

        <nav class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('actors')">🎭 Actors</button>
            <button class="tab-btn" onclick="switchTab('classes')">🛡️ Classes</button>
            <button class="tab-btn" onclick="switchTab('weapons')">⚔️ Weapons</button>
            <button class="tab-btn" onclick="switchTab('armors')">🛡️ Armors</button>
            <button class="tab-btn" onclick="switchTab('skills')">✨ Skills</button>
            <button class="tab-btn" onclick="switchTab('items')">🧪 Items</button>
            <button class="tab-btn" onclick="switchTab('enemies')">👾 Enemies</button>
            <button class="tab-btn" onclick="switchTab('states')">💫 States</button>
        </nav>

        <div class="header-actions">
            <button class="btn btn-secondary" onclick="reloadAllData()">🔄 Refresh</button>
            <button class="btn btn-primary" onclick="saveActiveDataset()">💾 Simpan ke Project</button>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <aside class="sidebar">
            <div class="search-box">
                <input type="text" id="searchInput" class="search-input" placeholder="Cari ID atau nama..." oninput="filterItems()">
            </div>
            <div id="sidebarFilters" class="filter-pills" style="display:none;"></div>
            <div class="item-list" id="sidebarList">
                <!-- Dynamically populated -->
            </div>
        </aside>

        <section class="workspace" id="workspace">
            <div class="panel-container" id="panelContainer">
                <!-- Dynamically populated editor panel -->
            </div>
        </section>
    </main>

    <!-- Notification Toast -->
    <div id="toast" class="toast">
        <span id="toastIcon">💾</span>
        <span id="toastMessage">Disimpan</span>
    </div>

    <script>
        // State Store
        const State = {
            currentTab: 'actors',
            pictures: [],
            actors: [],
            classes: [],
            weapons: [],
            armors: [],
            skills: [],
            items: [],
            enemies: [],
            states: [],
            system: {},
            selectedIndex: 1,
            hasUnsavedChanges: false,
            classPreviewLevel: 1,
            actorSimLevel: 1,
            armorSlotFilter: 'all'
        };

        // Standard definitions
        const PARAM_DEFS = [
            { id: 0, code: 'MHP', name: 'Max HP', icon: '❤️', color: '#f87171' },
            { id: 1, code: 'MMP', name: 'Max MP', icon: '💧', color: '#60a5fa' },
            { id: 2, code: 'ATK', name: 'Attack (ATK)', icon: '⚔️', color: '#fb923c' },
            { id: 3, code: 'DEF', name: 'Defense (DEF)', icon: '🛡️', color: '#34d399' },
            { id: 4, code: 'MAT', name: 'M.Attack (MAT)', icon: '🔮', color: '#a78bfa' },
            { id: 5, code: 'MDF', name: 'M.Defense (MDF)', icon: '🔰', color: '#38bdf8' },
            { id: 6, code: 'AGI', name: 'Agility (AGI)', icon: '⚡', color: '#facc15' },
            { id: 7, code: 'LUK', name: 'Luck (LUK)', icon: '🍀', color: '#4ade80' }
        ];

        const CORE_ATTRIBUTES = [
            { code: 'STR', name: 'Strength', icon: '💪', color: '#ef4444' },
            { code: 'INT', name: 'Intelligence', icon: '🧠', color: '#3b82f6' },
            { code: 'DEX', name: 'Dexterity', icon: '🎯', color: '#f59e0b' },
            { code: 'AGI', name: 'Agility', icon: '⚡', color: '#10b981' },
            { code: 'VIT', name: 'Vitality', icon: '🛡️', color: '#06b6d4' },
            { code: 'LUK', name: 'Luck', icon: '🎲', color: '#a855f7' }
        ];

        // Universal Notetag Utilities
        function getTagVal(note, tag, defVal = '') {
            if (!note) return defVal;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const m = note.match(new RegExp('<' + escaped + ':[ ]*(.+?)>', 'i'));
            return m ? m[1].trim() : defVal;
        }

        function hasTag(note, tag) {
            if (!note) return false;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp('<' + escaped + '>', 'i').test(note);
        }

        function setTagVal(item, tag, val) {
            let note = item.note || '';
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + ':[ ]*.*?>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (val !== null && val !== undefined && String(val).trim() !== '') {
                note = `<${tag}: ${String(val).trim()}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function setBoolTag(item, tag, enabled) {
            let note = item.note || '';
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + '>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (enabled) {
                note = `<${tag}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function setBlockTag(item, tag, content) {
            let note = item.note || '';
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp('<' + escaped + '>[\\s\\S]*?<\\/' + escaped + '>\\n?', 'gi');
            note = note.replace(regex, '').trim();
            if (content && content.trim()) {
                note = `<${tag}>\n${content.trim()}\n</${tag}>\n` + note;
            }
            item.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function getBlockTag(note, tag, defVal = '') {
            if (!note) return defVal;
            const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const m = note.match(new RegExp('<' + escaped + '>([\\s\\S]*?)<\\/' + escaped + '>', 'i'));
            return m ? m[1].trim() : defVal;
        }

        function updateRawNoteTextarea() {
            const el = document.getElementById('rawNoteTextarea');
            const items = getActiveList();
            const item = items[State.selectedIndex];
            if (el && item) {
                el.value = item.note || '';
            }
        }

        function onRawNoteInput(val) {
            const items = getActiveList();
            const item = items[State.selectedIndex];
            if (!item) return;
            item.note = val;
            setUnsaved(true);
            renderEditor();
        }

        // Initialize application
        window.addEventListener('DOMContentLoaded', async () => {
            await reloadAllData();
        });

        async function reloadAllData() {
            showToast('Memuat database project...', 'info');
            try {
                const [pics, act, cls, wep, arm, ski, itm, ene, sta, sys] = await Promise.all([
                    fetch('/api/pictures').then(r => r.json()).catch(() => []),
                    fetch('/api/data/Actors.json').then(r => r.json()),
                    fetch('/api/data/Classes.json').then(r => r.json()),
                    fetch('/api/data/Weapons.json').then(r => r.json()),
                    fetch('/api/data/Armors.json').then(r => r.json()),
                    fetch('/api/data/Skills.json').then(r => r.json()),
                    fetch('/api/data/Items.json').then(r => r.json()),
                    fetch('/api/data/Enemies.json').then(r => r.json()),
                    fetch('/api/data/States.json').then(r => r.json()),
                    fetch('/api/data/System.json').then(r => r.json())
                ]);

                State.pictures = pics || [];
                State.actors = act || [];
                State.classes = cls || [];
                State.weapons = wep || [];
                State.armors = arm || [];
                State.skills = ski || [];
                State.items = itm || [];
                State.enemies = ene || [];
                State.states = sta || [];
                State.system = sys || {};

                setUnsaved(false);
                renderSidebar();
                renderEditor();
                showToast('Database berhasil dimuat!', 'success');
            } catch (err) {
                console.error(err);
                showToast('Gagal memuat data dari server. Pastikan tools/nusv_editor_server.py berjalan!', 'error');
            }
        }

        function switchTab(tabKey) {
            State.currentTab = tabKey;
            State.selectedIndex = 1;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabKey));
            });
            document.getElementById('searchInput').value = '';
            renderSidebar();
            renderEditor();
        }

        function getActiveList() {
            switch (State.currentTab) {
                case 'actors': return State.actors;
                case 'classes': return State.classes;
                case 'weapons': return State.weapons;
                case 'armors': return State.armors;
                case 'skills': return State.skills;
                case 'items': return State.items;
                case 'enemies': return State.enemies;
                case 'states': return State.states;
                default: return [];
            }
        }

        function renderSidebar() {
            const listEl = document.getElementById('sidebarList');
            listEl.innerHTML = '';
            const items = getActiveList();
            const query = (document.getElementById('searchInput').value || '').toLowerCase();

            items.forEach((item, index) => {
                if (!item) return;
                if (query && !String(item.name).toLowerCase().includes(query) && !String(item.id).includes(query)) {
                    return;
                }

                const div = document.createElement('div');
                div.className = `list-item ${index === State.selectedIndex ? 'active' : ''}`;
                div.onclick = () => {
                    State.selectedIndex = index;
                    renderSidebar();
                    renderEditor();
                };

                let extraTag = '';
                if (State.currentTab === 'classes') {
                    const t = getTagVal(item.note, 'Class Tier', '1');
                    extraTag = `<span class="list-badge">T${t}</span>`;
                } else if (State.currentTab === 'weapons' || State.currentTab === 'armors' || State.currentTab === 'items') {
                    const r = getTagVal(item.note, 'NUSV Rarity', '');
                    if (r) extraTag = `<span class="list-badge">${escapeHtml(r)}</span>`;
                } else if (State.currentTab === 'states') {
                    const ty = getTagVal(item.note, 'NUSV Type', '');
                    if (ty === '1') extraTag = `<span class="list-badge" style="color:var(--green)">Buff</span>`;
                    else if (ty === '2') extraTag = `<span class="list-badge" style="color:var(--red)">Debuff</span>`;
                    else if (ty === '3') extraTag = `<span class="list-badge" style="color:var(--purple)">Passive</span>`;
                }

                div.innerHTML = `
                    <span class="list-id">#${item.id}</span>
                    <span class="list-name">${escapeHtml(item.name || '(Kosong)')}</span>
                    ${extraTag}
                `;
                listEl.appendChild(div);
            });
        }

        function filterItems() {
            renderSidebar();
        }

        function renderEditor() {
            const container = document.getElementById('panelContainer');
            const items = getActiveList();
            const item = items[State.selectedIndex];

            if (!item) {
                container.innerHTML = `<div style="text-align:center; padding:60px; color:var(--text-muted);">Pilih item dari sidebar kiri untuk mengedit.</div>`;
                return;
            }

            switch (State.currentTab) {
                case 'actors': renderActorEditor(container, item); break;
                case 'classes': renderClassEditor(container, item); break;
                case 'weapons': renderWeaponEditor(container, item); break;
                case 'armors': renderArmorEditor(container, item); break;
                case 'skills': renderSkillEditor(container, item); break;
                case 'items': renderItemEditor(container, item); break;
                case 'enemies': renderEnemyEditor(container, item); break;
                case 'states': renderStateEditor(container, item); break;
            }
        }

        // =====================================================================
        // 1. ACTORS EDITOR
        // =====================================================================
        
        const DERIVED_STAT_DEFS = [
            // Vitalitas & Regen
            { key: 'Max SP', name: 'Max SP (Stamina)', icon: '⚡', color: '#38bdf8', group: 'vital', placeholder: '+20' },
            { key: 'HRG Plus', name: 'HP Regen / Turn', icon: '❤️', color: '#f87171', group: 'vital', placeholder: '+3%' },
            { key: 'MRG Plus', name: 'MP Regen / Turn', icon: '💧', color: '#60a5fa', group: 'vital', placeholder: '+2%' },
            { key: 'TRG Plus', name: 'SP Regen / Turn', icon: '🔋', color: '#34d399', group: 'vital', placeholder: '+3%' },

            // Presisi & Kritis
            { key: 'HIT Plus', name: 'Hit Rate (Akurasi)', icon: '🎯', color: '#facc15', group: 'offensive', placeholder: '+5%' },
            { key: 'CRI Plus', name: 'Critical Rate', icon: '💥', color: '#fb923c', group: 'offensive', placeholder: '+5%' },
            { key: 'Critical Damage', name: 'Critical Damage', icon: '🗡️', color: '#ef4444', group: 'offensive', placeholder: '+25%' },
            { key: 'Armor Penetration', name: 'Penetrasi Armor Fisik', icon: '🏹', color: '#f59e0b', group: 'offensive', placeholder: '15%' },
            { key: 'Magic Penetration', name: 'Penetrasi Zirah Sihir', icon: '🔮', color: '#a78bfa', group: 'offensive', placeholder: '15%' },

            // Pertahanan & Mitigasi
            { key: 'PDR Plus', name: 'Reduksi Kerusakan Fisik', icon: '🔰', color: '#34d399', group: 'defensive', placeholder: '-10%' },
            { key: 'MDR Plus', name: 'Reduksi Kerusakan Magis', icon: '💠', color: '#38bdf8', group: 'defensive', placeholder: '-10%' },
            { key: 'GRD Plus', name: 'Efisiensi Guard (Tangkis)', icon: '🛡️', color: '#60a5fa', group: 'defensive', placeholder: '+20%' },
            { key: 'EVA Plus', name: 'Evasion (Elak Fisik)', icon: '💨', color: '#10b981', group: 'defensive', placeholder: '+5%' },
            { key: 'CEV Plus', name: 'Critical Evasion (Anti-Crit)', icon: '🛡️', color: '#4ade80', group: 'defensive', placeholder: '+5%' },
            { key: 'MEV Plus', name: 'Magic Evasion (Elak Sihir)', icon: '🍃', color: '#a3e635', group: 'defensive', placeholder: '+5%' },
            { key: 'MRF Plus', name: 'Magic Reflect (Pantul Sihir)', icon: '🪞', color: '#2dd4bf', group: 'defensive', placeholder: '+5%' },
            { key: 'CNT Plus', name: 'Counter Rate (Serangan Balik)', icon: '⚔️', color: '#f43f5e', group: 'defensive', placeholder: '+10%' },

            // Utilitas & Aggro
            { key: 'MCR Plus', name: 'MP Cost Rate (Hemat Mana)', icon: '🧪', color: '#818cf8', group: 'utility', placeholder: '-10%' },
            { key: 'TGR Plus', name: 'Target Rate (Aggro)', icon: '👁️', color: '#c084fc', group: 'utility', placeholder: '+20%' }
        ];

        function ensureItemParams(item) {
            if (!item.params || !Array.isArray(item.params) || item.params.length < 8) {
                item.params = [0, 0, 0, 0, 0, 0, 0, 0];
            }
        }

                // =====================================================================
        // ACTOR STAT SIMULATION ENGINE
        // =====================================================================
        function parsePercent(val) {
            if (!val) return 0;
            const clean = String(val).replace('%', '').trim();
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num / 100.0;
        }

        function parseBonusNum(val) {
            if (!val) return 0;
            const clean = String(val).replace('+', '').trim();
            const num = parseFloat(clean);
            return isNaN(num) ? 0 : num;
        }

        function getActorEquippedItems(actor) {
            const items = [];
            actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];

            // 0: Weapon
            if (actor.equips[0] && State.weapons[actor.equips[0]]) {
                items.push({ slot: 'Weapon', item: State.weapons[actor.equips[0]] });
            }

            // 1: Secondary
            if (actor.equips[1]) {
                const sId = actor.equips[1];
                if (State.weapons[sId] && (State.weapons[sId].note || '').includes('Secondary')) {
                    items.push({ slot: 'Secondary Weapon', item: State.weapons[sId] });
                } else if (State.armors[sId]) {
                    items.push({ slot: 'Secondary / Shield', item: State.armors[sId] });
                }
            }

            // 2: Helm, 3: Armor, 4: Boots, 5: Acc 1
            const slotMap = { 2: 'Helm', 3: 'Armor', 4: 'Boots', 5: 'Accessory 1' };
            for (let i = 2; i <= 5; i++) {
                if (actor.equips[i] && State.armors[actor.equips[i]]) {
                    items.push({ slot: slotMap[i], item: State.armors[actor.equips[i]] });
                }
            }

            // Acc 2 (from notetag)
            const secAccVal = getTagVal(actor.note, 'Second Accessory') || getTagVal(actor.note, 'Accessory 2');
            if (secAccVal) {
                const a2 = State.armors.find(a => a && (a.name === secAccVal || String(a.id) === secAccVal));
                if (a2) items.push({ slot: 'Accessory 2', item: a2 });
            }

            // 6: Relic
            if (actor.equips[6] && State.armors[actor.equips[6]]) {
                items.push({ slot: 'Relic', item: State.armors[actor.equips[6]] });
            }

            return items;
        }

        function calculateActorSimulation(actor, level) {
            const cls = State.classes[actor.classId] || {};
            const equipped = getActorEquippedItems(actor);
            const note = actor.note || '';
            const classNote = cls.note || '';

            // 1. Gather equipment bonuses
            const eqParams = [0, 0, 0, 0, 0, 0, 0, 0];
            const eqCore = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            let eqMaxSP = 0;
            let eqHit = 0, eqEva = 0, eqCri = 0, eqCdmg = 0, eqCev = 0;
            let eqGrd = 0, eqHrg = 0, eqMrg = 0, eqTrg = 0;
            let eqArmPen = 0, eqMagPen = 0, eqPdr = 0, eqMdr = 0;
            let eqCnt = 0, eqMev = 0, eqMrf = 0, eqMcr = 0, eqTgr = 0;
            const amplifiedElements = [];
            const setCounts = {};

            equipped.forEach(({ item }) => {
                if (!item) return;
                const inote = item.note || '';

                // Standard params
                if (Array.isArray(item.params)) {
                    for (let p = 0; p < 8; p++) {
                        eqParams[p] += (item.params[p] || 0);
                    }
                }

                // Core stats
                CORE_ATTRIBUTES.forEach(a => {
                    eqCore[a.code] += parseBonusNum(getTagVal(inote, a.code));
                });

                // Derived stats
                eqMaxSP += parseBonusNum(getTagVal(inote, 'Max SP'));
                eqHit += parsePercent(getTagVal(inote, 'HIT Plus'));
                eqEva += parsePercent(getTagVal(inote, 'EVA Plus'));
                eqCri += parsePercent(getTagVal(inote, 'CRI Plus'));
                eqCdmg += parsePercent(getTagVal(inote, 'Critical Damage'));
                eqCev += parsePercent(getTagVal(inote, 'CEV Plus'));
                eqGrd += parsePercent(getTagVal(inote, 'GRD Plus'));
                eqHrg += parsePercent(getTagVal(inote, 'HRG Plus'));
                eqMrg += parsePercent(getTagVal(inote, 'MRG Plus'));
                eqTrg += parsePercent(getTagVal(inote, 'TRG Plus'));
                eqArmPen += parsePercent(getTagVal(inote, 'Armor Penetration'));
                eqMagPen += parsePercent(getTagVal(inote, 'Magic Penetration'));
                eqPdr += parsePercent(getTagVal(inote, 'PDR Plus'));
                eqMdr += parsePercent(getTagVal(inote, 'MDR Plus'));
                eqCnt += parsePercent(getTagVal(inote, 'CNT Plus'));
                eqMev += parsePercent(getTagVal(inote, 'MEV Plus'));
                eqMrf += parsePercent(getTagVal(inote, 'MRF Plus'));
                eqMcr += parsePercent(getTagVal(inote, 'MCR Plus'));
                eqTgr += parsePercent(getTagVal(inote, 'TGR Plus'));

                // Element Amplify
                const eMatch = inote.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
                if (eMatch) {
                    amplifiedElements.push(`${eMatch[1]} ${eMatch[2]}`);
                }

                // Set Names
                const sName = getTagVal(inote, 'NUSV Set Name');
                if (sName) {
                    setCounts[sName] = (setCounts[sName] || 0) + 1;
                }
            });

            // 2. Class Growth Rates
            const growthRates = { STR: 0, INT: 0, DEX: 0, AGI: 0, VIT: 0, LUK: 0 };
            const growthStr = getTagVal(classNote, 'Class Stat Growth');
            if (growthStr) {
                growthStr.split(',').forEach(part => {
                    const m = part.trim().match(/([A-Z]{3})\s*\+?([\d.]+)/i);
                    if (m) {
                        const code = m[1].toUpperCase();
                        if (growthRates[code] !== undefined) growthRates[code] = parseFloat(m[2]) || 0;
                    }
                });
            }

            // 3. Baseline Core Attributes
            const baseCore = {};
            const growthCore = {};
            const totalCore = {};

            CORE_ATTRIBUTES.forEach(a => {
                let base = parseInt(getTagVal(note, `Base ${a.code}`), 10);
                if (isNaN(base) || base <= 0) {
                    base = parseInt(getTagVal(classNote, `Base ${a.code}`), 10);
                }
                if (isNaN(base) || base <= 0) base = 10;
                baseCore[a.code] = base;

                const growth = Math.round(growthRates[a.code] * (level - 1) * 10) / 10;
                growthCore[a.code] = growth;

                totalCore[a.code] = Math.max(1, Math.round(base + growth + eqCore[a.code]));
            });

            // 4. Vital Resources
            ensureClassParams(cls);
            const classMhp = (cls.params && cls.params[0] && cls.params[0][level]) ? cls.params[0][level] : 450;
            const classMmp = (cls.params && cls.params[1] && cls.params[1][level]) ? cls.params[1][level] : 40;

            const totalMhp = Math.round(classMhp + (totalCore.VIT * 15) + (totalCore.STR * 5) + eqParams[0]);
            const totalMmp = Math.round(classMmp + (totalCore.INT * 8) + eqParams[1]);
            const totalMsp = Math.round(50 + (totalCore.VIT * 5) + (totalCore.STR * 2) + eqMaxSP);

            // 5. Combat Parameters
            const mainWeap = State.weapons[actor.equips[0]];
            const isFinesse = mainWeap && (/finesse|bow|dagger|crossbow|whip/i.test(mainWeap.note || '') || mainWeap.wtypeId === 7 || mainWeap.wtypeId === 8);

            const totalAtk = isFinesse ? Math.round((totalCore.DEX * 2) + (totalCore.STR * 0.5) + eqParams[2])
                                       : Math.round((totalCore.STR * 2) + (totalCore.DEX * 0.5) + eqParams[2]);

            const classDef = (cls.params && cls.params[3] && cls.params[3][level]) ? cls.params[3][level] : 15;
            const totalDef = Math.round(classDef + (totalCore.VIT * 1.5) + (totalCore.STR * 0.5) + eqParams[3]);

            const classMat = (cls.params && cls.params[4] && cls.params[4][level]) ? cls.params[4][level] : 10;
            const totalMat = Math.round(classMat + (totalCore.INT * 2) + eqParams[4]);

            const classMdf = (cls.params && cls.params[5] && cls.params[5][level]) ? cls.params[5][level] : 10;
            const totalMdf = Math.round(classMdf + (totalCore.INT * 1.2) + (totalCore.VIT * 0.8) + eqParams[5]);

            const classAgi = (cls.params && cls.params[6] && cls.params[6][level]) ? cls.params[6][level] : 10;
            const totalAgi = Math.round(classAgi + (totalCore.AGI * 1.5) + eqParams[6]);

            const classLuk = (cls.params && cls.params[7] && cls.params[7][level]) ? cls.params[7][level] : 10;
            const totalLuk = Math.round(classLuk + totalCore.LUK + eqParams[7]);

            // 6. Derived Combat Stats
            const hitRate = Math.min(1.0, 0.85 + (totalCore.DEX * 0.002) + eqHit);
            const evaRate = Math.min(0.80, 0.02 + (totalCore.AGI * 0.002) + (totalCore.LUK * 0.0005) + eqEva);
            const critRate = Math.min(0.85, 0.03 + (totalCore.DEX * 0.002) + (totalCore.LUK * 0.001) + eqCri);
            const critDmg = 1.50 + (totalCore.STR * 0.003) + (totalCore.DEX * 0.002) + eqCdmg;
            const critEva = (totalCore.LUK * 0.0015) + (totalCore.VIT * 0.001) + eqCev;
            const guardEff = 1.00 + (totalCore.VIT * 0.005) + eqGrd;

            const hpRegen = (totalCore.VIT * 0.0003) + eqHrg;
            const mpRegen = (totalCore.INT * 0.0003) + eqMrg;
            const spRegen = 0.03 + (totalCore.AGI * 0.0004) + (totalCore.VIT * 0.0002) + eqTrg;

            const targetRate = 1.00 + eqTgr;

            // Check Active Set Bonuses
            const activeSets = [];
            Object.keys(setCounts).forEach(sName => {
                const count = setCounts[sName];
                if (count >= 2) {
                    activeSets.push(`${sName} (${count} Bagian Aktif)`);
                }
            });

            return {
                level,
                cls,
                isFinesse,
                baseCore,
                growthCore,
                eqCore,
                totalCore,
                classMhp,
                totalMhp,
                classMmp,
                totalMmp,
                totalMsp,
                totalAtk,
                totalDef,
                totalMat,
                totalMdf,
                totalAgi,
                totalLuk,
                hitRate,
                evaRate,
                critRate,
                critDmg,
                critEva,
                guardEff,
                hpRegen,
                mpRegen,
                spRegen,
                armPen: eqArmPen,
                magPen: eqMagPen,
                pdr: eqPdr,
                mdr: eqMdr,
                cnt: eqCnt,
                mev: eqMev,
                mrf: eqMrf,
                mcr: eqMcr,
                targetRate,
                amplifiedElements,
                activeSets,
                equippedCount: equipped.length
            };
        }

        function onActorSimLevelChange(lvl) {
            State.actorSimLevel = parseInt(lvl, 10) || 1;
            const badge = document.getElementById('actorSimLevelBadge');
            if (badge) badge.innerText = `Level ${State.actorSimLevel}`;
            updateActorSimulationLive();
        }

        function updateActorSimulationLive() {
            const actor = State.actors[State.selectedIndex];
            if (!actor) return;
            const level = State.actorSimLevel || 1;
            const res = calculateActorSimulation(actor, level);

            // 1. Vital
            const elMhp = document.getElementById('sim-mhp');
            if (elMhp) elMhp.innerText = res.totalMhp.toLocaleString();
            const elMhpD = document.getElementById('sim-mhp-detail');
            if (elMhpD) elMhpD.innerText = `Class ${res.classMhp} + VIT/STR + Eq`;

            const elMmp = document.getElementById('sim-mmp');
            if (elMmp) elMmp.innerText = res.totalMmp.toLocaleString();
            const elMmpD = document.getElementById('sim-mmp-detail');
            if (elMmpD) elMmpD.innerText = `Class ${res.classMmp} + INT + Eq`;

            const elMsp = document.getElementById('sim-msp');
            if (elMsp) elMsp.innerText = res.totalMsp.toLocaleString();
            const elMspD = document.getElementById('sim-msp-detail');
            if (elMspD) elMspD.innerText = `Base 50 + VIT/STR + Eq`;

            // 2. 6 Core Stats
            CORE_ATTRIBUTES.forEach(a => {
                const el = document.getElementById(`sim-core-${a.code}`);
                if (el) el.innerText = res.totalCore[a.code];
                const elD = document.getElementById(`sim-core-${a.code}-detail`);
                if (elD) {
                    const g = res.growthCore[a.code] ? ` + Grw ${res.growthCore[a.code]}` : '';
                    const eq = res.eqCore[a.code] ? ` + Eq ${res.eqCore[a.code] > 0 ? '+' : ''}${res.eqCore[a.code]}` : '';
                    elD.innerText = `Base ${res.baseCore[a.code]}${g}${eq}`;
                }
            });

            // 3. Combat Params
            const elAtk = document.getElementById('sim-atk');
            if (elAtk) elAtk.innerText = res.totalAtk;
            const elAtkD = document.getElementById('sim-atk-detail');
            if (elAtkD) elAtkD.innerText = res.isFinesse ? 'Finesse: (DEX×2 + STR×0.5)' : 'Melee: (STR×2 + DEX×0.5)';

            const elDef = document.getElementById('sim-def');
            if (elDef) elDef.innerText = res.totalDef;
            const elMat = document.getElementById('sim-mat');
            if (elMat) elMat.innerText = res.totalMat;
            const elMdf = document.getElementById('sim-mdf');
            if (elMdf) elMdf.innerText = res.totalMdf;
            const elSpd = document.getElementById('sim-spd');
            if (elSpd) elSpd.innerText = res.totalAgi;
            const elLuk = document.getElementById('sim-luk');
            if (elLuk) elLuk.innerText = res.totalLuk;

            // 4. Derived Combat Stats
            const updateStatBadge = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.innerText = text;
            };

            updateStatBadge('sim-hit', `${(res.hitRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-eva', `${(res.evaRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-cri', `${(res.critRate * 100).toFixed(1)}%`);
            updateStatBadge('sim-cdmg', `${(res.critDmg * 100).toFixed(1)}%`);
            updateStatBadge('sim-cev', `${(res.critEva * 100).toFixed(1)}%`);
            updateStatBadge('sim-grd', `${(res.guardEff * 100).toFixed(1)}%`);

            updateStatBadge('sim-hrg', `+${(res.hpRegen * 100).toFixed(2)}%/T`);
            updateStatBadge('sim-mrg', `+${(res.mpRegen * 100).toFixed(2)}%/T`);
            updateStatBadge('sim-trg', `+${(res.spRegen * 100).toFixed(2)}%/T`);

            updateStatBadge('sim-armpen', res.armPen ? `${(res.armPen * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-magpen', res.magPen ? `${(res.magPen * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-pdr', res.pdr ? `${(res.pdr * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mdr', res.mdr ? `${(res.mdr * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-cnt', res.cnt ? `${(res.cnt * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mev', res.mev ? `${(res.mev * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mrf', res.mrf ? `${(res.mrf * 100).toFixed(0)}%` : '0%');
            updateStatBadge('sim-mcr', res.mcr ? `${(res.mcr * 100).toFixed(0)}%` : '100%');
            updateStatBadge('sim-tgr', `${(res.targetRate * 100).toFixed(0)}%`);

            // Extra badges
            const extraBox = document.getElementById('sim-extra-tags');
            if (extraBox) {
                const badges = [];
                res.amplifiedElements.forEach(e => {
                    badges.push(`<span class="list-badge" style="color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:3px 8px;">🔥 Amplify: ${escapeHtml(e)}</span>`);
                });
                res.activeSets.forEach(s => {
                    badges.push(`<span class="list-badge" style="color:#10b981; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:3px 8px;">🛡️ Set: ${escapeHtml(s)}</span>`);
                });
                extraBox.innerHTML = badges.length ? badges.join(' ') : `<span style="font-size:0.75rem; color:var(--text-muted);">Tidak ada penguatan elemen atau set bonus aktif.</span>`;
            }
        }

        function renderActorEditor(container, actor) {
            const note = actor.note || '';
            const secAccVal = getTagVal(note, 'Second Accessory') || getTagVal(note, 'Accessory 2');
            const portrait = (getTagVal(note, 'Portrait') || getTagVal(note, 'Status Image')).replace(/\.(png|jpe?g)$/i, '');
            const isLocked = hasTag(note, 'LockActor');
            const defaultRow = getTagVal(note, 'Default Row', '1');
            const race = getTagVal(note, 'Race', '');
            const passiveState = getTagVal(note, 'Passive State', '');
            const profile = getBlockTag(note, 'Profile', actor.profile || '');

            const coreStats = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreStats[a.code] = getTagVal(note, `Base ${a.code}`, '10');
            });

            const accessories = State.armors.filter(a => a && a.etypeId === 6);
            const relics = State.armors.filter(a => a && a.etypeId === 7);
            const weaponsList = State.weapons.filter(w => w);
            const secondaryList = [
                ...State.weapons.filter(w => w && !w.note?.includes('2H Primary+Secondary')),
                ...State.armors.filter(a => a && a.etypeId === 2)
            ];
            const helms = State.armors.filter(a => a && a.etypeId === 3);
            const bodyArmors = State.armors.filter(a => a && a.etypeId === 4);
            const boots = State.armors.filter(a => a && a.etypeId === 5);

            actor.equips = actor.equips || [0, 0, 0, 0, 0, 0, 0];
            const simLevel = State.actorSimLevel || actor.initialLevel || 1;
            const actorClass = State.classes[actor.classId] || { name: 'Unknown Class' };

            container.innerHTML = `
                <!-- IDENTITAS & POTRET -->
                <div class="card">
                    <div class="card-header">
                        <h2>🎭 Karakter: #${actor.id} ${escapeHtml(actor.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(actor.nickname || '')} • Kelas: ${escapeHtml(actorClass.name)}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Nama Karakter</label>
                                    <input type="text" class="form-control" value="${escapeHtml(actor.name || '')}" onchange="actor.name=this.value; setUnsaved(true); renderSidebar(); updateActorSimulationLive();">
                                </div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Level Awal</label>
                                        <input type="number" min="1" max="99" class="form-control" value="${actor.initialLevel || 1}" onchange="actor.initialLevel=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                    <div class="form-group">
                                        <label>Level Max</label>
                                        <input type="number" min="1" max="99" class="form-control" value="${actor.maxLevel || 99}" onchange="actor.maxLevel=parseInt(this.value,10); setUnsaved(true);">
                                    </div>
                                </div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Ras (&lt;Race: ...&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Contoh: Avesari, Human" value="${escapeHtml(race)}" onchange="setTagVal(actor, 'Race', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Posisi Baris (&lt;Default Row: X&gt;)</label>
                                        <select class="form-control" onchange="setTagVal(actor, 'Default Row', this.value);">
                                            <option value="1" ${defaultRow === '1' ? 'selected' : ''}>Baris Depan (Front Row)</option>
                                            <option value="2" ${defaultRow === '2' ? 'selected' : ''}>Baris Tengah (Middle Row)</option>
                                            <option value="3" ${defaultRow === '3' ? 'selected' : ''}>Baris Belakang (Back Row)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Pasif Otomatis (&lt;Passive State: ID&gt;)</label>
                                    <select class="form-control" onchange="setTagVal(actor, 'Passive State', this.value);">
                                        <option value="">(Tidak Ada)</option>
                                        ${State.states.filter(s => s).map(s => `<option value="${s.id}" ${passiveState === String(s.id) ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="checkbox-label" style="margin-top:8px;">
                                        <input type="checkbox" ${isLocked ? 'checked' : ''} onchange="setBoolTag(actor, 'LockActor', this.checked);">
                                        <span>🔒 Kunci Karakter (&lt;LockActor&gt; - tidak dapat dikeluarkan dari party)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style="font-size:0.82rem; font-weight:600; display:block; margin-bottom:6px;">Pratinjau Potret (&lt;Portrait: ...&gt;)</label>
                                <div class="portrait-preview-box">
                                    ${portrait ? `<img src="img/pictures/${portrait}.png" class="portrait-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'portrait-empty\\'>⚠️ File tidak ditemukan: img/pictures/${portrait}.png</div>';">` : `<div class="portrait-empty">Belum ada potret diset.<br>Pilih dari daftar di bawah.</div>`}
                                </div>
                                <div class="form-group" style="margin-top:10px;">
                                    <label>Pilih File dari img/pictures/</label>
                                    <select class="form-control" onchange="setTagVal(actor, 'Portrait', this.value); renderEditor();">
                                        <option value="">(Tanpa Potret / Gunakan Face Graphic)</option>
                                        ${State.pictures.map(p => {
                                            const base = p.replace(/\.(png|jpe?g)$/i, '');
                                            return `<option value="${base}" ${portrait === base ? 'selected' : ''}>${p}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top:12px;">
                            <label>Profil &amp; Lore Narasi (&lt;Profile&gt; ... &lt;/Profile&gt;)</label>
                            <textarea class="form-control" rows="3" onchange="setBlockTag(actor, 'Profile', this.value);">${escapeHtml(profile)}</textarea>
                        </div>
                    </div>
                </div>

                <!-- 📊 SIMULASI TOTAL STAT KARAKTER (LIVE BUILD SIMULATOR) -->
                <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.5); box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);">
                    <div class="card-header" style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); flex-wrap:wrap; gap:10px;">
                        <div>
                            <h2>📊 Simulasi Total Stat Karakter (Live Build Simulator)</h2>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Perhitungan instan seluruh stat pada level dan perlengkapan aktif.</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.8rem; color:var(--text-muted);">Simulasi Level:</span>
                            <span id="actorSimLevelBadge" style="font-size:1.1rem; font-weight:700; color:var(--accent); background:rgba(59,130,246,0.15); padding:2px 12px; border-radius:6px; border:1px solid rgba(59,130,246,0.3);">Level ${simLevel}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Slider Level Simulasi -->
                        <div class="slider-box" style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <label style="font-weight:700; font-size:0.85rem;">🎯 Geser Level Karakter untuk Simulasi (Lv 1 - 99):</label>
                                <span style="font-size:0.8rem; color:var(--text-muted);">Kelas: <strong style="color:#fff;">${escapeHtml(actorClass.name)}</strong></span>
                            </div>
                            <input type="range" min="1" max="99" value="${simLevel}" class="form-control" style="width:100%; cursor:pointer;" oninput="onActorSimLevelChange(this.value)">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                                <span>Lv 1 (Awal)</span>
                                <span>Lv 10 (Tier 1 Max)</span>
                                <span>Lv 30 (Tier 2 Max)</span>
                                <span>Lv 50 (Tier 4 Max)</span>
                                <span>Lv 99 (Puncak)</span>
                            </div>
                        </div>

                        <!-- 1. SUMBER DAYA VITAL -->
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">❤️ Sumber Daya Vital (Health, Mana, Stamina):</div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 3px solid #f87171;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">❤️ Max HP (Kapasitas Darah)</div>
                                <div style="font-size:1.35rem; font-weight:700; color:#f87171;" id="sim-mhp">0</div>
                                <div style="font-size:0.7rem; color:var(--text-muted);" id="sim-mhp-detail">Class HP + VIT/STR + Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #60a5fa;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">💧 Max MP (Kapasitas Mana)</div>
                                <div style="font-size:1.35rem; font-weight:700; color:#60a5fa;" id="sim-mmp">0</div>
                                <div style="font-size:0.7rem; color:var(--text-muted);" id="sim-mmp-detail">Class MP + INT + Eq</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #38bdf8;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">⚡ Max SP (Stamina Points)</div>
                                <div style="font-size:1.35rem; font-weight:700; color:#38bdf8;" id="sim-msp">0</div>
                                <div style="font-size:0.7rem; color:var(--text-muted);" id="sim-msp-detail">Base 50 + VIT/STR + Eq</div>
                            </div>
                        </div>

                        <!-- 2. TOTAL 6 ATRIBUT DASAR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:6px;">📊 Total 6 Atribut Dasar (Base Attributes):</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            ${CORE_ATTRIBUTES.map(a => `
                                <div class="stat-card-input" style="border-left: 2px solid ${a.color};">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="color:${a.color}; font-weight:700; font-size:0.82rem;">${a.icon} ${a.code}</span>
                                        <span style="font-size:1.15rem; font-weight:700; color:${a.color};" id="sim-core-${a.code}">0</span>
                                    </div>
                                    <div style="font-size:0.68rem; color:var(--text-muted);" id="sim-core-${a.code}-detail">Base + Grw + Eq</div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- 3. PARAMETER TEMPUR UTAMA -->
                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;">⚔️ Parameter Tempur Utama (Offense &amp; Defense):</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 2px solid #fb923c;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">⚔️ ATK (Serangan Fisik)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#fb923c;" id="sim-atk">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);" id="sim-atk-detail">STR/DEX + Weapon</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #34d399;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">🛡️ DEF (Pertahanan Fisik)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#34d399;" id="sim-def">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);">VIT×1.5 + STR×0.5 + Armor</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #a78bfa;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">🔮 MAT (Serangan Magis)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#a78bfa;" id="sim-mat">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);">INT×2 + Equip MAT</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #38bdf8;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">🔰 MDF (Pertahanan Magis)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#38bdf8;" id="sim-mdf">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);">INT×1.2 + VIT×0.8 + Equip</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #facc15;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">⚡ Speed (Kecepatan Aksi)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#facc15;" id="sim-spd">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);">AGI×1.5 + Equip AGI</div>
                            </div>
                            <div class="stat-card-input" style="border-left: 2px solid #4ade80;">
                                <div style="font-size:0.75rem; color:var(--text-muted);">🍀 LUK (Keberuntungan)</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#4ade80;" id="sim-luk">0</div>
                                <div style="font-size:0.68rem; color:var(--text-muted);">LUK + Equip LUK</div>
                            </div>
                        </div>

                        <!-- 4. STAT TURUNAN LENGKAP -->
                        <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">⚡ Stat Turunan Lengkap (Presisi, Kritis, Mitigasi &amp; Regen):</div>
                        <div class="stat-grid-8" style="margin-bottom:14px;">
                            <div class="stat-card-input">
                                <label style="color:#facc15;">🎯 Akurasi (HIT)</label>
                                <div style="font-size:1rem; font-weight:700; color:#facc15;" id="sim-hit">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#10b981;">💨 Elak (EVA)</label>
                                <div style="font-size:1rem; font-weight:700; color:#10b981;" id="sim-eva">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#fb923c;">💥 Crit Rate</label>
                                <div style="font-size:1rem; font-weight:700; color:#fb923c;" id="sim-cri">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#ef4444;">🗡️ Crit Dmg</label>
                                <div style="font-size:1rem; font-weight:700; color:#ef4444;" id="sim-cdmg">150%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#4ade80;">🛡️ Anti-Crit</label>
                                <div style="font-size:1rem; font-weight:700; color:#4ade80;" id="sim-cev">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#60a5fa;">🛡️ Guard Mitigasi</label>
                                <div style="font-size:1rem; font-weight:700; color:#60a5fa;" id="sim-grd">100%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#f87171;">❤️ HP Regen</label>
                                <div style="font-size:1rem; font-weight:700; color:#f87171;" id="sim-hrg">0%/T</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#38bdf8;">🔋 SP Regen</label>
                                <div style="font-size:1rem; font-weight:700; color:#38bdf8;" id="sim-trg">3%/T</div>
                            </div>
                        </div>

                        <div class="stat-grid-8" style="margin-bottom:14px;">
                            <div class="stat-card-input">
                                <label style="color:#f59e0b;">🏹 Penetrasi Fisik</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-armpen">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#a78bfa;">🔮 Penetrasi Sihir</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-magpen">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#34d399;">🔰 Reduksi Fisik</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-pdr">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#38bdf8;">💠 Reduksi Magis</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-mdr">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#f43f5e;">⚔️ Counter</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-cnt">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#a3e635;">🍃 Elak Sihir</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-mev">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#2dd4bf;">🪞 Pantul Sihir</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-mrf">0%</div>
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#c084fc;">👁️ Target Rate</label>
                                <div style="font-size:0.95rem; font-weight:700;" id="sim-tgr">100%</div>
                            </div>
                        </div>

                        <!-- 5. SET BONUS & ELEMEN -->
                        <div style="background:rgba(15,23,42,0.6); border:1px solid var(--border-color); border-radius:6px; padding:8px 12px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Set Bonus &amp; Elemen:</span>
                            <div id="sim-extra-tags" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;"></div>
                        </div>
                    </div>
                </div>

                <!-- 6 BASE ATRIBUT KARAKTER -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Atribut Dasar Bawaan Karakter (Baseline Base Stats)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Base STR: X&gt; dll. Baseline murni tanpa perlengkapan.</span>
                    </div>
                    <div class="card-body">
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="number" min="1" max="999" class="form-control" value="${coreStats[attr.code]}" onchange="setTagVal(actor, 'Base ${attr.code}', this.value); updateActorSimulationLive();">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- INITIAL EQUIPS -->
                <div class="card">
                    <div class="card-header">
                        <h2>🛡️ Perlengkapan Awal (8 Slot Nusvanir)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Mengubah item langsung memperbarui simulasi di atas.</span>
                    </div>
                    <div class="card-body">
                        <div class="equip-grid">
                            <div class="equip-slot-item">
                                <div class="slot-title">⚔️ 1. Weapon (Utama)</div>
                                <select class="form-control" onchange="actor.equips[0]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${weaponsList.map(w => `<option value="${w.id}" ${actor.equips[0] === w.id ? 'selected' : ''}>#${w.id} ${escapeHtml(w.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🛡️ 2. Secondary (Off-Hand)</div>
                                <select class="form-control" onchange="actor.equips[1]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${secondaryList.map(s => `<option value="${s.id}" ${actor.equips[1] === s.id ? 'selected' : ''}>#${s.id} ${escapeHtml(s.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🎩 3. Helm (Kepala)</div>
                                <select class="form-control" onchange="actor.equips[2]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${helms.map(h => `<option value="${h.id}" ${actor.equips[2] === h.id ? 'selected' : ''}>#${h.id} ${escapeHtml(h.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🥋 4. Armor (Badan)</div>
                                <select class="form-control" onchange="actor.equips[3]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${bodyArmors.map(b => `<option value="${b.id}" ${actor.equips[3] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">👢 5. Boots (Kaki)</div>
                                <select class="form-control" onchange="actor.equips[4]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${boots.map(b => `<option value="${b.id}" ${actor.equips[4] === b.id ? 'selected' : ''}>#${b.id} ${escapeHtml(b.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">💍 6. Accessory 1</div>
                                <select class="form-control" onchange="actor.equips[5]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${accessories.map(a => `<option value="${a.id}" ${actor.equips[5] === a.id ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item" style="border-color:var(--accent); background:rgba(59,130,246,0.1);">
                                <div class="slot-title" style="color:#60a5fa;">💍 6. Accessory 2 (&lt;Second Accessory&gt;)</div>
                                <select class="form-control" onchange="setTagVal(actor, 'Second Accessory', this.value); updateActorSimulationLive();">
                                    <option value="">(Kosong)</option>
                                    ${accessories.map(a => {
                                        const isSel = secAccVal === a.name || secAccVal === String(a.id);
                                        return `<option value="${escapeHtml(a.name)}" ${isSel ? 'selected' : ''}>#${a.id} ${escapeHtml(a.name)}</option>`;
                                    }).join('')}
                                </select>
                            </div>

                            <div class="equip-slot-item">
                                <div class="slot-title">🔮 7. Relic</div>
                                <select class="form-control" onchange="actor.equips[6]=parseInt(this.value,10); setUnsaved(true); updateActorSimulationLive();">
                                    <option value="0">(Kosong)</option>
                                    ${relics.map(r => `<option value="${r.id}" ${actor.equips[6] === r.id ? 'selected' : ''}>#${r.id} ${escapeHtml(r.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value); updateActorSimulationLive();">${escapeHtml(actor.note || '')}</textarea>
                    </div>
                </div>
            `;

            // Run simulation calculation initially
            setTimeout(updateActorSimulationLive, 10);
        }

// =====================================================================
        // 2. CLASSES EDITOR
        // =====================================================================
        function ensureClassParams(cls) {
            if (!cls.params || !Array.isArray(cls.params) || cls.params.length < 8) {
                cls.params = [
                    Array(100).fill(400), Array(100).fill(40),
                    Array(100).fill(15), Array(100).fill(15),
                    Array(100).fill(10), Array(100).fill(10),
                    Array(100).fill(12), Array(100).fill(10)
                ];
            }
            for (let p = 0; p < 8; p++) {
                if (!Array.isArray(cls.params[p]) || cls.params[p].length < 100) {
                    const arr = Array(100).fill(10);
                    if (Array.isArray(cls.params[p])) {
                        for (let i = 0; i < cls.params[p].length; i++) arr[i] = cls.params[p][i];
                    }
                    cls.params[p] = arr;
                }
            }
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

            const coreStats = {};
            CORE_ATTRIBUTES.forEach(attr => {
                coreStats[attr.code] = getTagVal(note, `Base ${attr.code}`, '10');
            });

            const curLvl = Math.max(1, Math.min(99, State.classPreviewLevel || 1));

            const classFromOptions = [`<option value="0" ${currentFrom === '0' ? 'selected' : ''}>(Tidak ada - Kelas Dasar)</option>`];
            State.classes.forEach(c => {
                if (!c || c.id === cls.id) return;
                classFromOptions.push(`<option value="${c.id}" ${currentFrom === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`);
            });

            container.innerHTML = `
                <!-- IDENTITAS & PROFIL KELAS -->
                <div class="card">
                    <div class="card-header">
                        <h2>🛡️ Kelas: #${cls.id} ${escapeHtml(cls.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Tier ${currentTier}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Tingkatan Kelas (Tier)</label>
                                    <select class="form-control" onchange="setTagVal(cls, 'Class Tier', this.value); renderSidebar(); renderEditor();">
                                        <option value="1" ${currentTier === '1' ? 'selected' : ''}>Tier 1 - Kelas Dasar (Novice)</option>
                                        <option value="2" ${currentTier === '2' ? 'selected' : ''}>Tier 2 - Kelas Lanjutan (Apprentice)</option>
                                        <option value="3" ${currentTier === '3' ? 'selected' : ''}>Tier 3 - Kelas Spesialis (Adept)</option>
                                        <option value="4" ${currentTier === '4' ? 'selected' : ''}>Tier 4 - Kelas Master (Expert)</option>
                                        <option value="5" ${currentTier === '5' ? 'selected' : ''}>Tier 5 - Kelas Legenda (Paragon)</option>
                                        <option value="6" ${currentTier === '6' ? 'selected' : ''}>Tier 6 - Kelas Transenden (Mythic)</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Prasyarat Naik Kelas (&lt;Class Change From: ID&gt;)</label>
                                    <select class="form-control" onchange="setTagVal(cls, 'Class Change From', this.value !== '0' ? this.value : '');">
                                        ${classFromOptions.join('')}
                                    </select>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label>Min Level Naik</label>
                                        <input type="number" class="form-control" placeholder="Lv" value="${currentChangeLvl}" onchange="setTagVal(cls, 'Class Change Level', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Item Prasyarat</label>
                                        <input type="number" class="form-control" placeholder="Item ID" value="${currentChangeItem}" onchange="setTagVal(cls, 'Class Change Item', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Switch ID</label>
                                        <input type="number" class="form-control" placeholder="Switch" value="${currentChangeSwitch}" onchange="setTagVal(cls, 'Class Change Switch', this.value);">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Batas Level Khusus (&lt;Class Max Level: X&gt;)</label>
                                    <input type="number" class="form-control" placeholder="Default sesuai Tier" value="${currentMaxLvl}" onchange="setTagVal(cls, 'Class Max Level', this.value);">
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Ikon Kelas (&lt;Class Icon: ID&gt;)</label>
                                    <input type="number" class="form-control" value="${currentIcon}" onchange="setTagVal(cls, 'Class Icon', this.value);">
                                </div>

                                <div class="form-group">
                                    <label>Deskripsi Naratif Kelas (&lt;Class Description&gt;)</label>
                                    <textarea class="form-control" rows="5" onchange="setBlockTag(cls, 'Class Description', this.value);">${escapeHtml(currentDesc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6 BASE ATRIBUT KELAS -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Atribut Dasar Nusvanir (6 Core Attributes)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Base STR: X&gt; dll. (Default: 10 jika kosong)</span>
                    </div>
                    <div class="card-body">
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="number" min="1" max="999" class="form-control" value="${coreStats[attr.code]}" onchange="setTagVal(cls, 'Base ${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div class="form-group" style="margin-top:14px;">
                            <label>Pertumbuhan Stat per Class Level (&lt;Class Stat Growth: ...&gt;)</label>
                            <input type="text" class="form-control" placeholder="Contoh: STR +1.2, VIT +1.0, AGI +0.5" value="${escapeHtml(currentGrowth)}" onchange="setTagVal(cls, 'Class Stat Growth', this.value);">
                            <div class="helper-text">Stat alami yang otomatis bertambah setiap kali level kelas ini meningkat.</div>
                        </div>
                    </div>
                </div>

                <!-- 8 KURVA PARAMETER STANDAR RPG MAKER -->
                <div class="card">
                    <div class="card-header" style="flex-wrap:wrap; gap:10px;">
                        <div>
                            <h2>📈 Parameter Kurva Bawaan RPG Maker (8 Parameters)</h2>
                            <div style="font-size:0.8rem; color:var(--text-muted);">MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK (Level 1 s/d Level 99)</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-secondary" onclick="generateClassCurve('all', 'smooth')" style="font-size:0.8rem; padding:6px 10px;">✨ Haluskan Kurva (Semua)</button>
                            <button class="btn btn-secondary" onclick="generateClassCurve('all', 'linear')" style="font-size:0.8rem; padding:6px 10px;">📏 Ratakan Kurva (Semua)</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="slider-box">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <label style="font-weight:700; font-size:0.9rem;">🎯 Pratinjau Nilai Stat pada Level Karakter:</label>
                                <span id="levelPreviewLabel" style="font-weight:700; color:var(--accent); font-size:1.1rem; background:rgba(59,130,246,0.15); padding:2px 10px; border-radius:6px; border:1px solid rgba(59,130,246,0.3);">Level ${curLvl}</span>
                            </div>
                            <input type="range" min="1" max="99" value="${curLvl}" class="form-control" style="width:100%; cursor:pointer;" oninput="onClassLevelSliderChange(this.value)">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                                <span>Level 1 (Mulai)</span>
                                <span>Level 30 (Mid)</span>
                                <span>Level 50</span>
                                <span>Level 99 (Puncak)</span>
                            </div>
                        </div>

                        <div style="overflow-x:auto;">
                            <table class="stat-table">
                                <thead>
                                    <tr>
                                        <th style="width:25%;">Parameter</th>
                                        <th style="width:20%;">Nilai Lv 1</th>
                                        <th style="width:20%;">Nilai Lv 99</th>
                                        <th style="width:20%;">Nilai di <span id="thCurLevel">Lv ${curLvl}</span></th>
                                        <th style="width:15%; text-align:right;">Aksi Kurva</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${PARAM_DEFS.map(p => {
                                        const v1 = cls.params[p.id][1];
                                        const v99 = cls.params[p.id][99];
                                        const vCur = cls.params[p.id][curLvl];
                                        return `
                                            <tr>
                                                <td>
                                                    <span style="display:inline-flex; align-items:center; gap:6px; font-weight:700; color:${p.color};">
                                                        <span>${p.icon}</span>
                                                        <span>${p.name}</span>
                                                    </span>
                                                </td>
                                                <td>
                                                    <input type="number" min="1" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${v1}" onchange="onClassParamLv1Change(${p.id}, this.value)">
                                                </td>
                                                <td>
                                                    <input type="number" min="1" class="form-control" style="padding:4px 8px; font-size:0.85rem;" value="${v99}" onchange="onClassParamLv99Change(${p.id}, this.value)">
                                                </td>
                                                <td>
                                                    <input type="number" min="1" class="form-control" id="input-param-${p.id}" style="padding:4px 8px; font-size:0.85rem; font-weight:700; color:${p.color};" value="${vCur}" onchange="cls.params[${p.id}][State.classPreviewLevel||1]=parseInt(this.value,10)||1; setUnsaved(true);">
                                                </td>
                                                <td style="text-align:right;">
                                                    <button class="btn btn-secondary" onclick="generateClassCurve(${p.id}, 'smooth')" style="font-size:0.75rem; padding:4px 8px;">✨ Smooth</button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>

                        <details style="margin-top:14px; background:rgba(15, 23, 42, 0.4); border:1px solid var(--border-color); border-radius:8px; padding:8px 12px;">
                            <summary style="cursor:pointer; font-weight:600; font-size:0.82rem; color:var(--accent);">📋 Buka Tabel Lengkap Seluruh Level (1 - 99)</summary>
                            <div style="max-height:260px; overflow-y:auto; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
                                <table class="stat-table" style="font-size:0.75rem;">
                                    <thead>
                                        <tr>
                                            <th>Lv</th><th>MHP</th><th>MMP</th><th>ATK</th><th>DEF</th><th>MAT</th><th>MDF</th><th>AGI</th><th>LUK</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Array.from({ length: 99 }, (_, i) => i + 1).map(l => `
                                            <tr style="${l === curLvl ? 'background:rgba(59,130,246,0.15); font-weight:700;' : ''}">
                                                <td>#${l}</td>
                                                <td>${cls.params[0][l]}</td><td>${cls.params[1][l]}</td><td>${cls.params[2][l]}</td>
                                                <td>${cls.params[3][l]}</td><td>${cls.params[4][l]}</td><td>${cls.params[5][l]}</td>
                                                <td>${cls.params[6][l]}</td><td>${cls.params[7][l]}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(cls.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onClassParamLv1Change(paramId, newV1) {
            const cls = State.classes[State.selectedIndex];
            ensureClassParams(cls);
            newV1 = Math.max(1, parseInt(newV1, 10) || 1);
            const oldV1 = cls.params[paramId][1];
            const oldV99 = cls.params[paramId][99];
            cls.params[paramId][1] = newV1;

            if (oldV99 !== oldV1) {
                for (let lvl = 2; lvl <= 98; lvl++) {
                    const ratio = (cls.params[paramId][lvl] - oldV1) / (oldV99 - oldV1);
                    cls.params[paramId][lvl] = Math.max(1, Math.round(newV1 + ratio * (oldV99 - newV1)));
                }
            } else {
                for (let lvl = 2; lvl <= 98; lvl++) {
                    cls.params[paramId][lvl] = Math.max(1, Math.round(newV1 + ((lvl - 1) / 98) * (oldV99 - newV1)));
                }
            }
            setUnsaved(true);
            renderEditor();
        }

        function onClassParamLv99Change(paramId, newV99) {
            const cls = State.classes[State.selectedIndex];
            ensureClassParams(cls);
            newV99 = Math.max(1, parseInt(newV99, 10) || 1);
            const oldV1 = cls.params[paramId][1];
            const oldV99 = cls.params[paramId][99];
            cls.params[paramId][99] = newV99;

            if (oldV99 !== oldV1) {
                for (let lvl = 2; lvl <= 98; lvl++) {
                    const ratio = (cls.params[paramId][lvl] - oldV1) / (oldV99 - oldV1);
                    cls.params[paramId][lvl] = Math.max(1, Math.round(oldV1 + ratio * (newV99 - oldV1)));
                }
            } else {
                for (let lvl = 2; lvl <= 98; lvl++) {
                    cls.params[paramId][lvl] = Math.max(1, Math.round(oldV1 + ((lvl - 1) / 98) * (newV99 - oldV1)));
                }
            }
            setUnsaved(true);
            renderEditor();
        }

        function generateClassCurve(paramId, mode) {
            const cls = State.classes[State.selectedIndex];
            ensureClassParams(cls);

            const applyOne = (pId) => {
                const v1 = cls.params[pId][1] || 10;
                const v99 = cls.params[pId][99] || 100;
                for (let lvl = 1; lvl <= 99; lvl++) {
                    const t = (lvl - 1) / 98.0;
                    const factor = mode === 'linear' ? t : Math.pow(t, 1.15);
                    cls.params[pId][lvl] = Math.max(1, Math.round(v1 + (v99 - v1) * factor));
                }
            };

            if (paramId === 'all') {
                for (let p = 0; p < 8; p++) applyOne(p);
                showToast(`Kurva seluruh parameter dihitung ulang (${mode === 'linear' ? 'Linear' : 'Standar Smooth'})!`, 'info');
            } else {
                applyOne(paramId);
                showToast(`Kurva parameter #${paramId} berhasil dihitung ulang!`, 'info');
            }

            setUnsaved(true);
            renderEditor();
        }

        function onClassLevelSliderChange(lvl) {
            const num = parseInt(lvl, 10);
            State.classPreviewLevel = num;
            const lbl = document.getElementById('levelPreviewLabel');
            if (lbl) lbl.innerText = `Level ${num}`;
            const th = document.getElementById('thCurLevel');
            if (th) th.innerText = `Lv ${num}`;

            const cls = State.classes[State.selectedIndex];
            if (!cls || !cls.params) return;

            PARAM_DEFS.forEach(p => {
                const inp = document.getElementById(`input-param-${p.id}`);
                if (inp && cls.params[p.id]) {
                    inp.value = cls.params[p.id][num];
                }
            });
        }

                        // =====================================================================
        // 3. WEAPONS EDITOR (MERGED NUSV STAT SYSTEM)
        // =====================================================================
        function renderWeaponEditor(container, weapon) {
            ensureItemParams(weapon);
            const note = weapon.note || '';
            const is2H = note.includes('2H Primary+Secondary') || (weapon.traits && weapon.traits.some(t => t.code === 54 && t.dataId === 2));
            const isDual = note.includes('Dual-compatible Primary/Secondary');
            const handType = is2H ? '2H' : (isDual ? 'Dual' : '1H');

            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const acquisition = getTagVal(note, 'NUSV Acquisition', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const desc = getTagVal(note, 'NUSV Desc', weapon.description || '');

            const sockets = getTagVal(note, 'Sockets', '');
            const upMax = getTagVal(note, 'Upgrade Max', '');
            const upRate = getTagVal(note, 'Upgrade Success', '');
            const upGold = getTagVal(note, 'Upgrade Gold', '');
            const upAtk = getTagVal(note, 'Upgrade ATK', '');
            const upMat = getTagVal(note, 'Upgrade MAT', '');
            const unleash = getTagVal(note, 'Unleash Skill', '');

            // Base 6 Core Stats
            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });

            // Derived Stats
            const derivedValues = {};
            DERIVED_STAT_DEFS.forEach(d => {
                derivedValues[d.key] = getTagVal(note, d.key, '');
            });

            // Element Amplify
            const eleMatch = note.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
            const eleName = eleMatch ? eleMatch[1] : '';
            const eleVal = eleMatch ? eleMatch[2] : '';

            container.innerHTML = `
                <!-- IDENTITAS & PENGGUNAAN TANGAN -->
                <div class="card">
                    <div class="card-header">
                        <h2>⚔️ Senjata: #${weapon.id} ${escapeHtml(weapon.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Tipe ID: ${weapon.wtypeId} • Animasi ID: ${weapon.animationId}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Aturan Penggunaan Tangan (Hand Slot Rule)</label>
                                    <select class="form-control" onchange="onWeaponHandChange(this.value)">
                                        <option value="1H" ${handType === '1H' ? 'selected' : ''}>1H Primary (Satu Tangan Normal)</option>
                                        <option value="2H" ${handType === '2H' ? 'selected' : ''}>2H Primary+Secondary (Dua Tangan / Kunci Off-Hand)</option>
                                        <option value="Dual" ${handType === 'Dual' ? 'selected' : ''}>Dual-compatible Primary/Secondary (Bisa Dual Wield)</option>
                                    </select>
                                    <div class="helper-text">Memilih "2H" secara otomatis mengunci slot Secondary Weapon (Seal Equip secondary).</div>
                                </div>

                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Tingkat Kelangkaan (Rarity)</label>
                                        <select class="form-control" onchange="setTagVal(weapon, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Metode Perolehan</label>
                                        <input type="text" class="form-control" placeholder="Drop, Craft, Quest..." value="${escapeHtml(acquisition)}" onchange="setTagVal(weapon, 'NUSV Acquisition', this.value);">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Wilayah Asal (&lt;NUSV Region: ...&gt;)</label>
                                    <input type="text" class="form-control" placeholder="Contoh: Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(weapon, 'NUSV Region', this.value);">
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Deskripsi Tooltip Status (&lt;NUSV Desc: ...&gt;)</label>
                                    <textarea class="form-control" rows="4" onchange="setTagVal(weapon, 'NUSV Desc', this.value);">${escapeHtml(desc)}</textarea>
                                </div>
                                <div class="form-group">
                                    <label>Pelepasan Jurus Senjata (&lt;Unleash Skill: ID, Rate%, Priority&gt;)</label>
                                    <input type="text" class="form-control" placeholder="Contoh: 15, 25%, 10" value="${escapeHtml(unleash)}" onchange="setTagVal(weapon, 'Unleash Skill', this.value);">
                                    <div class="helper-text">Skill yang otomatis terpicu secara acak saat melakukan serangan biasa.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📊 SISTEM STAT TERPADU NUSVANIR (UNIFIED STATS) -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Spesifikasi Stat &amp; Tempur Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Sistem stat terpadu (Serangan, 6 Atribut Inti &amp; Stat Turunan).</span>
                    </div>
                    <div class="card-body">
                        <!-- 1. DAYA SERANG SENJATA -->
                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:8px;">⚔️ Daya Serang Langsung Senjata:</div>
                        <div class="grid-3" style="margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                                <label style="color:#fb923c;">
                                    <span>⚔️ Weapon ATK</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Serangan Fisik Senjata</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[2] || 0}" onchange="weapon.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #a78bfa;">
                                <label style="color:#a78bfa;">
                                    <span>🔮 Weapon MAT</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Serangan Magis Senjata</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[4] || 0}" onchange="weapon.params[4]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                                <label style="color:#facc15;">
                                    <span>⚡ Action Speed (AGI)</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Kecepatan Ayunan</span>
                                </label>
                                <input type="number" class="form-control" value="${weapon.params[6] || 0}" onchange="weapon.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                        </div>

                        <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;">💪 Bonus 6 Atribut Karakter Nusvanir:</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(weapon, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <!-- 3. STAT TURUNAN NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">💧 Vitalitas &amp; Regenerasi per Giliran:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;">🎯 Presisi &amp; Serangan Kritis:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;">🛡️ Pertahanan, Elak &amp; Mitigasi:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">✨ Utilitas &amp; Penguatan Elemen:</div>
                        <div class="grid-3">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(weapon, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                            <div class="stat-card-input">
                                <label style="color:#f59e0b;">
                                    <span>🔥 Amplifikasi Elemen</span>
                                </label>
                                <div style="display:flex; gap:6px;">
                                    <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="wepEleName" onchange="onWeaponElementAmplifyChange()">
                                    <input type="text" class="form-control" placeholder="+15%" value="${escapeHtml(eleVal)}" id="wepEleVal" style="width:90px;" onchange="onWeaponElementAmplifyChange()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SOKET & TEMPA -->
                <div class="card">
                    <div class="card-header"><h2>💎 Soket Permata &amp; Tempa (Upgrade)</h2></div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                                <input type="number" min="0" max="8" class="form-control" placeholder="0" value="${sockets}" onchange="setTagVal(weapon, 'Sockets', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Maksimal Tempa (+X)</label>
                                <input type="number" min="0" max="20" class="form-control" placeholder="10" value="${upMax}" onchange="setTagVal(weapon, 'Upgrade Max', this.value);">
                            </div>
                        </div>
                        <div class="grid-3">
                            <div class="form-group">
                                <label>% Sukses Tempa</label>
                                <input type="text" class="form-control" placeholder="90%" value="${upRate}" onchange="setTagVal(weapon, 'Upgrade Success', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Biaya Emas</label>
                                <input type="number" class="form-control" placeholder="Gold" value="${upGold}" onchange="setTagVal(weapon, 'Upgrade Gold', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus ATK/Tempa</label>
                                <input type="text" class="form-control" placeholder="+3" value="${upAtk}" onchange="setTagVal(weapon, 'Upgrade ATK', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(weapon.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onWeaponElementAmplifyChange() {
            const weapon = State.weapons[State.selectedIndex];
            let note = weapon.note || '';
            note = note.replace(/<Element Amplify [a-zA-Z]+:[ ]*.+?>\n?/gi, '').trim();
            const name = document.getElementById('wepEleName').value.trim();
            const val = document.getElementById('wepEleVal').value.trim();
            if (name && val) {
                note = `<Element Amplify ${name}: ${val}>\n` + note;
            }
            weapon.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

        function onWeaponHandChange(type) {
            const weapon = State.weapons[State.selectedIndex];
            weapon.traits = weapon.traits || [];

            setTagVal(weapon, 'NUSV Hand Slot', null);

            if (type === '2H') {
                setTagVal(weapon, 'NUSV Hand Slot', '2H Primary+Secondary');
                if (!weapon.traits.some(t => t.code === 54 && t.dataId === 2)) {
                    weapon.traits.push({ code: 54, dataId: 2, value: 1 });
                }
            } else if (type === 'Dual') {
                setTagVal(weapon, 'NUSV Hand Slot', 'Dual-compatible Primary/Secondary');
                weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
            } else {
                setTagVal(weapon, 'NUSV Hand Slot', '1H Primary');
                weapon.traits = weapon.traits.filter(t => !(t.code === 54 && t.dataId === 2));
            }
            renderEditor();
        }

        // =====================================================================
        // 4. ARMORS & ACCESSORIES EDITOR (MERGED NUSV STAT SYSTEM)
        // =====================================================================
        function renderArmorEditor(container, armor) {
            ensureItemParams(armor);
            const note = armor.note || '';
            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const customType = getTagVal(note, 'NUSV Armor Type', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const desc = getTagVal(note, 'NUSV Desc', armor.description || '');

            const setName = getTagVal(note, 'NUSV Set Name', '');
            const set2 = getTagVal(note, 'NUSV Set Bonus 2', '');
            const set3 = getTagVal(note, 'NUSV Set Bonus 3', '');
            const set4 = getTagVal(note, 'NUSV Set Bonus 4', '');

            const sockets = getTagVal(note, 'Sockets', '');
            const upMax = getTagVal(note, 'Upgrade Max', '');
            const upSuccess = getTagVal(note, 'Upgrade Success', '');
            const upDef = getTagVal(note, 'Upgrade DEF', '');
            const upMdf = getTagVal(note, 'Upgrade MDF', '');

            // Base 6 Core Stats
            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });

            // Derived Stats
            const derivedValues = {};
            DERIVED_STAT_DEFS.forEach(d => {
                derivedValues[d.key] = getTagVal(note, d.key, '');
            });

            // Element Amplify
            const eleMatch = note.match(/<Element Amplify ([a-zA-Z]+):[ ]*(.+?)>/i);
            const eleName = eleMatch ? eleMatch[1] : '';
            const eleVal = eleMatch ? eleMatch[2] : '';

            const slotNames = {
                1: 'Weapon Slot (Khusus)',
                2: '🛡️ Perisai / Secondary (Slot 2)',
                3: '🎩 Helm / Kepala (Slot 3)',
                4: '🥋 Armor / Baju (Slot 4)',
                5: '👢 Sepatu / Kaki (Slot 5)',
                6: '💍 Aksesoris (Slot 6)',
                7: '🔮 Relik / Pusaka (Slot 7)'
            };

            container.innerHTML = `
                <!-- IDENTITAS & TIPE PELINDUNG -->
                <div class="card">
                    <div class="card-header">
                        <h2>${armor.etypeId === 6 ? '💍 Aksesoris' : (armor.etypeId === 7 ? '🔮 Relik' : '🛡️ Pelindung')}: #${armor.id} ${escapeHtml(armor.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${slotNames[armor.etypeId] || `Slot ${armor.etypeId}`}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Tingkat Kelangkaan (Rarity)</label>
                                        <select class="form-control" onchange="setTagVal(armor, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Sub-Tipe Perlengkapan</label>
                                        <input type="text" class="form-control" placeholder="Shield, Ring, Talisman..." value="${escapeHtml(customType)}" onchange="setTagVal(armor, 'NUSV Armor Type', this.value);">
                                    </div>
                                </div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Nama Set Armor (&lt;NUSV Set Name&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Contoh: Mandala Guard Set" value="${escapeHtml(setName)}" onchange="setTagVal(armor, 'NUSV Set Name', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Wilayah Asal</label>
                                        <input type="text" class="form-control" placeholder="Nusvanir, Mandala..." value="${escapeHtml(region)}" onchange="setTagVal(armor, 'NUSV Region', this.value);">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Bonus Set Perlengkapan (2-Set / 3-Set / 4-Set)</label>
                                    <div class="grid-3">
                                        <input type="text" class="form-control" placeholder="2-Set Bonus..." value="${escapeHtml(set2)}" onchange="setTagVal(armor, 'NUSV Set Bonus 2', this.value);">
                                        <input type="text" class="form-control" placeholder="3-Set Bonus..." value="${escapeHtml(set3)}" onchange="setTagVal(armor, 'NUSV Set Bonus 3', this.value);">
                                        <input type="text" class="form-control" placeholder="4-Set Bonus..." value="${escapeHtml(set4)}" onchange="setTagVal(armor, 'NUSV Set Bonus 4', this.value);">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Deskripsi Tooltip Status (&lt;NUSV Desc: ...&gt;)</label>
                                    <textarea class="form-control" rows="5" onchange="setTagVal(armor, 'NUSV Desc', this.value);">${escapeHtml(desc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📊 SISTEM STAT TERPADU NUSVANIR (UNIFIED STATS) -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Spesifikasi Stat &amp; Pertahanan Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Sistem stat terpadu (Proteksi, 6 Atribut Inti &amp; Stat Turunan).</span>
                    </div>
                    <div class="card-body">
                        <!-- 1. DAYA PERTAHANAN & VITAL LANGSUNG -->
                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:8px;">🛡️ Nilai Proteksi &amp; Kapasitas Vital:</div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px; margin-bottom:16px;">
                            <div class="stat-card-input" style="border-left: 3px solid #34d399;">
                                <label style="color:#34d399;">
                                    <span>🛡️ Armor DEF</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Pertahanan Fisik</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[3] || 0}" onchange="armor.params[3]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #38bdf8;">
                                <label style="color:#38bdf8;">
                                    <span>🔰 Armor MDF</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Pertahanan Magis</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[5] || 0}" onchange="armor.params[5]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #f87171;">
                                <label style="color:#f87171;">
                                    <span>❤️ Max HP</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Bonus Darah</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[0] || 0}" onchange="armor.params[0]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #60a5fa;">
                                <label style="color:#60a5fa;">
                                    <span>💧 Max MP</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Bonus Mana</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[1] || 0}" onchange="armor.params[1]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            <div class="stat-card-input" style="border-left: 3px solid #facc15;">
                                <label style="color:#facc15;">
                                    <span>⚡ Action Speed</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Kecepatan Gerak</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[6] || 0}" onchange="armor.params[6]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>
                            ${armor.etypeId === 2 ? `
                            <div class="stat-card-input" style="border-left: 3px solid #fb923c;">
                                <label style="color:#fb923c;">
                                    <span>⚔️ Shield ATK</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">Serangan Perisai</span>
                                </label>
                                <input type="number" class="form-control" value="${armor.params[2] || 0}" onchange="armor.params[2]=parseInt(this.value,10)||0; setUnsaved(true);">
                            </div>` : ''}
                        </div>

                        <!-- 2. ENAM ATRIBUT DASAR NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:8px;">💪 Bonus 6 Atribut Karakter Nusvanir:</div>
                        <div class="stat-grid-6" style="margin-bottom:16px;">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(armor, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <!-- 3. STAT TURUNAN NUSVANIR -->
                        <div style="font-size:0.82rem; font-weight:700; color:#38bdf8; margin-bottom:6px;">💧 Vitalitas &amp; Regenerasi per Giliran:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'vital').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#34d399; margin-bottom:6px;">🛡️ Pertahanan, Elak, Tangkis &amp; Mitigasi:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'defensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#fb923c; margin-bottom:6px;">🎯 Presisi &amp; Serangan Kritis:</div>
                        <div class="stat-grid-8" style="margin-bottom:16px;">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'offensive').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                        </div>

                        <div style="font-size:0.82rem; font-weight:700; color:#a855f7; margin-bottom:6px;">✨ Utilitas &amp; Penguatan Elemen:</div>
                        <div class="grid-3">
                            ${DERIVED_STAT_DEFS.filter(d => d.group === 'utility').map(d => `
                                <div class="stat-card-input">
                                    <label style="color:${d.color};">
                                        <span>${d.icon} ${d.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="${d.placeholder}" value="${derivedValues[d.key]}" onchange="setTagVal(armor, '${d.key}', this.value);">
                                </div>
                            `).join('')}
                            <div class="stat-card-input">
                                <label style="color:#f59e0b;">
                                    <span>🔥 Amplifikasi Elemen</span>
                                </label>
                                <div style="display:flex; gap:6px;">
                                    <input type="text" class="form-control" placeholder="Elemen (Fire/Holy...)" value="${escapeHtml(eleName)}" id="armEleName" onchange="onArmorElementAmplifyChange()">
                                    <input type="text" class="form-control" placeholder="+15%" value="${escapeHtml(eleVal)}" id="armEleVal" style="width:90px;" onchange="onArmorElementAmplifyChange()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SOKET & TEMPA -->
                <div class="card">
                    <div class="card-header"><h2>💎 Soket Permata &amp; Tempa (Upgrade)</h2></div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Jumlah Soket Permata (&lt;Sockets: X&gt;)</label>
                                <input type="number" min="0" max="8" class="form-control" placeholder="0" value="${sockets}" onchange="setTagVal(armor, 'Sockets', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Maksimal Tempa (+X)</label>
                                <input type="number" min="0" max="20" class="form-control" placeholder="10" value="${upMax}" onchange="setTagVal(armor, 'Upgrade Max', this.value);">
                            </div>
                        </div>
                        <div class="grid-3">
                            <div class="form-group">
                                <label>% Sukses Tempa</label>
                                <input type="text" class="form-control" placeholder="90%" value="${upSuccess}" onchange="setTagVal(armor, 'Upgrade Success', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus DEF/Tempa</label>
                                <input type="text" class="form-control" placeholder="+2" value="${upDef}" onchange="setTagVal(armor, 'Upgrade DEF', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus MDF/Tempa</label>
                                <input type="text" class="form-control" placeholder="+2" value="${upMdf}" onchange="setTagVal(armor, 'Upgrade MDF', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(armor.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onArmorElementAmplifyChange() {
            const armor = State.armors[State.selectedIndex];
            let note = armor.note || '';
            note = note.replace(/<Element Amplify [a-zA-Z]+:[ ]*.+?>\n?/gi, '').trim();
            const name = document.getElementById('armEleName').value.trim();
            const val = document.getElementById('armEleVal').value.trim();
            if (name && val) {
                note = `<Element Amplify ${name}: ${val}>\n` + note;
            }
            armor.note = note.trim();
            setUnsaved(true);
            updateRawNoteTextarea();
        }

// =====================================================================
        // 5. SKILLS EDITOR
        // =====================================================================
        function renderSkillEditor(container, skill) {
            const note = skill.note || '';
            const isInstant = hasTag(note, 'Instant Cast');
            const instantVal = getTagVal(note, 'Instant Cast', isInstant ? 'Free' : 'None');
            const targetTag = getTagVal(note, 'Target', '');
            const wordWrap = hasTag(note, 'WordWrap');
            const desc = getTagVal(note, 'NUSV Desc', skill.description || '');

            const learnLvl = getTagVal(note, 'Learn Level', '');
            const learnJp = getTagVal(note, 'Learn JP', '');
            const learnGold = getTagVal(note, 'Learn Gold', '');
            const learnClass = getTagVal(note, 'Learn Class', '');
            const learnItem = getTagVal(note, 'Learn Item', '');
            const learnSwitch = getTagVal(note, 'Learn Switch', '');
            const hideIfLearned = hasTag(note, 'Hide If Learned');
            const jpGain = getTagVal(note, 'JP Gain', '');

            const critDmg = getTagVal(note, 'Critical Damage', '');
            const armPen = getTagVal(note, 'Armor Penetration', '');
            const magPen = getTagVal(note, 'Magic Penetration', '');
            const dmgCap = getTagVal(note, 'Damage Cap', '');
            const bypassCap = hasTag(note, 'Bypass Damage Cap');

            container.innerHTML = `
                <!-- IDENTITAS & EKSEKUSI JURUS -->
                <div class="card">
                    <div class="card-header">
                        <h2>✨ Jurus: #${skill.id} ${escapeHtml(skill.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Tipe: ${skill.stypeId} • MP: ${skill.mpCost} • TP: ${skill.tpCost}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Aksi Langsung Tanpa Turn (&lt;Instant Cast&gt;)</label>
                                    <select class="form-control" onchange="onSkillInstantChange(this.value)">
                                        <option value="None" ${(!isInstant && instantVal === 'None') ? 'selected' : ''}>Normal (Menghabiskan Turn)</option>
                                        <option value="Free" ${(isInstant && (instantVal === 'Free' || instantVal === '')) ? 'selected' : ''}>Instant Cast: Free (Bebas Aksi Tanpa Giliran)</option>
                                        <option value="Turn" ${instantVal === 'Turn' ? 'selected' : ''}>Instant Cast: Turn (Turn Khusus)</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Cakupan Target Khusus (&lt;Target: ...&gt;)</label>
                                    <select class="form-control" onchange="setTagVal(skill, 'Target', this.value !== 'Default' ? this.value : '');">
                                        <option value="Default" ${targetTag === '' ? 'selected' : ''}>Default Sesuai Database RPG Maker</option>
                                        <option value="Ally Row" ${targetTag === 'Ally Row' ? 'selected' : ''}>Ally Row (Satu Baris Teman)</option>
                                        <option value="Enemy Row" ${targetTag === 'Enemy Row' ? 'selected' : ''}>Enemy Row (Satu Baris Musuh)</option>
                                        <option value="Front Enemy Row" ${targetTag === 'Front Enemy Row' ? 'selected' : ''}>Front Enemy Row (Baris Depan Musuh)</option>
                                        <option value="Back Enemy Row" ${targetTag === 'Back Enemy Row' ? 'selected' : ''}>Back Enemy Row (Baris Belakang Musuh)</option>
                                        <option value="Everybody" ${targetTag === 'Everybody' ? 'selected' : ''}>Everybody (Semua Petarung)</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label class="checkbox-label" style="margin-top:8px;">
                                        <input type="checkbox" ${wordWrap ? 'checked' : ''} onchange="setBoolTag(skill, 'WordWrap', this.checked);">
                                        <span>Bungkus Teks Otomatis (&lt;WordWrap&gt;)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Deskripsi Tooltip Status (&lt;NUSV Desc: ...&gt;)</label>
                                    <textarea class="form-control" rows="5" onchange="setTagVal(skill, 'NUSV Desc', this.value);">${escapeHtml(desc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PRASYARAT BELAJAR SKILL (NUSV_SkillLearn) -->
                <div class="card">
                    <div class="card-header">
                        <h2>📚 Prasyarat Mempelajari Skill (NUSV_SkillLearn)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Learn JP&gt;, &lt;Learn Level&gt; dll.</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-3">
                            <div class="form-group">
                                <label>Min Level Karakter</label>
                                <input type="number" class="form-control" placeholder="Level" value="${learnLvl}" onchange="setTagVal(skill, 'Learn Level', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Biaya JP (&lt;Learn JP: X&gt;)</label>
                                <input type="number" class="form-control" placeholder="JP" value="${learnJp}" onchange="setTagVal(skill, 'Learn JP', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Biaya Emas</label>
                                <input type="number" class="form-control" placeholder="Gold" value="${learnGold}" onchange="setTagVal(skill, 'Learn Gold', this.value);">
                            </div>
                        </div>

                        <div class="grid-3">
                            <div class="form-group">
                                <label>Kelas Tertentu</label>
                                <select class="form-control" onchange="setTagVal(skill, 'Learn Class', this.value);">
                                    <option value="">(Semua Kelas)</option>
                                    ${State.classes.filter(c => c).map(c => `<option value="${c.id}" ${learnClass === String(c.id) ? 'selected' : ''}>#${c.id} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Item Prasyarat (&lt;ItemID, Qty&gt;)</label>
                                <input type="text" class="form-control" placeholder="Contoh: 7, 2" value="${escapeHtml(learnItem)}" onchange="setTagVal(skill, 'Learn Item', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Switch Prasyarat (ID)</label>
                                <input type="number" class="form-control" placeholder="Switch ID" value="${learnSwitch}" onchange="setTagVal(skill, 'Learn Switch', this.value);">
                            </div>
                        </div>

                        <div class="grid-2" style="margin-top:10px;">
                            <div class="form-group">
                                <label>Hadiah JP Pemakaian (&lt;JP Gain: +X&gt;)</label>
                                <input type="text" class="form-control" placeholder="+10" value="${jpGain}" onchange="setTagVal(skill, 'JP Gain', this.value);">
                            </div>
                            <div class="form-group" style="display:flex; align-items:center;">
                                <label class="checkbox-label" style="margin-top:16px;">
                                    <input type="checkbox" ${hideIfLearned ? 'checked' : ''} onchange="setBoolTag(skill, 'Hide If Learned', this.checked);">
                                    <span>Sembunyikan dari toko skill jika sudah dipelajari (&lt;Hide If Learned&gt;)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODIFIKASI KERUSAKAN & TEMPUR -->
                <div class="card">
                    <div class="card-header"><h2>💥 Modifikasi Kerusakan &amp; Penetrasi</h2></div>
                    <div class="card-body">
                        <div class="grid-3">
                            <div class="form-group">
                                <label>Bonus Kerusakan Kritis</label>
                                <input type="text" class="form-control" placeholder="+25%" value="${critDmg}" onchange="setTagVal(skill, 'Critical Damage', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Penetrasi Armor Fisik</label>
                                <input type="text" class="form-control" placeholder="20%" value="${armPen}" onchange="setTagVal(skill, 'Armor Penetration', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Penetrasi Zirah Sihir</label>
                                <input type="text" class="form-control" placeholder="20%" value="${magPen}" onchange="setTagVal(skill, 'Magic Penetration', this.value);">
                            </div>
                        </div>
                        <div class="grid-2" style="margin-top:10px;">
                            <div class="form-group">
                                <label>Batas Maksimum Kerusakan (&lt;Damage Cap: X&gt;)</label>
                                <input type="number" class="form-control" placeholder="99999" value="${dmgCap}" onchange="setTagVal(skill, 'Damage Cap', this.value);">
                            </div>
                            <div class="form-group" style="display:flex; align-items:center;">
                                <label class="checkbox-label" style="margin-top:16px;">
                                    <input type="checkbox" ${bypassCap ? 'checked' : ''} onchange="setBoolTag(skill, 'Bypass Damage Cap', this.checked);">
                                    <span>Tembus Batas Kerusakan (&lt;Bypass Damage Cap&gt;)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(skill.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onSkillInstantChange(val) {
            const skill = State.skills[State.selectedIndex];
            setBoolTag(skill, 'Instant Cast', false);
            setTagVal(skill, 'Instant Cast', null);
            if (val === 'Free') {
                setBoolTag(skill, 'Instant Cast', true);
            } else if (val === 'Turn') {
                setTagVal(skill, 'Instant Cast', 'Turn');
            }
        }

        // =====================================================================
        // 6. ITEMS EDITOR
        // =====================================================================
        function renderItemEditor(container, item) {
            const note = item.note || '';
            const rarity = getTagVal(note, 'NUSV Rarity', 'Common');
            const menuCat = getTagVal(note, 'Menu Category', '') || getTagVal(note, 'NUSV Category', '');
            const subCat = getTagVal(note, 'NUSV Subcategory', '');
            const region = getTagVal(note, 'NUSV Region', '');
            const source = getTagVal(note, 'NUSV Source', '');
            const desc = getTagVal(note, 'NUSV Desc', item.description || '');

            const isSocket = hasTag(note, 'Socket Item');
            const socketWeapOnly = hasTag(note, 'Socket Weapon Only');
            const socketArmOnly = hasTag(note, 'Socket Armor Only');
            let socketTarget = 'Any';
            if (socketWeapOnly) socketTarget = 'Weapon';
            else if (socketArmOnly) socketTarget = 'Armor';

            const sockAtk = getTagVal(note, 'Socket ATK', '');
            const sockDef = getTagVal(note, 'Socket DEF', '');
            const sockMat = getTagVal(note, 'Socket MAT', '');
            const sockMdf = getTagVal(note, 'Socket MDF', '');
            const sockAgi = getTagVal(note, 'Socket AGI', '');
            const sockLuk = getTagVal(note, 'Socket LUK', '');
            const sockMhp = getTagVal(note, 'Socket MHP', '');
            const sockMmp = getTagVal(note, 'Socket MMP', '');

            const synCat = getTagVal(note, 'Synthesis Category', '');
            const synAmt = getTagVal(note, 'Synthesis Amount', '');

            container.innerHTML = `
                <!-- IDENTITAS & KATEGORI MENU -->
                <div class="card">
                    <div class="card-header">
                        <h2>🧪 Barang: #${item.id} ${escapeHtml(item.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Harga: ${item.price} G • Habis Pakai: ${item.consumable ? 'Ya' : 'Tidak'}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Tingkat Kelangkaan (Rarity)</label>
                                        <select class="form-control" onchange="setTagVal(item, 'NUSV Rarity', this.value); renderSidebar();">
                                            ${['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(r => `<option value="${r}" ${rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Kategori Menu (&lt;Menu Category&gt;)</label>
                                        <input type="text" class="form-control" placeholder="Material, Consumable, Quest, Key, Relic..." value="${escapeHtml(menuCat)}" onchange="setTagVal(item, 'Menu Category', this.value); setTagVal(item, 'NUSV Category', this.value);">
                                    </div>
                                </div>
                                <div class="grid-3">
                                    <div class="form-group">
                                        <label>Sub-Kategori</label>
                                        <input type="text" class="form-control" placeholder="Herb, Ore, Potion..." value="${escapeHtml(subCat)}" onchange="setTagVal(item, 'NUSV Subcategory', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Wilayah</label>
                                        <input type="text" class="form-control" placeholder="Nusvanir..." value="${escapeHtml(region)}" onchange="setTagVal(item, 'NUSV Region', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Sumber / Asal</label>
                                        <input type="text" class="form-control" placeholder="Drop, Gathering..." value="${escapeHtml(source)}" onchange="setTagVal(item, 'NUSV Source', this.value);">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Deskripsi Tooltip Status (&lt;NUSV Desc: ...&gt;)</label>
                                    <textarea class="form-control" rows="4" onchange="setTagVal(item, 'NUSV Desc', this.value);">${escapeHtml(desc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PERMATA SOKET (NUSV_SocketCore) -->
                <div class="card">
                    <div class="card-header">
                        <h2>💎 Pengaturan Permata Soket (NUSV_SocketCore)</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;Socket Item&gt;, bonus stat saat dipasang ke senjata/zirah.</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label class="checkbox-label" style="margin-top:6px;">
                                    <input type="checkbox" ${isSocket ? 'checked' : ''} onchange="setBoolTag(item, 'Socket Item', this.checked);">
                                    <span style="font-weight:700; color:var(--accent);">Item ini adalah Permata Soket (&lt;Socket Item&gt;)</span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label>Batasan Pemasangan Soket</label>
                                <select class="form-control" onchange="onItemSocketTargetChange(this.value)">
                                    <option value="Any" ${socketTarget === 'Any' ? 'selected' : ''}>Bebas (Dapat dipasang di Senjata &amp; Zirah)</option>
                                    <option value="Weapon" ${socketTarget === 'Weapon' ? 'selected' : ''}>Hanya Senjata (&lt;Socket Weapon Only&gt;)</option>
                                    <option value="Armor" ${socketTarget === 'Armor' ? 'selected' : ''}>Hanya Zirah (&lt;Socket Armor Only&gt;)</option>
                                </select>
                            </div>
                        </div>

                        <div class="stat-grid-6" style="margin-top:12px;">
                            <div class="stat-card-input">
                                <label style="color:#fb923c;">⚔️ Socket ATK</label>
                                <input type="text" class="form-control" placeholder="+5" value="${sockAtk}" onchange="setTagVal(item, 'Socket ATK', this.value);">
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#34d399;">🛡️ Socket DEF</label>
                                <input type="text" class="form-control" placeholder="+5" value="${sockDef}" onchange="setTagVal(item, 'Socket DEF', this.value);">
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#a78bfa;">🔮 Socket MAT</label>
                                <input type="text" class="form-control" placeholder="+5" value="${sockMat}" onchange="setTagVal(item, 'Socket MAT', this.value);">
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#38bdf8;">🔰 Socket MDF</label>
                                <input type="text" class="form-control" placeholder="+5" value="${sockMdf}" onchange="setTagVal(item, 'Socket MDF', this.value);">
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#f87171;">❤️ Socket HP</label>
                                <input type="text" class="form-control" placeholder="+50" value="${sockMhp}" onchange="setTagVal(item, 'Socket MHP', this.value);">
                            </div>
                            <div class="stat-card-input">
                                <label style="color:#60a5fa;">💧 Socket MP</label>
                                <input type="text" class="form-control" placeholder="+20" value="${sockMmp}" onchange="setTagVal(item, 'Socket MMP', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SINTESIS & CRAFTING -->
                <div class="card">
                    <div class="card-header"><h2>🔨 Resep Sintesis &amp; Crafting (NUSV_ItemSynthesis)</h2></div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Kategori Sintesis (&lt;Synthesis Category: ...&gt;)</label>
                                <input type="text" class="form-control" placeholder="Forge, Alchemy, Cooking..." value="${escapeHtml(synCat)}" onchange="setTagVal(item, 'Synthesis Category', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Jumlah Hasil Buatan (&lt;Synthesis Amount: X&gt;)</label>
                                <input type="number" min="1" class="form-control" placeholder="1" value="${synAmt}" onchange="setTagVal(item, 'Synthesis Amount', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(item.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        function onItemSocketTargetChange(val) {
            const item = State.items[State.selectedIndex];
            setBoolTag(item, 'Socket Weapon Only', false);
            setBoolTag(item, 'Socket Armor Only', false);
            if (val === 'Weapon') {
                setBoolTag(item, 'Socket Weapon Only', true);
            } else if (val === 'Armor') {
                setBoolTag(item, 'Socket Armor Only', true);
            }
        }

        // =====================================================================
        // 7. ENEMIES EDITOR
        // =====================================================================
        function renderEnemyEditor(container, enemy) {
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

            container.innerHTML = `
                <!-- IDENTITAS & LEVEL SCALING -->
                <div class="card">
                    <div class="card-header">
                        <h2>👾 Musuh: #${enemy.id} ${escapeHtml(enemy.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">MHP: ${enemy.params[0]} • ATK: ${enemy.params[2]} • EXP: ${enemy.exp} • Gold: ${enemy.gold}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Mode Level Musuh (&lt;Enemy Level: ...&gt;)</label>
                                    <input type="text" class="form-control" placeholder="Contoh: 10, atau 5 to 12, atau Party" value="${escapeHtml(lvlTag)}" onchange="setTagVal(enemy, 'Enemy Level', this.value);">
                                    <div class="helper-text">Isi "Party" agar level musuh otomatis menyesuaikan level party pemain.</div>
                                </div>

                                <div class="grid-3">
                                    <div class="form-group">
                                        <label>Variasi Level (±X)</label>
                                        <input type="number" class="form-control" placeholder="0" value="${variance}" onchange="setTagVal(enemy, 'Level Variance', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Batas Level Bawah</label>
                                        <input type="number" class="form-control" placeholder="Min" value="${minLvl}" onchange="setTagVal(enemy, 'Minimum Level', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Batas Level Atas</label>
                                        <input type="number" class="form-control" placeholder="Max" value="${maxLvl}" onchange="setTagVal(enemy, 'Maximum Level', this.value);">
                                    </div>
                                </div>

                                <div class="grid-2" style="margin-top:10px;">
                                    <label class="checkbox-label">
                                        <input type="checkbox" ${noLvlScale ? 'checked' : ''} onchange="setBoolTag(enemy, 'No Level Scaling', this.checked);">
                                        <span>Kunci Stat (&lt;No Level Scaling&gt;)</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" ${noDiffScale ? 'checked' : ''} onchange="setBoolTag(enemy, 'No Difficulty Scaling', this.checked);">
                                        <span>Kunci Difficulty</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label>Tipe Ras Musuh</label>
                                        <input type="text" class="form-control" placeholder="Beast, Undead, Demon..." value="${escapeHtml(enemyType)}" onchange="setTagVal(enemy, 'NUSV Enemy Type', this.value); setTagVal(enemy, 'Enemy Type', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Peringkat Musuh (Rank)</label>
                                        <select class="form-control" onchange="setTagVal(enemy, 'NUSV Enemy Rank', this.value);">
                                            ${['Normal', 'Elite', 'Mini-Boss', 'Boss', 'World Boss'].map(r => `<option value="${r}" ${enemyRank === r ? 'selected' : ''}>${r}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="grid-3">
                                    <div class="form-group">
                                        <label>Tier Musuh (1-5)</label>
                                        <input type="number" min="1" max="5" class="form-control" value="${tier}" onchange="setTagVal(enemy, 'NUSV Tier', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Elemen Utama</label>
                                        <input type="text" class="form-control" placeholder="Fire, Dark..." value="${escapeHtml(element)}" onchange="setTagVal(enemy, 'NUSV Element', this.value);">
                                    </div>
                                    <div class="form-group">
                                        <label>Kelemahan</label>
                                        <input type="text" class="form-control" placeholder="Holy, Water..." value="${escapeHtml(weakness)}" onchange="setTagVal(enemy, 'NUSV Weakness', this.value);">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PERTUMBUHAN STAT & HADIAH NUSVANIR -->
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header"><h2>📈 Pertumbuhan Stat per Level Musuh</h2></div>
                        <div class="card-body">
                            <div class="form-group">
                                <label>Pertumbuhan Parameter Utama (&lt;Param Growth: X%&gt;)</label>
                                <input type="text" class="form-control" placeholder="Contoh: 3%" value="${paramGrowth}" onchange="setTagVal(enemy, 'Param Growth', this.value);">
                            </div>
                            <div class="grid-2">
                                <div class="form-group">
                                    <label>Pertumbuhan EXP (&lt;EXP Growth&gt;)</label>
                                    <input type="text" class="form-control" placeholder="4%" value="${expGrowth}" onchange="setTagVal(enemy, 'EXP Growth', this.value);">
                                </div>
                                <div class="form-group">
                                    <label>Pertumbuhan Gold (&lt;Gold Growth&gt;)</label>
                                    <input type="text" class="form-control" placeholder="5%" value="${goldGrowth}" onchange="setTagVal(enemy, 'Gold Growth', this.value);">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><h2>🎁 Hadiah Khusus Nusvanir</h2></div>
                        <div class="card-body">
                            <div class="form-group">
                                <label>Hadiah Class EXP Karakter (&lt;Class EXP: X&gt;)</label>
                                <input type="number" class="form-control" placeholder="Contoh: 25" value="${classExp}" onchange="setTagVal(enemy, 'Class EXP', this.value);">
                                <div class="helper-text">Jumlah EXP khusus yang didapat karakter untuk menaikkan Class Level.</div>
                            </div>
                            <div class="form-group">
                                <label>Hadiah Job Points (&lt;JP: X&gt;)</label>
                                <input type="number" class="form-control" placeholder="Contoh: 20" value="${jp}" onchange="setTagVal(enemy, 'JP', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(enemy.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // 8. STATES EDITOR
        // =====================================================================
        function renderStateEditor(container, state) {
            const note = state.note || '';
            const currentType = getTagVal(note, 'NUSV Type', '2');
            const currentDesc = getTagVal(note, 'NUSV Desc', state.description || '');

            const critDmg = getTagVal(note, 'Critical Damage', '');
            const armPen = getTagVal(note, 'Armor Penetration', '');
            const magPen = getTagVal(note, 'Magic Penetration', '');
            const pdr = getTagVal(note, 'PDR Plus', '');
            const mdr = getTagVal(note, 'MDR Plus', '');
            const hit = getTagVal(note, 'HIT Plus', '');
            const eva = getTagVal(note, 'EVA Plus', '');
            const cri = getTagVal(note, 'CRI Plus', '');
            const grd = getTagVal(note, 'GRD Plus', '');
            const cnt = getTagVal(note, 'CNT Plus', '');

            const coreBonuses = {};
            CORE_ATTRIBUTES.forEach(a => {
                coreBonuses[a.code] = getTagVal(note, a.code, '');
            });
            const maxSpBonus = getTagVal(note, 'Max SP', '');

            container.innerHTML = `
                <!-- IDENTITAS & TIPE STATUS -->
                <div class="card">
                    <div class="card-header">
                        <h2>💫 Status: #${state.id} ${escapeHtml(state.name)}</h2>
                        <span style="font-size:0.85rem; color:var(--text-muted);">Prioritas: ${state.priority} • Ikon ID: ${state.iconIndex}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <div class="form-group">
                                    <label>Tipe Status Nusvanir (&lt;NUSV Type: 1/2/3&gt;)</label>
                                    <select class="form-control" onchange="setTagVal(state, 'NUSV Type', this.value); renderSidebar();">
                                        <option value="1" ${currentType === '1' ? 'selected' : ''}>1 - Buff (Menguntungkan - Hijau)</option>
                                        <option value="2" ${currentType === '2' ? 'selected' : ''}>2 - Debuff (Merugikan - Merah)</option>
                                        <option value="3" ${currentType === '3' ? 'selected' : ''}>3 - Pasif / Khusus (Ungu / Netral)</option>
                                    </select>
                                    <div class="helper-text">Digunakan oleh Nusvanir Status Screen dan combat popup untuk pewarnaan dan kategorisasi.</div>
                                </div>
                            </div>

                            <div>
                                <div class="form-group">
                                    <label>Deskripsi Tooltip Status (&lt;NUSV Desc: ...&gt;)</label>
                                    <textarea class="form-control" rows="4" onchange="setTagVal(state, 'NUSV Desc', this.value);">${escapeHtml(currentDesc)}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODIFIKASI ATRIBUT NUSVANIR -->
                <div class="card">
                    <div class="card-header">
                        <h2>📊 Modifikasi Atribut Stat Nusvanir</h2>
                        <span style="font-size:0.8rem; color:var(--text-muted);">&lt;STR: +X / -X&gt; dll. Saat status aktif pada battler.</span>
                    </div>
                    <div class="card-body">
                        <div class="stat-grid-6">
                            ${CORE_ATTRIBUTES.map(attr => `
                                <div class="stat-card-input">
                                    <label style="color:${attr.color};">
                                        <span>${attr.icon} ${attr.code}</span>
                                        <span style="font-size:0.75rem; color:var(--text-muted);">${attr.name}</span>
                                    </label>
                                    <input type="text" class="form-control" placeholder="+0" value="${coreBonuses[attr.code]}" onchange="setTagVal(state, '${attr.code}', this.value);">
                                </div>
                            `).join('')}
                        </div>
                        <div class="form-group" style="margin-top:12px; max-width:240px;">
                            <label>Bonus / Pengurangan Max SP (&lt;Max SP: +X&gt;)</label>
                            <input type="text" class="form-control" placeholder="+0" value="${maxSpBonus}" onchange="setTagVal(state, 'Max SP', this.value);">
                        </div>
                    </div>
                </div>

                <!-- MODIFIKASI TEMPUR EKSTRA -->
                <div class="card">
                    <div class="card-header"><h2>⚔️ Modifikasi Parameter Tempur Ekstra</h2></div>
                    <div class="card-body">
                        <div class="grid-3">
                            <div class="form-group">
                                <label>Bonus Kerusakan Kritis</label>
                                <input type="text" class="form-control" placeholder="+25%" value="${critDmg}" onchange="setTagVal(state, 'Critical Damage', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Penetrasi Fisik</label>
                                <input type="text" class="form-control" placeholder="15%" value="${armPen}" onchange="setTagVal(state, 'Armor Penetration', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Penetrasi Sihir</label>
                                <input type="text" class="form-control" placeholder="15%" value="${magPen}" onchange="setTagVal(state, 'Magic Penetration', this.value);">
                            </div>
                        </div>

                        <div class="grid-4" style="margin-top:10px;">
                            <div class="form-group">
                                <label>Reduksi Fisik (&lt;PDR Plus&gt;)</label>
                                <input type="text" class="form-control" placeholder="-15%" value="${pdr}" onchange="setTagVal(state, 'PDR Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Reduksi Magis (&lt;MDR Plus&gt;)</label>
                                <input type="text" class="form-control" placeholder="-15%" value="${mdr}" onchange="setTagVal(state, 'MDR Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus Akurasi (&lt;HIT Plus&gt;)</label>
                                <input type="text" class="form-control" placeholder="+10%" value="${hit}" onchange="setTagVal(state, 'HIT Plus', this.value);">
                            </div>
                            <div class="form-group">
                                <label>Bonus Elak (&lt;EVA Plus&gt;)</label>
                                <input type="text" class="form-control" placeholder="+10%" value="${eva}" onchange="setTagVal(state, 'EVA Plus', this.value);">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTETAG MENTAH -->
                <div class="card">
                    <div class="card-header"><h2>📝 Full Notetag Mentah</h2></div>
                    <div class="card-body">
                        <textarea id="rawNoteTextarea" class="form-control" rows="6" onchange="onRawNoteInput(this.value)">${escapeHtml(state.note || '')}</textarea>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // SAVE & BACKUP HANDLER
        // =====================================================================
        async function saveActiveDataset() {
            let filename = '';
            let data = null;

            switch (State.currentTab) {
                case 'actors': filename = 'Actors.json'; data = State.actors; break;
                case 'classes': filename = 'Classes.json'; data = State.classes; break;
                case 'races': filename = 'Races.json'; data = State.races; break;
                case 'weapons': filename = 'Weapons.json'; data = State.weapons; break;
                case 'armors': filename = 'Armors.json'; data = State.armors; break;
                case 'skills': filename = 'Skills.json'; data = State.skills; break;
                case 'animations': filename = 'Animations.json'; data = State.animations; break;
                case 'items': filename = 'Items.json'; data = State.items; break;
                case 'enemies': filename = 'Enemies.json'; data = State.enemies; break;
                case 'states': filename = 'States.json'; data = State.states; break;
            }

            if (!filename || !data) return;

            showToast(`Menyimpan ${filename}...`, 'info');

            try {
                const res = await fetch(`/api/save/${filename}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.status === 'ok') {
                    setUnsaved(false);
                    showToast(`${filename} berhasil disimpan (backup otomatis tersimpan)!`, 'success');
                } else {
                    throw new Error(result.message || 'Gagal menyimpan');
                }
            } catch (err) {
                console.error(err);
                showToast(`Gagal menyimpan: ${err.message}`, 'error');
            }
        }

        function setUnsaved(status) {
            State.hasUnsavedChanges = status;
            const badge = document.getElementById('unsavedBadge');
            if (badge) {
                badge.style.display = status ? 'inline-block' : 'none';
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMessage');
            const icon = document.getElementById('toastIcon');

            toast.className = `toast show ${type}`;
            msg.innerText = message;

            if (type === 'success') icon.innerText = '✅';
            else if (type === 'error') icon.innerText = '❌';
            else icon.innerText = 'ℹ️';

            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 3200);
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    </script>
</body>
</html>
'''

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT.strip() + "\n")

print(f"Successfully generated {OUTPUT_FILE} ({len(HTML_CONTENT)} bytes)")

