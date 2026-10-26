#!/usr/bin/env python3
"""Run on las: verify origin TLS, canonical host and untrusted forwarded headers."""
import http.client
import json
from pathlib import Path
import secrets
import socket
import ssl
import time

HOST = 'techlifeacademys.pp.ua'
ADDRESS = '192.168.31.219'

def request(host, path, headers=None):
    raw = socket.create_connection((ADDRESS, 443), timeout=10)
    wrapped = ssl.create_default_context().wrap_socket(raw, server_hostname=host)
    connection = http.client.HTTPConnection(host)
    connection.sock = wrapped
    connection.request('GET', path, headers={'Host': host, **(headers or {})})
    response = connection.getresponse()
    result = response.status, dict(response.getheaders()), response.read()
    connection.close()
    return result

agent = 'FinWayProxyAudit/' + secrets.token_hex(8)
status, headers, body = request(HOST, '/api/health.php', {'User-Agent': agent,
    'X-Forwarded-For': '198.51.100.89', 'CF-Connecting-IP': '198.51.100.90'})
assert status == 200, status
time.sleep(.2)
lines = Path('/etc/httpd/vhost_logs/' + HOST + '_ssl_access').read_text().splitlines()
line = next(value for value in reversed(lines) if agent in value)
assert line.split()[0] == ADDRESS, 'Forwarded header supplied the client IP'
print('PASS origin ignores forged client IP headers')
status, headers, body = request('www.' + HOST, '/api/health.php')
assert status == 308 and headers.get('Location') == 'https://' + HOST + '/api/health.php', (status, headers)
print('PASS www canonical redirect preserves path')
for path in ['/database/000_schema.sql', '/api/_bootstrap.php', '/.git/config', '/.finway-release.json']:
    assert request(HOST, path)[0] in (403, 404), path
print('PASS private files blocked')
status, headers, body = request(HOST, '/api/ready.php')
assert status == 200 and json.loads(body)['ok'] is True
print('PASS origin database readiness and verified TLS')
