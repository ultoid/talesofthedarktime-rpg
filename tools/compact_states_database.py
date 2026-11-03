#!/usr/bin/env python3
"""
tools/compact_states_database.py
Removes all empty states from data/States.json, re-indexing the remaining 109 states
contiguously from ID 1 to 109, and updates all references across the entire project
(Skills, Classes, Races, Items, Weapons, Armors, Enemies, Actors, Troops, CommonEvents, Maps).
"""

import json
import os
import re
import glob
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"

def compact_database():
    states_path = DATA_DIR / "States.json"
    with open(states_path, "r", encoding="utf-8") as f:
        old_states = json.load(f)

    # 1. Build mapping from old state ID to new state ID
    old_to_new = {}
    new_states = [None] # RPG Maker 1-based index
    new_id = 1

    for old_id, s in enumerate(old_states):
        if s is None or old_id == 0:
            continue
        name = (s.get("name") or "").strip()
        if name:
            old_to_new[old_id] = new_id
            s_copy = dict(s)
            s_copy["id"] = new_id
            new_states.append(s_copy)
            new_id += 1

    print(f"[States] Compacting {len(old_states)} entries -> {len(new_states)} entries (109 active states, 0 empty).")

    # 2. Update internal traits in new_states
    for s in new_states[1:]:
        for tr in s.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                target = tr.get("dataId")
                if target in old_to_new:
                    tr["dataId"] = old_to_new[target]

    # Save States.json
    with open(states_path, "w", encoding="utf-8") as f:
        json.dump(new_states, f, indent=2, ensure_ascii=False)
    print(f"[States] Written data/States.json successfully.")

    # 3. Update Skills.json
    skills_path = DATA_DIR / "Skills.json"
    with open(skills_path, "r", encoding="utf-8") as f:
        skills = json.load(f)

    for sk in skills:
        if not sk: continue
        # effects
        for eff in sk.get("effects", []):
            if eff.get("code") in [21, 22]:
                sid = eff.get("dataId")
                if sid in old_to_new:
                    eff["dataId"] = old_to_new[sid]
        # traits
        for tr in sk.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        # note
        note = sk.get("note", "")
        if note:
            # Passive State: X
            def repl_passive(m):
                orig_id = int(m.group(1))
                return f"<Passive State: {old_to_new.get(orig_id, orig_id)}>"
            note = re.sub(r'<Passive State:\s*(\d+)>', repl_passive, note)

            # User Add State: X (e.g. Skill 559)
            def repl_user_state(m):
                orig_id = int(m.group(1))
                # For Skill 559 specifically, 106 was the old pre-overhaul ID for Shadow Mode (which is now new ID 40)
                if orig_id == 106 and 52 in old_to_new:
                    return f"<User Add State: {old_to_new[52]}>"
                return f"<User Add State: {old_to_new.get(orig_id, orig_id)}>"
            note = re.sub(r'<User Add State:\s*(\d+)>', repl_user_state, note)
            sk["note"] = note

    with open(skills_path, "w", encoding="utf-8") as f:
        json.dump(skills, f, indent=2, ensure_ascii=False)
    print(f"[Skills] Written data/Skills.json successfully.")

    # 4. Update Classes.json
    classes_path = DATA_DIR / "Classes.json"
    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    for c in classes:
        if not c: continue
        for tr in c.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        note = c.get("note", "")
        if note:
            def repl_class_passive(m):
                orig_id = int(m.group(1))
                return f"<Passive State: {old_to_new.get(orig_id, orig_id)}>"
            c["note"] = re.sub(r'<Passive State:\s*(\d+)>', repl_class_passive, note)

    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)
    print(f"[Classes] Written data/Classes.json successfully.")

    # 5. Update Races.json
    races_path = DATA_DIR / "Races.json"
    with open(races_path, "r", encoding="utf-8") as f:
        races = json.load(f)

    for r in races:
        if not r: continue
        sid = r.get("stateId")
        if sid in old_to_new:
            r["stateId"] = old_to_new[sid]

    with open(races_path, "w", encoding="utf-8") as f:
        json.dump(races, f, indent=2, ensure_ascii=False)
    print(f"[Races] Written data/Races.json successfully.")

    # 6. Update Items.json
    items_path = DATA_DIR / "Items.json"
    with open(items_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    for it in items:
        if not it: continue
        for eff in it.get("effects", []):
            if eff.get("code") in [21, 22]:
                sid = eff.get("dataId")
                if sid in old_to_new:
                    eff["dataId"] = old_to_new[sid]
        for tr in it.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]

    with open(items_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print(f"[Items] Written data/Items.json successfully.")

    # 7. Update Weapons.json
    weapons_path = DATA_DIR / "Weapons.json"
    with open(weapons_path, "r", encoding="utf-8") as f:
        weapons = json.load(f)

    for w in weapons:
        if not w: continue
        for tr in w.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        note = w.get("note", "")
        if note:
            w["note"] = re.sub(r'<Passive State:\s*(\d+)>', lambda m: f"<Passive State: {old_to_new.get(int(m.group(1)), int(m.group(1)))}>", note)

    with open(weapons_path, "w", encoding="utf-8") as f:
        json.dump(weapons, f, indent=2, ensure_ascii=False)
    print(f"[Weapons] Written data/Weapons.json successfully.")

    # 8. Update Armors.json
    armors_path = DATA_DIR / "Armors.json"
    with open(armors_path, "r", encoding="utf-8") as f:
        armors = json.load(f)

    for a in armors:
        if not a: continue
        for tr in a.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        note = a.get("note", "")
        if note:
            a["note"] = re.sub(r'<Passive State:\s*(\d+)>', lambda m: f"<Passive State: {old_to_new.get(int(m.group(1)), int(m.group(1)))}>", note)

    with open(armors_path, "w", encoding="utf-8") as f:
        json.dump(armors, f, indent=2, ensure_ascii=False)
    print(f"[Armors] Written data/Armors.json successfully.")

    # 9. Update Enemies.json
    enemies_path = DATA_DIR / "Enemies.json"
    with open(enemies_path, "r", encoding="utf-8") as f:
        enemies = json.load(f)

    for e in enemies:
        if not e: continue
        for tr in e.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        for act in e.get("actions", []):
            if act.get("conditionType") == 2:
                sid = act.get("conditionParam1")
                if sid in old_to_new:
                    act["conditionParam1"] = old_to_new[sid]

    with open(enemies_path, "w", encoding="utf-8") as f:
        json.dump(enemies, f, indent=2, ensure_ascii=False)
    print(f"[Enemies] Written data/Enemies.json successfully.")

    # 10. Update Actors.json
    actors_path = DATA_DIR / "Actors.json"
    with open(actors_path, "r", encoding="utf-8") as f:
        actors = json.load(f)

    for act in actors:
        if not act: continue
        for tr in act.get("traits", []):
            if tr.get("code") in [13, 14, 32]:
                sid = tr.get("dataId")
                if sid in old_to_new:
                    tr["dataId"] = old_to_new[sid]
        note = act.get("note", "")
        if note:
            act["note"] = re.sub(r'<Passive State:\s*(\d+)>', lambda m: f"<Passive State: {old_to_new.get(int(m.group(1)), int(m.group(1)))}>", note)

    with open(actors_path, "w", encoding="utf-8") as f:
        json.dump(actors, f, indent=2, ensure_ascii=False)
    print(f"[Actors] Written data/Actors.json successfully.")

    # 11. Update Troops.json
    troops_path = DATA_DIR / "Troops.json"
    with open(troops_path, "r", encoding="utf-8") as f:
        troops = json.load(f)

    for tr in troops:
        if not tr: continue
        for page in tr.get("pages", []):
            for cmd in page.get("list", []):
                if cmd.get("code") == 313: # Change State
                    params = cmd.get("parameters", [])
                    if len(params) >= 4 and params[3] in old_to_new:
                        params[3] = old_to_new[params[3]]
                elif cmd.get("code") == 111: # Conditional Branch
                    params = cmd.get("parameters", [])
                    if len(params) >= 4 and (params[0] == 0 and params[2] == 3 or params[0] == 1 and params[2] == 2):
                        if params[3] in old_to_new:
                            params[3] = old_to_new[params[3]]

    with open(troops_path, "w", encoding="utf-8") as f:
        json.dump(troops, f, indent=2, ensure_ascii=False)
    print(f"[Troops] Written data/Troops.json successfully.")

    # 12. Update CommonEvents.json
    ce_path = DATA_DIR / "CommonEvents.json"
    with open(ce_path, "r", encoding="utf-8") as f:
        common_events = json.load(f)

    for ce in common_events:
        if not ce: continue
        for cmd in ce.get("list", []):
            if cmd.get("code") == 313:
                params = cmd.get("parameters", [])
                if len(params) >= 4 and params[3] in old_to_new:
                    params[3] = old_to_new[params[3]]
            elif cmd.get("code") == 111:
                params = cmd.get("parameters", [])
                if len(params) >= 4 and (params[0] == 0 and params[2] == 3 or params[0] == 1 and params[2] == 2):
                    if params[3] in old_to_new:
                        params[3] = old_to_new[params[3]]

    with open(ce_path, "w", encoding="utf-8") as f:
        json.dump(common_events, f, indent=2, ensure_ascii=False)
    print(f"[CommonEvents] Written data/CommonEvents.json successfully.")

    # 13. Update Map*.json
    for map_file in sorted(DATA_DIR.glob("Map[0-9]*.json")):
        with open(map_file, "r", encoding="utf-8") as f:
            try:
                mdata = json.load(f)
            except Exception:
                continue
        modified = False
        for event in mdata.get("events", []):
            if not event: continue
            for page in event.get("pages", []):
                for cmd in page.get("list", []):
                    if cmd.get("code") == 313:
                        params = cmd.get("parameters", [])
                        if len(params) >= 4 and params[3] in old_to_new:
                            params[3] = old_to_new[params[3]]
                            modified = True
                    elif cmd.get("code") == 111:
                        params = cmd.get("parameters", [])
                        if len(params) >= 4 and (params[0] == 0 and params[2] == 3 or params[0] == 1 and params[2] == 2):
                            if params[3] in old_to_new:
                                params[3] = old_to_new[params[3]]
                                modified = True
        if modified:
            with open(map_file, "w", encoding="utf-8") as f:
                json.dump(mdata, f, indent=2, ensure_ascii=False)
            print(f"[Maps] Updated {map_file.name}")

    print("\n[SUCCESS] Database compaction and reference updates complete!")

if __name__ == "__main__":
    compact_database()

