//! Error types for zipax-core.

use std::path::PathBuf;

/// Unified error type for compression operations.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("无法读取文件: {0}")]
    Io(#[from] std::io::Error),

    #[error("无法解码图片: {0}")]
    ImageDecode(String),

    #[error("无法编码图片: {0}")]
    ImageEncode(String),

    #[error("不支持的格式: {path}")]
    UnsupportedFormat { path: PathBuf },

    #[error("GIF 格式暂不支持压缩")]
    GifUnsupported,

    #[error("PDF 压缩需要系统安装 Ghostscript")]
    GhostscriptMissing,

    #[error("PDF 压缩失败: {0}")]
    PdfCompressionFailed(String),

    #[error("目标大小无法达到: 目标 {target} 字节, 最佳结果 {best} 字节")]
    TargetSizeUnreachable { target: u64, best: u64 },

    #[error("文件不存在: {0}")]
    FileNotFound(PathBuf),

    #[error("JSON 序列化错误: {0}")]
    Json(#[from] serde_json::Error),

    #[error("{0}")]
    Other(String),
}

/// Convenience Result alias.
pub type Result<T> = std::result::Result<T, Error>;
