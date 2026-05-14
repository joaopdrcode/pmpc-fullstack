"use client";

import { formatBrlPorLitro } from "@/lib/format-preco";
import { formatDatePt, toDateKey } from "@/lib/dates";
import type { PrecoRow } from "@/lib/types";

export type PrecoTabelaColuna =
  | "data_vigor"
  | "produto"
  | "fornecedor"
  | "valor"
  | "id";

const cabecalhosDefault: Record<PrecoTabelaColuna, string> = {
  data_vigor: "Data vigor",
  produto: "Produto",
  fornecedor: "Fornecedor",
  valor: "Valor (R$/L)",
  id: "ID",
};

type PrecoTabelaProps = {
  linhas: PrecoRow[];
  colunas: PrecoTabelaColuna[];
  cabecalhos?: Partial<Record<PrecoTabelaColuna, string>>;
  minWidthClass?: string;
  /** Bordas entre linhas estilo lista completa (cadastro). */
  linhasComBordaInferior?: boolean;
  /** Ex.: `border-b border-slate-800` (tabela comparativa). */
  theadExtraClassName?: string;
  /** Cabeçalho permanece visível ao fazer scroll no contentor pai. */
  cabecalhoSticky?: boolean;
};

export function PrecoTabela({
  linhas,
  colunas,
  cabecalhos,
  minWidthClass = "min-w-[280px]",
  linhasComBordaInferior = false,
  theadExtraClassName = "",
  cabecalhoSticky = false,
}: PrecoTabelaProps) {
  const th = (c: PrecoTabelaColuna) =>
    cabecalhos?.[c] ?? cabecalhosDefault[c];

  const cellValor = (r: PrecoRow) => (
    <>
      {formatBrlPorLitro(Number(r.valor_por_litro))}{" "}
      <span className="text-slate-500">/ L</span>
    </>
  );

  const rowClass = linhasComBordaInferior
    ? "border-b border-slate-800/80 last:border-0"
    : "border-t border-slate-800/80";

  const theadClassName = cabecalhoSticky
    ? `sticky top-0 z-10 border-b border-slate-800 bg-slate-900 text-xs uppercase text-slate-500 shadow-sm ${theadExtraClassName}`.trim()
    : linhasComBordaInferior
      ? `border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500 ${theadExtraClassName}`.trim()
      : `bg-slate-950/80 text-xs uppercase text-slate-500 ${theadExtraClassName}`.trim();

  return (
    <table className={`w-full ${minWidthClass} text-left text-sm`}>
      <thead className={theadClassName}>
        <tr>
          {colunas.map((c) => (
            <th key={c} className="px-3 py-2 font-medium sm:px-4">
              {th(c)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((r) => (
          <tr key={r.id} className={rowClass}>
            {colunas.map((c) => (
              <td
                key={c}
                className={
                  c === "valor"
                    ? "px-3 py-2 font-medium tabular-nums text-white sm:px-4"
                    : c === "id"
                      ? "px-3 py-2 tabular-nums text-slate-500 sm:px-4"
                      : c === "fornecedor"
                        ? "px-3 py-2 font-medium text-white sm:px-4"
                        : "px-3 py-2 text-slate-200 sm:px-4"
                }
              >
                {c === "data_vigor"
                  ? formatDatePt(toDateKey(r.data_vigor))
                  : c === "produto"
                    ? r.produto_nome
                    : c === "fornecedor"
                      ? r.fornecedor_nome
                      : c === "valor"
                        ? cellValor(r)
                        : r.id}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
