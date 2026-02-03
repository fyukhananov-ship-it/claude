import Foundation
import SwiftUI

@MainActor
class AppState: ObservableObject {
    @Published var offers: [Offer] = []
    @Published var activatedOffers: [ActivatedOffer] = []
    @Published var transactions: [Transaction] = []
    @Published var tickets: [SupportTicket] = []
    @Published var filters = FilterState()
    @Published var searchQuery = ""
    @Published var isLoading = false

    init() {
        loadMockData()
    }

    private func loadMockData() {
        offers = MockData.offers
        activatedOffers = MockData.activatedOffers
        transactions = MockData.transactions
    }

    // MARK: - Computed Properties

    var filteredOffers: [Offer] {
        offers.filter { offer in
            // Search filter
            if !searchQuery.isEmpty {
                let query = searchQuery.lowercased()
                let matchesSearch = offer.title.lowercased().contains(query) ||
                    offer.partner.name.lowercased().contains(query) ||
                    offer.tags.contains { $0.lowercased().contains(query) }
                if !matchesSearch { return false }
            }

            // Payment method filter
            if let method = filters.paymentMethod,
               offer.conditions.paymentMethod != method &&
               offer.conditions.paymentMethod != .any {
                return false
            }

            // Format filter
            if let format = filters.format,
               offer.conditions.format != format &&
               offer.conditions.format != .both {
                return false
            }

            // Availability filter
            if filters.onlyAvailable && offer.status != .available {
                return false
            }

            // Validity period filter
            switch filters.validityPeriod {
            case .week where offer.validity.remainingDays > 7:
                return false
            case .month where offer.validity.remainingDays > 30:
                return false
            default:
                break
            }

            // Category filter
            if let category = filters.category,
               offer.partner.category != category {
                return false
            }

            return true
        }.sorted { $0.personalScore > $1.personalScore }
    }

    var pendingTransactionsCount: Int {
        transactions.filter { $0.status == .pending }.count
    }

    var forYouOffers: [Offer] {
        Array(filteredOffers.prefix(5))
    }

    var popularOffers: [Offer] {
        filteredOffers.filter { $0.personalScore >= 80 }
    }

    // MARK: - Actions

    func activateOffer(_ offer: Offer) async throws {
        isLoading = true
        defer { isLoading = false }

        // Simulate API call
        try await Task.sleep(nanoseconds: 500_000_000)

        let activated = ActivatedOffer(
            id: "activated-\(offer.id)",
            offer: offer,
            activatedAt: Date(),
            expiresAt: offer.validity.endDate,
            usagesLeft: offer.conditions.maxUsages,
            status: .activated
        )

        activatedOffers.append(activated)

        // Update offer status
        if let index = offers.firstIndex(where: { $0.id == offer.id }) {
            var updatedOffer = offers[index]
            offers[index] = Offer(
                id: updatedOffer.id,
                title: updatedOffer.title,
                description: updatedOffer.description,
                partner: updatedOffer.partner,
                benefit: updatedOffer.benefit,
                conditions: updatedOffer.conditions,
                validity: updatedOffer.validity,
                howToGet: updatedOffer.howToGet,
                tags: updatedOffer.tags,
                status: .activated,
                personalScore: updatedOffer.personalScore
            )
        }
    }

    func createTicket(
        transactionId: String?,
        offerId: String?,
        type: TicketType,
        description: String,
        purchaseDate: Date?,
        purchaseAmount: Double?,
        partnerName: String?
    ) async throws -> String {
        isLoading = true
        defer { isLoading = false }

        try await Task.sleep(nanoseconds: 300_000_000)

        let ticket = SupportTicket(
            id: "ticket-\(Date().timeIntervalSince1970)",
            transactionId: transactionId,
            offerId: offerId,
            type: type,
            description: description,
            purchaseDate: purchaseDate,
            purchaseAmount: purchaseAmount,
            partnerName: partnerName,
            status: .open,
            createdAt: Date(),
            expectedResponse: Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        )

        tickets.append(ticket)
        return ticket.id
    }

    func getOffer(by id: String) -> Offer? {
        offers.first { $0.id == id }
    }

    func getActivatedOffer(by id: String) -> ActivatedOffer? {
        activatedOffers.first { $0.id == id }
    }

    func getTransaction(by id: String) -> Transaction? {
        transactions.first { $0.id == id }
    }

    func isOfferActivated(_ offerId: String) -> Bool {
        activatedOffers.contains { $0.offer.id == offerId }
    }
}
