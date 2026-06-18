use tauri::{AppHandle, Emitter, Manager, State};

use crate::state::{AppBehaviorState, TrayMenuState, TrayStatus, TrayTogglePayload};

/// Enable or disable hiding to the menu bar when the main window closes.
#[tauri::command]
pub fn set_close_to_tray_enabled(
    enabled: bool,
    state: State<'_, AppBehaviorState>,
) -> Result<(), String> {
    state.set_close_to_tray(enabled);
    Ok(())
}

/// Read whether closing the main window hides it to the menu bar.
#[tauri::command]
pub fn get_close_to_tray_enabled(state: State<'_, AppBehaviorState>) -> bool {
    state.close_to_tray()
}

/// Sync lightweight frontend state into the native tray menu.
#[tauri::command]
pub fn set_tray_status(
    status: TrayStatus,
    behavior_state: State<'_, AppBehaviorState>,
    tray_menu_state: State<'_, TrayMenuState>,
) -> Result<(), String> {
    behavior_state.set_tray_status(status.clone());
    tray_menu_state.refresh(&status);
    Ok(())
}

pub fn toggle_tray_updates(app: &AppHandle) {
    let behavior_state = app.state::<AppBehaviorState>();
    let tray_menu_state = app.state::<TrayMenuState>();
    let status = behavior_state.tray_status();
    let next = behavior_state.set_auto_check_updates(!status.auto_check_updates);
    tray_menu_state.refresh(&next);
    let _ = app.emit(
        "zipax://tray-toggle",
        TrayTogglePayload {
            key: "autoCheckUpdates".into(),
            enabled: next.auto_check_updates,
        },
    );
}

pub fn toggle_tray_automation(app: &AppHandle) {
    let behavior_state = app.state::<AppBehaviorState>();
    let tray_menu_state = app.state::<TrayMenuState>();
    let status = behavior_state.tray_status();
    let next = behavior_state.set_global_automation_enabled(!status.global_automation_enabled);
    tray_menu_state.refresh(&next);
    let _ = app.emit(
        "zipax://tray-toggle",
        TrayTogglePayload {
            key: "globalAutomationEnabled".into(),
            enabled: next.global_automation_enabled,
        },
    );
}
