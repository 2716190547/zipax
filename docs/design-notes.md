# zipax Design Notes

zipax is a compact native macOS compression helper. The main window is also the settings surface: manual compression lives in the image tab, folder automation in the automation tab, and small global preferences in the general tab.

## Current Scope

- Manual compression by drag, paste, or file picker.
- Folder automation for newly added files.
- JPEG, PNG, WebP, HEIC, and PDF inputs where the system or optional tools support them.
- Optional tools: `pngquant`, `cwebp`, and Ghostscript.
- Compression modes: high quality, balanced, small size, and target size.
- Workflow toggles: copy after compression and skip already compressed files.
- Appearance: follow system, light, or dark.

## Distribution

The preview DMG is ad-hoc signed and not notarized. A public release should use Developer ID signing and Apple notarization when the app is intended for broad distribution.
