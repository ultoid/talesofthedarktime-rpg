#!/usr/bin/env python3
"""
tools/standardize_skill_passives.py
Standardizes traits and notetags for Skill Passives (IDs 117 - 213) in data/States.json
to strictly follow the 6 Base Stats & Derived Stats formulas of Nusvanir.
"""

import json
import shutil
from pathlib import Path

PROJECT_DIRS = [
    Path("/mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game Project/Tales of The Dark Time"),
    Path("/mnt/DC9EA2C29EA29494/Project/Tales of The Dark Time/Tales of The Dark Time")
]

# Standardized configurations for states 117-213
SKILL_PASSIVES_CONFIG = {
    117: {
        "name": "Combat Mastery",
        "traits": [{"code": 21, "dataId": 2, "value": 1.08}],
        "note": "<ATK Rate: 108%>\n<STR Rate: 1.05>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Fisik (ATK) sebesar +8% secara permanen."
    },
    118: {
        "name": "Iron Discipline",
        "traits": [
            {"code": 21, "dataId": 0, "value": 1.08},
            {"code": 14, "dataId": 15, "value": 1} # Fear immunity
        ],
        "note": "<Max HP: +8%>\n<VIT Rate: 1.05>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Max HP sebesar +8% dan memberikan kekebalan terhadap efek Fear."
    },
    119: {
        "name": "Guardian Armor",
        "traits": [
            {"code": 21, "dataId": 0, "value": 1.12},
            {"code": 21, "dataId": 3, "value": 1.07},
            {"code": 21, "dataId": 5, "value": 1.07}
        ],
        "note": "<Max HP: +12%>\n<DEF Rate: 107%>\n<MDF Rate: 107%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Max HP +12%, Pertahanan Fisik (DEF) +7%, dan Pertahanan Magis (MDF) +7%."
    },
    120: {
        "name": "Unyielding Guard",
        "traits": [
            {"code": 23, "dataId": 6, "value": 0.92}, # PDR 92%
            {"code": 23, "dataId": 7, "value": 0.92}, # MDR 92%
            {"code": 14, "dataId": 11, "value": 1},   # Stun immunity
            {"code": 14, "dataId": 15, "value": 1}    # Fear immunity
        ],
        "note": "<PDR Rate: 92%>\n<MDR Rate: 92%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengurangi kerusakan fisik dan sihir yang diterima sebesar 8%, serta kebal terhadap status Stun dan Fear."
    },
    121: {
        "name": "Muscle Training",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.08},
            {"code": 22, "dataId": 1, "value": 0.05}
        ],
        "note": "<AGI Rate: 108%>\n<EVA Plus: +5%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed (AGI) sebesar +8% dan peluang menghindar (EVA) sebesar +5%."
    },
    122: {
        "name": "Adrenaline Rush",
        "traits": [
            {"code": 23, "dataId": 5, "value": 1.15} # TCR * 115%
        ],
        "note": "<TCR Rate: 115%>\n<Max SP: +15>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan pengisian SP saat memberi kerusakan sebesar +15% dan menambah batas Max SP +15."
    },
    123: {
        "name": "Iron Fist",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.12}
        ],
        "note": "<ATK Rate: 112%>\n<Armor Penetration: 8%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Fisik (ATK) sebesar +12% dan serangan mengabaikan 8% DEF musuh."
    },
    124: {
        "name": "Bloodlust",
        "traits": [],
        "note": "<Lifesteal: 10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Menyerap 10% dari kerusakan fisik yang ditimpakan ke target sebagai pemulihan HP."
    },
    125: {
        "name": "Unstoppable Force",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.15}
        ],
        "note": "<ATK Rate: 115%>\n<STR Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Fisik (ATK) +15% dan ketahanan terhadap status kontrol +40%."
    },
    126: {
        "name": "Desperate Fury",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.35},
            {"code": 21, "dataId": 6, "value": 1.20}
        ],
        "note": "<Passive Condition: HP Below 25%>\n<ATK Rate: 135%>\n<AGI Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat sisa HP berada di bawah 25%, meningkatkan ATK sebesar +35% dan Action Speed sebesar +20%."
    },
    127: {
        "name": "Fortified Guardian Armor",
        "traits": [
            {"code": 21, "dataId": 0, "value": 1.15},
            {"code": 21, "dataId": 3, "value": 1.08},
            {"code": 21, "dataId": 5, "value": 1.08}
        ],
        "note": "<Max HP: +15%>\n<DEF Rate: 108%>\n<MDF Rate: 108%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Max HP +15%, DEF +8%, dan MDF +8%."
    },
    128: {
        "name": "Shield Parry",
        "traits": [
            {"code": 22, "dataId": 3, "value": 0.10} # CNT +10%
        ],
        "note": "<CNT Plus: +10%>\n<Guard Efficiency: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Memberikan 10% peluang menangkis serangan fisik dan melancarkan serangan balasan (counter)."
    },
    129: {
        "name": "Will of Iron",
        "traits": [
            {"code": 23, "dataId": 6, "value": 0.80}, # PDR 80%
            {"code": 22, "dataId": 7, "value": 0.02}, # HRG +2%
            {"code": 14, "dataId": 15, "value": 1}   # Fear immunity
        ],
        "note": "<PDR Rate: 80%>\n<HRG Plus: +2%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengurangi kerusakan fisik yang diterima sebesar 20%, regenerasi HP 2% per turn, dan kebal terhadap Fear."
    },
    130: {
        "name": "Agile Footwork",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.15},
            {"code": 22, "dataId": 1, "value": 0.10},
            {"code": 14, "dataId": 12, "value": 1} # Slow immunity
        ],
        "note": "<AGI Rate: 115%>\n<EVA Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan AGI +15%, Evasion Rate +10%, dan kebal terhadap status Slow."
    },
    131: {
        "name": "Mind's Eye",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat berhasil menghindari serangan musuh, memulihkan 4% Max SP dan mendapatkan 10% peluang counter selama 1 turn."
    },
    132: {
        "name": "Feral Instinct",
        "traits": [],
        "note": "<Armor Penetration: 15%>\n<Critical Damage: +30%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan mengabaikan 15% DEF lawan, menambah +30% Critical Damage, dan serangan kritikal memulihkan 3% Max SP."
    },
    133: {
        "name": "Dragon Hunter's Instinct",
        "traits": [],
        "note": "<Boss Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan fisik memberikan +25% ekstra kerusakan terhadap target bertipe Boss atau Dragon."
    },
    134: {
        "name": "Scale Hardening",
        "traits": [
            {"code": 23, "dataId": 6, "value": 0.85},
            {"code": 21, "dataId": 3, "value": 1.10}
        ],
        "note": "<PDR Rate: 85%>\n<DEF Rate: 110%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengurangi kerusakan fisik yang diterima sebesar 15% dan meningkatkan DEF +10%."
    },
    135: {
        "name": "Dragon's Wrath",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.20},
            {"code": 22, "dataId": 2, "value": 0.10}
        ],
        "note": "<ATK Rate: 120%>\n<CRI Plus: +10%>\n<STR Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Fisik (ATK) +20% dan Critical Rate +10%."
    },
    136: {
        "name": "Royal Vanguard Discipline",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.15},
            {"code": 23, "dataId": 1, "value": 1.20}
        ],
        "note": "<DEF Rate: 115%>\n<Guard Efficiency: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan P.DEF +15% dan efisiensi Guard (GRD) sebesar +20%."
    },
    137: {
        "name": "Unrelenting Offense",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.15},
            {"code": 22, "dataId": 0, "value": 0.10}
        ],
        "note": "<ATK Rate: 115%>\n<HIT Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan P.ATK +15% dan akurasi serangan (HIT) +10%."
    },
    138: {
        "name": "Savage Triumph",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Setiap kali mengeliminasi musuh, memulihkan 15% Max HP dan memperoleh buff ATK +10% selama 2 giliran."
    },
    139: {
        "name": "Guardian of Nusvanir",
        "traits": [
            {"code": 21, "dataId": 0, "value": 1.20},
            {"code": 21, "dataId": 3, "value": 1.20},
            {"code": 21, "dataId": 5, "value": 1.20}
        ],
        "note": "<Max HP: +20%>\n<DEF Rate: 120%>\n<MDF Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Max HP, DEF, dan MDF sebesar +20%."
    },
    140: {
        "name": "Guardian's Resonating Vow",
        "traits": [
            {"code": 23, "dataId": 6, "value": 0.90},
            {"code": 23, "dataId": 7, "value": 0.90}
        ],
        "note": "<PDR Rate: 90%>\n<MDR Rate: 90%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Memberikan aura perlindungan bagi seluruh anggota party, mengurangi kerusakan yang diterima sebesar 10%."
    },
    141: {
        "name": "Absolute Fortitude",
        "traits": [
            {"code": 23, "dataId": 6, "value": 0.80},
            {"code": 23, "dataId": 7, "value": 0.80},
            {"code": 14, "dataId": 11, "value": 1}, # Stun
            {"code": 14, "dataId": 7, "value": 1}   # Paralyze
        ],
        "note": "<PDR Rate: 80%>\n<MDR Rate: 80%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengurangi seluruh kerusakan fisik dan sihir sebesar 20%, serta kebal terhadap status Stun dan Paralyze."
    },
    142: {
        "name": "Sang Hyang Blessing",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.20} # REC +20%
        ],
        "note": "<REC Rate: 120%>\n<Holy Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan efisiensi pemulihan sebesar +20% dan kerusakan elemen Cahaya (Holy) sebesar +25%."
    },
    143: {
        "name": "Chi Mastery",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.15}
        ],
        "note": "<AGI Rate: 115%>\n<Max SP: +25>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed +15% dan memperluas kapasitas Max SP sebesar +25."
    },
    144: {
        "name": "Temple Blessing: Four Paths",
        "traits": [
            {"code": 21, "dataId": 2, "value": 1.10},
            {"code": 21, "dataId": 3, "value": 1.10},
            {"code": 21, "dataId": 4, "value": 1.10},
            {"code": 21, "dataId": 5, "value": 1.10}
        ],
        "note": "<ATK Rate: 110%>\n<DEF Rate: 110%>\n<MAT Rate: 110%>\n<MDF Rate: 110%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan seluruh atribut utama (ATK, DEF, MAT, MDF) sebesar +10%."
    },
    145: {
        "name": "Chi Reflex",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.15},
            {"code": 22, "dataId": 3, "value": 0.25}
        ],
        "note": "<EVA Plus: +15%>\n<CNT Plus: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan peluang menghindar (EVA) +15% dan peluang serangan balasan (Counter) +25%."
    },
    146: {
        "name": "Mana Amplification",
        "traits": [
            {"code": 21, "dataId": 1, "value": 1.10},
            {"code": 21, "dataId": 4, "value": 1.10}
        ],
        "note": "<Max MP: +10%>\n<MAT Rate: 110%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kapasitas Max MP +10% dan Serangan Sihir (MAT) +10%."
    },
    147: {
        "name": "Elemental Mastery",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.12}
        ],
        "note": "<MAT Rate: 112%>\n<INT Rate: 1.08>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Sihir (MAT) sebesar +12%."
    },
    148: {
        "name": "Holy Protection",
        "traits": [
            {"code": 21, "dataId": 5, "value": 1.15}
        ],
        "note": "<MDF Rate: 115%>\n<Holy Damage Taken: -20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Pertahanan Magis (MDF) +15% dan mengurangi kerusakan elemen Holy yang diterima sebesar 20%."
    },
    149: {
        "name": "Divine Grace",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.20},
            {"code": 22, "dataId": 8, "value": 0.02}
        ],
        "note": "<REC Rate: 120%>\n<MRG Plus: +2%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan efisiensi pemulihan sebesar +20% dan regenerasi MP otomatis +2% setiap akhir giliran."
    },
    150: {
        "name": "Blood Pact",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15}
        ],
        "note": "<MAT Rate: 115%>\n<Dark Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir berelemen Dark sebesar +15%."
    },
    151: {
        "name": "Soul Harvest",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Menyerap 8% Max HP dan MP target musuh setiap kali berhasil menumbangkan mereka."
    },
    152: {
        "name": "Arcane Elemental Mastery",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15}
        ],
        "note": "<MAT Rate: 115%>\n<INT Rate: 1.10>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan daya hancur seluruh elemen sihir sebesar +15%."
    },
    153: {
        "name": "Ether Conduit",
        "traits": [
            {"code": 23, "dataId": 3, "value": 0.85}, # MCR 85%
            {"code": 21, "dataId": 1, "value": 1.15}
        ],
        "note": "<MCR Rate: 85%>\n<Max MP: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengurangi konsumsi MP seluruh mantra sihir sebesar 15% dan memperluas Max MP +15%."
    },
    154: {
        "name": "Sorcerer's Rigor",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.15},
            {"code": 21, "dataId": 5, "value": 1.15}
        ],
        "note": "<MAT Rate: 115%>\n<MDF Rate: 115%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Serangan Magis (MAT) dan Pertahanan Magis (MDF) sebesar +15%."
    },
    155: {
        "name": "Holy Blessing",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.25},
            {"code": 22, "dataId": 7, "value": 0.02}
        ],
        "note": "<REC Rate: 125%>\n<HRG Plus: +2%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan efisiensi pemulihan mantra +25% dan regenerasi HP alami +2% per turn."
    },
    156: {
        "name": "Devout Resolve",
        "traits": [
            {"code": 21, "dataId": 5, "value": 1.20},
            {"code": 14, "dataId": 16, "value": 1} # Silence immunity
        ],
        "note": "<MDF Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan MDF +20% dan memberikan kekebalan terhadap efek Silence (Pembungkaman mantra)."
    },
    157: {
        "name": "Holy Aura",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat memulihkan kawan, kawan tersebut memperoleh peningkatan DEF & MDF +8% selama 2 giliran."
    },
    158: {
        "name": "Blood Sacrifice Pact",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20},
            {"code": 21, "dataId": 0, "value": 0.90}
        ],
        "note": "<MAT Rate: 120%>\n<Max HP: -10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Mengorbankan 10% Max HP demi memperoleh peningkatan Serangan Magis (MAT) sebesar +20%."
    },
    159: {
        "name": "Jenggala's Vow",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan durasi pemanggilan makhluk Jenggala sebesar +2 giliran dan meningkatkan parameter mereka +15%."
    },
    160: {
        "name": "Abyss Conduit",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20}
        ],
        "note": "<MAT Rate: 120%>\n<Dark Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir elemen Kegelapan (Dark) sebesar +20%."
    },
    161: {
        "name": "Heart of Flame",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20},
            {"code": 14, "dataId": 5, "value": 1} # Burn immunity
        ],
        "note": "<MAT Rate: 120%>\n<Fire Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir Api sebesar +20% dan memberikan kekebalan terhadap luka bakar (Burn)."
    },
    162: {
        "name": "Flame Eater",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat terkena serangan berelemen Api, menyerap kerusakan tersebut dan mengubahnya menjadi bonus daya serang sihir."
    },
    163: {
        "name": "Heart of Tides",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.20}
        ],
        "note": "<MAT Rate: 120%>\n<Water Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir Air sebesar +20%."
    },
    164: {
        "name": "Oceanic Mantle",
        "traits": [
            {"code": 21, "dataId": 5, "value": 1.20}
        ],
        "note": "<MDF Rate: 120%>\n<Water Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Pertahanan Magis (MDF) +20% dan kerusakan elemen Air +15%."
    },
    165: {
        "name": "Heart of Stone",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.15},
            {"code": 21, "dataId": 4, "value": 1.20}
        ],
        "note": "<DEF Rate: 115%>\n<MAT Rate: 120%>\n<Earth Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Pertahanan Fisik +15% dan kerusakan sihir Tanah +20%."
    },
    166: {
        "name": "Earthen Resonance",
        "traits": [],
        "note": "<Armor Penetration: 15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Seluruh mantra elemen Tanah menembus 15% DEF/MDF lawan dan memperkuat daya tahan perisai batu."
    },
    167: {
        "name": "Heart of Gale",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.15},
            {"code": 21, "dataId": 4, "value": 1.20}
        ],
        "note": "<AGI Rate: 115%>\n<MAT Rate: 120%>\n<Wind Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed +15% dan kerusakan sihir Angin +20%."
    },
    168: {
        "name": "Wind Walker",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.15},
            {"code": 21, "dataId": 6, "value": 1.20}
        ],
        "note": "<EVA Plus: +15%>\n<AGI Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Evasion Rate +15% dan Action Speed giliran +20%."
    },
    169: {
        "name": "Lightning Essence",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.20},
            {"code": 21, "dataId": 4, "value": 1.25}
        ],
        "note": "<AGI Rate: 120%>\n<MAT Rate: 125%>\n<Lightning Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed +20% dan kerusakan sihir Petir +25%."
    },
    170: {
        "name": "Conductors",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan petir memiliki 20% peluang menyetrum (Shock) musuh dan melompat ke target tambahan."
    },
    171: {
        "name": "Glacial Core",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.25},
            {"code": 14, "dataId": 13, "value": 1} # Freeze immunity
        ],
        "note": "<MAT Rate: 125%>\n<Ice Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir Es sebesar +25% dan memberikan kekebalan terhadap pembekuan (Freeze)."
    },
    172: {
        "name": "Snow Cloak",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.20}
        ],
        "note": "<EVA Plus: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan peluang menghindar (EVA) sebesar +20% saat badai es aktif."
    },
    173: {
        "name": "Ferrous Dominance",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.15},
            {"code": 21, "dataId": 4, "value": 1.20}
        ],
        "note": "<DEF Rate: 115%>\n<MAT Rate: 120%>\n<Metal Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan DEF +15% dan kerusakan sihir Logam +20%."
    },
    174: {
        "name": "Ironclad Bastion",
        "traits": [
            {"code": 21, "dataId": 3, "value": 1.20},
            {"code": 23, "dataId": 6, "value": 0.90}
        ],
        "note": "<DEF Rate: 120%>\n<PDR Rate: 90%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Pertahanan Fisik (DEF) +20% dan mengurangi kerusakan fisik yang diterima sebesar 10%."
    },
    175: {
        "name": "Sonic Resonance",
        "traits": [
            {"code": 21, "dataId": 4, "value": 1.25},
            {"code": 22, "dataId": 0, "value": 0.10}
        ],
        "note": "<MAT Rate: 125%>\n<HIT Plus: +10%>\n<Sonic Damage: +25%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir Suara +25% dan akurasi serangan (HIT) +10%."
    },
    176: {
        "name": "Active Echolocation",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.15}
        ],
        "note": "<HIT Plus: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan akurasi serangan +15% dan mampu mendeteksi serta menyerang musuh dalam status Stealth."
    },
    177: {
        "name": "Sacred Consecration",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.20},
            {"code": 14, "dataId": 10, "value": 1} # Curse immunity
        ],
        "note": "<REC Rate: 120%>\n<Holy Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan efisiensi penyembuhan +20%, kerusakan elemen Holy +15%, dan kebal terhadap kutukan (Curse)."
    },
    178: {
        "name": "Divine Gift",
        "traits": [
            {"code": 23, "dataId": 2, "value": 1.20},
            {"code": 14, "dataId": 16, "value": 1} # Silence immunity
        ],
        "note": "<REC Rate: 120%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Efisiensi skill pemulihan +20%, konsumsi SP mantra -10%, serta kebal terhadap status Silence."
    },
    179: {
        "name": "Holy Barrier",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat ada anggota party yang HP-nya turun di bawah 30%, otomatis memberikan perisai suci sebesar 20% Max HP."
    },
    180: {
        "name": "Martyr's Faith",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Sekali per pertempuran, saat menerima serangan fatal, bertahan hidup dengan 1 HP dan mendapatkan kekebalan kerusakan selama 1 giliran."
    },
    188: {
        "name": "Necrotic Mastery",
        "traits": [
            {"code": 21, "dataId": 1, "value": 1.10},
            {"code": 21, "dataId": 4, "value": 1.15}
        ],
        "note": "<Max MP: +10%>\n<MAT Rate: 115%>\n<Dark Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan sihir Dark +15%, Max MP +10%, dan mengurangi konsumsi pemanggilan minion."
    },
    190: {
        "name": "Eagle Eye",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.12},
            {"code": 22, "dataId": 2, "value": 0.04}
        ],
        "note": "<HIT Plus: +12%>\n<CRI Plus: +4%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Akurasi Serangan (HIT) sebesar +12% dan Peluang Kritikal (CRI) sebesar +4%."
    },
    191: {
        "name": "Swift Reflexes",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.12},
            {"code": 22, "dataId": 1, "value": 0.08}
        ],
        "note": "<AGI Rate: 112%>\n<EVA Plus: +8%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed (AGI) sebesar +12% dan Peluang Menghindar (EVA) sebesar +8%."
    },
    192: {
        "name": "Shadow Step",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.12},
            {"code": 22, "dataId": 2, "value": 0.04}
        ],
        "note": "<EVA Plus: +12%>\n<CRI Plus: +4%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Evasion Rate +12% dan Critical Rate +4%."
    },
    193: {
        "name": "Shadow Reflexes",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.15}
        ],
        "note": "<AGI Rate: 115%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Action Speed (AGI) sebesar +15%."
    },
    194: {
        "name": "Wild Stride",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.12},
            {"code": 22, "dataId": 1, "value": 0.10}
        ],
        "note": "<AGI Rate: 112%>\n<EVA Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan AGI +12% dan Evasion Rate di medan liar sebesar +10%."
    },
    195: {
        "name": "Hunter's Focus",
        "traits": [
            {"code": 22, "dataId": 2, "value": 0.08}
        ],
        "note": "<CRI Plus: +8%>\n<Marked Damage: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Critical Rate +8% dan serangan menghasilkan +10% ekstra damage terhadap target bertanda (Marked)."
    },
    196: {
        "name": "Lupine Companion",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Memanggil serigala pendamping (Lupine) untuk bertarung bersama petualang."
    },
    197: {
        "name": "Multi-Shot Mastery",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Seluruh jurus multi-tembakan menghasilkan +10% total damage tambahan."
    },
    198: {
        "name": "Twin Blade Mastery",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan kerusakan serangan dwisenjata (Dual-Wield) sebesar +10%."
    },
    199: {
        "name": "Sadistic Executioner",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Memberikan +15% kerusakan ekstra terhadap musuh yang memiliki sisa HP di bawah 40%."
    },
    200: {
        "name": "Shadow Ambush",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan pertama pada musuh yang belum bersiaga menghasilkan bonus kerusakan +20%."
    },
    201: {
        "name": "Illusive Demise",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.15}
        ],
        "note": "<EVA Plus: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Evasion Rate +15% dan sekali per battle mampu bertahan dengan 1 HP saat menerima serangan maut."
    },
    202: {
        "name": "Marksman Instinct",
        "traits": [
            {"code": 22, "dataId": 0, "value": 0.10}
        ],
        "note": "<HIT Plus: +10%>\n<Marked Damage: +8%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Target pertama yang terkena serangan otomatis menjadi Marked selama 3 turn; akurasi HIT +10%."
    },
    203: {
        "name": "Lupine Ride",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.20},
            {"code": 22, "dataId": 1, "value": 0.10}
        ],
        "note": "<AGI Rate: 120%>\n<EVA Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Saat menunggangi Lupine, memperoleh bonus AGI +20% dan EVA +10%."
    },
    204: {
        "name": "Ambush Mastery",
        "traits": [],
        "note": "<Armor Penetration: 10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Memberikan +10% damage dan mengabaikan 10% DEF terhadap target yang belum sempat bertindak."
    },
    205: {
        "name": "Cold-Blooded Executioner",
        "traits": [],
        "note": "<Critical Damage: +20%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Critical Damage (CDMG) sebesar +20% dan +8% ekstra damage pada target di bawah 30% HP."
    },
    206: {
        "name": "Phantom Thread",
        "traits": [
            {"code": 22, "dataId": 1, "value": 0.15}
        ],
        "note": "<EVA Plus: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Evasion Rate sebesar +15% dan serangan dari belakang menghasilkan +15% damage."
    },
    207: {
        "name": "Shadow Mark",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan berpeluang menempelkan Shadow Mark (maksimal 3 tumpuk); tiap tumpukan meningkatkan kerusakan Assassin sebesar +4%."
    },
    208: {
        "name": "Toxic Coating",
        "traits": [],
        "note": "<Poison Damage: +15%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Serangan senjata tajam berpeluang 30% meracuni musuh (Poison) dan kerusakan racun meningkat +15%."
    },
    209: {
        "name": "Phantom Executioner",
        "traits": [],
        "note": "<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Menghasilkan +20% ekstra kerusakan pada lawan berdarah di bawah 35% HP."
    },
    210: {
        "name": "Silent Killer",
        "traits": [
            {"code": 22, "dataId": 2, "value": 0.10}
        ],
        "note": "<CRI Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKeahlian pasif: Meningkatkan Critical Rate sebesar +10% dan serangan pada target terbungkam (Silenced) dipastikan kritikal."
    },
    211: {
        "name": "Iron Skin",
        "traits": [
            {"code": 21, "dataId": 0, "value": 1.05},
            {"code": 21, "dataId": 3, "value": 1.10}
        ],
        "note": "<Max HP: +5%>\n<DEF Rate: 110%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKetahanan fisik dasar petarung garis depan: Meningkatkan Max HP +5% dan Pertahanan Fisik +10%."
    },
    212: {
        "name": "Mind Focus",
        "traits": [
            {"code": 21, "dataId": 1, "value": 1.10},
            {"code": 22, "dataId": 8, "value": 0.02}
        ],
        "note": "<Max MP: +10%>\n<MRG Plus: +2%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nLatihan meditasi dasar: Meningkatkan Max MP +10% dan regenerasi MP per giliran +2%."
    },
    213: {
        "name": "Fleet Footed",
        "traits": [
            {"code": 21, "dataId": 6, "value": 1.05},
            {"code": 22, "dataId": 1, "value": 0.10}
        ],
        "note": "<AGI Rate: 105%>\n<EVA Plus: +10%>\n<Passive>\n[IMPLEMENTATION] Plugin\n[PLUGIN] YEP_AutoPassiveStates\nKelincahan gerak alami: Meningkatkan Action Speed +5% dan Evasion Rate +10%."
    }
}

def apply_to_project(proj_dir):
    data_dir = proj_dir / "data"
    states_path = data_dir / "States.json"

    if not states_path.exists():
        print(f"Skipping {proj_dir}: States.json not found")
        return

    with open(states_path, "r", encoding="utf-8") as f:
        states = json.load(f)

    updated_count = 0
    for sid, cfg in SKILL_PASSIVES_CONFIG.items():
        if sid < len(states) and states[sid]:
            st = states[sid]
            st["name"] = cfg["name"]
            st["traits"] = cfg["traits"]
            st["note"] = cfg["note"]
            st["autoRemovalTiming"] = 0
            st["minTurns"] = 1
            st["maxTurns"] = 1
            st["removeAtBattleEnd"] = False
            st["removeByRestriction"] = False
            st["removeByDamage"] = False
            st["removeByWalking"] = False
            updated_count += 1

    with open(states_path, "w", encoding="utf-8") as f:
        json.dump(states, f, indent=2, ensure_ascii=False)

    print(f"Successfully standardized {updated_count} skill passive states in {proj_dir}!")

def main():
    for p in PROJECT_DIRS:
        apply_to_project(p)

if __name__ == "__main__":
    main()

