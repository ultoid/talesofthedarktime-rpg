# 📘 ENSIKLOPEDIA & WIKI LENGKAP: SELURUH DATABASE RPG MAKER MV

Modul ini adalah buku panduan komprehensif yang mengupas tuntas **14 Tab Database**, sistem **Traits**, kalkulasi **Damage Formula**, serta implementasi mekanik pada **RPG Maker MV**.

---

## 📑 DAFTAR ISI DATABASE
1. [Tab 1: Actors (Karakter)](#1-tab-actors-karakter-pemain)
2. [Tab 2: Classes (Kelas & Profesi)](#2-tab-classes-kelas--profesi)
3. [Tab 3: Skills (Keahlian & Sihir)](#3-tab-skills-keahlian--sihir)
4. [Tab 4: Items (Barang & Item Konsumsi)](#4-tab-items-barang--item-konsumsi)
5. [Tab 5: Weapons (Senjata)](#5-tab-weapons-senjata)
6. [Tab 6: Armors (Baju Zirah & Aksesori)](#6-tab-armors-baju-zirah--pelindung)
7. [Tab 7: Enemies (Monster & Musuh)](#7-tab-enemies-monster--musuh)
8. [Tab 8: Troops (Grup Musuh & Battle Event)](#8-tab-troops-grup-musuh--battle-events)
9. [Tab 9: States (Status Efek & Kondisi)](#9-tab-states-status-efek--kondisi)
10. [Tab 10: Animations (Animasi Visual & Partikel)](#10-tab-animations-animasi-visual)
11. [Tab 11: Tilesets (Ubin Peta & Jalur Eksplorasi)](#11-tab-tilesets-ubin-peta--jalur)
12. [Tab 12: Common Events (Logika Global & Alur Cerita)](#12-tab-common-events-logika-global)
13. [Tab 13: System (Pengaturan Inti & Audio)](#13-tab-system-pengaturan-inti-game)
14. [Tab 14: Types (Kategori Elemen & Tipe Perlengkapan)](#14-tab-types-tipe-elemen--kategori)
15. [Tab 15: Terms (Istilah, Kosakata, & Bahasa)](#15-tab-terms-istilah--kosakata)
16. [Master Guide: Seluruh 6 Tab Traits](#16-master-guide-seluruh-6-tab-traits)
17. [Panduan Rumus Damage & Balancing](#17-panduan-rumus-damage--balancing)

---

## 1. Tab: Actors (Karakter Pemain)
Wadah identitas karakter utama dan anggota party:
* **General Settings**: *Name* (Nama), *Nickname* (Julukan), *Class* (Kelas profesi), *Initial Level* (Level awal), *Max Level* (Level maks, 1-99), *Profile* (Biografi status).
* **Images**: *Face* (Potret dialog 144x144 px), *Character* (Sprite jalan 2D 48x48 px), *[SV] Battler* (Sprite aksi mode Side-View).
* **Initial Equipment**: Perlengkapan yang langsung terpasang saat game dimulai (*Weapon, Shield, Head, Body, Accessory*).
* **Traits**: Sifat pasif alami karakter bawaan lahir.
* **Note**: Catatan developer dan Notetag plugin.

---

## 2. Tab: Classes (Kelas & Profesi)
Cetak biru pertumbuhan dan spesialisasi tempur:
* **EXP Curve**: Rumus kebutuhan EXP per level (*Base Value, Extra Value, Acceleration A, Acceleration B*).
* **Parameter Curves**: Kurva grafik pertumbuhan 8 status dasar (*MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK*) dengan preset *A* (Tertinggi) s/d *E* (Terendah) atau *Generate Curve*.
* **Skills to Learn**: Jadwal pembukaan jurus baru secara otomatis berdasarkan level.
* **Traits pada Class**: Tempat utama menaruh *Equip Weapon/Armor*, *Add Skill Type (Magic/Special)*, dan akurasi dasar.

---

## 3. Tab: Skills (Keahlian & Sihir)
Kemampuan aktif tempur atau menu:
* **General Settings**: *Name, Icon, Description, Skill Type, MP/TP Cost, Scope* (Target: 1 Enemy, All, User, Dead Ally), *Occasion* (Battle, Menu, Always).
* **Invocation**: *Speed* (Prioritas turn), *Success %* (Akurasi aktivasi), *Repeat* (Jumlah hit berturut-turut), *TP Gain*, *Hit Type* (Certain Hit, Physical, Magical), *Animation*.
* **Message**: Pesan teks di battle log (Contoh: %1 casts %2!).
* **Required Weapon**: Membatasi skill hanya bisa dirapal jika memakai jenis senjata tertentu.
* **Damage**: *Type* (HP/MP Damage, Recover, Drain), *Element*, *Formula* (.atk * 4 - b.def * 2), *Variance %*, *Critical Hits*.
* **Effects**: Efek sekunder (*Add/Remove State*, *Buff/Debuff*, *Escape*, *Grow Stat*, *Common Event*).

---

## 4. Tab: Items (Barang & Item Konsumsi)
Objek sekali pakai atau item penting dalam inventaris:
* **Item Type**:
  * Regular Item: Item biasa yang bisa dikonsumsi (Potion, Antidote).
  * Key Item: Barang penting misi/alur cerita (Kunci, Surat Rahasia).
  * Hidden Item A & B: Item tersembunyi yang tidak muncul di menu umum, biasa diakses via event khusus (*Select Item*).
* **Price**: Harga jual/beli di toko (Gold).
* **Consumable**: 
  * Yes: Jumlah item berkurang 1 saat dipakai.
  * No: Item tidak habis saat dipakai (contoh: Kantung Sihir Tak Terbatas, Kompas).
* **Scope, Occasion, Invocation, Damage, Effects**: Memiliki struktur yang sama persis seperti pada tab **Skills** (bisa memberi heal, buff, atau memanggil Common Event).

---

## 5. Tab: Weapons (Senjata)
Peralatan serang yang dipegang karakter:
* **Weapon Type**: Kategori senjata (Dagger, Sword, Bow, Staff, dll. dari Tab Types).
* **Price**: Harga di toko.
* **Animation**: Efek visual tebasan saat karakter melakukan perintah *Attack* biasa dengan senjata ini.
* **Parameter Changes**: Tambahan flat atribut saat dipakai (+ATK, +MAT, +AGI, dll.).
* **Traits pada Senjata**: Sangat krusial untuk:
  * *Attack Element*: Mengubah serangan biasa menjadi berelemen api/es.
  * *Attack State*: Memberi peluang menularkan racun saat memukul biasa.
  * *Attack Times +*: Menjadikan senjata bisa memukul berkali-kali.

---

## 6. Tab: Armors (Baju Zirah & Pelindung)
Peralatan pertahanan tubuh:
* **Armor Type**: Kategori pelindung (*General Armor, Heavy Armor, Magic Robe, Shield*).
* **Equipment Type**: Posisi slot tubuh (*Shield, Head, Body, Accessory*).
* **Price**: Harga di toko.
* **Parameter Changes**: Tambahan flat atribut (+DEF, +MDF, +Max HP, dll.).
* **Traits pada Armor**: Digunakan untuk:
  * Resistensi elemen (*Element Rate Fire * 50%*).
  * Kekebalan status (*State Resist: Poison*).
  * Pasif unik (*Ex-Param: HP Regen + 5%*).

---

## 7. Tab: Enemies (Monster & Musuh)
Pengaturan data monster individual:
* **General Settings**: *Name*, *Battler Graphic* (Gambar 2D/SV musuh + pengatur warna *Hue*).
* **Parameters**: 8 status dasar monster (Max HP, Max MP, ATK, DEF, MAT, MDF, AGI, LUK).
* **Rewards**: *EXP* dan *Gold* yang didapat pemain saat monster berhasil dikalahkan.
* **Drop Items**: Hingga 3 item/perlengkapan yang bisa dijatuhkan saat kalah dengan probabilitas (1/N, misal 1/1 = 100%, 1/10 = 10%).
* **Action Patterns (AI Pola Serang Musuh)**:
  * Menentukan skill apa yang digunakan musuh berdasarkan kondisi (Contoh: Gunakan *Heal* jika HP < 30%, gunakan *Fireball* di Turn 3).
  * *Rating (1 - 9)*: Prioritas kecerdasan tindakan AI.
* **Traits pada Musuh**: Mengatur kelemahan elemen musuh, kebal status bos, atau *Action Times + 100%* (agar bos bergerak 2x per turn).

---

## 8. Tab: Troops (Grup Musuh & Battle Events)
Wadah pembentukan formasi pertempuran dan logika pertarungan:
* **Enemy Formation Canvas**: Area visual untuk menata posisi monster di layar battle.
* **Battle Event (Event Logika Pertarungan)**:
  * **Conditions (Pemicu)**: Turn ke-X, HP musuh di bawah X%, Switch aktif, atau Turn karakter.
  * **Span**:
    * Battle: Event hanya berjalan 1x sepanjang pertarungan (cocok untuk dialog pembuka bos).
    * Turn: Event berjalan 1x di setiap giliran yang memenuhi syarat.
    * Moment: Event berjalan terus-menerus seketika kondisi terpenuhi (hati-hati *infinite loop*).
  * **Event Commands**: Perintah dialog di tengah battle, transformasi bos ke fase 2, memanggil bala bantuan, atau memaksa pertempuran selesai.

---

## 9. Tab: States (Status Efek & Kondisi)
Pengaturan efek positif (Buff), negatif (Debuff), maupun status abnormal (Poison, Stun, Death):
* **Restriction (Pembatasan Gerak)**:
  * None: Normal (bisa bertindak bebas).
  * Attack an Enemy: Dipaksa menyerang musuh secara acak (efek *Berserk*).
  * Attack an Ally: Dipaksa menyerang teman sendiri (efek *Confusion / Charm*).
  * Cannot Move: Lumpuh total tidak bisa bertindak (efek *Death, Sleep, Paralysis, Stun*).
* **Priority (0 - 100)**: Prioritas ikon status mana yang ditampilkan jika karakter terkena banyak status sekaligus.
* **Removal Conditions (Syarat Hilangnya Status)**:
  * *Remove at Battle End*: Hilang otomatis saat battle selesai.
  * *Auto-removal Timing*: Hilang setelah sejumlah giliran (*Action End* atau *Turn End*, misal 3–5 turns).
  * *Remove by Damage*: Peluang status pecah saat terkena pukulan fisik (misal: *Sleep* hilang saat dipukul).
  * *Remove by Walking*: Hilang setelah berjalan sejumlah langkah di peta (misal: Racun hilang setelah 50 langkah).
* **Messages**: Teks log battle saat status terjangkit, bertahan, dan sembuh.
* **Traits pada State**: Modifier selama status aktif (misal: Status *Poison* memiliki trait *Ex-Param: HRG - 10%*).

---

## 10. Tab: Animations (Animasi Visual)
Pengaturan visual efek partikel jurus pertempuran:
* **Graphic**: File sprite sheet animasi dari folder /img/animations/.
* **Frames Timeline**: Menata posisi partikel frame-by-frame (hingga ribuan frame).
* **Flash & Sound (SE) Timing**: Menyelaraskan efek suara (dentuman pedang, petir) dan kedipan layar (*Screen Flash*) pada frame tertentu.
* **Position**: Menentukan apakah animasi muncul di *Head*, *Center*, *Feet*, atau *Screen* (seluruh layar).

---

## 11. Tab: Tilesets (Ubin Peta & Jalur)
Pengaturan grafis peta dunia dan properti fisika ubin:
* **Mode**: *Field Type* (Peta dunia skala luas) atau *Area Type* (Kota, Dungeon, Interior rumah).
* **Tileset Images**: Slot grafis *A1* (Animasi air/lava), *A2* (Tanah dasar), *A3* (Dinding bangunan luar), *A4* (Dinding dungeon), *A5* (Lantai spesial), *B s/d E* (Dekorasi furnitur, pohon, pintu, jendela).
* **Properti Fisika Ubin**:
  * **Passage (O / X / Star)**: O = Bisa dilewati, X = Tembok penghalang, ★ (Star) = Karakter berjalan di belakang/bawah ubin (cocok untuk atap dan kanopi pohon).
  * **Passage (4-Dir)**: Mengatur izin arah jalan (Atas, Bawah, Kiri, Kanan) untuk tebing satu arah.
  * **Ladder (Tangga)**: Karakter selalu menghadap ke atas saat menaiki ubin ini.
  * **Bush (Semak Belukar)**: Membuat tubuh bagian bawah karakter tampak transparan saat menginjaknya.
  * **Counter (Meja Kasir)**: Pemain bisa berinteraksi dengan NPC yang terhalang meja kasir ini.
  * **Damage Floor**: Mengurangi HP karakter setiap kali menginjak ubin (rawa beracun, lahar).
  * **Terrain Tag (0 - 7)**: Penanda angka ID tanah untuk keperluan script/plugin dan event khusus.

---

## 12. Tab: Common Events (Logika Global)
Kumpulan event logika yang bisa dipanggil kapan saja dari peta mana pun, skill, atau item:
* **Trigger**:
  * None: Hanya berjalan jika dipanggil manual melalui event command *Call Common Event* atau dari *Item/Skill Effects*.
  * Autorun: Otomatis berjalan terus-menerus dan mengunci input pemain saat *Switch* pemicunya menyala (cocok untuk cutscene global).
  * Parallel: Berjalan di latar belakang tanpa mengganggu gerak pemain saat *Switch* menyala (cocok untuk sistem waktu jam, deteksi cuaca, stamina sistem).
* **Condition Switch**: Sakelar penentu kapan event paralel/autorun ini aktif.

---

## 13. Tab: System (Pengaturan Inti Game)
Pusat konfigurasi aturan dasar proyek:
* **Starting Party**: Daftar karakter yang langsung ada di tim saat game baru dimulai.
* **Game Title**: Judul game Anda.
* **Options (Checkbox Fitur)**:
  * *[SV] Side-view Battle*: Mengaktifkan sistem pertarungan tampak samping dengan animasi karakter.
  * *Start Transparent*: Karakter transparan di awal game (bagus untuk intro cutscene).
  * *Display TP in Battle*: Menampilkan bar TP di layar battle.
  * *Auto-save*: Menyimpan otomatis secara berkala.
* **Music (BGM & ME)**: Musik tema layar judul (*Title*), pertarungan biasa (*Battle*), kemenangan (*Victory*), dan kekalahan (*Defeat*).
* **Sounds (SE)**: Efek suara kursor, konfirmasi, serang, menghindar, level up, dsb.
* **Window Color**: Kustomisasi warna dasar jendela dialog (Red, Green, Blue).

---

## 14. Tab: Types (Tipe Elemen & Kategori)
Daftar glosarium kategori teknis yang digunakan di seluruh database:
* **Elements**: Daftar elemen sihir/serangan (*Physical, Fire, Ice, Thunder, Water, Earth, Wind, Light, Darkness*).
* **Skill Types**: Kategori jurus (*Magic, Special, Tech, Alchemy, Limit Break*).
* **Weapon Types**: Kategori senjata (*Dagger, Sword, Flail, Axe, Spear, Bow, Crossbow, Gun, Claw, Glove, Staff*).
* **Armor Types**: Kategori pelindung (*General Armor, Magic Armor, Light Armor, Heavy Armor, Small Shield, Large Shield*).
* **Equipment Types**: Daftar slot tubuh karakter (*Weapon, Shield, Head, Body, Accessory*).

---

## 15. Tab: Terms (Istilah & Kosakata)
Pengaturan bahasa dan istilah teks yang tampil di antarmuka (*UI*) pemain:
* **Basic Status**: Penamaan *Level, Lv, HP, MP, TP, EXP*.
* **Parameters**: Penamaan singkatan status (*Max HP, Max MP, Attack, Defense, M.Attack, M.Defense, Agility, Luck*).
* **Commands**: Teks menu utama (*Fight, Escape, Attack, Guard, Item, Skill, Equip, Status, Formation, Options, Save, Game End*).
* **Messages**: Teks notifikasi otomatis (misal: "X emerged!", "X took Y damage!", "Party was defeated!").

---

## 16. Master Guide: Seluruh 6 Tab Traits

| Tab Traits | Fitur Utama | Fungsi & Cara Kerja |
| :--- | :--- | :--- |
| **Rate** | • *Element Rate*<br>• *Debuff Rate*<br>• *State Rate*<br>• *State Resist* | Mengatur pengali persentase damage elemen, ketahanan terhadap penurunan status, kerentanan status buruk, dan kekebalan 100% absolut (*State Resist*). |
| **Param** | • *Parameter (*)*<br>• *Ex-Parameter (+)*<br>• *Sp-Parameter (*)* | Modifikasi status dasar, status pertarungan lanjutan (*Hit, Eva, Crit, Magic Eva, Counter, HP/MP Regen*), dan status khusus (*Target Rate/TGR, Guard Rate, MP Cost Rate, Damage Rate*). |
| **Attack** | • *Attack Element*<br>• *Attack State*<br>• *Attack Speed*<br>• *Attack Times +* | Mengubah elemen serangan biasa, memberi peluang status saat memukul biasa, mengubah prioritas giliran, dan menambah jumlah serangan dalam 1 aksi. |
| **Skill** | • *Add / Seal Skill Type*<br>• *Add / Seal Skill* | Membuka/menyegel kategori menu skill serta memberikan/mengunci skill spesifik secara langsung. |
| **Equip** | • *Equip Weapon / Armor*<br>• *Lock / Seal Equip*<br>• *Slot Type (Dual Wield)* | Izin jenis senjata dan baju zirah, mengunci item agar tidak bisa dicopot, menyegel slot, serta mode memegang 2 senjata (*Dual Wield*). |
| **Other** | • *Action Times +*<br>• *Special Flag*<br>• *Collapse Effect*<br>• *Party Ability* | Peluang multi-aksi per turn, bendera (*Auto Battle, Guard, Substitute, Preserve TP*), animasi kematian (*Boss, Normal*), dan pasif global tim (*Double Gold, No Encounter, Preemptive*). |

---

## 17. Panduan Rumus Damage & Balancing

Format penulisan rumus pada kolom **Damage Formula**:
*  = Penyerang / Pengguna (*Attacker / User*)
*  = Target yang diserang (*Defender / Target*)
* [x] = Nilai Game Variable ID ke-x

### Contoh Rumus Praktis:
1. **Fisik Standar**: .atk * 4 - b.def * 2
2. **Sihir Murni (Mengabaikan Defense Fisik)**: .mat * 3 - b.mdf * 1.5
3. **Serangan Penetrasi Zirah (Armor Piercing)**: .atk * 2.5 *(Tanpa pengurangan .def)*
4. **Heal Berdasarkan Magic & Target Max HP**: .mat * 2 + b.mhp * 0.1
5. **Skill Eksekusi (Damage Lebih Besar jika HP Musuh Sekarat)**: (a.atk * 3) * (1 + (1 - b.hp / b.mhp))

---
*Modul disusun untuk proyek game RPG Maker MV: **Tales of The Dark Time**.*
