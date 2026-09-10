# NUSVANIR — Catatan State yang Masih Pending

> Baseline: `States_NUSV_Updated_6_Fixed.json`

Dokumen ini mencatat state yang **belum 100% selesai secara mekanik**. Sebagian state sudah memiliki Trait/native MV/notetag dasar, tetapi masih membutuhkan custom logic, trigger, stack system, targeting khusus, summon interaction, atau mekanik lain yang belum ditangani penuh.

**Total state yang masih terdeteksi pending/custom:** 121

## Arti Status

- **Pending mapping**: ada bagian efek yang belum bisa dipetakan langsung ke data native RPG Maker MV atau notetag plugin yang tersedia.
- **Custom logic required**: efeknya sudah diketahui, tetapi perlu hook/plugin logic agar benar-benar berjalan.
- State yang tidak tercantum di dokumen ini dianggap tidak memiliki marker pending/custom pada baseline JSON ini.

## Stack / Counter / Marker

### ID 030 — Float

- Custom: Tag state; optional EVA +5%

### ID 031 — Marked

- Custom: Tag state only

### ID 032 — Shadow Mark

- Custom: Shadow Mark max 3 stacks; each stack +4% Assassin damage; lasts 3 turns.

### ID 033 — Polarized

- Custom: Tag state only

### ID 046 — Vanguard Intercept

- Custom: Protects 1 ally for 1 turn; redirects 50% damage; 25% counter chance

### ID 056 — Garuda Guardian Form

- Custom: Garuda Guardian Form (3 turns). Cannot stack with other transformation states.

### ID 086 — Voltage Charge

- Custom: Voltage stacks max 5; +15% Lightning Damage and +8% SP Cost per stack; consumed by electric skills for +10% bonus damage per stack.

### ID 087 — Volt Phantom

- Custom: Lightning Decoy: 20% caster Max HP, absorbs 80% damage, 3 turns; grants 1 Voltage stack when destroyed.

### ID 099 — Celestial Grace

- Custom: Strong party regeneration for 3 turns; does not stack with itself.

### ID 128 — Shield Parry

- Custom: 10% chance to block physical damage and counterattack; counter scales from DEF

### ID 131 — Mind's Eye

- Custom: When an attack misses against the user, recover 4% Max SP and gain 10% counter chance for 1 turn

### ID 157 — Holy Aura

- Custom: When healing an ally, that ally gains DEF/M.DEF +8% for 2 turns; does not stack

### ID 162 — Flame Eater

- Saat terkena Fire: +1 Flame stack (max 3); tiap stack +5% Fire damage selama 3 turn.

### ID 173 — Ferrous Dominance

- Custom: Metal Damage +20%; DEF +15%; gains Polarity mechanic

### ID 195 — Hunter's Focus

- Custom: Damage +10% vs Marked targets; Crit Rate +8%

### ID 196 — Lupine Companion

- Custom: Summons Lupine companion for 5 turns; companion damage +10% while target is Marked

### ID 197 — Multi-Shot Mastery

- Custom: Multi-hit skills deal +10% total damage; no per-hit stacking

### ID 202 — Marksman Instinct

- Custom: First target hit becomes Marked for 3 turns; damage +8% and Hit Rate +10% vs Marked.

### ID 207 — Shadow Mark

- Custom: Shadow Mark max 3 stacks; each stack +4% Assassin damage; lasts 3 turns.

## Barrier / Shield / Redirect / Protect

### ID 036 — Intercept

- Custom: Cover 1 turn; damage taken -20% while Cover is active

### ID 039 — Fortified Line

- Custom: Party barrier equal to 12% of Squire Max HP for 2 turns

### ID 052 — Bulwark of Light

- Custom: Party barrier equal to 10% of Paladin Max HP for 2 turns

### ID 066 — Mana Shield

- Custom: 30% of incoming damage is redirected to MP for 3 turns

### ID 072 — Miracle Intervention

- Custom: Party emergency recovery; damage taken -40% for 1 turn. Cooldown 4 turns.

### ID 079 — Aqua Prism

- Custom: Party heal 1.0x MAT; 12% Max HP shield (3 turns)

### ID 109 — Phantom Decoy

- Custom: Decoy: 15% Max HP; 50% single-target redirect chance (2 turns)

### ID 138 — Savage Triumph

