import json
import os
import shutil
from data_fighter_skills import get_fighter_skills
from data_apprentice_skills import get_apprentice_skills
from data_scout_skills import get_scout_skills

# Ensure backups
for fname in ['Skills.json', 'Classes.json', 'Items.json']:
    src = os.path.join('data', fname)
    bak = os.path.join('data', fname.replace('.json', '.backup_revamp.json'))
    if not os.path.exists(bak):
        shutil.copyfile(src, bak)
        print(f"Created backup: {bak}")

with open('data/Skills.json', 'r', encoding='utf-8') as f:
    skills = json.load(f)

with open('data/Classes.json', 'r', encoding='utf-8') as f:
    classes = json.load(f)

with open('data/Items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Loaded: {len(skills)-1} skills, {len(classes)-1} classes, {len(items)-1} items.")

# 1. Generate 221 Revamped Skills for all 50 classes starting at ID 12
start_id = 12
f_skills, f_learn, next_id1 = get_fighter_skills(start_id)
a_skills, a_learn, next_id2 = get_apprentice_skills(next_id1)
s_skills, s_learn, next_id3 = get_scout_skills(next_id2)

new_skills = f_skills + a_skills + s_skills
all_learnings = {}
all_learnings.update(f_learn)
all_learnings.update(a_learn)
all_learnings.update(s_learn)

print(f"Generated {len(new_skills)} revamped skills (IDs {new_skills[0]['id']} to {new_skills[-1]['id']}).")

# Ensure skills list is large enough
max_new_id = new_skills[-1]['id']
while len(skills) <= max_new_id:
    skills.append(None)

# Insert revamped skills into skills array
for s in new_skills:
    sid = s['id']
    skills[sid] = s

print("Revamped skills written to Skills array.")

# 2. Update Classes.json learnings for all 50 classes
for cid in range(1, 51):
    c = classes[cid]
    if not c:
        print(f"Warning: Class ID {cid} is missing in Classes.json!")
        continue
    c['learnings'] = all_learnings.get(cid, [])
    # print(f"Class [{cid:02d}] {c['name']} updated with {len(c['learnings'])} skills.")

print("All 50 classes in Classes.json updated with new linear movepools.")

# 3. Create TM Items in Items.json
# Define skills that get TMs (Tier 1, Tier 2, and Key Tier 3 moves)
# We exclude Tier 4/5/6 pinnacle/signature moves
tm_candidates = []
for s in new_skills:
    stype = s.get('stypeId')
    name = s.get('name')
    # Exclude Ultimates (stype 5) and Tier 5/6 names
    if stype == 5:
        continue
    # Exclude apex signature moves
    apex_keywords = ['Oblivion', 'Ragnarok', 'Garuda', 'Divine Judgement', 'Abyssal Smite', 'Celestial', 
                     '108 Lotus', 'Nirvana', 'Supreme', 'Hellfire Cataclysm', 'Absolute Zero', 
                     'Judgement Thunderstorm', 'Apocalypse', 'Dragon Aspect', 'Temporal', 'Chronos',
                     'Mass Resurrection', 'Miracle of Rebirth', 'Totemic', 'Void', 'Calamity', 
                     'Event Horizon', 'Nihility', 'Black Hole', 'Stormbreaker', 'Wrath of the Wild', 
                     'Phantom Assassinate', 'Thousand Blades']
    if any(k.lower() in name.lower() for k in apex_keywords):
        continue
    tm_candidates.append(s)

print(f"Total TM candidates selected: {len(tm_candidates)}")

# Generate TM items starting from item ID 400
next_item_id = len(items)
if next_item_id < 400:
    while len(items) < 400:
        items.append(None)
    next_item_id = 400

tm_created = 0
for s in tm_candidates:
    sk_id = s['id']
    sk_name = s['name']
    stype = s.get('stypeId')
    
    is_magic = stype in (1, 2)
    prefix = "Scroll: "
    icon_id = 190 if is_magic else 187
    price = 500 if s['tpCost'] <= 15 and s['mpCost'] <= 10 else (1200 if s['tpCost'] <= 25 and s['mpCost'] <= 20 else 2500)
    
    tm_item = {
        "id": next_item_id,
        "animationId": 41,
        "consumable": True,
        "damage": {"critical": False, "elementId": 0, "formula": "0", "type": 0, "variance": 20},
        "description": f"[Scroll] Mengajarkan jurus [{sk_name}] secara permanen. Scroll akan hilang setelah dipelajari.",
        "effects": [{"code": 43, "dataId": sk_id, "value1": 0, "value2": 0}],
        "hitType": 0,
        "iconIndex": icon_id,
        "itypeId": 1, # Regular Item
        "name": f"{prefix}{sk_name}",
        "note": "<Scroll Item>\n<Skill Scroll>\n<Item Category: Skill Scroll>",
        "occasion": 2, # Menu Only
        "price": price,
        "repeats": 1,
        "scope": 7, # 1 Ally
        "speed": 0,
        "successRate": 100,
        "tpGain": 0
    }
    
    if next_item_id < len(items):
        items[next_item_id] = tm_item
    else:
        items.append(tm_item)
        
    next_item_id += 1
    tm_created += 1

print(f"Created {tm_created} TM Items in Items.json (Item IDs 400 to {next_item_id-1}).")

# 4. Save files back to disk
with open('data/Skills.json', 'w', encoding='utf-8') as f:
    json.dump(skills, f, indent=2, ensure_ascii=False)

with open('data/Classes.json', 'w', encoding='utf-8') as f:
    json.dump(classes, f, indent=2, ensure_ascii=False)

with open('data/Items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print("\n>>> ALL DATA SAVED SUCCESSFULLY! <<<")

