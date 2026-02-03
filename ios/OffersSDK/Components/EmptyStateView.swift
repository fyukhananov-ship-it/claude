import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: 100, height: 100)

                Image(systemName: icon)
                    .font(.system(size: 40))
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 8) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            if let actionTitle = actionTitle, let action = action {
                PrimaryButton(title: actionTitle, action: action)
                    .padding(.horizontal, 48)
                    .padding(.top, 8)
            }

            Spacer()
        }
    }
}

#Preview {
    VStack {
        EmptyStateView(
            icon: "sparkles",
            title: "Нет активных офферов",
            subtitle: "Активируйте офферы на витрине, чтобы получать выгоду",
            actionTitle: "Перейти на витрину"
        ) {}

        Divider()

        EmptyStateView(
            icon: "magnifyingglass",
            title: "Ничего не найдено",
            subtitle: "Попробуйте изменить параметры поиска"
        )
    }
}
