const express = require("express");
const produtosRouter = require("./routes/produtos");
const fornecedoresRouter = require("./routes/fornecedores");
const precosRouter = require("./routes/precos");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

const apiV1 = express.Router();

apiV1.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiV1.use("/produtos", produtosRouter);
apiV1.use("/fornecedores", fornecedoresRouter);
apiV1.use("/precos", precosRouter);

app.use("/api/v1", apiV1);

module.exports = app;
