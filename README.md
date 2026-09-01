# 🎮 Tales of The Dark Time

Game RPG berbasis **RPG Maker MV** dengan dunia fantasi *Nusvanir*, menyajikan sistem pertarungan taktis mendalam, variasi kelas berjenjang, dan mekanik status effect yang kaya.

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

---

## 🎯 Target Berikutnya (Next Target)
- [ ] **Penyusunan Skill untuk Tiap Class:**
  * Mulai merancang, menyusun, dan mengonfigurasi database Skill (`data/Skills.json`) untuk masing-masing kelas (Tier 1 s/d Tier 5).
  * Mengatur formula damage, konsumsi MP/TP, efek status/debuff, dan animasi skill sesuai tema dan peran setiap kelas.

---

## 📂 Struktur Dokumen Acuan Database
| File Dokumen | Deskripsi |
| :--- | :--- |
| `CHEATSHEET_STATE_EFFECT_NUSVANIR.md` | Master cheatsheet status effect (States) & Yanfly notetags |
| `CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md` | Cetak biru kurva EXP, rank parameter, & traits 41 kelas |
| `PANDUAN_DATABASE_ACTORS_DAN_TRAITS.md` | Panduan perancangan aktor, job class, dan traits RPG Maker MV |
| `WIKI_DATABASE_RPG_MAKER_MV.html` | Wiki interaktif database RPG Maker MV |
