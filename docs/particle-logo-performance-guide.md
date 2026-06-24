# Zipax 首页粒子 Logo：60fps、呼吸动效与问题排查指南

## 1. 目标与最终方案

首页粒子不是通用装饰背景，而是 Zipax 三层 Logo 的动态表达。当前方案需要同时满足：

- 粒子舞台位于 Hero 最上方并水平居中。
- 常态下持续呼吸、轻微旋转和微漂移。
- 鼠标进入后产生更明显的排斥和 3D 偏转。
- 60Hz 屏幕尽量稳定运行在 60fps，高刷新率屏幕跟随系统刷新。
- 离开视口、切换后台或启用“减少动态效果”后停止无意义绘制。
- 360px 至 1440px 不裁切、不产生横向滚动。

实现文件：

- `website/src/components/particles/HeroParticleLogo.tsx`
- `website/src/components/brand/zipaxLogoPaths.ts`
- `website/src/pages/HomePage.tsx`
- `website/src/styles/layout.css`
- `website/src/styles/components.css`

## 2. 为什么继续使用 Canvas 2D

| 实现方式 | 优点 | 问题 | 当前结论 |
| --- | --- | --- | --- |
| DOM 元素 | 易调试、易写 CSS | 数百节点会增加布局和样式计算 | 不适合 700 粒子 |
| SVG 圆点 | Logo 路径天然，矢量清晰 | 大量节点与属性更新成本较高 | 适合 100–200 粒子 |
| Canvas 2D | 单节点、成熟、体积小 | 每帧需要重绘 | 当前最合适 |
| WebGL | 大量粒子性能最好 | 着色器和上下文管理复杂 | 超过 2000 粒子再考虑 |
| OffscreenCanvas + Worker | 可把部分计算移出主线程 | 浏览器差异、通信和调试成本 | 主线程出现明显长任务再考虑 |

当前只有 720/480/280 三档粒子，不需要为了“技术感”引入 Three.js 或 WebGL。MDN 也建议先减少每帧工作、控制 DPR、避免昂贵阴影与不必要的 Canvas 状态切换，再考虑更复杂技术：[Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)。

## 3. 分步骤实现

### 步骤一：只维护一份 Logo Path

SVG 图标和粒子采样共同读取 `ZIPAX_LOGO_LAYERS`：

```ts
export const ZIPAX_LOGO_LAYERS = [
  { name: "primary", path: "M…Z", depth: 0.11, delay: 0 },
  { name: "secondary", path: "M…Z", depth: 0, delay: 55 },
  { name: "tertiary", path: "M…Z", depth: -0.1, delay: 110 },
];
```

这样修改 Logo 时，不会出现导航图标已经更新、粒子仍使用旧轮廓的问题。

### 步骤二：离屏采样 Path

组件挂载时将每层 Path 绘制到小型离屏 Canvas，再从非透明像素中抽样目标点。采样只做一次，不放进动画循环：

```ts
context.scale(2, 2);
context.fill(new Path2D(layer.path));
const pixels = context.getImageData(0, 0, maskSize, maskSize).data;

for (let y = 1; y < maskSize; y += 2) {
  for (let x = 1; x < maskSize; x += 2) {
    if (pixels[(y * maskSize + x) * 4 + 3] > 96) {
      points.push([x, y]);
    }
  }
}
```

### 步骤三：使用时间而不是帧数驱动动画

`requestAnimationFrame` 通常跟随显示器刷新率；60Hz、120Hz、144Hz 屏幕回调频率可能不同。因此位置必须根据回调时间戳计算，不能“每帧移动 1px”。官方说明见 [Window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)。

```ts
const draw = (now: number) => {
  const elapsed = now - startTime;
  const breath = 1 + Math.sin(elapsed * 0.00125) * 0.028;
  drawParticles(elapsed, breath);
  frame = requestAnimationFrame(draw);
};
```

### 步骤四：呼吸不能只有整体缩放

