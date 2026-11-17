#!/usr/bin/env python3
"""Dependency-free preview server with the repository's Vercel rewrites."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
ROOT = Path(__file__).resolve().parents[1]
REWRITES = {item['source']: item['destination'] for item in json.loads((ROOT / 'vercel.json').read_text())['rewrites']}
class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        parts = urlsplit(self.path)
        if parts.path.startswith(('/api/', '/tests/', '/scripts/')) or '/.' in parts.path:
            self.send_error(404)
            return None
        if parts.path in REWRITES:
            self.path = urlunsplit(('', '', REWRITES[parts.path], parts.query, ''))
        return super().send_head()
    def do_POST(self):
        if urlsplit(self.path).path != '/api/contact':
            self.send_error(404)
            return
        self.send_response(503)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(b'{"error":"Local preview: email delivery is not configured. Email info@antlife.one."}')
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    ThreadingHTTPServer(('0.0.0.0', args.port), partial(Handler, directory=str(ROOT))).serve_forever()
