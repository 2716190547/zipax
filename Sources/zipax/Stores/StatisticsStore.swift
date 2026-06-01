import Foundation

final class StatisticsStore {
    private let fileManager: FileManager
    private let statisticsURL: URL
    private let errorsURL: URL

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
        let baseURL = fileManager
            .urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first!
            .appendingPathComponent("zipax", isDirectory: true)
        self.statisticsURL = baseURL.appendingPathComponent("statistics.json")
        self.errorsURL = baseURL.appendingPathComponent("errors.json")

        let legacyBaseURL = fileManager
            .urls(for: .applicationSupportDirectory, in: .userDomainMask)
            .first!
            .appendingPathComponent("ImageAutoCompressor", isDirectory: true)
        migrateIfNeeded(from: legacyBaseURL.appendingPathComponent("statistics.json"), to: statisticsURL, baseURL: baseURL)
        migrateIfNeeded(from: legacyBaseURL.appendingPathComponent("errors.json"), to: errorsURL, baseURL: baseURL)
    }

    private func migrateIfNeeded(from legacyURL: URL, to currentURL: URL, baseURL: URL) {
        guard !fileManager.fileExists(atPath: currentURL.path),
              fileManager.fileExists(atPath: legacyURL.path) else {
            return
        }

        try? fileManager.createDirectory(at: baseURL, withIntermediateDirectories: true)
        try? fileManager.copyItem(at: legacyURL, to: currentURL)
    }

    func loadStatistics() throws -> AppStatistics {
        guard fileManager.fileExists(atPath: statisticsURL.path) else {
            return .empty
        }

        let data = try Data(contentsOf: statisticsURL)
        return try JSONDecoder.appDecoder.decode(AppStatistics.self, from: data)
    }

    func saveStatistics(_ statistics: AppStatistics) throws {
        try fileManager.createDirectory(
            at: statisticsURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        let data = try JSONEncoder.appEncoder.encode(statistics)
        try data.write(to: statisticsURL, options: [.atomic])
    }

    func loadErrors() throws -> [CompressionErrorRecord] {
        guard fileManager.fileExists(atPath: errorsURL.path) else {
            return []
        }

        let data = try Data(contentsOf: errorsURL)
        return try JSONDecoder.appDecoder.decode([CompressionErrorRecord].self, from: data)
    }

    func saveErrors(_ records: [CompressionErrorRecord]) throws {
        try fileManager.createDirectory(
            at: errorsURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        let data = try JSONEncoder.appEncoder.encode(records)
        try data.write(to: errorsURL, options: [.atomic])
    }
}
