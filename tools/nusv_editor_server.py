#!/usr/bin/env python3
"""
NUSV Game Database Extended Editor Server
Starts a local web server to edit RPG Maker MV database extended properties
(Dual Accessories, Portraits, 2H Weapon Rules, Class Tiers, State Tooltips, etc.)
with automatic JSON backups.
"""

import http.server
import socket
import socketserver
import contextlib
import json
import os
import sys
import webbrowser
import datetime
from pathlib import Path

PORT = 5050
SCRIPT_DIR = Path(__file__).resolve().parent
GAME_DIR = SCRIPT_DIR.parent
DATA_DIR = GAME_DIR / "data"
PICTURES_DIR = GAME_DIR / "img" / "pictures"
BACKUP_DIR = DATA_DIR / "backups"

class NUSVEditorHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(GAME_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, HEAD")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        self.do_GET(is_head=True)

    def do_GET(self, is_head=False):
        # 0. API: Ping & Status
        if self.path.startswith("/api/ping.png"):
            # 1x1 transparent PNG bytes
            png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82'
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(png_bytes)))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            if not is_head:
                self.wfile.write(png_bytes)
            return

        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if not is_head:
                self.wfile.write(b'{"status": "ok", "message": "NUSV Database Editor Server is running"}')
            return

        # 1. API: List pictures & graphics
        if self.path == "/api/pictures" or self.path.startswith("/api/images/"):
            subfolder = "pictures"
            if self.path.startswith("/api/images/"):
                subfolder = self.path[len("/api/images/"):].strip("/")
            target_dir = GAME_DIR / "img" / subfolder
            images = []
            if target_dir.exists():
                for f in sorted(target_dir.glob("*.png")):
                    images.append(f.name)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if not is_head:
                self.wfile.write(json.dumps(images).encode("utf-8"))
            return

        # 2. API: Load data file
        if self.path.startswith("/api/data/"):
            filename = self.path[len("/api/data/"):]
            if not filename.endswith(".json"):
                filename += ".json"
            filepath = DATA_DIR / filename
            if filepath.exists() and filepath.is_file():
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                if not is_head:
                    with open(filepath, "rb") as f:
                        self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                if not is_head:
                    self.wfile.write(b'{"error": "File not found"}')
            return

        # 3. Root path serves editor.html
        if self.path in ("/", "/index.html", "/editor"):
            editor_path = GAME_DIR / "editor.html"
            if editor_path.exists():
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                if not is_head:
                    with open(editor_path, "rb") as f:
                        self.wfile.write(f.read())
                return

        # Default static file serving (relative to GAME_DIR)
        if is_head:
            return super().do_HEAD()
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/save/"):
            filename = self.path[len("/api/save/"):]
            if not filename.endswith(".json"):
                filename += ".json"
            filepath = DATA_DIR / filename

            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len)

            try:
                # Validate JSON syntax
                parsed = json.loads(body.decode("utf-8"))

                # 1. Backup existing file if present
                BACKUP_DIR.mkdir(parents=True, exist_ok=True)
                if filepath.exists():
                    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                    backup_file = BACKUP_DIR / f"{filepath.stem}_{ts}.json"
                    with open(backup_file, "wb") as bf:
                        with open(filepath, "rb") as orig:
                            bf.write(orig.read())

                # 2. Write updated JSON with clean formatting
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                resp = {"status": "ok", "message": f"{filename} saved successfully with backup."}
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                print(f"[SAVE] Saved {filename} and created backup in {BACKUP_DIR}")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err_resp = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(err_resp).encode("utf-8"))
                print(f"[ERROR] Failed to save {filename}: {e}", file=sys.stderr)
            return

        self.send_response(404)
        self.end_headers()

class DualStackServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        with contextlib.suppress(Exception):
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return super().server_bind()

def main():
    port = PORT
    for i, arg in enumerate(sys.argv):
        if arg.isdigit():
            port = int(arg)
        elif arg == "--port" and i + 1 < len(sys.argv) and sys.argv[i+1].isdigit():
            port = int(sys.argv[i+1])

    httpd = None
    actual_port = port

    for try_port in range(port, port + 20):
        try:
            # First try dual stack IPv6+IPv4
            if socket.has_ipv6:
                try:
                    DualStackServer.address_family = socket.AF_INET6
                    httpd = DualStackServer(("::", try_port), NUSVEditorHandler)
                    actual_port = try_port
                    break
                except Exception:
                    DualStackServer.address_family = socket.AF_INET
            httpd = DualStackServer(("", try_port), NUSVEditorHandler)
            actual_port = try_port
            break
        except OSError as e:
            if e.errno == 98: # Address already in use
                continue
            raise

    if not httpd:
        print(f"Error: Tidak dapat menemukan port bebas di rentang {port} - {port+20}")
        sys.exit(1)

    with httpd:
        url = f"http://localhost:{actual_port}/"
        print("=" * 60)
        print(f" NUSV DATABASE EXTENDED EDITOR SERVER RUNNING")
        print(f" URL: {url}")
        print(f" Project Directory: {GAME_DIR}")
        print(f" Data Directory: {DATA_DIR}")
        print(f" Automatic Backups: {BACKUP_DIR}")
        print(" Tekan Ctrl+C untuk menghentikan server.")
        print("=" * 60)

        if "--no-browser" not in sys.argv:
            try:
                webbrowser.open(url)
            except Exception:
                pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")

if __name__ == "__main__":
    main()

