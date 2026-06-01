import SwiftUI

struct MainWindowView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(spacing: 0) {
            Text(store.selectedCategory.rawValue)
                .font(.system(size: 18, weight: .semibold))
                .padding(.top, 8)
                .padding(.bottom, 7)

            CategoryBarView(selection: $store.selectedCategory)
                .padding(.horizontal, SettingsPalette.edgeSpacing)
                .padding(.bottom, 8)
                .background(SettingsPalette.topBackground)

            Divider()

            Group {
                switch store.selectedCategory {
                case .image:
                    ManualCompressionView()
                case .general:
                    GeneralView()
                case .automation:
                    AutomationView()
                case .workflow:
                    WorkflowView()
                case .dependencies:
                    DependenciesView()
                case .license:
                    LicenseEasterEggView()
                }
            }
            .padding(SettingsPalette.edgeSpacing)
            .frame(width: SettingsPalette.windowWidth)
            .fixedSize(horizontal: false, vertical: true)
            .background(SettingsPalette.contentBackground)
        }
        .frame(width: SettingsPalette.windowWidth)
        .fixedSize(horizontal: false, vertical: true)
        .background(SettingsPalette.topBackground)
    }
}
