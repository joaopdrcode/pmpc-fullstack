"use client";

import type { Produto } from "@/lib/types";

const baseSelectClass =
  "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50";

export type ProductSelectLeadingOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ProductSelectProps = {
  id: string;
  /** Se omitido, não renderiza &lt;label&gt; (use `htmlFor` no rótulo externo). */
  label?: string;
  omitLabel?: boolean;
  produtos: Produto[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  /** Opção inicial (ex.: «Todos os produtos» ou «—»). */
  leadingOption?: ProductSelectLeadingOption | null;
  /** Primeira opção desactivada (ex.: «Selecione…» em formulários). */
  placeholderOption?: { label: string };
  /** Classes no envoltório entre label e select (ex.: `mt-2`). */
  selectWrapperClassName?: string;
  /** Classes extra no &lt;select&gt;. */
  selectClassName?: string;
  required?: boolean;
};

export function ProductSelect({
  id,
  label,
  omitLabel = false,
  produtos,
  value,
  onValueChange,
  disabled = false,
  leadingOption = null,
  placeholderOption,
  selectClassName: selectExtra = "",
  selectWrapperClassName = "mt-1",
  required = false,
}: ProductSelectProps) {
  const empty = produtos.length === 0;
  const selectEl = (
    <select
      id={id}
      required={required}
      className={`block w-full ${baseSelectClass} ${selectExtra}`.trim()}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled || empty}
    >
      {leadingOption ? (
        <option
          value={leadingOption.value}
          disabled={leadingOption.disabled}
        >
          {leadingOption.label}
        </option>
      ) : null}
      {placeholderOption ? (
        <option value="" disabled>
          {placeholderOption.label}
        </option>
      ) : null}
      {!leadingOption && !placeholderOption && empty ? (
        <option value="">—</option>
      ) : null}
      {produtos.map((p) => (
        <option key={p.id} value={String(p.id)}>
          {p.nome}
        </option>
      ))}
    </select>
  );

  if (omitLabel) {
    return selectEl;
  }

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      ) : null}
      {label ? (
        <div className={selectWrapperClassName}>{selectEl}</div>
      ) : (
        selectEl
      )}
    </div>
  );
}
