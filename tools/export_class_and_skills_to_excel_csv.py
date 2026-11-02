#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
export_class_and_skills_to_excel_csv.py
Exports all 50 Classes, 221 Skills (Movepools), and 4 Grimoires to:
1. Individual clean CSV files (utf-8-sig for Excel compatibility)
2. All-in-one Master CSV
3. Multi-sheet Excel Workbook (.xls SpreadsheetML)
"""

import json
import re
import os
import csv
from pathlib import Path
import xml.sax.saxutils as saxutils

# Paths
WORKSPACE_ROOT = Path('/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time')
DATA_DIR = WORKSPACE_ROOT / 'data'
VAULT_CLASS_DIR = Path('/mnt/DC9EA2C29EA29494/Nusvanir_Vault/06_Sistem Game & Ekonomi/Class')
VAULT_PROJECT_DIR = Path('/mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game Project/Tales of The Dark Time')

# Load Database
with open(DATA_DIR / 'Classes.json', 'r', encoding='utf-8') as f:
    classes_data = json.load(f)

with open(DATA_DIR / 'Skills.json', 'r', encoding='utf-8') as f:
    skills_data = json.load(f)

with open(DATA_DIR / 'Items.json', 'r', encoding='utf-8') as f:
    items_data = json.load(f)

with open(DATA_DIR / 'States.json', 'r', encoding='utf-8') as f:
    states_data = json.load(f)

with open(DATA_DIR / 'System.json', 'r', encoding='utf-8') as f:
    system_data = json.load(f)

# Helper Maps
skill_map = {s['id']: s for s in skills_data if s}
state_map = {s['id']: s['name'] for s in states_data if s}
wtype_map = {i: name for i, name in enumerate(system_data.get('weaponTypes', [])) if name}
atype_map = {i: name for i, name in enumerate(system_data.get('armorTypes', [])) if name}
stype_map = {i: name for i, name in enumerate(system_data.get('skillTypes', [])) if name}
elem_map = {i: name for i, name in enumerate(system_data.get('elements', [])) if name}

# Scroll mapping (Effect code 43)
scroll_by_skill_id = {}
for it in items_data:
    if not it:
        continue
    for eff in it.get('effects', []):
        if eff.get('code') == 43:
            scroll_by_skill_id[eff.get('dataId')] = it

scope_map = {
    1: '1 Musuh',
    2: 'Semua Musuh',
    3: '1 Musuh Acak',
    4: '2 Musuh Acak',
    5: '3 Musuh Acak',
    6: '4 Musuh Acak',
    7: '1 Kawan',
    8: 'Semua Kawan',
    9: '1 Kawan (Gugur)',
    10: 'Semua Kawan (Gugur)',
    11: 'Diri Sendiri'
}

# Branch names
class_branches = {}
for cid in range(1, 17):
    class_branches[cid] = 'Jalur Fisik'
for cid in list(range(17, 39)) + [49, 50]:
    class_branches[cid] = 'Jalur Sihir'
for cid in range(39, 49):
    class_branches[cid] = 'Jalur Lincah'

class_meta_info = {
    1: {"role": "Petarung Melee Serbaguna", "tier": 1, "cap": 10, "growth": "+0.8 STR, +0.6 VIT", "stats": (4, 1, 2, 1, 2, 3)},
    2: {"role": "Bruiser & Offense Frontliner", "tier": 2, "cap": 30, "growth": "+1.2 STR, +1.0 VIT", "stats": (6, 1, 2, 1, 3, 5)},
    3: {"role": "Shield Tank & Protector", "tier": 2, "cap": 30, "growth": "+1.2 VIT, +0.8 STR", "stats": (4, 1, 3, 2, 2, 6)},
    4: {"role": "Combo Striker & Dodge Fighter", "tier": 2, "cap": 30, "growth": "+1.0 STR, +1.0 AGI", "stats": (5, 1, 3, 2, 5, 3)},
    5: {"role": "Heavy Aggressive Bruiser", "tier": 3, "cap": 40, "growth": "+1.6 STR, +1.2 VIT", "stats": (8, 1, 4, 2, 3, 6)},
    6: {"role": "Fortress Defender & Counter Protector", "tier": 3, "cap": 40, "growth": "+1.6 VIT, +1.2 STR", "stats": (6, 2, 3, 2, 3, 8)},
    7: {"role": "Chi Master & Fast Evasion Striker", "tier": 3, "cap": 40, "growth": "+1.4 AGI, +1.4 STR", "stats": (7, 2, 4, 2, 7, 4)},
    8: {"role": "Offensive Juggernaut Tank", "tier": 4, "cap": 50, "growth": "+1.8 STR, +1.6 VIT", "stats": (9, 2, 5, 2, 4, 8)},
    9: {"role": "Aerial Dragoon & High-Mobility Boss Killer", "tier": 4, "cap": 50, "growth": "+1.8 STR, +1.6 AGI", "stats": (9, 2, 4, 2, 8, 6)},
    10: {"role": "Holy Guardian & Defensive Fortress", "tier": 4, "cap": 50, "growth": "+1.8 VIT, +1.4 STR, +1.0 INT", "stats": (7, 5, 4, 3, 3, 9)},
    11: {"role": "Asura Chi Burst & Evasion Master", "tier": 4, "cap": 50, "growth": "+1.8 AGI, +1.6 STR", "stats": (8, 4, 4, 3, 9, 5)},
    12: {"role": "Rage Berserker & World-Breaker Bruiser", "tier": 5, "cap": 60, "growth": "+2.0 STR, +1.6 VIT", "stats": (10, 2, 5, 3, 5, 8)},
    13: {"role": "Dark Bastion & Soul Siphon Dread Knight", "tier": 5, "cap": 60, "growth": "+2.0 VIT, +1.6 STR, +1.2 INT", "stats": (8, 6, 4, 4, 3, 10)},
    14: {"role": "Sanctuary Avatar & Immortal Holy Vanguard", "tier": 5, "cap": 60, "growth": "+2.0 VIT, +1.6 INT, +1.4 STR", "stats": (7, 8, 4, 4, 3, 10)},
    15: {"role": "Supreme Chi Incarnate & Meridian Annihilator", "tier": 5, "cap": 60, "growth": "+2.0 AGI, +1.6 STR, +1.2 DEX", "stats": (8, 4, 6, 3, 10, 5)},
    16: {"role": "Sky Conqueror & Celestial Skystrike Sovereign", "tier": 5, "cap": 60, "growth": "+2.0 STR, +1.8 AGI", "stats": (10, 2, 6, 3, 9, 5)},

    17: {"role": "Inisiat Sihir Arcane Pemula", "tier": 1, "cap": 10, "growth": "+0.8 INT, +0.6 DEX", "stats": (1, 4, 3, 2, 2, 2)},
    18: {"role": "Multi-Elemental Caster", "tier": 2, "cap": 30, "growth": "+1.2 INT, +0.8 DEX", "stats": (1, 6, 4, 3, 2, 2)},
    19: {"role": "Healer & Holy Blessing Support", "tier": 2, "cap": 30, "growth": "+1.0 INT, +1.0 VIT", "stats": (1, 5, 2, 3, 2, 5)},
    20: {"role": "Dark Hexer & Siphon Caster", "tier": 2, "cap": 30, "growth": "+1.0 INT, +1.0 LUK", "stats": (1, 5, 3, 5, 2, 2)},
    21: {"role": "Master Elemental Specialist", "tier": 3, "cap": 40, "growth": "+1.6 INT, +1.0 DEX", "stats": (1, 8, 5, 3, 3, 4)},
    22: {"role": "Party Sustain & Cleanse Healer", "tier": 3, "cap": 40, "growth": "+1.4 INT, +1.4 VIT", "stats": (2, 7, 3, 4, 2, 7)},
    23: {"role": "Soul Sacrifice & Minion Summoner", "tier": 3, "cap": 40, "growth": "+1.4 INT, +1.4 LUK", "stats": (2, 7, 4, 7, 2, 3)},
    24: {"role": "Fire Burst & Burn Specialist", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.2 DEX", "stats": (2, 9, 6, 3, 5, 4)},
    25: {"role": "Water Control & Sustain Caster", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.4 VIT", "stats": (2, 9, 5, 4, 3, 7)},
    26: {"role": "Earth Barrier & Fortification Caster", "tier": 4, "cap": 50, "growth": "+1.6 INT, +1.6 VIT", "stats": (5, 8, 4, 3, 2, 8)},
    27: {"role": "Wind Mobility & Swift Gale Caster", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.6 AGI", "stats": (2, 9, 5, 3, 8, 3)},
    28: {"role": "Lightning Shock & Voltage Burst Caster", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.4 DEX", "stats": (2, 9, 7, 4, 5, 3)},
    29: {"role": "Ice Freeze & CC Specialist Caster", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.4 VIT", "stats": (2, 9, 5, 4, 3, 7)},
    30: {"role": "Metal Shard & Armored Battle Caster", "tier": 4, "cap": 50, "growth": "+1.6 INT, +1.6 VIT, +1.2 STR", "stats": (6, 8, 4, 3, 2, 8)},
    31: {"role": "Sonic Vibration & Silence Disruption Caster", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.2 DEX, +1.2 AGI", "stats": (2, 9, 6, 4, 6, 3)},
    32: {"role": "High Priest of Sanctuary & Rebirth Healer", "tier": 4, "cap": 50, "growth": "+1.6 INT, +1.6 VIT, +1.0 LUK", "stats": (2, 8, 4, 5, 3, 8)},
    33: {"role": "Undead Commander & Corpse Explosion Necromancer", "tier": 4, "cap": 50, "growth": "+1.8 INT, +1.6 LUK", "stats": (2, 9, 4, 8, 3, 5)},
    34: {"role": "Grand Elemental Archmage & Meteor Cataclysm", "tier": 5, "cap": 60, "growth": "+2.0 INT, +1.4 DEX", "stats": (2, 10, 7, 4, 6, 5)},
    35: {"role": "Supreme Miracle & Divine Rebirth High Priest", "tier": 5, "cap": 60, "growth": "+2.0 VIT, +1.8 INT", "stats": (2, 9, 5, 6, 3, 10)},
    36: {"role": "Netherworld Void Singularity Warlock", "tier": 5, "cap": 60, "growth": "+2.0 INT, +1.6 LUK", "stats": (2, 10, 6, 8, 4, 5)},
    37: {"role": "Ancestral Totem & Primal Spirit Shaman", "tier": 5, "cap": 60, "growth": "+1.8 INT, +1.6 VIT, +1.4 LUK", "stats": (4, 9, 5, 7, 3, 8)},
    38: {"role": "Primordial Dragon Awakening & Breath Aspect", "tier": 5, "cap": 60, "growth": "+1.8 INT, +1.6 STR, +1.6 VIT", "stats": (8, 9, 5, 4, 4, 8)},
    49: {"role": "Time Distortion & Chronos Apocalypse Master", "tier": 6, "cap": 70, "growth": "+2.0 INT, +2.0 AGI, +1.6 DEX", "stats": (3, 10, 8, 5, 10, 6)},
    50: {"role": "Void Incarnate & Absolute Matter Annihilator", "tier": 6, "cap": 70, "growth": "+2.0 INT, +2.0 LUK, +1.6 VIT", "stats": (4, 10, 7, 10, 5, 8)},

    39: {"role": "Pengintai Alam & Penjelajah Cepat", "tier": 1, "cap": 10, "growth": "+0.8 DEX, +0.8 AGI", "stats": (2, 1, 4, 2, 4, 2)},
    40: {"role": "Precision Long-Range Marksman", "tier": 2, "cap": 30, "growth": "+1.2 DEX, +0.8 AGI", "stats": (2, 1, 6, 3, 4, 2)},
    41: {"role": "Stealth Infiltrator & Resource Stealer", "tier": 2, "cap": 30, "growth": "+1.2 AGI, +0.8 DEX, +0.8 LUK", "stats": (2, 1, 4, 4, 6, 1)},
    42: {"role": "Wilderness Survival & Trap Specialist", "tier": 3, "cap": 40, "growth": "+1.6 DEX, +1.2 AGI", "stats": (3, 1, 8, 3, 6, 4)},
    43: {"role": "Shadow Bleed & Evasive Dual Striker", "tier": 3, "cap": 40, "growth": "+1.6 AGI, +1.2 DEX, +1.0 LUK", "stats": (3, 1, 6, 5, 8, 2)},
    44: {"role": "Ballista Sniper & Critical Executioner", "tier": 4, "cap": 50, "growth": "+1.8 DEX, +1.4 AGI, +1.2 LUK", "stats": (4, 2, 9, 6, 7, 4)},
    45: {"role": "Lethal Shadow & Poison Assassin", "tier": 4, "cap": 50, "growth": "+1.8 AGI, +1.6 DEX, +1.2 LUK", "stats": (4, 2, 8, 6, 9, 3)},
    46: {"role": "Behemoth Commander & Primordial Beastmaster", "tier": 5, "cap": 60, "growth": "+1.8 DEX, +1.8 VIT, +1.4 STR", "stats": (7, 3, 9, 5, 6, 9)},
    47: {"role": "Thousand Blades & Eclipse Shadow Walker", "tier": 5, "cap": 60, "growth": "+2.0 AGI, +1.6 DEX, +1.4 LUK", "stats": (5, 2, 8, 7, 10, 4)},
    48: {"role": "Sonic Tempest & Celestial Windrunner", "tier": 5, "cap": 60, "growth": "+2.0 DEX, +1.8 AGI", "stats": (5, 2, 10, 6, 9, 4)}
}

# Parents / Children
evolution_tree = {}
for c in classes_data:
    if not c or not c.get('name'):
        continue
    cid = c['id']
    note = c.get('note', '')
    from_m = re.search(r'<Class Change From:\s*([0-9,\s]+)>', note)
    parents = []
    if from_m:
        for p in from_m.group(1).split(','):
            if p.strip().isdigit():
                parents.append(int(p.strip()))
    evolution_tree[cid] = {'parents': parents, 'children': []}

for cid, info in evolution_tree.items():
    for pid in info['parents']:
        if pid in evolution_tree:
            evolution_tree[pid]['children'].append(cid)


def get_class_equipment(c):
    traits = c.get('traits', [])
    wtypes = [wtype_map[t['dataId']] for t in traits if t.get('code') == 51 and t['dataId'] in wtype_map]
    atypes = [atype_map[t['dataId']] for t in traits if t.get('code') == 52 and t['dataId'] in atype_map]
    return wtypes, atypes


# 1. Build Class Rows
class_headers = [
    "Class ID", "Nama Kelas", "Jalur Profesi", "Tier", "Batas Level",
    "Promosi Dari", "Promosi Lanjutan", "Peran Utama", "Pertumbuhan Stat Alami",
    "Base STR", "Base INT", "Base DEX", "Base LUK", "Base AGI", "Base VIT",
    "Baseline Max HP", "Baseline Max MP", "Baseline Max SP", "Baseline ATK",
    "Baseline DEF", "Baseline MAT", "Baseline MDF", "Baseline Speed",
    "Senjata Utama", "Zirah & Pelindung", "Jumlah Skill Alami"
]

class_rows = []
for cid in sorted(class_meta_info.keys()):
    c = classes_data[cid]
    meta = class_meta_info[cid]
    branch = class_branches[cid]
    p_names = [classes_data[pid]['name'] for pid in evolution_tree[cid]['parents']]
    c_names = [classes_data[ch]['name'] for ch in evolution_tree[cid]['children']]
    from_str = ", ".join(p_names) if p_names else "—"
    to_str = ", ".join(c_names) if c_names else "—"

    str_v, int_v, dex_v, luk_v, agi_v, vit_v = meta['stats']
    max_hp = 50 + (vit_v * 15) + (str_v * 5)
    max_mp = 20 + (int_v * 8)
    max_sp = 20 + (vit_v * 5) + (str_v * 2)
    atk = (str_v * 2) + int(dex_v * 0.5) if branch == 'Jalur Fisik' else ((dex_v * 2) + int(str_v * 0.5) if branch == 'Jalur Lincah' else (str_v * 1 + int(dex_v * 0.5)))
    mat = 2 + (int_v * 2)
    defense = 5 + int(vit_v * 1.5) + int(str_v * 0.5)
    mdf = 5 + int(int_v * 1.2) + int(vit_v * 0.8)
    speed = 5 + int(agi_v * 1.5)

    wtypes, atypes = get_class_equipment(c)
    w_str = ", ".join(wtypes) if wtypes else "Semua"
    a_str = ", ".join(atypes) if atypes else "Pakaian Dasar"
    skill_count = len(c.get('learnings', []))

    class_rows.append([
        cid, c['name'], branch, meta['tier'], meta['cap'],
        from_str, to_str, meta['role'], meta['growth'],
        str_v, int_v, dex_v, luk_v, agi_v, vit_v,
        max_hp, max_mp, max_sp, atk, defense, mat, mdf, speed,
        w_str, a_str, skill_count
    ])


# 2. Build Skill Rows
skill_headers = [
    "Class ID", "Nama Kelas", "Jalur Profesi", "Class Tier", "Level Pelajari",
    "Skill ID", "Nama Jurus", "Pilar Tempur", "Kategori Jurus", "Tipe Skill",
    "Elemen", "Biaya MP", "Biaya SP", "Biaya HP (%)", "Target / Jangkauan",
    "Formula Kerusakan", "Efek Status / Buff", "Peluang Efek", "Deskripsi Taktis",
    "Status Scroll", "Scroll Item ID", "Nama Scroll"
]

skill_rows = []
all_in_one_rows = []

all_in_one_headers = [
    "Class ID", "Nama Kelas", "Jalur Profesi", "Class Tier", "Level Cap Kelas", "Peran Kelas", "Stat Growth Kelas",
    "Level Pelajari Skill", "Skill ID", "Nama Jurus", "Pilar Tempur", "Tipe Skill", "Elemen",
    "Biaya MP", "Biaya SP", "Biaya HP (%)", "Target / Jangkauan", "Formula Kerusakan",
    "Efek Status / Buff", "Deskripsi Taktis", "Status Scroll", "Scroll Item ID", "Nama Scroll"
]

for cid in sorted(class_meta_info.keys()):
    c = classes_data[cid]
    meta = class_meta_info[cid]
    branch = class_branches[cid]

    for l in c.get('learnings', []):
        sid = l['skillId']
        s = skill_map[sid]
        lv = l['level']

        # Pillar
        p_m = re.search(r'\[Kategori Kit\]:\s*Pillar\s*(\d+):\s*([^\n]+)', s.get('note', ''))
        if p_m:
            p_num = f"Pillar {p_m.group(1)}"
            p_name = p_m.group(2).strip()
            p_full = f"P{p_m.group(1)}: {p_name}"
        else:
            p_num = "Pillar 5" if s.get('stypeId') == 5 else "Utilitas"
            p_name = "Jurus Pamungkas (Ultimate)" if s.get('stypeId') == 5 else "Utilitas Khusus"
            p_full = p_name

        stype = stype_map.get(s.get('stypeId'), 'Skill')
        elem_id = s.get('damage', {}).get('elementId', 1)
        elem = elem_map.get(elem_id, 'Neutral') if elem_id > 0 else 'None'

        mp_cost = s.get('mpCost', 0)
        tp_cost = s.get('tpCost', 0)
        hp_m = re.search(r'<HP Cost:\s*(\d+)%?>', s.get('note', ''))
        hp_cost = int(hp_m.group(1)) if hp_m else 0

        target = scope_map.get(s.get('scope'), '1 Target')

        dmg = s.get('damage', {})
        formula = dmg.get('formula', '0')
        if formula == '0' or not formula:
            formula_str = "Non-Damage / Buff"
        else:
            formula_str = formula

        eff_names = []
        eff_chances = []
        for eff in s.get('effects', []):
            if eff['code'] == 21:  # Add State
                st_name = state_map.get(eff['dataId'], f"State {eff['dataId']}")
                rate = f"{int(eff.get('value1', 1) * 100)}%"
                eff_names.append(st_name)
                eff_chances.append(rate)
            elif eff['code'] == 11:
                eff_names.append("Heal HP")
                eff_chances.append("100%")
            elif eff['code'] == 12:
                eff_names.append("Heal MP")
                eff_chances.append("100%")

        eff_str = ", ".join(eff_names) if eff_names else "—"
        rate_str = ", ".join(eff_chances) if eff_chances else "—"

        scr = scroll_by_skill_id.get(sid)
        if scr:
            scr_status = "Kompatibel via Scroll"
            scr_id = scr['id']
            scr_name = scr['name']
        else:
            scr_status = "Eksklusif Kelas (Ultimate - Tidak Ada Scroll)"
            scr_id = "—"
            scr_name = "—"

        desc = s.get('description', '').replace('\n', ' ')

        skill_rows.append([
            cid, c['name'], branch, meta['tier'], lv,
            sid, s['name'], p_full, p_name, stype,
            elem, mp_cost, tp_cost, hp_cost, target,
            formula_str, eff_str, rate_str, desc,
            scr_status, scr_id, scr_name
        ])

        all_in_one_rows.append([
            cid, c['name'], branch, meta['tier'], meta['cap'], meta['role'], meta['growth'],
            lv, sid, s['name'], p_full, stype, elem,
            mp_cost, tp_cost, hp_cost, target, formula_str,
            eff_str, desc, scr_status, scr_id, scr_name
        ])


# 3. Build Grimoire Rows
grimoire_headers = [
    "Skill ID", "Nama Mantra", "Item ID", "Nama Kitab Grimoire", "Tipe Mantra",
    "Biaya MP", "Biaya SP", "Akses Menu / Occasion", "Sifat Item", "Fungsi Lapangan & Eksplorasi"
]

grimoire_rows = [
    [560, "Lumos", 582, "Grimoire: Lumos", "White Magic", 5, 0, "Battle & Menu (occasion: 0)", "Key Item (Permanen)", "Menerangi area gua gelap gulita, dungeon tanpa obor, dan mengusir kabut pekat."],
    [561, "Garuda's Wings", 583, "Grimoire: Garuda's Wings", "Skill", 10, 0, "Menu Lapangan Saja (occasion: 2)", "Key Item (Permanen)", "Memanggil sayap spiritual Garuda untuk melakukan Fast Travel seketika menuju kota atau pos yang telah disinggahi."],
    [562, "Trailblaze", 584, "Grimoire: Trailblaze", "Skill", 0, 10, "Battle & Menu (occasion: 0)", "Key Item (Permanen)", "Menyalurkan tebasan berdaya remuk tinggi untuk menghancurkan rintangan fisik di jalan (batu besar, reruntuhan, semak berduri)."],
    [563, "Water Strider", 585, "Grimoire: Water Strider", "White Magic", 10, 0, "Menu Lapangan Saja (occasion: 2)", "Key Item (Permanen)", "Membentuk pijakan aether di bawah kaki, memungkinkan karakter berjalan melintasi permukaan air di danau/kanal dungeon."]
]


def write_csv_file(filepath, headers, rows):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"  [CSV] Generated: {filepath} ({len(rows)} data rows)")


def generate_excel_xml(filepath, sheets):
    """
    Generates an Excel XML 2003 Spreadsheet (.xls / .xml) with multiple sheets,
    styled headers, borders, and column widths.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    xml = []
    xml.append('<?xml version="1.0" encoding="UTF-8"?>')
    xml.append('<?mso-application progid="Excel.Sheet"?>')
    xml.append('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"')
    xml.append(' xmlns:o="urn:schemas-microsoft-com:office:office"')
    xml.append(' xmlns:x="urn:schemas-microsoft-com:office:excel"')
    xml.append(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"')
    xml.append(' xmlns:html="http://www.w3.org/TR/REC-html40">')

    # Styles
    xml.append(' <Styles>')
    xml.append('  <Style ss:ID="Default" ss:Name="Normal">')
    xml.append('   <Alignment ss:Vertical="Center"/>')
    xml.append('   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>')
    xml.append('  </Style>')
    xml.append('  <Style ss:ID="HeaderStyle">')
    xml.append('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>')
    xml.append('   <Borders>')
    xml.append('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1A252F"/>')
    xml.append('   </Borders>')
    xml.append('   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>')
    xml.append('   <Interior ss:Color="#2C3E50" ss:Pattern="Solid"/>')
    xml.append('  </Style>')
    xml.append('  <Style ss:ID="RowStyleEven">')
    xml.append('   <Alignment ss:Vertical="Center"/>')
    xml.append('   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>')
    xml.append('   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>')
    xml.append('  </Style>')
    xml.append('  <Style ss:ID="RowStyleOdd">')
    xml.append('   <Alignment ss:Vertical="Center"/>')
    xml.append('   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>')
    xml.append('   <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders>')
    xml.append('  </Style>')
    xml.append(' </Styles>')

    for sheet_name, headers, rows in sheets:
        escaped_sheet_name = saxutils.escape(sheet_name)
        xml.append(f' <Worksheet ss:Name="{escaped_sheet_name}">')
        xml.append('  <Table>')

        # Header Row
        xml.append('   <Row ss:Height="28" ss:StyleID="HeaderStyle">')
        for h in headers:
            esc_h = saxutils.escape(str(h))
            xml.append(f'    <Cell><Data ss:Type="String">{esc_h}</Data></Cell>')
        xml.append('   </Row>')

        # Data Rows
        for r_idx, r in enumerate(rows):
            style_id = "RowStyleOdd" if r_idx % 2 == 1 else "RowStyleEven"
            xml.append(f'   <Row ss:Height="20" ss:StyleID="{style_id}">')
            for val in r:
                if isinstance(val, (int, float)):
                    xml.append(f'    <Cell><Data ss:Type="Number">{val}</Data></Cell>')
                else:
                    esc_val = saxutils.escape(str(val) if val is not None else "")
                    xml.append(f'    <Cell><Data ss:Type="String">{esc_val}</Data></Cell>')
            xml.append('   </Row>')

        xml.append('  </Table>')
        xml.append(' </Worksheet>')

    xml.append('</Workbook>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(xml))
    print(f"  [Excel .xls] Generated: {filepath} ({len(sheets)} worksheets)")


def main():
    print("=== EXPORTING NUSVANIR CLASSES & SKILLS TO CSV & EXCEL ===")

    sheets_data = [
        ("Daftar 50 Kelas", class_headers, class_rows),
        ("Master Movepool 221 Skill", skill_headers, skill_rows),
        ("Kitab Pusaka Grimoire", grimoire_headers, grimoire_rows),
        ("Master All-in-One", all_in_one_headers, all_in_one_rows)
    ]

    # Destination directories
    targets = [
        VAULT_CLASS_DIR,
        WORKSPACE_ROOT,
        VAULT_PROJECT_DIR
    ]

    for dest in targets:
        print(f"\nWriting to: {dest}")
        # CSVs
        write_csv_file(dest / "01_Nusvanir_Master_Classes.csv", class_headers, class_rows)
        write_csv_file(dest / "02_Nusvanir_Master_Skills_Movepools.csv", skill_headers, skill_rows)
        write_csv_file(dest / "03_Nusvanir_Field_Grimoires.csv", grimoire_headers, grimoire_rows)
        write_csv_file(dest / "04_Nusvanir_All_In_One_Master.csv", all_in_one_headers, all_in_one_rows)

        # Excel Multi-Sheet Workbook (.xls)
        excel_path = dest / "Nusvanir_Database_Class_dan_Skill.xls"
        generate_excel_xml(excel_path, sheets_data)

    print("\n>>> ALL CSV & EXCEL EXPORTS COMPLETED PERFECTLY! <<<")


if __name__ == '__main__':
    main()

