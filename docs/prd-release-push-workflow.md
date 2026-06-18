# PRD: zipax 发布推送流程

## 目标

建立一套标准化的 zipax 版本发布流程，涵盖从版本号更新到 GitHub Release 正式发布的完整路径。确保每次发布都包含正确的签名、构建产物和更新说明。

## 用户

- 开发者：执行版本发布操作。
- 终端用户：通过 GitHub Release 下载安装包，或通过 Tauri updater 自动接收更新。

## 前置条件

| 条件 | 状态 | 说明 |
|------|------|------|
| GitHub 仓库 | 已配置 | `2716190547/zipax` |
| 签名密钥 | 已配置 | `~/.tauri/zipax.key` |
| GitHub Secrets | 已配置 | `TAURI_SIGNING_PRIVATE_KEY`、`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` |
| Release Workflow | 已配置 | `.github/workflows/release.yml` |
| 本地工具链 | 需安装 | Node.js 20+、Rust stable、npm |

### Secrets 配置方式

```bash
cat ~/.tauri/zipax.key | gh secret set TAURI_SIGNING_PRIVATE_KEY --repo 2716190547/zipax
echo -n "zipax-update-key" | gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo 2716190547/zipax
gh secret list --repo 2716190547/zipax
```

## 发布流程

```
┌─────────────────────────────────────────────────────────────┐
│  阶段 1: 版本号更新                                          │
│  - package.json → version                                   │
│  - Cargo.toml → workspace.package.version                   │
│  - src-tauri/tauri.conf.json → version                      │
│  - package-lock.json → version                              │
│                                                             │
│  版本号规则:                                                 │
│    0.X.0  → 功能性更新（新特性、重构）                         │
│    0.X.Y  → 补丁修复（bug 修复、小调整）                      │
├─────────────────────────────────────────────────────────────┤
│  阶段 2: 提交与推送                                          │
│  git add -A                                                 │
│  git commit -m "Bump version to X.Y.Z"                      │
│  git push origin master                                     │
├─────────────────────────────────────────────────────────────┤
│  阶段 3: 打 Tag 并推送                                       │
│  git tag vX.Y.Z                                             │
│  git push origin vX.Y.Z                                     │
│                                                             │
│  ⚠️ Tag 一旦推送不可修改，务必确认版本号正确                    │
├─────────────────────────────────────────────────────────────┤
│  阶段 4: GitHub Actions 自动构建                              │
│  触发条件: 推送 v* 格式的 tag                                  │
│                                                             │
│  Workflow 执行:                                              │
│  ├─ Checkout 代码                                            │
│  ├─ Setup Node.js 20 + Rust stable                          │
│  ├─ npm ci 安装依赖                                          │
│  ├─ npm run build 构建前端                                    │
│  ├─ tauri-action 构建 Tauri 应用                              │
│  │   ├─ 编译 Rust binary                                    │
│  │   ├─ 打包 .app / .msi / .AppImage                        │
│  │   ├─ 用 TAURI_SIGNING_PRIVATE_KEY 签名                   │
│  │   ├─ 生成 latest.json (updater manifest)                 │
│  │   └─ 创建 GitHub Release (Draft)                         │
│  └─ 上传 updater artifacts                                  │
│                                                             │
│  产物:                                                      │
│  ├─ zipax_aarch64.app.tar.gz + .sig (macOS updater)        │
│  ├─ zipax_0.X.Y_aarch64.dmg (macOS 安装包)                 │
│  ├─ zipax_0.X.Y_x64-setup.exe + .sig (Windows)             │
│  ├─ zipax_0.X.Y_x64_en-US.msi + .sig (Windows)             │
│  ├─ zipax_0.X.Y_amd64.deb + .sig (Linux)                   │
│  ├─ zipax_0.X.Y_amd64.AppImage + .sig (Linux)              │
│  └─ latest.json (updater 清单)                               │
├─────────────────────────────────────────────────────────────┤
│  阶段 5: 发布 Draft Release                                  │
│  gh release edit vX.Y.Z -F RELEASE_NOTES.md --draft=false  │
│                                                             │
│  或手动在 GitHub 页面编辑 Draft → Publish release            │
└─────────────────────────────────────────────────────────────┘
```

## 阶段详细说明

### 阶段 1: 版本号更新

需同步更新以下 4 个文件，确保版本一致：

| 文件 | 字段 | 示例 |
|------|------|------|
| `package.json` | `"version"` | `"0.24.0"` |
| `Cargo.toml` | `workspace.package.version` | `version = "0.24.0"` |
| `src-tauri/tauri.conf.json` | `"version"` | `"0.24.0"` |
| `package-lock.json` | `"version"` (两处) | `"0.24.0"` |

### 阶段 2: 提交

```bash
git add -A
git commit -m "Bump version to X.Y.Z"
git push origin master
```

### 阶段 3: 打 Tag

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

### 阶段 4: 自动构建

推送 tag 后 GitHub Actions 自动触发，无需手动干预。

查看构建状态：
```bash
gh run list --repo 2716190547/zipax --limit 5
gh run watch <run-id> --repo 2716190547/zipax
```

### 阶段 5: 发布 Release

```bash
gh release edit vX.Y.Z --repo 2716190547/zipax -F RELEASE_NOTES.md --draft=false
```

发布后自动更新器即可检测到新版本。

## 本地验证（发布前）

在打 Tag 之前，可通过本地构建确认构建产物正常：

```bash
npm run build:install:open
```

此脚本自动执行：停止旧进程 → 构建前端 → Tauri 构建 → 安装到 ~/Applications → 打开应用。

## 历史版本参考

| 版本 | 类型 | Tag |
|------|------|-----|
| v0.24.0 | 重构发布 | `v0.24.0` |
| v0.23.1 | 补丁修复 | `v0.23.1` |
| v0.22 | 开源发布 | `v0.22` |
| v0.2.1 | 功能更新 | `v0.2.1` |
| v0.2.0 | 初始版本 | `v0.2.0` |

## 已知风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 签名密钥缺失 | 构建失败，无法生成 updater 产物 | 确认 GitHub Secrets 已配置 |
| 版本号不一致 | 自动更新可能出错 | 严格同步 4 个文件 |
| Tag 推错版本 | 无法撤回，需重新打 Tag | 推送前确认版本号 |
| HTTPS 连接超时 | 推送到 GitHub 失败 | 切换为 SSH remote (`git@github.com:2716190547/zipax.git`) |
| macOS Only | Windows/Linux 构建未启用 | 后续可取消注释 workflow matrix |

## 验收标准

- [ ] 版本号在 4 个配置文件中一致
- [ ] `git push origin master` 成功
- [ ] `git tag vX.Y.Z` 和 `git push origin vX.Y.Z` 成功
- [ ] GitHub Actions 构建成功 (绿色)
- [ ] Draft Release 创建成功，包含所有平台产物
- [ ] `latest.json` 包含正确的版本和下载链接
- [ ] Release 正式发布后，自动更新器可检测到新版本
