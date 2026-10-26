#!/usr/bin/env python3
"""Root recovery rehearsal into a new database; never overwrite the live database."""
import re
import secrets
import subprocess

mysql = ['mysql', '--defaults-extra-file=/etc/mysql/codex-maintenance.cnf', '-N', '-B']
target = 'finway_test_' + secrets.token_hex(6)
assert re.fullmatch('finway_test_[0-9a-f]{12}', target)

def query(sql, database=None):
    result = subprocess.run(mysql + ([database] if database else []), input=sql,
                            capture_output=True, text=True, timeout=120)
    if result.returncode:
        raise RuntimeError('Recovery database operation failed')
    return result.stdout.strip()

dump = subprocess.run(['mysqldump', '--defaults-extra-file=/etc/mysql/codex-maintenance.cnf',
    '--single-transaction', '--hex-blob', '--set-gtid-purged=OFF', 'life_capital'], capture_output=True, timeout=120)
if dump.returncode:
    raise SystemExit('Dump failed')
source = dump.stdout.decode()
assert not re.search(r'^\s*(USE |CREATE DATABASE|DROP DATABASE)', source, re.M | re.I)
query('CREATE DATABASE `' + target + '`')
try:
    query(source, target)
    tables = query('SHOW TABLES', target).splitlines()
    for table in tables:
        assert re.fullmatch('[a-z_]+', table)
        # Exact counts can change during live use; compare stable catalogue tables,
        # and prove user/session tables can be read without exposing their rows.
        restored = query('SELECT COUNT(*) FROM `' + table + '`', target)
        if table in ('catalog_items', 'achievements'):
            assert restored == query('SELECT COUNT(*) FROM `' + table + '`', 'life_capital')
    print('PASS recovery: restored ' + str(len(tables)) + ' tables into isolated database')
finally:
    query('DROP DATABASE `' + target + '`')
