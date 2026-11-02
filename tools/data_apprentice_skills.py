# Data definitions for Apprentice Lineage (24 classes: 17-38, 49, 50)

def get_apprentice_skills(start_id):
    sid = start_id
    skills = []
    learnings = {i: [] for i in list(range(17, 39)) + [49, 50]}

    def add(class_id, level, name, stype, mp, tp, scope, anim, icon, formula, elem, desc, state=None, state_ch=1.0, hp_cost=0, is_heal=False):
        nonlocal sid
        effs = []
        if state:
            effs.append({"code": 21, "dataId": state, "value1": state_ch, "value2": 0})
        
        dmg_type = 3 if is_heal else (1 if formula != '0' else 0)
        note = f"<HP Cost: {hp_cost}%>" if hp_cost > 0 else ""
        
        s = {
            "id": sid,
            "animationId": anim,
            "damage": {"critical": False, "elementId": elem, "formula": formula, "type": dmg_type, "variance": 15},
            "description": desc,
            "effects": effs,
            "hitType": 2 if dmg_type in (1, 3) else 0,
            "iconIndex": icon,
            "message1": " merapal " if stype in (1, 2) else " memanggil ",
            "message2": "!",
            "mpCost": mp,
            "name": name,
            "note": note,
            "occasion": 0,
            "repeats": 1,
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

    # [17] Apprentice (Tier 1)
    add(17, 1, "Arcane Bolt", 2, 5, 0, 1, 30, 79, "a.mat * 1.4 - b.mdf * 0.4", 1, "Tembakan proyektil sihir murni.")
    add(17, 3, "Cinder Spark", 2, 6, 0, 1, 3, 64, "a.mat * 1.3 - b.mdf * 0.4", 2, "Percikan api panas -> Mengakibatkan Burn.", state=5)
    add(17, 5, "Frost Touch", 2, 6, 0, 1, 4, 65, "a.mat * 1.3 - b.mdf * 0.4", 7, "Sentuhan hawa beku -> Mengakibatkan Slow.", state=12)
    add(17, 7, "Mana Barrier", 2, 10, 0, 11, 40, 81, "0", 0, "Perisai mana: Mengurangi magic damage diterima -25%.")

    # [18] Magician (Tier 2)
    add(18, 1, "Flame Burst", 2, 14, 0, 1, 66, 64, "a.mat * 2.0 - b.mdf * 0.3", 2, "Ledakan bola api berkobar -> Mengakibatkan Burn.", state=5)
    add(18, 5, "Glacial Spike", 2, 14, 0, 1, 71, 65, "a.mat * 1.9 - b.mdf * 0.3", 7, "Tombak kristal es tajam -> Mengakibatkan Slow.", state=12)
    add(18, 10, "Lightning Bolt", 2, 14, 0, 1, 76, 66, "a.mat * 2.0 - b.mdf * 0.3", 6, "Sambaran petir kilat -> Mengakibatkan Paralyze.", state=7)
    add(18, 18, "Aether Ward", 2, 20, 0, 11, 40, 81, "0", 0, "Dinding eter: Menyerap 30% damage dialihkan memotong MP.")

    # [21] Mage (Tier 3)
    add(21, 1, "Blazing Surge", 2, 28, 0, 1, 67, 64, "a.mat * 2.6 - b.mdf * 0.2", 2, "Gelombang api membakar musuh -> Mengakibatkan Burn.", state=5)
    add(21, 6, "Permafrost Lance", 2, 28, 0, 1, 71, 65, "a.mat * 2.4 - b.mdf * 0.2", 7, "Tombak es purba -> Mengakibatkan Freeze (Membeku).", state=13)
    add(21, 12, "Thunderclap Surge", 2, 28, 0, 1, 76, 66, "a.mat * 2.5 - b.mdf * 0.2", 6, "Guntur menggelegar -> Mengakibatkan Paralyze.", state=7)
    add(21, 22, "Elemental Storm", 2, 38, 0, 2, 31, 79, "a.mat * 2.2 - b.mdf * 0.2", 1, "Badai multi-elemen menyapu seluruh formasi musuh.")

    # [24] Elementalist - Pyromancer (Tier 4)
    add(24, 1, "Inferno Pillar", 2, 45, 0, 2, 68, 64, "a.mat * 2.8 - b.mdf * 0.2", 2, "Pilar api neraka membakar semua musuh -> Mengakibatkan Burn.", state=5)
    add(24, 6, "Scorching Wave", 2, 35, 0, 1, 67, 64, "a.mat * 3.2 - b.mdf * 0.1", 2, "Gelombang panas menyengat langsung membakar titik vital.")
    add(24, 15, "Flame Shield", 2, 30, 0, 11, 67, 81, "0", 2, "Perisai api: Melindungi diri + Membakar musuh yang memukul.")
    add(24, 25, "Hellfire Flare", 2, 55, 0, 1, 69, 64, "a.mat * 4.2 - b.mdf * 0.1", 2, "Kobaran api neraka terdalam dengan daya musnah absolut.")

    # [25] Elementalist - Hydromancer (Tier 4)
    add(25, 1, "Tidal Torrent", 2, 42, 0, 2, 68, 67, "a.mat * 2.6 - b.mdf * 0.2", 3, "Banjir bandang ombak laut menghantam seluruh musuh.")
    add(25, 6, "Aqua Jet", 2, 32, 0, 1, 7, 67, "a.mat * 3.0 - b.mdf * 0.2", 3, "Semburan air bertekanan tinggi menembus 25% MDF.")
    add(25, 15, "Cleansing Mist", 1, 35, 0, 8, 47, 67, "a.mat * 1.5 + 100", 3, "Kabut murni: Menyembuhkan party dan membersihkan debuff.", is_heal=True)
    add(25, 25, "Abyssal Deluge", 2, 55, 0, 2, 98, 67, "a.mat * 3.8 - b.mdf * 0.1", 3, "Air bah samudra purba menenggelamkan seisi ruangan.")

    # [26] Elementalist - Geomancer (Tier 4)
    add(26, 1, "Earth Shatter", 2, 42, 0, 1, 81, 68, "a.mat * 3.2 - b.mdf * 0.1", 4, "Batu karang menghujam musuh -> Mengakibatkan Stun.", state=11)
    add(26, 6, "Stone Spire", 2, 35, 0, 1, 81, 68, "a.mat * 2.8 - b.mdf * 0.05", 4, "Menombak tanah menembus 40% pertahanan sihir musuh.")
    add(26, 15, "Granite Wall", 2, 30, 0, 8, 40, 81, "0", 4, "Dinding granit: Meningkatkan DEF dan MDF seluruh party +35%.")
    add(26, 25, "Cataclysm Quake", 2, 55, 0, 2, 83, 68, "a.mat * 3.6 - b.mdf * 0.1", 4, "Gempa bumi tektonik dahsyat meremukkan seluruh musuh.")

    # [27] Elementalist - Aeromancer (Tier 4)
    add(27, 1, "Gale Tempest", 2, 42, 0, 2, 88, 69, "a.mat * 2.6 - b.mdf * 0.2", 5, "Puting beliung menghantam musuh -> Mengakibatkan Slow.", state=12)
    add(27, 6, "Zephyr Slice", 2, 32, 0, 1, 86, 69, "a.mat * 3.0 - b.mdf * 0.15", 5, "Bilah angin berkecepatan suara membelah musuh.")
    add(27, 15, "Tailwind Aura", 2, 28, 0, 8, 40, 69, "0", 5, "Aura angin buritan: Meningkatkan AGI dan Evasion party +30%.")
    add(27, 25, "Cyclone Cataclysm", 2, 55, 0, 2, 88, 69, "a.mat * 3.8 - b.mdf * 0.1", 5, "Topan badai raksasa menghisap dan meluluhlantakkan musuh.")

    # [28] Elementalist - Electromancer (Tier 4)
    add(28, 1, "Heaven's Fulmination", 2, 45, 0, 2, 78, 66, "a.mat * 2.7 - b.mdf * 0.2", 6, "Badai kilat langit menyengat seluruh musuh -> Paralyze.", state=7)
    add(28, 6, "Thunder Spear", 2, 34, 0, 1, 76, 66, "a.mat * 3.2 - b.mdf * 0.1", 6, "Tombak petir menembus musuh -> Mengakibatkan Paralyze.", state=7)
    add(28, 15, "Voltage Arc", 2, 30, 0, 11, 76, 66, "0", 6, "Medan tegangan tinggi: Kecepatan casting dan AGI +35%.")
    add(28, 25, "Judgement Storm", 2, 55, 0, 2, 78, 66, "a.mat * 4.0 - b.mdf * 0.1", 6, "Badai petir penghakiman meratakan medan laga.")

    # [29] Elementalist - Cryomancer (Tier 4)
    add(29, 1, "Blizzard Tempest", 2, 45, 0, 2, 73, 65, "a.mat * 2.6 - b.mdf * 0.2", 7, "Badai salju area -> Mengakibatkan Slow & Freeze.", state=13)
    add(29, 6, "Frost Armor", 2, 30, 0, 11, 40, 65, "0", 7, "Zirah es kristal: DEF/MDF +30% + Membekukan penyerang.")
    add(29, 15, "Ice Mirror", 2, 32, 0, 11, 40, 65, "0", 7, "Cermin es: Memantulkan 35% sihir musuh kembali ke pemantul.")
    add(29, 25, "Glacial Cataclysm", 2, 55, 0, 2, 73, 65, "a.mat * 3.9 - b.mdf * 0.1", 7, "Bencana gletser purba membekukan seisi ruangan.")

    # [30] Elementalist - Ferromancer (Tier 4)
    add(30, 1, "Iron Spikes", 2, 42, 0, 1, 26, 70, "a.mat * 3.2 - b.mdf * 0.1", 8, "Paku baja cair menusuk musuh -> Mengakibatkan Bleed.", state=6)
    add(30, 6, "Magnetic Repulsion", 2, 30, 0, 11, 40, 70, "0", 8, "Tolakan magnetis: Evasion terhadap serangan fisik +40%.")
    add(30, 15, "Steel Fortress", 2, 35, 0, 8, 40, 70, "0", 8, "Benteng baja eter: Meredam 35% physical damage party.")
    add(30, 25, "Polar Collision", 2, 55, 0, 2, 25, 70, "a.mat * 3.8 - b.mdf * 0.1", 8, "Tubrukan kutub magnet meluluhlantakkan struktur armor musuh.")

    # [31] Elementalist - Echomancer (Tier 4)
    add(31, 1, "Ultrasonic Pulse", 2, 40, 0, 2, 34, 76, "a.mat * 2.5 - b.mdf * 0.2", 9, "Gelombang ultrasonik memekakkan telinga -> Silence.", state=16)
    add(31, 6, "Sonic Screech", 2, 32, 0, 1, 34, 76, "a.mat * 3.0 - b.mdf * 0.1", 9, "Jeritan sonik menusuk gendang telinga -> Confuse.", state=9)
    add(31, 15, "Infrasonic Mute", 2, 28, 0, 1, 34, 76, "0", 9, "Getaran infrasonik mematikan mantra -> Mengakibatkan Silence.", state=16)
    add(31, 25, "Vibrational Burst", 2, 55, 0, 2, 34, 76, "a.mat * 3.8 - b.mdf * 0.1", 9, "Ledakan resonansi getaran memecahkan organ dalam lawan.")

    # [34] Archmage (Tier 5)
    add(34, 1, "Hellfire Cataclysm", 2, 60, 0, 2, 69, 64, "a.mat * 3.8 - b.mdf * 0.1", 2, "Bencana api terlarang membakar seluruh musuh -> Burn.", state=5)
    add(34, 8, "Absolute Zero", 2, 60, 0, 2, 73, 65, "a.mat * 3.8 - b.mdf * 0.1", 7, "Titik nol mutlak membekukan musuh seketika -> Freeze.", state=13)
    add(34, 32, "Judgement Thunderstorm", 2, 60, 0, 2, 78, 66, "a.mat * 3.8 - b.mdf * 0.1", 6, "Badai petir penghakiman menyengat seluruh medan -> Paralyze.", state=7)
    add(34, 45, "Aegis of the Archmage", 2, 45, 0, 11, 40, 81, "0", 0, "Perisai agung penyihir: Imun damage sihir selama 1 turn.")
    add(34, 20, "Apocalypse Meteorfall", 5, 85, 0, 2, 106, 80, "a.mat * 5.5 - b.mdf * 0.05", 1, "Ultimate: Hujan meteor kehancuran multi-elemen.")

    # [38] Dragon Aspect (Tier 5)
    add(38, 1, "Draconic Roar", 2, 45, 0, 2, 32, 64, "a.mat * 3.5 - b.mdf * 0.1", 2, "Raungan naga purba menyemburkan kobaran api -> Burn.", state=5)
    add(38, 8, "Primordial Breath", 2, 50, 0, 1, 32, 66, "a.mat * 4.2 - b.mdf * 0.1", 6, "Hembusan napas petir naga purba -> Paralyze.", state=7)
    add(38, 32, "Dragon Wings Ward", 2, 40, 0, 8, 40, 81, "0", 0, "Sayap naga memayungi party: Mengurangi seluruh damage -35%.")
    add(38, 45, "Draconic Awakening", 2, 50, 0, 11, 37, 82, "0", 0, "Menjelma wujud naga: MAT & ATK +40% selama 3 turn.")
    add(38, 20, "Breath of the Ancient Dragon", 5, 85, 0, 2, 106, 80, "a.mat * 5.8 - b.mdf * 0.05", 2, "Ultimate: Semburan nafas naga purba melahap alam semesta.")

    # [49] Chronomancer (Tier 6 - Pinnacle)
    add(49, 1, "Temporal Distortion", 2, 55, 0, 2, 40, 79, "a.mat * 3.5 - b.mdf * 0.1", 1, "Distorsi ruang waktu menunda giliran seluruh lawan -> Slow.", state=12)
    add(49, 10, "Grand Haste", 2, 50, 0, 8, 40, 46, "0", 0, "Mempercepat waktu party: AGI +50% selama 3 turn.")
    add(49, 40, "Rewind Fate", 1, 70, 0, 8, 47, 72, "a.mat * 3.0 + 300", 0, "Memutar balik waktu: Memulihkan HP party ke kondisi semula.", is_heal=True)
    add(49, 25, "Chronos Apocalypse: Time Stop", 5, 95, 0, 2, 40, 80, "a.mat * 6.0 - b.mdf * 0.05", 1, "Ultimate: Menghentikan waktu total, musuh kehilangan giliran mutlak.", state=11)

    # [19] Acolyte (Tier 2)
    add(19, 1, "Pray", 1, 14, 0, 8, 43, 72, "a.mat * 1.2 + 40", 10, "Doa pemulihan lembut untuk seluruh kawan.", is_heal=True)
    add(19, 5, "Purify Status", 1, 12, 0, 7, 45, 72, "0", 0, "Menghapus 1 efek status buruk pada kawan.")
    add(19, 10, "Healing Light", 1, 16, 0, 7, 41, 72, "a.mat * 3.2 + 150", 10, "Sinar suci memulihkan HP target secara signifikan.", is_heal=True)
    add(19, 18, "Sacred Ward", 1, 18, 0, 8, 40, 72, "0", 10, "Perisai doa: Meningkatkan MDF seluruh party +25%.")

    # [22] Cleric (Tier 3)
    add(22, 1, "Silence Ray", 1, 14, 0, 1, 91, 72, "a.mat * 1.5 - b.mdf * 0.3", 10, "Sinar suci penyegel mantra -> Mengakibatkan Silence.", state=16)
    add(22, 5, "Medica Wave", 1, 26, 0, 8, 43, 72, "a.mat * 2.2 + 120", 10, "Gelombang mukjizat menyembuhkan seluruh kawan.", is_heal=True)
    add(22, 10, "Sacred Restoration", 1, 28, 0, 7, 41, 72, "a.mat * 4.5 + 250", 10, "Pemulihan berkah besar pada kawan sekarat.", is_heal=True)
    add(22, 18, "Cleanse All", 1, 24, 0, 7, 45, 72, "0", 0, "Menghapus seluruh efek status buruk pada target.")
    add(22, 28, "Raise", 1, 45, 0, 7, 49, 72, "0", 0, "Menghidupkan kawan yang gugur (Death) dengan 50% HP.")

    # [32] Priest (Tier 4)
    add(32, 1, "Sanctified Benediction", 1, 38, 0, 8, 44, 72, "a.mat * 3.0 + 200", 10, "Berkah suci agung memulihkan HP seluruh party.", is_heal=True)
    add(32, 6, "Radiant Salvation", 1, 42, 0, 7, 42, 72, "a.mat * 6.0 + 400", 10, "Penyelamatan jiwa memulihkan HP penuh 1 kawan.", is_heal=True)
    add(32, 25, "Holy Mute", 1, 24, 0, 2, 93, 72, "a.mat * 1.8 - b.mdf * 0.2", 10, "Kutukan suci menyegel seluruh sihir musuh -> Silence.", state=16)
    add(32, 35, "Sanctified Absolution", 1, 36, 0, 8, 47, 72, "0", 0, "Membersihkan seluruh status buruk pada seluruh party!")
    add(32, 15, "Arise", 1, 65, 0, 7, 49, 72, "0", 0, "Membangkitkan kawan langsung dengan 100% HP penuh.")

    # [35] High Priest (Tier 5)
    add(35, 1, "Divine Miracle Shower", 1, 55, 0, 8, 44, 72, "a.mat * 4.0 + 350", 10, "Hujan mukjizat menyembuhkan seluruh party secara masif.", is_heal=True)
    add(35, 8, "Grace of Sang Hyang", 1, 60, 0, 7, 91, 72, "a.mat * 8.0 + 800", 10, "Rahmat tertinggi Sang Hyang memulihkan jiwa dan raga.", is_heal=True)
    add(35, 32, "Divine Exorcism", 1, 45, 0, 1, 91, 72, "a.mat * 4.5 - b.mdf * 0.1", 10, "Pengusiran roh jahat berdaya serang suci mutlak.")
    add(35, 45, "Mass Resurrection", 1, 80, 0, 8, 49, 72, "0", 0, "Membangkitkan seluruh kawan yang gugur di medan laga.")
    add(35, 20, "Miracle of Rebirth", 5, 90, 0, 8, 93, 80, "a.mat * 5.0 + 500", 10, "Ultimate: Full Party Revive + Full HP Recovery.")

    # [37] Shaman (Tier 5)
    add(37, 1, "Totem of Healing", 1, 45, 0, 8, 43, 68, "a.mat * 2.5 + 150", 4, "Menancapkan totem pemulihan alam untuk party.", is_heal=True)
    add(37, 8, "Ancestral Spirit Ward", 1, 40, 0, 8, 40, 68, "0", 4, "Perlindungan arwah leluhur: Menolak 1 serangan fatal.")
    add(37, 32, "Nature's Wrath Shock", 2, 50, 0, 2, 78, 66, "a.mat * 3.5 - b.mdf * 0.1", 6, "Kemarahan alam menyengat musuh -> Paralyze.", state=7)
    add(37, 45, "Blood Transfusion", 1, 35, 0, 7, 41, 72, "a.mat * 3.5 + 200", 0, "Mentransfer daya hidup menyembuhkan luka berat kawan.", is_heal=True)
    add(37, 20, "Totemic Communion of Ancestors", 5, 85, 0, 8, 93, 80, "a.mat * 4.5 + 400", 10, "Ultimate: Komuni arwah suci memberkati seisi party.")

    # [20] Occultist (Tier 2)
    add(20, 1, "Hex of Agony", 2, 12, 0, 1, 96, 71, "a.mat * 1.5 - b.mdf * 0.3", 11, "Kutukan rasa sakit -> Mengakibatkan Curse (Anti-Heal).", state=10)
    add(20, 5, "Blood Tap", 2, 0, 0, 11, 40, 71, "0", 0, "Mengorbankan 10% HP -> Memulihkan 30% Max MP.", hp_cost=10)
    add(20, 10, "Dark Orb", 2, 14, 0, 1, 96, 71, "a.mat * 2.0 - b.mdf * 0.3", 11, "Bola energi kegelapan menguras batin target.")
    add(20, 18, "Siphon Life", 2, 18, 0, 1, 101, 71, "a.mat * 1.8 - b.mdf * 0.3", 11, "Menghisap darah musuh: Memulihkan 50% damage dealt.")

    # [23] Cultist (Tier 3)
    add(23, 1, "Curse of Doom", 2, 22, 0, 1, 96, 71, "a.mat * 2.2 - b.mdf * 0.2", 11, "Kutukan kebinasaan mutlak -> Mengakibatkan Curse.", state=10)
    add(23, 6, "Blood Pact: Minion", 4, 25, 0, 11, 96, 71, "0", 11, "Pakta darah: Korbankan 15% HP memanggil arwah kegelapan.", hp_cost=15)
    add(23, 12, "Soul Siphon", 2, 26, 0, 1, 101, 71, "a.mat * 2.4 - b.mdf * 0.2", 11, "Menghisap jiwa: Mengembalikan 60% damage dealt ke HP.")
    add(23, 22, "Shadow Miasma", 2, 32, 0, 2, 35, 71, "a.mat * 1.8 - b.mdf * 0.2", 11, "Kabut racun gelap -> Mengakibatkan Poison & Blind.", state=4)

    # [33] Necromancer (Tier 4)
    add(33, 1, "Malice Affliction", 2, 36, 0, 2, 98, 71, "a.mat * 2.4 - b.mdf * 0.2", 11, "Kutukan massal -> Mengakibatkan Curse ke seluruh musuh!", state=10)
    add(33, 6, "Abyssal Harvest", 2, 40, 0, 1, 101, 71, "a.mat * 3.4 - b.mdf * 0.1", 11, "Memanen nyawa musuh dengan lifesteal dahsyat.")
    add(33, 15, "Blood Pact: Commander", 4, 40, 0, 1, 98, 71, "a.mat * 3.5 - b.mdf * 0.1", 11, "Pakta darah: Korbankan 20% HP memanggil Jenderal Iblis.", hp_cost=20)
    add(33, 25, "Corpse Explosion", 2, 45, 0, 2, 98, 71, "a.mat * 3.0 - b.mdf * 0.1", 11, "Meledakkan energi mayat menghancurkan formasi lawan.")

    # [36] Warlock (Tier 5)
    add(36, 1, "Curse of the Void", 2, 48, 0, 2, 98, 71, "a.mat * 2.8 - b.mdf * 0.1", 11, "Kutukan kehampaan -> Mengakibatkan Curse & Vulnerable.", state=10)
    add(36, 8, "Void Singularity", 2, 65, 0, 2, 98, 71, "a.mat * 4.2 - b.mdf * 0.1", 11, "Singularitas lubang hitam menyedot seluruh HP musuh.")
    add(36, 32, "Avatar of Demon Lord", 4, 60, 0, 11, 98, 71, "0", 11, "Korbankan 25% HP menjelma wujud penguasa neraka.", hp_cost=25)
    add(36, 45, "Netherworld Grasp", 2, 55, 0, 1, 101, 71, "a.mat * 4.0 - b.mdf * 0.05", 11, "Cengkeraman neraka menguras 80% HP musuh menjadi darah user.")
    add(36, 20, "Calamity of the Netherworld", 5, 85, 0, 2, 98, 80, "a.mat * 5.6 - b.mdf * 0.05", 11, "Ultimate: Gerbang alam baka terbuka menelan seisi medan pertempuran.")

    # [50] Void Incarnate (Tier 6 - Pinnacle)
    add(50, 1, "Event Horizon", 2, 65, 0, 2, 98, 71, "a.mat * 4.0 - b.mdf * 0.05", 11, "Cakrawala peristiwa: Mengabaikan 50% MDF seluruh musuh.")
    add(50, 10, "Nihility Rupture", 2, 70, 0, 1, 98, 71, "a.mat * 4.8 - b.mdf * 0.0", 11, "Sobekan kehampaan kosmik mengabaikan 100% MDF lawan.")
    add(50, 40, "Black Hole Collapse", 2, 80, 0, 2, 98, 71, "a.mat * 4.5 - b.mdf * 0.0", 11, "Runtuhnya lubang hitam menelan seluruh musuh.")
    add(50, 25, "Void Annihilation: Absolute Zero Matter", 5, 95, 0, 2, 98, 80, "a.mat * 6.5", 11, "Ultimate: Lenyapnya segala materi dan eksistensi di hadapan ketiadaan.")

    return skills, learnings, sid

