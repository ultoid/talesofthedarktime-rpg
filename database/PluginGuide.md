# PluginGuide.md

Panduan ini merangkum seluruh plugin yang ada di project **Tales of The Dark Time**. Fokus utama ada pada plugin `NUSV_*` karena plugin ini dibuat khusus (clean-room custom engine) untuk project ini. Plugin YEP, SRD, dan plugin bawaan lainnya tetap dirangkum secara lengkap agar fungsi, notetag, plugin command, dan script call pentingnya mudah dipahami serta diintegrasikan.

---

## Cara Baca Notetag

Notetag ditulis di kolom **Note** database RPG Maker MV (Actor, Class, Skill, Item, Weapon, Armor, Enemy, State), kecuali jika disebutkan secara khusus sebagai **Event Comment** (di lembar event page).

Contoh notetag single-line:

```text
<Damage Cap: 50000>
<Class Tier: 2>
<NUSV Rarity: Epic>
```

Untuk blok multiline, tulis lengkap tag pembuka dan penutup:

```text
<Damage Formula>
value = a.atk * 4 - nusvDef(b) * 2;
if (b.isStateAffected(10)) value *= 1.25;
</Damage Formula>
```

Variabel umum yang sering digunakan di formula dan lunatic code:

- `a`, `user`, `subject`: battler pemakai skill/item.
- `b`, `target`: battler penerima aksi/efek.
- `item`, `skill`, `cls`: objek database yang sedang diproses.
- `s`: `$gameSwitches._data`.
- `v`: `$gameVariables._data`.
- `condition`: boolean penentu apakah requirement / evaluasi terpenuhi.
- `value`: angka kalkulasi hasil formula.

---

## Urutan Plugin Aktif (plugins.js)

Daftar plugin yang aktif saat ini berstatus `true` di [js/plugins.js](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/js/plugins.js):

1. `YEP_CoreEngine`
2. `NUSV_OptionsCore`
3. `YEP_BattleEngineCore`
4. `YEP_X_ActSeqPack1`
5. `YEP_X_ActSeqPack2`
6. `YEP_X_ActSeqPack3`
7. `YEP_X_BattleSysCTB`
8. `NUSV_CTBCalibration`
9. `YEP_SkillCore`
10. `YEP_BuffsStatesCore`
11. `YEP_AutoPassiveStates`
12. `YEP_ElementCore`
13. `YEP_BattleAICore`
14. `YEP_BaseTroopEvents`
15. `NUSV_DamageCore`
16. `NUSV_BattlePopups`
17. `NUSV_VFXKeyframes`
18. `NUSV_ProjectileEngine`
19. `NUSV_BattlePreview`
20. `NUSV_CriticalControl`
21. `NUSV_TargetCore`
22. `NUSV_SelectionControl`
23. `NUSV_ExtraParamFormula`
24. `NUSV_SpecialParamFormula`
25. `NUSV_InstantCast`
26. `NUSV_EnemyLevels`
27. `NUSV_DifficultySlider`
28. `YEP_X_AnimatedSVEnemies`
29. `YEP_ItemCore`
30. `YEP_EquipCore`
31. `NUSV_EquipRules`
32. `NUSV_ItemUpgrade`
33. `NUSV_SocketCore`
34. `NUSV_WeaponUnleash`
35. `NUSV_JobPoints`
36. `SRD_SummonCore`
37. `SRD_SummonBattlerImages`
38. `YEP_MessageCore`
39. `YEP_QuestJournal`
40. `YEP_SaveCore`
41. `YEP_MoveRouteCore`
42. `YEP_EventChasePlayer`
43. `YEP_RegionRestrictions`
44. `YEP_RegionEvents`
45. `NUSV_EventChaseStealth`
46. `YEP_VictoryAftermath`
47. `YEP_MainMenuManager`
48. `NUSV_ItemMenuCategories`
49. `NUSV_PartySystem`
50. `NUSV_ClassChange`
51. `NUSV_SkillLearn`
52. `NUSV_ItemSynthesis`
53. `NUSV_MainMenuBridge`
54. `NUSV_MapSelectEquip`
55. `NUSV_MapSelectItem`
56. `NUSV_MapSelectSkill`
57. `NUSV_ButtonCommonEvents`
58. `NUSV_GameFontBaseline`
59. `NUSV_AlwaysCenterPlayer`
60. `NUSV_AutoTextWrap`
61. `NUSV_InventoryUI`
62. `NUSV_StatSystem`
63. `NUSV_ClassLevel`
64. `NUSV_StaminaBattle`
65. `NUSV_StatusScreen`

> [!NOTE]
> File yang tidak aktif di `plugins.js` (`status: false`): `Community_Basic`, `CustomLogo`, dan separator `--------------------`.
> File yang dipindahkan ke folder [js/plugins/_unused/](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/js/plugins/_unused/): `WeaponSkill`, `YEP_X_ExtMovePack1`, `AltMenuScreen`, `AltSaveScreen`, `EnemyBook`, `ItemBook`, `MadeWithMv`, `SimpleMsgSideView`, dan `TitleCommandPosition`.

---

## NUSV_OptionsCore

Fungsi: Mengatur opsi pada layar Options menu, membersihkan entri default, dan menambahkan opsi persistent khusus engine NUSV.

Opsi tambahan:
- `Auto Dash` (default MV walk/dash invert)
- `Battle Log Speed` (nilai 1 sampai 5, default: 3)
- `Animation Speed` (nilai 1 sampai 5, default: 3)
- `Difficulty` (terintegrasi dengan `NUSV_DifficultySlider`)

Script Calls:
```javascript
ConfigManager.nusvAutoDash
ConfigManager.nusvBattleLogSpeed
ConfigManager.nusvAnimationSpeed
```

---

## NUSV_CTBCalibration

Fungsi: Kalibrasi visual dan pacing antrean giliran untuk `YEP_X_BattleSysCTB`.

Fitur Utama:
1. **Fallback Enemy Icon**: Mencegah ikon antrean musuh kosong/transparan jika musuh belum memiliki sprite statis atau notetag `<CTB Icon: x>`. Menggunakan Icon 76 (Crossed Swords) secara default.
2. **Enhanced Face Cropping**: Memotong dan memfokuskan sprite wajah aktor (144x144) ke area kepala dan mata (~82% bagian atas) sehingga potret wajah terlihat proporsional dan ekspresif di dalam frame icon antrean CTB.
3. **Anti-Overlap Plural Enemy Letters**: Menempatkan huruf musuh jamak (A, B, C) di sudut kanan bawah dengan font size 14px dan outline hitam tegas tebal (3px), sehingga tidak menutupi ilustrasi wajah/ikon battler.

Parameter:
- `Fallback Enemy Icon`: Default `76`
- `Enhanced Face Crop`: `true`
- `Letter Font Size`: Default `14`

---

## NUSV_DamageCore

Fungsi: Mengatur formula damage multiline, batas damage/heal (Damage Cap), bypass cap, penetrasi armor & magic (Armor/Magic Penetration), bonus critical damage, dan indikator teks perolehan MP/SP.

Skill / Item Notetags:
```text
<Damage Formula>
value = a.atk * 5 - nusvDef(b) * 2;
if (b.isStateAffected(10)) value *= 1.25;
</Damage Formula>

<Damage Cap: 50000>
<Heal Cap: 50000>
<Bypass Damage Cap>
```

Actor / Class / Enemy / Weapon / Armor / State Notetags:
```text
<Damage Cap: 50000>
<Heal Cap: 50000>
<Bypass Damage Cap>
<Armor Penetration: 15%>
<Magic Penetration: 15%>
<Critical Damage: +25%>
```

Helper Formula:
- `nusvDef(b)`: Mengembalikan nilai DEF target setelah dikurangi persentase Armor Penetration milik penyerang.
- `nusvMdf(b)`: Mengembalikan nilai MDF target setelah dikurangi persentase Magic Penetration milik penyerang.

Contoh pemakaian:
```text
<Damage Formula>
value = a.atk * 4 - nusvDef(b) * 2;
</Damage Formula>
```

Indikator MP & SP In-Battle:
Saat battler memulihkan MP atau SP dalam pertarungan, plugin memunculkan popup teks terstandar: `+10 MP`, `+10 SP`, atau `MP Max` / `SP Max` jika nilai mencapai batas maksimal.

---

## NUSV_BattlePopups

Fungsi: Perombakan visual total sistem damage popup dan indikator battle untuk RPG Maker MV + `YEP_BattleEngineCore`.

