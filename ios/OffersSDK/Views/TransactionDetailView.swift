import SwiftUI

struct TransactionDetailView: View {
    @EnvironmentObject var appState: AppState
    let transaction: Transaction

    @State private var showSupport = false

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy, HH:mm"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    private var shortDateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Status section
                statusSection

                // Details section
                detailsSection

                // Reason section (if rejected)
                if transaction.status == .rejected, let reason = transaction.rejectionReason {
                    rejectionSection(reason: reason)
                }

                // Expected confirmation (if pending)
                if transaction.status == .pending, let expected = transaction.expectedConfirmation {
                    pendingSection(expected: expected)
                }

                // Action section
                actionSection
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Детали операции")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showSupport) {
            SupportView(
                prefilledTransaction: transaction,
                prefilledOffer: appState.getOffer(by: transaction.offerId)
            )
        }
    }

    // MARK: - Status Section

    private var statusSection: some View {
        VStack(spacing: 16) {
            StatusView(
                status: transaction.status,
                title: statusTitle,
                subtitle: statusSubtitle
            )
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.background)
        )
    }

    private var statusTitle: String {
        switch transaction.status {
        case .pending: return "Ожидает подтверждения"
        case .confirmed: return "Начислено"
        case .rejected: return "Отклонено"
        case .reversed: return "Сторнировано"
        }
    }

    private var statusSubtitle: String {
        switch transaction.status {
        case .pending: return "Обычно это занимает до 5 рабочих дней"
        case .confirmed: return "+\(Int(transaction.benefitAmount))₽ добавлены на ваш счёт"
        case .rejected: return "Выгода не была начислена"
        case .reversed: return "Выгода была отменена из-за возврата"
        }
    }

    // MARK: - Details Section

    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("Детали покупки", systemImage: "receipt.fill")
                .font(.headline)
                .fontWeight(.semibold)

            VStack(spacing: 12) {
                DetailRow(title: "Партнёр", value: transaction.partner.name)
                DetailRow(title: "Дата покупки", value: dateFormatter.string(from: transaction.date))
                DetailRow(title: "Сумма покупки", value: "\(Int(transaction.amount))₽")
                DetailRow(title: "Выгода", value: "+\(Int(transaction.benefitAmount))₽", highlight: true)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
    }

    // MARK: - Rejection Section

    private func rejectionSection(reason: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Причина отказа", systemImage: "exclamationmark.triangle.fill")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundStyle(.red)

            Text(reason)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            // What to do
            if canRetry {
                VStack(alignment: .leading, spacing: 8) {
                    Divider()

                    Label("Что можно сделать", systemImage: "lightbulb.fill")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.orange)

                    Text("Попробуйте повторить покупку с правильным способом оплаты. Оффер ещё может быть активен.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.red.opacity(0.08))
        )
    }

    private var canRetry: Bool {
        transaction.rejectionReason?.lowercased().contains("оплата") == true ||
        transaction.rejectionReason?.lowercased().contains("способ") == true
    }

    // MARK: - Pending Section

    private func pendingSection(expected: Date) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Ожидаемое подтверждение", systemImage: "clock.fill")
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundStyle(.orange)

            HStack {
                Text("до \(shortDateFormatter.string(from: expected))")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Spacer()

                // Progress indicator
                let totalDays = expected.timeIntervalSince(transaction.date) / 86400
                let elapsedDays = Date().timeIntervalSince(transaction.date) / 86400
                let progress = min(elapsedDays / totalDays, 1.0)

                ProgressView(value: progress)
                    .progressViewStyle(.linear)
                    .frame(width: 100)
                    .tint(.orange)
            }

            Text("Если выгода не будет начислена в указанный срок, вы можете создать обращение в поддержку.")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.orange.opacity(0.08))
        )
    }

    // MARK: - Action Section

    private var actionSection: some View {
        VStack(spacing: 12) {
            if transaction.status == .rejected || transaction.status == .reversed {
                PrimaryButton(title: "Создать обращение", icon: "envelope.fill") {
                    showSupport = true
                }
            } else if transaction.status == .pending {
                PrimaryButton(title: "Сообщить о проблеме", icon: "exclamationmark.bubble.fill", style: .secondary) {
                    showSupport = true
                }
            }
        }
    }
}

// MARK: - Detail Row

struct DetailRow: View {
    let title: String
    let value: String
    var highlight: Bool = false

    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(highlight ? .bold : .medium)
                .foregroundStyle(highlight ? .green : .primary)
        }
    }
}

#Preview {
    NavigationStack {
        TransactionDetailView(transaction: MockData.transactions[2])
    }
    .environmentObject(AppState())
}
