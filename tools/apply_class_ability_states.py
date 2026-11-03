#!/usr/bin/env python3
"""
tools/apply_class_ability_states.py
Creates and populates 50 Innate Class Passive States (IDs 60 - 109) in data/States.json,
and links <Passive State: ID> to each class in data/Classes.json.
"""

import json
import os
import shutil
from pathlib import Path

# Paths to update
PROJECT_DIRS = [
    Path("/mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game Project/Tales of The Dark Time"),
    Path("/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time")
]

CLASS_ABILITIES_CONFIG = {
    1: {
        "name": "Battle Spirit",
        "icon": 96,
        "class_name": "Fighter",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.08} # ATK * 108%
        ],
        "notes": "<ATK Rate: 108%>\n<STR Rate: 1.05>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Fighter: Meningkatkan P.ATK sebesar +8%. Saat HP berada di bawah 50%, memulihkan +2 SP ekstra pada setiap awal giliran."
    },
    2: {
        "name": "Heavy Impact",
        "icon": 99,
        "class_name": "Warrior",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.12} # ATK * 112%
        ],
        "notes": "<ATK Rate: 112%>\n<STR Rate: 1.08>\n<Armor Penetration: 10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Warrior: Meningkatkan P.ATK sebesar +12% dan mengabaikan 10% DEF target. Serangan fisik memiliki 5% peluang menyebabkan Stun."
    },
    3: {
        "name": "Vanguard Aegis",
        "icon": 128,
        "class_name": "Squire",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.15}, # DEF * 115%
            {"code": 23, "dataId": 1, "value": 1.20}  # GRD * 120%
        ],
        "notes": "<DEF Rate: 115%>\n<VIT Rate: 1.10>\n<Guard Efficiency: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Squire: Meningkatkan P.DEF sebesar +15% dan efisiensi Guard (GRD +20%). Saat berada di Baris Depan, mengurangi kerusakan fisik kawan baris belakang sebesar 5%."
    },
    4: {
        "name": "Rhythm Striker",
        "icon": 104,
        "class_name": "Brawler",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.15} # AGI * 115%
        ],
        "notes": "<AGI Rate: 115%>\n<Max SP: +15>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Brawler: Meningkatkan Action Speed sebesar +15%. Setiap kali melancarkan skill fisik, memulihkan +5 SP secara instan."
    },
    5: {
        "name": "Veteran Resolve",
        "icon": 96,
        "class_name": "Mercenary",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.15} # ATK * 115%
        ],
        "notes": "<ATK Rate: 115%>\n<Armor Penetration: 15%>\n<STR Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Mercenary: Meningkatkan P.ATK +15% dan menembus 15% DEF musuh. Setiap kali menumbangkan musuh, memulihkan 15% Max HP dan mendapat buff ATK +10% selama 2 giliran."
    },
    6: {
        "name": "Fortress Bastion",
        "icon": 128,
        "class_name": "Knight",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.20}, # DEF * 120%
            {"code": 21, "dataId": 5, "value": 1.20}, # MDF * 120%
            {"code": 23, "dataId": 1, "value": 1.25}  # GRD * 125%
        ],
        "notes": "<DEF Rate: 120%>\n<MDF Rate: 120%>\n<Guard Efficiency: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Knight: Meningkatkan P.DEF & M.MDF +20%, serta efisiensi Guard (GRD +25%). Otomatis menahan 30% kerusakan yang mengarah ke kawan dengan sisa HP terendah."
    },
    7: {
        "name": "Flowing Stance",
        "icon": 104,
        "class_name": "Martial Artist",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.20} # AGI * 120%
        ],
        "notes": "<AGI Rate: 120%>\n<Max SP: +20>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Martial Artist: Action Speed +20% dan memulihkan +8 SP tiap serangan fisik. Jika menyerang 2 giliran berturut-turut, serangan berikutnya dipastikan 100% Critical Hit."
    },
    8: {
        "name": "Unyielding Dominance",
        "icon": 97,
        "class_name": "Champion",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.20}, # ATK * 120%
            {"code": 14, "dataId": 11, "value": 1}   # Stun immunity (State Resist 11)
        ],
        "notes": "<ATK Rate: 120%>\n<STR Rate: 1.15>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Champion: P.ATK +20% dan kebal terhadap efek Stun & Knockdown. Kerusakan fisik meningkat hingga +30% seiring berkurangnya sisa target musuh di arena."
    },
    9: {
        "name": "Dragonfang Skystrike",
        "icon": 101,
        "class_name": "Dragoon",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.20} # ATK * 120%
        ],
        "notes": "<ATK Rate: 120%>\n<Armor Penetration: 20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Dragoon: Kerusakan jurus lompat dan tombak +25% serta mengabaikan 20% DEF. Serangan dari udara menghasilkan gelombang kejut berdaya rusak area (AoE)."
    },
    10: {
        "name": "Aegis of Sanctuary",
        "icon": 128,
        "class_name": "Paladin",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.25}, # DEF * 125%
            {"code": 21, "dataId": 5, "value": 1.25}, # MDF * 125%
            {"code": 14, "dataId": 14, "value": 1},   # Blind immunity
            {"code": 14, "dataId": 15, "value": 1}    # Fear immunity
        ],
        "notes": "<DEF Rate: 125%>\n<MDF Rate: 125%>\n<PDR Rate: 85%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Paladin: P.DEF & M.MDF +25%. Seluruh sekutu di baris yang sama menerima pengurangan kerusakan 15% dan kebal terhadap status Fear & Blind."
    },
    11: {
        "name": "Asura Meridian",
        "icon": 104,
        "class_name": "Monk",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.25}, # ATK * 125%
            {"code": 22, "dataId": 2, "value": 0.15}  # CRI +15%
        ],
        "notes": "<ATK Rate: 125%>\n<CRI Plus: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Monk: Serangan fisik tanpa senjata mendapatkan bonus P.ATK +25% dan CRI +15%. Serangan kritis memiliki 20% peluang menyegel skill lawan (Silence) selama 1 turn."
    },
    12: {
        "name": "Bloodrage Immortality",
        "icon": 97,
        "class_name": "Berserker",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.25} # ATK * 125%
        ],
        "notes": "<ATK Rate: 125%>\n<Critical Damage: +40%>\n<STR Rate: 1.15>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Berserker: Saat HP di bawah 30%, P.ATK +50% dan CDMG +40%. Karakter tidak dapat gugur (kebal kematian mutlak) selama 1 giliran saat HP menyentuh angka 1."
    },
    13: {
        "name": "Abyssal Despair",
        "icon": 98,
        "class_name": "Death Knight",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.30}, # DEF * 130%
            {"code": 21, "dataId": 5, "value": 1.30}  # MDF * 130%
        ],
        "notes": "<DEF Rate: 130%>\n<MDF Rate: 130%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Death Knight: P.DEF & M.MDF +30%. Aura kegelapan mengurangi ATK & MAT seluruh lawan sebesar 15%; menyerap 20% dari seluruh kerusakan yang dihasilkan sebagai HP."
    },
    14: {
        "name": "Aegis of Radiance",
        "icon": 128,
        "class_name": "Holy Knight",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.25}, # DEF * 125%
            {"code": 21, "dataId": 5, "value": 1.25}, # MDF * 125%
            {"code": 23, "dataId": 6, "value": 0.85}  # PDR 85%
        ],
        "notes": "<DEF Rate: 125%>\n<MDF Rate: 125%>\n<PDR Rate: 85%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Holy Knight: Menahan 50% kerusakan yang mengarah ke seluruh anggota party. Serangan suci memulihkan HP party sebesar 20% dari total kerusakan yang ditimpakan."
    },
    15: {
        "name": "Meridian Annihilation",
        "icon": 104,
        "class_name": "Brahma",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.35} # AGI * 135%
        ],
        "notes": "<AGI Rate: 135%>\n<Armor Penetration: 40%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Brahma: Action Speed +35% dan seluruh serangan fisik menembus 40% DEF lawan. Setiap serangan beruntun meningkatkan output kerusakan sebesar +15% tanpa batas."
    },
    16: {
        "name": "Celestial Skystrike",
        "icon": 101,
        "class_name": "Sky Sovereign",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.30} # ATK * 130%
        ],
        "notes": "<ATK Rate: 130%>\n<STR Rate: 1.20>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Sky Sovereign: Kerusakan jurus udara +50%. Menghujamkan badai langit ke seluruh arena pada giliran pertama, menyebabkan Stun dan menurunkan DEF musuh sebesar 25%."
    },
    17: {
        "name": "Mana Attunement",
        "icon": 112,
        "class_name": "Apprentice",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.08}, # MAT * 108%
            {"code": 23, "dataId": 3, "value": 0.90}  # MCR * 90% (MP Cost -10%)
        ],
        "notes": "<MAT Rate: 108%>\n<INT Rate: 1.05>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Apprentice: Meningkatkan M.ATK sebesar +8% dan mengurangi konsumsi MP seluruh mantra sihir sebesar 10%."
    },
    18: {
        "name": "Elemental Overload",
        "icon": 112,
        "class_name": "Magician",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15} # MAT * 115%
        ],
        "notes": "<MAT Rate: 115%>\n<INT Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Magician: Meningkatkan M.ATK sebesar +15%. Serangan yang mengenai kelemahan elemen musuh menghasilkan tambahan kerusakan sebesar +25%."
    },
    19: {
        "name": "Divine Grace",
        "icon": 113,
        "class_name": "Acolyte",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.20}, # REC * 120%
            {"code": 22, "dataId": 8, "value": 0.02}  # MRG +2%
        ],
        "notes": "<REC Rate: 120%>\n<MRG Plus: +2%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Acolyte: Meningkatkan efektivitas skill penyembuhan sebesar +20% (Recovery Effect), serta memulihkan 2% Max MP otomatis setiap akhir giliran."
    },
    20: {
        "name": "Nether Siphon",
        "icon": 114,
        "class_name": "Occultist",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15} # MAT * 115%
        ],
        "notes": "<MAT Rate: 115%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Occultist: Kerusakan sihir berelemen Dark meningkat +15%. Menyerap 5% Max HP musuh setiap kali berhasil menimpakan status buruk (Debuff / Poison / Curse)."
    },
    21: {
        "name": "Arcane Amplification",
        "icon": 112,
        "class_name": "Mage",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20} # MAT * 120%
        ],
        "notes": "<MAT Rate: 120%>\n<INT Rate: 1.15>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Mage: Meningkatkan M.ATK +20%. Setiap kali melancarkan mantra sihir, meningkatkan kerusakan sihir elemen berikutnya sebesar +10% (dapat ditumpuk hingga 3 lapis / +30%)."
    },
    22: {
        "name": "Sanctified Aura",
        "icon": 113,
        "class_name": "Cleric",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.25}, # REC * 125%
            {"code": 22, "dataId": 7, "value": 0.03}, # HRG +3%
            {"code": 14, "dataId": 10, "value": 1}   # Curse immunity
        ],
        "notes": "<REC Rate: 125%>\n<HRG Plus: +3%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Cleric: Efektivitas pemulihan (Recovery Effect) +25%. Seluruh anggota party menerima regenerasi HP otomatis sebesar 3% Max HP tiap giliran dan kebal efek Curse."
    },
    23: {
        "name": "Soul Harvester",
        "icon": 114,
        "class_name": "Cultist",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20} # MAT * 120%
        ],
        "notes": "<MAT Rate: 120%>\n<INT Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Cultist: Kerusakan sihir Dark +20%. Setiap kali ada unit yang tumbang di medan tempur (kawan maupun lawan), menyerap 10% MP & SP mereka untuk memperkuat mantra berikutnya."
    },
    24: {
        "name": "Blazing Conflagration",
        "icon": 64,
        "class_name": "Elementalist (Pyromancer)",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20} # MAT * 120%
        ],
        "notes": "<MAT Rate: 120%>\n<Fire Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Pyromancer: Kerusakan sihir Api +25%. Musuh yang terkena Burn menerima kerusakan bertingkat dan menyebarkan kobaran api ke musuh di sekitarnya saat terkena hit."
    },
    25: {
        "name": "Tidal Resonance",
        "icon": 66,
        "class_name": "Elementalist (Hydromancer)",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15}, # MAT * 115%
            {"code": 21, "dataId": 5, "value": 1.15}  # MDF * 115%
        ],
        "notes": "<MAT Rate: 115%>\n<MDF Rate: 115%>\n<Water Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Hydromancer: Kerusakan sihir Air +25%. Setiap kali mantra mengenai target basah (Soaked), memulihkan 5% Max MP dan meningkatkan pertahanan MDF +20% selama 2 turn."
    },
    26: {
        "name": "Tectonic Bulwark",
        "icon": 67,
        "class_name": "Elementalist (Geomancer)",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.20}, # DEF * 120%
            {"code": 21, "dataId": 4, "value": 1.15}  # MAT * 115%
        ],
        "notes": "<DEF Rate: 120%>\n<MAT Rate: 115%>\n<Earth Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Geomancer: Kerusakan sihir Tanah +25%. Menghasilkan perisai batu (Shield) sebesar 15% Max HP setiap kali melancarkan skill berelemen Earth."
    },
    27: {
        "name": "Tempest Grace",
        "icon": 68,
        "class_name": "Elementalist (Aeromancer)",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.25}, # AGI * 125%
            {"code": 22, "dataId": 1, "value": 0.15}  # EVA +15%
        ],
        "notes": "<AGI Rate: 125%>\n<EVA Plus: +15%>\n<Wind Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Aeromancer: Kerusakan sihir Angin +25% dan EVA +15%. Kecepatan gerak bertindak meningkat drastis; memiliki 20% peluang bertindak dua kali dalam satu giliran."
    },
    28: {
        "name": "High-Voltage Surge",
        "icon": 69,
        "class_name": "Elementalist (Electromancer)",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20}, # MAT * 120%
            {"code": 21, "dataId": 6, "value": 1.15}  # AGI * 115%
        ],
        "notes": "<MAT Rate: 120%>\n<AGI Rate: 115%>\n<Lightning Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Electromancer: Kerusakan sihir Petir +25%. Serangan petir memiliki 25% peluang memicu loncatan listrik (Chain Lightning) ke 2 target musuh lain di sekitarnya."
    },
    29: {
        "name": "Glacial Subzero",
        "icon": 65,
        "class_name": "Elementalist (Cryomancer)",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20} # MAT * 120%
        ],
        "notes": "<MAT Rate: 120%>\n<Ice Damage: +25%>\n<Armor Penetration: 25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Cryomancer: Kerusakan sihir Es +25%. Serangan sihir es menembus 25% MDF dan memperlambat AGI musuh sebesar 20%; musuh beku (Freeze) menerima +35% shatter damage."
    },
    30: {
        "name": "Magnetic Polarization",
        "icon": 70,
        "class_name": "Elementalist (Ferromancer)",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.20}, # DEF * 120%
            {"code": 21, "dataId": 4, "value": 1.20}  # MAT * 120%
        ],
        "notes": "<DEF Rate: 120%>\n<MAT Rate: 120%>\n<Metal Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Ferromancer: Kerusakan sihir Logam +25% dan P.DEF +20%. Mengalihkan proyektil fisik musuh dan mengubah 10% damage yang diterima menjadi amunisi pecahan besi pembalas."
    },
    31: {
        "name": "Resonance Fracture",
        "icon": 71,
        "class_name": "Elementalist (Echomancer)",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20}, # MAT * 120%
            {"code": 22, "dataId": 0, "value": 0.15}  # HIT +15%
        ],
        "notes": "<MAT Rate: 120%>\n<HIT Plus: +15%>\n<Sonic Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Echomancer: Kerusakan sihir Suara +25%. Mengabaikan seluruh DEF & MDF musuh bertipe armor berat/batu; getaran suara memiliki peluang 25% membatalkan charge skill musuh."
    },
    32: {
        "name": "Grace of Rebirth",
        "icon": 113,
        "class_name": "Priest",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.30}, # REC * 130%
            {"code": 22, "dataId": 7, "value": 0.03}  # HRG +3%
        ],
        "notes": "<REC Rate: 130%>\n<HRG Plus: +3%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Priest: Efektivitas pemulihan +30%. Anggota party yang gugur dapat dibangkitkan otomatis 1x per battle dengan 30% Max HP tanpa menghabiskan item."
    },
    33: {
        "name": "Grave Mastery",
        "icon": 114,
        "class_name": "Necromancer",
        "traits": [
            {"code": 21, "dataId": 1, "value": 1.15}, # MMP * 115%
            {"code": 21, "dataId": 4, "value": 1.20}  # MAT * 120%
        ],
        "notes": "<Max MP: +15%>\n<MAT Rate: 120%>\n<Dark Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Necromancer: Kerusakan kutukan & racun +25%. Setiap kali musuh gugur, otomatis membangkitkan satu minion mayat hidup untuk menyerang dan menyerap damage party."
    },
    34: {
        "name": "Archon Dual-Cast",
        "icon": 112,
        "class_name": "Archmage",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.35} # MAT * 135%
        ],
        "notes": "<MAT Rate: 135%>\n<INT Rate: 1.25>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Archmage: M.ATK +35%. Setiap melancarkan sihir offensive, memiliki 30% peluang untuk melancarkan mantra sihir tersebut sekali lagi secara instan tanpa konsumsi MP tambahan."
    },
    35: {
        "name": "Supreme Miracle",
        "icon": 113,
        "class_name": "High Priest",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.50} # REC * 150%
        ],
        "notes": "<REC Rate: 150%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan High Priest: Seluruh mantra pemulihan menyembuhkan 50% lebih besar dan memberi perisai suci sebesar 20% Max HP; memberikan kekebalan total terhadap seluruh status debuff."
    },
    36: {
        "name": "Calamity Singularity",
        "icon": 114,
        "class_name": "Warlock",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.30} # MAT * 130%
        ],
        "notes": "<MAT Rate: 130%>\n<INT Rate: 1.20>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Warlock: Setiap efek status buruk (Debuff / Poison / Burn / Curse) pada lawan melipatgandakan seluruh damage sihir Warlock sebesar +10% per status (maksimal +50%)."
    },
    37: {
        "name": "Ancestral Dominion",
        "icon": 115,
        "class_name": "Shaman",
        "traits": [
            {"code": 22, "dataId": 7, "value": 0.05}, # HRG +5%
            {"code": 22, "dataId": 8, "value": 0.05}, # MRG +5%
            {"code": 22, "dataId": 9, "value": 0.05}  # TRG +5%
        ],
        "notes": "<HRG Plus: +5%>\n<MRG Plus: +5%>\n<TRG Plus: +5%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Shaman: Memanggil roh leluhur primal yang memberikan regenerasi HP, MP, dan SP sebesar 5% setiap giliran kepada seluruh anggota tim dan kebal terhadap elemen api dan petir."
    },
    38: {
        "name": "Primordial Dragon Awakening",
        "icon": 101,
        "class_name": "Dragon Aspect",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.25}, # ATK * 125%
            {"code": 21, "dataId": 4, "value": 1.35}  # MAT * 135%
        ],
        "notes": "<MAT Rate: 135%>\n<ATK Rate: 125%>\n<Armor Penetration: 30%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Dragon Aspect: M.ATK +35% dan P.ATK +25%. Mengubah seluruh serangan menjadi berelemen Dragon Flame yang menembus 30% MDF dan mengabaikan resistensi elemen musuh."
    },
    39: {
        "name": "Swift Ambush",
        "icon": 117,
        "class_name": "Scout",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.05}, # HIT +5%
            {"code": 22, "dataId": 1, "value": 0.05}  # EVA +5%
        ],
        "notes": "<EVA Plus: +5%>\n<HIT Plus: +5%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Scout: Meningkatkan EVA +5% dan HIT +5%. Karakter selalu mendapatkan prioritas giliran bertindak paling awal pada giliran pertama pertempuran."
    },
    40: {
        "name": "Eagle Eye",
        "icon": 118,
        "class_name": "Archer",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.10} # HIT +10%
        ],
        "notes": "<HIT Plus: +10%>\n<Critical Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Archer: Meningkatkan HIT +10% (serangan fisik tidak dapat meleset pada musuh terbang). Serangan dari Baris Belakang mendapatkan bonus +15% Critical Damage (CDMG)."
    },
    41: {
        "name": "Shadow Celerity",
        "icon": 119,
        "class_name": "Thief",
        "traits": [
            {"code": 22, "dataId": 2, "value": 0.08}, # CRI +8%
            {"code": 21, "dataId": 6, "value": 1.10}  # AGI * 110%
        ],
        "notes": "<CRI Plus: +8%>\n<AGI Rate: 110%>\n<Max SP: +10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Thief: Meningkatkan peluang serangan kritis (CRI +8%). Serangan kritikal memiliki 15% peluang mencuri item atau uang otomatis dan menambah +10 SP."
    },
    42: {
        "name": "Predator Instinct",
        "icon": 118,
        "class_name": "Ranger",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.15} # HIT +15%
        ],
        "notes": "<HIT Plus: +15%>\n<Critical Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Ranger: Akurasi HIT +15% dan CDMG +20%. Memberikan bonus +25% damage terhadap musuh bertipe Beast/Monster atau musuh yang terkena status Slow/Bleed."
    },
    43: {
        "name": "Lethal Ambush",
        "icon": 119,
        "class_name": "Rogue",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.10}, # EVA +10%
            {"code": 22, "dataId": 2, "value": 0.12}  # CRI +12%
        ],
        "notes": "<CRI Plus: +12%>\n<EVA Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Rogue: Peluang Kritis (CRI +12%) dan Evasion (EVA +10%). Serangan terhadap musuh yang belum sempat bertindak di ronde tersebut menghasilkan 100% Kritis Mutlak."
    },
    44: {
        "name": "Deadly Piercing",
        "icon": 118,
        "class_name": "Sniper",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.25} # HIT +25%
        ],
        "notes": "<HIT Plus: +25%>\n<Armor Penetration: 30%>\n<Critical Damage: +40%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Sniper: Jarak serang tak terbatas, HIT +25%, dan mengabaikan 30% DEF. Serangan dari Baris Belakang pada target ber-HP di atas 80% menghasilkan bonus +40% CDMG."
    },
    45: {
        "name": "Viper Assassination",
        "icon": 120,
        "class_name": "Assassin",
        "traits": [
            {"code": 22, "dataId": 2, "value": 0.20} # CRI +20%
        ],
        "notes": "<CRI Plus: +20%>\n<Critical Damage: +30%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Assassin: CRI +20% dan CDMG +30%. Serangan dari bayangan memiliki peluang 10% mengeksekusi musuh non-boss secara instan jika HP mereka di bawah 30%."
    },
    46: {
        "name": "Behemoth Packbond",
        "icon": 121,
        "class_name": "Beastmaster",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.20}, # ATK * 120%
            {"code": 21, "dataId": 3, "value": 1.20}, # DEF * 120%
            {"code": 21, "dataId": 6, "value": 1.20}  # AGI * 120%
        ],
        "notes": "<ATK Rate: 120%>\n<DEF Rate: 120%>\n<AGI Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Beastmaster: Meningkatkan seluruh parameter sekutu dan hewan panggilan sebesar +25%. Setiap serangan kawan memicu serangan susulan instan dari Beastmaster."
    },
    47: {
        "name": "Eclipse Phantom",
        "icon": 122,
        "class_name": "Shadow Walker",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.25}, # EVA +25%
            {"code": 22, "dataId": 2, "value": 0.25}  # CRI +25%
        ],
        "notes": "<EVA Plus: +25%>\n<CRI Plus: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Shadow Walker: EVA +25% dan CRI +25%. Karakter selalu bergerak dalam mode bayangan; serangan tidak dapat ditangkis atau dihindari oleh musuh (100% Unavoidable)."
    },
    48: {
        "name": "Sonic Tempest",
        "icon": 123,
        "class_name": "Windrunner",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.50} # AGI * 150%
        ],
        "notes": "<AGI Rate: 150%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Windrunner: Action Speed +50% dan selalu bertindak pertama di tiap giliran. Setiap langkah gerakan meningkatkan akurasi dan menambah serangan ganda pada target musuh."
    },
    49: {
        "name": "Temporal Overwrite",
        "icon": 124,
        "class_name": "Chronomancer",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.30} # AGI * 130%
        ],
        "notes": "<AGI Rate: 130%>\n<INT Rate: 1.20>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Chronomancer: Memiliki 15% peluang membatalkan giliran musuh secara instan. Saat menerima serangan mematikan, waktu berputar balik: HP dan MP kembali ke giliran sebelumnya (1x per battle)."
    },
    50: {
        "name": "Entropy Collapse",
        "icon": 125,
        "class_name": "Void Incarnate",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.35}, # ATK * 135%
            {"code": 21, "dataId": 4, "value": 1.35}  # MAT * 135%
        ],
        "notes": "<ATK Rate: 135%>\n<MAT Rate: 135%>\n<Armor Penetration: 100%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif bawaan Void Incarnate: Seluruh serangan mengabaikan 100% DEF & MDF lawan secara mutlak. Serangan menghanguskan 5% Max MP & SP musuh secara permanen pada setiap giliran pertempuran."
    }
}

