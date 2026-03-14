// Tipos para respostas da API REST (Dashboard Executivo Ambev)
// Estruturas baseadas nas respostas reais do backend Flask.

export interface ListMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: ListMeta;
}

export interface ErrorResponse {
  error: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardContagens {
  skus?: number;
  cenario_atual_br?: number;
  cenarios_semanais?: number;
  custos?: number;
  producao_pcp?: number;
  transferencias?: number;
  [key: string]: number | undefined;
}

// Backend retorna regioes como string[] (ex.: ["CO", "Export", "NENO", "TOTAL"])
export interface DashboardResponse {
  meta: {
    contagens: DashboardContagens;
    regioes: string[];
  };
  totais_brasil: CenarioAtualBrItem[];
  skus: SkuSummary[];
}

// ─── SKU ──────────────────────────────────────────────────────────────────────

export interface SkuSummary {
  _id: string;
  codigo?: string | null;
  nome: string;
  container_type?: string;
  unidade_volume?: string;
  [key: string]: unknown;
}

export interface SkuDetail extends SkuSummary {}

// ─── Cenário atual Brasil ─────────────────────────────────────────────────────
// Nomes de campos exatos conforme a API retorna.

export interface MesDemanda {
  volume_previsto_hl?: number;
}

export interface MesProducao {
  wsnp_hl?: number;
  real_prod_hl?: number;
  realizado_hl?: number;
  programado_1w_hl?: number;
}

export interface MesEstoque {
  estoque_inicial_hl?: number;
  estoque_final_mes_hl?: number;
  suficiencia_inicial_dias?: number;
  suficiencia_final_dias?: number;
  transferencia_malha_hl?: number;
}

export interface MesCenarioBr {
  mes: string;          // "Janeiro", "Fevereiro", etc. (string, nao numero)
  ano: number;
  semanas_no_mes?: number;
  demanda?: MesDemanda;
  producao?: MesProducao;
  estoque?: MesEstoque;
}

export interface CenarioAtualBrItem {
  _id: string;
  sku_id: string;
  geo_regiao: string;
  geo_nome?: string;
  is_total?: boolean;
  meses: MesCenarioBr[];
  [key: string]: unknown;
}

// ─── Cenários semanais ────────────────────────────────────────────────────────
// semanas[].metricas e objeto aninhado

export interface SemanaMetricasObj {
  demanda?: number;
  wsnp?: number;
  estoque_inicial?: number;
  estoque_final?: number;
  suf_inicial_dias?: number;
  suf_final_dias?: number;
  transf_interna?: number;
  transf_ext_cabo?: number;
  transf_ext_rodo?: number;
  transito?: number;
  [key: string]: unknown;
}

export interface SemanaMetricas {
  semana?: string;      // "W0", "W1", "W2", "W3"
  data?: string;        // "2026-02-02"
  metricas?: SemanaMetricasObj;
  [key: string]: unknown;
}

export interface CenarioSemanalItem {
  _id: string;
  sku_id: string;
  sku_nome?: string;
  cenario?: string;
  geo_regiao?: string;
  semanas: SemanaMetricas[];
  [key: string]: unknown;
}

// ─── Custos ───────────────────────────────────────────────────────────────────

export interface CustoItem {
  _id: string;
  sku_id: string;
  sku_nome?: string;
  tipo?: string;
  origem?: string | null;
  destino?: string | null;
  reais_por_hl?: number;
  [key: string]: unknown;
}

// ─── Producao PCP ─────────────────────────────────────────────────────────────

export interface SemanaProducao {
  data?: string;
  volume_produzido_hl?: number;
  [key: string]: unknown;
}

export interface ProducaoPcpItem {
  _id: string;
  sku_id: string;
  sku_nome?: string;
  localidade?: string;
  linha?: string;
  container_type?: string;
  capacidade?: {
    nominal_grf_hora?: number;
    semanal_hl?: number;
    [key: string]: unknown;
  };
  semanas: SemanaProducao[];
  [key: string]: unknown;
}

// ─── Transferencias ───────────────────────────────────────────────────────────
// origem = { regional: string }, destino = { descricao: string; geo: string }

export interface TransferenciaOrigem {
  regional?: string;
  [key: string]: unknown;
}

export interface TransferenciaDestino {
  descricao?: string;
  geo?: string;
  [key: string]: unknown;
}

export interface SemanaTransferencia {
  data?: string;
  volume_hl?: number;
  [key: string]: unknown;
}

export interface TransferenciaItem {
  _id: string;
  sku_id: string;
  sku_nome?: string;
  cod_produto?: number;
  origem?: TransferenciaOrigem | null;
  destino?: TransferenciaDestino | null;
  modal?: string;
  semanas: SemanaTransferencia[];
  [key: string]: unknown;
}
