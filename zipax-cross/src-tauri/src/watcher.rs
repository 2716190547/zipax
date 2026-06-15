//! Folder watcher: monitors directories for new files.
//! Includes file stability detection to avoid processing files still being written.

use std::path::PathBuf;
use std::sync::{mpsc, Arc};
use std::time::Duration;

use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};

/// Wait until a file's size stabilizes (stops changing).
/// Returns Ok(()) if stable, Err if still changing after max attempts.
fn wait_until_stable(path: &PathBuf, max_attempts: u32, interval_ms: u64) -> Result<(), String> {
    // 初始等待 1 秒，让文件开始写入
    std::thread::sleep(Duration::from_secs(1));

    let mut last_size = file_size(path)?;

    for _ in 0..max_attempts {
        std::thread::sleep(Duration::from_millis(interval_ms));
        let current_size = file_size(path)?;

        if current_size == last_size {
            return Ok(());
        }
        last_size = current_size;
    }

    Err("文件仍在写入".to_string())
}

/// Get file size in bytes.
fn file_size(path: &PathBuf) -> Result<u64, String> {
    std::fs::metadata(path)
        .map(|m| m.len())
        .map_err(|e| format!("读取文件大小失败: {e}"))
}

/// A folder watcher that monitors for new files.
pub struct FolderWatcher {
    _watcher: RecommendedWatcher,
}

impl FolderWatcher {
    /// Start watching a folder. Calls `on_new_file` when a new file is detected
    /// and its size has stabilized.
    pub fn start(
        path: PathBuf,
        on_new_file: impl Fn(PathBuf) + Send + Sync + 'static,
    ) -> Result<Self, notify::Error> {
        let (tx, rx) = mpsc::channel::<notify::Result<Event>>();
        let on_new_file = Arc::new(on_new_file);

        let mut watcher = RecommendedWatcher::new(
            tx,
            notify::Config::default().with_poll_interval(Duration::from_secs(2)),
        )?;

        watcher.watch(&path, RecursiveMode::NonRecursive)?;

        let callback = on_new_file.clone();
        std::thread::spawn(move || {
            for res in rx {
                match res {
                    Ok(event) => {
                        if matches!(event.kind, EventKind::Create(_)) {
                            for path in event.paths {
                                if path.is_file() {
                                    let cb = callback.clone();
                                    // 在新线程中等待文件稳定，避免阻塞事件循环
                                    std::thread::spawn(move || {
                                        // 等待文件大小稳定（最多 5 次，每次 500ms）
                                        match wait_until_stable(&path, 5, 500) {
                                            Ok(()) => {
                                                tracing::info!("文件稳定: {:?}", path);
                                                cb(path);
                                            }
                                            Err(e) => {
                                                tracing::warn!(
                                                    "文件 {:?} 未稳定，跳过: {}",
                                                    path,
                                                    e
                                                );
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                    Err(e) => {
                        tracing::error!("文件监视错误: {e}");
                    }
                }
            }
        });

        Ok(Self { _watcher: watcher })
    }
}
