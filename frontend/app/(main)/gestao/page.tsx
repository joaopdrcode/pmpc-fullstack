"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertMessage } from "@/components/alert-message";
import { ModalFrame } from "@/components/modal-frame";
import type { Fornecedor, Produto } from "@/lib/types";
import {
  createGestaoFornecedor,
  createGestaoProduto,
  fetchGestaoListas,
} from "@/services/gestao";

export default function GestaoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [modalProduto, setModalProduto] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState(false);

  const [nomeProduto, setNomeProduto] = useState("");
  const [nomeFornecedor, setNomeFornecedor] = useState("");
  const [cnpjFornecedor, setCnpjFornecedor] = useState("");

  const [savingProduto, setSavingProduto] = useState(false);
  const [savingFornecedor, setSavingFornecedor] = useState(false);
  const [formErrorProduto, setFormErrorProduto] = useState<string | null>(null);
  const [formErrorFornecedor, setFormErrorFornecedor] = useState<string | null>(
    null,
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { produtos: dataP, fornecedores: dataF } =
        await fetchGestaoListas();
      setProdutos(dataP);
      setFornecedores(dataF);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Erro ao carregar listas");
      setProdutos([]);
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- carregar listas na montagem */
  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const closeProdutoModal = () => {
    setModalProduto(false);
    setNomeProduto("");
    setFormErrorProduto(null);
  };

  const closeFornecedorModal = () => {
    setModalFornecedor(false);
    setNomeFornecedor("");
    setCnpjFornecedor("");
    setFormErrorFornecedor(null);
  };

  const submitProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduto(true);
    setFormErrorProduto(null);
    try {
      await createGestaoProduto(nomeProduto);
      closeProdutoModal();
      await loadAll();
    } catch (err) {
      setFormErrorProduto(
        err instanceof Error ? err.message : "Erro ao guardar",
      );
    } finally {
      setSavingProduto(false);
    }
  };

  const submitFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFornecedor(true);
    setFormErrorFornecedor(null);
    try {
      await createGestaoFornecedor(nomeFornecedor, cnpjFornecedor);
      closeFornecedorModal();
      await loadAll();
    } catch (err) {
      setFormErrorFornecedor(
        err instanceof Error ? err.message : "Erro ao guardar",
      );
    } finally {
      setSavingFornecedor(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Gestão
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Produtos e fornecedores cadastrados
        </p>
      </header>

      {listError ? (
        <AlertMessage variant="error">{listError}</AlertMessage>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Produtos
            </h2>
            <button
              type="button"
              onClick={() => {
                setFormErrorProduto(null);
                setModalProduto(true);
              }}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400"
            >
              Novo produto
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">A carregar…</p>
            ) : produtos.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Sem produtos.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">Nome</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800/80 last:border-0"
                    >
                      <td className="px-4 py-2 tabular-nums text-slate-400">
                        {p.id}
                      </td>
                      <td className="px-4 py-2 text-slate-200">{p.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Fornecedores
            </h2>
            <button
              type="button"
              onClick={() => {
                setFormErrorFornecedor(null);
                setModalFornecedor(true);
              }}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-400"
            >
              Novo fornecedor
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">A carregar…</p>
            ) : fornecedores.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Sem fornecedores.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">Nome</th>
                    <th className="px-4 py-2 font-medium">CNPJ</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-slate-800/80 last:border-0"
                    >
                      <td className="px-4 py-2 tabular-nums text-slate-400">
                        {f.id}
                      </td>
                      <td className="px-4 py-2 text-slate-200">{f.nome}</td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-300">
                        {f.cnpj}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <ModalFrame
        title="Novo produto"
        titleId="gestao-modal-produto-title"
        open={modalProduto}
        onClose={() => {
          if (!savingProduto) closeProdutoModal();
        }}
      >
        <form onSubmit={submitProduto} className="space-y-4">
          <div>
            <label
              htmlFor="nome-produto"
              className="block text-sm font-medium text-slate-300"
            >
              Nome
            </label>
            <input
              id="nome-produto"
              required
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Ex.: Gasolina 95"
              autoComplete="off"
            />
          </div>
          {formErrorProduto ? (
            <p className="text-sm text-rose-400">{formErrorProduto}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={savingProduto}
              onClick={closeProdutoModal}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingProduto}
              className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50"
            >
              {savingProduto ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalFrame>

      <ModalFrame
        title="Novo fornecedor"
        titleId="gestao-modal-fornecedor-title"
        open={modalFornecedor}
        onClose={() => {
          if (!savingFornecedor) closeFornecedorModal();
        }}
      >
        <form onSubmit={submitFornecedor} className="space-y-4">
          <div>
            <label
              htmlFor="nome-fornecedor"
              className="block text-sm font-medium text-slate-300"
            >
              Nome
            </label>
            <input
              id="nome-fornecedor"
              required
              value={nomeFornecedor}
              onChange={(e) => setNomeFornecedor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Ex.: Posto Central"
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="cnpj-fornecedor"
              className="block text-sm font-medium text-slate-300"
            >
              CNPJ (14 dígitos)
            </label>
            <input
              id="cnpj-fornecedor"
              required
              inputMode="numeric"
              maxLength={18}
              value={cnpjFornecedor}
              onChange={(e) => setCnpjFornecedor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Apenas números ou com máscara"
              autoComplete="off"
            />
          </div>
          {formErrorFornecedor ? (
            <p className="text-sm text-rose-400">{formErrorFornecedor}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={savingFornecedor}
              onClick={closeFornecedorModal}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingFornecedor}
              className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50"
            >
              {savingFornecedor ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
}
