import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// nitro is build-only; Vercel is the deploy target for production builds.
const { nitro } = await import("nitro/vite");

export default defineConfig(async ({ command, mode }) => {
  const plugins = [];

  // TanStack devtools — development only.
  if (command === "serve" || mode === "development") {
    const { devtools } = await import("@tanstack/devtools-vite");
    plugins.push(
      devtools({
        logging: false,
        eventBusConfig: { enabled: false },
        enhancedLogs: { enabled: false },
        consolePiping: { enabled: false },
        removeDevtoolsOnBuild: false,
        injectSource: { enabled: true },
      }),
    );
  }

  plugins.push(
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this.
      server: { entry: "server" },
    }),
    viteReact(),
  );

  // Nitro is the SSR/deploy layer — target Vercel on production builds.
  if (command === "build") {
    // Inline dynamic-import chunks into a single server bundle. Without this,
    // rolldown splits the SSR entry and a shared chunk into two files that
    // circularly import each other, and createCsrfMiddleware evaluates as
    // `undefined` at module load, 500-ing every request.
    plugins.push(
      nitro({
        preset: "vercel",
        rolldownConfig: { output: { inlineDynamicImports: true } },
      }),
    );
  }

  // Inline VITE_* env vars so they are available to both client and server builds.
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(loadedEnv).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ]),
  );

  return {
    define,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    plugins,
    server: { host: "::", port: 8080 },
  };
});
