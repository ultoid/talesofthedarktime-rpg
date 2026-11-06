# Nusvanir Game Development Rules & Wisdom

Panduan aturan workspace untuk game Tales of The Dark Time:
- **Database Safety**: RPG Maker MV array index 0 harus selalu `null`. Jangan lakukan manipulasi file JSON tanpa validasi.
- **Action Sequence**: Gunakan arsitektur 6 fase modular kanvas/list dengan input nilai manual.
- **Kamera Halus**: Reset kamera dan zoom wajib menyertakan durasi frames (hindari screen snap patah).
- **10 Preset Senjata**: Long Sword, Sword, Gloves, Spear, Axe, Staff, Rune, Long Bow, Cross Bow, Dagger harus dapat diakses dan diedit melalui UI editor studio.
- **Preflight Check**: Selalu jalankan `python3 .agents/skills/tales-dark-time-dev/scripts/preflight_check.py` sebelum menyelesaikan task.
