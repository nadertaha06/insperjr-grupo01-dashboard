const envBase = typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL;
const defaultBase = "http://localhost:5000/api/v1";

export const config = {
  /** Base URL da API REST (em produção definir VITE_API_BASE_URL). */
  apiBaseUrl: (envBase && String(envBase).trim()) || defaultBase,
};