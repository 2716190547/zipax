# PRD: zipax v0.22 Open Source Release

## Goal

Publish zipax v0.22 as a clearer open source release on GitHub, with license, support information, discoverability metadata, and installable release artifacts.

## Users

- Desktop users who want a lightweight image/PDF compression tool.
- Developers who want to inspect, build, fork, or contribute to the Tauri + Rust codebase.
- Supporters who want a simple way to sponsor ongoing maintenance.

## Scope

- Add an explicit open source license.
- Provide bilingual support documentation.
- Add GitHub funding metadata so the repository can show a Sponsor/support entry.
- Update public-facing version metadata to v0.22.
- Build installable packages from the current code.
- Publish a Git tag and GitHub Release for `v0.22`.
- Improve repository discoverability with GitHub topics.

## Release Version

- Internal app/package version: `0.22.0`
- Git tag: `v0.22`
- Release title: `zipax v0.22`

## Deliverables

- `LICENSE`: MIT license.
- `.github/FUNDING.yml`: support link metadata.
- `SUPPORT.md`: bilingual English/Chinese support page.
- `README.md`: v0.22 badges, release section, and release instructions.
- `RELEASE_NOTES.md`: concise v0.22 update notes.
- `appcast.xml`: Sparkle metadata entry for v0.22.
- Native build artifacts:
  - Local macOS app/DMG from `zipax-cross`.
  - GitHub Actions release workflow for macOS, Windows, and Linux packages.

## GitHub Actions

- Push `v0.22` tag to trigger `.github/workflows/release.yml`.
- The workflow creates a draft GitHub Release and attaches platform packages.
- If GitHub CLI authentication is available, update the release notes and upload local macOS artifacts.

## GitHub Discoverability

Recommended repository topics:

- `tauri`
- `rust`
- `react`
- `image-compression`
- `pdf-compression`
- `desktop-app`
- `macos`
- `windows`
- `linux`
- `avif`
- `webp`

## Support Feature

GitHub Sponsors enrollment cannot be completed only from repository files. The repo can still expose a support entry through `.github/FUNDING.yml`, pointing to `SUPPORT.md`. Full GitHub Sponsors setup requires the owner account to enroll through GitHub.

## Risks

- GitHub CLI authentication may be invalid and block release creation/topic editing.
- Cross-platform artifacts require GitHub Actions runners; local macOS can only build macOS artifacts.
- `macos-private-api` is enabled for transparent rounded windows, which is suitable for direct GitHub distribution but not Mac App Store submission.

## Acceptance Criteria

- Local build passes: `npm run build`, `cargo check`.
- Local macOS package builds and installs successfully.
- `v0.22` tag exists locally and is pushed if credentials allow.
- GitHub Release exists or the exact blocked step is documented.
- README and SUPPORT are readable in both English and Chinese.
