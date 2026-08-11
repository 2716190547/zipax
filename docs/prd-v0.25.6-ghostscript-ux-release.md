# PRD: zipax v0.25.6 Ghostscript 安装 UX 优化发布

## 目标

发布 v0.25.6，交付 Ghostscript 安装交互的重设计（依据 `docs/design-spec-pdf-ghostscript-ux.md`），并完成版本推进、构建与文档同步。

## 背景

v0.25.5 中 PDF 压缩依赖安装条内嵌于每个错误卡片，存在多卡片重复、状态混乱、文案硬编码、错误截断等体验问题。v0.25.6 依据设计规范完成重构。

## 更新内容

1. **全局 Ghostscript 安装横幅**（`ManualCompressionParts.tsx`）
   - 移除每行错误卡片内的内联安装条
   - 结果列表顶部渲染单一 `GhostscriptInstallBanner`，全局共享状态机 `idle → installing → installed → failed`
   - 多 PDF 同时失败仅触发一次安装
   - 安装成功后 800ms 自动重试**所有**受影响项，状态复位以便二次失败可重试
2. **失败态体验**
   - 完整显示错误信息（含手动安装命令），不再 180px 截断
   - 危险色系视觉区分，提供「重试」按钮
3. **i18n 化**：新增 `home.gs*` 9 个文案 key（en-US / zh-CN / zh-TW，其余语言继承英文）
4. **样式规范**：`.gs-install-banner` 对齐 `.update-prompt` 范式（三列 grid、图标圆底、accent 色、card-in 动效）
5. **保存对话框修正**：过滤器名按输出扩展名生成（PDF → "PDF"），不再硬编码「图片」
6. **清理死代码**：删除 `store.ghostscriptItemId`、`GhostscriptInstallDialog.tsx`

## 涉及文件

| 文件 | 变更 |
| --- | --- |
| `docs/design-spec-pdf-ghostscript-ux.md` | 新增 · 设计规范 |
| `src/components/ManualCompressionParts.tsx` | 重构 · 全局横幅 |
| `src/i18n.ts` | 新增 `home.gs*` keys |
| `src/styles/components.css` | 新增 banner 样式 |
| `src/hooks/useManualCompressionActions.ts` | 过滤器名修正 |
| `src/store/app.ts` / `types.ts` | 清理死代码 |
| `src/components/GhostscriptInstallDialog.tsx` | 删除 |

## 版本推进（0.25.5 → 0.25.6）

- [ ] `zipax-cross/package.json`
- [ ] `zipax-cross/package-lock.json`
- [ ] `zipax-cross/src-tauri/tauri.conf.json`
- [ ] `zipax-cross/Cargo.toml`（workspace）
- [ ] `README.md`（中英 badges / 更新内容）
- [ ] `RELEASE_NOTES.md`

## 发布流程

1. [x] 代码实现 + `tsc --noEmit` + `npm run build` 通过
2. [ ] 提交并推送 master（commit 信息含 PRD 引用）
3. [ ] 触发 GitHub Actions `release.yml`（workflow_dispatch, version=0.25.6）
4. [ ] 构建成功 → 检查产物齐全 → 草稿 Release 转正式
5. [ ] Wiki 同步：Home（版本徽章）、Release-History、Ghostscript-Install（v0.25.6 说明）、Docs-Index（新增设计规范条目）

## 验收标准

- [ ] 多 PDF 失败仅一个横幅、一次安装
- [ ] 安装成功自动重试全部受影响项
- [ ] 失败错误完整可见
- [ ] 中英繁文案正确
- [ ] 三平台构建成功，产物齐全
- [ ] Wiki 与文档同步完成
