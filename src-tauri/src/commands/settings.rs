use dirs::config_dir;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShelfSettings {
    pub opacity: f64,
    pub always_on_top: bool,
    pub position: ShelfPosition,
    pub auto_collapse: bool,
    pub collapse_delay_ms: u64,
    pub max_items: usize,
    pub hotkey: String,
    pub theme: String,
    pub width: f64,
    pub edge: ScreenEdge,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShelfPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScreenEdge {
    Left,
    Right,
    Top,
    Bottom,
    Float,
}

impl Default for ShelfSettings {
    fn default() -> Self {
        Self {
            opacity: 0.85,
            always_on_top: true,
            position: ShelfPosition { x: -1.0, y: 100.0 },
            auto_collapse: true,
            collapse_delay_ms: 2000,
            max_items: 20,
            hotkey: "Ctrl+Shift+D".to_string(),
            theme: "glass".to_string(),
            width: 280.0,
            edge: ScreenEdge::Right,
        }
    }
}

fn settings_path() -> PathBuf {
    config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("digital-shelf")
        .join("settings.json")
}

#[tauri::command]
pub fn load_settings() -> ShelfSettings {
    let path = settings_path();
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

#[tauri::command]
pub fn save_settings(settings: ShelfSettings) -> Result<(), String> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())
}
