# 📜 MASTER GUIDE: EXP CURVE & TRAITS LENGKAP 41 KELAS NUSVANIR
**Proyek Game:** *Tales of The Dark Time*  
**Engine:** RPG Maker MV

> ✅ **Status Verifikasi:** Dokumen ini telah diverifikasi dan disinkronkan dengan `data/Classes.json` per **1 September 2026**. EXP Curve dan Class ID sesuai data aktual RPG Maker MV.

Dokumen ini adalah cetak biru konfigurasi definitif untuk seluruh **41 Kelas Petualang** di dunia Nusvanir. Setiap kelas dilengkapi dengan:
1. **ID Class** di database RPG Maker MV.
2. **Nilai Eksak EXP Curve** `[Base Value, Extra Value, Acceleration A, Acceleration B]`.
3. **Parameter Ranks** (*MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK*).
4. **Daftar Lengkap Traits** (Type & Content persis sesuai input RPG Maker MV Database).

---

## 🧭 STANDAR RITME EXP PER TIER
* **Tier 1 (Novice):** `[25, 15, 20, 20]` $\rightarrow$ Cepat naik level di awal game agar pemain tidak bosan.
* **Tier 2 (Initiate):** `[30, 20, 30, 30]` $\rightarrow$ Kurva standar RPG Maker MV.
* **Tier 3 (Adept):** `[35, 25, 35, 35]` $\rightarrow$ Menengah, membutuhkan konsistensi battle di dungeon menengah.
* **Tier 4 (Master):** `[40, 30, 40, 40]` $\rightarrow$ Berat, membutuhkan grinding dungeon tingkat lanjut.
* **Tier 5 (Apex):** `[45, 35, 45, 50]` $\rightarrow$ Sangat berat / Endgame, mencerminkan penguasaan mutlak biologis/spiritual.

---

# ⚔️ 1. JALUR FISIK (MELEE / TANK)

---

### [T1] Fighter `(Class ID: 2)`
* **EXP Curve:** `[25, 15, 20, 20]` *(Pertumbuhan Cepat)* ✅ Terverifikasi
* **Parameter:** `MHP: D` | `MMP: E` | `ATK: D` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Basic Clothes**
  5. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Light Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 4%**

---

### [T2] Warrior (Fokus Offense) `(Class ID: 6)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ Terverifikasi
* **Parameter:** `MHP: C` | `MMP: E` | `ATK: B` | `DEF: C` | `MAT: E` | `MDF: E` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Basic Clothes**
  6. `Equip` $\rightarrow$ **Equip Armor: Light Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 6%**
  10. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 110%**

---

### [T2] Squire (Fokus Defense) `(Class ID: 7)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ Terverifikasi
* **Parameter:** `MHP: C` | `MMP: E` | `ATK: D` | `DEF: B` | `MAT: E` | `MDF: E` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Lance**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Shield**
  6. `Equip` $\rightarrow$ **Equip Armor: Light Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 150%** *(Musuh lebih sering menargetkannya)*
  10. `Param` $\rightarrow$ **Sp-Parameter: Guard Effect Rate * 150%** *(Pertahanan Guard lebih kokoh)*

---

### [T2] Brawler (Tangan Kosong / Cakar) `(Class ID: 8)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ ~~[28, 18, 25, 25]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: D` | `MMP: E` | `ATK: C` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glovess**
  3. `Equip` $\rightarrow$ **Equip Weapon: Glovess**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**
  8. `Attack` $\rightarrow$ **Attack Times + 1** *(Pukulan biasa memukul 2x)*

---

### [T3] Mercenary (Ahli Senjata Berat) `(Class ID: 15)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ Terverifikasi
* **Parameter:** `MHP: C` | `MMP: E` | `ATK: A` | `DEF: C` | `MAT: E` | `MDF: E` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Basic Clothes**
  6. `Equip` $\rightarrow$ **Seal Equip: Shield** *(Wajib 2 tangan, tidak bisa pakai tameng)*
  7. `Param` $\rightarrow$ **Parameter: Attack * 115%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 92%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 10%**
  10. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 125%**

