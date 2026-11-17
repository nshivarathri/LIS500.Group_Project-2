from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import re
from urllib.parse import urlsplit


class PreviewHandler(SimpleHTTPRequestHandler):
    def do_HEAD(self):
        path = urlsplit(self.path).path
        if path.endswith(".mp4"):
            file_path = self.translate_path(path)
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                self.send_response(200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Length", str(size))
                self.end_headers()
                return
        super().do_HEAD()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path.startswith("/oscbunny-source/") or path.startswith("/tools/"):
            self.send_error(404)
            return
        if path.endswith(".mp4"):
            file_path = self.translate_path(path)
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                range_header = self.headers.get("Range")
                start = 0
                end = size - 1
                if range_header:
                    match = re.match(r"bytes=(\d*)-(\d*)", range_header)
                    if match:
                        if match.group(1):
                            start = int(match.group(1))
                        if match.group(2):
                            end = int(match.group(2))
                        end = min(end, size - 1)
                if start >= size:
                    self.send_error(416)
                    return
                length = end - start + 1
                self.send_response(206 if range_header else 200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Length", str(length))
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
                self.end_headers()
                with open(file_path, "rb") as video:
                    video.seek(start)
                    remaining = length
                    while remaining:
                        chunk = video.read(min(1024 * 1024, remaining))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        remaining -= len(chunk)
                return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


ThreadingHTTPServer(("127.0.0.1", 4173), PreviewHandler).serve_forever()
