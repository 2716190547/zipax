import Foundation

enum GlobalCompressionState: String, Codable {
    case running
    case paused
}

enum AppearanceMode: String, Codable, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: "跟随系统"
        case .light: "白天"
        case .dark: "黑暗"
        }
    }
}

struct AppConfiguration: Codable, Equatable {
    var globalState: GlobalCompressionState
    var launchAtLogin: Bool
    var appearanceMode: AppearanceMode
    var autoCopyAfterCompression: Bool
    var skipCompressedFiles: Bool
    var folderRules: [FolderRule]

    static let empty = AppConfiguration(
        globalState: .running,
        launchAtLogin: true,
        appearanceMode: .system,
        autoCopyAfterCompression: false,
        skipCompressedFiles: true,
        folderRules: []
    )
}

extension AppConfiguration {
    private enum CodingKeys: String, CodingKey {
        case globalState
        case launchAtLogin
        case appearanceMode
        case autoCopyAfterCompression
        case skipCompressedFiles
        case folderRules
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        globalState = try container.decodeIfPresent(GlobalCompressionState.self, forKey: .globalState) ?? .running
        launchAtLogin = try container.decodeIfPresent(Bool.self, forKey: .launchAtLogin) ?? true
        appearanceMode = try container.decodeIfPresent(AppearanceMode.self, forKey: .appearanceMode) ?? .system
        autoCopyAfterCompression = try container.decodeIfPresent(Bool.self, forKey: .autoCopyAfterCompression) ?? false
        skipCompressedFiles = try container.decodeIfPresent(Bool.self, forKey: .skipCompressedFiles) ?? true
        folderRules = try container.decodeIfPresent([FolderRule].self, forKey: .folderRules) ?? []
    }
}

struct AppStatistics: Codable, Equatable {
    var totalSavedBytes: Int64
    var totalCompressedCount: Int

    static let empty = AppStatistics(totalSavedBytes: 0, totalCompressedCount: 0)
}

extension AppStatistics {
    private enum CodingKeys: String, CodingKey {
        case totalSavedBytes
        case totalCompressedCount
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        totalSavedBytes = try container.decodeIfPresent(Int64.self, forKey: .totalSavedBytes) ?? 0
        totalCompressedCount = try container.decodeIfPresent(Int.self, forKey: .totalCompressedCount) ?? 0
    }
}

struct CompressionErrorRecord: Identifiable, Codable, Equatable {
    var id: UUID
    var fileName: String
    var reason: String
    var occurredAt: Date

    init(fileName: String, reason: String, occurredAt: Date = Date()) {
        self.id = UUID()
        self.fileName = fileName
        self.reason = reason
        self.occurredAt = occurredAt
    }
}
