const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "[pmpc backend] DATABASE_URL em falta. Crie backend/.env com DATABASE_URL=... (ver .env.example na raiz).",
  );
  process.exit(1);
}

const app = require("./app");

const PORT = Number(process.env.PORT) || 3001;

const server = app.listen(PORT, () => {
  console.log(`API REST em http://localhost:${PORT}/api/v1`);
});

server.on("error", (err) => {
  if (err && "code" in err && err.code === "EADDRINUSE") {
    console.error(
      `[pmpc backend] Porta ${PORT} já em uso. Feche o outro processo ou defina PORT=3002 no backend/.env.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
