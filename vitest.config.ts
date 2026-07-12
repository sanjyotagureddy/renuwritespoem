import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: [
        "src/lib/auth.ts",
        "src/lib/unsubscribe-helper.ts",
        "src/lib/validations.ts",
        "src/lib/rate-limit.ts",
        "src/lib/contact-guard.ts",
        "src/lib/seo.ts",
        "src/lib/poem-language.ts",
        "src/lib/utils.ts",
        "src/app/actions/auth-actions.ts",
      ],
      reporter: ["text", "json", "html"],
    },
  },
});
