import json
import os

files = ['Weapons.json', 'Armors.json', 'Items.json', 'Skills.json', 'States.json']
for fname in files:
    path = os.path.join('data', fname)
    data = json.load(open(path, encoding='utf-8'))
    valid = [x for x in data if x and x.get('name')]
    print(f"=== {fname}: {len(valid)} entries ===")
    for x in valid[:10]:
        print(f"  #{x['id']}: {x['name']} (iconIndex: {x.get('iconIndex', 0)})")

