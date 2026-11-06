# Yanfly Action Sequences Reference & Architecture

Dokumen ini menjadi rujukan lengkap sintaks, struktur fase, targeting, timing, dan kontrol kamera untuk urutan aksi tempur (`YEP_BattleEngineCore`, `YEP_X_ActSeqPack1`, `YEP_X_ActSeqPack2`, `YEP_X_ActSeqPack3`).

---

## 1. 5 Fase Utama Action Sequence
Setiap aksi keterampilan (skill) atau serangan dasar dibagi menjadi 5 fase berurutan:

```text
<setup action>
  // Fase persiapan: battler melangkah maju, senjata dihunus sebelum MP/HP cost dibayar
</setup action>

<whole action>
  // Fase aksi serentak: efek atau animasi yang mengenai seluruh target secara bersamaan
</whole action>

<target action>
  // Fase aksi inti: serangan fisik, ayunan senjata, benturan animasi, kalkulasi damage/efek
</target action>

<follow action>
  // Fase tindak lanjut: jeda pasca serangan, reaksi lanjutan target
</follow action>

<finish action>
  // Fase pembersihan: battler kembali ke posisi awal (home), kamera di-reset halus
</finish action>
```

---

## 2. Rujukan Command Esensial

### A. Gerakan Battler (Movement & Motion)
- `move user: forward, distance, frames` — Karakter maju sejumlah pixel dalam waktu X frame (contoh: `move user: forward, 48, 20`).
- `move user: target, front, frames` — Karakter berlari mendekati target hingga berada tepat di depannya.
- `jump user: height, frames` — Karakter melompat ke atas sejumlah pixel (contoh: `jump user: 100, 25`).
- `move user: return, frames` / `move user: home, frames` — Karakter bergerak kembali ke posisi awal (contoh: `move user: home, 20`).
- `motion attack: user` — Memicu pose ayunan senjata default battler.
- `motion thrust: user` / `motion swing: user` / `motion missile: user` / `motion chant: user` — Memaksa pose SV spesifik.

### B. Animasi & Efek Damage
- `action animation: target` — Memutar animasi yang ditentukan pada skill di target.
- `animation id: target` — Memutar animasi database tertentu berdasarkan ID (contoh: `animation 12: target`).
- `action effect: target` — Memicu kalkulasi damage, pengurangan HP/MP, dan status efek sesuai formula skill.
- `damage popup: target` — Memunculkan angka damage di atas target.
- `shake screen: power, speed, frames` — Mengguncang layar untuk memberikan sensasi benturan berat (contoh: `shake screen: 3, 5, 15`).

### C. Kontrol Kamera & Zoom (ActSeqPack 3)
- `camera focus: target, frames` — Memusatkan pandangan kamera ke target secara halus (contoh: `camera focus: target, 25`).
- `camera focus: user, frames` — Memusatkan pandangan kamera ke pengguna skill.
- `zoom: 125%, frames` / `camera zoom: 1.25, frames` — Melakukan zoom in/out (contoh: `zoom: 130%, 25`).
- `reset camera: frames` / `camera reset: frames` — **WAJIB sertakan frames!** Mengembalikan posisi kamera ke tengah secara halus (contoh: `reset camera: 30`).
- `reset zoom: frames` — **WAJIB sertakan frames!** Mengembalikan rasio zoom ke 100% secara halus (contoh: `reset zoom: 30`).
- **PENTING**: Jangan pernah menulis `reset camera` atau `reset zoom` tanpa argumen durasi, karena akan menyebabkan kamera melompat patah seketika!

### D. Sinkronisasi & Penantian (Timing & Waits)
- `wait: frames` — Menunggu sejumlah frame (60 frames = 1 detik).
- `wait for movement` — Menunggu semua battler yang sedang bergerak mencapai koordinat tujuan.
- `wait for animation` — Menunggu pemutaran efek visual animasi selesai sebelum lanjut ke command berikutnya.
- `wait for effect` — Menunggu kalkulasi damage dan popup selesai.
- `wait for camera` — Menunggu transisi zoom/fokus kamera selesai.

---

## 3. Salin Sequence Notetag (Action Copy)
Untuk menghindari duplikasi kode panjang pada puluhan skill atau senjata dengan pola sama:
```text
<action copy: skill: 10>
```
Tag ini secara otomatis mengimpor seluruh blok setup, whole, target, follow, dan finish action dari Skill ID 10.
