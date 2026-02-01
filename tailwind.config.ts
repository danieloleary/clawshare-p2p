/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Red palette
        'red-50': '#ffebee',
        'red-100': '#ffcdd2',
        'red-200': '#ef9a9a',
        'red-300': '#e57373',
        'red-400': '#ef5350',
        'red-500': '#e53935',
        'red-600': '#d32f2f',
        'red-700': '#c62828',
        // Black & White
        'surface': '#ffffff',
        'on-surface': '#1a1a1a',
        'surface-dark': '#121212',
        'on-surface-dark': '#e1e1e1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '24px',
      },
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'elevation-2': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
