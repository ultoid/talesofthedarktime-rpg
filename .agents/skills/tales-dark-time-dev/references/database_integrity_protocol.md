# Database Integrity & Crash Prevention Protocol

Dokumen ini menjelaskan struktur data internal RPG Maker MV serta protokol keamanan untuk mencegah terjadinya korupsi database dan **Game Black Screen**.

---

## 1. Aturan Indeks Array RPG Maker MV
Di RPG Maker MV, semua file di dalam folder `data/*.json` (seperti `Actors.json`, `Skills.json`, `Weapons.json`, `States.json`, `Items.json`) disusun sebagai array berindeks 1:
- **`array[0]` WAJIB SELALU bernilai `null`**.
- ID entitas dimulai dari indeks `1` sampai `array.length - 1`.
- ID entitas di dalam properti objek harus cocok dengan indeksnya (`array[i].id === i`).
- Tidak boleh ada elemen `null` di tengah-tengah rentang ID yang aktif (array harus padat/dense).
- Properti wajib seperti `note` harus selalu ada berupa string (`""` jika kosong), tidak boleh `null` atau `undefined` karena fungsi parser seperti `notedata = obj.note.split(...)` akan melempar uncaught exception jika `note` tidak ada.

---

## 2. Larangan Skrip Injeksi Sembarangan
- **DILARANG** menggunakan skrip Python ad-hoc yang menimpa file JSON tanpa memvalidasi struktur data secara utuh.
- Injeksi yang tidak hati-hati berisiko:
  1. Menghilangkan elemen `null` di indeks 0.
  2. Mengubah tipe data angka menjadi string atau sebaliknya.
  3. Merusak encoding format UTF-8 (menghilangkan karakter khusus atau line-break `\r\n`).
  4. Merusak referensi antar entitas (misal skill animation ID yang tidak ada di `Animations.json`).
- Jika harus memproses data, selalu gunakan utilitas yang sudah teruji di folder `tools/` atau lakukan parsing JSON secara aman dengan validasi schema sebelum menulis kembali ke disk.

---

## 3. Pencegahan & Debugging "Black Screen"
Gejala Black Screen pada RPG Maker MV terjadi ketika ada uncaught exception di tahap booting sebelum `Scene_Boot` atau `Scene_Title` selesai.

### Penyebab Umum:
1. **Crash di `DataManager.isDatabaseLoaded()`**:
   - Terjadi jika plugin (seperti `YEP_BattleEngineCore` atau custom plugin) mencoba membaca `obj.note` dari objek yang bernilai `null` atau belum selesai di-load.
   - Contoh: Menambahkan looping notetag pada `$dataWeapons` tanpa mengecek `if (!obj) continue;`.
2. **Sintaks Error pada Plugin JS**:
   - Tanda kurung kurawal tidak seimbang, koma hilang, atau keyword tidak valid di file `js/plugins/*.js`.
3. **Konflik Hooking Method**:
   - Menimpa method bawaan RPG Maker (`BattleManager.setup`, `BattleManager.createFinishActions`, dsb.) tanpa memanggil method aslinya via `.call(this)`.

### Langkah Penyelamatan Jika Black Screen:
1. Buka Game via browser (`index.html`) atau jalankan server lokal lalu tekan `F8` atau `F12` untuk memeriksa console error Developer Tools.
2. Cek stack trace error untuk melihat persis baris kode dan file plugin yang memicu uncaught exception.
3. Jalankan `python3 tools/verify_database_integrity.py` untuk memastikan seluruh database JSON valid.
