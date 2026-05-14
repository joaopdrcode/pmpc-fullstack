import { getApiBaseUrl } from "@/lib/api";
import type { PrecoRow, Produto } from "@/lib/types";

export async function fetchCompararPrecosProdutos(
  signal?: AbortSignal,
): Promise<Produto[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/produtos`, { signal });
  if (!res.ok) {
    throw new Error(`Produtos: ${res.status}`);
  }
  return res.json() as Promise<Produto[]>;
}

/**
 * @param idProdutoFiltro id em string ou vazio para todos os produtos
 */
export async function fetchCompararPrecosComparativo(
  idProdutoFiltro: string,
  signal?: AbortSignal,
): Promise<PrecoRow[]> {
  const base = getApiBaseUrl();
  const q = new URLSearchParams();
  if (idProdutoFiltro.trim() !== "") {
    q.set("id_produto", idProdutoFiltro.trim());
  }
  const qs = q.toString();
  const url =
    qs === ""
      ? `${base}/precos/comparativo`
      : `${base}/precos/comparativo?${qs}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Comparativo: ${res.status}`);
  }
  return res.json() as Promise<PrecoRow[]>;
}
