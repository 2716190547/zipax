# zipax v0.24.0

zipax v0.24.0 是一次大规模代码质量升级，重构了 Rust 后端和 React 前端架构，为后续功能迭代打下更稳定的基础。

## 更新内容

### 🦀 Rust 核心重构
- 重新划分 `zipax-core`、`zipax-cli`、`src-tauri` 三个模块的职责边界。
- 将压缩模式、输出格式、质量等级等解析规则下沉到 core，app 和 CLI 复用同一套逻辑。
- 将臃肿的 `commands.rs` 拆分为独立模块：`state`、`autostart`、`file_commands`、`watch_commands`、`tray_commands`、`compression_options`。

### 🖥️ 前端代码精简
- 将全局副作用（外观模式、语言方向、托盘同步、自动更新、启动项刷新）抽成独立 hooks。
- 统一更新检查流程，手动/自动检查共用 `useUpdateCheck`。
- 设置页拆分为多个独立组件，`GeneralView` 从 220 行精简到约 100 行。
- 手动压缩页拆分为：拖放区域、压缩队列、结果列表、操作栏。
- CSS 从单文件 1700+ 行整理为按功能分层的 `styles/` 目录。
- Zustand store 按职责分区，明确持久化字段和临时状态。
- 提取公共工具函数：`formatBytes`、`sleep`、`dispatchZipaxResize`、`safeWarn`。

### 📦 发布与更新
- GitHub Actions 全平台构建流水线（macOS / Windows / Linux）。
- 支持通过 Tauri updater 自动接收版本更新。

## 体积基准

| 项目 | 体积 |
|------|------|
| 安装后应用 | ~20.3 MB |
| release binary | ~19.4 MB |
| DMG | ~9.2 MB |
| updater tar | ~8.5 MB |

## 备注
- 内部版本号：`0.24.0`
- GitHub 发布 Tag：`v0.24.0`
