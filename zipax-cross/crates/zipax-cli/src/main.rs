//! zipax CLI: command-line compression tool.

use std::path::PathBuf;

use anyhow::Result;
use clap::{Parser, Subcommand};

use zipax_core::{
    compress_file, plan_compression, CompressOptions, CompressionMode, OutputFormat, QualityLevel,
};

#[derive(Parser)]
#[command(name = "zipax", version, about = "跨平台图片/PDF 压缩工具")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// 压缩一个或多个文件
    Compress {
        /// 输入文件路径
        files: Vec<PathBuf>,

        /// 压缩模式
        #[arg(short, long, value_enum, default_value = "balanced")]
        mode: ModeArg,

        /// 输出格式
        #[arg(short, long, value_enum, default_value = "original")]
        format: FormatArg,

        /// 质量等级 (1-6, 1=最高质量)
        #[arg(short, long, default_value = "3")]
        level: u8,

        /// 目标大小 (KB), 仅 target-size 模式
        #[arg(short, long)]
        target: Option<u32>,

        /// 保留元数据
        #[arg(long)]
        metadata: bool,

        /// 覆盖原文件
        #[arg(long)]
        overwrite: bool,

        /// 最大宽度
        #[arg(long)]
        max_width: Option<u32>,

        /// 最大高度
        #[arg(long)]
        max_height: Option<u32>,

        /// JSON 输出
        #[arg(long)]
        json: bool,
    },

    /// 查看压缩计划（不执行）
    Plan {
        /// 输入文件路径
        files: Vec<PathBuf>,

        /// 压缩模式
        #[arg(short, long, value_enum, default_value = "balanced")]
        mode: ModeArg,
    },
}

#[derive(clap::ValueEnum, Clone)]
enum ModeArg {
    Quality,
    Balanced,
    Size,
    Advanced,
    Target,
}

#[derive(clap::ValueEnum, Clone)]
enum FormatArg {
    Original,
    Jpeg,
    Png,
    Webp,
    Avif,
    Pdf,
}

fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Compress {
            files,
            mode,
            format,
            level,
            target,
            metadata,
            overwrite,
            max_width,
            max_height,
            json,
        } => {
            let options = build_options(
                mode, format, level, target, metadata, overwrite, max_width, max_height,
            );
            let results = compress_batch(&files, &options)?;

            if json {
                println!("{}", serde_json::to_string_pretty(&results)?);
            } else {
                for r in &results {
                    if r.used_output {
                        let ratio = r.ratio();
                        println!(
                            "{}: {} -> {} ({:.1}% 减少)",
                            r.source,
                            zipax_core::utils::format_bytes(r.original_bytes),
                            zipax_core::utils::format_bytes(r.compressed_bytes),
                            ratio
                        );
                    } else {
                        println!("{}: 跳过（压缩后更大）", r.source);
                    }
                }
            }
        }

        Commands::Plan { files, mode } => {
            let options = CompressOptions::from_mode(match mode {
                ModeArg::Quality => CompressionMode::QualityFirst,
                ModeArg::Balanced => CompressionMode::Balanced,
                ModeArg::Size => CompressionMode::SizeFirst,
                ModeArg::Advanced => CompressionMode::Advanced,
                ModeArg::Target => CompressionMode::TargetSize,
            });

            for file in &files {
                match plan_compression(file, &options) {
                    Ok(plan) => {
                        println!(
                            "{} -> {} ({})",
                            plan.source.display(),
                            plan.output.display(),
                            plan.output_kind
                        );
                    }
                    Err(e) => {
                        eprintln!("{}: {e}", file.display());
                    }
                }
            }
        }
    }

    Ok(())
}

fn build_options(
    mode: ModeArg,
    format: FormatArg,
    level: u8,
    target: Option<u32>,
    metadata: bool,
    overwrite: bool,
    max_width: Option<u32>,
    max_height: Option<u32>,
) -> CompressOptions {
    let compression_mode = match mode {
        ModeArg::Quality => CompressionMode::QualityFirst,
        ModeArg::Balanced => CompressionMode::Balanced,
        ModeArg::Size => CompressionMode::SizeFirst,
        ModeArg::Advanced => CompressionMode::Advanced,
        ModeArg::Target => CompressionMode::TargetSize,
    };

    let output_format = match format {
        FormatArg::Original => OutputFormat::Original,
        FormatArg::Jpeg => OutputFormat::Jpeg,
        FormatArg::Png => OutputFormat::Png,
        FormatArg::Webp => OutputFormat::Webp,
        FormatArg::Avif => OutputFormat::Avif,
        FormatArg::Pdf => OutputFormat::Pdf,
    };

    let quality_level = match level {
        1 => QualityLevel::L1,
        2 => QualityLevel::L2,
        3 => QualityLevel::L3,
        4 => QualityLevel::L4,
        5 => QualityLevel::L5,
        _ => QualityLevel::L6,
    };

    CompressOptions {
        mode: compression_mode,
        output_format,
        level: quality_level,
        target_size_kb: target,
        preserve_metadata: metadata,
        resize: zipax_core::ResizeOptions {
            enabled: max_width.is_some() || max_height.is_some(),
            max_width,
            max_height,
            allow_upscale: false,
        },
        overwrite_original: overwrite,
    }
}

fn compress_batch(
    files: &[PathBuf],
    options: &CompressOptions,
) -> Result<Vec<zipax_core::compress::CompressionResult>> {
    let mut results = Vec::new();

    for file in files {
        match compress_file(file, options) {
            Ok(r) => results.push(r),
            Err(e) => {
                eprintln!("{}: {e}", file.display());
                results.push(zipax_core::compress::CompressionResult {
                    source: file.to_string_lossy().to_string(),
                    output: file.to_string_lossy().to_string(),
                    original_bytes: 0,
                    compressed_bytes: 0,
                    used_output: false,
                });
            }
        }
    }

    Ok(results)
}
