# PRD：zipax 网站视觉与动效迭代 v4

## 0. 文档信息

- 版本：v4.0
- 日期：2026-06-23
- 状态：待评审
- 范围：`website/`
- 主题：与 zipax 桌面 app 建立一致的视觉语言，移除阻塞式开屏，引入品牌化页面过场与粒子特效

## 1. 背景

网站现有版本已经具备 HeroUI 组件体系、深浅主题、响应式页面、产品截图和基础路由动画，但仍存在以下问题：

1. `BootSplash` 至少占用 800ms，并额外执行 300ms 退出，用户进入网站时看不到真实内容。
2. 页面切换使用整页纯色遮罩，能够隐藏切换过程，但品牌辨识度较弱，且与 app 的轻量动效不一致。
3. 当前首页以静态品牌纹样和产品截图为主，缺少用户期望的 Logo 粒子记忆点。
4. 网站动效时长与 app 不统一。app 主要采用 140ms、180ms 和 `cubic-bezier(.2,.8,.2,1)`；网站存在 240–800ms 多套节奏。
5. 网站与 app 使用了相近的蓝色和表面颜色，但圆角、阴影、选中态及内容出现方式尚未形成明确映射规则。

## 2. app 设计 DNA

网站不复制 430px 桌面窗口，而是继承 app 的设计规律。

### 2.1 app 当前特征

| 维度 | app 规则 |
| --- | --- |
| 主背景 | 接近纯净白或深黑的低彩度背景 |
| 表面 | 白色/深灰卡片，弱边框，极轻阴影 |
| 品牌色 | `oklch(0.6204 0.195 253.83)` 蓝色 |
| 窗口圆角 | 24px |
| 卡片圆角 | 18px |
| 区块圆角 | 12px |
| 控件圆角 | 10px |
| 选中态 | 蓝色文字 + 蓝色弱填充 + 细边框 + 柔和阴影 |
| 字体 | 系统字体；标题约 780，正文保持克制 |
| 快速动效 | 140ms |
| 页面/卡片动效 | 180ms |
| 位移范围 | 1–4px |
| 动效曲线 | `cubic-bezier(.2,.8,.2,1)` |

### 2.2 网站转译原则

- 控件直接沿用 app 的 10px 圆角。
- 普通网站卡片使用 14–18px；产品展示容器可使用 18–24px。
- 阴影维持低透明度，不使用大面积玻璃拟态。
- 蓝色只用于选中、下载、链接和粒子高光。
- 页面内容使用更大的留白和字号，但字重关系与 app 一致。
- 动效仍然保持短距离、快速收束，不采用明显弹跳。

## 3. 产品目标

### 3.1 核心目标

1. 用户第一眼能够感受到网站与 zipax app 属于同一个产品。
2. 删除阻塞式开屏动画，让首屏内容立即可见、可读、可操作。
3. 建立统一的首次进入、路由切换、区块进入和微交互动效体系。
4. 使用 ZipaxIcon 三层结构生成品牌粒子，而不是通用粒子背景。
5. 保留真实 app 截图作为产品证据，粒子只作为品牌和过场语言。

### 3.2 非目标

- 不重做 app 本身。
- 不将网站制作成 app 界面的放大版。
- 不在每个页面持续运行大型粒子场。
- 不加入阻塞阅读的全屏视频、3D 模型或长时间 Loading。
- 不为了动效修改文档、下载和支持页面的信息架构。

## 4. 视觉方案

### 4.1 首页 Hero

采用“真实 app 窗口 + 品牌粒子光环”的组合：

- 左侧保持标题、产品说明和下载按钮。
- 右侧继续展示真实 app 截图，截图是视觉主体。
- 粒子 Logo 位于截图背后或右上方，占视觉区域约 55%，不遮挡 app 关键内容。
- 粒子颜色读取 `--accent`、`--accent-soft` 和主题前景色。
- 静止状态下粒子整体透明度保持在 0.45–0.68。
- 现有静态 `HeroPattern` 降低存在感或移除，避免与粒子竞争。

### 4.2 网站与 app 的视觉对应

