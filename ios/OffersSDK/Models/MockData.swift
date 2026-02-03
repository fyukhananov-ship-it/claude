import Foundation
import SwiftUI

struct MockData {
    static let partners: [Partner] = [
        Partner(id: "p1", name: "Яндекс Маркет", logo: "cart.fill", category: .shopping, color: .yellow),
        Partner(id: "p2", name: "Лента", logo: "basket.fill", category: .groceries, color: .blue),
        Partner(id: "p3", name: "Кинопоиск", logo: "film.fill", category: .entertainment, color: .orange),
        Partner(id: "p4", name: "Ozon", logo: "shippingbox.fill", category: .shopping, color: .blue),
        Partner(id: "p5", name: "Самокат", logo: "bicycle", category: .groceries, color: .pink),
        Partner(id: "p6", name: "Лукойл", logo: "fuelpump.fill", category: .fuel, color: .red),
        Partner(id: "p7", name: "Кофемания", logo: "cup.and.saucer.fill", category: .restaurants, color: .brown),
        Partner(id: "p8", name: "Аптека.ру", logo: "cross.case.fill", category: .health, color: .green),
    ]

    static let offers: [Offer] = [
        Offer(
            id: "offer-1",
            title: "7% кэшбэк на все покупки",
            description: "Получите повышенный кэшбэк за покупки в Яндекс Маркете при оплате через СБП.",
            partner: partners[0],
            benefit: Benefit(type: .cashback, value: 7, maxAmount: 500, displayValue: "7%"),
            conditions: OfferConditions(minAmount: 1000, maxUsages: 3, paymentMethod: .sbp, format: .online),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 14, to: Date())!,
                remainingDays: 14
            ),
            howToGet: [
                "Активируйте оффер",
                "Оплатите покупку через СБП",
                "Кэшбэк придёт в течение 5 дней"
            ],
            tags: ["маркетплейс", "СБП", "кэшбэк"],
            status: .available,
            personalScore: 95
        ),
        Offer(
            id: "offer-2",
            title: "200₽ на первый заказ",
            description: "Скидка на первый заказ в Ленте Онлайн для новых клиентов.",
            partner: partners[1],
            benefit: Benefit(type: .fixed, value: 200, maxAmount: nil, displayValue: "200₽"),
            conditions: OfferConditions(minAmount: 1500, maxUsages: 1, paymentMethod: .any, format: .online),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 7, to: Date())!,
                remainingDays: 7
            ),
            howToGet: [
                "Активируйте оффер",
                "Сделайте заказ от 1500₽",
                "Скидка применится автоматически"
            ],
            tags: ["продукты", "скидка", "новым клиентам"],
            status: .available,
            personalScore: 90
        ),
        Offer(
            id: "offer-3",
            title: "Подписка на 1 месяц за 1₽",
            description: "Попробуйте Кинопоиск HD всего за 1 рубль.",
            partner: partners[2],
            benefit: Benefit(type: .discount, value: 99, maxAmount: nil, displayValue: "99%"),
            conditions: OfferConditions(minAmount: nil, maxUsages: 1, paymentMethod: .card, format: .online),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 30, to: Date())!,
                remainingDays: 30
            ),
            howToGet: [
                "Активируйте оффер",
                "Оплатите картой",
                "Подписка активируется сразу"
            ],
            tags: ["кино", "подписка", "развлечения"],
            status: .available,
            personalScore: 85
        ),
        Offer(
            id: "offer-4",
            title: "5% бонусами на Ozon",
            description: "Повышенные бонусы за покупки в категории Электроника.",
            partner: partners[3],
            benefit: Benefit(type: .bonus, value: 5, maxAmount: 1000, displayValue: "5%"),
            conditions: OfferConditions(minAmount: 3000, maxUsages: 5, paymentMethod: .any, format: .online),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 21, to: Date())!,
                remainingDays: 21
            ),
            howToGet: [
                "Активируйте оффер",
                "Купите электронику от 3000₽",
                "Бонусы начислятся после доставки"
            ],
            tags: ["электроника", "бонусы", "маркетплейс"],
            status: .available,
            personalScore: 88
        ),
        Offer(
            id: "offer-5",
            title: "Бесплатная доставка",
            description: "Закажите продукты в Самокате без платы за доставку.",
            partner: partners[4],
            benefit: Benefit(type: .fixed, value: 0, maxAmount: nil, displayValue: "0₽"),
            conditions: OfferConditions(minAmount: 500, maxUsages: 2, paymentMethod: .sbp, format: .online),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 5, to: Date())!,
                remainingDays: 5
            ),
            howToGet: [
                "Активируйте оффер",
                "Закажите на сумму от 500₽",
                "Оплатите через СБП"
            ],
            tags: ["доставка", "продукты", "СБП"],
            status: .available,
            personalScore: 92
        ),
        Offer(
            id: "offer-6",
            title: "10% на топливо",
            description: "Кэшбэк на заправку в сети АЗС Лукойл.",
            partner: partners[5],
            benefit: Benefit(type: .cashback, value: 10, maxAmount: 300, displayValue: "10%"),
            conditions: OfferConditions(minAmount: 1000, maxUsages: 4, paymentMethod: .card, format: .offline),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 10, to: Date())!,
                remainingDays: 10
            ),
            howToGet: [
                "Активируйте оффер",
                "Заправьтесь на любой АЗС Лукойл",
                "Оплатите картой"
            ],
            tags: ["АЗС", "топливо", "кэшбэк"],
            status: .available,
            personalScore: 75
        ),
        Offer(
            id: "offer-7",
            title: "Второй кофе в подарок",
            description: "При покупке любого напитка получите второй бесплатно.",
            partner: partners[6],
            benefit: Benefit(type: .fixed, value: 100, maxAmount: nil, displayValue: "2=1"),
            conditions: OfferConditions(minAmount: nil, maxUsages: 1, paymentMethod: .any, format: .offline),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 3, to: Date())!,
                remainingDays: 3
            ),
            howToGet: [
                "Покажите оффер на кассе",
                "Закажите два напитка",
                "Второй будет бесплатным"
            ],
            tags: ["кофе", "рестораны", "2=1"],
            status: .available,
            personalScore: 80
        ),
        Offer(
            id: "offer-8",
            title: "15% на витамины",
            description: "Скидка на все витамины и БАДы в Аптека.ру",
            partner: partners[7],
            benefit: Benefit(type: .discount, value: 15, maxAmount: nil, displayValue: "15%"),
            conditions: OfferConditions(minAmount: 500, maxUsages: 2, paymentMethod: .any, format: .both),
            validity: OfferValidity(
                startDate: Date(),
                endDate: Calendar.current.date(byAdding: .day, value: 14, to: Date())!,
                remainingDays: 14
            ),
            howToGet: [
                "Активируйте оффер",
                "Добавьте витамины в корзину",
                "Скидка применится при оплате"
            ],
            tags: ["здоровье", "витамины", "аптека"],
            status: .available,
            personalScore: 70
        ),
    ]

    static let activatedOffers: [ActivatedOffer] = [
        ActivatedOffer(
            id: "act-1",
            offer: offers[0],
            activatedAt: Calendar.current.date(byAdding: .day, value: -2, to: Date())!,
            expiresAt: Calendar.current.date(byAdding: .day, value: 12, to: Date())!,
            usagesLeft: 2,
            status: .activated
        ),
        ActivatedOffer(
            id: "act-2",
            offer: offers[4],
            activatedAt: Calendar.current.date(byAdding: .hour, value: -5, to: Date())!,
            expiresAt: Calendar.current.date(byAdding: .day, value: 1, to: Date())!,
            usagesLeft: 1,
            status: .activated
        ),
    ]

    static let transactions: [Transaction] = [
        Transaction(
            id: "tx-1",
            offerId: "offer-1",
            partner: partners[0],
            amount: 3500,
            benefitAmount: 245,
            date: Calendar.current.date(byAdding: .day, value: -1, to: Date())!,
            status: .pending,
            rejectionReason: nil,
            expectedConfirmation: Calendar.current.date(byAdding: .day, value: 4, to: Date())
        ),
        Transaction(
            id: "tx-2",
            offerId: "offer-2",
            partner: partners[1],
            amount: 2100,
            benefitAmount: 200,
            date: Calendar.current.date(byAdding: .day, value: -5, to: Date())!,
            status: .confirmed,
            rejectionReason: nil,
            expectedConfirmation: nil
        ),
        Transaction(
            id: "tx-3",
            offerId: "offer-6",
            partner: partners[5],
            amount: 2000,
            benefitAmount: 200,
            date: Calendar.current.date(byAdding: .day, value: -3, to: Date())!,
            status: .rejected,
            rejectionReason: "Оплата произведена не картой, а наличными. Для получения кэшбэка необходимо оплатить картой.",
            expectedConfirmation: nil
        ),
        Transaction(
            id: "tx-4",
            offerId: "offer-3",
            partner: partners[2],
            amount: 1,
            benefitAmount: 398,
            date: Calendar.current.date(byAdding: .day, value: -7, to: Date())!,
            status: .confirmed,
            rejectionReason: nil,
            expectedConfirmation: nil
        ),
        Transaction(
            id: "tx-5",
            offerId: "offer-4",
            partner: partners[3],
            amount: 15000,
            benefitAmount: 750,
            date: Calendar.current.date(byAdding: .day, value: -10, to: Date())!,
            status: .reversed,
            rejectionReason: "Возврат товара",
            expectedConfirmation: nil
        ),
    ]
}