- Custom: Critical damage +25%; when defeating an enemy, recover 5% Max HP

### ID 140 — Guardian's Resonating Vow

- Custom: When protecting an ally, damage taken -15%

### ID 145 — Chi Reflex

- Custom: Evasion +10%; when an attack misses, recover 2% Max SP

### ID 160 — Abyss Conduit

- Custom: Dark damage +15%; when a summon is defeated, recover 5% Max MP

### ID 179 — Holy Barrier

- Trigger when any ally HP < 30%.
- Apply party protection: PDR 75%, MDR 75%.

## Summon / Companion / Contract

### ID 049 — Wyvern Summon

- Custom: Summons a Wyvern for 4 turns. Wyvern auto-attack deals a.atk * 1.0.

### ID 064 — Jenggala

- Custom: Summons one random Jenggala companion for 3 turns.

### ID 074 — Summon: Bhuta Hollow-Knight

- Custom: Summons a defensive Bhuta for 4 turns; party DEF +15% while active.

### ID 075 — Summon: Bhuta Fallen-Cleric

- Custom: Summons a Fallen-Cleric for 4 turns; heals the party once on summon.

### ID 076 — Blood Pact: Demon Commander

- Custom: Summons 1 selected Demon Commander for 3 turns. Maximum 1 Commander. Commander Link: caster damage +15% while commander is active.

### ID 102 — Life Sacrifice

- Custom: Sacrifice 10% caster Max HP to heal a summon for 30% of its Max HP

### ID 103 — Soul Siphon

- Custom: Dismisses one summon; restores 20% Max MP and grants 1 Soul

### ID 105 — Bhuta Manifestation: Sanctuary (Dark Priest)

- Custom: Summons one Sanctuary Bhuta for 4 turns; maximum 2 active summons.

### ID 114 — Shadow Clone

- Custom: Summons 1 Shadow Clone for 2 turns; clone deals 35% attack damage

### ID 159 — Jenggala's Vow

- Custom: Jenggala summons gain +10% HP and +10% damage; caster damage taken +5% while a summon is active

### ID 181 — Covenant of Demon Commanders (Luciferus)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 182 — Covenant of Demon Commanders (Mamon)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 183 — Covenant of Demon Commanders (Vraka)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 184 — Covenant of Demon Commanders (Asmodea)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 185 — Covenant of Demon Commanders (Beelzebub)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 186 — Covenant of Demon Commanders (Belphegor)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 187 — Covenant of Demon Commanders (Leviathanus)

- Custom: Unlocks one selectable Demon Commander contract; no direct combat stat bonus.

### ID 188 — Necrotic Mastery

- Custom: Dark Magic Damage +15%, Max MP +10%, summon costs reduced by 15%; maximum 2 active summons.

### ID 189 — Dual Demon Commander Contract

- Custom: Can equip two Commander contract options, but only one Commander can be active at a time.

### ID 203 — Lupine Ride

- Custom: While riding Lupine: AGI +20%, Evasion +10%, ranged damage +10%

## Heal / Regen / Revive / Cleanse

### ID 059 — Chi Life Transmutation

- Custom: HP sacrifice: 20% Max HP → restore 50% Max SP; cannot reduce HP below 1.

### ID 062 — Sanctuary

- Custom: Party Regen 4% Max HP/turn for 3 turns

### ID 069 — Sacred Sanctuary

- Custom: Party Regen + M.DEF buff (3 turns).

### ID 070 — Raise

- Custom: Revives one fallen ally with 35% Max HP

### ID 080 — Tidal Resonance

- Custom: Tidal Resonance (3 turns): magic SP cost -15%, DEF/M.DEF +10%, party regen 4% Max HP/turn.

### ID 097 — Holy Field

- Custom: Holy Field (3 turns): heals allies and damages Undead/Dark enemies.

### ID 098 — Sanctified Absolution

- Custom: Mass cleanse + temporary status resistance.

### ID 100 — Resurrection

- Custom: Revive 1 ally at 70% HP; grants damage taken -20% for 1 turn.

### ID 101 — Avatar of Light

- Custom: Avatar of Light (3 turns). Afterward: SP -30% and Healing Power -25% for 2 turns.

### ID 104 — Necrotic Mana Corruption

- Custom: Converts MP into emergency healing; restores 25% Max HP

### ID 146 — Mana Amplification

