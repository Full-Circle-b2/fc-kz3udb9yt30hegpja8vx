import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(".");
mkdirSync(resolve(root, "dist"), { recursive: true });
cpSync(resolve(root, "src"), resolve(root, "dist"), { recursive: true });
writeFileSync(
  resolve(root, "dist", "runtime-config.js"),
  `window.__APP_CONFIG__ = ${JSON.stringify({
    apiBaseUrl: process.env.FRONTEND_API_BASE_URL || "",
    projectTitle: process.env.PROJECT_TITLE || "LEGEND HAS IT - Prospective Release Partners",
  }, null, 2)};`
);
