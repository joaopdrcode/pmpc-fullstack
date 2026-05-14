import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — PMPC",
};

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
