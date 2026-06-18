//! Tauri commands: bridge between frontend and Rust core.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use zipax_core::{
    compress_file as core_compress, plan_compression as core_plan, CompressOptions,
    CompressionMode, ImageKind,
};

use crate::compression_options::{build_options, CompressionRequestOptions};

/// Compression options from the frontend.
#[derive(Debug, Deserialize)]
pub struct CompressRequest {
    pub path: String,
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

impl CompressionRequestOptions for CompressRequest {
    fn path(&self) -> &str {
        &self.path
    }

    fn mode(&self) -> Option<&str> {
        self.mode.as_deref()
    }

    fn format(&self) -> Option<&str> {
        self.format.as_deref()
    }

    fn level(&self) -> u8 {
        self.level
    }

    fn target_size_kb(&self) -> Option<u32> {
        self.target_size_kb
    }

    fn target_size_percent(&self) -> Option<u8> {
        self.target_size_percent
    }

    fn preserve_metadata(&self) -> bool {
        self.preserve_metadata
    }

    fn overwrite(&self) -> bool {
        self.overwrite
    }

    fn max_width(&self) -> Option<u32> {
        self.max_width
    }

    fn max_height(&self) -> Option<u32> {
        self.max_height
    }

    fn allow_upscale(&self) -> bool {
        self.allow_upscale
    }
}

pub fn default_level() -> u8 {
    3
}

/// Compression result returned to the frontend.
#[derive(Debug, Serialize, Clone)]
pub struct CompressResponse {
    pub source: String,
    pub output: String,
    pub original_bytes: u64,
    pub compressed_bytes: u64,
    pub saved_bytes: u64,
    pub ratio: f64,
    pub used_output: bool,
    pub error: Option<String>,
}

/// App info response.
#[derive(Debug, Serialize)]
pub struct AppInfo {
    pub version: String,
    pub core_version: String,
    pub supported_formats: Vec<String>,
}

/// Compress a single file.
#[tauri::command]
pub fn compress_file(request: CompressRequest) -> CompressResponse {
    let options = build_options(&request);

    match core_compress(&PathBuf::from(&request.path), &options) {
        Ok(result) => CompressResponse {
            source: result.source.clone(),
            output: result.output.clone(),
            original_bytes: result.original_bytes,
            compressed_bytes: result.compressed_bytes,
            saved_bytes: result.saved_bytes(),
            ratio: result.ratio(),
            used_output: result.used_output,
            error: None,
        },
        Err(e) => CompressResponse {
            source: request.path.clone(),
            output: request.path.clone(),
            original_bytes: 0,
            compressed_bytes: 0,
            saved_bytes: 0,
            ratio: 0.0,
            used_output: false,
            error: Some(e.to_string()),
        },
    }
}

/// Compress multiple files.
#[tauri::command]
pub fn compress_batch(requests: Vec<CompressRequest>) -> Vec<CompressResponse> {
    requests.into_iter().map(compress_file).collect()
}

/// Plan compression for a file (dry run).
#[tauri::command]
pub fn plan_compression(path: String, mode: Option<String>) -> Result<PlanResponse, String> {
    let options = CompressOptions::from_mode(parse_mode(mode.as_deref()));
    let plan = core_plan(&PathBuf::from(&path), &options).map_err(|e| e.to_string())?;

    Ok(PlanResponse {
        source: plan.source.to_string_lossy().to_string(),
        source_kind: format!("{:?}", plan.source_kind),
        output: plan.output.to_string_lossy().to_string(),
        output_kind: format!("{:?}", plan.output_kind),
        original_bytes: plan.original_bytes,
        skip: plan.skip,
        skip_reason: plan.skip_reason,
    })
}

#[derive(Serialize)]
pub struct PlanResponse {
    pub source: String,
    pub source_kind: String,
    pub output: String,
    pub output_kind: String,
    pub original_bytes: u64,
    pub skip: bool,
    pub skip_reason: Option<String>,
}

/// Get application info.
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        core_version: env!("CARGO_PKG_VERSION").to_string(),
        supported_formats: ImageKind::supported_input_extensions()
            .iter()
            .map(|extension| extension.to_string())
            .collect(),
    }
}

fn parse_mode(s: Option<&str>) -> CompressionMode {
    s.and_then(CompressionMode::from_key)
        .unwrap_or(CompressionMode::Balanced)
}
