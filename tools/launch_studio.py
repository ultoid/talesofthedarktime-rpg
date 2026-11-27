#!/usr/bin/env python3
"""
NUSV Database Studio - Standalone Desktop Window Launcher
Cross-platform native window launcher for Windows and Linux Mint.

Features:
- Runs editor as an independent standalone window (no URL bar, no tabs).
- Automatically manages background Python database server.
- Supports pywebview (if installed) or native Chromium/Edge/Brave/Firefox App Mode.
- Automatically cleans up server process when window is closed.
"""

import os
import sys
import time
import shutil
import socket
import tempfile
import subprocess
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
TOOLS_DIR = ROOT_DIR / "tools"
SERVER_SCRIPT = TOOLS_DIR / "nusv_editor_server.py"
PORT = 5050
TARGET_URL = f"http://127.0.0.1:{PORT}/editor.html"
STATUS_URL = f"http://127.0.0.1:{PORT}/api/status"

def is_server_running():
    try:
        with urllib.request.urlopen(STATUS_URL, timeout=0.8) as r:
            return r.status == 200
    except Exception:
        return False

def start_server():
    if is_server_running():
        print("[Launcher] Server already active on port 5050.")
        return None

    print("[Launcher] Starting background database server...")
    # Hide console window on Windows if using pythonw or subprocess
    kwargs = {}
    if sys.platform.startswith('win'):
        # CREATE_NO_WINDOW = 0x08000000
        kwargs['creationflags'] = 0x08000000

    server_proc = subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT), "--no-browser"],
        cwd=str(ROOT_DIR),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        **kwargs
    )

    # Wait for server to become responsive
    max_wait = 5.0
    start_time = time.time()
    while time.time() - start_time < max_wait:
        if is_server_running():
            print("[Launcher] Server successfully responding.")
            return server_proc
        time.sleep(0.15)

    print("[Launcher] Warning: Server response timed out, attempting window launch anyway.")
    return server_proc

def find_browser():
    is_windows = sys.platform.startswith('win')
    is_linux = sys.platform.startswith('linux')

    if is_windows:
        candidates = [
            # Edge (Universal on Windows 10/11)
            (os.path.expandvars(r'%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe'), 'chromium'),
            (os.path.expandvars(r'%ProgramFiles%\Microsoft\Edge\Application\msedge.exe'), 'chromium'),
            # Google Chrome
            (os.path.expandvars(r'%ProgramFiles%\Google\Chrome\Application\chrome.exe'), 'chromium'),
            (os.path.expandvars(r'%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe'), 'chromium'),
            (os.path.expandvars(r'%LocalAppData%\Google\Chrome\Application\chrome.exe'), 'chromium'),
            # Brave
            (os.path.expandvars(r'%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe'), 'chromium'),
            (os.path.expandvars(r'%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe'), 'chromium'),
            # Firefox
            (os.path.expandvars(r'%ProgramFiles%\Mozilla Firefox\firefox.exe'), 'firefox'),
            (os.path.expandvars(r'%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe'), 'firefox'),
        ]
        for path, btype in candidates:
            if os.path.exists(path):
                return path, btype

    elif is_linux:
        # Standard Linux Mint / Ubuntu / Debian browsers
        linux_cmds = [
            ('google-chrome-stable', 'chromium'),
            ('google-chrome', 'chromium'),
            ('chromium-browser', 'chromium'),
            ('chromium', 'chromium'),
            ('brave-browser', 'chromium'),
            ('microsoft-edge-stable', 'chromium'),
            ('microsoft-edge', 'chromium'),
            ('firefox', 'firefox'),
        ]
        for cmd, btype in linux_cmds:
            path = shutil.which(cmd)
            if path:
                return path, btype

    return None, None

def launch_standalone_window():
    # 1. Try pywebview for 100% native desktop window if installed
    try:
        import webview
        print("[Launcher] Launching via PyWebView native window...")
        icon_path = ROOT_DIR / "icon" / "icon.png"
        window = webview.create_window(
            title="NUSV Full Database Studio",
            url=TARGET_URL,
            width=1440,
            height=900,
            min_size=(1024, 700),
            text_select=True,
            confirm_close=True
        )
        window.events.shown += window.maximize
        webview.start(private_mode=False)
        return
    except ImportError:
        pass
    except Exception as e:
        print(f"[Launcher] PyWebView failed: {e}. Falling back to browser app mode.")

    # 2. Try Chromium / Edge / Brave / Firefox App Mode
    browser_bin, btype = find_browser()
    if browser_bin:
        print(f"[Launcher] Launching standalone window via {os.path.basename(browser_bin)}...")
        
        # Dedicated profile directory so it runs as an isolated desktop app
        profile_dir = Path(tempfile.gettempdir()) / "nusv_studio_app_profile"
        profile_dir.mkdir(parents=True, exist_ok=True)

        if btype == 'chromium':
            cmd = [
                browser_bin,
                f"--app={TARGET_URL}",
                "--start-maximized",
                f"--user-data-dir={profile_dir}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-features=Translate",
                "--disable-background-networking"
            ]
        else: # firefox
            cmd = [
                browser_bin,
                "-new-window",
                TARGET_URL
            ]

        # Run and wait for window to close
        try:
            p = subprocess.run(cmd)
        except Exception as e:
            print(f"[Launcher] Failed to launch browser window: {e}")
        return

    # 3. Fallback to default system browser if no standalone binary found
    import webbrowser
    print("[Launcher] Opening in default web browser...")
    webbrowser.open(TARGET_URL)

def main():
    server_proc = start_server()
    start_time = time.time()
    try:
        launch_standalone_window()
    finally:
        elapsed = time.time() - start_time
        # Only terminate server if window was genuinely held open by the launcher (elapsed > 3.0s).
        # If it exited quickly (<3s), browser delegated/detached to an existing browser session,
        # so keep the background server running for the user!
        if server_proc and elapsed > 3.0:
            print("[Launcher] Standalone window closed. Stopping background server...")
            try:
                server_proc.terminate()
                server_proc.wait(timeout=2.0)
            except Exception:
                try:
                    server_proc.kill()
                except Exception:
                    pass
            print("[Launcher] Database Studio exited cleanly.")
        elif server_proc:
            print("[Launcher] Browser launched in detached mode. Background server kept active.")

if __name__ == '__main__':
    main()

