# 设计规范：PDF 压缩与 Ghostscript 依赖安装 UX

> 版本：v1 · 2026-08
> 适用范围：`zipax-cross/src/components/ManualCompressionParts.tsx`、`components.css`、`i18n.ts`

## 1. 背景与问题

PDF 压缩依赖系统级 Ghostscript（`gs`）。缺失时压缩失败，需要引导用户安装。现状（v0.25.5）在**每个失败的错误卡片内**插入一条内联安装条，存在以下问题：

| 问题 | 影响 |
| --- | --- |
| 安装条内嵌于错误行，与错误图标/重试/删除按钮挤在同一行 | 视觉层级混乱，窄窗口下挤压变形 |
| 每个失败项各有一条安装条、各自独立状态 | 多个 PDF 同时失败会出现多条安装条，可能重复触发安装 |
| 错误信息 `max-w-[180px] truncate` 截断 | 用户看不到完整失败原因与手动安装指引 |
| 文案硬编码中文 | 不随语言切换，破坏 i18n |
| 安装成功后只自动重试当前项 | 其他同时失败的 PDF 需手动逐个重试 |
| 保存对话框过滤器名硬编码「图片」 | PDF 结果保存时过滤器与文件类型不符 |

## 2. 设计原则

1. **依赖安装是全局一次性操作**：Ghostscript 装一次对所有 PDF 生效，UI 必须全局共享单一状态，禁止 per-item 安装。
2. **横幅范式对齐 update-prompt**：已有成熟范式（图标 + 标题 + 详情 + 操作按钮），GS 安装提示复用同款布局与动效，保持应用内视觉一致性。
3. **一次安装，全部重试**：安装成功后自动重试**所有**受 Ghostscript 缺失影响的项，避免用户逐条手动操作。
4. **错误信息完整可见**：不截断，可滚动/换行展示，并提供手动安装指引。
5. **文案全部走 i18n**：所有新增文案必须进入 `i18n.ts`（en-US 为基底，zh-CN/zh-TW 翻译，其余语言继承）。

## 3. 状态机（全局唯一）

```
idle ──点击「一键安装」──▶ installing ──成功──▶ installed
                            │                    │ 800ms 后
                            │                    ▼
                            └─失败─▶ failed  ──▶ retry 全部受影响项（自动）
                                      │
                                      └─ 显示完整错误 + 手动安装命令
```

- `idle`：受影响项 ≥ 1 且未安装过
- `installing`：调用 `installGhostscript()`，按钮禁用并显示 Spinner
- `installed`：短暂确认态（勾选图标 + 「已安装，正在重试…」）
- `failed`：显示完整错误信息（可含多行命令），提供「重试」按钮；错误内嵌手动安装指引，用户可直接照做

触发条件：结果列表存在 `status === "error"` 且错误为 Ghostscript 缺失的项。

## 4. 布局与视觉

```
┌────────────────────────────────────────────────────┐
│ (icon)  PDF 压缩需要 Ghostscript        [一键安装]  │
│         安装后即可压缩 PDF 文件                     │
└────────────────────────────────────────────────────┘
        ▲ 横幅固定于结果列表顶部（受影响项之上）
```

- 容器：`grid-template-columns: auto minmax(0,1fr) auto`，与 `.update-prompt` 一致
- 图标：`Download`（lucide），置于 30px 圆形底内，`--accent` 色
- 标题 13px / 700；详情 11px / 520，`--muted`
- 边框：`color-mix(in oklab, var(--accent) 24%, var(--border))`
- 背景：`color-mix(in oklab, var(--accent) 8%, var(--surface))`
- 入场动效：`card-in var(--motion-medium) var(--motion-ease) both`
- installing：Spinner（sm, accent）替代按钮文案
- failed：横幅变危险色系（`--danger`），标题下方展开完整错误 + 手动命令

## 5. 行为细则

1. 多个受影响项 → 只渲染**一个**横幅。
2. 安装成功 → 800ms 后自动对全部受影响项调用 `onRetry(id)`，横幅移除。
3. 安装失败 → 横幅保留，显示错误；用户可「重试」或按提示手动安装后自行重试。
4. 用户删除/重试清空受影响项 → 横幅自动消失。
5. 保存对话框过滤器名由输出扩展名生成（PDF → "PDF"），不再硬编码「图片」。

## 6. i18n 新增 key（前缀 `home.gs*`）

| key | en-US | zh-CN | zh-TW |
| --- | --- | --- | --- |
| `home.gsTitle` | PDF compression needs Ghostscript | PDF 压缩需要 Ghostscript | PDF 壓縮需要 Ghostscript |
| `home.gsDetail` | Install it to enable PDF compression. | 安装后即可压缩 PDF 文件。 | 安裝後即可壓縮 PDF 檔案。 |
| `home.gsInstall` | Install | 一键安装 | 一鍵安裝 |
| `home.gsInstalling` | Installing… | 正在安装… | 正在安裝… |
| `home.gsInstalled` | Installed, retrying… | 已安装，正在重试… | 已安裝，正在重試… |
| `home.gsFailed` | Install failed | 安装失败 | 安裝失敗 |
| `home.gsRetry` | Retry | 重试 | 重試 |
| `home.gsRetryingCount` | Retrying {n} PDF(s) | 正在重试 {n} 个 PDF | 正在重試 {n} 個 PDF |

> 其余语言通过 `Object.assign(lang, en-US)` 自动继承英文文案，无需逐语言维护。

## 7. 验收标准

- [ ] 多 PDF 失败时仅出现一个安装横幅，安装仅触发一次
- [ ] 安装成功后所有受影响项自动重试
- [ ] 失败错误完整可见，含手动安装命令
- [ ] 中文/英文/繁体语言下文案正确
- [ ] 横幅视觉与 update-prompt 一致（同色系、同圆角、同动效）
- [ ] `npm run build`（tsc + vite）无错误
- [ ] 删除死代码：`store.ghostscriptItemId`、`GhostscriptInstallDialog.tsx`
