/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#030303', // Deepest black
        foreground: '#ffffff', // Pure white text
        card: '#0a0a0a', // Slightly lighter black for cards
        cardForeground: '#ffffff',
        muted: '#141414',
        mutedForeground: '#a1a1aa', // Subtle gray
        border: '#1f1f1f', // Dark borders
        input: '#1f1f1f',
        primary: '#ccff00', // Solno Neon Yellow as primary
        primaryForeground: '#000000', // Black text on neon yellow
        brand: '#ccff00', 
        brandForeground: '#000000',
        danger: '#ef4444', 
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ccff00 0%, #8ca800 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(20, 20, 20, 0.4) 0%, rgba(10, 10, 10, 0.8) 100%)',
      },
      boxShadow: {
        'corporate': '0 4px 30px -2px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px -5px rgba(204, 255, 0, 0.4)',
        'glow-strong': '0 0 30px 0px rgba(204, 255, 0, 0.6)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(110px)' },
          '100%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
