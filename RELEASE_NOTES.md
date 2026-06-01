# zipax v0.1.0

Preview release for macOS 26+.

## Highlights

- Manual image compression with drag, paste, file picker, and batch save.
- Folder automation for newly added images.
- Optional PDF compression through Ghostscript.
- PNG and WebP support through optional external tools.
- Workflow options: copy output after compression and skip files marked with `#C`.
- Appearance mode: system, light, dark.

## Dependencies

Optional tools:

- `pngquant` for PNG compression.
- `cwebp` from the `webp` package for WebP output.
- `Ghostscript` for PDF compression.

Install with Homebrew:

```bash
brew install pngquant webp ghostscript
```

Alternative install channels include MacPorts, official installer packages, manual PATH installation, or future bundled binaries.

## Security Notice

This preview build is ad-hoc signed and not notarized. On another Mac, use right click > Open if Gatekeeper blocks the first launch.
