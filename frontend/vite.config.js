import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Production-only Content Security Policy, injected as a meta tag at build time.
function csp(apiOrigin) {
  return {
    name: "runway-csp",
    apply: "build",
    transformIndexHtml(html) {
      const policy = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com",
        "img-src 'self' data:",
        `connect-src 'self' ${apiOrigin}`.trim(),
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
      return html.replace(
        "<head>",
        `<head>
    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let origin = "";
  try {
    origin = env.VITE_API_URL ? new URL(env.VITE_API_URL).origin : "";
  } catch {
    origin = "";
  }
  return { plugins: [react(), csp(origin)] };
});
