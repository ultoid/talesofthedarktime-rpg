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
* **ID #30 – #41 (Universal Stat Stages / Buff & Debuff):**  
  Model *stage* (+/- 1 level stat) seragam untuk seluruh 50 kelas:  
  *ATK Up/Down (±25%), DEF Up/Down (±30%), MAT Up/Down (±25%), MDF Up/Down (±30%), Speed Up (+35%), Critical Focus (+30% CRI), Evasion Up (+25% EVA), Barrier (-30% all damage received)*.
* **ID #50 – #56 (Mode Tempur & Stance Spesifik):**  
  Mode pertarungan khas kelas:  
  *Berserk Mode (#50), Dragon Stance (#51), Shadow Mode (#52), Avatar of Guardian (#53), State of Nirvana (#54), Chi Hyper-Burst (#55), Ancestral Protection (#56)*.
* **ID #60 – #62 (Pasif Universal Aksesoris):**  
  *Pasif: Iron Skin (#60), Pasif: Mind Focus (#61), Pasif: Fleet Footed (#62)*.
* **ID #214 – #225 (12 Pasif Alami Ras):**  
  Bawaan ras (*Pribumi, Wahanarsa, Asrivana, Avesari, Butoraksa, Garuda, Hanorok, Nagarasven, Rakshorien, Troliogoro, Dewantara, Bhuta*).
* **ID #226 – #275 (50 Pasif Alami Kelas):**  
  Terkait langsung dengan notetag `<Passive State: ID>` di `Classes.json`.
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
