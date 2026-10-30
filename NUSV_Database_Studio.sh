#!/usr/bin/env bash
# =====================================================================
# NUSV Database Studio - Standalone Window Launcher for Linux Mint
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Find Python 3
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 tidak ditemukan di sistem Linux ini!"
    echo "Untuk menginstall, buka terminal dan jalankan:"
    echo "  sudo apt update && sudo apt install python3"
    exit 1
fi

echo "[NUSV Studio] Meluncurkan jendela editor database..."
exec "$PYTHON_CMD" "$SCRIPT_DIR/tools/launch_studio.py" "$@"

