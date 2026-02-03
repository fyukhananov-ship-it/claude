import SwiftUI

struct FilterSheet: View {
    @Binding var filters: FilterState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Payment method
                    FilterSection(title: "Способ оплаты") {
                        HStack(spacing: 10) {
                            FilterOption(
                                title: "Все",
                                isSelected: filters.paymentMethod == nil,
                                action: { filters.paymentMethod = nil }
                            )

                            ForEach(PaymentMethod.allCases, id: \.self) { method in
                                FilterOption(
                                    title: method.rawValue,
                                    icon: method.icon,
                                    isSelected: filters.paymentMethod == method,
                                    action: { filters.paymentMethod = method }
                                )
                            }
                        }
                    }

                    // Format
                    FilterSection(title: "Формат") {
                        HStack(spacing: 10) {
                            FilterOption(
                                title: "Все",
                                isSelected: filters.format == nil,
                                action: { filters.format = nil }
                            )

                            ForEach(OfferFormat.allCases, id: \.self) { format in
                                FilterOption(
                                    title: format.rawValue,
                                    icon: format.icon,
                                    isSelected: filters.format == format,
                                    action: { filters.format = format }
                                )
                            }
                        }
                    }

                    // Validity period
                    FilterSection(title: "Срок действия") {
                        HStack(spacing: 10) {
                            ForEach(ValidityPeriod.allCases, id: \.self) { period in
                                FilterOption(
                                    title: period.rawValue,
                                    isSelected: filters.validityPeriod == period,
                                    action: { filters.validityPeriod = period }
                                )
                            }
                        }
                    }

                    // Category
                    FilterSection(title: "Категория") {
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 10) {
                            FilterOption(
                                title: "Все",
                                isSelected: filters.category == nil,
                                action: { filters.category = nil }
                            )

                            ForEach(Category.allCases, id: \.self) { category in
                                FilterOption(
                                    title: category.rawValue,
                                    icon: category.icon,
                                    isSelected: filters.category == category,
                                    action: { filters.category = category }
                                )
                            }
                        }
                    }

                    // Only available toggle
                    Toggle(isOn: $filters.onlyAvailable) {
                        Label("Только доступные", systemImage: "checkmark.circle.fill")
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.systemGray6))
                    )
                }
                .padding()
            }
            .navigationTitle("Фильтры")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Сбросить") {
                        filters = FilterState()
                    }
                    .foregroundStyle(.red)
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") {
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}

// MARK: - Filter Section

struct FilterSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)

            content
        }
    }
}

// MARK: - Filter Option

struct FilterOption: View {
    let title: String
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(isSelected ? Color.accentColor : Color(.systemGray6))
            )
            .foregroundStyle(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    FilterSheet(filters: .constant(FilterState()))
}
