---
name: mobile-artifact-preview
description: Use when exposing local development artifacts to a phone or tablet, previewing Codex or agent outputs from mobile, troubleshooting LAN-accessible viewers, Nextcloud previews, file links, screenshots, generated images, HTML, SVG, JSON, XML, Markdown, PDF, or other artifacts that the user needs to visually confirm from a mobile device.
---

# Mobile Artifact Preview

## Purpose

Use this skill to make local development artifacts visible from mobile devices and to prove that they render. The deliverable is not only a local path: provide a clickable mobile-accessible link, verify the real display surface when possible, and include the exact local fallback path.

This skill supports workflows such as:

- Showing generated images, screenshots, diagrams, HTML, SVG, Markdown, JSON, XML, CSV, PDF, or draw.io exports to the user.
- Creating or repairing a LAN file viewer, Nextcloud mount, or preview plugin for local project files.
- Verifying mobile layout for generated previews or local web apps.
- Storing evidence screenshots under a project folder so the user can inspect them later.

## Core Rule

When the user asks to show, preview, display, or confirm an artifact, treat the visible mobile-checkable surface as the deliverable.

Do not stop at "file created" or a raw local path. Return:

1. A clickable link if a LAN viewer or Nextcloud route is available.
2. The local filesystem path as fallback.
3. The verification surface used, such as `view_image`, Browser screenshot, Playwright mobile viewport, WebDAV listing, or Nextcloud app check.

For images shown in chat, also call `view_image` on the exact file before saying it was displayed.

## Preferred Surfaces

Choose the narrowest surface that fits the artifact:

| Need | Preferred surface |
| --- | --- |
| Image visible in chat | `view_image` on the exact file |
| Mobile-accessible project file | Nextcloud file viewer |
| Mobile web UI or preview app | LAN URL plus mobile viewport screenshot |
| Local-only static HTML | Start or reuse a small LAN web server |
| JSON/XML structure | Structured preview or companion `.html` preview |
| Repeated screenshots/evidence | Project-local `evidence/` folder |

## Known Local Instance

For files under `/Users/admin/Prj`, prefer the current Nextcloud viewer when it is running:

```text
URL: http://192.168.11.8:8793/
Login: admin / admin
Project mount: /Users/admin/Prj -> /Project
Codex mount: /Users/admin/.codex -> /Codex
Project folder link pattern:
http://192.168.11.8:8793/apps/files/files?dir=/Project/<path-under-/Users/admin/Prj>
```

Current implementation source:

```text
/Users/admin/Prj/nextcloud-file-viewer
```

Useful checks:

```bash
cd /Users/admin/Prj/nextcloud-file-viewer
docker compose ps
docker exec -u www-data agent-nextcloud php occ app:list | rg 'structuredviewer|htmlviewer|text|viewer|pdf'
docker exec -u www-data agent-nextcloud php occ files:scan --path='admin/files/Project/<relative-folder>' --shallow
```

For a folder link under `/Users/admin/Prj/foo/bar`, return:

```text
http://192.168.11.8:8793/apps/files/files?dir=/Project/foo/bar
```

## Workflow

1. Identify the artifact path and file type.
2. If the artifact is an image intended for chat, call `view_image` on that exact path.
3. If the artifact is under `/Users/admin/Prj`, build the Nextcloud `/Project/...` link and shallow-scan the folder if new files may not be indexed.
4. If the artifact is under `/Users/admin/.codex`, build the Nextcloud `/Codex/...` link when the mount is available.
5. For HTML/SVG/JSON/XML/PDF or UI work, verify with a real browser surface. Use a mobile viewport for mobile-facing claims.
6. Put persistent proof screenshots in a nearby `evidence/` folder, then include both the evidence folder link and local path.
7. In the final response, include the clickable link first, then local path, then a short verification note.

## Mobile Verification

Use a realistic phone viewport before claiming a mobile rendering fix:

```text
390x844 or similar portrait viewport
```

Check for:

- Header content not hidden behind browser or Nextcloud viewer chrome.
- No text cut off at the left or right edge.
- No horizontal scrolling unless the file type naturally requires it.
- Buttons and close/menu controls remain reachable.
- Structured JSON/XML content expands or wraps correctly.

If the user shares a mobile screenshot showing clipping, compare against that failure mode in the next verification pass.

## Structured Data Preview

For JSON and XML in the current Nextcloud setup, use the `structuredviewer` app when available. If the browser still opens the Text app, check that the structured viewer scripts are loaded and the file-list click handler is active.

Useful checks:

```bash
docker exec -u www-data agent-nextcloud php occ app:list | rg 'structuredviewer|text'
docker exec -u www-data agent-nextcloud php occ app:enable structuredviewer
docker exec -u www-data agent-nextcloud php occ upgrade
```

If the phone appears stale, suspect cached JS/CSS. Versioned asset filenames or updated app versions may be needed before retrying.

## Common Failures

- Saying an image was shown without calling `view_image` in the same turn.
- Returning only a local path when the user needs to open it from a phone.
- Forgetting to scan a newly created Nextcloud-mounted folder.
- Verifying a mobile issue only on desktop viewport.
- Treating JSON/XML raw text display as structured preview.
- Saving evidence screenshots outside the project folder, making them hard for the user to find later.

## Response Pattern

Keep the final response short and proof-oriented:

```text
モバイル確認用リンク:
[Nextcloud sample-gallery](http://192.168.11.8:8793/apps/files/files?dir=/Project/nextcloud-file-viewer/sample-gallery)

ローカルパス:
/Users/admin/Prj/nextcloud-file-viewer/sample-gallery

確認:
390x844 のモバイル viewport で表示確認済み。JSON/XML は structuredviewer で構造化表示されています。
```
