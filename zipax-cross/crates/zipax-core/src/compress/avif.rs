//! AVIF compression using ravif.

use std::path::Path;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::image_io::open_image;

/// Compress an image to AVIF format.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let img = open_image(source)?;

    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    // Convert to ravif's RGBA type.
    let pixels: Vec<rgb::RGBA8> = rgba
        .pixels()
        .map(|p| rgb::RGBA8::new(p[0], p[1], p[2], p[3]))
        .collect();

    let img_ref = ravif::Img::new(pixels.as_slice(), width as usize, height as usize);

    let quality_pct = (quality * 100.0).clamp(1.0, 100.0);

    let encoder = ravif::Encoder::new()
        .with_quality(quality_pct)
        .with_speed(4)
        .with_num_threads(Some(1));

    let result = encoder
        .encode_rgba(img_ref)
        .map_err(|e| Error::ImageEncode(format!("AVIF 编码失败: {e}")))?;

    std::fs::write(output, result.avif_file)?;

    Ok(())
}
