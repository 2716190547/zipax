//! PDF compression via Ghostscript.

use std::path::{Path, PathBuf};
use std::sync::OnceLock;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::process::background_command;

/// Compress a PDF file using Ghostscript.
///
/// This requires Ghostscript (`gs`) to be installed and available in PATH.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let gs = find_ghostscript()?;

    let pdf_setting = quality_to_pdf_setting(quality);

    let mut cmd = background_command(&gs);
    prepare_gs_environment(&mut cmd, &gs);

    let status = cmd
        .args([
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            &format!("-dPDFSETTINGS={pdf_setting}"),
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            &format!("-sOutputFile={}", output.display()),
            &source.display().to_string(),
        ])
        .status()
        .map_err(|e| Error::PdfCompressionFailed(format!("执行 Ghostscript 失败: {e}")))?;

    if !status.success() {
        return Err(Error::PdfCompressionFailed(format!(
            "Ghostscript 退出码: {:?}",
            status.code()
        )));
    }

    Ok(())
}

/// Find the Ghostscript executable.
fn find_ghostscript() -> Result<String> {
    static GHOSTSCRIPT: OnceLock<Option<String>> = OnceLock::new();

    if let Some(name) = GHOSTSCRIPT.get_or_init(find_ghostscript_command).clone() {
        return Ok(name);
    }

    Err(Error::GhostscriptMissing)
}

fn find_ghostscript_command() -> Option<String> {
    // First, check if Ghostscript is bundled in the app's resource directory.
    if let Some(path) = bundled_ghostscript() {
        return Some(path);
    }

    // Fall back to system PATH.
    for name in &["gs", "gswin64c", "gswin32c"] {
        if background_command(name)
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some(name.to_string());
        }
    }

    None
}

/// Check if Ghostscript is bundled alongside the app.
fn bundled_ghostscript() -> Option<String> {
    let exe_path = std::env::current_exe().ok()?;
    let exe_dir = exe_path.parent()?;

    // Try paths relative to the executable (varies by platform and bundle layout).
    let candidates: &[PathBuf] = &[
        // macOS: binary at zipax.app/Contents/MacOS/zipax,
        //         resources at zipax.app/Contents/Resources/Tools/bin/gs
        exe_dir
            .parent()
            .map(|p| p.join("Resources").join("Tools").join("bin").join("gs"))
            .unwrap_or_default(),
        // Windows / Linux flat layout: Tools/bin/gs next to exe
        exe_dir.join("Tools").join("bin").join("gs"),
        // Fallback: gs next to exe
        exe_dir.join("gs"),
    ];

    for candidate in candidates {
        if !candidate.exists() {
            continue;
        }
        if std::process::Command::new(candidate)
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some(candidate.to_string_lossy().to_string());
        }
    }

    None
}

/// Set environment variables for the Ghostscript subprocess so it can find
/// its shared libraries and initialization files when bundled.
fn prepare_gs_environment(cmd: &mut std::process::Command, gs_path: &str) {
    // Only set env vars for bundled (non-PATH) Ghostscript.
    let is_bundled = gs_path.contains('/') || gs_path.contains('\\');
    if !is_bundled {
        return;
    }

    let gs_dir = Path::new(gs_path).parent().unwrap_or(Path::new(""));
    let tools_dir = gs_dir.parent().unwrap_or(gs_dir);
    let lib_dir = tools_dir.join("lib");
    let share_dir = tools_dir.join("share");

    #[cfg(target_os = "macos")]
    {
        if lib_dir.exists() {
            let existing = std::env::var("DYLD_LIBRARY_PATH").unwrap_or_default();
            let mut paths = std::env::split_paths(&existing).collect::<Vec<_>>();
            paths.push(lib_dir.to_path_buf());
            cmd.env("DYLD_LIBRARY_PATH", std::env::join_paths(paths).unwrap_or_default());
        }
        if share_dir.join("ghostscript").exists() {
            cmd.env("GS_LIB", share_dir.join("ghostscript"));
        }
    }

    #[cfg(target_os = "linux")]
    {
        if lib_dir.exists() {
            let existing = std::env::var("LD_LIBRARY_PATH").unwrap_or_default();
            let mut paths = std::env::split_paths(&existing).collect::<Vec<_>>();
            paths.push(lib_dir.to_path_buf());
            cmd.env("LD_LIBRARY_PATH", std::env::join_paths(paths).unwrap_or_default());
        }
        if share_dir.join("ghostscript").exists() {
            cmd.env("GS_LIB", share_dir.join("ghostscript"));
        }
    }
}

/// Map quality float to Ghostscript PDFSETTINGS.
fn quality_to_pdf_setting(quality: f32) -> &'static str {
    if quality >= 0.9 {
        "/prepress"
    } else if quality >= 0.7 {
        "/printer"
    } else if quality >= 0.5 {
        "/ebook"
    } else {
        "/screen"
    }
}
