import Darwin
import Foundation

final class FolderWatcherService {
    private struct Watcher {
        let descriptor: CInt
        let source: DispatchSourceFileSystemObject
        var knownFiles: Set<URL>
    }

    private var watchers: [UUID: Watcher] = [:]
    private let queue = DispatchQueue(label: "zipax.folder-watcher")

    func start(rules: [FolderRule], onNewFile: @escaping @Sendable (URL, UUID) -> Void) {
        stop()

        for rule in rules {
            let url = rule.folderURL
            let descriptor = open(url.path, O_EVTONLY)
            guard descriptor >= 0 else { continue }

            let source = DispatchSource.makeFileSystemObjectSource(
                fileDescriptor: descriptor,
                eventMask: [.write, .extend, .attrib, .rename],
                queue: queue
            )

            var knownFiles = currentFiles(in: url)
            source.setEventHandler { [weak self] in
                guard let self else { return }
                let latestFiles = self.currentFiles(in: url)
                let newFiles = latestFiles.subtracting(knownFiles)
                knownFiles = latestFiles

                for fileURL in newFiles {
                    onNewFile(fileURL, rule.id)
                }
            }

            source.setCancelHandler {
                close(descriptor)
            }

            watchers[rule.id] = Watcher(descriptor: descriptor, source: source, knownFiles: knownFiles)
            source.resume()
        }
    }

    func stop() {
        watchers.values.forEach { $0.source.cancel() }
        watchers.removeAll()
    }

    private func currentFiles(in folderURL: URL) -> Set<URL> {
        guard let urls = try? FileManager.default.contentsOfDirectory(
            at: folderURL,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else {
            return []
        }

        return Set(urls.filter { url in
            let values = try? url.resourceValues(forKeys: [.isRegularFileKey])
            return values?.isRegularFile == true
        })
    }
}
