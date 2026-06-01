import Foundation
import ImageIO
import UniformTypeIdentifiers

enum ImageCompressionError: LocalizedError {
    case cannotReadImage
    case cannotCreateDestination
    case cannotFinalize
    case unsupportedFormat
    case missingPNGEncoder
    case pngEncoderFailed(String)
    case missingWebPEncoder
    case webPEncoderFailed(String)
    case missingPDFEncoder
    case pdfEncoderFailed(String)

    var errorDescription: String? {
        switch self {
        case .cannotReadImage: "无法读取图片"
        case .cannotCreateDestination: "无法创建输出文件"
        case .cannotFinalize: "图片写入失败"
        case .unsupportedFormat: "暂不支持该格式"
        case .missingPNGEncoder: "缺少 PNG 编码器 pngquant"
        case .pngEncoderFailed(let message): "PNG 编码失败：\(message)"
        case .missingWebPEncoder: "缺少 WebP 编码器 cwebp"
        case .webPEncoderFailed(let message): "WebP 编码失败：\(message)"
        case .missingPDFEncoder: "缺少 PDF 编码器 Ghostscript"
        case .pdfEncoderFailed(let message): "PDF 编码失败：\(message)"
        }
    }
}

struct ImageCompressionService: Sendable {
    func compressToTemporary(url: URL, rule: FolderRule, kind: ImageKind) throws -> CompressionResult {
        guard kind != .gif else {
            throw ImageCompressionError.unsupportedFormat
        }

        let originalBytes = try fileSize(url)
        let outputKind = kind == .pdf ? .pdf : (rule.outputFormat.imageKind ?? kind)
        let baseName = url.deletingPathExtension().lastPathComponent
        let outputURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("\(baseName)#C-\(UUID().uuidString)")
            .appendingPathExtension(outputKind.preferredPathExtension)

        try encode(sourceURL: url, outputURL: outputURL, rule: rule, sourceKind: kind, outputKind: outputKind)
        let compressedBytes = try fileSize(outputURL)
        let targetBytes = targetBytes(for: rule)

        return CompressionResult(
            sourceURL: url,
            outputURL: outputURL,
            originalBytes: originalBytes,
            compressedBytes: compressedBytes,
            targetBytes: targetBytes
        )
    }

    func compress(url: URL, rule: FolderRule, kind: ImageKind) throws -> CompressionResult {
        guard kind != .gif else {
            throw ImageCompressionError.unsupportedFormat
        }

        let originalBytes = try fileSize(url)
        let outputKind = kind == .pdf ? .pdf : (rule.outputFormat.imageKind ?? kind)
        let overwriteURL = url
            .deletingPathExtension()
            .appendingPathExtension(outputKind.preferredPathExtension)
        let outputURL = rule.overwriteOriginal
            ? temporaryURL(for: overwriteURL)
            : OutputNameResolver.compressedURL(for: url, pathExtension: outputKind.preferredPathExtension)

        try encode(sourceURL: url, outputURL: outputURL, rule: rule, sourceKind: kind, outputKind: outputKind)

        let compressedBytes = try fileSize(outputURL)
        let targetBytes = targetBytes(for: rule)
        guard compressedBytes < originalBytes else {
            try? FileManager.default.removeItem(at: outputURL)
            return CompressionResult(
                sourceURL: url,
                outputURL: url,
                originalBytes: originalBytes,
                compressedBytes: originalBytes,
                targetBytes: targetBytes
            )
        }

        if rule.overwriteOriginal {
            if outputKind == kind {
                _ = try FileManager.default.replaceItemAt(url, withItemAt: outputURL)
            } else {
                if FileManager.default.fileExists(atPath: overwriteURL.path) {
                    _ = try FileManager.default.replaceItemAt(overwriteURL, withItemAt: outputURL)
                } else {
                    try FileManager.default.moveItem(at: outputURL, to: overwriteURL)
                }
                try FileManager.default.removeItem(at: url)
            }
        }

        let finalURL = rule.overwriteOriginal ? overwriteURL : outputURL

        return CompressionResult(
            sourceURL: url,
            outputURL: finalURL,
            originalBytes: originalBytes,
            compressedBytes: compressedBytes,
            targetBytes: targetBytes
        )
    }

