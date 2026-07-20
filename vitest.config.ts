import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: [
        "src/lib/auth/index.ts",
        "src/lib/email/unsubscribe-helper.ts",
        "src/lib/validations.ts",
        "src/lib/moderation/rate-limit.ts",
        "src/lib/moderation/contact-guard.ts",
        "src/lib/seo.ts",
        "src/lib/domain/poem-language.ts",
        "src/lib/utils.ts",
        "src/app/actions/auth-actions.ts",
        "src/components/auth/password-field-group.tsx",
      ],
      reporter: ["text", "json", "html"],
    },
  },
});
