import json

items = json.load(open('data/Items.json', encoding='utf-8'))
for itm in items:
    if not itm or not itm.get('name'): continue
    print(f"ID:{itm['id']:3d} | Name:{itm['name']:<30} | IType:{itm.get('itypeId', 0):2d} | CurrentIcon:{itm.get('iconIndex', 0)}")