| 网站元素 | 对应的 app 语言 |
| --- | --- |
| Header 当前页面 | app 的选中 Tab：蓝色弱填充、细边框、柔光 |
| 下载主按钮 | app 的 accent 主操作按钮 |
| 功能条目 | app 设置项和卡片的弱边框、轻表面 |
| 产品截图框 | app 的 24px 窗口轮廓 |
| 文档侧栏 | app 的垂直设置导航 |
| 路由过场 | app 页面淡入 + 卡片 3px 上移的放大版本 |
| 粒子轨迹 | ZipaxIcon 三层图形的拆分与重组 |

### 4.3 标题与文字

- 品牌文字统一使用小写 `zipax`。
- Hero 品牌标题：52px / 800；移动端 38px / 800。
- 页面 H1：40px / 780；移动端 32px / 780。
- 区块 H2：30px / 780；移动端 26px / 780。
- 卡片 H3：18–20px / 680–720。
- 正文：16–17px，行高 1.65–1.7。
- 不在大标题上方放置 eyebrow；辅助标签只能出现在说明之后。

## 5. 动效体系

### 5.1 全局 Motion Token

| Token | 时长 | 用途 |
| --- | ---: | --- |
| `--motion-fast` | 140ms | 按钮、Tab、图标、Hover |
| `--motion-medium` | 180ms | 卡片和小型组件进入 |
| `--motion-section` | 320ms | 页面区块进入 |
| `--motion-route` | 420ms | 路由整体过场 |
| `--motion-hero` | 720ms | 首次 Hero 粒子聚合 |
| `--motion-ease` | `.2,.8,.2,1` | 默认收束曲线 |

所有常规位移动画限制在 3–12px。仅粒子可以在画布范围内进行更大位移。

### 5.2 移除开屏动画

删除以下内容：

- `BootSplash` 组件及其定时器。
- `boot-splash`、`splashIconIn`、`splashLayerIn`、`splashNameIn` 样式。
- 首次加载时的全屏遮挡层。

替代方案：页面第一帧直接展示 Header、Hero 文案和产品截图。动画从已可见页面内部开始，不阻止用户操作。

### 5.3 首次进入首页

建议时间线：

| 时间 | 行为 |
| ---: | --- |
| 0ms | 页面背景、Header、Hero 基础内容直接渲染 |
| 40–320ms | Hero 标题和正文从 `opacity: .25, y: 6px` 收束至正常状态 |
| 100–460ms | app 截图从 `opacity: .4, y: 8px, scale: .99` 进入 |
| 80–800ms | 粒子从分散状态聚合为 ZipaxIcon 三层轮廓 |
| 420–720ms | CTA 和信任标签按 55ms 间隔出现 |

动画期间内容保持可选择、按钮保持可点击。

### 5.4 路由切换

Header 和 Footer 不参与离场，只切换 `<main>`。

建议状态机：

```text
idle → exiting → particle-bridge → entering → idle
```

具体时间线：

1. 旧页面在 140ms 内降低透明度并向上移动 4px。
2. 约 180–280 个品牌粒子从 Header Logo 附近向页面内容区域掠过。
3. 粒子流分成三层，短暂呈现 ZipaxIcon 的方向感，但不在页面中央停留。
4. 新页面在 240ms 内从 `opacity: 0, y: 8px` 进入。
5. 总过场控制在 380–460ms。

现有纯色 `route-transition-mask` 将被移除。过场不会覆盖整个页面超过 150ms。

### 5.5 区块进入

- 首屏区块不使用滚动触发，避免首屏内容闪烁。
- 首屏以下区块使用 `whileInView` 或 IntersectionObserver。
- 区块使用 `opacity + y: 8px`，320ms。
- 同组条目间隔 40ms；最多延迟 160ms。
- 已经展示过的区块不重复播放。

### 5.6 微交互

- 按钮按下：`scale(.98)`，140ms。
- 功能图标 Hover：向上移动 2px，颜色从 accent-soft 变为 accent。
- 下载项箭头：向下移动 2px。
- 文档箭头：沿阅读方向移动 3px。
- 产品截图 Hover：向上移动 3px，阴影从 card 过渡到 raised。
- 不使用持续呼吸、闪烁或无限循环的 CTA 动画。

## 6. 粒子系统

### 6.1 两种使用模式

#### Hero 粒子

- 作用：首次品牌记忆和轻交互。
- 桌面端：720–900 个粒子。
- 平板端：480–620 个粒子。
- 手机端：260–420 个粒子。
- 聚合完成后缓慢旋转，振幅不超过 5°。
- 鼠标接近时局部排斥，最大位移 24px。
- 触摸设备不启用指针扰动。

