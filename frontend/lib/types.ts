export type Produto = { id: number; nome: string };

export type Fornecedor = { id: number; nome: string; cnpj?: string };

export type PrecoRow = {
  id: number;
  id_produto: number;
  produto_nome: string;
  id_fornecedor: number;
  fornecedor_nome: string;
  valor_por_litro: string | number;
  data_vigor: string;
};
