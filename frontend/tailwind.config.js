/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',  // Ultra-small screens (320px and up)
        'sm': '640px',  // Small screens (640px and up)
        'md': '768px',  // Medium screens (768px and up)
        'lg': '1024px', // Large screens (1024px and up)
        'xl': '1280px', // Extra large screens (1280px and up)
        '2xl': '1536px', // 2x extra large screens (1536px and up)
      },
    },
  },
  plugins: [],
}
