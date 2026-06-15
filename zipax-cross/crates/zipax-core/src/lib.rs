//! zipax-core: Cross-platform image and PDF compression engine.
//!
//! This crate provides the core compression logic for zipax, designed to work
//! across macOS, Windows, and Linux without platform-specific dependencies.

pub mod compress;
pub mod config;
pub mod error;
pub mod format;
pub mod plan;
pub mod utils;

pub use compress::compress_file;
pub use config::{CompressOptions, CompressionMode, OutputFormat, QualityLevel, ResizeOptions};
pub use error::{Error, Result};
pub use format::ImageKind;
pub use plan::{plan_compression, CompressionPlan};
