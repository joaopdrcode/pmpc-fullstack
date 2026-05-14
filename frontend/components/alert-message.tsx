"use client";

type AlertMessageProps = {
  children: React.ReactNode;
  /** Erro (vermelho) ou sucesso (verde). */
  variant: "error" | "success";
  role?: "alert" | "status";
};

const estilos: Record<AlertMessageProps["variant"], string> = {
  error: "border-rose-500/40 bg-rose-950/40 text-rose-100",
  success: "border-emerald-500/50 bg-emerald-950/40 text-emerald-100",
};

export function AlertMessage({
  children,
  variant,
  role = variant === "error" ? "alert" : "status",
}: AlertMessageProps) {
  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${estilos[variant]}`}
      role={role}
    >
      {children}
    </div>
  );
}
