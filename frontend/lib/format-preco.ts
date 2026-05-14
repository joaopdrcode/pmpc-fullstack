/** Preço por litro em reais (valor armazenado já em BRL). */
export function formatBrlPorLitro(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  }).format(value);
}
