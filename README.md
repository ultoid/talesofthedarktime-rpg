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


TYPES
↓
STATES
↓
SKILLS
↓
CLASSES
↓
ACTORS
↓
ITEMS
↓
WEAPONS
↓
ARMORS
↓
ENEMIES
↓
TROOPS
↓
SYNTHESIS / ECONOMY
↓
COMMON EVENTS
↓
MAPS & QUEST

---

## 🗓️ Update: 10 September 2026 — Rebuild Database Inti Nusvanir

Database inti proyek telah direbuild dan disinkronkan ulang berdasarkan database Nusvanir terbaru.

### ✅ Database yang Sudah Masuk
- **States**
  - State lama yang perlu dipertahankan tetap dijaga pada blok awal.
  - State Nusvanir dimasukkan ulang dari database terbaru.
  - Beberapa passive/state yang sebelumnya kehilangan definisi telah direcall dan diperbaiki.
  - Masih ada state yang membutuhkan custom logic seperti stack, barrier, conditional trigger, summon interaction, dan targeting khusus.

- **Skills**
  - Skill bawaan RPG Maker MV ID 1–10 dipertahankan sebagai legacy.
  - ID 11 sengaja dikosongkan sebagai separator.
  - Skill Nusvanir mulai dari ID 12.
  - Total skill Nusvanir yang sudah masuk: **536 skill**.
  - Skill sudah dimapping untuk skill type, MP/SP cost, scope, damage type, element, formula, variance, critical, success rate, repeats, TP gain, speed, hit type, status effect, passive state, dan skill effect bila memungkinkan.

- **Classes**
  - Class lama tidak dipertahankan; rebuild dilakukan secara fresh.
  - Total class yang masuk: **50 class**.
  - EXP curve diambil dari database class terbaru.
  - Parameter curve dibuat ulang dari grade A–E dan tier.
  - Traits dimapping ke native RPG Maker MV bila memungkinkan.
  - Learnset class sudah dimasukkan dari database Fighter, Apprentice, dan Scout.
  - Total learnset row yang berhasil diproses: **357**.
  - Tidak ada unresolved skill reference pada learnset yang sudah diproses.

- **Items**
  - Seluruh item bawaan RPG Maker MV ditimpa.
  - Total item Nusvanir yang masuk: **398 item**.
  - Item disusun ulang dari ID 1 mengikuti urutan database Nusvanir.
  - Consumable, Key Item, Material, Forge, Valuable, dan metadata lain sudah ikut dimasukkan.

- **Weapons**
  - Seluruh weapon bawaan RPG Maker MV ditimpa.
  - Total weapon Nusvanir yang masuk: **66 weapon**.
  - Weapon Type, parameter dasar, price, rarity, acquisition, region, serta sebagian trait/notetag sudah dimapping.

- **Armors**
  - Seluruh armor bawaan RPG Maker MV ditimpa.
  - Total armor/equipment Nusvanir yang masuk: **123 entry**.
  - Equip Slot, parameter dasar, rarity, Set Name, bonus set, acquisition, lore region, serta sebagian trait/notetag sudah dimapping.

- **Enemies**
  - Seluruh enemy bawaan RPG Maker MV ditimpa.
  - Total enemy Nusvanir yang masuk: **80 enemy**.
  - Total action pattern yang berhasil terhubung ke Skills: **240**.
  - Total enemy trait rows yang diproses: **444**.
  - Tidak ada unresolved enemy skill reference.
  - Drop source sudah dihubungkan ke Items / Weapons / Armors.
  - Battler image belum diisi karena database tidak menyimpan filename battler project.

### ⏸ Database yang Sengaja Ditunda
- **Actors**
  - Untuk sementara dilewati.
- **Troops**
  - Belum dikerjakan pada fase ini.
- **Common Events / Maps / Quests**
  - Belum masuk fase sinkronisasi ulang.
- **Synthesis / Economy implementation**
  - Data desain sudah ada, tetapi implementasi runtime dan integrasi recipe/forge belum difinalkan.

---

## ⚠️ Kekurangan / Pending Implementation

### States
Masih ada state yang belum 100% selesai secara mekanik. Beberapa sudah memiliki trait/notetag dasar, tetapi masih membutuhkan sistem custom.

Kategori utama:
- Stack / Counter / Marker
- Barrier / Shield / Redirect / Protect
- Summon / Companion / Contract
- Heal / Regen / Revive / Cleanse
- Extra Turn / Cooldown
- Stealth / Untargetable / Special Targeting
- Conditional Trigger
- Damage Modifier / Penetration / Lifesteal
- Elemental Interaction

Contoh state yang membutuhkan custom logic:
- `Martyr's Faith`
- `Holy Barrier`
- `Flame Eater`
- `Dragon Hunter's Instinct`
- `Divine Gift`
- berbagai state stack, summon, barrier, trigger on hit/kill, dan HP threshold