Fitur Utama:
1. **Tipografi Vektor Resolusi Tinggi (HD Typography)**:
   - Menggantikan bitmap raster kuno (`Damage.png`) dengan font vektor `BattleFont` (`fonts/final-fantasy-advance-ds.otf`).
   - Dilengkapi outline tebal (5px) dan drop shadow pekat agar terbaca jelas di background apapun.
2. **Skema Warna Stat Terstandar**:
   - Damage ke Musuh: Putih bersih (`#FFFFFF`) ber-outline pekat (`#111111`).
   - Damage ke Party: Coral / Merah peringatan (`#FF6B6B`).
   - Critical Hit: Emas cemerlang (`#FFD700`) dilengkapi badge teks `CRITICAL!`.
   - HP Heal: Hijau zamrud cerah (`#2ECC71`) diawali tanda `+`.
   - MP Damage: Ungu amethyst (`#A855F7`).
   - MP Heal: Biru langit / Cyan (`#00E5FF`).
   - Miss / Evade: Perak halus (`#E5E7EB`) bergaya miring (*italic*).
3. **Overhead Positioning & Staggering**:
   - Angka damage tidak lagi menutupi badan atau animasi battler, melainkan muncul di atas kepala battler (`-spriteHeight - overheadOffset`).
   - Serangan beruntun (multi-hit / combo) mengalir naik secara bertingkat (+22px per hit).
4. **Overhead Enemy Nameplate**:
   - Memindahkan nama musuh saat Visual Enemy Select ke atas kepala dengan plat kapsul gelap semi-transparan (*dark pill*).

Parameter:
- `Popup Font Face`: `BattleFont, sans-serif`
- `Damage Font Size`: `28`
- `Critical Font Size`: `34`
- `Heal Font Size`: `26`
- `Miss Font Size`: `22`
- `Overhead Offset`: `20`
- `Popup Duration`: `65` frame
- `Enemy Name Font Size`: `16`

---

## NUSV_VFXKeyframes

Fungsi: Engine keyframe lintasan visual (trajectory keyframes), interpolasi gerak real-time, scale tweening, flip, sinkronisasi arah animasi, dan adaptive frame rate untuk skill / animasi pertempuran.

Fitur Utama:
1. **Integrasi Skill Animation Studio**:
   Membaca metadata konfigurasi JSON yang disematkan di kolom Note skill / item:
   ```text
   <!-- NUSV_ACTION_CONFIG: {"steps":[{"type":"action","animId":15,"useKeyframes":true,"kfStart":0,"kfDuration":14,"kfEasing":"ease-out","offsetX":0,"offsetY":0,"endOffsetX":-180,"endOffsetY":0,"scale":100,"scaleEnd":120}]} -->
   ```
2. **Sinkronisasi Arah Serangan Cerdas (Deterministic Combat Direction)**:
   - Aktor / Party menyerang Musuh: Selalu menebas / meluncur ke arah **KIRI** (`mirror = true`).
   - Musuh menyerang Party: Selalu menebas / meluncur ke arah **KANAN** (`mirror = false`).
   - Skill Buff / Heal / Self: Selalu unmirrored (`mirror = false`).
   - Mengabaikan flag mirror redundan pada action sequence legacy agar arah tetap konsisten.
3. **Adaptive Frame Rate & Smooth Easing**:
   - Mendukung kurva pergerakan `ease-out`, `ease-in`, `ease-in-out`, dan linier.
   - Menghentikan sprite proyektil saat mencapai target agar tidak meninggalkan efek bayangan palsu (*phantom sprite*).
   - Menahan flash target dini selama proyektil masih melayang di udara.

---

## NUSV_ProjectileEngine

Fungsi: Universal Flying Projectile Engine terintegrasi langsung dengan Action Sequences (`YEP_BattleEngineCore` & `YEP_X_ActSeqPack1..3`) dan Studio Event-Command. Memungkinkan panah, senjata lempar, proyektil sihir, dan bola elemen terbang melintasi layar dari user ke target dengan kurva parabola atau lintasan lurus.

### Sintaks Action Sequence Projectile

1. **Weapon Projectile Otomatis** (Mendeteksi elemen senjata dan tipe senjata):
   ```text
   projectile weapon: start user, goal target, duration 16, arc 35
   projectile weapon: target, 16, 35
   ```

2. **Database Animation Projectile**:
   ```text
   projectile animation 15: start user, goal target, duration 18, arc 25
   projectile animation 4: start user, goal target, duration 16, arc 30, impact 1
   ```

3. **Icon Projectile (IconSet.png)**:
   ```text
   projectile icon 161: start user, goal target, duration 16, arc 30, rotate
   projectile icon 165: start user, goal target, duration 14, arc 10, spin 20
   ```

4. **Menunggu Proyektil Sampai di Target**:
   ```text
   wait for projectile
   ```

### Daftar Argumen Lengkap

- `start [user / target / screen / X Y]`: Posisi awal proyektil (default: `user`).
- `start offset [X Y]`: Offset pixel posisi awal (contoh: `start offset 20 -10`).
- `goal [target / user / screen / X Y]`: Posisi tujuan proyektil (default: `target`).
- `goal offset [X Y]`: Offset pixel posisi tujuan (contoh: `goal offset 0 -20`).
- `duration [frames]`: Durasi terbang dalam frame (default: `16`).
- `arc [pixels]`: Tinggi lengkungan parabola (default: `25`, `0` = lurus seperti laser).
- `rotate [true/false]`: Menyesuaikan sudut orientasi proyektil secara otomatis mengikuti arah kurva terbang.
- `angle [degrees]`: Offset sudut awal dalam derajat (default: `45` untuk ikon MV).
- `spin [degrees]`: Kecepatan rotasi berputar terus-menerus per frame.
- `scale [multiplier]`: Skala visual proyektil (default: `1.0`).
- `impact [animationId]`: Database animation ID yang diputar pada target saat proyektil mendarat.
- `delay [frames]`: Waktu jeda sebelum proyektil mulai meluncur.

### Mapping Default Elemen ke Animasi Proyektil
- Elemen 1 (Neutral): Animasi `#56` (Arcane Missiles Bolt)
- Elemen 2 (Fire): Animasi `#15` (Fireball)
- Elemen 3 (Water): Animasi `#28` (Water Jet)
- Elemen 4 (Earth): Animasi `#31` (Stone Spire)
- Elemen 5 (Air): Animasi `#34` (Emerald Gale Tornado)
- Elemen 6 (Electric): Animasi `#27` (Plasma Ball)
- Elemen 7 (Ice): Animasi `#21` (Ice Lance)
- Elemen 8 (Steel): Animasi `#4` (Arrow Shot)
- Elemen 9 (Sound): Animasi `#11` (Chi Shockwave)
- Elemen 10 (Holy): Animasi `#40` (Holy Smite)
- Elemen 11 (Dark): Animasi `#44` (Void Dark Orb)

---

## NUSV_BattlePreview

Fungsi: Menghubungkan engine game RPG Maker MV secara langsung dengan Database Studio untuk pratinjau pertarungan 100% akurat di dalam engine asli.

Fitur Utama:
- Diaktifkan melalui parameter URL: `?skillPreview=ID` atau `?skillId=ID`
- **1v1 Solo Duel Sandbox**: Memuat tepat 1 Aktor vs 1 Musuh boneka latih (*dummy*).
- Melewati layar judul (*title screen*) dan langsung masuk ke `Scene_Battle`.
- Aktor otomatis mempelajari skill yang diuji dengan MP & SP tak terbatas.
- Boneka musuh dibuat abadi (*immortal*) sehingga pertarungan tidak berakhir dengan layar Victory/Defeat prematur.
- **Live Preview & Hot Reload**: Menerima pembaruan notetag dan action sequence yang belum disimpan dari editor via `postMessage` tanpa perlu me-reload halaman browser.
- Mendukung instant replay dan pengaturan kecepatan real-time (0.5x, 1x, 2x).
- Nol overhead pada permainan normal karena keluar (*early exit*) jika URL parameter tidak aktif.

---

## NUSV_CriticalControl

Fungsi: Mengatur persentase peluang critical (Crit Rate), pengali damage critical (Critical Multiplier), dan damage flat critical.

Skill / Item:
```text
<Critical Rate: 25%>
<Critical Rate: 0.25>
<Critical Multiplier: 250%>
<Critical Multiplier: 2.5>
<Flat Critical: 50% atk>
```

