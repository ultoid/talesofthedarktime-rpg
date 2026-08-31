# 📜 MASTER GUIDE: EXP CURVE & TRAITS LENGKAP 41 KELAS NUSVANIR
**Proyek Game:** *Tales of The Dark Time*  
**Engine:** RPG Maker MV

Dokumen ini adalah cetak biru konfigurasi definitif untuk seluruh **41 Kelas Petualang** di dunia Nusvanir. Setiap kelas dilengkapi dengan:
1. **Nilai Eksak EXP Curve** `[Base Value, Extra Value, Acceleration A, Acceleration B]`.
2. **Parameter Ranks** (*MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK*).
3. **Daftar Lengkap Traits** (Type & Content persis sesuai input RPG Maker MV Database).

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

### [T1] Fighter
* **EXP Curve:** `[25, 15, 20, 20]` *(Pertumbuhan Cepat)*
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: B` | `DEF: B` | `MAT: E` | `MDF: D` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: General Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Small Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 4%**

---

### [T2] Warrior (Fokus Offense)
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A` | `DEF: B` | `MAT: E` | `MDF: D` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: General Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Small Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 6%**
  10. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 110%**

---

### [T2] Squire (Fokus Defense)
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: C` | `DEF: A` | `MAT: E` | `MDF: C` | `AGI: D` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Spear**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Large Shield**
  6. `Equip` $\rightarrow$ **Equip Armor: Small Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 5%**
  9. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 150%** *(Musuh lebih sering menargetkannya)*
  10. `Param` $\rightarrow$ **Sp-Parameter: Guard Effect Rate * 150%** *(Pertahanan Guard lebih kokoh)*

---

### [T2] Brawler (Tangan Kosong / Cakar)
* **EXP Curve:** `[28, 18, 25, 25]` *(Cepat-Lincah)*
* **Parameter:** `MHP: B` | `MMP: E` | `ATK: A` | `DEF: C` | `MAT: E` | `MDF: D` | `AGI: A` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Martial Arts**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glove**
  3. `Equip` $\rightarrow$ **Equip Weapon: Claw**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**
  8. `Attack` $\rightarrow$ **Attack Times + 1** *(Pukulan biasa memukul 2x)*

---

### [T3] Mercenary (Ahli Senjata Berat)
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)*
* **Parameter:** `MHP: A` | `MMP: E` | `ATK: A+` | `DEF: B` | `MAT: E` | `MDF: D` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Greatsword (2-Handed)**
  3. `Equip` $\rightarrow$ **Equip Weapon: Greataxe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: General Armor**
  6. `Equip` $\rightarrow$ **Seal Equip: Shield** *(Wajib 2 tangan, tidak bisa pakai tameng)*
  7. `Param` $\rightarrow$ **Parameter: Attack * 115%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 92%**
  9. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 10%**
  10. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 125%**

---

### [T3] Knight (Ahli Perisai & Pelindung)
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)*
* **Parameter:** `MHP: A+` | `MMP: E` | `ATK: B` | `DEF: A+` | `MAT: E` | `MDF: B` | `AGI: D` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Large Shield**
  6. `Equip` $\rightarrow$ **Lock Equip: Shield** *(Perisai terkunci wajib selalu terpasang)*
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  8. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 200%**
  9. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 90%** *(Reduksi damage fisik 10%)*
  10. `Other` $\rightarrow$ **Special Flag: Substitute** *(Otomatis melindungi kawan HP < 25%)*

---

### [T3] Martial Artist (Lincah & Chi)
* **EXP Curve:** `[32, 22, 30, 30]` *(Sedang-Cepat)*
* **Parameter:** `MHP: B` | `MMP: D` | `ATK: A` | `DEF: C` | `MAT: D` | `MDF: C` | `AGI: A+` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Martial Arts / Chi**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glove**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 12%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 10%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 15%** *(Peluang membalas fisik 15%)*
  9. `Param` $\rightarrow$ **Ex-Parameter: TP Regen + 5%**
---

### [T4] Champion
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)*
* **Parameter:** `MHP: A+` | `MMP: E` | `ATK: S` | `DEF: A` | `MAT: E` | `MDF: C` | `AGI: B` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Special**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Axe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: General Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Small Shield**
  7. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  8. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 15%**
  9. `Param` $\rightarrow$ **Sp-Parameter: TP Charge Rate * 150%**
  10. `Other` $\rightarrow$ **Special Flag: Preserve TP**

---

### [T4] Dragoon (Tombak Udara)
* **EXP Curve:** `[38, 28, 38, 38]` *(Berat-Lincah)*
* **Parameter:** `MHP: B+` | `MMP: D` | `ATK: A+` | `DEF: B` | `MAT: D` | `MDF: C` | `AGI: A+` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Dragon Tech**
  2. `Equip` $\rightarrow$ **Equip Weapon: Spear**
  3. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 12%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**
  8. `Rate` $\rightarrow$ **Element Rate: Wind * 80%**

---

### [T4] Paladin (Pelindung Suci)
* **EXP Curve:** `[42, 32, 42, 42]` *(Berat)*
* **Parameter:** `MHP: S` | `MMP: C` | `ATK: B` | `DEF: S` | `MAT: C` | `MDF: A` | `AGI: D` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Holy Magic**
  2. `Skill` $\rightarrow$ **Add Skill Type: Special**
  3. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  4. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  5. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  6. `Equip` $\rightarrow$ **Equip Armor: Large Shield**
  7. `Param` $\rightarrow$ **Sp-Parameter: Target Rate * 250%**
  8. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 80%**
  9. `Rate` $\rightarrow$ **Element Rate: Holy * 50%**
  10. `Other` $\rightarrow$ **Special Flag: Substitute**

---

### [T4] Monk
* **EXP Curve:** `[38, 28, 38, 38]` *(Berat)*
* **Parameter:** `MHP: A` | `MMP: C` | `ATK: A` | `DEF: B` | `MAT: B` | `MDF: B` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Chi Mastery**
  2. `Equip` $\rightarrow$ **Equip Weapon: Glove**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 20%**
  6. `Param` $\rightarrow$ **Ex-Parameter: HP Regen + 5%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 12%**
  8. `Rate` $\rightarrow$ **State Resist: Poison**

---

### [T5 - Apex] Berserker (Butoraksa / Orc)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: S+` | `MMP: E` | `ATK: S+` | `DEF: C` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: D`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Blood Rage**
  2. `Equip` $\rightarrow$ **Equip Weapon: Greataxe**
  3. `Equip` $\rightarrow$ **Equip Weapon: Greatsword**
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
* **Parameter:** `MHP: S` | `MMP: C` | `ATK: S` | `DEF: S` | `MAT: B` | `MDF: B` | `AGI: D` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Miasma Tech**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Greatsword**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Large Shield**
  6. `Attack` $\rightarrow$ **Attack Element: Darkness**
  7. `Attack` $\rightarrow$ **Attack State: Curse + 30%**
  8. `Rate` $\rightarrow$ **State Resist: Poison, Death**
  9. `Rate` $\rightarrow$ **Element Rate: Darkness * 0%** *(Kebal kegelapan)*
  10. `Rate` $\rightarrow$ **Element Rate: Holy * 150%** *(Lemah elemen suci)*

---

### [T5 - Apex] Holy Knight (Avesari / Transcendence)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: S+` | `MMP: B` | `ATK: A` | `DEF: S+` | `MAT: B` | `MDF: S+` | `AGI: D` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Divine Light**
  2. `Equip` $\rightarrow$ **Equip Weapon: Sword**
  3. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Equip` $\rightarrow$ **Equip Armor: Large Shield**
  6. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 200%**
  7. `Param` $\rightarrow$ **Sp-Parameter: Physical Damage Rate * 70%** *(Reduksi 30% damage fisik)*
  8. `Rate` $\rightarrow$ **State Resist: Curse, Darkness, Poison, Sleep**
  9. `Other` $\rightarrow$ **Special Flag: Substitute**
  10. `Other` $\rightarrow$ **Special Flag: Guard**

---

### [T5 - Apex] Brahma-Kera (Hanorok)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: S` | `MMP: C` | `ATK: S+` | `DEF: A` | `MAT: C` | `MDF: B` | `AGI: S+` | `LUK: S`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Chi Absolute**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff / Polearm**
  3. `Equip` $\rightarrow$ **Equip Weapon: Glove**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 20%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Counter Attack + 25%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 15%**
  8. `Attack` $\rightarrow$ **Attack Times + 1** *(Serangan biasa memukul 2x)*
  9. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**

