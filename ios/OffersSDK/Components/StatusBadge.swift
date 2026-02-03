import SwiftUI

struct StatusBadge: View {
    let status: TransactionStatus

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: status.icon)
                .font(.caption)

            Text(status.rawValue)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(status.color.opacity(0.15))
        )
        .foregroundStyle(status.color)
    }
}

// MARK: - Larger Status View

struct StatusView: View {
    let status: TransactionStatus
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(status.color.opacity(0.15))
                    .frame(width: 80, height: 80)

                Image(systemName: status.icon)
                    .font(.system(size: 36))
                    .foregroundStyle(status.color)
            }

            VStack(spacing: 4) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.semibold)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        HStack(spacing: 12) {
            ForEach(TransactionStatus.allCases, id: \.self) { status in
                StatusBadge(status: status)
            }
        }

        Divider()

        StatusView(
            status: .confirmed,
            title: "Начислено",
            subtitle: "245₽ кэшбэка добавлены на ваш счёт"
        )

        StatusView(
            status: .rejected,
            title: "Отклонено",
            subtitle: "Оплата произведена не картой"
        )
    }
    .padding()
}
