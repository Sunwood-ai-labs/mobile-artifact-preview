#!/usr/bin/env bash
set -euo pipefail

container="${MOBILE_ARTIFACT_NEXTCLOUD_CONTAINER:-agent-nextcloud}"
name="${MOBILE_ARTIFACT_THEME_NAME:-Mobile Artifact Preview}"
slogan="${MOBILE_ARTIFACT_THEME_SLOGAN:-Mobile proof surface for agent artifacts}"
color="${MOBILE_ARTIFACT_THEME_COLOR:-#0ea5d8}"
primary_color="${MOBILE_ARTIFACT_THEME_PRIMARY_COLOR:-#0ea5d8}"
background_color="${MOBILE_ARTIFACT_THEME_BACKGROUND_COLOR:-#070810}"
viewer_accent="${MOBILE_ARTIFACT_VIEWER_ACCENT:-#32c7f4}"
viewer_highlight="${MOBILE_ARTIFACT_VIEWER_HIGHLIGHT:-#d98545}"
background_image="${MOBILE_ARTIFACT_THEME_BACKGROUND_IMAGE:-}"
theme_user="${MOBILE_ARTIFACT_THEME_USER:-${NEXTCLOUD_ADMIN_USER:-admin}}"
sync_user_theme="${MOBILE_ARTIFACT_SYNC_USER_THEME:-1}"

if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
  echo "Nextcloud container is not running: $container" >&2
  exit 1
fi

occ() {
  docker exec -u www-data "$container" php occ "$@"
}

occ theming:config name "$name"
occ theming:config slogan "$slogan"
occ theming:config color "$color"
occ theming:config primary_color "$primary_color"
occ theming:config background_color "$background_color"

occ config:app:set structuredviewer theme --value=branded_dark
occ config:app:set structuredviewer accent --value="$viewer_accent"
occ config:app:set structuredviewer highlight --value="$viewer_highlight"

if [[ "$sync_user_theme" != "0" ]]; then
  occ user:setting "$theme_user" theming enabled-themes '["dark"]' --ignore-missing-user
  occ user:setting "$theme_user" theming background_image --delete --ignore-missing-user || true
  occ user:setting "$theme_user" theming background_color --delete --ignore-missing-user || true
  occ user:setting "$theme_user" theming primary_color --delete --ignore-missing-user || true
fi

if [[ -n "$background_image" ]]; then
  background_image="$(realpath "$background_image")"
  if [[ ! -f "$background_image" ]]; then
    echo "Background image does not exist on host: $background_image" >&2
    exit 1
  fi

  container_image="$background_image"
  projects_dir="$(realpath "${MOBILE_ARTIFACT_PROJECTS_DIR:-$HOME/Prj}")"
  codex_dir="$(realpath "${MOBILE_ARTIFACT_CODEX_DIR:-$HOME/.codex}")"

  case "$background_image" in
    "$projects_dir"/*)
      container_image="/external/prj/${background_image#"$projects_dir"/}"
      ;;
    "$codex_dir"/*)
      container_image="/external/codex/${background_image#"$codex_dir"/}"
      ;;
  esac

  if ! docker exec "$container" test -f "$container_image"; then
    echo "Background image is not visible in the container: $container_image" >&2
    exit 1
  fi

  php_code='require_once "/var/www/html/lib/base.php"; $path=$argv[1]; $key="background"; $manager=\OC::$server->get(\OCA\Theming\ImageManager::class); $mime=$manager->updateImage($key, $path); \OC::$server->get(\OCP\IConfig::class)->setAppValue("theming", $key . "Mime", $mime); echo $mime . "\n";'
  mime="$(docker exec -u www-data "$container" php -r "$php_code" "$container_image")"
  if [[ "$container_image" == /external/prj/* ]]; then
    occ config:app:set structuredviewer background_image --value="/remote.php/dav/files/admin/Project/${container_image#/external/prj/}"
  fi
  echo "Applied global background: $container_image ($mime)"
fi

echo "Applied Nextcloud global theme and structured viewer theme."
