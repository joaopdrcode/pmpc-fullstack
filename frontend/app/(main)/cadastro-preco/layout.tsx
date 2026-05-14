import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro de preço — PMPC",
};

export default function CadastroPrecoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
