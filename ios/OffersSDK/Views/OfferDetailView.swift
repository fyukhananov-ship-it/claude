import SwiftUI

struct OfferDetailView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    let offer: Offer

    @State private var isActivating = false
    @State private var showSuccess = false
    @State private var activatedOffer: ActivatedOffer?
    @State private var showConditions = false

    private var isActivated: Bool {
        appState.isOfferActivated(offer.id)
    }

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                headerSection

                // What you get
                benefitSection

                // How to get
                howToGetSection

                // Conditions (collapsed)
                conditionsSection

                Spacer(minLength: 100)
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .safeAreaInset(edge: .bottom) {
            ctaSection
        }
        .navigationTitle(offer.partner.name)
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showSuccess) {
            if let activated = activatedOffer {
                SuccessView(offer: offer, activatedOffer: activated)
            }
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: 16) {
            // Partner logo
            ZStack {
                Circle()
                    .fill(offer.partner.color.opacity(0.15))
                    .frame(width: 80, height: 80)

                Image(systemName: offer.partner.logo)
                    .font(.system(size: 36))
                    .foregroundStyle(offer.partner.color)
            }

            // Title
            Text(offer.title)
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)

            // Tags
            HStack(spacing: 8) {
                ChipView(
                    icon: offer.conditions.paymentMethod.icon,
                    text: offer.conditions.paymentMethod.rawValue,
                    style: .primary
                )

                ChipView(
                    icon: offer.conditions.format.icon,
                    text: offer.conditions.format.rawValue,
                    style: .secondary
                )

                if offer.validity.remainingDays <= 7 {
                    ChipView(
                        icon: "clock.fill",
                        text: "\(offer.validity.remainingDays) дн.",
                        style: offer.validity.remainingDays <= 3 ? .error : .warning
                    )
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.background)
        )
    }

    // MARK: - Benefit Section

    private var benefitSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("Что вы получите", systemImage: "gift.fill")
                .font(.headline)
                .fontWeight(.semibold)

            HStack(spacing: 16) {
                // Main benefit
                VStack(alignment: .leading, spacing: 4) {
                    Text(offer.benefit.displayValue)
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(.accentColor)

                    Text(benefitTypeText)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Max amount if applicable
                if let maxAmount = offer.benefit.maxAmount {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("до \(Int(maxAmount))₽")
                            .font(.title3)
                            .fontWeight(.semibold)

                        Text("максимум")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            // Confirmation SLA
            HStack(spacing: 8) {
                Image(systemName: "clock.badge.checkmark.fill")
                    .foregroundStyle(.orange)

                Text("Подтверждение в течение 5 рабочих дней")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
    }

    private var benefitTypeText: String {
        switch offer.benefit.type {
        case .cashback: return "кэшбэк"
        case .bonus: return "бонусами"
        case .discount: return "скидка"
        case .fixed: return "выгода"
        }
    }

    // MARK: - How To Get Section

    private var howToGetSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("Как получить", systemImage: "list.number")
                .font(.headline)
                .fontWeight(.semibold)

            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(offer.howToGet.enumerated()), id: \.offset) { index, step in
                    HStack(alignment: .top, spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.accentColor)
                                .frame(width: 28, height: 28)

                            Text("\(index + 1)")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                        }

                        Text(step)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                            .padding(.top, 4)

                        Spacer()
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
    }

    // MARK: - Conditions Section

    private var conditionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    showConditions.toggle()
                }
            } label: {
                HStack {
                    Label("Условия", systemImage: "doc.text.fill")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.primary)

                    Spacer()

                    Image(systemName: showConditions ? "chevron.up" : "chevron.down")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            // Quick conditions chips
            HStack(spacing: 8) {
                if let minAmount = offer.conditions.minAmount {
                    ChipView(text: "от \(Int(minAmount))₽", style: .secondary)
                }

                if let maxUsages = offer.conditions.maxUsages {
                    ChipView(text: "×\(maxUsages) раз", style: .secondary)
                }

                ChipView(text: "до \(dateFormatter.string(from: offer.validity.endDate))", style: .secondary)
            }

            // Expanded conditions
            if showConditions {
                VStack(alignment: .leading, spacing: 8) {
                    Divider()

                    Text(offer.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    if let minAmount = offer.conditions.minAmount {
                        ConditionRow(title: "Минимальная сумма покупки", value: "\(Int(minAmount))₽")
                    }

                    if let maxUsages = offer.conditions.maxUsages {
                        ConditionRow(title: "Количество использований", value: "\(maxUsages)")
                    }

                    ConditionRow(title: "Способ оплаты", value: offer.conditions.paymentMethod.rawValue)
                    ConditionRow(title: "Формат", value: offer.conditions.format.rawValue)
                    ConditionRow(title: "Действует до", value: dateFormatter.string(from: offer.validity.endDate))
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
    }

    // MARK: - CTA Section

    private var ctaSection: some View {
        VStack(spacing: 0) {
            Divider()

            if isActivated {
                HStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.green)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Оффер активирован")
                            .font(.subheadline)
                            .fontWeight(.semibold)

                        Text("Оплатите \(offer.conditions.paymentMethod.rawValue) для получения выгоды")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()
                }
                .padding()
            } else {
                PrimaryButton(
                    title: "Активировать",
                    icon: "bolt.fill",
                    isLoading: isActivating
                ) {
                    Task {
                        await activateOffer()
                    }
                }
                .padding()
            }
        }
        .background(.ultraThinMaterial)
    }

    // MARK: - Actions

    private func activateOffer() async {
        isActivating = true
        defer { isActivating = false }

        do {
            try await appState.activateOffer(offer)

            // Get the activated offer
            activatedOffer = appState.activatedOffers.first { $0.offer.id == offer.id }
            showSuccess = true
        } catch {
            // Handle error
            print("Failed to activate offer: \(error)")
        }
    }
}

// MARK: - Condition Row

struct ConditionRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

#Preview {
    NavigationStack {
        OfferDetailView(offer: MockData.offers[0])
    }
    .environmentObject(AppState())
}
