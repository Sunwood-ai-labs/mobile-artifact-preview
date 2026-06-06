<p align="center">
  <img src="https://raw.githubusercontent.com/Sunwood-ai-labs/mobile-artifact-preview/main/docs/images/release-header-v0.1.0.png" alt="mobile-artifact-preview v0.1.0 Release Notes">
</p>

<p align="center">
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview#readme"><img alt="README" src="https://img.shields.io/badge/README-English-00C2FF"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/README.ja.md"><img alt="Japanese README" src="https://img.shields.io/badge/README-日本語-FF9D2E"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/docs/releases/v0.1.0.md"><img alt="Release Notes" src="https://img.shields.io/badge/Release%20Notes-v0.1.0-7C3AED"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml"><img alt="Validate" src="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml/badge.svg"></a>
</p>

# mobile-artifact-preview v0.1.0

v0.1.0 is the first public release of `mobile-artifact-preview`: a Codex skill plus a bundled Nextcloud-based mobile preview environment for checking local agent artifacts from a phone or tablet.

This release turns the recurring problem of "the agent generated a file, but the user cannot see it on mobile" into a repeatable package: expose the artifact, return a clickable mobile link, keep the local fallback path, and verify the real preview surface.

## ✨ Highlights

- Ships the repository itself as the installable `mobile-artifact-preview` Codex skill.
- Bundles a Docker Compose Nextcloud viewer that mounts local project files as `/Project` and Codex files as `/Codex`.
- Adds structured mobile previews for JSON, XML, and trusted Markdown through the bundled `structuredviewer` app.
- Standardizes the artifact response contract: clickable mobile URL, exact local path, and proof surface.
- Includes real mobile evidence screenshots for image, HTML, SVG, Markdown, JSON, XML, and Nextcloud file-browser behavior.
- Adds the v0.1.0 release header image generated with the release text baked into the image output.

## 📦 Package And Installation

- Root-level `SKILL.md` defines the Codex skill package.
- `agents/openai.yaml` provides agent metadata.
- `scripts/install-skill.sh` installs the package into `~/.codex/skills/mobile-artifact-preview`.
- `.github/workflows/validate.yml` runs package validation on push and pull request.
- English and Japanese READMEs document the setup and mobile verification flow.

## 📱 Nextcloud Mobile Artifact Viewer

The bundled viewer under `assets/nextcloud-file-viewer/` provides the local preview surface:

- `~/Prj` is mounted into Nextcloud as `Project`.
- `~/.codex` is mounted into Nextcloud as `Codex`.
- External storage setup is idempotent, so repeated setup does not duplicate mounts.
- `filesystem_check_changes=1` keeps host-side file updates visible through Nextcloud.
- The skill prefers HTTPS/Tailscale Serve links when configured, avoiding stale LAN-only `http://192.168...` links.

## 🧩 Structured Preview App

`structuredviewer` turns agent-generated files into mobile-readable previews:

- JSON renders as a collapsible object and array tree.
- XML renders as a structured element tree.
- Markdown opens as a read-only GitHub-like preview instead of a Nextcloud Text edit session.
- Trusted Markdown can render README-style HTML blocks, badges, local images, details blocks, highlights, and simple tables.
- HTML and SVG preview behavior is documented with mobile screenshot evidence.

## 🎨 Mobile UI, Theme, And Branding

This release includes a visual polish pass for the preview environment:

- Repository header artwork and v0.1.0 release header artwork.
- Eclipse-themed desktop and mobile wallpapers.
- A global Nextcloud theme helper for app name, colors, background images, logos, favicons, and structured viewer accents.
- Translucent glass-style Nextcloud surfaces tuned for mobile readability.
- Flat, transparent, white-background, favicon, and Nextcloud logo variants.

## 🛠️ Mobile Reliability Fixes

The release incorporates fixes discovered from real phone review:

- Prevents horizontal wobble while vertically scrolling mobile previews.
- Fixes clipped Markdown headers and over-narrow folder README previews.
- Removes redundant internal preview title/file name from Markdown previews because Nextcloud already supplies viewer chrome.
- Handles README badges and linked images before bare URL auto-linking, avoiding leaked anchor attributes.
- Documents read-only Nextcloud Text conflict handling for mounted `.md` files.
- Documents the stricter MP4/video preview requirements for mobile playback and iPhone sharing.

## 🔒 Known Scope

- This is a private LAN/tailnet development preview package. Do not expose the bundled Nextcloud service publicly with default credentials.
- The Markdown renderer is intended for trusted local artifacts because it preserves selected raw HTML.
- Generated MP4/video artifacts still need a verified video-serving surface when iPhone inline playback or Photos/share-sheet behavior matters.

## ✅ Validation

Validated for this release:

```bash
./scripts/validate-package.sh
git diff --check
```

The release also includes `tmp/release-qa-v0.1.0.md`, which records the claim coverage audit, inspected evidence, and release-scope checks.

## 🔗 Links

- Repository: https://github.com/Sunwood-ai-labs/mobile-artifact-preview
- Release notes source: https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/docs/releases/v0.1.0.md
- Validation workflow: https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml
