import type { PrecoRow } from "@/lib/types";
import { toDateKey } from "@/lib/dates";

export type HistoricoGrupo = {
  idFornecedor: number;
  nome: string;
  linhas: PrecoRow[];
};

export function agruparHistoricoPorFornecedor(
  rows: PrecoRow[],
): HistoricoGrupo[] {
  const map = new Map<number, { nome: string; linhas: PrecoRow[] }>();
  for (const r of rows) {
    let g = map.get(r.id_fornecedor);
    if (!g) {
      g = { nome: r.fornecedor_nome, linhas: [] };
      map.set(r.id_fornecedor, g);
    }
    g.linhas.push(r);
  }
  for (const g of map.values()) {
    g.linhas.sort((a, b) => {
      const da = new Date(toDateKey(a.data_vigor)).getTime();
      const db = new Date(toDateKey(b.data_vigor)).getTime();
      if (db !== da) return db - da;
      return b.id - a.id;
    });
  }
  return [...map.entries()]
    .map(([idFornecedor, { nome, linhas }]) => ({
      idFornecedor,
      nome,
      linhas,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}
