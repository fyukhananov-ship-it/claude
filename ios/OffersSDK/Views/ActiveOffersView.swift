import SwiftUI

struct ActiveOffersView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        ScrollView {
            if appState.activatedOffers.isEmpty {
                EmptyStateView(
                    icon: "bolt.slash.fill",
                    title: "Нет активных офферов",
                    subtitle: "Активируйте офферы на витрине, чтобы получать выгоду при покупках",
                    actionTitle: "Перейти на витрину"
                ) {
                    // Switch to showcase tab
                }
            } else {
                LazyVStack(spacing: 16) {
                    // Expiring soon section
                    let expiringSoon = appState.activatedOffers.filter { $0.isExpiringSoon }
                    if !expiringSoon.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Скоро истекают", systemImage: "clock.badge.exclamationmark.fill")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundStyle(.orange)
                                .padding(.horizontal)

                            ForEach(expiringSoon) { activated in
                                ActiveOfferCard(
                                    activatedOffer: activated,
                                    isExpiringSoon: true
                                )
                            }
                        }
                    }

                    // All active section
                    let otherActive = appState.activatedOffers.filter { !$0.isExpiringSoon }
                    if !otherActive.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Активные", systemImage: "bolt.fill")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .padding(.horizontal)

                            ForEach(otherActive) { activated in
                                ActiveOfferCard(
                                    activatedOffer: activated,
                                    isExpiringSoon: false
                                )
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Активные")
    }
}

// MARK: - Active Offer Card

struct ActiveOfferCard: View {
    let activatedOffer: ActivatedOffer
    let isExpiringSoon: Bool

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM, HH:mm"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(activatedOffer.offer.partner.color.opacity(0.15))
                        .frame(width: 48, height: 48)

                    Image(systemName: activatedOffer.offer.partner.logo)
                        .font(.system(size: 20))
                        .foregroundStyle(activatedOffer.offer.partner.color)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(activatedOffer.offer.partner.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text(activatedOffer.offer.title)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                // Benefit
                Text(activatedOffer.offer.benefit.displayValue)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.accentColor)
            }

            // Status row
            HStack(spacing: 16) {
                // Time remaining
                HStack(spacing: 6) {
                    Image(systemName: "clock.fill")
                        .font(.caption)
                    Text(activatedOffer.remainingTime)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundStyle(isExpiringSoon ? .orange : .secondary)

                // Payment method
                HStack(spacing: 6) {
                    Image(systemName: activatedOffer.offer.conditions.paymentMethod.icon)
                        .font(.caption)
                    Text(activatedOffer.offer.conditions.paymentMethod.rawValue)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundStyle(.secondary)

                // Usages left
                if let usages = activatedOffer.usagesLeft {
                    HStack(spacing: 6) {
                        Image(systemName: "number")
                            .font(.caption)
                        Text("×\(usages)")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(.secondary)
                }

                Spacer()
            }

            // Quick action hint
            HStack(spacing: 8) {
                Image(systemName: activatedOffer.offer.conditions.format.icon)
                    .font(.caption)

                Text(whereToUseText)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                if activatedOffer.offer.conditions.format == .online ||
                   activatedOffer.offer.conditions.format == .both {
                    Button {
                        // Open partner store
                    } label: {
                        Label("В магазин", systemImage: "arrow.up.right")
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                }
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isExpiringSoon ? Color.orange.opacity(0.3) : Color.clear, lineWidth: 2)
        )
        .padding(.horizontal)
    }

    private var whereToUseText: String {
        switch activatedOffer.offer.conditions.format {
        case .online: return "Только онлайн"
        case .offline: return "Только в магазинах"
        case .both: return "Онлайн и офлайн"
        }
    }
}

#Preview {
    NavigationStack {
        ActiveOffersView()
    }
    .environmentObject(AppState())
}
