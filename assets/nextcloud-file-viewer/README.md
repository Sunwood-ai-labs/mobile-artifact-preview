# Nextcloud File Viewer

LAN Nextcloud instance for browsing local agent files.

## Start

```bash
docker compose up -d
```

Open:

```text
http://127.0.0.1:8793/
```

Login:

```text
admin / admin
```

Mounted host folders:

- `${HOME}/Prj` -> `/external/prj` read-only
- `${HOME}/.codex` -> `/external/codex` read-only

Override those paths when needed:

```bash
MOBILE_ARTIFACT_PROJECTS_DIR=/path/to/projects \
MOBILE_ARTIFACT_CODEX_DIR=/path/to/.codex \
docker compose up -d
```

For LAN/mobile access, include the host LAN IP in trusted domains:

```bash
NEXTCLOUD_TRUSTED_DOMAINS="localhost 127.0.0.1 192.168.x.x" docker compose up -d
```

After first boot, run:

```bash
./setup-external-storage.sh
```

This enables Nextcloud external storage and registers:

- `Project` -> `/external/prj`
- `Codex` -> `/external/codex`

It also sets:

- `filesystem_check_changes=1`

This lets Nextcloud re-check mounted files when folders are accessed, so files
added from the host can appear without a full recursive scan.

If a top-level external folder shows `0 KB`, that does not necessarily mean it
is empty. Nextcloud may not have calculated the full recursive size for a large
external mount. Open the folder to confirm the contents.

For a quick manual refresh without scanning the entire project tree:

```bash
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Project' --shallow
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Codex' --shallow
```

## Structured Data Previews

The local `structuredviewer` app registers a Nextcloud Viewer handler for
JSON/XML files. It renders JSON as a collapsible object tree and XML as
formatted code.

The installed `htmlviewer` app can also render generated HTML companion
previews. Companion previews are optional now, but they are still useful as a
portable fallback outside this Nextcloud instance.

Generate companion previews:

```bash
node scripts/render-structured-previews.mjs
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Project/nextcloud-file-viewer/sample-gallery' --shallow
```

This creates:

- `render-check.json.html`
- `render-check.xml.html`

Open those `.html` files in Nextcloud to get a mobile-friendly view.

The file-list click path is wired so `.json` and `.xml` open through
`structuredviewer` even when the built-in `text` app is enabled.

## Evidence Screenshots

Browser and mobile verification screenshots are stored under:

```text
<project>/evidence
```

Open from Nextcloud:

```text
http://<host-ip>:8793/apps/files/files?dir=/Project/<project>/evidence
```

This is a LAN-only test setup. Do not expose port `8793` to the internet.
