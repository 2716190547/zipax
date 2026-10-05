use std::path::Path;

use serde::Deserialize;
use zipax_core::{CompressOptions, CompressionMode, OutputFormat, QualityLevel, ResizeOptions};

pub fn default_level() -> u8 {
    3
}

/// Compression parameters shared between manual compression and folder watcher requests.
#[derive(Debug, Clone, Deserialize)]
pub struct CompressionParams {
    #[serde(default)]
    pub mode: Option<String>,
    #[serde(default)]
    pub format: Option<String>,
    #[serde(default = "default_level")]
    pub level: u8,
    #[serde(default)]
    pub target_size_kb: Option<u32>,
    #[serde(default)]
    pub target_size_percent: Option<u8>,
    #[serde(default)]
    pub preserve_metadata: bool,
    #[serde(default)]
    pub overwrite: bool,
    #[serde(default)]
    pub max_width: Option<u32>,
    #[serde(default)]
    pub max_height: Option<u32>,
    #[serde(default)]
    pub allow_upscale: bool,
}

impl CompressionParams {
    pub fn to_compress_options(&self, file_path: &Path) -> CompressOptions {
        let target_size_kb = self.target_size_kb.or_else(|| {
            self.target_size_percent.and_then(|percent| {
                let percent = percent.clamp(1, 100) as u64;
                std::fs::metadata(file_path)
                    .ok()
                    .map(|metadata| ((metadata.len() * percent) / 100 / 1024).max(1) as u32)
            })
        });

        CompressOptions {
            mode: self
                .mode
                .as_deref()
                .and_then(CompressionMode::from_key)
                .unwrap_or(CompressionMode::Balanced),
            output_format: self
                .format
                .as_deref()
                .and_then(OutputFormat::from_key)
                .unwrap_or(OutputFormat::Original),
            level: QualityLevel::from_u8(self.level),
            target_size_kb,
            preserve_metadata: self.preserve_metadata,
            resize: ResizeOptions {
                enabled: self.max_width.is_some() || self.max_height.is_some(),
                max_width: self.max_width,
                max_height: self.max_height,
                allow_upscale: self.allow_upscale,
            },
            overwrite_original: self.overwrite,
        }
    }
}
