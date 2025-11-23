/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Application-specific extensions
      screens: {
        'xs': '475px',
      },
      colors: {
        // Theme colors for light/dark mode
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      // Touch target utilities for WCAG compliance
      spacing: {
        // Minimum touch targets
        'touch-sm': '44px',  // WCAG 2.5.5 AAA minimum
        'touch-md': '48px',  // Geriatric-friendly minimum (recommended)
        'touch-lg': '56px',  // Extra comfortable for motor impairments
      },
      minHeight: {
        'touch-sm': '44px',
        'touch-md': '48px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch-sm': '44px',
        'touch-md': '48px',
        'touch-lg': '56px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
