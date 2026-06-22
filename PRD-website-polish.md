# PRD: zipax 网站内容与体验优化 v2.0

## 版本信息
- **版本**: v2.0
- **日期**: 2026-06-18
- **作者**: opencode
- **状态**: 待审批

---

## 1. 问题诊断

### 1.1 下拉菜单问题
**现象**: Header 右侧两个下拉菜单显示为"系统"和"简"，含义不清

| 问题 | 原因 | 影响 |
|------|------|------|
| "系统" 含义模糊 | 用户不知道这是主题切换器 | 无法找到浅色/深色模式 |
| "简" 含义模糊 | 单字缩写无法传达"简体中文" | 无法理解语言切换功能 |
| 无视觉图标区分 | 两个下拉外观相同 | 用户不知道分别控制什么 |

### 1.2 渐变色裁切
**现象**: 页面顶部蓝色渐变被裁切了一部分

**原因分析**:
```css
body {
  background:
    radial-gradient(circle at 15% 0%, rgba(22, 135, 242, 0.25), transparent 28rem),
    /* 渐变中心在左上角 15% 0%，被 header 遮挡 */
}
.site-header {
  position: sticky;
  top: 14px;
  z-index: 20; /* 高于渐变 */
}
```

### 1.3 无意义内容审查

#### 首页问题内容
| 内容 | 问题 | 建议 |
|------|------|------|
| `v0.1.0 · Tauri · Rust · React` | 技术版本号，用户不关心 | 删除或移至页脚 |
| "Open-source Rust core" | 技术实现细节 | 改为用户利益点 |
| "Signed auto updates" | 过于技术化 | 改为"自动更新" |
| Tech stack chips | 开发者信息 | 删除或简化 |

#### 文档页面问题
| 内容 | 问题 |
|------|------|
| FAQ 中 "ZIPax" 大小写不一致 | 有的地方写 "ZIPax"，有的写 "zipax" |
| 部分 FAQ 回答过于简略 | 缺少具体操作步骤 |

---

## 2. 优化方案

### 2.1 下拉菜单重构 (P0)

#### 2.1.1 主题选择器
**方案**: 添加图标 + 完整标签

```
[ ☀️ 浅色 ▾ ]  →  改为  [ 🌓 主题 ▾ ]
                        展开: 浅色 / 深色 / 跟随系统
```

**实现**:
- 添加太阳/月亮/电脑图标
- 显示当前选中项的文字（不仅缩写）
- aria-label 明确说明功能

#### 2.1.2 语言选择器
**方案**: 显示完整语言名称

```
[ 简 ▾ ]  →  改为  [ 🌐 语言 ▾ ]
                   展开: English / 简体中文 / 繁體中文 / ...
```

**实现**:
- 使用完整语言名称而非缩写
- 添加地球图标
- 当前语言高亮显示

### 2.2 渐变色修复 (P0)

**方案**: 调整渐变位置 + 增加渐变层

```css
body {
  background:
    radial-gradient(circle at 20% -5%, rgba(22, 135, 242, 0.3), transparent 30rem),
    radial-gradient(circle at 85% 8%, rgba(61, 184, 255, 0.2), transparent 26rem),
    var(--bg);
  background-attachment: fixed;
}
```

**要点**:
- 渐变中心 y 轴从 `0%` 改为 `-5%`，确保完整显示
- 增加 `background-attachment: fixed` 防止滚动时渐变移动
- 稍微增强渐变不透明度

### 2.3 内容精简 (P0)

#### 2.3.1 首页优化

**删除**:
- 版本号标签 `v0.1.0 · Tauri · Rust · React`
- Tech stack chips 区域

**修改 Feature Cards**:
| 原文 | 修改后 | 理由 |
|------|--------|------|
| Manual image and PDF compression | 手动压缩图片与 PDF | 更简洁 |
| Folder automation from the menu bar | 文件夹自动压缩 | 去掉技术细节 |
| Open-source Rust core | 完全开源免费 | 强调用户利益 |
| Signed auto updates | 自动更新 | 去掉签名细节 |

