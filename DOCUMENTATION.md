# 📜 Dokumentasi Arsitektur & Checkpoint Proyek: Tales of The Dark Time (Nusvanir Engine)

> **Dokumentasi Komprehensif Sistem, Arsitektur Engine, Database, dan Eksternal Studio**  
> *Tanggal Checkpoint: 8 November 2026*  
> *Status: Sistem Inti Selesai (Core Engine, Combat, Database Studio, & Paritas Penuh)*

---

## 1. Visi & Ikhtisar Proyek

**Tales of The Dark Time** (Nusvanir RPG Project) adalah proyek permainan peran taktis berbasis giliran (*Turn-Based Tactical JRPG*) bergaya fantasi gelap (*dark grim-fantasy*) yang dibangun di atas fondasi hybrid: **RPG Maker MV Engine** yang dimodernisasi secara masif melalui **NUSV Clean-Room Custom Engine Suite** dan integrasi **Yanfly Engine Plugins (YEP)** terpilih.

### Prinsip Utama Rekayasa Engine (Core Engineering Principles)
1. **Deterministik & Data-Driven**: Seluruh formula stat, kalkulasi damage, alur giliran, dan koreografi aksi dikendalikan secara transparan melalui database JSON dan notetag terstruktur tanpa ketergantungan pada *blackbox scripts*.
2. **Zero Bloatware & Paritas 1:1**: Database yang padat tanpa slot kosong, pembersihan aset/skill usang, dan jaminan keselarasan visual antara editor eksternal dan runtime pertempuran asli in-game.
3. **Kustomisasi & Percabangan Mendalam**: Sistem 50 profesi (Class) bertingkat (Tier 1–5), dual level (Base Level & Class Level), 6 Base Stats, serta alokasi poin bebas untuk kebebasan eksperimen build karakter.

---

## 2. Arsitektur Pertempuran & Gameplay (Core Battle Architecture)

### 2.1. Sistem Dual Level (Base Level & Class Level) — `NUSV_ClassLevel.js`
Game memisahkan progres karakter ke dalam dua lapisan level independen:
- **Base Level (Level 1–99)**:
  - Mengukur pertumbuhan fisik dan kematangan umum karakter dari *Base EXP*.
  - Setiap kenaikan 1 Base Level memberikan **3 Stat Points bebas** untuk dialokasikan ke 6 Base Stats.
- **Class Level (Level 1–50+)**:
  - Mengukur penguasaan karakter terhadap profesi/kelas yang sedang aktif dari *Class EXP*.
  - Tiap kelas memiliki memori level mandiri saat karakter berganti profesi (`Maintain Level: false`).
  - **Batas Level per Tier (Tier Cap)**:
    - *Tier 1 (Novice)*: Level 1 – 10
    - *Tier 2 (Adept)*: Level 1 – 30
    - *Tier 3 (Master)*: Level 1 – 40
    - *Tier 4 (Paragon)*: Level 1 – 50
    - *Tier 5 (Legendary)*: Level 1 – 60 *(Endgame)*
  - **Pertumbuhan Stat Alami (Class Stat Growth)**: Memberikan bonus stat bawaan kelas secara otomatis (`<Class Stat Growth: STR +1.2, VIT +1.0>`).
  - **Sinkronisasi Learnset**: Membuka skill aktif baru di database class secara otomatis saat Class Level tercapai, dan melepaskannya saat berganti ke profesi lain.

