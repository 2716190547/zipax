/**
 * Icon 映射
 *
 * Tab / 通用图标: Lucide 线性图标
 * AppIcon: 应用图标 (渐变 Z)
 */
import type { FC } from "react";
import appIconUrl from "../../src-tauri/icons/128x128.png";

// ─── 应用图标 ──────────────────────────────────────
interface AppIconProps {
  size?: number;
  className?: string;
}

interface IconProps {
  size?: number;
  className?: string;
}

/** 应用图标 — 渐变方块 + Z */
export const AppIcon: FC<AppIconProps> = ({ size = 16, className = "" }) => (
  <img
    src={appIconUrl}
    alt=""
    className={`shrink-0 object-cover ${className}`}
    style={{ width: size, height: size }}
  />
);

export const Github: FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.85.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.12 10.12 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

// ─── Lucide 图标 ───────────────────────────────────
export {
  // Tab 图标
  House,           // 首页
  Image,           // 图像
  Settings,        // ⚙ 通用
  ClipboardList,   // 📋 工作流
  Zap,             // ⚡ 自动化
  Package,         // 📦 依赖
  Sparkles,        // ✨ 关于 (仅内部使用)

  // 设置图标
  Power,           // ⏻ 开机自启
  Palette,         // 外观
  SunMoon,         // ◐ 外观
  RefreshCw,       // 🔄 自动更新
  BarChart3,       // 📊 统计
  Languages,       // 语言
  Dock,            // 后台 / Dock

  // 操作图标
  Bookmark,        // 🔖 保留元数据
  FileText,        // 📄 覆盖原图
  Folder,          // 📁 文件夹
  AlertTriangle,   // ⚠️ 错误
  Wrench,          // 🔧 工具
  SlidersHorizontal, // 压缩设置
  SlidersVertical, // 压缩等级
  ClipboardCopy,   // 📋 自动复制
  CheckCircle,     // ✅ 跳过已压缩
  Leaf,            // 🍃 装饰
  Coffee,          // ☕ 赞助
  Ellipsis,        // 更多

  // 通用图标
  Upload,          // 上传/拖拽
  Download,        // 保存/输出
  Crop,            // 调整尺寸
  Plus,            // 添加
  Trash2,          // 删除
  X,               // 关闭
  Minus,           // 最小化
  Info,            // 信息
  ChevronRight,    // 箭头
  type LucideIcon, // 类型
} from "lucide-react";