---

### [T5 - Apex] Sky Sovereign (Garuda)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A+` | `MMP: C` | `ATK: S+` | `DEF: A` | `MAT: A` | `MDF: B` | `AGI: S+` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Sky Dominance**
  2. `Equip` $\rightarrow$ **Equip Weapon: Spear**
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

### [T1] Apprentice
* **EXP Curve:** `[25, 15, 20, 20]` *(Pertumbuhan Cepat)*
* **Parameter:** `MHP: E` | `MMP: B` | `ATK: E` | `DEF: E` | `MAT: B` | `MDF: B` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 95%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 5%**

---

### [T2] Magician (Fokus Damage)
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)*
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: B` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Elemental Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 90%** *(Diskon MP 10%)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 8%**

---

### [T2] Acolyte (Fokus Heal)
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)*
* **Parameter:** `MHP: D` | `MMP: A` | `ATK: E` | `DEF: D` | `MAT: B` | `MDF: A` | `AGI: C` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Holy Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 125%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 3%**

---

### [T2] Occultist (Fokus Dark / Curse)
* **EXP Curve:** `[30, 20, 30, 30]` *(Standar)*
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: E` | `MAT: A` | `MDF: B` | `AGI: C` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Dark Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Attack` $\rightarrow$ **Attack Element: Darkness**
  6. `Attack` $\rightarrow$ **Attack State: Curse + 20%**
  7. `Rate` $\rightarrow$ **Element Rate: Darkness * 70%**

---

### [T3] Mage
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)*
* **Parameter:** `MHP: E` | `MMP: A+` | `ATK: E` | `DEF: E` | `MAT: A+` | `MDF: A` | `AGI: C` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Elemental Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 85%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 12%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 5%**

---

### [T3] Cleric
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)*
* **Parameter:** `MHP: D` | `MMP: A+` | `ATK: E` | `DEF: D` | `MAT: B` | `MDF: A+` | `AGI: C` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Holy Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 150%**
  6. `Param` $\rightarrow$ **Sp-Parameter: Pharmacology * 150%**
  7. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 5%**

---

### [T3] Cultist
* **EXP Curve:** `[35, 25, 35, 35]` *(Menengah)*
* **Parameter:** `MHP: E` | `MMP: A` | `ATK: E` | `DEF: D` | `MAT: A` | `MDF: B` | `AGI: C` | `LUK: A+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Hex / Blood Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Reflection + 10%**
  6. `Rate` $\rightarrow$ **State Resist: Fear, Confusion**

