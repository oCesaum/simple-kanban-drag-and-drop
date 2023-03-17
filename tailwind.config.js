/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 2px 2px -1px rgba(253, 149, 31, 0.80)',
      }
    },
  },
  plugins: [],
}