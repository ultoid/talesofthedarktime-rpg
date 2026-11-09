#!/usr/bin/env python3
"""
Ultra-fast exporter for all 1,409,404 sprites from Pixel Art Atlas.
Supports multithreaded export for categorized subfolders and flat folder.
"""

import os
import sys
import json
import time
import struct
import zlib
import re
from concurrent.futures import ThreadPoolExecutor
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
DATA_DIR = os.path.join(PROJECT_DIR, "database", "pixel_art_atlas") if os.path.exists(os.path.join(PROJECT_DIR, "database", "pixel_art_atlas")) else os.path.join(PROJECT_DIR, "pixel_art_atlas")

# Pre-compute static PNG chunks for 16x16 RGBA
ihdr_data = struct.pack('>IIBBBBB', 16, 16, 8, 6, 0, 0, 0)
ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
IHDR_CHUNK = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
IEND_CHUNK = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND'))
PNG_SIG = b'\x89PNG\r\n\x1a\n'

INVALID_CHARS_RE = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
def sanitize_name(name: str) -> str:
    cleaned = INVALID_CHARS_RE.sub("_", name).strip()
    return cleaned[:60] if len(cleaned) > 60 else (cleaned or "unnamed")

def tokens_to_png_bytes(tokens_row, palette):
    pixels = tokens_row.reshape(16, 16)
    rgb = palette[pixels] # (16, 16, 3)
    alpha = ((pixels != 0).astype(np.uint8) * 255)[..., np.newaxis]
    rgba = np.concatenate([rgb, alpha], axis=2) # (16, 16, 4)

    raw = bytearray(16 * 65)
    for y in range(16):
        raw[y * 65] = 0
        raw[y * 65 + 1 : (y + 1) * 65] = rgba[y].tobytes()
    idat_data = zlib.compress(raw, 1)
    idat_crc = zlib.crc32(b'IDAT' + idat_data)
    idat_chunk = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)
    return PNG_SIG + IHDR_CHUNK + idat_chunk + IEND_CHUNK

def export_all(mode="categorized", out_dir=None, max_workers=8):
    tokens_path = os.path.join(DATA_DIR, "tokens.npy")
    palette_path = os.path.join(DATA_DIR, "palette.npy")
    objects_path = os.path.join(DATA_DIR, "objects.json")

    print("Loading data arrays...")
    tokens = np.load(tokens_path, mmap_mode="r")
    palette = np.load(palette_path)
    with open(objects_path, "r", encoding="utf-8") as f:
        objects = json.load(f)

    total = len(objects)

    if mode == "flat":
        target_dir = out_dir or os.path.join(DATA_DIR, "all_icons_1.4m_flat")
        os.makedirs(target_dir, exist_ok=True)
        print(f"Exporting ALL {total:,} icons into single flat folder: {target_dir}")
        print("Note: Windows Explorer may take time to open folders with >1M files.")

        t0 = time.time()
        chunk_size = 10000
        for start_idx in range(0, total, chunk_size):
            end_idx = min(start_idx + chunk_size, total)
            chunk_tokens = tokens[start_idx:end_idx]
            chunk_objs = objects[start_idx:end_idx]

            def save_item(offset):
                idx = start_idx + offset
                png_bytes = tokens_to_png_bytes(chunk_tokens[offset], palette)
                safe_name = sanitize_name(chunk_objs[offset])
                fname = f"{idx:07d}_{safe_name}.png"
                with open(os.path.join(target_dir, fname), "wb") as f:
                    f.write(png_bytes)

            with ThreadPoolExecutor(max_workers=max_workers) as ex:
                list(ex.map(save_item, range(end_idx - start_idx)))

            elapsed = time.time() - t0
            done = end_idx
            speed = done / elapsed if elapsed > 0 else 0
            eta_min = (total - done) / speed / 60 if speed > 0 else 0
            print(f"[{done:,}/{total:,}] ({done/total*100:.1f}%) - {speed:.0f} img/s - ETA: {eta_min:.1f} min")

    elif mode == "categorized":
        target_dir = out_dir or os.path.join(DATA_DIR, "all_icons_by_category")
        os.makedirs(target_dir, exist_ok=True)
        print(f"Exporting ALL {total:,} icons organized into category subfolders: {target_dir}")

        # Pre-create category directories
        unique_cats = set(objects)
        print(f"Creating {len(unique_cats):,} category directories...")
        cat_dirs = {}
        for cat in unique_cats:
            safe_c = sanitize_name(cat)
            p = os.path.join(target_dir, safe_c)
            os.makedirs(p, exist_ok=True)
            cat_dirs[cat] = p

        print("Pre-computing filepaths...")
        counts = {}
        target_filepaths = []
        for obj in objects:
            c = counts.get(obj, 0) + 1
            counts[obj] = c
            target_filepaths.append(os.path.join(cat_dirs[obj], f"{c:04d}.png"))

        print(f"Starting multithreaded export ({max_workers} workers)...")
        t0 = time.time()
        chunk_size = 10000
        for start_idx in range(0, total, chunk_size):
            end_idx = min(start_idx + chunk_size, total)
            chunk_tokens = tokens[start_idx:end_idx]
            chunk_paths = target_filepaths[start_idx:end_idx]

            def save_cat_item(offset):
                png_bytes = tokens_to_png_bytes(chunk_tokens[offset], palette)
                with open(chunk_paths[offset], "wb") as f:
                    f.write(png_bytes)

            with ThreadPoolExecutor(max_workers=max_workers) as ex:
                list(ex.map(save_cat_item, range(end_idx - start_idx)))

            elapsed = time.time() - t0
            done = end_idx
            speed = done / elapsed if elapsed > 0 else 0
            eta_min = (total - done) / speed / 60 if speed > 0 else 0
            print(f"[{done:,}/{total:,}] ({done/total*100:.1f}%) - {speed:.0f} img/s - ETA: {eta_min:.1f} min")

    print(f"\nAll {total:,} sprites exported successfully in {(time.time() - t0)/60:.2f} minutes!")
    print(f"Output directory: {target_dir}")

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "categorized"
    export_all(mode=mode)