---

### [T3] Knight (Ahli Perisai & Pelindung) `(Class ID: 16)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ Terverifikasi
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: D` | `DEF: A` | `MAT: E` | `MDF: C` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Shield**
  6. `Equip` $\rightarrow$ **Lock Equip: Shield** *(Perisai terkunci wajib selalu terpasang)*
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 200%**
  9. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 90%** *(Reduksi damage fisik 10%)*
  10. `Other` $\rightarrow$ **Special Flag: Substitute** *(Otomatis melindungi kawan HP < 25%)*

---

### [T3] Martial Artist (Lincah & Chi) `(Class ID: 17)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ ~~[32, 22, 30, 30]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: D` | `MMP: E` | `ATK: B` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glovess**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 12%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 10%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 15%** *(Peluang membalas fisik 15%)*
  9. `Param` $\rightarrow$ **Ex-Parameter: TP Regen + 5%**
---

### [T4] Champion `(Class ID: 24)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ Terverifikasi
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: A` | `DEF: B` | `MAT: E` | `MDF: E` | `AGI: C` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Basic Clothes**
  6. `Equip` $\rightarrow$ **Equip Armor: Light Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 15%**
  9. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 150%**
  10. `Other` $\rightarrow$ **Special Flag: Preserve TP**

---

### [T4] Dragoon (Tombak Udara) `(Class ID: 25)`
* **EXP Curve:** `[30, 20, 30, 30]` ⚠️ ~~[38, 28, 38, 38]~~ *Data aktual lebih rendah dari rencana — perlu review apakah ini disengaja atau perlu diubah ke [40,30,40,40]*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A` | `DEF: C` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Lance**
  3. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 12%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**
  8. `Rate` $\rightarrow$ **Element Rate: Wind * 80%**

---

### [T4] Paladin (Pelindung Suci) `(Class ID: 26)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ ~~[42, 32, 42, 42]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: C` | `DEF: A` | `MAT: E` | `MDF: B` | `AGI: E` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Heavy Shield**
  7. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 250%**
  8. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 80%**
  9. `Rate` $\rightarrow$ **Element Rate: Holy * 50%**
  10. `Other` $\rightarrow$ **Special Flag: Substitute**

---

### [T4] Monk `(Class ID: 27)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ ~~[38, 28, 38, 38]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: B` | `DEF: C` | `MAT: C` | `MDF: C` | `AGI: B` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glovess**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 20%**
  6. `Param` $\rightarrow$ **Ex-Parameter: HP Regen + 5%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 12%**
  8. `Rate` $\rightarrow$ **State Resist: Poison**

---

### [T5 - Apex] Berserker (Butoraksa / Orc)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: C` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  3. `Equip` $\rightarrow$ **Equip Weapon: Long Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Equip` $\rightarrow$ **Seal Equip: Shield**
  6. `Other` $\rightarrow$ **Action Times + 50%** *(50% peluang aksi 2x per turn)*
  7. `Param` $\rightarrow$ **Parameter: Attack * 130%**
  8. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 250%**
  9. `Rate` $\rightarrow$ **State Resist: Sleep, Stun, Fear** *(Tak bisa dihentikan)*
  10. `Other` $\rightarrow$ **Special Flag: Preserve TP**

---

### [T5 - Apex] Death Knight (Bhuta / Gadai Sukma)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A` | `DEF: A` | `MAT: C` | `MDF: C` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Long Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Shield**
  6. `Attack` $\rightarrow$ **Attack Element: Darkness**
  7. `Attack` $\rightarrow$ **Attack State: Curse + 30%**
  8. `Rate` $\rightarrow$ **State Resist: Poison, Death**
  9. `Rate` $\rightarrow$ **Element Rate: Darkness * 0%** *(Kebal kegelapan)*
  10. `Rate` $\rightarrow$ **Element Rate: Holy * 150%** *(Lemah elemen suci)*

---

