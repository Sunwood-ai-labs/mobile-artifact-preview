# Mobile Artifact Preview

Codex skill and LAN viewer package for checking local development artifacts from
mobile devices.

The goal is simple: when an agent creates an image, screenshot, HTML page, SVG,
JSON, XML, PDF, draw.io export, or report, the user should get a mobile-openable
link and a verified preview surface instead of only a local file path.

## Contents

```text
skill/
  SKILL.md
  agents/openai.yaml

assets/nextcloud-file-viewer/
  compose.yaml
  setup-external-storage.sh
  apps/structuredviewer/
  scripts/render-structured-previews.mjs
```

## Install the Skill

```bash
./scripts/install-skill.sh
```

This copies `skill/` to:

```text
~/.codex/skills/mobile-artifact-preview
```

## Start the Nextcloud Viewer

```bash
cd assets/nextcloud-file-viewer
docker compose up -d
./setup-external-storage.sh
```

Default URL:

```text
http://127.0.0.1:8793/
```

Default login:

```text
admin / admin
```

For LAN/mobile access, open the same port through the host LAN IP, for example:

```text
http://192.168.x.x:8793/
```

## What It Mounts

The bundled Compose file mounts these host folders into Nextcloud as read-only
external storage:

```text
~/Prj      -> Project
~/.codex   -> Codex
```

This matches the intended Codex workflow: project artifacts and Codex-generated
files are visible from a phone without copying them manually.

## Structured Previews

The bundled `structuredviewer` Nextcloud app improves JSON and XML previews:

- JSON opens as a collapsible object/array tree.
- XML opens as a structured element tree.
- HTML and SVG can be viewed through the regular Nextcloud preview/viewer stack.

## Artifact Links

For a file or folder under `~/Prj`, the mobile Nextcloud route is:

```text
http://<host-ip>:8793/apps/files/files?dir=/Project/<path-under-Prj>
```

Example:

```text
http://192.168.11.8:8793/apps/files/files?dir=/Project/nextcloud-file-viewer/sample-gallery
```

## Verification Rule

The skill is designed to make Codex report proof, not just paths:

- clickable mobile-accessible link
- local fallback path
- display verification surface, such as chat image display, browser screenshot,
  mobile viewport check, WebDAV listing, or Nextcloud app status

## Security

This package is for LAN-only development preview. Do not expose the Nextcloud
port to the public internet with the default credentials.
