"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HistoricoPrecosModal } from "@/components/historico-precos-modal";
import { ProductSelect } from "@/components/product-select";
import { AlertMessage } from "@/components/alert-message";
import { formatDatePt, toDateKey } from "@/lib/dates";
import { formatBrlPorLitro } from "@/lib/format-preco";
import { agruparHistoricoPorFornecedor } from "@/lib/precos-historico";
import type { Fornecedor, PrecoRow, Produto } from "@/lib/types";
import {
  type PrecoFilters,
  fetchDashboardFornecedores,
  fetchDashboardHistoricoPrecos,
  fetchDashboardPrecos,
  fetchDashboardProdutos,
} from "@/services/dashboard";

function buildChartSeries(rows: PrecoRow[]) {
  const cell = new Map<string, number>();
  for (const r of rows) {
    const dk = toDateKey(r.data_vigor);
    cell.set(`${dk}|${r.id_fornecedor}`, Number(r.valor_por_litro));
  }

  const dates = [...new Set(rows.map((r) => toDateKey(r.data_vigor)))].sort();
  const fornecedores = [
    ...new Map(
      rows.map((r) => [r.id_fornecedor, r.fornecedor_nome] as const),
    ).entries(),
  ];

  const chartData = dates.map((d) => {
    const point: Record<string, string | number> = { data: d };
    for (const [id, nome] of fornecedores) {
      const v = cell.get(`${d}|${id}`);
      if (v !== undefined) {
        point[nome] = v;
      }
    }
    return point;
  });

  const lineNames = fornecedores.map(([, nome]) => nome);
  return { chartData, lineNames };
}

function latestPerFornecedor(rows: PrecoRow[]): PrecoRow[] {
  const sorted = [...rows].sort((a, b) => {
    const da = new Date(toDateKey(a.data_vigor)).getTime();
    const db = new Date(toDateKey(b.data_vigor)).getTime();
    if (db !== da) return db - da;
    return b.id - a.id;
  });
  const seen = new Set<number>();
  const out: PrecoRow[] = [];
  for (const r of sorted) {
    if (seen.has(r.id_fornecedor)) continue;
    seen.add(r.id_fornecedor);
    out.push(r);
  }
  return out;
}

const LINE_COLORS = [
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#2dd4bf",
  "#c084fc",
];

const emptyFilters: PrecoFilters = {
  idFornecedor: "",
  dataInicio: "",
  dataFim: "",
  valorMin: "",
  valorMax: "",
};

