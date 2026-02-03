import SwiftUI

struct PrimaryButton: View {
    let title: String
    var icon: String? = nil
    var style: ButtonStyle = .primary
    var isLoading: Bool = false
    var isDisabled: Bool = false
    let action: () -> Void

    enum ButtonStyle {
        case primary
        case secondary
        case success
        case destructive

        var backgroundColor: Color {
            switch self {
            case .primary: return Color.accentColor
            case .secondary: return Color(.systemGray5)
            case .success: return .green
            case .destructive: return .red
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary, .success, .destructive: return .white
            case .secondary: return .primary
            }
        }
    }

    var body: some View {
        Button(action: {
            guard !isLoading && !isDisabled else { return }
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(style.foregroundColor)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.body.weight(.semibold))
                    }
                    Text(title)
                        .font(.body)
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(isDisabled ? Color(.systemGray4) : style.backgroundColor)
            )
            .foregroundStyle(isDisabled ? .secondary : style.foregroundColor)
        }
        .disabled(isLoading || isDisabled)
        .animation(.easeInOut(duration: 0.2), value: isLoading)
    }
}

// MARK: - Secondary/Text Button

struct SecondaryButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.subheadline)
                }
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
            .foregroundStyle(Color.accentColor)
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        PrimaryButton(title: "Активировать", icon: "bolt.fill") {}

        PrimaryButton(title: "Загрузка...", isLoading: true) {}

        PrimaryButton(title: "Успех", icon: "checkmark", style: .success) {}

        PrimaryButton(title: "Удалить", icon: "trash.fill", style: .destructive) {}

        PrimaryButton(title: "Недоступно", isDisabled: true) {}

        PrimaryButton(title: "Отмена", style: .secondary) {}

        SecondaryButton(title: "Подробнее", icon: "arrow.right") {}
    }
    .padding()
}