def apply_to_project(proj_dir):
    data_dir = proj_dir / "data"
    states_path = data_dir / "States.json"
    classes_path = data_dir / "Classes.json"

    if not states_path.exists() or not classes_path.exists():
        print(f"Skipping {proj_dir}: States.json or Classes.json not found")
        return

    # Backup files
    shutil.copyfile(states_path, str(states_path) + ".bak_abilities")
    shutil.copyfile(classes_path, str(classes_path) + ".bak_abilities")

    with open(states_path, "r", encoding="utf-8") as f:
        states = json.load(f)

    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    # Ensure states list has at least 276 slots (0..275)
    while len(states) <= 109:
        states.append(None)

    # Populate States 226 to 275
    for class_id, cfg in CLASS_ABILITIES_CONFIG.items():
        state_id = 59 + class_id # 60 .. 109
        st_obj = states[state_id] or {}
        st_obj["id"] = state_id
        st_obj["name"] = f"Pasif: {cfg['name']}"
        st_obj["iconIndex"] = cfg["icon"]
        st_obj["restriction"] = 0
        st_obj["priority"] = 50
        st_obj["motion"] = 0
        st_obj["overlay"] = 0
        st_obj["autoRemovalTiming"] = 0
        st_obj["minTurns"] = 1
        st_obj["maxTurns"] = 1
        st_obj["removeAtBattleEnd"] = False
        st_obj["removeByRestriction"] = False
        st_obj["removeByDamage"] = False
        st_obj["removeByWalking"] = False
        st_obj["chanceByDamage"] = 100
        st_obj["traits"] = cfg["traits"]
        st_obj["note"] = cfg["notes"]
        st_obj["message1"] = ""
        st_obj["message2"] = ""
        st_obj["message3"] = ""
        st_obj["message4"] = ""
        states[state_id] = st_obj

        # Link <Passive State: state_id> into Classes.json
        cls_obj = classes[class_id]
        if cls_obj:
            note = cls_obj.get("note", "")
            # Remove any existing <Passive State: ...> for class abilities
            import re
            note = re.sub(r'<Passive State:\s*\d+>', '', note).strip()
            # Append clean <Passive State: state_id>
            note += f"\n<Passive State: {state_id}>"
            cls_obj["note"] = note

    with open(states_path, "w", encoding="utf-8") as f:
        json.dump(states, f, indent=2, ensure_ascii=False)

    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)

    print(f"Successfully updated 50 Class Ability States (60-109) in {proj_dir}!")

def main():
    for p in PROJECT_DIRS:
        apply_to_project(p)

if __name__ == "__main__":
    main()

