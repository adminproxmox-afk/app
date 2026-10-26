#!/usr/bin/env python3
"""Install public FinWay archives; keep the previous tree for database-free rollback."""
import argparse
import fcntl
import gzip
import http.client
import io
import json
import os
from pathlib import Path
import re
import shutil
import socket
import ssl
import subprocess
import sys
import tarfile
import tempfile
import time
import uuid

ROOT_FILES = {'.htaccess', 'index.php', 'index.html', 'login.html', 'regist.html',
              'about.html', 'privacy.html', 'terms.html'}
PUBLIC_DIRS = {'api', 'assets', 'game', 'js', 'pages', 'style'}


def allowed(name):
    parts = name.split('/')
    if any(p in ('', '.', '..') or '\\' in p for p in parts):
        return False
    if len(parts) == 1:
        return name in ROOT_FILES
    if name in {'data/app-catalog.json', 'data/community-leaderboard.json'}:
        return True
    if parts[0] not in PUBLIC_DIRS or any(p.startswith('.') for p in parts):
        return False
    if Path(name).suffix.lower() in {'.sql', '.key', '.pem', '.log', '.env'}:
        return False
    return parts[0] != 'api' or (len(parts) == 2 and name.endswith('.php'))


def unpack(stream, directory):
    compressed = stream.read(64 * 1024 * 1024 + 1)
    if len(compressed) > 64 * 1024 * 1024:
        raise ValueError('Archive exceeds compressed size limit')
    with gzip.GzipFile(fileobj=io.BytesIO(compressed)) as zipped:
        raw = zipped.read(256 * 1024 * 1024 + 1)
    if len(raw) > 256 * 1024 * 1024:
        raise ValueError('Archive exceeds expanded size limit')
    seen = set()
    manifest = None
    expanded = 0
    with tarfile.open(fileobj=io.BytesIO(raw), mode='r:') as archive:
        for member in archive:
            name = member.name
            expanded += member.size
            if (name in seen or len(seen) >= 10000 or not member.isfile()
                    or member.sparse is not None or expanded > 256 * 1024 * 1024):
                raise ValueError('Duplicate, excessive or non-regular archive entry')
            seen.add(name)
            if name != 'release.json' and not (name.startswith('public/') and allowed(name[7:])):
                raise ValueError('Forbidden archive path')
            value = archive.extractfile(member).read()
            if name == 'release.json':
                manifest = json.loads(value)
            else:
                target = directory / name[7:]
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(value)
                target.chmod(0o644)
    if not isinstance(manifest, dict) or manifest.get('application') != 'finway' or not re.fullmatch('[0-9a-f]{40}', manifest.get('commit', '')):
        raise ValueError('Missing or invalid release manifest')
    if not (directory / 'api/ready.php').is_file() or not (directory / 'index.html').is_file():
        raise ValueError('Missing application entry points')
    (directory / '.finway-release.json').write_text(json.dumps(manifest))
    return manifest['commit']


def probe(config, expected):
    class OriginHTTPS(http.client.HTTPSConnection):
        def connect(self):
            raw = socket.create_connection((config['origin_address'], config.get('origin_port', 443)), timeout=10)
            self.sock = ssl.create_default_context().wrap_socket(raw, server_hostname=config['hostname'])

    last = None
    for attempt in range(config.get('health_attempts', 6)):
        connection = None
        try:
            if config.get('https', True):
                connection = OriginHTTPS(config['hostname'], timeout=10)
            else:
                connection = http.client.HTTPConnection(config['origin_address'], config['origin_port'], timeout=10)
            connection.request('GET', '/api/ready.php', headers={'Host': config['hostname'], 'User-Agent': 'FinWayDeploy/1.0'})
            response = connection.getresponse()
            data = json.loads(response.read(65536))
            if response.status == 200 and data.get('ok') is True and data.get('release') == expected:
                return
            last = 'Readiness response does not match release'
        except (OSError, ValueError, http.client.HTTPException):
            last = 'Readiness connection failed'
        finally:
            if connection:
                connection.close()
        if attempt + 1 < config.get('health_attempts', 6):
            time.sleep(1)
    raise RuntimeError(last)


def reload_service(config):
    if config.get('reload_command'):
        subprocess.run(config['reload_command'], check=True, timeout=30, stdout=subprocess.DEVNULL)


def marker(tree):
    path = tree / '.finway-release.json'
    return json.loads(path.read_text())['commit'] if path.exists() else 'development'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', default='/etc/finway/deploy.json')
    parser.add_argument('action', choices=['deploy', 'rollback'])
    args = parser.parse_args()
    config_path = Path(args.config)
    info = config_path.lstat()
    if config_path.is_symlink() or info.st_uid != os.geteuid() or info.st_mode & 0o022:
        raise ValueError('Deployment configuration ownership or permissions are unsafe')
    config = json.loads(config_path.read_text())
    site = Path(config['document_root'])
    state = Path(config['state_directory'])
    state.mkdir(mode=0o700, parents=True, exist_ok=True)
    if state.is_symlink() or state.stat().st_uid != os.geteuid() or state.stat().st_mode & 0o077:
        raise ValueError('Unsafe deployment state directory')
    if site.is_symlink() or not site.is_dir() or site.stat().st_dev != state.stat().st_dev:
        raise ValueError('Document root must be a directory on the state filesystem')
    with (state / 'lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        previous_file = state / 'previous.json'
        staged = None
        if args.action == 'deploy':
            staged = Path(tempfile.mkdtemp(prefix='stage-', dir=state))
            try:
                expected = unpack(sys.stdin.buffer, staged)
                if 'group_id' in config:
                    for item in [staged, *staged.rglob('*')]:
                        os.chown(item, os.geteuid(), config['group_id'])
                        item.chmod(0o755 if item.is_dir() else 0o644)
            except Exception:
                shutil.rmtree(staged)
                raise
            incoming = staged
        else:
            incoming = state / json.loads(previous_file.read_text())['directory']
            if incoming.parent != state or incoming.is_symlink() or not incoming.is_dir():
                raise ValueError('Invalid rollback directory')
            expected = marker(incoming)
        saved = state / ('saved-' + uuid.uuid4().hex)
        os.rename(site, saved)
        try:
            os.rename(incoming, site)
            reload_service(config)
            probe(config, expected)
        except Exception:
            if site.exists():
                os.rename(site, state / ('failed-' + uuid.uuid4().hex))
            os.rename(saved, site)
            reload_service(config)
            probe(config, marker(site))
            raise
        temporary = state / 'previous.tmp'
        temporary.write_text(json.dumps({'directory': saved.name}))
        os.replace(temporary, previous_file)
        print(json.dumps({'ok': True, 'action': args.action, 'release': expected}))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Release failed: ' + str(error), file=sys.stderr)
        sys.exit(1)
