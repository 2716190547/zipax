// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "zipax",
    platforms: [
        .macOS(.v26)
    ],
    products: [
        .executable(name: "zipax", targets: ["zipax"])
    ],
    targets: [
        .executableTarget(
            name: "zipax",
            path: "Sources/zipax"
        )
    ]
)
