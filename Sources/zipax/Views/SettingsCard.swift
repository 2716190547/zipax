import SwiftUI

struct SettingsCard<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(SettingsPalette.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .overlay {
                RoundedRectangle(cornerRadius: 14)
                    .stroke(SettingsPalette.cardStroke, lineWidth: 0.7)
            }
            .shadow(color: Color.primary.opacity(0.05), radius: 10, x: 0, y: 4)
    }
}

struct SettingTitle: View {
    let icon: String
    let title: String
    var info: String?

    var body: some View {
        HStack(spacing: 9) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(.secondary)
                .frame(width: 18)

            Text(title)
                .font(.system(size: 15, weight: .semibold))

            if let info {
                SettingInfoButton(text: info)
            }
        }
    }
}

private struct SettingInfoButton: View {
    @State private var isPresented = false
    let text: String

    var body: some View {
        Button {
            isPresented.toggle()
        } label: {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.secondary)
        }
        .buttonStyle(.plain)
        .help(text)
        .popover(isPresented: $isPresented, arrowEdge: .top) {
            Text(text)
                .font(.system(size: 12))
                .foregroundStyle(.secondary)
                .padding(12)
                .frame(width: 210, alignment: .leading)
        }
    }
}
