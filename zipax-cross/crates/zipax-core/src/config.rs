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
    /// Parse a compact UI/CLI key into a compression mode.
    pub fn from_key(key: &str) -> Option<Self> {
        match key {
            "quality" => Some(Self::QualityFirst),
            "balanced" => Some(Self::Balanced),
            "size" => Some(Self::SizeFirst),
            "advanced" => Some(Self::Advanced),
            "target" | "target_size" | "target-size" => Some(Self::TargetSize),
            _ => None,
        }
    }

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
    /// Convert a user-provided numeric level into a bounded quality level.
    pub fn from_u8(level: u8) -> Self {
        match level {
            1 => Self::L1,
            2 => Self::L2,
            3 => Self::L3,
            4 => Self::L4,
            5 => Self::L5,
            _ => Self::L6,
        }
    }

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
    /// Parse a compact UI/CLI key into an output format.
    pub fn from_key(key: &str) -> Option<Self> {
        match key {
            "original" => Some(Self::Original),
            "jpeg" | "jpg" => Some(Self::Jpeg),
            "png" => Some(Self::Png),
            "webp" => Some(Self::Webp),
            "avif" => Some(Self::Avif),
            "heic" | "heif" => Some(Self::Heic),
            "pdf" => Some(Self::Pdf),
            _ => None,
        }
    }

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
#[derive(Debug, Clone, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct ResizeOptions {
    pub enabled: bool,
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
    pub allow_upscale: bool,
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

#[cfg(test)]
mod tests {
    use super::{CompressionMode, OutputFormat, QualityLevel};

    #[test]
    fn parses_compact_mode_keys() {
        assert_eq!(
            CompressionMode::from_key("quality"),
            Some(CompressionMode::QualityFirst)
        );
        assert_eq!(
            CompressionMode::from_key("balanced"),
            Some(CompressionMode::Balanced)
        );
        assert_eq!(
            CompressionMode::from_key("size"),
            Some(CompressionMode::SizeFirst)
        );
        assert_eq!(
            CompressionMode::from_key("advanced"),
            Some(CompressionMode::Advanced)
        );
        assert_eq!(
            CompressionMode::from_key("target"),
            Some(CompressionMode::TargetSize)
        );
        assert_eq!(
            CompressionMode::from_key("target-size"),
            Some(CompressionMode::TargetSize)
        );
        assert_eq!(CompressionMode::from_key("unknown"), None);
    }

    #[test]
    fn parses_compact_output_format_keys() {
        assert_eq!(
            OutputFormat::from_key("original"),
            Some(OutputFormat::Original)
        );
        assert_eq!(OutputFormat::from_key("jpg"), Some(OutputFormat::Jpeg));
        assert_eq!(OutputFormat::from_key("jpeg"), Some(OutputFormat::Jpeg));
        assert_eq!(OutputFormat::from_key("png"), Some(OutputFormat::Png));
        assert_eq!(OutputFormat::from_key("webp"), Some(OutputFormat::Webp));
        assert_eq!(OutputFormat::from_key("avif"), Some(OutputFormat::Avif));
        assert_eq!(OutputFormat::from_key("heic"), Some(OutputFormat::Heic));
        assert_eq!(OutputFormat::from_key("heif"), Some(OutputFormat::Heic));
        assert_eq!(OutputFormat::from_key("pdf"), Some(OutputFormat::Pdf));
        assert_eq!(OutputFormat::from_key("gif"), None);
    }

    #[test]
    fn converts_numeric_quality_levels() {
        assert_eq!(QualityLevel::from_u8(1), QualityLevel::L1);
        assert_eq!(QualityLevel::from_u8(3), QualityLevel::L3);
        assert_eq!(QualityLevel::from_u8(6), QualityLevel::L6);
        assert_eq!(QualityLevel::from_u8(0), QualityLevel::L6);
        assert_eq!(QualityLevel::from_u8(99), QualityLevel::L6);
    }
}
