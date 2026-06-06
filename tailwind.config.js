/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CAIND 브랜드 컬러 - 신뢰감 있는 네이비 + 골드
        primary: {
          DEFAULT: '#1e3a5f',  // CAIND 네이비
          light: '#e8eef5',
          dark: '#0f2440',
          50: '#f0f5fa',
          100: '#dae5f0',
          200: '#b3cae0',
          300: '#7da4c8',
          400: '#4a7baa',
          500: '#2d5a8c',
          600: '#1e3a5f',
          700: '#172d4a',
          800: '#0f2440',
          900: '#0a1a30',
        },
        // CAIND 골드 액센트
        accent: {
          DEFAULT: '#c9a861',  // 골드
          light: '#f5ecd9',
          dark: '#a0843e',
        },
        success: {
          DEFAULT: '#2a7a4e',
          light: '#d8f0e4',
        },
        warning: {
          DEFAULT: '#fffde7',
          border: '#e0c040',
        },
        danger: {
          DEFAULT: '#c0392b',
          light: '#fde8e4',
        },
        gray: {
          DEFAULT: '#e2e2de',
          mid: '#b8b8b4',
          light: '#f5f5f2',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'caind': '0 4px 20px rgba(30, 58, 95, 0.08)',
        'caind-lg': '0 10px 40px rgba(30, 58, 95, 0.12)',
      },
    },
  },
  plugins: [],
}