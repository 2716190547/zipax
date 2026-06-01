import Foundation

struct CompressionResult: Sendable {
    var sourceURL: URL
    var outputURL: URL
    var originalBytes: Int64
    var compressedBytes: Int64
    var targetBytes: Int64?

    var savedBytes: Int64 {
        originalBytes - compressedBytes
    }

    var reachedTargetSize: Bool {
        guard let targetBytes else { return true }
        return compressedBytes <= targetBytes
    }
}

actor CompressionQueue {
    private let imageService: ImageCompressionService

    init(imageService: ImageCompressionService) {
        self.imageService = imageService
    }

    func enqueue(url: URL, rule: FolderRule, kind: ImageKind) async throws -> CompressionResult {
        try imageService.compress(url: url, rule: rule, kind: kind)
    }
}
