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
    dependencies: [
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.7.0")
    ],
    targets: [
        .executableTarget(
            name: "zipax",
            dependencies: [
                .product(name: "Sparkle", package: "Sparkle")
            ],
            path: "Sources/zipax"
        )
    ]
)
