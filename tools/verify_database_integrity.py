import json
import glob
import re
import os

with open('data/States.json', 'r', encoding='utf-8') as f:
    states = json.load(f)

print(f"Total states in States.json: {len(states)} (index 0 is {states[0]})")
max_state_id = len(states) - 1
print(f"Max state ID: {max_state_id}")

# Check that every single state from 1 to max_state_id is non-null and has a non-empty name
invalid_states = []
for i in range(1, len(states)):
    st = states[i]
    if not st:
        invalid_states.append((i, "NULL"))
    elif not (st.get("name") or "").strip():
        invalid_states.append((i, "EMPTY_NAME"))
    elif st.get("id") != i:
        invalid_states.append((i, f"MISMATCH_ID ({st.get('id')})"))

if invalid_states:
    print(f"ERROR: Found {len(invalid_states)} invalid states: {invalid_states}")
else:
    print(f"SUCCESS: All {max_state_id} states are valid, dense, correctly indexed, and non-empty!")

# Audit all data files
issues = []

# 1. Classes
with open('data/Classes.json', 'r', encoding='utf-8') as f:
    classes = json.load(f)
for c in classes:
    if not c: continue
    for m in re.finditer(r'<Passive State:\s*(\d+)>', c.get('note', '')):
        sid = int(m.group(1))
        if sid < 1 or sid > max_state_id or not states[sid]:
            issues.append(f"Class [{c['id']}: {c['name']}] invalid passive state: {sid}")

# 2. Races
with open('data/Races.json', 'r', encoding='utf-8') as f:
    races = json.load(f)
for r in races:
    if not r: continue
    sid = r.get('stateId')
    if sid < 1 or sid > max_state_id or not states[sid]:
        issues.append(f"Race [{r['id']}: {r['name']}] invalid stateId: {sid}")

# 3. Skills
with open('data/Skills.json', 'r', encoding='utf-8') as f:
    skills = json.load(f)
for sk in skills:
    if not sk: continue
    for eff in sk.get('effects', []):
        if eff.get('code') in [21, 22]:
            sid = eff.get('dataId')
            # In RPG Maker, sid == 0 means "Normal Attack State"
            if sid != 0 and (sid < 1 or sid > max_state_id or not states[sid]):
                issues.append(f"Skill [{sk['id']}: {sk['name']}] invalid effect state: {sid}")
    for tr in sk.get('traits', []):
        if tr.get('code') in [13, 14, 32]:
            sid = tr.get('dataId')
            if sid < 1 or sid > max_state_id or not states[sid]:
                issues.append(f"Skill [{sk['id']}: {sk['name']}] invalid trait state: {sid}")
    for m in re.finditer(r'<Passive State:\s*(\d+)>', sk.get('note', '')):
        sid = int(m.group(1))
        if sid < 1 or sid > max_state_id or not states[sid]:
            issues.append(f"Skill [{sk['id']}: {sk['name']}] invalid passive state: {sid}")
    for m in re.finditer(r'<User Add State:\s*(\d+)>', sk.get('note', '')):
        sid = int(m.group(1))
        if sid < 1 or sid > max_state_id or not states[sid]:
            issues.append(f"Skill [{sk['id']}: {sk['name']}] invalid User Add State: {sid}")

# 4. Items
with open('data/Items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)
for it in items:
    if not it: continue
    for eff in it.get('effects', []):
        if eff.get('code') in [21, 22]:
            sid = eff.get('dataId')
            if sid < 1 or sid > max_state_id or not states[sid]:
                issues.append(f"Item [{it['id']}: {it['name']}] invalid effect state: {sid}")

# 5. Armors, Weapons, Enemies, Actors
for fname in ['Armors.json', 'Weapons.json', 'Enemies.json', 'Actors.json']:
    with open(f'data/{fname}', 'r', encoding='utf-8') as f:
        items = json.load(f)
    for it in items:
        if not it: continue
        for tr in it.get('traits', []):
            if tr.get('code') in [13, 14, 32]:
                sid = tr.get('dataId')
                if sid < 1 or sid > max_state_id or not states[sid]:
                    issues.append(f"{fname} [{it['id']}: {it['name']}] invalid trait state: {sid}")
        for m in re.finditer(r'<Passive State:\s*(\d+)>', it.get('note', '')):
            sid = int(m.group(1))
            if sid < 1 or sid > max_state_id or not states[sid]:
                issues.append(f"{fname} [{it['id']}: {it['name']}] invalid passive state: {sid}")

if issues:
    print(f"\nERROR: Found {len(issues)} issues across the database:")
    for iss in issues:
        print(" ", iss)
else:
    print("\nSUCCESS: 0 broken references! All database files are completely consistent.")
