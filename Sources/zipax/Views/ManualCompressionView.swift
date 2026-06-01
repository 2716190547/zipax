import AppKit
import SwiftUI
import UniformTypeIdentifiers

struct ManualCompressionView: View {
    @EnvironmentObject private var store: AppStore
    @State private var items: [ManualCompressionItem] = []
    @State private var isDropTargeted = false
    @State private var isConfigurationPresented = false
    @State private var compressionMode: CompressionMode = .balanced
    @State private var outputFormat: OutputFormat = .original
    @State private var qualityLevel: QualityLevel = .level3
    @State private var targetSizeKB: Int? = 500
    @State private var preserveMetadata = false
    @State private var resize = ResizeSettings.disabled

    private let imageService = ImageCompressionService()

    var body: some View {
        VStack(spacing: 10) {
            dropZone

            if !items.isEmpty {
                itemList
                actionBar
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var dropZone: some View {
        SettingsCard {
            ZStack(alignment: .topTrailing) {
                VStack(spacing: 9) {
                    Image(systemName: "photo.badge.plus")
                        .font(.system(size: 31, weight: .regular))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(isDropTargeted ? Color.accentColor : Color.secondary)

                    VStack(spacing: 3) {
                        Text("拖入图片")
                            .font(.system(size: 16, weight: .semibold))
                        Text("也可以粘贴或选择图片")
                            .font(.system(size: 12))
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 18)
                .frame(maxWidth: .infinity)

                HStack(spacing: 6) {
                    Button {
                        isConfigurationPresented = true
                    } label: {
                        Image(systemName: "slider.horizontal.3")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .buttonStyle(.borderless)
                    .controlSize(.small)
                    .help("配置")
                    .popover(isPresented: $isConfigurationPresented, attachmentAnchor: .point(.top), arrowEdge: .bottom) {
                        ManualCompressionEditorView(
                            compressionMode: modeBinding,
                            outputFormat: $outputFormat,
                            qualityLevel: $qualityLevel,
                            targetSizeKB: $targetSizeKB,
                            preserveMetadata: $preserveMetadata,
                            resize: $resize
                        )
                    }

                    Button {
                        pasteImages()
                    } label: {
                        Image(systemName: "doc.on.clipboard")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .buttonStyle(.borderless)
                    .controlSize(.small)
                    .help("粘贴")

                    Button {
                        selectImages()
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .buttonStyle(.borderless)
                    .controlSize(.small)
                    .help("选择图片")
                }
            }
        }
        .overlay {
            RoundedRectangle(cornerRadius: 14)
                .stroke(isDropTargeted ? Color.accentColor.opacity(0.75) : .clear, lineWidth: 1.5)
        }
        .onDrop(of: [UTType.fileURL.identifier], isTargeted: $isDropTargeted) { providers in
            handleDrop(providers)
            return true
        }
    }

    private var itemList: some View {
        SettingsCard {
            VStack(spacing: 8) {
                ForEach(items) { item in
                    ManualCompressionRow(item: item) {
                        save(item)
                    } remove: {
                        remove(item)
                    }
                }
            }
        }
    }

    private var actionBar: some View {
        HStack(spacing: 8) {
            Button {
                items.removeAll()
            } label: {
                Label("清空", systemImage: "trash")
            }
            .controlSize(.small)

            Spacer()

            Button {
                saveAll()
            } label: {
                Label("全部保存", systemImage: "square.and.arrow.down")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
            .disabled(items.allSatisfy { !$0.isFinished })
        }
    }

    private var modeBinding: Binding<CompressionMode> {
        Binding {
            compressionMode
        } set: { mode in
            compressionMode = mode
            switch mode {
            case .qualityFirst:
                qualityLevel = .level1
            case .balanced:
                qualityLevel = .level3
            case .sizeFirst:
                qualityLevel = .level6
            case .advanced:
                isConfigurationPresented = true
            case .targetSize:
                if targetSizeKB == nil {
                    targetSizeKB = 500
                }
                isConfigurationPresented = true
            }
        }
    }

    private var currentRule: FolderRule {
        var rule = FolderRule(folderURL: FileManager.default.temporaryDirectory)
        rule.overwriteOriginal = false
        rule.compressionMode = compressionMode
        rule.outputFormat = outputFormat
        rule.settings = CompressionSettings(level: qualityLevel, targetSizeKB: targetSizeKB)
        rule.preserveMetadata = preserveMetadata
        rule.resize = resize
        return rule
    }

    private func selectImages() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = true
        panel.allowedContentTypes = [.image, .pdf]
        panel.prompt = "选择"

        guard panel.runModal() == .OK else { return }
        add(panel.urls)
    }

    private func pasteImages() {
        let pasteboard = NSPasteboard.general
        if let urls = pasteboard.readObjects(
            forClasses: [NSURL.self],
            options: [.urlReadingFileURLsOnly: true]
        ) as? [URL], !urls.isEmpty {
            add(urls)
            return
        }

        guard let data = pasteboard.data(forType: .tiff),
              let representation = NSBitmapImageRep(data: data),
              let pngData = representation.representation(using: .png, properties: [:]) else {
            return
        }

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("粘贴图片-\(UUID().uuidString)")
            .appendingPathExtension("png")
        try? pngData.write(to: url)
        add([url])
    }

    private func handleDrop(_ providers: [NSItemProvider]) {
        loadFileURLs(from: providers)
    }

    private func loadFileURLs(from providers: [NSItemProvider]) {
        for provider in providers where provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
            provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, _ in
                let url: URL?
                if let itemURL = item as? URL {
                    url = itemURL
                } else if let data = item as? Data,
                          let string = String(data: data, encoding: .utf8) {
                    url = URL(string: string)
                } else {
                    url = nil
                }

                guard let url else { return }
                Task { @MainActor in
                    add([url])
                }
            }
        }
    }

    private func temporaryPastedImageURL(from data: Data) -> URL? {
        guard let image = NSImage(data: data),
              let tiffData = image.tiffRepresentation,
              let representation = NSBitmapImageRep(data: tiffData),
              let pngData = representation.representation(using: .png, properties: [:]) else {
            return nil
        }

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("粘贴图片-\(UUID().uuidString)")
            .appendingPathExtension("png")
        do {
            try pngData.write(to: url)
            return url
        } catch {
            return nil
        }
    }

    private func add(_ urls: [URL]) {
        for url in urls {
            guard let kind = ImageTypeResolver.kind(for: url), kind != .gif else { continue }
            guard !store.shouldSkip(url) else { continue }
            let item = ManualCompressionItem(sourceURL: url, kind: kind)
            items.insert(item, at: 0)
            compress(item)
        }
    }

    private func compress(_ item: ManualCompressionItem) {
        update(item.id) { $0.status = .compressing }

        let rule = currentRule
        let service = imageService
        Task {
            do {
                let result = try await Task.detached(priority: .userInitiated) {
                    try service.compressToTemporary(url: item.sourceURL, rule: rule, kind: item.kind)
                }.value
                update(item.id) {
                    $0.result = result
                    $0.status = .finished
                }
                store.recordManualCompression(result)
            } catch {
                update(item.id) {
                    $0.status = .failed(error.localizedDescription)
                }
            }
        }
    }

    private func save(_ item: ManualCompressionItem) {
        guard let result = item.result else { return }

        let panel = NSSavePanel()
        panel.nameFieldStringValue = outputFileName(for: item)
        panel.canCreateDirectories = true
        guard panel.runModal() == .OK, let destination = panel.url else { return }
        replaceCopy(from: result.outputURL, to: destination)
    }

    private func saveAll() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.canCreateDirectories = true
        panel.prompt = "保存"

        guard panel.runModal() == .OK, let directory = panel.url else { return }
        for item in items where item.isFinished {
            guard let result = item.result else { continue }
            let destination = availableDestinationURL(for: item, in: directory)
            replaceCopy(from: result.outputURL, to: destination)
        }
    }

    private func replaceCopy(from source: URL, to destination: URL) {
        do {
            if FileManager.default.fileExists(atPath: destination.path) {
                try FileManager.default.removeItem(at: destination)
            }
            try FileManager.default.copyItem(at: source, to: destination)
        } catch {
            NSSound.beep()
        }
    }

    private func remove(_ item: ManualCompressionItem) {
        if let result = item.result {
            try? FileManager.default.removeItem(at: result.outputURL)
        }
        items.removeAll { $0.id == item.id }
    }

    private func update(_ id: UUID, mutate: (inout ManualCompressionItem) -> Void) {
        guard let index = items.firstIndex(where: { $0.id == id }) else { return }
        mutate(&items[index])
    }

    private func outputFileName(for item: ManualCompressionItem) -> String {
        let outputExtension = item.result?.outputURL.pathExtension ?? item.sourceURL.pathExtension
        return "\(item.sourceURL.deletingPathExtension().lastPathComponent)#C.\(outputExtension)"
    }

    private func availableDestinationURL(for item: ManualCompressionItem, in directory: URL) -> URL {
        let outputExtension = item.result?.outputURL.pathExtension ?? item.sourceURL.pathExtension
        let baseName = item.sourceURL.deletingPathExtension().lastPathComponent
        let first = directory.appendingPathComponent("\(baseName)#C").appendingPathExtension(outputExtension)
        guard FileManager.default.fileExists(atPath: first.path) else { return first }

        var index = 2
        while true {
            let candidate = directory.appendingPathComponent("\(baseName)#C-\(index)").appendingPathExtension(outputExtension)
            if !FileManager.default.fileExists(atPath: candidate.path) {
                return candidate
            }
            index += 1
        }
    }
}

private struct ManualCompressionItem: Identifiable {
    let id = UUID()
    var sourceURL: URL
    var kind: ImageKind
    var status: ManualCompressionStatus = .waiting
    var result: CompressionResult?

    var isFinished: Bool {
        if case .finished = status { return true }
        return false
    }
}

private enum ManualCompressionStatus: Equatable {
    case waiting
    case compressing
    case finished
    case failed(String)
}

private struct ManualCompressionEditorView: View {
    @Binding var compressionMode: CompressionMode
    @Binding var outputFormat: OutputFormat
    @Binding var qualityLevel: QualityLevel
    @Binding var targetSizeKB: Int?
    @Binding var preserveMetadata: Bool
    @Binding var resize: ResizeSettings

    var body: some View {
        VStack(spacing: 16) {
            EditorCard(icon: "slider.horizontal.3", title: "压缩") {
                Picker("模式", selection: $compressionMode) {
                    ForEach(CompressionMode.allCases) { mode in
                        Text(mode.title).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()

                ManualQualitySlider(selection: $qualityLevel)
                    .disabled(compressionMode != .advanced)
                    .opacity(compressionMode == .advanced ? 1 : 0.55)

                HStack(spacing: 8) {
                    Text("目标")
                    ManualNumberField(value: $targetSizeKB)
                    Text("KB")
                        .foregroundStyle(.secondary)
                }
                .disabled(compressionMode != .targetSize)
                .opacity(compressionMode == .targetSize ? 1 : 0.45)
            }

            EditorCard(icon: "square.and.arrow.down", title: "输出", accessory: {
                Picker("输出格式", selection: $outputFormat) {
                    ForEach(OutputFormat.allCases) { format in
                        Text(format.title).tag(format)
                    }
                }
                .labelsHidden()
                .frame(width: 118)
            }) {
                Toggle("保留元数据", isOn: $preserveMetadata)
                    .toggleStyle(.checkbox)
            }

            EditorCard(icon: "crop", title: "调整尺寸") {
                Toggle("限制尺寸", isOn: $resize.isEnabled)
                    .toggleStyle(.checkbox)

                HStack(spacing: 8) {
                    Text("宽度")
                    ManualNumberField(value: $resize.maxWidth)
                    Text("×")
                        .foregroundStyle(.secondary)
                    Text("高度")
                    ManualNumberField(value: $resize.maxHeight)
                }
                .disabled(!resize.isEnabled)
                .opacity(resize.isEnabled ? 1 : 0.45)
            }
        }
        .padding(16)
        .frame(width: 430)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 22))
        .onChange(of: compressionMode) { _, mode in
            switch mode {
            case .qualityFirst:
                qualityLevel = .level1
            case .balanced:
                qualityLevel = .level3
            case .sizeFirst:
                qualityLevel = .level6
            case .advanced:
                break
            case .targetSize:
                if targetSizeKB == nil {
                    targetSizeKB = 500
                }
            }
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

private struct ManualCompressionRow: View {
    let item: ManualCompressionItem
    let save: () -> Void
    let remove: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            statusIcon
                .frame(width: 20)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.sourceURL.lastPathComponent)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)

                Text(detailText)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            if item.isFinished {
                Button {
                    save()
                } label: {
                    Image(systemName: "square.and.arrow.down")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .help("保存")
            }

            Button {
                remove()
            } label: {
                Image(systemName: "xmark")
            }
            .buttonStyle(.plain)
            .foregroundStyle(.secondary)
            .help("移除")
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var statusIcon: some View {
        switch item.status {
        case .waiting:
            Image(systemName: "clock")
                .foregroundStyle(.secondary)
        case .compressing:
            ProgressView()
                .scaleEffect(0.55)
        case .finished:
            Image(systemName: item.savedBytes >= 0 ? "checkmark.circle.fill" : "exclamationmark.circle")
                .foregroundStyle(item.savedBytes >= 0 ? Color.green : Color.orange)
        case .failed:
            Image(systemName: "xmark.circle.fill")
                .foregroundStyle(.red)
        }
    }

    private var detailText: String {
        switch item.status {
        case .waiting:
            return "等待压缩"
        case .compressing:
            return "正在压缩"
        case .finished:
            guard let result = item.result else { return "已完成" }
            let original = AppFileSizeFormatter.string(from: result.originalBytes)
            let compressed = AppFileSizeFormatter.string(from: result.compressedBytes)
            let saved = AppFileSizeFormatter.string(from: abs(result.savedBytes))
            return result.savedBytes >= 0
                ? "\(original) → \(compressed)，节省 \(saved)\(result.reachedTargetSize ? "" : "，未达目标")"
                : "\(original) → \(compressed)，体积增加 \(saved)"
        case .failed(let message):
            return message
        }
    }
}

private extension ManualCompressionItem {
    var savedBytes: Int64 {
        result?.savedBytes ?? 0
    }
}

private struct ManualQualitySlider: View {
    @Binding var selection: QualityLevel

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text("压缩等级")
                Spacer()
                Text(selection.title)
                    .font(.system(size: 13, weight: .semibold))
                    .monospacedDigit()
            }

            Slider(value: levelValue, in: 1...6, step: 1)

            HStack {
                Text("质量最好")
                Spacer()
                Text("质量最差")
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

private struct ManualNumberField: View {
    @Binding var value: Int?

    var body: some View {
        TextField("0", value: $value, format: .number)
            .textFieldStyle(.roundedBorder)
            .frame(width: 64)
    }
}
