import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  const full = resolve(process.cwd(), filePath);
  if (!existsSync(full)) return;
  const content = readFileSync(full, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-env.mjs <command> [args...]");
  process.exit(1);
}

const [cmd, ...rest] = args;
const result = spawnSync(cmd, rest, { stdio: "inherit", shell: true, env: process.env });
process.exit(result.status ?? 1);