只给整个 Logo 做同步缩放，会像加载图标而不像有生命的粒子。因此当前使用三层节奏：

```ts
const breath = 1 + Math.sin(elapsed * 0.00125) * 0.028;
const layerBreath =
  1 + Math.sin(elapsed * 0.00092 + layerIndex * 1.7) * 0.012;
const ambientX = Math.sin(elapsed * 0.00072 + phase) * 1.7;
const ambientY = Math.cos(elapsed * 0.0006 + phase * 0.83) * 2.1;
```

- 整体呼吸约 5 秒一轮，振幅 2.8%。
- 三层 Logo 相位错开，振幅 1.2%。
- 单粒子漂移控制在约 1–2px，Logo 轮廓不会散掉。
- 每个粒子还有独立透明度相位，避免同时闪烁。

### 步骤五：将舞台和内容统一居中

粒子舞台先于标题渲染，并限制最大宽度：

```css
.home-hero .hero-product {
  width: min(960px, 100%);
  height: clamp(340px, 32vw, 440px);
  margin: 0 auto -32px;
}

.home-hero .hero-copy {
  width: min(860px, 100%);
  margin: 0 auto;
  text-align: center;
}

.home-hero .hero-actions,
.home-hero .hero-proof {
  justify-content: center;
}
```

## 4. 常见问题、原因与解决方案

### 问题 A：帧率只有 24–31fps

**症状**：动画规律，但明显不够顺滑。

**原因 1：代码主动节流。**

```ts
// 错误示例：42ms 约等于 24fps
if (now - lastFrame < 42) return;
```

**解决**：让每次 `requestAnimationFrame` 都绘制，交给浏览器匹配刷新率。不要用 `setInterval(16)` 代替；MDN 推荐 Canvas 动画使用 `requestAnimationFrame`。

**原因 2：每帧工作超过 16.67ms。**

60fps 的单帧预算约为：

```text
1000ms / 60 ≈ 16.67ms
```

**解决顺序**：

1. 粒子从 920 降到 720。
2. 桌面 DPR 上限从 1.75 降到 1.5。
3. 避免 `shadowBlur`、文本绘制和循环内反复读取 DOM/CSS。
4. 仍不够时降到 560 粒子。
5. 只有数千粒子仍需复杂物理时，再迁移 WebGL。

### 问题 B：高刷新率屏幕动画速度变快

**原因**：位置按帧累加，而不是按时间计算。

```ts
// 错误：144Hz 会比 60Hz 移动得更快
x += 1;

// 正确：所有屏幕按相同时间轴计算
x = originX + Math.sin(elapsed * speed) * amplitude;
```

### 问题 C：粒子很多，但 Logo 看起来仍然小

**可能原因**：

1. Canvas 的短边太小，坐标缩放以短边为基准。
2. 粒子容器排在文案之后，视觉中心落到首屏下方。
3. `mask-image` 或父容器 `overflow: hidden` 截断边缘。

**解决**：先增大舞台短边，再调整 DOM 顺序；不要只增加粒子数量。粒子数量提升的是密度，不会自动放大轮廓。

### 问题 D：呼吸效果像“闪烁”或“加载中”

**原因**：所有粒子使用同一个透明度或缩放相位。

**方案一：层级错相位**，适合保持清晰 Logo。

**方案二：每粒子随机相位**，适合增加空气感，但振幅必须很小。

**方案三：噪声场**，自然度最好，但计算成本更高；可预生成一维噪声表，不要每帧生成随机数。

当前采用方案一和方案二组合，不在动画循环内调用 `Math.random()`。

### 问题 E：鼠标排斥后 Logo 很久不能恢复

**原因**：使用了持续积累的速度/位移物理状态，缺少回弹或阻尼。

**当前方案**：每帧从稳定目标位置重新计算临时排斥偏移，不积累位置：

