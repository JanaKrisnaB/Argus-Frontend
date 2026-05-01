/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0a0a0f',
        surface: '#12121a',
        border:  '#1e1e2e',
        accent:  '#6366f1',
        'accent-hover': '#818cf8',
        muted:   '#64748b',
        low:     '#eab308',
        medium:  '#f97316',
        high:    '#ef4444',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
