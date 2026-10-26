"""Exercise release installation and rollback through the real CLI and HTTP boundary."""
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = Path(__file__).resolve().parents[1]
HELPER = ROOT / "scripts/server/release.py"


def archive(commit, content="ready", extra=None):
    files = {"release.json": json.dumps({"application": "finway", "commit": commit}),
             "public/api/ready.php": content, "public/index.html": commit}
    files.update(extra or {})
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz") as tar:
        for name, body in files.items():
            value = body.encode()
            member = tarfile.TarInfo(name)
            member.size = len(value)
            tar.addfile(member, io.BytesIO(value))
    return output.getvalue()


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="finway-release-test-")
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.site = self.base / "site"
        (self.site / "api").mkdir(parents=True)
        (self.site / "index.html").write_text("original")
        (self.site / "api/ready.php").write_text("ready")
        (self.site / ".finway-release.json").write_text(json.dumps({"commit": "0" * 40}))
        site = self.site

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                ready = (site / "api/ready.php").read_text() == "ready"
                self.send_response(200 if ready else 503)
                self.end_headers()
                self.wfile.write(json.dumps({"ok": ready, "release": json.loads((site / ".finway-release.json").read_text())["commit"]}).encode())

            def log_message(self, *args):
                pass

        self.server = HTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.config = self.base / "deploy.json"
        self.config.write_text(json.dumps({"document_root": str(self.site),
            "state_directory": str(self.base / "state"), "origin_address": "127.0.0.1",
            "origin_port": self.server.server_port, "hostname": "localhost", "https": False,
            "reload_command": [], "health_attempts": 1}))
        self.config.chmod(0o600)

    def release(self, payload=None, action="deploy"):
        return subprocess.run([sys.executable, str(HELPER), "--config", str(self.config), action],
                              input=payload, capture_output=True, timeout=20)

    def test_install_and_explicit_rollback_restore_prior_files(self):
        result = self.release(archive("a" * 40))
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        self.assertEqual((self.site / "index.html").read_text(), "a" * 40)
        self.assertEqual(self.release(action="rollback").returncode, 0)
        self.assertEqual((self.site / "index.html").read_text(), "original")

    def test_unhealthy_release_automatically_restores_working_version(self):
        self.assertEqual(self.release(archive("a" * 40)).returncode, 0)
        result = self.release(archive("b" * 40, content="broken"))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((self.site / "index.html").read_text(), "a" * 40)

    def test_private_files_and_traversal_cannot_be_installed(self):
        self.assertEqual(self.release(archive("a" * 40)).returncode, 0)
        for name in ["public/../../outside", "public/.env", "public/config/local.json", "public/api/../evil.php"]:
            result = self.release(archive("b" * 40, extra={name: "should not be written"}))
            self.assertNotEqual(result.returncode, 0, name)
            self.assertEqual((self.site / "index.html").read_text(), "a" * 40)
        self.assertFalse((self.base / "outside").exists())

    def test_links_and_duplicate_paths_are_rejected(self):
        self.assertEqual(self.release(archive("a" * 40)).returncode, 0)
        output = io.BytesIO()
        with tarfile.open(fileobj=output, mode="w:gz") as tar:
            member = tarfile.TarInfo("public/api/link.php")
            member.type = tarfile.SYMTYPE
            member.linkname = "/etc/passwd"
            tar.addfile(member)
        self.assertNotEqual(self.release(output.getvalue()).returncode, 0)
        self.assertEqual((self.site / "index.html").read_text(), "a" * 40)
        output = io.BytesIO()
        with tarfile.open(fileobj=output, mode="w:gz") as tar:
            for _ in range(2):
                member = tarfile.TarInfo("public/index.html")
                member.size = 1
                tar.addfile(member, io.BytesIO(b"x"))
        self.assertNotEqual(self.release(output.getvalue()).returncode, 0)
        self.assertEqual((self.site / "index.html").read_text(), "a" * 40)

    def test_sparse_files_are_rejected_before_expansion(self):
        self.assertEqual(self.release(archive("a" * 40)).returncode, 0)
        output = io.BytesIO()
        with tarfile.open(fileobj=output, mode="w:gz", format=tarfile.PAX_FORMAT) as tar:
            with tarfile.open(fileobj=io.BytesIO(archive("b" * 40)), mode="r:gz") as normal:
                for member in normal:
                    tar.addfile(member, normal.extractfile(member))
            member = tarfile.TarInfo("public/assets/sparse.dat")
            member.size = 1
            member.pax_headers = {'GNU.sparse.map': '0,1', 'GNU.sparse.size': '100',
                                  'GNU.sparse.name': 'public/assets/sparse.dat'}
            tar.addfile(member, io.BytesIO(b'x'))
        result = self.release(output.getvalue())
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((self.site / "index.html").read_text(), "a" * 40)


if __name__ == "__main__":
    unittest.main(verbosity=2)
