/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ho: {
          sau:   '#0a1628',
          nong:  '#1a3a5c',
          anh:   '#4a9eda',
          san_ho:'#e88b6e',
          accent:'#7ec8e3',
        },
      },
    },
  },
  plugins: [],
}
