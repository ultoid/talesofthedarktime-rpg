# Data definitions for Fighter Lineage (16 classes)

def get_fighter_skills(start_id):
    # Returns list of skill dicts and dict of class learnings
    # Classes: 1 to 16
    sid = start_id
    skills = []
    learnings = {i: [] for i in range(1, 17)}

    def add(class_id, level, name, stype, mp, tp, scope, anim, icon, formula, elem, desc, state=None, state_ch=1.0, hp_cost=0, repeats=1, is_heal=False):
        nonlocal sid
        effs = []
        if state:
            effs.append({"code": 21, "dataId": state, "value1": state_ch, "value2": 0})
        
        dmg_type = 3 if is_heal else (1 if formula != '0' else 0)
        note = f"<HP Cost: {hp_cost}%>" if hp_cost > 0 else ""
        
        s = {
            "id": sid,
            "animationId": anim,
            "damage": {"critical": True if dmg_type == 1 else False, "elementId": elem, "formula": formula, "type": dmg_type, "variance": 15},
            "description": desc,
            "effects": effs,
            "hitType": 1 if dmg_type == 1 and elem <= 1 else 0,
            "iconIndex": icon,
            "message1": " melancarkan ",
            "message2": "!",
            "mpCost": mp,
            "name": name,
            "note": note,
            "occasion": 0,
            "repeats": repeats,
            "requiredWtypeId1": 0,
            "requiredWtypeId2": 0,
            "scope": scope,
            "speed": 0,
            "stypeId": stype,
            "successRate": 100,
            "tpCost": tp,
            "tpGain": 0
        }
        skills.append(s)
        learnings[class_id].append({"level": level, "note": "", "skillId": sid})
        sid += 1

    # [01] Fighter (Tier 1)
    add(1, 1, "Power Strike", 3, 0, 12, 1, 6, 76, "a.atk * 1.5 - b.def * 0.5", 1, "Hantaman pedang dasar berdaya serang fisik tinggi.")
    add(1, 3, "Battle Cry", 3, 0, 10, 11, 37, 82, "0", 0, "Memicu teriakan tempur: Meningkatkan ATK sebesar 20% selama 3 turn.")
    add(1, 5, "Wide Slash", 3, 0, 15, 2, 38, 77, "a.atk * 1.1 - b.def * 0.5", 1, "Ayunan melingkar menghantam seluruh musuh.")
    add(1, 7, "Sunder Armor", 3, 0, 14, 1, 6, 77, "a.atk * 1.2 - b.def * 0.2", 1, "Menghancurkan zirah musuh -> Mengakibatkan Vulnerable (Damage +30%).", state=18)

    # [02] Warrior (Tier 2)
    add(2, 1, "Heavy Impact", 3, 0, 18, 1, 6, 76, "a.atk * 2.0 - b.def * 0.4", 1, "Tebasan menghujam bumi berdaya rusak masif.")
    add(2, 5, "War Howl", 3, 0, 16, 11, 37, 82, "0", 0, "Raungan tempur: Meningkatkan ATK dan DEF sebesar 15% (3 turn).")
    add(2, 10, "Whirlwind Sweep", 3, 0, 22, 2, 38, 77, "a.atk * 1.5 - b.def * 0.4", 1, "Putaran pedang beruntun menghantam seluruh musuh.")
    add(2, 18, "Shield Breaker", 3, 0, 20, 1, 23, 77, "a.atk * 1.6 - b.def * 0.1", 1, "Menghantam tameng musuh -> Mengakibatkan Vulnerable.", state=18)

    # [05] Mercenary (Tier 3)
    add(5, 1, "Brutal Cleave", 3, 0, 26, 1, 6, 76, "a.atk * 2.6 - b.def * 0.3", 1, "Tebasan brutal senjata berbilah -> Mengakibatkan Bleed (Pendarahan).", state=6)
    add(5, 6, "Bloodlust Rage", 3, 0, 22, 11, 37, 82, "0", 0, "Memasuki amarah tempur: Lifesteal memulihkan 15% damage dealt.")
    add(5, 12, "Cyclone Rupture", 3, 0, 30, 2, 38, 77, "a.atk * 2.0 - b.def * 0.3", 1, "Tebasan topan melukai seluruh musuh -> Mengakibatkan Bleed.", state=6)
    add(5, 22, "Bone Crusher", 3, 0, 28, 1, 24, 77, "a.atk * 2.2 - b.def * 0.1", 1, "Menghancurkan tulang pelindung musuh -> Mengakibatkan Vulnerable.", state=18)

    # [08] Champion (Tier 4)
    add(8, 1, "Sovereign Execution", 3, 0, 36, 1, 24, 76, "a.atk * 3.4 - b.def * 0.2", 1, "Tebasan algojo kerajaan berdaya hancur dahsyat.")
    add(8, 6, "King's Dominion", 3, 0, 30, 11, 37, 82, "0", 0, "Wibawa sang raja: Meningkatkan ATK & DEF party sebesar 20% (3 turn).")
    add(8, 25, "Kingdom's Wrath", 3, 0, 42, 2, 38, 77, "a.atk * 2.8 - b.def * 0.2", 1, "Tebasan badai kerajaan menghancurkan seluruh barisan musuh.")
    add(8, 35, "Colossus Shatter", 3, 0, 38, 1, 25, 77, "a.atk * 2.8 - b.def * 0.1", 1, "Menembus 50% DEF musuh -> Mengakibatkan Vulnerable.", state=18)
    add(8, 15, "Mandala Execution", 5, 0, 55, 1, 25, 80, "a.atk * 5.0 - b.def * 0.1", 1, "Ultimate: Tebasan penghakiman mandala dengan garansi Critical.")

    # [12] Berserker (Tier 5)
    add(12, 1, "Oblivion Guillotine", 3, 0, 48, 1, 25, 76, "a.atk * 4.2 - b.def * 0.1", 1, "Tebasan pemenggal maut mengabaikan 30% DEF lawan.")
    add(12, 8, "Berserker Frenzy", 3, 0, 25, 11, 37, 82, "0", 0, "Pengorbanan darah: Korbankan 20% HP -> ATK +50% selama 3 turn.", hp_cost=20)
    add(12, 32, "Armor Sundering", 3, 0, 45, 1, 24, 77, "a.atk * 3.2 - b.def * 0.05", 1, "Meremukkan total zirah musuh -> Mengakibatkan Vulnerable.", state=18)
    add(12, 45, "Cataclysm Tempest", 3, 0, 52, 2, 38, 77, "a.atk * 3.6 - b.def * 0.1", 1, "Badai kapak kehancuran menyapu seluruh medan laga.")
    add(12, 20, "Ragnarok World-Breaker", 5, 0, 60, 2, 25, 80, "a.atk * 5.5 - b.def * 0.05", 1, "Ultimate: Hantaman akhir dunia pembelah cakrawala.")

    # [03] Squire (Tier 2)
    add(3, 1, "Heavy Shield Slam", 3, 0, 18, 1, 39, 81, "(a.atk * 0.7 + a.def * 1.0) - b.def * 0.4", 1, "Hantaman perisai berat skala DEF -> Mengakibatkan Stun.", state=11)
    add(3, 5, "Challenging Roar", 3, 0, 15, 2, 37, 82, "0", 0, "Tantangan perang -> Mengakibatkan Taunt (Agro) ke seluruh musuh.", state=20)
    add(3, 10, "Shield Wall", 3, 0, 20, 8, 40, 81, "0", 0, "Dinding tameng: Mengurangi damage fisik yang diterima party -30%.")
    add(3, 18, "Intercept", 3, 0, 16, 7, 40, 81, "0", 0, "Pasang badan: Melindungi kawan sekarat dan menerima 50% damage-nya.")

    # [06] Knight (Tier 3)
    add(6, 1, "Bastion Impact", 3, 0, 26, 1, 39, 81, "(a.atk * 0.8 + a.def * 1.5) - b.def * 0.3", 1, "Hantaman benteng tameng skala DEF tinggi -> Mengakibatkan Stun.", state=11)
    add(6, 6, "Knight's Challenge", 3, 0, 22, 2, 37, 82, "0", 0, "Provokasi ksatria: Mengunci seluruh musuh (Taunt) + Self DEF +25%.", state=20)
    add(6, 12, "Knight's Aegis", 3, 0, 28, 8, 40, 81, "0", 0, "Perisai ksatria: Mengurangi seluruh damage diterima party -35%.")
    add(6, 22, "Vanguard Intercept", 3, 0, 24, 7, 40, 81, "0", 0, "Pengalihan perlindungan: Mengalihkan serangan kawan + 30% Counter.")

    # [10] Paladin (Tier 4)
    add(10, 1, "Aegis Smite", 3, 10, 30, 1, 91, 81, "(a.atk * 0.9 + a.def * 1.8) - b.def * 0.2", 10, "Hantaman suci tameng cahaya -> Mengakibatkan Stun.", state=11)
    add(10, 6, "Divine Provocation", 3, 15, 20, 2, 91, 82, "0", 10, "Provokasi ilahi: Taunt seluruh musuh + Party menerima damage -20%.", state=20)
    add(10, 25, "Bulwark of Light", 3, 25, 0, 8, 93, 81, "0", 10, "Kubah cahaya suci: Melindungi seluruh party dari bahaya maut.")
    add(10, 35, "Aegis Retribution", 3, 15, 25, 11, 40, 81, "0", 10, "Pembalasan perisai: Memantulkan 30% damage fisik kembali ke musuh.")
    add(10, 15, "Garuda's Judgment", 5, 30, 50, 2, 93, 80, "(a.def + a.mdf) * 3.5", 10, "Ultimate: Sayap Garuda memayungi party, imun damage 1 turn + heal.")

    # [14] Holy Knight (Tier 5)
    add(14, 1, "Divine Judgement Strike", 3, 20, 35, 1, 91, 76, "(a.atk * 1.5 + a.def * 2.0) - b.def * 0.1", 10, "Tebasan cahaya penghakiman suci mutlak.")
    add(14, 8, "Holy Citadel Challenge", 3, 25, 25, 2, 93, 82, "0", 10, "Benteng suci abadi: Mengunci seluruh agro musuh + Regen HP party.", state=20)
    add(14, 32, "Divine Sanctuary", 3, 35, 20, 8, 93, 81, "0", 10, "Kuil perlindungan ilahi: Party menerima damage -50% (2 turn).")
    add(14, 45, "Guardian Vow of Light", 3, 20, 30, 7, 91, 81, "0", 10, "Sumpah penjaga: Menyelamatkan kawan sekarat dari kematian.")
    add(14, 20, "Avatar of Light Fortress", 5, 40, 55, 8, 93, 80, "(a.def + a.mdf) * 4.5", 10, "Ultimate: Menjelma menjadi benteng cahaya absolut tak tertembus.")

    # [13] Death Knight (Tier 5)
    add(13, 1, "Abyssal Smite", 3, 20, 35, 1, 96, 76, "a.atk * 3.5 - b.def * 0.1", 11, "Tebasan kegelapan abadi menguras darah lawan.")
    add(13, 8, "Dread Provocation", 3, 20, 25, 2, 96, 82, "0", 11, "Aura teror jurang: Taunt seluruh musuh + Kurangi ATK musuh -20%.", state=20)
    add(13, 32, "Dark Bastion", 3, 30, 20, 11, 98, 81, "0", 11, "Benteng kegelapan: Menyerap 40% incoming damage menjadi HP.")
    add(13, 45, "Soul Harvest Strike", 3, 25, 30, 1, 101, 76, "a.atk * 3.0 - b.def * 0.2", 11, "Memanen jiwa musuh: Memulihkan 50% damage dealt menjadi HP.")
    add(13, 20, "Apocalypse Unholy Wall", 5, 45, 55, 2, 98, 80, "a.atk * 4.8 - b.def * 0.05", 11, "Ultimate: Tembok keputusasaan menelan seisi medan pertempuran.")

    # [09] Dragoon (Tier 4)
    add(9, 1, "Dragon Leap", 3, 0, 30, 1, 11, 76, "a.atk * 3.0 - b.def * 0.2", 1, "Melompat tinggi ke angkasa lalu menghujam dengan tombak naga.")
    add(9, 6, "Draconic Thrust", 3, 0, 24, 1, 11, 76, "a.atk * 2.4 - b.def * 0.1", 1, "Tikaman tombak naga menembus 35% DEF target.")
    add(9, 25, "Dragon Scale Guard", 3, 0, 20, 11, 40, 81, "0", 0, "Sisik pelindung naga: Kebal efek status buruk + DEF +30%.")
    add(9, 35, "Wyvern Dive", 3, 0, 38, 2, 38, 76, "a.atk * 2.5 - b.def * 0.2", 1, "Hantaman menyelam dari langit menyapu seluruh musuh.")
    add(9, 15, "Dragon King Roar", 5, 0, 50, 2, 32, 80, "a.atk * 4.5 - b.def * 0.1", 2, "Ultimate: Raungan naga purba membakar seisi ruangan.")

    # [16] Sky Sovereign (Tier 5)
    add(16, 1, "Celestial Skystrike", 3, 0, 45, 1, 26, 76, "a.atk * 4.2 - b.def * 0.1", 5, "Tikaman tombak cakrawala dari atas awan.")
    add(16, 8, "Gale Impalement", 3, 0, 38, 1, 11, 76, "a.atk * 3.4 - b.def * 0.05", 5, "Hembusan badai menusuk menembus 50% DEF lawan.")
    add(16, 32, "Sovereign Dive", 3, 0, 50, 2, 38, 76, "a.atk * 3.5 - b.def * 0.15", 5, "Menukik dari langit laksana petir menyapu seluruh musuh.")
    add(16, 45, "Dragon King Awakening", 3, 0, 35, 11, 37, 82, "0", 0, "Kebangkitan raja langit: Kecepatan (AGI) +40% dan Critical +30%.")
    add(16, 20, "Heavenly Dragon Descent", 5, 0, 60, 2, 88, 80, "a.atk * 5.8 - b.def * 0.05", 5, "Ultimate: Turunnya naga kayangan meremukkan daratan.")

    # [04] Brawler (Tier 2)
    add(4, 1, "Flurry Punches", 3, 0, 18, 1, 1, 76, "(a.atk * 0.7 - b.def * 0.1) * 3", 1, "3 rentetan pukulan cepat beruntun.", repeats=3)
    add(4, 5, "Adrenaline Surge", 3, 0, 15, 11, 37, 82, "0", 0, "Lonjakan adrenalin: Memulihkan 25% Max SP seketika.")
    add(4, 10, "Chi Blast", 3, 0, 16, 1, 2, 76, "a.atk * 1.8 - b.def * 0.2", 1, "Tembakan hawa chi jarak dekat mengabaikan 20% DEF.")
    add(4, 18, "Nerve Strike", 3, 0, 20, 1, 21, 76, "a.atk * 1.5 - b.def * 0.3", 1, "Menotok saraf musuh -> Mengakibatkan Paralyze.", state=7)

    # [07] Martial Artist (Tier 3)
    add(7, 1, "Whirlwind Rush", 3, 0, 26, 1, 1, 76, "(a.atk * 0.65 - b.def * 0.1) * 4", 1, "4 kombinasi pukulan dan tendangan kilat.", repeats=4)
    add(7, 6, "Dragon Stance", 3, 0, 22, 11, 37, 82, "0", 0, "Kuda-kuda naga: ATK +25%, AGI +20%, Counter Rate +30%.")
    add(7, 12, "Chi Shockwave", 3, 0, 24, 2, 34, 76, "a.atk * 1.6 - b.def * 0.2", 1, "Gelombang chi melingkar menyapu seluruh musuh.")
    add(7, 22, "Meridian Lock", 3, 0, 28, 1, 21, 76, "a.atk * 2.0 - b.def * 0.2", 1, "Mengunci aliran darah -> Mengakibatkan Paralyze pasti.", state=7)

    # [11] Monk (Tier 4)
    add(11, 1, "Meteor Barrage", 3, 0, 36, 1, 1, 76, "(a.atk * 0.7 - b.def * 0.08) * 5", 1, "5 pukulan meteor berkecepatan supranatural.", repeats=5)
    add(11, 6, "Chi Hyper-Burst", 3, 0, 30, 11, 37, 82, "0", 0, "Pelepasan chi batin: Memulihkan 40% SP + Imun debuff (2 turn).")
    add(11, 25, "Buddha's Palm", 3, 0, 35, 2, 34, 76, "a.atk * 2.4 - b.def * 0.2", 1, "Telapak sang Buddha menghantam tanah menekan seluruh musuh.")
    add(11, 35, "Sixty-Four Palms", 3, 0, 40, 1, 21, 76, "a.atk * 2.8 - b.def * 0.1", 1, "64 totokan meridian menutup aliran hidup -> Mengakibatkan Stun.", state=11)
    add(11, 15, "Asura Lotus Wrath", 5, 0, 50, 1, 25, 80, "a.atk * 5.2 - b.def * 0.1", 1, "Ultimate: Amarah Asura menembus raga musuh tanpa sisa.")

    # [15] Brahma (Tier 5)
    add(15, 1, "108 Lotus Strikes", 3, 0, 50, 1, 1, 76, "(a.atk * 0.6 - b.def * 0.05) * 8", 1, "8 pukulan teratai suci garansi Critical.", repeats=8)
    add(15, 8, "State of Nirvana", 3, 0, 40, 11, 37, 82, "0", 0, "Kondisi nirwana: Memulihkan 100% SP + Kebal semua status (3 turn).")
    add(15, 32, "Asura Wrath Wave", 3, 0, 46, 2, 34, 76, "a.atk * 3.2 - b.def * 0.15", 1, "Ledakan hawa murni membabat seluruh musuh.")
    add(15, 45, "Meridian Annihilation", 3, 0, 48, 1, 21, 76, "a.atk * 3.8 - b.def * 0.05", 1, "Menghancurkan seluruh titik cakra lawan -> Mengakibatkan Stun.", state=11)
    add(15, 20, "Supreme Chi Void", 5, 0, 60, 1, 25, 80, "a.atk * 6.0 - b.def * 0.05", 1, "Ultimate: Pukulan kehampaan absolut Brahma melenyapkan eksistensi.")

    return skills, learnings, sid

