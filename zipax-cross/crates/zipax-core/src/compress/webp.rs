//! WebP compression using the webp crate.

use std::path::Path;

use crate::config::CompressOptions;
use crate::error::Result;
use crate::image_io::open_image;

/// Compress an image to WebP format.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let img = open_image(source)?;

    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    let encoder = webp::Encoder::from_rgba(&rgba, width, height);
    let quality_pct = (quality * 100.0).clamp(1.0, 100.0);
    let encoded = encoder.encode(quality_pct);

    std::fs::write(output, &*encoded)?;

    Ok(())
}
