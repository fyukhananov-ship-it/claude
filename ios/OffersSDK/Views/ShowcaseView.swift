import SwiftUI

struct ShowcaseView: View {
    @EnvironmentObject var appState: AppState
    @State private var showFilters = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Search bar
                SearchBar(
                    text: $appState.searchQuery,
                    placeholder: "Партнёр или категория",
                    onFilterTap: { showFilters = true }
                )
                .padding(.horizontal)

                // Categories
                CategoryScroll(selectedCategory: $appState.filters.category)

                // Content
                if appState.filteredOffers.isEmpty {
                    EmptyStateView(
                        icon: "magnifyingglass",
                        title: "Ничего не найдено",
                        subtitle: "Попробуйте изменить параметры поиска или фильтры"
                    )
                    .frame(minHeight: 300)
                } else {
                    VStack(spacing: 24) {
                        // For You section
                        if appState.searchQuery.isEmpty && appState.filters.category == nil {
                            OfferSection(
                                title: "Для вас",
                                icon: "sparkles",
                                offers: appState.forYouOffers
                            )
                        }

                        // Popular section
                        if !appState.popularOffers.isEmpty && appState.searchQuery.isEmpty {
                            HorizontalOfferSection(
                                title: "Популярное",
                                icon: "flame.fill",
                                offers: appState.popularOffers
                            )
                        }

                        // All offers
                        OfferSection(
                            title: appState.searchQuery.isEmpty ? "Все офферы" : "Результаты",
                            icon: "square.grid.2x2.fill",
                            offers: appState.filteredOffers,
                            showAll: true
                        )
                    }
                }
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Выгоды")
        .sheet(isPresented: $showFilters) {
            FilterSheet(filters: $appState.filters)
        }
    }
}

// MARK: - Offer Section

struct OfferSection: View {
    @EnvironmentObject var appState: AppState
    let title: String
    let icon: String
    let offers: [Offer]
    var showAll: Bool = false

    var displayedOffers: [Offer] {
        showAll ? offers : Array(offers.prefix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Label(title, systemImage: icon)
                    .font(.title3)
                    .fontWeight(.bold)

                Spacer()

                if !showAll && offers.count > 3 {
                    NavigationLink {
                        AllOffersView(title: title, offers: offers)
                    } label: {
                        Text("Все")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.accentColor)
                    }
                }
            }
            .padding(.horizontal)

            // Offers
            LazyVStack(spacing: 12) {
                ForEach(displayedOffers) { offer in
                    NavigationLink(value: offer) {
                        OfferCard(
                            offer: offer,
                            isActivated: appState.isOfferActivated(offer.id)
                        )
                    }
                }
            }
            .padding(.horizontal)
        }
        .navigationDestination(for: Offer.self) { offer in
            OfferDetailView(offer: offer)
        }
    }
}

// MARK: - Horizontal Offer Section

struct HorizontalOfferSection: View {
    @EnvironmentObject var appState: AppState
    let title: String
    let icon: String
    let offers: [Offer]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: icon)
                .font(.title3)
                .fontWeight(.bold)
                .padding(.horizontal)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(offers.prefix(6)) { offer in
                        NavigationLink(value: offer) {
                            OfferCardCompact(offer: offer)
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationDestination(for: Offer.self) { offer in
            OfferDetailView(offer: offer)
        }
    }
}

// MARK: - All Offers View

struct AllOffersView: View {
    @EnvironmentObject var appState: AppState
    let title: String
    let offers: [Offer]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(offers) { offer in
                    NavigationLink(value: offer) {
                        OfferCard(
                            offer: offer,
                            isActivated: appState.isOfferActivated(offer.id)
                        )
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(title)
        .navigationDestination(for: Offer.self) { offer in
            OfferDetailView(offer: offer)
        }
    }
}

#Preview {
    NavigationStack {
        ShowcaseView()
    }
    .environmentObject(AppState())
}