---

### [T4] Elementalist (Pyromancer / Hydro / Aero / Terra)
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)*
* **Parameter:** `MHP: E` | `MMP: S` | `ATK: E` | `DEF: E` | `MAT: S` | `MDF: A` | `AGI: B` | `LUK: C`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Primordial Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 80%**
  5. `Param` $\rightarrow$ **Parameter: M.Attack * 120%**
  6. `Rate` $\rightarrow$ **Element Rate: Fire * 50%**
  7. `Rate` $\rightarrow$ **Element Rate: Ice * 50%**
  8. `Rate` $\rightarrow$ **Element Rate: Thunder * 50%**

---

### [T4] Priest (Penyembuh Utama Militer)
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)*
* **Parameter:** `MHP: C` | `MMP: S` | `ATK: E` | `DEF: C` | `MAT: C` | `MDF: S` | `AGI: C` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: High Holy Magic**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Mace**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Equip` $\rightarrow$ **Equip Armor: General Armor**
  6. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 200%**
  7. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 10%**
  8. `Rate` $\rightarrow$ **State Resist: Poison, Silence**

---

### [T4] Necromancer
* **EXP Curve:** `[40, 30, 40, 40]` *(Berat)*
* **Parameter:** `MHP: D` | `MMP: S` | `ATK: D` | `DEF: D` | `MAT: S` | `MDF: B` | `AGI: C` | `LUK: A+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Necromancy**
  2. `Equip` $\rightarrow$ **Equip Weapon: Scythe / Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Rate` $\rightarrow$ **State Resist: Death, Disease, Poison**
  6. `Rate` $\rightarrow$ **Element Rate: Darkness * 0%** *(Kebal Dark)*
  7. `Rate` $\rightarrow$ **Element Rate: Holy * 200%** *(Sangat Lemah Holy)*

---

### [T5 - Apex] Archmage (Asrivana)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: D` | `MMP: S+` | `ATK: E` | `DEF: D` | `MAT: S+` | `MDF: S+` | `AGI: A` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Grand Elemental**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 50%** *(Diskon MP 50% tanpa recoil)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Magic Reflection + 25%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 15%**
  7. `Rate` $\rightarrow$ **State Resist: Silence**
  8. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] High Priest (Sang Hyang Cahaya)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: B` | `MMP: S+` | `ATK: D` | `DEF: B` | `MAT: B` | `MDF: S+` | `AGI: B` | `LUK: S+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Angelic Covenant**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Param` $\rightarrow$ **Sp-Parameter: Recovery Rate * 250%**
  5. `Param` $\rightarrow$ **Sp-Parameter: Pharmacology * 200%**
  6. `Rate` $\rightarrow$ **State Resist: All Bad States** *(Kebal semua status buruk)*
  7. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] Warlock (Kala Laksana)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: D` | `MMP: S+` | `ATK: D` | `DEF: C` | `MAT: S+` | `MDF: A` | `AGI: B` | `LUK: S+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Demonic Corruption**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Attack` $\rightarrow$ **Attack State: Corruption 100%**
  6. `Attack` $\rightarrow$ **Attack Element: Darkness**
  7. `Param` $\rightarrow$ **Sp-Parameter: MP Cost Rate * 70%**
  8. `Rate` $\rightarrow$ **State Resist: Curse, Poison, Silence, Death**

