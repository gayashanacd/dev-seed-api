import { defineConfig, searchForWorkspaceRoot } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    fs: {
      // The docs config is generated from the backend's (data-free) pack definitions
      allow: [searchForWorkspaceRoot(process.cwd()), "../api/packs"],
    },
  },
})
