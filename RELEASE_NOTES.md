# zipax v0.2

zipax 0.2 introduces the cross-platform desktop version powered by Tauri and a shared Rust compression core.

## Highlights

- Added the new cross-platform app foundation for macOS, Windows, and Linux.
- Added Rust-based compression planning and command handling.
- Added manual image/PDF compression, folder automation, workflow options, and format conversion settings.
- Added JPEG, PNG, WebP, AVIF, HEIC, TIFF, and PDF workflows where supported.
- Refined the UI with compact cards, HeroUI-based controls, cleaner tabs, and subtle global motion.
- Improved window sizing, short-page layout, and dependency page spacing.
- Removed the visible supported-tools list from the dependency page.

## Assets

- GitHub Actions builds native packages for macOS, Windows, and Linux from the `zipax-cross` Tauri app.
- Local macOS verification can still produce an Apple Silicon app bundle from `zipax-cross/target/release/bundle/macos`.

## Notes

- Windows and Linux installers are built on their target GitHub runners.
- macOS local builds on Apple Silicon produce arm64 app bundles.
