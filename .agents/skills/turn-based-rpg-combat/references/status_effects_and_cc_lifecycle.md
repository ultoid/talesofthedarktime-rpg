# Status Effects & Crowd Control (CC) Lifecycle

Dokumen ini menjelaskan taksonomi status efek, arsitektur siklus hidup (*lifecycle hooks*), penanganan *Crowd Control*, dan pencegahan eksploitasi status dalam game Turn-Based RPG.

---

## 1. Taksonomi Status Efek (State Categories)

1. **Hard Crowd Control (Hard CC)**:
   - *Jenis*: Stun, Freeze, Petrification, Sleep, Terrify.
   - *Mekanik*: Memaksa battler melewati giliran (*Skip Turn*), membatalkan casting spell yang sedang berlangsung.
   - *Aturan Desain*: Durasi harus sangat singkat (1–2 giliran). Harus ada mekanisme kekebalan/diminishing returns pada monster bos.

2. **Soft Crowd Control (Soft CC)**:
   - *Jenis*: Silence (tidak bisa memakai sihir), Disarm (tidak bisa memakai serangan senjata), Blind (penurunan akurasi fisik drastis), Slow (penurunan kecepatan CTB timeline).
   - *Mekanik*: Tidak melewatkan giliran, tetapi membatasi opsi aksi battler secara taktis.

3. **Damage over Time (DoT) & Healing over Time (HoT)**:
   - *Jenis*: Bleed (persentase damage fisik), Poison (persentase HP konstan), Burn (damage api + pengurangan pertahanan), Regen (pemulihan berkala).
   - *Mekanik*: Mengabaikan DEF standar saat memberikan damage di awal atau akhir giliran.

4. **Stat Modifiers & Utility Buffs**:
   - *Jenis*: Shield/Barrier (menyerap damage hingga batas HP tertentu), Ward (kebal elemen), Provoke/Taunt (memaksa musuh hanya menyerang si pengguna status), Berserk (serangan naik drastis tapi aksi tidak bisa dikontrol).

---

## 2. Siklus Hidup Berbasis Hooks (Lifecycle Hooks)

Setiap status efek adalah objek terpisah yang merespons peristiwa pertarungan melalui fungsi hook:

```javascript
const StateDefinition = {
  id: 15,
  name: "Bleed",
  durationTurns: 3,
  decayType: "TurnEnd", // or "ActionEnd"

  onTurnStart(battler) {
    // Mengecek apakah status membatalkan giliran
    if (this.isHardCC) {
      battler.skipTurn = true;
    }
  },

  beforeOutgoingHit(attacker, target, actionPayload) {
    // Memodifikasi serangan yang dilancarkan
  },

  beforeIncomingHit(target, attacker, damagePayload) {
    // Memodifikasi damage yang akan masuk (contoh: Shield menyerap damage)
  },

  onDamageTaken(target, attacker, actualDamage) {
    // Reaksi setelah damage masuk (contoh: status Sleep hilang jika terkena damage fisik)
    if (this.name === "Sleep" && actualDamage > 0) {
      target.removeState(this.id);
    }
  },

  onTurnEnd(battler) {
    // Eksekusi DoT
    const dotDamage = Math.round(battler.mhp * 0.08);
    battler.gainHp(-dotDamage);
    battler.showPopup("BLEED", dotDamage);

    // Pengurangan durasi
    this.remainingTurns--;
    if (this.remainingTurns <= 0) {
      battler.removeState(this.id);
    }
  }
};
```

---

## 3. Aturan Balancing & Anti-Exploit untuk Status Efek

1. **Bos Anti Stun-Lock (The Diminishing Returns Rule)**:
   - Jika bos dapat di-stun tanpa batas, pertempuran kehilangan ketegangan karena pemain cukup melakukan spam skill Stun.
   - *Solusi 1 (Break Gauge / Poise)*: Bos kebal Stun sampai pemain mematahkan *Break Meter* (seperti *Octopath Traveler* atau *Persona*).
   - *Solusi 2 (Diminishing Duration)*: Setiap kali bos terkena Stun, durasi berikutnya berkurang 50% dan bos mendapatkan buff imunitas sementara selama 2 giliran setelah Stun berakhir.

2. **Perbedaan Turn Decay vs Action Decay**:
   - **Turn Decay**: Durasi berkurang di akhir putaran pertempuran. Cocok untuk DoT dan Buff jangka panjang.
   - **Action Decay**: Durasi berkurang setiap kali battler tersebut menyelesaikan 1 giliran. Sangat penting pada sistem CTB, agar karakter yang sangat cepat tidak kehilangan buff dalam hitungan detik.

