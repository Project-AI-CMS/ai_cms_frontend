import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '2.5rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '5rem',
      },
      borderRadius: {
        'xs': 'calc(var(--radius) - 4px)',
        'sm': 'calc(var(--radius) - 4px)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
        'xl': 'calc(var(--radius) + 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
