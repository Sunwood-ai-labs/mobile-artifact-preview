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
| Project/Codex mounts are configured through Nextcloud external storage | `assets/nextcloud-file-viewer/setup-external-storage.sh` | pass |
| JSON/XML/Markdown preview support is bundled | `apps/structuredviewer/appinfo/info.xml`, README | pass |
| HTTPS/Tailscale Serve link discipline is documented | `SKILL.md`, `README.md`, `README.ja.md`, `assets/nextcloud-file-viewer/README.md` | pass |
| Global Nextcloud theming helper exists | `scripts/apply-global-theme.sh` | pass |
| Evidence screenshots and logo variants exist | `docs/images/` | pass |
| Validation command passes | current run of `./scripts/validate-package.sh` | pass |

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
