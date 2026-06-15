//! zipax Tauri application.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod watcher;

use commands::WatcherState;
use std::{thread, time::Duration};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    webview::PageLoadEvent,
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(WatcherState::new())
        .on_page_load(|webview, payload| {
            if webview.label() == "main" && payload.event() == PageLoadEvent::Finished {
                let window = webview.window();
                thread::spawn(move || {
                    thread::sleep(Duration::from_millis(800));
                    if !matches!(window.is_visible(), Ok(true)) {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                });
            }
        })
        .setup(|app| {
            // 创建系统托盘菜单
            let open_item = MenuItemBuilder::with_id("open", "打开 zipax").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "退出").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&open_item)
                .separator()
                .item(&quit_item)
                .build()?;

            // 创建托盘图标
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("zipax - 图片压缩")
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "open" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_maximizable(false);
            }

            commands::refresh_autostart_registration();

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::compress_file,
            commands::compress_batch,
            commands::plan_compression,
            commands::get_app_info,
            commands::set_autostart_enabled,
            commands::get_autostart_enabled,
            commands::watch_folder,
            commands::stop_all_watchers,
            commands::save_temp_image,
            commands::copy_file,
        ])
        .run(tauri::generate_context!())
        .expect("启动 zipax 失败");
}
