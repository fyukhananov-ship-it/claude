import SwiftUI

struct TransactionCard: View {
    let transaction: Transaction
    var onTap: () -> Void = {}

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                // Partner logo
                ZStack {
                    Circle()
                        .fill(transaction.partner.color.opacity(0.15))
                        .frame(width: 48, height: 48)

                    Image(systemName: transaction.partner.logo)
                        .font(.system(size: 20))
                        .foregroundStyle(transaction.partner.color)
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(transaction.partner.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.primary)

                    HStack(spacing: 8) {
                        Text(dateFormatter.string(from: transaction.date))
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        Text("•")
                            .font(.caption)
                            .foregroundStyle(.tertiary)

                        Text("\(Int(transaction.amount))₽")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                // Benefit and status
                VStack(alignment: .trailing, spacing: 4) {
                    Text("+\(Int(transaction.benefitAmount))₽")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundStyle(transaction.status == .confirmed ? .green : .primary)

                    StatusBadge(status: transaction.status)
                }
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(.background)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Compact version for lists

struct TransactionRow: View {
    let transaction: Transaction
    var onTap: () -> Void = {}

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM, HH:mm"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Status icon
                Image(systemName: transaction.status.icon)
                    .font(.title3)
                    .foregroundStyle(transaction.status.color)
                    .frame(width: 32)

                // Info
                VStack(alignment: .leading, spacing: 2) {
                    Text(transaction.partner.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundStyle(.primary)

                    Text(dateFormatter.string(from: transaction.date))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Amount
                VStack(alignment: .trailing, spacing: 2) {
                    Text("+\(Int(transaction.benefitAmount))₽")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(transaction.status == .confirmed ? .green : .primary)

                    Text(transaction.status.rawValue)
                        .font(.caption)
                        .foregroundStyle(transaction.status.color)
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack(spacing: 16) {
        ForEach(MockData.transactions.prefix(3)) { tx in
            TransactionCard(transaction: tx)
        }

        Divider()

        ForEach(MockData.transactions.prefix(3)) { tx in
            TransactionRow(transaction: tx)
        }
    }
    .padding()
    .background(Color(.systemGroupedBackground))
}
