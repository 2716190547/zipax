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
    var body: some View {
        VStack(spacing: 10) {
            SettingsCard {
                VStack(alignment: .leading, spacing: 10) {
                    SettingTitle(
                        icon: "shippingbox",
                        title: "外部依赖地址",
                        info: "zipax 会优先使用 App 内置依赖。"
                    )

                    DependencyPathRow(path: toolsPath)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var toolsPath: String {
        Bundle.main.resourceURL?
            .appendingPathComponent("Tools", isDirectory: true)
            .path ?? "zipax.app/Contents/Resources/Tools"
    }
}

struct AboutView: View {
    @State private var showsSupportSheet = false

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

                HStack(spacing: 8) {
                    Button {
                        openURL("https://github.com/2716190547/zipax")
                    } label: {
                        Label("GitHub 仓库", systemImage: "chevron.left.forwardslash.chevron.right")
                    }

                    Button {
                        showsSupportSheet = true
                    } label: {
                        Label("请我喝一杯", systemImage: "cup.and.saucer")
                    }
                }
                .controlSize(.small)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
        }
        .sheet(isPresented: $showsSupportSheet) {
            SupportSheetView()
        }
    }

    private func openURL(_ string: String) {
        guard let url = URL(string: string) else { return }
        NSWorkspace.shared.open(url)
    }
}

private struct SupportSheetView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 14) {
            HStack(spacing: 10) {
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .frame(width: 42, height: 42)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text("请我喝一杯")
                        .font(.system(size: 16, weight: .semibold))
                    Text("如果 zipax 让图片轻了一点，也欢迎让作者精神重一点。")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 12) {
                SupportQRCodeView(title: "支付宝", imageName: "alipay")
                SupportQRCodeView(title: "微信", imageName: "wechat")
            }

            Button("谢谢你") {
                dismiss()
            }
            .keyboardShortcut(.defaultAction)
            .controlSize(.small)
        }
        .padding(18)
        .frame(width: 430)
        .background(SettingsPalette.contentBackground)
    }
}

private struct SupportQRCodeView: View {
    let title: String
    let imageName: String

    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))

            if let image = supportImage {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 180, height: 220)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            } else {
                Image(systemName: "qrcode")
                    .font(.system(size: 46, weight: .light))
                    .foregroundStyle(.secondary)
                    .frame(width: 180, height: 220)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity)
        .background(SettingsPalette.subtleFill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var supportImage: NSImage? {
        guard let url = Bundle.main.url(
            forResource: imageName,
            withExtension: "png",
            subdirectory: "Support"
        ) else {
            return nil
        }

        return NSImage(contentsOf: url)
    }
}

private struct DependencyPathRow: View {
    let path: String

    var body: some View {
        Text(path)
            .font(.system(size: 11, design: .monospaced))
            .foregroundStyle(.secondary)
            .lineLimit(2)
            .textSelection(.enabled)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(SettingsPalette.subtleFill, in: RoundedRectangle(cornerRadius: 10))
    }
}
