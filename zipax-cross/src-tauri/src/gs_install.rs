use std::process::Command;

#[cfg(target_os = "windows")]
const GS_URL: &str = "https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10033/gs10033w64.exe";

/// Install Ghostscript automatically based on the current platform.
///
/// - macOS: `brew install ghostscript` (no sudo required).
/// - Windows: download official installer → run silently with `/S`.
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

        // 2. download official installer and run silently
        let temp_dir = std::env::temp_dir();
        let installer_path = temp_dir.join("gs_installer.exe");

        tracing::info!("install_ghostscript: downloading installer from {GS_URL}");

        let download = Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Invoke-WebRequest -Uri '{GS_URL}' -OutFile '{}' -UseBasicParsing",
                    installer_path.display()
                ),
            ])
            .status()
            .map_err(|e| format!("无法启动下载进程: {e}"))?;

        if !download.success() {
            return Err("Ghostscript 安装包下载失败，请检查网络连接。\n\n手动下载地址：\nhttps://ghostscript.com/releases/gsdnld.html".into());
        }

        tracing::info!("install_ghostscript: running installer silently");

        let install = Command::new(&installer_path)
            .arg("/S")
            .status()
            .map_err(|e| format!("无法启动 Ghostscript 安装程序: {e}"))?;

        if !install.success() {
            return Err(
                "Ghostscript 安装失败，请尝试手动安装。\n\n下载地址：\nhttps://ghostscript.com/releases/gsdnld.html"
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