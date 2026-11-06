# 10 Weapon Basic Attack Presets Specification

Spesifikasi lengkap untuk 10 jenis preset serangan dasar (*basic attack*) berbasis tipe senjata pada **Tales of The Dark Time**. Preset ini dikaitkan dengan sistem skill / weapon unleash dan dapat diedit oleh User melalui UI **Editor Studio**.

---

## 1. Long Sword (Pedang Berat / Dua Tangan)
- **Karakteristik**: Serangan berbobot tinggi dengan dorongan kuat ke belakang.
- **Urutan Aksi**:
  1. **Setup**: Karakter bersiap, melangkah maju.
  2. **Target Action**:
     - Karakter berlari mendekati musuh (`move user: target, front, 18`).
     - Wait movement.
     - Karakter mengangkat pedang tinggi-tinggi (`motion swing: user`).
     - Ayunan tebasan berat + animasi tebasan pedang (`action animation: target`).
     - Hit impact: `action effect: target`, `shake screen: 3, 5, 12`.
     - Musuh terdorong ke belakang (`move target: backward, 36, 12`).
     - Wait effect.
  3. **Finish Action**: Karakter melangkah kembali ke posisi asal (`move user: home, 20`).

---

## 2. Sword (Pedang Satu Tangan)
- **Karakteristik**: Serangan tebasan gesit dan seimbang.
- **Urutan Aksi**:
  1. **Setup**: Karakter melangkah maju.
  2. **Target Action**:
     - Karakter mendekat ke depan musuh (`move user: target, front, 15`).
     - Wait movement.
     - Ayunan tebasan cepat (`motion attack: user`, `action animation: target`).
     - `action effect: target`, `damage popup: target`.
     - Jeda singkat (`wait: 8`).
  3. **Finish Action**: Karakter kembali ke posisi asal (`move user: home, 16`).

---

## 3. Gloves (Sarung Tinju / Cakar)
- **Karakteristik**: Kombinasi tinjuan cepat 1–2 kali bergantung pada jumlah glove yang di-equip (dual-wield).
- **Urutan Aksi**:
  1. **Setup**: Karakter bersiap posisi kuda-kuda tinju.
  2. **Target Action**:
     - Karakter melesat ke dekat musuh (`move user: target, front, 12`).
     - Pukulan 1: `motion thrust: user`, animasi pukulan, `action effect: target`.
     - Pengecekan dual-wield (jika membawa 2 glove / off-hand weapon):
       - Jeda 6 frame (`wait: 6`).
       - Pukulan 2: `motion swing: user`, animasi pukulan ke-2, `action effect: target`.
     - Damage per pukulan dihitung berdasarkan stat glove terkait.
  3. **Finish Action**: Karakter melompat mundur kembali ke posisi asal (`move user: home, 14`).

---

## 4. Spear (Tombak)
- **Karakteristik**: Lompatan menusuk dengan jangkauan dan dorongan.
- **Urutan Aksi**:
  1. **Setup**: Karakter memutar tombak, mengambil ancang-ancang.
  2. **Target Action**:
     - Karakter melompat tinggi ke arah musuh (`jump user: 80, 20`, `move user: target, front, 20`).
     - Wait movement.
     - Gerakan menusuk (`motion thrust: user`, `action animation: target`).
     - Hit impact: `action effect: target`.
     - Musuh terdorong ke belakang (`move target: backward, 28, 10`).
  3. **Finish Action**: Karakter melompat kembali ke posisi asal (`jump user: 40, 18`, `move user: home, 18`).

---

## 5. Axe (Kapak Tempur)
- **Karakteristik**: Lompatan tebasan menukik vertikal yang sangat berat.
- **Urutan Aksi**:
  1. **Setup**: Karakter mengangkat kapak.
  2. **Target Action**:
     - Karakter melompat ke atas musuh (`jump user: 100, 22`, `move user: target, front, 22`).
     - Wait movement.
     - Tebasan menukik sekuat tenaga (`motion swing: user`, `action animation: target`).
     - Hit impact: `action effect: target`, `shake screen: 4, 6, 15`.
     - Musuh terdorong ke belakang (`move target: backward, 32, 12`).
  3. **Finish Action**: Karakter mendarat dan kembali ke posisi asal (`move user: home, 20`).

---

