//! Folder watcher: monitors directories for new files.
//! Includes file stability detection to avoid processing files still being written.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::{mpsc, Arc, Mutex};
use std::time::{Duration, Instant};

use notify::{event::ModifyKind, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};

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

const PROCESSED_COOLDOWN: Duration = Duration::from_secs(20);

impl FolderWatcher {
    /// Start watching a folder. Calls `on_new_file` when a new file is detected
    /// and its size has stabilized.
    pub fn start(
        path: PathBuf,
        on_new_file: impl Fn(PathBuf) + Send + Sync + 'static,
    ) -> Result<Self, notify::Error> {
        let (tx, rx) = mpsc::channel::<notify::Result<Event>>();
        let on_new_file = Arc::new(on_new_file);
        let pending_paths = Arc::new(Mutex::new(HashSet::<PathBuf>::new()));
        let processed_paths = Arc::new(Mutex::new(HashMap::<PathBuf, Instant>::new()));

        let mut watcher = RecommendedWatcher::new(
            tx,
            notify::Config::default().with_poll_interval(Duration::from_secs(2)),
        )?;

        watcher.watch(&path, RecursiveMode::NonRecursive)?;

        let callback = on_new_file.clone();
        let pending = pending_paths.clone();
        let processed = processed_paths.clone();
        std::thread::spawn(move || {
            for res in rx {
                match res {
                    Ok(event) => {
                        if is_candidate_event(&event.kind) {
                            for path in event.paths {
                                if path.is_file() && !is_ignored_path(&path) {
                                    let cb = callback.clone();
                                    let pending = pending.clone();
                                    let processed = processed.clone();
                                    if is_recently_processed(&processed, &path) {
                                        continue;
                                    }
                                    if !mark_pending(&pending, &path) {
                                        continue;
                                    }
                                    // 在新线程中等待文件稳定，避免阻塞事件循环
                                    std::thread::spawn(move || {
                                        // 等待文件大小稳定（最多 5 次，每次 500ms）
                                        match wait_until_stable(&path, 5, 500) {
                                            Ok(()) => {
                                                tracing::info!("文件稳定: {:?}", path);
                                                cb(path.clone());
                                                mark_processed(&processed, &path);
                                            }
                                            Err(e) => {
                                                tracing::warn!(
                                                    "文件 {:?} 未稳定，跳过: {}",
                                                    path,
                                                    e
                                                );
                                            }
                                        }
                                        clear_pending(&pending, &path);
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

fn is_candidate_event(kind: &EventKind) -> bool {
    matches!(
        kind,
        EventKind::Create(_)
            | EventKind::Modify(ModifyKind::Data(_))
            | EventKind::Modify(ModifyKind::Name(_))
            | EventKind::Modify(ModifyKind::Any)
            | EventKind::Any
    )
}

fn mark_pending(pending_paths: &Mutex<HashSet<PathBuf>>, path: &Path) -> bool {
    pending_paths
        .lock()
        .map(|mut pending| pending.insert(path.to_path_buf()))
        .unwrap_or(false)
}

fn clear_pending(pending_paths: &Mutex<HashSet<PathBuf>>, path: &Path) {
    if let Ok(mut pending) = pending_paths.lock() {
        pending.remove(path);
    }
}

fn is_ignored_path(path: &Path) -> bool {
    let Some(file_name) = path.file_name().and_then(|name| name.to_str()) else {
        return true;
    };
    let Some(stem) = path.file_stem().and_then(|stem| stem.to_str()) else {
        return true;
    };

    file_name.starts_with('.')
        || file_name.starts_with("zipax-")
        || file_name.ends_with(".tmp")
        || stem.ends_with("#C")
        || stem.rsplit_once("#C-").is_some()
}

fn is_recently_processed(processed_paths: &Mutex<HashMap<PathBuf, Instant>>, path: &Path) -> bool {
    let Ok(mut processed) = processed_paths.lock() else {
        return false;
    };
    let now = Instant::now();
    processed.retain(|_, processed_at| now.duration_since(*processed_at) < PROCESSED_COOLDOWN);
    processed.contains_key(path)
}

fn mark_processed(processed_paths: &Mutex<HashMap<PathBuf, Instant>>, path: &Path) {
    if let Ok(mut processed) = processed_paths.lock() {
        processed.insert(path.to_path_buf(), Instant::now());
    }
}
