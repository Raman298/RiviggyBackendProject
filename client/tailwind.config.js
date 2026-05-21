
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: '#FF6B35', light: '#FF8C5A', dark: '#E55A24' },
        dark: { DEFAULT: '#0D0D0D', 2: '#1A1A1A', 3: '#242424' },
        card: '#1E1E1E',
        border: '#2E2E2E',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
      }
    }
  },
  plugins: []
}
