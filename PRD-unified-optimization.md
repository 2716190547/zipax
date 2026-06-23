# zipax 网站界面统一优化 + 动画结合方案

## 版本信息
- **版本**: v4.0
- **日期**: 2026-06-22
- **目标**: 统一界面风格 + 精心编排交互动画

---

## 1. 当前界面问题诊断

### 1.1 视觉不统一
| 区域 | 问题 | 影响 |
|------|------|------|
| Hero | 用 ZipaxWordmark 做标题，太大太抢眼 | 喧宾夺主 |
| Feature Cards | 4 张卡片完全一样，无视觉节奏 | 单调乏味 |
| Workflow | 步骤编号用 Chip，不够精致 | 缺乏设计感 |
| Local Section | orb 太抽象，用户不理解 | 信息传达弱 |
| CTA | 与 Hero 重复，没有新意 | 冗余 |

### 1.2 层次不分明
| 问题 | 现状 | 应有 |
|------|------|------|
| 标题层级 | Hero 标题 = Logo | 应该是文字标题 |
| 区分度 | 所有 Section 间距一样 | 应有主次之分 |
| 留白 | 大量无意义留白 | 应该有节奏感 |

### 1.3 组件不统一
| 组件 | 问题 |
|------|------|
| 卡片圆角 | 有的 24px，有的 32px |
| 阴影 | 有的用 var(--shadow-soft)，有的写死 |
| 过渡时间 | 180ms / 300ms 混用 |

---

## 2. 界面统一优化方案

### 2.1 Hero 区域重构
**现状**: ZipaxWordmark 作为标题，太大
**优化**: 使用文字标题 + 简洁副标题

```
[图标]
zipax
轻快、开源的图片与 PDF 压缩工具。
手动压缩、文件夹自动压缩、托盘常驻，一个小巧桌面 app 搞定。

[下载按钮] [文档按钮] [GitHub]

✓ 图片 + PDF  ✓ 文件夹自动化  ✓ 本地处理
```

**改动**:
- 移除 ZipaxWordmark 做标题
- 使用 h1 文字标题
- 图标缩小放在标题上方
- 简化 hero 区域布局

### 2.2 Feature Cards 视觉节奏
**现状**: 4 张卡片完全一样
**优化**: 添加视觉变化

```
卡片 1: 蓝色图标背景 (压缩)
卡片 2: 浅蓝图标背景 (自动化)
卡片 3: 透明图标背景 (开源)
卡片 4: 蓝色图标背景 (更新)
```

**改动**:
- 图标背景色交替变化
- 卡片内间距统一为 24px
- 添加 hover 时的边框颜色变化

### 2.3 Workflow 步骤优化
**现状**: Chip 数字 + 文字
**优化**: 更精致的步骤指示

```
① 选择 → ② 压缩 → ③ 继续工作
```

**改动**:
- 步骤之间添加连接线
- 数字使用圆形背景
- 添加 hover 时的微动效

### 2.4 Local Section 简化
**现状**: 抽象 orb + 文字
**优化**: 更直观的价值展示

```
[简洁图标]
需要时很快，不需要时隐身。

✓ 妥善保留原文件
✓ 无需注册账号
✓ 免费且开源
```

**改动**:
- 移除抽象 orb
- 使用简洁的图标或插图
- 保持文字内容

### 2.5 CTA 区域优化
**现状**: 与 Hero 重复
**优化**: 差异化的收尾

```
让每个文件轻一点。

下载 zipax，把压缩变成一步完成的小习惯。

[下载按钮]
```

**改动**:
- 简化布局，居中对齐
- 添加微妙的背景渐变
- 按钮添加脉冲效果

---

## 3. 组件系统统一

### 3.1 圆角系统
```css
--radius-sm: 8px;    /* 小元素: 标签、小按钮 */
--radius-md: 12px;   /* 中元素: 输入框、卡片 */
--radius-lg: 16px;   /* 大元素: 弹窗、大卡片 */
--radius-xl: 24px;   /* 特大: CTA 区域 */
```

### 3.2 阴影系统
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
--shadow-md: 0 4px 16px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.16);
```

### 3.3 过渡系统
```css
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;
```

---

## 4. 动画结合方案

### 4.1 Header 动画
```
[界面优化] 统一导航项样式，活跃状态使用滑动指示器
[动画结合] 
  - 页面加载: 从上方滑入 + 模糊渐显 (400ms)
  - 导航切换: 活跃指示器 layoutId 滑动 (300ms spring)
  - 下拉菜单: scale + fade 进入 (200ms)
