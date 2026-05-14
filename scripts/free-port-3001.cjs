const { execSync } = require("node:child_process");
const os = require("node:os");

const PORT = 3001;

if (os.platform() !== "win32") {
  console.error(
    "[ports:free-3001] Só está automatizado no Windows. Feche manualmente o que usa a porta",
    PORT,
  );
  process.exit(0);
}

let out;
try {
  out = execSync("netstat -ano", { encoding: "utf8" });
} catch {
  process.exit(0);
}

const pids = new Set();
for (const line of out.split(/\r?\n/)) {
  if (!line.includes(`:${PORT}`) || !line.includes("LISTENING")) continue;
  const parts = line.trim().split(/\s+/);
  const pid = parts[parts.length - 1];
  if (/^\d+$/.test(pid)) pids.add(pid);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
  } catch {
    // ignorar (já terminou ou sem permissões)
  }
}
