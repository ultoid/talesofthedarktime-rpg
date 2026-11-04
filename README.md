# ⚔️ Tales of The Dark Time (Nusvanir RPG Project)

> **Dokumentasi Proyek, Pembaruan Sistem Terakhir, dan Rencana Pengembangan (Handover Log)**  
> *Terakhir diperbarui: 5 November 2026*

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

### 6. Perombakan Total & Penataan Ulang Katalog Items (109 Item Terstruktur)
* **Penyederhanaan Katalog Inti:**  
  Mereduksi 398 item warisan lama menjadi **109 item fungsional** yang terbagi rapi ke dalam 5 kategori:
  * **Consumables (#01–#29):** Pemulih HP/MP/SP (3 Tier), Elixir (2 Tier), Phoenix Feather, 10 Obat Penawar Status Kanonikal, 5 Tonik Buff (+1 Stat Stage), dan Smoke Bomb.
  * **Crafting Materials (#30–#62):** 33 Material linier Tier 1–5 selaras resep senjata & zirah (Logam, Kayu, Kulit, Kain, Herbal, & Inti Elemen).
  * **Forge & Socket (#63–#87):** 25 Kristal soket 6 Base Stat (T1–T3), 3 Kristal Vitalitas (HP/MP/SP), Enhance Stone, dan Socket Chisel.
  * **Valuables (#88–#97):** 10 Komoditas murni jual Saka (Tembaga, Perak, Emas, Permata, Relik Naga).
  * **Key Items (#98–#109):** 8 Kontrak Iblis Necromancer, Lencana Gilda, Kunci Reruntuhan, Peta Dunia, dan Memory Shard.
* **Perlindungan Scroll & Grimoire:**  
  182 Scroll Pusaka (#400–#581) dan 4 Grimoire (#582–#585) 100% terlindungi tanpa pergeseran ID untuk menjaga integritas sistem belajar skill kelas.
* **Sinkronisasi Drop Musuh:**  
  193 entri drop monster pada `Enemies.json` telah diselaraskan dengan item material & valuable baru.
* **Integritas Database:**  
  Audit menyeluruh menghasilkan **0 broken references / 0 issues**.

---

### 7. Skill Animation Studio & Modular Multi-Block Sequencer (CapCut-Style Timeline)
* **Tab Khusus Baru "Skill Animator":**  
  Menghadirkan studio visual terintegrasi penuh untuk mendesain koreografi aksi pertempuran Sideview (SV) RPG Maker MV ala editor video non-linear modern (CapCut / Premiere Pro).
* **Arsitektur 4 Blok Aksi Modular:**  
  Koreografi aksi dirangkai dari 4 tipe blok mandiri yang fleksibel:
  * 🔮 **Rapalan (Cast):** Animasi pembuka/chanting, efek aura sihir, opsi *step forward* (maju sedikit), dan durasi persiapan.
  * 🏃 **Gerak (Move):** Penentuan cara karakter mendekati target (*Melee, Behind/Belakang, Step Forward, Jump/Lompat, Teleport/Blink*). Untuk skill serangan jarak jauh (panah/sihir), blok ini dapat diabaikan agar karakter tetap diam di posisi (*Stay*).
  * ⚔️ **Aksi / VFX (Action):** Inti benturan serangan. Mengatur motion pose karakter (*missile, swing, thrust, spell, guard*), lintasan keyframe VFX, efek audio (SE), guncangan layar (*shake*), kilatan layar (*flash*), reaksi flinch/knockback target, serta popup angka damage.
  * ↩️ **Kembali (Return):** Gerak mundur kembali ke titik awal (*Walk, Jump, Teleport*).
* **Fitur Manajemen Timeline:**  
  * Mendukung penambahan multi-blok aksi (misal: combo 3x tebasan beruntun).
  * Geser urutan blok (Tukar Kiri / Kanan), Duplikasi Blok (*Clone*), Hapus Blok, dan pengubahan durasi (Frame Duration) interaktif per blok.
* **0-Lag Immediate Playback:**  
  Menghapus dead-time 14 frame lama di awal/akhir timeline sehingga animasi langsung aktif seketika pada frame 0 tanpa jeda tunggu.

---

### 8. VFX Keyframe Trajectory, Dynamic Scaling & Easing Engine
* **Sistem Lintasan Dua Titik (Keyframe A & B):**  
  * 🟢 **Titik Awal (Keyframe A):** Menentukan koordinat dan skala kemunculan proyektil (misal: di busur/tangan karakter).
  * 🔴 **Titik Akhir (Keyframe B):** Menentukan titik benturan dan skala saat mengenai sasaran (misal: di dada musuh).
  * Pengguna dapat memilih dan menggeser titik keyframe secara visual langsung di atas canvas target (*Direct Canvas Drag & Drop*).
* **Scaling Dinamis:**  
  Mendukung perubahan ukuran VFX sepanjang lintasan (misal: proyektil membesar dari 75% saat ditembakkan menjadi 120% saat menabrak target).
* **Kurva Easing Presisi:**  
  Pilihan akselerasi lintasan (*Linear, Ease-Out [Halus], Ease-In [Akselerasi Cepat], Smooth [Ease-In-Out]*).
* **Durasi Lintasan Mandiri (`kfDuration`):**  
  Kecepatan terbang proyektil dapat diatur bebas (misal: 10 frame melesat di udara) tanpa harus terikat dengan durasi total blok aksi.
* **Flip Horizontal & Vertikal:**  
  Pilihan membalik grafis spritesheet animasi secara horizontal maupun vertikal untuk menyesuaikan arah tembakan.
* **Dropdown Audio SE Instan:**  
  Pilihan Sound Effect (SE) berbasis dropdown pencarian otomatis membaca seluruh file suara di direktori `audio/se/` game.

---

### 9. In-Game Battle Runtime Plugin (`NUSV_VFXKeyframes.js`)
* **Plugin Engine Tempur Baru:**  
  Dibuat dan didaftarkan di `js/plugins.js` untuk mengeksekusi metadata `<!-- NUSV_ACTION_CONFIG -->` secara *real-time* di dalam pertempuran RPG Maker MV yang sebenarnya.
* **Vektor Lintasan Dunia Nyata (World Space Flight Path):**  
  * Membaca koordinat nyata penyerang (`userSprite` di $X \approx 750$) dan target (`targetSprite` di $X \approx 200$).
  * Menghitung interpolasi proyektil melintasi battlefield sepanjang ~550 pixel dari busur karakter hingga menancap di tubuh musuh (termasuk tembakan diagonal ke musuh di baris atas/bawah).
* **Sinkronisasi Waktu Benturan Yanfly Action Sequence:**  
  Mengotomatiskan sintaks `wait: hitDelay` sebelum baris `action effect: target`, memastikan angka damage, suara benturan (*SE*), dan kedipan musuh meledak tepat saat proyektil panah tiba di tubuh musuh.
* **Dukungan FPS Custom:**  
  Mendukung *playback rate* custom (60 FPS, 30 FPS, 20 FPS, 15 FPS) membebaskan animasi dari batasan kaku 15 FPS bawaan MV.

---

### 10. Normal Attack Senjata Kustom & One-Click Save to Game
* **Koneksi Serangan Biasa Senjata (`NUSV_WeaponUnleash.js`):**  
  * Memperbarui ekspresi reguler parser di `NUSV_WeaponUnleash.js` agar mendukung format `<skill_id: ID>` dan `<Attack Skill: ID>` di samping `<Unleash Skill: ID>`.
  * Menghubungkan *Pine Longbow* (Weapon #43) ke aksi tembakan panah kustom Skill #430.
* **Tombol One-Click Save ke Game:**  
  Menambahkan tombol utama **`💾 Simpan ke Game (Project)`** di toolbar atas Skill Animator yang secara otomatis mengompilasi notetag sequence dan langsung menyimpan perubahan ke file database fisik di disk (`data/Skills.json` & `data/Weapons.json`).
* **Verifikasi Integritas:**  
  Re-bundle studio berhasil (`editor.html` & `editor.bundled.html`) dengan **33 dari 33 pemeriksaan lulus (ALL PASS)**.

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
