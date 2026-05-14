const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome, cnpj FROM fornecedores ORDER BY nome ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("[fornecedores]", err);
    res.status(500).json({
      error: "Erro ao listar fornecedores",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.post("/", async (req, res) => {
  const nome =
    typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  const cnpjRaw =
    typeof req.body?.cnpj === "string" ? req.body.cnpj.trim() : "";
  const cnpj = cnpjRaw.replace(/\D/g, "");

  if (!nome) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }
  if (cnpj.length !== 14) {
    res.status(400).json({ error: "CNPJ deve ter 14 dígitos" });
    return;
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO fornecedores (nome, cnpj) VALUES ($1, $2) RETURNING id, nome, cnpj",
      [nome, cnpj],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      res.status(409).json({ error: "CNPJ já cadastrado" });
      return;
    }
    console.error("[fornecedores POST]", err);
    res.status(500).json({
      error: "Erro ao criar fornecedor",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

module.exports = router;
