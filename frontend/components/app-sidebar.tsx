"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/gestao", label: "Gestão" },
  { href: "/cadastro-preco", label: "Cadastro de preço" },
  { href: "/comparar-precos", label: "Comparar Preços" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-slate-800 bg-slate-900/90">
      <div className="border-b border-slate-800 px-4 py-4">
        <Link
          href="/"
          className="font-mono text-xs font-semibold tracking-[0.25em] text-sky-400 hover:text-sky-300"
        >
          PMPC
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
          Menu
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Principal">
        {links.map(({ href, label }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
