use std::process::Command;

/// Windows Ghostscript installer mirrors, tried in order.
///
/// - Official GitHub release (works in most regions).
/// - gh-proxy / ghproxy acceleration mirrors for CN network environments.
#[cfg(target_os = "windows")]
const GS_URLS: &[&str] = &[
    "https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10033/gs10033w64.exe",
    "https://gh-proxy.com/https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10033/gs10033w64.exe",
    "https://mirror.ghproxy.com/https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10033/gs10033w64.exe",
];

#[cfg(target_os = "windows")]
const MIN_INSTALLER_SIZE: u64 = 5 * 1024 * 1024;

/// Install Ghostscript automatically based on the current platform.
///
/// - macOS: `brew install ghostscript` (no sudo required).
/// - Windows: download official installer (multi-mirror) → run silently with `/S`.
/// - Linux: already handled by deb/rpm `Depends`; this is a no-op for AppImage users.
#[tauri::command]
pub fn install_ghostscript() -> Result<String, String> {
    tracing::info!("install_ghostscript: starting platform-specific install");

    #[cfg(target_os = "macos")]
    {
        // 1. try Homebrew (no sudo needed, ~80%+ macOS dev machines have it)
        if Command::new("brew")
            .args(["install", "ghostscript"])
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
        {
            tracing::info!("install_ghostscript: installed via Homebrew");
            verify_gs()?;
            return Ok("Ghostscript 安装成功（Homebrew）".into());
        }

        // 2. Homebrew not available → tell user
        return Err(
            "未检测到 Homebrew。请打开终端运行：\n\n  brew install ghostscript\n\n完成后重启应用即可使用 PDF 压缩。"
                .into(),
        );
    }

    #[cfg(target_os = "windows")]
    {
        // 1. try Chocolatey first
        if Command::new("choco")
            .args(["install", "ghostscript", "-y"])
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
        {
            tracing::info!("install_ghostscript: installed via Chocolatey");
            verify_gs()?;
            return Ok("Ghostscript 安装成功（Chocolatey）".into());
        }

        // 2. download official installer (multi-mirror) and run silently
        let temp_dir = std::env::temp_dir();
        let installer_path = temp_dir.join("gs_installer.exe");

        download_installer(&installer_path)?;

        tracing::info!("install_ghostscript: running installer silently");

        let install = Command::new(&installer_path)
            .arg("/S")
            .status()
            .map_err(|e| format!("无法启动 Ghostscript 安装程序: {e}"))?;

        if !install.success() {
            return Err(
                "Ghostscript 安装失败，请尝试手动安装。\n\n下载地址：\nhttps://github.com/ArtifexSoftware/ghostpdl-downloads/releases\n或 https://ghostscript.com/releases/gsdnld.html"
                    .into(),
            );
        }

        tracing::info!("install_ghostscript: installer completed");
        let _ = std::fs::remove_file(&installer_path);

        verify_gs()?;
        return Ok("Ghostscript 安装成功".into());
    }

    #[cfg(target_os = "linux")]
    {
        // For deb/rpm users, ghostscript is already a dependency.
        // For AppImage / manual install users, try apt or dnf.
        let apt = Command::new("sh")
            .args([
                "-c",
                "which gs 2>/dev/null || (sudo apt-get install -y ghostscript 2>/dev/null || sudo dnf install -y ghostscript 2>/dev/null || echo FAILED)",
            ])
            .status()
            .map(|s| s.success())
            .unwrap_or(false);

        if verify_gs().is_ok() {
            return Ok("Ghostscript 已安装".into());
        }

        if apt {
            verify_gs()?;
            return Ok("Ghostscript 安装成功".into());
        }

        return Err(
            "自动安装失败。请打开终端运行：\n\n  sudo apt install ghostscript\n\n# 或 Fedora:\n  sudo dnf install ghostscript\n\n完成后重启应用即可。"
                .into(),
        );
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err("当前平台暂不支持自动安装 Ghostscript。\n请访问 https://ghostscript.com 手动下载安装。".into())
    }
}

/// Download the Ghostscript installer, trying multiple mirrors.
#[cfg(target_os = "windows")]
fn download_installer(installer_path: &std::path::Path) -> Result<(), String> {
    for url in GS_URLS {
        tracing::info!("install_ghostscript: trying download from {url}");

        let ok = download_with_curl(url, installer_path)
            || download_with_powershell(url, installer_path);

        let valid = ok
            && std::fs::metadata(installer_path)
                .map(|m| m.len() >= MIN_INSTALLER_SIZE)
                .unwrap_or(false);

        if valid {
            tracing::info!("install_ghostscript: download ok from {url}");
            return Ok(());
        }

        tracing::warn!("install_ghostscript: download failed from {url}");
        let _ = std::fs::remove_file(installer_path);
    }

    Err(
        "Ghostscript 安装包下载失败，请检查网络连接（可尝试使用代理或镜像加速）。\n\n手动下载地址：\nhttps://github.com/ArtifexSoftware/ghostpdl-downloads/releases\n或 https://ghostscript.com/releases/gsdnld.html"
            .into(),
    )
}

/// Download via curl.exe (bundled with Windows 10 1803+).
#[cfg(target_os = "windows")]
fn download_with_curl(url: &str, out: &std::path::Path) -> bool {
    Command::new("curl.exe")
        .args([
            "-L",
            "--fail",
            "--retry",
            "3",
            "--connect-timeout",
            "20",
            "--max-time",
            "600",
            "--ssl-no-revoke",
            "-sS",
            "-o",
        ])
        .arg(out)
        .arg(url)
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Fallback: download via PowerShell with TLS 1.2 forced and a timeout.
#[cfg(target_os = "windows")]
fn download_with_powershell(url: &str, out: &std::path::Path) -> bool {
    Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            &format!(
                "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '{url}' -OutFile '{}' -UseBasicParsing -TimeoutSec 600",
                out.display()
            ),
        ])
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Verify that Ghostscript is now accessible.
fn verify_gs() -> Result<(), String> {
    let out = Command::new("gs")
        .arg("--version")
        .output()
        .map_err(|_| "安装后验证失败：未找到 gs 命令。请尝试重启应用。".to_string())?;

    if !out.status.success() {
        return Err("Ghostscript 安装后验证失败。请尝试重启应用。".into());
    }

    let version = String::from_utf8_lossy(&out.stdout).trim().to_string();
    tracing::info!("verify_gs: Ghostscript {version} is ready");
    Ok(())
}
