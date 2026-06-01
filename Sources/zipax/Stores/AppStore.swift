import AppKit
import Foundation
import SwiftUI

@MainActor
final class AppStore: ObservableObject {
    @Published var selectedCategory: AppCategory = .image
    @Published var globalState: GlobalCompressionState = .running
    @Published var launchAtLogin = true
    @Published var appearanceMode: AppearanceMode = .system
    @Published var autoCopyAfterCompression = false
    @Published var skipCompressedFiles = true
    @Published var folderRules: [FolderRule] = []
    @Published var statistics: AppStatistics = .empty
    @Published var errorRecords: [CompressionErrorRecord] = []

    private let settingsStore = SettingsStore()
    private let statisticsStore = StatisticsStore()
    private let watcherService = FolderWatcherService()
    private let stabilityService = FileStabilityService()
    private let compressionQueue: CompressionQueue
    private let loginItemService = LoginItemService()
    private var hasStarted = false

    init() {
        self.compressionQueue = CompressionQueue(imageService: ImageCompressionService())
    }

    var savedSizeText: String {
        AppFileSizeFormatter.string(from: statistics.totalSavedBytes)
    }

    var compressedCountText: String {
        statistics.totalCompressedCount.formatted()
    }

    var colorScheme: ColorScheme? {
        switch appearanceMode {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }

    func start() async {
        guard !hasStarted else { return }
        hasStarted = true

        do {
            let configuration = try settingsStore.load()
            globalState = configuration.globalState
            launchAtLogin = configuration.launchAtLogin
            appearanceMode = configuration.appearanceMode
            autoCopyAfterCompression = configuration.autoCopyAfterCompression
            skipCompressedFiles = configuration.skipCompressedFiles
            folderRules = configuration.folderRules
        } catch {
            recordError(fileName: "settings.json", reason: "配置读取失败")
        }

        do {
            statistics = try statisticsStore.loadStatistics()
            errorRecords = try statisticsStore.loadErrors()
        } catch {
            recordError(fileName: "statistics.json", reason: "统计读取失败")
        }

        applyLaunchAtLogin()
        rebuildWatchers()
    }

    func addFolder() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.prompt = "添加"

        guard panel.runModal() == .OK, let url = panel.url else { return }

        var rule = FolderRule(folderURL: url)
        rule.bookmarkData = try? url.bookmarkData(options: [.withSecurityScope], includingResourceValuesForKeys: nil, relativeTo: nil)
        folderRules.append(rule)
        persistConfiguration()
        rebuildWatchers()
    }

    func removeFolderRule(_ rule: FolderRule) {
        folderRules.removeAll { $0.id == rule.id }
        persistConfiguration()
        rebuildWatchers()
    }

    func updateFolderRule(_ rule: FolderRule) {
        guard let index = folderRules.firstIndex(where: { $0.id == rule.id }) else { return }
        folderRules[index] = rule
        persistConfiguration()
        rebuildWatchers()
    }

    func toggleGlobalState() {
        globalState = globalState == .running ? .paused : .running
        persistConfiguration()
        rebuildWatchers()
    }

    func setLaunchAtLogin(_ enabled: Bool) {
        launchAtLogin = enabled
        persistConfiguration()
        applyLaunchAtLogin()
    }

    func setAppearanceMode(_ mode: AppearanceMode) {
        appearanceMode = mode
        persistConfiguration()
    }

    func setAutoCopyAfterCompression(_ enabled: Bool) {
        autoCopyAfterCompression = enabled
        persistConfiguration()
    }

    func setSkipCompressedFiles(_ enabled: Bool) {
        skipCompressedFiles = enabled
        persistConfiguration()
    }

    func clearStatistics() {
        statistics = .empty
        persistStatistics()
    }

    func recordManualCompression(_ result: CompressionResult) {
        statistics.totalSavedBytes += max(0, result.savedBytes)
        statistics.totalCompressedCount += 1
        copyToPasteboardIfNeeded(result.outputURL)
        persistStatistics()
    }

    func shouldSkip(_ url: URL) -> Bool {
        skipCompressedFiles && OutputNameResolver.isCompressedURL(url)
    }

    private func rebuildWatchers() {
        watcherService.stop()

        guard globalState == .running else { return }

        watcherService.start(rules: folderRules.filter(\.isEnabled)) { [weak self] url, ruleID in
            Task { @MainActor in
                await self?.handleCandidateFile(url, ruleID: ruleID)
            }
        }
    }

    private func handleCandidateFile(_ url: URL, ruleID: UUID) async {
        guard let rule = folderRules.first(where: { $0.id == ruleID }) else { return }

        guard let kind = ImageTypeResolver.kind(for: url) else { return }
        guard kind != .gif else { return }
        guard !shouldSkip(url) else { return }

        do {
            let stableURL = try await stabilityService.waitUntilStable(url)
            let result = try await compressionQueue.enqueue(url: stableURL, rule: rule, kind: kind)
            applyCompressionResult(result, ruleID: ruleID)
        } catch {
            recordError(fileName: url.lastPathComponent, reason: error.localizedDescription)
        }
    }

    private func applyCompressionResult(_ result: CompressionResult, ruleID: UUID) {
        statistics.totalSavedBytes += max(0, result.savedBytes)
        statistics.totalCompressedCount += 1
        copyToPasteboardIfNeeded(result.outputURL)

        if let index = folderRules.firstIndex(where: { $0.id == ruleID }) {
            folderRules[index].lastProcessedAt = Date()
        }

        persistConfiguration()
        persistStatistics()
    }

    private func recordError(fileName: String, reason: String) {
        errorRecords.insert(CompressionErrorRecord(fileName: fileName, reason: reason), at: 0)
        if errorRecords.count > 20 {
            errorRecords = Array(errorRecords.prefix(20))
        }
        try? statisticsStore.saveErrors(errorRecords)
    }

    private func persistConfiguration() {
        let configuration = AppConfiguration(
            globalState: globalState,
            launchAtLogin: launchAtLogin,
            appearanceMode: appearanceMode,
            autoCopyAfterCompression: autoCopyAfterCompression,
            skipCompressedFiles: skipCompressedFiles,
            folderRules: folderRules
        )
        do {
            try settingsStore.save(configuration)
        } catch {
            recordError(fileName: "settings.json", reason: "配置保存失败")
        }
    }

    private func persistStatistics() {
        do {
            try statisticsStore.saveStatistics(statistics)
        } catch {
            recordError(fileName: "statistics.json", reason: "统计保存失败")
        }
    }

    private func applyLaunchAtLogin() {
        do {
            try loginItemService.setEnabled(launchAtLogin)
        } catch {
            recordError(fileName: "登录项", reason: "开机自启设置失败")
        }
    }

    private func copyToPasteboardIfNeeded(_ url: URL) {
        guard autoCopyAfterCompression,
              FileManager.default.fileExists(atPath: url.path) else {
            return
        }

        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.writeObjects([url as NSURL])
    }
}
