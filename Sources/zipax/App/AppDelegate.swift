import AppKit

extension Notification.Name {
    static let requestMainWindow = Notification.Name("requestMainWindow")
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        NotificationCenter.default.post(name: .requestMainWindow, object: nil)
        return true
    }
}
