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
mobile_background_image="${MOBILE_ARTIFACT_THEME_MOBILE_BACKGROUND_IMAGE:-}"
logo_image="${MOBILE_ARTIFACT_THEME_LOGO_IMAGE:-}"
logo_header_image="${MOBILE_ARTIFACT_THEME_LOGO_HEADER_IMAGE:-${logo_image}}"
favicon_image="${MOBILE_ARTIFACT_THEME_FAVICON_IMAGE:-${logo_image}}"
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

to_container_path() {
  local host_path="$1"
  local real_host_path
  real_host_path="$(realpath "$host_path")"

  if [[ ! -f "$real_host_path" ]]; then
    echo "Theme image does not exist on host: $real_host_path" >&2
    exit 1
  fi

  projects_dir="$(realpath "${MOBILE_ARTIFACT_PROJECTS_DIR:-$HOME/Prj}")"
  codex_dir="$(realpath "${MOBILE_ARTIFACT_CODEX_DIR:-$HOME/.codex}")"
  local container_path="$real_host_path"

  case "$real_host_path" in
    "$projects_dir"/*)
      container_path="/external/prj/${real_host_path#"$projects_dir"/}"
      ;;
    "$codex_dir"/*)
      container_path="/external/codex/${real_host_path#"$codex_dir"/}"
      ;;
  esac

  if ! docker exec "$container" test -f "$container_path"; then
    echo "Theme image is not visible in the container: $container_path" >&2
    exit 1
  fi

  printf '%s\n' "$container_path"
}

update_theming_image() {
  local key="$1"
  local container_path="$2"
  local php_code='require_once "/var/www/html/lib/base.php"; $key=$argv[1]; $path=$argv[2]; $manager=\OC::$server->get(\OCA\Theming\ImageManager::class); $mime=$manager->updateImage($key, $path); \OC::$server->get(\OCP\IConfig::class)->setAppValue("theming", $key . "Mime", $mime); echo $mime . "\n";'
  docker exec -u www-data "$container" php -r "$php_code" "$key" "$container_path"
}

set_project_background_config() {
  local config_key="$1"
  local container_path="$2"
  if [[ "$container_path" == /external/prj/* ]]; then
    occ config:app:set structuredviewer "$config_key" --value="/remote.php/dav/files/admin/Project/${container_path#/external/prj/}"
  fi
}

if [[ -n "$background_image" ]]; then
  container_image="$(to_container_path "$background_image")"
  mime="$(update_theming_image background "$container_image")"
  set_project_background_config background_image "$container_image"
  echo "Applied global background: $container_image ($mime)"
fi

if [[ -n "$mobile_background_image" ]]; then
  mobile_container_image="$(to_container_path "$mobile_background_image")"
  set_project_background_config mobile_background_image "$mobile_container_image"
  echo "Applied mobile background: $mobile_container_image"
fi

if [[ -n "$logo_image" ]]; then
  logo_container_image="$(to_container_path "$logo_image")"
  mime="$(update_theming_image logo "$logo_container_image")"
  echo "Applied Nextcloud logo: $logo_container_image ($mime)"
fi

if [[ -n "$logo_header_image" ]]; then
  logo_header_container_image="$(to_container_path "$logo_header_image")"
  mime="$(update_theming_image logoheader "$logo_header_container_image")"
  echo "Applied Nextcloud header logo: $logo_header_container_image ($mime)"
fi

if [[ -n "$favicon_image" ]]; then
  favicon_container_image="$(to_container_path "$favicon_image")"
  mime="$(update_theming_image favicon "$favicon_container_image")"
  echo "Applied Nextcloud favicon: $favicon_container_image ($mime)"
fi

echo "Applied Nextcloud global theme and structured viewer theme."
