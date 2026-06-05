#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
dest_dir="$codex_home/skills/mobile-artifact-preview"

mkdir -p "$codex_home/skills"
rm -rf "$dest_dir"
mkdir -p "$dest_dir"

rsync -a \
  --exclude '.git/' \
  --exclude 'assets/nextcloud-file-viewer/data/' \
  --exclude 'assets/nextcloud-file-viewer/evidence/' \
  --exclude 'assets/nextcloud-file-viewer/sample-gallery/*.png' \
  --exclude 'assets/nextcloud-file-viewer/sample-gallery/*.pdf' \
  "$repo_dir/" "$dest_dir/"

echo "Installed mobile-artifact-preview skill to:"
echo "$dest_dir"
