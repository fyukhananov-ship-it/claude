import SwiftUI

struct SupportView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    var prefilledTransaction: Transaction? = nil
    var prefilledOffer: Offer? = nil

    @State private var ticketType: TicketType = .notCredited
    @State private var selectedOffer: Offer? = nil
    @State private var purchaseDate = Date()
    @State private var purchaseAmount = ""
    @State private var partnerName = ""
    @State private var description = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    @State private var ticketId: String? = nil

    private var isFormValid: Bool {
        !purchaseAmount.isEmpty && !partnerName.isEmpty
    }

    var body: some View {
        NavigationStack {
            if showSuccess {
                successView
            } else {
                formView
            }
        }
    }

    // MARK: - Form View

    private var formView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Issue type
                VStack(alignment: .leading, spacing: 12) {
                    Text("Тип обращения")
                        .font(.headline)
                        .fontWeight(.semibold)

                    ForEach(TicketType.allCases, id: \.self) { type in
                        TicketTypeOption(
                            type: type,
                            isSelected: ticketType == type
                        ) {
                            ticketType = type
                        }
                    }
                }

                // Select offer (if available)
                if !appState.activatedOffers.isEmpty || !appState.transactions.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Связанный оффер")
                            .font(.headline)
                            .fontWeight(.semibold)

                        Menu {
                            Button("Не выбран") {
                                selectedOffer = nil
                            }

                            ForEach(appState.activatedOffers) { activated in
                                Button(activated.offer.title) {
                                    selectedOffer = activated.offer
                                    partnerName = activated.offer.partner.name
                                }
                            }
                        } label: {
                            HStack {
                                Text(selectedOffer?.title ?? "Выберите оффер")
                                    .foregroundStyle(selectedOffer == nil ? .secondary : .primary)
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                        }
                    }
                }

                // Purchase details
                VStack(alignment: .leading, spacing: 16) {
                    Text("Детали покупки")
                        .font(.headline)
                        .fontWeight(.semibold)

                    // Partner name
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Партнёр")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        TextField("Название магазина", text: $partnerName)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            )
                    }

                    // Date
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Дата покупки")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        DatePicker(
                            "",
                            selection: $purchaseDate,
                            in: ...Date(),
                            displayedComponents: .date
                        )
                        .datePickerStyle(.compact)
                        .labelsHidden()
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                    }

                    // Amount
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Сумма покупки")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        HStack {
                            TextField("0", text: $purchaseAmount)
                                .textFieldStyle(.plain)
                                .keyboardType(.numberPad)

                            Text("₽")
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                    }
                }

                // Additional description
                VStack(alignment: .leading, spacing: 6) {
                    Text("Дополнительная информация")
                        .font(.headline)
                        .fontWeight(.semibold)

                    TextEditor(text: $description)
                        .frame(minHeight: 100)
                        .padding(8)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                        .overlay(
                            Group {
                                if description.isEmpty {
                                    Text("Опишите проблему подробнее (необязательно)")
                                        .font(.body)
                                        .foregroundStyle(.tertiary)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 16)
                                }
                            },
                            alignment: .topLeading
                        )
                }

                // SLA info
                HStack(spacing: 8) {
                    Image(systemName: "clock.fill")
                        .foregroundStyle(.orange)

                    Text("Мы ответим в течение 24 часов")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.orange.opacity(0.1))
                )
            }
            .padding()
        }
        .navigationTitle("Поддержка")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Отмена") {
                    dismiss()
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 0) {
                Divider()

                PrimaryButton(
                    title: "Отправить",
                    icon: "paperplane.fill",
                    isLoading: isSubmitting,
                    isDisabled: !isFormValid
                ) {
                    Task {
                        await submitTicket()
                    }
                }
                .padding()
            }
            .background(.ultraThinMaterial)
        }
        .onAppear {
            prefillForm()
        }
    }

    // MARK: - Success View

    private var successView: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 120, height: 120)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.green)
            }

            VStack(spacing: 8) {
                Text("Обращение создано")
                    .font(.title2)
                    .fontWeight(.bold)

                if let ticketId = ticketId {
                    Text("Номер: \(ticketId)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            Text("Мы рассмотрим ваше обращение и ответим в течение 24 часов.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Spacer()

            PrimaryButton(title: "Готово") {
                dismiss()
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
    }

    // MARK: - Actions

    private func prefillForm() {
        if let transaction = prefilledTransaction {
            partnerName = transaction.partner.name
            purchaseDate = transaction.date
            purchaseAmount = String(Int(transaction.amount))
        }

        if let offer = prefilledOffer {
            selectedOffer = offer
            if partnerName.isEmpty {
                partnerName = offer.partner.name
            }
        }
    }

    private func submitTicket() async {
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            let id = try await appState.createTicket(
                transactionId: prefilledTransaction?.id,
                offerId: selectedOffer?.id,
                type: ticketType,
                description: description,
                purchaseDate: purchaseDate,
                purchaseAmount: Double(purchaseAmount),
                partnerName: partnerName
            )

            ticketId = id
            showSuccess = true
        } catch {
            print("Failed to create ticket: \(error)")
        }
    }
}

// MARK: - Ticket Type Option

struct TicketTypeOption: View {
    let type: TicketType
    let isSelected: Bool
    let action: () -> Void

    var icon: String {
        switch type {
        case .notCredited: return "exclamationmark.circle.fill"
        case .wrongAmount: return "plusminus.circle.fill"
        case .other: return "questionmark.circle.fill"
        }
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(isSelected ? .white : Color.accentColor)
                    .frame(width: 32)

                Text(type.rawValue)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(isSelected ? .white : .primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(.white)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.accentColor : Color(.systemGray6))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    SupportView()
        .environmentObject(AppState())
}
