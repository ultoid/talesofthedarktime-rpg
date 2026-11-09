#!/usr/bin/env python3
"""
Pixel Art Atlas 1.4M - Exporter and Tool
Extracts sprites from Angais/pixel-art-atlas-1.4m dataset.
"""

import os
import sys
import json
import re
import time
import argparse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DEFAULT_DATA_DIR = os.path.join(PROJECT_DIR, "pixel_art_atlas")

INVALID_CHARS_RE = re.compile(r'[<>:"/\\|?*\x00-\x1f]')

def sanitize_filename(name: str) -> str:
    cleaned = INVALID_CHARS_RE.sub("_", name).strip()
    return cleaned[:100] if len(cleaned) > 100 else (cleaned or "unnamed")

def load_dataset(data_dir: str):
    tokens_path = os.path.join(data_dir, "tokens.npy")
    palette_path = os.path.join(data_dir, "palette.npy")
    objects_path = os.path.join(data_dir, "objects.json")
    captions_path = os.path.join(data_dir, "captions.json")

    for p in [tokens_path, palette_path, objects_path, captions_path]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing required file: {p}. Make sure dataset is extracted.")

    print(f"Loading dataset from {data_dir}...")
    tokens = np.load(tokens_path, mmap_mode="r")
    palette = np.load(palette_path)
    with open(objects_path, "r", encoding="utf-8") as f:
        objects = json.load(f)
    with open(captions_path, "r", encoding="utf-8") as f:
        captions = json.load(f)

    print(f"Loaded: {len(objects):,} total sprites, {tokens.shape[0]:,} tokens.")
    return tokens, palette, objects, captions

def get_sprite_image(tokens, palette, index: int, scale: int = 1) -> Image.Image:
    pixels = tokens[index].reshape(16, 16)
    rgb = palette[pixels]
    alpha = ((pixels != 0).astype(np.uint8) * 255)[..., np.newaxis]
    rgba = np.concatenate([rgb, alpha], axis=2)
    img = Image.fromarray(rgba, mode="RGBA")
    if scale > 1:
        img = img.resize((16 * scale, 16 * scale), resample=Image.Resampling.NEAREST)
    return img

def export_unique_icons(tokens, palette, objects, captions, out_dir: str, scale: int = 1):
    """
    Exports 1 representative sprite per unique object (6,194 unique icons).
    Safe and smooth for Windows File Explorer.
    """
    os.makedirs(out_dir, exist_ok=True)
    print(f"\n[Mode: Unique Icons] Exporting 1 sprite per unique category to: {out_dir}")

    # Map unique objects to first index
    seen = {}
    for idx, obj in enumerate(objects):
        if obj not in seen:
            seen[obj] = idx

    total = len(seen)
    print(f"Total unique categories: {total:,}")

    t0 = time.time()
    count = 0
    for obj_name, idx in seen.items():
        safe_name = sanitize_filename(obj_name)
        filename = f"{safe_name}.png"
        filepath = os.path.join(out_dir, filename)
        
        # If collision occurs, append index
        if os.path.exists(filepath):
            filename = f"{safe_name}_{idx}.png"
            filepath = os.path.join(out_dir, filename)

        img = get_sprite_image(tokens, palette, idx, scale=scale)
        img.save(filepath)
        count += 1
        if count % 1000 == 0 or count == total:
            print(f"Saved {count:,} / {total:,} ({count/total*100:.1f}%)")

    elapsed = time.time() - t0
    print(f"Successfully exported {count:,} unique icons in {elapsed:.1f}s ({count/elapsed:.1f} img/s)!")

def export_search(tokens, palette, objects, captions, query: str, out_dir: str, limit: int = 200, scale: int = 1):
    """
    Exports sprites matching a search query in object name or caption.
    """
    os.makedirs(out_dir, exist_ok=True)
    query_lower = query.lower()
    print(f"\n[Mode: Search] Searching for '{query}'...")

    matches = []
    for idx, (obj, cap) in enumerate(zip(objects, captions)):
        if query_lower in obj.lower() or query_lower in cap.lower():
            matches.append(idx)
            if limit and len(matches) >= limit:
                break

    print(f"Found {len(matches):,} matches (exporting up to {limit}). Destination: {out_dir}")
    t0 = time.time()
    for rank, idx in enumerate(matches):
        safe_obj = sanitize_filename(objects[idx])
        safe_cap = sanitize_filename(captions[idx])
        filename = f"{rank+1:04d}_{safe_obj}_{safe_cap[:30]}.png"
        filepath = os.path.join(out_dir, filename)
        img = get_sprite_image(tokens, palette, idx, scale=scale)
        img.save(filepath)

    elapsed = time.time() - t0
    print(f"Exported {len(matches)} sprites in {elapsed:.2f}s!")

def export_spritesheet(tokens, palette, objects, query: str, out_file: str, max_items: int = 256, columns: int = 16, sprite_size: int = 32):
    """
    Combines search matches into a single spritesheet atlas (e.g. 16x16 grid = 256 icons).
    Great for RPG Maker MV!
    """
    query_lower = query.lower()
    matches = [idx for idx, obj in enumerate(objects) if query_lower in obj.lower()][:max_items]
    if not matches:
        print(f"No matches found for query '{query}'")
        return

    rows = (len(matches) + columns - 1) // columns
    sheet_w = columns * sprite_size
    sheet_h = rows * sprite_size
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    scale = sprite_size // 16
    for i, idx in enumerate(matches):
        col = i % columns
        row = i // columns
        img = get_sprite_image(tokens, palette, idx, scale=scale)
        sheet.paste(img, (col * sprite_size, row * sprite_size))

    sheet.save(out_file)
    print(f"Saved spritesheet atlas with {len(matches)} icons to: {out_file} ({sheet_w}x{sheet_h})")