```ts
const influence = Math.max(0, 156 - distance);
const push = Math.min(64, influence * 0.46);
screenX += (dx / distance) * push;
screenY += (dy / distance) * push;
```

鼠标移开后下一帧自然回到呼吸轨道，不需要额外弹簧状态。

### 问题 F：页面滚走后仍然耗电

`requestAnimationFrame` 在后台标签通常会被浏览器暂停，但元素仅滚出视口时页面仍然是可见状态。因此还要使用 `IntersectionObserver`。它可以异步观察元素与视口的交叉变化，避免滚动事件里高频读取布局：[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)。

```ts
const observer = new IntersectionObserver(([entry]) => {
  isVisible = entry.isIntersecting;
  if (isVisible) scheduleDraw();
  else cancelAnimationFrame(frame);
}, { rootMargin: "120px" });
```

同时监听 `visibilitychange`。页面转为 `hidden` 是停止用户不需要的 UI 更新的合适时机：[Document.visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)。

### 问题 G：高分屏清晰但性能骤降

Canvas 像素量近似按 DPR 平方增长：

```text
960 × 440 × 1.5² ≈ 950,400 像素
960 × 440 × 2²   ≈ 1,689,600 像素
```

DPR 从 1.5 提升到 2，像素量约增加 78%。对小圆点粒子而言，1.5 通常已经足够清晰。

### 问题 H：减少动态效果设置没有生效

仅写 CSS 不会自动停止 JavaScript Canvas。需要同时查询媒体条件：

```ts
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (reducedMotion) {
  drawStaticFinalLogo();
  return;
}
```

`prefers-reduced-motion` 用于检测用户是否要求减少非必要动态，尤其要避免持续的大幅缩放和移动：[MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-reduced-motion)。

## 5. 性能降级策略

建议按设备能力逐级降级，不要一开始就更换渲染技术：

| 档位 | 粒子数 | DPR 上限 | 交互 | 推荐场景 |
| --- | ---: | ---: | --- | --- |
| Desktop | 720 | 1.5 | 完整排斥 + 3D 偏转 | 宽度 > 900px |
| Tablet | 480 | 1.5 | 完整排斥 | 621–900px |
| Mobile | 280 | 1.25 | 关闭鼠标交互 | ≤ 620px |
| Reduced Motion | 静态 | 同上 | 关闭 | 系统减少动态 |

如果低端设备仍掉帧，可增加自动质量档位：统计最近 60 帧平均耗时；连续低于 50fps 时，将粒子数降到下一档并重新采样。不要每几帧来回切档，至少设置 5–10 秒冷却时间。

## 6. 调试与验收清单

### Chrome/Edge Performance

1. 打开 DevTools → Performance。
2. 录制 5–10 秒：静置、移动鼠标、滚出 Hero、切换标签页。
3. 检查主线程是否出现超过 50ms 的 Long Task。
4. 检查每帧 `draw` 是否稳定在 16.67ms 预算以内。
5. 检查滚出 Hero 后是否停止 Canvas 绘制。

### 视觉

- Logo 三层轮廓在呼吸过程中仍可辨认。
- 粒子没有碰到 Canvas 边界。
- 呼吸没有造成 CTA 或文字位移。
- 360、390、768、1280、1440px 均无横向滚动。

### 可访问性

- Reduced Motion 下只显示静态最终 Logo。
- Canvas 不获取焦点，不拦截鼠标。
- 语义由外层 `role="img"` 和 `aria-label` 提供。
- 页面切换后 H1 仍是焦点落点。

## 7. 后续什么时候考虑 WebGL

满足以下任意两项时，再评估 WebGL：

- 粒子数量超过 2000。
- 需要真实 3D 相机、深度排序或大规模力场。
- Canvas 2D 已降低 DPR 和粒子数，仍持续超过 16.67ms。
- 需要在多个全屏区域同时运行粒子。

否则 Canvas 2D 的维护成本、可访问性控制和首屏包体都更适合当前 Zipax 网站。
