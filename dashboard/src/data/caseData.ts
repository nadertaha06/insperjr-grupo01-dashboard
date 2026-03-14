// =============================================
// AMBEV Long Neck (LN) NENO Dashboard Data
// Based on Case Study: Premium Growth in NE Brazil
// =============================================

// --- Historical Demand Data ---
export const historicalDemand = [
  { year: 2021, volume: 1584 },
  { year: 2022, volume: 1824 },
  { year: 2023, volume: 1884 },
  { year: 2024, volume: 1980 },
  { year: 2025, volume: 2160 },
];

// --- Monthly Demand 1H 2026 (KHL) ---
export const monthlyDemand2026 = [
  { month: "Jan", volume: 200 },
  { month: "Fev", volume: 180 },
  { month: "Mar", volume: 170 },
  { month: "Abr", volume: 190 },
  { month: "Mai", volume: 195 },
  { month: "Jun", volume: 200 },
];

// --- New Demand Scenario ---
export const newDemandScenario = {
  original: { month: "Fev", volume: 180 },
  withMalzbier: { month: "Fev", volume: 192 },
  marchOnwards: { month: "Mar+", volume: 211 },
  malzbierIncrease: 30, // % increase in Malzbier Brahma
  totalLNGrowth: 10,    // % growth per month from March
  demandBias: 9,        // % BIAS in last 3 months
};

// --- Production Lines ---
export interface ProductionLine {
  id: string;
  name: string;
  location: string;
  region: string;
  capacityKHL: number;
  products: string[];
  notes?: string;
}

export const productionLines: ProductionLine[] = [
  {
    id: "AQ541",
    name: "AQ541",
    location: "Aquiraz (CE)",
    region: "NO Centro",
    capacityKHL: 50,
    products: ["Malzbier", "Patagonia Amber Lager", "Colorado Lager"],
  },
  {
    id: "NS541",
    name: "NS541",
    location: "Pernambuco",
    region: "NE Norte",
    capacityKHL: 108,
    products: [
      "Brahma Chopp Zero",
      "Goose Island Midway",
      "Malzbier Brahma",
      "Colorado Lager",
      "Skol Beats Senses",
      "Budweiser Zero",
    ],
    notes: "Goose Island Midway no teto da capacidade de líquido",
  },
  {
    id: "UB541",
    name: "UB541",
    location: "Uberlândia (MG)",
    region: "MG",
    capacityKHL: 0,
    products: [],
    notes: "Atende MG e NO Araguaia",
  },
  {
    id: "SPLNs",
    name: "SP Long Necks",
    location: "São Paulo",
    region: "SP",
    capacityKHL: 0,
    products: [],
    notes: "Atende todo o Brasil como backup",
  },
];

// --- Distribution Centers ---
export interface DistributionCenter {
  id: string;
  name: string;
  location: string;
  serves: string[];
}

export const distributionCenters: DistributionCenter[] = [
  {
    id: "CDR_JP",
    name: "CDR João Pessoa",
    location: "NE Norte",
    serves: ["NE Norte", "NO Centro", "MAPAPI"],
  },
  {
    id: "CDR_BA",
    name: "CDR Bahia (Camaçari)",
    location: "NE Sul",
    serves: ["NE Sul"],
  },
];

// --- Logistics / Transfer Modes ---
export interface TransferMode {
  type: string;
  leadTimeDays: number;
  costMultiplier: number;
  damageRisk: number;
  notes: string;
}

export const transferModes: TransferMode[] = [
  {
    type: "Cabotagem",
    leadTimeDays: 25,
    costMultiplier: 1.0,
    damageRisk: 0,
    notes: "Modal padrão para transferências ex-NE",
  },
  {
    type: "Rodoviário",
    leadTimeDays: 6,
    costMultiplier: 1.6,
    damageRisk: 5,
    notes: "60% mais caro que cabotagem, +5% risco de avarias",
  },
];

// --- Regions ---
export interface Region {
  id: string;
  name: string;
  fullName: string;
  color: string;
}

export const regions: Region[] = [
  { id: "mapapi", name: "MAPAPI", fullName: "Maranhão / Pará / Piauí", color: "#f59e0b" },
  { id: "ne_norte", name: "NE Norte", fullName: "Nordeste Norte", color: "#3b82f6" },
  { id: "ne_sul", name: "NE Sul", fullName: "Nordeste Sul", color: "#10b981" },
  { id: "no_araguaia", name: "NO Araguaia", fullName: "Norte Araguaia", color: "#8b5cf6" },
  { id: "no_centro", name: "NO Centro", fullName: "Norte Centro", color: "#ef4444" },
];

// --- Week 0 Inventory Data (02/02/2026) ---
export interface InventoryRow {
  region: string;
  demanda: number;
  wsnp: number;
  estoqueInicial: number;
  sufIniDias: number;
  transfInterna: number;
  transfExtCabo: number;
  transfExtRodo: number;
  transito: number;
  estoqueFinal: number;
  sufFinalDias: number;
}

