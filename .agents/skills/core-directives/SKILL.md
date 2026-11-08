---
name: core-directives
description: >-
  Core engineering directives, user principles, mandatory pre-flight verification checklist,
  project architecture, and coding guidelines for Tales of The Dark Time.
  Use whenever working on any development, debugging, refactoring, or design task in this project.
---

# Tales of The Dark Time — Core Agent Directives & Engineering Wisdom

## 1. Directives of Wisdom (User Principles)
* **Zero Guessing & Single-Turn Completion**: Never perform fragmented, partial edits that force the user to point out basic omissions. Implement the complete end-to-end chain (Engine + UI + Data) in one turn.
* **Automated End-to-End Verification Before Responding**: ALWAYS test and verify code execution (game boot, database loading, headless browser tests) *before* reporting to the user. Never report that a fix is complete if it causes a crash, infinite loop, or black screen.
* **Preserve User Autonomy & Visual UI**: Provide visual, modular editing interfaces (modular blocks, text fields with free value editing, dropdowns) instead of hardcoding or forcing Python script injections into project files.
* **Preserve Engine Integrity**: When modifying weapons, items, or skills:
  * Account for independent item instancing (`YEP_ItemCore` sets array lengths to 3000+ with `null` padding; all loops over database groups MUST check `if (!obj) continue;`).
  * Ensure weapon types (`wtypeId` 1..10) map cleanly to weapon-type basic attack skills (#431 - #440).
* **Extreme Token Efficiency**: Keep direct chat responses concise, structured, and focused on tangible outcomes without wasting user context or token budget.

## 2. Project Architecture & Tech Stack
* **Game Engine**: RPG Maker MV (v1.6.2 runtime).
* **Battle System**: Charge Turn Battle (`YEP_X_BattleSysCTB`), Battle Engine Core (`YEP_BattleEngineCore`), Action Sequence Packs 1, 2, 3.
* **Custom Engine Layer**:
  * `js/plugins/NUSV_WeaponUnleash.js`: Maps equipped weapon type (1..10) automatically to skills #431..#440, handles `<skill_id: X>` and unleash procs.
  * `js/plugins/NUSV_DamageCore.js`: SP/MP unified resource gains, damage calculation, popups.
* **Database Studio**:
  * Web-based database management interface on `http://127.0.0.1:5050`.
  * Source in `editor_studio/js/` bundled into `editor.html` and `editor.bundled.html`.
  * Verification suite: `python3 tools/test_browser_parity.py`.

## 3. Mandatory Pre-Flight Verification Checklist
Before confirming any battle, skill, weapon, or studio modification:
1. Verify `data/*.json` syntactic and structural integrity.
2. If modifying plugins, ensure no unhandled null checks on sparse arrays (`$dataWeapons`, `$dataArmors`).
3. If modifying Database Studio, run `python3 tools/build_editor.py` and verify parity via `python3 tools/test_browser_parity.py`.
4. Run headless boot test to ensure `SceneManager._scene` reaches `Scene_Title` / `Scene_Map` with zero uncaught exceptions.

## 4. Turn-Based RPG Combat Engineering Principles
* **State Stack & Flow Isolation**: Macro battle flow (`Init` -> `TurnOrder` -> `Input` -> `ActionExecution` -> `Cleanup`) must never be monolithic. Interrupts (counter, reaction, animation) push/pop cleanly to preserve context.
* **CTB Action Queue & Speed Clamping**: Speed calculations (`YEP_X_BattleSysCTB`) must prevent infinite turn loops. Action delay penalties balance high-tier skills, and timeline projections must remain transparent to the player.
* **Deterministic Damage Pipeline**: Calculations follow a multi-stage pipeline (Base -> Trait Multipliers -> Crit Check -> Elemental Affinity -> Multiplicative Mitigation -> Shields -> Variance) instead of raw subtractive math.
* **Status Effect Lifecycle Hooks**: States handle their own triggers (`onTurnStart`, `beforeIncomingHit`, `onDamageTaken`, `onTurnEnd`). Bosses implement diminishing returns on Hard CC (Stun/Sleep).
* **Tactical AI & Telegraphed Attacks**: Enemies evaluate threat scores and HP thresholds (<50% phase triggers). Lethal AoE ultimates must be telegraphed 1 turn in advance with charging poses/auras.

## 5. Andrej Karpathy's LLM Coding Guidelines
* **Think Before Coding**: State assumptions explicitly. Surface ambiguity and tradeoffs instead of picking silently. Stop and ask when confused.
* **Simplicity First**: Minimum code that solves the problem—nothing speculative. No unrequested configurability or single-use abstractions.
* **Surgical Changes**: Touch only what you must. Never reformat or refactor adjacent working code. Every changed line must trace directly to the request.
* **Goal-Driven Execution**: Transform tasks into verifiable criteria (Step -> Verify). Loop until verified before declaring done.
