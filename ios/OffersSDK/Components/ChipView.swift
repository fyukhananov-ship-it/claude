import SwiftUI

struct ChipView: View {
    let icon: String?
    let text: String
    var style: ChipStyle = .primary

    init(icon: String? = nil, text: String, style: ChipStyle = .primary) {
        self.icon = icon
        self.text = text
        self.style = style
    }

    enum ChipStyle {
        case primary
        case secondary
        case accent
        case success
        case warning
        case error

        var backgroundColor: Color {
            switch self {
            case .primary: return .accentColor.opacity(0.12)
            case .secondary: return Color(.systemGray5)
            case .accent: return .accentColor
            case .success: return .green.opacity(0.12)
            case .warning: return .orange.opacity(0.12)
            case .error: return .red.opacity(0.12)
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary: return .accentColor
            case .secondary: return .secondary
            case .accent: return .white
            case .success: return .green
            case .warning: return .orange
            case .error: return .red
            }
        }
    }

    var body: some View {
        HStack(spacing: 4) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.caption2)
            }
            Text(text)
                .font(.caption)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(style.backgroundColor)
        )
        .foregroundStyle(style.foregroundColor)
    }
}

// MARK: - Selectable Chip

struct SelectableChip: View {
    let text: String
    let isSelected: Bool
    var icon: String? = nil
    var onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 4) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(text)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(isSelected ? Color.accentColor : Color(.systemGray6))
            )
            .foregroundStyle(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack(spacing: 16) {
        HStack {
            ChipView(icon: "arrow.left.arrow.right", text: "СБП", style: .primary)
            ChipView(icon: "rublesign", text: "от 1000₽", style: .secondary)
            ChipView(icon: "number", text: "×3", style: .secondary)
        }

        HStack {
            ChipView(text: "Кэшбэк", style: .success)
            ChipView(text: "Истекает", style: .warning)
            ChipView(text: "Отклонено", style: .error)
        }

        HStack {
            SelectableChip(text: "Все", isSelected: true) {}
            SelectableChip(text: "СБП", isSelected: false, icon: "arrow.left.arrow.right") {}
            SelectableChip(text: "Карта", isSelected: false, icon: "creditcard.fill") {}
        }
    }
    .padding()
}
