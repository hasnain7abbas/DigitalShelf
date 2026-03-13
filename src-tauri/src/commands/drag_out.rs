use tauri::AppHandle;

#[tauri::command]
pub fn start_drag(_app: AppHandle, file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    // For now, the frontend handles text/link drag via HTML5 dataTransfer.
    // File drag-out from webview requires platform-specific OLE drag on Windows.
    // This is a placeholder that will be enhanced with native drag support.
    log::info!("Drag started for: {}", file_path);

    Ok(())
}
