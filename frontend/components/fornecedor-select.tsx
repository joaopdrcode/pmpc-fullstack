"use client";

import type { Fornecedor } from "@/lib/types";

const baseSelectClass =
  "rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50";

type FornecedorSelectProps = {
  id: string;
  label?: string;
  omitLabel?: boolean;
  fornecedores: Fornecedor[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholderOption?: { label: string };
  selectClassName?: string;
  selectWrapperClassName?: string;
  required?: boolean;
};

export function FornecedorSelect({
  id,
  label,
  omitLabel = false,
  fornecedores,
  value,
  onValueChange,
  disabled = false,
  placeholderOption,
  selectClassName: selectExtra = "",
  selectWrapperClassName = "mt-1",
  required = false,
}: FornecedorSelectProps) {
  const empty = fornecedores.length === 0;
  const selectEl = (
    <select
      id={id}
      required={required}
      className={`block w-full ${baseSelectClass} ${selectExtra}`.trim()}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled || empty}
    >
      {placeholderOption ? (
        <option value="" disabled>
          {placeholderOption.label}
        </option>
      ) : null}
      {!placeholderOption && empty ? <option value="">—</option> : null}
      {fornecedores.map((f) => (
        <option key={f.id} value={String(f.id)}>
          {f.nome}
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
