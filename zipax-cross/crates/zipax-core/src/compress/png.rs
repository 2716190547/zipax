//! PNG compression using imagequant + oxipng.

use std::path::Path;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::image_io::open_image;
use crate::utils;

/// Compress a PNG image.
///
/// Uses imagequant for quantization and oxipng for lossless optimization.
pub fn compress(
    source: &Path,
    output: &Path,
    quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let img = open_image(source).map_err(|e| Error::ImageDecode(format!("读取 PNG 失败: {e}")))?;

    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    // Use imagequant for palette quantization.
    let mut quantizer = imagequant::new();
    let _ = quantizer.set_quality(0, (quality * 100.0).clamp(1.0, 100.0) as u8);

    let rgba_pixels: Vec<imagequant::RGBA> = rgba
        .pixels()
        .map(|p| imagequant::RGBA {
            r: p[0],
            g: p[1],
            b: p[2],
            a: p[3],
        })
        .collect();

    let mut image = quantizer
        .new_image(rgba_pixels.as_slice(), width as usize, height as usize, 0.0)
        .map_err(|e| Error::ImageEncode(format!("PNG 量化初始化失败: {e}")))?;

    let mut result = quantizer
        .quantize(&mut image)
        .map_err(|e| Error::ImageEncode(format!("PNG 量化失败: {e}")))?;

    let (palette, pixels) = result
        .remapped(&mut image)
        .map_err(|e| Error::ImageEncode(format!("PNG 重映射失败: {e}")))?;

    // Keep intermediate files outside watched folders to avoid automation loops.
    let temp_path = utils::temp_output_path("png");
    write_indexed_png(&temp_path, width, height, &palette, &pixels)?;

    // oxipng optimization.
    let level = match quality {
        q if q >= 0.9 => 2,
        q if q >= 0.7 => 4,
        _ => 6,
    };

    let oxipng_options = oxipng::Options::from_preset(level);
    let in_data = std::fs::read(&temp_path)
        .map_err(|e| Error::ImageEncode(format!("读取临时 PNG 失败: {e}")))?;

    match oxipng::optimize_from_memory(&in_data, &oxipng_options) {
        Ok(optimized) => {
            std::fs::write(output, &optimized)?;
        }
        Err(_) => {
            // Fallback: copy the imagequant output directly.
            std::fs::copy(&temp_path, output)?;
        }
    }

    let _ = std::fs::remove_file(&temp_path);

    Ok(())
}

/// Write an indexed-color PNG file.
fn write_indexed_png(
    path: &Path,
    width: u32,
    height: u32,
    palette: &[imagequant::RGBA],
    pixels: &[u8],
) -> Result<()> {
    use std::io::BufWriter;

    let file = std::fs::File::create(path)
        .map_err(|e| Error::ImageEncode(format!("创建 PNG 文件失败: {e}")))?;
    let w = BufWriter::new(file);

    let mut encoder = png::Encoder::new(w, width, height);
    encoder.set_color(png::ColorType::Indexed);
    encoder.set_depth(png::BitDepth::Eight);

    let palette_bytes: Vec<u8> = palette.iter().flat_map(|c| [c.r, c.g, c.b]).collect();
    encoder.set_palette(palette_bytes);
    if palette.iter().any(|c| c.a < 255) {
        let transparency: Vec<u8> = palette.iter().map(|c| c.a).collect();
        encoder.set_trns(transparency);
    }

    let mut writer = encoder
        .write_header()
        .map_err(|e| Error::ImageEncode(format!("PNG 头写入失败: {e}")))?;

    writer
        .write_image_data(pixels)
        .map_err(|e| Error::ImageEncode(format!("PNG 数据写入失败: {e}")))?;

    Ok(())
}
