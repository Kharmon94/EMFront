/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode (via .dark class on html element)
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