### [T5 - Apex] Holy Knight (Avesari / Transcendence)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: C` | `ATK: B` | `DEF: A` | `MAT: C` | `MDF: A` | `AGI: E` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Shield**
  6. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 200%**
  7. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 70%** *(Reduksi 30% damage fisik)*
  8. `Rate` $\rightarrow$ **State Resist: Curse, Darkness, Poison, Sleep**
  9. `Other` $\rightarrow$ **Special Flag: Substitute**
  10. `Other` $\rightarrow$ **Special Flag: Guard**

---

### [T5 - Apex] Brahma-Kera (Hanorok)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: A` | `DEF: C` | `MAT: E` | `MDF: D` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Lance**
  3. `Equip` $\rightarrow$ **Equip Weapon: Glovess**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 20%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 25%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 15%**
  8. `Attack` $\rightarrow$ **Attack Times + 1** *(Serangan biasa memukul 2x)*
  9. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**

---

### [T5 - Apex] Sky Sovereign (Garuda)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A` | `DEF: C` | `MAT: B` | `MDF: D` | `AGI: A` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Lance**
  3. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Attack` $\rightarrow$ **Attack Element: Thunder**
  6. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 105%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 20%**
  8. `Other` $\rightarrow$ **Action Times + 50%**
  9. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**
---

# 🔮 2. JALUR SIHIR (MAGIC / SUPPORT)

---

### [T1] Apprentice `(Class ID: 3)`
* **EXP Curve:** `[25, 15, 20, 20]` *(Pertumbuhan Cepat)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: D` | `ATK: E` | `DEF: E` | `MAT: D` | `MDF: D` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 5%**

---

### [T2] Magician (Fokus Damage) `(Class ID: 9)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: C` | `ATK: E` | `DEF: E` | `MAT: B` | `MDF: C` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 90%** *(Diskon MP 10%)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 8%**

---

### [T2] Acolyte (Fokus Heal) `(Class ID: 10)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: C` | `ATK: E` | `DEF: E` | `MAT: C` | `MDF: B` | `AGI: E` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 125%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 3%**

---

### [T2] Occultist (Fokus Dark / Curse) `(Class ID: 11)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: C` | `ATK: E` | `DEF: E` | `MAT: B` | `MDF: C` | `AGI: E` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Attack` $\rightarrow$ **Attack Element: Darkness**
  6. `Attack` $\rightarrow$ **Attack State: Curse + 20%**
  7. `Rate` $\rightarrow$ **Element Rate: Darkness * 70%**

---

### [T3] Mage `(Class ID: 18)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: B` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: B` | `AGI: E` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 85%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 12%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 5%**

---

### [T3] Cleric `(Class ID: 19)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: B` | `ATK: E` | `DEF: E` | `MAT: C` | `MDF: A` | `AGI: E` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 150%**
  6. `Param` $\rightarrow$ **Sp-Parameter: Pharmacology * 150%**
  7. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 5%**

---

### [T3] Cultist `(Class ID: 20)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: B` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: C` | `AGI: E` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Reflection + 10%**
  6. `Rate` $\rightarrow$ **State Resist: Fear, Confusion**

---

### [T4] Elementalist (Pyromancer / Hydro / Aero / Terra) `(Class ID: 28)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: B` | `AGI: D` | `LUK: E`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 80%**
  5. `Param` $\rightarrow$ **Parameter: M.Attack * 120%**
  6. `Rate` $\rightarrow$ **Element Rate: Fire * 50%**
  7. `Rate` $\rightarrow$ **Element Rate: Ice * 50%**
  8. `Rate` $\rightarrow$ **Element Rate: Thunder * 50%**

---

### [T4] Priest (Penyembuh Utama Militer) `(Class ID: 29)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ Terverifikasi
* **Parameter:** `MHP: D` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: D` | `MDF: A` | `AGI: E` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Equip` $\rightarrow$ **Equip Armor: Basic Clothes**
  6. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 200%**
  7. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 10%**
  8. `Rate` $\rightarrow$ **State Resist: Poison, Silence**

---

