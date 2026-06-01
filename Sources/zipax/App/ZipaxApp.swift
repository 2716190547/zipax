import AppKit
import SwiftUI

@main
struct ZipaxApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @Environment(\.openWindow) private var openWindow
    @StateObject private var store = AppStore()
    @StateObject private var updater = SparkleUpdater()

    init() {
        let appStore = AppStore()
        _store = StateObject(wrappedValue: appStore)
        Task { @MainActor in
            await appStore.start()
        }
    }

    var body: some Scene {
        MenuBarExtra {
            MenuBarContentView()
                .environmentObject(store)
                .environmentObject(updater)
                .onReceive(NotificationCenter.default.publisher(for: .requestMainWindow)) { _ in
                    openWindow(id: "main")
                    NSApp.activate(ignoringOtherApps: true)
                }
        } label: {
            Label {
                Text(store.globalState == .running ? "运行中" : "已暂停")
            } icon: {
                Image(systemName: store.globalState == .running ? "photo.badge.checkmark" : "pause.circle")
            }
            .onReceive(NotificationCenter.default.publisher(for: .requestMainWindow)) { _ in
                openWindow(id: "main")
                NSApp.activate(ignoringOtherApps: true)
            }
        }

        Window("zipax", id: "main") {
            MainWindowView()
                .environmentObject(store)
                .environmentObject(updater)
                .fixedSize(horizontal: false, vertical: true)
                .preferredColorScheme(store.colorScheme)
                .onReceive(NotificationCenter.default.publisher(for: .requestMainWindow)) { _ in
                    openWindow(id: "main")
                    NSApp.activate(ignoringOtherApps: true)
                }
        }
        .defaultSize(width: SettingsPalette.windowWidth, height: 320)
        .windowResizability(.contentSize)
    }
}
