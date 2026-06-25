//! Main window lifecycle helpers shared by launch and tray entry points.

use std::{thread, time::Duration};
use tauri::{AppHandle, Manager, Runtime};

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

pub(crate) const MAIN_WINDOW_LABEL: &str = "main";

pub(crate) fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    #[cfg(target_os = "macos")]
    log_result(
        "restore activation policy",
        app.set_activation_policy(ActivationPolicy::Regular),
    );

    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        tracing::warn!("main window is unavailable");
        return;
    };

    log_result("unminimize main window", window.unminimize());
    log_result("show main window", window.show());
    log_result("focus main window", window.set_focus());
}

pub(crate) fn show_main_window_after_load<R: Runtime>(app: AppHandle<R>) {
    thread::spawn(move || {
        thread::sleep(Duration::from_millis(800));

        let is_visible = app
            .get_webview_window(MAIN_WINDOW_LABEL)
            .is_some_and(|window| window.is_visible().unwrap_or(false));
        if !is_visible {
            show_main_window(&app);
        }
    });
}

pub(crate) fn configure_main_window<R: Runtime>(app: &AppHandle<R>) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        tracing::warn!("main window is unavailable during setup");
        return;
    };

    log_result(
        "disable main window maximize",
        window.set_maximizable(false),
    );

    #[cfg(target_os = "windows")]
    {
        log_result(
            "disable native main window shadow",
            window.set_shadow(false),
        );
        if let Some(icon) = app.default_window_icon().cloned() {
            log_result("set main window icon", window.set_icon(icon));
        }
    }
}

fn log_result(action: &str, result: tauri::Result<()>) {
    if let Err(error) = result {
        tracing::warn!(%error, action, "window action failed");
    }
}
