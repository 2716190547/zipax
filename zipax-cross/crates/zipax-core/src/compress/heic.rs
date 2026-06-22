//! HEIC compression via ImageMagick.
//!
//! Requires ImageMagick (`magick`) to be installed and available in PATH.
//! On macOS: `brew install imagemagick`
//! On Linux: `apt install imagemagick`
//! On Windows: download from https://imagemagick.org

use std::path::Path;
use std::sync::OnceLock;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::process::background_command;

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

    let status = background_command(&magick)
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
    static IMAGEMAGICK: OnceLock<Option<String>> = OnceLock::new();

    if let Some(name) = IMAGEMAGICK.get_or_init(find_imagemagick_command).clone() {
        return Ok(name);
    }

    Err(Error::Other(
        "未找到 ImageMagick，请安装: brew install imagemagick".into(),
    ))
}

fn find_imagemagick_command() -> Option<String> {
    // Try common names.
    for name in &["magick", "convert"] {
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
