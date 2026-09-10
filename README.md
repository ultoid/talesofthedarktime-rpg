# 🎮 Tales of The Dark Time

Game RPG berbasis **RPG Maker MV** dengan dunia fantasi *Nusvanir*, menyajikan sistem pertarungan taktis mendalam, variasi kelas berjenjang, dan mekanik status effect yang kaya.

Database : https://docs.google.com/spreadsheets/d/1qddEfyZwrq9_UNrlxMszt5IorWkt8U61qDKVYP1d8iQ/edit?usp=sharing

---

## 📌 Log Pembaruan Terkini (Update Log)

### 🗓️ Update: 31 Agustus 2026
* **Database States (Status Effect):**
  * Mengisi dan mengonfigurasi **19 Status Effect** (ID 0012 – 0031) pada `data/States.json` (*Poison, Burn, Bleed, Paralyze, Sleep, Confuse, Curse, Stun, Chill, Freeze, Shadow State, Blind, Fear, Silence, Root, Holy Veil, Vulnerable, Hunter's Mark, Haste, Taunt*).
  * Menstandarkan pesan pertarungan (*Battle Messages*) dengan perpaduan nama istilah bahasa Inggris dan kalimat sambung bahasa Indonesia (contoh: `[Target] terkena Poison!`, `[Target] menderita efek Burn!`, `[Target] sembuh dari Silence!`).
* **Dokumentasi & Cheatsheet:**
  * Membuat master panduan [CHEATSHEET_STATE_EFFECT_NUSVANIR.md](CHEATSHEET_STATE_EFFECT_NUSVANIR.md) dan versi plaintext [CHEATSHEET_STATE_EFFECT_NUSVANIR.txt](CHEATSHEET_STATE_EFFECT_NUSVANIR.txt).
  * Menyertakan rancangan integrasi **Notetag Plugin Yanfly (YEP - Buffs & States Core)** untuk mekanik dinamis (kombo reaksi elemen, kejang per-turn, batal serang, dll).

---

### 🗓️ Update: 1 September 2026
* **Database Classes (Selesai):**
  * Telah menyelesaikan konfigurasi database seluruh kelas petualang pada `data/Classes.json` (Tier 1 s/d Tier 5).
  * Menyelaraskan EXP Curve, rank parameter (MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK), serta Traits senjata, armor, dan skill untuk setiap kelas.
* **Sinkronisasi Cheatsheet & Dokumentasi:**
  * Memperbarui [CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md](CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md) dan [CHEATSHEET_STATE_EFFECT_NUSVANIR.md](CHEATSHEET_STATE_EFFECT_NUSVANIR.md) (beserta versi `.txt`) agar 100% presisi dan sinkron dengan `data/Classes.json` dan `data/States.json`.

* **Contoh Skill Pasif (Tier 1):**
  * Menambahkan contoh skill pasif untuk kelas Tier 1: `Iron Skin` (Skill ID 21) di `data/Skills.json` dengan notetag `<Passive State: 24>`.
  * Menambahkan State pendukung `Iron Skin (Passive)` (State ID 24) di `data/States.json` yang memberikan MHP +5% dan DEF +10%.
  * Plugin pendukung untuk mekanik ini: `js/plugins/ultoid_passiveskills.js` — file plugin sudah ditambahkan ke folder `js/plugins/`, namun pastikan mengaktifkannya di Plugin Manager untuk menjalankan fitur pasif otomatis.

  * Status: Semua skill untuk **Class Tier 1** telah selesai dan ditambahkan ke `data/Skills.json`.

* **Tier 2 Database & Skill Entry:**
  * Menambahkan file database referensi untuk Tier 2: `Tier 2 Skill.xlsx` (lokasi proyek: root). File ini berisi rancangan skill Tier 2 dan beberapa catatan desain.
  * Beberapa pembaruan tambahan juga telah diterapkan ke database (`data/Skills.json`, `data/MapInfos.json`, `data/System.json`).

---

### 🗓️ Update: 2 September 2026
* **Database Skill Tier 2:**
  * Telah menginput seluruh daftar nama Skill untuk **Class Tier 2** ke dalam `data/Skills.json`.
  * *Catatan:* Parameter skill (seperti formula damage, konsumsi MP/TP, efek status/debuff, scope, dan detail statistik) belum diisi/dikonfigurasi.

---

## 🎯 Target Berikutnya (Next Target)
- [ ] **Pengisian Parameter Skill Tier 2:**
  * Mengatur formula damage, konsumsi MP/TP, efek status/debuff, dan animasi untuk seluruh Skill Class Tier 2 pada `data/Skills.json`.
- [ ] **Penyusunan Skill Class Tier 3 - Tier 5:**
  * Merancang, menyusun, dan mengonfigurasi Skill (`data/Skills.json`) untuk kelas Tier 3 hingga Tier 5.

---

## 📂 Struktur Dokumen Acuan Database
| File Dokumen | Deskripsi |
| :--- | :--- |
| `CHEATSHEET_STATE_EFFECT_NUSVANIR.md` | Master cheatsheet status effect (States) & Yanfly notetags |
| `CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md` | Cetak biru kurva EXP, rank parameter, & traits 41 kelas |
| `PANDUAN_DATABASE_ACTORS_DAN_TRAITS.md` | Panduan perancangan aktor, job class, dan traits RPG Maker MV |
| `WIKI_DATABASE_RPG_MAKER_MV.html` | Wiki interaktif database RPG Maker MV |
