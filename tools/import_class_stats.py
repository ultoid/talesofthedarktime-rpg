#!/usr/bin/env python3
import json
import re
from pathlib import Path

vault = Path("06_Sistem Game & Ekonomi/Class")
classes_path = Path("Game Project/Tales of The Dark Time/data/Classes.json")
classes = json.load(open(classes_path, "r", encoding="utf-8"))

cls_by_name = {}
for c in classes:
    if not c:
        continue
    clean = re.sub(r'[^a-zA-Z0-9]', '', c['name'].lower())
    cls_by_name[clean] = c

updated_count = 0
for f in sorted(vault.glob("**/*.md")):
    if f.name == "README.md":
        continue
    clean_stem = re.sub(r'^\d+_', '', f.stem)
    clean_key = re.sub(r'[^a-zA-Z0-9]', '', clean_stem.lower())
    if clean_key not in cls_by_name:
        continue
    c = cls_by_name[clean_key]
    txt = f.read_text(encoding="utf-8")

    m_growth = re.search(r"Pertumbuhan Stat Alami.*?:[^\n`]*`([^`]+)`", txt)
    m_stats = re.search(
        r"\|\s*STR\s*\|\s*INT\s*\|\s*DEX\s*\|\s*LUK\s*\|\s*AGI\s*\|\s*VIT\s*\|\s*\n[|\s:-]+\n\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?(\d+)\*?\*?",
        txt
    )

    note = c.get("note", "")
    new_tags = []

    if m_stats:
        s_vals = m_stats.groups()
        attrs = ["STR", "INT", "DEX", "LUK", "AGI", "VIT"]
        for i, code in enumerate(attrs):
            tag_name = f"Base {code}"
            if f"<{tag_name}:" not in note:
                new_tags.append(f"<{tag_name}: {s_vals[i]}>")

    if m_growth:
        growth_val = m_growth.group(1).strip()
        if "<Class Stat Growth:" not in note and growth_val:
            new_tags.append(f"<Class Stat Growth: {growth_val}>")

    if new_tags:
        tags_str = "\n".join(new_tags)
        if note.strip():
            c["note"] = note.rstrip() + "\n" + tags_str + "\n"
        else:
            c["note"] = tags_str + "\n"
        updated_count += 1
        print(f"Updated #{c['id']} {c['name']} with:\n{tags_str}\n")

if updated_count > 0:
    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {updated_count} classes in Classes.json!")
else:
    print("No classes needed updating.")

