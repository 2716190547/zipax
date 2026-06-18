use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::menu::{CheckMenuItem, MenuItem};
use tauri::Wry;

use crate::watcher::FolderWatcher;

/// Shared state for folder watchers.
pub struct WatcherState {
    pub watchers: Arc<Mutex<Vec<FolderWatcher>>>,
}

impl WatcherState {
    pub fn new() -> Self {
        Self {
            watchers: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

/// Shared app behavior flags.
pub struct AppBehaviorState {
    close_to_tray: Arc<Mutex<bool>>,
    tray_status: Arc<Mutex<TrayStatus>>,
}

impl AppBehaviorState {
    pub fn new() -> Self {
        Self {
            close_to_tray: Arc::new(Mutex::new(true)),
            tray_status: Arc::new(Mutex::new(TrayStatus::default())),
        }
    }

    pub fn close_to_tray(&self) -> bool {
        self.close_to_tray
            .lock()
            .map(|value| *value)
            .unwrap_or(true)
    }

    pub fn set_close_to_tray(&self, enabled: bool) {
        if let Ok(mut value) = self.close_to_tray.lock() {
            *value = enabled;
        }
    }

    pub fn tray_status(&self) -> TrayStatus {
        self.tray_status
            .lock()
            .map(|value| value.clone())
            .unwrap_or_default()
    }

    pub fn set_tray_status(&self, status: TrayStatus) {
        if let Ok(mut value) = self.tray_status.lock() {
            *value = status;
        }
    }

    pub fn set_auto_check_updates(&self, enabled: bool) -> TrayStatus {
        let mut status = self.tray_status();
        status.auto_check_updates = enabled;
        self.set_tray_status(status.clone());
        status
    }

    pub fn set_global_automation_enabled(&self, enabled: bool) -> TrayStatus {
        let mut status = self.tray_status();
        status.global_automation_enabled = enabled;
        self.set_tray_status(status.clone());
        status
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayStatus {
    pub auto_check_updates: bool,
    pub global_automation_enabled: bool,
    pub total_saved: u64,
    pub total_count: u64,
}

impl Default for TrayStatus {
    fn default() -> Self {
        Self {
            auto_check_updates: false,
            global_automation_enabled: true,
            total_saved: 0,
            total_count: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TrayTogglePayload {
    pub key: String,
    pub enabled: bool,
}

pub struct TrayMenuState {
    stats_item: MenuItem<Wry>,
    updates_item: CheckMenuItem<Wry>,
    automation_item: CheckMenuItem<Wry>,
}

impl TrayMenuState {
    pub fn new(
        stats_item: MenuItem<Wry>,
        updates_item: CheckMenuItem<Wry>,
        automation_item: CheckMenuItem<Wry>,
    ) -> Self {
        Self {
            stats_item,
            updates_item,
            automation_item,
        }
    }

    pub fn refresh(&self, status: &TrayStatus) {
        let _ = self
            .stats_item
            .set_text(format_tray_stats(status.total_count, status.total_saved));
        let _ = self.updates_item.set_checked(status.auto_check_updates);
        let _ = self
            .automation_item
            .set_checked(status.global_automation_enabled);
    }
}

fn format_tray_stats(total_count: u64, total_saved: u64) -> String {
    format!(
        "已压缩 {} 张 · 已节省 {}",
        total_count,
        zipax_core::utils::format_bytes(total_saved)
    )
}
