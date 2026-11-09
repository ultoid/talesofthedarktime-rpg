import json

skills = json.load(open('data/Skills.json', encoding='utf-8'))
valid = [s for s in skills if s and s.get('name') and not s.get('name').startswith('---')]
print(f"Total valid skills: {len(valid)}")
for s in valid[:50]:
    print(f"ID:{s['id']:3d} | Stype:{s.get('stypeId', 0):2d} | Name:{s['name']:<30} | CurrentIcon:{s.get('iconIndex', 0)}")

