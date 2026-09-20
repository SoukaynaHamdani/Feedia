/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agricultural: {
          green: {
            light: '#d1fae5',
            DEFAULT: '#10b981',
            dark: '#047857',
          },
          sunset: {
            light: '#fef3c7',
            DEFAULT: '#f59e0b',
            dark: '#b45309',
          },
          wheat: '#f8fafc',
          soil: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
