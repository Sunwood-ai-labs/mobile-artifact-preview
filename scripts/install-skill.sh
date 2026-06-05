#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codex_home="${CODEX_HOME:-$HOME/.codex}"
dest_dir="$codex_home/skills/mobile-artifact-preview"

mkdir -p "$codex_home/skills"
rm -rf "$dest_dir"
mkdir -p "$dest_dir"

cp -R "$repo_dir/skill/." "$dest_dir/"

echo "Installed mobile-artifact-preview skill to:"
echo "$dest_dir"
