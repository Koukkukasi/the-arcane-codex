import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Arcane Codex Dark Fantasy Palette
        arcane: {
          gold: '#C9A227',
          'gold-light': '#E8C547',
          'gold-dark': '#A07D1C',
          crimson: '#7B2D26',
          'crimson-light': '#9E3B32',
          'crimson-dark': '#5A201B',
          cyan: '#4A90A4',
          'cyan-light': '#6BB0C4',
          'cyan-dark': '#3A7084',
          void: '#0D0D0D',
          slate: '#1A1A1F',
          elevated: '#252530',
          surface: '#2D2D3A',
          parchment: '#E8E6E3',
          'parchment-dim': '#B0ADA8'
        }
      },
      fontFamily: {
        display: ['Cinzel Decorative', 'serif'],
        heading: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-arcane': 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1F 50%, #252530 100%)',
        'gradient-gold': 'linear-gradient(135deg, #A07D1C 0%, #C9A227 50%, #E8C547 100%)'
      },
      boxShadow: {
        'arcane': '0 0 20px rgba(201, 162, 39, 0.3)',
        'arcane-lg': '0 0 40px rgba(201, 162, 39, 0.4)',
        'crimson': '0 0 20px rgba(123, 45, 38, 0.4)',
        'cyan': '0 0 20px rgba(74, 144, 164, 0.4)'
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 162, 39, 0.6)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: [typography, daisyui],
  daisyui: {
    themes: [
      {
        arcane: {
          'primary': '#C9A227',
          'primary-content': '#0D0D0D',
          'secondary': '#7B2D26',
          'secondary-content': '#E8E6E3',
          'accent': '#4A90A4',
          'accent-content': '#0D0D0D',
          'neutral': '#2D2D3A',
          'neutral-content': '#E8E6E3',
          'base-100': '#1A1A1F',
          'base-200': '#0D0D0D',
          'base-300': '#252530',
          'base-content': '#E8E6E3',
          'info': '#4A90A4',
          'info-content': '#0D0D0D',
          'success': '#2D5A27',
          'success-content': '#E8E6E3',
          'warning': '#C9A227',
          'warning-content': '#0D0D0D',
          'error': '#7B2D26',
          'error-content': '#E8E6E3'
        }
      }
    ],
    darkTheme: 'arcane'
  }
};
