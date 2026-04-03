import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        beeline: {
          yellow: '#FFD500',
          black: '#1A1A1A',
          dark: '#2C2C2C',
          gray: '#6B7280',
          light: '#F5F5F5',
        },
        brand: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFD500',
          600: '#FDD835',
          700: '#F9A825',
          800: '#F57F17',
          900: '#E65100',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
