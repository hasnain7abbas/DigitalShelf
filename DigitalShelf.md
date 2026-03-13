# 🗂️ Digital Shelf: The Visual Temporary Dropzone

## 📖 Overview

**Digital Shelf** is a sleek, always-accessible floating panel that acts as a visual temporary clipboard. Drag files, text snippets, images, or links into it — navigate wherever you need — then drag them back out to their destination. No more juggling windows, no more losing clipboard history, no more split-screen gymnastics.

It lives on the edge of your screen, stays out of your way until you need it, and looks beautiful doing it.

---

## ✨ Key Features

* **Drag-and-Drop Dropzone:** Drop files, folders, images, text selections, and URLs into the shelf from any application.
* **Visual Previews:** Every item on the shelf shows a contextual mini-preview — file icons with names, image thumbnails, text snippet previews, link favicons.
* **Always-on-Top Toggle:** Pin the shelf above all windows or let it sit in the background. One-click toggle from the title bar.
* **Adjustable Transparency:** A smooth slider to dial the shelf opacity from fully opaque to nearly invisible, so it never blocks your workflow.
* **Smooth, Modern UI:** Glass-morphism design language with subtle animations, rounded corners, and fluid transitions — feels like a premium web app, not a system utility.
* **Multi-Item Clipboard:** Hold as many items as you need simultaneously. Not limited to one like the system clipboard.
* **Drag Out to Destination:** Grab any item off the shelf and drop it into a file explorer, email composer, chat window, or any drop-accepting target.
* **Auto-Collapse:** The shelf can auto-hide to a thin strip on the screen edge and expand on hover.
* **Screen Edge Snapping:** Magnetically snaps to any screen edge (left, right, top, bottom) and remembers position.
* **Keyboard Shortcut:** Global hotkey to show/hide the shelf instantly (e.g., `Ctrl + Shift + D`).

---

## 🛑 The Problem vs. 💡 The Solution

| The Problem | The Digital Shelf Solution |
| :--- | :--- |
| You need to move 3 files from deeply nested Folder A to deeply nested Folder B, but you can only copy/paste one path at a time. | Drop all 3 files onto the shelf. Navigate to Folder B. Drag them out. Done. |
| You are composing an email and need to grab an image from Downloads, a text snippet from a PDF, and a link from your browser — 3 different windows. | Drop each item onto the shelf as you find it. Switch to your email. Drag them in one by one. |
| The system clipboard is invisible. You copied something, then accidentally copied something else and lost the first item. | The shelf is visual. Everything you drop in stays there until you remove it. Nothing silently disappears. |
| Split-screen and window tiling helps, but it shrinks everything and still requires precise drag-and-drop between tiny panes. | The shelf is a narrow, persistent strip. Your main workspace stays full-size. The shelf is just a waypoint. |

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| Backend | **Rust** | File system ops, drag-and-drop data handling, thumbnail generation, state persistence |
| App Shell | **Tauri 2.0** | Transparent frameless window, system tray, global hotkeys, native drag events |
| Frontend | **React + TypeScript** | Shelf UI, animations, settings panel |
| Styling | **CSS (vanilla + transitions)** | Glass-morphism design, transparency slider, smooth animations |
| Thumbnails | **image** crate (Rust) | Generate preview thumbnails for image files |

---

## 🏗️ Project Structure

```
digital-shelf/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                # Tauri entry, app builder, window config
│   │   ├── lib.rs                 # Module declarations, Tauri command exports
│   │   ├── commands/
│   │   │   ├── mod.rs             # Command module barrel
│   │   │   ├── shelf_ops.rs       # Add/remove/reorder shelf items
│   │   │   ├── file_preview.rs    # Thumbnail generation & file metadata
│   │   │   ├── drag_out.rs        # Start OS-level drag from shelf item
│   │   │   └── settings.rs        # Persist/load user preferences
│   │   ├── shelf_item.rs          # ShelfItem enum & types
│   │   ├── thumbnail.rs           # Image resize, text preview extraction
│   │   ├── hotkey.rs              # Global hotkey registration
│   │   └── storage.rs             # JSON file persistence for shelf state
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── App.tsx                    # Root: shelf view + settings
│   ├── components/
│   │   ├── Shelf.tsx              # Main shelf container (scrollable grid)
│   │   ├── ShelfCard.tsx          # Individual item card with preview
│   │   ├── DropOverlay.tsx        # Full-shelf drag-over visual feedback
│   │   ├── TitleBar.tsx           # Custom titlebar: pin, settings, collapse
│   │   ├── TransparencySlider.tsx # Opacity control
│   │   └── SettingsPanel.tsx      # Preferences: hotkey, position, behavior
│   ├── hooks/
│   │   ├── useShelfItems.ts       # State management for shelf contents
│   │   ├── useDragDrop.ts         # Drag-in and drag-out event handlers
│   │   └── useSettings.ts         # Transparency, always-on-top, position
│   ├── types/
│   │   └── shelf.ts               # TypeScript interfaces for shelf items
│   ├── utils/
│   │   └── fileIcons.ts           # Extension → icon mapping
│   └── styles/
│       ├── global.css             # Base styles, CSS variables, glass theme
│       ├── shelf.css              # Shelf grid layout, scroll, animations
│       ├── card.css               # Item card: preview, hover, remove button
│       └── titlebar.css           # Custom titlebar styling
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Rust Dependencies

```toml
# src-tauri/Cargo.toml

