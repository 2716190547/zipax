# zipax v0.23.1

zipax v0.23.1 is a follow-up patch for the new Tauri updater release flow.

## Highlights

- Added an inline "up to date" hint next to the manual update check button.
- Kept update checks inside the app UI instead of using blocking system dialogs.
- Fixed the GitHub Actions release workflow so Tauri updater signing secrets are passed into `tauri-action`.
- Documented the v0.23 release blockage: the repository secrets existed, but the workflow did not expose `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` to the build step.

## Notes

- Internal app/package version: `0.23.1`.
- GitHub release tag: `v0.23.1`.
- Updater builds rely on GitHub Secrets:
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
