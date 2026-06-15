## zipax 0.2

zipax 0.2 introduces the new cross-platform Tauri version powered by a shared Rust compression core.

### Highlights

- Added the cross-platform desktop app foundation for macOS, Windows, and Linux.
- Added Rust-based compression planning and command handling.
- Added manual image/PDF compression, folder automation, workflow options, and format conversion settings.
- Added support for JPEG, PNG, WebP, AVIF, HEIC, TIFF, and PDF workflows where available.
- Refined the settings UI with HeroUI components, compact cards, cleaner tabs, and subtle global motion.
- Improved window sizing, short-page layout, and dependency page spacing.
- Removed the visible "supported tools" list from the dependency page.
- Moved donation QR codes out of the app and linked the support page on GitHub instead.

### Notes

- GitHub Actions builds native packages for macOS, Windows, and Linux.
- Local macOS builds on Apple Silicon produce arm64 app bundles.