#### Route 粒子

- 作用：页面之间的品牌接力。
- 桌面端：180–280 个粒子。
- 手机端：90–140 个粒子。
- 生命周期不超过 460ms。
- 不持续运行，不接受鼠标交互。

### 6.2 图形来源

- 粒子目标点必须从 `ZipaxIcon` 的三条 SVG Path 采样。
- 三层分别保留轻微深度差和 55–80ms 时间差。
- 不新增另一套 Logo 路径数据；应提取共享 `zipaxLogoPaths` 常量。
- 粒子画布 `aria-hidden="true"`，品牌名称仍由真实文本和 Logo 提供。

### 6.3 颜色和主题

浅色模式：

- 主粒子：`--accent`。
- 高光粒子：accent 与白色混合。
- 远景粒子：accent-soft-foreground，降低透明度。

深色模式：

- 主粒子：提高亮度后的 `--accent`。
- 高光粒子：`--accent-foreground`。
- 禁止纯白大面积发光。

### 6.4 边界和裁切

- 粒子最终图形必须位于 Canvas 72% 安全区域内。
- 初始散开和指针排斥都不能超出 86% 安全区域。
- Canvas 不允许导致页面横向滚动。
- 360px、390px、768px、1280px、1440px 下均需检查。
- 粒子特效不显示任何“移动光标”等提示小字。

### 6.5 生命周期和性能

- Canvas DPR 桌面最大 1.75，移动端最大 1.25。
- Hero 离开视口后暂停 `requestAnimationFrame`。
- `document.visibilityState === "hidden"` 时停止动画。
- 路由粒子结束后立即清空 Canvas 并卸载监听器。
- Resize 使用节流，不在每个事件中重新采样 SVG。
- 优先 Canvas 2D；不为当前规模引入 Three.js。

## 7. 技术架构

### 7.1 新增组件

| 文件 | 职责 |
| --- | --- |
| `components/motion/MotionProvider.tsx` | 全局 MotionConfig、Reduced Motion 和统一 Token |
| `components/motion/PageTransition.tsx` | 主内容进入/退出动画 |
| `components/motion/SectionReveal.tsx` | 首屏以下区块的一次性进入动画 |
| `components/particles/ParticleCanvas.tsx` | 通用粒子渲染器 |
| `components/particles/HeroParticleLogo.tsx` | 首页聚合、旋转和指针扰动 |
| `components/particles/RouteParticleBridge.tsx` | 路由过场粒子 |
| `components/brand/zipaxLogoPaths.ts` | Logo 三层 Path 的唯一数据源 |

### 7.2 删除或替换

- 删除 `components/BootSplash.tsx`。
- 删除现有 `route-transition-mask`。
- `App.tsx` 中 Header/Footer 保持稳定，只用 `AnimatePresence mode="wait"` 管理 main。
- HeroPattern 调整为低对比辅助纹样；若与粒子产生竞争，则直接移除。

### 7.3 页面结构

```text
App
├── MotionProvider
├── Header（稳定）
├── RouteParticleBridge（短时全局覆盖）
├── AnimatePresence mode="wait"
│   └── PageTransition
│       └── 当前页面
└── Footer（稳定）
```

## 8. 无障碍

- 使用 Motion 的 reduced-motion 用户偏好。
- Reduced Motion 下取消粒子移动、旋转和页面位移。
- 首页直接显示粒子 Logo 的静态最终帧，或使用普通 SVG Logo。
- 路由切换只保留 100–120ms 的透明度变化。
- Canvas 全部 `aria-hidden` 且不可获得焦点。
- 动画不能延迟焦点移动或阻止键盘导航。
- 路由变化后焦点移动到当前页面 H1，并使用非视觉方式播报页面标题。

## 9. 性能预算

| 指标 | 目标 |
| --- | --- |
| LCP | 桌面和中端移动设备 ≤ 2.5s |
| CLS | ≤ 0.05 |
| 动画帧率 | 桌面目标 60fps，最低 50fps |
| 新增粒子 JS | gzip ≤ 18KB |
| Route 粒子生命周期 | ≤ 460ms |
| 首次 Hero 动画 | ≤ 800ms |
| 主线程单次长任务 | ≤ 50ms |

产品截图必须预留固定比例，粒子 Canvas 必须在初始布局中保留尺寸，避免 CLS。

