//! Tauri commands: bridge between frontend and Rust core.

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use auto_launch::AutoLaunchBuilder;
use serde::{Deserialize, Serialize};
use tauri::State;
use zipax_core::{
    compress_file as core_compress, plan_compression as core_plan, CompressOptions,
    CompressionMode, OutputFormat, QualityLevel, ResizeOptions,
};

use crate::watcher::FolderWatcher;

/// Shared state for folder watchers.
pub struct WatcherState {
    watchers: Arc<Mutex<Vec<FolderWatcher>>>,
}

impl WatcherState {
    pub fn new() -> Self {
        Self {
            watchers: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

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

fn default_level() -> u8 {
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

/// Watch folder request.
#[derive(Debug, Deserialize)]
pub struct WatchFolderRequest {
    pub path: String,
    pub auto_compress: bool,
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
        supported_formats: vec![
            "jpg".into(),
            "png".into(),
            "webp".into(),
            "avif".into(),
            "tiff".into(),
            "pdf".into(),
        ],
    }
}

/// Enable or disable launch at login.
#[tauri::command]
pub fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
    let autostart = build_autostart()?;
    if enabled {
        autostart.enable()
    } else {
        autostart.disable()
    }
    .map_err(|e| e.to_string())
}

/// Read launch at login status.
#[tauri::command]
pub fn get_autostart_enabled() -> Result<bool, String> {
    build_autostart()?.is_enabled().map_err(|e| e.to_string())
}

pub fn refresh_autostart_registration() {
    if let Ok(autostart) = build_autostart() {
        if autostart.is_enabled().unwrap_or(false) {
            let _ = autostart.disable();
            let _ = autostart.enable();
        } else {
            refresh_legacy_macos_launch_agent();
        }
    }
}

fn build_autostart() -> Result<auto_launch::AutoLaunch, String> {
    let app_path = preferred_autostart_path()?;
    AutoLaunchBuilder::new()
        .set_app_name("zipax")
        .set_app_path(&app_path)
        .set_use_launch_agent(true)
        .build()
        .map_err(|e| e.to_string())
}

fn preferred_autostart_path() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::env;

        if let Some(home) = env::var_os("HOME") {
            let installed_exe = PathBuf::from(home)
                .join("Applications")
                .join("zipax.app")
                .join("Contents")
                .join("MacOS")
                .join("zipax-app");
            if installed_exe.exists() {
                return Ok(installed_exe.display().to_string());
            }
        }
    }

    std::env::current_exe()
        .and_then(|path| path.canonicalize())
        .map(|path| path.display().to_string())
        .map_err(|e| e.to_string())
}

fn refresh_legacy_macos_launch_agent() {
    #[cfg(target_os = "macos")]
    {
        use std::{env, fs};

        let plist_path = match env::var_os("HOME") {
            Some(home) => PathBuf::from(home)
                .join("Library")
                .join("LaunchAgents")
                .join("zipax.plist"),
            None => return,
        };
        if !plist_path.exists() {
            return;
        }

        let expected_path = match preferred_autostart_path() {
            Ok(path) => path,
            Err(_) => return,
        };
        let plist = fs::read_to_string(&plist_path).unwrap_or_default();
        if plist.contains(&expected_path) {
            return;
        }

        if let Ok(autostart) = build_autostart() {
            let _ = autostart.disable();
            let _ = autostart.enable();
        }
    }
}

/// Start watching a folder for new files.
#[tauri::command]
pub fn watch_folder(
    request: WatchFolderRequest,
    state: State<'_, WatcherState>,
) -> Result<(), String> {
    let path = PathBuf::from(&request.path);
    if !path.exists() {
        return Err(format!("文件夹不存在: {}", request.path));
    }

    // Create a watcher that auto-compresses new files.
    let watcher = FolderWatcher::start(path, move |file_path| {
        tracing::info!("新文件检测: {:?}", file_path);

        if request.auto_compress {
            if is_compressed_output(&file_path) {
                tracing::info!("跳过已压缩输出: {:?}", file_path);
                return;
            }

            let options = build_watch_options(&request, &file_path);
            match core_compress(&file_path, &options) {
                Ok(result) => {
                    tracing::info!(
                        "自动压缩完成: {} -> {} ({:.1}% 减少)",
                        result.source,
                        result.output,
                        result.ratio()
                    );
                }
                Err(e) => {
                    tracing::error!("自动压缩失败: {}: {}", file_path.display(), e);
                }
            }
        }
    })
    .map_err(|e| format!("启动文件监控失败: {e}"))?;

    state
        .watchers
        .lock()
        .map_err(|e| format!("锁状态失败: {e}"))?
        .push(watcher);

    Ok(())
}

