/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F4',
        warm: {
          50: '#FEF7F0',
          100: '#FDEBD6',
          200: '#F9D4AC',
          300: '#F2B87A',
          400: '#E89B4B',
          500: '#D4792A',
          600: '#B8611E',
          700: '#964D17',
        },
        charcoal: {
          100: '#E8E4E0',
          300: '#A69E95',
          500: '#6B6259',
          700: '#3D3730',
          900: '#1E1A16',
        },
        sage: {
          100: '#EEF2EB',
          500: '#7A8B6F',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(30,26,22,0.04), 0 4px 12px rgba(30,26,22,0.06)',
        'card-hover': '0 4px 8px rgba(30,26,22,0.06), 0 12px 28px rgba(30,26,22,0.1)',
        elevated: '0 8px 24px rgba(30,26,22,0.08), 0 20px 48px rgba(30,26,22,0.12)',
        header: '0 1px 0 rgba(30,26,22,0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
