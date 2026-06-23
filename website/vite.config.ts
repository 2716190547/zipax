import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "framer-motion"],
          "ui-vendor": ["@heroui/react"],
          "icons-vendor": ["@gravity-ui/icons"],
        },
      },
    },
  },
});
