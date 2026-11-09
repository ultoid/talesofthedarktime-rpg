#!/usr/bin/env python3
"""
Enhanced Standalone HTML Atlas Viewer for Pixel Art Atlas.
Consistent and uniform styling across all category tabs.
"""

import os
import json
import re
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DATA_DIR = os.path.join(PROJECT_DIR, "pixel_art_atlas")

INVALID_CHARS_RE = re.compile(r'[<>:"/\\|?*\x00-\x1f]')

def sanitize_folder(name: str) -> str:
    cleaned = INVALID_CHARS_RE.sub("_", name).strip()
    return cleaned[:60] if len(cleaned) > 60 else (cleaned or "unnamed")

def sanitize_filename(name: str) -> str:
    cleaned = INVALID_CHARS_RE.sub("_", name).strip()
    return cleaned[:100] if len(cleaned) > 100 else (cleaned or "unnamed")

def main():
    objects_path = os.path.join(DATA_DIR, "objects.json")
    with open(objects_path, "r", encoding="utf-8") as f:
        objects = json.load(f)

    counts = Counter(objects)
    items = []
    seen = set()

    skill_keywords = [
        'slash', 'strike', 'thrust', 'burst', 'blast', 'swirl', 'aura', 'nova',
        'skill', 'symbol', 'mark', 'rune', 'orb',
        'healing', 'heal', 'cure', 'bless', 'curse', 'poison', 'bleed', 'shock', 'stun', 'sleep', 'silence',
        'frost nova', 'whirlwind', 'earthquake', 'sandstorm', 'tornado', 'blizzard',
        'arrow volley', 'battle cry', 'critical strike', 'shield bash', 'lifesteal',
        'up arrow', 'down arrow', 'level up', 'agility feather', 'strength bicep', 'wisdom owl', 'intelligence brain', 'luck clover',
        'dizzy stars', 'anger mark', 'fear face', 'charmed heart', 'rooted vine', 'slowed snail', 'petrified stone', 'confusion'
    ]

    for idx, obj in enumerate(objects):
        if obj not in seen:
            seen.add(obj)
            safe_file = sanitize_filename(obj)
            filename = f"{safe_file}.png"
            p32 = os.path.join(DATA_DIR, "unique_icons_32x32", filename)
            if not os.path.exists(p32):
                filename = f"{safe_file}_{idx}.png"

            safe_dir = sanitize_folder(obj)

            cat = "other"
            obj_l = obj.lower()

            if any(k in obj_l for k in skill_keywords) and not any(k in obj_l for k in ["backpack", "camera", "bar chart"]):
                cat = "skill"
            elif any(k in obj_l for k in ["sword", "blade", "axe", "bow", "dagger", "spear", "mace", "hammer", "crossbow", "shield"]):
                cat = "weapon"
            elif any(k in obj_l for k in ["armor", "helmet", "boot", "glove", "bracer", "chestplate", "cloak", "robe", "hat", "cap"]):
                cat = "armor"
            elif any(k in obj_l for k in ["potion", "bottle", "vial", "scroll", "ring", "amulet", "gem", "crystal", "wand", "staff", "book"]):
                cat = "magic"
            elif any(k in obj_l for k in ["icon", "button", "arrow", "cursor", "badge"]):
                cat = "icon"
            elif any(k in obj_l for k in ["meat", "bread", "fruit", "vegetable", "fish", "apple", "berry", "pie", "soup", "cheese", "cake"]):
                cat = "food"
            elif any(k in obj_l for k in ["monster", "goblin", "dragon", "skeleton", "zombie", "demon", "spider", "wolf", "beast", "slime"]):
                cat = "creature"

            items.append({
                "n": obj,
                "c": counts[obj],
                "f": filename,
                "d": safe_dir,
                "t": cat
            })

    json_str = json.dumps(items, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pixel Art Atlas 1.4M Explorer</title>
<style>
  :root {{
    --bg: #0f1117;
    --card: #181b24;
    --card-hover: #1f2330;
    --card-border: #282f3f;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --accent: #f59e0b;
    --accent-glow: rgba(245, 158, 11, 0.3);
    --primary: #3b82f6;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 20px;
    min-height: 100vh;
  }}
  header {{
    max-width: 1440px;
    margin: 0 auto 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}
  .title-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }}
  h1 {{
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .badge {{
    font-size: 12px;
    background: var(--accent);
    color: #000;
    padding: 3px 9px;
    border-radius: 999px;
    font-weight: 700;
  }}
  .badge-secondary {{
    font-size: 12px;
    background: #252a36;
    color: #38bdf8;
    border: 1px solid #334155;
    padding: 3px 9px;
    border-radius: 999px;
    font-weight: 600;
  }}
  .subtitle {{
    color: var(--muted);
    font-size: 13.5px;
  }}
  .controls {{
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    background: var(--card);
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--card-border);
  }}
  input[type="text"] {{
    flex: 1;
    min-width: 240px;
    padding: 10px 14px;
    background: #0b0d13;
    border: 1px solid #333d52;
    border-radius: 7px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }}
  input[type="text"]:focus {{
    border-color: var(--accent);
  }}
  .filter-tabs {{
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }}
  .tab {{
    padding: 6px 12px;
    font-size: 12.5px;
    border-radius: 6px;
    background: #222734;
    color: var(--muted);
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
  }}
  .tab:hover {{
    color: #fff;
    background: #2e3545;
  }}
  .tab.active {{
    background: var(--accent);
    color: #000;
    font-weight: 700;
  }}
  .stats {{
    font-size: 13px;
    color: var(--muted);
    margin-left: auto;
  }}
  .grid {{
    max-width: 1440px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }}
  .card {{
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    padding: 12px 8px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s, background 0.15s;
    cursor: pointer;
    user-select: none;
  }}
  .card:hover {{
    transform: translateY(-3px);
    background: var(--card-hover);
    border-color: var(--accent);
    box-shadow: 0 6px 20px var(--accent-glow);
  }}
  .sprite-box {{
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #090b10;
    background-image: 
      linear-gradient(45deg, #161822 25%, transparent 25%), 
      linear-gradient(-45deg, #161822 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #161822 75%), 
      linear-gradient(-45deg, transparent 75%, #161822 75%);
    background-size: 14px 14px;
    background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
    border-radius: 8px;
    border: 1px solid #282f3f;
    overflow: hidden;
  }}
  .sprite-img {{
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    width: 32px;
    height: 32px;
  }}
  .card-name {{
    font-size: 11.5px;
    line-height: 1.3;
    font-weight: 600;
    color: #e2e8f0;
    word-break: break-word;
    max-height: 30px;
    overflow: hidden;
  }}
  .card-btn {{
    width: 100%;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 600;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.35);
    padding: 5px 8px;
    border-radius: 6px;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }}
  .card:hover .card-btn {{
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
  }}
  .pagination {{
    max-width: 1440px;
    margin: 24px auto 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }}
  .page-btn {{
    padding: 8px 18px;
    background: #222734;
    border: 1px solid #333d52;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }}
  .page-btn:disabled {{
    opacity: 0.35;
    cursor: not-allowed;
  }}

  /* Full Variation Gallery Modal */
  .modal-overlay {{
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(5px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }}
  .modal-dialog {{
    background: #141720;
    border: 1px solid #384259;
    border-radius: 14px;
    max-width: 1120px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 16px 50px rgba(0,0,0,0.9);
    overflow: hidden;
  }}
  .modal-header {{
    padding: 16px 20px;
    border-bottom: 1px solid #242a3a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #181c28;
  }}
  .modal-header-info h2 {{
    font-size: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .modal-header-info p {{
    font-size: 13px;
    color: var(--muted);
    margin-top: 4px;
  }}
  .modal-body {{
    display: flex;
    flex: 1;
    overflow: hidden;
  }}
  .variation-grid-wrap {{
    flex: 1;
    padding: 18px;
    overflow-y: auto;
    max-height: 72vh;
  }}
  .variation-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
  }}
  .var-item {{
    background: #191c26;
    border: 1px solid #282f42;
    border-radius: 8px;
    padding: 8px 4px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.12s;
  }}
  .var-item:hover, .var-item.active {{
    border-color: var(--accent);
    background: #252a3a;
    transform: translateY(-2px);
    box-shadow: 0 3px 10px var(--accent-glow);
  }}
  .var-item img {{
    image-rendering: pixelated;
    width: 32px;
    height: 32px;
  }}
  .var-num {{
    font-size: 10px;
    color: var(--muted);
    font-weight: 600;
  }}
  .preview-sidebar {{
    width: 300px;
    background: #0f1218;
    border-left: 1px solid #242a3a;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }}
  .sidebar-box {{
    width: 160px;
    height: 160px;
    background: #090b10;
    background-image: 
      linear-gradient(45deg, #161822 25%, transparent 25%), 
      linear-gradient(-45deg, #161822 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #161822 75%), 
      linear-gradient(-45deg, transparent 75%, #161822 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    border: 1px solid #333d52;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .sidebar-box img {{
    image-rendering: pixelated;
    width: 112px;
    height: 112px;
  }}
  .btn-download {{
    background: var(--accent);
    color: #000;
    font-weight: 700;
    border: none;
    padding: 10px 18px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13.5px;
    text-decoration: none;
    width: 100%;
    display: inline-block;
    transition: opacity 0.15s;
  }}
  .btn-download:hover {{
    opacity: 0.9;
  }}
  .btn-close {{
    background: #252a36;
    color: #fff;
    border: 1px solid #384259;
    padding: 7px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }}
  .btn-close:hover {{
    background: #333d52;
  }}
</style>
</head>
<body>

<header>
  <div class="title-row">
    <h1>Pixel Art Atlas <span class="badge">1.4M Sprites</span> <span class="badge-secondary">6,194 Kategori</span></h1>
    <div class="subtitle">Klik kartu mana saja di bawah untuk langsung membuka seluruh variasi sprite (total 1,4 juta file PNG).</div>
  </div>

  <div class="controls">
    <input type="text" id="searchInput" placeholder="Cari 6.194 kategori (misal: fire bomb, slash, sword, potion, helmet, dragon)..." autofocus>
    <div class="filter-tabs">
      <button class="tab active" data-cat="all">Semua (6,194)</button>
      <button class="tab" data-cat="skill">Skill & Status</button>
      <button class="tab" data-cat="weapon">Senjata</button>
      <button class="tab" data-cat="armor">Armor</button>
      <button class="tab" data-cat="magic">Magic / Potions</button>
      <button class="tab" data-cat="food">Makanan</button>
      <button class="tab" data-cat="creature">Monster / Hewan</button>
      <button class="tab" data-cat="icon">Icons / UI</button>
    </div>
    <div class="stats" id="statsDisplay">Loading...</div>
  </div>
</header>

<main class="grid" id="grid"></main>

<div class="pagination">
  <button class="page-btn" id="prevBtn" onclick="changePage(-1)">Sebelumnya</button>
  <span id="pageInfo">Halaman 1</span>
  <button class="page-btn" id="nextBtn" onclick="changePage(1)">Berikutnya</button>
</div>

<!-- Full Variation Gallery Modal -->
<div class="modal-overlay" id="modal" onclick="closeModal(event)">
  <div class="modal-dialog" onclick="event.stopPropagation()">
    <div class="modal-header">
      <div class="modal-header-info">
        <h2 id="modalCategoryTitle">Category Title</h2>
        <p id="modalCategorySub">Folder: pixel_art_atlas/all_icons_by_category/...</p>
      </div>
      <button class="btn-close" onclick="closeModal()">Tutup (Esc)</button>
    </div>
    <div class="modal-body">
      <div class="variation-grid-wrap">
        <div class="variation-grid" id="variationGrid"></div>
      </div>
      <div class="preview-sidebar">
        <div style="font-weight: 700; font-size: 15px; color: #fff;" id="sidebarName">Preview</div>
        <div class="sidebar-box">
          <img id="sidebarImg" src="" alt="Sprite">
        </div>
        <div style="font-size: 12.5px; color: var(--muted); line-height: 1.5;" id="sidebarDetails">
          Resolusi asli: 16×16<br>
          Preview: Skala 7x Pixel Art<br>
          Format: Transparent PNG
        </div>
        <a id="sidebarDownload" class="btn-download" download>Unduh PNG Ini</a>
      </div>
    </div>
  </div>
</div>

<script>
const DATA = {json_str};
let filtered = DATA;
let currentPage = 1;
const PAGE_SIZE = 120;
let currentCat = 'all';
let currentActiveItem = null;

const searchInput = document.getElementById('searchInput');
const grid = document.getElementById('grid');
const statsDisplay = document.getElementById('statsDisplay');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const tabs = document.querySelectorAll('.tab');
const variationGrid = document.getElementById('variationGrid');

function applyFilters() {{
  const query = searchInput.value.trim().toLowerCase();
  filtered = DATA.filter(item => {{
    const matchCat = currentCat === 'all' || item.t === currentCat;
    const matchQuery = !query || item.n.toLowerCase().includes(query);
    return matchCat && matchQuery;
  }});
  currentPage = 1;
  render();
}}

function render() {{
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  statsDisplay.textContent = `Menampilkan ${{total.toLocaleString()}} kategori (Total 1.409.404 file PNG)`;
  pageInfo.textContent = `Halaman ${{currentPage}} dari ${{totalPages}}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = slice.map((item, idx) => {{
    const globalIdx = start + idx;
    return `
      <div class="card" data-idx="${{globalIdx}}">
        <div class="sprite-box">
          <img class="sprite-img" src="unique_icons_32x32/${{item.f}}" alt="${{item.n}}" loading="lazy">
        </div>
        <div class="card-name" title="${{item.n}}">${{item.n}}</div>
        <div class="card-btn">
          <span>Buka ${{item.c}} Variasi</span>
          <span>→</span>
        </div>
      </div>
    `;
  }}).join('');
}}

grid.addEventListener('click', (e) => {{
  const card = e.target.closest('.card');
  if (!card) return;
  const idx = parseInt(card.dataset.idx, 10);
  openCategoryGallery(idx);
}});

function changePage(delta) {{
  currentPage += delta;
  render();
  window.scrollTo({{ top: 0, behavior: 'smooth' }});
}}

tabs.forEach(tab => {{
  tab.addEventListener('click', () => {{
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCat = tab.dataset.cat;
    applyFilters();
  }});
}});

let debounceTimer;
searchInput.addEventListener('input', () => {{
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 150);
}});

function openCategoryGallery(globalIdx) {{
  const item = filtered[globalIdx];
  if (!item) return;
  currentActiveItem = item;

  document.getElementById('modalCategoryTitle').textContent = item.n;
  document.getElementById('modalCategorySub').textContent = `Total ${{item.c}} variasi PNG di folder: pixel_art_atlas/all_icons_by_category/${{item.d}}/`;

  let html = '';
  for (let i = 1; i <= item.c; i++) {{
    const numStr = String(i).padStart(4, '0');
    const path = `all_icons_by_category/${{encodeURIComponent(item.d)}}/${{numStr}}.png`;
    html += `
      <div class="var-item ${{i === 1 ? 'active' : ''}}" data-num="${{numStr}}">
        <img src="${{path}}" loading="lazy" alt="#${{i}}">
        <span class="var-num">#${{numStr}}</span>
      </div>
    `;
  }}
  variationGrid.innerHTML = html;

  selectVariation('0001');

  document.getElementById('modal').style.display = 'flex';
}}

variationGrid.addEventListener('click', (e) => {{
  const itemEl = e.target.closest('.var-item');
  if (!itemEl || !currentActiveItem) return;

  variationGrid.querySelectorAll('.var-item').forEach(el => el.classList.remove('active'));
  itemEl.classList.add('active');

  const numStr = itemEl.dataset.num;
  selectVariation(numStr);
}});

function selectVariation(numStr) {{
  if (!currentActiveItem) return;
  const folder = currentActiveItem.d;
  const path = `all_icons_by_category/${{encodeURIComponent(folder)}}/${{numStr}}.png`;

  document.getElementById('sidebarName').textContent = `${{currentActiveItem.n}} #${{numStr}}`;
  document.getElementById('sidebarImg').src = path;
  document.getElementById('sidebarDetails').innerHTML = `
    Kategori: <b>${{currentActiveItem.n}}</b><br>
    File: <b>${{numStr}}.png</b><br>
    Folder: <b>${{folder}}</b><br>
    Resolusi: 16×16 (skala 7x)
  `;
  const dl = document.getElementById('sidebarDownload');
  dl.href = path;
  dl.download = `${{folder}}_${{numStr}}.png`;
}}

function closeModal() {{
  document.getElementById('modal').style.display = 'none';
}}

document.addEventListener('keydown', (e) => {{
  if (e.key === 'Escape') closeModal();
}});

applyFilters();
</script>
</body>
</html>
"""
    out_html = os.path.join(DATA_DIR, "atlas_viewer.html")
    with open(out_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Generated standalone HTML Atlas Viewer: {out_html}")

if __name__ == "__main__":
    main()
