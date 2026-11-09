import json

weapons = json.load(open('data/Weapons.json', encoding='utf-8'))
for w in weapons:
    if not w or not w.get('name'): continue
    print(f"ID:{w['id']:2d} | Wtype:{w.get('wtypeId', 0):2d} | Name:{w['name']:<25} | CurrentIcon:{w.get('iconIndex', 0)}")

