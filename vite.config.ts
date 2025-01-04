import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    port: 3000,
  },
  ssr: {
    target: "webworker",
    noExternal: true,
    resolve: {
      conditions: ["workerd", "browser"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom",
        "react-dom/server",
        "react-router",
        "discord-interactions",
      ],
    },
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext({ context }) {
        return { cloudflare: context.cloudflare };
      },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
