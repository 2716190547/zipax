import SwiftUI

struct FolderRuleRowView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isEditing = false
    @State private var showsInfo = false

    let rule: FolderRule

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "folder")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.secondary)
                .frame(width: 18)

            Text(rule.folderURL.path)
                .font(.system(size: 13, weight: .medium))
                .lineLimit(1)
                .truncationMode(.middle)

            Button {
                showsInfo = true
            } label: {
                Image(systemName: "exclamationmark.circle")
                    .font(.system(size: 12, weight: .semibold))
            }
            .buttonStyle(.borderless)
            .foregroundStyle(.secondary)
            .help(lastProcessedText)
            .popover(isPresented: $showsInfo, attachmentAnchor: .point(.top), arrowEdge: .bottom) {
                Text(lastProcessedText)
                    .font(.system(size: 13))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
            }

            Spacer()

            Button {
                isEditing = true
            } label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 13, weight: .medium))
            }
            .buttonStyle(.borderless)
            .controlSize(.small)
            .help("配置")
            .popover(isPresented: $isEditing, attachmentAnchor: .point(.top), arrowEdge: .bottom) {
                FolderRuleEditorView(rule: rule)
                    .environmentObject(store)
            }

            Toggle("", isOn: Binding(
                get: { rule.isEnabled },
                set: { enabled in
                    var updated = rule
                    updated.isEnabled = enabled
                    store.updateFolderRule(updated)
                }
            ))
            .toggleStyle(.switch)
            .controlSize(.small)
            .scaleEffect(0.76)
            .frame(width: 38, height: 20)
            .labelsHidden()

            Button(role: .destructive) {
                store.removeFolderRule(rule)
            } label: {
                Image(systemName: "minus.circle.fill")
                    .font(.system(size: 13, weight: .medium))
            }
            .buttonStyle(.borderless)
            .foregroundStyle(.secondary)
            .help("删除")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
        .overlay {
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.primary.opacity(0.07), lineWidth: 0.7)
        }
    }

    private var lastProcessedText: String {
        guard let lastProcessedAt = rule.lastProcessedAt else {
            return "尚未处理"
        }

        return "最近处理：\(lastProcessedAt.formatted(date: .abbreviated, time: .shortened))"
    }
}
