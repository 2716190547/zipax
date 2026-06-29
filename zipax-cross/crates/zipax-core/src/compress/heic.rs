//! HEIC/HEIF compression using bundled libheif bindings.

use std::path::Path;

use libheif_rs::{
    Channel, ColorSpace, CompressionFormat, EncoderQuality, HeifContext, Image, LibHeif, RgbChroma,
};

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::image_io::open_image;

/// Compress or convert an image to HEIC/HEIF.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let img = open_image(source)?;
    let rgb = img.to_rgb8();
    let (width, height) = rgb.dimensions();
    let image = create_heif_image(rgb.as_raw(), width, height)?;

    let lib_heif = LibHeif::new();
    let mut context =
        HeifContext::new().map_err(|e| Error::ImageEncode(format!("HEIC 上下文创建失败: {e}")))?;
    let mut encoder = lib_heif
        .encoder_for_format(CompressionFormat::Hevc)
        .map_err(|e| {
            Error::ImageEncode(format!(
                "内置 HEIC 编码器不可用: {e}。请确认打包时包含 HEVC 编码 codec。"
            ))
        })?;
    encoder
        .set_quality(EncoderQuality::Lossy(heic_quality(quality)))
        .map_err(|e| Error::ImageEncode(format!("HEIC 质量设置失败: {e}")))?;

    context
        .encode_image(&image, &mut encoder, None)
        .map_err(|e| Error::ImageEncode(format!("HEIC 编码失败: {e}")))?;

    let output = output
        .to_str()
        .ok_or_else(|| Error::ImageEncode("HEIC 输出路径无效".into()))?;
    context
        .write_to_file(output)
        .map_err(|e| Error::ImageEncode(format!("HEIC 写入失败: {e}")))?;

    Ok(())
}

fn create_heif_image(rgb: &[u8], width: u32, height: u32) -> Result<Image> {
    let mut image = Image::new(width, height, ColorSpace::Rgb(RgbChroma::Rgb))
        .map_err(|e| Error::ImageEncode(format!("HEIC 图像创建失败: {e}")))?;
    image
        .create_plane(Channel::Interleaved, width, height, 24)
        .map_err(|e| Error::ImageEncode(format!("HEIC 像素平面创建失败: {e}")))?;

    let planes = image.planes_mut();
    let plane = planes
        .interleaved
        .ok_or_else(|| Error::ImageEncode("HEIC 像素平面不可用".into()))?;
    let row_bytes = width as usize * 3;
    let expected_bytes = row_bytes * height as usize;
    if rgb.len() < expected_bytes {
        return Err(Error::ImageEncode("HEIC 输入像素数据不完整".into()));
    }

    for (src, dst) in rgb.chunks_exact(row_bytes).zip(
        plane
            .data
            .chunks_exact_mut(plane.stride)
            .take(height as usize),
    ) {
        dst[..row_bytes].copy_from_slice(src);
    }

    Ok(image)
}

fn heic_quality(quality: f32) -> u8 {
    (quality * 100.0).round().clamp(1.0, 100.0) as u8
}
