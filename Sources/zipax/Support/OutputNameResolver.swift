import Foundation

enum OutputNameResolver {
    static func isCompressedURL(_ url: URL) -> Bool {
        let baseName = url.deletingPathExtension().lastPathComponent
        if baseName.hasSuffix("#C") {
            return true
        }

        guard let markerRange = baseName.range(of: "#C-", options: .backwards) else {
            return false
        }

        let suffix = baseName[markerRange.upperBound...]
        return !suffix.isEmpty && suffix.allSatisfy(\.isNumber)
    }

    static func compressedURL(
        for sourceURL: URL,
        pathExtension: String? = nil,
        fileManager: FileManager = .default
    ) -> URL {
        let directory = sourceURL.deletingLastPathComponent()
        let baseName = sourceURL.deletingPathExtension().lastPathComponent
        let outputExtension = pathExtension ?? sourceURL.pathExtension

        let first = directory
            .appendingPathComponent("\(baseName)#C")
            .appendingPathExtension(outputExtension)

        guard fileManager.fileExists(atPath: first.path) else {
            return first
        }

        var index = 2
        while true {
            let candidate = directory
                .appendingPathComponent("\(baseName)#C-\(index)")
                .appendingPathExtension(outputExtension)
            if !fileManager.fileExists(atPath: candidate.path) {
                return candidate
            }
            index += 1
        }
    }
}
