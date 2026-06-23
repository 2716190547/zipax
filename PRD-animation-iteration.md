# zipax 网站动画迭代方案 v3.0

## 版本信息
- **版本**: v3.0
- **日期**: 2026-06-22
- **核心**: Framer Motion 动画系统

---

## 1. 动画设计原则

### 1.1 核心理念
- **有意义的动效**: 每个动画都有目的（引导注意力、反馈交互、展示变化）
- **自然流畅**: 使用 spring 物理动画，避免机械感
- **层次分明**: 不同层级使用不同动画强度
- **性能优先**: 只动画 transform 和 opacity

### 1.2 动画时间轴概览
```
页面加载
  | (0-300ms)
Header 滑入 + 模糊渐显
  | (100-400ms)
Hero 文字逐行淡入上移
  | (300-600ms)
Hero 按钮组交错弹入
  | (500-800ms)
截图淡入 + 缩放 + 3D 倾斜
  | (滚动触发)
Feature cards 交错进入
  |
Workflow 左右滑入 + 步骤渐入
  |
Local 区域渐入 + orb 呼吸
  |
CTA 弹入 + 脉冲
```

---

## 2. 动画类型库

### 2.1 入场动画

**FadeInUp** - 标题、段落
```tsx
initial: { opacity: 0, y: 30 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
```

**FadeInScale** - 卡片、截图
```tsx
initial: { opacity: 0, scale: 0.95 }
animate: { opacity: 1, scale: 1 }
transition: { type: "spring", stiffness: 300, damping: 30 }
```

**SlideInLeft/Right** - 分栏布局
```tsx
initial: { opacity: 0, x: -50 }
animate: { opacity: 1, x: 0 }
transition: { type: "spring", stiffness: 200, damping: 25 }
```

**StaggerChildren** - 列表、网格
```tsx
container: { animate: { transition: { staggerChildren: 0.08 } } }
item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
```

### 2.2 交互动画

**HoverLift** - 悬停上浮
```tsx
whileHover: { y: -6, transition: { type: "spring", stiffness: 400 } }
```

**HoverGlow** - 悬停发光
```tsx
whileHover: { boxShadow: "0 8px 30px rgba(22, 135, 242, 0.25)" }
```

**PressScale** - 按压缩放
```tsx
whileTap: { scale: 0.97 }
```

### 2.3 特效动画

**Parallax** - 视差滚动
```tsx
const y = useScroll({ target: ref, offset: ["start end", "end start"] })
const parallaxY = useTransform(y, [0, 1], [50, -50])
```

**MagneticButton** - 磁性按钮
```tsx
// 鼠标靠近时按钮微微跟随
const x = useMotionValue(0)
```

---

## 3. 分区动画设计

### 3.1 Header
- **动画**: 从上方滑入 + 模糊效果渐显
- **触发**: 页面加载
- **时长**: 400ms

```tsx
initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
transition={{ duration: 0.4, ease: "easeOut" }}
```

### 3.2 Hero 区域
- 标题: FadeInUp (100ms)
- 副标题: FadeInUp (200ms)
- 描述: FadeInUp (300ms)
- 按钮组: StaggerChildren (400ms, 间隔 80ms)
- 标签: FadeInScale (600ms)

### 3.3 Hero 截图
- **动画**: 淡入 + 缩放 + 鼠标 3D 倾斜
- **触发**: 页面加载后 600ms
- **特效**: 鼠标移动时产生 perspective 旋转

```tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
whileHover={{ rotateY: 5, rotateX: -3 }}
```

### 3.4 Feature Cards
- **动画**: 交错进入 (stagger 100ms)
- **触发**: 滚动到视口 20%
- **悬停**: 上浮 + 阴影加深 + 图标微转

### 3.5 Workflow 区域
- 左侧文字: SlideInLeft
- 右侧截图: SlideInRight
- 步骤: StaggerChildren (从上到下)
- **触发**: 滚动到视口 30%

### 3.6 Local 区域
- 背景 orb: 呼吸动画 (循环)
- 文字: FadeInUp
- 列表项: StaggerChildren + 图标弹入

