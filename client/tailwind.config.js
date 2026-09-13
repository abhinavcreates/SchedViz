/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#1a1a1a',
        surface: '#242424',
        border: '#333333',
        accent: '#e07a3f',
        'accent-hover': '#c96a30',
        // Teal accent — used exclusively in the Memory Management section
        // to give it a visually distinct identity from the CPU (orange) section
        teal: '#2dd4bf',
        'teal-hover': '#1fb2a0',
        'teal-dim': 'rgba(45,212,191,0.12)', // low-opacity tint for backgrounds
        'text-primary': '#f5f0e8',
        'text-muted': '#9a9080',
        error: '#e05252',
        success: '#6bbd6b',
        // Process colors for Gantt chart
        'proc-0': '#e07a3f',
        'proc-1': '#d4a853',
        'proc-2': '#8b6f47',
        'proc-3': '#c94f4f',
        'proc-4': '#6b8c6b',
        'proc-5': '#5b7fa6',
        'proc-6': '#9b59b6',
        'proc-7': '#2ecc71',
        'proc-8': '#e74c3c',
        'proc-9': '#1abc9c',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#333333',
      }
    },
  },
  plugins: [],
};
