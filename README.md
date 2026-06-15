<p align="center">
  <img src="Resources/AppIcon-preview.png" alt="zipax icon" width="140">
</p>

<h1 align="center">zipax</h1>

<p align="center">
  A lightweight image and PDF compression app powered by Tauri and Rust.
</p>

<p align="center">
  <img alt="release" src="https://img.shields.io/badge/release-v0.2.0-2DA44E">
  <img alt="platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-0A84FF">
  <img alt="core" src="https://img.shields.io/badge/core-Rust-DEA584">
  <img alt="desktop" src="https://img.shields.io/badge/desktop-Tauri-24C8DB">
  <img alt="license" src="https://img.shields.io/github/license/2716190547/zipax">
</p>

<p align="center">
  <a href="https://github.com/2716190547/zipax/releases">Download</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#build">Build</a>
  ·
  <a href="SUPPORT.md">请我喝一杯</a>
</p>

---

## Preview

| Light Mode | Dark Mode |
| --- | --- |
| <img src="docs/assets/zipax-light.png" alt="zipax light mode"> | <img src="docs/assets/zipax-dark.png" alt="zipax dark mode"> |

## v0.2

zipax v0.2 is the new cross-platform desktop version. It keeps the compact macOS-style workflow while moving the app shell to Tauri and the compression logic to a shared Rust core.

The v0.2 release is prepared for macOS, Windows, and Linux. Native installers are built on GitHub Actions from the same source tree.

## Features

- Manual image/PDF compression.
- Drag-and-drop, paste, and file picker entry points.
- Folder automation for newly added files.
- JPEG, PNG, WebP, AVIF, HEIC, TIFF, and PDF workflows where supported.
- Compression modes: high quality, balanced, small size, advanced, and target size.
- Workflow options: overwrite original, skip already compressed files, copy after compression, preserve metadata, and resize limits.
- Rust-based planning and compression commands shared by the desktop app and CLI.
- Compact light/dark UI with automatic content-sized desktop windows.

## Project Structure

- `zipax-cross/src`: React desktop UI.
- `zipax-cross/src-tauri`: Tauri shell and desktop commands.
- `zipax-cross/crates/zipax-core`: shared Rust compression core.
- `zipax-cross/crates/zipax-cli`: CLI entry for testing and automation.

## Build

Desktop app:

```bash
cd zipax-cross
npm ci
npm run build
npx tauri build
```

Rust core and CLI:

```bash
cd zipax-cross
cargo test
cargo run -q -p zipax-cli -- plan photo.jpg
cargo run -q -p zipax-cli -- compress photo.jpg --level 4
cargo run -q -p zipax-cli -- compress photo.jpg --output-format avif --level 4
cargo run -q -p zipax-cli -- compress photo.jpg --max-width 128 --max-height 128
cargo run -q -p zipax-cli -- compress photo.png --level 4
cargo run -q -p zipax-cli -- plan photo.png --overwrite --output-format webp
cargo run -q -p zipax-cli -- compress photo.png --output-format webp --target-size-kb 500
cargo run -q -p zipax-cli -- compress a.png b.png --output-format webp
```

## Release

Pushing a version tag builds native app packages on GitHub Actions:

```bash
git tag v0.2.0
git push origin v0.2.0
```

The release workflow creates a draft GitHub Release with macOS, Windows, and Linux artifacts attached.

## Support

If zipax saves you a little time, there is a small support page here: [请我喝一杯](SUPPORT.md).
