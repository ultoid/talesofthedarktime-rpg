#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rebalance_class_learn_levels.py
Rebalances all skill learning levels across all 50 classes according to
Normalized Class Level Progression (Option 1).
"""

import json
import re
import os
import shutil
from pathlib import Path

WORKSPACE_ROOT = Path('/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time')
DATA_DIR = WORKSPACE_ROOT / 'data'

# Backup first
for f in ['Classes.json', 'Skills.json']:
    bak = DATA_DIR / f"{f}.backup_rebalance.json"
    if not bak.exists():
        shutil.copyfile(DATA_DIR / f, bak)
        print(f"Created backup: {bak}")

with open(DATA_DIR / 'Classes.json', 'r', encoding='utf-8') as fp:
    classes = json.load(fp)

with open(DATA_DIR / 'Skills.json', 'r', encoding='utf-8') as fp:
    skills = json.load(fp)

# Normalized progression schedules per Tier & Skill Count
PROGRESSION_TEMPLATES = {
    # Tier 1 (Cap 10)
    (1, 4): [1, 3, 5, 7],
    # Tier 2 (Cap 30)
    (2, 4): [1, 5, 10, 18],
    # Tier 3 (Cap 40)
    (3, 4): [1, 6, 12, 22],
    (3, 5): [1, 5, 10, 18, 28], # Cleric
    # Tier 4 (Cap 50)
    (4, 4): [1, 8, 18, 30],     # Elementalist & Necromancer
    (4, 5): [1, 8, 16, 25, 35], # Champion, Dragoon, Paladin, Monk, Priest, Sniper, Assassin
    # Tier 5 (Cap 60)
    (5, 5): [1, 10, 20, 32, 45],
    # Tier 6 (Cap 70)
    (6, 4): [1, 15, 30, 50]
}

# Special override for Scout (T1 with 2 starter skills)
SPECIAL_OVERRIDES = {
    39: [1, 1, 4, 6] # Scout (Quick Shot & Quick Stab both at Lv 1)
}

# Tier mapping for all 50 classes
tier_map = {}
for cid in range(1, 17): # Jalur Fisik
    if cid == 1: tier_map[cid] = 1
    elif cid in [2, 3, 4]: tier_map[cid] = 2
    elif cid in [5, 6, 7]: tier_map[cid] = 3
    elif cid in [8, 9, 10, 11]: tier_map[cid] = 4
    else: tier_map[cid] = 5

for cid in list(range(17, 39)) + [49, 50]: # Jalur Sihir
    if cid == 17: tier_map[cid] = 1
    elif cid in [18, 19, 20]: tier_map[cid] = 2
    elif cid in [21, 22, 23]: tier_map[cid] = 3
    elif cid in list(range(24, 32)) + [32, 33]: tier_map[cid] = 4
    elif cid in range(34, 39): tier_map[cid] = 5
    else: tier_map[cid] = 6

for cid in range(39, 49): # Jalur Lincah
    if cid == 39: tier_map[cid] = 1
    elif cid in [40, 41]: tier_map[cid] = 2
    elif cid in [42, 43]: tier_map[cid] = 3
    elif cid in [44, 45]: tier_map[cid] = 4
    else: tier_map[cid] = 5

updated_learnings_count = 0
updated_skills_count = 0

for c in classes:
    if not c or not c.get('name'):
        continue
    cid = c['id']
    tier = tier_map.get(cid, 1)
    learnings = c.get('learnings', [])
    count = len(learnings)
    if count == 0:
        continue

    if cid in SPECIAL_OVERRIDES:
        target_levels = SPECIAL_OVERRIDES[cid]
    else:
        target_levels = PROGRESSION_TEMPLATES.get((tier, count))
        if not target_levels:
            # Fallback
            target_levels = [1 + i * 8 for i in range(count)]

    for idx, l in enumerate(learnings):
        old_lv = l['level']
        new_lv = target_levels[idx]
        l['level'] = new_lv
        updated_learnings_count += 1

        # Also update skill note tag in Skills.json
        sid = l['skillId']
        s = skills[sid] if sid < len(skills) and skills[sid] else None
        if s:
            note = s.get('note', '')
            # Update <Learn Level: X>
            note = re.sub(r'<Learn Level:\s*\d+>', f'<Learn Level: {new_lv}>', note)
            # Update <Class Movepool: Name (Lv X)>
            note = re.sub(r'<Class Movepool:\s*([^\(]+)\s*\(Lv\s*\d+\)>', rf'<Class Movepool: \1 (Lv {new_lv})>', note)
            # Update [Dikuasai Alami]: Name (Level X)
            note = re.sub(r'\[Dikuasai Alami\]:\s*([^\(]+)\s*\(Level\s*\d+\)', rf'[Dikuasai Alami]: \1 (Level {new_lv})', note)
            s['note'] = note
            updated_skills_count += 1

# Save updated Classes.json
with open(DATA_DIR / 'Classes.json', 'w', encoding='utf-8') as fp:
    json.dump(classes, fp, indent=2, ensure_ascii=False)

# Save updated Skills.json
with open(DATA_DIR / 'Skills.json', 'w', encoding='utf-8') as fp:
    json.dump(skills, fp, indent=2, ensure_ascii=False)

print(f"Successfully rebalanced {updated_learnings_count} class learnings across 50 classes!")
print(f"Successfully updated {updated_skills_count} skill notes in Skills.json!")
