#!/usr/bin/env python3
"""
tools/compact_skills_database.py
Purges 142 old unused class skills and obsolete prototypes from data/Skills.json:
- IDs 233 to 362 (130 old class skills superseded by revamped class movepools)
- IDs 548 to 559 (12 old test prototype skills)

Preserves:
- Skills 1 to 232 (Normal Attack, Guard, and all 221 Revamped Class Skills) IDENTICALLY.
- Enemy skills (shifted contiguously to 233..417).
- Grimoire field skills (shifted contiguously to 418..421).

Updates all references:
- Enemies.json (actions skillId)
- Items.json (Grimoires 582-585 learn skill effect)
"""

import json
import os
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
BACKUP_DIR = DATA_DIR / "backups"

def run_compaction():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Files to backup
    for fn in ["Skills.json", "Enemies.json", "Items.json"]:
        src = DATA_DIR / fn
        bak = BACKUP_DIR / f"{fn}.pre_skill_purge.bak"
        shutil.copyfile(src, bak)
        print(f"[Backup] Saved {bak.name}")

    # Load data
    with open(DATA_DIR / "Skills.json", "r", encoding="utf-8") as f:
        skills = json.load(f)
    with open(DATA_DIR / "Enemies.json", "r", encoding="utf-8") as f:
        enemies = json.load(f)
    with open(DATA_DIR / "Items.json", "r", encoding="utf-8") as f:
        items = json.load(f)

    # Old skills to drop
    drop_ids = set(range(233, 363)) | set(range(548, 560))
    print(f"[Skills] Total unused skills to purge: {len(drop_ids)}")

    # Build old_to_new mapping
    old_to_new = {}
    new_skills = [None] # 1-based index

    for old_id in range(1, len(skills)):
        if old_id in drop_ids:
            continue
        sk = skills[old_id]
        if not sk:
            continue
        new_id = len(new_skills)
        old_to_new[old_id] = new_id
        sk_copy = dict(sk)
        sk_copy["id"] = new_id
        new_skills.append(sk_copy)

    print(f"[Skills] Compacted from {len(skills) - 1} to {len(new_skills) - 1} active skills.")
    print(f"[Skills] Class skills 1 - 232 intact: {all(old_to_new[i] == i for i in range(1, 233))}")

    # 1. Update Enemies.json
    enemy_updates = 0
    for e in enemies:
        if not e: continue
        for a in e.get("actions", []):
            sid = a.get("skillId", 0)
            if sid in old_to_new and old_to_new[sid] != sid:
                a["skillId"] = old_to_new[sid]
                enemy_updates += 1
            elif sid in drop_ids:
                print(f"[Warning] Enemy {e['id']} referenced dropped skill {sid}!")
    print(f"[Enemies] Updated {enemy_updates} action skill references.")

    # 2. Update Items.json (Grimoires)
    item_updates = 0
    for it in items:
        if not it: continue
        for eff in it.get("effects", []):
            if eff.get("code") == 43:
                sid = eff.get("dataId", 0)
                if sid in old_to_new and old_to_new[sid] != sid:
                    eff["dataId"] = old_to_new[sid]
                    item_updates += 1
                elif sid in drop_ids:
                    print(f"[Warning] Item {it['id']} taught dropped skill {sid}!")
    print(f"[Items] Updated {item_updates} learn skill references.")

    # Save all modified files
    with open(DATA_DIR / "Skills.json", "w", encoding="utf-8") as f:
        json.dump(new_skills, f, indent=2, ensure_ascii=False)
    with open(DATA_DIR / "Enemies.json", "w", encoding="utf-8") as f:
        json.dump(enemies, f, indent=2, ensure_ascii=False)
    with open(DATA_DIR / "Items.json", "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    print("[Success] All files saved successfully.")

if __name__ == "__main__":
    run_compaction()

