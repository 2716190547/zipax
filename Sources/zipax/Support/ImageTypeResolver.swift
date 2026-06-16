import Foundation
import UniformTypeIdentifiers

enum ImageKind: String, Codable {
    case jpeg
    case png
    case heic
    case heif
    case tiff
    case webp
    case avif
    case gif
    case pdf

    var preferredPathExtension: String {
        switch self {
        case .jpeg: "jpg"
        case .png: "png"
        case .heic: "heic"
        case .heif: "heif"
        case .tiff: "tiff"
        case .webp: "webp"
        case .avif: "avif"
        case .gif: "gif"
        case .pdf: "pdf"
        }
    }
}

enum ImageTypeResolver {
    static func kind(for url: URL) -> ImageKind? {
        let ext = url.pathExtension.lowercased()
        switch ext {
        case "jpg", "jpeg": return .jpeg
        case "png": return .png
        case "heic": return .heic
        case "heif": return .heif
        case "tif", "tiff": return .tiff
        case "webp": return .webp
        case "avif": return .avif
        case "gif": return .gif
        case "pdf": return .pdf
        default:
            guard let type = UTType(filenameExtension: ext) else { return nil }
            if type.conforms(to: .jpeg) { return .jpeg }
            if type.conforms(to: .png) { return .png }
            if type.conforms(to: .heic) { return .heic }
            if type.conforms(to: .heif) { return .heif }
            if type.conforms(to: .tiff) { return .tiff }
            if type.conforms(to: .gif) { return .gif }
            if type.conforms(to: .pdf) { return .pdf }
            return nil
        }
    }
}
