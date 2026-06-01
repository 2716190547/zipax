import AppKit
import SwiftUI

struct MenuBarContentView: View {
    @Environment(\.openWindow) private var openWindow
    @EnvironmentObject private var store: AppStore

    var body: some View {
        Text("zipax")
        Text("状态：\(store.globalState == .running ? "运行中" : "已暂停")")
        Text("已压缩：\(store.savedSizeText)")

        Divider()

        Button(store.globalState == .running ? "暂停" : "继续") {
            store.toggleGlobalState()
        }

        Button("打开 zipax") {
            openWindow(id: "main")
            NSApp.activate(ignoringOtherApps: true)
        }

        Divider()

        Button("退出") {
            NSApp.terminate(nil)
        }
    }
}
