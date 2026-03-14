/**
 * Cliente HTTP para a API REST do Dashboard Executivo Ambev.
 * Base URL: configurável por VITE_API_BASE_URL (default http://localhost:5000/api/v1).
 * Método: apenas GET (API read-only). Sem autenticação.
 */

import { config } from "@/config/config";

const getBaseUrl = (): string => config.apiBaseUrl;

export const apiBaseUrl = getBaseUrl();

export interface RequestParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: "asc" | "desc";
  fields?: string;
  [key: string]: string | number | boolean | undefined;
}

function buildQueryString(params: RequestParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && typeof body === "object" && "error" in body
      ? (body as { error: string }).error
      : `Erro ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

/**
 * GET para listas: retorna { data, meta }.
 */
export async function apiGetList<T>(
  path: string,
  params: RequestParams = {}
): Promise<{ data: T[]; meta: { total: number; page: number; per_page: number; total_pages: number } }> {
  const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(params)}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  return handleResponse(res);
}

/**
 * GET para recurso único: retorna o objeto ou lança em 404 (body { error }).
 */
export async function apiGetOne<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  return handleResponse(res);
}

/**
 * GET para dashboard: corpo com meta, totais_brasil, skus (sem envelope data/meta de lista).
 */
export async function apiGetDashboard(params: { incluir_skus?: boolean } = {}): Promise<{
  meta: { contagens: Record<string, number>; regioes: string[] };
  totais_brasil: unknown[];
  skus: unknown[];
}> {
  const path = "/dashboard";
  const qs = params.incluir_skus === false ? "?incluir_skus=false" : "?incluir_skus=true";
  const url = `${apiBaseUrl}${path}${qs}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  return handleResponse(res);
}