Actor / Class / Enemy / Weapon / Armor / State:
```text
<Critical Multiplier: +25%>
<Critical Multiplier: -25%>
<Flat Critical: +100>
<Flat Critical: -50>
<Certain Hit Critical Rate: +10%>
<Physical Critical Rate: +10%>
<Magical Critical Rate: +10%>
```

Formula Khusus Skill / Item:
```text
<Critical Rate Formula>
rate = user.cri + 0.20;
rate -= target.cev;
</Critical Rate Formula>

<Critical Multiplier Formula>
value *= 3.0 + bonus;
</Critical Multiplier Formula>

<Flat Critical Formula>
value += 1.5 * user.luk + bonus;
</Flat Critical Formula>
```

Action Sequence Commands:
```text
CRITICAL MULTIPLIER: 50%
CRITICAL MULTIPLIER: 2.5
CRITICAL MULTIPLIER: VARIABLE 3
FLAT CRITICAL: +100
FLAT CRITICAL: VARIABLE 3
FORCE CRITICAL
FORCE NO CRITICAL
NORMAL CRITICAL
```

---

## NUSV_TargetCore

Fungsi: Memperluas cakupan dan variasi pemilihan target skill atau item.

Skill / Item:
```text
<Repeat: 12>
<Target: Everybody>
<Target: 3 Random Any>
<Target: Target All Foes>
<Target: Target 3 Random Foes>
<Target: 6 Random Foes>
<Target: All Allies But User>
<Target: Target All Allies>
<Target: Target 3 Random Allies>
<Target: 6 Random Allies>
```

Target Berdasarkan Parameter (Kelipatan):
```text
<Target: Everybody atk Multiple Of 10>
<Target: Allies hp Multiple Of 100>
<Target: Foes agi Multiple Of 5>
```
*Parameter valid: `level`, `maxhp`, `maxmp`, `atk`, `def`, `mat`, `mdf`, `agi`, `luk`, `hp`, `mp`, `tp`.*

Custom Target Eval:
```text
<Custom Target Eval>
for (var i = 0; i < foes.aliveMembers().length; ++i) {
  var member = foes.aliveMembers()[i];
  if (member.hpRate() < 0.5) targets.push(member);
}
</Custom Target Eval>
```

Bantuan Teks Target:
```text
<Custom Target Text>
text = "Menarget semua musuh yang terluka.";
</Custom Target Text>
```

Sistem Baris (Row Target):
```text
<Target: Enemy Row>
<Target: Enemy Row 2>
<Target: Front Enemy Row>
<Target: Back Enemy Row>
<Target: Ally Row>
<Target: Ally Row 2>
<Target: Front Ally Row>
<Target: Back Ally Row>
```

---

## NUSV_SelectionControl

Fungsi: Memberikan aturan pembatasan siapa saja yang boleh dan tidak boleh dipilih sebagai target.

Skill / Item:
```text
<Select Allies>
<Select Foes>
<Select Dead Allies>
<Cannot Select User>
<Only Select User>
```

Berdasarkan State / Aktor / Tipe Musuh:
```text
<Select State: 10>
<Select State: Poison>
<Cannot Select State: 10>
<Select Actor: 3>
<Cannot Select Actor: 3>
<Select Enemy: 5>
<Cannot Select Enemy: 5>
<Select Actor Type: Fighter>
<Select Enemy Type: Undead>
```

Notetag pada Enemy:
```text
<Enemy Type: Undead>
```

Berdasarkan Kondisi Parameter:
```text
<Select HP Above: 50%>
<Select HP Below: 50%>
<Select MP Above: 25%>
<Select TP Below: 50>
<Select ATK Above: 100>
<Select DEF Below: 80>
<Select MAT Above: 120>
<Select MDF Below: 100>
<Select AGI Above: 75>
<Select LUK Below: 50>
```

Custom Selection:
```text
<Custom Select Condition>
condition = target.hpRate() < 0.5;
</Custom Select Condition>

<Custom Select Text>
text = "Hanya bisa memilih rekan yang terluka.";
</Custom Select Text>
```

---

## NUSV_ExtraParamFormula

Fungsi: Mengatur kalkulasi X-Parameter (Ex-Parameters) menggunakan formula fleksibel. X-Parameter dinyatakan dalam desimal (`5% = 0.05`).

Kode Parameter:
- `HIT`: Akurasi
- `EVA`: Evasion
- `CRI`: Critical Rate
- `CEV`: Critical Evasion
- `MEV`: Magic Evasion
- `MRF`: Magic Reflection
- `CNT`: Counter Rate
- `HRG`: HP Regeneration
- `MRG`: MP Regeneration
- `TRG`: TP/SP Regeneration

Actor / Class / Enemy / Weapon / Armor / State:
```text
<HIT Plus: +5%>
<EVA Plus: +10%>
<CRI Plus: +3%>
<CEV Plus: +5%>
<MEV Plus: +5%>
<MRF Plus: +5%>
<CNT Plus: +10%>
<HRG Plus: +3%>
<MRG Plus: +2%>
<TRG Plus: +5%>

<HIT Rate: 110%>
<EVA Rate: 125%>
<CRI Rate: 150%>
```

Custom Formula:
```text
<HIT Formula>
value += user.agi * 0.0005;
</HIT Formula>

<CRI Formula>
if (user.hpRate() <= 0.5) value += 0.10;
</CRI Formula>
```
*Catatan: Gunakan `base` dan jangan panggil parameter yang sama di formulanya sendiri.*

---

## NUSV_SpecialParamFormula

Fungsi: Mengatur kalkulasi S-Parameter (Special Parameters) menggunakan formula fleksibel. S-Parameter juga merupakan rate desimal (`100% = 1.00`).

Kode Parameter:
- `TGR`: Target Rate (peluang diserang)
- `GRD`: Guard Effect (efisiensi bertahan)
- `REC`: Recovery Effect
- `PHA`: Pharmacology (efektivitas item)
- `MCR`: MP Cost Rate
- `TCR`: TP/SP Charge Rate
- `PDR`: Physical Damage Rate (damage fisik yang diterima)
- `MDR`: Magical Damage Rate (damage sihir yang diterima)
- `FDR`: Floor Damage Rate
- `EXR`: Experience Rate

Actor / Class / Enemy / Weapon / Armor / State:
```text
<TGR Plus: +25%>
<GRD Plus: +20%>
<REC Plus: +10%>
<PHA Plus: +15%>
<MCR Plus: -10%>
<TCR Plus: +15%>
<PDR Plus: -10%>
<MDR Plus: -5%>
<FDR Plus: -25%>
<EXR Plus: +10%>

<TGR Rate: 125%>
<GRD Rate: 120%>
<REC Rate: 110%>
<MCR Rate: 90%>
<PDR Rate: 90%>
<MDR Rate: 95%>
```

Custom Formula:
```text
<PDR Formula>
if (user.hpRate() <= 0.25) value *= 0.85;
</PDR Formula>

<REC Formula>
if (user.isStateAffected(20)) value += 0.20;
</REC Formula>
```

---

## NUSV_InstantCast

Fungsi: Aksi skill atau item dieksekusi secara instan saat dipilih pada menu battle tanpa mengakhiri turn atau memperbolehkan input aksi berikutnya.

Skill / Item:
```text
<Instant Cast>
<Instant Cast: Turn>
<Instant Cast: Free>
<No Instant Cast>
```

Kondisional:
```text
<Instant Cast Condition>
condition = user.hpRate() <= 0.5;
</Instant Cast Condition>
```

Script Call:
```javascript
NUSV.InstantCast.isInstant(item, user)
```

---

## NUSV_EnemyLevels

Fungsi: Menentukan level untuk musuh dan melakukan kalkulasi kenaikan stat, EXP, serta Gold secara proporsional.

Enemy Notetags:
```text
<Enemy Level: 10>
<Enemy Level: 5 to 12>
<Enemy Level: Party>
<Minimum Level: 5>
<Maximum Level: 30>
<Level Variance: 2>
<No Level Scaling>
```

Formula Level Kustom:
```text
<Enemy Level Formula>
level = Math.floor(partyLevel + v[10]);
</Enemy Level Formula>
```

Pertumbuhan Stat per Level di atas Level 1:
```text
<Param Growth: 3%>
<MHP Growth: 5%>
<MMP Growth: 3%>
<ATK Growth: 4%>
<DEF Growth: 4%>
<MAT Growth: 4%>
<MDF Growth: 4%>
<AGI Growth: 2%>
<LUK Growth: 2%>
<EXP Growth: 10%>
<Gold Growth: 5%>
```