### [T4] Necromancer `(Class ID: 30)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ Terverifikasi
* **Parameter:** `MHP: D` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: C` | `AGI: E` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Rate` $\rightarrow$ **State Resist: Death, Disease, Poison**
  6. `Rate` $\rightarrow$ **Element Rate: Darkness * 0%** *(Kebal Dark)*
  7. `Rate` $\rightarrow$ **Element Rate: Holy * 200%** *(Sangat Lemah Holy)*

---

### [T5 - Apex] Archmage (Asrivana) `(Class ID: 39)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: A` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 50%** *(Diskon MP 50% tanpa recoil)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Reflection + 25%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 15%**
  7. `Rate` $\rightarrow$ **State Resist: Silence**
  8. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] High Priest (Sang Hyang Cahaya) `(Class ID: 40)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ✅ Terverifikasi
* **Parameter:** `MHP: C` | `MMP: A` | `ATK: E` | `DEF: D` | `MAT: B` | `MDF: A` | `AGI: D` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: White Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 250%**
  5. `Param` $\rightarrow$ **Sp-Parameter: Pharmacology * 200%**
  6. `Rate` $\rightarrow$ **State Resist: All Bad States** *(Kebal semua status buruk)*
  7. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] Warlock (Kala Laksana) `(Class ID: 41)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ✅ Terverifikasi
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: B` | `AGI: D` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Attack` $\rightarrow$ **Attack State: Corruption 100%**
  6. `Attack` $\rightarrow$ **Attack Element: Darkness**
  7. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 70%**
  8. `Rate` $\rightarrow$ **State Resist: Curse, Poison, Silence, Death**

---

### [T5 - Apex] Shaman (Troliogoro / Arkananta) `(Class ID: belum dikonfigurasi)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ⚠️ *Rencana - belum ada di database*
* **Parameter:** `MHP: B` | `MMP: A` | `ATK: E` | `DEF: C` | `MAT: A` | `MDF: A` | `AGI: E` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: HP Regen + 8%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 8%**
  7. `Rate` $\rightarrow$ **Element Rate: Earth * 0%** *(Kebal Tanah/Batu)*
  8. `Rate` $\rightarrow$ **Element Rate: Water * 50%**

---

### [T5 - Apex] Dragon Aspect (Nagarasven) `(Class ID: belum dikonfigurasi)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ⚠️ *Rencana - belum ada di database*
* **Parameter:** `MHP: A` | `MMP: A` | `ATK: D` | `DEF: B` | `MAT: A` | `MDF: A` | `AGI: E` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Black Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Param` $\rightarrow$ **Sp-Parameter: Magical Damage Rate * 70%** *(Reduksi 30% semua sihir musuh)*
  6. `Rate` $\rightarrow$ **Element Rate: Fire * 0%** *(Kebal Api)*
  7. `Rate` $\rightarrow$ **State Resist: Burn, Stun, Silence**
---

# 🏹 3. JALUR LINCAH (RANGED / ASSASSIN)

---

### [T1] Scout `(Class ID: 4)`
* **EXP Curve:** `[25, 15, 20, 20]` *(Pertumbuhan Cepat)* ✅ ~~[22, 14, 18, 18]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: E` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: D` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Bow**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**

---

### [T2] Archer (Fokus Busur Jauh) `(Class ID: 12)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ ~~[28, 18, 28, 28]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: C` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**

---

### [T2] Thief (Fokus Kecepatan & Belati) `(Class ID: 13)`
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)* ✅ ~~[25, 16, 25, 25]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: D` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 12%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**
  6. `Other` $\rightarrow$ **Party Ability: Gold Double**

---

### [T3] Ranger (Bertahan Hidup di Alam) `(Class ID: 21)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ ~~[34, 24, 34, 34]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: D` | `MMP: E` | `ATK: A` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Bow**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  6. `Other` $\rightarrow$ **Party Ability: Encounter Half**
  7. `Other` $\rightarrow$ **Party Ability: Cancel Surprise**

---