    private func encode(sourceURL: URL, outputURL: URL, rule: FolderRule, sourceKind: ImageKind, outputKind: ImageKind) throws {
        if outputKind == .pdf {
            try encodePDF(sourceURL: sourceURL, outputURL: outputURL, rule: rule)
            return
        }

        if rule.compressionMode == .targetSize, targetBytes(for: rule) != nil {
            try encodeToTargetSize(sourceURL: sourceURL, outputURL: outputURL, rule: rule, sourceKind: sourceKind, outputKind: outputKind)
            return
        }

        if outputKind == .webp {
            try encodeWebP(sourceURL: sourceURL, outputURL: outputURL, rule: rule)
            return
        }

        if sourceKind == .png, outputKind == .png, !rule.preserveMetadata {
            try encodePNG(sourceURL: sourceURL, outputURL: outputURL, rule: rule)
            return
        }

        try encodeWithImageIO(sourceURL: sourceURL, outputURL: outputURL, rule: rule, kind: outputKind)
    }

    private func encodeOptions(for rule: FolderRule, kind: ImageKind) -> [CFString: Any] {
        var options: [CFString: Any] = [
            kCGImageDestinationLossyCompressionQuality: quality(for: rule, kind: kind)
        ]

        if !rule.preserveMetadata {
            options[kCGImagePropertyExifDictionary] = [:]
            options[kCGImagePropertyGPSDictionary] = [:]
            options[kCGImagePropertyTIFFDictionary] = [:]
        }

        return options
    }

    private func quality(for rule: FolderRule, kind: ImageKind) -> Double {
        rule.settings.level.compressionQuality
    }

    private func resizedImageIfNeeded(source: CGImageSource, rule: FolderRule) throws -> CGImage? {
        guard rule.resize.isEnabled else { return nil }

        var maxPixelSize = 0
        if let maxWidth = rule.resize.maxWidth {
            maxPixelSize = max(maxPixelSize, maxWidth)
        }
        if let maxHeight = rule.resize.maxHeight {
            maxPixelSize = max(maxPixelSize, maxHeight)
        }
        guard maxPixelSize > 0 else { return nil }

        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixelSize,
            kCGImageSourceCreateThumbnailWithTransform: true
        ]