Solusi yang disarankan:
- selesaikan dulu semua yang bisa memakai native Trait / YEP notetag
- sisanya dibuat reusable melalui `NUSV_StateCore.js`
- jangan membuat script terpisah untuk setiap state bila mekaniknya bisa digeneralisasi

### Skills
Masih ada beberapa skill yang memakai marker pending/custom untuk:
- custom scope
- formula/effect kompleks
- skill effect non-native
- element yang belum tersedia di `System.json`
- action/target logic yang membutuhkan plugin

Element yang masih perlu keputusan:
- `Void`
- `Poison`
- beberapa label element non-System lainnya

Catatan:
- Jangan remap element secara paksa.
- Jika element memang menjadi bagian desain permanen Nusvanir, tambahkan secara resmi di `System.json` terlebih dahulu.

### Classes
Masih ada sedikit trait class yang belum terpetakan bersih.
Perlu:
- audit trait unresolved
- cek ulang parameter curve di runtime
- cek skill learnset seluruh class
- class Tier 5/Tier 6 tetap mengikuti keputusan desain terbaru dan jangan diaktifkan sebagai playable tanpa keputusan baru

### Items
Masih ada item effect yang belum dapat dimapping langsung karena sumber hanya menyebut:
- `small / medium / large`
- buff tanpa angka atau durasi
- socket effect
- upgrade requirement
- forge/custom effect
- effect yang membutuhkan script

Perlu:
- standarkan nilai numerik consumable
- definisikan durasi buff
- sambungkan recipe/key item ke synthesis
- implementasikan forge / enhance / socket / upgrade sesuai sistem Nusvanir

### Weapons
Masih ada banyak special/signature effect yang membutuhkan custom logic.

Perlu:
- implementasi efek Mythic / Signature
- conditional damage
- proc / unleash
- weapon-specific passive
- Rune resonance
- multi-hit / critical / armor penetration yang belum sepenuhnya native
- integrasi dengan `NUSV_WeaponUnleash`, `NUSV_DamageCore`, `NUSV_CriticalControl`, dan sistem socket/upgrade

### Armors
Masih ada special/signature effect dan set effect yang belum runtime-complete.

Masalah konfigurasi penting:
- `System.json` saat ini hanya mendefinisikan Armor Type:
  - Basic Armor
  - Magic Robe
  - Light Armor
  - Heavy Armor
  - Light Shield
  - Heavy Shield
- sementara database Nusvanir juga memakai:
  - Helm
  - Boots
  - Accessory
  - Relic

Saat ini beberapa entry memakai fallback `atypeId: 1`.

Perlu:
- tentukan apakah Helm / Boots / Accessory / Relic akan ditambahkan resmi ke `System.json`
- atau tetap sebagai Equip Type saja dengan Armor Type fallback yang memang disengaja
- implementasikan Set Name 2/3/4/5-piece effect melalui sistem passive/custom, tanpa Set Bonus Master terpisah

### Enemies
Masih ada enemy trait yang belum bisa dimapping karena:
- element belum ada di `System.json`
- custom passive/mechanic
- conditional AI
- probabilistic action condition
- extra drop di luar limit native MV

Element/label yang masih membutuhkan keputusan:
- Void
- Iron
- Poison
- Crystal
- dan label lain yang belum menjadi Element resmi

Catatan limit native:
- RPG Maker MV hanya memiliki **3 native drop slots** per enemy.
- Enemy dengan drop tambahan/boss unique di luar 3 slot membutuhkan custom drop system.
- Condition seperti `Turn 2+ / 50% chance` membutuhkan AI/custom logic untuk bagian probabilitasnya.

### System.json
Perlu sinkronisasi final untuk:
- daftar Element
- Armor Type
- kemungkinan penambahan tipe khusus yang memang canonical
- memastikan Skill Type / Weapon Type / Equip Type tetap konsisten dengan database hasil rebuild

### Plugin / Runtime Testing
Setelah semua pending database selesai:
- cek urutan plugin
- lakukan syntax test
- jalankan smoke test
- test langsung di RPG Maker MV
- cek save compatibility
- cek battle runtime
- cek passive state
- cek summon
- cek item/weapon/armor independent item behavior
- cek class learnset
- cek enemy AI dan drop

Jangan menganggap data "runtime-safe" hanya karena JSON valid. Validasi terakhir tetap harus dilakukan di engine RPG Maker MV.

---

## 🎯 Target Berikutnya

- [ ] Audit dan selesaikan seluruh State custom logic
- [ ] Finalisasi element & armor type di `System.json`
- [ ] Audit Skills custom scope/formula/effect
- [ ] Finalisasi consumable item values dan buff duration
- [ ] Implementasi Weapon Signature / Mythic effect
- [ ] Implementasi Armor Set effect dan special effect
- [ ] Finalisasi Enemy custom traits, AI chance, dan extra drops
- [ ] Sinkronisasi `Actors.json`
- [ ] Runtime test seluruh database di RPG Maker MV
- [ ] Update cheatsheet/documentation agar mengikuti database hasil rebuild terbaru

