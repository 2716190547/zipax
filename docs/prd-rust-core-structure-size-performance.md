# PRD: Rust 核心结构整理、体积与性能优化

## 背景

zipax Tauri 版当前由 Rust workspace 支撑：

- `crates/zipax-core`: 压缩核心、格式识别、压缩计划、格式编码。
- `crates/zipax-cli`: 命令行入口，复用 core。
- `src-tauri`: Tauri 桌面桥接，负责前端命令、托盘、自动启动、文件夹监听和 app 生命周期。

当前 macOS `.app` 约 20-21 MB，主要体积来自 Rust/Tauri 可执行文件。用户希望整理 Rust 功能，同时兼顾体积和性能，但不希望采用会明显拖慢 release 构建的优化项。

## 目标

- 保留 CLI。
- 保留现有格式能力，不通过删格式来瘦身。
- 明确 core、CLI、Tauri app 的职责边界。
- 优先做不会明显拖慢 release 构建的体积优化。
- 优先做低风险性能优化，例如减少重复转换、重复探测和重复 I/O。
- 保持前端请求结构和用户可见行为兼容。

## 非目标

- 暂不启用会明显拖慢 release 构建的 `lto = true`、`codegen-units = 1`。
- 暂不使用 `panic = "abort"`。
- 不重写压缩算法。
- 不移除 JPEG、PNG、WebP、AVIF、HEIC/HEIF、TIFF、GIF、PDF 相关能力。
- 不改变发布流程和自动更新逻辑。

## 阶段规划

### Phase 1: Rust 结构体检

梳理模块职责：

| 模块 | 职责 | 观察 |
| --- | --- | --- |
| `zipax-core/config.rs` | 压缩模式、质量等级、输出格式、选项模型 | 适合承载通用解析和默认值 |
| `zipax-core/format.rs` | 文件扩展名到格式类型 | 格式识别边界清楚 |
| `zipax-core/plan.rs` | 压缩计划和输出路径预估 | 可继续保持纯 core 逻辑 |
| `zipax-core/compress/*` | 具体格式编码和压缩调度 | 性能优化应小步推进 |
| `zipax-cli/main.rs` | CLI 参数和输出 | 应尽量只做 CLI 参数适配 |
| `src-tauri/commands.rs` | Tauri DTO、托盘、自动启动、watcher、文件操作、格式转换 | 文件偏大，后续可拆分 |
| `src-tauri/watcher.rs` | 文件夹监听和文件稳定性等待 | 可继续独立 |

验收：

- 输出职责表。
- 标记可下沉 core 的重复逻辑。

### Phase 2: 低风险体积优化

优先考虑：

```toml
[profile.release]
strip = true
```

暂不考虑：

```toml
lto = true
codegen-units = 1
panic = "abort"
```

验收：

- 记录优化前后的 `.app`、二进制、DMG、updater 包体积。
- release 构建时间不应明显变慢。

### Phase 3: Core 配置与格式转换收敛

将重复转换规则下沉到 core：

- `CompressionMode::from_key`
- `OutputFormat::from_key`
- `QualityLevel::from_u8`

让 Tauri app 和 CLI 复用同一套转换规则。

验收：

- app 和 CLI 不再各自维护完整解析表。
- CLI 保留并补齐现有输出格式能力。
- 构建和 core 测试通过。

### Phase 4: Tauri 命令拆分

将 `src-tauri/src/commands.rs` 拆为更小模块：

- `compression_commands`
- `tray_commands`
- `autostart`
- `file_commands`
- `watch_commands`

验收：

- Tauri command 名称不变。
- `lib.rs` 注册命令不出现大规模行为变化。
- `commands.rs` 或聚合模块只负责 re-export。

### Phase 5: 性能路径检查

优先检查：

- target-size 压缩中的多次编码和临时文件清理。
- PNG 临时文件读写是否可减少。
- PDF/HEIC 外部工具探测是否可缓存或提前失败。
- 自动化 watcher 是否重复触发已压缩输出。

验收：

- 每个性能改动都能单独验证。
- 不以牺牲输出质量或格式兼容为代价。

### Phase 6: 基准记录

建立轻量记录方式：

- `.app` 体积。
- `zipax-app` 二进制体积。
- DMG 体积。
- updater `.tar.gz` 体积。
- 常见格式压缩耗时和输出大小。

验收：

- 后续优化有可比较数据。
- 不引入复杂 benchmark 框架。

## 执行约束

- 每个阶段小步构建/测试。
- 不默认发布、不打 tag、不上传 Release。
- 不做会明显拖慢 release 构建的优化，除非用户再次确认。

## 执行状态

| 阶段 | 状态 | 结果 |
| --- | --- | --- |
| Phase 1 结构体检 | 已完成 | 明确 `commands.rs` 偏厚，格式/质量解析适合下沉 core |
| Phase 2 低风险体积优化 | 暂缓 | 用户确认暂不做会拖慢 release 的优化；`strip = true` 后续可单独评估 |
| Phase 3 配置转换收敛 | 已完成 | `CompressionMode::from_key`、`OutputFormat::from_key`、`QualityLevel::from_u8` 已下沉 core，app/CLI 复用；Tauri 请求到 `CompressOptions` 的构造已统一 |
| Phase 4 Tauri 命令拆分 | 已完成 | 拆出 `state.rs`、`autostart.rs`、`file_commands.rs`、`watch_commands.rs`、`tray_commands.rs`、`compression_options.rs`，command 名称保持不变 |
| Phase 5 性能路径检查 | 已完成当前安全范围 | 已消除手动压缩与 watcher 的重复配置构造；PDF/HEIC 外部工具探测已缓存；supported formats 由 core 提供并补齐 HEIC/HEIF；Rust clippy 已清理通过 |
| Phase 6 基准记录 | 已完成第一步 | 新增 `scripts/measure-build-size.sh` 记录 app、binary、DMG、updater 包体积 |

当前基准：

| 项目 | 体积 |
| --- | ---: |
| installed app | 20.3 MB |
| release binary | 19.4 MB |
| dmg | 9.2 MB |
| updater tar | 8.5 MB |
