//! JPEG compression using mozjpeg.

use std::io::BufWriter;
use std::path::Path;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::image_io::open_image;

/// Compress a JPEG image.
///
/// Uses mozjpeg for high-quality, efficient JPEG encoding.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    // Read source image into raw RGBA pixels.
    let img = open_image(source).map_err(|e| Error::ImageDecode(format!("读取 JPEG 失败: {e}")))?;

    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    // Use mozjpeg for encoding.
    let quality_pct = (quality * 100.0).clamp(1.0, 100.0);

    let mut compress = mozjpeg::Compress::new(mozjpeg::ColorSpace::JCS_RGB);
    compress.set_size(width as usize, height as usize);
    compress.set_quality(quality_pct);

    // Convert RGBA to RGB for JPEG.
    let rgb_data: Vec<u8> = rgba.pixels().flat_map(|p| [p[0], p[1], p[2]]).collect();

    let file = std::fs::File::create(output)
        .map_err(|e| Error::ImageEncode(format!("创建 JPEG 文件失败: {e}")))?;
    let writer = BufWriter::new(file);

    let mut started = compress
        .start_compress(writer)
        .map_err(|e| Error::ImageEncode(format!("JPEG 压缩启动失败: {e}")))?;

    let stride = width as usize * 3;
    for row in 0..height as usize {
        let start = row * stride;
        let end = start + stride;
        if end <= rgb_data.len() {
            started
                .write_scanlines(&rgb_data[start..end])
                .map_err(|e| Error::ImageEncode(format!("JPEG 写入失败: {e}")))?;
        }
    }

    started
        .finish()
        .map_err(|e| Error::ImageEncode(format!("JPEG 完成失败: {e}")))?;

    Ok(())
}
