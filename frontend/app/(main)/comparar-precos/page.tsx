"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertMessage } from "@/components/alert-message";
import { PrecoTabela } from "@/components/preco-tabela";
import { ProductSelect } from "@/components/product-select";
import type { PrecoRow, Produto } from "@/lib/types";
import {
  fetchCompararPrecosComparativo,
  fetchCompararPrecosProdutos,
} from "@/services/comparar-precos";

export default function CompararPrecosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtroProdutoId, setFiltroProdutoId] = useState<string>("");
  const [linhas, setLinhas] = useState<PrecoRow[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [loadingComparativo, setLoadingComparativo] = useState(true);
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null);
  const [errorComparativo, setErrorComparativo] = useState<string | null>(null);

  const fetchProdutos = useCallback(async (signal?: AbortSignal) => {
    setLoadingProdutos(true);
    try {
      const data = await fetchCompararPrecosProdutos(signal);
      setProdutos(data);
      setErrorProdutos(null);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setErrorProdutos(
        e instanceof Error ? e.message : "Erro ao carregar produtos",
      );
      setProdutos([]);
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  const fetchComparativo = useCallback(
    async (idProduto: string, signal?: AbortSignal) => {
      setLoadingComparativo(true);
      setErrorComparativo(null);
      try {
        const data = await fetchCompararPrecosComparativo(idProduto, signal);
        setLinhas(data);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setErrorComparativo(
          e instanceof Error ? e.message : "Erro ao carregar comparativo",
        );
        setLinhas([]);
      } finally {
        setLoadingComparativo(false);
      }
    },
    [],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- carregar na montagem */
  useEffect(() => {
    const ac = new AbortController();
    void fetchProdutos(ac.signal);
    return () => ac.abort();
  }, [fetchProdutos]);

  useEffect(() => {
    const ac = new AbortController();
    void fetchComparativo(filtroProdutoId, ac.signal);
    return () => ac.abort();
  }, [filtroProdutoId, fetchComparativo]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const linhasOrdenadas = useMemo(() => {
    return [...linhas].sort((a, b) => {
      const prod = a.produto_nome.localeCompare(b.produto_nome, "pt-BR");
      if (prod !== 0) return prod;
      return a.fornecedor_nome.localeCompare(b.fornecedor_nome, "pt-BR");
    });
  }, [linhas]);

  const mostrarColunaProduto = filtroProdutoId === "";
  const colunasComparativo: Array<
    "produto" | "fornecedor" | "data_vigor" | "valor"
  > = mostrarColunaProduto
    ? ["produto", "fornecedor", "data_vigor", "valor"]
    : ["fornecedor", "data_vigor", "valor"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Comparar Preços
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Última data de preço registada por fornecedor (por produto). Filtre por
          produto para focar num item.
        </p>
      </header>

      {errorProdutos || errorComparativo ? (
        <AlertMessage variant="error">
          {[errorProdutos, errorComparativo].filter(Boolean).join(" · ")}
        </AlertMessage>
      ) : null}

      <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <ProductSelect
          id="filtro-produto-comparativo"
          label="Produto"
          produtos={produtos}
          value={filtroProdutoId}
          onValueChange={setFiltroProdutoId}
          disabled={loadingProdutos}
          leadingOption={{ value: "", label: "Todos os produtos" }}
          selectWrapperClassName="mt-2"
          selectClassName="max-w-md sm:w-auto sm:min-w-[18rem]"
        />
      </section>

      <section aria-labelledby="comparativo-tabela-titulo">
        <h2
          id="comparativo-tabela-titulo"
          className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500"
        >
          Comparativo
        </h2>
        {loadingComparativo ? (
          <p className="text-sm text-slate-500">A carregar…</p>
        ) : linhasOrdenadas.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sem dados de preço para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <PrecoTabela
              linhas={linhasOrdenadas}
              colunas={colunasComparativo}
              minWidthClass="min-w-[520px]"
              theadExtraClassName="border-b border-slate-800"
            />
          </div>
        )}
      </section>
    </div>
  );
}
