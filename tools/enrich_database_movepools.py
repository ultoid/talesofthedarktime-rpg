import json
import shutil
import os

# 1. Backups
for fname in ['Skills.json', 'Classes.json', 'Items.json']:
    src = os.path.join('data', fname)
    bak = os.path.join('data', fname.replace('.json', '.backup_enrich.json'))
    if not os.path.exists(bak):
        shutil.copyfile(src, bak)
        print(f"Created backup: {bak}")

classes = json.load(open('data/Classes.json', 'r', encoding='utf-8'))
skills = json.load(open('data/Skills.json', 'r', encoding='utf-8'))
items = json.load(open('data/Items.json', 'r', encoding='utf-8'))

# Class metadata definition
class_meta = {
    1: {"name": "Fighter", "tier": 1, "lineage": "Fighter", "group": "blade_all", "w": [2, 1]},
    2: {"name": "Warrior", "tier": 2, "lineage": "Fighter", "group": "blade_heavy", "w": [1, 2]},
    3: {"name": "Squire", "tier": 2, "lineage": "Fighter", "group": "spear_guard", "w": [2, 4]},
    4: {"name": "Brawler", "tier": 2, "lineage": "Fighter", "group": "fist", "w": [3, 0]},
    5: {"name": "Mercenary", "tier": 3, "lineage": "Fighter", "group": "blade_heavy", "w": [1, 5]},
    6: {"name": "Knight", "tier": 3, "lineage": "Fighter", "group": "blade_guard", "w": [2, 0]},
    7: {"name": "Martial Artist", "tier": 3, "lineage": "Fighter", "group": "fist", "w": [3, 0]},
    8: {"name": "Champion", "tier": 4, "lineage": "Fighter", "group": "blade_heavy", "w": [2, 5]},
    9: {"name": "Dragoon", "tier": 4, "lineage": "Fighter", "group": "spear", "w": [4, 0]},
    10: {"name": "Paladin", "tier": 4, "lineage": "Fighter", "group": "holy_knight", "w": [2, 0]},
    11: {"name": "Monk", "tier": 4, "lineage": "Fighter", "group": "fist", "w": [3, 0]},
    12: {"name": "Berserker", "tier": 5, "lineage": "Fighter", "group": "dark_heavy", "w": [5, 1]},
    13: {"name": "Death Knight", "tier": 5, "lineage": "Fighter", "group": "dark_heavy", "w": [2, 1]},
    14: {"name": "Holy Knight", "tier": 5, "lineage": "Fighter", "group": "holy_knight", "w": [2, 0]},
    15: {"name": "Brahma", "tier": 5, "lineage": "Fighter", "group": "fist", "w": [3, 4]},
    16: {"name": "Sky Sovereign", "tier": 5, "lineage": "Fighter", "group": "spear", "w": [4, 0]},

    17: {"name": "Apprentice", "tier": 1, "lineage": "Apprentice", "group": "magic_all", "w": [0, 0]},
    18: {"name": "Magician", "tier": 2, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    19: {"name": "Acolyte", "tier": 2, "lineage": "Apprentice", "group": "magic_holy", "w": [0, 0]},
    20: {"name": "Occultist", "tier": 2, "lineage": "Apprentice", "group": "magic_dark", "w": [0, 0]},
    21: {"name": "Mage", "tier": 3, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    22: {"name": "Cleric", "tier": 3, "lineage": "Apprentice", "group": "magic_holy", "w": [0, 0]},
    23: {"name": "Cultist", "tier": 3, "lineage": "Apprentice", "group": "magic_dark", "w": [0, 0]},
    24: {"name": "Elementalist - Pyromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    25: {"name": "Elementalist - Hydromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    26: {"name": "Elementalist - Geomancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    27: {"name": "Elementalist - Aeromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    28: {"name": "Elementalist - Electromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    29: {"name": "Elementalist - Cryomancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    30: {"name": "Elementalist - Ferromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    31: {"name": "Elementalist - Echomancer", "tier": 4, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    32: {"name": "Priest", "tier": 4, "lineage": "Apprentice", "group": "magic_holy", "w": [0, 0]},
    33: {"name": "Necromancer", "tier": 4, "lineage": "Apprentice", "group": "magic_dark", "w": [0, 0]},
    34: {"name": "Archmage", "tier": 5, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    35: {"name": "High Priest", "tier": 5, "lineage": "Apprentice", "group": "magic_holy", "w": [0, 0]},
    36: {"name": "Warlock", "tier": 5, "lineage": "Apprentice", "group": "magic_dark", "w": [0, 0]},
    37: {"name": "Shaman", "tier": 5, "lineage": "Apprentice", "group": "magic_holy", "w": [0, 0]},
    38: {"name": "Dragon Aspect", "tier": 5, "lineage": "Apprentice", "group": "magic_elemental", "w": [0, 0]},
    49: {"name": "Chronomancer", "tier": 6, "lineage": "Apprentice", "group": "magic_time", "w": [0, 0]},
    50: {"name": "Void Incarnate", "tier": 6, "lineage": "Apprentice", "group": "magic_dark", "w": [0, 0]},

    39: {"name": "Scout", "tier": 1, "lineage": "Scout", "group": "scout_all", "w": [8, 10]},
    40: {"name": "Archer", "tier": 2, "lineage": "Scout", "group": "bow", "w": [8, 9]},
    41: {"name": "Thief", "tier": 2, "lineage": "Scout", "group": "dagger", "w": [10, 0]},
    42: {"name": "Ranger", "tier": 3, "lineage": "Scout", "group": "bow", "w": [8, 9]},
    43: {"name": "Rogue", "tier": 3, "lineage": "Scout", "group": "dagger", "w": [10, 0]},
    44: {"name": "Sniper", "tier": 4, "lineage": "Scout", "group": "bow", "w": [8, 9]},
    45: {"name": "Assassin", "tier": 4, "lineage": "Scout", "group": "dagger", "w": [10, 2]},
    46: {"name": "Beastmaster", "tier": 5, "lineage": "Scout", "group": "bow", "w": [8, 0]},
    47: {"name": "Shadow Walker", "tier": 5, "lineage": "Scout", "group": "dagger", "w": [10, 0]},
    48: {"name": "Windrunner", "tier": 5, "lineage": "Scout", "group": "bow", "w": [9, 10]}
}

# TM Compatibility pools based on archetypes
compatibility_pools = {
    "blade_heavy": ["Fighter", "Warrior", "Squire", "Mercenary", "Knight", "Champion", "Paladin", "Berserker", "Death Knight", "Holy Knight"],
    "blade_all": ["Fighter", "Warrior", "Squire", "Brawler", "Mercenary", "Knight", "Champion", "Paladin", "Berserker", "Death Knight", "Holy Knight", "Scout"],
    "blade_guard": ["Fighter", "Squire", "Knight", "Paladin", "Holy Knight", "Warrior"],
    "spear": ["Fighter", "Squire", "Knight", "Dragoon", "Sky Sovereign", "Paladin", "Champion"],
    "spear_guard": ["Fighter", "Squire", "Knight", "Dragoon", "Paladin", "Holy Knight"],
    "fist": ["Fighter", "Brawler", "Martial Artist", "Monk", "Brahma", "Scout"],
    "holy_knight": ["Squire", "Knight", "Paladin", "Holy Knight", "Acolyte", "Cleric", "Priest", "High Priest"],
    "dark_heavy": ["Warrior", "Mercenary", "Berserker", "Death Knight", "Cultist", "Necromancer", "Warlock"],
    "magic_all": ["Apprentice", "Magician", "Acolyte", "Occultist", "Mage", "Cleric", "Cultist", "Archmage"],
    "magic_elemental": ["Apprentice", "Magician", "Mage", "Pyromancer", "Hydromancer", "Geomancer", "Aeromancer", "Electromancer", "Cryomancer", "Ferromancer", "Echomancer", "Archmage", "Dragon Aspect", "Chronomancer"],
    "magic_holy": ["Apprentice", "Magician", "Acolyte", "Cleric", "Priest", "High Priest", "Shaman", "Paladin", "Holy Knight"],
    "magic_dark": ["Apprentice", "Magician", "Occultist", "Cultist", "Necromancer", "Warlock", "Void Incarnate", "Death Knight"],
    "magic_time": ["Apprentice", "Magician", "Mage", "Archmage", "Chronomancer"],
    "scout_all": ["Scout", "Archer", "Thief", "Ranger", "Rogue", "Sniper", "Assassin", "Beastmaster", "Shadow Walker", "Windrunner"],
    "bow": ["Scout", "Archer", "Ranger", "Sniper", "Windrunner", "Beastmaster", "Rogue"],
    "dagger": ["Scout", "Thief", "Rogue", "Assassin", "Shadow Walker", "Ranger"]
}

# Skill to TM Item mapping
skill_to_tm_item = {}
for it in items:
    if not it: continue
    for eff in it.get('effects', []):
        if eff.get('code') == 43:
            skill_to_tm_item[eff.get('dataId')] = it

# Pillar names
pillar_names = {
    1: "Pillar 1: Single Target Finisher",
    2: "Pillar 2: Utility / Buff / Stance",
    3: "Pillar 3: Multi-Target AoE",
    4: "Pillar 4: Breaker / Status Infliction",
    5: "Pillar 5: Jurus Pamungkas (Ultimate)"
}

tier_labels = {
    1: "Tier 1 - Novice",
    2: "Tier 2 - Basic",
    3: "Tier 3 - Intermediate",
    4: "Tier 4 - Advanced Promoted",
    5: "Tier 5 - Master Specialist",
    6: "Tier 6 - Transcendent Legend"
}

tier_jp = {
    1: 20,
    2: 45,
    3: 75,
    4: 120,
    5: 180,
    6: 250
}

# Map skills to learning class
skill_info = {}
for cid, cm in class_meta.items():
    c_entry = classes[cid]
    for idx, l in enumerate(c_entry.get('learnings', [])):
        sid = l['skillId']
        pidx = idx + 1
        skill_info[sid] = {
            'class_id': cid,
            'class_name': cm['name'],
            'tier': cm['tier'],
            'lineage': cm['lineage'],
            'group': cm['group'],
            'level': l['level'],
            'pillar_idx': pidx,
            'wtypes': cm['w']
        }

print(f"Mapped {len(skill_info)} skills to class learning info.")

weapon_type_names = {
    0: "Bebas / Tanpa Syarat Senjata",
    1: "Long Sword",
    2: "Sword",
    3: "Gloves",
    4: "Spear",
    5: "Axe",
    6: "Staff",
    7: "Rune",
    8: "Long Bow",
    9: "Crossbow",
    10: "Dagger"
}

updated_skills = 0
for sid in range(12, 233):
    s = skills[sid]
    if not s or sid not in skill_info: continue
    
    info = skill_info[sid]
    cid = info['class_id']
    cname = info['class_name']
    tier = info['tier']
    lvl = info['level']
    pidx = info['pillar_idx']
    group = info['group']
    
    is_ultimate = (pidx == 5 or sid not in skill_to_tm_item)
    tm_item = skill_to_tm_item.get(sid)
    
    # Weapon requirement
    w1, w2 = info['wtypes']
    dmg_formula = s.get('damage', {}).get('formula', '0')
    if dmg_formula == '0' or info['lineage'] == 'Apprentice':
        w1, w2 = 0, 0
    elif pidx == 2 and any(k in s['name'] for k in ['Cry', 'Howl', 'Dominion', 'Rage', 'Stance', 'Focus', 'Aura', 'Prayer']):
        w1, w2 = 0, 0

    s['requiredWtypeId1'] = w1
    s['requiredWtypeId2'] = w2
    
    if w1 == 0 and w2 == 0:
        w_label = "Bebas / Tanpa Syarat Senjata"
    elif w2 == 0:
        w_label = weapon_type_names.get(w1, 'Senjata Khusus')
    else:
        w_label = f"{weapon_type_names.get(w1, '')} / {weapon_type_names.get(w2, '')}"

    jp = (tier_jp.get(tier, 50) + 100) if is_ultimate else tier_jp.get(tier, 50)
    
    compat_list = [cname] if is_ultimate else compatibility_pools.get(group, [cname])
    compat_str = ', '.join(compat_list)
    
    if is_ultimate:
        scroll_status_label = "Eksklusif (Jurus Pamungkas - Tidak dapat diajarkan via Scroll)"
        scroll_tag = "<Scroll Status: Exclusive>\n<TM Status: Exclusive>\n<Skill Type: Ultimate>"
    else:
        scroll_id = tm_item['id'] if tm_item else 0
        scroll_status_label = f"Kompatibel via Scroll Jurus (Item #{scroll_id})"
        scroll_tag = f"<Scroll Item: {scroll_id}>\n<Scroll Compatible: {compat_str}>\n<TM Compatible: {compat_str}>"

    p_label = pillar_names.get(pidx, f"Pillar {pidx}")
    t_label = tier_labels.get(tier, f"Tier {tier}")

    # Build note
    note_lines = [
        "=== RANCANGAN SISTEM SKILL & SCROLL NUSVANIR ===",
        f"[Tahapan / Tier]: {t_label}",
        f"[Kategori Kit]: {p_label}",
        f"[Dikuasai Alami]: {cname} (Level {lvl})",
        f"[Syarat Senjata]: {w_label}",
        f"[Status Scroll]: {scroll_status_label}",
        f"[Dapat Dikuasai Oleh]:",
        f"  - {compat_str}",
        "",
        f"<Skill Tier: {tier}>",
        f"<Class Movepool: {cname} (Lv {lvl})>",
        scroll_tag,
        f"<Learn Class: {cname}>",
        f"<Learn Level: {lvl}>",
        f"<Learn JP: {jp}>"
    ]
    
    # Keep HP Cost if present
    if "<HP Cost:" in s.get('note', ''):
        import re
        hp_match = re.search(r'<HP Cost: \d+%>', s['note'])
        if hp_match:
            note_lines.append(hp_match.group(0))

    s['note'] = '\n'.join(note_lines)
    updated_skills += 1

print(f"Successfully enriched {updated_skills} skills in data/Skills.json!")

# Enrich Classes learnings notes
updated_learnings = 0
for cid, cm in class_meta.items():
    c_entry = classes[cid]
    for idx, l in enumerate(c_entry.get('learnings', [])):
        sid = l['skillId']
        s = skills[sid]
        sname = s['name'] if s else f"Skill {sid}"
        pidx = idx + 1
        plabel = "Finisher" if pidx == 1 else ("Buff/Utility" if pidx == 2 else ("AoE" if pidx == 3 else ("Breaker" if pidx == 4 else "Ultimate")))
        l['note'] = f"[Tier {cm['tier']}] Pillar {pidx}: {plabel} - {sname}"
        updated_learnings += 1

print(f"Successfully enriched {updated_learnings} class learnings in data/Classes.json!")

# Enrich TM Items
updated_tms = 0
for it in items:
    if not it: continue
    learn_eff = None
    for eff in it.get('effects', []):
        if eff.get('code') == 43:
            learn_eff = eff
            break
    if not learn_eff: continue
    
    sid = learn_eff.get('dataId')
    s = skills[sid] if sid < len(skills) else None
    if not s or sid not in skill_info: continue
    
    info = skill_info[sid]
    cname = info['class_name']
    tier = info['tier']
    group = info['group']
    sname = s['name']
    compat_list = compatibility_pools.get(group, [cname])
    compat_str = ', '.join(compat_list)
    short_compat = ', '.join(compat_list[:4]) + ("..." if len(compat_list) > 4 else "")
    
    it['name'] = f"Scroll: {sname}"
    it['consumable'] = True
    it['occasion'] = 2
    it['description'] = f"[Scroll Tier {tier}] Mengajarkan jurus [{sname}] secara permanen. Scroll akan hilang setelah dipelajari. Kompatibel: {short_compat}"
    it['note'] = '\n'.join([
        "<Skill Scroll>",
        "<Scroll Item>",
        f"<Learn Skill: {sid}>",
        f"<Skill Tier: {tier}>",
        f"<Original Class: {cname}>",
        f"<Scroll Compatible: {compat_str}>",
        f"<TM Compatible: {compat_str}>",
        "<Item Category: Skill Scroll>",
        "<Menu Category: Consumable>"
    ])
    updated_tms += 1

print(f"Successfully enriched {updated_tms} Scroll items in data/Items.json!")

# Save all
with open('data/Skills.json', 'w', encoding='utf-8') as f:
    json.dump(skills, f, ensure_ascii=False, indent=2)

with open('data/Classes.json', 'w', encoding='utf-8') as f:
    json.dump(classes, f, ensure_ascii=False, indent=2)

with open('data/Items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print("ALL FILES WRITTEN SUCCESSFULLY.")
