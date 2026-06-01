import SwiftUI

struct WorkflowView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(spacing: 10) {
            SettingsCard {
                HStack {
                    SettingTitle(
                        icon: "doc.on.clipboard",
                        title: "压缩后自动复制",
                        info: "压缩完成后，把结果文件放入系统剪贴板。"
                    )

                    Spacer()

                    Toggle("", isOn: Binding(
                        get: { store.autoCopyAfterCompression },
                        set: { store.setAutoCopyAfterCompression($0) }
                    ))
                    .toggleStyle(.switch)
                    .labelsHidden()
                }
            }

            SettingsCard {
                HStack {
                    SettingTitle(
                        icon: "checkmark.seal",
                        title: "跳过已压缩文件",
                        info: "文件名以 #C 或 #C-数字 结尾时，不再重复压缩。"
                    )

                    Spacer()

                    Toggle("", isOn: Binding(
                        get: { store.skipCompressedFiles },
                        set: { store.setSkipCompressedFiles($0) }
                    ))
                    .toggleStyle(.switch)
                    .labelsHidden()
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct DependenciesView: View {
    private let tools = [
        CompressionTool(
            name: "pngquant",
            purpose: "PNG 压缩",
            executableNames: ["pngquant"],
            candidatePaths: ["/opt/homebrew/bin/pngquant", "/usr/local/bin/pngquant"],
            installCommand: "brew install pngquant"
        ),
        CompressionTool(
            name: "cwebp",
            purpose: "WebP 输出",
            executableNames: ["cwebp"],
            candidatePaths: ["/opt/homebrew/bin/cwebp", "/usr/local/bin/cwebp"],
            installCommand: "brew install webp"
        ),
        CompressionTool(
            name: "Ghostscript",
            purpose: "PDF 压缩",
            executableNames: ["gs"],
            candidatePaths: ["/opt/homebrew/bin/gs", "/usr/local/bin/gs", "/usr/bin/gs"],
            installCommand: "brew install ghostscript"
        )
    ]

    var body: some View {
        VStack(spacing: 10) {
            SettingsCard {
                VStack(alignment: .leading, spacing: 10) {
                    SettingTitle(
                        icon: "shippingbox",
                        title: "外部工具",
                        info: "zipax 会优先使用轻量命令行工具处理 PNG 和 WebP。"
                    )

                    Text("推荐用 Homebrew；也可用 MacPorts、官方安装包、随 App 打包，或手动放入 PATH。")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)

                    ForEach(tools) { tool in
                        DependencyToolRow(tool: tool)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct LicenseEasterEggView: View {
    var body: some View {
        SettingsCard {
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    Image(systemName: "leaf")
                        .font(.system(size: 28, weight: .light))
                        .rotationEffect(.degrees(-24))
                        .foregroundStyle(.secondary)

                    Image(nsImage: NSApp.applicationIconImage)
                        .resizable()
                        .frame(width: 72, height: 72)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .shadow(color: .black.opacity(0.12), radius: 10, y: 4)

                    Image(systemName: "leaf")
                        .font(.system(size: 28, weight: .light))
                        .rotationEffect(.degrees(24))
                        .scaleEffect(x: -1, y: 1)
                        .foregroundStyle(.secondary)
                }

                Text("感谢你的支持")
                    .font(.system(size: 18, weight: .semibold))

                Text("愿每一张图片都轻一点，清晰一点。")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
        }
    }
}

private struct CompressionTool: Identifiable {
    let name: String
    let purpose: String
    let executableNames: [String]
    let candidatePaths: [String]
    let installCommand: String

    var id: String { name }

    var installedPath: String? {
        for path in candidatePaths where FileManager.default.isExecutableFile(atPath: path) {
            return path
        }

        let pathEntries = (ProcessInfo.processInfo.environment["PATH"] ?? "")
            .split(separator: ":")
            .map(String.init)

        for directory in pathEntries {
            for executableName in executableNames {
                let path = URL(fileURLWithPath: directory)
                    .appendingPathComponent(executableName)
                    .path
                if FileManager.default.isExecutableFile(atPath: path) {
                    return path
                }
            }
        }

        return nil
    }
}

private struct DependencyToolRow: View {
    let tool: CompressionTool

    var body: some View {
        let installedPath = tool.installedPath

        HStack(spacing: 10) {
            Image(systemName: installedPath == nil ? "exclamationmark.circle" : "checkmark.circle.fill")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(installedPath == nil ? Color.orange : Color.green)
                .frame(width: 18)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(tool.name)
                        .font(.system(size: 13, weight: .semibold))
                    Text(tool.purpose)
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }

                Text(installedPath ?? tool.installCommand)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }

            Spacer()
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(SettingsPalette.subtleFill, in: RoundedRectangle(cornerRadius: 10))
    }
}
