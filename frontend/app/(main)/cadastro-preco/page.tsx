"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertMessage } from "@/components/alert-message";
import { FornecedorSelect } from "@/components/fornecedor-select";
import { ModalFrame } from "@/components/modal-frame";
import { PrecoTabela } from "@/components/preco-tabela";
import { ProductSelect } from "@/components/product-select";
import { todayIsoDate, toDateKey } from "@/lib/dates";
import type { Fornecedor, PrecoRow, Produto } from "@/lib/types";
import {
  createCadastroPreco,
  fetchCadastroPrecoListas,
} from "@/services/cadastro-preco";

const ITENS_POR_PAGINA_OPCOES = [5, 10, 15] as const;
type ItensPorPagina = (typeof ITENS_POR_PAGINA_OPCOES)[number];

export default function CadastroPrecoPage() {
  const [precos, setPrecos] = useState<PrecoRow[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [idProduto, setIdProduto] = useState("");
  const [idFornecedor, setIdFornecedor] = useState("");
  const [dataVigor, setDataVigor] = useState(() => todayIsoDate());
  const [valorStr, setValorStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [flash, setFlash] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [itensPorPagina, setItensPorPagina] = useState<ItensPorPagina>(10);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { produtos: dataP, fornecedores: dataF, precos: dataC } =
        await fetchCadastroPrecoListas();
      setProdutos(dataP);
      setFornecedores(dataF);
      const sorted = [...dataC].sort((a, b) => {
        const da = new Date(toDateKey(a.data_vigor)).getTime();
        const db = new Date(toDateKey(b.data_vigor)).getTime();
        if (db !== da) return db - da;
        return b.id - a.id;
      });
      setPrecos(sorted);
      setPaginaAtual(1);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Erro ao carregar dados");
      setPrecos([]);
      setProdutos([]);
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- carregar na montagem */
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(t);
  }, [flash]);

  const closeModal = (force?: boolean) => {
    if (!force && submitting) return;
    setModalOpen(false);
    setIdProduto("");
    setIdFornecedor("");
    setDataVigor(todayIsoDate());
    setValorStr("");
    setFormError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const valorNorm = valorStr.trim().replace(",", ".");
      const valorNum = Number.parseFloat(valorNorm);
      await createCadastroPreco({
        id_produto: Number.parseInt(idProduto, 10),
        id_fornecedor: Number.parseInt(idFornecedor, 10),
        data_vigor: dataVigor,
        valor_por_litro: valorNum,
      });
      setSubmitting(false);
      closeModal(true);
      setFlash({ type: "success", text: "Preço registado com sucesso." });
      await loadAll();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro de rede ao guardar.";
      setFormError(msg);
      setFlash({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(precos.length / itensPorPagina),
  );
  const paginaReal = Math.min(Math.max(1, paginaAtual), totalPaginas);
  const indiceInicial = (paginaReal - 1) * itensPorPagina;
  const precosNaPagina = useMemo(
    () => precos.slice(indiceInicial, indiceInicial + itensPorPagina),
    [precos, indiceInicial, itensPorPagina],
  );

  const irPaginaAnterior = () => {
    setPaginaAtual((p) => {
      const cur = Math.min(Math.max(1, p), totalPaginas);
      return Math.max(1, cur - 1);
    });
  };

  const irPaginaSeguinte = () => {
    setPaginaAtual((p) => {
      const cur = Math.min(Math.max(1, p), totalPaginas);
      return Math.min(totalPaginas, cur + 1);
    });
  };

  const intervaloTexto =
    precos.length === 0
      ? "0 de 0"
      : `${indiceInicial + 1}–${Math.min(indiceInicial + itensPorPagina, precos.length)} de ${precos.length}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Cadastro de preço
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Lista de preços por litro (R$) e inclusão de novos registos
        </p>
      </header>

      {flash ? (
        <AlertMessage
          variant={flash.type === "success" ? "success" : "error"}
          role="status"
        >
          {flash.text}
        </AlertMessage>
      ) : null}

      {listError ? (
        <AlertMessage variant="error">{listError}</AlertMessage>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Preços registados
        </h2>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400"
        >
          Adicionar preço
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">A carregar…</p>
        ) : precos.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Sem preços registados.</p>
        ) : (
          <div className="flex max-h-[min(32rem,60vh)] min-h-[12rem] flex-col">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-3 py-2.5 sm:px-4">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="cadastro-itens-pagina"
                  className="text-sm text-slate-400"
                >
                  Itens por página
                </label>
                <select
                  id="cadastro-itens-pagina"
                  value={itensPorPagina}
                  onChange={(e) => {
                    setItensPorPagina(
                      Number(e.target.value) as ItensPorPagina,
                    );
                    setPaginaAtual(1);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  {ITENS_POR_PAGINA_OPCOES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm tabular-nums text-slate-400">
                {intervaloTexto}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={paginaReal <= 1}
                  onClick={irPaginaAnterior}
                  className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-xs text-slate-500">
                  Página {paginaReal} de {totalPaginas}
                </span>
                <button
                  type="button"
                  disabled={paginaReal >= totalPaginas}
                  onClick={irPaginaSeguinte}
                  className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Seguinte
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              <PrecoTabela
                linhas={precosNaPagina}
                colunas={[
                  "data_vigor",
                  "produto",
                  "fornecedor",
                  "valor",
                  "id",
                ]}
                cabecalhos={{ valor: "Preço / L" }}
                minWidthClass="min-w-[640px]"
                linhasComBordaInferior
                cabecalhoSticky
              />
            </div>
          </div>
        )}
      </div>

      <ModalFrame
        title="Novo preço"
        titleId="cadastro-preco-modal-title"
        open={modalOpen}
        onClose={() => closeModal()}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="cp-produto"
              className="block text-sm font-medium text-slate-300"
            >
              Produto
            </label>
            <ProductSelect
              id="cp-produto"
              omitLabel
              required
              produtos={produtos}
              value={idProduto}
              onValueChange={setIdProduto}
              placeholderOption={{ label: "Selecione…" }}
              selectClassName="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="cp-fornecedor"
              className="block text-sm font-medium text-slate-300"
            >
              Fornecedor
            </label>
            <FornecedorSelect
              id="cp-fornecedor"
              omitLabel
              required
              fornecedores={fornecedores}
              value={idFornecedor}
              onValueChange={setIdFornecedor}
              placeholderOption={{ label: "Selecione…" }}
              selectClassName="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="cp-data"
              className="block text-sm font-medium text-slate-300"
            >
              Data de vigor
            </label>
            <input
              id="cp-data"
              type="date"
              required
              value={dataVigor}
              onChange={(e) => setDataVigor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label
              htmlFor="cp-valor"
              className="block text-sm font-medium text-slate-300"
            >
              Preço por litro (R$)
            </label>
            <input
              id="cp-valor"
              type="text"
              inputMode="decimal"
              required
              value={valorStr}
              onChange={(e) => setValorStr(e.target.value)}
              placeholder="Ex.: 5,759 ou 5.759"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              autoComplete="off"
            />
          </div>
          {formError ? (
            <p className="text-sm text-rose-400">{formError}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => closeModal()}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-w-[7.5rem] items-center justify-center rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
                    aria-hidden
                  />
                  A guardar…
                </span>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
}
