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

## Global Appearance

Nextcloud's built-in `theming` app controls the overall UI: app name, slogan,
top-bar colors, primary color, background color, and uploaded background image.
The bundled structured viewer controls the opened-file preview surface. Use the
helper script when both layers should share the same branded dark palette:

```bash
MOBILE_ARTIFACT_THEME_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-grand-wallpaper.png" \
MOBILE_ARTIFACT_THEME_MOBILE_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-mobile-wallpaper.png" \
scripts/apply-global-theme.sh
```

Override individual values with environment variables:

```bash
MOBILE_ARTIFACT_THEME_NAME="Mobile Artifact Preview" \
MOBILE_ARTIFACT_THEME_SLOGAN="Mobile proof surface for agent artifacts" \
MOBILE_ARTIFACT_THEME_COLOR="#0ea5d8" \
MOBILE_ARTIFACT_THEME_PRIMARY_COLOR="#0ea5d8" \
MOBILE_ARTIFACT_THEME_BACKGROUND_COLOR="#070810" \
MOBILE_ARTIFACT_VIEWER_ACCENT="#32c7f4" \
MOBILE_ARTIFACT_VIEWER_HIGHLIGHT="#d98545" \
MOBILE_ARTIFACT_THEME_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-grand-wallpaper.png" \
MOBILE_ARTIFACT_THEME_MOBILE_BACKGROUND_IMAGE="$PWD/../../docs/images/eclipse-mobile-wallpaper.png" \
scripts/apply-global-theme.sh
```

The defaults are extracted from the eclipse wallpaper and adjusted for readable
mobile UI contrast: near-black eclipse background, cyan orbit primary/accent,
and warm amber corona highlights.

On Files and Viewer pages, the desktop background is used on wide screens and
the mobile background is used on narrow or portrait screens through a CSS media
query. The Nextcloud login page still uses the single global background managed
by the built-in theming app.
Files and Viewer panels use a translucent glass-style surface so the wallpaper
is visible behind the UI while preserving readable rows and controls.

By default the script also clears the configured user's personal background so
the global background is visible for the default `admin` account. Override the
user with `MOBILE_ARTIFACT_THEME_USER`, or set `MOBILE_ARTIFACT_SYNC_USER_THEME=0`
to leave personal appearance settings untouched.

Background images can also be changed in the Nextcloud admin UI under
Administration settings -> Theming, but the script keeps the setup reproducible
for mobile preview environments.

## Companion HTML Previews

For portable fallback previews, generate `.json.html` and `.xml.html` companion
files:

```bash
node scripts/render-structured-previews.mjs
```

For Markdown files that should be read from mobile without opening Nextcloud
Text, generate a read-only HTML companion:

```bash
node scripts/render-markdown-preview.mjs /path/to/article.md --output /path/to/article-preview.html
```

This renderer preserves raw HTML inside trusted Markdown, so snippets such as
`<br>`, `<mark>`, `<details>`, and simple HTML tables are rendered instead of
being escaped as plain text. Use it only for local files you trust.

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