Plugin Commands:
```text
NUSVEnemyLevel Set 1 20
NUSVEnemyLevel Add 1 5
NUSVEnemyLevel Reset 1
```
*(Indeks troop musuh dimulai dari 1)*

Script Calls:
```javascript
enemy.level
enemy.nusvEnemyLevel()
enemy.nusvSetEnemyLevel(20)
enemy.nusvAddEnemyLevel(5)
enemy.nusvResetEnemyLevel()
```

---

## NUSV_DifficultySlider

Fungsi: Mengatur tingkat kesulitan permainan (Difficulty 1 sampai 4) yang menskalakan parameter musuh, EXP, dan perolehan Gold secara real-time.

Enemy Notetags:
```text
<No Difficulty Scaling>
<Difficulty Param Rate: 150%>
<Difficulty EXP Rate: 120%>
<Difficulty Gold Rate: 120%>

<Difficulty 3 Param Rate: 140%>
<Difficulty 4 Param Rate: 175%>
<Difficulty 3 EXP Rate: 120%>
<Difficulty 3 Gold Rate: 120%>
```

Plugin Commands:
```text
NUSVDifficulty Set 1
NUSVDifficulty Set 2
NUSVDifficulty Set 3
NUSVDifficulty Set 4
NUSVDifficulty Next
NUSVDifficulty Previous
```

Preset Kesulitan:
- `1`: Easy (Param 80%, EXP 110%, Gold 110%)
- `2`: Normal (Param 100%, EXP 100%, Gold 100%)
- `3`: Hard (Param 125%, EXP 110%, Gold 110%)
- `4`: Nightmare (Param 150%, EXP 125%, Gold 125%)

---

## NUSV_EquipRules

Fungsi: Mengelola aturan kelayakan dan slot equipment secara ketat:
1. **Mekanisme 1-Handed (1H) vs 2-Handed (2H)**:
   - Senjata 2H (`<NUSV Hand Slot: 2H Primary+Secondary>` atau trait segel slot 2) memakan dua tangan.
   - Memasang senjata 2H di tangan utama (Slot 1) otomatis **MENYEGEL** slot Secondary (Slot 2) dan mengembalikan perisai / offhand ke tas inventory.
   - Senjata 2H tidak bisa dipasang di Slot 2.
2. **Dual Wield (Fisik & Sihir / Rune Dual Wield)**:
   - Kelas Fisik Dual Wield (Assassin, Shadow Walker): Dapat memakai Dagger, 1H Sword, atau Gloves di kedua tangan.
   - Kelas Sihir Dual Wield (24 kelas sihir pengguna Rune): Dapat memasang Rune di tangan kanan (Primary) dan Rune lain di tangan kiri (Secondary).
3. **Dual Accessory Slots**:
   - Karakter memiliki 2 slot Aksesori (Slot 6 dan Slot 6).
   - Kedua slot bebas memakai aksesori identik/kembar selama stok item mencukupi.
   - Notetag aktor untuk aksesori awal ke-2:
     ```text
     <Second Accessory: Nama Item / ID>
     <Accessory 2: Nama Item / ID>
     ```
4. **Universal Relic & Accessory Access**:
   - Seluruh kelas dapat menggunakan Aksesori (Slot 6) dan Relik (Slot 7) tanpa batasan Armor Type.

Parameter:
- `Universal Slots`: `6, 7`

---

## NUSV_ItemUpgrade

Fungsi: Sistem penempaan dan upgrade equipment menjadi `+1`, `+2`, hingga level maksimum yang ditentukan.

Weapon / Armor:
```text
<Upgrade Max: 10>
<Upgrade Gold: 500>
<Upgrade Material: Item 25, 2>
<Upgrade Success: 90%>
<Upgrade ATK: +3>
<Upgrade DEF: +2>
<Upgrade MAT: +4>
<Upgrade MDF: +4>
<Upgrade AGI: +1>
<Upgrade LUK: +1>
<Upgrade MHP: +20>
<Upgrade MMP: +10>
```

Formula Dinamis:
```text
<Upgrade Cost Formula>
gold = 500 * Math.pow(1.4, level);
</Upgrade Cost Formula>

<Upgrade Success Formula>
chance = Math.max(25, 100 - level * 5);
</Upgrade Success Formula>
```

Script Calls:
```javascript
NUSV.ItemUpgrade.level(item)
NUSV.ItemUpgrade.canUpgrade(item)
NUSV.ItemUpgrade.attempt(item)
```
*Catatan: Sistem upgrade disimpan pada instance independent equipment dari `YEP_ItemCore`.*

---

## NUSV_SocketCore

Fungsi: Menambahkan slot permata (socket) pada equipment yang dapat dipasangi batu permata penambah stat.

Weapon / Armor:
```text
<Sockets: 2>
```

Item Bahan Socket:
```text
<Socket Item>
<Socket MHP: +50>
<Socket MMP: +20>
<Socket ATK: +5>
<Socket DEF: +5>
<Socket MAT: +5>
<Socket MDF: +5>
<Socket AGI: +3>
<Socket LUK: +3>
<Socket Weapon Only>
<Socket Armor Only>
```

Script Calls:
```javascript
NUSV.SocketCore.socketCount(equipment)
NUSV.SocketCore.sockets(equipment)
NUSV.SocketCore.canAttach(equipment, item)
NUSV.SocketCore.attach(equipment, item)
NUSV.SocketCore.remove(equipment, index)
```
*Fungsi `remove()` mengembalikan item socket kembali ke tas inventaris party.*

---

## NUSV_WeaponUnleash

Fungsi: Menggantikan perintah Attack normal dengan skill spesifik dari Actor, Class, Weapon, Armor, atau State. Mendukung peluang proc (persentase) dan tingkat prioritas (priority).

