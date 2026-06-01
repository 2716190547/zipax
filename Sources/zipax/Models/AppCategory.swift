import Foundation

enum AppCategory: String, CaseIterable, Identifiable {
    case image = "图像"
    case general = "通用"
    case workflow = "工作流"
    case automation = "自动化"
    case dependencies = "依赖"
    case license = "许可"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .image: "photo.on.rectangle.angled"
        case .general: "gearshape"
        case .workflow: "rectangle.split.2x2"
        case .automation: "square.stack.3d.down.right"
        case .dependencies: "shippingbox"
        case .license: "viewfinder"
        }
    }

}
