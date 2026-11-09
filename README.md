# ⚔️ Tales of The Dark Time

<p align="center">
  <strong>A Dark Grim-Fantasy Turn-Based Tactical JRPG built on RPG Maker MV with the NUSV Custom Engine Suite</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-RPG%20Maker%20MV%20(v1.6.2)-blue.svg" alt="Engine" />
  <img src="https://img.shields.io/badge/Architecture-NUSV%20Clean--Room%20Custom%20Core-darkviolet.svg" alt="Architecture" />
  <img src="https://img.shields.io/badge/Resolution-1080x720%20(3:2)-success.svg" alt="Resolution" />
  <img src="https://img.shields.io/badge/Status-Core%20Engine%20Complete-brightgreen.svg" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20(NW.js%20%2F%20HTML5)-orange.svg" alt="Platform" />
</p>

---

## 📖 Overview

**Tales of The Dark Time** (Nusvanir RPG Project) adalah game peran taktis bergaya klasik modern (*Turn-Based Tactical JRPG*) berlatar dunia fantasi gelap benua **Nusvanir**. Dibangun menggunakan fondasi *RPG Maker MV* yang dimodernisasi secara menyeluruh dengan **NUSV Clean-Room Custom Engine Suite** dan integrasi **Yanfly Engine Plugins (YEP)** terpilih.

Game ini menitikberatkan pada pertempuran taktis berbasis waktu nyata (Charge Turn Battle), alur pergerakan kamera sinematik, kebebasan eksperimen build karakter (50 kelas, 6 Base Stats, dual-level progression), dan pengelolaan sumber daya fisik stamina (SP) yang presisi.

---

## ✨ Fitur Utama (Key Features)

### 🗡️ Sistem Pertempuran Taktis Berkecepatan Tinggi (CTB)
- **Charge Turn Battle (CTB)**: Antrean giliran individual dinamis yang diatur oleh stat kelincahan (*AGI*) dan beban aksi.
- **Tipografi Vektor HD & Overhead Indicators**: Angka damage vektor tajam (`BattleFont`) yang melayang bersih di atas kepala battler dengan skema warna terstandar (Putih, Coral, Emas, Hijau Zamrud, Ungu, Cyan, Perak).
- **Arah Serangan Deterministik**: Sistem sinkronisasi otomatis (*Directional Auto-Mirroring*) yang menjamin serangan Party ke musuh selalu menghadap **KIRI** dan musuh ke Party selalu menghadap **KANAN**.

### 🌟 Sistem Progresi Karakter Mendalam
- **Dual Level System**:
  - **Base Level (1–99)**: Menentukan pertumbuhan fisik alami dan memberikan **3 Stat Points bebas** setiap kenaikan level.
  - **Class Level (1–50+)**: Mengukur tingkat penguasaan kelas aktif dengan batas Tier Cap (Tier 1 s/d Tier 5) dan bonus *Class Stat Growth*.
- **6 Base Stats & Derived Stat Pipeline**:
  - `STR`, `INT`, `DEX`, `LUK`, `AGI`, dan `VIT` yang menggerakkan seluruh atribut turunan (Max HP, Max MP, Dynamic Max SP, Melee & Ranged ATK, DEF, MAT, MDF, Action Speed, Hit, Evasion, Crit, Guard Efficiency, dan Regens).
- **Sistem Stamina Points (SP) Dinamis**:
  - Menggantikan parameter TP menjadi tenaga fisik yang tersimpan antar pertempuran (*preserved*).
  - Mekanik tempur in-battle: **Guard Stamina Surge** (pemulihan SP instan saat bertahan) dan **On-Hit Adrenaline** (regenerasi SP saat menerima damage berdasarkan ketahanan tubuh VIT).

