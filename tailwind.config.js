/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-foreground': '#f8fafc',
        secondary: '#0ea5e9',
        'secondary-foreground': '#0f172a',
        muted: '#f1f5f9',
        'muted-foreground': '#475569',
      },
      fontFamily: {
        sans: ['"Cairo"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 25px -15px rgba(15, 23, 42, 0.25)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
          xl: '3rem',
        },
      },
    },
  },
  plugins: [],
}

