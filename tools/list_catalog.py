import json

with open("img/system/IconSet_mapping.json", "r", encoding="utf-8") as f:
    mapping = json.load(f)

with open("tools/catalog_list.txt", "w", encoding="utf-8") as out:
    for item in mapping:
        out.write(f"#{item['index']:3d} | {item['category']:<25} | {item['name']}\n")

print(f"Wrote {len(mapping)} catalog items to tools/catalog_list.txt")