### ⚔️ Regulasi Perlengkapan & 10 Gaya Senjata
- **Aturan 1-Handed (1H) vs 2-Handed (2H)**: Senjata dua tangan (*Long Sword, Axe, Spear, Staff, Long Bow, Crossbow*) otomatis menyegel slot tangan kiri dan mengembalikan offhand ke tas.
- **Dual Wield Fisik & Sihir**: Assassin/Shadow Walker dapat memegang dua senjata fisik, sementara 24 kelas sihir dapat memegang Dual Rune untuk menggabungkan dua elemen mantra sekaligus.
- **Dual Accessory & Universal Relics**: 2 slot aksesori bebas kombinasi (termasuk aksesori identik) serta relik universal yang dapat dipakai oleh semua kelas.
- **Preset 10 Koreografi Senjata Dasar**: Serangan dasar otomatis menyesuaikan tipe senjata (#431 s/d #440) lengkap dengan animasi benturan dan koreografi unik.

### 🏹 Universal Flying Projectiles & VFX Keyframes
- **Flying Projectiles**: Peluru panah, senjata lempar, proyektil sihir elemen, dan icon terbang melintasi layar dengan lintasan parabola (*arc*) dan auto-tangent rotation.
- **Keyframe Trajectory & Dynamic Scaling**: Pergerakan proyektil dari tangan penyerang hingga tubuh sasaran dengan transisi skala dan kurva easing halus (*ease-out, ease-in, ease-in-out*).

### 🎒 Grid-Based Inventory & Status Screen Modern
- **Modern Grid Inventory**: Tampilan tas 6 kolom bergaya kontemporer dengan sistem kelangkaan (*Common, Uncommon, Rare, Epic, Legendary, Mythic*), detail perlengkapan, dan efek pasif *Signature Effect*.
- **Genshin-Style Character Status Screen**: Layout 3 kolom estetis yang memuat pemilih anggota squad, potret ilustrasi utuh (*full-body portrait*), bar indikator HP/MP/SP/EXP, dan tooltip interaktif untuk status effect.

---

## 🛠️ Studio Pengembangan Mandiri (NUSV Database Studio)

Proyek ini dilengkapi dengan suite perkakas internal yang dapat diakses langsung dari browser atau jendela aplikasi desktop:

- **6-Phase Action Sequence Studio**: Antarmuka visual berbasis CapCut-style multi-block timeline dan flowchart untuk meracik koreografi serangan pertempuran secara drag-and-drop.
- **Native Animation Studio**: Penata animasi spritesheet dengan dukungan potongan grid bebas (sel 48x48, 64x64, 32x32, dll.), deteksi resolusi otomatis, transport deck lengkap, dan 31 spritesheet efek pixel art baru.
- **In-Game Battle Preview Sandbox**: Sandbox duel 1v1 instan yang berjalan langsung di atas engine asli (`Scene_Battle`) dengan MP/SP tak terbatas, dummy immortal, replay instan, speed slider (0.5x, 1x, 2x), dan sinkronisasi notetag secara hot-reload tanpa restart game.

---

## 🚀 Panduan Memulai (Getting Started)

### Persyaratan Sistem
- **Node.js** (v16 atau lebih baru) / **NW.js** untuk eksekusi runtime game.
- **Python** (v3.8 atau lebih baru) untuk server Database Studio dan suite verifikasi otomatis.
- **Web Browser modern** (Firefox, Chrome, Edge, atau Brave).

### 1. Menjalankan Game
Buka file `index.html` menggunakan local web server, atau jalankan melalui RPG Maker MV / NW.js runtime.

### 2. Menjalankan NUSV Database Studio
Database Studio dapat diluncurkan dengan salah satu cara berikut:

**Linux / macOS:**
```bash
# Melalui script shell
./NUSV_Database_Studio.sh

# Atau langsung via Python window launcher
python3 tools/launch_studio.py
```

**Windows:**
```bat
:: Melalui batch file
NUSV_Database_Studio.bat

:: Atau langsung via Python
python tools\launch_studio.py
```

Studio akan berjalan secara otomatis di `http://127.0.0.1:5050` dalam mode aplikasi desktop mandiri (*App Mode*).

### 3. Menjalankan Suite Verifikasi Paritas Otomatis
Pastikan seluruh alur game dan studio lulus pengujian tanpa error:
```bash
python3 tools/test_browser_parity.py
```
*Suite ini menguji navigasi endpoint, parser 6-fase BEC, pergerakan kamera, sinkronisasi arah animasi, dan boot engine Scene_Battle secara headless.*

---

## 📦 Mengunduh & Memulihkan Aset Eksternal (External Assets Setup)

Beberapa dataset aset berukuran sangat besar (~6.5 GB) sengaja di-ignore dari repository Git demi menjaga kecepatan clone dan batas kuota GitHub:
1. **Pixel Art Atlas (1.4M Sprites, ~1.5 GB)**: Dataset biner Hugging Face (`Angais/pixel-art-atlas-1.4m`) yang digunakan untuk kurasi ribuan icon pixel art.
2. **VFX Spritesheets & Animations (~5 GB)**: Ribuan frame animasi partikel beresolusi tinggi yang di-generate dari repositori PixelFX (`https://github.com/patch-gg/pixelfx.git`).

### Cara Otomatis di PC Baru (One-Command):
Jalankan script pemulih otomatis yang telah disediakan:
```bash
python tools/fetch_external_assets.py --all
```
*Atau opsi per kategori:*
* `python tools/fetch_external_assets.py --vfx` : Setup repositori PixelFX dan render ulang seluruh berkas animasi VFX.
* `python tools/fetch_external_assets.py --atlas`: Unduh dataset Pixel Art Atlas 1.4M dan susun ulang `img/system/IconSet.png`.

### 🤖 Command / Prompt untuk AI di PC Baru:
Jika kamu membuka proyek ini dengan Coding AI (Antigravity, Claude Code, Cursor, dll.) di komputer baru, kamu cukup menyalin instruksi ini:
> *"Tolong pulihkan semua aset eksternal proyek dengan menjalankan `python tools/fetch_external_assets.py --all`, pastikan semua folder aset dan IconSet terpasang, lalu verifikasi integritas dengan `python tools/verify_database_integrity.py`."*

---

## 📁 Struktur Direktori Proyek

```text
├── audio/                   # Musik latar (BGM, BGS, ME) dan Sound Effects (SE)
├── concept_art/             # Desain konsep karakter dan ilustrasi dunia Nusvanir
├── data/                    # Berkas database JSON RPG Maker MV & NUSV Engine
├── database/                # Master spreadsheet & CSV kelas, skill, dan grimoire
├── editor_studio/           # Kode sumber modular NUSV Database Studio (HTML, CSS, JS)
│   ├── css/                 # Modul stylesheet terisolasi
│   └── js/                  # API, konstanta, modals, dan editor per tab database
├── fonts/                   # Aset tipografi game (GameFont, BattleFont OTF/TTF)
├── img/                     # Seluruh aset visual (animations, battlers, characters, pictures, titles)
├── js/                      # Script engine RPG Maker MV
│   ├── plugins/             # 65 plugin aktif (NUSV Custom Suite & YEP/SRD)
│   ├── plugins.js           # Konfigurasi status dan parameter plugin
│   └── rpg_*.js             # MV engine core files
├── tests/                   # Unit test engine untuk rule equip, stat system, dan stamina
├── tools/                   # Suite perkakas Python aktif (server, bundler, verifikasi)
│   ├── fetch_external_assets.py # Downloader & restorer aset eksternal (Atlas & VFX)
│   ├── launch_studio.py     # Desktop window launcher
│   ├── nusv_editor_server.py# Backend REST API database server
│   ├── bundle_editor.py     # Bundler modul editor_studio
│   ├── build_complete_studio.py # Build runner studio
│   ├── test_browser_parity.py   # Headless automated testing suite
│   ├── verify_database_integrity.py # Validator integritas database
│   └── verify_editor.py     # Validator antarmuka editor
├── DOCUMENTATION.md         # Dokumentasi teknis komprehensif & handover log proyek
├── DEVELOPMENT ROADMAP.md   # Peta rencana pengembangan dan milestone lanjutan
├── PluginGuide.md           # Panduan lengkap 65 plugin, notetag, dan script call
├── editor.bundled.html      # Hasil bundel studio mandiri untuk distribusi
├── index.html               # File entri utama game RPG Maker MV
└── package.json             # Manifest konfigurasi NW.js / Chromium
```

---

## 📚 Tautan Dokumentasi Terkait

Untuk pemahaman teknis lebih mendalam, rujuk dokumen-dokumen pendukung berikut:
- **[DOCUMENTATION.md](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/DOCUMENTATION.md)**: Dokumentasi arsitektur komprehensif, rincian 50 kelas, katalog padat skill & state, kalkulasi formula damage, dan catatan riwayat pembaruan sistem.
- **[PluginGuide.md](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/PluginGuide.md)**: Panduan notetag, parameter, plugin commands, dan script calls lengkap untuk seluruh 65 plugin aktif.
- **[DEVELOPMENT ROADMAP.md](file:///mnt/DC9EA2C29EA29494/Nusvanir_Vault/Game%20Project/Tales%20of%20The%20Dark%20Time/DEVELOPMENT%20ROADMAP.md)**: Roadmap target berikutnya untuk balancing sistem, fiksasi state, dan penataan quest.

---

## ⚖️ Lisensi & Hak Cipta

- **Tales of The Dark Time / Nusvanir Universe** © 2026 Tim Pengembang Nusvanir. Seluruh hak cipta dilindungi.
- **NUSV Engine Plugins & Database Studio** dilisensikan untuk proyek internal Nusvanir.
- **Yanfly Engine Plugins (YEP)** & **SumRndmDde (SRD)** digunakan sesuai dengan lisensi dan atribusi pengembang masing-masing.
