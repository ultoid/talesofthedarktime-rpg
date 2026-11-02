#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rebalance_class_learn_levels.py
Rebalances skill learning levels with Mid-Progression Ultimate (Option A):
- Tier 4 Ultimate at Lv. 15
- Tier 5 Ultimate at Lv. 20
- Tier 6 Ultimate at Lv. 25
"""

import json
import re
import os
import shutil
from pathlib import Path

WORKSPACE_ROOT = Path('/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time')
DATA_DIR = WORKSPACE_ROOT / 'data'

with open(DATA_DIR / 'Classes.json', 'r', encoding='utf-8') as fp:
    classes = json.load(fp)

with open(DATA_DIR / 'Skills.json', 'r', encoding='utf-8') as fp:
    skills = json.load(fp)

# Level assignment maps based on class definition index
# Note: In original definition order:
# 5-skill classes: [Skill1, Skill2, Skill3, Skill4, Ultimate]
# For Tier 4 (Cap 50): Skill1=1, Skill2=6, Ultimate=15, Skill3=25, Skill4=35
# For Tier 5 (Cap 60): Skill1=1, Skill2=8, Ultimate=20, Skill3=32, Skill4=45
# For Tier 6 (Cap 70): Skill1=1, Skill2=10, Ultimate=25, Skill3=40 (Definition order was Skill1, Skill2, Skill3, Ultimate)

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

    # Determine level for each skill based on its original index or role
    for idx, l in enumerate(learnings):
        sid = l['skillId']
        s = skills[sid] if sid < len(skills) and skills[sid] else None
        is_ultimate = (s and s.get('stypeId') == 5)

        new_lv = 1
        if tier == 1:
            if cid == 39: # Scout
                new_lv = [1, 1, 4, 6][idx]
            else:
                new_lv = [1, 3, 5, 7][idx]
        elif tier == 2:
            new_lv = [1, 5, 10, 18][idx]
        elif tier == 3:
            if count == 5: # Cleric
                new_lv = [1, 5, 10, 18, 28][idx]
            else:
                new_lv = [1, 6, 12, 22][idx]
        elif tier == 4:
            if count == 5:
                # 5 skills: Finisher, Buff, AoE, Breaker, Ultimate
                # Identify by is_ultimate or index
                if is_ultimate: new_lv = 15 # Ultimate at Mid-Level!
                elif idx == 0: new_lv = 1
                elif idx == 1: new_lv = 6
                elif idx == 2: new_lv = 25 # AoE
                elif idx == 3: new_lv = 35 # Breaker
                else: new_lv = 15
            else:
                # 4 skills: Elementalist, Necromancer
                new_lv = [1, 6, 15, 25][idx]
        elif tier == 5:
            # 5 skills: Finisher, Buff, AoE, Breaker, Ultimate
            if is_ultimate: new_lv = 20 # Ultimate at Mid-Level!
            elif idx == 0: new_lv = 1
            elif idx == 1: new_lv = 8
            elif idx == 2: new_lv = 32 # AoE
            elif idx == 3: new_lv = 45 # Breaker
            else: new_lv = 20
        elif tier == 6:
            # 4 skills: Starter, Utility, AoE/Reset, Ultimate
            if is_ultimate: new_lv = 25 # Ultimate at Mid-Level!
            elif idx == 0: new_lv = 1
            elif idx == 1: new_lv = 10
            elif idx == 2: new_lv = 40
            else: new_lv = 25

        l['level'] = new_lv
        updated_learnings_count += 1

        # Update note tag in Skills.json
        if s:
            note = s.get('note', '')
            note = re.sub(r'<Learn Level:\s*\d+>', f'<Learn Level: {new_lv}>', note)
            note = re.sub(r'<Class Movepool:\s*([^\(]+)\s*\(Lv\s*\d+\)>', rf'<Class Movepool: \1 (Lv {new_lv})>', note)
            note = re.sub(r'\[Dikuasai Alami\]:\s*([^\(]+)\s*\(Level\s*\d+\)', rf'[Dikuasai Alami]: \1 (Level {new_lv})', note)
            s['note'] = note
            updated_skills_count += 1

    # Sort learnings by level so they appear in chronological order in menus and databases
    c['learnings'] = sorted(learnings, key=lambda x: x['level'])

# Save updated Classes.json
with open(DATA_DIR / 'Classes.json', 'w', encoding='utf-8') as fp:
    json.dump(classes, fp, indent=2, ensure_ascii=False)

# Save updated Skills.json
with open(DATA_DIR / 'Skills.json', 'w', encoding='utf-8') as fp:
    json.dump(skills, fp, indent=2, ensure_ascii=False)

print(f"Successfully rebalanced {updated_learnings_count} class learnings across 50 classes with Mid-Progression Ultimate (Option A)!")
print(f"Successfully updated {updated_skills_count} skill notes in Skills.json!")
