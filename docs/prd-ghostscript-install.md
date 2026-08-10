# PRD: PDF 压缩依赖 — 一键安装 Ghostscript

## 背景

zipax 的 PDF 压缩依赖外部工具 **Ghostscript**。此前方案试图将 GS 打包进应用，导致安装包膨胀 50-70MB，得不偿失。  
用户希望：检测到 GS 缺失时，**一键自动安装**，安装后自动继续压缩，全程无感。

## 目标

> 用户拖入 PDF → 自动检测 GS → 弹窗「一键安装」→ 自动安装 → 安装成功自动重试压缩

全程无需用户手动下载、配置 PATH 或翻文档。

## 平台方案

| 平台 | 安装方式 | 是否需要管理员权限 |
|------|---------|-------------------|
| **macOS** | `brew install ghostscript` | 不需要（Homebrew 用户级安装）|
| **Windows** | 下载 GS 官方 exe → `/S` 静默安装 | 需要（触发 UAC）|
| **Linux** | 已通过 deb/rpm Depends 自动安装 | 需要（apt 默认需 sudo）|

### 平台详细说明

**macOS：**
- 优先尝试 `brew install ghostscript`（80%+ 开发者机器有 Homebrew）
- 若 Homebrew 不存在 → 弹窗提示手动安装（提供 brew 安装命令 + 官网链接）

**Windows：**
- 下载官方 GS 安装包（`gs10033w64.exe`，约 50MB）
- 以 `/S` 参数静默运行（GS 安装器支持静默模式）
- 触发 Windows UAC 弹窗（用户确认即可，无需输入命令）

**Linux：**
- deb/rpm 安装时自动依赖 `ghostscript` 包（已配置）
- AppImage 用户：`sudo apt install ghostscript`（可改用 `pkexec` 弹 GUI 密码框）

## 架构设计

### 后端（Rust）

新增文件：`src-tauri/src/gs_install.rs`

```rust
// install_ghostscript() — Tauri command
// 检测平台 → 执行对应安装流程 → 返回安装结果
// 安装后验证 gs --version 确认成功

// macOS: Command::new("brew").args(["install", "ghostscript"])
// Windows: 下载 exe → Command::new(path).arg("/S")
// Linux: 对非 deb/rpm 用户，pkexec apt install ghostscript
```

### 前端

**文件：`src-tauri/src/lib.rs`**

注册 `install_ghostscript` 命令。

**文件：`src/lib/tauri.ts`**

```typescript
export async function installGhostscript(): Promise<string> {
  return invoke<string>("install_ghostscript")
}
```

**文件：`src/components/GeneralSettings.tsx` 或 新建组件**

新增 `GhostscriptInstallDialog` 组件：
- 由 `CompressResponse.error` 中检测 `GhostscriptMissing` 触发
- 弹窗显示：「PDF 压缩需要 Ghostscript，是否一键安装？」
- 按钮：「一键安装」→ 调用 installGhostscript() → 显示进度
- 安装成功 → 自动重试压缩
- 安装失败 → 显示错误详情 + 手动安装指引

**文件：`src/components/CompressionSettingsEditor.tsx`（或压缩触发处）**

调用压缩后，检查返回的 error 字段，若匹配 `GhostscriptMissing` 则弹出安装对话框。

### 错误码约定

后端返回的错误字符串包含 `GhostscriptMissing` 关键词，前端据此做特殊处理：

```rust
// error.rs 已有
#[error("PDF 压缩需要系统安装 Ghostscript")]
GhostscriptMissing,
// → 前端匹配 "GhostscriptMissing" 关键词
```

## 文件变更清单

| # | 文件 | 操作 |
|---|------|------|
| 1 | `zipax-cross/src-tauri/src/gs_install.rs` | **新增** — 一键安装逻辑 |
| 2 | `zipax-cross/src-tauri/src/lib.rs` | 注册 `gs_install` 模块和命令 |
| 3 | `zipax-cross/src/lib/tauri.ts` | 新增 `installGhostscript()` API 绑定 |
| 4 | `zipax-cross/src/components/GhostscriptInstallDialog.tsx` | **新增** — 安装弹窗组件 |
| 5 | 压缩触发组件 | 检测 GS 缺失 → 弹窗 |
| 6 | `zipax-cross/src-tauri/tauri.conf.json` | 恢复 `resources: []`，保留 linux depends |
| 7 | `.github/workflows/release.yml` | 移除 GS 安装步骤 |
| 8 | `zipax-cross/scripts/vendor-tools.sh` | 保留不删（供手动构建参考） |

## 用户流程

```
用户拖入 PDF → 点击压缩
  ↓
后端检测 GS → 返回 GhostscriptMissing 错误
  ↓
前端捕获错误 → 弹出对话框
  ├── "PDF 压缩需要安装 Ghostscript"
  ├── [一键安装] → 调用 installGhostscript()
  │     ↓
  │   显示进度条 / 旋转指示器
  │     ↓
  │   安装成功 ✓ → 自动重新压缩
  │   安装失败 ✗ → 显示错误 + 手动指引
  └── [取消] → 关闭弹窗
```

## 不做的事

- 不打包 GS 进安装包（避免体积膨胀）
- 不内嵌 GS 二进制到代码仓库
- 不实现 macOS 无 brew 方案（概率低，弹窗引导即可）
- 不实现 Linux AppImage 自动安装（概率低，弹窗引导）