[dependencies]
tauri = { version = "2", features = ["tray-icon", "drag-drop"] }
tauri-plugin-dialog = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
global-hotkey = "0.6"
image = "0.25"            # Thumbnail generation for image files
mime_guess = "2"           # MIME type detection from file extensions
uuid = { version = "1", features = ["v4"] }
dirs = "5"                 # Platform config/data directories
tracing = "0.1"
tracing-subscriber = "0.3"
base64 = "0.22"            # Encode thumbnails for frontend transport

[target.'cfg(windows)'.dependencies]
windows = { version = "0.58", features = [
    "Win32_System_Ole",          # OLE drag-and-drop
    "Win32_UI_Shell",            # Shell file icons
]}
```

---

## ⚙️ Core Implementation

### 1. Shelf Item Model

```rust
// shelf_item.rs
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum ShelfItemData {
    File {
        path: String,
        name: String,
        extension: String,
        size_bytes: u64,
        thumbnail_b64: Option<String>,  // Base64-encoded preview image
    },
    Image {
        path: String,
        name: String,
        width: u32,
        height: u32,
        thumbnail_b64: String,          // Always generated for images
    },
    Text {
        content: String,
        preview: String,                // First ~120 chars
        source_app: Option<String>,
    },
    Link {
        url: String,
        title: Option<String>,
        favicon_b64: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShelfItem {
    pub id: String,
    pub data: ShelfItemData,
    pub added_at: u64,                  // Unix timestamp
}

impl ShelfItem {
    pub fn new(data: ShelfItemData) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            data,
            added_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}
```

### 2. Thumbnail Generation

```rust
// thumbnail.rs
use image::imageops::FilterType;
use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use std::path::Path;

const THUMB_MAX_SIZE: u32 = 128;

/// Generate a base64-encoded JPEG thumbnail for an image file.
pub fn generate_image_thumbnail(path: &Path) -> Result<String, Box<dyn std::error::Error>> {
    let img = image::open(path)?;
    let thumb = img.resize(THUMB_MAX_SIZE, THUMB_MAX_SIZE, FilterType::Lanczos3);

    let mut buf = Vec::new();
    thumb.write_to(
        &mut std::io::Cursor::new(&mut buf),
        image::ImageFormat::Jpeg,
    )?;

    Ok(STANDARD.encode(&buf))
}

/// Generate a short text preview (first N characters, trimmed).
pub fn generate_text_preview(content: &str, max_len: usize) -> String {
    let trimmed = content.trim();
    if trimmed.len() <= max_len {
        trimmed.to_string()
    } else {
        format!("{}...", &trimmed[..max_len])
    }
}

/// Get image dimensions without loading the full image.
pub fn get_image_dimensions(path: &Path) -> Result<(u32, u32), Box<dyn std::error::Error>> {
    let reader = image::io::Reader::open(path)?;
    let dims = reader.into_dimensions()?;
    Ok(dims)
}
```

### 3. Tauri Commands (Backend API)

```rust
// commands/shelf_ops.rs
use crate::shelf_item::{ShelfItem, ShelfItemData};
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
    let name = p.file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let ext = p.extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    let size = std::fs::metadata(p)
        .map(|m| m.len())
        .unwrap_or(0);

    let image_exts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];

    let data = if image_exts.contains(&ext.as_str()) {
        let thumb = thumbnail::generate_image_thumbnail(p)
            .unwrap_or_default();
        let (w, h) = thumbnail::get_image_dimensions(p)
            .unwrap_or((0, 0));
        ShelfItemData::Image {
            path: path.clone(),
            name,
            width: w,
            height: h,
            thumbnail_b64: thumb,
        }
    } else {
        let thumb = None; // Could add PDF/doc preview generation here
        ShelfItemData::File {
            path: path.clone(),
            name,
            extension: ext,
            size_bytes: size,
            thumbnail_b64: thumb,
        }
    };

    let item = ShelfItem::new(data);
    state.0.lock().unwrap().push(item.clone());
    Ok(item)
}

