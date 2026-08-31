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

## 🎯 Target Berikutnya (Next Target)
- [ ] **Melengkapi Database Classes:**
  * Mengonfigurasi seluruh **41 Kelas Petualang Nusvanir** (Tier 1 s/d Tier 5) pada `data/Classes.json` berdasarkan acuan [CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md](CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md).
  * Mengatur kurva EXP (*EXP Curve*), pertumbuhan parameter (*Parameter Curves*), dan daftar *Traits* senjata/armor/skill tiap kelas.

---

## 📂 Struktur Dokumen Acuan Database
| File Dokumen | Deskripsi |
| :--- | :--- |
| `CHEATSHEET_STATE_EFFECT_NUSVANIR.md` | Master cheatsheet status effect (States) & Yanfly notetags |
| `CHEATSHEET_PARAMETER_CLASS_NUSVANIR.md` | Cetak biru kurva EXP, rank parameter, & traits 41 kelas |
| `PANDUAN_DATABASE_ACTORS_DAN_TRAITS.md` | Panduan perancangan aktor, job class, dan traits RPG Maker MV |
| `WIKI_DATABASE_RPG_MAKER_MV.html` | Wiki interaktif database RPG Maker MV |
