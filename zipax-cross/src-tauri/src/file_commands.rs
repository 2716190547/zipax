use std::path::PathBuf;

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
