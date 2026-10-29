#!/usr/bin/env bash
cd "$(dirname "$0")"
python3 tools/nusv_editor_server.py "$@"
read -p "Press enter to exit..."