---

### [T5 - Apex] Shaman (Troliogoro / Arkananta)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: A+` | `ATK: C` | `DEF: A` | `MAT: A+` | `MDF: A+` | `AGI: D` | `LUK: S`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Earth Spirit**
  2. `Equip` $\rightarrow$ **Equip Weapon: Totem / Staff**
  3. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  4. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  5. `Param` $\rightarrow$ **Ex-Parameter: HP Regen + 8%**
  6. `Param` $\rightarrow$ **Ex-Parameter: MP Regen + 8%**
  7. `Rate` $\rightarrow$ **Element Rate: Earth * 0%** *(Kebal Tanah/Batu)*
  8. `Rate` $\rightarrow$ **Element Rate: Water * 50%**

---

### [T5 - Apex] Dragon Aspect (Nagarasven)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A+` | `MMP: S+` | `ATK: B` | `DEF: A` | `MAT: S+` | `MDF: S` | `AGI: C` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Ancient Dragon Rune**
  2. `Equip` $\rightarrow$ **Equip Weapon: Staff / Claw**
  3. `Equip` $\rightarrow$ **Equip Armor: Magic Robe**
  4. `Equip` $\rightarrow$ **Equip Armor: Heavy Armor**
  5. `Param` $\rightarrow$ **Sp-Parameter: Magical Damage Rate * 70%** *(Reduksi 30% semua sihir musuh)*
  6. `Rate` $\rightarrow$ **Element Rate: Fire * 0%** *(Kebal Api)*
  7. `Rate` $\rightarrow$ **State Resist: Burn, Stun, Silence**
---

# 🏹 3. JALUR LINCAH (RANGED / ASSASSIN)

---

### [T1] Scout
* **EXP Curve:** `[22, 14, 18, 18]` *(Sangat Cepat)*
* **Parameter:** `MHP: C` | `MMP: D` | `ATK: C` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Survival / Scout**
  2. `Equip` $\rightarrow$ **Equip Weapon: Bow**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 98%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 8%**

---

### [T2] Archer (Fokus Busur Jauh)
* **EXP Curve:** `[28, 18, 28, 28]` *(Cepat)*
* **Parameter:** `MHP: C` | `MMP: D` | `ATK: B` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: B` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Archery**
  2. `Equip` $\rightarrow$ **Equip Weapon: Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**

---

### [T2] Thief (Fokus Kecepatan & Belati)
* **EXP Curve:** `[25, 16, 25, 25]` *(Sangat Cepat)*
* **Parameter:** `MHP: D` | `MMP: D` | `ATK: C` | `DEF: E` | `MAT: E` | `MDF: E` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Thievery**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 12%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 8%**
  6. `Other` $\rightarrow$ **Party Ability: Gold Double**

---

### [T3] Ranger (Bertahan Hidup di Alam)
* **EXP Curve:** `[34, 24, 34, 34]` *(Menengah)*
* **Parameter:** `MHP: B` | `MMP: D` | `ATK: B+` | `DEF: C` | `MAT: D` | `MDF: D` | `AGI: A` | `LUK: B`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Archery / Trap**
  2. `Equip` $\rightarrow$ **Equip Weapon: Bow**
  3. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  4. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  6. `Other` $\rightarrow$ **Party Ability: Encounter Half**
  7. `Other` $\rightarrow$ **Party Ability: Cancel Surprise**

---

### [T3] Rogue (Menyelinap & Jebakan)
* **EXP Curve:** `[32, 22, 32, 32]` *(Menengah-Cepat)*
* **Parameter:** `MHP: D` | `MMP: D` | `ATK: B` | `DEF: D` | `MAT: E` | `MDF: E` | `AGI: A+` | `LUK: A+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Thievery / Poison**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 15%**
  5. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 18%**
  6. `Attack` $\rightarrow$ **Attack State: Poison + 30%**

