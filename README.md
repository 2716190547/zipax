<p align="center">
  <img src="Resources/AppIcon-preview.png" alt="zipax icon" width="140">
</p>

<h1 align="center">zipax</h1>

<p align="center">
  <a href="#english">English</a>
  ·
  <a href="#中文">中文</a>
</p>

---

<h2 id="english">English</h2>

<p align="center">
  A lightweight image and PDF compression app powered by Tauri and Rust.
</p>

<p align="center">
  <img alt="release" src="https://img.shields.io/badge/release-v0.2.1-2DA44E">
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
  <a href="SUPPORT.md">Buy me a drink</a>
</p>

---

## Preview

| Light Mode | Dark Mode |
| --- | --- |
| <img src="docs/assets/zipax-light.png" alt="zipax light mode"> | <img src="docs/assets/zipax-dark.png" alt="zipax dark mode"> |

## v0.2.1

zipax v0.2.1 brings internationalization, theme colors, tray menu enhancements, close-to-tray background running, software update checks, AVIF output, and a polished UI. Powered by Tauri and a shared Rust compression core.

Native installers for macOS, Windows, and Linux are built on GitHub Actions from the same source tree.

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
git tag v0.2.1
git push origin v0.2.1
```

The release workflow creates a draft GitHub Release with macOS, Windows, and Linux artifacts attached.

## Support

If zipax saves you a little time, there is a small support page here: [Buy me a drink](SUPPORT.md).

---

<h2 id="中文">中文</h2>

<p align="center">
  基于 Tauri + Rust 的轻量级跨平台图像和 PDF 压缩工具。
</p>

<p align="center">
  <img alt="release" src="https://img.shields.io/badge/release-v0.2.1-2DA44E">
  <img alt="platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-0A84FF">
  <img alt="core" src="https://img.shields.io/badge/core-Rust-DEA584">
  <img alt="desktop" src="https://img.shields.io/badge/desktop-Tauri-24C8DB">
  <img alt="license" src="https://img.shields.io/github/license/2716190547/zipax">
</p>

<p align="center">
  <a href="https://github.com/2716190547/zipax/releases">下载</a>
  ·
  <a href="#功能">功能</a>
  ·
  <a href="#构建">构建</a>
  ·
  <a href="SUPPORT.md">请我喝一杯</a>
</p>

---

## 预览

| 浅色模式 | 深色模式 |
| --- | --- |
| <img src="docs/assets/zipax-light.png" alt="zipax 浅色模式"> | <img src="docs/assets/zipax-dark.png" alt="zipax 深色模式"> |

## v0.2.1

zipax v0.2.1 新增国际化多语言、主题色选择、托盘菜单增强、关闭到托盘后台运行、软件更新检查、AVIF 输出格式，并对 UI 进行了全面打磨。基于 Tauri + 共享 Rust 压缩核心构建。

macOS、Windows、Linux 原生安装包通过 GitHub Actions 从同一源码自动构建。

## 功能

- 手动图像/PDF 压缩。
- 拖放、粘贴和文件选择器入口。
- 自动监控文件夹中新增的文件并压缩。
- 支持的格式：JPEG、PNG、WebP、AVIF、HEIC、TIFF、PDF。
- 压缩模式：高质量、均衡、小文件、高级、目标大小。
- 工作流选项：覆盖原文件、跳过已压缩文件、压缩后复制、保留元数据、调整尺寸限制。
- 基于 Rust 的压缩规划和命令，桌面应用与 CLI 共享。
- 紧凑的浅色/深色界面，自动适应内容大小的桌面窗口。

## 项目结构

- `zipax-cross/src`：React 桌面 UI。
- `zipax-cross/src-tauri`：Tauri 外壳和桌面命令。
- `zipax-cross/crates/zipax-core`：共享的 Rust 压缩核心。
- `zipax-cross/crates/zipax-cli`：CLI 入口，用于测试和自动化。

## 构建

桌面应用：

```bash
cd zipax-cross
npm ci
npm run build
npx tauri build
```

Rust 核心和 CLI：

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

## 版本发布

推送版本标签即可触发 GitHub Actions 构建原生安装包：

```bash
git tag v0.2.1
git push origin v0.2.1
```

GitHub Actions 的发布工作流会自动创建包含 macOS、Windows 和 Linux 构建产物的草稿 Release。

## 支持

如果 zipax 为你节省了一点时间，欢迎通过[请我喝一杯](SUPPORT.md)页面支持我。
