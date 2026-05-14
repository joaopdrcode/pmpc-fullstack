const { execSync } = require("node:child_process");
const os = require("node:os");

const PORT = 3001;
const LOG = "[ports:free-3001]";

/** Processos que não devemos terminar (porta publicada pelo Docker, etc.). */
const DO_NOT_KILL = new Set([
  "docker-proxy.exe",
  "vpnkit.exe",
  "wslrelay.exe",
]);

function processNameForPidWin(pid) {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /NH /FO CSV`, {
      encoding: "utf8",
    }).trim();
    if (!out || out.startsWith("INFO:")) return "";
    const first = out.split(",")[0]?.replace(/^"|"$/g, "") ?? "";
    return first.toLowerCase();
  } catch {
    return "";
  }
}

function collectListeningPidsWin() {
  let out;
  try {
    out = execSync("netstat -ano", { encoding: "utf8" });
  } catch {
    return [];
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!line.includes(`:${PORT}`) || !line.includes("LISTENING")) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }
  return [...pids];
}

function freePort3001Win() {
  for (const pid of collectListeningPidsWin()) {
    const name = processNameForPidWin(pid);
    if (DO_NOT_KILL.has(name)) {
      console.log(
        `${LOG} A ignorar ${name || "desconhecido"} (PID ${pid}) — ligado ao Docker ou rede.`,
      );
      continue;
    }
    if (name === "node.exe") {
      try {
        console.log(`${LOG} A terminar node.exe (PID ${pid}) na porta ${PORT}…`);
        execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      } catch {
        /* já terminou ou sem permissões */
      }
      continue;
    }
    if (name) {
      console.warn(
        `${LOG} Porta ${PORT} em uso por "${name}" (PID ${pid}). Feche manualmente ou ajuste a porta.`,
      );
    }
  }
}

if (os.platform() === "win32") {
  freePort3001Win();
} else {
  console.error(
    `${LOG} Automático só no Windows. Se a porta ${PORT} estiver ocupada: lsof -i :${PORT} ou equivalente.`,
  );
}