## 10. 响应式规则

### 桌面端 ≥ 901px

- Hero 左文右图。
- 粒子在产品截图背后完整呈现。
- 路由粒子从 Header Logo 朝主内容方向移动。

### 平板端 621–900px

- Hero 上文下图。
- 粒子缩小到截图宽度的 70%，降低透明度。
- 路由粒子减少约 35%。

### 手机端 ≤ 620px

- 粒子不覆盖文字和 CTA。
- Hero 粒子只保留局部 Logo 光环或静态聚合效果。
- 不启用指针扰动和持续 3D 旋转。
- 路由过场只使用短距离粒子扫光和淡入淡出。

## 11. 实施阶段

### Phase 1：动效基础和 app Token 对齐

- 将网站 Motion Token 调整为 app 的 140/180ms 基础节奏。
- 添加 320/420/720ms 扩展 Token。
- 统一 easing、圆角、边框和阴影映射。
- 增加 `MotionProvider`。

验收：按钮、导航、卡片和 app 具有相近的反馈速度。

### Phase 2：移除开屏并重构路由过场

- 删除 BootSplash。
- 删除纯色 Route Mask。
- 实现 PageTransition。
- 保证 Header/Footer 不重绘、不跳动。

验收：首次进入立即显示内容；页面切换不闪白、不遮挡超过 150ms。

### Phase 3：首页品牌粒子

- 提取共享 Logo Path。
- 实现 HeroParticleLogo。
- 与 app 截图组合，而不是替代截图。
- 完成主题、响应式和 Reduced Motion。

验收：Logo 清晰、粒子不裁切、移动端不溢出。

### Phase 4：路由粒子和区块进入

- 实现 RouteParticleBridge。
- 增加 SectionReveal。
- 调整各页面出现顺序。

验收：所有页面切换节奏一致，快速连续点击不会叠加动画。

### Phase 5：性能和视觉回归

- 检查 5 个页面、2 套主题和 5 个宽度。
- 测试后台切换、Resize 和 Reduced Motion。
- 完成 Lighthouse 和运行时性能检查。

## 12. 验收标准

### 视觉

- [ ] 网站和 app 使用同一主蓝色、表面层级和选中态逻辑。
- [ ] Header 当前页面与 app 选中 Tab 有明确关联。
- [ ] 产品截图仍然是 Hero 的主要产品证据。
- [ ] 粒子使用 ZipaxIcon 三层轮廓，不是通用圆形粒子背景。
- [ ] 不出现粒子操作提示小字。

### 动效

- [ ] 网站不再展示阻塞式开屏。
- [ ] 首次进入首页内容立即可读、CTA 立即可点击。
- [ ] 页面过场总时长不超过 460ms。
- [ ] 快速连续导航不会残留遮罩或粒子。
- [ ] Header/Footer 在路由切换中保持稳定。

### 响应式

- [ ] 360–1440px 无横向滚动。
- [ ] 粒子任何阶段均不被 Canvas 边界截断。
- [ ] 手机端粒子不遮挡标题、按钮或截图。

### 无障碍和性能

- [ ] Reduced Motion 下无位移、旋转或粒子飞行动画。
- [ ] Canvas 不进入可访问性树。
- [ ] 动画期间键盘焦点正常。
- [ ] 页面隐藏时不存在持续 RAF。
- [ ] 构建和浏览器控制台无错误。

## 13. 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| 粒子抢夺产品截图注意力 | 降低透明度；截图保持最高对比度 |
| 路由动画让网站显慢 | 过场 ≤ 460ms；内容退出只占 140ms |
| Canvas 导致移动端耗电 | 降低粒子和 DPR；手机端不持续旋转 |
| Logo Path 出现多份数据 | 提取单一 `zipaxLogoPaths` |
| 动效与 HeroUI 状态冲突 | 页面动效只包裹布局层，不改 HeroUI 内部状态 |
| 快速点击叠加过场 | 状态机锁定当前 transition，保留最后一次目标路由 |

## 14. 技术参考

- HeroUI 动效与 Reduced Motion：<https://v3.heroui.com/docs/react/getting-started/animation>
- Motion AnimatePresence：<https://motion.dev/docs/react-animate-presence>
- Motion Reduced Motion：<https://motion.dev/docs/react-use-reduced-motion>
- View Transition API 可作为后续渐进增强：<https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API>
