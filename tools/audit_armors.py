import json

armors = json.load(open('data/Armors.json', encoding='utf-8'))
for a in armors:
    if not a or not a.get('name'): continue
    print(f"ID:{a['id']:3d} | Etype:{a.get('etypeId', 0):2d} | Name:{a['name']:<30} | CurrentIcon:{a.get('iconIndex', 0)}")

