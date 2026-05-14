const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function parseOptionalInt(raw) {
  if (raw === undefined || raw === "") return null;
  const n = Number.parseInt(String(raw), 10);
  return Number.isNaN(n) ? Number.NaN : n;
}

function parseOptionalFloat(raw) {
  if (raw === undefined || raw === "") return null;
  const s = String(raw).trim().replace(",", ".");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : Number.NaN;
}

router.get("/historico/:idProduto", async (req, res) => {
  const idProduto = Number.parseInt(String(req.params.idProduto ?? ""), 10);
  if (Number.isNaN(idProduto) || idProduto < 1) {
    res.status(400).json({ error: "id_produto inválido" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT r.id,
             r.id_produto,
             p.nome AS produto_nome,
             r.id_fornecedor,
             f.nome AS fornecedor_nome,
             r.valor_por_litro,
             r.data_vigor
      FROM precos r
      JOIN produtos p ON p.id = r.id_produto
      JOIN fornecedores f ON f.id = r.id_fornecedor
      WHERE r.id_produto = $1
      ORDER BY r.data_vigor ASC, r.id ASC`,
      [idProduto],
    );
    res.json(rows);
  } catch (err) {
    console.error("[precos GET historico]", err);
    res.status(500).json({
      error: "Erro ao listar histórico de preços",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

/** Último registo (data_vigor mais recente) por par (produto, fornecedor). */
router.get("/comparativo", async (req, res) => {
  const idProduto = parseOptionalInt(req.query.id_produto);
  if (idProduto !== null && Number.isNaN(idProduto)) {
    res.status(400).json({ error: "id_produto inválido" });
    return;
  }

  try {
    const params = [];
    let where = "";
    if (idProduto !== null) {
      params.push(idProduto);
      where = `WHERE r.id_produto = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT DISTINCT ON (r.id_produto, r.id_fornecedor)
             r.id,
             r.id_produto,
             p.nome AS produto_nome,
             r.id_fornecedor,
             f.nome AS fornecedor_nome,
             r.valor_por_litro,
             r.data_vigor
       FROM precos r
       JOIN produtos p ON p.id = r.id_produto
       JOIN fornecedores f ON f.id = r.id_fornecedor
       ${where}
       ORDER BY r.id_produto, r.id_fornecedor, r.data_vigor DESC, r.id DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    console.error("[precos GET comparativo]", err);
    res.status(500).json({
      error: "Erro ao listar comparativo de preços",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/", async (req, res) => {
  const idProduto = parseOptionalInt(req.query.id_produto);
  const idFornecedor = parseOptionalInt(req.query.id_fornecedor);
  const dataInicioRaw =
    typeof req.query.data_inicio === "string" ? req.query.data_inicio.trim() : "";
  const dataFimRaw =
    typeof req.query.data_fim === "string" ? req.query.data_fim.trim() : "";

  const valorMin = parseOptionalFloat(req.query.valor_min);
  const valorMax = parseOptionalFloat(req.query.valor_max);

  if (idProduto !== null && Number.isNaN(idProduto)) {
    res.status(400).json({ error: "id_produto inválido" });
    return;
  }
  if (idFornecedor !== null && Number.isNaN(idFornecedor)) {
    res.status(400).json({ error: "id_fornecedor inválido" });
    return;
  }
  if (dataInicioRaw && !/^\d{4}-\d{2}-\d{2}$/.test(dataInicioRaw)) {
    res.status(400).json({ error: "data_inicio deve ser YYYY-MM-DD" });
    return;
  }
  if (dataFimRaw && !/^\d{4}-\d{2}-\d{2}$/.test(dataFimRaw)) {
    res.status(400).json({ error: "data_fim deve ser YYYY-MM-DD" });
    return;
  }
  if (dataInicioRaw && dataFimRaw && dataInicioRaw > dataFimRaw) {
    res.status(400).json({ error: "data_inicio não pode ser posterior a data_fim" });
    return;
  }
  if (valorMin !== null && Number.isNaN(valorMin)) {
    res.status(400).json({ error: "valor_min inválido" });
    return;
  }
  if (valorMax !== null && Number.isNaN(valorMax)) {
    res.status(400).json({ error: "valor_max inválido" });
    return;
  }
  if (
    valorMin !== null &&
    valorMax !== null &&
    valorMin > valorMax
  ) {
    res.status(400).json({ error: "valor_min não pode ser maior que valor_max" });
    return;
  }

  try {
    const conditions = [];
    const params = [];
    let p = 1;

    if (idProduto !== null) {
      conditions.push(`r.id_produto = $${p}`);
      params.push(idProduto);
      p += 1;
    }
    if (idFornecedor !== null) {
      conditions.push(`r.id_fornecedor = $${p}`);
      params.push(idFornecedor);
      p += 1;
    }
    if (dataInicioRaw) {
      conditions.push(`r.data_vigor >= $${p}::date`);
      params.push(dataInicioRaw);
      p += 1;
    }
    if (dataFimRaw) {
      conditions.push(`r.data_vigor <= $${p}::date`);
      params.push(dataFimRaw);
      p += 1;
    }
    if (valorMin !== null) {
      conditions.push(`r.valor_por_litro >= $${p}`);
      params.push(valorMin);
      p += 1;
    }
    if (valorMax !== null) {
      conditions.push(`r.valor_por_litro <= $${p}`);
      params.push(valorMax);
      p += 1;
    }

    let sql = `
      SELECT r.id,
             r.id_produto,
             p.nome AS produto_nome,
             r.id_fornecedor,
             f.nome AS fornecedor_nome,
             r.valor_por_litro,
             r.data_vigor
      FROM precos r
      JOIN produtos p ON p.id = r.id_produto
      JOIN fornecedores f ON f.id = r.id_fornecedor
    `;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    sql += " ORDER BY r.data_vigor ASC, r.id ASC";

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("[precos GET]", err);
    res.status(500).json({
      error: "Erro ao listar preços",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.post("/", async (req, res) => {
  const idProduto = Number.parseInt(String(req.body?.id_produto ?? ""), 10);
  const idFornecedor = Number.parseInt(String(req.body?.id_fornecedor ?? ""), 10);
  const dataVigorRaw =
    typeof req.body?.data_vigor === "string" ? req.body.data_vigor.trim() : "";
  const valorRaw = req.body?.valor_por_litro;

  if (Number.isNaN(idProduto) || idProduto < 1) {
    res.status(400).json({ error: "Produto inválido" });
    return;
  }
  if (Number.isNaN(idFornecedor) || idFornecedor < 1) {
    res.status(400).json({ error: "Fornecedor inválido" });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataVigorRaw)) {
    res.status(400).json({ error: "data_vigor deve ser YYYY-MM-DD" });
    return;
  }

  let valor;
  if (typeof valorRaw === "number" && Number.isFinite(valorRaw)) {
    valor = valorRaw;
  } else if (typeof valorRaw === "string") {
    const normalized = valorRaw.trim().replace(",", ".");
    valor = Number.parseFloat(normalized);
  } else {
    valor = Number.NaN;
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    res.status(400).json({ error: "valor_por_litro deve ser um número positivo" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO precos (id_produto, id_fornecedor, valor_por_litro, data_vigor)
       VALUES ($1, $2, $3, $4::date)
       RETURNING id, id_produto, id_fornecedor, valor_por_litro, data_vigor`,
      [idProduto, idFornecedor, valor, dataVigorRaw],
    );

    const row = rows[0];
    const full = await pool.query(
      `SELECT r.id,
              r.id_produto,
              p.nome AS produto_nome,
              r.id_fornecedor,
              f.nome AS fornecedor_nome,
              r.valor_por_litro,
              r.data_vigor
       FROM precos r
       JOIN produtos p ON p.id = r.id_produto
       JOIN fornecedores f ON f.id = r.id_fornecedor
       WHERE r.id = $1`,
      [row.id],
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    if (err && err.code === "23503") {
      res.status(400).json({ error: "Produto ou fornecedor não existe" });
      return;
    }
    console.error("[precos POST]", err);
    res.status(500).json({
      error: "Erro ao criar preço",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

module.exports = router;
