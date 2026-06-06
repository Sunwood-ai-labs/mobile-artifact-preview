# Mobile Artifact Preview

[日本語 README](README.ja.md)

<p align="center">
  <img src="docs/images/repository-header.png" alt="Mobile Artifact Preview repository header" width="100%">
</p>

[![Validate](https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml/badge.svg)](https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Codex skill plus a small Nextcloud-based LAN viewer for checking local
development artifacts from a phone or tablet.

When an agent creates an image, screenshot, HTML page, SVG, JSON, XML, PDF,
draw.io export, or report, this package helps Codex return a mobile-openable
link, a local fallback path, and proof that the artifact actually renders.

## What This Solves

Codex and other agents often create useful files that are hard to inspect from
mobile chat alone. This package turns local project files into a mobile-friendly
preview surface:

- `~/Prj` is mounted as `Project`.
- `~/.codex` is mounted as `Codex`.
- JSON and XML get structured mobile previews.
- HTML, SVG, Markdown, images, and PDFs can be opened through Nextcloud.
- The skill tells Codex to return links and verification evidence, not only
  local file paths.

## Evidence

These screenshots are intentionally included because they document the real
mobile surfaces this repo is built around.

| Mobile file gallery | JSON structure | XML structure |
| --- | --- | --- |
| ![Nextcloud sample gallery on mobile](docs/images/sample-gallery-mobile.png) | ![JSON structured preview on mobile](docs/images/json-preview-mobile.png) | ![XML structured preview on mobile](docs/images/xml-preview-mobile.png) |

| HTML preview | SVG preview |
| --- | --- |
| ![HTML preview on mobile](docs/images/html-preview-mobile.png) | ![SVG preview on mobile](docs/images/svg-preview-mobile.png) |

## Repository Layout

```text
SKILL.md
agents/openai.yaml

assets/nextcloud-file-viewer/
  compose.yaml
  setup-external-storage.sh
  apps/structuredviewer/
  scripts/render-structured-previews.mjs

docs/images/
  selected mobile verification screenshots
```

Runtime data, full evidence dumps, and generated sample binaries are excluded
from the repository. Only the small screenshots that explain the package are
kept.

## Install the Skill

```bash
./scripts/install-skill.sh
```

This installs this repository as a skill to:

```text
~/.codex/skills/mobile-artifact-preview
```

After that, invoke it explicitly with:

```text
$mobile-artifact-preview
```

## Start the Nextcloud Viewer

```bash
cd assets/nextcloud-file-viewer
docker compose up -d
./setup-external-storage.sh
```

Default local URL:

```text
http://127.0.0.1:8793/
```

Default login:

```text
admin / admin
```

For LAN/mobile access, include the host LAN IP in trusted domains:

```bash
NEXTCLOUD_TRUSTED_DOMAINS="localhost 127.0.0.1 192.168.x.x" \
docker compose up -d
```

Then open:

```text
http://192.168.x.x:8793/
```

## Configuration

Override the mounted folders:

```bash
MOBILE_ARTIFACT_PROJECTS_DIR=/path/to/projects \
MOBILE_ARTIFACT_CODEX_DIR=/path/to/.codex \
docker compose up -d
```

Override the published port:

```bash
MOBILE_ARTIFACT_NEXTCLOUD_PORT=8893 docker compose up -d
```

Override the initial Nextcloud admin account:

```bash
NEXTCLOUD_ADMIN_USER=admin \
NEXTCLOUD_ADMIN_PASSWORD='change-me' \
docker compose up -d
```

If you change `NEXTCLOUD_ADMIN_USER`, pass the same value when running
`setup-external-storage.sh`.

Configure the structured Markdown preview appearance:

```bash
docker exec -u www-data agent-nextcloud php occ config:app:set structuredviewer theme --value=branded_dark
docker exec -u www-data agent-nextcloud php occ config:app:set structuredviewer background_image --value='https://example.local/background.png'
docker exec -u www-data agent-nextcloud php occ config:app:set structuredviewer accent --value='#32c7f4'
docker exec -u www-data agent-nextcloud php occ config:app:set structuredviewer highlight --value='#d98545'
```

Use an empty value or `none` for `background_image` to remove the custom
background. For a one-off preview, add URL parameters such as:

```text
?sv_bg=https%3A%2F%2Fexample.local%2Fbackground.png&sv_accent=%235ce1ff
```

To align the overall Nextcloud UI with the same dark branded appearance, apply
the global theming helper:

```bash
cd assets/nextcloud-file-viewer
MOBILE_ARTIFACT_THEME_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-grand-wallpaper.png" \
MOBILE_ARTIFACT_THEME_MOBILE_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-mobile-wallpaper.png" \
scripts/apply-global-theme.sh
```

The helper configures the Nextcloud `theming` app for the app name, slogan,
primary color, background color, and uploaded background image. It also aligns
the structured viewer accent/highlight colors. By default it clears the default
`admin` user's personal background so the global background is visible; set
`MOBILE_ARTIFACT_SYNC_USER_THEME=0` to preserve personal appearance settings.
For Files and Viewer pages, `MOBILE_ARTIFACT_THEME_BACKGROUND_IMAGE` is used on
desktop/wide screens and `MOBILE_ARTIFACT_THEME_MOBILE_BACKGROUND_IMAGE` is used
on portrait or narrow mobile screens.
Those pages also use a translucent glass-style Files UI so the wallpaper remains
visible without sacrificing file-list readability.

The default custom palette is extracted from the eclipse wallpaper and adjusted
for readable UI contrast:

```text
background: #070810
primary:    #0ea5d8
accent:     #32c7f4
highlight:  #d98545
```

## Mobile Link Pattern

For a project folder under `~/Prj`, use:

```text
http://<host-ip>:8793/apps/files/files?dir=/Project/<path-under-Prj>
```

Example:

```text
http://192.168.x.x:8793/apps/files/files?dir=/Project/nextcloud-file-viewer/sample-gallery
```

## Verification

Run these checks after setup or package changes:

```bash
./scripts/validate-package.sh
```

When testing real mobile rendering, use a phone-sized viewport such as
`390x844` and check for clipped headers, off-screen content, unreachable
buttons, and JSON/XML structure rendering.

## Security

This is a LAN-only development preview package. Do not expose the Nextcloud
port to the public internet with default credentials.
