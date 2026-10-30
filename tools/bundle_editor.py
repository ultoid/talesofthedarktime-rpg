#!/usr/bin/env python3
"""
NUSV Database Studio - Bundler Tool
Concatenates modular editor_studio CSS and JS into a single standalone HTML file.

Usage:
    python tools/bundle_editor.py              # Generates editor.bundled.html
    python tools/bundle_editor.py --inplace    # Updates editor.html with bundled code
"""

import sys
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def bundle():
    inplace = '--inplace' in sys.argv
    editor_html_path = ROOT_DIR / "editor.html"
    
    with open(editor_html_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # 1. Inline CSS stylesheets
    def replace_css_link(match):
        css_href = match.group(1)
        css_file = ROOT_DIR / css_href.replace('/', '\\')
        if css_file.exists():
            with open(css_file, 'r', encoding='utf-8') as cf:
                css_content = cf.read().replace('../../img/', 'img/')
                return f"<style>/* Inlined from {css_href} */\n{css_content}\n</style>"
        return match.group(0)

    html = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)">', replace_css_link, html)

    # 2. Inline JS scripts
    script_regex = re.compile(r'<script\s+src="([^"]+)"></script>')
    matches = list(script_regex.finditer(html))
    if matches:
        combined_scripts = []
        for m in matches:
            js_src = m.group(1)
            js_file = ROOT_DIR / js_src.replace('/', '\\')
            if js_file.exists():
                with open(js_file, 'r', encoding='utf-8') as jf:
                    combined_scripts.append(f"/* Inlined from {js_src} */\n{jf.read()}")
            else:
                print(f"Warning: Script {js_src} not found!")

        first_pos = matches[0].start()
        last_pos = matches[-1].end()
        inlined_script_block = "<script>\n" + "\n\n".join(combined_scripts) + "\n</script>"
        html = html[:first_pos] + inlined_script_block + html[last_pos:]

    out_file = editor_html_path if inplace else (ROOT_DIR / "editor.bundled.html")
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Bundled studio written to: {out_file.name} ({out_file.stat().st_size:,} bytes)")

if __name__ == '__main__':
    bundle()
