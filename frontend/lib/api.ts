const DEFAULT_DEV_API = "http://localhost:3001";
const API_PREFIX = "/api/v1";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * URL base da API REST (inclui `/api/v1`).
 * `NEXT_PUBLIC_API_URL` deve ser a origem do servidor (ex.: `http://localhost:3001`);
 * se já terminar em `/api/v1`, não duplica o prefixo.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  const root =
    fromEnv && fromEnv.length > 0
      ? stripTrailingSlash(fromEnv)
      : process.env.NODE_ENV === "development"
        ? stripTrailingSlash(DEFAULT_DEV_API)
        : "";

  if (!root) {
    throw new Error(
      "Defina NEXT_PUBLIC_API_URL no build (ex.: variável de ambiente no CI ou ficheiro .env.production). Em desenvolvimento local usa-se http://localhost:3001 por defeito.",
    );
  }

  if (root.endsWith(API_PREFIX)) {
    return root;
  }
  return `${root}${API_PREFIX}`;
}
