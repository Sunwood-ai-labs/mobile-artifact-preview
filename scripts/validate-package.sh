#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

python3 - <<'PY'
from pathlib import Path
import sys

text = Path("SKILL.md").read_text(encoding="utf-8")
required = [
    "---",
    "name: mobile-artifact-preview",
    "description:",
    "# Mobile Artifact Preview",
]
missing = [item for item in required if item not in text]
if missing:
    print("Missing required skill content:", missing)
    sys.exit(1)
if "[TODO" in text:
    print("Skill still contains TODO markers")
    sys.exit(1)
print("skill metadata ok")
PY

docker compose -f "$repo_dir/assets/nextcloud-file-viewer/compose.yaml" config >/dev/null

test ! -d "$repo_dir/assets/nextcloud-file-viewer/data"
test ! -d "$repo_dir/assets/nextcloud-file-viewer/evidence"

find "$repo_dir/docs/images" -maxdepth 1 -type f -name '*.png' -print
