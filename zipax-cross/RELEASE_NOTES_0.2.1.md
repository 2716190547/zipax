## zipax 0.2.1

### New Features

- **Internationalization (i18n)**: Full multi-language support with 10 languages — English, Simplified/Traditional Chinese, Spanish, Arabic, Indonesian, Portuguese (Brazil), French, Japanese, and Korean. A `useI18n()` hook provides keyed translations throughout the UI.
- **Theme color picker**: 7 accent colors — blue, emerald, violet, amber, rose, slate, and claude — for both light and dark mode.
- **System tray menu enhancements**: Tray now shows compression statistics, "Check for updates" toggle, and "Folder automation" toggle. Changes sync bidirectionally with the frontend.
- **Close to tray**: Closing the main window can now hide it to the system tray instead of quitting. The app continues running in the background.
- **Software update check**: Automatic and manual update checks against GitHub Releases. Prompts users when a new version is available.
- **AVIF output format**: Added AVIF support to the available output formats.

### UI Improvements

- Redesigned compression result list with status icons, detail texts, and refined action buttons.
- Tab bar selected state now uses a gradient background effect.
- Settings panel cards, selectors, and switches polished for consistency.
- Drop zone uses translated text from the i18n system.

### Technical Improvements

- Added `preparing` state to compression items — items appear immediately on paste/drop while temporary files are being saved.
- Clipboard and drag-and-drop error handling now shows error status with retry support.
- Minimum 650ms loading animation to prevent UI flicker on fast compressions.
- Auto-window-sizing concurrency fix with max-width cap and height constraints.
- ResizeObserver loop error suppression to prevent spurious boot error screens.
- New tray icon images with proper macOS dark/light mode support.
- Rust CLI binary (`zipax-cli`) is now bundled into the app bundle.

### Changes

- Full UI text migration from hardcoded Chinese to i18n translation keys.
- README now includes both English and Chinese sections with language toggle.

---

## zipax 0.2.1

### 新功能

- **国际化 (i18n)**：全新多语言支持，内置 10 种语言——简体中文、繁体中文、英文、西班牙语、阿拉伯语、印度尼西亚语、葡萄牙语（巴西）、法语、日语、韩语。通过 `useI18n()` 钩子实现全 UI 文本翻译。
- **主题色选择器**：7 种强调色——蓝色、翡翠绿、紫色、琥珀色、玫瑰红、石板灰、Claude，同时支持浅色和深色模式。
- **托盘菜单增强**：系统托盘新增压缩统计、自动检查更新开关、文件夹自动压缩开关，状态与前端双向同步。
- **关闭到托盘**：关闭主窗口时可隐藏到系统托盘而非退出，应用在后台继续运行。
- **软件更新检查**：支持自动和手动检查 GitHub Releases 更新，发现新版本时提示用户。
- **AVIF 输出格式**：输出格式列表中新增 AVIF 支持。

### UI 改进

- 全新的压缩结果列表设计：状态图标、详情文字、优化的操作按钮。
- 标签栏选中状态使用渐变背景效果。
- 设置面板卡片、选择器和开关的样式一致性打磨。
- 拖放区域使用 i18n 翻译文本。

### 技术改进

- 压缩项新增 `preparing`（准备中）状态——粘贴/拖入文件后立即显示，同时后台保存临时文件。
- 剪贴板和拖放操作现在支持错误状态和重试。
- 最小 650ms 加载动画，防止快速压缩时界面闪烁。
- 自动窗口大小调整增加并发保护和宽度/高度约束。
- 抑制 ResizeObserver 循环错误，防止启动时出现错误页面。
- 新的托盘图标，支持 macOS 浅色/深色模式。
- Rust CLI 二进制文件 (`zipax-cli`) 现在打包进应用包内。

### 变更

- 所有 UI 文本从硬编码中文迁移至 i18n 翻译键。
- README 增加中英文双语内容和语言切换。