### 2.2. Sistem 6 Base Stats & Stat Turunan — `NUSV_StatSystem.js`
Atribut dasar karakter dirombak total menjadi 6 Base Stats:
1. **STR (Strength)**: Fondasi kekuatan fisik. Meningkatkan Melee ATK, Max HP (+5), Max SP (+2), Critical Damage (+0.3%), dan DEF (+0.5).
2. **INT (Intelligence)**: Fondasi sihir dan afinitas mana. Meningkatkan Max MP (+8), MAT (+2), MDF (+1.2), dan MP Regen (+0.03%).
3. **DEX (Dexterity)**: Keahlian presisi dan senjata lincah. Meningkatkan Ranged/Finesse ATK (+2: Bow, Crossbow, Dagger), Melee ATK (+0.5), Hit Rate (+0.2%), Crit Rate (+0.2%), dan Critical Damage (+0.2%).
4. **LUK (Luck)**: Peluang keberuntungan dan takdir. Meningkatkan Evasion (+0.05%), Crit Rate (+0.1%), dan Critical Evasion (+0.15%).
5. **AGI (Agility)**: Kelincahan dan kecepatan reaksi. Meningkatkan Action Speed / Turn Order (+1.5), Evasion (+0.2%), dan SP Regen (+0.04%).
6. **VIT (Vitality)**: Daya tahan tubuh dan kebugaran. Meningkatkan Max HP (+15), Max SP (+5), DEF (+1.5), MDF (+0.8), Guard Efficiency (+0.5%), HP Regen (+0.03%), SP Regen (+0.02%), dan On-Hit Adrenaline SP Recovery.

### 2.3. Sistem Stamina Points (SP) Dinamis — `NUSV_StatSystem.js` & `NUSV_StaminaBattle.js`
- **Menggantikan TP**: Parameter TP diubah total menjadi **SP (Stamina Points)** yang merefleksikan kelelahan fisik dan tenaga karakter.
- **Max SP Dinamis**: Dihitung dari formula:
  $$\text{Max SP} = \text{Base SP (50)} + (\text{VIT} \times 5) + (\text{STR} \times 2) + \text{Flat SP Equip}$$
- **Preserved Across Battles**: SP tidak di-reset ke 0 setiap awal pertarungan, melainkan tersimpan persis seperti HP dan MP.
- **Mekanik Tempur SP In-Battle**:
  - **Guard Stamina Surge**: Memilih aksi Bertahan (*Guard*) segera memulihkan Stamina sebesar $\text{Max SP} \times (\text{Guard Rate} + (\text{SP Regen} \times 2))$ dan memunculkan popup `+X SP`.
  - **On-Hit Adrenaline SP Recovery**: Menerima serangan memicu lonjakan adrenalin yang memulihkan SP proporsional terhadap damage yang diterima, stat ketahanan tubuh (VIT), dan stat SP Regen (TRG).

### 2.4. Timeline Pertempuran CTB — `YEP_X_BattleSysCTB` & `NUSV_CTBCalibration.js`
- Menggunakan sistem **Charge Turn Battle (CTB)** berbasis kecepatan aksi real-time.
- **Penyempurnaan Visual Kalibrasi (`NUSV_CTBCalibration.js`)**:
  - *Fallback Enemy Icon*: Mengisi ikon silang pedang (Icon 76) otomatis jika musuh belum memiliki grafik statis agar antrean tidak kosong.
  - *Enhanced Face Cropping*: Memotong dan memfokuskan sprite wajah aktor (144x144) ke area kepala dan mata (~82% bagian atas) sehingga wajah tampak tajam dan proporsional di bar antrean.
  - *Anti-Overlap Plural Enemy Letters*: Menempatkan huruf indeks musuh (A, B, C) di sudut kanan bawah dengan ukuran font 14px dan outline hitam tebal (3px) tanpa menutupi ikon utama.

### 2.5. Pipeline Damage & Indikator HD — `NUSV_DamageCore.js` & `NUSV_BattlePopups.js`
- **8-Step Damage Pipeline**:
  $$\text{Formula Base} \rightarrow \text{Element Rate} \rightarrow \text{PDR/MDR} \rightarrow \text{REC} \rightarrow \text{Critical} \rightarrow \text{Variance} \rightarrow \text{Guard} \rightarrow \text{Cap Clamp}$$
