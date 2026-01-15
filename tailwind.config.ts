import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'light': '#EBE8E2',   
        'weak50': '#F5F3F1',                  
        'strong900': '#1F1D1B',    
        'strong950': '#171717',          
        'sub600': '#66635D',  
        'base': '#827E77',   
        'lighter': '#EBFFEF',     
        'brand': '#FF6A2B',     
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