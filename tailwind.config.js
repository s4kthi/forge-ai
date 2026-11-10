/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Clean light neutral background
        surface: {
          DEFAULT: '#ffffff', // Crisp white card background
          muted: '#f8fafc',
          elevated: '#ffffff',
          highlight: '#f1f5f9', // slate-100
        },
        border: {
          DEFAULT: '#e2e8f0', // Subtle light grey border
          subtle: '#f1f5f9',
          strong: '#cbd5e1',
        },
        primary: {
          DEFAULT: '#7c3aed', // Restrained electric violet accent
          hover: '#6d28d9',
          subtle: '#f5f3ff',
          border: '#ddd6fe',
        },
        charcoal: {
          DEFAULT: '#202124',
          900: '#202124', // Main text dark charcoal
          800: '#2d3135',
          700: '#3c4043',
          600: '#475467',
          500: '#667085', // Secondary readable grey
          400: '#98a2b3',
          300: '#d0d5dd',
          200: '#eaecf0',
          100: '#f2f4f7',
          50: '#f9fafb',
        },
        accent: {
          blue: '#2563eb',
          cyan: '#0891b2',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
