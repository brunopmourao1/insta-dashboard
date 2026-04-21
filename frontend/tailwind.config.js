/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design system fiel ao Stitch — Obsidian Zenith
        surface: {
          DEFAULT: '#131314',
          dim: '#131314',
          bright: '#3a393a',
          low: '#1c1b1c',
          container: '#201f20',
          high: '#2a2a2b',
          highest: '#353436',
          lowest: '#0e0e0f',
        },
        primary: {
          DEFAULT: '#ffafd2',
          container: '#c13584',
          fixed: '#ffd8e6',
          dim: '#ffafd2',
        },
        secondary: {
          DEFAULT: '#e3b5ff',
          container: '#6c209e',
        },
        tertiary: {
          DEFAULT: '#ffb1c0',
          container: '#b14c66',
        },
        'on-surface': '#e5e2e3',
        'on-surface-variant': '#dcbfc9',
        'on-primary': '#63003f',
        'outline-variant': '#564149',
        'error-default': '#ffb4ab',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #c13584, #cb80fe)',
        'gradient-card': 'linear-gradient(135deg, rgba(193,53,132,0.08), rgba(203,128,254,0.04))',
      },
      boxShadow: {
        ambient: '0 20px 60px -5px rgba(229,226,227,0.06)',
        glow: '0 0 24px rgba(193,53,132,0.25)',
      },
    },
  },
  plugins: [],
}