export const inventoryData: InventoryRow[] = [
  {
    region: "MAPAPI",
    demanda: 2293,
    wsnp: 0,
    estoqueInicial: 3440,
    sufIniDias: 9,
    transfInterna: 2795,
    transfExtCabo: 0,
    transfExtRodo: 0,
    transito: 0,
    estoqueFinal: 3943,
    sufFinalDias: 8,
  },
  {
    region: "NE Norte",
    demanda: 2675,
    wsnp: 0,
    estoqueInicial: 6085,
    sufIniDias: 14,
    transfInterna: 1404,
    transfExtCabo: 0,
    transfExtRodo: 0,
    transito: 0,
    estoqueFinal: 4814,
    sufFinalDias: 12,
  },
  {
    region: "NE Sul",
    demanda: 2066,
    wsnp: 0,
    estoqueInicial: 5464,
    sufIniDias: 16,
    transfInterna: 915,
    transfExtCabo: 0,
    transfExtRodo: 0,
    transito: 0,
    estoqueFinal: 4312,
    sufFinalDias: 12,
  },
  {
    region: "NO Araguaia",
    demanda: 114,
    wsnp: 0,
    estoqueInicial: 0,
    sufIniDias: 0,
    transfInterna: 114,
    transfExtCabo: 0,
    transfExtRodo: 0,
    transito: 0,
    estoqueFinal: 0,
    sufFinalDias: 0,
  },
  {
    region: "NO Centro",
    demanda: 1271,
    wsnp: 12240,
    estoqueInicial: 4734,
    sufIniDias: 22,
    transfInterna: -5229,
    transfExtCabo: -3355,
    transfExtRodo: 0,
    transito: 0,
    estoqueFinal: 7120,
    sufFinalDias: 28,
  },
];

export const inventoryTotals: InventoryRow = {
  region: "TOTAL",
  demanda: 8419,
  wsnp: 12240,
  estoqueInicial: 19724,
  sufIniDias: 14,
  transfInterna: 0,
  transfExtCabo: -3355,
  transfExtRodo: 0,
  transito: 0,
  estoqueFinal: 20189,
  sufFinalDias: 13,
};

// --- Global SAZ Data ---
export const globalSAZData = [
  {
    region: "Europe",
    breweries: 46,
    hlT2: "17 Mio",
    ddcs: 48,
    netRevenue: "$6.2Bi",
    ebitda: "$2.1Bi",
    vlc: "$0.52 Bi",
    scoh: "$14 Mio",
    hlTotal: "95 mio HL (16%)",
  },
  {
    region: "North America",
    breweries: 43,
    hlT2: "17 Mio",
    ddcs: 21,
    netRevenue: "$15.4Bi",
    ebitda: "$4.7Bi",
    vlc: "$1.46 Bi",
    scoh: "$69 Mio",
    hlTotal: "30 mio HL (5%)",
  },
  {
    region: "Middle Americas",
    breweries: 43,
    hlT2: "104 Mio",
    ddcs: 374,
    netRevenue: "$16.3Bi",
    ebitda: "$7.6Bi",
    vlc: "$1.41 Bi",
    scoh: "$51 Mio",
    hlTotal: "148 mio HL (25%)",
  },
  {
    region: "South America",
    breweries: 70,
    hlT2: "80 Mio",
    ddcs: 124,
    netRevenue: "$12.6Bi",
    ebitda: "$4.0Bi",
    vlc: "$1.3 Bi",
    scoh: "$55 Mio",
    hlTotal: "163 mio HL (28%)",
  },
  {
    region: "Africa",
    breweries: 33,
    hlT2: "52 Mio",
    ddcs: 78,
    netRevenue: "$4.2Bi",
    ebitda: "$1.6Bi",
    vlc: "$0.37 Bi",
    scoh: "$15 Mio",
    hlTotal: "57 mio HL (10%)",
  },
  {
    region: "APAC",
    breweries: 16,
    hlT2: "1.5 Mio",
    ddcs: 16,
    netRevenue: "$4.4Bi",
    ebitda: "$1.0Bi",
    vlc: "$0.47 Bi",
    scoh: "$30 Mio",
    hlTotal: "94 mio HL (16%)",
  },
];

// --- Brazil Hardware Data ---
export const brazilHardware = {
  breweries: 29,
  wholesalers: 179,
  ddcs: 88,
  pocs: 1_000_000,
  outboundTrucks: 2_000,
  lastMileVehicles: 8_000,
  citiesCovered: 5_300,
  territoryReach: "95%",
};

// --- KPI Summary ---
export const kpiSummary = {
  totalDemandFev: 180,
  newDemandFev: 192,
  capacidadeNENO: 158, // AQ541 (50) + NS541 (108)
  deficit: 192 - 158,
  doiMinimo: 12,
  crescimentoAnual: ((2160 - 1584) / 1584 * 100).toFixed(1),
};

// --- Demand comparison for scenario ---
export const demandComparison = [
  { month: "Jan", original: 200, novo: 200 },
  { month: "Fev", original: 180, novo: 192 },
  { month: "Mar", original: 170, novo: 211 },
  { month: "Abr", original: 190, novo: 209 },
  { month: "Mai", original: 195, novo: 215 },
  { month: "Jun", original: 200, novo: 220 },
];

// --- Units Table ---
export interface UnitInfo {
  unit: string;
  type: string;
  location: string;
  serves: string;
}

export const unitsTable: UnitInfo[] = [
  { unit: "AQ541", type: "Cervejaria", location: "NO Centro", serves: "Todo o Nordeste e Manaus" },
  { unit: "NS541", type: "Cervejaria", location: "NE Norte", serves: "Todo o Nordeste" },
  { unit: "CDR J. Pessoa", type: "Centro de Distribuição", location: "NE Norte", serves: "NE Norte, NO Centro e MAPAPI" },
  { unit: "CDR Bahia", type: "Centro de Distribuição", location: "NE Sul", serves: "NE Sul" },
  { unit: "SPLNs", type: "Cervejarias", location: "SP", serves: "Todo o Brasil" },
  { unit: "UB541", type: "Cervejaria", location: "MG", serves: "MG e NO Araguaia" },
];
