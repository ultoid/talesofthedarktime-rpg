#!/usr/bin/env python3
"""
Rebalance Class Stat Aptitude Ratings across all 50 Classes.
Ensures clean progression on a 1-10 scale:
- Tier 1: Max Grade C (Aptitude 4)
- Tier 2: Max Grade B (Aptitude 6) -> Strictly NO Grade A or Grade S!
- Tier 3: Max Grade A (Aptitude 8) -> Strictly NO Grade S!
- Tier 4: Max Grade A+ (Aptitude 9) -> Strictly NO Grade S!
- Tier 5: Peak Grade S (Aptitude 10)
- Tier 6: Peak Grade S+ / Dual Grade S (Aptitude 10 on multiple primary stats)
"""

import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
CLASSES_JSON_PATH = ROOT_DIR / "data" / "Classes.json"

# stats tuple format: (STR, INT, DEX, LUK, AGI, VIT)
REBALANCED_CLASS_STATS = {
    # ---------------- Jalur Fisik (1-16) ----------------
    1:  {"name": "Fighter", "tier": 1, "cap": 10, "stats": (4, 1, 2, 1, 2, 3), "growth": "STR +0.8, VIT +0.6"},
    2:  {"name": "Warrior", "tier": 2, "cap": 30, "stats": (6, 1, 2, 1, 3, 5), "growth": "STR +1.2, VIT +1.0"},
    3:  {"name": "Squire", "tier": 2, "cap": 30, "stats": (4, 1, 3, 2, 2, 6), "growth": "VIT +1.2, STR +0.8"},
    4:  {"name": "Brawler", "tier": 2, "cap": 30, "stats": (5, 1, 3, 2, 5, 3), "growth": "STR +1.0, AGI +1.0"},
    5:  {"name": "Mercenary", "tier": 3, "cap": 40, "stats": (8, 1, 4, 2, 3, 6), "growth": "STR +1.6, VIT +1.2"},
    6:  {"name": "Knight", "tier": 3, "cap": 40, "stats": (6, 2, 3, 2, 3, 8), "growth": "VIT +1.6, STR +1.2"},
    7:  {"name": "Martial Artist", "tier": 3, "cap": 40, "stats": (7, 2, 4, 2, 7, 4), "growth": "AGI +1.4, STR +1.4"},
    8:  {"name": "Champion", "tier": 4, "cap": 50, "stats": (9, 2, 5, 2, 4, 8), "growth": "STR +1.8, VIT +1.6"},
    9:  {"name": "Dragoon", "tier": 4, "cap": 50, "stats": (9, 2, 4, 2, 8, 6), "growth": "STR +1.8, AGI +1.6"},
    10: {"name": "Paladin", "tier": 4, "cap": 50, "stats": (7, 5, 4, 3, 3, 9), "growth": "VIT +1.8, STR +1.4, INT +1.0"},
    11: {"name": "Monk", "tier": 4, "cap": 50, "stats": (8, 4, 4, 3, 9, 5), "growth": "AGI +1.8, STR +1.6"},
    12: {"name": "Berserker", "tier": 5, "cap": 60, "stats": (10, 2, 5, 3, 5, 8), "growth": "STR +2.0, VIT +1.6"},
    13: {"name": "Death Knight", "tier": 5, "cap": 60, "stats": (8, 6, 4, 4, 3, 10), "growth": "VIT +2.0, STR +1.6, INT +1.2"},
    14: {"name": "Holy Knight", "tier": 5, "cap": 60, "stats": (7, 8, 4, 4, 3, 10), "growth": "VIT +2.0, INT +1.6, STR +1.4"},
    15: {"name": "Brahma", "tier": 5, "cap": 60, "stats": (8, 4, 6, 3, 10, 5), "growth": "AGI +2.0, STR +1.6, DEX +1.2"},
    16: {"name": "Sky Sovereign", "tier": 5, "cap": 60, "stats": (10, 2, 6, 3, 9, 5), "growth": "STR +2.0, AGI +1.8"},

    # ---------------- Jalur Sihir (17-38, 49, 50) ----------------
    17: {"name": "Apprentice", "tier": 1, "cap": 10, "stats": (1, 4, 3, 2, 2, 2), "growth": "INT +0.8, DEX +0.6"},
    18: {"name": "Magician", "tier": 2, "cap": 30, "stats": (1, 6, 4, 3, 2, 2), "growth": "INT +1.2, DEX +0.8"},
    19: {"name": "Acolyte", "tier": 2, "cap": 30, "stats": (1, 5, 2, 3, 2, 5), "growth": "INT +1.0, VIT +1.0"},
    20: {"name": "Occultist", "tier": 2, "cap": 30, "stats": (1, 5, 3, 5, 2, 2), "growth": "INT +1.0, LUK +1.0"},
    21: {"name": "Mage", "tier": 3, "cap": 40, "stats": (1, 8, 5, 3, 3, 4), "growth": "INT +1.6, DEX +1.0"},
    22: {"name": "Cleric", "tier": 3, "cap": 40, "stats": (2, 7, 3, 4, 2, 7), "growth": "INT +1.4, VIT +1.4"},
    23: {"name": "Cultist", "tier": 3, "cap": 40, "stats": (2, 7, 4, 7, 2, 3), "growth": "INT +1.4, LUK +1.4"},
    24: {"name": "Elementalist - Pyromancer", "tier": 4, "cap": 50, "stats": (2, 9, 6, 3, 5, 4), "growth": "INT +1.8, DEX +1.2"},
    25: {"name": "Elementalist - Hydromancer", "tier": 4, "cap": 50, "stats": (2, 9, 5, 4, 3, 7), "growth": "INT +1.8, VIT +1.4"},
    26: {"name": "Elementalist - Geomancer", "tier": 4, "cap": 50, "stats": (5, 8, 4, 3, 2, 8), "growth": "INT +1.6, VIT +1.6"},
    27: {"name": "Elementalist - Aeromancer", "tier": 4, "cap": 50, "stats": (2, 9, 5, 3, 8, 3), "growth": "INT +1.8, AGI +1.6"},
    28: {"name": "Elementalist - Electromancer", "tier": 4, "cap": 50, "stats": (2, 9, 7, 4, 5, 3), "growth": "INT +1.8, DEX +1.4"},
    29: {"name": "Elementalist - Cryomancer", "tier": 4, "cap": 50, "stats": (2, 9, 5, 4, 3, 7), "growth": "INT +1.8, VIT +1.4"},
    30: {"name": "Elementalist - Ferromancer", "tier": 4, "cap": 50, "stats": (6, 8, 4, 3, 2, 8), "growth": "INT +1.6, VIT +1.6, STR +1.2"},
    31: {"name": "Elementalist - Echomancer", "tier": 4, "cap": 50, "stats": (2, 9, 6, 4, 6, 3), "growth": "INT +1.8, DEX +1.2, AGI +1.2"},
    32: {"name": "Priest", "tier": 4, "cap": 50, "stats": (2, 8, 4, 5, 3, 8), "growth": "INT +1.6, VIT +1.6, LUK +1.0"},
    33: {"name": "Necromancer", "tier": 4, "cap": 50, "stats": (2, 9, 4, 8, 3, 5), "growth": "INT +1.8, LUK +1.6"},
    34: {"name": "Archmage", "tier": 5, "cap": 60, "stats": (2, 10, 7, 4, 6, 5), "growth": "INT +2.0, DEX +1.4"},
    35: {"name": "High Priest", "tier": 5, "cap": 60, "stats": (2, 9, 5, 6, 3, 10), "growth": "VIT +2.0, INT +1.8"},
    36: {"name": "Warlock", "tier": 5, "cap": 60, "stats": (2, 10, 6, 8, 4, 5), "growth": "INT +2.0, LUK +1.6"},
    37: {"name": "Shaman", "tier": 5, "cap": 60, "stats": (4, 9, 5, 7, 3, 8), "growth": "INT +1.8, VIT +1.6, LUK +1.4"},
    38: {"name": "Dragon Aspect", "tier": 5, "cap": 60, "stats": (8, 9, 5, 4, 4, 8), "growth": "INT +1.8, STR +1.6, VIT +1.6"},
    49: {"name": "Chronomancer", "tier": 6, "cap": 70, "stats": (3, 10, 8, 5, 10, 6), "growth": "INT +2.0, AGI +2.0, DEX +1.6"},
    50: {"name": "Void Incarnate", "tier": 6, "cap": 70, "stats": (4, 10, 7, 10, 5, 8), "growth": "INT +2.0, LUK +2.0, VIT +1.6"},

    # ---------------- Jalur Lincah (39-48) ----------------
    39: {"name": "Scout", "tier": 1, "cap": 10, "stats": (2, 1, 4, 2, 4, 2), "growth": "DEX +0.8, AGI +0.8"},
    40: {"name": "Archer", "tier": 2, "cap": 30, "stats": (2, 1, 6, 3, 4, 2), "growth": "DEX +1.2, AGI +0.8"},
    41: {"name": "Thief", "tier": 2, "cap": 30, "stats": (2, 1, 4, 4, 6, 1), "growth": "AGI +1.2, DEX +0.8, LUK +0.8"},
    42: {"name": "Ranger", "tier": 3, "cap": 40, "stats": (3, 1, 8, 3, 6, 4), "growth": "DEX +1.6, AGI +1.2"},
    43: {"name": "Rogue", "tier": 3, "cap": 40, "stats": (3, 1, 6, 5, 8, 2), "growth": "AGI +1.6, DEX +1.2, LUK +1.0"},
    44: {"name": "Sniper", "tier": 4, "cap": 50, "stats": (4, 2, 9, 6, 7, 4), "growth": "DEX +1.8, AGI +1.4, LUK +1.2"},
    45: {"name": "Assassin", "tier": 4, "cap": 50, "stats": (4, 2, 8, 6, 9, 3), "growth": "AGI +1.8, DEX +1.6, LUK +1.2"},
    46: {"name": "Beastmaster", "tier": 5, "cap": 60, "stats": (7, 3, 9, 5, 6, 9), "growth": "DEX +1.8, VIT +1.8, STR +1.4"},
    47: {"name": "Shadow Walker", "tier": 5, "cap": 60, "stats": (5, 2, 8, 7, 10, 4), "growth": "AGI +2.0, DEX +1.6, LUK +1.4"},
    48: {"name": "Windrunner", "tier": 5, "cap": 60, "stats": (5, 2, 10, 6, 9, 4), "growth": "DEX +2.0, AGI +1.8"}
}

def update_classes_json():
    with open(CLASSES_JSON_PATH, 'r', encoding='utf-8') as f:
        classes = json.load(f)

    attrs = ['STR', 'INT', 'DEX', 'LUK', 'AGI', 'VIT']

    for c in classes:
        if not c or c['id'] not in REBALANCED_CLASS_STATS:
            continue
        cid = c['id']
        data = REBALANCED_CLASS_STATS[cid]
        note = c.get('note', '')

        # Strip old Base tags and Class Stat Growth tags
        for attr in attrs:
            note = re.sub(r'<Base\s+' + attr + r':\s*\d+>\s*', '', note, flags=re.IGNORECASE)
        note = re.sub(r'<Class Stat Growth:[^>]+>\s*', '', note, flags=re.IGNORECASE)
        note = re.sub(r'<Class Max Level:\s*\d+>\s*', '', note, flags=re.IGNORECASE)

        # Build clean note tags to append/insert
        # stats tuple: (STR, INT, DEX, LUK, AGI, VIT)
        str_v, int_v, dex_v, luk_v, agi_v, vit_v = data['stats']
        stat_tags = [
            f"<Class Max Level: {data['cap']}>",
            f"<Base STR: {str_v}>",
            f"<Base INT: {int_v}>",
            f"<Base DEX: {dex_v}>",
            f"<Base LUK: {luk_v}>",
            f"<Base AGI: {agi_v}>",
            f"<Base VIT: {vit_v}>",
            f"<Class Stat Growth: {data['growth']}>"
        ]

        note = note.strip()
        new_note = note + "\n" + "\n".join(stat_tags) + "\n"
        c['note'] = new_note

    with open(CLASSES_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)

    print("Successfully updated Classes.json with rebalanced Aptitude Ratings!")

if __name__ == '__main__':
    update_classes_json()
