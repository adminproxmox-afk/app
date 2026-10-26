"""Real HTTP/PHP/MySQL tests. Only a generated finway_test_* database is used."""
import contextlib
import hashlib
import http.cookiejar
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PASSWORD = "Coursework-Test-2026!"
MYSQL = [os.environ.get("MYSQL_BINARY", "mysql"), "--default-character-set=utf8mb4",
         "-h", os.environ.get("MYSQL_HOST", "127.0.0.1"),
         "-P", os.environ.get("MYSQL_PORT", "3306"),
         "-u", os.environ.get("MYSQL_USER", "root"), "-N", "-B"]


def sql(query, database=None):
    result = subprocess.run(MYSQL + ([database] if database else []), input=query,
                            text=True, capture_output=True, timeout=30)
    if result.returncode:
        raise RuntimeError("Test database command failed; verify MYSQL_* credentials and grants")
    return result.stdout.strip()


@contextlib.contextmanager
def php_server(database, temporary):
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    env = os.environ.copy()
    env.update(LCA_DB_HOST=os.environ.get("MYSQL_HOST", "127.0.0.1"),
               LCA_DB_NAME=database, LCA_DB_USER=os.environ.get("MYSQL_USER", "root"),
               LCA_DB_PASS=os.environ.get("MYSQL_PWD", ""), TMPDIR=str(temporary))
    command = [os.environ.get("PHP_BINARY", "php"), "-d", "display_errors=0",
               "-S", f"127.0.0.1:{port}", "-t", str(ROOT)]
    router = ROOT / "scripts/dev-router.php"
    if router.exists():
        command.append(str(router))
    with (temporary / (str(port) + ".log")).open("w") as log:
        process = subprocess.Popen(command, env=env, stdout=log, stderr=log, cwd=ROOT)
        try:
            for _ in range(100):
                if process.poll() is not None:
                    raise RuntimeError("Test PHP server exited")
                try:
                    with socket.create_connection(("127.0.0.1", port), timeout=.2):
                        break
                except OSError:
                    time.sleep(.05)
            else:
                raise RuntimeError("Test PHP server did not start")
            yield f"http://127.0.0.1:{port}"
        finally:
            process.terminate()
            process.wait(timeout=10)


class Client:
    def __init__(self, url):
        self.url = url
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))

    def cookie(self, name):
        return next((c.value for c in self.jar if c.name == name), "")

    def request(self, path, payload=None, csrf=True):
        headers = {"Accept": "application/json"}
        if payload is not None:
            headers["Content-Type"] = "application/json"
            if csrf:
                headers["X-CSRF-Token"] = self.cookie("lca_csrf")
        request = urllib.request.Request(self.url + path, headers=headers,
                  data=None if payload is None else json.dumps(payload).encode())
        try:
            response = self.opener.open(request, timeout=10)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            body = response.read().decode()
            try:
                data = json.loads(body)
            except ValueError:
                data = {"not_json": True}
            return response.code, data


class ApplicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.database = "finway_test_" + secrets.token_hex(6)
        assert re.fullmatch(r"finway_test_[0-9a-f]{12}", cls.database)
        cls.temporary = tempfile.TemporaryDirectory(prefix="finway-http-tests-")
        cls.tmp = Path(cls.temporary.name)
        sql(f"CREATE DATABASE `{cls.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci")
        try:
            for name in ["000_schema.sql", "001_seed_catalog.sql"]:
                source = (ROOT / "database" / name).read_text(encoding="utf-8-sig")
                if re.search(r"^\s*(USE |CREATE DATABASE|DROP DATABASE)", source, re.M | re.I):
                    raise RuntimeError("Schema/seed must not select or modify another database")
                sql(source, cls.database)
            cls.server = php_server(cls.database, cls.tmp)
            cls.url = cls.server.__enter__()
        except BaseException:
            sql(f"DROP DATABASE `{cls.database}`")
            cls.temporary.cleanup()
            raise

    @classmethod
    def tearDownClass(cls):
        cls.server.__exit__(None, None, None)
        sql(f"DROP DATABASE `{cls.database}`")
        cls.temporary.cleanup()

    def setUp(self):
        # This directory belongs to the test PHP process, never the live pool.
        rate = self.tmp / "lca-rate-limit"
        assert rate.resolve().is_relative_to(self.tmp.resolve())
        if rate.exists():
            shutil.rmtree(rate)

    def account(self):
        client = Client(self.url)
        client.request("/api/me.php")  # obtains the CSRF cookie even when unauthorized
        name = "test_" + secrets.token_hex(5)
        status, result = client.request("/api/register.php", {
            "username": name, "email": name + "@example.test", "password": PASSWORD})
        self.assertEqual(status, 201, result)
        return client, result["user"], name

    def test_registration_stores_only_password_and_session_hashes(self):
        client, user, _ = self.account()
        row = sql(f"SELECT password_hash,session_token_hash FROM users JOIN auth_sessions ON users.id=auth_sessions.user_id WHERE users.id={int(user['id'])}", self.database)
        password_hash, session_hash = row.split("\t")
        self.assertNotEqual(password_hash, PASSWORD)
        self.assertEqual(session_hash, hashlib.sha256(client.cookie("lca_session").encode()).hexdigest())
        self.assertEqual(client.request("/api/me.php")[0], 200)

    def test_unauthorized_and_invalid_csrf_are_rejected(self):
        self.assertEqual(Client(self.url).request("/api/me.php")[0], 401)
        client, _, _ = self.account()
        self.assertEqual(client.request("/api/sync-state.php", {"state": {}}, csrf=False)[0], 403)

    def test_blocked_account_loses_existing_session(self):
        client, user, _ = self.account()
        sql(f"UPDATE users SET status='blocked' WHERE id={int(user['id'])}", self.database)
        self.assertEqual(client.request("/api/me.php")[0], 401)

    def test_revoked_expired_and_deleted_accounts_are_rejected(self):
        for operation in ["revoked", "expired", "deleted"]:
            client, user, _ = self.account()
            uid = int(user["id"])
            if operation == "deleted":
                sql(f"UPDATE users SET deleted_at=NOW() WHERE id={uid}", self.database)
            else:
                value = "revoked_at=NOW()" if operation == "revoked" else "expires_at='2000-01-01 00:00:00'"
                sql(f"UPDATE auth_sessions SET {value} WHERE user_id={uid}", self.database)
            self.assertEqual(client.request("/api/me.php")[0], 401, operation)

    def test_password_change_rotates_caller_and_revokes_every_old_session(self):
        client, _, name = self.account()
        second = Client(self.url)
        second.request("/api/me.php")
        self.assertEqual(second.request("/api/login.php", {"login": name, "password": PASSWORD})[0], 200)
        old_cookie = client.cookie("lca_session")
        copied = Client(self.url)
        for cookie in client.jar:
            import copy
            copied.jar.set_cookie(copy.copy(cookie))
        new_password = PASSWORD + "-new"
        self.assertEqual(client.request("/api/change-password.php", {"currentPassword": PASSWORD, "newPassword": new_password})[0], 200)
        self.assertNotEqual(client.cookie("lca_session"), old_cookie)
        self.assertEqual(client.request("/api/me.php")[0], 200)
        self.assertEqual(second.request("/api/me.php")[0], 401)
        self.assertEqual(copied.request("/api/me.php")[0], 401)
        second.request("/api/me.php")
        self.assertEqual(second.request("/api/login.php", {"login": name, "password": PASSWORD})[0], 401)
        self.assertEqual(second.request("/api/login.php", {"login": name, "password": new_password})[0], 200)

    def test_profile_update_cannot_select_another_user(self):
        client, first, _ = self.account()
        other, second, _ = self.account()
        status, result = client.request("/api/sync-state.php", {"userId": second["id"], "state": {"profile": {"name": "Only my profile"}}})
        self.assertEqual(status, 200, result)
        self.assertEqual(result["user"]["id"], first["id"])
        self.assertNotEqual(other.request("/api/me.php")[1]["user"]["profile"]["displayName"], "Only my profile")

    def test_login_rate_limit_and_logout(self):
        client, _, name = self.account()
        self.assertEqual(client.request("/api/logout.php", {})[0], 200)
        self.assertEqual(client.request("/api/me.php")[0], 401)
        for _ in range(10):
            self.assertEqual(client.request("/api/login.php", {"login": name, "password": "incorrect"})[0], 401)
        self.assertEqual(client.request("/api/login.php", {"login": name, "password": "incorrect"})[0], 429)

    def test_readiness_checks_database_but_liveness_does_not(self):
        self.assertEqual(Client(self.url).request("/api/ready.php")[0], 200)
        with php_server(self.database + "_absent", self.tmp) as url:
            self.assertEqual(Client(url).request("/api/health.php")[0], 200)
            status, data = Client(url).request("/api/ready.php")
            self.assertEqual(status, 503, data)
            self.assertFalse(data["ok"])
            self.assertNotIn("password", json.dumps(data).lower())

    def test_private_repository_paths_are_not_served(self):
        for path in ["/database/000_schema.sql", "/tests/integration.py", "/.git/config"]:
            self.assertIn(Client(self.url).request(path)[0], [403, 404], path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
