# Release QA Inventory: v0.1.0

## Scope

- Repository: `Sunwood-ai-labs/mobile-artifact-preview`
- Release type: initial public release notes draft
- Comparison range: full shipped history through `4a3735b Add professional white logo variant`
- Tag state at drafting time: no existing local/GitHub tag found for `v0.1.0`

## Evidence Reviewed

| Area | Evidence | Status |
| --- | --- | --- |
| Skill package | `SKILL.md`, `agents/openai.yaml`, `scripts/install-skill.sh` | pass |
| Nextcloud viewer | `assets/nextcloud-file-viewer/compose.yaml`, `setup-external-storage.sh`, README | pass |
| Structured viewer | `assets/nextcloud-file-viewer/apps/structuredviewer/appinfo/info.xml`, versioned JS/CSS assets | pass |
| Theme helper | `assets/nextcloud-file-viewer/scripts/apply-global-theme.sh` | pass |
| Docs | `README.md`, `README.ja.md`, `assets/nextcloud-file-viewer/README.md` | pass |
| Visual evidence | `docs/images/*.png` | pass |
| Validation | `./scripts/validate-package.sh` | pass |

## Claims Checked

| Release claim | Backing file or commit | Status |
| --- | --- | --- |
| Codex skill returns links, fallback paths, and proof surfaces | `SKILL.md` | pass |
| Repository root is the installable skill package | `aea7ad1`, `3eea196`, `scripts/install-skill.sh` | pass |
| Validation workflow is present | `.github/workflows/validate.yml`, `scripts/validate-package.sh` | pass |
| Project/Codex mounts are configured through Nextcloud external storage | `assets/nextcloud-file-viewer/setup-external-storage.sh` | pass |
| External storage setup is idempotent | `9acfa76`, `setup-external-storage.sh` | pass |
| JSON/XML/Markdown preview support is bundled | `apps/structuredviewer/appinfo/info.xml`, README | pass |
| HTML/SVG mobile screenshot evidence exists | `05d29cb`, `docs/images/html-preview-mobile.png`, `docs/images/svg-preview-mobile.png` | pass |
| Markdown companion preview script exists | `590a7d6`, `assets/nextcloud-file-viewer/scripts/render-markdown-preview.mjs` | pass |
| Structured companion preview script exists | `assets/nextcloud-file-viewer/scripts/render-structured-previews.mjs` | pass |
| HTTPS/Tailscale Serve link discipline is documented | `SKILL.md`, `README.md`, `README.ja.md`, `assets/nextcloud-file-viewer/README.md` | pass |
| Global Nextcloud theming helper exists | `scripts/apply-global-theme.sh` | pass |
| Appearance config and query decoding are documented/shipped | `d70faa7`, `fe667be`, README, `SKILL.md` | pass |
| Responsive desktop/mobile wallpapers are included | `7ecf5d4`, `965c42d`, `docs/images/eclipse-*.png` | pass |
| Translucent file surfaces and mobile wobble fixes are included | `16ccf24`, `174186f`, `20bd9a1` | pass |
| Evidence screenshots and logo variants exist | `docs/images/` | pass |
| v0.1.0 release header image exists and uses image-gen artwork as its visual base | `docs/images/release-header-v0.1.0.png`, `docs/images/release-header-v0.1.0-imagegen-base.png` | pass |
| Validation command passes | current run of `./scripts/validate-package.sh` | pass |

## Commit Coverage Audit

| Commit group | Release note coverage | Status |
| --- | --- | --- |
| Public package, root skill package, installer, and README polish (`1523dbc` through `3eea196`) | `Package And Installation`, `Highlights` | pass |
| Repository header artwork and mobile evidence screenshots (`5640303`, `05d29cb`) | `Highlights`, `Documentation And Evidence`, release header asset | pass |
| Skill response rule and common failure modes (`a71f74e`) | `Highlights`, `Documentation And Evidence` | pass |
| Nextcloud Text conflict and Markdown source preview work (`a0dc12d` through `bb45d34`) | `Structured Preview App`, `Mobile Reliability Fixes` | pass |
| Appearance settings, dark theme, global theming helper, wallpapers (`f8e9dc3` through `965c42d`) | `Mobile UI, Theme, And Branding` | pass |
| Glass UI and mobile file-surface fixes (`16ccf24` through `174186f`) | `Mobile UI, Theme, And Branding`, `Mobile Reliability Fixes` | pass |
| Video/iPhone Photos caveats (`6ea61c4`, `77fca10`) | `Mobile Reliability Fixes`, `Known Scope` | pass |
| README badge/folder preview fixes (`f1bae47`, `6e56857`) | `Structured Preview App`, `Mobile Reliability Fixes` | pass |
| Logo, HTTPS, and branding variants (`aa7b49b` through `4a3735b`) | `Mobile UI, Theme, And Branding`, `HTTPS Link Discipline` | pass |
| Release notes and QA artifact (`3d8d9bf`) | `Validation`, this QA inventory | pass |

## Commands Run

```bash
git tag --list --sort=creatordate
gh release list --limit 20
./scripts/validate-package.sh
git diff --check
```

## Notes

- Existing uncommitted logo-transparency experiment files were intentionally excluded from the v0.1.0 release notes commit.
- GitHub Release publication was not requested explicitly; this QA file treats `docs/releases/v0.1.0.md` as the release-note source body.

- The final release header uses an image-gen generated visual base. Exact release text and feature chips were overlaid with Pillow to avoid generated typography errors.
