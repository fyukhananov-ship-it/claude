import SwiftUI

struct SearchBar: View {
    @Binding var text: String
    var placeholder: String = "Поиск"
    var onFilterTap: (() -> Void)? = nil

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.body)
                    .foregroundStyle(.secondary)

                TextField(placeholder, text: $text)
                    .font(.body)
                    .focused($isFocused)
                    .submitLabel(.search)

                if !text.isEmpty {
                    Button {
                        text = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.body)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )

            if let onFilterTap = onFilterTap {
                Button(action: onFilterTap) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.body)
                        .foregroundStyle(Color.accentColor)
                        .padding(10)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                        )
                }
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        SearchBar(text: .constant(""))

        SearchBar(text: .constant("Яндекс"))

        SearchBar(text: .constant(""), onFilterTap: {})
    }
    .padding()
}
