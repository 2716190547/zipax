//! Shared image loading helpers.

use std::path::Path;
use std::sync::Once;

use image::DynamicImage;

use crate::error::{Error, Result};

static REGISTER_HEIF_HOOKS: Once = Once::new();

pub fn open_image(path: &Path) -> Result<DynamicImage> {
    register_heif_hooks();
    image::open(path).map_err(|e| Error::ImageDecode(format!("读取图片失败: {e}")))
}

fn register_heif_hooks() {
    REGISTER_HEIF_HOOKS.call_once(|| {
        libheif_rs::integration::image::register_heic_decoding_hook();
        libheif_rs::integration::image::register_heif_decoding_hook();
    });
}
