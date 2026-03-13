use crate::shelf_item::ShelfItem;
use dirs::config_dir;
use std::path::PathBuf;

fn shelf_data_path() -> PathBuf {
    config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("digital-shelf")
        .join("shelf.json")
}

pub fn save_shelf_items(items: &[ShelfItem]) -> Result<(), String> {
    let path = shelf_data_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(items).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())
}

pub fn load_shelf_items() -> Vec<ShelfItem> {
    let path = shelf_data_path();
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}
