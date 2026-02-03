import SwiftUI

struct OfferCard: View {
    let offer: Offer
    let isActivated: Bool
    var onTap: () -> Void = {}

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // Header with partner info
                HStack(spacing: 10) {
                    // Partner logo
                    ZStack {
                        Circle()
                            .fill(offer.partner.color.opacity(0.15))
                            .frame(width: 44, height: 44)

                        Image(systemName: offer.partner.logo)
                            .font(.system(size: 20))
                            .foregroundStyle(offer.partner.color)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(offer.partner.name)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(.secondary)

                        Text(offer.partner.category.rawValue)
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }

                    Spacer()

                    // Validity badge
                    if offer.validity.remainingDays <= 7 {
                        HStack(spacing: 4) {
                            Image(systemName: "clock.fill")
                                .font(.caption2)
                            Text("\(offer.validity.remainingDays) дн.")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundStyle(offer.validity.remainingDays <= 3 ? .red : .orange)
                    }
                }

                // Benefit value - main accent
                Text(offer.benefit.displayValue)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color.accentColor, Color.accentColor.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )

                // Title
                Text(offer.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Condition chips
                HStack(spacing: 8) {
                    ChipView(
                        icon: offer.conditions.paymentMethod.icon,
                        text: offer.conditions.paymentMethod.rawValue,
                        style: .secondary
                    )

                    if let minAmount = offer.conditions.minAmount {
                        ChipView(
                            icon: "rublesign",
                            text: "от \(Int(minAmount))₽",
                            style: .secondary
                        )
                    }

                    if let maxUsages = offer.conditions.maxUsages {
                        ChipView(
                            icon: "number",
                            text: "×\(maxUsages)",
                            style: .secondary
                        )
                    }
                }

                // CTA status
                HStack {
                    Spacer()

                    if isActivated {
                        Label("Активно", systemImage: "checkmark.circle.fill")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(.green)
                    } else if offer.status == .unavailable {
                        Label("Недоступно", systemImage: "xmark.circle.fill")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)
                    } else {
                        Label("Активировать", systemImage: "arrow.right.circle.fill")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.accentColor)
                    }
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.background)
                    .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 4)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isActivated ? Color.green.opacity(0.3) : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Compact Card for horizontal scroll

struct OfferCardCompact: View {
    let offer: Offer
    var onTap: () -> Void = {}

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                // Partner logo
                ZStack {
                    Circle()
                        .fill(offer.partner.color.opacity(0.15))
                        .frame(width: 48, height: 48)

                    Image(systemName: offer.partner.logo)
                        .font(.system(size: 22))
                        .foregroundStyle(offer.partner.color)
                }

                // Benefit
                Text(offer.benefit.displayValue)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(Color.accentColor)

                // Partner name
                Text(offer.partner.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                // Payment method
                HStack(spacing: 4) {
                    Image(systemName: offer.conditions.paymentMethod.icon)
                        .font(.caption2)
                    Text(offer.conditions.paymentMethod.rawValue)
                        .font(.caption2)
                }
                .foregroundStyle(.secondary)
            }
            .frame(width: 120)
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(.background)
                    .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 16) {
            OfferCard(offer: MockData.offers[0], isActivated: false)
            OfferCard(offer: MockData.offers[1], isActivated: true)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(MockData.offers.prefix(4)) { offer in
                        OfferCardCompact(offer: offer)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
    }
    .background(Color(.systemGroupedBackground))
}
