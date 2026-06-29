//! Convert a raster image into a single-page PDF.

use std::io::Write;
use std::path::Path;
use std::process::Command;

use flate2::write::ZlibEncoder;
use flate2::Compression;

use crate::config::CompressOptions;
use crate::error::{Error, Result};
use crate::image_io::open_image;

/// Convert an image to a PDF with one page that matches the image aspect ratio.
///
/// Transparent pixels are composited onto white because PDF viewers handle image
/// transparency inconsistently when the image is embedded as a raw RGB stream.
pub fn convert(
    source: &Path,
    output: &Path,
    _quality: f32,
    _options: &CompressOptions,
) -> Result<()> {
    let img = open_image_for_pdf(source)?;
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    if width == 0 || height == 0 {
        return Err(Error::ImageDecode("图片尺寸无效".into()));
    }

    let mut rgb = Vec::with_capacity((width as usize) * (height as usize) * 3);
    for pixel in rgba.pixels() {
        let alpha = pixel[3] as u16;
        for channel in [pixel[0], pixel[1], pixel[2]] {
            let blended = ((channel as u16 * alpha) + (255 * (255 - alpha))) / 255;
            rgb.push(blended as u8);
        }
    }

    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(&rgb)?;
    let compressed_rgb = encoder.finish()?;

    let (page_width, page_height) = pdf_page_size(width, height);
    let content = format!("q\n{page_width:.2} 0 0 {page_height:.2} 0 0 cm\n/Im0 Do\nQ\n");

    let objects = [
        "<< /Type /Catalog /Pages 2 0 R >>".as_bytes().to_vec(),
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>".as_bytes().to_vec(),
        format!(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_width:.2} {page_height:.2}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"
        )
        .into_bytes(),
        image_object(width, height, &compressed_rgb),
        stream_object(content.as_bytes()),
    ];

    let mut pdf = Vec::new();
    pdf.extend_from_slice(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    let mut offsets = Vec::with_capacity(objects.len() + 1);
    offsets.push(0usize);
    for (index, object) in objects.iter().enumerate() {
        offsets.push(pdf.len());
        pdf.extend_from_slice(format!("{} 0 obj\n", index + 1).as_bytes());
        pdf.extend_from_slice(object);
        pdf.extend_from_slice(b"\nendobj\n");
    }

    let xref_offset = pdf.len();
    pdf.extend_from_slice(format!("xref\n0 {}\n", objects.len() + 1).as_bytes());
    pdf.extend_from_slice(b"0000000000 65535 f \n");
    for offset in offsets.iter().skip(1) {
        pdf.extend_from_slice(format!("{offset:010} 00000 n \n").as_bytes());
    }
    pdf.extend_from_slice(
        format!(
            "trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n",
            objects.len() + 1
        )
        .as_bytes(),
    );

    std::fs::write(output, pdf)?;
    Ok(())
}

fn open_image_for_pdf(source: &Path) -> Result<image::DynamicImage> {
    match open_image(source) {
        Ok(img) => Ok(img),
        Err(primary_error) => {
            if !matches!(
                source
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .map(|ext| ext.to_ascii_lowercase()),
                Some(ext) if ext == "avif" || ext == "heic" || ext == "heif"
            ) {
                return Err(Error::ImageDecode(format!("读取图片失败: {primary_error}")));
            }

            open_with_sips(source).map_err(|fallback_error| {
                Error::ImageDecode(format!(
                    "读取图片失败: {primary_error}; 系统转换失败: {fallback_error}"
                ))
            })
        }
    }
}

fn open_with_sips(source: &Path) -> std::result::Result<image::DynamicImage, String> {
    let temp = tempfile::Builder::new()
        .prefix("zipax-image-pdf-")
        .suffix(".png")
        .tempfile()
        .map_err(|e| format!("创建临时文件失败: {e}"))?;
    let temp_path = temp.path().to_path_buf();

    let output = Command::new("sips")
        .args([
            "-s",
            "format",
            "png",
            &source.display().to_string(),
            "--out",
            &temp_path.display().to_string(),
        ])
        .output()
        .map_err(|e| format!("执行 sips 失败: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "sips 退出码 {:?}: {}",
            output.status.code(),
            stderr.trim()
        ));
    }

    image::open(&temp_path).map_err(|e| format!("读取转换后的 PNG 失败: {e}"))
}

fn pdf_page_size(width: u32, height: u32) -> (f32, f32) {
    const MAX_PAGE_POINTS: f32 = 14400.0;
    const POINTS_PER_PIXEL: f32 = 0.75;

    let mut page_width = width as f32 * POINTS_PER_PIXEL;
    let mut page_height = height as f32 * POINTS_PER_PIXEL;
    let max_side = page_width.max(page_height);

    if max_side > MAX_PAGE_POINTS {
        let scale = MAX_PAGE_POINTS / max_side;
        page_width *= scale;
        page_height *= scale;
    }

    (page_width.max(1.0), page_height.max(1.0))
}

fn image_object(width: u32, height: u32, data: &[u8]) -> Vec<u8> {
    let mut object = format!(
        "<< /Type /XObject /Subtype /Image /Width {width} /Height {height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length {} >>\nstream\n",
        data.len()
    )
    .into_bytes();
    object.extend_from_slice(data);
    object.extend_from_slice(b"\nendstream");
    object
}

fn stream_object(data: &[u8]) -> Vec<u8> {
    let mut object = format!("<< /Length {} >>\nstream\n", data.len()).into_bytes();
    object.extend_from_slice(data);
    object.extend_from_slice(b"\nendstream");
    object
}
