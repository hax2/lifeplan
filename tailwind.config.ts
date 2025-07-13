import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enable dark mode based on the 'dark' class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        skin: {
          bg     : 'var(--c-bg)',
          card   : 'var(--c-card)',
          border : 'var(--c-border)',
          text   : 'var(--c-text)',
          accent : 'var(--c-accent)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
