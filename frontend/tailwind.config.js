/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        dune: "#f4ede1",
        ember: "#ff7a00",
        mist: "#8ea3b8",
        pine: "#0e6b59",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(8, 17, 31, 0.12)",
      },
    },
  },
  plugins: [],
};
