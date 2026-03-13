use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use image::imageops::FilterType;
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
    let reader = image::ImageReader::open(path)?;
    let dims = reader.into_dimensions()?;
    Ok(dims)
}
