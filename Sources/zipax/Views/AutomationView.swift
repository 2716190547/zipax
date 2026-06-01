import SwiftUI

struct AutomationView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(spacing: 10) {
            SettingsCard {
                HStack(spacing: 12) {
                    SettingTitle(icon: "slider.horizontal.3", title: "自动压缩 · 已压缩 \(store.savedSizeText)")

                    Spacer()

                    Toggle("", isOn: Binding(
                        get: { store.globalState == .running },
                        set: { _ in store.toggleGlobalState() }
                    ))
                    .toggleStyle(.switch)
                    .labelsHidden()
                }
            }

            SettingsCard {
                VStack(spacing: 10) {
                    HStack {
                        SettingTitle(
                            icon: "folder.badge.gearshape",
                            title: "文件夹自动压缩",
                            info: "只处理加入文件夹后的新图片。"
                        )

                        Spacer()

                        Button {
                            store.addFolder()
                        } label: {
                            Image(systemName: "plus")
                        }
                        .buttonStyle(.bordered)
                        .help("添加文件夹")
                    }

                    if store.folderRules.isEmpty {
                        CompactEmptyFolderView()
                    } else {
                        VStack(spacing: 8) {
                            ForEach(store.folderRules) { rule in
                                FolderRuleRowView(rule: rule)
                            }
                        }
                    }
                }
            }

            if !store.errorRecords.isEmpty {
                SettingsCard {
                    VStack(alignment: .leading, spacing: 8) {
                        SettingTitle(icon: "exclamationmark.triangle", title: "最近错误")

                        ForEach(store.errorRecords.prefix(5)) { record in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(record.fileName)
                                    .font(.system(size: 13, weight: .medium))
                                    .lineLimit(1)
                                Text(record.reason)
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

private struct CompactEmptyFolderView: View {
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: "folder")
                .font(.system(size: 21, weight: .regular))
                .foregroundStyle(.tertiary)

            Text("还没有文件夹")
                .font(.system(size: 13))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
    }
}
