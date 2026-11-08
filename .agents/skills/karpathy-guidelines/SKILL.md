---
name: karpathy-guidelines
description: >-
  Behavioral guidelines to reduce common LLM coding mistakes, derived from Andrej Karpathy's
  observations on LLM coding pitfalls. Use whenever writing, reviewing, or refactoring code
  to enforce simplicity first, surgical changes, surfacing assumptions, and goal-driven verification.
---

# Karpathy Guidelines for Agentic Coding

Behavioral guidelines to eliminate common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on AI pair programming pitfalls.

> **Tradeoff:** These guidelines bias toward caution and precision over unverified speed. For trivial tasks, use pragmatic judgment.

---

## 🧭 References & Real-World Examples
For concrete before-and-after code diffs illustrating each principle, see:
- [Karpathy Guidelines Examples & Pitfalls](./references/EXAMPLES.md)

---

## ⚡ The 4 Core Principles

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing any non-trivial logic:
- **State assumptions explicitly**: If anything is uncertain or ambiguous, ask the user rather than guessing.
- **Surface multiple interpretations**: If multiple valid paths exist, present them with pros/cons—never pick silently.
- **Push back when warranted**: If a simpler approach or built-in capability already exists, voice it clearly.
- **Stop when confused**: If specifications conflict or codebase context is missing, stop immediately. Name what is confusing and ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

Combat the tendency toward overengineering and bloated abstractions:
- **No speculative features**: Implement strictly what was asked, nothing more.
- **No single-use abstractions**: Do not invent generic interfaces, helper classes, or factories for code used in only one place.
- **No unrequested configurability**: Do not add extra flags, config settings, or parameters that were not requested.
- **No paranoia error handling**: Avoid handling impossible scenarios that clutter readable code paths.
- **The Senior Engineer Test**: *"Would a senior engineer say this is overcomplicated?"* If yes, rewrite and simplify. If 200 lines could be 50, write 50.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When modifying existing files and modules:
- **Zero orthogonal edits**: Never "clean up", reformat, or "improve" adjacent code, comments, or whitespace that is unrelated to the task.
- **Do not refactor working code**: If a component isn't broken and wasn't requested to change, leave it untouched.
- **Match existing style strictly**: Follow the repository's established conventions, naming patterns, and architecture—even if you would write it differently in a vacuum.
- **Handle dead code responsibly**:
  - If your changes render existing variables/imports/functions orphaned, remove them.
  - Do NOT delete pre-existing dead or commented-out code unless explicitly instructed.
- **The Surgical Test**: Every single line in your git diff must trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform imperative instructions into verifiable goals:
- *"Add validation"* $\to$ *"Write tests / verification logic for invalid inputs, then make them pass."*
- *"Fix the bug"* $\to$ *"Reproduce the failure first, implement the fix, then verify it passes without side effects."*
- *"Refactor X"* $\to$ *"Ensure all existing test suites and runtime parity pass before and after."*

For multi-step implementations, state a brief plan with verifiable checkpoints:
```text
1. [Step A] → verify: [exact check/command]
2. [Step B] → verify: [exact check/command]
3. [Step C] → verify: [exact check/command]
```

Strong, unambiguous success criteria allow the agent to execute and verify independently. Weak criteria (*"make it work"*) cause regressions and endless user correction cycles.

---

## 🎯 Verification Metric
These guidelines are working when:
1. Git diffs contain **zero unrequested changes or formatting churn**.
2. Code remains **lean, readable, and free of speculative abstractions**.
3. Clarifying questions and tradeoffs are **surfaced before coding**, not after a broken implementation.
4. All modified features are **verified working before handing off to the user**.

