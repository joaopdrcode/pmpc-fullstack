"use client";

import { ModalFrame } from "@/components/modal-frame";
import { PrecoTabela } from "@/components/preco-tabela";
import type { HistoricoGrupo } from "@/lib/precos-historico";

type HistoricoPrecosModalProps = {
  open: boolean;
  onClose: () => void;
  tituloProduto: string;
  titleId?: string;
  loading: boolean;
  error: string | null;
  grupos: HistoricoGrupo[];
};

export function HistoricoPrecosModal({
  open,
  onClose,
  tituloProduto,
  titleId = "historico-precos-titulo",
  loading,
  error,
  grupos,
}: HistoricoPrecosModalProps) {
  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      title={`Histórico — ${tituloProduto || "Produto"}`}
      titleId={titleId}
      variant="wide"
      backdropAriaLabel="Fechar histórico"
    >
      {loading ? (
        <p className="text-sm text-slate-500">A carregar…</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : grupos.length === 0 ? (
        <p className="text-sm text-slate-500">
          Sem registos de preço para este produto.
        </p>
      ) : (
        <div className="space-y-8">
          {grupos.map((g) => (
            <section key={g.idFornecedor}>
              <h3 className="mb-2 border-b border-slate-800 pb-1 text-sm font-semibold text-sky-300">
                {g.nome}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <PrecoTabela
                  linhas={g.linhas}
                  colunas={["data_vigor", "valor", "id"]}
                  cabecalhos={{ valor: "Valor (R$/L)" }}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </ModalFrame>
  );
}
