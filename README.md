# zipax

zipax is a lightweight native macOS image compression helper. It supports manual drag-and-drop compression and folder automation.

## Download

This preview build is distributed as a DMG. It is not notarized yet, so macOS may show a security warning on first launch. Use right click > Open if needed.

## Optional Dependencies

zipax bundles external tools for stronger compression:

- `pngquant`: PNG compression
- `cwebp`: WebP output
- `Ghostscript`: PDF compression

The bundled tools live in `zipax.app/Contents/Resources/Tools`.

## Updates

zipax uses Sparkle for automatic updates. The appcast is published from this repository and update archives are signed with Sparkle EdDSA signatures.

## Build

```bash
swift build
./script/build_and_run.sh --verify
./script/package_release.sh 0.1.2
```

## Support

If zipax saves you a little time, you can buy me a coffee.

<p>
  <img src="Resources/Support/alipay.png" alt="Alipay" width="220">
  <img src="Resources/Support/wechat.png" alt="WeChat Pay" width="220">
</p>
