# zipax v0.25.9

zipax v0.25.9 提升 Linux 兼容性与 AppImage 稳定性。

## 更新内容

- **提升 Linux 系统托盘与窗口启动兼容性**：
  - 构建时显式链接 `libayatana-appindicator3`，使 AppImage 打包时收录该依赖。
  - 为托盘图标初始化增加安全防崩溃保护（`catch_unwind`），在缺少托盘运行库的环境中优雅回退，防止主进程崩溃。
  - 启动后确保主窗口及时展现，适配沙箱测试与各类桌面环境。

---

# zipax v0.25.8

zipax v0.25.8 修复 Linux AppImage 缺少 `.DirIcon` 的问题，确保顺利收录进入 AppImage 官方目录。

## 更新内容

- **修复 AppImage 打包缺陷**：
  - 升级 `@tauri-apps/cli` 至 `2.12.1`（修复 `tauri#15596`）。
  - 解决 AppImage 打包时 `.DirIcon` 与 `.desktop` 软链接使用绝对路径导致挂载测试报错 `FATAL: .DirIcon is missing` 的问题。

---

# zipax v0.25.7

zipax v0.25.7 提升 Ghostscript 下载可靠性，并优化安装横幅布局。

## 更新内容

- **下载可靠性提升**（Windows）：
  - 多镜像回退：GitHub 官方 → gh-proxy → ghproxy 加速镜像，依次尝试。
  - 优先使用 `curl.exe`（自动重试 + 超时控制），失败回退 PowerShell（强制 TLS 1.2）。
  - 下载后校验文件大小（≥5MB），防止错误页被误判成功。
  - 失败时提供手动下载地址。
- **布局优化**：Ghostscript 安装横幅从结果列表内部提升为独立卡片，与报错项同级展示。

设计规范见 `docs/design-spec-pdf-ghostscript-ux.md`。

**v0.25.6 历史**
- 重新设计 Ghostscript 安装交互：全局安装横幅、自动重试所有受影响项、完整错误显示、i18n 化、清理死代码。

**v0.25.5 历史**
- Ghostscript 安装提示从全局弹窗改为错误卡片上的内联安装条。

**v0.25.4 历史**
- 新增 PDF 压缩一键安装：检测到 Ghostscript 缺失时自动安装。

**v0.25.3 历史**
- 修复 Windows 开机自启动失败：清除注册表路径中的 `\\?\` 前缀和尾部空格。
- 修复 Linux deb/rpm 依赖缺失：补全 `libde265-0` 依赖。
- 统一 Linux 命令行命令名为 `zipax`（此前为 `zipax-app`），与包名保持一致。
