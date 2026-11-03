# ⚔️ Tales of The Dark Time (Nusvanir RPG Project)

> **Dokumentasi Proyek, Pembaruan Sistem Terakhir, dan Rencana Pengembangan (Handover Log)**  
> *Terakhir diperbarui: 3 November 2026*

---

## 📌 Catatan Pembaruan Terakhir (Latest Updates)

### 1. Perombakan Sistem State & Status Efek (Model Pokémon / Classic Turn-Based JRPG)
Database State telah dirampingkan secara menyeluruh dari 275+ entri lama yang tumpang tindih menjadi arsitektur baru yang intuitif, deterministik, dan bebas dari *bloatware*:
* **ID #1 – #20 (Status Ailments Kanonikal):**  
  *Death (#1), Defend (#2), Poison (#4), Burn (#5), Bleed (#6), Paralyze (#7), Sleep (#8), Confuse (#9), Curse (#10), Stun (#11), Slow (#12), Freeze (#13), Blind (#14), Fear (#15), Silence (#16), Root (#17), Vulnerable (#18), Haste (#19), Taunt (#20)*.
* **ID #21 – #25 (Penanda Taktikal & Elemen):**  
  *Soaked (#21), Shock (#22), Petrify (#23), Float (#24), Marked (#25)*.
* **ID #26 – #37 (Universal Stat Stages / Buff & Debuff):**  
  Model *stage* (+/- 1 level stat) seragam untuk seluruh 50 kelas:  
  *ATK Up (#26), ATK Down (#27), DEF Up (#28), DEF Down (#29), MAT Up (#30), MAT Down (#31), MDF Up (#32), MDF Down (#33), Speed Up (#34), Critical Focus (#35), Evasion Up (#36), Barrier (#37)*.
* **ID #38 – #44 (Mode Tempur & Stance Spesifik):**  
  Mode pertarungan khas kelas:  
  *Berserk Mode (#38), Dragon Stance (#39), Shadow Mode (#40), Avatar of Guardian (#41), State of Nirvana (#42), Chi Hyper-Burst (#43), Ancestral Protection (#44)*.
* **ID #45 – #47 (Pasif Universal Aksesoris):**  
  *Pasif: Iron Skin (#45), Pasif: Mind Focus (#46), Pasif: Fleet Footed (#47)*.
* **ID #48 – #59 (12 Pasif Alami Ras):**  
  Bawaan ras (*Pribumi (#48), Wahanarsa (#49), Asrivana (#50), Avesari (#51), Butoraksa (#52), Garuda (#53), Hanorok (#54), Nagarasven (#55), Rakshorien (#56), Troliogoro (#57), Dewantara (#58), Bhuta (#59)*).
* **ID #60 – #109 (50 Pasif Alami Kelas):**  
  Terkait langsung dengan notetag `<Passive State: ID>` di `Classes.json` (ID = 59 + Class ID).
* **Pemadatan Database (0 Empty Slots):**  
  Seluruh slot kosong (166 entri kosong) telah dipangkas habis sehingga database State kini sepenuhnya ringkas, padat, dan kontigu dari ID #1 hingga #109.
* **Integritas Database:** Verifikasi seluruh database membuktikan **0 issue / 0 broken reference**.

---

### 2. Perbaikan Kompatibilitas Scroll untuk Spesialisasi Elementalist
* **Akar Masalah:**  
  Kelas Elementalist di `Classes.json` dinamai dengan prefiks (`Elementalist - Pyromancer`, `Elementalist - Cryomancer`, dst.), sedangkan notetag kompatibilitas scroll hanya mencantumkan nama singkat (`Pyromancer`, `Cryomancer`, dst.). Strict string comparison menyebabkan seluruh spesialisasi Elementalist sebelumnya menampilkan **0 Scroll Kompatibel**.
* **Solusi yang Diterapkan:**  
  1. Memperbarui notetag `<Scroll Compatible>` dan `<TM Compatible>` di `Skills.json` dan `Items.json` agar memuat nama utuh dan nama singkat sekaligus.
  2. Menambahkan seluruh 8 spesialisasi Elementalist ke daftar kompatibel mantra dasar *Apprentice* (#85–#88).
  3. Menambahkan normalisasi dinamis pada plugin runtime `NUSV_SkillLearn.js` dan fungsi editor `getClassCompatibleScrollItems` di `utils.js`.
* **Hasil:**  
  Masing-masing dari 8 spesialisasi Elementalist kini memiliki **53 Scroll Kompatibel** yang dapat dipelajari normal.

---

### 3. Konsistensi Terminologi "SP" (Stamina Point)
* Menggantikan seluruh terminologi warisan RPG Maker "TP" menjadi **SP (Stamina Point)** di Editor Studio, UI, form input, dan plugin runtime (`NUSV_StatSystem.js`, `NUSV_StatusScreen.js`, `System.json`).
* SP bersifat dinamis mengikuti stat fisik (`STR` dan `VIT`) serta *preserved* (tidak reset ke 0 antar pertarungan).

---

### 4. Optimalisasi Tampilan UI Database Studio
* Memperlebar panel sidebar dari `290px` menjadi `330px`.
* Mengadopsi tata letak 2 baris (*two-row card layout*) sehingga seluruh nama skill panjang tampil utuh tanpa terpotong elipsis (`...`).
* Re-bundling selesai pada `editor.html` dan `editor.bundled.html`.

---

### 5. Pembersihan & Pemadatan Database Skill (Purge 134 Obsolete Skills)
* **Pembersihan Skill Warisan Kelas Lama:**  
  Menghapus total **134 entri skill usang** (122 skill lama sisa pra-perombakan kelas di rentang #233–#362 dan 12 prototype usang di rentang #548–#559).
* **Pemadatan Database Kontigu:**  
  * **ID #1 & #2:** Serangan Dasar (*Attack*) & Bertahan (*Guard*).
  * **ID #12 – #232:** **221 Skill Resmi 50 Kelas** (Tier 1 s/d Tier 5) tetap 100% utuh tanpa pergeseran angka, menjaga integritas 182 Scroll TMs dan movepools kelas.
  * **ID #233 – #425:** **193 Skill Aksi Musuh & Bos** dipadatkan secara kontigu tanpa celah kosong.
  * **ID #426 – #429:** **4 Skill Eksplorasi Grimoire** (*Lumos, Garuda's Wings, Trailblaze, Water Strider*).
* **Hasil:** Database Skills.json ramping dari 564 entri menjadi **429 entri padat** dengan **0 broken reference**.

---

## 🎯 Target Pengembangan Besok (Roadmap & Next Steps)

1. **Fiksasi State:**
   - Verifikasi akhir dan penguncian (*freeze*) arsitektur state di seluruh mekanik tempur.
2. **Menyusun & Merapikan Katalog Items:**
   - Strukturisasi menyeluruh untuk *Consumables*, *Key Items*, *Crafting Materials*, *Scroll Pusaka*, dan *Equipments* (Weapons & Armors).
   - Menyelaraskan harga Saka, efek penyembuhan, dan kurva utilitas item.
3. **Balancing All System:**
   - Pengujian 8-Step Damage Pipeline (mencegah *zero damage issue*).
   - Penyetaraan kurva scaling stat 6 Base Stats, mitigasi DEF/MDF, Guard Efficiency, dan Turn Order (Action Speed).

---

## 🚀 Status Repositori & Sinkronisasi
Perubahan telah disinkronkan secara identik ke kedua direktori kerja:
1. `Nusvanir_Vault/Game Project/Tales of The Dark Time/`
2. `Project/Tales of The Dark Time/Tales of The Dark Time/`
EOF
