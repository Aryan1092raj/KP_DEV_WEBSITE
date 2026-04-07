/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        dune: "#000000",
        ember: "#36454F",
        mist: "#36454F",
        pine: "#36454F",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
