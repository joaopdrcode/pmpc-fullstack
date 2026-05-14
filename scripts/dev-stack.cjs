/**
 * Sobe Docker (Postgres, migração, Adminer, backend) e inicia o Next.js em modo dev.
 * Uso: na raiz do repo, após `npm install` e variáveis de ambiente configuradas.
 */

const { execSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true, cwd: root });
}

async function waitBackendOk(maxSeconds = 120) {
  const url = "http://127.0.0.1:3001/api/v1/health";
  for (let i = 0; i < maxSeconds; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      /* ainda não disponível */
    }
    if (i > 0 && i % 10 === 0) {
      console.log(`[stack] À espera da API… (${i}s / ${maxSeconds}s)`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(
    `[stack] Timeout: a API não respondeu em ${url} após ${maxSeconds}s. ` +
      "Confirme que a porta 3001 está livre (feche um backend local ou corra npm run ports:free-3001). Logs: docker compose logs backend",
  );
}

function tryStopBackendContainer() {
  try {
    execSync("docker compose stop backend", {
      cwd: root,
      stdio: "pipe",
      shell: true,
    });
  } catch {
    /* sem stack ou já parado */
  }
}

async function main() {
  console.log("[stack] A libertar a porta 3001 (parar backend Docker + processos node órfãos)…");
  tryStopBackendContainer();
  try {
    execSync("node scripts/free-port-3001.cjs", {
      stdio: "inherit",
      shell: true,
      cwd: root,
    });
  } catch {
    /* free-port não deve falhar a stack; no Windows raramente falha */
  }

  console.log("[stack] A subir contentores (Postgres, migração, backend, Adminer)…");
  run("docker compose up -d");

  console.log("[stack] À espera da API (backend)…");
  await waitBackendOk();

  console.log("[stack] A iniciar frontend Next.js (Ctrl+C para parar)…");
  run("npm run dev --workspace=frontend");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
