//! Utility functions.

use std::path::Path;

/// Format a byte count as a human-readable string.
pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.1} KB", bytes as f64 / KB as f64)
    } else {
        format!("{bytes} B")
    }
}

/// Calculate compression ratio as a percentage.
pub fn compression_ratio(original: u64, compressed: u64) -> f64 {
    if original == 0 {
        return 0.0;
    }
    ((original as f64 - compressed as f64) / original as f64) * 100.0
}

/// Get file size, returning 0 on error.
pub fn file_size(path: &Path) -> u64 {
    std::fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}

/// Create a temporary file path in the system temp directory.
pub fn temp_output_path(extension: &str) -> std::path::PathBuf {
    let name = format!("zipax-{}", uuid_v4());
    std::env::temp_dir().join(format!("{name}.{extension}"))
}

/// Simple UUID v4-like random string (no external dependency).
fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let t = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{t:032x}")
}
