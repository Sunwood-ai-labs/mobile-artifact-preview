<p align="center">
  <img src="https://raw.githubusercontent.com/Sunwood-ai-labs/mobile-artifact-preview/main/docs/images/release-header-v0.2.0.png" alt="mobile-artifact-preview v0.2.0 Release Notes">
</p>

<p align="center">
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview#readme"><img alt="README" src="https://img.shields.io/badge/README-English-00C2FF"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/README.ja.md"><img alt="Japanese README" src="https://img.shields.io/badge/README-日本語-FF9D2E"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/docs/releases/v0.2.0.md"><img alt="Release Notes" src="https://img.shields.io/badge/Release%20Notes-v0.2.0-7C3AED"></a>
  <a href="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml"><img alt="Validate" src="https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml/badge.svg"></a>
</p>

# mobile-artifact-preview v0.2.0

v0.2.0 is a small release focused on release presentation and social sharing assets for `mobile-artifact-preview`.

The mobile preview runtime remains the same package introduced in v0.1.0. This release makes the public release surface cleaner and more reusable: a dedicated v0.2.0 image-generated header, a social thumbnail style, and a refreshed v0.1.0 header using the same visual language.

## ✨ Highlights

- Adds a dedicated `v0.2.0` release header image with `mobile-artifact-preview` and `v0.2.0` baked into the generated image.
- Adds a reusable social thumbnail visual system for release and article sharing.
- Refreshes the existing v0.1.0 release header to match the stronger thumbnail composition.
- Keeps release typography generated in-image, with no post-generated text overlay.

## 🎨 Release Visual System

- Dark eclipse-style background.
- Cyan and amber network accents.
- Laptop and phone artifact preview surfaces.
- Large readable repository name and version text.
- Mobile-readable 16:9 composition for GitHub, note.com, and social sharing.

## 📦 Package Scope

This release does not change the Nextcloud runtime, structured viewer behavior, Docker Compose setup, or Codex skill response contract.

The existing v0.1.0 operating model remains current: return a clickable mobile-accessible link, keep the local fallback path, verify the actual preview surface when possible, and prefer the configured HTTPS Nextcloud route for phone-facing artifact links.

## ✅ Validation

Validated for this release:

```bash
./scripts/validate-package.sh
git diff --check
```

Additional checks:

- visually inspected `docs/images/release-header-v0.2.0.png`;
- confirmed the release range is `v0.1.0..HEAD`;
- verified that the shipped changes are limited to release visual assets and release documentation.

## 🧭 Known Scope

- This is a release-collateral update, not a viewer behavior release.
- Existing uncommitted logo-transparency experiment files are intentionally excluded from v0.2.0.
- The release header uses direct image-generation output with the repository name and `v0.2.0` rendered in the image.

## 🔗 Links

- Repository: https://github.com/Sunwood-ai-labs/mobile-artifact-preview
- Release notes source: https://github.com/Sunwood-ai-labs/mobile-artifact-preview/blob/main/docs/releases/v0.2.0.md
- Validation workflow: https://github.com/Sunwood-ai-labs/mobile-artifact-preview/actions/workflows/validate.yml
