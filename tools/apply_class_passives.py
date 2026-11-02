#!/usr/bin/env python3
"""
tools/apply_class_passives.py
Injects Class Ability (Innate Class Passive) notetags into data/Classes.json for all 50 classes.
Tags format:
<Class Ability: [Name]>
<Class Ability Description>
[Description]
</Class Ability Description>
"""

import json
import re

CLASS_PASSIVES = {
    1: {
        "ability": "Battle Spirit",
        "desc": "Meningkatkan P.ATK sebesar +8%. Saat HP berada di bawah 50%, memulihkan +2 SP ekstra pada setiap awal giliran."
    },
    2: {
        "ability": "Heavy Impact",
        "desc": "Meningkatkan P.ATK sebesar +12% dan mengabaikan 10% DEF target. Serangan fisik memiliki 5% peluang menyebabkan Stun."
    },
    3: {
        "ability": "Vanguard Aegis",
        "desc": "Meningkatkan P.DEF sebesar +15% dan efisiensi Guard (GRD +20%). Saat berada di Baris Depan, mengurangi kerusakan fisik yang diterima kawan baris belakang sebesar 5%."
    },
    4: {
        "ability": "Rhythm Striker",
        "desc": "Meningkatkan Action Speed sebesar +15%. Setiap kali melancarkan skill fisik, memulihkan +5 SP secara instan."
    },
    5: {
        "ability": "Veteran Resolve",
        "desc": "Meningkatkan P.ATK +15% dan menembus 15% DEF musuh. Setiap kali menumbangkan musuh, memulihkan 15% Max HP dan mendapat buff ATK +10% selama 2 giliran."
    },
    6: {
        "ability": "Fortress Bastion",
        "desc": "Meningkatkan P.DEF & M.MDF +20%, serta efisiensi Guard (GRD +25%). Otomatis menahan 30% kerusakan yang mengarah ke kawan dengan sisa HP terendah."
    },
    7: {
        "ability": "Flowing Stance",
        "desc": "Action Speed +20% dan memulihkan +8 SP tiap serangan fisik. Jika menyerang 2 giliran berturut-turut, serangan berikutnya dipastikan 100% Critical Hit."
    },
    8: {
        "ability": "Unyielding Dominance",
        "desc": "P.ATK +20% dan kebal terhadap efek Stun & Knockdown. Kerusakan fisik meningkat hingga +30% seiring berkurangnya sisa target musuh di arena."
    },
    9: {
        "ability": "Dragonfang Skystrike",
        "desc": "Kerusakan jurus lompat dan tombak +25% serta mengabaikan 20% DEF. Serangan dari udara menghasilkan gelombang kejut berdaya rusak area (AoE)."
    },
    10: {
        "ability": "Aegis of Sanctuary",
        "desc": "P.DEF & M.MDF +25%. Seluruh sekutu di baris yang sama menerima pengurangan kerusakan 15% dan kebal terhadap status Fear & Blind."
    },
    11: {
        "ability": "Asura Meridian",
        "desc": "Serangan fisik tanpa senjata mendapatkan bonus P.ATK +25% dan CRI +15%. Serangan kritis memiliki 20% peluang menyegel skill lawan (Silence) selama 1 turn."
    },
    12: {
        "ability": "Bloodrage Immortality",
        "desc": "Saat HP di bawah 30%, P.ATK +50% dan CDMG +40%. Karakter tidak dapat gugur (kebal kematian mutlak) selama 1 giliran saat HP menyentuh angka 1."
    },
    13: {
        "ability": "Abyssal Despair",
        "desc": "P.DEF & M.MDF +30%. Aura kegelapan mengurangi ATK & MAT seluruh lawan sebesar 15%; menyerap 20% dari seluruh kerusakan yang dihasilkan sebagai HP."
    },
    14: {
        "ability": "Aegis of Radiance",
        "desc": "Menahan 50% kerusakan yang mengarah ke seluruh anggota party. Serangan suci memulihkan HP party sebesar 20% dari total kerusakan yang ditimpakan."
    },
    15: {
        "ability": "Meridian Annihilation",
        "desc": "Action Speed +35% dan seluruh serangan fisik menembus 40% DEF lawan. Setiap serangan beruntun meningkatkan output kerusakan sebesar +15% tanpa batas."
    },
    16: {
        "ability": "Celestial Skystrike",
        "desc": "Kerusakan jurus udara +50%. Menghujamkan badai langit ke seluruh arena pada giliran pertama, menyebabkan Stun dan menurunkan DEF musuh sebesar 25%."
    },
    17: {
        "ability": "Mana Attunement",
        "desc": "Meningkatkan M.ATK sebesar +8% dan mengurangi konsumsi MP seluruh mantra sihir sebesar 10%."
    },
    18: {
        "ability": "Elemental Overload",
        "desc": "Meningkatkan M.ATK sebesar +15%. Serangan yang mengenai kelemahan elemen musuh menghasilkan tambahan kerusakan sebesar +25%."
    },
    19: {
        "ability": "Divine Grace",
        "desc": "Meningkatkan efektivitas skill penyembuhan sebesar +20% (Recovery Effect), serta memulihkan 2% Max MP otomatis setiap akhir giliran."
    },
    20: {
        "ability": "Nether Siphon",
        "desc": "Kerusakan sihir berelemen Dark meningkat +15%. Menyerap 5% Max HP musuh setiap kali berhasil menimpakan status buruk (Debuff / Poison / Curse)."
    },
    21: {
        "ability": "Arcane Amplification",
        "desc": "Meningkatkan M.ATK +20%. Setiap kali melancarkan mantra sihir, meningkatkan kerusakan sihir elemen berikutnya sebesar +10% (dapat ditumpuk hingga 3 lapis / +30%)."
    },
    22: {
        "ability": "Sanctified Aura",
        "desc": "Efektivitas pemulihan (Recovery Effect) +25%. Seluruh anggota party menerima regenerasi HP otomatis sebesar 3% Max HP tiap giliran dan kebal efek Curse."
    },
    23: {
        "ability": "Soul Harvester",
        "desc": "Kerusakan sihir Dark +20%. Setiap kali ada unit yang tumbang di medan tempur (kawan maupun lawan), menyerap 10% MP & SP mereka untuk memperkuat mantra berikutnya."
    },
    24: {
        "ability": "Blazing Conflagration",
        "desc": "Kerusakan sihir Api +25%. Musuh yang terkena Burn menerima kerusakan bertingkat dan menyebarkan kobaran api ke musuh di sekitarnya saat terkena hit."
    },
    25: {
        "ability": "Tidal Resonance",
        "desc": "Kerusakan sihir Air +25%. Setiap kali mantra mengenai target basah (Soaked), memulihkan 5% Max MP dan meningkatkan pertahanan MDF +20% selama 2 turn."
    },
    26: {
        "ability": "Tectonic Bulwark",
        "desc": "Kerusakan sihir Tanah +25%. Menghasilkan perisai batu (Shield) sebesar 15% Max HP setiap kali melancarkan skill berelemen Earth."
    },
    27: {
        "ability": "Tempest Grace",
        "desc": "Kerusakan sihir Angin +25% dan EVA +15%. Kecepatan gerak bertindak meningkat drastis; memiliki 20% peluang bertindak dua kali dalam satu giliran."
    },
    28: {
        "ability": "High-Voltage Surge",
        "desc": "Kerusakan sihir Petir +25%. Serangan petir memiliki 25% peluang memicu loncatan listrik (Chain Lightning) ke 2 target musuh lain di sekitarnya."
    },
    29: {
        "ability": "Glacial Subzero",
        "desc": "Kerusakan sihir Es +25%. Serangan sihir es menembus 25% MDF dan memperlambat AGI musuh sebesar 20%; musuh beku (Freeze) menerima +35% shatter damage."
    },
    30: {
        "ability": "Magnetic Polarization",
        "desc": "Kerusakan sihir Logam +25% dan P.DEF +20%. Mengalihkan proyektil fisik musuh dan mengubah 10% damage yang diterima menjadi amunisi pecahan besi pembalas."
    },
    31: {
        "ability": "Resonance Fracture",
        "desc": "Kerusakan sihir Suara +25%. Mengabaikan seluruh DEF & MDF musuh bertipe armor berat/batu; getaran suara memiliki peluang 25% membatalkan charge skill musuh."
    },
    32: {
        "ability": "Grace of Rebirth",
        "desc": "Efektivitas pemulihan +30%. Anggota party yang gugur dapat dibangkitkan otomatis 1x per battle dengan 30% Max HP tanpa menghabiskan item."
    },
    33: {
        "ability": "Grave Mastery",
        "desc": "Kerusakan kutukan & racun +25%. Setiap kali musuh gugur, otomatis membangkitkan satu minion mayat hidup untuk menyerang dan menyerap damage party."
    },
    34: {
        "ability": "Archon Dual-Cast",
        "desc": "M.ATK +35%. Setiap melancarkan sihir offensive, memiliki 30% peluang untuk melancarkan mantra sihir tersebut sekali lagi secara instan tanpa konsumsi MP tambahan."
    },
    35: {
        "ability": "Supreme Miracle",
        "desc": "Seluruh mantra pemulihan menyembuhkan 50% lebih besar dan memberi perisai suci sebesar 20% Max HP; memberikan kekebalan total terhadap seluruh status debuff."
    },
    36: {
        "ability": "Calamity Singularity",
        "desc": "Setiap efek status buruk (Debuff / Poison / Burn / Curse) pada lawan melipatgandakan seluruh damage sihir Warlock sebesar +10% per status (maksimal +50%)."
    },
    37: {
        "ability": "Ancestral Dominion",
        "desc": "Memanggil roh leluhur primal yang memberikan regenerasi HP, MP, dan SP sebesar 5% setiap giliran kepada seluruh anggota tim dan kebal terhadap elemen api dan petir."
    },
    38: {
        "ability": "Primordial Dragon Awakening",
        "desc": "M.ATK +35% dan P.ATK +25%. Mengubah seluruh serangan menjadi berelemen Dragon Flame yang menembus 30% MDF dan mengabaikan resistensi elemen musuh."
    },
    39: {
        "ability": "Swift Ambush",
        "desc": "Meningkatkan EVA +5% dan HIT +5%. Karakter selalu mendapatkan prioritas giliran bertindak paling awal pada giliran pertama pertempuran."
    },
    40: {
        "ability": "Eagle Eye",
        "desc": "Meningkatkan HIT +10% (serangan fisik tidak dapat meleset pada musuh terbang). Serangan dari Baris Belakang mendapatkan bonus +15% Critical Damage (CDMG)."
    },
    41: {
        "ability": "Shadow Celerity",
        "desc": "Meningkatkan peluang serangan kritis (CRI +8%). Serangan kritikal memiliki 15% peluang mencuri item atau uang otomatis dan menambah +10 SP."
    },
    42: {
        "ability": "Predator Instinct",
        "desc": "Akurasi HIT +15% dan CDMG +20%. Memberikan bonus +25% damage terhadap musuh bertipe Beast/Monster atau musuh yang terkena status Slow/Bleed."
    },
    43: {
        "ability": "Lethal Ambush",
        "desc": "Peluang Kritis (CRI +12%) dan Evasion (EVA +10%). Serangan terhadap musuh yang belum sempat bertindak di ronde tersebut menghasilkan 100% Kritis Mutlak."
    },
    44: {
        "ability": "Deadly Piercing",
        "desc": "Jarak serang tak terbatas, HIT +25%, dan mengabaikan 30% DEF. Serangan dari Baris Belakang pada target ber-HP di atas 80% menghasilkan bonus +40% CDMG."
    },
    45: {
        "ability": "Viper Assassination",
        "desc": "CRI +20% dan CDMG +30%. Serangan dari bayangan memiliki peluang 10% mengeksekusi musuh non-boss secara instan jika HP mereka di bawah 30%."
    },
    46: {
        "ability": "Behemoth Packbond",
        "desc": "Meningkatkan seluruh parameter sekutu dan hewan panggilan sebesar +25%. Setiap serangan kawan memicu serangan susulan instan dari Beastmaster."
    },
    47: {
        "ability": "Eclipse Phantom",
        "desc": "EVA +25% dan CRI +25%. Karakter selalu bergerak dalam mode bayangan; serangan tidak dapat ditangkis atau dihindari oleh musuh (100% Unavoidable)."
    },
    48: {
        "ability": "Sonic Tempest",
        "desc": "Action Speed +50% dan selalu bertindak pertama di tiap giliran. Setiap langkah gerakan meningkatkan akurasi dan menambah serangan ganda pada target musuh."
    },
    49: {
        "ability": "Temporal Overwrite",
        "desc": "Memiliki 15% peluang membatalkan giliran musuh secara instan. Saat menerima serangan mematikan, waktu berputar balik: HP dan MP kembali ke giliran sebelumnya (1x per battle)."
    },
    50: {
        "ability": "Entropy Collapse",
        "desc": "Seluruh serangan mengabaikan 100% DEF & MDF lawan secara mutlak. Serangan menghanguskan 5% Max MP & SP musuh secara permanen pada setiap giliran pertempuran."
    }
}

def update_class_note(note, ability_name, ability_desc):
    note = note or ""
    
    # Strip any existing Class Ability tags
    note = re.sub(r'<Class Ability:\s*.*?>\n?', '', note, flags=re.IGNORECASE)
    note = re.sub(r'<Class Ability Desc:\s*.*?>\n?', '', note, flags=re.IGNORECASE)
    note = re.sub(r'<Class Ability Description>[\s\S]*?</Class Ability Description>\n?', '', note, flags=re.IGNORECASE)
    note = note.strip()
    
    new_tags = (
        f"<Class Ability: {ability_name}>\n"
        f"<Class Ability Description>\n{ability_desc}\n</Class Ability Description>"
    )
    
    # Place right after <Class Description> block if present, or at top
    desc_match = re.search(r'(</Class Description>)', note, flags=re.IGNORECASE)
    if desc_match:
        end_idx = desc_match.end()
        note = note[:end_idx] + "\n" + new_tags + "\n" + note[end_idx:].lstrip()
    else:
        note = new_tags + "\n\n" + note
        
    return note.strip()

def main():
    path = "data/Classes.json"
    with open(path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    updated_count = 0
    for c in classes:
        if not c:
            continue
        cid = c.get("id")
        if cid in CLASS_PASSIVES:
            p = CLASS_PASSIVES[cid]
            c["note"] = update_class_note(c.get("note", ""), p["ability"], p["desc"])
            updated_count += 1
            print(f"Updated #{cid} {c.get('name')}: {p['ability']}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully applied Class Passives to {updated_count} classes in {path}!")

if __name__ == "__main__":
    main()

