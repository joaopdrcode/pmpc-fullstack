import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão — PMPC",
};

export default function GestaoSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
