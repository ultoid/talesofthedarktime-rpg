# Damage Pipeline & Formula Architecture

Dokumen ini mendokumentasikan standar desain matematika, pipeline mitigasi pertahanan, dan formula kalkulasi damage untuk game Turn-Based RPG.

---

## 1. Perbandingan Model Formula Damage

### A. Subtraktif Murni ($\text{Damage} = \text{ATK} - \text{DEF}$)
- **Kelebihan**: Mudah dipahami oleh pemain kasual.
- **Kelemahan Fatal**:
  - Jika $\text{DEF} \ge \text{ATK}$, damage menjadi 0 atau 1 (efek dinding bata).
  - Sedikit peningkatan stat mengubah pertempuran dari "mustahil menang" menjadi "sangat mudah", membuat penyeimbangan (*balancing*) menjadi mimpi buruk matematika.

### B. Multiplikatif dengan Diminishing Returns ($\text{Mitigasi} = \frac{\text{DEF}}{\text{DEF} + K}$)
- **Standar Industri Modern** (digunakan di WoW, League, Persona, RPG modern):
- Formula Mitigasi:
  $$\text{Damage Reduction Rate} = \frac{\text{DEF}}{\text{DEF} + 100}$$
  $$\text{Damage Diterima} = \text{Damage Mentah} \times \left(1 - \text{Damage Reduction Rate}\right) = \text{Damage Mentah} \times \frac{100}{\text{DEF} + 100}$$
- **Kelebihan**:
  - Pertahanan memiliki *diminishing returns* yang elegan.
  - Berapa pun tingginya DEF musuh, serangan pemain selalu menghasilkan damage yang berarti (tidak pernah 0).
  - Sangat stabil untuk scaling level 1 sampai 100.

---

## 2. Struktur Pipeline Eksekusi Damage (The 7-Step Pipeline)

Jangan gabungkan seluruh perhitungan menjadi satu rumus raksasa di dalam notetag database. Pisahkan ke dalam middleware pipeline:

```text
Step 1: Raw Base Power
        power = (SkillBasePower) + (User.ATK * AtkMultiplier) + (User.MAT * MatMultiplier)

Step 2: Trait & Stance Multipliers
        power *= (1 + User.PhysicalDamageRate - User.WeakenedDebuffRate)

Step 3: Critical Strike Roll
        isCrit = RNG(0, 100) < (User.CritRate - Target.CritEvade)
        if (isCrit):
            power *= (User.CritDamageModifier) // Default 1.5x, dapat ditingkatkan gear

Step 4: Elemental Affinity Multiplier
        elementRate = Target.ElementResistance(Skill.Element)
        power *= elementRate // 2.0x untuk Weakness, 0.5x untuk Resist, 0x untuk Immune, -1.0x untuk Absorb

Step 5: Armor & Multiplicative Mitigation
        defenseFactor = 100 / (100 + max(0, Target.DEF - User.ArmorPenetration))
        mitigatedDamage = power * defenseFactor

Step 6: Flat Reductions & Shield Absorption
        if (Target.HasBarrier):
            absorbed = min(Target.BarrierHP, mitigatedDamage)
            Target.BarrierHP -= absorbed
            mitigatedDamage -= absorbed

Step 7: Variance RNG
        variance = RandomRange(0.95, 1.05) // ±5% variasi agar pertempuran tidak kaku
        finalDamage = Math.max(1, Math.round(mitigatedDamage * variance))
```

---

## 3. Sistem Unified Resource (HP, MP, SP/Stamina)
Pada RPG dengan 3 sumber daya (seperti *Tales of The Dark Time*):
- **HP (Health Points)**: Kelangsungan hidup. Mencapai 0 memicu status K.O.
- **MP (Mana Points)**: Sumber daya sihir/kemampuan khusus. Diperoleh dari istirahat, consumable, atau regenerasi pasif.
- **SP (Stamina / Tactical Points)**:
  - Menggantikan sistem TP standar RPG Maker.
  - Berfungsi sebagai bahan bakar aksi fisik intensif dan manuver taktis.
  - Diperoleh secara aktif saat menyerang, menerima damage, atau bertahan (*Guard*).
  - Mencegah pemain terus-menerus melakukan spam jurus terkuat di setiap giliran.

