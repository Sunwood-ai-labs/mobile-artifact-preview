# Release QA Inventory: v0.2.0

## Scope

- Repository: `Sunwood-ai-labs/mobile-artifact-preview`
- Release type: release-collateral update
- Comparison range: `v0.1.0..HEAD`
- Previous release: `v0.1.0`
- Target release: `v0.2.0`

## Evidence Reviewed

| Area | Evidence | Status |
| --- | --- | --- |
| Comparison range | `git diff --stat v0.1.0..HEAD`, `git diff --name-status v0.1.0..HEAD` | pass |
| New v0.2.0 release header | `docs/images/release-header-v0.2.0.png`, visual inspection | pass |
| Direct image-generated source copy | `docs/images/release-header-v0.2.0-imagegen-direct.png` | pass |
| Existing v0.1.0 header refresh | `docs/images/release-header-v0.1.0.png`, `docs/images/release-header-v0.1.0-imagegen-direct.png` | pass |
| Social thumbnail visual system | `docs/images/social-thumbnail-v0.1.0.png` | pass |
| Docs-backed release notes | `docs/releases/v0.2.0.md` | pass |
| GitHub release body | `tmp/github-release-v0.2.0.md` | pass |
| Validation command | `./scripts/validate-package.sh` | pass |
| Whitespace/diff check | `git diff --check` | pass |
| Published header image URL | `https://raw.githubusercontent.com/Sunwood-ai-labs/mobile-artifact-preview/main/docs/images/release-header-v0.2.0.png` returned `HTTP 200` with `content-type: image/png` | pass |

## Claims Checked

| Release claim | Backing file or commit | Status |
| --- | --- | --- |
| v0.2.0 adds a dedicated release header image | `docs/images/release-header-v0.2.0.png` | pass |
| Header text is generated in-image, not added as a later overlay | `view_image` inspection of generated image | pass |
| v0.1.0 header was refreshed with the same visual language | `cc57c9a`, `docs/images/release-header-v0.1.0.png` | pass |
| Reusable social thumbnail visual system exists | `66dbf44`, `docs/images/social-thumbnail-v0.1.0.png` | pass |
| Viewer runtime behavior did not change in the shipped range | `git diff --name-status v0.1.0..HEAD` before v0.2.0 docs commit showed image-only changes | pass |
| Existing dirty logo-transparency experiments are excluded | `git status --short` before staging v0.2.0 release files | pass |

## Steady-State Docs Review

| Surface | Review result | Status |
| --- | --- | --- |
| `README.md` | No latest-release pointer or behavior claim needed for this collateral-only release. Runtime setup remains current. | pass |
| `README.ja.md` | Same as English README; no behavior change to sync. | pass |
| `SKILL.md` | No response contract or operational rule changed in this release. | pass |
| `assets/nextcloud-file-viewer/README.md` | No Nextcloud setup/runtime behavior changed. | pass |
| Release docs | Added `docs/releases/v0.2.0.md`. | pass |

## Commit Coverage Audit

| Commit group | Release note coverage | Status |
| --- | --- | --- |
| `66dbf44 Add v0.1.0 social thumbnail` | `Highlights`, `Release Visual System` | pass |
| `cc57c9a Use generated thumbnail as v0.1.0 header` | `Highlights`, `Release Visual System` | pass |
| v0.2.0 release collateral created in this task | `docs/releases/v0.2.0.md`, `tmp/github-release-v0.2.0.md`, v0.2.0 header images | pass |

## Commands Run

```bash
git tag --sort=-creatordate
git diff --stat v0.1.0..HEAD
git diff --name-status v0.1.0..HEAD
gh release list --limit 20
gh release view v0.1.0 --json tagName,name,publishedAt,url,targetCommitish,body
./scripts/validate-package.sh
git diff --check
git tag --list 'v0.2.0'
git ls-remote --tags origin 'v0.2.0*'
curl -I -L --max-time 20 https://raw.githubusercontent.com/Sunwood-ai-labs/mobile-artifact-preview/main/docs/images/release-header-v0.2.0.png
git rev-parse HEAD
```

## Final Validation

Release publication checks to run after the release tag is created:

```bash
gh release view v0.2.0 --json tagName,name,publishedAt,url,targetCommitish,body
```


## Notes

- This is intentionally scoped as a release-collateral update.
- The release does not claim new Nextcloud, structured viewer, Docker, or skill runtime behavior.
- Existing uncommitted logo-transparency experiment files are not part of the release.