#[tauri::command]
pub fn add_text_to_shelf(
    content: String,
    state: State<'_, ShelfState>,
) -> ShelfItem {
    let preview = thumbnail::generate_text_preview(&content, 120);
    let item = ShelfItem::new(ShelfItemData::Text {
        content,
        preview,
        source_app: None,
    });
    state.0.lock().unwrap().push(item.clone());
    item
}

#[tauri::command]
pub fn remove_from_shelf(id: String, state: State<'_, ShelfState>) {
    state.0.lock().unwrap().retain(|item| item.id != id);
}

#[tauri::command]
pub fn clear_shelf(state: State<'_, ShelfState>) {
    state.0.lock().unwrap().clear();
}

#[tauri::command]
pub fn get_shelf_items(state: State<'_, ShelfState>) -> Vec<ShelfItem> {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
pub fn reorder_shelf(
    ids: Vec<String>,
    state: State<'_, ShelfState>,
) {
    let mut items = state.0.lock().unwrap();
    items.sort_by_key(|item| {
        ids.iter().position(|id| id == &item.id).unwrap_or(usize::MAX)
    });
}
```

### 4. Drag-Out Support (Start OS Drag from Shelf)

```rust
// commands/drag_out.rs
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn start_drag(app: AppHandle, file_path: String) -> Result<(), String> {
    // Tauri 2.0 supports startDragging on the webview window
    // For files, we initiate an OS-level file drag operation
    // The frontend calls this when user starts dragging a shelf card

    use tauri::DragDropEvent;
    // Use tauri::Window::start_dragging for repositioning
    // For file drag-out, use platform-specific OLE drag (Windows)
    // or NSPasteboard (macOS)

    #[cfg(target_os = "windows")]
    {
        // Use Win32 OLE DoDragDrop with the file path
        // This allows dropping the file into Explorer, email clients, etc.
    }

    Ok(())
}
```

### 5. Settings Persistence

```rust
// commands/settings.rs
use serde::{Deserialize, Serialize};
use dirs::config_dir;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShelfSettings {
    pub opacity: f64,             // 0.2 to 1.0
    pub always_on_top: bool,
    pub position: ShelfPosition,
    pub auto_collapse: bool,
    pub collapse_delay_ms: u64,
    pub max_items: usize,
    pub hotkey: String,           // e.g. "Ctrl+Shift+D"
    pub theme: String,            // "glass" | "solid" | "dark"
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
    Float,  // Not snapped to any edge
}

impl Default for ShelfSettings {
    fn default() -> Self {
        Self {
            opacity: 0.85,
            always_on_top: true,
            position: ShelfPosition { x: -1.0, y: 100.0 }, // -1 = snap right
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
```

### 6. Tauri App Entry

```rust
// main.rs
mod commands;
mod hotkey;
mod shelf_item;
mod storage;
mod thumbnail;

use commands::{shelf_ops::ShelfState, settings};
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(ShelfState(Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![
            commands::shelf_ops::add_file_to_shelf,
            commands::shelf_ops::add_text_to_shelf,
            commands::shelf_ops::remove_from_shelf,
            commands::shelf_ops::clear_shelf,
            commands::shelf_ops::get_shelf_items,
            commands::shelf_ops::reorder_shelf,
            commands::drag_out::start_drag,
            settings::load_settings,
            settings::save_settings,
        ])
        .setup(|app| {
            // Load saved settings and apply window properties
            let settings = settings::load_settings();

            if let Some(window) = app.get_webview_window("shelf") {
                let _ = window.set_always_on_top(settings.always_on_top);
                // Opacity is handled by frontend CSS on the <html> element
            }

            // Register global hotkey
            hotkey::register_global_hotkey(app.handle().clone(), &settings.hotkey);

            Ok(())
        })
        .on_window_event(|window, event| {
            // Handle drag-drop events from the OS into the shelf window
            if let tauri::WindowEvent::DragDrop(drag_event) = event {
                match drag_event {
                    tauri::DragDropEvent::Drop { paths, position: _ } => {
                        for path in paths {
                            let path_str = path.to_string_lossy().to_string();
                            let _ = window.emit("file-dropped", path_str);
                        }
                    }
                    tauri::DragDropEvent::Hover { paths: _, position: _ } => {
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
```

### 7. Tauri Window Configuration

```jsonc
// tauri.conf.json (relevant section)
{
  "app": {
    "windows": [
      {
        "label": "shelf",
        "title": "Digital Shelf",
        "width": 280,
        "height": 600,
        "minWidth": 200,
        "minHeight": 300,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "resizable": true,
        "skipTaskbar": false,
        "center": false,
        "x": 1620,
        "y": 100,
        "dragDropEnabled": true
      }
    ],
    "trayIcon": {
      "iconPath": "icons/tray.png",
      "tooltip": "Digital Shelf"
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

---

## 🖥️ Frontend Implementation

### TypeScript Types

```typescript
// types/shelf.ts

export interface ShelfItemFile {
  kind: "File";
  path: string;
  name: string;
  extension: string;
  size_bytes: number;
  thumbnail_b64: string | null;
}

export interface ShelfItemImage {
  kind: "Image";
  path: string;
  name: string;
  width: number;
  height: number;
  thumbnail_b64: string;
}

export interface ShelfItemText {
  kind: "Text";
  content: string;
  preview: string;
  source_app: string | null;
}

export interface ShelfItemLink {
  kind: "Link";
  url: string;
  title: string | null;
  favicon_b64: string | null;
}

export type ShelfItemData =
  | ShelfItemFile
  | ShelfItemImage
  | ShelfItemText
  | ShelfItemLink;

export interface ShelfItem {
  id: string;
  data: ShelfItemData;
  added_at: number;
}

export interface ShelfSettings {
  opacity: number;
  always_on_top: boolean;
  auto_collapse: boolean;
  collapse_delay_ms: number;
  max_items: number;
  hotkey: string;
  theme: "glass" | "solid" | "dark";
  width: number;
  edge: "Left" | "Right" | "Top" | "Bottom" | "Float";
}
```

### Shelf Items Hook

```typescript
// hooks/useShelfItems.ts
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ShelfItem } from "../types/shelf";

export function useShelfItems() {
  const [items, setItems] = useState<ShelfItem[]>([]);

  // Load existing items on mount
  useEffect(() => {
    invoke<ShelfItem[]>("get_shelf_items").then(setItems);
  }, []);

  // Listen for file drops from OS
  useEffect(() => {
    const unlisten = listen<string>("file-dropped", async (event) => {
      const newItem = await invoke<ShelfItem>("add_file_to_shelf", {
        path: event.payload,
      });
      setItems((prev) => [...prev, newItem]);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const addText = useCallback(async (content: string) => {
    const item = await invoke<ShelfItem>("add_text_to_shelf", { content });
    setItems((prev) => [...prev, item]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await invoke("remove_from_shelf", { id });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(async () => {
    await invoke("clear_shelf");
    setItems([]);
  }, []);

  return { items, addText, remove, clear };
}
```

### Drag-Drop Hook

```typescript
// hooks/useDragDrop.ts
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

export function useDragDrop() {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const unlistenHover = listen<boolean>("drag-hover", (e) => {
      setIsDragOver(e.payload);
    });
    const unlistenLeave = listen("drag-leave", () => {
      setIsDragOver(false);
    });

    return () => {
      unlistenHover.then((fn) => fn());
      unlistenLeave.then((fn) => fn());
    };
  }, []);

  return { isDragOver };
}
```

### Settings Hook

```typescript
// hooks/useSettings.ts
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ShelfSettings } from "../types/shelf";

const DEFAULTS: ShelfSettings = {
  opacity: 0.85,
  always_on_top: true,
  auto_collapse: true,
  collapse_delay_ms: 2000,
  max_items: 20,
  hotkey: "Ctrl+Shift+D",
  theme: "glass",
  width: 280,
  edge: "Right",
};

export function useSettings() {
  const [settings, setSettings] = useState<ShelfSettings>(DEFAULTS);

  useEffect(() => {
    invoke<ShelfSettings>("load_settings").then(setSettings);
  }, []);

  const update = useCallback(async (partial: Partial<ShelfSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await invoke("save_settings", { settings: next });

    // Apply always-on-top change immediately
    if (partial.always_on_top !== undefined) {
      const win = getCurrentWindow();
      await win.setAlwaysOnTop(partial.always_on_top);
    }
  }, [settings]);

  return { settings, update };
}
```

### Shelf Card Component

```tsx
// components/ShelfCard.tsx
import type { ShelfItem } from "../types/shelf";
import { invoke } from "@tauri-apps/api/core";
import { getFileIcon } from "../utils/fileIcons";
import "../styles/card.css";

interface Props {
  item: ShelfItem;
  onRemove: (id: string) => void;
}

export function ShelfCard({ item, onRemove }: Props) {
  const { data } = item;

  const handleDragStart = (e: React.DragEvent) => {
    if (data.kind === "File" || data.kind === "Image") {
      // Initiate OS-level file drag
      invoke("start_drag", { filePath: data.path });
    } else if (data.kind === "Text") {
      e.dataTransfer.setData("text/plain", data.content);
    } else if (data.kind === "Link") {
      e.dataTransfer.setData("text/uri-list", data.url);
    }
  };

  return (
    <div
      className="shelf-card"
      draggable
      onDragStart={handleDragStart}
    >
      <button
        className="shelf-card__remove"
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        &times;
      </button>

      <div className="shelf-card__preview">
        {data.kind === "Image" && (
          <img
            src={`data:image/jpeg;base64,${data.thumbnail_b64}`}
            alt={data.name}
            className="shelf-card__thumb"
          />
        )}

        {data.kind === "File" && (
          <div className="shelf-card__file-icon">
            <span className="shelf-card__ext">{data.extension}</span>
            {data.thumbnail_b64 && (
              <img
                src={`data:image/jpeg;base64,${data.thumbnail_b64}`}
                alt={data.name}
                className="shelf-card__thumb shelf-card__thumb--small"
              />
            )}
          </div>
        )}

        {data.kind === "Text" && (
          <p className="shelf-card__text-preview">{data.preview}</p>
        )}

        {data.kind === "Link" && (
          <div className="shelf-card__link">
            <span className="shelf-card__link-icon">🔗</span>
            <span className="shelf-card__link-url">
              {data.title || data.url}
            </span>
          </div>
        )}
      </div>

      <div className="shelf-card__label">
        {data.kind === "File" && data.name}
        {data.kind === "Image" && (
          <span>{data.name} <small>({data.width}x{data.height})</small></span>
        )}
        {data.kind === "Text" && "Text snippet"}
        {data.kind === "Link" && new URL(data.url).hostname}
      </div>
    </div>
  );
}
```

### Main Shelf Component

```tsx
// components/Shelf.tsx
import { useShelfItems } from "../hooks/useShelfItems";
import { useDragDrop } from "../hooks/useDragDrop";
import { useSettings } from "../hooks/useSettings";
import { ShelfCard } from "./ShelfCard";
import { TitleBar } from "./TitleBar";
import { TransparencySlider } from "./TransparencySlider";
import { DropOverlay } from "./DropOverlay";
import "../styles/shelf.css";

export function Shelf() {
  const { items, remove, clear } = useShelfItems();
  const { isDragOver } = useDragDrop();
  const { settings, update } = useSettings();

  return (
    <div
      className={`shelf shelf--${settings.theme}`}
      style={{ opacity: settings.opacity }}
    >
      <TitleBar
        alwaysOnTop={settings.always_on_top}
        onTogglePin={() => update({ always_on_top: !settings.always_on_top })}
        onClear={clear}
        itemCount={items.length}
      />

      <TransparencySlider
        value={settings.opacity}
        onChange={(opacity) => update({ opacity })}
      />

      <div className="shelf__items">
        {items.length === 0 ? (
          <div className="shelf__empty">
            <p>Drop files, images, or text here</p>
          </div>
        ) : (
          items.map((item) => (
            <ShelfCard key={item.id} item={item} onRemove={remove} />
          ))
        )}
      </div>

      {isDragOver && <DropOverlay />}
    </div>
  );
}
```

### Transparency Slider

```tsx
// components/TransparencySlider.tsx
import "../styles/shelf.css";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function TransparencySlider({ value, onChange }: Props) {
  return (
    <div className="transparency-slider">
      <label className="transparency-slider__label">Opacity</label>
      <input
        type="range"
        min={0.2}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="transparency-slider__input"
      />
      <span className="transparency-slider__value">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
```

### Drop Overlay (Visual Feedback)

```tsx
// components/DropOverlay.tsx
import "../styles/shelf.css";

export function DropOverlay() {
  return (
    <div className="drop-overlay">
      <div className="drop-overlay__content">
        <div className="drop-overlay__icon">+</div>
        <p>Drop to add to shelf</p>
      </div>
    </div>
  );
}
```

---

## 🎨 Styling (Glass-Morphism Theme)

### Global CSS Variables

```css
/* styles/global.css */
:root {
  /* Glass theme */
  --shelf-bg: rgba(255, 255, 255, 0.08);
  --shelf-bg-solid: rgba(30, 30, 40, 0.95);
  --shelf-border: rgba(255, 255, 255, 0.12);
  --shelf-blur: 20px;
  --card-bg: rgba(255, 255, 255, 0.06);
  --card-bg-hover: rgba(255, 255, 255, 0.12);
  --card-border: rgba(255, 255, 255, 0.08);
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.3);
  --danger: #ef4444;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-fast: 150ms ease;
  --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  color: var(--text-primary);
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
```

### Shelf Container

```css
/* styles/shelf.css */
.shelf {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: opacity var(--transition-smooth);
}

.shelf--glass {
  background: var(--shelf-bg);
  backdrop-filter: blur(var(--shelf-blur));
  -webkit-backdrop-filter: blur(var(--shelf-blur));
  border: 1px solid var(--shelf-border);
}

.shelf--solid {
  background: var(--shelf-bg-solid);
  border: 1px solid var(--shelf-border);
}

.shelf--dark {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.shelf__items {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.shelf__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 32px 16px;
  border: 2px dashed var(--shelf-border);
  border-radius: var(--radius-md);
  margin: 16px 8px;
}

/* Transparency slider */
.transparency-slider {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--shelf-border);
}

.transparency-slider__label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.transparency-slider__input {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.transparency-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
  cursor: grab;
}

.transparency-slider__value {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 32px;
  text-align: right;
}

/* Drop overlay */
.drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(4px);
  border: 2px dashed var(--accent);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: overlay-in 200ms ease forwards;
}

.drop-overlay__content {
  text-align: center;
  color: var(--accent);
}

.drop-overlay__icon {
  font-size: 36px;
  font-weight: 300;
  margin-bottom: 8px;
}

@keyframes overlay-in {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
```

### Item Card

```css
/* styles/card.css */
.shelf-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 10px;
  cursor: grab;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.shelf-card:hover {
  background: var(--card-bg-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.shelf-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.shelf-card__remove {
  position: absolute;
  top: 4px;
  right: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.shelf-card:hover .shelf-card__remove {
  opacity: 1;
}

.shelf-card__remove:hover {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

/* Previews */
.shelf-card__preview {
  margin-bottom: 6px;
}

.shelf-card__thumb {
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.shelf-card__thumb--small {
  max-height: 60px;
}

.shelf-card__file-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shelf-card__ext {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.shelf-card__text-preview {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shelf-card__link {
  display: flex;
  align-items: center;
  gap: 6px;
}

.shelf-card__link-icon {
  font-size: 14px;
}

.shelf-card__link-url {
  font-size: 12px;
  color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shelf-card__label {
  font-size: 12px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shelf-card__label small {
  color: var(--text-secondary);
  font-weight: normal;
}
```

### Custom Title Bar

```css
/* styles/titlebar.css */
.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--shelf-border);
  -webkit-app-region: drag;       /* Allow window dragging */
}

.titlebar__title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.titlebar__count {
  font-size: 10px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

.titlebar__actions {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;    /* Buttons remain clickable */
}

.titlebar__btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.titlebar__btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.titlebar__btn--pinned {
  color: var(--accent);
}
```

---

## 📊 Data Flow

```
┌───────────────────────────────────────────────────────────────────┐
│  OS / Other Applications                                          │
│                                                                   │
│  User drags file ──► Tauri DragDrop Event ──► "file-dropped" emit │
│  User pastes text ──► Frontend paste handler ──► add_text_to_shelf│
└──────────────────────────────┬────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────┐
│  Rust Backend                                                     │
│                                                                   │
│  add_file_to_shelf()                                              │
│    ├── Detect file type (mime_guess)                               │
│    ├── Generate thumbnail if image (image crate)                  │
│    ├── Build ShelfItem with metadata                              │
│    ├── Push to ShelfState (Mutex<Vec<ShelfItem>>)                 │
│    └── Return ShelfItem to frontend                               │
│                                                                   │
│  start_drag()                                                     │
│    └── Initiate OS-level OLE/DnD with file path                  │
└──────────────────────────────┬────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────┐
│  React Frontend                                                   │
│                                                                   │
│  useShelfItems() ──► updates items state                          │
│       │                                                           │
│       ▼                                                           │
│  <Shelf>                                                          │
│    <TitleBar>  pin | settings | clear | item count                │
│    <TransparencySlider>  0.2 ━━━━●━━━ 1.0                        │
│    <ShelfCard> ┌─────────────────┐                                │
│                │ 📷 thumbnail     │  ← image/file preview         │
│                │ filename.png     │                                │
│                │              [x] │  ← remove on hover            │
│                └─────────────────┘                                │
│    <ShelfCard> ...                                                │
│    <DropOverlay>  shown during drag-over                          │
│  </Shelf>                                                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Roadmap

### Version 1.0 — Core Shelf

| Phase | Description | Status |
| :--- | :--- | :---: |
| Phase 1 | Frameless transparent window with glass-morphism UI | 🔲 |
| Phase 2 | File drag-and-drop into the shelf with thumbnail previews | 🔲 |
| Phase 3 | Drag items out of the shelf back into the OS (OLE drag) | 🔲 |
| Phase 4 | Transparency slider and always-on-top toggle | 🔲 |
| Phase 5 | Text snippet and link drop support | 🔲 |
| Phase 6 | Global hotkey to show/hide shelf | 🔲 |
| Phase 7 | Settings persistence (position, preferences) | 🔲 |
| Phase 8 | System tray icon with context menu | 🔲 |

### Version 1.1 — Polish

* **Auto-collapse** — Shelf shrinks to a thin edge strip when mouse leaves, expands on hover.
* **Screen edge snapping** — Magnetic snap to left/right/top/bottom edges.
* **Drag reordering** — Rearrange items within the shelf by dragging.
* **Keyboard navigation** — Arrow keys to select items, Delete to remove, Enter to open.

### Version 2.0 — Advanced

* **Shelf History** — Persist shelf contents across app restarts (optional).
* **Collections / Tabs** — Group items into named shelves (e.g., "Email Draft", "Project Assets").
* **Text OCR Drop** — Drop an image containing text and auto-extract the text content.
* **Cloud Sync** — Sync shelf contents across devices via a lightweight backend.
* **macOS Support** — `NSPasteboard` and `NSFilePromiseProvider` for native drag-out.
* **Linux Support** — X11/Wayland drag-and-drop protocol integration.
* **Plugin System** — Custom item types via user-installable plugins.

---

## 🏃 Quick Start

```bash
# Prerequisites: Rust (stable), Node.js 18+, Tauri CLI v2
npm install -g @tauri-apps/cli

# Clone and install
git clone https://github.com/youruser/digital-shelf.git
cd digital-shelf
npm install

# Development (hot-reload frontend + Rust backend)
cargo tauri dev

# Production build
cargo tauri build
# Output: src-tauri/target/release/bundle/
```

---

## 📐 Design Reference

```
┌──────────────────────────┐
│ ☰  Digital Shelf   3  📌 │  ← Custom titlebar (draggable)
├──────────────────────────┤
│  Opacity  ━━━━━●━━  85% │  ← Transparency slider
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ ┌──────────┐         │ │
│ │ │  🖼️ thumb │  [x]   │ │  ← Image card with preview
│ │ └──────────┘         │ │
│ │ photo.png  1920x1080 │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ [PDF]           [x]  │ │  ← File card with extension badge
│ │ report-q3.pdf        │ │
│ │ 2.4 MB               │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ "Lorem ipsum dolor   │ │  ← Text snippet with preview
│ │  sit amet, consec..."│ │
│ │ Text snippet    [x]  │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🔗 github.com   [x]  │ │  ← Link card
│ └──────────────────────┘ │
│                          │
│   ┌──────────────────┐   │
│   │  Drop items here │   │  ← Empty state / drop target
│   └──────────────────┘   │
└──────────────────────────┘
```

---

## 🤝 Contributing

*(Placeholder for open-source contribution guidelines)*

## 📄 License

MIT License — Free and open for anyone to use, modify, and distribute.
