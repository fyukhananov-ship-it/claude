import SwiftUI

struct SuccessView: View {
    let offer: Offer
    let activatedOffer: ActivatedOffer
    @Environment(\.dismiss) private var dismiss

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Success animation
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 120, height: 120)

                Circle()
                    .fill(Color.green.opacity(0.25))
                    .frame(width: 90, height: 90)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.green)
            }

            VStack(spacing: 8) {
                Text("Оффер активирован!")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(offer.title)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            // What to do next
            VStack(alignment: .leading, spacing: 16) {
                Text("Что дальше:")
                    .font(.headline)
                    .fontWeight(.semibold)

                VStack(alignment: .leading, spacing: 12) {
                    InfoRow(
                        icon: offer.conditions.paymentMethod.icon,
                        title: "Оплатите \(offer.conditions.paymentMethod.rawValue)",
                        color: .accentColor
                    )

                    if let minAmount = offer.conditions.minAmount {
                        InfoRow(
                            icon: "rublesign",
                            title: "Сумма покупки от \(Int(minAmount))₽",
                            color: .orange
                        )
                    }

                    InfoRow(
                        icon: "clock.fill",
                        title: "Действует до \(dateFormatter.string(from: activatedOffer.expiresAt))",
                        color: activatedOffer.isExpiringSoon ? .red : .green
                    )

                    if let usages = activatedOffer.usagesLeft {
                        InfoRow(
                            icon: "number",
                            title: "Осталось использований: \(usages)",
                            color: .purple
                        )
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemGray6))
            )
            .padding(.horizontal)

            Spacer()

            // Actions
            VStack(spacing: 12) {
                if offer.conditions.format == .online || offer.conditions.format == .both {
                    PrimaryButton(title: "Перейти в магазин", icon: "arrow.up.right") {
                        // Open partner URL
                        dismiss()
                    }
                }

                PrimaryButton(title: "Готово", style: .secondary) {
                    dismiss()
                }
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .navigationBarBackButtonHidden(true)
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(color)
                .frame(width: 24)

            Text(title)
                .font(.subheadline)
                .foregroundStyle(.primary)

            Spacer()
        }
    }
}

#Preview {
    NavigationStack {
        SuccessView(
            offer: MockData.offers[0],
            activatedOffer: MockData.activatedOffers[0]
        )
    }
}
