use std::path::Path;

use zipax_core::{CompressOptions, CompressionMode, OutputFormat, QualityLevel, ResizeOptions};

pub trait CompressionRequestOptions {
    fn path(&self) -> &str;
    fn mode(&self) -> Option<&str>;
    fn format(&self) -> Option<&str>;
    fn level(&self) -> u8;
    fn target_size_kb(&self) -> Option<u32>;
    fn target_size_percent(&self) -> Option<u8>;
    fn preserve_metadata(&self) -> bool;
    fn overwrite(&self) -> bool;
    fn max_width(&self) -> Option<u32>;
    fn max_height(&self) -> Option<u32>;
    fn allow_upscale(&self) -> bool;
}

pub fn build_options<R: CompressionRequestOptions>(request: &R) -> CompressOptions {
    build_options_for_path(request, Path::new(request.path()))
}

pub fn build_options_for_path<R: CompressionRequestOptions>(
    request: &R,
    file_path: &Path,
) -> CompressOptions {
    let target_size_kb = request.target_size_kb().or_else(|| {
        request.target_size_percent().and_then(|percent| {
            let percent = percent.clamp(1, 100) as u64;
            std::fs::metadata(file_path)
                .ok()
                .map(|metadata| ((metadata.len() * percent) / 100 / 1024).max(1) as u32)
        })
    });

    CompressOptions {
        mode: request
            .mode()
            .and_then(CompressionMode::from_key)
            .unwrap_or(CompressionMode::Balanced),
        output_format: request
            .format()
            .and_then(OutputFormat::from_key)
            .unwrap_or(OutputFormat::Original),
        level: QualityLevel::from_u8(request.level()),
        target_size_kb,
        preserve_metadata: request.preserve_metadata(),
        resize: ResizeOptions {
            enabled: request.max_width().is_some() || request.max_height().is_some(),
            max_width: request.max_width(),
            max_height: request.max_height(),
            allow_upscale: request.allow_upscale(),
        },
        overwrite_original: request.overwrite(),
    }
}
