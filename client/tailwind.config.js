/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Parent Mode Theme
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8', // Secondary
          500: '#6366F1', // Owl Body
          600: '#4F46E5', // Primary
          900: '#312E81',
        },
        gray: {
          50: '#F9FAFB', // Background
          900: '#111827', // Text Primary
        },
        amber: {
          300: '#FCD34D', // Highlight
          500: '#F59E0B', // Accent / Warning
        },
        // Child Mode Theme
        pink: {
          500: '#EC4899', // Primary Play
        },
        violet: {
          500: '#8B5CF6', // Secondary Play
        },
        emerald: {
          400: '#34D399', // Reward
          500: '#10B981', // Success
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Parent Mode
        comic: ['Fredoka', 'Nunito', 'Comic Sans MS', 'cursive'], // Child Mode
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
