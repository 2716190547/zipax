use std::path::PathBuf;

use auto_launch::AutoLaunchBuilder;

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
