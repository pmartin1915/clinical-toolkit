/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Include shared component content
    './node_modules/@medical-wizards/ui/dist/**/*.js',
  ],
  // Extend the shared design system
  presets: [
    require('@medical-wizards/design-system/tailwind.config.js'),
  ],
  theme: {
    extend: {
      // Application-specific extensions
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}