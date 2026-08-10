# zipax v0.25.4

zipax v0.25.4 是补丁版本，将 Ghostscript 打包进应用，修复 PDF 压缩失败问题。

## 更新内容

- 修复 PDF 压缩失败：将 Ghostscript 打包进应用资源，用户无需自行安装即可使用 PDF 压缩。
- Linux deb/rpm 自动依赖 `ghostscript` 系统包。
- 代码质量改进和小修复。

**v0.25.3 历史**
- 修复 Windows 开机自启动失败：清除注册表路径中的 `\?\` 前缀和尾部空格。
- 修复 Linux deb/rpm 依赖缺失：补全 `libde265-0` 依赖。
- 统一 Linux 命令行命令名为 `zipax`（此前为 `zipax-app`），与包名保持一致。