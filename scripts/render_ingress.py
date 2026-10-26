#!/usr/bin/env python3
"""Render reviewed Apache/nftables configuration from the Cloudflare IP snapshot."""
import ipaddress
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
ips = json.loads((root / 'infra/cloudflare-ips.json').read_text())
v4 = [str(ipaddress.IPv4Network(value)) for value in ips['ipv4_cidrs']]
v6 = [str(ipaddress.IPv6Network(value)) for value in ips['ipv6_cidrs']]
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
(out / 'remoteip.conf').write_text('<IfModule remoteip_module>\n  RemoteIPHeader CF-Connecting-IP\n' +
    ''.join('  RemoteIPTrustedProxy ' + value + '\n' for value in v4 + v6) + '</IfModule>\n')
(out / 'finway-web-ingress.nft').write_text('''# Only this table is replaced; preserve database, WireGuard and Fail2ban rules.
flush table inet finway_web_ingress
table inet finway_web_ingress {
  set cloudflare4 { type ipv4_addr; flags interval; elements = { ''' + ', '.join(v4) + ''' } }
  set cloudflare6 { type ipv6_addr; flags interval; elements = { ''' + ', '.join(v6) + ''' } }
  chain input {
    type filter hook input priority -10; policy accept;
    iifname "lo" accept
    ip saddr { 192.168.31.0/24, 10.10.0.0/24 } tcp dport { 80, 443, 8000, 8002 } accept
    ip saddr @cloudflare4 tcp dport { 80, 443 } accept
    ip6 saddr @cloudflare6 tcp dport { 80, 443 } accept
    tcp dport { 80, 443, 8000, 8002 } reject with tcp reset
  }
}
''')
(out / 'finway-web-ingress.service').write_text('''[Unit]
Description=FinWay web ingress allowlist
After=network-pre.target
Before=httpd.service
[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=-/usr/sbin/nft add table inet finway_web_ingress
ExecStart=/usr/sbin/nft -f /etc/nftables.d/finway-web-ingress.nft
ExecReload=/usr/sbin/nft -f /etc/nftables.d/finway-web-ingress.nft
[Install]
WantedBy=multi-user.target
''')
