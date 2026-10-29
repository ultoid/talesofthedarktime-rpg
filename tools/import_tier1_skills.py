#!/usr/bin/env python3
"""
Imports Tier 1 Skills from CSV into Skills.json, States.json, and Classes.json.
Creates backups before modifying database files.
"""

import json
import csv
import shutil
from datetime import datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
BACKUP_DIR = DATA_DIR / "backups"
CSV_FILE = ROOT_DIR / "Tier 1 Skills - ini gamenya turn based rpg ya, coba cek lagi tabe....csv"

def make_backup(filename):
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    src = DATA_DIR / filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dst = BACKUP_DIR / f"{filename}.bak_{timestamp}"
    shutil.copy2(src, dst)
    print(f"Created backup: {dst.name}")

def main():
    make_backup("Skills.json")
    make_backup("States.json")
    make_backup("Classes.json")

    with open(DATA_DIR / "Skills.json", "r", encoding="utf-8") as f:
        skills = json.load(f)
    with open(DATA_DIR / "States.json", "r", encoding="utf-8") as f:
        states = json.load(f)
    with open(DATA_DIR / "Classes.json", "r", encoding="utf-8") as f:
        classes = json.load(f)

    # 1. Add 3 Passive States
    # State 211: Iron Skin (Max HP +5%, Defense +10%)
    state_iron_skin_id = len(states)
    states.append({
        "id": state_iron_skin_id,
        "autoRemovalTiming": 0,
        "chanceByDamage": 100,
        "iconIndex": 81,
        "maxTurns": 1,
        "message1": "",
        "message2": "",
        "message3": "",
        "message4": "",
        "minTurns": 1,
        "motion": 0,
        "name": "Iron Skin",
        "note": "<Max HP: +5%>\n<DEF: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKetahanan fisik dasar petarung garis depan yang membuat tubuh lebih kebal terhadap hantaman.",
        "overlay": 0,
        "priority": 50,
        "removeAtBattleEnd": False,
        "removeByDamage": False,
        "removeByRestriction": False,
        "removeByWalking": False,
        "restriction": 0,
        "stepsToRemove": 100,
        "traits": [
            { "code": 21, "dataId": 0, "value": 1.05 }, # Max HP +5%
            { "code": 21, "dataId": 3, "value": 1.10 }  # DEF +10%
        ]
    })
    print(f"Added State #{state_iron_skin_id}: Iron Skin")

    # State 212: Mind Focus (MP Regen +2%, Max MP +10%)
    state_mind_focus_id = len(states)
    states.append({
        "id": state_mind_focus_id,
        "autoRemovalTiming": 0,
        "chanceByDamage": 100,
        "iconIndex": 84,
        "maxTurns": 1,
        "message1": "",
        "message2": "",
        "message3": "",
        "message4": "",
        "minTurns": 1,
        "motion": 0,
        "name": "Mind Focus",
        "note": "<MRG Plus: +2%>\n<Max MP: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nLatihan meditasi dasar untuk memperluas kapasitas dan pemulihan energi mental.",
        "overlay": 0,
        "priority": 50,
        "removeAtBattleEnd": False,
        "removeByDamage": False,
        "removeByRestriction": False,
        "removeByWalking": False,
        "restriction": 0,
        "stepsToRemove": 100,
        "traits": [
            { "code": 21, "dataId": 1, "value": 1.10 }, # Max MP +10%
            { "code": 22, "dataId": 8, "value": 0.02 }  # MRG +2%
        ]
    })
    print(f"Added State #{state_mind_focus_id}: Mind Focus")

    # State 213: Fleet Footed (Evasion +10%, Agility +5%)
    state_fleet_footed_id = len(states)
    states.append({
        "id": state_fleet_footed_id,
        "autoRemovalTiming": 0,
        "chanceByDamage": 100,
        "iconIndex": 82,
        "maxTurns": 1,
        "message1": "",
        "message2": "",
        "message3": "",
        "message4": "",
        "minTurns": 1,
        "motion": 0,
        "name": "Fleet Footed",
        "note": "<EVA Plus: +10%>\n<AGI: +5%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKelincahan gerak alami yang membuat penggunanya lebih mudah menghindari serangan.",
        "overlay": 0,
        "priority": 50,
        "removeAtBattleEnd": False,
        "removeByDamage": False,
        "removeByRestriction": False,
        "removeByWalking": False,
        "restriction": 0,
        "stepsToRemove": 100,
        "traits": [
            { "code": 21, "dataId": 6, "value": 1.05 }, # AGI +5%
            { "code": 22, "dataId": 1, "value": 0.10 }  # EVA +10%
        ]
    })
    print(f"Added State #{state_fleet_footed_id}: Fleet Footed")

    # Save States.json
    with open(DATA_DIR / "States.json", "w", encoding="utf-8") as f:
        json.dump(states, f, indent=2, ensure_ascii=False)

    # 2. Add 12 Skills
    # Definitions based on CSV
    tier1_specs = [
        # Fighter
        {
            "class": "Fighter",
            "class_id": 1,
            "level": 1,
            "name": "Hard Strike",
            "stypeId": 3,
            "mpCost": 0,
            "tpCost": 10,
            "scope": 1, # 1 Enemy
            "hitType": 1, # Physical
            "repeats": 1,
            "animationId": 6, # Slash Physical
            "damage": { "critical": True, "elementId": 1, "formula": "a.atk * 1.5 - b.def * 0.5", "type": 1, "variance": 20 },
            "effects": [{ "code": 21, "dataId": 11, "value1": 0.20, "value2": 0 }], # Stun 20%
            "description": "Serangan tebasan bertenaga besar yang berisiko melumpuhkan musuh sesaat.",
            "note": "<SP Cost: 10>\n<NUSV Tier: 1>",
            "iconIndex": 76
        },
        {
            "class": "Fighter",
            "class_id": 1,
            "level": 4,
            "name": "Iron Skin",
            "stypeId": 0,
            "mpCost": 0,
            "tpCost": 0,
            "scope": 11, # User
            "hitType": 0, # Certain
            "repeats": 1,
            "animationId": 0,
            "damage": { "critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 0 },
            "effects": [],
            "description": "Ketahanan fisik dasar petarung garis depan yang membuat tubuh lebih kebal terhadap hantaman.",
            "note": f"<Passive State: {state_iron_skin_id}>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\n<NUSV Tier: 1>",
            "iconIndex": 81,
            "occasion": 3 # Never
        },
        {
            "class": "Fighter",
            "class_id": 1,
            "level": 7,
            "name": "Provoking Roar",
            "stypeId": 3,
            "mpCost": 5,
            "tpCost": 0,
            "scope": 2, # All Enemies
            "hitType": 0, # Certain
            "repeats": 1,
            "animationId": 37, # Shout
            "damage": { "critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 0 },
            "effects": [
                { "code": 21, "dataId": 20, "value1": 1.0, "value2": 0 }, # Taunt 100%
                { "code": 32, "dataId": 2, "value1": 5, "value2": 0 }     # Debuff ATK 5 Turns
            ],
            "description": "Teriakan provokasi untuk mengalihkan seluruh perhatian musuh agar menyerang petarung ini.",
            "note": "<NUSV Tier: 1>",
            "iconIndex": 13
        },
        {
            "class": "Fighter",
            "class_id": 1,
            "level": 10,
            "name": "Cleave",
            "stypeId": 5, # Ultimate
            "mpCost": 0,
            "tpCost": 25,
            "scope": 2, # All Enemies
            "hitType": 1, # Physical
            "repeats": 1,
            "animationId": 38, # Sweep
            "damage": { "critical": True, "elementId": 1, "formula": "a.atk * 2 - b.def", "type": 1, "variance": 20 },
            "effects": [],
            "description": "Tebasan sapuan luas pamungkas Tier 1 untuk membersihkan kerumunan musuh sekaligus.",
            "note": "<SP Cost: 25>\n<NUSV Tier: 1>",
            "iconIndex": 77
        },

        # Apprentice
        {
            "class": "Apprentice",
            "class_id": 17,
            "level": 1,
            "name": "Arcane Bolt",
            "stypeId": 2, # Black Magic
            "mpCost": 5,
            "tpCost": 0,
            "scope": 1, # 1 Enemy
            "hitType": 2, # Magical
            "repeats": 1,
            "animationId": 106, # Neutral One 1
            "damage": { "critical": False, "elementId": 1, "formula": "a.mat * 1.3 - b.mdf * 0.5", "type": 1, "variance": 20 },
            "effects": [],
            "description": "Proyektil energi sihir murni jarak jauh yang stabil untuk menyerang musuh secara aman.",
            "note": "<NUSV Tier: 1>",
            "iconIndex": 64
        },
        {
            "class": "Apprentice",
            "class_id": 17,
            "level": 4,
            "name": "Mind Focus",
            "stypeId": 0,
            "mpCost": 0,
            "tpCost": 0,
            "scope": 11,
            "hitType": 0,
            "repeats": 1,
            "animationId": 0,
            "damage": { "critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 0 },
            "effects": [],
            "description": "Latihan meditasi dasar untuk memperluas kapasitas dan pemulihan energi mental.",
            "note": f"<Passive State: {state_mind_focus_id}>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\n<NUSV Tier: 1>",
            "iconIndex": 84,
            "occasion": 3
        },
        {
            "class": "Apprentice",
            "class_id": 17,
            "level": 7,
            "name": "Aether Barrier",
            "stypeId": 1, # White Magic
            "mpCost": 15,
            "tpCost": 0,
            "scope": 11, # The User
            "hitType": 0, # Certain
            "repeats": 1,
            "animationId": 96, # Light One 1
            "damage": { "critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 0 },
            "effects": [{ "code": 21, "dataId": 45, "value1": 1.0, "value2": 0 }], # Holy Veil 100%
            "description": "Membentuk perisai pelindung magis suci untuk meredam serangan mematikan yang masuk.",
            "note": "<NUSV Tier: 1>",
            "iconIndex": 82
        },
        {
            "class": "Apprentice",
            "class_id": 17,
            "level": 10,
            "name": "Elemental Burst",
            "stypeId": 5, # Ultimate
            "mpCost": 25,
            "tpCost": 0,
            "scope": 2, # All Enemies
            "hitType": 2, # Magical
            "repeats": 1,
            "animationId": 109, # Neutral All 2
            "damage": { "critical": False, "elementId": 1, "formula": "a.mat * 1.8 - b.mdf", "type": 1, "variance": 20 },
            "effects": [{ "code": 21, "dataId": 7, "value1": 0.30, "value2": 0 }], # Paralyze 30%
            "description": "Ledakan energi magis area luas yang memicu kekacauan elemen pada seluruh musuh di medan laga.",
            "note": "<NUSV Tier: 1>",
            "iconIndex": 69
        },

        # Scout
        {
            "class": "Scout",
            "class_id": 39,
            "level": 1,
            "name": "Swift Stab",
            "stypeId": 3, # Skill
            "mpCost": 0,
            "tpCost": 15,
            "scope": 1, # 1 Enemy
            "hitType": 1, # Physical
            "repeats": 2, # 2 Hits
            "animationId": 11, # Pierce Physical
            "damage": { "critical": True, "elementId": 1, "formula": "a.atk * 0.8 - b.def * 0.5", "type": 1, "variance": 20 },
            "effects": [],
            "description": "Tusukan belati kilat berturut-turut yang dirancang untuk mengoyak pertahanan cepat musuh.",
            "note": "<SP Cost: 15>\n<NUSV Tier: 1>",
            "iconIndex": 76
        },
        {
            "class": "Scout",
            "class_id": 39,
            "level": 4,
            "name": "Fleet Footed",
            "stypeId": 0,
            "mpCost": 0,
            "tpCost": 0,
            "scope": 11,
            "hitType": 0,
            "repeats": 1,
            "animationId": 0,
            "damage": { "critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 0 },
            "effects": [],
            "description": "Kelincahan gerak alami yang membuat penggunanya lebih mudah menghindari serangan.",
            "note": f"<Passive State: {state_fleet_footed_id}>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\n<NUSV Tier: 1>",
            "iconIndex": 82,
            "occasion": 3
        },
        {
            "class": "Scout",
            "class_id": 39,
            "level": 7,
            "name": "Poison Edge",
            "stypeId": 3, # Skill
            "mpCost": 10,
            "tpCost": 10,
            "scope": 1, # 1 Enemy
            "hitType": 1, # Physical
            "repeats": 1,
            "animationId": 59, # Poison
            "damage": { "critical": True, "elementId": 1, "formula": "a.atk * 1.2 - b.def * 0.5", "type": 1, "variance": 20 },
            "effects": [{ "code": 21, "dataId": 4, "value1": 0.50, "value2": 0 }], # Poison 50%
            "description": "Serangan berlapis racun mematikan yang menggerogoti HP target perlahan di setiap giliran.",
            "note": "<SP Cost: 10>\n<NUSV Tier: 1>",
            "iconIndex": 1
        },
        {
            "class": "Scout",
            "class_id": 39,
            "level": 10,
            "name": "Shadow Dash",
            "stypeId": 5, # Ultimate
            "mpCost": 20,
            "tpCost": 20,
            "scope": 2, # All Enemies
            "hitType": 1, # Physical
            "repeats": 1,
            "animationId": 103, # Darkness All 1
            "damage": { "critical": True, "elementId": 1, "formula": "a.atk * 1.5 - b.def", "type": 1, "variance": 20 },
            "effects": [{ "code": 21, "dataId": 106, "value1": 1.0, "value2": 0 }], # Shadow State 100%
            "description": "Melesat menembus bayangan untuk menyerang seluruh musuh sekaligus menyamarkan keberadaan diri.",
            "note": "<SP Cost: 20>\n<User Add State: 106>\n<NUSV Tier: 1>",
            "iconIndex": 78
        }
    ]

    new_learnings = { 1: [], 17: [], 39: [] }

    for spec in tier1_specs:
        skill_id = len(skills)
        skill_obj = {
            "id": skill_id,
            "animationId": spec["animationId"],
            "damage": spec["damage"],
            "description": spec["description"],
            "effects": spec["effects"],
            "hitType": spec["hitType"],
            "iconIndex": spec["iconIndex"],
            "message1": "melancarkan %1!",
            "message2": "",
            "mpCost": spec["mpCost"],
            "name": spec["name"],
            "note": spec["note"],
            "occasion": spec.get("occasion", 0), # 0 = Always
            "repeats": spec["repeats"],
            "requiredWtypeId1": 0,
            "requiredWtypeId2": 0,
            "scope": spec["scope"],
            "speed": 0,
            "stypeId": spec["stypeId"],
            "successRate": 100,
            "tpCost": spec["tpCost"],
            "tpGain": 0
        }
        skills.append(skill_obj)
        print(f"Added Skill #{skill_id}: {spec['name']} ({spec['class']} Lv {spec['level']})")

        new_learnings[spec["class_id"]].append({
            "level": spec["level"],
            "note": "",
            "skillId": skill_id
        })

    # Save Skills.json
    with open(DATA_DIR / "Skills.json", "w", encoding="utf-8") as f:
        json.dump(skills, f, indent=2, ensure_ascii=False)

    # 3. Update Classes.json with Learnings
    for c_id, l_list in new_learnings.items():
        cls_obj = classes[c_id]
        cls_obj["learnings"] = l_list
        print(f"Updated Class #{c_id} {cls_obj['name']} learnings: {len(l_list)} skills registered.")

    with open(DATA_DIR / "Classes.json", "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)

    print("\nAll Tier 1 Skills, States, and Class Learnings imported successfully!")

if __name__ == "__main__":
    main()
