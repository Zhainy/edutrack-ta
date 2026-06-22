/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(222, 47%, 5%)',
          card: 'hsl(222, 47%, 8%)',
          elevated: 'hsl(222, 47%, 11%)',
        },
        primary: {
          DEFAULT: 'hsl(239, 84%, 67%)',
          light: 'hsl(192, 91%, 36%)',
        },
        'text-primary': 'hsl(210, 40%, 96%)',
        'text-secondary': 'hsl(215, 20%, 65%)',
        'text-muted': 'hsl(215, 14%, 46%)',
        status: {
          positive: 'hsl(160, 84%, 39%)',
          warning: 'hsl(43, 96%, 56%)',
          critical: 'hsl(350, 89%, 60%)',
          info: 'hsl(199, 89%, 48%)',
        },
        border: {
          DEFAULT: 'hsl(215, 28%, 17%)',
          focus: 'hsl(239, 84%, 67%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
