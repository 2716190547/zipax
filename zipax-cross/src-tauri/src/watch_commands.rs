use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};
use zipax_core::{compress_file as core_compress, ImageKind};

use crate::commands::default_level;
use crate::compression_options::{build_options_for_path, CompressionRequestOptions};
use crate::state::WatcherState;
use crate::watcher::FolderWatcher;

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

#[derive(Clone, Serialize)]
struct AutomationResultEvent {
    rule_path: String,
    file_path: String,
    file_name: String,
    output: Option<String>,
    saved_bytes: u64,
    error: Option<String>,
}

impl CompressionRequestOptions for WatchFolderRequest {
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

/// Start watching a folder for new files.
#[tauri::command]
pub fn watch_folder(
    app: AppHandle,
    request: WatchFolderRequest,
    state: State<'_, WatcherState>,
) -> Result<(), String> {
    let path = PathBuf::from(&request.path);
    if !path.exists() {
        return Err(format!("文件夹不存在: {}", request.path));
    }

    let rule_path = request.path.clone();
    let watcher = FolderWatcher::start(path, move |file_path| {
        tracing::info!("新文件检测: {:?}", file_path);

        if request.auto_compress {
            if !is_supported_input(&file_path) {
                tracing::debug!("跳过非支持文件: {:?}", file_path);
                return;
            }

            if is_compressed_output(&file_path) {
                tracing::info!("跳过已压缩输出: {:?}", file_path);
                return;
            }

            let options = build_options_for_path(&request, &file_path);
            match core_compress(&file_path, &options) {
                Ok(result) => {
                    let saved_bytes = result.saved_bytes();
                    tracing::info!(
                        "自动压缩完成: {} -> {} ({:.1}% 减少)",
                        result.source,
                        result.output,
                        result.ratio()
                    );
                    emit_automation_result(
                        &app,
                        AutomationResultEvent {
                            rule_path: rule_path.clone(),
                            file_path: file_path.to_string_lossy().to_string(),
                            file_name: display_name(&file_path),
                            output: Some(result.output),
                            saved_bytes,
                            error: None,
                        },
                    );
                }
                Err(e) => {
                    tracing::error!("自动压缩失败: {}: {}", file_path.display(), e);
                    emit_automation_result(
                        &app,
                        AutomationResultEvent {
                            rule_path: rule_path.clone(),
                            file_path: file_path.to_string_lossy().to_string(),
                            file_name: display_name(&file_path),
                            output: None,
                            saved_bytes: 0,
                            error: Some(e.to_string()),
                        },
                    );
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

/// Stop all folder watchers.
#[tauri::command]
pub fn stop_all_watchers(state: State<'_, WatcherState>) {
    if let Ok(mut watchers) = state.watchers.lock() {
        watchers.clear();
    }
}

fn is_compressed_output(path: &std::path::Path) -> bool {
    path.file_stem()
        .and_then(|stem| stem.to_str())
        .map(|stem| stem.ends_with("#C") || stem.rsplit_once("#C-").is_some())
        .unwrap_or(false)
}

fn is_supported_input(path: &std::path::Path) -> bool {
    ImageKind::from_path(path).is_some()
}

fn display_name(path: &std::path::Path) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(str::to_string)
        .unwrap_or_else(|| path.to_string_lossy().to_string())
}

fn emit_automation_result(app: &AppHandle, payload: AutomationResultEvent) {
    if let Err(error) = app.emit("zipax://automation-result", payload) {
        tracing::warn!(%error, "failed to emit automation result");
    }
}
