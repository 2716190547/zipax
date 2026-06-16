import Foundation

enum CompressionMode: String, Codable, CaseIterable, Identifiable {
    case qualityFirst
    case balanced
    case sizeFirst
    case advanced
    case targetSize

    var id: String { rawValue }

    var title: String {
        switch self {
        case .qualityFirst: "高清优先"
        case .balanced: "平衡"
        case .sizeFirst: "体积优先"
        case .advanced: "高级"
        case .targetSize: "目标大小"
        }
    }
}

enum OutputFormat: String, Codable, CaseIterable, Identifiable {
    case original
    case jpeg
    case png
    case heic
    case webp
    case avif

    var id: String { rawValue }

    var title: String {
        switch self {
        case .original: "原格式"
        case .jpeg: "JPEG"
        case .png: "PNG"
        case .heic: "HEIC"
        case .webp: "WebP"
        case .avif: "AVIF"
        }
    }

    var imageKind: ImageKind? {
        switch self {
        case .original: nil
        case .jpeg: .jpeg
        case .png: .png
        case .heic: .heic
        case .webp: .webp
        case .avif: .avif
        }
    }
}

enum QualityLevel: Int, Codable, CaseIterable, Identifiable {
    case level1 = 1
    case level2
    case level3
    case level4
    case level5
    case level6

    var id: Int { rawValue }

    var title: String {
        switch self {
        case .level1: "1"
        case .level2: "2"
        case .level3: "3"
        case .level4: "4"
        case .level5: "5"
        case .level6: "6"
        }
    }

    var compressionQuality: Double {
        switch self {
        case .level1: 0.95
        case .level2: 0.88
        case .level3: 0.80
        case .level4: 0.70
        case .level5: 0.58
        case .level6: 0.45
        }
    }
}

struct CompressionSettings: Codable, Equatable {
    var level: QualityLevel
    var targetSizeKB: Int?

    static let balanced = CompressionSettings(level: .level3, targetSizeKB: nil)
}

extension CompressionSettings {
    private enum CodingKeys: String, CodingKey {
        case level
        case jpegLevel
        case pngLevel
        case heicLevel
        case webpLevel
        case targetSizeKB
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        level = try container.decodeIfPresent(QualityLevel.self, forKey: .level)
            ?? container.decodeIfPresent(QualityLevel.self, forKey: .jpegLevel)
            ?? container.decodeIfPresent(QualityLevel.self, forKey: .pngLevel)
            ?? container.decodeIfPresent(QualityLevel.self, forKey: .heicLevel)
            ?? container.decodeIfPresent(QualityLevel.self, forKey: .webpLevel)
            ?? .level3
        targetSizeKB = try container.decodeIfPresent(Int.self, forKey: .targetSizeKB)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(level, forKey: .level)
        try container.encodeIfPresent(targetSizeKB, forKey: .targetSizeKB)
    }
}

struct ResizeSettings: Codable, Equatable {
    var isEnabled: Bool
    var maxWidth: Int?
    var maxHeight: Int?
    var allowUpscale: Bool

    static let disabled = ResizeSettings(
        isEnabled: false,
        maxWidth: nil,
        maxHeight: nil,
        allowUpscale: false
    )
}
