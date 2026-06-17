# PRD: zipax v0.23.1 Auto‑Update Release Patch

## Goal

Deliver a v0.23.1 patch that finishes the auto-update release flow, fixes the release workflow signing environment, and improves the manual update check feedback.

## Users

- Existing zipax users who will receive future updates automatically.
- Users who prefer manual update checks via a UI button.
- Developers who need a reference Tauri + updater CI/CD setup.

## What's New in v0.23.1

### Manual Update Feedback

- When the user clicks "Check for updates" and no update is available, show a compact hint next to the button:
  - English: "Up to date"
  - Chinese: "已是最新版本"
- If an update is found, keep using the in-app `UpdatePrompt` banner.
- If the check fails, show a small failure hint next to the button instead of interrupting the page.

### Release Workflow Fix

- Pass updater signing secrets into the `tauri-action` build step:
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Keep these secrets configured in GitHub repository secrets; the workflow must expose them as environment variables during the Tauri build.

## What Landed in v0.23.0

### Auto‑Update (tauri-plugin-updater)
- Replaced manual Sparkle‑style fetch‑XML update checking with `tauri-plugin-updater`.
- Update endpoint: `https://github.com/2716190547/zipax/releases/latest/download/latest.json`.
- Frontend: `UpdatePrompt` banner shows available updates; download button triggers `downloadAndInstall()` then relaunch.
- Settings page: version card shows current version + "Check for updates" button; "Auto‑update" toggle.

### UI Polish
- Version card: `Tag` icon, version combined with title, rounded-rectangle button using `--radius-control`.
- Tab indicator: solid light background (`--surface`), dark gray text (`--foreground`), gradient removed.
- i18n: added `general.currentVersion`, `general.updateDownloading` keys.

### Infrastructure
- `.github/workflows/release.yml` — triggered by `v*` tags, builds macOS app, signs, creates GitHub Release (draft) + `latest.json`.
- `scripts/generate-latest-json.sh` — helper to manually produce `latest.json`.
- `.env.example` — documents required secrets (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).

## Release Version

| Field | Value |
|-------|-------|
| App version | `0.23.1` |
| Git tag | `v0.23.1` |
| Release title | `zipax v0.23.1` |
| Release type | Draft (manual publish) |

## v0.23 Release Blockage Summary

The `v0.23` push triggered GitHub Actions, but the release jobs failed after the application bundles were built. The relevant error was:

```text
A public key has been found, but no private key.
Make sure to set `TAURI_SIGNING_PRIVATE_KEY` environment variable.
```

What happened:

- The updater public key was configured in `tauri.conf.json`.
- GitHub repository secrets existed for the signing key and password.
- The workflow did not pass those secrets into the `tauri-apps/tauri-action` step.
- Because `createUpdaterArtifacts` was enabled, Tauri required the private key to sign updater artifacts and failed the build.

Resolution in v0.23.1:

- Add both signing secrets to the `env` block of the tag and manual release steps.
- Publish a new patch tag instead of reusing `v0.23`, because tags are immutable release points and the failed runs are already attached to that tag.

## Release Process

```
┌─────────────────────────────────────────────────────────┐
│  1. Update version: 0.23.0 → 0.23.1                    │
│     - package.json                                      │
│     - Cargo.toml (workspace root)                       │
│     - src-tauri/tauri.conf.json                         │
├─────────────────────────────────────────────────────────┤
│  2. Commit all changes & push to main                   │
├─────────────────────────────────────────────────────────┤
│  3. git tag v0.23.1                                     │
│     git push origin v0.23.1                             │
├─────────────────────────────────────────────────────────┤
│  4. GitHub Actions: release.yml triggers                │
│     - Build frontend (npm run build)                    │
│     - Build Tauri app (macOS, --bundles app)            │
│     - Sign with TAURI_SIGNING_PRIVATE_KEY               │
│     - Create GitHub Release (draft)                     │
│     - Attach .app.tar.gz + .sig + latest.json           │
├─────────────────────────────────────────────────────────┤
│  5. Manual: publish draft release on GitHub             │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites (GitHub Secrets)

| Secret | Value |
|--------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | Content of `~/.tauri/zipax.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | `zipax-update-key` |

### Configuration (via GitHub CLI)

```bash
# Set signing private key
cat ~/.tauri/zipax.key | gh secret set TAURI_SIGNING_PRIVATE_KEY --repo 2716190547/zipax

# Set signing password  
echo -n "zipax-update-key" | gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo 2716190547/zipax

# Verify
gh secret list --repo 2716190547/zipax
```

## Deliverables

- `zipax.app.tar.gz` — updater bundle (macOS)
- `zipax.app.tar.gz.sig` — Ed25519 signature
- `latest.json` — updater manifest (generated by tauri-action `includeUpdaterJson: true`)
- GitHub Release draft with the above artifacts

## Risks

- DMG bundling is skipped (`--bundles app`) due to a pre‑existing `bundle_dmg.sh` script bug — does not affect the updater flow.
- Only macOS build is enabled in the workflow; Windows/Linux matrix entries are commented out.
- If GitHub Actions secrets are missing, signing will fail and the workflow will error.

## Acceptance Criteria

- [ ] `npm run build` passes locally.
- [ ] `npx tauri build --bundles app` succeeds locally with signing key.
- [ ] App installs and launches from `~/Applications/zipax.app`.
- [ ] "Current version v0.23.1" displays correctly in Settings → General.
- [ ] "Check for updates" button initiates update check (returns "latest" or shows banner).
- [ ] When the current build is latest, the button-side hint says "已是最新版本" in Simplified Chinese.
- [ ] Auto‑update toggle persists its state.
- [ ] `git tag v0.23.1` pushed → GitHub Actions starts.
- [ ] Release draft created on GitHub with `.tar.gz`, `.sig`, `latest.json`.
