# Nextcloud File Viewer

Small LAN-only Nextcloud setup for browsing local agent and project files from
mobile devices.

This directory is bundled by the `mobile-artifact-preview` Codex skill package.

## Start

```bash
docker compose up -d
./setup-external-storage.sh
```

Open:

```text
http://127.0.0.1:8793/
```

Default login:

```text
admin / admin
```

## LAN Access

For access from a phone, include the host LAN IP in trusted domains before the
first boot:

```bash
NEXTCLOUD_TRUSTED_DOMAINS="localhost 127.0.0.1 192.168.x.x" \
docker compose up -d
```

Then open:

```text
http://192.168.x.x:8793/
```

## Mounted Host Folders

By default:

```text
${HOME}/Prj    -> Project
${HOME}/.codex -> Codex
```

Override:

```bash
MOBILE_ARTIFACT_PROJECTS_DIR=/path/to/projects \
MOBILE_ARTIFACT_CODEX_DIR=/path/to/.codex \
docker compose up -d
```

## External Storage Setup

`setup-external-storage.sh` enables Nextcloud external storage and registers:

```text
Project -> /external/prj
Codex   -> /external/codex
```

It also sets:

```text
filesystem_check_changes=1
```

This lets Nextcloud re-check mounted files when folders are accessed, so files
added from the host can appear without a full recursive scan.

If a top-level external folder shows `0 KB`, that does not necessarily mean it
is empty. Nextcloud may not have calculated recursive size for a large external
mount. Open the folder to confirm contents.

Manual shallow refresh:

```bash
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Project' --shallow
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Codex' --shallow
```

If you changed `NEXTCLOUD_ADMIN_USER`, replace `admin` with that username.

## Structured Viewer App

The bundled `structuredviewer` app registers a Nextcloud Viewer handler for
JSON/XML files.

- JSON renders as a collapsible object/array tree.
- XML renders as a structured element tree.
- The file-list click path is wired so `.json` and `.xml` open through
  `structuredviewer` even when the built-in `text` app is enabled.

Useful checks:

```bash
docker exec -u www-data agent-nextcloud php occ app:list | rg 'structuredviewer|htmlviewer|text|viewer|pdf'
docker exec -u www-data agent-nextcloud php occ app:enable structuredviewer
docker exec -u www-data agent-nextcloud php occ upgrade
```

## Companion HTML Previews

For portable fallback previews, generate `.json.html` and `.xml.html` companion
files:

```bash
node scripts/render-structured-previews.mjs
```

Then shallow-scan the relevant folder:

```bash
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Project/<folder>' --shallow
```

## Mobile Link Pattern

```text
http://<host-ip>:8793/apps/files/files?dir=/Project/<path-under-projects-dir>
```

## Runtime Files

Do not commit Nextcloud runtime data, generated evidence dumps, or bulky sample
outputs. Keep durable proof screenshots in the parent repository's `docs/images`
when they are useful for documentation.

## Security

This setup is for LAN-only development preview. Do not expose port `8793` to the
public internet with the default credentials.
