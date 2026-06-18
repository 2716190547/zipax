# PRD: 全局代码精简与逻辑优雅化

## 背景

zipax Tauri 版已经具备核心压缩、自动化、设置、更新、托盘和自定义窗口能力。随着功能迭代，部分逻辑开始出现横向散落：

- `App.tsx` 同时承担外观、语言方向、托盘同步、自动更新、窗口尺寸、启动项刷新等全局副作用。
- `GeneralView.tsx` 混合设置页渲染、本地临时状态、自动启动读取、版本读取和手动更新检查。
- `ManualCompression.tsx` 承担拖放、粘贴、读取、压缩、保存、列表状态和 resize 触发，文件体量偏大。
- `index.css` 已超过 1700 行，组件样式、页面样式、全局 token 和状态样式混在同一文件。
- 更新相关状态横跨 `store/app.ts`、`lib/update.ts`、`App.tsx`、`GeneralView.tsx` 和 `UpdatePrompt.tsx`。

本轮目标不是重写，而是在不改变用户体验的前提下，逐步把代码变得更短、更顺、更容易继续加功能。

## 目标

- 保持现有功能、视觉和发布流程不退化。
- 降低单文件复杂度，让每个模块只表达一类意图。
- 把重复的状态处理和副作用抽成可复用 hook 或小工具。
- 让 CSS 从“全局堆叠”变成更清晰的分层组织。
- 减少手动事件、魔法数字和隐式耦合。
- 为后续功能迭代留出稳定边界。

## 非目标

- 不重做 UI 设计。
- 不替换 HeroUI、Zustand、Tauri 或现有 Rust 核心。
- 不大规模迁移目录结构到全新架构。
- 不在本轮引入复杂状态机库。
- 不为了抽象而抽象；保留小而直接的组件。

## 现状观察

| 区域 | 当前状态 | 主要问题 |
| --- | --- | --- |
| `App.tsx` | 约 149 行，多组 `useEffect` | 全局副作用集中，阅读路径偏长 |
| `GeneralView.tsx` | 约 220 行 | 设置 UI 与平台/更新逻辑混合 |
| `ManualCompression.tsx` | 约 421 行 | 用户输入、压缩流程和列表展示集中 |
| `store/app.ts` | 约 299 行 | 持久化设置、临时 UI 状态、业务数据共存 |
| `index.css` | 约 1709 行 | 样式分层不清，组件样式难定位 |
| 更新流程 | 分布在 5 个模块 | 手动/自动检查可进一步统一 |

## 用户价值

- 用户不会直接感知“代码更短”，但会受益于更少回归、更稳定更新、更快修 bug。
- 后续新增功能时，不需要在多个无关文件中来回穿线。
- 发布前验证路径更清晰，减少“修了 A 影响 B”的隐性风险。

## 设计原则

- **先收敛边界，再减少行数**：优先让职责清楚，行数减少作为结果而不是唯一目标。
- **一个 hook 管一类副作用**：外观、窗口、托盘、更新、启动项各自独立。
- **状态靠近使用者，跨组件状态进 store**：只在多个组件共享时放进 Zustand。
- **组件只渲染意图**：异步流程和平台 API 调用尽量下沉到 hook/lib。
- **CSS 以 token 和组件分层**：减少“找一个 class 要翻全文件”的成本。
- **小步可回滚**：每个阶段都能独立构建、测试、提交。

## 功能范围

### 1. 全局副作用精简

将 `App.tsx` 中的副作用拆成 hooks：

- `useAppearanceMode`
- `useDocumentLocale`
- `useTraySync`
- `useAutoUpdateCheck`
- `useAutostartRefresh`

`App.tsx` 最终只保留：

- 读取当前 tab 和基础偏好。
- 调用全局 hooks。
- 渲染 `WindowFrame` 和当前页面。

验收标准：

- `App.tsx` 控制在 80 行以内。
- 每个 hook 名称能直接说明副作用目的。
- 自动更新、托盘、语言方向、主题色行为不变。

### 2. 更新逻辑收敛

新增 `useUpdateCheck` 或 `useUpdater`，统一手动检查和自动检查：

- 暴露 `checking`、`hint`、`checkNow`。
- 内部处理 latest、available、error 三种结果。
- `GeneralView` 不直接关心 `checkForUpdate` 的细节。
- `App.tsx` 自动检查使用同一套底层函数，但不展示手动 hint。

验收标准：

- `GeneralView` 不直接 import `checkForUpdate`。
- 成功/失败提示位置和语义不变。
- 发现新版仍打开 `UpdatePrompt`。
- 检查失败不影响启动。

### 3. 设置页拆分

将 `GeneralView` 拆为轻量设置块：

- `AutostartSetting`
- `AppearanceSetting`
- `LanguageSetting`
- `WindowBehaviorSetting`
- `VersionSetting`
- `AutoUpdateSetting`
- `StatsSetting`

保留一个总入口 `GeneralView` 负责组合。

验收标准：

- `GeneralView` 控制在 80-100 行。
- 每个设置块不超过 60 行，除非确有复杂交互。
- 现有文案、布局和交互保持一致。

### 4. 手动压缩流程分层

对 `ManualCompression.tsx` 做低风险拆分：

- `useManualCompressionQueue`：队列添加、删除、清空、状态更新。
- `useImageInput`：拖放、粘贴、选择文件入口。
- `CompressionDropZone`：首屏拖放区域。
- `CompressionResultList`：结果列表展示。
- `ManualActionBar`：保存全部、清空。

验收标准：

- `ManualCompression.tsx` 控制在 160 行以内。
- 压缩、保存、删除、拖放、粘贴行为不变。
- resize 触发不再散落多个 `setTimeout`，统一为一个稳定 hook 或回调。

