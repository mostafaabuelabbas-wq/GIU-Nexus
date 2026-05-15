/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        cream:   '#F1EAD9',
        ink:     '#161310',
        sun:     '#E96A3A',
        pink:    '#EE5688',
        ochre:   '#E5A93A',
        palm:    '#2F4A2E',

        // Shorthand aliases used in components
        'nx-cream':  '#F1EAD9',
        'nx-ink':    '#161310',
        'nx-sun':    '#E96A3A',
        'nx-pink':   '#EE5688',
        'nx-ochre':  '#E5A93A',
        'nx-palm':   '#2F4A2E',

        // Category badge colors
        category: {
          frontend:         '#16a34a', // green
          backend:          '#2563eb', // blue
          aiml:             '#7c3aed', // purple
          devops:           '#0d9488', // teal
          dataengineering:  '#ea580c', // orange
          other:            '#6b7280', // grey
        },

        // Application status colors
        status: {
          pending:    '#ca8a04', // yellow
          shortlisted:'#16a34a', // green
          rejected:   '#dc2626', // red
        },
      },

      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"DM Sans"',       'sans-serif'],
        mono:    ['"JetBrains Mono"','monospace'],
        arabic:  ['"Cairo"', '"IBM Plex Arabic"', 'sans-serif'],
      },

      keyframes: {
        tickerScroll: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        cursorBlink: {
          '50%': { opacity: '0' },
        },
      },
      animation: {
        ticker:         'tickerScroll 38s linear infinite',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },

      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}