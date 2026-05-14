import { getApiBaseUrl } from "@/lib/api";
import type { Fornecedor, PrecoRow, Produto } from "@/lib/types";

export type PrecoFilters = {
  idFornecedor: string;
  dataInicio: string;
  dataFim: string;
  valorMin: string;
  valorMax: string;
};

function buildPrecosQuery(
  idProduto: number,
  filters: PrecoFilters,
): URLSearchParams {
  const q = new URLSearchParams();
  q.set("id_produto", String(idProduto));
  if (filters.idFornecedor.trim() !== "") {
    q.set("id_fornecedor", filters.idFornecedor.trim());
  }
  if (filters.dataInicio.trim() !== "") {
    q.set("data_inicio", filters.dataInicio.trim());
  }
  if (filters.dataFim.trim() !== "") {
    q.set("data_fim", filters.dataFim.trim());
  }
  const vmin = filters.valorMin.trim().replace(",", ".");
  if (vmin !== "") {
    q.set("valor_min", vmin);
  }
  const vmax = filters.valorMax.trim().replace(",", ".");
  if (vmax !== "") {
    q.set("valor_max", vmax);
  }
  return q;
}

export async function fetchDashboardProdutos(
  signal?: AbortSignal,
): Promise<Produto[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/produtos`, { signal });
  if (!res.ok) {
    throw new Error(`Produtos: ${res.status}`);
  }
  return res.json() as Promise<Produto[]>;
}

export async function fetchDashboardFornecedores(
  signal?: AbortSignal,
): Promise<Fornecedor[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/fornecedores`, { signal });
  if (!res.ok) {
    throw new Error(`Fornecedores: ${res.status}`);
  }
  return res.json() as Promise<Fornecedor[]>;
}

export async function fetchDashboardPrecos(
  idProduto: number,
  filters: PrecoFilters,
  signal?: AbortSignal,
): Promise<PrecoRow[]> {
  const base = getApiBaseUrl();
  const q = buildPrecosQuery(idProduto, filters);
  const res = await fetch(`${base}/precos?${q.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`Preços: ${res.status}`);
  }
  return res.json() as Promise<PrecoRow[]>;
}

export async function fetchDashboardHistoricoPrecos(
  idProduto: number,
  signal?: AbortSignal,
): Promise<PrecoRow[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/precos/historico/${idProduto}`, {
    signal,
  });
  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }
  return res.json() as Promise<PrecoRow[]>;
}
