#!/usr/bin/env python3
"""
Preflight Check Script for Tales of The Dark Time.
Ensures zero-crash state, JSON schema consistency, and plugin safety before commits or user review.
"""

import sys
import os
import json
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))

def check_json_files():
    print("--- [1/3] Memeriksa Integritas Database JSON ---")
    data_dir = os.path.join(PROJECT_ROOT, "data")
    required_files = [
        "Actors.json", "Classes.json", "Skills.json", "Items.json",
        "Weapons.json", "Armors.json", "Enemies.json", "States.json",
        "System.json", "MapInfos.json"
    ]
    
    passed = True
    for fname in required_files:
        fpath = os.path.join(data_dir, fname)
        if not os.path.exists(fpath):
            print(f"❌ File hilang: data/{fname}")
            passed = False
            continue
            
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ Error parse JSON data/{fname}: {e}")
            passed = False
            continue
            
        if isinstance(data, list) and fname not in ["System.json", "MapInfos.json"]:
            if len(data) > 0 and data[0] is not None:
                print(f"❌ PELANGGARAN ATURAN: data/{fname} indeks [0] bukan null! Ditemukan: {type(data[0])}")
                passed = False
            
            for i in range(1, len(data)):
                item = data[i]
                if item is not None and "note" in item and item["note"] is None:
                    print(f"⚠️ Peringatan: data/{fname} ID {i} memiliki note null (harus string)")
                    item["note"] = ""
                    
    if passed:
        print("✅ Seluruh file database JSON valid dan mengikuti standar 1-based indexing RPG Maker MV.")
    return passed

def run_verify_tools():
    print("\n--- [2/3] Menjalankan Skrip Verifikasi Bawaan ---")
    passed = True
    
    # Run verify_database_integrity.py
    vdb_script = os.path.join(PROJECT_ROOT, "tools", "verify_database_integrity.py")
    if os.path.exists(vdb_script):
        res = subprocess.run([sys.executable, vdb_script], capture_output=True, text=True)
        if res.returncode == 0:
            print("✅ verify_database_integrity.py: PASSED")
        else:
            print(f"❌ verify_database_integrity.py GAGAL:\n{res.stderr}\n{res.stdout}")
            passed = False
            
    # Run verify_editor.py
    ved_script = os.path.join(PROJECT_ROOT, "tools", "verify_editor.py")
    if os.path.exists(ved_script):
        res = subprocess.run([sys.executable, ved_script], capture_output=True, text=True)
        if res.returncode == 0:
            print("✅ verify_editor.py: PASSED")
        else:
            print(f"❌ verify_editor.py GAGAL:\n{res.stderr}\n{res.stdout}")
            passed = False
            
    return passed

def check_blackscreen_risks():
    print("\n--- [3/3] Memeriksa Potensi Black Screen pada Plugin Inti ---")
    bec_path = os.path.join(PROJECT_ROOT, "js", "plugins", "YEP_BattleEngineCore.js")
    if os.path.exists(bec_path):
        with open(bec_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Check if processMELODYNotetags is called on $dataWeapons without null guards
            if "processMELODYNotetags($dataWeapons)" in content:
                print("⚠️ Perhatian: processMELODYNotetags($dataWeapons) terdeteksi di YEP_BattleEngineCore.js.")
                print("   Pastikan objek di dalam loop dicek (if (!obj) continue) agar tidak crash jika ada slot kosong.")
    print("✅ Pengecekan potensi blackscreen selesai.")
    return True

def main():
    print("🔍 Menjalankan Preflight Check Nusvanir...")
    p1 = check_json_files()
    p2 = run_verify_tools()
    p3 = check_blackscreen_risks()
    
    if p1 and p2 and p3:
        print("\n🎉 PREFLIGHT CHECK LULUS SEMPURNA! Aman untuk dilanjutkan.")
        sys.exit(0)
    else:
        print("\n❌ PREFLIGHT CHECK MENEMUKAN MASALAH. Harap selesaikan sebelum melanjutkan!")
        sys.exit(1)

if __name__ == "__main__":
    main()