### [T3] Rogue (Menyelinap & Jebakan) `(Class ID: 22)`
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)* ✅ ~~[32, 22, 32, 32]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: C` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 15%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 18%**
  6. `Attack` $\rightarrow$ **Attack State: Poison + 30%**

---

### [T4] Sniper (Akurasi Jarak Jauh Maksimal) `(Class ID: 31)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ ~~[38, 28, 38, 38]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: A` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Crossbow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 108%** *(Mutlak Anti-Miss)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 20%**
  6. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**

---

### [T4] Assassin (Kritikal Instan & Racun) `(Class ID: 32)`
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)* ✅ ~~[38, 28, 38, 38]~~ *dikoreksi sesuai data aktual*
* **Parameter:** `MHP: E` | `MMP: E` | `ATK: A` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Equip` $\rightarrow$ **Slot Type: Dual Wield** *(Wajib memegang 2 belati sekaligus)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 25%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 20%**
  7. `Attack` $\rightarrow$ **Attack State: Poison + 50%**
  8. `Attack` $\rightarrow$ **Attack State: Instant Death + 5%**

---

### [T5 - Apex] Beastmaster (Wuru Loka) `(Class ID: belum dikonfigurasi)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ⚠️ *Rencana - belum ada di database*
* **Parameter:** `MHP: B` | `MMP: D` | `ATK: A` | `DEF: D` | `MAT: D` | `MDF: E` | `AGI: A` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Summon**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Other` $\rightarrow$ **Action Times + 50%** *(50% peluang aksi 2x)*
  5. `Other` $\rightarrow$ **Party Ability: Drop Item Double**
  6. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  7. `Rate` $\rightarrow$ **State Resist: Fear, Confusion**

---

### [T5 - Apex] Shadow Walker (Kala Laksana) `(Class ID: belum dikonfigurasi)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ⚠️ *Rencana - belum ada di database*
* **Parameter:** `MHP: D` | `MMP: E` | `ATK: A` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Equip` $\rightarrow$ **Slot Type: Dual Wield**
  5. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 35%** *(Sangat sulit terkena serangan fisik)*
  6. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 30%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 30%**
  8. `Rate` $\rightarrow$ **State Resist: Blind, Stun, Sleep**
  9. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] Windrunner (Asrivana / Elf) `(Class ID: belum dikonfigurasi)`
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)* ⚠️ *Rencana - belum ada di database*
* **Parameter:** `MHP: C` | `MMP: E` | `ATK: A` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Skill**
  2. `Equip` $\rightarrow$ **Equip Weapon: Long Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Attack` $\rightarrow$ **Attack Times + 2** *(Serangan biasa otomatis menembakkan 3 anak panah berturut-turut)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 115%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 25%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 25%**
  8. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**
  9. `Rate` $\rightarrow$ **Element Rate: Wind * 0%** *(Kebal Elemen Angin)*

---

## 📊 RINGKASAN EXP CURVE AKTUAL (Dari `data/Classes.json`)

