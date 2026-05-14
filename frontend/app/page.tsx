import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c4a6e] to-slate-900 px-6 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.35), transparent)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex max-w-lg flex-col items-center gap-6">
        <h1 className="font-mono text-5xl font-bold tracking-[0.35em] text-white sm:text-6xl sm:tracking-[0.4em]">
          PMPC
        </h1>
        <p className="text-base leading-relaxed text-sky-100/85 sm:text-lg">
          Painel de monitoramento de preços de combustível.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-900/40 transition hover:bg-sky-300"
        >
          Ver Painel
        </Link>
      </div>
    </main>
  );
}
