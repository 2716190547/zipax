# zipax v0.25.4

zipax v0.25.4 新增 PDF 压缩依赖自动安装功能。

## 更新内容

- 新增 PDF 压缩一键安装：检测到 Ghostscript 缺失时，自动弹窗提供一键安装。
  - macOS：通过 Homebrew 自动安装。
  - Windows：自动下载官方安装包并静默安装。
  - Linux：通过 deb/rpm 包管理器自动依赖（apt 自动处理）。
- 代码质量改进和小修复。

**v0.25.3 历史**
- 修复 Windows 开机自启动失败：清除注册表路径中的 `\\?\\` 前缀和尾部空格。
- 修复 Linux deb/rpm 依赖缺失：补全 `libde265-0` 依赖。
- 统一 Linux 命令行命令名为 `zipax`（此前为 `zipax-app`），与包名保持一致。", "filePath": "C:\\Users\\25482\\Desktop\\zipax\\RELEASE_NOTES.md"}