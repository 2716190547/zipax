import SwiftUI

enum SettingsPalette {
    static let edgeSpacing: CGFloat = 18
    static let tabItemWidth: CGFloat = 58
    static let tabSpacing: CGFloat = 10
    static let tabCount: CGFloat = 6
    static let windowWidth = (tabItemWidth * tabCount) + (tabSpacing * (tabCount - 1)) + (edgeSpacing * 2)

    static var topBackground: Color { Color(nsColor: .windowBackgroundColor) }
    static var contentBackground: Color { Color(nsColor: .windowBackgroundColor) }
    static var cardBackground: Color { Color(nsColor: .controlBackgroundColor) }
    static var cardStroke: Color { Color.primary.opacity(0.10) }
    static var subtleFill: Color { Color.primary.opacity(0.045) }
}
