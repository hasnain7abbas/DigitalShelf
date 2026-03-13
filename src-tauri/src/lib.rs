mod commands;
mod shelf_item;
mod storage;
mod thumbnail;

use commands::shelf_ops::ShelfState;
use std::sync::Mutex;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let saved_items = storage::load_shelf_items();

    tauri::Builder::default()
        .manage(ShelfState(Mutex::new(saved_items)))
        .invoke_handler(tauri::generate_handler![
            commands::shelf_ops::add_file_to_shelf,
            commands::shelf_ops::add_text_to_shelf,
            commands::shelf_ops::add_link_to_shelf,
            commands::shelf_ops::remove_from_shelf,
            commands::shelf_ops::clear_shelf,
            commands::shelf_ops::get_shelf_items,
            commands::shelf_ops::reorder_shelf,
            commands::drag_out::start_drag,
            commands::drag_out::open_file,
            commands::drag_out::show_in_folder,
            commands::settings::load_settings,
            commands::settings::save_settings,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let settings = commands::settings::load_settings();

            if let Some(window) = app.get_webview_window("shelf") {
                let _ = window.set_always_on_top(settings.always_on_top);
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::DragDrop(drag_event) = event {
                match drag_event {
                    tauri::DragDropEvent::Drop { paths, position: _ } => {
                        for path in paths {
                            let path_str = path.to_string_lossy().to_string();
                            let _ = window.emit("file-dropped", &path_str);
                        }
                    }
                    tauri::DragDropEvent::Over { position: _ } => {
                        let _ = window.emit("drag-hover", true);
                    }
                    tauri::DragDropEvent::Leave => {
                        let _ = window.emit("drag-hover", false);
                    }
                    _ => {}
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("Error while running Digital Shelf");
}