        return CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
    }

    private func destinationType(for kind: ImageKind) throws -> String {
        switch kind {
        case .jpeg: return UTType.jpeg.identifier
        case .png: return UTType.png.identifier
        case .heic: return UTType.heic.identifier
        case .heif: return UTType.heif.identifier
        case .tiff: return UTType.tiff.identifier
        case .webp: return "org.webmproject.webp"
        case .gif, .pdf: throw ImageCompressionError.unsupportedFormat
        }
    }

    private func encodeToTargetSize(sourceURL: URL, outputURL: URL, rule: FolderRule, sourceKind: ImageKind, outputKind: ImageKind) throws {
        guard let targetBytes = targetBytes(for: rule) else {
            try encode(sourceURL: sourceURL, outputURL: outputURL, rule: rule, sourceKind: sourceKind, outputKind: outputKind)
            return
        }

        var bestURL: URL?
        var bestBytes: Int64?

        for level in QualityLevel.allCases {
            var attemptRule = rule
            attemptRule.compressionMode = .advanced
            attemptRule.settings.level = level

            let attemptURL = temporaryURL(for: outputURL)
            try encode(sourceURL: sourceURL, outputURL: attemptURL, rule: attemptRule, sourceKind: sourceKind, outputKind: outputKind)
            let attemptBytes = try fileSize(attemptURL)

            if attemptBytes <= targetBytes {
                if let bestURL {
                    try? FileManager.default.removeItem(at: bestURL)
                }
                try FileManager.default.moveItem(at: attemptURL, to: outputURL)
                return
            }

            if bestBytes == nil || attemptBytes < bestBytes! {
                if let bestURL {
                    try? FileManager.default.removeItem(at: bestURL)
                }
                bestURL = attemptURL
                bestBytes = attemptBytes
            } else {
                try? FileManager.default.removeItem(at: attemptURL)
            }
        }

        guard let bestURL else {
            throw ImageCompressionError.cannotFinalize
        }
        try FileManager.default.moveItem(at: bestURL, to: outputURL)
    }

    private func encodePNG(sourceURL: URL, outputURL: URL, rule: FolderRule) throws {
        guard let encoderURL = externalEncoderURL(
            executableName: "pngquant",
            candidates: ["/opt/homebrew/bin/pngquant", "/usr/local/bin/pngquant"]
        ) else {
            throw ImageCompressionError.missingPNGEncoder
        }

        let inputURL: URL
        let intermediateURL: URL?
        if rule.resize.isEnabled {
            let resizedURL = FileManager.default.temporaryDirectory
                .appendingPathComponent("png-resize-\(UUID().uuidString)")
                .appendingPathExtension("png")
            try encodeWithImageIO(sourceURL: sourceURL, outputURL: resizedURL, rule: rule, kind: .png)
            inputURL = resizedURL
            intermediateURL = resizedURL
        } else {
            inputURL = sourceURL
            intermediateURL = nil
        }
        defer {
            if let intermediateURL {
                try? FileManager.default.removeItem(at: intermediateURL)
            }
        }

        let quality = Int((quality(for: rule, kind: .png) * 100).rounded())
        let minimumQuality = max(0, quality - 15)

        let arguments = [
            "--force",
            "--quality", "\(minimumQuality)-\(quality)",
            "--speed", "4",
            "--output", outputURL.path,
            "--",
            inputURL.path
        ]

        try runExternalEncoder(
            executableURL: encoderURL,
            arguments: arguments,
            failed: ImageCompressionError.pngEncoderFailed
        )
    }

    private func encodeWebP(sourceURL: URL, outputURL: URL, rule: FolderRule) throws {
        guard let encoderURL = externalEncoderURL(
            executableName: "cwebp",
            candidates: ["/opt/homebrew/bin/cwebp", "/usr/local/bin/cwebp"]
        ) else {
            throw ImageCompressionError.missingWebPEncoder
        }

        var arguments = [
            "-quiet",
            "-q", String(Int((quality(for: rule, kind: .webp) * 100).rounded())),
            "-m", "4",
            "-metadata", rule.preserveMetadata ? "all" : "none"
        ]

        if let targetSize = try webPResizeSize(sourceURL: sourceURL, rule: rule) {
            arguments.append(contentsOf: [
                "-resize",
                String(targetSize.width),
                String(targetSize.height),
                "-resize_mode",
                "down_only"
            ])
        }

        arguments.append(contentsOf: [
            sourceURL.path,
            "-o",
            outputURL.path
        ])

        try runExternalEncoder(
            executableURL: encoderURL,
            arguments: arguments,
            failed: ImageCompressionError.webPEncoderFailed
        )
    }

    private func encodePDF(sourceURL: URL, outputURL: URL, rule: FolderRule) throws {
        guard let encoderURL = externalEncoderURL(
            executableName: "gs",
            candidates: ["/opt/homebrew/bin/gs", "/usr/local/bin/gs", "/usr/bin/gs"]
        ) else {
            throw ImageCompressionError.missingPDFEncoder
        }

        if rule.compressionMode == .targetSize, let targetBytes = targetBytes(for: rule) {
            try encodePDFToTarget(
                sourceURL: sourceURL,
                outputURL: outputURL,
                encoderURL: encoderURL,
                targetBytes: targetBytes
            )
            return
        }

        try runGhostscript(
            encoderURL: encoderURL,
            sourceURL: sourceURL,
            outputURL: outputURL,
            pdfSetting: pdfSetting(for: rule.settings.level)
        )
    }

    private func encodePDFToTarget(
        sourceURL: URL,
        outputURL: URL,
        encoderURL: URL,
        targetBytes: Int64
    ) throws {
        let settings = ["/printer", "/ebook", "/screen"]
        var bestURL: URL?
        var bestBytes: Int64?

        for setting in settings {
            let attemptURL = temporaryURL(for: outputURL)
            try runGhostscript(
                encoderURL: encoderURL,
                sourceURL: sourceURL,
                outputURL: attemptURL,
                pdfSetting: setting
            )
            let attemptBytes = try fileSize(attemptURL)

            if attemptBytes <= targetBytes {
                if let bestURL {
                    try? FileManager.default.removeItem(at: bestURL)
                }
                try FileManager.default.moveItem(at: attemptURL, to: outputURL)
                return
            }

            if bestBytes == nil || attemptBytes < bestBytes! {
                if let bestURL {
                    try? FileManager.default.removeItem(at: bestURL)
                }
                bestURL = attemptURL
                bestBytes = attemptBytes
            } else {
                try? FileManager.default.removeItem(at: attemptURL)
            }
        }

        guard let bestURL else {
            throw ImageCompressionError.cannotFinalize
        }
        try FileManager.default.moveItem(at: bestURL, to: outputURL)
    }

    private func runGhostscript(
        encoderURL: URL,
        sourceURL: URL,
        outputURL: URL,
        pdfSetting: String
    ) throws {
        let arguments = [
            "-q",
            "-dNOPAUSE",
            "-dBATCH",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dDetectDuplicateImages=true",
            "-dCompressFonts=true",
            "-dPDFSETTINGS=\(pdfSetting)",
            "-sOutputFile=\(outputURL.path)",
            sourceURL.path
        ]

        try runExternalEncoder(
            executableURL: encoderURL,
            arguments: arguments,
            failed: ImageCompressionError.pdfEncoderFailed
        )
    }

    private func pdfSetting(for level: QualityLevel) -> String {
        switch level {
        case .level1:
            return "/prepress"
        case .level2:
            return "/printer"
        case .level3, .level4:
            return "/ebook"
        case .level5, .level6:
            return "/screen"
        }
    }

    private func externalEncoderURL(executableName: String, candidates: [String]) -> URL? {
        for path in candidates where FileManager.default.isExecutableFile(atPath: path) {
            return URL(fileURLWithPath: path)
        }

        let pathEntries = (ProcessInfo.processInfo.environment["PATH"] ?? "")
            .split(separator: ":")
            .map(String.init)

        for directory in pathEntries {
            let path = URL(fileURLWithPath: directory)
                .appendingPathComponent(executableName)
                .path
            if FileManager.default.isExecutableFile(atPath: path) {
                return URL(fileURLWithPath: path)
            }
        }

        return nil
    }

    private func runExternalEncoder(
        executableURL: URL,
        arguments: [String],
        failed: (String) -> ImageCompressionError
    ) throws {
        let process = Process()
        process.executableURL = executableURL
        process.arguments = arguments

        let errorPipe = Pipe()
        process.standardError = errorPipe

        do {
            try process.run()
            process.waitUntilExit()
        } catch {
            throw failed(error.localizedDescription)
        }

        guard process.terminationStatus == 0 else {
            let data = errorPipe.fileHandleForReading.readDataToEndOfFile()
            let message = String(data: data, encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines)
            throw failed(message?.isEmpty == false ? message! : "退出码 \(process.terminationStatus)")
        }
    }

    private func encodeWithImageIO(sourceURL: URL, outputURL: URL, rule: FolderRule, kind: ImageKind) throws {
        guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil) else {
            throw ImageCompressionError.cannotReadImage
        }

        let type = try destinationType(for: kind)
        guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, type as CFString, 1, nil) else {
            throw ImageCompressionError.cannotCreateDestination
        }

        let options = encodeOptions(for: rule, kind: kind)
        if let resizedImage = try resizedImageIfNeeded(source: source, rule: rule) {
            CGImageDestinationAddImage(destination, resizedImage, options as CFDictionary)
        } else {
            CGImageDestinationAddImageFromSource(destination, source, 0, options as CFDictionary)
        }

        guard CGImageDestinationFinalize(destination) else {
            throw ImageCompressionError.cannotFinalize
        }
    }

    private func webPResizeSize(sourceURL: URL, rule: FolderRule) throws -> (width: Int, height: Int)? {
        guard rule.resize.isEnabled else { return nil }
        guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
              let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
              let width = properties[kCGImagePropertyPixelWidth] as? Int,
              let height = properties[kCGImagePropertyPixelHeight] as? Int else {
            throw ImageCompressionError.cannotReadImage
        }

        var scale = 1.0
        if let maxWidth = rule.resize.maxWidth, maxWidth > 0 {
            scale = min(scale, Double(maxWidth) / Double(width))
        }
        if let maxHeight = rule.resize.maxHeight, maxHeight > 0 {
            scale = min(scale, Double(maxHeight) / Double(height))
        }

        if !rule.resize.allowUpscale {
            scale = min(scale, 1.0)
        }

        guard scale > 0, scale < 1.0 || rule.resize.allowUpscale else { return nil }

        return (
            width: max(1, Int((Double(width) * scale).rounded())),
            height: max(1, Int((Double(height) * scale).rounded()))
        )
    }

    private func temporaryURL(for url: URL) -> URL {
        FileManager.default.temporaryDirectory
            .appendingPathComponent("\(url.deletingPathExtension().lastPathComponent)-\(UUID().uuidString)")
            .appendingPathExtension(url.pathExtension)
    }

    private func fileSize(_ url: URL) throws -> Int64 {
        let values = try url.resourceValues(forKeys: [.fileSizeKey])
        return Int64(values.fileSize ?? 0)
    }

    private func targetBytes(for rule: FolderRule) -> Int64? {
        guard rule.compressionMode == .targetSize,
              let targetSizeKB = rule.settings.targetSizeKB,
              targetSizeKB > 0 else {
            return nil
        }

        return Int64(targetSizeKB) * 1024
    }
}
