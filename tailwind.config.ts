import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0079BF',
        secondary: '#F2D680',
        success: '#51E898',
        danger: '#FF6B6B',
        warning: '#FFD93D',
      },
      shadows: {
        card: '0 1px 3px rgba(0,0,0,0.12)',
        elevated: '0 8px 16px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
export default config
