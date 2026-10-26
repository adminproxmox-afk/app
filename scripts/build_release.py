#!/usr/bin/env python3
"""Build a public-only release from a clean Git revision."""
import argparse
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile

sys.path.insert(0, str(Path(__file__).parent / 'server'))
from release import allowed

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output')
args = parser.parse_args()
if subprocess.check_output(['git', 'status', '--porcelain'], cwd=root):
    raise SystemExit('Commit changes before building a release')
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
with tarfile.open(output, 'w:gz') as archive:
    manifest = json.dumps({'application': 'finway', 'commit': commit}).encode()
    info = tarfile.TarInfo('release.json')
    info.size = len(manifest)
    archive.addfile(info, io.BytesIO(manifest))
    for name in sorted(filter(allowed, files)):
        path = root / name
        if path.is_symlink() or not path.is_file():
            raise SystemExit('Unexpected source file: ' + name)
        archive.add(path, arcname='public/' + name, recursive=False)
print(str(output))
