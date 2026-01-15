import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom legal workspace colors
        'legal': {
          'active': '#EBE8E2',      // Active state (buttons, etc.)
          'bg': '#F5F3F1',          // Background color
          'text-primary': '#1F1D1B', // Large text, primary content
          'text-sub': '#66635D',     // Sub text, counts, descriptions
          'text-badge': '#827E77',   // Badge text
          'success': '#EBFFEF',      // Success/approved indicator
          'primary': '#FF6A2B',      // Primary/brand button
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'newsreader': ['var(--font-newsreader)', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;