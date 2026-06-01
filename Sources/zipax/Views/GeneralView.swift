import SwiftUI

struct GeneralView: View {
    @EnvironmentObject private var store: AppStore
    @EnvironmentObject private var updater: SparkleUpdater
    @State private var showResetConfirmation = false

    var body: some View {
        VStack(spacing: 10) {
            SettingsCard {
                HStack {
                    SettingTitle(
                        icon: "power",
                        title: "开机自启",
                        info: "登录 macOS 后自动启动 zipax。"
                    )

                    Spacer()

                    Toggle("", isOn: Binding(
                        get: { store.launchAtLogin },
                        set: { store.setLaunchAtLogin($0) }
                    ))
                    .toggleStyle(.switch)
                    .labelsHidden()
                }
            }

            SettingsCard {
                HStack {
                    SettingTitle(icon: "circle.lefthalf.filled", title: "外观")

                    Spacer()

                    Picker("外观", selection: Binding(
                        get: { store.appearanceMode },
                        set: { store.setAppearanceMode($0) }
                    )) {
                        ForEach(AppearanceMode.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .labelsHidden()
                    .pickerStyle(.menu)
                    .controlSize(.small)
                    .fixedSize()
                }
            }

            SettingsCard {
                HStack {
                    SettingTitle(
                        icon: "arrow.triangle.2.circlepath",
                        title: "自动更新",
                        info: "发现新版本后由 Sparkle 下载并安装。"
                    )

                    Spacer()

                    Toggle("", isOn: Binding(
                        get: { updater.automaticallyChecksForUpdates },
                        set: { updater.automaticallyChecksForUpdates = $0 }
                    ))
                    .toggleStyle(.switch)
                    .labelsHidden()

                    Button("检查更新") {
                        updater.checkForUpdates()
                    }
                    .controlSize(.small)
                }
            }

            SettingsCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        SettingTitle(icon: "chart.bar", title: "统计")

                        Spacer()

                        Menu {
                            Button("清零统计", role: .destructive) {
                                showResetConfirmation = true
                            }
                        } label: {
                            Image(systemName: "ellipsis")
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .buttonStyle(.borderless)
                        .foregroundStyle(.secondary)
                        .help("更多")
                    }

                    HStack(spacing: 10) {
                        StatisticMetricView(
                            title: "压缩数量",
                            value: store.compressedCountText,
                            unit: "张"
                        )

                        StatisticMetricView(
                            title: "节省大小",
                            value: store.savedSizeText,
                            unit: nil
                        )
                    }
                }
            }
        }
        .frame(maxWidth: .infinity)
        .confirmationDialog("清零已压缩大小？", isPresented: $showResetConfirmation) {
            Button("清零", role: .destructive) {
                store.clearStatistics()
            }
            Button("取消", role: .cancel) {}
        }
    }

}

private struct StatisticMetricView: View {
    let title: String
    let value: String
    let unit: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.secondary)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(value)
                    .font(.system(size: 22, weight: .semibold))
                    .monospacedDigit()

                if let unit {
                    Text(unit)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(SettingsPalette.subtleFill, in: RoundedRectangle(cornerRadius: 10))
    }
}
