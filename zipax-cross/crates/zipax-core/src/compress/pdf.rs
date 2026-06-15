//! PDF compression via Ghostscript.

use std::path::Path;
use std::process::Command;

use crate::config::CompressOptions;
use crate::error::{Error, Result};

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

    let status = Command::new(&gs)
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
    // Try common names.
    for name in &["gs", "gswin64c", "gswin32c"] {
        if Command::new(name)
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Ok(name.to_string());
        }
    }

    Err(Error::GhostscriptMissing)
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
