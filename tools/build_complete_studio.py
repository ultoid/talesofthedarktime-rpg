#!/usr/bin/env python3
"""
tools/build_complete_studio.py
Forwarding wrapper to tools/bundle_editor.py to ensure the modern modular
Studio architecture (editor_studio/) is always bundled correctly.
"""

import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def main():
    bundle_script = ROOT_DIR / "tools" / "bundle_editor.py"
    # Update editor.html in-place and generate editor.bundled.html
    cmd_inplace = [sys.executable, str(bundle_script), "--inplace"]
    cmd_bundled = [sys.executable, str(bundle_script)]
    
    subprocess.check_call(cmd_inplace)
    subprocess.check_call(cmd_bundled)
    print("Database Studio successfully built and updated!")

if __name__ == "__main__":
    main()
