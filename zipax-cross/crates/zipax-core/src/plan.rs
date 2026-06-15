//! Compression planning: determine what to do before executing.

use std::path::{Path, PathBuf};

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::format::ImageKind;

/// Planned action for a single file.
#[derive(Debug, Clone)]
pub struct CompressionPlan {
    /// Source file path.
    pub source: PathBuf,
    /// Detected source format.
    pub source_kind: ImageKind,
    /// Resolved output format.
    pub output_kind: ImageKind,
    /// Planned output path.
    pub output: PathBuf,
    /// Original file size in bytes.
    pub original_bytes: u64,
    /// The options to apply.
    pub options: CompressOptions,
    /// Whether the source is already optimally compressed and should be skipped.
    pub skip: bool,
    /// Skip reason, if any.
    pub skip_reason: Option<String>,
}

/// Plan compression for a single file.
///
/// This determines the output path, validates the source, and checks whether
/// the file should be skipped (e.g., already compressed).
pub fn plan_compression(source: &Path, options: &CompressOptions) -> Result<CompressionPlan> {
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

    let original_bytes = std::fs::metadata(source).map(|m| m.len()).unwrap_or(0);

    let output = compute_output_path(source, output_kind, options.overwrite_original);

    Ok(CompressionPlan {
        source: source.to_path_buf(),
        source_kind,
        output_kind,
        output,
        original_bytes,
        options: options.clone(),
        skip: false,
        skip_reason: None,
    })
}

/// Plan compression for multiple files.
pub fn plan_compression_batch(
    sources: &[PathBuf],
    options: &CompressOptions,
) -> Vec<Result<CompressionPlan>> {
    sources
        .iter()
        .map(|p| plan_compression(p, options))
        .collect()
}

/// Compute the output path for a compressed file.
fn compute_output_path(source: &Path, output_kind: ImageKind, overwrite: bool) -> PathBuf {
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
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_plan_nonexistent_file() {
        let opts = CompressOptions::default();
        let result = plan_compression(&PathBuf::from("/nonexistent.jpg"), &opts);
        assert!(result.is_err());
    }

    #[test]
    fn test_plan_gif_rejected() {
        let dir = tempfile::tempdir().unwrap();
        let gif = dir.path().join("test.gif");
        std::fs::write(&gif, b"GIF89a").unwrap();
        let opts = CompressOptions::default();
        let result = plan_compression(&gif, &opts);
        assert!(matches!(result, Err(Error::GifUnsupported)));
    }

    #[test]
    fn test_output_path_no_overwrite() {
        let source = PathBuf::from("/photos/vacation.jpg");
        let output = compute_output_path(&source, ImageKind::Webp, false);
        assert_eq!(output, PathBuf::from("/photos/vacation#C.webp"));
    }

    #[test]
    fn test_output_path_overwrite() {
        let source = PathBuf::from("/photos/vacation.jpg");
        let output = compute_output_path(&source, ImageKind::Webp, true);
        assert_eq!(output, PathBuf::from("/photos/vacation.webp"));
    }
}
