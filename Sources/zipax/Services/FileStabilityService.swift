import Foundation

enum FileStabilityError: LocalizedError {
    case fileDidNotStabilize

    var errorDescription: String? {
        switch self {
        case .fileDidNotStabilize: "文件仍在写入"
        }
    }
}

struct FileStabilityService {
    func waitUntilStable(_ url: URL, attempts: Int = 5) async throws -> URL {
        try await Task.sleep(for: .seconds(1))

        var lastSize: UInt64?
        for _ in 0..<attempts {
            let size = try fileSize(url)
            if let lastSize, lastSize == size {
                return url
            }
            lastSize = size
            try await Task.sleep(for: .milliseconds(500))
        }

        throw FileStabilityError.fileDidNotStabilize
    }

    private func fileSize(_ url: URL) throws -> UInt64 {
        let values = try url.resourceValues(forKeys: [.fileSizeKey])
        return UInt64(values.fileSize ?? 0)
    }
}
