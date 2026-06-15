//! Image format detection and metadata.

use std::path::Path;

/// Supported image kinds.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ImageKind {
    Jpeg,
    Png,
    Webp,
    Avif,
    Heic,
    Heif,
    Tiff,
    Gif,
    Pdf,
}

impl ImageKind {
    /// Preferred file extension for this format.
    pub fn extension(&self) -> &'static str {
        match self {
            Self::Jpeg => "jpg",
            Self::Png => "png",
            Self::Webp => "webp",
            Self::Avif => "avif",
            Self::Heic => "heic",
            Self::Heif => "heif",
            Self::Tiff => "tiff",
            Self::Gif => "gif",
            Self::Pdf => "pdf",
        }
    }

    /// Detect image kind from file extension.
    pub fn from_extension(ext: &str) -> Option<Self> {
        match ext.to_lowercase().as_str() {
            "jpg" | "jpeg" => Some(Self::Jpeg),
            "png" => Some(Self::Png),
            "webp" => Some(Self::Webp),
            "avif" => Some(Self::Avif),
            "heic" => Some(Self::Heic),
            "heif" => Some(Self::Heif),
            "tif" | "tiff" => Some(Self::Tiff),
            "gif" => Some(Self::Gif),
            "pdf" => Some(Self::Pdf),
            _ => None,
        }
    }

    /// Detect image kind from a file path.
    pub fn from_path(path: &Path) -> Option<Self> {
        path.extension()
            .and_then(|e| e.to_str())
            .and_then(Self::from_extension)
    }

    /// Whether this format is a raster image (not PDF).
    pub fn is_raster(&self) -> bool {
        !matches!(self, Self::Pdf)
    }
}

impl std::fmt::Display for ImageKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.extension())
    }
}
