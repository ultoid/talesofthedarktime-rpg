#!/usr/bin/env python3
"""
Master Nusvanir IconSet Builder for Tales of The Dark Time.
Combines existing RPG Maker MV IconSet with 100% hand-curated pixel art icons.
Guarantees zero irrelevant items (no bowls for bows, no ambulances for spears).
"""

import os
import sys
import json
import shutil
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from tools.curate_iconset import get_master_curated_blocks
ICONSET_PATH = os.path.join(PROJECT_DIR, "img", "system", "IconSet.png")
BACKUP_PATH = os.path.join(PROJECT_DIR, "img", "system", "IconSet_backup_original.png")
DATA_DIR = os.path.join(PROJECT_DIR, "database", "pixel_art_atlas") if os.path.exists(os.path.join(PROJECT_DIR, "database", "pixel_art_atlas")) else os.path.join(PROJECT_DIR, "pixel_art_atlas")
ICONS_32_DIR = os.path.join(DATA_DIR, "unique_icons_32x32")
META_PATH = os.path.join(DATA_DIR, "unique_icons_meta.json")

def main():
    print("=== Building Verified Master Nusvanir IconSet ===")
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta_items = json.load(f)
    catalog = {it["name"]: it["file"] for it in meta_items}

    curated_blocks = get_master_curated_blocks()

    # Load original IconSet.png (or from backup if already modified)
    src_iconset = BACKUP_PATH if os.path.exists(BACKUP_PATH) else ICONSET_PATH
    orig_img = Image.open(src_iconset).convert("RGBA")
    # We only take the first 20 rows (320 icons)
    orig_w, orig_h = orig_img.size
    cols = 16
    orig_rows = 20
    orig_img_cropped = orig_img.crop((0, 0, 512, orig_rows * 32))
    orig_count = cols * orig_rows

    total_curated_icons = sum(len(items) for _, items in curated_blocks)
    new_rows = total_curated_icons // cols
    total_rows = orig_rows + new_rows
    total_icons = total_rows * cols

    canvas_w = 512
    canvas_h = total_rows * 32
    print(f"Canvas size: {canvas_w}x{canvas_h} ({cols} cols x {total_rows} rows = {total_icons} total icons)")

    new_img = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    # Paste original 320 icons untouched
    new_img.paste(orig_img_cropped, (0, 0))

    icon_mapping = []
    # Original icons
    for i in range(orig_count):
        row = i // cols
        col = i % cols
        icon_mapping.append({
            "index": i,
            "name": f"Original Icon #{i}" if i > 0 else "Empty (None)",
            "category": "Original Game Icons",
            "row": row,
            "col": col,
            "file": None
        })

    current_idx = orig_count
    for cat_title, items in curated_blocks:
        print(f"Pasting [{cat_title}] ({len(items)} icons) starting at index {current_idx} (Row {current_idx//16})...")
        for item_name in items:
            row = current_idx // cols
            col = current_idx % cols
            x = col * 32
            y = row * 32

            file_name = catalog[item_name]
            sprite_path = os.path.join(ICONS_32_DIR, file_name)
            if os.path.exists(sprite_path):
                sprite = Image.open(sprite_path).convert("RGBA")
                if sprite.size != (32, 32):
                    sprite = sprite.resize((32, 32), Image.Resampling.NEAREST)
                new_img.paste(sprite, (x, y), sprite)
            else:
                print(f"WARNING: File not found: {sprite_path}")

            icon_mapping.append({
                "index": current_idx,
                "name": item_name,
                "category": cat_title,
                "row": row,
                "col": col,
                "file": file_name
            })
            current_idx += 1

    # Save IconSet.png
    new_img.save(ICONSET_PATH)
    print(f"\n[OK] Saved Master IconSet: {ICONSET_PATH} ({new_img.size})")

    # Save mapping JSON
    map_json_path = os.path.join(PROJECT_DIR, "img", "system", "IconSet_mapping.json")
    with open(map_json_path, "w", encoding="utf-8") as f:
        json.dump(icon_mapping, f, ensure_ascii=False, indent=2)
    print(f"[OK] Saved IconSet mapping: {map_json_path}")

    # Generate Markdown Guide
    guide_path = os.path.join(PROJECT_DIR, "NUSV_ICONSET_GUIDE.md")
    with open(guide_path, "w", encoding="utf-8") as f:
        f.write("# 🛡️ Nusvanir Master IconSet Guide (Tales of The Dark Time)\n\n")
        f.write(f"Total Ikon: **{len(icon_mapping):,} ikon** (Grid 16×{total_rows} baris, resolusi 512×{canvas_h}px)\n\n")
        f.write("Seluruh ikon asli bawaan game (**Index 0–319**) dipertahankan 100% tanpa perubahan. Ikon baru dikurasi secara manual tanpa kesalahan pencarian kata (misal: busur panah dijamin berbentuk busur/crossbow sungguhan).\n\n")
        f.write("---\n\n")
        f.write("## 📑 Daftar Kategori & Rentang Index Terverifikasi\n\n")
        f.write("| Baris | Rentang Icon Index | Kategori | Jumlah Ikon |\n")
        f.write("| :---: | :---: | :--- | :---: |\n")
        f.write(f"| 0–19 | 0 – 319 | *Original Game Icons (Preserved)* | 320 |\n")

        start_i = orig_count
        for title, items in curated_blocks:
            end_i = start_i + len(items) - 1
            start_row = start_i // 16
            end_row = end_i // 16
            row_str = f"{start_row}" if start_row == end_row else f"{start_row}–{end_row}"
            f.write(f"| {row_str} | **{start_i} – {end_i}** | {title} | {len(items)} |\n")
            start_i += len(items)

        f.write("\n---\n\n")
        f.write("## 🔍 Detail Setiap Ikon Baru\n\n")
        for title, items in curated_blocks:
            f.write(f"### {title}\n")
            sub_items = [it for it in icon_mapping if it["category"] == title]
            for it in sub_items:
                f.write(f"* **#{it['index']}**: `{it['name']}` (Baris {it['row']}, Kolom {it['col']})\n")
            f.write("\n")

    print(f"[OK] Generated clean guide: {guide_path}")

if __name__ == "__main__":
    main()
