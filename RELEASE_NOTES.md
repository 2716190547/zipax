# zipax v0.25.5

zipax v0.25.5 将 Ghostscript 安装提示改为错误卡片上的内联安装条。

## 更新内容

- Ghostscript 缺失时的提示从全局弹窗改为错误卡片内联安装条：
  - 检测到 PDF 压缩需要 Ghostscript 时，在报错卡片上方直接显示「一键安装」按钮。
  - macOS：通过 Homebrew 自动安装。
  - Windows：自动下载官方安装包并静默安装。
  - Linux：通过 deb/rpm 包管理器自动依赖（apt 自动处理）。
  - 安装完成后自动重试该压缩项。

**v0.25.4 历史**
- 新增 PDF 压缩一键安装：检测到 Ghostscript 缺失时自动安装。

**v0.25.3 历史**
- 修复 Windows 开机自启动失败：清除注册表路径中的 `\\?\` 前缀和尾部空格。
- 修复 Linux deb/rpm 依赖缺失：补全 `libde265-0` 依赖。
- 统一 Linux 命令行命令名为 `zipax`（此前为 `zipax-app`），与包名保持一致。
