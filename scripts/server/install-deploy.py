#!/usr/bin/env python3
"""Root-only one-time installation. Supply a dedicated deployment PUBLIC key."""
import grp
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

if os.geteuid() != 0:
    raise SystemExit('Run as root')
key = Path(sys.argv[1]).read_text().strip()
if not key.startswith('ssh-ed25519 ') or '\n' in key:
    raise SystemExit('Expected one Ed25519 public key')
source = Path(__file__).parent
subprocess.run(['id', 'finway-deploy'], capture_output=True).returncode == 0 or subprocess.run(
    ['useradd', '--create-home', '--shell', '/bin/sh', 'finway-deploy'], check=True)
subprocess.run(['passwd', '-l', 'finway-deploy'], check=True, stdout=subprocess.DEVNULL)
for directory in ['/etc/finway', '/usr/local/libexec', '/var/lib/finway-deploy', '/etc/ssh/authorized_keys']:
    Path(directory).mkdir(parents=True, exist_ok=True)
Path('/etc/finway').chmod(0o700)
Path('/var/lib/finway-deploy').chmod(0o700)
shutil.copyfile(source / 'release.py', '/usr/local/sbin/finway-release')
shutil.copyfile(source / 'deploy-ssh', '/usr/local/libexec/finway-deploy-ssh')
for filename in ['/usr/local/sbin/finway-release', '/usr/local/libexec/finway-deploy-ssh']:
    Path(filename).chmod(0o755)
config = {'document_root': '/home/base/sites/techlifeacademys.pp.ua',
    'state_directory': '/var/lib/finway-deploy', 'origin_address': '192.168.31.219',
    'hostname': 'techlifeacademys.pp.ua', 'https': True, 'origin_port': 443,
    'group_id': grp.getgrnam('base').gr_gid,
    'reload_command': ['systemctl', 'reload', 'php85w-fpm@techlifeacademys.pp.ua']}
Path('/etc/finway/deploy.json').write_text(json.dumps(config, indent=2))
Path('/etc/finway/deploy.json').chmod(0o600)
Path('/etc/ssh/authorized_keys/finway-deploy').write_text('restrict,command="/usr/local/libexec/finway-deploy-ssh" ' + key + '\n')
Path('/etc/ssh/authorized_keys/finway-deploy').chmod(0o644)
Path('/etc/ssh/sshd_config.d/30-finway-deploy.conf').write_text('Match User finway-deploy\n    AuthorizedKeysFile /etc/ssh/authorized_keys/finway-deploy\n    PasswordAuthentication no\n    DisableForwarding yes\n    PermitTTY no\nMatch all\n')
Path('/etc/sudoers.d/finway-deploy').write_text('finway-deploy ALL=(root) NOPASSWD: /usr/local/sbin/finway-release deploy, /usr/local/sbin/finway-release rollback\n')
Path('/etc/sudoers.d/finway-deploy').chmod(0o440)
subprocess.run(['visudo', '-cf', '/etc/sudoers.d/finway-deploy'], check=True)
subprocess.run(['sshd', '-t'], check=True)
# Prevent the PHP account from replacing the code directory between deployments.
os.chown('/home/base/sites', 0, grp.getgrnam('base').gr_gid)
subprocess.run(['systemctl', 'reload', 'ssh'], check=True)
print('Restricted deployment account installed')
