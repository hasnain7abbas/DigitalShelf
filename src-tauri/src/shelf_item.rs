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
        thumbnail_b64: Option<String>,
    },
    Image {
        path: String,
        name: String,
        width: u32,
        height: u32,
        thumbnail_b64: String,
    },
    Text {
        content: String,
        preview: String,
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
    pub added_at: u64,
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
