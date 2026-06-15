//! HEIC compression via ImageMagick.
//!
//! Requires ImageMagick (`magick`) to be installed and available in PATH.
//! On macOS: `brew install imagemagick`
//! On Linux: `apt install imagemagick`
//! On Windows: download from https://imagemagick.org

use std::path::Path;
use std::process::Command;

use crate::config::CompressOptions;
use crate::error::{Error, Result};

/// Compress an image to HEIC format using ImageMagick.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let magick = find_imagemagick()?;

    // ImageMagick quality for HEIC: 0-100 (higher = better quality)
    let quality_pct = (quality * 100.0).clamp(1.0, 100.0) as u32;

    let status = Command::new(&magick)
        .arg(source)
        .args([
            "-quality",
            &quality_pct.to_string(),
            "-define",
            "heic:speed=6",
            output
                .to_str()
                .ok_or_else(|| Error::Other("输出路径无效".into()))?,
        ])
        .status()
        .map_err(|e| Error::ImageEncode(format!("执行 ImageMagick 失败: {e}")))?;

    if !status.success() {
        return Err(Error::ImageEncode(format!(
            "ImageMagick HEIC 编码失败，退出码: {:?}",
            status.code()
        )));
    }

    Ok(())
}

/// Find the ImageMagick executable.
fn find_imagemagick() -> Result<String> {
    // Try common names.
    for name in &["magick", "convert"] {
        if Command::new(name)
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Ok(name.to_string());
        }
    }

    Err(Error::Other(
        "未找到 ImageMagick，请安装: brew install imagemagick".into(),
    ))
}
