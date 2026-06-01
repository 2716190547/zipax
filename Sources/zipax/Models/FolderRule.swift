import Foundation

struct FolderRule: Identifiable, Codable, Equatable {
    var id: UUID
    var folderURL: URL
    var bookmarkData: Data?
    var isEnabled: Bool
    var overwriteOriginal: Bool
    var compressionMode: CompressionMode
    var outputFormat: OutputFormat
    var settings: CompressionSettings
    var preserveMetadata: Bool
    var resize: ResizeSettings
    var lastProcessedAt: Date?

    init(folderURL: URL) {
        self.id = UUID()
        self.folderURL = folderURL
        self.bookmarkData = nil
        self.isEnabled = true
        self.overwriteOriginal = true
        self.compressionMode = .balanced
        self.outputFormat = .original
        self.settings = .balanced
        self.preserveMetadata = false
        self.resize = .disabled
        self.lastProcessedAt = nil
    }
}

extension FolderRule {
    private enum CodingKeys: String, CodingKey {
        case id
        case folderURL
        case bookmarkData
        case isEnabled
        case overwriteOriginal
        case compressionMode
        case outputFormat
        case settings
        case preserveMetadata
        case resize
        case lastProcessedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        folderURL = try container.decode(URL.self, forKey: .folderURL)
        bookmarkData = try container.decodeIfPresent(Data.self, forKey: .bookmarkData)
        isEnabled = try container.decode(Bool.self, forKey: .isEnabled)
        overwriteOriginal = try container.decode(Bool.self, forKey: .overwriteOriginal)
        compressionMode = try container.decode(CompressionMode.self, forKey: .compressionMode)
        outputFormat = try container.decodeIfPresent(OutputFormat.self, forKey: .outputFormat) ?? .original
        settings = try container.decode(CompressionSettings.self, forKey: .settings)
        preserveMetadata = try container.decode(Bool.self, forKey: .preserveMetadata)
        resize = try container.decode(ResizeSettings.self, forKey: .resize)
        lastProcessedAt = try container.decodeIfPresent(Date.self, forKey: .lastProcessedAt)
    }
}
