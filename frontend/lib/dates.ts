export function toDateKey(d: string | Date): string {
  if (d instanceof Date) {
    return d.toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
}

export function formatDatePt(iso: string): string {
  const [y, m, d] = toDateKey(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