### 3.7 CTA 区域
- 标题: FadeInUp
- 按钮: 弹入 + 脉冲效果
- **触发**: 滚动到视口 25%

---

## 4. 交互动画细节

### 4.1 按钮系统
```tsx
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 }
}
// 主按钮 hover 时增加 boxShadow
```

### 4.2 卡片系统
```tsx
const cardVariants = {
  rest: { y: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  hover: { y: -8, boxShadow: "0 12px 40px rgba(22, 135, 242, 0.15)" }
}
```

### 4.3 导航系统
- 活跃状态使用 `layoutId` 滑动指示器
- hover 时下划线 scaleX 从 0 到 1

---

## 5. 滚动动画系统

### 5.1 Intersection Observer
```tsx
const useInViewAnimation = (threshold = 0.2) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  return { ref, isInView }
}
```

### 5.2 滚动进度条
```tsx
const { scrollYProgress } = useScroll()
const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
```

---

## 6. 页面过渡系统

### 6.1 路由过渡
```tsx
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
}
```

### 6.2 AnimatePresence
```tsx
<AnimatePresence mode="wait">
  <motion.div key={route} {...pageTransition}>
    {children}
  </motion.div>
</AnimatePresence>
```

---

## 7. 完整时间线编排

### 7.1 首页时间线
```
0ms     - Header 滑入
100ms   - Hero 标题淡入
200ms   - Hero 副标题淡入
300ms   - Hero 描述淡入
400ms   - Hero 按钮组交错淡入
600ms   - Hero 截图淡入缩放
800ms   - Hero 标签淡入

滚动触发:
20%     - Feature 标题淡入
25%     - Feature 卡片交错进入 (每张 100ms)
35%     - Workflow 标题淡入
40%     - Workflow 左右滑入
50%     - Workflow 步骤交错进入
55%     - Local 标题淡入
60%     - Local orb 呼吸动画启动
65%     - Local 列表交错进入
75%     - CTA 标题淡入
80%     - CTA 按钮弹入
```

### 7.2 动画编排配置
```tsx
const timeline = {
  header: { delay: 0 },
  hero: {
    title: { delay: 0.1 },
    subtitle: { delay: 0.2 },
    description: { delay: 0.3 },
    buttons: { delay: 0.4, stagger: 0.08 },
    screenshot: { delay: 0.6 },
    tags: { delay: 0.8 }
  },
  features: { stagger: 0.1 },
  workflow: { stagger: 0.15 },
  local: { stagger: 0.1 },
  cta: { delay: 0 }
}
```

---

## 8. 性能优化

### 8.1 动画优化
- 只动画 `transform` 和 `opacity`
- 使用 `will-change` 提示浏览器
- 大量元素使用 `IntersectionObserver` 按需动画

### 8.2 减少重排
```tsx
// 好
style={{ transform: `translateY(${y}px)` }}
// 避免
style={{ top: `${y}px` }}
```

---

## 9. 实施计划

### Phase 1: 基础动画框架
1. 创建动画工具函数 (`src/lib/animations.ts`)
2. 创建 `useScrollAnimation` hook
3. Header 动画
4. Hero 区域入场动画
5. 页面过渡动画 (AnimatePresence)

### Phase 2: 滚动动画
1. Feature Cards 交错进入
2. Workflow 区域左右滑入
3. Local 区域渐入
4. CTA 区域弹入
5. 滚动进度条

### Phase 3: 交互动画
1. 按钮 hover/tap 效果
2. 卡片 hover 效果
3. 导航滑动指示器
4. 链接箭头动画

### Phase 4: 特效动画
1. Hero 截图 3D 倾斜
2. 视差滚动效果
3. 磁性按钮
4. Orb 呼吸动画

### Phase 5: 微交互
1. 加载骨架屏
2. 下载成功反馈
3. 工具提示动画
4. 数字递增动画

---

**文档状态**: 待审批
**下一步**: 确认后开始 Phase 1
