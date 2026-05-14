export async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; detail?: string };
    return body.error ?? body.detail ?? `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
}