---

### [T4] Sniper (Akurasi Jarak Jauh Maksimal)
* **EXP Curve:** `[38, 28, 38, 38]` *(Berat)*
* **Parameter:** `MHP: C` | `MMP: D` | `ATK: A+` | `DEF: D` | `MAT: E` | `MDF: D` | `AGI: A` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Snipe Tech**
  2. `Equip` $\rightarrow$ **Equip Weapon: Bow / Crossbow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 108%** *(Mutlak Anti-Miss)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 20%**
  6. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**

---

### [T4] Assassin (Kritikal Instan & Racun)
* **EXP Curve:** `[38, 28, 38, 38]` *(Berat)*
* **Parameter:** `MHP: D` | `MMP: D` | `ATK: A+` | `DEF: E` | `MAT: D` | `MDF: E` | `AGI: S` | `LUK: S`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Assassination**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Equip` $\rightarrow$ **Slot Type: Dual Wield** *(Wajib memegang 2 belati sekaligus)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 25%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 20%**
  7. `Attack` $\rightarrow$ **Attack State: Poison + 50%**
  8. `Attack` $\rightarrow$ **Attack State: Instant Death + 5%**

---

### [T5 - Apex] Beastmaster (Wuru Loka)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: A` | `MMP: C` | `ATK: A+` | `DEF: B` | `MAT: B` | `MDF: C` | `AGI: A+` | `LUK: A`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Beast Taming**
  2. `Equip` $\rightarrow$ **Equip Weapon: Whip / Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Other` $\rightarrow$ **Action Times + 50%** *(50% peluang aksi 2x)*
  5. `Other` $\rightarrow$ **Party Ability: Drop Item Double**
  6. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 100%**
  7. `Rate` $\rightarrow$ **State Resist: Fear, Confusion**

---

### [T5 - Apex] Shadow Walker (Kala Laksana)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: D` | `MMP: D` | `ATK: S` | `DEF: E` | `MAT: D` | `MDF: E` | `AGI: S+` | `LUK: S+`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Shadow Void**
  2. `Equip` $\rightarrow$ **Equip Weapon: Dagger**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Equip` $\rightarrow$ **Slot Type: Dual Wield**
  5. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 35%** *(Sangat sulit terkena serangan fisik)*
  6. `Param` $\rightarrow$ **Ex-Parameter: Magic Evasion + 30%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 30%**
  8. `Rate` $\rightarrow$ **State Resist: Blind, Stun, Sleep**
  9. `Other` $\rightarrow$ **Action Times + 50%**

---

### [T5 - Apex] Windrunner (Asrivana / Elf)
* **EXP Curve:** `[45, 35, 45, 50]` *(Sangat Berat / Endgame)*
* **Parameter:** `MHP: C` | `MMP: C` | `ATK: S+` | `DEF: D` | `MAT: C` | `MDF: C` | `AGI: S+` | `LUK: S`
* **Daftar Traits Lengkap di MV:**
  1. `Skill` $\rightarrow$ **Add Skill Type: Wind Archery**
  2. `Equip` $\rightarrow$ **Equip Weapon: Bow**
  3. `Equip` $\rightarrow$ **Equip Armor: Light Armor**
  4. `Attack` $\rightarrow$ **Attack Times + 2** *(Serangan biasa otomatis menembakkan 3 anak panah berturut-turut)*
  5. `Param` $\rightarrow$ **Ex-Parameter: Hit Rate + 115%**
  6. `Param` $\rightarrow$ **Ex-Parameter: Critical Rate + 25%**
  7. `Param` $\rightarrow$ **Ex-Parameter: Evasion Rate + 25%**
  8. `Other` $\rightarrow$ **Party Ability: Raise Preemptive**
  9. `Rate` $\rightarrow$ **Element Rate: Wind * 0%** *(Kebal Elemen Angin)*

---
*Modul disusun untuk proyek game RPG Maker MV: **Tales of The Dark Time**.*