- Custom: Mana Regen +3% Max MP/turn & Max MP +12%

### ID 149 — Divine Grace

- Custom: Healing Power +12%

### ID 151 — Soul Harvest

- Custom: Restore 6% Max MP when an enemy is defeated

### ID 153 — Ether Conduit

- Custom: Ignore 15% M.DEF; MP Regen 3% Max MP/turn

### ID 164 — Oceanic Mantle

- Custom: Burn/Chill/Freeze Immunity; Magic damage taken -10%; Regen 3% Max HP/turn during Rain.

### ID 177 — Sacred Consecration

- Healing Power +20% (outgoing healing).

### ID 178 — Divine Gift

- Healing Power +20%.
- SP Cost healing skills -10%.

### ID 180 — Martyr's Faith

- Once per battle, when HP <10%:
- Full HP/MP, cleanse debuffs/status effects, apply Ascension 1 turn, Holy Damage +50%.

## Extra Turn / Cooldown / Priority

### ID 068 — Time Distortion

- Custom: Enemy AGI -30%; grants one Extra Turn to user; cooldown 5 turns.

### ID 096 — Aegis Maxima

- Custom: Priority +5; party damage taken -60% for 1 turn. Cooldown 4 turns; can be dispelled.

## Stealth / Targeting / Untargetable

### ID 020 — Taunt

- Custom: Forced/weighted targeting toward caster

### ID 112 — Concealment

- Custom: Concealment: Evasion +60%, untargetable by direct single-target attacks for 1 turn; ends after attacking

### ID 176 — Active Echolocation

- Custom: Hit Rate +15%; reveals Stealth; Sonic skills ignore 15% Evasion

### ID 200 — Shadow Ambush

- Custom: First attack against an unalerted target deals +20% damage and gains +15% Crit Rate

## Conditional Trigger

### ID 122 — Adrenaline Rush

- Custom: SP/TP Charge Rate +15% when dealing damage

### ID 126 — Desperate Fury

- Custom: When HP <25%: ATK +35%, AGI +20%

### ID 137 — Unrelenting Offense

- Custom: ATK +12%; damage increases by 5% when HP is above 80%

### ID 158 — Blood Sacrifice Pact

- Custom: When HP falls below 50%, M.ATK +15% and damage taken +10%

### ID 169 — Lightning Essence

- Custom: Lightning Damage +25%, AGI +20%, 15% Paralyze chance when casting electric magic

### ID 199 — Sadistic Executioner

- Custom: Damage +15% against targets below 40% HP

### ID 204 — Ambush Mastery

- Custom: Damage +10% against targets that have not acted; ignore 15% DEF.

### ID 205 — Cold-Blooded Executioner

- Custom: Crit Damage +20%; +8% damage vs targets below 30% HP.

### ID 209 — Phantom Executioner

- Custom: Damage +20% vs targets below 35% HP; execution bonus does not affect Bosses

## Damage Modifier / Penetration / Lifesteal

### ID 084 — Eye of the Storm

- Custom: Magic SP Cost -20%; vs Float: Magic Crit +30%, Crit Damage +20% (3 turns)

### ID 093 — Frequency Tuning

- Custom: Sonic Damage +25%; Skill Accuracy +20% (3 turns)

### ID 111 — Focus

- Custom: Crit Rate +20%, Hit Rate +20%, damage +10% (1 turn)

### ID 115 — Shadow Cloak

- Custom: Evasion +70%, single-target damage taken -30% (1 turn); ends after attacking

### ID 123 — Iron Fist

- Custom: Attack +12% & Ignore 8% DEF

### ID 124 — Bloodlust

- Custom: Lifesteal 10% of damage dealt

### ID 132 — Feral Instinct

- Custom: Ignore 15% DEF, Crit Damage +30%, critical hits refund 3% Max SP

### ID 133 — Dragon Hunter's Instinct

- Physical damage +25% vs Boss targets.

### ID 134 — Scale Hardening

- Custom: Physical Damage -15%, Dragon/Boss Damage +10%

### ID 147 — Elemental Mastery

- Custom: Elemental damage +10%

### ID 152 — Arcane Elemental Mastery

- Custom: Elemental Magic Damage +20%

### ID 161 — Heart of Flame

- Custom: Fire elemental damage +25%; fire damage taken -50%; Burn Immunity.

