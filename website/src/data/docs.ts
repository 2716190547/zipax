import type { Locale } from "../i18n/messages";

export type DocSection = {
  slug: DocSlug;
  title: string;
  body: string;
  steps: string[];
  faq?: { question: string; answer: string }[];
  troubleshooting?: DocTroubleshootingItem[];
};

export type DocTroubleshootingItem = {
  title: string;
  summary: string;
  causes: string[];
  solutions: string[];
  commands?: { label: string; code: string }[];
  warning?: string;
  sources?: { label: string; href: string }[];
};

export type DocSlug = "install" | "compress" | "automation" | "menu-bar" | "updates";

const docSlugs: DocSlug[] = ["install", "compress", "automation", "menu-bar", "updates"];

type LocalizedDocSection = Omit<DocSection, "slug">;

const docs: Record<Locale, LocalizedDocSection[]> = {
  "en-US": [
    {
      title: "Install zipax",
      body: "Download the package that matches your system from GitHub Releases, then open zipax like any other desktop app.",
      steps: [
        "macOS: open the DMG and drag zipax to Applications.",
        "Windows: run the setup package and launch zipax from Start.",
        "Linux: use the AppImage directly, or install the deb/rpm package.",
      ],
      troubleshooting: [
        {
          title: "macOS cannot verify the developer or refuses to open zipax",
          summary: "This is usually Gatekeeper's first-launch protection, not proof that the download is damaged. Verify the source before approving an exception.",
          causes: [
            "The app was installed outside the Mac App Store and needs first-launch approval.",
            "Security settings or an organization policy allow App Store apps only.",
            "The downloaded package does not match the Mac architecture.",
          ],
          solutions: [
            "Delete copies from unknown sources and download again from the zipax website or official GitHub Releases.",
            "Try to open zipax once, then open System Settings → Privacy & Security and choose Open Anyway for zipax.",
            "On a managed Mac, ask the administrator whether Developer ID apps are blocked by policy.",
          ],
          commands: [
            { label: "Check Mac architecture and package type", code: "uname -m\nfile ~/Downloads/zipax*.dmg" },
            { label: "Read-only Gatekeeper assessment", code: "spctl --assess --type execute --verbose=4 /Applications/zipax.app" },
          ],
          warning: "Do not bypass macOS security for a copy obtained from an unknown mirror. Apple warns that overriding unverified apps can expose the Mac to malware.",
          sources: [
            { label: "Apple: If you can't open an app on Mac", href: "https://support.apple.com/guide/mac-help/mchlp1519/mac" },
            { label: "Apple: Open an app from an unknown developer", href: "https://support.apple.com/guide/mac-help/mh40616/mac" },
          ],
        },
        {
          title: "macOS says the app is damaged",
          summary: "A damaged-app alert can mean an incomplete DMG, modified signed contents, revoked authorization, incompatibility, or detected malicious content. It is different from an unidentified-developer warning.",
          causes: [
            "The download was interrupted or altered by a proxy, cache, or third-party download tool.",
            "Files inside the signed app bundle changed after release.",
            "The build is incompatible with the installed macOS version or its authorization is no longer valid.",
          ],
          solutions: [
            "Move the current DMG and app to the Bin, then download the latest release again from the official source.",
            "Verify the DMG before copying the app to Applications. Do not keep running it from inside the DMG.",
            "Run the read-only signature checks below. If verification fails, stop and attach the output to a GitHub issue.",
          ],
          commands: [
            { label: "Verify the download and DMG", code: "cd ~/Downloads\nshasum -a 256 zipax*.dmg\nhdiutil verify zipax*.dmg" },
            { label: "Verify code signature and Gatekeeper", code: "codesign --verify --deep --strict --verbose=2 /Applications/zipax.app\nspctl --assess --type execute --verbose=4 /Applications/zipax.app" },
            { label: "Inspect quarantine attributes without changing them", code: "xattr -l /Applications/zipax.app" },
          ],
          warning: "Removing com.apple.quarantine is not a repair. It skips part of first-launch protection and cannot fix a genuinely corrupted or invalidly signed app.",
          sources: [
            { label: "Apple: Open apps safely on Mac", href: "https://support.apple.com/HT202491" },
            { label: "Apple: App closes or won't open", href: "https://support.apple.com/102152" },
          ],
        },
        {
          title: "Windows SmartScreen blocks setup or launch",
          summary: "SmartScreen considers reputation, signatures, and known threats. A new build may have limited reputation, but the source and signature still need verification.",
          causes: [
            "The release is new and has not accumulated download reputation.",
            "The signature is missing or invalid, or the file changed after signing.",
            "An organization policy blocks unrecognized applications.",
          ],
          solutions: [
            "Download only from the official release and inspect Digital Signatures in file properties.",
            "Use PowerShell to check the signature and SHA-256. Continue only when the signature status is Valid and the source is trusted.",
            "On a managed device, provide the hash and signature details to the administrator instead of disabling protection.",
          ],
          commands: [
            { label: "PowerShell signature and hash checks", code: "Get-AuthenticodeSignature .\\zipax*.exe | Format-List\nGet-FileHash .\\zipax*.exe -Algorithm SHA256" },
            { label: "Unblock this single verified file", code: "Unblock-File .\\zipax*.exe" },
          ],
          warning: "Do not disable Microsoft Defender or SmartScreen globally. Re-download or report the release when the signature is not Valid.",
          sources: [
            { label: "Microsoft Defender SmartScreen overview", href: "https://learn.microsoft.com/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/" },
          ],
        },
        {
          title: "Linux AppImage does nothing or reports a FUSE error",
          summary: "An AppImage needs executable permission. Some distributions also need a FUSE 2 compatibility library; permission and dependency errors should be diagnosed separately.",
          causes: [
            "The downloaded AppImage is not executable.",
            "The system lacks a compatible FUSE library.",
            "The file is on a noexec mount, or the download is incomplete.",
          ],
          solutions: [
            "Add executable permission and launch from a terminal to capture the complete error.",
            "On Ubuntu or Debian, install the FUSE 2 compatibility package available for that release.",
            "Use extract-and-run temporarily to confirm whether FUSE is the cause.",
          ],
          commands: [
            { label: "Add permission and collect launch output", code: "chmod +x ./zipax*.AppImage\n./zipax*.AppImage" },
            { label: "Install the Ubuntu/Debian compatibility library", code: "sudo apt update\nsudo apt install libfuse2\n# Ubuntu 24.04+ may use: sudo apt install libfuse2t64" },
            { label: "Diagnostic run without mounting through FUSE", code: "./zipax*.AppImage --appimage-extract-and-run" },
          ],
          sources: [{ label: "Official AppImage troubleshooting", href: "https://docs.appimage.org/user-guide/troubleshooting/" }],
        },
        {
          title: "The package is incomplete, fails verification, or cannot be extracted",
          summary: "A browser reporting a completed download does not guarantee that every byte is valid. Network changes, proxies, limited disk space, and security software can leave a truncated file.",
          causes: [
            "The network or GitHub CDN connection was reset during download.",
            "There was not enough disk space to finish writing the file.",
            "An older cached file has the same name as the new release.",
          ],
          solutions: [
            "Delete the old file, check free disk space, and download again.",
            "Use curl with failure detection and retries instead of an unknown mirror.",
            "Compare SHA-256 with the release value when one is published; never install when it differs.",
          ],
          commands: [
            { label: "Check space, file type, and hash", code: "df -h .\nfile ./zipax*\nshasum -a 256 ./zipax*" },
            { label: "Download with failure detection and retry", code: "curl -fL --retry 3 -o zipax-package '<GitHub Release download URL>'" },
          ],
        },
      ],
      faq: [
        {
          question: "macOS says the app is damaged or from an unidentified developer",
          answer: "Right-click the app and select 'Open'. If that doesn't work, go to System Settings > Privacy & Security and click 'Open Anyway' next to the blocked app message.",
        },
        {
          question: "Windows SmartScreen blocks the installation",
          answer: "Click 'More info' and then 'Run anyway'. zipax is open-source and code-signed, but SmartScreen may flag new apps.",
        },
        {
          question: "Linux AppImage doesn't run",
          answer: "Make the AppImage executable: chmod +x zipax_*.AppImage. You may also need to install FUSE: sudo apt install fuse libfuse2.",
        },
        {
          question: "Where are my files after installation?",
          answer: "zipax doesn't move your files. Compressed files are saved to the location you choose, or to the same folder as the originals by default.",
        },
      ],
    },
    {
      title: "Compress files",
      body: "Drop images or PDFs onto the home screen, or use the picker button. zipax keeps the workflow short and shows the result when the task finishes.",
      steps: [
        "Add PNG, JPG, WebP, AVIF, or PDF files.",
        "Choose a quality or size target when needed.",
        "Save the optimized files to your preferred location.",
      ],
      faq: [
        {
          question: "What image formats are supported?",
          answer: "zipax supports PNG, JPG, JPEG, WebP, AVIF, and TIFF images. For PDFs, it can compress both images and text content.",
        },
        {
          question: "Will compression reduce image quality?",
          answer: "ZIPax uses intelligent compression algorithms. You can choose between lossy (smaller size, slight quality loss) and lossless (no quality loss, larger size) modes.",
        },
        {
          question: "How much can I reduce file size?",
          answer: "Typical reduction: PNG 40-70%, JPG 20-50%, PDF 30-60%. Actual results depend on the original file content and quality settings.",
        },
        {
          question: "Can I compress multiple files at once?",
          answer: "Yes, drag multiple files or select a folder. ZIPax will process them all in batch.",
        },
      ],
    },
    {
      title: "Folder automation",
      body: "Automation watches selected folders while zipax is running. New matching files are compressed with the rule you choose.",
      steps: [
        "Open Automation.",
        "Add a folder and select the output format.",
        "Keep the rule enabled from the switch on the right.",
      ],
      faq: [
        {
          question: "Does automation work when zipax is minimized?",
          answer: "Yes, automation continues running when zipax is in the menu bar or system tray. It only stops if you quit the app completely.",
        },
        {
          question: "What happens to the original files?",
          answer: "Original files are preserved by default. Compressed files are saved to a separate output folder or alongside the originals with a suffix.",
        },
        {
          question: "Can I set different rules for different folders?",
          answer: "Yes, each folder can have its own compression rule with different quality settings and output formats.",
        },
      ],
    },
    {
      title: "Menu bar mode",
      body: "zipax can stay in the menu bar or tray so folder rules continue working without keeping the main window in front.",
      steps: [
        "Keep zipax running after closing the window.",
        "Open the app again from the menu bar icon.",
        "Quit from the menu when automation is no longer needed.",
      ],
      faq: [
        {
          question: "How do I quit zipax from the menu bar?",
          answer: "Click the zipax icon in the menu bar (macOS) or system tray (Windows/Linux) and select 'Quit'.",
        },
        {
          question: "Does menu bar mode use a lot of resources?",
          answer: "No, ZIPax is designed to be lightweight. In menu bar mode, it uses minimal CPU and memory (typically < 50MB RAM).",
        },
      ],
    },
    {
      title: "Updates and troubleshooting",
      body: "zipax checks signed GitHub Releases. If a download is interrupted, open the Download page and install the newest package manually.",
      steps: [
        "Use Check for updates in the app.",
        "Download the update when prompted.",
        "Restart zipax after the installer finishes.",
      ],
      faq: [
        {
          question: "How do I check for updates?",
          answer: "Go to the app menu and select 'Check for Updates', or visit the Download page on this website.",
        },
        {
          question: "The update download keeps failing",
          answer: "Try downloading manually from the GitHub Releases page. If the issue persists, check your network connection or try a different network.",
        },
        {
          question: "zipax crashes on startup after an update",
          answer: "Try deleting the app's preferences file (located in ~/.config/zipax on Linux, ~/Library/Preferences on macOS) and restart.",
        },
      ],
    },
  ],
  "zh-CN": [
    {
      title: "安装 zipax",
      body: "从 GitHub Releases 下载与你系统和处理器匹配的安装包。首次打开前，建议确认下载完整、来源正确，再按照对应平台的安装步骤操作。",
      steps: [
        "确认平台与架构：Apple Silicon 选择 aarch64/arm64，Intel Mac 与多数 Windows/Linux 电脑选择 x64/x86_64。",
        "macOS：打开 DMG，把 zipax 拖到「应用程序」后再从应用程序目录启动。",
        "Windows：运行安装包，从开始菜单启动；Linux：为 AppImage 添加执行权限，或安装 deb/rpm 包。",
        "若无法启动，不要反复关闭安全提示；先根据下方错误类型检查下载、签名、权限和系统依赖。",
      ],
      troubleshooting: [
        {
          title: "macOS：无法打开，或提示无法验证开发者",
          summary: "这通常是 Gatekeeper 的首次启动保护，并不等同于“文件损坏”。先确认文件来自 zipax 官方 GitHub Releases，再使用系统提供的“仍要打开”。",
          causes: [
            "应用不是从 Mac App Store 安装，macOS 需要用户确认首次启动。",
            "系统只允许 App Store 应用，或设备受到公司/学校管理策略限制。",
            "下载的是与处理器不匹配的安装包。",
          ],
          solutions: [
            "删除来源不明的副本，只从本网站下载页或项目 GitHub Releases 重新下载。",
            "先尝试打开一次，然后进入“系统设置 → 隐私与安全性 → 安全性”，找到 zipax 并点击“仍要打开”。",
            "如果“仍要打开”不存在，请确认刚刚尝试过启动；Apple 通常只在尝试启动后的一段时间内显示该按钮。",
            "如果是受管理设备，联系管理员确认 Developer ID 应用是否被策略禁止。",
          ],
          commands: [
            {
              label: "确认 Mac 架构与安装包类型",
              code: "uname -m\nfile ~/Downloads/zipax*.dmg",
            },
            {
              label: "只读检查 Gatekeeper 评估结果",
              code: "spctl --assess --type execute --verbose=4 /Applications/zipax.app",
            },
          ],
          warning: "不要从陌生网站下载后直接绕过系统安全设置。Apple 明确提醒：绕过未验证应用的保护可能带来恶意软件风险。",
          sources: [
            { label: "Apple：无法在 Mac 上打开 App", href: "https://support.apple.com/guide/mac-help/mchlp1519/mac" },
            { label: "Apple：打开来自未知开发者的 App", href: "https://support.apple.com/guide/mac-help/mh40616/mac" },
          ],
        },
        {
          title: "macOS：提示“应用已损坏，无法打开”",
          summary: "“已损坏”可能来自下载不完整、DMG 校验失败、应用签名内容被修改、签名授权失效或系统检测到风险。它与普通的“未知开发者”提示不是同一个问题。",
          causes: [
            "网络中断、代理缓存或第三方下载工具导致 DMG 不完整。",
            "应用复制、解压或二次打包后，签名覆盖的文件发生变化。",
            "旧版本与当前 macOS 不兼容，或开发者证书/公证状态异常。",
            "系统检测到已知恶意内容；此时不应继续绕过。",
          ],
          solutions: [
            "把当前 DMG 和应用移到废纸篓，清空后从官方 Release 重新下载最新版。",
            "先验证 DMG，再把 App 拖入“应用程序”；不要直接从 DMG 内长期运行。",
            "使用 codesign 与 spctl 进行只读诊断。如果签名验证失败，停止使用并在 GitHub Issues 附上版本、macOS 版本和命令输出。",
            "如果校验和与 Release 公布值不一致，说明文件已变化或下载不完整，必须重新下载。",
          ],
          commands: [
            {
              label: "检查下载完整性与 DMG 结构",
              code: "cd ~/Downloads\nshasum -a 256 zipax*.dmg\nhdiutil verify zipax*.dmg",
            },
            {
              label: "验证应用签名与 Gatekeeper",
              code: "codesign --verify --deep --strict --verbose=2 /Applications/zipax.app\nspctl --assess --type execute --verbose=4 /Applications/zipax.app",
            },
            {
              label: "查看隔离属性（只读）",
              code: "xattr -l /Applications/zipax.app",
            },
          ],
          warning: "本指南不建议直接删除 com.apple.quarantine。删除隔离属性会跳过一部分首次启动保护，并且无法修复真正损坏或签名失败的应用。",
          sources: [
            { label: "Apple：安全地打开 Mac App", href: "https://support.apple.com/HT202491" },
            { label: "Apple：App 意外退出或无法打开", href: "https://support.apple.com/102152" },
          ],
        },
        {
          title: "Windows：SmartScreen 阻止安装或启动",
          summary: "SmartScreen 会结合下载信誉、签名与已知风险进行提示。新版本或下载量较少的应用可能缺少信誉，但仍应先检查签名和来源。",
          causes: [
            "安装包版本较新，尚未积累足够的下载信誉。",
            "文件没有有效签名、签名链异常，或文件在下载后被修改。",
            "组织策略禁止运行未知应用。",
          ],
          solutions: [
            "确认安装包来自官方 Release，并在文件属性中检查“数字签名”。",
            "使用 PowerShell 检查签名状态和 SHA-256；只有状态为 Valid 且来源可信时，才考虑“更多信息 → 仍要运行”。",
            "如果设备由组织管理，不要修改安全策略，联系管理员提供安装包哈希与签名信息。",
          ],
          commands: [
            {
              label: "PowerShell：检查签名与哈希",
              code: "Get-AuthenticodeSignature .\\zipax*.exe | Format-List\nGet-FileHash .\\zipax*.exe -Algorithm SHA256",
            },
            {
              label: "确认文件未被系统标记为损坏后再解除单个文件阻止",
              code: "Unblock-File .\\zipax*.exe",
            },
          ],
          warning: "不要关闭 Microsoft Defender 或全局禁用 SmartScreen。若签名状态不是 Valid，请重新下载或提交 Issue。",
          sources: [
            { label: "Microsoft：Defender SmartScreen 概览", href: "https://learn.microsoft.com/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/" },
          ],
        },
        {
          title: "Linux：AppImage 双击无反应或提示 FUSE 错误",
          summary: "AppImage 需要执行权限；部分发行版还需要兼容的 FUSE 运行库。权限问题和依赖问题应分别处理。",
          causes: [
            "下载后的 AppImage 没有执行权限。",
            "系统缺少 FUSE 2 兼容库，常见于较新的 Ubuntu 安装。",
            "文件位于不允许执行的挂载点，或下载不完整。",
          ],
          solutions: [
            "先添加执行权限，并从终端启动以获得完整错误信息。",
            "Ubuntu/Debian 根据系统版本安装 libfuse2 或 libfuse2t64。",
            "无法安装 FUSE 时，可临时使用 AppImage 的 extract-and-run 模式确认是否为 FUSE 问题。",
          ],
          commands: [
            {
              label: "添加权限并获取启动日志",
              code: "chmod +x ./zipax*.AppImage\n./zipax*.AppImage",
            },
            {
              label: "Ubuntu/Debian 安装 FUSE 兼容库",
              code: "sudo apt update\nsudo apt install libfuse2\n# Ubuntu 24.04+ 可能使用：sudo apt install libfuse2t64",
            },
            {
              label: "不挂载 FUSE 的诊断运行方式",
              code: "./zipax*.AppImage --appimage-extract-and-run",
            },
          ],
          sources: [
            { label: "AppImage 官方故障排查", href: "https://docs.appimage.org/user-guide/troubleshooting/" },
          ],
        },
        {
          title: "下载文件不完整、校验失败或安装包无法解压",
          summary: "浏览器显示“下载完成”不代表内容一定完整。网络切换、代理缓存、磁盘空间不足和安全软件拦截都可能留下截断文件。",
          causes: [
            "下载过程中网络中断或 GitHub CDN 连接被代理重置。",
            "磁盘空间不足，文件只写入了一部分。",
            "旧文件与新版本同名，实际打开了缓存副本。",
          ],
          solutions: [
            "删除旧文件，确认剩余磁盘空间，再重新下载。",
            "使用带失败检测与重试的 curl 下载；不要使用来历不明的镜像。",
            "对比 Release 页面提供的 SHA-256；不一致时不要继续安装。",
          ],
          commands: [
            {
              label: "检查空间、类型与哈希",
              code: "df -h .\nfile ./zipax*\nshasum -a 256 ./zipax*",
            },
            {
              label: "使用 curl 失败检测与自动重试",
              code: "curl -fL --retry 3 -o zipax-package '<GitHub Release 下载链接>'",
            },
          ],
        },
      ],
      faq: [
        {
          question: "macOS 提示应用已损坏或来自未知开发者",
          answer: "右键点击应用并选择「打开」。如果不行，前往系统设置 > 隐私与安全性，点击「仍要打开」。",
        },
        {
          question: "Windows SmartScreen 阻止安装",
          answer: "点击「更多信息」然后「仍要运行」。zipax 是开源且代码签名的，但 SmartScreen 可能会标记新应用。",
        },
        {
          question: "Linux AppImage 无法运行",
          answer: "给 AppImage 添加执行权限：chmod +x zipax_*.AppImage。可能还需要安装 FUSE：sudo apt install fuse libfuse2。",
        },
        {
          question: "安装后文件在哪里？",
          answer: "zipax 不会移动你的文件。压缩后的文件会保存到你选择的位置，或默认保存到原文件所在文件夹。",
        },
      ],
    },
    {
      title: "压缩文件",
      body: "把图片或 PDF 拖到首页，也可以点击选择按钮。zipax 会保持流程简短，并在任务完成后展示结果。",
      steps: [
        "添加 PNG、JPG、WebP、AVIF 或 PDF 文件。",
        "需要时选择质量或目标体积。",
        "把优化后的文件保存到你想要的位置。",
      ],
      faq: [
        {
          question: "支持哪些图片格式？",
          answer: "zipax 支持 PNG、JPG、JPEG、WebP、AVIF 和 TIFF 图片。对于 PDF，可以同时压缩图片和文本内容。",
        },
        {
          question: "压缩会降低图片质量吗？",
          answer: "ZIPax 使用智能压缩算法。你可以选择有损（更小体积，轻微质量损失）或无损（无质量损失，体积较大）模式。",
        },
        {
          question: "能减少多少文件大小？",
          answer: "典型压缩率：PNG 40-70%，JPG 20-50%，PDF 30-60%。实际效果取决于原始文件内容和质量设置。",
        },
        {
          question: "可以同时压缩多个文件吗？",
          answer: "可以，拖入多个文件或选择文件夹。ZIPax 会批量处理。",
        },
      ],
    },
    {
      title: "文件夹自动化",
      body: "自动化会在 zipax 运行时监听指定文件夹。新的匹配文件会按照你设置的规则自动压缩。",
      steps: [
        "打开「自动化」页面。",
        "添加文件夹并选择输出格式。",
        "用右侧开关保持规则启用。",
      ],
      faq: [
        {
          question: "zipax 最小化时自动化还能工作吗？",
          answer: "可以，当 zipax 在菜单栏或托盘中时，自动化会继续运行。只有完全退出应用才会停止。",
        },
        {
          question: "原始文件会怎样？",
          answer: "默认保留原始文件。压缩后的文件会保存到单独的输出文件夹，或带后缀保存在原文件旁边。",
        },
        {
          question: "可以为不同文件夹设置不同规则吗？",
          answer: "可以，每个文件夹可以有自己的压缩规则，包括不同的质量设置和输出格式。",
        },
      ],
    },
    {
      title: "菜单栏模式",
      body: "zipax 可以停留在菜单栏或托盘里，让文件夹规则在主窗口关闭后继续工作。",
      steps: [
        "关闭窗口后保持 zipax 运行。",
        "从菜单栏图标重新打开应用。",
        "不再需要自动化时，从菜单中退出。",
      ],
      faq: [
        {
          question: "如何从菜单栏退出 zipax？",
          answer: "点击菜单栏（macOS）或系统托盘（Windows/Linux）中的 zipax 图标，选择「退出」。",
        },
        {
          question: "菜单栏模式会占用很多资源吗？",
          answer: "不会，ZIPax 设计轻量。菜单栏模式下 CPU 和内存占用极低（通常 < 50MB 内存）。",
        },
      ],
    },
    {
      title: "更新与排查",
      body: "zipax 会检查签名的 GitHub Releases。如果下载被中断，可以在下载页手动安装最新版本。",
      steps: [
        "在 app 中点击检查更新。",
        "出现提示后下载更新。",
        "安装完成后重启 zipax。",
      ],
      faq: [
        {
          question: "如何检查更新？",
          answer: "在应用菜单中选择「检查更新」，或访问本网站的下载页面。",
        },
        {
          question: "更新下载一直失败",
          answer: "尝试从 GitHub Releases 页面手动下载。如果问题持续，检查网络连接或尝试其他网络。",
        },
        {
          question: "更新后 zipax 启动崩溃",
          answer: "尝试删除应用的偏好设置文件（Linux 在 ~/.config/zipax，macOS 在 ~/Library/Preferences），然后重启。",
        },
      ],
    },
  ],
  "zh-TW": [
    {
      title: "安裝 zipax",
      body: "從 GitHub Releases 下載符合你系統的安裝包，然後像一般桌面 App 一樣開啟 zipax。",
      steps: [
        "macOS：開啟 DMG，將 zipax 拖到「應用程式」。",
        "Windows：執行安裝包，然後從開始選單啟動。",
        "Linux：可直接執行 AppImage，也可以安裝 deb/rpm 套件。",
      ],
      faq: [
        {
          question: "macOS 提示應用已損壞或來自未知開發者",
          answer: "右鍵點擊應用並選擇「開啟」。如果不行，前往系統設定 > 隱私與安全性，點擊「仍要開啟」。",
        },
        {
          question: "Windows SmartScreen 阻止安裝",
          answer: "點擊「更多資訊」然後「仍要執行」。zipax 是開源且代碼簽名的，但 SmartScreen 可能會標記新應用。",
        },
        {
          question: "Linux AppImage 無法執行",
          answer: "給 AppImage 添加執行權限：chmod +x zipax_*.AppImage。可能還需要安裝 FUSE：sudo apt install fuse libfuse2。",
        },
      ],
    },
    {
      title: "壓縮檔案",
      body: "將圖片或 PDF 拖到首頁，也可以使用選擇按鈕。zipax 會保持流程簡短，並在任務完成後顯示結果。",
      steps: [
        "加入 PNG、JPG、WebP、AVIF 或 PDF 檔案。",
        "需要時選擇品質或目標大小。",
        "將最佳化後的檔案儲存到想要的位置。",
      ],
      faq: [
        {
          question: "支援哪些圖片格式？",
          answer: "zipax 支援 PNG、JPG、JPEG、WebP、AVIF 和 TIFF 圖片。對於 PDF，可以同時壓縮圖片和文字內容。",
        },
        {
          question: "壓縮會降低圖片品質嗎？",
          answer: "ZIPax 使用智慧壓縮演算法。你可以選擇有損（更小體積，輕微品質損失）或無損（無品質損失，體積較大）模式。",
        },
      ],
    },
    {
      title: "資料夾自動化",
      body: "自動化會在 zipax 執行時監看指定資料夾。新的相符檔案會依照規則自動壓縮。",
      steps: [
        "開啟「自動化」。",
        "加入資料夾並選擇輸出格式。",
        "用右側開關保持規則啟用。",
      ],
      faq: [
        {
          question: "zipax 最小化時自動化還能工作嗎？",
          answer: "可以，當 zipax 在選單列或系統匣中時，自動化會繼續執行。只有完全退出應用才會停止。",
        },
      ],
    },
    {
      title: "選單列模式",
      body: "zipax 可以停留在選單列或系統匣，讓資料夾規則在主視窗關閉後繼續工作。",
      steps: [
        "關閉視窗後保持 zipax 執行。",
        "從選單列圖示重新開啟 App。",
        "不再需要自動化時，從選單退出。",
      ],
      faq: [
        {
          question: "如何從選單列退出 zipax？",
          answer: "點擊選單列（macOS）或系統匣（Windows/Linux）中的 zipax 圖示，選擇「退出」。",
        },
      ],
    },
    {
      title: "更新與排查",
      body: "zipax 會檢查已簽署的 GitHub Releases。如果下載中斷，可以在下載頁手動安裝最新版。",
      steps: [
        "在 App 中點擊檢查更新。",
        "出現提示後下載更新。",
        "安裝完成後重新啟動 zipax。",
      ],
      faq: [
        {
          question: "如何檢查更新？",
          answer: "在應用選單中選擇「檢查更新」，或訪問本網站的下載頁面。",
        },
        {
          question: "更新下載一直失敗",
          answer: "嘗試從 GitHub Releases 頁面手動下載。如果問題持續，檢查網路連接或嘗試其他網路。",
        },
      ],
    },
  ],
  "es-ES": [
    {
      title: "Instalar zipax",
      body: "Descarga desde GitHub Releases el paquete adecuado para tu sistema y abre zipax como cualquier app de escritorio.",
      steps: [
        "macOS: abre el DMG y arrastra zipax a Aplicaciones.",
        "Windows: ejecuta el instalador y abre zipax desde Inicio.",
        "Linux: usa AppImage directamente o instala el paquete deb/rpm.",
      ],
      faq: [
        {
          question: "macOS dice que la app está dañada o de un desarrollador no identificado",
          answer: "Haz clic derecho en la app y selecciona 'Abrir'. Si no funciona, ve a Ajustes del Sistema > Privacidad y Seguridad y haz clic en 'Abrir de todos modos'.",
        },
        {
          question: "Windows SmartScreen bloquea la instalación",
          answer: "Haz clic en 'Más información' y luego 'Ejecutar de todos modos'. zipax es de código abierto y está firmado, pero SmartScreen puede bloquear apps nuevas.",
        },
        {
          question: "Linux AppImage no se ejecuta",
          answer: "Dale permisos de ejecución: chmod +x zipax_*.AppImage. También puedes necesitar instalar FUSE: sudo apt install fuse libfuse2.",
        },
      ],
    },
    {
      title: "Comprimir archivos",
      body: "Suelta imágenes o PDF en la pantalla principal, o usa el selector. zipax muestra el resultado cuando termina la tarea.",
      steps: [
        "Añade archivos PNG, JPG, WebP, AVIF o PDF.",
        "Elige calidad o tamaño objetivo si lo necesitas.",
        "Guarda los archivos optimizados donde prefieras.",
      ],
      faq: [
        {
          question: "¿Qué formatos de imagen soporta?",
          answer: "zipax soporta PNG, JPG, JPEG, WebP, AVIF y TIFF. Para PDF, puede comprimir tanto imágenes como contenido de texto.",
        },
      ],
    },
    {
      title: "Automatización de carpetas",
      body: "La automatización vigila carpetas mientras zipax está abierto. Los archivos nuevos se comprimen con la regla elegida.",
      steps: [
        "Abre Automatización.",
        "Añade una carpeta y elige el formato de salida.",
        "Mantén la regla activa con el interruptor.",
      ],
      faq: [
        {
          question: "¿La automatización funciona cuando zipax está minimizado?",
          answer: "Sí, la automatización continúa cuando zipax está en la barra de menú o bandeja del sistema. Solo se detiene si cierras la app completamente.",
        },
      ],
    },
    {
      title: "Barra de menú",
      body: "zipax puede permanecer en la barra de menú o bandeja para que las reglas sigan funcionando sin la ventana principal.",
      steps: [
        "Deja zipax en ejecución al cerrar la ventana.",
        "Vuelve a abrirlo desde el icono de la barra.",
        "Sal desde el menú cuando no necesites automatización.",
      ],
      faq: [
        {
          question: "¿Cómo salgo de zipax desde la barra de menú?",
          answer: "Haz clic en el icono de zipax en la barra de menú (macOS) o bandeja del sistema (Windows/Linux) y selecciona 'Salir'.",
        },
      ],
    },
    {
      title: "Actualizaciones",
      body: "zipax comprueba GitHub Releases firmadas. Si la descarga falla, instala manualmente el paquete más reciente.",
      steps: [
        "Usa Buscar actualizaciones.",
        "Descarga la actualización cuando se indique.",
        "Reinicia zipax después de instalar.",
      ],
      faq: [
        {
          question: "¿Cómo verifico actualizaciones?",
          answer: "Ve al menú de la app y selecciona 'Buscar actualizaciones', o visita la página de Descargas en este sitio web.",
        },
      ],
    },
  ],
  ar: [
    {
      title: "تثبيت zipax",
      body: "حمّل الحزمة المناسبة لنظامك من GitHub Releases، ثم افتح zipax مثل أي تطبيق سطح مكتب.",
      steps: [
        "macOS: افتح ملف DMG واسحب zipax إلى Applications.",
        "Windows: شغّل ملف التثبيت وافتح zipax من قائمة Start.",
        "Linux: استخدم AppImage مباشرة أو ثبّت حزمة deb/rpm.",
      ],
      faq: [
        {
          question: "macOS يقول أن التطبيق تاليف أو من مطور غير معروف",
          answer: "انقر بالزر الأيمن على التطبيق واختر 'فتح'. إذا لم ينجح، اذهب إلى إعدادات النظام > الخصوصية والأمان وانقر 'فتح على أي حال'.",
        },
        {
          question: "Windows SmartScreen يحجب التثبيت",
          answer: "انقر 'مزيد من المعلومات' ثم 'تشغيل على أي حال'. zipax مفتوح المصدر وموقّع بالشفرة، لكن SmartScreen قد يحجب التطبيقات الجديدة.",
        },
      ],
    },
    {
      title: "ضغط الملفات",
      body: "اسحب الصور أو ملفات PDF إلى الشاشة الرئيسية، أو استخدم زر الاختيار. يعرض zipax النتيجة بعد انتهاء المهمة.",
      steps: [
        "أضف ملفات PNG أو JPG أو WebP أو AVIF أو PDF.",
        "اختر الجودة أو الحجم المطلوب عند الحاجة.",
        "احفظ الملفات المحسنة في المكان الذي تفضله.",
      ],
      faq: [
        {
          question: "ما هي صيغ الصور المدعومة؟",
          answer: "يدعم zipax صيغ PNG وJPG وJPEG وWebP وAVIF وTIFF. لملفات PDF، يمكنه ضغط الصور ومحتوى النص معاً.",
        },
      ],
    },
    {
      title: "أتمتة المجلدات",
      body: "تراقب الأتمتة المجلدات أثناء تشغيل zipax. تضغط الملفات الجديدة وفق القاعدة التي تختارها.",
      steps: [
        "افتح صفحة الأتمتة.",
        "أضف مجلدا واختر صيغة الإخراج.",
        "أبق القاعدة مفعلة من المفتاح الجانبي.",
      ],
      faq: [
        {
          question: "هل الأتمتة تعمل عندما يكون zipax مصغراً؟",
          answer: "نعم، تستمر الأتمتة عند وجود zipax في شريط القوائم أو علبة النظام. تتوقف فقط عند إغلاق التطبيق بالكامل.",
        },
      ],
    },
    {
      title: "وضع شريط القوائم",
      body: "يمكن أن يبقى zipax في شريط القوائم أو علبة النظام حتى تستمر القواعد دون إبقاء النافذة الرئيسية مفتوحة.",
      steps: [
        "اترك zipax يعمل بعد إغلاق النافذة.",
        "افتح التطبيق من أيقونة شريط القوائم.",
        "اخرج من القائمة عندما لا تحتاج الأتمتة.",
      ],
      faq: [
        {
          question: "كيف أخرج من zipax من شريط القوائم؟",
          answer: "انقر على أيقونة zipax في شريط القوائم (macOS) أو علبة النظام (Windows/Linux) واختر 'خروج'.",
        },
      ],
    },
    {
      title: "التحديثات وحل المشاكل",
      body: "يتحقق zipax من إصدارات GitHub الموقعة. إذا تعطل التنزيل، ثبّت أحدث حزمة يدويا من صفحة التنزيل.",
      steps: [
        "استخدم زر التحقق من التحديثات.",
        "نزّل التحديث عند ظهور الطلب.",
        "أعد تشغيل zipax بعد اكتمال التثبيت.",
      ],
      faq: [
        {
          question: "كيف أتحقق من التحديثات؟",
          answer: "اذهب إلى قائمة التطبيق واختر 'التحقق من التحديثات'، أو قم بزيارة صفحة التنزيل على هذا الموقع.",
        },
      ],
    },
  ],
  "id-ID": [
    {
      title: "Memasang zipax",
      body: "Unduh paket yang sesuai dari GitHub Releases, lalu buka zipax seperti aplikasi desktop biasa.",
      steps: [
        "macOS: buka DMG dan seret zipax ke Applications.",
        "Windows: jalankan setup lalu buka zipax dari Start.",
        "Linux: gunakan AppImage langsung, atau pasang paket deb/rpm.",
      ],
      faq: [
        {
          question: "macOS bilap aplikasi rusak atau dari pengembang tak dikenal",
          answer: "Klik kanan pada aplikasi dan pilih 'Buka'. Jika tidak berhasil, buka Pengaturan Sistem > Privasi & Keamanan dan klik 'Tetap Buka'.",
        },
        {
          question: "Windows SmartScreen memblokir instalasi",
          answer: "Klik 'Info lainnya' lalu 'Tetap jalankan'. zipax bersumber terbuka dan ditandatangani, tetapi SmartScreen mungkin memblokir aplikasi baru.",
        },
      ],
    },
    {
      title: "Mengompres file",
      body: "Taruh gambar atau PDF di layar utama, atau gunakan tombol pilih. zipax menampilkan hasil setelah tugas selesai.",
      steps: [
        "Tambahkan file PNG, JPG, WebP, AVIF, atau PDF.",
        "Pilih target kualitas atau ukuran bila perlu.",
        "Simpan file yang sudah dioptimalkan.",
      ],
      faq: [
        {
          question: "Format gambar apa yang didukung?",
          answer: "zipax mendukung PNG, JPG, JPEG, WebP, AVIF, dan TIFF. Untuk PDF, dapat mengompres gambar dan konten teks sekaligus.",
        },
      ],
    },
    {
      title: "Otomasi folder",
      body: "Otomasi memantau folder saat zipax berjalan. File baru akan dikompres dengan aturan pilihanmu.",
      steps: [
        "Buka Otomasi.",
        "Tambahkan folder dan pilih format keluaran.",
        "Biarkan aturan aktif dari sakelar di kanan.",
      ],
      faq: [
        {
          question: "Apakah otomasi tetap bekerja saat zipax diminimalkan?",
          answer: "Ya, otomasi tetap berjalan saat zipax di menu bar atau tray. Berhenti hanya saat aplikasi ditutup sepenuhnya.",
        },
      ],
    },
    {
      title: "Mode menu bar",
      body: "zipax dapat tetap berada di menu bar atau tray agar aturan folder tetap berjalan tanpa jendela utama.",
      steps: [
        "Biarkan zipax berjalan setelah jendela ditutup.",
        "Buka lagi dari ikon menu bar.",
        "Keluar dari menu saat otomasi tidak diperlukan.",
      ],
      faq: [
        {
          question: "Bagaimana cara keluar dari zipax melalui menu bar?",
          answer: "Klik ikon zipax di menu bar (macOS) atau tray sistem (Windows/Linux) dan pilih 'Keluar'.",
        },
      ],
    },
    {
      title: "Pembaruan",
      body: "zipax memeriksa GitHub Releases bertanda tangan. Jika unduhan terputus, pasang paket terbaru secara manual.",
      steps: [
        "Gunakan Periksa pembaruan.",
        "Unduh pembaruan saat diminta.",
        "Mulai ulang zipax setelah pemasangan.",
      ],
      faq: [
        {
          question: "Bagaimana cara memeriksa pembaruan?",
          answer: "Buka menu aplikasi dan pilih 'Periksa pembaruan', atau kunjungi halaman Unduhan di situs web ini.",
        },
      ],
    },
  ],
  "pt-BR": [
    {
      title: "Instalar o zipax",
      body: "Baixe no GitHub Releases o pacote do seu sistema e abra o zipax como qualquer app de desktop.",
      steps: [
        "macOS: abra o DMG e arraste o zipax para Aplicativos.",
        "Windows: execute o instalador e abra pelo menu Iniciar.",
        "Linux: use o AppImage ou instale o pacote deb/rpm.",
      ],
      faq: [
        {
          question: "macOS diz que o app está danificado ou de desenvolvedor não identificado",
          answer: "Clique com o botão direito no app e selecione 'Abrir'. Se não funcionar, vá para Ajustes do Sistema > Privacidade e Segurança e clique 'Abrir mesmo assim'.",
        },
        {
          question: "Windows SmartScreen bloqueia a instalação",
          answer: "Clique 'Mais informações' e depois 'Executar mesmo assim'. O zipax é open-source e possui assinatura digital, mas o SmartScreen pode bloquear apps novos.",
        },
      ],
    },
    {
      title: "Comprimir arquivos",
      body: "Solte imagens ou PDFs na tela inicial, ou use o seletor. O zipax mostra o resultado quando a tarefa termina.",
      steps: [
        "Adicione PNG, JPG, WebP, AVIF ou PDF.",
        "Escolha qualidade ou tamanho alvo quando precisar.",
        "Salve os arquivos otimizados no local desejado.",
      ],
      faq: [
        {
          question: "Quais formatos de imagem são suportados?",
          answer: "O zipax suporta PNG, JPG, JPEG, WebP, AVIF e TIFF. Para PDFs, pode comprimir imagens e conteúdo de texto simultaneamente.",
        },
      ],
    },
    {
      title: "Automação de pastas",
      body: "A automação observa pastas enquanto o zipax está aberto. Novos arquivos são comprimidos com a regra escolhida.",
      steps: [
        "Abra Automação.",
        "Adicione uma pasta e escolha o formato de saída.",
        "Mantenha a regra ativa pelo interruptor.",
      ],
      faq: [
        {
          question: "A automação funciona quando o zipax está minimizado?",
          answer: "Sim, a automação continua rodando quando o zipax está na barra de menu ou bandeja. Só para se o app for fechado completamente.",
        },
      ],
    },
    {
      title: "Modo barra de menu",
      body: "O zipax pode ficar na barra de menu ou bandeja para manter regras ativas sem a janela principal.",
      steps: [
        "Mantenha o zipax rodando após fechar a janela.",
        "Abra novamente pelo ícone da barra.",
        "Saia pelo menu quando não precisar da automação.",
      ],
      faq: [
        {
          question: "Como sair do zipax pela barra de menu?",
          answer: "Clique no ícone do zipax na barra de menu (macOS) ou bandeja do sistema (Windows/Linux) e selecione 'Sair'.",
        },
      ],
    },
    {
      title: "Atualizações",
      body: "O zipax verifica GitHub Releases assinadas. Se o download falhar, instale manualmente o pacote mais recente.",
      steps: [
        "Use Verificar atualizações.",
        "Baixe a atualização quando solicitado.",
        "Reinicie o zipax após instalar.",
      ],
      faq: [
        {
          question: "Como verificar atualizações?",
          answer: "Vá ao menu do app e selecione 'Verificar atualizações', ou visite a página de Downloads neste site.",
        },
      ],
    },
  ],
  "fr-FR": [
    {
      title: "Installer zipax",
      body: "Téléchargez le paquet adapté à votre système depuis GitHub Releases, puis ouvrez zipax comme une application de bureau.",
      steps: [
        "macOS : ouvrez le DMG et glissez zipax dans Applications.",
        "Windows : lancez l'installateur puis ouvrez zipax depuis Démarrer.",
        "Linux : utilisez l'AppImage ou installez le paquet deb/rpm.",
      ],
      faq: [
        {
          question: "macOS dit que l'app est endommagée ou d'un développeur non identifié",
          answer: "Faites un clic droit sur l'app et sélectionnez 'Ouvrir'. Si ça ne marche pas, allez dans Réglages du Système > Confidentialité et sécurité et cliquez 'Ouvrir quand même'.",
        },
        {
          question: "Windows SmartScreen bloque l'installation",
          answer: "Cliquez 'Plus d'informations' puis 'Exécuter quand même'. zipax est open-source et signé numériquement, mais SmartScreen peut bloquer les nouvelles apps.",
        },
      ],
    },
    {
      title: "Compresser des fichiers",
      body: "Déposez des images ou des PDF sur l'accueil, ou utilisez le sélecteur. zipax affiche le résultat à la fin.",
      steps: [
        "Ajoutez des fichiers PNG, JPG, WebP, AVIF ou PDF.",
        "Choisissez une qualité ou une taille cible si besoin.",
        "Enregistrez les fichiers optimisés où vous voulez.",
      ],
      faq: [
        {
          question: "Quels formats d'image sont supportés ?",
          answer: "zipax supporte PNG, JPG, JPEG, WebP, AVIF et TIFF. Pour les PDF, il peut compresser les images et le contenu texte simultanément.",
        },
      ],
    },
    {
      title: "Automatisation de dossiers",
      body: "L'automatisation surveille des dossiers pendant que zipax tourne. Les nouveaux fichiers sont compressés avec la règle choisie.",
      steps: [
        "Ouvrez Automatisation.",
        "Ajoutez un dossier et choisissez le format de sortie.",
        "Gardez la règle active avec l'interrupteur.",
      ],
      faq: [
        {
          question: "L'automatisation fonctionne-t-elle quand zipax est minimisé ?",
          answer: "Oui, l'automatisation continue de fonctionner quand zipax est dans la barre de menus ou la zone de notification. Elle s'arrête seulement si vous fermez complètement l'app.",
        },
      ],
    },
    {
      title: "Mode barre de menus",
      body: "zipax peut rester dans la barre de menus ou la zone de notification pour continuer les règles sans fenêtre principale.",
      steps: [
        "Laissez zipax tourner après avoir fermé la fenêtre.",
        "Rouvrez l'app depuis l'icône de la barre.",
        "Quittez depuis le menu lorsque l'automatisation n'est plus utile.",
      ],
      faq: [
        {
          question: "Comment quitter zipax depuis la barre de menus ?",
          answer: "Cliquez sur l'icône de zipax dans la barre de menus (macOS) ou la zone de notification (Windows/Linux) et sélectionnez 'Quitter'.",
        },
      ],
    },
    {
      title: "Mises à jour",
      body: "zipax vérifie les GitHub Releases signées. Si le téléchargement échoue, installez le dernier paquet manuellement.",
      steps: [
        "Utilisez Rechercher des mises à jour.",
        "Téléchargez la mise à jour quand elle est proposée.",
        "Redémarrez zipax après l'installation.",
      ],
      faq: [
        {
          question: "Comment vérifier les mises à jour ?",
          answer: "Allez dans le menu de l'app et sélectionnez 'Rechercher des mises à jour', ou visitez la page Téléchargements sur ce site.",
        },
      ],
    },
  ],
  "ja-JP": [
    {
      title: "zipax をインストール",
      body: "GitHub Releases から環境に合うパッケージをダウンロードし、通常のデスクトップアプリとして開きます。",
      steps: [
        "macOS: DMG を開き、zipax を Applications にドラッグします。",
        "Windows: セットアップを実行し、スタートメニューから起動します。",
        "Linux: AppImage を直接使うか、deb/rpm パッケージをインストールします。",
      ],
      faq: [
        {
          question: "macOS がアプリが破損しているまたは開発者不明と言った",
          answer: "アプリを右クリックして「開く」を選択します。うまくいかない場合は、システム設定 > プライバシーとセキュリティで「開く」をクリックします。",
        },
        {
          question: "Windows SmartScreen がインストールをブロックした",
          answer: "「詳細情報」をクリックして「実行」をクリックします。ZIPax はオープンソースでコード署名されていますが、SmartScreen が新しいアプリをブロックすることがあります。",
        },
      ],
    },
    {
      title: "ファイルを圧縮",
      body: "画像や PDF をホーム画面にドロップするか、選択ボタンを使います。処理が終わると結果が表示されます。",
      steps: [
        "PNG、JPG、WebP、AVIF、PDF を追加します。",
        "必要に応じて品質や目標サイズを選びます。",
        "最適化後のファイルを任意の場所に保存します。",
      ],
      faq: [
        {
          question: "サポートされている画像形式は？",
          answer: "ZIPax は PNG、JPG、JPEG、WebP、AVIF、TIFF をサポートしています。PDF の場合、画像とテキストコンテンツを同時に圧縮できます。",
        },
      ],
    },
    {
      title: "フォルダー自動化",
      body: "zipax の起動中に指定フォルダーを監視します。新しい対象ファイルは選んだルールで自動圧縮されます。",
      steps: [
        "自動化を開きます。",
        "フォルダーを追加し、出力形式を選びます。",
        "右側のスイッチでルールを有効にします。",
      ],
      faq: [
        {
          question: "zipax を最小化した時も自動化は機能しますか？",
          answer: "はい、zipax がメニューバーやトレイにいる間、自動化は引き続き動作します。アプリを完全に終了した場合のみ停止します。",
        },
      ],
    },
    {
      title: "メニューバーモード",
      body: "zipax はメニューバーやトレイに常駐でき、メインウィンドウを閉じてもルールを継続できます。",
      steps: [
        "ウィンドウを閉じても zipax を実行したままにします。",
        "メニューバーのアイコンから再度開きます。",
        "自動化が不要な時はメニューから終了します。",
      ],
      faq: [
        {
          question: "メニューバーから zipax を終了するには？",
          answer: "メニューバー（macOS）またはシステムトレイ（Windows/Linux）の zipax アイコンをクリックし、「終了」を選択します。",
        },
      ],
    },
    {
      title: "更新とトラブル対応",
      body: "zipax は署名済みの GitHub Releases を確認します。ダウンロードが失敗した場合は最新版を手動で入れてください。",
      steps: [
        "アプリで更新を確認します。",
        "案内が出たら更新をダウンロードします。",
        "インストール後に zipax を再起動します。",
      ],
      faq: [
        {
          question: "更新を確認するには？",
          answer: "アプリのメニューで「更新を確認」を選択するか、このウェブサイトのダウンロードページにアクセスしてください。",
        },
      ],
    },
  ],
  "ko-KR": [
    {
      title: "zipax 설치",
      body: "GitHub Releases에서 시스템에 맞는 패키지를 내려받고 일반 데스크톱 앱처럼 zipax를 엽니다.",
      steps: [
        "macOS: DMG를 열고 zipax를 Applications로 드래그합니다.",
        "Windows: 설치 파일을 실행하고 시작 메뉴에서 실행합니다.",
        "Linux: AppImage를 바로 쓰거나 deb/rpm 패키지를 설치합니다.",
      ],
      faq: [
        {
          question: "macOS가 앱이 손상되었거나 알 수 없는 개발자라고 표시합니다",
          answer: "앱을 우클릭하고 '열기'를 선택합니다. 작동하지 않으면 시스템 설정 > 개인정보 보호 및 보안에서 '그래도 열기'를 클릭합니다.",
        },
        {
          question: "Windows SmartScreen이 설치를 차단합니다",
          answer: "'자세한 정보'를 클릭한 다음 '그래도 실행'을 클릭합니다. ZIPax는 오픈소스이고 코드 서명이 되어 있지만, SmartScreen이 새 앱을 차단할 수 있습니다.",
        },
      ],
    },
    {
      title: "파일 압축",
      body: "이미지나 PDF를 홈 화면에 놓거나 선택 버튼을 사용합니다. 작업이 끝나면 결과가 표시됩니다.",
      steps: [
        "PNG, JPG, WebP, AVIF, PDF 파일을 추가합니다.",
        "필요하면 품질 또는 목표 용량을 선택합니다.",
        "최적화된 파일을 원하는 위치에 저장합니다.",
      ],
      faq: [
        {
          question: "지원되는 이미지 형식은?",
          answer: "ZIPax는 PNG, JPG, JPEG, WebP, AVIF, TIFF를 지원합니다. PDF의 경우 이미지와 텍스트 콘텐츠를 동시에 압축할 수 있습니다.",
        },
      ],
    },
    {
      title: "폴더 자동화",
      body: "zipax가 실행 중일 때 선택한 폴더를 감시합니다. 새 파일은 선택한 규칙으로 자동 압축됩니다.",
      steps: [
        "자동화를 엽니다.",
        "폴더를 추가하고 출력 형식을 선택합니다.",
        "오른쪽 스위치로 규칙을 켜 둡니다.",
      ],
      faq: [
        {
          question: "zipax가 최소화되어도 자동화가 작동하나요?",
          answer: "네, zipax가 메뉴 막대나 트레이에 있을 때 자동화는 계속 작동합니다. 앱을 완전히 종료할 때만 중지됩니다.",
        },
      ],
    },
    {
      title: "메뉴 막대 모드",
      body: "zipax는 메뉴 막대나 트레이에 머물 수 있어 기본 창을 닫아도 폴더 규칙이 계속 동작합니다.",
      steps: [
        "창을 닫은 뒤에도 zipax를 실행 상태로 둡니다.",
        "메뉴 막대 아이콘에서 다시 엽니다.",
        "자동화가 필요 없으면 메뉴에서 종료합니다.",
      ],
      faq: [
        {
          question: "메뉴 막대에서 zipax를 종료하려면?",
          answer: "메뉴 막대(macOS) 또는 시스템 트레이(Windows/Linux)의 zipax 아이콘을 클릭하고 '종료'를 선택합니다.",
        },
      ],
    },
    {
      title: "업데이트와 문제 해결",
      body: "zipax는 서명된 GitHub Releases를 확인합니다. 다운로드가 중단되면 최신 패키지를 수동으로 설치하세요.",
      steps: [
        "앱에서 업데이트 확인을 사용합니다.",
        "안내가 나오면 업데이트를 내려받습니다.",
        "설치 후 zipax를 다시 시작합니다.",
      ],
      faq: [
        {
          question: "업데이트를 확인하려면?",
          answer: "앱 메뉴에서 '업데이트 확인'을 선택하거나 이 웹사이트의 다운로드 페이지를 방문하세요.",
        },
      ],
    },
  ],
};

export function docsForLocale(locale: Locale) {
  return (docs[locale] ?? docs["en-US"]).map((doc, index) => ({ ...doc, slug: docSlugs[index] }));
}

export function docForSlug(locale: Locale, slug: string) {
  return docsForLocale(locale).find((doc) => doc.slug === slug);
}
