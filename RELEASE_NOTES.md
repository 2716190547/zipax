# zipax v0.22

zipax v0.22 focuses on the public open source release, a cleaner macOS desktop shell, and a sharper tray/menu bar experience.

## Highlights

- Added an explicit MIT open source license.
- Added bilingual English/Chinese support documentation.
- Added GitHub funding metadata that points to the support page.
- Refined the Tauri macOS window with custom chrome, larger rounded corners, and cleaner window controls.
- Reworked window sizing to measure the app shell directly and avoid extra bottom spacing.
- Rebuilt the menu bar tray icon from an SVG source into sharper template assets.
- Archived the earlier native SwiftPM macOS implementation with a local git tag; active development now targets the Tauri version.

## Packages

- macOS packages can be built locally from `zipax-cross`.
- GitHub Actions builds macOS, Windows, and Linux packages when the `v0.22` tag is pushed.

## Notes

- The internal app/package version is `0.22.0`.
- The GitHub release tag is `v0.22`.
- The macOS transparent rounded window uses Tauri's `macos-private-api` feature, intended for direct GitHub distribution rather than Mac App Store submission.
