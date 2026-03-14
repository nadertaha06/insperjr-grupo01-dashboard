/**
 * Serviços da API REST — rotas e parâmetros conforme especificação do backend.
 */

import {
  apiGetList,
  apiGetOne,
  apiGetDashboard,
  type RequestParams,
} from "./client";
import type {
  DashboardResponse,
  SkuSummary,
  SkuDetail,
  CenarioAtualBrItem,
  CenarioSemanalItem,
  CustoItem,
  ProducaoPcpItem,
  TransferenciaItem,
} from "./types";

// ——— Dashboard ———
export function fetchDashboard(incluirSkus = true) {
  return apiGetDashboard({ incluir_skus: incluirSkus });
}

export type DashboardData = DashboardResponse;

// ——— SKUs ———
export function fetchSkus(params: RequestParams & { container_type?: string; codigo?: string } = {}) {
  return apiGetList<SkuSummary>("/skus", params);
}

export function fetchSkuById(skuId: string) {
  return apiGetOne<SkuDetail>(`/skus/${encodeURIComponent(skuId)}`);
}

// ——— Cenário atual Brasil ———
export function fetchCenarioAtualBr(
  params: RequestParams & { sku_id?: string; geo_regiao?: string; is_total?: boolean } = {}
) {
  return apiGetList<CenarioAtualBrItem>("/cenario-atual-br", params);
}

export function fetchCenarioAtualBrPorRegiao(geoRegiao: string) {
  return apiGetOne<CenarioAtualBrItem | CenarioAtualBrItem[]>(
    `/cenario-atual-br/${encodeURIComponent(geoRegiao)}`
  );
}

// ——— Cenários semanais ———
export function fetchCenariosSemanais(
  params: RequestParams & { sku_id?: string; cenario?: string; geo_regiao?: string } = {}
) {
  return apiGetList<CenarioSemanalItem>("/cenarios-semanais", params);
}

export function fetchCenariosSemanaisPorSku(skuId: string, params: RequestParams = {}) {
  return apiGetList<CenarioSemanalItem>(
    `/cenarios-semanais/${encodeURIComponent(skuId)}`,
    params
  );
}

// ——— Custos ———
export function fetchCustos(
  params: RequestParams & { sku_id?: string; tipo?: string; origem?: string; destino?: string } = {}
) {
  return apiGetList<CustoItem>("/custos", params);
}

export function fetchCustosPorSku(skuId: string, params: RequestParams = {}) {
  return apiGetList<CustoItem>(`/custos/${encodeURIComponent(skuId)}`, params);
}

// ——— Produção PCP ———
export function fetchProducaoPcp(
  params: RequestParams & { sku_id?: string; localidade?: string; linha?: string } = {}
) {
  return apiGetList<ProducaoPcpItem>("/producao-pcp", params);
}

export function fetchProducaoPcpPorSku(skuId: string, params: RequestParams = {}) {
  return apiGetList<ProducaoPcpItem>(`/producao-pcp/${encodeURIComponent(skuId)}`, params);
}

// ——— Transferências ———
export function fetchTransferencias(
  params: RequestParams & { sku_id?: string; modal?: string; destino_geo?: string } = {}
) {
  return apiGetList<TransferenciaItem>("/transferencias", params);
}

export function fetchTransferenciasPorSku(skuId: string, params: RequestParams = {}) {
  return apiGetList<TransferenciaItem>(`/transferencias/${encodeURIComponent(skuId)}`, params);
}
