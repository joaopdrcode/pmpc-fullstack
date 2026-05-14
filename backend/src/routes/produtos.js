const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome FROM produtos ORDER BY nome ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("[produtos]", err);
    res.status(500).json({
      error: "Erro ao listar produtos",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.post("/", async (req, res) => {
  const nome =
    typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

  if (!nome) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO produtos (nome) VALUES ($1) RETURNING id, nome",
      [nome],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[produtos POST]", err);
    res.status(500).json({
      error: "Erro ao criar produto",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

module.exports = router;