| ID | Nama Class | Tier | EXP Curve Aktual | Status |
| :--: | :--- | :--- | :--- | :--: |
| 1 | --Novice (T1)-- | Header | `[10, 0, 10, 10]` | 🔵 |
| 2 | Fighter | T1 | `[25, 15, 20, 20]` | ✅ |
| 3 | Apprentice | T1 | `[25, 15, 20, 20]` | ✅ |
| 4 | Scout | T1 | `[25, 15, 20, 20]` | ✅ |
| 5 | --Initiate (T2)-- | Header | `[10, 0, 10, 10]` | 🔵 |
| 6 | Warrior | T2 | `[30, 20, 30, 30]` | ✅ |
| 7 | Squire | T2 | `[30, 20, 30, 30]` | ✅ |
| 8 | Brawler | T2 | `[30, 20, 30, 30]` | ✅ |
| 9 | Magician | T2 | `[30, 20, 30, 30]` | ✅ |
| 10 | Acolyte | T2 | `[30, 20, 30, 30]` | ✅ |
| 11 | Occultist | T2 | `[30, 20, 30, 30]` | ✅ |
| 12 | Archer | T2 | `[30, 20, 30, 30]` | ✅ |
| 13 | Thief | T2 | `[30, 20, 30, 30]` | ✅ |
| 14 | --Adept (T3)-- | Header | `[10, 0, 10, 10]` | 🔵 |
| 15 | Mercenary | T3 | `[35, 25, 35, 35]` | ✅ |
| 16 | Knight | T3 | `[35, 25, 35, 35]` | ✅ |
| 17 | Martial Artist | T3 | `[35, 25, 35, 35]` | ✅ |
| 18 | Mage | T3 | `[35, 25, 35, 35]` | ✅ |
| 19 | Cleric | T3 | `[35, 25, 35, 35]` | ✅ |
| 20 | Cultist | T3 | `[35, 25, 35, 35]` | ✅ |
| 21 | Ranger | T3 | `[35, 25, 35, 35]` | ✅ |
| 22 | Rogue | T3 | `[35, 25, 35, 35]` | ✅ |
| 23 | --Master (T4)-- | Header | `[10, 0, 10, 10]` | 🔵 |
| 24 | Champion | T4 | `[40, 30, 40, 40]` | ✅ |
| 25 | Dragoon | T4 | `[30, 20, 30, 30]` | ⚠️ |
| 26 | Paladin | T4 | `[40, 30, 40, 40]` | ✅ |
| 27 | Monk | T4 | `[40, 30, 40, 40]` | ✅ |
| 28 | Elementalist | T4 | `[40, 30, 40, 40]` | ✅ |
| 29 | Priest | T4 | `[40, 30, 40, 40]` | ✅ |
| 30 | Necromancer | T4 | `[40, 30, 40, 40]` | ✅ |
| 31 | Sniper | T4 | `[40, 30, 40, 40]` | ✅ |
| 32 | Assassin | T4 | `[40, 30, 40, 40]` | ✅ |
| 33 | --Apex (T5)-- | Header | `[10, 0, 10, 10]` | 🔵 |
| 34 | Berserker | T5 | `[45, 35, 45, 50]` | ✅ |
| 35 | Death Knight | T5 | `[45, 35, 45, 50]` | ✅ |
| 36 | Holy Knight | T5 | `[45, 35, 45, 50]` | ✅ |
| 37 | Brahma (Brahma-Kera) | T5 | `[45, 35, 45, 50]` | ✅ |
| 38 | Sky Sovereign | T5 | `[45, 35, 45, 50]` | ✅ |
| 39 | Archmage | T5 | `[45, 35, 45, 50]` | ✅ |
| 40 | High Priest | T5 | `[45, 35, 45, 50]` | ✅ |
| 41 | Warlock | T5 | `[45, 35, 45, 50]` | ✅ |

> ⚠️ **Dragoon (ID 25):** EXP Curve aktual `[30, 20, 30, 30]` — perlu dikonfirmasi apakah ini disengaja atau perlu diubah menjadi `[40, 30, 40, 40]`.

---

## 📌 CATATAN STATE EFFECT AKTUAL (`data/States.json`)

ID State yang digunakan di traits kelas mengacu pada **States.json aktual**, bukan cheatsheet lama:

| ID | Nama State |
| :--: | :--- |
| 4 | Poison |
| 5 | Burn |
| 6 | Bleed |
| 7 | Paralyze |
| 8 | Sleep |
| 9 | Confuse |
| 10 | Curse |
| 11 | Stun |
| 12 | Chill |
| 13 | Freeze |
| 14 | Shadow State |
| 15 | Blind |
| 16 | Fear |
| 17 | Silence |
| 18 | Root |
| 19 | Holy Veil |
| 20 | Vulnerable |
| 21 | Hunter's Mark |
| 22 | Haste |
| 23 | Taunt |

---
*Modul disusun untuk proyek game RPG Maker MV: **Tales of The Dark Time**.*
*Terakhir diverifikasi: **1 September 2026** — disinkronkan dengan `data/Classes.json` & `data/States.json`*
