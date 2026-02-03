import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab: Tab = .showcase

    enum Tab {
        case showcase
        case active
        case wallet
        case support
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                ShowcaseView()
            }
            .tabItem {
                Label("Витрина", systemImage: "sparkles")
            }
            .tag(Tab.showcase)

            NavigationStack {
                ActiveOffersView()
            }
            .tabItem {
                Label("Активные", systemImage: "bolt.fill")
            }
            .badge(appState.activatedOffers.count)
            .tag(Tab.active)

            NavigationStack {
                WalletView()
            }
            .tabItem {
                Label("Кошелёк", systemImage: "wallet.pass.fill")
            }
            .badge(appState.pendingTransactionsCount)
            .tag(Tab.wallet)

            NavigationStack {
                SupportView()
            }
            .tabItem {
                Label("Помощь", systemImage: "questionmark.circle.fill")
            }
            .tag(Tab.support)
        }
        .tint(.accentColor)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