```

### 4.2 Hero 动画
```
[界面优化] 文字标题代替 Logo，简化布局
[动画结合]
  - 标题: FadeInUp (100ms)
  - 副标题: FadeInUp (200ms)
  - 描述: FadeInUp (300ms)
  - 按钮: StaggerChildren (400ms, 间隔 80ms)
  - 标签: FadeInScale (600ms)
  - 截图: 淡入 + 3D 倾斜 (800ms)
```

### 4.3 Feature Cards 动画
```
[界面优化] 图标背景色交替，添加 hover 边框变化
[动画结合]
  - 入场: StaggerChildren (从左到右, 间隔 100ms)
  - Hover: y: -8 + boxShadow 加深 (spring 400)
  - 图标: hover 时 rotate: 5 (spring 300)
  - 边框: hover 时 border-color 变蓝 (250ms)
```

### 4.4 Workflow 动画
```
[界面优化] 步骤连接线，圆形数字
[动画结合]
  - 左侧文字: SlideInLeft (spring 200)
  - 右侧截图: SlideInRight (spring 200)
  - 步骤: StaggerChildren (从上到下, 间隔 120ms)
  - 连接线: scaleX 从 0 到 1 (300ms, 延迟跟随步骤)
  - 数字: scale 弹入 (spring 300)
```

### 4.5 Local Section 动画
```
[界面优化] 移除 orb，简化布局
[动画结合]
  - 容器: FadeInUp (500ms)
  - 列表项: StaggerChildren (间隔 100ms)
  - 图标: 从左侧弹入 (spring 300)
  - 文字: FadeInUp (跟随图标)
```

### 4.6 CTA 动画
```
[界面优化] 居中布局，简化内容
[动画结合]
  - 标题: FadeInUp (400ms)
  - 描述: FadeInUp (500ms)
  - 按钮: scale 弹入 + 脉冲 (600ms)
  - 背景: 渐变色循环动画 (循环)
```

### 4.7 页面过渡动画
```
[界面优化] 统一页面结构
[动画结合]
  - 路由切换: AnimatePresence mode="wait"
  - 进入: opacity 0→1 + y 20→0 (300ms)
  - 退出: opacity 1→0 + y 0→-20 (200ms)
```

### 4.8 滚动动画
```
[界面优化] 统一 Section 间距
[动画结合]
  - 滚动进度条: scaleX (固定在顶部)
  - Section 进入: FadeInUp (once: true, amount: 0.2)
  - 视差效果: Hero 截图 useScroll (可选)
```

---

## 5. 动画时间线编排

### 5.1 首页完整时间线
```
0ms     Header 滑入 + 模糊渐显
100ms   Hero 标题淡入上移
200ms   Hero 副标题淡入
300ms   Hero 描述淡入
400ms   Hero 按钮组交错弹入 (间隔 80ms)
600ms   Hero 标签淡入缩放
800ms   Hero 截图淡入 + 3D 倾斜

滚动触发 (once: true):
20%     Feature 标题淡入
25%     Feature 卡片交错进入 (间隔 100ms)
35%     Workflow 标题淡入
40%     Workflow 左右滑入
50%     Workflow 步骤交错进入 + 连接线展开
55%     Local 标题淡入
65%     Local 列表交错进入
75%     CTA 标题淡入
80%     CTA 按钮弹入 + 脉冲
```

### 5.2 页面切换时间线
```
当前页面:
  0ms    开始退出 (opacity→0, y→-20)
  200ms  退出完成

新页面:
  100ms  开始进入 (opacity→1, y→0)
  400ms  进入完成
  400ms+ 触发页面内滚动动画
```

### 5.3 交互反馈时间线
```
Hover 卡片:
  0ms    y→-8, boxShadow 加深
  150ms  图标 rotate: 5
  200ms  边框变蓝

Click 按钮:
  0ms    scale: 0.97
  100ms  scale: 1
  150ms  触发导航/下载
```

---

## 6. 实施计划

### Phase 1: 界面统一 (无动画)
1. 统一圆角系统
2. 统一阴影系统
3. 统一过渡时间
4. Hero 区域重构 (文字标题)
5. Feature Cards 视觉变化
6. Local Section 简化
7. CTA 区域优化

### Phase 2: 基础动画
1. 创建动画工具函数
2. Header 入场动画
3. Hero 入场动画序列
4. 页面过渡动画

### Phase 3: 滚动动画
1. Feature Cards 交错进入
2. Workflow 左右滑入 + 步骤动画
3. Local Section 渐入
4. CTA 弹入
5. 滚动进度条

### Phase 4: 交互动画
1. 按钮 hover/tap
2. 卡片 hover
3. 导航滑动指示器
4. 链接箭头动画

### Phase 5: 特效动画
1. Hero 截图 3D 倾斜
2. 视差滚动 (可选)
3. 脉冲效果
4. 加载状态

---

**文档状态**: 待审批
**下一步**: 确认后开始 Phase 1
