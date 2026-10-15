import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const environment = {
  ...process.env,
  UV_CACHE_DIR: path.join(root, ".uv-cache-question-bank"),
  UV_PROJECT_ENVIRONMENT: path.join(root, ".venv-question-bank"),
};
const python = process.platform === "win32"
  ? path.join(root, ".venv-question-bank", "Scripts", "python.exe")
  : path.join(root, ".venv-question-bank", "bin", "python");

if (!existsSync(python)) {
  console.error("Ambiente ausente. Crie .venv-question-bank e instale pymupdf==1.28.2.");
  process.exit(1);
}

const result = spawnSync(python, process.argv.slice(2), {
  cwd: root,
  env: environment,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}

