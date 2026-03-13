use crate::shelf_item::{ShelfItem, ShelfItemData};
use crate::storage;
use crate::thumbnail;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;

pub struct ShelfState(pub Mutex<Vec<ShelfItem>>);

#[tauri::command]
pub fn add_file_to_shelf(
    path: String,
    state: State<'_, ShelfState>,
) -> Result<ShelfItem, String> {
    let p = Path::new(&path);
    let name = p
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let ext = p
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    let size = std::fs::metadata(p).map(|m| m.len()).unwrap_or(0);

    let image_exts = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];

    let data = if image_exts.contains(&ext.as_str()) {
        let thumb = thumbnail::generate_image_thumbnail(p).unwrap_or_default();
        let (w, h) = thumbnail::get_image_dimensions(p).unwrap_or((0, 0));
        ShelfItemData::Image {
            path: path.clone(),
            name,
            width: w,
            height: h,
            thumbnail_b64: thumb,
        }
    } else {
        ShelfItemData::File {
            path: path.clone(),
            name,
            extension: ext,
            size_bytes: size,
            thumbnail_b64: None,
        }
    };

    let item = ShelfItem::new(data);
    let mut items = state.0.lock().unwrap();
    items.push(item.clone());
    let _ = storage::save_shelf_items(&items);
    Ok(item)
}

#[tauri::command]
pub fn add_text_to_shelf(content: String, state: State<'_, ShelfState>) -> ShelfItem {
    let preview = thumbnail::generate_text_preview(&content, 120);
    let item = ShelfItem::new(ShelfItemData::Text {
        content,
        preview,
        source_app: None,
    });
    let mut items = state.0.lock().unwrap();
    items.push(item.clone());
    let _ = storage::save_shelf_items(&items);
    item
}

#[tauri::command]
pub fn add_link_to_shelf(url: String, title: Option<String>, state: State<'_, ShelfState>) -> ShelfItem {
    let item = ShelfItem::new(ShelfItemData::Link {
        url,
        title,
        favicon_b64: None,
    });
    let mut items = state.0.lock().unwrap();
    items.push(item.clone());
    let _ = storage::save_shelf_items(&items);
    item
}

#[tauri::command]
pub fn remove_from_shelf(id: String, state: State<'_, ShelfState>) {
    let mut items = state.0.lock().unwrap();
    items.retain(|item| item.id != id);
    let _ = storage::save_shelf_items(&items);
}

#[tauri::command]
pub fn clear_shelf(state: State<'_, ShelfState>) {
    let mut items = state.0.lock().unwrap();
    items.clear();
    let _ = storage::save_shelf_items(&items);
}

#[tauri::command]
pub fn get_shelf_items(state: State<'_, ShelfState>) -> Vec<ShelfItem> {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
pub fn reorder_shelf(ids: Vec<String>, state: State<'_, ShelfState>) {
    let mut items = state.0.lock().unwrap();
    items.sort_by_key(|item| {
        ids.iter()
            .position(|id| id == &item.id)
            .unwrap_or(usize::MAX)
    });
    let _ = storage::save_shelf_items(&items);
}