**Hero 文案优化**:
```
原: "A lively, open-source compressor for images and PDFs."
改: "轻快、开源的图片与 PDF 压缩工具。"

原: "Compress files manually, keep folders watched, and stay updated from a tiny desktop app."
改: "手动压缩、文件夹自动压缩、托盘常驻，一个小巧桌面 app 搞定。"
```

#### 2.3.2 下载页优化

**删除**:
- 重复的版本号 eyebrow

**简化推荐卡片**:
```
原: "Recommended · macOS"
改: "为你推荐"
```

#### 2.3.3 支持页优化

**增加内容**:
- 添加"常见问题"链接到文档页
- 添加"功能建议"链接
- 优化卡片文案，更有温度

### 2.4 文档页优化 (P1)

#### 2.4.1 FAQ 统一
- 统一使用 "zipax" 小写
- 每个 FAQ 回答增加具体步骤
- 添加相关链接

#### 2.4.2 安装步骤优化
- macOS: 增加 Gatekeeper 绕过详细步骤
- Windows: 增加 SmartScreen 处理截图说明
- Linux: 增加依赖安装命令

### 2.5 视觉微调 (P1)

#### 2.5.1 Header 优化
- 下拉菜单增加图标
- 调整下拉菜单宽度，适应长文本
- 优化移动端下拉菜单布局

#### 2.5.2 卡片 hover 效果
- Feature cards: 保持 translateY(-4px)
- Download cards: 边框变蓝
- Support cards: 背景渐变

---

## 3. 技术实现

### 3.1 文件修改清单

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `src/styles/base.css` | 修复渐变色位置 | P0 |
| `src/components/Header.tsx` | 重构下拉菜单 | P0 |
| `src/components/HeroSelect.tsx` | 添加图标支持 | P0 |
| `src/pages/HomePage.tsx` | 删除冗余内容 | P0 |
| `src/i18n/messages.ts` | 更新文案 | P0 |
| `src/data/docs.ts` | 统一 FAQ 内容 | P1 |
| `src/pages/SupportPage.tsx` | 增加支持内容 | P1 |

### 3.2 HeroSelect 组件改造

```tsx
type HeroSelectProps<T> = {
  ariaLabel: string;
  value: T;
  onChange: (value: T) => void;
  options: { key: T; label: string; icon?: ReactNode }[];  // 新增 icon
  className?: string;
};
```

### 3.3 渐变色 CSS 修复

```css
body {
  background:
    radial-gradient(circle at 20% -5%, rgba(22, 135, 242, 0.3), transparent 30rem),
    radial-gradient(circle at 85% 8%, rgba(61, 184, 255, 0.2), transparent 26rem),
    var(--bg);
  background-attachment: fixed;
}
```

---

## 4. 验收标准

### 4.1 下拉菜单
- [ ] 主题选择器显示图标 + 完整标签
- [ ] 语言选择器显示完整语言名称
- [ ] 下拉菜单 aria-label 清晰
- [ ] 移动端下拉菜单正常工作

### 4.2 渐变色
- [ ] 顶部渐变完整显示，无裁切
- [ ] 滚动时渐变保持固定
- [ ] 深色模式下渐变正常

### 4.3 内容
- [ ] 首页无技术术语
- [ ] Feature cards 文案简洁易懂
- [ ] FAQ 大小写统一
- [ ] 支持页内容完整

### 4.4 响应式
- [ ] 移动端下拉菜单正常
- [ ] 平板端布局合理
- [ ] 大屏端无拉伸

---

## 5. 实施顺序

### Phase 1: 关键修复
1. 修复渐变色裁切
2. 重构下拉菜单
3. 精简首页内容

### Phase 2: 内容优化
1. 更新 i18n 文案
2. 统一 FAQ 内容
3. 优化支持页

### Phase 3: 细节打磨
1. 视觉微调
2. 响应式优化
3. 测试与修复

---

## 6. 风险与注意事项

### 6.1 风险
- 下拉菜单重构可能影响现有交互
- 渐变色调整需要测试深色模式

### 6.2 注意事项
- 保持现有路由结构不变
- 保持 i18n 结构不变
- 保持组件 API 兼容

---

**文档状态**: 待审批
**下一步**: 确认 PRD 后开始 Phase 1
