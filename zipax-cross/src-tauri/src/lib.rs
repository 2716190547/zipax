//! zipax Tauri application.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod autostart;
mod commands;
mod compression_options;
mod file_commands;
mod state;
mod tray_commands;
mod watch_commands;
mod watcher;

use state::{AppBehaviorState, TrayMenuState, WatcherState};
use std::{thread, time::Duration};
#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;
use tauri::{
    image::Image,
    menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    webview::PageLoadEvent,
    Manager, WindowEvent,
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
        .plugin(tauri_plugin_process::init())
        .manage(AppBehaviorState::new())
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
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }
            if let WindowEvent::CloseRequested { api, .. } = event {
                let should_hide = window.state::<AppBehaviorState>().close_to_tray();
                if should_hide {
                    api.prevent_close();
                    let _ = window.hide();
                    #[cfg(target_os = "macos")]
                    let _ = window
                        .app_handle()
                        .set_activation_policy(ActivationPolicy::Accessory);
                }
            }
        })
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;

            // 创建系统托盘菜单
            let open_item = MenuItemBuilder::with_id("open", "打开 zipax").build(app)?;
            let stats_item = MenuItemBuilder::with_id("stats", "已压缩 0 张 · 已节省 0 B")
                .enabled(false)
                .build(app)?;
            let updates_item = CheckMenuItemBuilder::with_id("toggle_updates", "自动检查更新")
                .checked(false)
                .build(app)?;
            let automation_item =
                CheckMenuItemBuilder::with_id("toggle_automation", "文件夹自动压缩")
                    .checked(true)
                    .build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "退出").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&stats_item)
                .separator()
                .item(&updates_item)
                .item(&automation_item)
                .separator()
                .item(&open_item)
                .separator()
                .item(&quit_item)
                .build()?;

            app.manage(TrayMenuState::new(
                stats_item.clone(),
                updates_item.clone(),
                automation_item.clone(),
            ));

            // 创建托盘图标
            let _tray = TrayIconBuilder::new()
                .icon(Image::new(
                    include_bytes!("../icons/tray-icon-44.rgba"),
                    44,
                    44,
                ))
                .icon_as_template(true)
                .menu(&menu)
                .tooltip("zipax - 图片压缩")
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "open" => {
                        #[cfg(target_os = "macos")]
                        let _ = app.set_activation_policy(ActivationPolicy::Regular);
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "toggle_updates" => {
                        tray_commands::toggle_tray_updates(app);
                    }
                    "toggle_automation" => {
                        tray_commands::toggle_tray_automation(app);
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

            autostart::refresh_autostart_registration();

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
            autostart::set_autostart_enabled,
            autostart::get_autostart_enabled,
            tray_commands::set_close_to_tray_enabled,
            tray_commands::get_close_to_tray_enabled,
            tray_commands::set_tray_status,
            watch_commands::watch_folder,
            watch_commands::stop_all_watchers,
            file_commands::save_temp_image,
            file_commands::copy_file,
        ])
        .run(tauri::generate_context!())
        .expect("启动 zipax 失败");
}