### 5. Store 分层与命名清理

现有 `store/app.ts` 保持 Zustand，但按职责拆出类型和 slice 思路：

- `settings`：持久化偏好和压缩参数。
- `compression`：临时压缩 items。
- `automation`：文件夹规则和错误记录。
- `ui`：activeTab、availableUpdate 等临时状态。
- `stats`：统计数据。

可以先在同文件内用分区和 helper 收敛，不急于物理拆文件。

验收标准：

- `partialize` 与持久化字段分组更清晰。
- 临时 UI 状态不会被持久化。
- 类型导出更少、更明确。

### 6. CSS 分层整理

将 `index.css` 拆成按层级 import 的文件：

- `styles/tokens.css`
- `styles/base.css`
- `styles/window.css`
- `styles/components.css`
- `styles/views.css`
- `styles/utilities.css`

或先保留单文件，但重排为明确章节并删除重复规则。

验收标准：

- 全局入口清楚。
- 与组件强绑定的样式容易定位。
- 无视觉回归。
- 不引入 CSS-in-JS。

### 7. 命名与工具函数整理

提取小工具，避免重复逻辑：

- `formatBytes`
- `sleep`
- `dispatchResize`
- `safeWarn` 或统一 logger
- update hint/tone 类型

验收标准：

- 工具函数只在被 2 处以上使用时抽出。
- 不建立过深的 `utils` 层级。
- 命名直白，避免过度抽象。

## 分阶段计划

### Phase 1: 低风险收敛

- 抽 `useUpdateCheck`。
- 把 `GeneralView` 的版本检查逻辑下沉。
- 保持 UI 不变。
- 构建验证。

建议提交名：

```text
Refactor update check flow
```

### Phase 2: App 全局 hooks

- 拆 `App.tsx` 的全局副作用。
- 保持渲染结构不变。
- 构建验证，手动检查托盘和自动更新。

建议提交名：

```text
Extract app side effect hooks
```

### Phase 3: 设置页组件化

- 拆 `GeneralView` 设置块。
- 复用现有 `SettingRow`/`SettingsCard`。
- 不改视觉。

建议提交名：

```text
Split general settings view
```

### Phase 4: 手动压缩页拆分

- 拆输入、队列、列表和操作条。
- 保持压缩行为不变。
- 对拖放、粘贴、保存全部做手动回归。

建议提交名：

```text
Simplify manual compression view
```

### Phase 5: CSS 分层

- 先重排章节，再决定是否物理拆文件。
- 做桌面与紧凑窗口截图对比。

建议提交名：

```text
Organize global styles
```

### Phase 6: Store 整理

- 按 slice 组织状态和 actions。
- 收紧类型导出。
- 验证旧用户本地持久化数据兼容。

建议提交名：

```text
Clarify app store structure
```

## 验收标准

- `npm run build` 通过。
- `cargo check` 通过，若未改 Rust 可跳过但需说明。
- 主要文件目标：
  - `App.tsx` < 80 行。
  - `GeneralView.tsx` < 100 行。
  - `ManualCompression.tsx` < 160 行。
  - `index.css` 被分层或章节化后可快速定位样式。
- 以下行为无回归：
  - 拖放/粘贴/选择图片。
  - 压缩和保存结果。
  - 自动化文件夹规则。
  - 语言、主题、外观切换。
  - 托盘状态同步。
  - 手动检查更新和自动检查更新。
  - 自定义窗口尺寸和圆角。

## 风险与缓解

- **风险：拆组件造成状态传递变复杂。**
  - 缓解：优先 hook 下沉，避免层层 props。

- **风险：CSS 拆分造成视觉细节回归。**
  - 缓解：先重排再拆文件；每步保留构建和截图验证。

- **风险：store 重构影响旧持久化数据。**
  - 缓解：保持 `zipax-store` key 和字段名兼容，必要时增加迁移函数。

- **风险：自动更新流程难以本地完整模拟。**
  - 缓解：保留手动检查、latest、available、error 三种路径的可观察状态。

## 不发布约束

本 PRD 是重构规划，不默认发布新版本。只有在明确收到“发布”“打 tag”“上传 GitHub Release”等命令时，才执行版本发布流程。

## 成功定义

代码读起来像产品功能本身：页面负责表达页面，hook 负责副作用，lib 负责平台能力，store 负责共享状态，CSS 能按视觉对象定位。改完之后，新增一个设置项或调整更新流程时，不需要跨五六个文件猜关系。

## 执行状态

截至本轮执行，PRD 范围内的精简已按阶段落地：

| 阶段 | 状态 | 结果 |
| --- | --- | --- |
| Phase 1 更新检查 | 已完成 | `useUpdateCheck` 收敛手动检查，自动检查继续复用 `checkForUpdate` |
| Phase 2 全局副作用 | 已完成 | `App.tsx` 下沉外观、语言、托盘、自动更新、启动项刷新 hooks |
| Phase 3 设置页 | 已完成 | `GeneralView` 只负责组合，设置块迁移到 `GeneralSettings` |
| Phase 4 手动压缩页 | 已完成 | 输入、压缩动作、结果列表、操作条分层，页面只保留组合与 resize 触发 |
| Phase 5 CSS 分层 | 已完成 | `index.css` 拆为 `styles/` 下按职责导入的样式文件 |
| Phase 6 Store 整理 | 已完成 | 类型、工具函数、持久化字段选择拆分，保持 `zipax-store` 字段兼容 |
| Phase 7 工具函数 | 已完成 | 提取 `formatBytes`、`sleep`、`dispatchZipaxResize`、`safeWarn` |

本轮仅做本地代码精简和构建验证，不发布、不打 tag、不上传 Release。