export default function DashboardPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [precos, setPrecos] = useState<PrecoRow[]>([]);
  const [filterDraft, setFilterDraft] = useState<PrecoFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<PrecoFilters>(emptyFilters);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [loadingFornecedores, setLoadingFornecedores] = useState(true);
  const [loadingPrecos, setLoadingPrecos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoError, setHistoricoError] = useState<string | null>(null);
  const [historicoRows, setHistoricoRows] = useState<PrecoRow[]>([]);

  const fetchProdutos = useCallback(async () => {
    setLoadingProdutos(true);
    setError(null);
    try {
      const data = await fetchDashboardProdutos();
      setProdutos(data);
      setSelectedId((prev) => {
        if (prev !== null && data.some((p) => p.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar produtos");
      setProdutos([]);
      setSelectedId(null);
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  const fetchFornecedores = useCallback(async () => {
    setLoadingFornecedores(true);
    try {
      const data = await fetchDashboardFornecedores();
      setFornecedores(data);
    } catch {
      setFornecedores([]);
    } finally {
      setLoadingFornecedores(false);
    }
  }, []);

  const fetchPrecos = useCallback(
    async (
      idProduto: number | null,
      filterParams: PrecoFilters,
      signal?: AbortSignal,
    ) => {
      if (idProduto === null) {
        setPrecos([]);
        return;
      }
      setLoadingPrecos(true);
      setError(null);
      try {
        const data = await fetchDashboardPrecos(
          idProduto,
          filterParams,
          signal,
        );
        setPrecos(data);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Erro ao carregar preços");
        setPrecos([]);
      } finally {
        setLoadingPrecos(false);
      }
    },
    [],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- carregar listas na montagem */
  useEffect(() => {
    void fetchProdutos();
  }, [fetchProdutos]);

  useEffect(() => {
    void fetchFornecedores();
  }, [fetchFornecedores]);

  useEffect(() => {
    const ac = new AbortController();
    void fetchPrecos(selectedId, appliedFilters, ac.signal);
    return () => ac.abort();
  }, [selectedId, appliedFilters, fetchPrecos]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- carregar histórico ao abrir modal */
  useEffect(() => {
    if (!historicoOpen || selectedId === null) {
      return;
    }
    const ac = new AbortController();
    setHistoricoLoading(true);
    setHistoricoError(null);
    void (async () => {
      try {
        const data = await fetchDashboardHistoricoPrecos(
          selectedId,
          ac.signal,
        );
        if (!ac.signal.aborted) {
          setHistoricoRows(data);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setHistoricoError(
          e instanceof Error ? e.message : "Erro ao carregar histórico",
        );
        setHistoricoRows([]);
      } finally {
        if (!ac.signal.aborted) {
          setHistoricoLoading(false);
        }
      }
    })();
    return () => ac.abort();
  }, [historicoOpen, selectedId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const cards = useMemo(() => latestPerFornecedor(precos), [precos]);
  const minValor =
    cards.length > 0
      ? Math.min(...cards.map((c) => Number(c.valor_por_litro)))
      : null;

  const { chartData, lineNames } = useMemo(
    () => buildChartSeries(precos),
    [precos],
  );

  const chartBusy =
    loadingPrecos || loadingProdutos || loadingFornecedores;

  const selectedProductName = useMemo(() => {
    if (selectedId === null) return "";
    return produtos.find((p) => p.id === selectedId)?.nome ?? "";
  }, [selectedId, produtos]);

  const historicoGrupos = useMemo(
    () => agruparHistoricoPorFornecedor(historicoRows),
    [historicoRows],
  );

  const closeHistorico = () => {
    setHistoricoOpen(false);
    setHistoricoError(null);
    setHistoricoRows([]);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Preços por fornecedor ao longo do tempo
        </p>
      </header>

      {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}

      <div className="mb-8 space-y-6">
        <div>
          <label
            htmlFor="produto"
            className="block text-sm font-medium text-slate-300"
          >
            Produto
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ProductSelect
              id="produto"
              omitLabel
              produtos={produtos}
              value={selectedId === null ? "" : String(selectedId)}
              onValueChange={(v) =>
                setSelectedId(v === "" ? null : Number(v))
              }
              disabled={loadingProdutos}
              selectClassName="min-w-[12rem] max-w-md flex-1 sm:min-w-[16rem]"
            />
            <button
              type="button"
              onClick={() => setHistoricoOpen(true)}
              disabled={
                selectedId === null || loadingProdutos || produtos.length === 0
              }
              className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver Histórico
            </button>
          </div>
        </div>

        <section
          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5"
          aria-labelledby="filtros-precos-titulo"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="filtros-precos-titulo"
              className="text-sm font-medium uppercase tracking-wide text-slate-500"
            >
              Filtros
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterDraft({ ...emptyFilters });
                  setAppliedFilters({ ...emptyFilters });
                }}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Limpar filtros
              </button>
              <button
                type="button"
                onClick={() =>
                  setAppliedFilters({ ...filterDraft })
                }
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-sky-400"
              >
                Filtrar
              </button>
            </div>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Preencha os campos opcionais e clique em Filtrar para pesquisar. O
            produto filtra de imediato ao mudar; fornecedor, datas e valores só
            entram no pedido após Filtrar.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label
                htmlFor="filtro-fornecedor"
                className="block text-sm font-medium text-slate-300"
              >
                Fornecedor
              </label>
              <select
                id="filtro-fornecedor"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={filterDraft.idFornecedor}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, idFornecedor: e.target.value }))
                }
                disabled={loadingFornecedores}
              >
                <option value="">Todos</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filtro-data-inicio"
                className="block text-sm font-medium text-slate-300"
              >
                Data inicial
              </label>
              <input
                id="filtro-data-inicio"
                type="date"
                value={filterDraft.dataInicio}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, dataInicio: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="filtro-data-fim"
                className="block text-sm font-medium text-slate-300"
              >
                Data final
              </label>
              <input
                id="filtro-data-fim"
                type="date"
                value={filterDraft.dataFim}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, dataFim: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="filtro-valor-min"
                className="block text-sm font-medium text-slate-300"
              >
                Valor mín. (R$/L)
              </label>
              <input
                id="filtro-valor-min"
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 1,65"
                value={filterDraft.valorMin}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, valorMin: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="filtro-valor-max"
                className="block text-sm font-medium text-slate-300"
              >
                Valor máx. (R$/L)
              </label>
              <input
                id="filtro-valor-max"
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 1,90"
                value={filterDraft.valorMax}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, valorMax: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                autoComplete="off"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Último preço por fornecedor
        </h2>
        {loadingProdutos || (selectedId !== null && chartBusy) ? (
          <p className="text-sm text-slate-500">A carregar…</p>
        ) : selectedId === null ? (
          <p className="text-sm text-slate-500">
            Nenhum produto cadastrado. Adicione produtos e registos na base de
            dados.
          </p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sem registos de preço para este produto (com os filtros actuais).
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const v = Number(c.valor_por_litro);
              const isCheapest =
                minValor !== null && Math.abs(v - minValor) < 1e-9;
              return (
                <li
                  key={c.id_fornecedor}
                  className={`rounded-xl border bg-slate-900/80 px-4 py-4 shadow-lg transition ${
                    isCheapest
                      ? "border-emerald-400/80 ring-2 ring-emerald-400/50"
                      : "border-slate-800"
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {c.fornecedor_nome}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                    {formatBrlPorLitro(v)}
                    <span className="ml-1 text-sm font-normal text-slate-400">
                      / L
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    vigor {formatDatePt(toDateKey(c.data_vigor))}
                  </p>
                  {isCheapest ? (
                    <p className="mt-2 text-xs font-medium text-emerald-400">
                      Mais barato
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          Evolução dos preços
        </h2>
        {selectedId === null ? (
          <p className="text-sm text-slate-500">
            Selecione um produto quando existirem dados.
          </p>
        ) : chartBusy ? (
          <div className="flex h-[360px] items-center justify-center text-slate-500">
            A carregar gráfico…
          </div>
        ) : precos.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center text-slate-500">
            Sem pontos para o gráfico (com os filtros actuais).
          </div>
        ) : (
          <div className="h-[380px] w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="data"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={formatDatePt}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => formatBrlPorLitro(Number(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(l) => `Data: ${formatDatePt(String(l))}`}
                  formatter={(value: number | string) => [
                    `${formatBrlPorLitro(Number(value))} / L`,
                    "Preço",
                  ]}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                {lineNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    name={name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <HistoricoPrecosModal
        open={historicoOpen}
        onClose={closeHistorico}
        tituloProduto={selectedProductName}
        titleId="historico-titulo"
        loading={historicoLoading}
        error={historicoError}
        grupos={historicoGrupos}
      />
    </div>
  );
}
