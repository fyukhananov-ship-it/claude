import SwiftUI

struct WalletView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedFilter: TransactionStatus? = nil

    private var filteredTransactions: [Transaction] {
        guard let filter = selectedFilter else {
            return appState.transactions
        }
        return appState.transactions.filter { $0.status == filter }
    }

    private var totalEarned: Double {
        appState.transactions
            .filter { $0.status == .confirmed }
            .reduce(0) { $0 + $1.benefitAmount }
    }

    private var pendingAmount: Double {
        appState.transactions
            .filter { $0.status == .pending }
            .reduce(0) { $0 + $1.benefitAmount }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Summary card
                summaryCard

                // Filter tabs
                filterTabs

                // Transactions list
                if filteredTransactions.isEmpty {
                    EmptyStateView(
                        icon: "wallet.pass",
                        title: "Нет операций",
                        subtitle: selectedFilter == nil
                            ? "Ваши начисления появятся здесь после покупок по офферам"
                            : "Нет операций с таким статусом"
                    )
                    .frame(minHeight: 200)
                } else {
                    transactionsList
                }
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Кошелёк")
    }

    // MARK: - Summary Card

    private var summaryCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 24) {
                // Total earned
                VStack(alignment: .leading, spacing: 4) {
                    Text("Получено")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("\(Int(totalEarned))₽")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundStyle(.green)
                }

                Divider()
                    .frame(height: 40)

                // Pending
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ожидает")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("\(Int(pendingAmount))₽")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundStyle(.orange)
                }

                Spacer()
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
        .padding(.horizontal)
    }

    // MARK: - Filter Tabs

    private var filterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                FilterTab(
                    title: "Все",
                    count: appState.transactions.count,
                    isSelected: selectedFilter == nil
                ) {
                    selectedFilter = nil
                }

                ForEach(TransactionStatus.allCases, id: \.self) { status in
                    let count = appState.transactions.filter { $0.status == status }.count
                    if count > 0 {
                        FilterTab(
                            title: status.rawValue,
                            count: count,
                            color: status.color,
                            isSelected: selectedFilter == status
                        ) {
                            selectedFilter = status
                        }
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Transactions List

    private var transactionsList: some View {
        LazyVStack(spacing: 0) {
            ForEach(filteredTransactions) { transaction in
                NavigationLink(value: transaction) {
                    TransactionRow(transaction: transaction)
                }
                .padding(.horizontal)

                if transaction.id != filteredTransactions.last?.id {
                    Divider()
                        .padding(.leading, 56)
                        .padding(.horizontal)
                }
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.background)
        )
        .padding(.horizontal)
        .navigationDestination(for: Transaction.self) { transaction in
            TransactionDetailView(transaction: transaction)
        }
    }
}

// MARK: - Filter Tab

struct FilterTab: View {
    let title: String
    let count: Int
    var color: Color = .accentColor
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text("\(count)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        Capsule()
                            .fill(isSelected ? .white.opacity(0.3) : Color(.systemGray5))
                    )
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(isSelected ? color : Color(.systemGray6))
            )
            .foregroundStyle(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        WalletView()
    }
    .environmentObject(AppState())
}
