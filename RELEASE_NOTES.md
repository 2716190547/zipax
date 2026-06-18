# zipax v0.24.0

zipax v0.24.0 is a major code quality release that restructures both the Rust backend and the React frontend for better maintainability.

## Highlights

### Rust Core Restructuring
- Reorganized workspace into clear `zipax-core`, `zipax-cli`, `src-tauri` boundary.
- Extracted shared DTO parsing (`CompressionMode::from_key`, `OutputFormat::from_key`, `QualityLevel::from_u8`) into core for app/CLI reuse.
- Split monolithic `commands.rs` into focused modules: `state.rs`, `autostart.rs`, `file_commands.rs`, `watch_commands.rs`, `tray_commands.rs`, `compression_options.rs`.
- Added build size measurement script (`scripts/measure-build-size.sh`).

### Frontend Code Simplification
- Extracted global side effects into dedicated hooks (`useAppearanceMode`, `useDocumentLocale`, `useTraySync`, `useAutoUpdateCheck`, `useAutostartRefresh`).
- Unified update check flow with `useUpdateCheck`.
- Split `GeneralView` settings page into focused setting components.
- Layered `ManualCompression` into input zone, compression queue, result list, and action bar.
- Organized global CSS into structured `styles/` directory.
- Clarified Zustand store with typed slices and proper partialize.
- Extracted utility functions (`formatBytes`, `sleep`, `dispatchZipaxResize`, `safeWarn`).

### Cross-Platform Release
- Full CI/CD release workflow via GitHub Actions (macOS, Windows, Linux).
- Auto-update support via `tauri-plugin-updater`.

## Notes
- Internal app/package version: `0.24.0`.
- GitHub release tag: `v0.24.0`.
