import json
import os

def dump_file(filename):
    path = os.path.join('data', filename)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    valid = [x for x in data if x and x.get('name') and not x.get('name', '').startswith('---') and not 'reserved' in x.get('name', '').lower()]
    print(f"\n=================== {filename} (Total: {len(valid)}) ===================")
    for x in valid:
        extra = []
        if 'wtypeId' in x: extra.append(f"wtype:{x['wtypeId']}")
        if 'etypeId' in x: extra.append(f"etype:{x['etypeId']}")
        if 'stypeId' in x: extra.append(f"stype:{x['stypeId']}")
        extra_str = f" [{', '.join(extra)}]" if extra else ""
        print(f"#{x['id']:3d}: {x['name']:<30} (iconIndex: {x.get('iconIndex', 0)}){extra_str}")

if __name__ == '__main__':
    for f in ['Weapons.json', 'Armors.json', 'Items.json', 'Skills.json', 'States.json']:
        dump_file(f)

