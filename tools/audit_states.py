import json

states = json.load(open('data/States.json', encoding='utf-8'))
valid = [s for s in states if s and s.get('name') and not 'reserved' in s.get('name').lower()]
print(f"Total valid states: {len(valid)}")
for s in valid:
    print(f"ID:{s['id']:3d} | Name:{s['name']:<25} | CurrentIcon:{s.get('iconIndex', 0)}")

