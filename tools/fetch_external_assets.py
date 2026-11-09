#!/usr/bin/env python3
"""
tools/fetch_external_assets.py
------------------------------
Automated asset downloader & generator for Tales of The Dark Time.
Restores large assets that are excluded from Git:
1. PixelFX & VFX Assets (~5GB generated from https://github.com/patch-gg/pixelfx.git)
2. Pixel Art Atlas (1.4M sprites, ~1.5GB from Hugging Face: Angais/pixel-art-atlas-1.4m)
3. Regenerates IconSet.png from curated pixel art icons.

Usage:
  python tools/fetch_external_assets.py --all
  python tools/fetch_external_assets.py --vfx
  python tools/fetch_external_assets.py --atlas
"""

import os
import sys
import argparse
import subprocess
import urllib.request
import zipfile
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PIXELFX_DIR = os.path.join(PROJECT_DIR, "temp_pixelfx")
VFX_OUT_DIR = os.path.join(PROJECT_DIR, "database", "vfx assets")
ATLAS_DIR = os.path.join(PROJECT_DIR, "database", "pixel_art_atlas")

def download_with_progress(url, dest_path):
    print(f"Downloading: {url} -> {dest_path}")
    def reporthook(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = downloaded * 100 / total_size
            mb = downloaded / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            sys.stdout.write(f"\r  [{percent:5.1f}%] {mb:7.1f} MB / {total_mb:7.1f} MB")
        else:
            sys.stdout.write(f"\r  {downloaded / (1024 * 1024):7.1f} MB downloaded")
        sys.stdout.flush()
    urllib.request.urlretrieve(url, dest_path, reporthook)
    print("\nDownload complete!")

def setup_vfx():
    print("\n" + "=" * 60)
    print("STEP 1: Setting up PixelFX & Generating VFX Assets (~5GB)")
    print("=" * 60)
    
    # 1. Clone pixelfx repo if not present
    if not os.path.exists(PIXELFX_DIR):
        print(f"Cloning patch-gg/pixelfx into {PIXELFX_DIR}...")
        subprocess.run(["git", "clone", "https://github.com/patch-gg/pixelfx.git", PIXELFX_DIR], check=True, cwd=PROJECT_DIR)
    else:
        print(f"PixelFX source already present at: {PIXELFX_DIR}")

    # 2. Run generator script
    gen_script = os.path.join(PROJECT_DIR, "tools", "generate_all_vfx_assets.mjs")
    if os.path.exists(gen_script):
        print("Generating all VFX spritesheets and manifest...")
        subprocess.run(["node", "tools/generate_all_vfx_assets.mjs"], check=True, cwd=PROJECT_DIR)
        print(f"VFX assets successfully generated at: {VFX_OUT_DIR}")
    else:
        print(f"ERROR: Generator script not found: {gen_script}")

def setup_atlas():
    print("\n" + "=" * 60)
    print("STEP 2: Setting up Pixel Art Atlas (1.4M Sprites)")
    print("=" * 60)
    
    os.makedirs(ATLAS_DIR, exist_ok=True)
    zip_path = os.path.join(ATLAS_DIR, "pixel-art-16x16-1.4m.zip")
    tokens_path = os.path.join(ATLAS_DIR, "tokens.npy")

    # 1. Download dataset if tokens.npy not present
    if not os.path.exists(tokens_path):
        # Try using huggingface_hub if installed, otherwise direct HTTP download
        downloaded = False
        try:
            print("Checking huggingface_hub...")
            from huggingface_hub import snapshot_download
            print("Downloading dataset via huggingface_hub...")
            snapshot_download(
                repo_id="Angais/pixel-art-atlas-1.4m",
                repo_type="dataset",
                local_dir=ATLAS_DIR,
                allow_patterns=["*.npy", "*.json", "*.zip", "*.png", "README.md", "LICENSE"]
            )
            downloaded = True
        except ImportError:
            print("huggingface_hub not installed. Using direct download from Hugging Face...")
        except Exception as e:
            print(f"huggingface_hub download warning: {e}. Falling back to direct URL...")

        if not downloaded and not os.path.exists(zip_path):
            hf_zip_url = "https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m/resolve/main/pixel-art-16x16-1.4m.zip"
            download_with_progress(hf_zip_url, zip_path)

        # 2. Extract ZIP if present and tokens not extracted
        if os.path.exists(zip_path) and not os.path.exists(tokens_path):
            print(f"Extracting {zip_path} to {ATLAS_DIR}...")
            with zipfile.ZipFile(zip_path, 'r') as zf:
                zf.extractall(ATLAS_DIR)
            print("Extraction complete!")
    else:
        print(f"Pixel Art Atlas dataset already extracted at: {ATLAS_DIR}")

    # 3. Export unique curated icons
    export_script = os.path.join(PROJECT_DIR, "tools", "export_pixel_art.py")
    if os.path.exists(export_script):
        print("Exporting unique curated 16x16 & 32x32 icons...")
        subprocess.run([sys.executable, "tools/export_pixel_art.py"], check=True, cwd=PROJECT_DIR)

    # 4. Rebuild IconSet.png
    iconset_script = os.path.join(PROJECT_DIR, "tools", "build_nusv_iconset.py")
    if os.path.exists(iconset_script):
        print("Rebuilding IconSet.png from curated pixel art...")
        subprocess.run([sys.executable, "tools/build_nusv_iconset.py"], check=True, cwd=PROJECT_DIR)
        print("IconSet.png successfully updated!")

def main():
    parser = argparse.ArgumentParser(description="Fetch and restore external assets for Tales of The Dark Time.")
    parser.add_argument("--all", action="store_true", help="Download and generate everything (VFX + Atlas + IconSet)")
    parser.add_argument("--vfx", action="store_true", help="Setup PixelFX repo and generate VFX assets")
    parser.add_argument("--atlas", action="store_true", help="Download Pixel Art Atlas (1.4M sprites) and build IconSet")
    
    args = parser.parse_args()
    if not (args.all or args.vfx or args.atlas):
        args.all = True

    if args.all or args.vfx:
        setup_vfx()
    if args.all or args.atlas:
        setup_atlas()

    print("\n" + "=" * 60)
    print("ALL EXTERNAL ASSETS SUCCESSFULLY RESTORED!")
    print("=" * 60)

if __name__ == "__main__":
    main()

