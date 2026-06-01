import Foundation

final class SettingsStore {
    private let fileManager: FileManager
    private let configurationURL: URL

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
        let baseURL = fileManager
            .urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first!
            .appendingPathComponent("zipax", isDirectory: true)
        self.configurationURL = baseURL.appendingPathComponent("settings.json")

        let legacyURL = fileManager
            .urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first!
            .appendingPathComponent("ImageAutoCompressor", isDirectory: true)
            .appendingPathComponent("settings.json")
        if !fileManager.fileExists(atPath: configurationURL.path),
           fileManager.fileExists(atPath: legacyURL.path) {
            try? fileManager.createDirectory(at: baseURL, withIntermediateDirectories: true)
            try? fileManager.copyItem(at: legacyURL, to: configurationURL)
        }
    }

    func load() throws -> AppConfiguration {
        guard fileManager.fileExists(atPath: configurationURL.path) else {
            return .empty
        }

        let data = try Data(contentsOf: configurationURL)
        return try JSONDecoder.appDecoder.decode(AppConfiguration.self, from: data)
    }

    func save(_ configuration: AppConfiguration) throws {
        try fileManager.createDirectory(
            at: configurationURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        let data = try JSONEncoder.appEncoder.encode(configuration)
        try data.write(to: configurationURL, options: [.atomic])
    }
}
