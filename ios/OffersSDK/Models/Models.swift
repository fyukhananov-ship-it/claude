import Foundation
import SwiftUI

// MARK: - Offer Models

struct Offer: Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let partner: Partner
    let benefit: Benefit
    let conditions: OfferConditions
    let validity: OfferValidity
    let howToGet: [String]
    let tags: [String]
    let status: OfferStatus
    let personalScore: Int

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Offer, rhs: Offer) -> Bool {
        lhs.id == rhs.id
    }
}

struct Partner: Hashable {
    let id: String
    let name: String
    let logo: String
    let category: Category
    let color: Color
}

struct Benefit: Hashable {
    let type: BenefitType
    let value: Double
    let maxAmount: Double?
    let displayValue: String
}

enum BenefitType: String, Hashable {
    case cashback
    case bonus
    case discount
    case fixed
}

struct OfferConditions: Hashable {
    let minAmount: Double?
    let maxUsages: Int?
    let paymentMethod: PaymentMethod
    let format: OfferFormat
}

enum PaymentMethod: String, CaseIterable, Hashable {
    case sbp = "СБП"
    case card = "Карта"
    case any = "Любой"

    var icon: String {
        switch self {
        case .sbp: return "arrow.left.arrow.right"
        case .card: return "creditcard.fill"
        case .any: return "checkmark.circle.fill"
        }
    }
}

enum OfferFormat: String, CaseIterable, Hashable {
    case online = "Онлайн"
    case offline = "Офлайн"
    case both = "Везде"

    var icon: String {
        switch self {
        case .online: return "globe"
        case .offline: return "mappin.and.ellipse"
        case .both: return "checkmark.circle.fill"
        }
    }
}

struct OfferValidity: Hashable {
    let startDate: Date
    let endDate: Date
    let remainingDays: Int
}

enum OfferStatus: String, Hashable {
    case available
    case activated
    case unavailable
    case expired
}

// MARK: - Activated Offer

struct ActivatedOffer: Identifiable, Hashable {
    let id: String
    let offer: Offer
    let activatedAt: Date
    let expiresAt: Date
    let usagesLeft: Int?
    var status: ActivatedStatus

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: ActivatedOffer, rhs: ActivatedOffer) -> Bool {
        lhs.id == rhs.id
    }

    var remainingTime: String {
        let interval = expiresAt.timeIntervalSince(Date())
        if interval <= 0 { return "Истекло" }

        let days = Int(interval / 86400)
        let hours = Int((interval.truncatingRemainder(dividingBy: 86400)) / 3600)

        if days > 0 {
            return "\(days) дн."
        } else if hours > 0 {
            return "\(hours) ч."
        } else {
            return "< 1 ч."
        }
    }

    var isExpiringSoon: Bool {
        expiresAt.timeIntervalSince(Date()) < 86400 * 2
    }
}

enum ActivatedStatus: String, Hashable {
    case activated
    case used
    case expired
}

// MARK: - Transaction

struct Transaction: Identifiable, Hashable {
    let id: String
    let offerId: String
    let partner: Partner
    let amount: Double
    let benefitAmount: Double
    let date: Date
    let status: TransactionStatus
    let rejectionReason: String?
    let expectedConfirmation: Date?

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: Transaction, rhs: Transaction) -> Bool {
        lhs.id == rhs.id
    }
}

enum TransactionStatus: String, CaseIterable, Hashable {
    case pending = "Ожидает"
    case confirmed = "Начислено"
    case rejected = "Отклонено"
    case reversed = "Сторнировано"

    var color: Color {
        switch self {
        case .pending: return .orange
        case .confirmed: return .green
        case .rejected: return .red
        case .reversed: return .gray
        }
    }

    var icon: String {
        switch self {
        case .pending: return "clock.fill"
        case .confirmed: return "checkmark.circle.fill"
        case .rejected: return "xmark.circle.fill"
        case .reversed: return "arrow.uturn.backward.circle.fill"
        }
    }
}

// MARK: - Category

enum Category: String, CaseIterable, Hashable {
    case restaurants = "Рестораны"
    case groceries = "Продукты"
    case entertainment = "Развлечения"
    case shopping = "Покупки"
    case travel = "Путешествия"
    case fuel = "АЗС"
    case health = "Здоровье"
    case services = "Услуги"

    var icon: String {
        switch self {
        case .restaurants: return "fork.knife"
        case .groceries: return "cart.fill"
        case .entertainment: return "film.fill"
        case .shopping: return "bag.fill"
        case .travel: return "airplane"
        case .fuel: return "fuelpump.fill"
        case .health: return "heart.fill"
        case .services: return "wrench.and.screwdriver.fill"
        }
    }

    var color: Color {
        switch self {
        case .restaurants: return .orange
        case .groceries: return .green
        case .entertainment: return .purple
        case .shopping: return .pink
        case .travel: return .blue
        case .fuel: return .yellow
        case .health: return .red
        case .services: return .cyan
        }
    }
}

// MARK: - Support Ticket

struct SupportTicket: Identifiable, Hashable {
    let id: String
    let transactionId: String?
    let offerId: String?
    let type: TicketType
    let description: String
    let purchaseDate: Date?
    let purchaseAmount: Double?
    let partnerName: String?
    let status: TicketStatus
    let createdAt: Date
    let expectedResponse: Date

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: SupportTicket, rhs: SupportTicket) -> Bool {
        lhs.id == rhs.id
    }
}

enum TicketType: String, CaseIterable, Hashable {
    case notCredited = "Не начислено"
    case wrongAmount = "Неверная сумма"
    case other = "Другое"
}

enum TicketStatus: String, Hashable {
    case open = "Открыт"
    case inProgress = "В работе"
    case resolved = "Решён"
    case closed = "Закрыт"

    var color: Color {
        switch self {
        case .open: return .blue
        case .inProgress: return .orange
        case .resolved: return .green
        case .closed: return .gray
        }
    }
}

// MARK: - Filter State

struct FilterState: Equatable {
    var paymentMethod: PaymentMethod?
    var format: OfferFormat?
    var onlyAvailable: Bool = false
    var validityPeriod: ValidityPeriod = .any
    var category: Category?
}

enum ValidityPeriod: String, CaseIterable {
    case any = "Любой"
    case week = "До 7 дней"
    case month = "До 30 дней"
}
