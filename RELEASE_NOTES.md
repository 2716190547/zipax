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
