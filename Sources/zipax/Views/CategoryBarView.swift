import SwiftUI

struct CategoryBarView: View {
    @Binding var selection: AppCategory

    var body: some View {
        HStack(spacing: SettingsPalette.tabSpacing) {
            ForEach(AppCategory.allCases) { category in
                Button {
                    selection = category
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: category.systemImage)
                            .font(.system(size: 18, weight: .regular))
                            .symbolRenderingMode(.hierarchical)
                            .symbolVariant(selection == category ? .fill : .none)

                        Text(category.rawValue)
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundStyle(selection == category ? Color.accentColor : Color.secondary)
                    .frame(width: SettingsPalette.tabItemWidth - 4, height: 48)
                    .contentShape(RoundedRectangle(cornerRadius: 12))
                    .background {
                        if selection == category {
                            RoundedRectangle(cornerRadius: 14)
                                .fill(.regularMaterial)
                                .overlay {
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(Color.accentColor.opacity(0.22), lineWidth: 0.7)
                                }
                                .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
                        }
                    }
                }
                .buttonStyle(.plain)
                .frame(width: SettingsPalette.tabItemWidth, height: 52)
                .contentShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }
}
