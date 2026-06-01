import SwiftUI

struct FolderRuleEditorView: View {
    @EnvironmentObject private var store: AppStore
    @State private var draft: FolderRule

    init(rule: FolderRule) {
        _draft = State(initialValue: rule)
    }

    var body: some View {
        VStack(spacing: 16) {
            qualitySection
            outputSection
            resizeSection
        }
        .padding(16)
        .frame(width: 430)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 22))
        .onChange(of: draft.compressionMode) { _, mode in
            switch mode {
            case .qualityFirst:
                draft.settings.level = .level1
            case .balanced:
                draft.settings.level = .level3
            case .sizeFirst:
                draft.settings.level = .level6
            case .advanced:
                break
            case .targetSize:
                if draft.settings.targetSizeKB == nil {
                    draft.settings.targetSizeKB = 500
                }
            }
        }
        .onChange(of: draft) { _, updated in
            store.updateFolderRule(updated)
        }
    }

    private var qualitySection: some View {
        EditorCard(icon: "slider.horizontal.3", title: "压缩") {
            Picker("模式", selection: $draft.compressionMode) {
                ForEach(CompressionMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()

            QualitySlider(selection: $draft.settings.level)
                .disabled(draft.compressionMode != .advanced)
                .opacity(draft.compressionMode == .advanced ? 1 : 0.55)

            HStack(spacing: 8) {
                Text("目标")
                NumberField(value: $draft.settings.targetSizeKB)
                Text("KB")
                    .foregroundStyle(.secondary)
            }
            .disabled(draft.compressionMode != .targetSize)
            .opacity(draft.compressionMode == .targetSize ? 1 : 0.45)
        }
    }

    private var outputSection: some View {
        EditorCard(icon: "square.and.arrow.down", title: "输出", accessory: {
            Picker("输出格式", selection: $draft.outputFormat) {
                ForEach(OutputFormat.allCases) { format in
                    Text(format.title).tag(format)
                }
            }
            .labelsHidden()
            .frame(width: 118)
        }) {
            Toggle("覆盖原图", isOn: $draft.overwriteOriginal)
                .toggleStyle(.checkbox)

            Toggle("保留元数据", isOn: $draft.preserveMetadata)
                .toggleStyle(.checkbox)
        }
    }

    private var resizeSection: some View {
        EditorCard(icon: "crop", title: "调整尺寸") {
            Toggle("限制尺寸", isOn: $draft.resize.isEnabled)
                .toggleStyle(.checkbox)

            HStack(spacing: 8) {
                Text("宽度")
                NumberField(value: $draft.resize.maxWidth)

                Text("×")
                    .foregroundStyle(.secondary)

                Text("高度")
                NumberField(value: $draft.resize.maxHeight)
            }
            .disabled(!draft.resize.isEnabled)
            .opacity(draft.resize.isEnabled ? 1 : 0.45)

            Toggle("允许放大", isOn: $draft.resize.allowUpscale)
                .toggleStyle(.checkbox)
                .disabled(!draft.resize.isEnabled)
                .opacity(draft.resize.isEnabled ? 1 : 0.45)
        }
    }
}

private struct EditorCard<Content: View>: View {
    let icon: String
    let title: String
    var accessory: AnyView?
    @ViewBuilder var content: Content

    init(icon: String, title: String, @ViewBuilder content: () -> Content) {
        self.icon = icon
        self.title = title
        self.accessory = nil
        self.content = content()
    }

    init<Accessory: View>(
        icon: String,
        title: String,
        @ViewBuilder accessory: () -> Accessory,
        @ViewBuilder content: () -> Content
    ) {
        self.icon = icon
        self.title = title
        self.accessory = AnyView(accessory())
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.primary)

                Spacer()

                accessory
            }

            content
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .overlay {
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.primary.opacity(0.08), lineWidth: 0.8)
        }
    }
}

private struct QualitySlider: View {
    @Binding var selection: QualityLevel

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text("质量")
                    .font(.system(size: 13, weight: .medium))
                Spacer()
                Text(selection.title)
                    .font(.system(size: 14, weight: .semibold))
                    .monospacedDigit()
            }

            Slider(value: levelValue, in: 1...6, step: 1)

            HStack {
                Text("质量最佳")
                Spacer()
                Text("体积最小")
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
    }

    private var levelValue: Binding<Double> {
        Binding(
            get: { Double(selection.rawValue) },
            set: { selection = QualityLevel(rawValue: Int($0.rounded())) ?? selection }
        )
    }
}

private struct NumberField: View {
    @Binding var value: Int?

    var body: some View {
        TextField("0", value: $value, format: .number)
            .textFieldStyle(.roundedBorder)
            .frame(width: 72)
    }
}
