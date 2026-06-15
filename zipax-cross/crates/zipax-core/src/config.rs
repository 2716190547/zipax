//! Compression configuration types.

use crate::format::ImageKind;

/// Compression mode presets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CompressionMode {
    /// Prioritize visual quality.
    QualityFirst,
    /// Balanced quality and size.
    Balanced,
    /// Prioritize small file size.
    SizeFirst,
    /// Manual quality control.
    Advanced,
    /// Target a specific file size.
    TargetSize,
}

impl CompressionMode {
    /// Default quality level for this mode.
    pub fn default_level(&self) -> QualityLevel {
        match self {
            Self::QualityFirst => QualityLevel::L1,
            Self::Balanced => QualityLevel::L3,
            Self::SizeFirst => QualityLevel::L6,
            Self::Advanced => QualityLevel::L3,
            Self::TargetSize => QualityLevel::L3,
        }
    }
}

/// Quality level from 1 (highest) to 6 (lowest).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum QualityLevel {
    #[serde(rename = "1")]
    L1,
    #[serde(rename = "2")]
    L2,
    #[serde(rename = "3")]
    L3,
    #[serde(rename = "4")]
    L4,
    #[serde(rename = "5")]
    L5,
    #[serde(rename = "6")]
    L6,
}

impl QualityLevel {
    /// Convert to a 0.0–1.0 quality float.
    pub fn to_quality_f32(&self) -> f32 {
        match self {
            Self::L1 => 0.95,
            Self::L2 => 0.88,
            Self::L3 => 0.80,
            Self::L4 => 0.70,
            Self::L5 => 0.58,
            Self::L6 => 0.45,
        }
    }

    /// All levels in order.
    pub fn all() -> [Self; 6] {
        [Self::L1, Self::L2, Self::L3, Self::L4, Self::L5, Self::L6]
    }
}

impl std::fmt::Display for QualityLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::L1 => write!(f, "1"),
            Self::L2 => write!(f, "2"),
            Self::L3 => write!(f, "3"),
            Self::L4 => write!(f, "4"),
            Self::L5 => write!(f, "5"),
            Self::L6 => write!(f, "6"),
        }
    }
}

/// Output format for compression.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutputFormat {
    /// Keep the original format.
    Original,
    Jpeg,
    Png,
    Webp,
    Avif,
    Heic,
    Pdf,
}

impl OutputFormat {
    /// Resolve to a concrete image kind.
    pub fn resolve(&self, source: ImageKind) -> Option<ImageKind> {
        match self {
            Self::Original => Some(source),
            Self::Jpeg => Some(ImageKind::Jpeg),
            Self::Png => Some(ImageKind::Png),
            Self::Webp => Some(ImageKind::Webp),
            Self::Avif => Some(ImageKind::Avif),
            Self::Heic => Some(ImageKind::Heic),
            Self::Pdf => Some(ImageKind::Pdf),
        }
    }
}

/// Resize options.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct ResizeOptions {
    pub enabled: bool,
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
    pub allow_upscale: bool,
}

impl Default for ResizeOptions {
    fn default() -> Self {
        Self {
            enabled: false,
            max_width: None,
            max_height: None,
            allow_upscale: false,
        }
    }
}

/// Complete compression options for a single file.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CompressOptions {
    /// Compression mode.
    pub mode: CompressionMode,
    /// Output format.
    pub output_format: OutputFormat,
    /// Quality level (used by Advanced and TargetSize modes indirectly).
    pub level: QualityLevel,
    /// Target file size in KB (only for TargetSize mode).
    pub target_size_kb: Option<u32>,
    /// Whether to preserve EXIF/metadata.
    pub preserve_metadata: bool,
    /// Resize options.
    pub resize: ResizeOptions,
    /// Overwrite the original file.
    pub overwrite_original: bool,
}

impl Default for CompressOptions {
    fn default() -> Self {
        Self {
            mode: CompressionMode::Balanced,
            output_format: OutputFormat::Original,
            level: QualityLevel::L3,
            target_size_kb: None,
            preserve_metadata: false,
            resize: ResizeOptions::default(),
            overwrite_original: false,
        }
    }
}

impl CompressOptions {
    /// Create options from a compression mode preset.
    pub fn from_mode(mode: CompressionMode) -> Self {
        Self {
            mode,
            level: mode.default_level(),
            ..Default::default()
        }
    }
}
