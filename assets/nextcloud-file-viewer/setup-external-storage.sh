#!/usr/bin/env bash
set -euo pipefail

container="${NEXTCLOUD_CONTAINER:-agent-nextcloud}"
user="${NEXTCLOUD_ADMIN_USER:-admin}"

docker exec -u www-data "$container" php occ app:enable files_external
docker exec -u www-data "$container" php occ config:system:set filesystem_check_changes --type=integer --value=1

if ! docker exec -u www-data "$container" php occ files_external:list --output=json | grep -q '"datadir":"\\/external\\/prj"'; then
  docker exec -u www-data "$container" php occ files_external:create Project local null::null -c datadir=/external/prj
fi

if ! docker exec -u www-data "$container" php occ files_external:list --output=json | grep -q '"datadir":"\\/external\\/codex"'; then
  docker exec -u www-data "$container" php occ files_external:create Codex local null::null -c datadir=/external/codex
fi

docker exec -u www-data "$container" php occ files_external:list

docker exec -u www-data "$container" php occ files:scan --path="$user/files/Project" --shallow --quiet || true
docker exec -u www-data "$container" php occ files:scan --path="$user/files/Codex" --shallow --quiet || true