- **Armor & Magic Penetration**: Notetag `<Armor Penetration: X%>` dan `<Magic Penetration: X%>` dihitung secara native via helper `nusvDef(b)` dan `nusvMdf(b)`.
- **Battle Popups Vektor HD**:
  - Menggantikan bitmap raster kuno dengan font vektor `BattleFont` (`fonts/final-fantasy-advance-ds.otf`).
  - Spawns tepat di atas kepala battler (`-spriteHeight - overheadOffset`) dengan stagger naik bertingkat (+22px) untuk combo multi-hit.
  - Pembedaan warna terstandar: Damage Musuh Putih (`#FFFFFF`), Damage Party Coral (`#FF6B6B`), Critical Emas (`#FFD700`) + badge `CRITICAL!`, Heal Hijau Zamrud (`#2ECC71`), MP Ungu/Biru (`#A855F7`/`#00E5FF`), Miss Perak Italic (`#E5E7EB`).

### 2.6. Aturan Perlengkapan, Senjata & Unleash — `NUSV_EquipRules.js` & `NUSV_WeaponUnleash.js`
- **Aturan 1-Handed (1H) vs 2-Handed (2H)**:
  - Senjata 2H (*Long Sword, Axe, Spear, Staff, Long Bow, Crossbow*) memakan dua tangan. Memasang senjata 2H di Slot 1 otomatis **MENYEGEL** slot Secondary (Slot 2) dan melepas offhand/perisai ke tas.
  - Senjata 2H dilarang keras dipasang di Slot 2.
- **Dual Wield Fisik & Sihir**:
  - Fisik (Assassin, Shadow Walker): Memasang Dagger, 1H Sword, atau Gloves di kedua tangan.
  - Sihir (24 Kelas Sihir Pengguna Rune): Memasang Dual Rune di tangan kanan (Primary) dan tangan kiri (Secondary) untuk melipatgandakan variasi mantra.