def export_categorized(tokens, palette, objects, captions, out_dir: str, max_per_cat: int = None, scale: int = 1):
    """
    Exports sprites organized into subfolders per object category.
    Keeps each directory small (~200 files) so Windows Explorer remains fast.
    """
    os.makedirs(out_dir, exist_ok=True)
    print(f"\n[Mode: Categorized] Exporting sprites into category subfolders in: {out_dir}")

    cat_counts = {}
    total = len(objects)
    t0 = time.time()
    exported = 0

    for idx, obj in enumerate(objects):
        count = cat_counts.get(obj, 0)
        if max_per_cat and count >= max_per_cat:
            continue

        cat_counts[obj] = count + 1
        safe_cat = sanitize_filename(obj)
        cat_dir = os.path.join(out_dir, safe_cat)
        os.makedirs(cat_dir, exist_ok=True)

        filename = f"{count+1:04d}.png"
        img = get_sprite_image(tokens, palette, idx, scale=scale)
        img.save(os.path.join(cat_dir, filename))
        exported += 1

        if exported % 10000 == 0:
            elapsed = time.time() - t0
            print(f"Progress: {exported:,} / {total:,} ({exported/total*100:.1f}%) - {exported/elapsed:.0f} img/s")

    elapsed = time.time() - t0
    print(f"Finished exporting {exported:,} sprites in {elapsed:.1f}s!")

def export_all_flat(tokens, palette, objects, captions, out_dir: str, scale: int = 1):
    """
    Exports all 1.4M sprites into a SINGLE flat folder.
    WARNING: Windows File Explorer will lag severely when opening this folder.
    """
    os.makedirs(out_dir, exist_ok=True)
    total = len(objects)
    print(f"\n[Mode: All Flat] WARNING: Exporting {total:,} files into a single flat folder: {out_dir}")
    print("Opening this folder in Windows File Explorer may cause Explorer to hang or freeze!")
    t0 = time.time()

    for idx in range(total):
        filename = f"{idx:07d}_{sanitize_filename(objects[idx])[:40]}.png"
        img = get_sprite_image(tokens, palette, idx, scale=scale)
        img.save(os.path.join(out_dir, filename))

        if (idx + 1) % 10000 == 0 or (idx + 1) == total:
            elapsed = time.time() - t0
            print(f"Exported {idx + 1:,} / {total:,} ({(idx + 1)/total*100:.1f}%) - {(idx + 1)/elapsed:.0f} img/s")

def main():
    parser = argparse.ArgumentParser(description="Export sprites from Pixel Art Atlas 1.4M")
    parser.add_argument("--data-dir", default=DEFAULT_DATA_DIR, help="Path to extracted dataset directory")
    parser.add_argument("--mode", choices=["unique", "categorized", "flat", "search", "sheet"], default="unique",
                        help="Export mode: 'unique' (1 per category, 6194 icons), 'categorized' (per subfolder), 'flat' (all 1.4M in 1 folder), 'search', 'sheet'")
    parser.add_argument("--out-dir", default=None, help="Output directory")
    parser.add_argument("--scale", type=int, default=1, help="Scale factor (1=16x16, 2=32x32, 4=64x64)")
    parser.add_argument("--query", type=str, default="", help="Search query for search/sheet mode")
    parser.add_argument("--limit", type=int, default=200, help="Limit for search mode")
    parser.add_argument("--max-per-cat", type=int, default=None, help="Max sprites per category for categorized mode")

    args = parser.parse_args()

    tokens, palette, objects, captions = load_dataset(args.data_dir)

    if args.mode == "unique":
        out = args.out_dir or os.path.join(args.data_dir, "unique_icons_16x16" if args.scale == 1 else f"unique_icons_{args.scale*16}x{args.scale*16}")
        export_unique_icons(tokens, palette, objects, captions, out, scale=args.scale)
    elif args.mode == "categorized":
        out = args.out_dir or os.path.join(args.data_dir, "sprites_by_category")
        export_categorized(tokens, palette, objects, captions, out, max_per_cat=args.max_per_cat, scale=args.scale)
    elif args.mode == "flat":
        out = args.out_dir or os.path.join(args.data_dir, "all_sprites_flat")
        export_all_flat(tokens, palette, objects, captions, out, scale=args.scale)
    elif args.mode == "search":
        if not args.query:
            print("Please specify --query for search mode")
            return
        out = args.out_dir or os.path.join(args.data_dir, f"search_{sanitize_filename(args.query)}")
        export_search(tokens, palette, objects, captions, args.query, out, limit=args.limit, scale=args.scale)
    elif args.mode == "sheet":
        if not args.query:
            print("Please specify --query for sheet mode")
            return
        out_file = args.out_dir or os.path.join(args.data_dir, f"spritesheet_{sanitize_filename(args.query)}.png")
        export_spritesheet(tokens, palette, objects, args.query, out_file, sprite_size=16*args.scale)

if __name__ == "__main__":
    main()

