import { getApiBaseUrl } from "@/lib/api";
import { readErrorMessage } from "@/lib/read-error-message";
import type { Fornecedor, Produto } from "@/lib/types";

export async function fetchGestaoListas(): Promise<{
  produtos: Produto[];
  fornecedores: Fornecedor[];
}> {
  const base = getApiBaseUrl();
  const [resP, resF] = await Promise.all([
    fetch(`${base}/produtos`),
    fetch(`${base}/fornecedores`),
  ]);
  if (!resP.ok) {
    throw new Error(await readErrorMessage(resP));
  }
  if (!resF.ok) {
    throw new Error(await readErrorMessage(resF));
  }
  const [produtos, fornecedores] = await Promise.all([
    resP.json() as Promise<Produto[]>,
    resF.json() as Promise<Fornecedor[]>,
  ]);
  return { produtos, fornecedores };
}

export async function createGestaoProduto(nome: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
}

export async function createGestaoFornecedor(
  nome: string,
  cnpj: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/fornecedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, cnpj }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
}
