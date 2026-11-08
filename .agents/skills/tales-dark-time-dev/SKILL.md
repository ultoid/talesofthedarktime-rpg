---
name: tales-dark-time-dev
description: >-
  Comprehensive engineering runbook, battle sequence syntax, and strict verification workflows
  for Tales of The Dark Time (RPG Maker MV, Yanfly Plugins, Database Studio, and NUSV custom engine).
  Use whenever developing, modifying, or debugging game mechanics, action sequences, battle systems,
  weapons/skills, or the NUSV Database Studio UI.
---

# Tales of The Dark Time — Development & Action Sequence Runbook

This skill provides the complete technical specifications and runbook for developing, debugging, and extending Tales of The Dark Time.

## 1. Action Sequence Reference (Yanfly Battle Engine Core + Packs 1, 2, 3)

### Action Sequence Structure (5 Phases)
```text
<setup action>
  # Preparation before action execution (clearing battle log, immortal targets, camera focus, zoom)
</setup action>

<whole action>
  # Actions affecting all targets simultaneously (cast animations, global buffs/debuffs)
</whole action>

<target action>
  # Actions affecting each target individually (approach, swing/thrust motion, weapon animation, action effect, screen shake, knockback)
</target action>

<follow action>
  # Cleanup or combo follow-up after targets are hit
</follow action>

<finish action>
  # Return movement, resetting camera/zoom smoothly, clearing immortal state, perform finish
</finish action>
```

### Key Commands Cheat Sheet
* **Movement**:
  * `move user: target, front, 18, 14` (target, front, distance, duration in frames)
  * `move target: backward, 35, 8` (knockback effect)
  * `move target: home, 8` (target returns home)
  * `jump user: height, frames` (e.g. `jump user: 120, 15`)
  * `wait for movement`
* **Motions & Animations**:
  * `motion swing: user`, `motion thrust: user`, `motion missile: user`, `motion cast: user`
  * `attack animation: target` (uses equipped weapon's animation)
  * `animation ID: target` (uses specific database animation ID)
  * `wait for animation`
* **Camera & Screen Effects**:
  * `camera clamp off` / `camera clamp on`
  * `camera focus: user, center, 25` (smooth focus over 25 frames)
  * `zoom: 120%, 25` (smooth zoom to 120% over 25 frames)
  * `reset camera: 30` (smooth camera return over 30 frames)
  * `reset zoom: 30` (smooth zoom return over 30 frames)
  * `wait for camera` / `wait for zoom`
  * `shake screen: power, speed, duration` (e.g. `shake screen: 3, 5, 10`)
* **Damage & Execution**:
  * `action effect: target` (calculates and inflicts damage formula)
  * `motion damage: target`
  * `immortal: targets, true` (in setup action) / `immortal: targets, false` (in finish action)

---

## 2. Weapon Types to Basic Attack Mapping (10 Core Types)

| ID | Weapon Type | Mapped Skill ID | Core Choreography Profile |
|:---|:---|:---|:---|
| 01 | Long Sword | #431 | Maju mantap, tebas berat, shake screen, knockback 45px |
| 02 | Sword | #432 | Maju lincah, tebasan cepat, damage & return |
| 03 | Gloves | #433 | Maju cepat, tinjuan 1–2x (dual-wield aware), damage beruntun |
| 04 | Spear | #434 | Melompat menusuk (jump 80px), thrust animation, knockback 30px |
| 05 | Axe | #435 | Melompat tinggi (jump 140px), hantaman berat ke tanah, screen shake 4 |
| 06 | Staff | #436 | Maju selangkah, chant mantra, proyektil mana meluncur ke target |
| 07 | Rune | #437 | Maju selangkah, angkat tangan, 1–2x proyektil mana beruntun |
| 08 | Long Bow | #438 | Diam di tempat, tarik busur, proyektil panah meluncur & menancap |
| 09 | Crossbow | #439 | Diam di tempat, tembakan beruntun 1–3 anak panah |
| 10 | Dagger | #440 | Teleport ke belakang target (front_base -30px), 1–2x sabetan cepat |

---

## 3. Strict Verification & Integrity Protocol

When making modifications:
1. **Never guess or bypass runtime checks**:
   * Inspect file diffs before and after.
   * Verify that sparse arrays (due to `YEP_ItemCore` instancing up to ID 3000) have defensive `if (!obj) continue;` guards in any iteration.
2. **Execute Headless Verification**:
   * Run parity test suite: `python3 tools/test_browser_parity.py`.
   * Ensure `SceneManager._scene` boots cleanly without errors.

---

## 4. Turn-Based RPG Combat Systems Architecture
For full mechanical and balance specifications, cross-reference the dedicated skill [turn-based-rpg-combat](../turn-based-rpg-combat/SKILL.md):
* **State Stack & CTB Action Queue**: [combat_state_machine_and_queues.md](../turn-based-rpg-combat/references/combat_state_machine_and_queues.md)
* **Damage Pipeline & Mitigation Math**: [damage_pipeline_and_formulas.md](../turn-based-rpg-combat/references/damage_pipeline_and_formulas.md)
* **Status Effects & CC Lifecycle**: [status_effects_and_cc_lifecycle.md](../turn-based-rpg-combat/references/status_effects_and_cc_lifecycle.md)
* **Tactical AI & TTK Balancing**: [turn_based_ai_and_balancing.md](../turn-based-rpg-combat/references/turn_based_ai_and_balancing.md)

---

## 5. Coding Behavior Standards (Karpathy Guidelines)
All development across the engine, studio tools, and scripts strictly follows [karpathy-guidelines](../karpathy-guidelines/SKILL.md):
* **Think Before Coding**: Clarify ambiguities and surface assumptions explicitly.
* **Simplicity First**: Write the leanest solution with zero speculative features or unrequested configurability.
* **Surgical Changes**: Zero accidental diff churn; never touch or reformat unrelated working code.
* **Goal-Driven Execution**: Every step is verifiable with concrete checks before completion.
