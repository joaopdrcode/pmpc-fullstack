import { getApiBaseUrl } from "@/lib/api";
import { readErrorMessage } from "@/lib/read-error-message";
import type { Fornecedor, PrecoRow, Produto } from "@/lib/types";

export type CadastroPrecoCriarBody = {
  id_produto: number;
  id_fornecedor: number;
  data_vigor: string;
  valor_por_litro: number;
};

export async function fetchCadastroPrecoListas(): Promise<{
  produtos: Produto[];
  fornecedores: Fornecedor[];
  precos: PrecoRow[];
}> {
  const base = getApiBaseUrl();
  const [resP, resF, resC] = await Promise.all([
    fetch(`${base}/produtos`),
    fetch(`${base}/fornecedores`),
    fetch(`${base}/precos`),
  ]);
  if (!resP.ok) {
    throw new Error(await readErrorMessage(resP));
  }
  if (!resF.ok) {
    throw new Error(await readErrorMessage(resF));
  }
  if (!resC.ok) {
    throw new Error(await readErrorMessage(resC));
  }
  const [produtos, fornecedores, precos] = await Promise.all([
    resP.json() as Promise<Produto[]>,
    resF.json() as Promise<Fornecedor[]>,
    resC.json() as Promise<PrecoRow[]>,
  ]);
  return { produtos, fornecedores, precos };
}

export async function createCadastroPreco(
  body: CadastroPrecoCriarBody,
): Promise<PrecoRow> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/precos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json() as Promise<PrecoRow>;
}
