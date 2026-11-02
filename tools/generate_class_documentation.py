#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_class_documentation.py
Generates the comprehensive Master Class & Skill Compendium (README.md)
and all 50 individual class documentation files in Nusvanir_Vault/06_Sistem Game & Ekonomi/Class/
"""

import json
import re
import os
from pathlib import Path

# Base Paths
WORKSPACE_ROOT = Path('/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time')
DATA_DIR = WORKSPACE_ROOT / 'data'
VAULT_CLASS_DIR = Path('/mnt/DC9EA2C29EA29494/Nusvanir_Vault/06_Sistem Game & Ekonomi/Class')

# Load Database Files
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

# Helper Lookups
skill_map = {s['id']: s for s in skills_data if s}
state_map = {s['id']: s['name'] for s in states_data if s}
wtype_map = {i: name for i, name in enumerate(system_data.get('weaponTypes', [])) if name}
atype_map = {i: name for i, name in enumerate(system_data.get('armorTypes', [])) if name}
stype_map = {i: name for i, name in enumerate(system_data.get('skillTypes', [])) if name}
elem_map = {i: name for i, name in enumerate(system_data.get('elements', [])) if name}

# Scroll Items (Learns skill via Effect 43)
scroll_by_skill_id = {}
for it in items_data:
    if not it:
        continue
    for eff in it.get('effects', []):
        if eff.get('code') == 43:
            scroll_by_skill_id[eff.get('dataId')] = it

# Scope Mapping
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

# Branch assignments and file mapping
# 50 Classes categorized
class_branches = {}
# Jalur Fisik (16 Classes: 1 - 16)
for cid in range(1, 17):
    class_branches[cid] = '01_Jalur_Fisik'
# Jalur Sihir (21 Classes: 17 - 38, 49, 50)
for cid in list(range(17, 39)) + [49, 50]:
    class_branches[cid] = '02_Jalur_Sihir'
# Jalur Lincah (13 Classes: 39 - 48)
for cid in range(39, 49):
    class_branches[cid] = '03_Jalur_Lincah'

# File names mapping
class_filenames = {
    1: "01_Fighter.md",
    2: "02_Warrior.md",
    3: "03_Squire.md",
    4: "04_Brawler.md",
    5: "05_Mercenary.md",
    6: "06_Knight.md",
    7: "07_Martial_Artist.md",
    8: "08_Champion.md",
    9: "09_Dragoon.md",
    10: "10_Paladin.md",
    11: "11_Monk.md",
    12: "12_Berserker.md",
    13: "13_Death_Knight.md",
    14: "14_Holy_Knight.md",
    15: "15_Brahma.md",
    16: "16_Sky_Sovereign.md",

    17: "01_Apprentice.md",
    18: "02_Magician.md",
    19: "03_Acolyte.md",
    20: "04_Occultist.md",
    21: "05_Mage.md",
    22: "06_Cleric.md",
    23: "07_Cultist.md",
    24: "10_Elementalist_Pyromancer.md",
    25: "11_Elementalist_Hydromancer.md",
    26: "12_Elementalist_Geomancer.md",
    27: "13_Elementalist_Aeromancer.md",
    28: "14_Elementalist_Electromancer.md",
    29: "15_Elementalist_Cryomancer.md",
    30: "16_Elementalist_Ferromancer.md",
    31: "17_Elementalist_Echomancer.md",
    32: "08_Priest.md",
    33: "09_Necromancer.md",
    34: "18_Archmage.md",
    35: "19_High_Priest.md",
    36: "20_Warlock.md",
    37: "21_Shaman.md",
    38: "22_Dragon_Aspect.md",
    49: "23_Chronomancer.md",
    50: "24_Void_Incarnate.md",

    39: "01_Scout.md",
    40: "02_Archer.md",
    41: "03_Thief.md",
    42: "04_Ranger.md",
    43: "05_Rogue.md",
    44: "06_Sniper.md",
    45: "07_Assassin.md",
    46: "08_Beastmaster.md",
    47: "09_Shadow_Walker.md",
    48: "10_Windrunner.md"
}

# Metadata & Roles
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

# Evolution tree relationships
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
    evolution_tree[cid] = {'name': c['name'], 'parents': parents, 'children': []}

for cid, info in evolution_tree.items():
    for pid in info['parents']:
        if pid in evolution_tree:
            evolution_tree[pid]['children'].append(cid)


def get_class_equipment(c):
    traits = c.get('traits', [])
    wtypes = [wtype_map[t['dataId']] for t in traits if t.get('code') == 51 and t['dataId'] in wtype_map]
    atypes = [atype_map[t['dataId']] for t in traits if t.get('code') == 52 and t['dataId'] in atype_map]
    stypes = [stype_map[t['dataId']] for t in traits if t.get('code') == 41 and t['dataId'] in stype_map]
    return wtypes, atypes, stypes


def format_skill_row(c, l, for_readme=True):
    sid = l['skillId']
    s = skill_map[sid]
    lv = f"Lv {l['level']}"
    name = f"**{s['name']}** (`#{sid}`)"

    # Pillar
    p_m = re.search(r'\[Kategori Kit\]:\s*Pillar\s*(\d+):\s*([^\n]+)', s.get('note', ''))
    if p_m:
        p_num = p_m.group(1)
        p_name = p_m.group(2).strip()
        pillar = f"P{p_num}: {p_name}"
    else:
        pillar = "Jurus Pamungkas" if s.get('stypeId') == 5 else "Utilitas / Spesial"

    # Type & Element
    stype = stype_map.get(s.get('stypeId'), 'Skill')
    elem_id = s.get('damage', {}).get('elementId', 1)
    elem = elem_map.get(elem_id, 'Neutral') if elem_id > 0 else 'None'
    type_elem = f"`{stype}` / `{elem}`"

    # Cost
    costs = []
    if s.get('mpCost', 0) > 0:
        costs.append(f"{s['mpCost']} MP")
    if s.get('tpCost', 0) > 0:
        costs.append(f"{s['tpCost']} SP")
    hp_m = re.search(r'<HP Cost:\s*(\d+)%?>', s.get('note', ''))
    if hp_m:
        costs.append(f"{hp_m.group(1)}% HP")
    cost_str = ", ".join(costs) if costs else "0 Biaya"

    # Target
    target = scope_map.get(s.get('scope'), '1 Target')

    # Formula
    dmg = s.get('damage', {})
    formula = dmg.get('formula', '0')
    if formula == '0' or not formula:
        f_str = "*Non-Damage / Buff*"
    else:
        f_str = f"`{formula}`"

    # Effects
    eff_list = []
    for eff in s.get('effects', []):
        if eff['code'] == 21:  # Add State
            st_name = state_map.get(eff['dataId'], f"State {eff['dataId']}")
            rate = int(eff.get('value1', 1) * 100)
            eff_list.append(f"{st_name} ({rate}%)")
        elif eff['code'] == 11:  # HP Recover
            eff_list.append("Heal HP")
        elif eff['code'] == 12:  # MP Recover
            eff_list.append("Heal MP")
    eff_str = "<br>".join(eff_list) if eff_list else "-"

    # Scroll status
    scr = scroll_by_skill_id.get(sid)
    if scr:
        scr_str = f"📜 `{scr['name']}` (`#{scr['id']}`)"
    else:
        scr_str = "⭐ **Eksklusif (Ultimate)**"

    desc = s.get('description', '').replace('\n', ' ')

    if for_readme:
        return f"| {lv} | {name} | {pillar} | {type_elem} | {cost_str} | {target} | {f_str} | {eff_str} | {scr_str} | {desc} |"
    else:
        return f"| **{lv}** | **{s['name']}** | `{pillar}` | {type_elem} | `{cost_str}` | {target} | {f_str} | {eff_str} | {scr_str} | {desc} |"


def generate_master_compendium():
    """Generates the master README.md inside Nusvanir_Vault/06_Sistem Game & Ekonomi/Class/"""
    out = []
    out.append("# ⚔️ Master Kompendium Kelas, Jurus & Kitab Pusaka Nusvanir")
    out.append("> **Dokumentasi Lengkap Sistem Kelas (50 Kelas), Jurus Tempur (5 Pilar), Gulungan Ilmu (Scroll), dan Kitab Pusaka (Grimoire).**\n")
    out.append("---\n")

    # 1. Executive System Architecture
    out.append("## 🧭 1. Arsitektur Inti Sistem Perkembangan Karakter\n")
    out.append("Dunia Nusvanir menerapkan perpaduan sistem Turn-Based RPG modern dengan pemisahan tegas antara pertumbuhan karakter dan penguasaan profesi:\n")
    
    out.append("### A. Sistem Dual-Leveling (Level Dasar vs Job Level)")
    out.append("* **Level Karakter / Base Level (Lv 1 – 99):**")
    out.append("  * Tidak pernah berkurang atau reset saat promosi / berpindah kelas.")
    out.append("  * Merupakan penentu kapasitas dasar ketahanan hidup karakter.")
    out.append("  * Memberikan **Poin Alokasi Bebas (Free Stat Points)** setiap naik level untuk didistribusikan pemain ke 6 Base Stats (`STR, INT, DEX, LUK, AGI, VIT`).")
    out.append("* **Level Kelas / Job Level (Lv 1 – Max Tier Cap):**")
    out.append("  * Setiap kelas memiliki batas level maksimum sesuai tier (`Tier 1: Lv 10`, `Tier 2: Lv 30`, `Tier 3: Lv 40`, `Tier 4: Lv 50`, `Tier 5: Lv 60`, `Tier 6: Lv 70`).")
    out.append("  * Setiap berganti ke kelas baru, Job Level dimulai dari Lv 1, namun riwayat penguasaan kelas lama **tetap tersimpan** di memori sistem (tidak hilang).")
    out.append("  * Memberikan **Pertumbuhan Stat Alami (Fixed Stat Growth)** permanen yang memperkuat arketipe kelas tersebut.\n")

    out.append("### B. Retensi Jurus Lintas Profesi (Cross-Class Skill Mastery)")
    out.append("* Seluruh jurus yang telah dipelajari oleh karakter (baik dari pencapaian Job Level maupun dipelajari melalui **Scroll**) **tetap dikuasai secara permanen** saat karakter berpindah kelas.")
    out.append("* Pemain dapat meracik kombinasi strategi hibrida antar kelas (misal: Warrior yang mempelajari jurus pelindung dari Squire atau penyembuhan dasar dari Acolyte).\n")

    out.append("### C. 5 Pilar Jurus Tempur (Combat Skill Pillars)")
    out.append("Seluruh movepool kelas dirancang simetris berdasarkan 5 pilar taktis:")
    out.append("1. 💥 **Pillar 1: Single Target Finisher** — Serangan fokus tunggal dengan pengali damage tinggi untuk menumbangkan target prioritas.")
    out.append("2. 🛡️ **Pillar 2: Utility / Buff / Stance** — Penguatan stat ofensif/defensif, provokasi (Taunt), atau postur taktis tim.")
    out.append("3. 🌊 **Pillar 3: Multi-Target AoE** — Serangan sapuan area untuk membersihkan gelombang musuh.")
    out.append("4. ⚡ **Pillar 4: Breaker / Status Infliction** — Pengikis pertahanan (`Vulnerable`), interupsi (`Stun`), maupun infeksi status (`Bleed, Burn, Freeze, Poison`).")
    out.append("5. 🌟 **Pillar 5: Jurus Pamungkas (Ultimate)** — Jurus pamungkas berskala destruktif tinggi dengan biaya SP/MP besar. **Eksklusif hanya dapat dikuasai melalui promosi kelas dan tidak dapat dipelajari via Scroll.**\n")

    out.append("### D. Gulungan Ilmu (Scroll) vs Kitab Pusaka (Grimoire)")
    out.append("| Kategori | Tipe Item | Sifat Penggunaan | Fungsi & Mekanisme | Contoh & Penerapan |")
    out.append("| :--- | :---: | :---: | :--- | :--- |")
    out.append("| **📜 Gulungan Ilmu (Scroll)** | `Regular Item` | **Habis Pakai (Consumable)** | Mengajarkan satu jurus tempur tertentu secara permanen kepada karakter yang kompatibel. Setelah dipelajari, gulungan ilmu akan musnah/hilang dari inventori. | *Scroll: Power Strike, Scroll: Heavy Impact, Scroll: Flame Burst* (Total 182 Scroll) |")
    out.append("| **📖 Kitab Pusaka (Grimoire)** | `Key Item` | **Permanen (Non-Consumable)** | Membuka mantra utilitas lapangan / penjelajahan dunia luar battle. Kitab pusaka tetap berada di tas pemain selamanya dan tidak pernah hilang saat digunakan. | *Grimoire: Lumos, Grimoire: Garuda's Wings, Grimoire: Trailblaze, Grimoire: Water Strider* (4 Kitab Utama) |\n")

    out.append("### E. Sihir Putih (White Magic) di Luar Pertempuran")
    out.append("* Seluruh mantra **White Magic** (pemulihan HP dan penyembuhan status abnormal seperti *Healing Light, Medica Wave, Purify*) berstatus `occasion: 0` (Selalu Aktif).")
    out.append("* Karakter dapat melancarkannya dari menu lapangan di luar pertarungan tanpa harus memasuki battle, memberikan sustain tinggi bagi petualang.\n")

    out.append("### F. Sistem Pasif & Karakteristik Kelas")
    out.append("* Skill pasif berjalan otomatis melalui engine `YEP_AutoPassiveStates` berdasarkan kondisi trait kelas.")
    out.append("* Setiap kelas memiliki kemahiran senjata (`Weapon Types`) dan pelindung (`Armor Types`) khusus yang menentukan efisiensi tempur.\n")

    out.append("---\n")

    # 2. Field Grimoires Table
    out.append("## 📖 2. Kitab Pusaka Grimoire (Utilitas Lapangan & Penjelajahan Dunia)\n")
    out.append("Kitab Grimoire adalah pusaka purba langka yang memberikan kemampuan sihir di luar pertempuran untuk mengatasi rintangan dunia Nusvanir:\n")
    out.append("| Skill ID | Nama Mantra | Item ID | Nama Kitab Pusaka | Tipe / Biaya | Akses Menu | Efek Lapangan (World Map & Dungeon) |")
    out.append("| :---: | :--- | :---: | :--- | :---: | :---: | :--- |")
    out.append("| `#560` | **Lumos** | `#582` | `Grimoire: Lumos` | `White Magic` / `5 MP` | Selalu (`occasion: 0`) | Memancarkan bola cahaya suci yang menerangi kegelapan gua, dungeon tanpa obor, dan mengusir kabut malam pekat. |")
    out.append("| `#561` | **Garuda's Wings** | `#583` | `Grimoire: Garuda's Wings` | `Skill` / `10 MP` | Menu Saja (`occasion: 2`) | Memanggil sayap spiritual Garuda untuk melakukan **Fast Travel** seketika menuju kota, pos perkemahan, atau landmark yang telah dikunjungi sebelumnya. |")
    out.append("| `#562` | **Trailblaze** | `#584` | `Grimoire: Trailblaze` | `Skill` / `10 SP` | Selalu (`occasion: 0`) | Menyalurkan kekuatan tebasan pemecah untuk **menyingkirkan rintangan** fisik seperti batu besar, reruntuhan jalan, semak berduri, atau gerbang yang rapuh. |")
    out.append("| `#563` | **Water Strider** | `#585` | `Grimoire: Water Strider` | `White Magic` / `10 MP` | Menu Saja (`occasion: 2`) | Membentuk pijakan aether di bawah kaki, memungkinkan karakter **berjalan melintasi permukaan air** di dalam dungeon berdanau atau kanal bawah tanah. |\n")

    out.append("---\n")

    # 3. Complete Mermaid Evolution Tree
    out.append("## 🌳 3. Bagan Lengkap Pohon Evolusi 50 Kelas Nusvanir\n")
    out.append("```mermaid")
    out.append("graph TD")
    out.append("    %% Jalur Fisik")
    out.append("    subgraph Jalur_Fisik [🛡️ Jalur Fisik - Melee / Tank / Bela Diri]")
    out.append("        T1_Fighter[\"Fighter (T1 - Lv 10)\"] --> T2_Warrior[\"Warrior (T2 - Lv 30)\"]")
    out.append("        T1_Fighter --> T2_Squire[\"Squire (T2 - Lv 30)\"]")
    out.append("        T1_Fighter --> T2_Brawler[\"Brawler (T2 - Lv 30)\"]")
    out.append("        T2_Warrior --> T3_Mercenary[\"Mercenary (T3 - Lv 40)\"]")
    out.append("        T2_Squire --> T3_Knight[\"Knight (T3 - Lv 40)\"]")
    out.append("        T2_Brawler --> T3_MartialArtist[\"Martial Artist (T3 - Lv 40)\"]")
    out.append("        T3_Mercenary --> T4_Champion[\"Champion (T4 - Lv 50)\"]")
    out.append("        T3_Knight --> T4_Dragoon[\"Dragoon (T4 - Lv 50)\"]")
    out.append("        T3_Knight --> T4_Paladin[\"Paladin (T4 - Lv 50)\"]")
    out.append("        T3_MartialArtist --> T4_Monk[\"Monk (T4 - Lv 50)\"]")
    out.append("        T4_Champion --> T5_Berserker[\"Berserker (T5 - Lv 60)\"]")
    out.append("        T4_Dragoon --> T5_SkySovereign[\"Sky Sovereign (T5 - Lv 60)\"]")
    out.append("        T4_Paladin --> T5_DeathKnight[\"Death Knight (T5 - Lv 60)\"]")
    out.append("        T4_Paladin --> T5_HolyKnight[\"Holy Knight (T5 - Lv 60)\"]")
    out.append("        T4_Monk --> T5_Brahma[\"Brahma (T5 - Lv 60)\"]")
    out.append("    end")
    out.append("")
    out.append("    %% Jalur Sihir")
    out.append("    subgraph Jalur_Sihir [🔮 Jalur Sihir - Arcane / Elemen / Suci / Gelap]")
    out.append("        T1_Apprentice[\"Apprentice (T1 - Lv 10)\"] --> T2_Magician[\"Magician (T2 - Lv 30)\"]")
    out.append("        T1_Apprentice --> T2_Acolyte[\"Acolyte (T2 - Lv 30)\"]")
    out.append("        T1_Apprentice --> T2_Occultist[\"Occultist (T2 - Lv 30)\"]")
    out.append("        T2_Magician --> T3_Mage[\"Mage (T3 - Lv 40)\"]")
    out.append("        T2_Acolyte --> T3_Cleric[\"Cleric (T3 - Lv 40)\"]")
    out.append("        T2_Occultist --> T3_Cultist[\"Cultist (T3 - Lv 40)\"]")
    out.append("        T3_Mage --> T4_Pyromancer[\"Pyromancer (T4)\"]")
    out.append("        T3_Mage --> T4_Hydromancer[\"Hydromancer (T4)\"]")
    out.append("        T3_Mage --> T4_Geomancer[\"Geomancer (T4)\"]")
    out.append("        T3_Mage --> T4_Aeromancer[\"Aeromancer (T4)\"]")
    out.append("        T3_Mage --> T4_Electromancer[\"Electromancer (T4)\"]")
    out.append("        T3_Mage --> T4_Cryomancer[\"Cryomancer (T4)\"]")
    out.append("        T3_Mage --> T4_Ferromancer[\"Ferromancer (T4)\"]")
    out.append("        T3_Mage --> T4_Echomancer[\"Echomancer (T4)\"]")
    out.append("        T3_Mage --> T5_Archmage[\"Archmage (T5 - Lv 60)\"]")
    out.append("        T3_Mage --> T5_DragonAspect[\"Dragon Aspect (T5 - Lv 60)\"]")
    out.append("        T3_Cleric --> T4_Priest[\"Priest (T4 - Lv 50)\"]")
    out.append("        T3_Cleric --> T5_Shaman[\"Shaman (T5 - Lv 60)\"]")
    out.append("        T3_Cultist --> T4_Necromancer[\"Necromancer (T4 - Lv 50)\"]")
    out.append("        T4_Priest --> T5_HighPriest[\"High Priest (T5 - Lv 60)\"]")
    out.append("        T4_Necromancer --> T5_Warlock[\"Warlock (T5 - Lv 60)\"]")
    out.append("        T5_Archmage --> T6_Chronomancer[\"Chronomancer (T6 - Lv 70)\"]")
    out.append("        T5_Warlock --> T6_VoidIncarnate[\"Void Incarnate (T6 - Lv 70)\"]")
    out.append("    end")
    out.append("")
    out.append("    %% Jalur Lincah")
    out.append("    subgraph Jalur_Lincah [🏹 Jalur Lincah - Ranged / Assassin / Speed]")
    out.append("        T1_Scout[\"Scout (T1 - Lv 10)\"] --> T2_Archer[\"Archer (T2 - Lv 30)\"]")
    out.append("        T1_Scout --> T2_Thief[\"Thief (T2 - Lv 30)\"]")
    out.append("        T2_Archer --> T3_Ranger[\"Ranger (T3 - Lv 40)\"]")
    out.append("        T2_Thief --> T3_Rogue[\"Rogue (T3 - Lv 40)\"]")
    out.append("        T3_Ranger --> T4_Sniper[\"Sniper (T4 - Lv 50)\"]")
    out.append("        T3_Ranger --> T5_Beastmaster[\"Beastmaster (T5 - Lv 60)\"]")
    out.append("        T3_Rogue --> T4_Assassin[\"Assassin (T4 - Lv 50)\"]")
    out.append("        T4_Sniper --> T5_Windrunner[\"Windrunner (T5 - Lv 60)\"]")
    out.append("        T4_Assassin --> T5_ShadowWalker[\"Shadow Walker (T5 - Lv 60)\"]")
    out.append("    end")
    out.append("```\n")

    out.append("---\n")

    # 4. Master Directory of 50 Classes
    out.append("## 📊 4. Direktori Master 50 Kelas Petualang Nusvanir\n")

    def make_class_directory_table(cids, branch_name):
        rows = []
        rows.append(f"### {branch_name}")
        rows.append("| Tier | CID | Nama Kelas | Promosi Dari | Promosi Lanjutan | Level Cap | Peran & Karakteristik | Pertumbuhan Stat | Senjata Utama | Tautan Berkas |")
        rows.append("| :---: | :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |")
        for cid in cids:
            c = classes_data[cid]
            meta = class_meta_info[cid]
            tier_str = f"**T{meta['tier']}**"
            p_names = [classes_data[pid]['name'] for pid in evolution_tree[cid]['parents']]
            c_names = [classes_data[ch]['name'] for ch in evolution_tree[cid]['children']]
            from_str = ", ".join(p_names) if p_names else "—"
            to_str = ", ".join(c_names) if c_names else "—"
            wtypes, _, _ = get_class_equipment(c)
            w_str = ", ".join(wtypes[:2]) if wtypes else "Semua"
            b_dir = class_branches[cid]
            fname = class_filenames[cid]
            link = f"[{c['name']}]({b_dir}/{fname})"
            rows.append(f"| {tier_str} | `#{cid}` | **{c['name']}** | {from_str} | {to_str} | Lv. {meta['cap']} | {meta['role']} | `{meta['growth']}` | {w_str} | {link} |")
        rows.append("\n")
        return "\n".join(rows)

    out.append(make_class_directory_table(range(1, 17), "🛡️ Cabang Jalur Fisik (16 Kelas)"))
    out.append(make_class_directory_table(list(range(17, 39)) + [49, 50], "🔮 Cabang Jalur Sihir (21 Kelas)"))
    out.append(make_class_directory_table(range(39, 49), "🏹 Cabang Jalur Lincah (13 Kelas)"))

    out.append("---\n")

    # 5. Master Skill Movepools for All 50 Classes
    out.append("## ⚡ 5. Master Tabel Movepool & Pembelajaran Jurus (Lengkap 50 Kelas)\n")
    out.append("Di bawah ini tercantum seluruh jurus yang dipelajari secara alami oleh setiap kelas beserta pilar peran, konsumsi biaya, formula damage, efek status, dan ketersediaan **Gulungan Ilmu (Scroll)**:\n")

    def make_class_movepool_section(cids, branch_header):
        b_out = []
        b_out.append(f"### {branch_header}\n")
        for cid in cids:
            c = classes_data[cid]
            meta = class_meta_info[cid]
            b_dir = class_branches[cid]
            fname = class_filenames[cid]
            b_out.append(f"#### 🔹 CID {cid}: {c['name']} (Tier {meta['tier']} | Level Cap: {meta['cap']})")
            b_out.append(f"> **Peran:** {meta['role']} | **Stat Growth:** `{meta['growth']}` | **Berkas Dokumen:** [{fname}]({b_dir}/{fname})\n")
            b_out.append("| Level | Nama Jurus | Pilar Tempur | Tipe / Elemen | Biaya | Target | Formula Kerusakan / Skala | Efek Status / Tambahan | Status Scroll | Deskripsi Taktis |")
            b_out.append("| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |")
            for l in c.get('learnings', []):
                b_out.append(format_skill_row(c, l, for_readme=True))
            b_out.append("\n")
        return "\n".join(b_out)

    out.append(make_class_movepool_section(range(1, 17), "🛡️ Movepool Jalur Fisik (Fighter Lineage - 16 Kelas)"))
    out.append(make_class_movepool_section(list(range(17, 39)) + [49, 50], "🔮 Movepool Jalur Sihir (Apprentice Lineage - 21 Kelas)"))
    out.append(make_class_movepool_section(range(39, 49), "🏹 Movepool Jalur Lincah (Scout Lineage - 13 Kelas)"))

    return "\n".join(out)


def generate_single_class_md(cid):
    """Generates individual markdown file for class CID"""
    c = classes_data[cid]
    meta = class_meta_info[cid]
    b_dir = class_branches[cid]
    fname = class_filenames[cid]
    branch_name = "Jalur Fisik (Melee / Tank)" if "Fisik" in b_dir else ("Jalur Sihir (Arcane / Elemen)" if "Sihir" in b_dir else "Jalur Lincah (Ranged / Speed)")
    
    # Parents and children
    p_names = [classes_data[pid]['name'] for pid in evolution_tree[cid]['parents']]
    c_names = [classes_data[ch]['name'] for ch in evolution_tree[cid]['children']]
    from_str = ", ".join(p_names) if p_names else "—"
    to_str = ", ".join(c_names) if c_names else "—"

    # Description
    note = c.get('note', '')
    desc_m = re.search(r'<Class Description>\s*([\s\S]*?)\s*</Class Description>', note)
    class_desc = desc_m.group(1).strip() if desc_m else f"Kelas petualang spesialisasi tingkat Tier {meta['tier']} di dunia Nusvanir."

    # 6 Base Stats & Aptitude Grades
    str_v, int_v, dex_v, luk_v, agi_v, vit_v = meta['stats']

    def get_grade(v):
        if v >= 10: return 'S', 2.0
        if v >= 8: return 'A', round(1.6 + (v - 8) * 0.2, 1)
        if v >= 6: return 'B', round(1.2 + (v - 6) * 0.2, 1)
        if v >= 4: return 'C', round(0.8 + (v - 4) * 0.2, 1)
        if v >= 2: return 'D', round(0.4 + (v - 2) * 0.2, 1)
        return 'E', 0.2

    str_g, str_r = get_grade(str_v)
    int_g, int_r = get_grade(int_v)
    dex_g, dex_r = get_grade(dex_v)
    luk_g, luk_r = get_grade(luk_v)
    agi_g, agi_r = get_grade(agi_v)
    vit_g, vit_r = get_grade(vit_v)

    # Baseline Derived Stats
    max_hp = 50 + (vit_v * 15) + (str_v * 5)
    max_mp = 20 + (int_v * 8)
    max_sp = 20 + (vit_v * 5) + (str_v * 2)
    atk = (str_v * 2) + int(dex_v * 0.5) if "Fisik" in b_dir else ((dex_v * 2) + int(str_v * 0.5) if "Lincah" in b_dir else (str_v * 1 + int(dex_v * 0.5)))
    mat = 2 + (int_v * 2)
    defense = 5 + int(vit_v * 1.5) + int(str_v * 0.5)
    mdf = 5 + int(int_v * 1.2) + int(vit_v * 0.8)
    speed = 5 + int(agi_v * 1.5)

    hit_rate = min(100.0, 85.0 + (dex_v * 0.2))
    eva_rate = min(80.0, 2.0 + (agi_v * 0.2) + (luk_v * 0.05))
    crit_rate = min(85.0, 3.0 + (dex_v * 0.2) + (luk_v * 0.1))
    cev_rate = (luk_v * 0.15) + (vit_v * 0.1)
    cdmg_rate = 150.0 + (str_v * 0.3) + (dex_v * 0.2)
    grd_rate = 100.0 + (vit_v * 0.5)
    hrg_rate = vit_v * 0.03
    mrg_rate = int_v * 0.03
    trg_rate = 3.0 + (agi_v * 0.04) + (vit_v * 0.02)

    wtypes, atypes, stypes = get_class_equipment(c)
    w_str = ", ".join([f"`{w}`" for w in wtypes]) if wtypes else "Semua Senjata"
    a_str = ", ".join([f"`{a}`" for a in atypes]) if atypes else "Pakaian Dasar"
    s_str = ", ".join([f"`{s}`" for s in stypes]) if stypes else "Skill"

    out = []
    # Frontmatter
    out.append("---")
    out.append(f"title: {c['name']}")
    out.append(f"class_id: {cid}")
    out.append(f"tier: {meta['tier']}")
    out.append(f"branch: {branch_name}")
    out.append(f"level_cap: {meta['cap']}")
    out.append(f"primary_role: {meta['role']}")
    out.append("tags:")
    out.append("  - Class_Database")
    out.append(f"  - Tier_{meta['tier']}")
    out.append(f"  - {branch_name.split()[1]}")
    out.append("---\n")

    # Header
    out.append(f"# 🛡️ Database Kelas: {c['name']}")
    out.append(f"> **Cabang:** `{branch_name}` | **Tingkat:** `Tier {meta['tier']}` | **Batas Level:** `Lv. 1 – {meta['cap']}`\n")
    out.append(f"{class_desc}\n")
    out.append("---\n")

    # 1. Profil & Identitas Peran
    out.append("## 1. Profil & Identitas Peran")
    out.append("| Atribut Kelas | Rincian / Status Resmi |")
    out.append("| :--- | :--- |")
    out.append(f"| **Nama Resmi** | **{c['name']}** |")
    out.append(f"| **Class ID Database** | `CID: {cid}` |")
    out.append(f"| **Tier Penguasaan** | `Tier {meta['tier']}` *(Level Cap: Lv. {meta['cap']})* |")
    out.append(f"| **Promosi Dari** | `{from_str}` |")
    out.append(f"| **Promosi Lanjutan** | `{to_str}` |")
    out.append(f"| **Peran Utama** | `{meta['role']}` |")
    out.append(f"| **Pertumbuhan Stat Alami** | `{meta['growth']}` per Job Level |")
    out.append("\n")

    # 2. Parameter Pertumbuhan & Karakteristik
    out.append("## 2. Parameter Pertumbuhan & Karakteristik (Turn-Based RPG)\n")
    out.append("### A. Class Stat Aptitude Rating & 6 Base Stats (Skala 1 – 10)")
    out.append("| Parameter | STR | INT | DEX | LUK | AGI | VIT |")
    out.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |")
    out.append(f"| **Stat Aptitude (1–10)** | **{str_v}** | **{int_v}** | **{dex_v}** | **{luk_v}** | **{agi_v}** | **{vit_v}** |")
    out.append(f"| **Grade Evaluasi** | **Grade {str_g}** | **Grade {int_g}** | **Grade {dex_g}** | **Grade {luk_g}** | **Grade {agi_g}** | **Grade {vit_g}** |")
    out.append(f"| **Growth Rate Alami** | `+{str_r:.1f}/Lv` | `+{int_r:.1f}/Lv` | `+{dex_r:.1f}/Lv` | `+{luk_r:.1f}/Lv` | `+{agi_r:.1f}/Lv` | `+{vit_r:.1f}/Lv` |\n")
    out.append(f"* **Fokus Pertumbuhan Stat Alami:** `{meta['growth']}`")
    out.append(f"* **Kurva EXP & Batas Level:** `Tier {meta['tier']}` *(Batas Maksimum: Lv. {meta['cap']})*\n")

    out.append("### B. Stat Turunan Awal (Baseline Derived Stats)")
    out.append("*Dihitung deterministik dari 6 Base Stats awal kelas menggunakan formula resmi dunia Nusvanir:*\n")

    out.append("#### 1. Sumber Daya Vital & Tempur Utama")
    out.append("| Parameter | Nilai Baseline | Formula / Perhitungan Resmi |")
    out.append("| :--- | :---: | :--- |")
    out.append(f"| **Max HP** | `{max_hp}` | `Base 50 + (VIT {vit_v} * 15) + (STR {str_v} * 5)` |")
    out.append(f"| **Max MP** | `{max_mp}` | `Base 20 + (INT {int_v} * 8)` |")
    out.append(f"| **Max SP** | `{max_sp}` | `Base 20 + (VIT {vit_v} * 5) + (STR {str_v} * 2)` *(Preserved antar battle)* |")
    out.append(f"| **ATK** | `{atk}` | `(STR {str_v} * 2) + (DEX {dex_v} * 0.5)` |")
    out.append(f"| **DEF** | `{defense}` | `Base 5 + (VIT {vit_v} * 1.5) + (STR {str_v} * 0.5)` |")
    out.append(f"| **MAT** | `{mat}` | `Base 2 + (INT {int_v} * 2)` |")
    out.append(f"| **MDF** | `{mdf}` | `Base 5 + (INT {int_v} * 1.2) + (VIT {vit_v} * 0.8)` |")
    out.append(f"| **Action Speed** | `{speed}` | `Base 5 + (AGI {agi_v} * 1.5)` |\n")

    out.append("#### 2. Presisi, Kritikal & Regenerasi Giliran")
    out.append("| Parameter | Nilai (%) | Formula Perhitungan |")
    out.append("| :--- | :---: | :--- |")
    out.append(f"| **Hit Rate (HIT)** | `{hit_rate:.1f}%` | `85% + (DEX {dex_v} * 0.2%)` (Cap 100%) |")
    out.append(f"| **Evasion Rate (EVA)** | `{eva_rate:.1f}%` | `2% + (AGI {agi_v} * 0.2%) + (LUK {luk_v} * 0.05%)` |")
    out.append(f"| **Critical Rate (CRI)** | `{crit_rate:.1f}%` | `3% + (DEX {dex_v} * 0.2%) + (LUK {luk_v} * 0.1%)` |")
    out.append(f"| **Critical Evasion (CEV)** | `{cev_rate:.1f}%` | `(LUK {luk_v} * 0.15%) + (VIT {vit_v} * 0.1%)` |")
    out.append(f"| **Critical Damage (CDMG)** | `{cdmg_rate:.1f}%` | `150% + (STR {str_v} * 0.3%) + (DEX {dex_v} * 0.2%)` |")
    out.append(f"| **Guard Efficiency (GRD)** | `{grd_rate:.1f}%` | `100% + (VIT {vit_v} * 0.5%)` |")
    out.append(f"| **HP Regen / Turn (HRG)** | `{hrg_rate:.2f}%` | `VIT {vit_v} * 0.03%` |")
    out.append(f"| **MP Regen / Turn (MRG)** | `{mrg_rate:.2f}%` | `INT {int_v} * 0.03%` |")
    out.append(f"| **SP Regen / Turn (TRG)** | `{trg_rate:.2f}%` | `3% + (AGI {agi_v} * 0.04%) + (VIT {vit_v} * 0.02%)` |\n")

    out.append("### C. Karakteristik, Sasis & Peralatan")
    out.append(f"* **Senjata yang Dapat Digunakan:** {w_str}")
    out.append(f"* **Zirah & Pelindung:** {a_str}")
    out.append(f"* **Tipe Skill yang Dibuka (Skill Types):** {s_str}")
    out.append("* **Skill Pasif:** Aktif otomatis via plugin `YEP_AutoPassiveStates` berdasarkan traits kelas.\n")

    # 3. Daftar Lengkap Skill & Pembelajaran
    out.append("## 3. Daftar Lengkap Skill & Pembelajaran (Learnings)")
    out.append("*Seluruh skill di bawah otomatis terbuka saat mencapai Job Level yang ditentukan dan tetap tersimpan permanen saat berpindah kelas:*\n")
    out.append("| Level | Nama Skill | Pilar | Tipe / Elemen | Biaya | Target | Formula / Skala | Efek Tambahan | Status Scroll | Deskripsi Taktis |")
    out.append("| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |")
    for l in c.get('learnings', []):
        out.append(format_skill_row(c, l, for_readme=False))
    out.append("\n---\n")

    # 4. Alur Evolusi & Percabangan Kelas (Mermaid)
    out.append("## 4. Alur Evolusi & Percabangan Kelas")
    out.append("```mermaid")
    out.append("graph LR")
    if p_names:
        for p in p_names:
            out.append(f"    Parent_{p.replace(' ', '_')} [\"{p}\"] --> Current [\"{c['name']} (T{meta['tier']})\"]")
    else:
        out.append(f"    Origin [\"Awal Petualangan\"] --> Current [\"{c['name']} (T{meta['tier']})\"]")
    if c_names:
        for ch in c_names:
            out.append(f"    Current --> Next_{ch.replace(' ', '_')} [\"{ch}\"]")
    else:
        out.append(f"    Current --> MaxMastery [\"Penguasaan Tertinggi (Mastery)\"]")
    out.append("```\n")

    return "\n".join(out)


def main():
    print("Generating Master Compendium README.md...")
    readme_content = generate_master_compendium()
    readme_path = VAULT_CLASS_DIR / 'README.md'
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print(f"Master Compendium generated at: {readme_path} ({len(readme_content)} bytes)")

    print("\nGenerating all 50 individual class documentation files...")
    generated_count = 0
    for cid in sorted(class_meta_info.keys()):
        b_dir = class_branches[cid]
        fname = class_filenames[cid]
        target_path = VAULT_CLASS_DIR / b_dir / fname
        os.makedirs(target_path.parent, exist_ok=True)
        content = generate_single_class_md(cid)
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        generated_count += 1
        print(f"  [{generated_count}/50] Generated: {target_path.relative_to(VAULT_CLASS_DIR)}")

    print(f"\nSuccessfully generated {generated_count} class documents and Master README.md!")


if __name__ == '__main__':
    main()

