# Data definitions for Scout Lineage (10 classes: 39 to 48)

def get_scout_skills(start_id):
    sid = start_id
    skills = []
    learnings = {i: [] for i in range(39, 49)}

    def add(class_id, level, name, stype, mp, tp, scope, anim, icon, formula, elem, desc, state=None, state_ch=1.0, repeats=1):
        nonlocal sid
        effs = []
        if state:
            effs.append({"code": 21, "dataId": state, "value1": state_ch, "value2": 0})
        
        dmg_type = 1 if formula != '0' else 0
        s = {
            "id": sid,
            "animationId": anim,
            "damage": {"critical": True if dmg_type == 1 else False, "elementId": elem, "formula": formula, "type": dmg_type, "variance": 15},
            "description": desc,
            "effects": effs,
            "hitType": 1 if dmg_type == 1 else 0,
            "iconIndex": icon,
            "message1": " melancarkan ",
            "message2": "!",
            "mpCost": mp,
            "name": name,
            "note": "",
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

    # [39] Scout (Tier 1)
    add(39, 1, "Quick Shot", 3, 0, 12, 1, 11, 78, "a.atk * 1.4 - b.def * 0.4", 1, "Tembakan panah cepat jarak jauh.")
    add(39, 1, "Quick Stab", 3, 0, 10, 1, 6, 79, "a.atk * 1.3 - b.def * 0.4", 1, "Tikaman belati kilat memanfaatkan kelincahan.")
    add(39, 4, "Poison Tip", 3, 0, 12, 1, 16, 79, "a.atk * 1.2 - b.def * 0.3", 1, "Melumuri racun pada senjata -> Mengakibatkan Poison.", state=4)
    add(39, 6, "Pocket Sand", 3, 0, 10, 1, 35, 79, "a.atk * 0.8 - b.def * 0.5", 1, "Melempar pasir ke mata -> Mengakibatkan Blind (HIT -50%).", state=14)

    # [40] Archer (Tier 2)
    add(40, 1, "Pin Down", 3, 0, 14, 1, 11, 78, "a.atk * 1.4 - b.def * 0.3", 1, "Menembak kaki lawan -> Mengakibatkan Slow.", state=12)
    add(40, 5, "Piercing Arrow", 3, 0, 18, 1, 11, 78, "a.atk * 2.0 - b.def * 0.2", 1, "Tembakan busur menembus 25% DEF target.")
    add(40, 10, "Eagle Eye", 3, 0, 10, 11, 40, 82, "0", 0, "Fokus bidik: Hit Rate +30% & Critical Rate +20% (3 turn).")
    add(40, 18, "Scatter Shot", 3, 0, 20, 2, 29, 78, "a.atk * 1.3 - b.def * 0.4", 1, "Menembakkan hujan panah ke seluruh musuh.")

    # [42] Ranger (Tier 3)
    add(42, 1, "Hawkeye Precision", 3, 0, 18, 11, 40, 82, "0", 0, "Presisi mata elang: Critical Damage +30% & AGI +20%.")
    add(42, 6, "Armor-Piercer Shot", 3, 0, 26, 1, 26, 78, "a.atk * 2.6 - b.def * 0.15", 1, "Tembakan peremuk zirah mengabaikan 40% DEF lawan.")
    add(42, 12, "Snare Trap", 3, 0, 24, 2, 35, 78, "a.atk * 1.5 - b.def * 0.3", 1, "Memasang jerat kawat -> Mengakibatkan Slow ke semua musuh.", state=12)
    add(42, 22, "Arrow Rain Tempest", 3, 0, 30, 2, 29, 78, "a.atk * 1.8 - b.def * 0.3", 1, "Badai panah lebat menekan seluruh barisan lawan.")

    # [44] Sniper (Tier 4)
    add(44, 1, "Focus Energy", 3, 0, 24, 11, 40, 82, "0", 0, "Konsentrasi penuh: Serangan berikutnya dijamin Critical.")
    add(44, 6, "Dead Eye Shot", 3, 0, 36, 1, 26, 78, "a.atk * 3.6 - b.def * 0.1", 1, "Tembakan sniper mematikan ke titik vital, +40% Critical Rate.")
    add(44, 25, "Tendon Sever", 3, 0, 32, 1, 11, 78, "a.atk * 2.8 - b.def * 0.1", 1, "Memutus urat kaki musuh -> Mengakibatkan Slow berat.", state=12)
    add(44, 35, "Storm of Arrows", 3, 0, 42, 2, 29, 78, "a.atk * 2.6 - b.def * 0.2", 1, "Hujan panah beruntun mematikan ke seisi ruangan.")
    add(44, 15, "Ballista Impact", 5, 0, 50, 1, 26, 80, "a.atk * 5.2 - b.def * 0.05", 1, "Ultimate: Tembakan panah balista raksasa menghujam musuh.")

    # [46] Beastmaster (Tier 5)
    add(46, 1, "Call of Lupine", 4, 0, 35, 1, 16, 78, "a.atk * 3.2 - b.def * 0.1", 1, "Komando serigala buas menerkam mangsa -> Bleed.", state=6)
    add(46, 8, "Falcon Strike", 3, 0, 32, 1, 11, 78, "a.atk * 3.0 - b.def * 0.1", 1, "Serangan rajawali menukik membutakan musuh -> Blind.", state=14)
    add(46, 32, "Wild Stride Aura", 3, 0, 30, 8, 40, 82, "0", 0, "Aura keliaran alam: Meningkatkan ATK dan AGI party +25%.")
    add(46, 45, "Behemoth Command", 4, 0, 45, 2, 38, 78, "a.atk * 3.8 - b.def * 0.1", 1, "Auman monster purba meremukkan seluruh lawan.")
    add(46, 20, "Wrath of the Wild Primordial", 5, 0, 60, 2, 106, 80, "a.atk * 5.5 - b.def * 0.05", 1, "Ultimate: Amarah satwa liar primordial menginjak-injak musuh.")

    # [48] Windrunner (Tier 5)
    add(48, 1, "Stormbreaker Snipe", 3, 0, 48, 1, 26, 78, "a.atk * 4.5 - b.def * 0.0", 5, "Tembakan panah badai mengabaikan 100% DEF lawan.")
    add(48, 8, "Tempest Volley", 3, 0, 45, 2, 88, 78, "a.atk * 3.4 - b.def * 0.1", 5, "Hujan anak panah berkecepatan angin topan.")
    add(48, 32, "Gale Step", 3, 0, 28, 11, 40, 82, "0", 5, "Langkah topan: Evasion +50% dan Kecepatan AGI +40%.")
    add(48, 45, "Sonic Gale Destruction", 3, 0, 52, 1, 34, 78, "a.atk * 4.2 - b.def * 0.05", 5, "Tembakan supersonik berdaya ledak angin raksasa.")
    add(48, 20, "Celestial Ballista Impact", 5, 0, 60, 1, 26, 80, "a.atk * 6.0 - b.def * 0.05", 5, "Ultimate: Hantaman panah langit membelah ruang dan waktu.")

    # [41] Thief (Tier 2)
    add(41, 1, "Steal", 3, 0, 8, 1, 30, 79, "0", 0, "Peluang mencuri item atau koin Saka dari musuh.")
    add(41, 5, "Backstab", 3, 0, 16, 1, 6, 79, "a.atk * 2.2 - b.def * 0.3", 1, "Tikaman dari belakang, damage x1.75 jika target Blind/Stealth.")
    add(41, 10, "Mug", 3, 0, 14, 1, 6, 79, "a.atk * 1.5 - b.def * 0.3", 1, "Menyerang musuh sembari mencuri barang bawaannya.")
    add(41, 18, "Smoke Bomb", 3, 0, 16, 2, 35, 79, "0", 0, "Melempar bom asap pekat -> Mengakibatkan Blind ke seluruh musuh.", state=14)

    # [43] Rogue (Tier 3)
    add(43, 1, "Venom Strike", 3, 0, 18, 1, 16, 79, "a.atk * 1.8 - b.def * 0.3", 1, "Serangan belati beracun -> Mengakibatkan Poison pasti.", state=4)
    add(43, 6, "Mutilate", 3, 0, 24, 1, 6, 79, "a.atk * 2.6 - b.def * 0.2", 1, "Tikaman belati ganda -> Mengakibatkan Bleed.", state=6)
    add(43, 12, "Shadow Meld", 3, 0, 20, 11, 40, 79, "0", 0, "Masuk mode Stealth: Evasion +60%, tidak dapat ditarget (1 turn).")
    add(43, 22, "Toxic Cascade", 3, 0, 26, 2, 38, 79, "a.atk * 1.6 - b.def * 0.2", 1, "Tebasan berputar menebar racun -> Mengakibatkan Poison ke semua.", state=4)

    # [45] Assassin (Tier 4)
    add(45, 1, "Shadow Execution", 3, 0, 35, 1, 23, 79, "a.atk * 3.6 - b.def * 0.1", 1, "Tikaman maut ke titik vital dengan garansi Critical.")
    add(45, 6, "Shadow Clone Trick", 3, 0, 28, 11, 40, 79, "0", 0, "Bayangan ilusi: Menghindar 100% dari serangan musuh berikutnya.")
    add(45, 25, "Abyssal Plague", 3, 0, 36, 1, 16, 79, "a.atk * 2.8 - b.def * 0.1", 11, "Racun kutukan jurang maut -> Mengakibatkan Poison & Curse.", state=4)
    add(45, 35, "Toxic Fog", 3, 0, 34, 2, 35, 79, "0", 0, "Kabut racun pekat -> Mengakibatkan Blind & Poison ke seluruh musuh.", state=14)
    add(45, 15, "Omnislash Shadow Dance", 5, 0, 55, 2, 25, 80, "a.atk * 4.8 - b.def * 0.1", 1, "Ultimate: Berpindah di antara bayangan menebas seisi ruangan.")

    # [47] Shadow Walker (Tier 5)
    add(47, 1, "Phantom Assassinate", 3, 0, 46, 1, 23, 79, "a.atk * 4.6 - b.def * 0.05", 1, "Tikaman siluman melenyapkan musuh, menembus 50% DEF.")
    add(47, 8, "Shadow Eclipse", 3, 0, 40, 2, 98, 79, "a.atk * 2.5 - b.def * 0.1", 11, "Gerhana bayangan menenggelamkan arena -> Blind seluruh lawan.", state=14)
    add(47, 32, "Phantom Step", 3, 0, 35, 11, 40, 79, "0", 0, "Langkah hantu: Kecepatan (AGI) +50% dan Critical +40%.")
    add(47, 45, "Death Mark Extraction", 3, 0, 50, 1, 101, 79, "a.atk * 3.8 - b.def * 0.05", 11, "Mengekstrak tanda maut: Memulihkan 50% damage dealt ke HP user.")
    add(47, 20, "Thousand Blades of Death", 5, 0, 60, 2, 25, 80, "a.atk * 6.0 - b.def * 0.05", 1, "Ultimate: Ribuan bilah bayangan memenggal seluruh musuh.")

    return skills, learnings, sid

