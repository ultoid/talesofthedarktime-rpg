# User Wisdom & Operational Principles

Dokumen ini mendokumentasikan prinsip, arahan, dan ekspektasi kerja dari User (**Ultoid**) untuk memandu agen AI saat berkontribusi pada proyek **Tales of The Dark Time**.

---

## 1. Filosofi Kerja & Efisiensi Token
- **Hindari Looping & Trial-and-Error yang Boros**:
  - Model harus berpikir tuntas sebelum menyentuh file kode. Jangan menulis kode coba-coba lalu memperbaiki error berkali-kali hingga kuota token habis.
  - Cari data aktual di dalam repositori (`data/`, `js/plugins/`, `editor_studio/`) daripada menebak atau berhalusinasi.
- **Transparansi Sebelum Eksekusi Besar**:
  - *"Jangan dieksekusi dulu, tunjukkan padaku detailnya sebelum kamu eksekusi."*
  - Untuk perubahan arsitektur atau penambahan fitur besar di editor/plugin, paparkan rencana terstruktur (struktur data, alur UI, perubahan file) dan tunggu konfirmasi atau berikan ringkasan yang jelas.
- **Konsistensi & Jangan Mengulangi Kesalahan yang Sama**:
  - Jika User sudah memberikan kritik atau mengoreksi kesalahan (seperti injeksi python yang merusak data atau hilangnya easing kamera), catat dan patuhi secara permanen.

---

## 2. Standar Kualitas Implementasi (Zero Regressions)
- **Verifikasi Lokal Sebelum Claim Selesai**:
  - Jangan pernah mengatakan fitur sudah selesai atau terima kasih sebelum memverifikasi integritas file.
  - Periksa apakah sintaks JavaScript valid dan tidak ada referensi null yang membuat game mengalami **Black Screen** saat di-boot atau saat masuk mode battle.
- **Utamakan Konfigurasi Antarmuka (GUI-First) daripada Hardcode**:
  - User ingin dapat mengatur parameter, mengedit preset, dan menyusun urutan aksi melalui **Editor Studio** (`editor.html` / `editor_studio`), bukan terkunci di dalam script plugin yang sulit diedit orang awam.

---

## 3. Interaksi Antarmuka (UI/UX) di Editor Studio
- **Modular Action Canvas / List**:
  - Action sequence dibagi dalam fase terpisah (Setup, Whole, Target, Follow, Finish).
  - Tiap fase adalah kanvas dengan tombol tambah (`+`) untuk menyisipkan action command seperti urutan event di RPG Maker.
- **Input Nilai Manual yang Fleksibel**:
  - Jangan membatasi input dinamis ke dalam dropdown yang kaku dan panjang.
  - Contoh: Untuk command seperti `zoom 150%`, sediakan opsi tipe command `zoom`, lalu kolom input nilai (`150%`, `30 frames`) diisi manual oleh User.

---

## 4. Game Feel & Visual Polish
- **Pergerakan Kamera Harus Mulus (Easing)**:
  - Kamera tidak boleh melompat atau patah saat transisi dari screen center $\to$ battler $\to$ reset center.
  - Berikan frame durasi transisi (default 20–30 frames) dan pastikan interpolasi kamera berjalan lembut.
- **Dampak Serangan (Punchiness)**:
  - Setiap animasi senjata harus memiliki bobot: timing ayunan, jeda kontak hit, efek suara (SE), efek getar layar (*screen shake*), dan knockback/dorongan musuh yang proporsional.