- **Dual Accessory Slots**: Slot 6 dan Slot 6 dapat dipasangi aksesori kembar/identik. Mendukung notetag aktor `<Second Accessory: ...>`.
- **Universal Relic (Slot 7) & Accessory Access**: Seluruh kelas dapat menggunakan aksesori dan relik tanpa batasan Armor Type.
- **Auto-Fallback 10 Tipe Senjata Dasar**: `NUSV_WeaponUnleash` secara otomatis memetakan 10 Tipe Senjata ke Skill Serangan Dasar (#431 s/d #440) lengkap dengan fallback ID animasi senjata, menggantikan dan mengarsipkan `WeaponSkill.js`.

### 2.7. Visual Koreografi, Proyektil & Keyframes — `NUSV_ProjectileEngine.js` & `NUSV_VFXKeyframes.js`
- **Universal Flying Projectile Engine**:
  - Terintegrasi penuh ke Yanfly Action Sequences: `projectile weapon: ...`, `projectile animation [id]: ...`, `projectile icon [index]: ...`, dan `wait for projectile`.
  - Mendukung lintasan parabola (*arc*), rotasi otomatis sepanjang tangen lintasan (*rotate*), spin, scaling, hit impact animation, dan jeda delay.
  - Pemetaan default otomatis untuk 11 elemen sihir proyektil (Neutral #56, Fire #15, Water #28, Earth #31, Air #34, Electric #27, Ice #21, Steel #4, Sound #11, Holy #40, Dark #44).
- **VFX Keyframes & Smart Direction Synchronizer**:
  - Interpolasi lintasan visual keyframe A (User) ke keyframe B (Target) dengan kurva easing (`ease-out`, `ease-in`, `ease-in-out`).
  - **Deterministic Combat Direction Mandate**:
    - Hero / Party menyerang Musuh: Selalu menebas/meluncur ke arah **KIRI** (`mirror = true`).
    - Musuh menyerang Hero: Selalu menebas/meluncur ke arah **KANAN** (`mirror = false`).
    - Skill Buff / Heal / Self: Selalu unmirrored (`mirror = false`).
  - Mengabaikan flag mirror redundan pada action sequence legacy untuk memastikan arah serangan deterministik.
  - Mendukung custom spritesheet grid engine (sel bebas: 48x48, 64x64, 32x32, dll.) melampaui limit standar MV 192x192.

---

## 3. Eksternal Studio: NUSV Database & Action Sequence Studio

Terletak di direktori [editor_studio/](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/editor_studio/), studio web modern ini memungkinkan pengembangan data, koreografi aksi pertempuran, dan penataan spritesheet langsung dari antarmuka visual desktop yang responsif.

### 3.1. Komponen & Infrastruktur Studio
- **Backend Server (`tools/nusv_editor_server.py`)**:
  - Server HTTP berbasis Python (Port 5050) dengan atomic file locking dan backup data otomatis (`data_backup/`).
  - Endpoint RESTful API untuk memuat dan menyimpan data JSON database (`Actors`, `Classes`, `Skills`, `Items`, `Weapons`, `Armors`, `Enemies`, `Troops`, `States`, `Animations`, `CommonEvents`).
  - Image serving endpoints untuk potret karakter, iconset, spritesheet animasi, dan battler.
- **Desktop Window Launcher (`tools/launch_studio.py`)**:
  - Menjalankan studio sebagai aplikasi desktop mandiri (*standalone App Mode window*) tanpa bilah URL atau tab browser.
  - Mengelola siklus hidup server Python di latar belakang secara otomatis dan membersihkannya saat jendela ditutup.
- **Modular Studio Architecture (`editor_studio/`)**:
  - Dipecah menjadi modul-modul terisolasi: CSS modular, `api.js`, `constants.js`, `utils.js`, `state.js`.
  - 10 Editor Spesifik: `actor_editor.js`, `class_editor.js`, `weapon_editor.js`, `armor_editor.js`, `enemy_editor.js`, `state_editor.js`, `skill_editor.js`, `battle_sequence_editor.js`, `animation_editor.js`, `item_editor.js`.
  - Modals Terintegrasi: Icon Picker (pencarian instan IconSet), Trait Modal, Effect Modal, Resize Modal, Class Params Curve Modal, Battle Preview Modal, dan Animation Skill Select Modal.
- **Bundler Tool (`tools/bundle_editor.py` & `tools/build_complete_studio.py`)**:
  - Menggabungkan arsitektur modular `editor_studio/` ke dalam file tunggal `editor.bundled.html` untuk portabilitas.

### 3.2. Fitur Unggulan Studio
1. **Interactive 6-Phase Action Sequence Studio**:
   - Visualisasi alur 6 Fase: *Pre-Condition*, *Setup Action*, *Whole Action*, *Target Action*, *Follow Action*, *Finish Action*.
   - HTML5 Drag & Drop Reordering (`⋮⋮`) untuk penataan urutan perintah aksi secara intuitif.
   - Flowchart Timeline status aktif/kosong per fase.
2. **Native Animation Studio**:
   - Auto-detect resolusi dan pembagian sel spritesheet gambar baru.
   - Eliminasi teks HUD overlay untuk tampilan pixel art kanvas 100% bersih.
   - Transport controls lengkap (Play, Loop, Speed 0.5x–3.0x, SE Audio toggle, Onion Skinning).
   - Penambahan 31 file spritesheet animasi baru di `img/animations/`.
3. **Native Battle Preview Sandbox (`NUSV_BattlePreview.js`)**:
   - Menghubungkan engine game RPG Maker MV asli (`Scene_Battle`) langsung ke dalam modal studio via parameter URL `?skillPreview=ID`.
   - **1v1 Solo Duel Sandbox**: Memuat tepat 1 Aktor terpilih melawan 1 Boneka Musuh (*dummy immortal*).
   - Bebas kendala biaya skill (MP/SP tak terbatas) dan bypass restriksi kelas senjata.
   - Smooth camera pan & sprite tracking 100% identik dengan playtest nyata (zero camera disconnect).
   - Kontrol kecepatan real-time (0.5x Slow-Motion, 1.0x Normal, 2.0x Fast).
   - Tombol Instant Replay (`🔁 Replay`).
   - Live Hot-Reload: Notetag dan konfigurasi yang sedang diedit di editor disinkronkan secara instan via `postMessage` tanpa perlu menyimpan file JSON terlebih dahulu.

---

## 4. Struktur Database Kanonikal Nusvanir

Audit database membuktikan **0 broken references / 0 missing IDs** pada seluruh katalog:

### 4.1. Katalog Classes (50 Kelas Terstruktur)
Terdiri dari 50 kelas profesi yang tersebar di 5 Tier:
- **Tier 1 (Novice)**: Dasar petualang (*Fighter, Scout, Apprentice, Acolyte, dll.*).
- **Tier 2 (Adept)**: Spesialisasi tempur pertama (*Knight, Berserker, Ranger, Elementalist, Pyromancer, dll.*).
- **Tier 3 (Master)**: Penguasaan tingkat lanjut (*Paladin, Assassin, Archmage, Shadow Walker, dll.*).
- **Tier 4 (Paragon)**: Puncak potensi fana (*Warlord, Void Weaver, Grand Inquisitor, dll.*).
- **Tier 5 (Legendary)**: Kelas mitologis bergelar (*Godslayer, Dragon Lord, Avatar, Sovereign*).

### 4.2. Katalog Skills (429 Skill Padat & Kontigu)
Setelah pembersihan 134 skill usang sisa warisan lama, database Skills terstruktur rapi:
- **ID #1 & #2**: Serangan Dasar (*Attack*) & Bertahan (*Guard*).
- **ID #12 – #232**: **221 Skill Resmi 50 Kelas** (Tier 1 s/d Tier 5) 100% terlindungi tanpa pergeseran angka untuk menjaga integritas 182 Scroll TMs dan movepool kelas.
- **ID #233 – #425**: **193 Skill Aksi Musuh & Bos** tersusun kontigu tanpa celah kosong.
- **ID #426 – #429**: **4 Skill Eksplorasi Grimoire** (*Lumos, Garuda's Wings, Trailblaze, Water Strider*).
- **ID #431 – #440**: **10 Skill Serangan Dasar Senjata** (Long Sword, Sword, Gloves, Spear, Axe, Staff, Rune, Long Bow, Crossbow, Dagger).

### 4.3. Katalog States (109 State Padat — 0 Empty Slots)
Database States dirampingkan dari 275+ entri usang menjadi 109 state terstruktur (model status turn-based klasik):
- **ID #1 – #20 (Status Ailments Kanonikal)**:
  *Death (#1), Defend (#2), Poison (#4), Burn (#5), Bleed (#6), Paralyze (#7), Sleep (#8), Confuse (#9), Curse (#10), Stun (#11), Slow (#12), Freeze (#13), Blind (#14), Fear (#15), Silence (#16), Root (#17), Vulnerable (#18), Haste (#19), Taunt (#20)*.
- **ID #21 – #25 (Penanda Taktikal & Elemen)**:
  *Soaked (#21), Shock (#22), Petrify (#23), Float (#24), Marked (#25)*.
- **ID #26 – #37 (Universal Stat Stages / Buff & Debuff +/- 1)**:
  *ATK Up/Down, DEF Up/Down, MAT Up/Down, MDF Up/Down, Speed Up, Critical Focus, Evasion Up, Barrier*.
- **ID #38 – #44 (Mode Tempur & Stance Spesifik)**:
  *Berserk Mode, Dragon Stance, Shadow Mode, Avatar of Guardian, State of Nirvana, Chi Hyper-Burst, Ancestral Protection*.
- **ID #45 – #47 (Pasif Universal Aksesoris)**:
  *Iron Skin, Mind Focus, Fleet Footed*.
- **ID #48 – #59 (12 Pasif Alami Ras)**:
  *Pribumi, Wahanarsa, Asrivana, Avesari, Butoraksa, Garuda, Hanorok, Nagarasven, Rakshorien, Troliogoro, Dewantara, Bhuta*.
- **ID #60 – #109 (50 Pasif Alami Kelas)**:
  Terkait langsung dengan notetag `<Passive State: ID>` di `Classes.json` (ID = 59 + Class ID).

### 4.4. Katalog Items (109 Item Terstruktur)
Mereduksi 398 item warisan lama menjadi 109 item fungsional yang terbagi rapi ke dalam 5 kategori:
- **Consumables (#01–#29)**: Pemulih HP/MP/SP, Elixir, Phoenix Feather, 10 Obat Penawar Status, 5 Tonik Stat Stage, Smoke Bomb.
- **Crafting Materials (#30–#62)**: 33 Material Tier 1–5 selaras resep senjata & zirah (Logam, Kayu, Kulit, Kain, Herbal, Inti Elemen).
- **Forge & Socket (#63–#87)**: 25 Kristal soket stat (T1–T3), Kristal Vitalitas, Enhance Stone, Socket Chisel.
- **Valuables (#88–#97)**: Komoditas jual Saka (Tembaga, Perak, Emas, Permata, Relik Naga).
- **Key Items (#98–#109)**: Kontrak Iblis, Lencana Gilda, Kunci Reruntuhan, Peta Dunia, Memory Shard.
- **Scroll Pusaka (#400–#581)** & **Grimoire (#582–#585)**: 100% terlindungi tanpa pergeseran ID untuk integritas pembelajaran skill.

---

## 5. Ringkasan File Plugin Terdaftar (Urutan plugins.js)

Total 65 plugin aktif di [js/plugins.js](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/js/plugins.js):

| # | Nama Plugin | Kategori | Ringkasan Fungsi Utama |
|---|---|---|---|
| 01 | `YEP_CoreEngine` | Core Engine | Resolusi 1080x720, font, limit gold/item, bugfix MV |
| 02 | `NUSV_OptionsCore` | Core UI | Auto Dash, Battle Log Speed 1–5, Animation Speed 1–5 |
| 03 | `YEP_BattleEngineCore` | Battle Core | Flow battle, visual select, action sequence execution |
| 04 | `YEP_X_ActSeqPack1` | Battle Visual | Gerakan dasar, wait, play animation, damage effect |
| 05 | `YEP_X_ActSeqPack2` | Battle Visual | Motion pose, jump, float, face direction |
| 06 | `YEP_X_ActSeqPack3` | Battle Visual | Kamera tempur, smooth focus, zoom in/out dinamis |
| 07 | `YEP_X_BattleSysCTB` | Battle System | Charge Turn Battle berbasis kecepatan aksi real-time |
| 08 | `NUSV_CTBCalibration` | Battle Polish | Fallback Icon 76, face cropping 82%, plural letters A/B/C |
| 09 | `YEP_SkillCore` | Skill Core | Kontrol biaya skill (HP, MP, SP), lunatic eval |
| 10 | `YEP_BuffsStatesCore` | States | Batas buff/debuff, angka giliran, state counters |
| 11 | `YEP_AutoPassiveStates` | States | Status pasif otomatis pada aktor, kelas, skill, senjata |
| 12 | `YEP_ElementCore` | Combat Math | Multi-elemen, penyerapan (absorb), pantulan (reflect) |
| 13 | `YEP_BattleAICore` | AI Core | AI prioritas keputusan musuh bertingkat |
| 14 | `YEP_BaseTroopEvents` | Event Battle | Eksekusi otomatis Troop ID 1 di seluruh battle |
| 15 | `NUSV_DamageCore` | Combat Math | Multiline formula, Damage/Heal Cap, Penetration DEF/MDF |
| 16 | `NUSV_BattlePopups` | Battle Polish | Tipografi vektor HD BattleFont, overhead position, color coded |
| 17 | `NUSV_VFXKeyframes` | VFX Engine | Keyframe lintasan A-B, scale, deterministic direction |
| 18 | `NUSV_ProjectileEngine` | VFX Engine | Universal flying projectiles, parabolic arc, rotate tangent |
| 19 | `NUSV_BattlePreview` | Studio Bridge | Native 1v1 duel preview sandbox di Scene_Battle |
| 20 | `NUSV_CriticalControl` | Combat Math | Crit Rate, Multiplier, Flat Crit, Force Critical |
| 21 | `NUSV_TargetCore` | Targeting | Multiple random targets, target parameter, row targets |
| 22 | `NUSV_SelectionControl` | Targeting | Batasan target (State, HP/MP rate, tipe musuh) |
| 23 | `NUSV_ExtraParamFormula`| Combat Math | Formula X-Parameter (HIT, EVA, CRI, CEV, TRG) |
| 24 | `NUSV_SpecialParamFormula`| Combat Math | Formula S-Parameter (TGR, GRD, PDR, MDR, TCR) |
| 25 | `NUSV_InstantCast` | Battle Action | Aksi instan tanpa memakan giliran (Free/Turn) |
| 26 | `NUSV_EnemyLevels` | Progression | Level musuh dinamis, scaling parameter, EXP, Gold |
| 27 | `NUSV_DifficultySlider` | Progression | Kesulitan 1–4 (Easy, Normal, Hard, Nightmare) |
| 28 | `YEP_X_AnimatedSVEnemies`| Battler Visual| Musuh animated sideview actor, breathing, weapon |
| 29 | `YEP_ItemCore` | Item Core | Independent items, instansiasi senjata & zirah |
| 30 | `YEP_EquipCore` | Equip Core | Slot equipment fleksibel, syarat pemakaian perlengkapan |
| 31 | `NUSV_EquipRules` | Equip Core | Aturan 1H vs 2H segel slot 2, Dual Wield fisik & rune |
| 32 | `NUSV_ItemUpgrade` | Progression | Penempaan senjata/zirah +1 s/d +15, biaya gold & materi |
| 33 | `NUSV_SocketCore` | Progression | Slot socket permata penambah stat pada equipment |
| 34 | `NUSV_WeaponUnleash` | Combat Action | Attack replacement, auto-fallback 10 senjata dasar |
| 35 | `NUSV_JobPoints` | Progression | Sistem perolehan JP, integrasi victory aftermath |
| 36 | `SRD_SummonCore` | Battle Action | Pemanggilan aktor bantuan (Summon) ke arena pertempuran |
| 37 | `SRD_SummonBattlerImages`| Battler Visual| Gambar statis untuk karakter hasil pemanggilan |
| 38 | `YEP_MessageCore` | Message UI | Name box dialog, ukuran font fleksibel, escape codes |
| 39 | `YEP_QuestJournal` | Quest UI | Buku catatan misi petualangan terintegrasi |
| 40 | `YEP_SaveCore` | Menu UI | Layout simpan/muat permainan estetis & slot banyak |
| 41 | `YEP_MoveRouteCore` | Map System | Script pergerakan langkah, step forward/backward |
| 42 | `YEP_EventChasePlayer` | Map AI | AI patroli musuh mengejar dan menjauhi pemain di map |
| 43 | `YEP_RegionRestrictions` | Map Collision | Pembatasan akses tile via Region ID |
| 44 | `YEP_RegionEvents` | Map System | Memicu Common Event saat menginjak Region ID tertentu |
| 45 | `NUSV_EventChaseStealth`| Map Mechanic | Mode senyap (Stealth Mode) menghindari kejaran musuh |
| 46 | `YEP_VictoryAftermath` | Battle Polish | Jendela hasil akhir pertempuran interaktif & JP |
| 47 | `YEP_MainMenuManager` | Menu Core | Tata kelola urutan perintah main menu |
| 48 | `NUSV_ItemMenuCategories`| Menu UI | Kategori item: Consumable, Material, Forge, Valuable |
| 49 | `NUSV_PartySystem` | Party System | Pengelolaan anggota tempur, formasi, dan kunci aktor |
| 50 | `NUSV_ClassChange` | Progression | Pergantian kelas profesi, Tier Cap, dan sinkronisasi skill |
| 51 | `NUSV_SkillLearn` | Progression | Menu belajar skill menggunakan JP, Gold, dan Item |
| 52 | `NUSV_ItemSynthesis` | Progression | Crafting dan sintesis item/perlengkapan dari resep |
| 53 | `NUSV_MainMenuBridge` | Menu Bridge | Integrasi menu NUSV dengan YEP Main Menu Manager |
| 54 | `NUSV_MapSelectEquip` | Map Utility | Pemilihan senjata/zirah di map menyimpan ID ke variabel |
| 55 | `NUSV_MapSelectItem` | Map Utility | Pemilihan item di map dengan filter kategori |
| 56 | `NUSV_MapSelectSkill` | Map Utility | Pemilihan skill yang telah dipelajari di map |
| 57 | `NUSV_ButtonCommonEvents`| Map Control | Hotkey keyboard instan memicu Common Event |
| 58 | `NUSV_GameFontBaseline` | UI Polish | Koreksi baseline vertikal font GameFont |
| 59 | `NUSV_AlwaysCenterPlayer`| Camera Map | Kamera selalu mengunci pemain di tengah layar map |
| 60 | `NUSV_AutoTextWrap` | Text UI | Pembungkus kata otomatis untuk pesan & deskripsi |
| 61 | `NUSV_InventoryUI` | Menu UI | Grid inventaris modern 6 kolom, Rarity, Signature Effect |
| 62 | `NUSV_StatSystem` | Attribute Core | 6 Base Stats, Stat Points, kalkulasi turunan & SP dinamis |
| 63 | `NUSV_ClassLevel` | Dual Level | Base Level vs Class Level, Class Stat Growth & Tier Cap |
| 64 | `NUSV_StaminaBattle` | Battle Action | Guard Stamina Surge & On-Hit Adrenaline SP Recovery |
| 65 | `NUSV_StatusScreen` | Menu UI | Tata letak status 3 kolom Genshin-style & tooltip effect |

---

## 6. Protokol Pemeliharaan & Alat Kerja (Active Tooling Suite)

Semua script pembantu yang dipertahankan berada di folder [tools/](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/tools/):

1. **`python3 tools/launch_studio.py`**:
   Menjalankan NUSV Database Studio sebagai aplikasi desktop mandiri (*standalone window*).
2. **`python3 tools/nusv_editor_server.py`**:
   Server backend REST API database editor pada port `5050` dengan auto-backup data.
3. **`python3 tools/build_complete_studio.py`**:
   Membundel modul-modul `editor_studio/` ke dalam `editor.bundled.html` dan memperbarui `editor.html`.
4. **`python3 tools/bundle_editor.py`**:
   Engine utama konkatensasi modular CSS/JS studio.
5. **`python3 tools/test_browser_parity.py`**:
   Suite pengujian otomatis headless browser (BiDi WebDriver 1440x900) yang memverifikasi kedua endpoint (`/` dan `/editor.bundled.html`) serta in-game native battle preview sandbox (`/index.html?skillPreview=1`).
6. **`python3 tools/verify_database_integrity.py`**:
   Memeriksa integritas seluruh file JSON database (validasi ID kontigu, 0 broken references, dan konsistensi relasi kelas/skill/state).
7. **`python3 tools/verify_editor.py`**:
   Memverifikasi keberadaan seluruh komponen UI dan fitur editor modular.
8. **`create_desktop_shortcut.bat`**:
   Pembuat shortcut desktop Windows untuk akses cepat Database Studio.

---

## 7. Status Checkpoint & Integritas Proyek

- **Status Kode & Aset**: Bersih (*Clean Architecture*). Seluruh script sementara (one-off scripts migrasi data) telah diarsipkan/dibersihkan.
- **Hasil Pengujian Otomatis**:
  - `python3 tools/test_browser_parity.py`: **ALL TESTS PASSED** (0 unhandled exceptions / 0 page errors).
  - `python3 tools/verify_database_integrity.py`: **0 broken references** di seluruh file database JSON.
- **Kesiapan Pengembangan Lanjutan**:
  Fondasi arsitektur pertempuran, studio aksi koreografi, dan struktur database telah selesai 100% dan terkunci (*frozen*), siap untuk pengisian konten naratif, quest map, dan balancing angka tingkat lanjut.
