/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0B6E6E',
          dark: '#084F4F',
          mid: '#0D8888',
          light: '#E0F2F2',
        },
        copper: {
          DEFAULT: '#B87333',
          dark: '#7A4B20',
          light: '#F2D9B8',
        },
        ink: '#0C1A1A',
        coal: '#111A1A',
        panel: {
          DEFAULT: '#162020',
          mid: '#1E2A2A',
        },
        card: '#243030',
        ivory: '#F4EFE6',
        sand: '#F5EDD8',
        g80: '#C8D0D0',
        g60: '#8FA0A0',
        g40: '#5A7070',
        g20: '#2A3A3A',
      },
      fontFamily: {
        display: ['"Palatino Linotype"', 'Georgia', 'serif'],
        body: ['Calibri', '"Segoe UI"', 'system-ui', 'sans-serif'],
        label: ['"Trebuchet MS"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
        input: '4px',
        badge: '2px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(12, 26, 26, 0.06), 0 1px 3px 0 rgba(12, 26, 26, 0.10)',
        panel: '0 4px 12px -2px rgba(12, 26, 26, 0.12)',
      },
      letterSpacing: {
        label: '0.08em',
      },
    },
  },
  plugins: [],
}
