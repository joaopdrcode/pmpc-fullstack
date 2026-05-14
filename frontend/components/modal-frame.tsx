"use client";

type ModalFrameProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: React.ReactNode;
  /** Diálogo compacto (formulários). */
  variant?: "form" | "wide";
  backdropAriaLabel?: string;
};

export function ModalFrame({
  open,
  onClose,
  title,
  titleId,
  children,
  variant = "form",
  backdropAriaLabel = "Fechar",
}: ModalFrameProps) {
  if (!open) return null;

  if (variant === "wide") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          aria-label={backdropAriaLabel}
          onClick={onClose}
        />
        <div
          className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Fechar
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label={backdropAriaLabel}
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-lg font-semibold text-white">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
