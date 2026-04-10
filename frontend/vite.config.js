import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb"],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          network: ["axios"],
          motion: ["motion", "gsap"],
          three: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/rapier"],
          visuals: ["ogl", "meshline"],
        },
      },
    },
  },
});