## 6. Staff (Tongkat Sihir)
- **Karakteristik**: Serangan proyektil sihir jarak jauh berbasis elemen senjata.
- **Urutan Aksi**:
  1. **Setup**: Karakter maju 1 langkah (`move user: forward, 24, 15`).
  2. **Target Action**:
     - Karakter merapal mantra (`motion chant: user`, `wait: 15`).
     - Karakter mengayunkan tongkat ke depan (`motion swing: user`).
     - Proyektil mana melesat dari posisi karakter ke posisi target (visual proyektil disesuaikan dengan elemen staff: api, es, kilat, atau suci).
     - Target terkena benturan ledakan sihir (`action animation: target`, `action effect: target`).
  3. **Finish Action**: Karakter menurunkan tongkat dan kembali ke posisi asal (`move user: home, 15`).

---

## 7. Rune (Batu Aksara Sihir)
- **Karakteristik**: Pancaran proyektil energi sihir 1–2 bola mana (bergantung pada jumlah rune yang di-equip).
- **Urutan Aksi**:
  1. **Setup**: Karakter melangkah maju 1 langkah.
  2. **Target Action**:
     - Karakter mengangkat kedua tangan ke udara (`motion chant: user`, `wait: 12`).
     - Proyektil mana 1 ditembakkan ke target (`action animation: target`, `action effect: target`).
     - Jika membawa 2 Rune (dual rune equip):
       - Jeda 8 frame (`wait: 8`).
       - Proyektil mana 2 meluncur menyusul (`action animation: target`, `action effect: target`).
     - Jenis elemen proyektil mengikuti elemen dari rune yang terpasang.
  3. **Finish Action**: Karakter merapatkan tangan dan kembali ke posisi awal (`move user: home, 15`).

---

## 8. Long Bow (Busur Panjang)
- **Karakteristik**: Serangan tembakan panah tunggal berkecepatan tinggi dari posisi diam.
- **Urutan Aksi**:
  1. **Setup**: Karakter tetap di tempat (tidak bergerak mendekati musuh).
  2. **Target Action**:
     - Karakter menarik tali busur (`motion missile: user`, `wait: 18`).
     - Anak panah dilepaskan dan meluncur cepat ke arah musuh.
     - Musuh terkena anak panah menancap (`action animation: target`, `action effect: target`).
     - Musuh terdorong sedikit ke belakang (`move target: backward, 20, 10`).
  3. **Finish Action**: Karakter merilekskan busur (`perform finish`).

---

## 9. Cross Bow (Busur Silang / Busur Mekanik)
- **Karakteristik**: Rentetan 1–3 anak panah cepat bergantung pada stat DEX karakter dan tingkat senjata.
- **Urutan Aksi**:
  1. **Setup**: Karakter tetap di tempat, membidik crossbow.
  2. **Target Action**:
     - Pose membidik (`motion missile: user`).
     - Tembakan 1 melesat $\to$ anak panah menancap $\to$ `action effect: target`.
     - Tembakan lanjutan (multi-bolt berdasarkan stat):
       - Tembakan 2 (jika memenuhi syarat): melesat cepat $\to$ hit impact.
       - Tembakan 3 (jika max stat): melesat cepat $\to$ hit impact.
     - Musuh terdorong ke belakang akibat hentakan proyektil bertubi-tubi.
  3. **Finish Action**: Karakter menurunkan crossbow (`perform finish`).

---

## 10. Dagger (Belati)
- **Karakteristik**: Serangan tusukan diam-diam dari belakang musuh (backstab) 1–2 kali.
- **Urutan Aksi**:
  1. **Setup**: Karakter menghilang sesaat (`opacity user: 0, 8`).
  2. **Target Action**:
     - Karakter teleportasi seketika muncul tepat di belakang musuh (`move user: target, back, 1`, `opacity user: 255, 6`).
     - Sabetan/tusukan belati 1 (`motion attack: user`, `action animation: target`, `action effect: target`).
     - Jika membawa 2 dagger (dual-wield):
       - Jeda 6 frame (`wait: 6`).
       - Sabetan belati kedua (`motion thrust: user`, `action animation: target`, `action effect: target`).
     - Musuh terdorong ringan ke depan (`move target: forward, 16, 8`).
  3. **Finish Action**: Karakter melompat mundur/kembali ke posisi awal (`move user: home, 16`).

---

## 🖥️ Integrasi dengan Editor Studio
Semua preset di atas disimpan dalam struktur template yang dapat dipilih dan dimodifikasi langsung di antarmuka web studio (`editor_studio/js/editors/battle_sequence_editor.js` atau tab Weapon/Skill). Pengguna dapat mengubah durasi frame, jarak gerak, ID animasi, atau formula tanpa perlu memodifikasi kode inti JavaScript.
