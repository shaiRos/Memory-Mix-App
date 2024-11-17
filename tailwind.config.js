/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        myprimary: '#2D3250',
        mysecondary: '#424769',
        accent: '#7077A1',
        highlightColor: '#F6B17A',
        highlightColorLight: '#F6B17A85',
        offWhite: '#F7F7F2',
        primaryText: '#2D3250',
        warmRed: '#E64C4C',
        dangerRed: '#D43D3D'
      }
    },
  },
  plugins: [],
}