fn is_compressed_output(path: &std::path::Path) -> bool {
    path.file_stem()
        .and_then(|stem| stem.to_str())
        .map(|stem| stem.ends_with("#C") || stem.rsplit_once("#C-").is_some())
        .unwrap_or(false)
}

/// Stop all folder watchers.
#[tauri::command]
pub fn stop_all_watchers(state: State<'_, WatcherState>) {
    if let Ok(mut watchers) = state.watchers.lock() {
        watchers.clear();
    }
}

/// Save base64 image data to a temporary file and return the path.
#[tauri::command]
pub fn save_temp_image(base64_data: String, filename: String) -> Result<String, String> {
    use base64::Engine;
    let data = base64::engine::general_purpose::STANDARD
        .decode(&base64_data)
        .map_err(|e| format!("Base64 解码失败: {e}"))?;

    let temp_dir = std::env::temp_dir().join("zipax");
    std::fs::create_dir_all(&temp_dir).map_err(|e| format!("创建临时目录失败: {e}"))?;

    let temp_path = temp_dir.join(&filename);
    std::fs::write(&temp_path, &data).map_err(|e| format!("写入临时文件失败: {e}"))?;

    Ok(temp_path.to_string_lossy().to_string())
}

/// Copy a file from source to destination. Creates parent directories if needed.
#[tauri::command]
pub fn copy_file(source: String, destination: String) -> Result<(), String> {
    let dest_path = PathBuf::from(&destination);
    if let Some(parent) = dest_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {e}"))?;
    }
    std::fs::copy(&source, &destination).map_err(|e| format!("复制文件失败: {e}"))?;
    Ok(())
}

fn build_options(request: &CompressRequest) -> CompressOptions {
    let target_size_kb = request.target_size_kb.or_else(|| {
        request.target_size_percent.and_then(|percent| {
            let percent = percent.clamp(1, 100) as u64;
            std::fs::metadata(&request.path)
                .ok()
                .map(|metadata| ((metadata.len() * percent) / 100 / 1024).max(1) as u32)
        })
    });

    CompressOptions {
        mode: parse_mode(request.mode.as_deref()),
        output_format: parse_format(request.format.as_deref()),
        level: parse_level(request.level),
        target_size_kb,
        preserve_metadata: request.preserve_metadata,
        resize: ResizeOptions {
            enabled: request.max_width.is_some() || request.max_height.is_some(),
            max_width: request.max_width,
            max_height: request.max_height,
            allow_upscale: request.allow_upscale,
        },
        overwrite_original: request.overwrite,
    }
}

fn build_watch_options(
    request: &WatchFolderRequest,
    file_path: &std::path::Path,
) -> CompressOptions {
    let target_size_kb = request.target_size_kb.or_else(|| {
        request.target_size_percent.and_then(|percent| {
            let percent = percent.clamp(1, 100) as u64;
            std::fs::metadata(file_path)
                .ok()
                .map(|metadata| ((metadata.len() * percent) / 100 / 1024).max(1) as u32)
        })
    });

    CompressOptions {
        mode: parse_mode(request.mode.as_deref()),
        output_format: parse_format(request.format.as_deref()),
        level: parse_level(request.level),
        target_size_kb,
        preserve_metadata: request.preserve_metadata,
        resize: ResizeOptions {
            enabled: request.max_width.is_some() || request.max_height.is_some(),
            max_width: request.max_width,
            max_height: request.max_height,
            allow_upscale: request.allow_upscale,
        },
        overwrite_original: request.overwrite,
    }
}

fn parse_mode(s: Option<&str>) -> CompressionMode {
    match s {
        Some("quality") => CompressionMode::QualityFirst,
        Some("balanced") => CompressionMode::Balanced,
        Some("size") => CompressionMode::SizeFirst,
        Some("advanced") => CompressionMode::Advanced,
        Some("target") => CompressionMode::TargetSize,
        _ => CompressionMode::Balanced,
    }
}

fn parse_format(s: Option<&str>) -> OutputFormat {
    match s {
        Some("jpeg") | Some("jpg") => OutputFormat::Jpeg,
        Some("png") => OutputFormat::Png,
        Some("webp") => OutputFormat::Webp,
        Some("avif") => OutputFormat::Avif,
        Some("heic") => OutputFormat::Heic,
        Some("pdf") => OutputFormat::Pdf,
        _ => OutputFormat::Original,
    }
}

fn parse_level(n: u8) -> QualityLevel {
    match n {
        1 => QualityLevel::L1,
        2 => QualityLevel::L2,
        3 => QualityLevel::L3,
        4 => QualityLevel::L4,
        5 => QualityLevel::L5,
        _ => QualityLevel::L6,
    }
}
