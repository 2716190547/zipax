//! Compression engine: dispatches to format-specific compressors.

use std::path::Path;

use crate::config::{CompressOptions, CompressionMode};
use crate::error::{Error, Result};
use crate::format::ImageKind;
use crate::utils;

pub mod avif;
pub mod heic;
pub mod image_pdf;
pub mod jpeg;
pub mod pdf;
pub mod png;
pub mod webp;

/// Result of a compression operation.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CompressionResult {
    /// Source file path.
    pub source: String,
    /// Output file path.
    pub output: String,
    /// Original size in bytes.
    pub original_bytes: u64,
    /// Compressed size in bytes.
    pub compressed_bytes: u64,
    /// Whether the output was used (false = output was larger, kept original).
    pub used_output: bool,
}

impl CompressionResult {
    /// Bytes saved.
    pub fn saved_bytes(&self) -> u64 {
        if self.used_output {
            self.original_bytes.saturating_sub(self.compressed_bytes)
        } else {
            0
        }
    }

    /// Compression ratio as percentage.
    pub fn ratio(&self) -> f64 {
        if self.used_output {
            utils::compression_ratio(self.original_bytes, self.compressed_bytes).max(0.0)
        } else {
            0.0
        }
    }
}

/// Compress a file according to the given options.
///
/// Returns a `CompressionResult` with the outcome. If the compressed output
/// is larger than the original (and `overwrite_original` is false), the
/// original is preserved and `used_output` is set to false.
pub fn compress_file(source: &Path, options: &CompressOptions) -> Result<CompressionResult> {
    if !source.exists() {
        return Err(Error::FileNotFound(source.to_path_buf()));
    }

    let source_kind = ImageKind::from_path(source).ok_or_else(|| Error::UnsupportedFormat {
        path: source.to_path_buf(),
    })?;

    if source_kind == ImageKind::Gif {
        return Err(Error::GifUnsupported);
    }

    let output_kind = options
        .output_format
        .resolve(source_kind)
        .unwrap_or(source_kind);
    let is_image_to_pdf = source_kind.is_raster() && output_kind == ImageKind::Pdf;
    let overwrite_original = options.overwrite_original && !is_image_to_pdf;

    let original_bytes = utils::file_size(source);

    // For target-size mode, use binary search to find optimal quality.
    if options.mode == CompressionMode::TargetSize {
        if let Some(target_kb) = options.target_size_kb {
            let target_bytes = (target_kb as u64) * 1024;
            return compress_to_target(source, source_kind, output_kind, target_bytes, options);
        }
    }

    // Standard compression.
    let output_path = compute_output_path(source, output_kind, overwrite_original);
    let quality = options.level.to_quality_f32();

    encode(
        source,
        &output_path,
        source_kind,
        output_kind,
        quality,
        options,
    )?;

    let compressed_bytes = utils::file_size(&output_path);

    // If compressed is larger and we're not overwriting, discard the output.
    if !overwrite_original && !is_image_to_pdf && compressed_bytes >= original_bytes {
        let _ = std::fs::remove_file(&output_path);
        return Ok(CompressionResult {
            source: source.to_string_lossy().to_string(),
            output: source.to_string_lossy().to_string(),
            original_bytes,
            compressed_bytes: original_bytes,
            used_output: false,
        });
    }

    // If overwriting, replace the original.
    if overwrite_original {
        if output_kind == source_kind {
            // Same format: atomic rename.
            std::fs::rename(&output_path, source)?;
        } else {
            // Different format: remove original, rename output.
            let _ = std::fs::remove_file(source);
            std::fs::rename(&output_path, source.with_extension(output_kind.extension()))?;
        }
    }

    Ok(CompressionResult {
        source: source.to_string_lossy().to_string(),
        output: if overwrite_original {
            source.to_string_lossy().to_string()
        } else {
            output_path.to_string_lossy().to_string()
        },
        original_bytes,
        compressed_bytes,
        used_output: true,
    })
}

