/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0806',
        roast: '#16100C',
        travertine: '#F2EBE0',
        crema: '#C88A4B',
        amber: '#E5A95C',
        cherry: '#A62B2B',
        moss: '#3D5A45',
        parchment: '#EFE7DA',
        espresso: '#1A120D',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
};
