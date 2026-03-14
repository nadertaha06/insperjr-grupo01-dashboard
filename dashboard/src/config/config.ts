const env = typeof import.meta !== "undefined" ? (import.meta as { env?: ImportMetaEnv }).env : undefined;
const apiUrl = env?.VITE_API_URL ? String(env.VITE_API_URL).trim() : "";
const apiBaseUrlEnv = env?.VITE_API_BASE_URL ? String(env.VITE_API_BASE_URL).trim() : "";

/** Base URL da API (ex.: https://seu-backend.onrender.com/api/v1). Em produção use VITE_API_URL ou VITE_API_BASE_URL. */
function getApiBaseUrl(): string {
  if (apiBaseUrlEnv) return apiBaseUrlEnv.replace(/\/+$/, "");
  if (apiUrl) return `${apiUrl.replace(/\/+$/, "")}/api/v1`;
  if (import.meta.env?.DEV) return "http://localhost:5000/api/v1";
  return "";
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
};