/// Compress to a target file size using binary search on quality.
///
/// Binary search finds the highest quality that produces output ≤ target size.
/// Falls back to the smallest result if target cannot be reached.
fn compress_to_target(
    source: &Path,
    source_kind: ImageKind,
    output_kind: ImageKind,
    target_bytes: u64,
    options: &CompressOptions,
) -> Result<CompressionResult> {
    let original_bytes = utils::file_size(source);

    // Binary search bounds: quality from 0.01 to 0.99
    let mut lo: f32 = 0.01;
    let mut hi: f32 = 0.99;
    let mut best_path: Option<std::path::PathBuf> = None;
    let mut best_bytes: Option<u64> = None;
    let mut best_quality: f32 = 0.5;

    // 最多迭代 8 次（精度足够）
    for _ in 0..8 {
        let mid = (lo + hi) / 2.0;
        let attempt_path = utils::temp_output_path(output_kind.extension());

        let encode_result = encode(
            source,
            &attempt_path,
            source_kind,
            output_kind,
            mid,
            options,
        );

        if encode_result.is_err() {
            let _ = std::fs::remove_file(&attempt_path);
            // 编码失败，降低质量上限
            hi = mid;
            continue;
        }

        let attempt_bytes = utils::file_size(&attempt_path);

        if attempt_bytes <= target_bytes {
            // 达到目标，尝试更高质量
            if let Some(ref p) = best_path {
                let _ = std::fs::remove_file(p);
            }
            best_path = Some(attempt_path);
            best_bytes = Some(attempt_bytes);
            best_quality = mid;
            lo = mid;
        } else {
            // 超过目标，降低质量
            let _ = std::fs::remove_file(&attempt_path);
            hi = mid;
        }
    }

    // 如果二分搜索没找到满足目标的结果，尝试最低质量
    if best_path.is_none() {
        let attempt_path = utils::temp_output_path(output_kind.extension());
        if encode(
            source,
            &attempt_path,
            source_kind,
            output_kind,
            0.01,
            options,
        )
        .is_ok()
        {
            let attempt_bytes = utils::file_size(&attempt_path);
            best_path = Some(attempt_path);
            best_bytes = Some(attempt_bytes);
            best_quality = 0.01;
        }
    }

    let best = best_path.ok_or(Error::Other("无法生成压缩结果".into()))?;
    let best_size = best_bytes.unwrap_or(0);

    tracing::info!(
        "目标大小压缩: target={}KB, achieved={}KB, quality={:.2}",
        target_bytes / 1024,
        best_size / 1024,
        best_quality
    );

    let output_path = compute_output_path(source, output_kind, options.overwrite_original);
    std::fs::rename(&best, &output_path)?;

    Ok(CompressionResult {
        source: source.to_string_lossy().to_string(),
        output: output_path.to_string_lossy().to_string(),
        original_bytes,
        compressed_bytes: best_size,
        used_output: true,
    })
}

/// Dispatch encoding to the appropriate format-specific encoder.
fn encode(
    source: &Path,
    output: &Path,
    _source_kind: ImageKind,
    output_kind: ImageKind,
    quality: f32,
    options: &CompressOptions,
) -> Result<()> {
    match output_kind {
        ImageKind::Jpeg => jpeg::compress(source, output, quality, options),
        ImageKind::Png => png::compress(source, output, quality, options),
        ImageKind::Webp => webp::compress(source, output, quality, options),
        ImageKind::Avif => avif::compress(source, output, quality, options),
        ImageKind::Heic | ImageKind::Heif => heic::compress(source, output, quality, options),
        ImageKind::Pdf if _source_kind.is_raster() => {
            image_pdf::convert(source, output, quality, options)
        }
        ImageKind::Pdf => pdf::compress(source, output, quality, options),
        _ => Err(Error::UnsupportedFormat {
            path: output.to_path_buf(),
        }),
    }
}

/// Compute the output path for a compressed file.
fn compute_output_path(
    source: &Path,
    output_kind: ImageKind,
    overwrite: bool,
) -> std::path::PathBuf {
    let stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");
    let ext = output_kind.extension();

    if overwrite {
        source
            .parent()
            .unwrap_or(Path::new("."))
            .join(format!("{stem}.{ext}"))
    } else {
        let dir = source.parent().unwrap_or(Path::new("."));
        dir.join(format!("{stem}#C.{ext}"))
    }
}

#[cfg(test)]
mod tests {
    use image::{Rgb, RgbImage};
    use tempfile::tempdir;

    use super::compress_file;
    use crate::config::{CompressOptions, OutputFormat};
    use crate::format::ImageKind;

    fn write_sample_png(path: &std::path::Path) {
        let mut image = RgbImage::new(48, 36);
        for (x, y, pixel) in image.enumerate_pixels_mut() {
            *pixel = Rgb([
                ((x * 5) % 255) as u8,
                ((y * 7) % 255) as u8,
                (((x + y) * 3) % 255) as u8,
            ]);
        }
        image.save(path).expect("sample png should be written");
    }

    #[test]
    fn encodes_heic_and_decodes_it_for_jpeg_output() {
        let temp = tempdir().expect("tempdir should be created");
        let png_path = temp.path().join("sample.png");
        write_sample_png(&png_path);

        let heic = compress_file(
            &png_path,
            &CompressOptions {
                output_format: OutputFormat::Heic,
                ..CompressOptions::default()
            },
        )
        .expect("png should encode to heic");
        let heic_path = std::path::PathBuf::from(&heic.output);
        assert_eq!(ImageKind::from_path(&heic_path), Some(ImageKind::Heic));
        assert!(heic_path.exists());
        assert!(heic.compressed_bytes > 0);

        let jpeg = compress_file(
            &heic_path,
            &CompressOptions {
                output_format: OutputFormat::Jpeg,
                ..CompressOptions::default()
            },
        )
        .expect("heic should decode and encode to jpeg");
        let jpeg_path = std::path::PathBuf::from(&jpeg.output);
        assert_eq!(ImageKind::from_path(&jpeg_path), Some(ImageKind::Jpeg));
        assert!(jpeg_path.exists());
        assert!(jpeg.compressed_bytes > 0);
    }
}
