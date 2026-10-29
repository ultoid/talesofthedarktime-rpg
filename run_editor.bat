:; cd "$(dirname "$0")" && exec python3 tools/nusv_editor_server.py "$@"
@echo off
cd /d "%~dp0"
python tools\nusv_editor_server.py %*
pause
