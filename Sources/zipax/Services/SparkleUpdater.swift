import Combine
import Foundation
import Sparkle

@MainActor
final class SparkleUpdater: ObservableObject {
    private let controller = SPUStandardUpdaterController(
        startingUpdater: true,
        updaterDelegate: nil,
        userDriverDelegate: nil
    )

    var automaticallyChecksForUpdates: Bool {
        get {
            controller.updater.automaticallyChecksForUpdates
        }
        set {
            controller.updater.automaticallyChecksForUpdates = newValue
            if controller.updater.allowsAutomaticUpdates {
                controller.updater.automaticallyDownloadsUpdates = newValue
            }
            objectWillChange.send()
        }
    }

    func checkForUpdates() {
        controller.checkForUpdates(nil)
    }
}