### Auto-Fallback Serangan Dasar Senjata (Menggantikan WeaponSkill.js)
`NUSV_WeaponUnleash` secara otomatis memetakan 10 Tipe Senjata ke Skill Serangan Dasar (#431 s/d #440) jika tidak ada notetag unleash khusus yang aktif:

| ID | Tipe Senjata | Mapped Skill ID | Animasi Default |
|:---|:---|:---|:---|
| 01 | Long Sword | **Skill #431** | Animasi 6 |
| 02 | Sword | **Skill #432** | Animasi 2 |
| 03 | Gloves | **Skill #433** | Animasi 11 |
| 04 | Spear | **Skill #434** | Animasi 3 |
| 05 | Axe | **Skill #435** | Animasi 6 |
| 06 | Staff | **Skill #436** | Animasi 56 |
| 07 | Rune | **Skill #437** | Animasi 25 |
| 08 | Long Bow | **Skill #438** | Animasi 4 |
| 09 | Crossbow | **Skill #439** | Animasi 4 |
| 10 | Dagger | **Skill #440** | Animasi 7 |

*Karena kemampuan bawaan ini, plugin `WeaponSkill.js` lama telah dinonaktifkan dan diarsipkan ke `_unused`.*

### Notetag Unleash Kustom

Actor / Class / Weapon / Armor / State:
```text
<Unleash Skill: 15>
<Unleash Skill: 15, 25%>
<Unleash Skill: 15, 25%, 10>
```

Format:
```text
<Unleash Skill: skillId>
<Unleash Skill: skillId, rate%>
<Unleash Skill: skillId, rate%, priority>
```

Advanced Lunatic Block:
```text
<Unleash Entry>
skill = 220;
rate = 35;
priority = 15;
condition = user.level >= 20 && user.hpRate() <= 0.5;
</Unleash Entry>
```

---

## NUSV_JobPoints

Fungsi: Sistem perolehan Job Points (JP) setelah pertarungan untuk mempelajari skill baru atau peningkatan class.

Enemy Notetags:
```text
<JP: 25>
<JP Rate: 150%>
```

Actor / Class / Weapon / Armor / State Notetags:
```text
<JP Gain: +5>
<JP Rate: 120%>
```

Plugin Commands:
```text
NUSVJP Gain 1 50
NUSVJP Gain 1 100 5
NUSVJP Lose 2 25
NUSVJP Set 1 0
```

Script Calls:
```javascript
actor.jp()
actor.jp(classId)
actor.gainJp(amount)
actor.gainJp(amount, classId)
actor.loseJp(amount)
actor.loseJp(amount, classId)
actor.setJp(amount)
actor.setJp(amount, classId)
```

---

## SRD_SummonCore & SRD_SummonBattlerImages

Fungsi: Memanggil karakter pembantu (Summon Actor) ke dalam formasi pertarungan dengan durasi giliran tertentu dan dukungan gambar battler statis.

Skill Notetags:
```text
<Summon>
Actor ID: 2
Level: 10
Turns: 2
Animation: 51
Exit Animation: 51
X: master._homeX - 120
Y: master._homeY
</End Summon>
```

Actor Notetags (Gambar Statis):
```text
<Summon Battler Image: filename>
<Summon Battler Scale: 1.25>
<Summon Battler Hue: 0>
```

---

## NUSV_ItemMenuCategories

Fungsi: Mengatur urutan dan filter kategori menu item.

Item / Weapon / Armor Notetags:
```text
<Menu Category: Material>
<Menu Category: Material, Forge>
```

Urutan Kategori Project Saat Ini:
```text
Item, Weapon, Armor, KeyItem, Consumable, Material, Forge, Valuable
```

---

## NUSV_PartySystem

Fungsi: Menu pengelolaan party, formasi anggota aktif dan cadangan, penguncian aktor, dan batas kapasitas anggota pertempuran.

Plugin Commands:
```text
OpenPartyMenu
ShowBattleFormation
HideBattleFormation
EnableBattleFormation
DisableBattleFormation

LockActor 3
LockActor 4 5 6
UnlockActor 3
RequireActor 3
UnrequireActor 3

ChangePartyMax 5
ChangePartyTotalMax 8
```

Penjelasan Status:
- `LockActor`: Karakter terkunci di slot posisinya sekarang (tidak dapat digeser).
- `RequireActor`: Karakter boleh ditukar posisi, namun wajib ada di salah satu slot aktif sebelum keluar menu.

Script Calls:
```javascript
$gameParty.nusvMaxBattleMembers()
$gameParty.nusvSetMaxBattleMembers(n)
$gameParty.nusvLockActor(actorId)
$gameParty.nusvUnlockActor(actorId)
$gameParty.nusvRequireActor(actorId)
$gameParty.nusvUnrequireActor(actorId)
$gameParty.nusvIsActorLocked(actorId)
$gameParty.nusvIsActorRequired(actorId)
```

---

## NUSV_ClassChange

Fungsi: Menu ganti profesi/class, unlock & lock class, sistem tier, syarat perubahan class, dan sinkronisasi otomatis learnset skill class.

Class Notetags:
```text
<Class Tier: 2>
<Class Max Level: 20>

<Class Description>
Fighter ofensif yang menguasai teknik senjata berat.
</Class Description>

<Class Change Level: 20>
<Class Change Switch: 15>
<Class Change Item: 7>
<Class Change Weapon: 5>
<Class Change Armor: 8>
<Class Change From: 1>
<Class Change From: Fighter>
<Class Change Actor: 3>
<Class Change Race: Avesari>
```

Aturan Sinkronisasi Skill:
- Learnset skill di database Class diperlakukan sebagai **Skill Aktif Class**.
- Skill dipasang berdasarkan Class Level aktif (`actor.nusvClassLevel()`).
- Saat berganti class, skill dari class lama dilepas dan skill dari class baru dipasang sesuai level class baru tersebut.
- Parameter `Maintain Level` disetel `false`, sehingga setiap class mengingat progres levelnya masing-masing.

Ras Karakter (Race):
```text
<Race: Avesari>
```
*(Dipasang di Note Actor atau dibaca dari properti `actor._nusvRace`)*

Custom Requirement:
```text
<Class Change Requirement>
condition = actor.level >= 30;
condition = condition && $gameSwitches.value(20);
</Class Change Requirement>
```

Plugin Commands:
```text
NUSVClass Unlock 5
NUSVClass Lock 5
NUSVClass Change 1 5
```

Script Calls:
```javascript
$gameSystem.nusvUnlockClass(5)
$gameSystem.nusvLockClass(5)
$gameSystem.nusvIsClassUnlocked(5)
actor.nusvCanChangeClass(5)
actor.nusvChangeClass(5)
actor.nusvClassTier()
actor.nusvClassMaxLevel()
```

---

## NUSV_SkillLearn

Fungsi: Menu mempelajari skill baru dengan konsumsi JP, Gold, Item, serta pemenuhan berbagai syarat (Level, Class, Ras, Switch, atau Skill Prasyarat).

Skill Notetags:
```text
<Learn JP: 25>
<Learn Gold: 1000>
<Learn Item: 7, 2>
<Learn Weapon: 5, 1>
<Learn Armor: 8, 1>
<Learn Level: 20>
<Learn Class: 5>
<Learn Class: Warrior>
<Learn Race: Avesari>
<Learn Switch: 25>
<Learn Skill: 30>
<Learn Skill Type: 2>
<Hide If Learned>
```

Deskripsi Menu Learn:
```text
<Learn Description>
Teknik pedang tingkat lanjut yang membutuhkan penguasaan konsentrasi tinggi.
</Learn Description>
```

Custom Requirement & Custom Cost:
```text
<Learn Requirement>
condition = actor.level >= 30 && actor.jp() >= 50;
</Learn Requirement>

<Learn Cost Eval>
costOk = $gameVariables.value(10) >= 3;
</Learn Cost Eval>

<Learn Cost Pay>
$gameVariables.setValue(10, $gameVariables.value(10) - 3);
</Learn Cost Pay>
```

Plugin Commands:
```text
NUSVSkillLearn Open
NUSVSkillLearn Learn 1 25
```

Script Calls:
```javascript
actor.nusvCanLearnSkill(skillId)
actor.nusvLearnSkill(skillId)
actor.nusvSkillLearnCost(skillId)
```

---

## NUSV_ItemSynthesis

Fungsi: Sistem crafting dan sintesis item/senjata/baju zirah dari resep yang ditentukan di notetag.

Pasang pada Item/Weapon/Armor hasil sintesis:
```text
<Synthesis Recipe>
Item 5: 3
Weapon 2: 1
Armor 4: 2
Gold: 500
</Synthesis Recipe>

<Synthesis Amount: 3>
<Synthesis Category: Forge>
```

Syarat Buka Resep (Unlock):
```text
<Synthesis Unlock Switch: 25>
<Synthesis Unlock Item: 50>
<Synthesis Unlock Skill: 30>
<Synthesis Unlock Class: 5>
```

Lunatic Requirement, Cost & Effect:
```text
<Synthesis Requirement>
condition = $gameVariables.value(10) >= 3;
</Synthesis Requirement>

<Synthesis Cost Eval>
costOk = $gameVariables.value(15) >= 2;
</Synthesis Cost Eval>

<Synthesis Cost Pay>
$gameVariables.setValue(15, $gameVariables.value(15) - 2);
</Synthesis Cost Pay>

<Synthesis Effect>
$gameVariables.setValue(20, $gameVariables.value(20) + 1);
</Synthesis Effect>
```

Plugin Commands:
```text
NUSVSynthesis Open
NUSVSynthesis Craft Item 5
NUSVSynthesis Craft Weapon 2
NUSVSynthesis Craft Armor 4
```

Script Calls:
```javascript
NUSV.ItemSynthesis.canCraft($dataItems[5])
NUSV.ItemSynthesis.craft($dataItems[5])
```

---

## NUSV_MainMenuBridge

Fungsi: Jembatan integrasi antara `YEP_MainMenuManager` dan seluruh plugin menu kustom NUSV (`NUSV_ClassChange`, `NUSV_SkillLearn`, `NUSV_ItemSynthesis`, `NUSV_PartySystem`).

Simbol Menu:
- `nusvClass`
- `nusvSkillLearn`
- `nusvSynthesis`
- `nusvParty`

*Catatan: Pastikan diletakkan tepat setelah seluruh plugin menu NUSV di plugins.js.*

---

## NUSV_MapSelectEquip, MapSelectItem, MapSelectSkill

Fungsi: Membuka jendela dialog pemilihan perlengkapan, item, atau skill langsung saat di map, lalu menyimpan ID database terpilih ke dalam game variable. Pemain yang menekan tombol Cancel akan menyimpan angka `0`.

### NUSV_MapSelectEquip
```text
MapSelectEquip 10 Both
MapSelectEquip 11 Weapon
MapSelectEquip 12 Armor
MapSelectEquip 10 Weapon WType 3
MapSelectEquip 10 Armor AType 2
MapSelectEquip 10 Armor EType 4
```

### NUSV_MapSelectItem
```text
MapSelectItem 10 All
MapSelectItem 11 Normal
MapSelectItem 12 KeyItem
MapSelectItem 13 Category Material
MapSelectItem 14 Category Forge
MapSelectItem 15 Category Valuable
```

### NUSV_MapSelectSkill
```text
MapSelectSkill 1 0 10
MapSelectSkill 1 2 10
MapSelectSkillParty 1 2 10
```
*Format: `MapSelectSkill actorId skillTypeId variableId` (skillTypeId 0 = seluruh tipe).*

---

## NUSV_ButtonCommonEvents

Fungsi: Menghubungkan penekanan tombol keyboard langsung dengan eksekusi Common Event di map.

Parameter `Default Bindings`:
```text
1:10,2:11,H:20,J:21
```

Plugin Commands:
```text
NUSVButtonCE Bind H 10
NUSVButtonCE Clear H
NUSVButtonCE ClearAll
NUSVButtonCE Reset
NUSVButtonCE Run H
NUSVButtonCE Enable
NUSVButtonCE Disable
```

Script Calls:
```javascript
NUSV.ButtonCommonEvents.bind('H', 10)
NUSV.ButtonCommonEvents.clear('H')
NUSV.ButtonCommonEvents.clearAll()
NUSV.ButtonCommonEvents.reset()
NUSV.ButtonCommonEvents.run('H')
NUSV.ButtonCommonEvents.eventId('H')
```

---

## NUSV_EventChaseStealth

Fungsi: Mode senyap (*stealth mode*) untuk event kejar/patroli `YEP_EventChasePlayer`.

Plugin Commands:
```text
NUSVStealth On
NUSVStealth Off
NUSVStealth Toggle
NUSVStealth Time 300
NUSVStealth Add 120
NUSVStealth Set 600
NUSVStealth Clear
```

Script Calls:
```javascript
$gamePlayer.nusvSetStealth(true)
$gamePlayer.nusvSetStealth(false)
$gamePlayer.nusvSetTimedStealth(300)
$gamePlayer.nusvAddStealthTime(120)
$gamePlayer.nusvIsStealth()
$gamePlayer.nusvStealthTime()
```

Event Comments pada Page Event:
```text
<Ignore Stealth>
<Stealth Only>
<Stealth Detect Region: 10>
<Stealth Block Region: 11>
```

---

## NUSV_GameFontBaseline

Fungsi: Menyelaraskan posisi baseline vertikal font `Minecraftia` dan `Five Fonts at Freddy's` (`GameFont`) agar selalu berada tepat di tengah baris teks window MV tanpa terpotong di bagian atas.

Parameter:
- `Offset Ratio`: Default `0.75` (pergeseran ke bawah sebesar 75% dari ukuran font).

---

## NUSV_AlwaysCenterPlayer

Fungsi: Mengunci kamera game agar selalu memusatkan player di tengah layar sepanjang waktu, termasuk saat berada di tepian map, tanpa perlu memperluas dimensi map.

---

## NUSV_AutoTextWrap

Fungsi: Pembungkus teks otomatis (*automatic word wrapping*) untuk jendela pesan (`Window_Message`) dan jendela bantuan (`Window_Help`).

Fitur Utama:
- Teks berpindah ke baris baru saat mendekati batas kanan (`Right Margin: 6px`).
- Kata yang terlalu panjang otomatis dipisah per karakter secara aman.
- Mendukung escape code warna, icon, dan jeda pesan MV.
- Dapat diaktifkan / dinonaktifkan per jendela via script:
  ```javascript
  window._nusvAutoTextWrap = true;   // Aktifkan pada window kustom
  window._nusvAutoTextWrap = false;  // Nonaktifkan
  ```

---

## NUSV_InventoryUI

Fungsi: Merombak tampilan menu Item default menjadi antarmuka tas inventaris modern berbasis kisi (*grid-based inventory UI*).

Fitur Utama:
- **Tampilan Grid 6 Kolom**: Grid 648px dengan sel berukuran 96x96px dan rendering pixel art tajam (*nearest-neighbor scaling*).
- **Sistem Rarity / Kelangkaan Visual**:
  Notetag pada Item, Weapon, atau Armor:
  ```text
  <NUSV Rarity: Common>
  <NUSV Rarity: Uncommon>
  <NUSV Rarity: Rare>
  <NUSV Rarity: Epic>
  <NUSV Rarity: Legendary>
  <NUSV Rarity: Mythic>
  ```
  *(Juga mendukung notetag alias `<Item Rarity: ...>` atau `<Rarity Tier: ...>`)*
- **Signature Effect Display**:
  Menampilkan efek legendaris khusus di panel detail item:
  ```text
  [SIGNATURE EFFECT] Memulihkan 15% HP saat menumbangkan lawan.
  ```
- **Menu Aksi Sel Terpadu**:
  - Item: Gunakan (Use), Buang (Trash), Batal.
  - Equipment: Pasang (Equip), Lepas (Unequip), Pindah (Move), Buang (Trash), Batal.
  - Key Item: Terkunci dan tidak dapat dibuang secara tidak sengaja.

---

## NUSV_StatSystem

Fungsi: Merombak sistem atribut menjadi 6 Base Stats (STR, INT, DEX, LUK, AGI, VIT), sistem alokasi Stat Points per Base Level, kalkulasi Stat Turunan (*Derived Stats*), serta penggantian TP menjadi sistem Dinamis Stamina Points (SP).

### 6 Base Stats & Rumus Stat Turunan

- **STR**: Meningkatkan Melee ATK, Max HP (+5), Max SP (+2), Critical Damage (+0.3%), dan DEF (+0.5).
- **INT**: Meningkatkan Max MP (+8), MAT (+2), MDF (+1.2), dan MP Regen (+0.03%).
- **DEX**: Meningkatkan Ranged/Finesse ATK (+2), Melee ATK (+0.5), Hit Rate (+0.2%), Crit Rate (+0.2%), dan Critical Damage (+0.2%).
- **LUK**: Meningkatkan Evasion (+0.05%), Crit Rate (+0.1%), dan Critical Evasion (+0.15%).
- **AGI**: Meningkatkan Action Speed / Turn Order (+1.5), Evasion (+0.2%), dan SP Regen (+0.04%).
- **VIT**: Meningkatkan Max HP (+15), Max SP (+5), DEF (+1.5), MDF (+0.8), Guard Efficiency (+0.5%), HP Regen (+0.03%), SP Regen (+0.02%), dan On-Hit Adrenaline SP Recovery.

### Sistem Stamina Points (SP)
- Menggantikan parameter TP menjadi Stamina Points.
- Nilai Max SP berskala secara dinamis: `Base SP (50) + (VIT * 5) + (STR * 2) + Flat SP Item`.
- SP disimpan antar pertarungan (*Preserve SP* seperti halnya MP).
- Saat beristirahat di penginapan / event `Recover All`, SP terisi penuh bersama HP dan MP.

Notetag Actor / Class:
```text
<Base STR: 12>
<Base INT: 8>
<Base DEX: 10>
<Base LUK: 10>
<Base AGI: 11>
<Base VIT: 12>
```

Notetag Weapon / Armor / State:
```text
<STR: +5>
<INT: +2>
<DEX: +4>
<LUK: +1>
<AGI: +3>
<VIT: +5>
<Max SP: +20>
<Critical Damage: +25%>
```

Notetag Item (Reset Build Karakter):
```text
<Reset Stat Points>
```

Plugin Command:
```text
NUSVResetStats [actorId]
```

Script Calls:
```javascript
actor.nusvStatPoints();        // Cek sisa poin belum dialokasikan
actor.allocateStat('str', 1);  // Alokasi 1 poin ke STR
actor.resetAllocatedStats();   // Reset dan refund semua poin stat
actor.gainStatPoints(3);       // Tambah bonus stat point (misal item buku)
```

---

## NUSV_ClassLevel

Fungsi: Mengatur sistem Dua Tingkat Level (Dual Level System) yang memisahkan Base Level (level karakter murni) dan Class Level (tingkat penguasaan profesi). Menyimpan Class Level independen untuk tiap class dengan batas Tier Cap, memberikan bonus Base Stat alami per Class Level, serta membuka skill class baru secara otomatis.

Batas Level per Tier:
- **Tier 1**: Level 1 - 10
- **Tier 2**: Level 1 - 30
- **Tier 3**: Level 1 - 40
- **Tier 4**: Level 1 - 50
- **Tier 5**: Level 1 - 60 *(Coming Soon)*

Notetag Class:
```text
<Class Stat Growth: STR +1.2, VIT +1.0, AGI +0.5>
<Class Tier: 2>
<Class Max Level: 30>
```

Notetag Enemy:
```text
<Class EXP: 25>
```

Script Calls (Global Database & Instance Actor):
```javascript
// Database Global Terpadu (bisa panggil via actor object atau actor ID):
NUSV.Levels.getBaseLevel(actor);                // Base Level karakter
NUSV.Levels.setBaseLevel(actor, level);         // Set Base Level
NUSV.Levels.getClassLevel(actor, classId);      // Level Class tertentu
NUSV.Levels.getCurrentClassLevel(actor);         // Level Class aktif
NUSV.Levels.setClassLevel(actor, classId, lvl); // Set Level Class
NUSV.Levels.getClassMaxLevel(actor, classId);   // Batas Level Class (Tier)
NUSV.Levels.getClassExp(actor, classId);        // Total Class EXP
NUSV.Levels.gainClassExp(actor, 50, classId);   // Tambah Class EXP
NUSV.Levels.isClassMastered(actor, classId);    // Cek apakah class sudah MAX level
NUSV.Levels.getAllClassData(actor);             // Data lengkap semua class

// Melalui Instance Actor langsung:
actor.baseLevel();                              // Base Level karakter
actor.setBaseLevel(5);                          // Set Base Level
actor.classLevel(classId);                      // Level class tertentu
actor.currentClassLevel();                      // Level class yang sedang aktif
actor.nusvClassLevel(classId);                  // Alias konsisten untuk classLevel()
actor.classMaxLevel(classId);                   // Batas level maksimum class (sesuai Tier)
actor.classExp(classId);                        // Total Class EXP saat ini
actor.gainClassExp(50);                         // Tambah Class EXP
actor.setClassLevel(classId, 10);               // Set Class Level
actor.isClassMastered(classId);                 // Cek apakah class MAX
```

---

## NUSV_StaminaBattle

Fungsi: Mengatur mekanik pertempuran berbasis Stamina (SP):
1. **Guard / Defend Stamina Surge**:
   - Memilih aksi Guard (Bertahan) segera memulihkan Stamina sebesar:
     $$\text{Max SP} \times (\text{Guard Rate} + (\text{SP Regen} \times 2))$$
   - Menampilkan popup damage `+X SP` di atas battler.
2. **On-Hit Adrenaline SP Recovery**:
   - Saat terkena serangan musuh, karakter meregenerasi SP berdasarkan persentase HP yang hilang, ketahanan tubuh (skala stat VIT), dan stat SP Regen (TRG).

Parameter:
- `Guard Base SP Recovery Rate`: Default `0.15` (15% Max SP).
- `On-Hit SP Recovery Multiplier`: Default `0.5`.

---

## NUSV_StatusScreen

Fungsi: Merombak total layar Status (`Scene_Status`) menjadi tata letak tiga kolom bergaya *Genshin-style character page*:
- **Kolom Kiri**: Potret illustrasi utuh karakter (*full body portrait*) beserta profil biografi karakter di bawahnya.
- **Kolom Tengah**: Tab navigasi horizontal (`Status`, `Allocate`, `Equipment`, `Class`, `Skills`) dan semua konten detail: bar HP / MP / SP / EXP, daftar ikon status effect aktif dengan tooltip detail interaktif, dan daftar atribut lengkap. Kolom ini dibuat lebih luas untuk menampilkan status dan hal-hal penting.
- **Kolom Kanan**: Pemilih anggota party (*party actor selector*).

Resolusi Gambar Potret Karakter (dicari di `img/pictures/`):
1. Actor Notetag: `<Portrait: NamaFile>` atau `<Status Image: NamaFile>`
2. Class Notetag: `<Portrait: NamaFile>` atau `<Status Image: NamaFile>`
3. Prefix Default: `Hero_` + nama aktor
4. Fallback aman: Face graphic aktor digambar besar (tidak menyebabkan crash jika file gambar tidak ditemukan).

State Notetags (Untuk Tooltip Status Effect):
```text
<NUSV Type: 1>      // 1 = Pasif (Kuning), 2 = Status Effect (Merah), 3 = Skill Effect (Hijau)
<NUSV Desc: Teks penjelasan status effect>
```
*(Juga menerima notetag shorthand `<TYPE: 1>` dan `<DESC: ...>`)*

Profil Aktor:
```text
<Profile>
Ksatria pengembara dari daratan utara yang mencari kebenaran tentang kegelapan abadi.
</Profile>
```

---

## YEP_CoreEngine

Fungsi: Engine inti Yanfly untuk kestabilan plugin battle dan menu. Mengatur resolusi layar (1080x720), limit maksimal gold, item, level, dan parameter, font render, window opacity, scale battleback, dan perbaikan bug bawaan RPG Maker MV.

---

## YEP_BattleEngineCore

Fungsi: Mengatur alur dan sistem pertarungan, visual battler selection, action sequences, tata letak jendela command, dan timing eksekusi aksi.

Plugin Commands:
```text
setBattleSys DTB
setBattleSys CTB
```

Skill / Item Notetags:
```text
<Display Text: text>
<Display Icon: x>
<Cast Animation: x>
<Action Speed: x>
```

State Timing Notetags:
```text
<Action Start: x>
<Turn Start: x>
```

Action Sequence 5-Phase Blocks:
```text
<setup action>
</setup action>
<whole action>
</whole action>
<target action>
</target action>
<follow action>
</follow action>
<finish action>
</finish action>
```

---

## YEP_X_ActSeqPack1, Pack2, Pack3

Fungsi: Menambahkan kumpulan perintah aksi sinematik pada action sequences pertarungan.

- **Pack 1**: Gerakan dasar, transparansi, jeda (*wait*), pemutaran animasi, dan efek kalkulasi damage.
- **Pack 2**: Gerakan visual tingkat lanjut, lompatan (*jump*), melayang (*float*), gerak proyektil, dan arah hadap battler (*face direction*).
- **Pack 3**: Kontrol kamera battle, fokus bidikan (*camera focus*), dan zoom dinamis (*zoom/reset zoom*).

Target Selector Umum:
`user`, `target`, `targets`, `actors`, `all actors`, `dead actors`, `actors not user`, `enemies`, `all enemies`, `friends`, `opponents`, `all alive`.

---

## YEP_X_BattleSysCTB

Fungsi: Sistem pertarungan Charge Turn Battle (CTB) berbasis kecepatan waktu riil.

Actor / Enemy Notetags:
```text
<CTB Icon: x>
<CTB Border Color: x>
<CTB Background Color: x>
<Class x CTB Icon: y>
```

Skill / Item Notetags:
```text
<CTB Speed: x>
<CTB Speed: x%>
<CTB Speed: +x>
<CTB Speed: -x>
<CTB Order: +x>
<CTB Order: -x>
<After CTB: x>
<After CTB: x%>
```

Lunatic Eval:
```text
<Target CTB Speed Eval>
speed = target.hpRate() * max;
</Target CTB Speed Eval>
```

---

## YEP_SkillCore

Fungsi: Kontrol biaya skill (HP, MP, SP), syarat penggunaan skill, dan eksekusi custom lunatik.

Skill Notetags:
```text
<HP Cost: x>
<HP Cost: x%>
<MP Cost: x>
<MP Cost: x%>
<TP Cost: x>
<TP Cost: x%>
<Hide in Battle>
<Hide in Field>
```

Lunatic Notetags:
```text
<Custom HP Cost>
cost = user.mhp * 0.10;
</Custom HP Cost>

<Custom Requirement>
value = user.level >= 10;
</Custom Requirement>

<Custom Execution>
$gameSwitches.setValue(10, true);
</Custom Execution>
```

---

## YEP_BuffsStatesCore

Fungsi: Mengatur batas tumpukan buff/debuff, angka giliran state, counter numerik state, dan efek kustom state.

Actor / Class / Enemy / Weapon / Armor / State:
```text
<Max atk Buff: +2>
<Max def Debuff: -1>
```

State Notetags:
```text
<Show Turns>
<Hide Turns>
<Turn Alignment: Center>
<Turn Color: 10>
<Reapply Reset Turns>
```

Custom State Hooks:
`<Custom Apply Effect>`, `<Custom Remove Effect>`, `<Custom Turn Start Effect>`, `<Custom Action Start Effect>`, `<Custom Action End Effect>`, `<Custom Regenerate Effect>`, `<Custom Turn End Effect>`.

Script Calls State Counter:
```javascript
battler.setStateCounter(stateId, value)
battler.addStateCounter(stateId, value)
battler.getStateCounter(stateId)
battler.removeStateCounter(stateId)
```

---

## YEP_AutoPassiveStates

Fungsi: Memberikan status pasif otomatis pada aktor, musuh, skill, atau perlengkapan.

Notetags:
```text
<Passive State: 10>
<Passive State: 10, 11, 12>
<Passive State: 10 to 15>
```

Syarat Pasif:
```text
<Passive Condition: HP Above 50%>
<Passive Condition: Switch 10 ON>
```

Custom Lunatic Condition:
```text
<Custom Passive Condition>
condition = user.hpRate() <= 0.25;
</Custom Passive Condition>
```

---

## YEP_ElementCore

Fungsi: Pengelolaan sistem elemen lanjutan (multi-elemen, penyerapan elemen/absorb, pantulan/reflect, dan force element rate).

Skill / Item:
```text
<Multiple Elements: Fire, Ice>
<Multi-Element Rule: Highest>
<Bypass Element Reflect>
```

Actor / Class / Enemy / Weapon / Armor / State:
```text
<Element Absorb: Fire, Ice>
<Element Reflect Fire: +25%>
<Force Element Fire Rate: 50%>
```

---

## YEP_BattleAICore

Fungsi: Kecerdasan buatan musuh berbasis pohon keputusan prioritas (*AI Priority Tree*).

Enemy Notetags:
```text
<AI Level: 80>
<AI Consider Taunt>

<AI Priority>
Always: Skill 10, Lowest HP%
HP% <= 50%: Heal, Lowest HP%
Turn 3: Skill 20, Random
</AI Priority>
```

---

## YEP_BaseTroopEvents

Fungsi: Menjalankan event battle umum dari Troop ID 1 (Base Troop) di seluruh pertarungan secara otomatis.

---

## YEP_X_AnimatedSVEnemies

Fungsi: Memungkinkan sprite musuh menggunakan animated sideview actor battler, efek pernapasan (*breathing*), melayang (*floating*), pergantian sprite senjata, dan bayangan (*shadow*).

Enemy Notetags:
```text
<Breathing>
<Floating>
<Scale Sprite: 120%>
<Sideview Battler: filename>
<Sideview Folder: sv_enemies>
<Sideview Attack Motion: swing>
<Sideview Weapon: 1>
<Sideview Show Shadow>
```

---

## YEP_ItemCore

Fungsi: Perombakan scene item dan sistem instansiasi perlengkapan independen (*Independent Items*).

Notetags:
```text
<Max Item: x>
<Independent Item>
<Not Independent Item>
```
*Catatan: Sistem upgrade (`NUSV_ItemUpgrade`) dan soket permata (`NUSV_SocketCore`) bekerja pada independent items yang dihasilkan plugin ini.*

---

## YEP_EquipCore

Fungsi: Pengelolaan slot equipment fleksibel dan syarat pemakaian perlengkapan.

Actor / Class:
```text
<Equip Slot>
Weapon
Shield
Head
Body
Accessory
</Equip Slot>
```

Weapon / Armor:
```text
<Equip Requirement>
condition = user.level >= 10;
</Equip Requirement>
```

---

## YEP_MessageCore

Fungsi: Mengembangkan jendela pesan dengan name box, ukuran font fleksibel, dan escape code tambahan.

Text Codes Umum:
- `\n<Nama>`: Membuka Name Box di atas jendela dialog
- `\v[x]`: Nilai variable x
- `\s[x]`: Switch x
- `\i[x]`: Menampilkan ikon x
- `\c[x]`: Mengubah warna teks x
- `\!`: Tunggu penekanan tombol oleh pemain

---

## YEP_QuestJournal

Fungsi: Sistem buku catatan misi/jurnal petualangan (*Quest Journal*) lengkap.

Plugin Commands Utama:
```text
Quest Journal Open
Quest Add x
Quest Set Completed x
Quest Set Failed x
Quest x Complete Objective y
Quest x Claim Reward y
```

---

## YEP_SaveCore

Fungsi: Tata letak estetis untuk jendela save/load, slot penyimpanan lebih banyak, dan info detail progres permainan.

---

## YEP_MoveRouteCore

Fungsi: Memperluas opsi rute pergerakan event melalui script Move Route:
```javascript
this.stepForward()
this.stepBackward()
this.moveTowardPlayer()
this.moveAwayFromPlayer()
this.turnTowardPlayer()
```

---

## YEP_EventChasePlayer

Fungsi: Mengatur AI event musuh untuk mengejar atau menjauhi player saat berada dalam jangkauan pandang (*sight range*). Bekerja berdampingan dengan `NUSV_EventChaseStealth`.

---

## YEP_RegionRestrictions & YEP_RegionEvents

Fungsi:
- `YEP_RegionRestrictions`: Membatasi wilayah yang boleh/tidak boleh dilewati player atau event berdasarkan Region ID.
- `YEP_RegionEvents`: Menjalankan Common Event saat player menginjak tile dengan Region ID tertentu (cocok untuk jebakan atau efek area).

---

## YEP_VictoryAftermath

Fungsi: Jendela hasil akhir pertempuran interaktif (perolehan EXP, kenaikan level, perolehan JP `NUSV_JobPoints`, dan drop item).

---

## YEP_MainMenuManager

Fungsi: Mengatur tata letak dan command daftar menu utama. Terhubung langsung dengan `NUSV_MainMenuBridge`.

---

## Plugin Bawaan & Nonaktif

Bagian ini merangkum plugin yang ada di folder tetapi tidak berstatus aktif di pertarungan/eksekusi runtime:

### Inaktif di `js/plugins.js` (`status: false`):
- **Community_Basic**: Pengaturan dasar resolusi, batas cache, dan always-dash.
- **CustomLogo**: Menampilkan logo pembuka saat game pertama kali dijalankan.

### Diarsipkan di `js/plugins/_unused/`:
- **WeaponSkill**: Digantikan sepenuhnya oleh kemampuan bawaan `NUSV_WeaponUnleash` yang memetakan 10 basic attack skill (#431 s/d #440).
- **YEP_X_ExtMovePack1**: Ekstensi rute gerakan Yanfly tambahan.
- **AltMenuScreen**: Layout menu alternatif bawaan MV.
- **AltSaveScreen**: Layout save/load alternatif bawaan MV.
- **EnemyBook**: Ensiklopedia musuh bawaan MV.
- **ItemBook**: Ensiklopedia item bawaan MV.
- **MadeWithMv**: Splash screen "Made with MV".
- **SimpleMsgSideView**: Pesan ringkas pertempuran sideview.
- **TitleCommandPosition**: Pengaturan koordinat window judul game.

---

## Tips Praktis Integrasi & Pengembangan

1. **Rangkaian Skill Kompleks**: Gabungkan `NUSV_TargetCore` (cakupan target), `NUSV_SelectionControl` (filter target), `NUSV_DamageCore` (formula multiline & penetrasi), dan `NUSV_CriticalControl` (pembobotan critical).
2. **Animasi & Trajectory Sinematik**: Gunakan `NUSV_ProjectileEngine` untuk serangan berjarak (panah, sihir elemen) dengan integrasi `wait for projectile`, dan manfaatkan `NUSV_VFXKeyframes` untuk sinkronisasi arah animasi tebasan kiri/kanan.
3. **Pratinjau Cepat Tanpa Restart**: Gunakan Database Studio dengan fitur battle preview dari `NUSV_BattlePreview` (`?skillPreview=ID`) untuk menguji coba koreografi skill secara instan.
4. **Progression Karakter**: Alur progres mengikuti rantai: `NUSV_ClassLevel` mengelola Dual Level & Stat Alami, `NUSV_StatSystem` mengalokasikan Stat Points & SP, `NUSV_JobPoints` mengumpulkan JP pertempuran, `NUSV_SkillLearn` membeli skill menggunakan JP, dan `NUSV_ClassChange` membuka profesi lanjutan dengan batasan Tier Cap.
5. **Perlengkapan Unik & Penempaan**: Semua upgrade (`NUSV_ItemUpgrade`) dan permata (`NUSV_SocketCore`) tersimpan di instansiasi independent items `YEP_ItemCore`. Pastikan mematuhi aturan tangan `NUSV_EquipRules` (2H menempati dua tangan dan menyegel slot secondary).
6. **Hierarki Plugin Menu**: Pastikan `NUSV_MainMenuBridge` tetap berada di bawah seluruh plugin menu NUSV agar integrasi menu perintah dengan `YEP_MainMenuManager` berjalan mulus.