### ID 163 — Heart of Tides

- Custom: Water elemental damage +25%; water damage taken -50%; Chill Immunity.

### ID 165 — Heart of Stone

- Custom: Earth Damage +25%, DEF +20%, Stun/Knockback Resistance +30%

### ID 167 — Heart of Gale

- Custom: Wind Damage +25%, AGI +25%, Evasion +20%

### ID 170 — Conductors

- Custom: Lightning Damage +15%; Metal accuracy against user -20%; Sleep Immunity; physical attackers have 15% Shock chance

### ID 171 — Glacial Core

- Custom: Ice Damage +25%; Chill/Freeze resistance +30%

### ID 175 — Sonic Resonance

- Custom: Sonic Damage +25%; Hit Rate +10%; Silence Resistance +30%

### ID 198 — Twin Blade Mastery

- Custom: Dual-wield damage +10%; Off-hand penalty reduced by 25%

### ID 208 — Toxic Coating

- Custom: Attacks have 30% Poison chance; Poison damage +15%.

## Element / Elemental Interaction

### ID 016 — Silence

- Seal Skill Type: Dark Magic

### ID 027 — Soaked

- Custom: Fire Element Rate 80%; Lightning Element Rate 125%

### ID 113 — Elemental Arrow

- Custom: Elemental Arrow: choose one element; attacks gain that element and +10% elemental damage (3 turns)

### ID 139 — Guardian of Nusvanir

- Custom: Max HP +12%, Holy Resistance +20%, Taunt effects last +1 turn

### ID 168 — Wind Walker

- Custom: Permanent Float; Ground immunity; Magic Crit Rate +10%

## Other Custom Logic

### ID 014 — Blind

- Custom: HIT ×50%

### ID 067 — Razor Shell

- Custom: Physical Damage Absorption 35%; melee reflect 20% (2 turns)

### ID 081 — Granite Rampart

- Custom: DEF +45%; physical damage reflection 10% (3 turns)

### ID 091 — Magnetic Repulsion

- Custom: Physical Evasion +30%; forced-movement immunity (3 turns)

### ID 118 — Iron Discipline

- Custom: Max HP +8% & Fear Immunity

### ID 119 — Guardian Armor

- Custom: Max HP +12%, Defense +7%, M.Defense +7%

### ID 127 — Fortified Guardian Armor

- Custom: Max HP +15%, DEF +8%, M.DEF +8%

### ID 136 — Royal Vanguard Discipline

- Custom: Max HP +10%, ATK +8%, Control Resistance +20%

### ID 143 — Chi Mastery

- Custom: Max SP +15%, SP/TP Charge Rate +10%

### ID 144 — Temple Blessing: Four Paths

- Custom: Choose one path after learning: Tiger (+10% ATK), Crane (+10% AGI), Tortoise (+10% DEF), Serpent (+10% Crit Rate). Permanent; only one path active.

### ID 150 — Blood Pact

- Custom: M.ATK +12%; Max HP -5%

### ID 154 — Sorcerer's Rigor

- Custom: Max MP +25%, M.ATK +15%, 15% Double Cast Chance

## Catatan Implementasi

Prioritas pengerjaan yang disarankan:

1. Selesaikan dulu efek yang sebenarnya bisa dipindah ke native Trait / NUSV ExtraParam / SpecialParam / ElementCore.
2. Setelah itu kelompokkan sisa mekanik custom menjadi sistem reusable: stack/counter, barrier/redirect, trigger condition, summon/contract, dan special targeting.
3. Baru implementasikan mekanik reusable tersebut di `NUSV_StateCore` atau modul custom lain, agar tidak membuat script terpisah untuk setiap state.
4. Setelah custom logic selesai, hapus marker `[PENDING MAPPING]` / `CUSTOM LOGIC REQUIRED` dari state yang sudah terimplementasi dan lakukan smoke test.

## State yang Baru Dibetulkan

Enam state berikut sudah direcall/diperbaiki definisi efeknya, tetapi beberapa masih memerlukan custom logic sesuai mekaniknya:

- **ID 133 — Dragon Hunter's Instinct**
- **ID 162 — Flame Eater**
- **ID 177 — Sacred Consecration**
- **ID 178 — Divine Gift**
- **ID 179 — Holy Barrier**
- **ID 180 — Martyr's Faith**
