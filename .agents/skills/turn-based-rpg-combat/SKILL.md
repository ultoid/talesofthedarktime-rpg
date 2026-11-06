---
name: turn-based-rpg-combat
description: >-
  Architectural, mechanical, and balancing skill for turn-based RPG combat systems.
  Use when designing or debugging combat loops, CTB/ATB timeline action queues,
  damage calculation pipelines, status effect (buff/debuff/DoT/CC) lifecycles,
  enemy tactical AI decision trees, and combat math balancing.
---

# Turn-Based RPG Combat Systems Engineering Skill

Skill spesialisasi arsitektur, mekanik, dan penyeimbangan (*balancing*) sistem pertempuran **Turn-Based RPG** (baik klasik turn-order, Timeline/CTB, maupun Tactical Grid). Skill ini mengadopsi standar rekayasa game turn-based modern: *decoupled state machines*, *deterministic damage pipelines*, *modular status effect lifecycles*, dan *utility-driven enemy AI*.

---

## 🧭 Referensi Arsitektur & Panduan Mekanik (Progressive Disclosure)

Rujuk modul referensi berikut untuk detail teknis mendalam:
- [Combat State Machine & Action Queues](./references/combat_state_machine_and_queues.md) — Alur giliran CTB/ATB, State Stack pattern, interupsi animasi, dan pencegahan *infinite speed-lock*.
- [Damage Pipeline & Formula Architecture](./references/damage_pipeline_and_formulas.md) — Pipeline kalkulasi bertahap (Mitigasi multiplikatif vs subtraktif, variance, armor, penetrasi, critical scaling).
- [Status Effects & CC Lifecycle Management](./references/status_effects_and_cc_lifecycle.md) — Manajemen Hard CC (Stun/Sleep), Soft CC (Silence/Blind), DoT/HoT, hook event trigger (`OnTurnStart`, `BeforeHit`, `OnDamage`), dan diminishing returns.
- [Turn-Based AI & Combat Balancing](./references/turn_based_ai_and_balancing.md) — Pohon keputusan AI musuh (Threat/Aggro, utility scoring, fase HP bos), metrik Time-To-Kill (TTK), dan pencegahan dominansi taktik tunggal (*alpha-striking*).

---

## ⚡ 6 Prinsip Rekayasa Turn-Based RPG (The Core Pillars)

### 1. The Battle State Machine & State Stack
Pertarungan tidak boleh dijalankan secara monolitik dalam satu script raksasa. Pertarungan harus dikelola oleh **Battle State Machine** atau **State Stack**:
- Setiap fase memiliki batas tegas: `BattleInit` $\to$ `TurnOrderCalculation` $\to$ `InputSelection` $\to$ `ActionQueueExecution` $\to$ `Resolution/Cleanup` $\to$ `Victory/Defeat`.
- Gunakan State Stack (`push`/`pop`) untuk menangani interupsi dinamis: saat counter-attack, trigger reaksi, atau animasi kamera terjadi, state baru di-push ke atas stack dan di-pop setelah selesai tanpa merusak context urutan giliran sebelumnya.

### 2. Command Pattern untuk Seluruh Aksi Tempur
Setiap aksi pemain atau AI (Attack, Cast Skill, Use Item, Defend, Flee) harus dibungkus dalam objek data command (`ActionCommand`):
- Memisahkan input UI dari eksekusi logika dan animasi.
- Memungkinkan fitur krusial: preview kalkulasi damage, undo action, antrean aksi CTB, dan replay sequence.

### 3. Pipeline Kalkulasi Damage Terisolasi (Middleware Chain)
Hindari formula satu baris kaku yang sulit di-debug. Gunakan aliran kalkulasi berlapis:
```text
[Input Action Payload]
       ↓
1. Base Value (Skill Multiplier × Source Stat)
       ↓
2. Attacker Buffs / Passive Modifiers
       ↓
3. Critical Strike Determination (RNG vs Crit Rate → Crit Damage Scale)
       ↓
4. Element Affinities & Weakness / Resistance Multipliers
       ↓
5. Defender Armor & Multiplicative Mitigation: [Stat / (Stat + Constant)]
       ↓
6. Flat Reductions / Shields / Barrier Consumption
       ↓
7. Variance Multiplier (±3% - ±5% RNG)
       ↓
[Final Damage Output & Trigger OnHit Event]
```

### 4. CTB / Timeline Action Queue Balancing
Pada sistem turn dinamis berbasis kecepatan (seperti CTB *Final Fantasy X* atau *Tales of The Dark Time*):
- **Transparansi Visual**: Antrean giliran masa depan (minimal 3–5 aksi ke depan) wajib terprediksi dan terlihat jelas oleh pemain.
- **Speed Clamping**: Cegah karakter berkecepatan tinggi melakukan perulangan giliran tanpa henti (*infinite turn lockout*). Tetapkan batas interval *speed cap* atau berikan *diminishing returns* pada stat AGI.
- **Action Delay / Casting Cost**: Aksi berkekuatan tinggi wajib memiliki jeda penalti CTB (*recovery delay*) agar pemain membuat pilihan strategis antara serangan cepat vs jurus pamungkas lambat.

### 5. Siklus Hidup Status Efek Terstruktur (Lifecycle Hooks)
Status efek (Buffs, Debuffs, DoT, Stun) tidak boleh mengotori fungsi utama battler. Setiap status adalah modul berbasis hooks:
- `onTurnStart`: Pengecekan DoT/HoT dan skip turn jika terkena Hard CC.
- `beforeOutgoingAction`: Pengecekan Silence, Blind, atau modifikasi stat penyerang.
- `beforeIncomingDamage`: Pengecekan Barrier, Shield, Invulnerability, atau Provoke/Cover.
- `onDamageTaken`: Reaksi counter-attack, penghilangan status Sleep saat terkena pukulan fisik.
- `onTurnEnd` / `onActionEnd`: Pengurangan durasi turn (*decay*) dan pembersihan status kedaluwarsa.

### 6. Desain Enemy AI Berbasis Perilaku & Prioritas (Utility / Phase AI)
Musuh tidak boleh memilih skill secara acak tanpa konteks:
- **Conditionals & Thresholds**: Bos beralih fase saat HP mencapai 75%, 50%, atau 25% (memanggil minion, mengaktifkan aura pertahanan, atau jurus pamungkas bertelegraph).
- **Targeting Priority**: AI mengenali target dengan HP terendah, target yang rentan terhadap elemen serangannya, atau menargetkan *tank* yang mengaktifkan Taunt.
- **Telegraphing**: Serangan AoE mematikan harus memiliki telegrafi 1 turn sebelumnya (animasi charging / peringatan visual) agar pemain memiliki kesempatan untuk bertahan (*Guard*) atau membatalkan aksi musuh (*Stun/Interrupt*).

