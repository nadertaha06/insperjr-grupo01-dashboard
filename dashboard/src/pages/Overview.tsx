import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  ReferenceLine,
} from "recharts";
import { BeerBottle, TrendUp, Warning, Factory, Truck, Package } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useDashboard } from "@/hooks/useDashboard";
import { fetchCenarioAtualBr } from "@/api/services";
import type { CenarioAtualBrItem } from "@/api/types";
import {
  historicalDemand,
  inventoryData as fallbackInventoryData,
  newDemandScenario,
  brazilHardware,
  monthlyDemand2026 as fallbackMonthlyDemand,
} from "@/data/caseData";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];
const MIN_DOI = 12;

// Sub-regiões que compõem o NENO
const NENO_SUBREGIONS = ["MAPAPI", "NE Norte", "NE Sul", "NO Araguaia", "NO Centro"];

const MES_ABBR: Record<string, string> = {
  Janeiro: "Jan", Fevereiro: "Fev", Março: "Mar", Abril: "Abr",
  Maio: "Mai", Junho: "Jun", Julho: "Jul", Agosto: "Ago",
  Setembro: "Set", Outubro: "Out", Novembro: "Nov", Dezembro: "Dez",
};

const tooltipStyle = {
  borderRadius: 10,
  fontSize: 13,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  padding: "10px 14px",
};

// Capacidade NENO (fixo do case: AQ541=50 + NS541=108)
const CAPACIDADE_NENO = 158; // KHL/mês
// Nova demanda Fev: original + 12 KHL (30% × ~40 KHL base Malzbier)
const MALZBIER_EXTRA_KHL = 12;

export function Overview() {
  const { data: dashboard, loading, error, refetch } = useDashboard();
  const [cenarioPorRegiao, setCenarioPorRegiao] = useState<CenarioAtualBrItem[]>([]);
  const [loadingCenario, setLoadingCenario] = useState(false);

  useEffect(() => {
    setLoadingCenario(true);
    fetchCenarioAtualBr({ per_page: 200 })
      .then((res) => setCenarioPorRegiao(res.data))
      .catch(() => setCenarioPorRegiao([]))
      .finally(() => setLoadingCenario(false));
  }, []);

  const contagens = dashboard?.meta?.contagens ?? {};

  // ── Dados NENO ──────────────────────────────────────────────────────────
  // Tenta entry direto "NENO"; se não encontrado, agrega sub-regiões
  const nenoEntry = cenarioPorRegiao.find((r) => r.geo_regiao === "NENO");
  const nenoDireto = nenoEntry;

  // Meses NENO: do entry direto ou fallback do case
  const nenoMesesDireto = nenoDireto?.meses ?? [];

  // Agrega sub-regiões se não tiver entry direto
  const nenoMesesAgregados = (() => {
    if (nenoMesesDireto.length > 0) return nenoMesesDireto;
    const subs = cenarioPorRegiao.filter((r) =>
      NENO_SUBREGIONS.includes(r.geo_regiao ?? "")
    );
    if (!subs.length) return [];
    const mesMap: Record<string, { demandaHL: number; wsnpHL: number; efHL: number; eiHL: number; sufDias: number; count: number }> = {};
    for (const sub of subs) {
      for (const m of sub.meses ?? []) {
        if (!mesMap[m.mes]) mesMap[m.mes] = { demandaHL: 0, wsnpHL: 0, efHL: 0, eiHL: 0, sufDias: 0, count: 0 };
        mesMap[m.mes].demandaHL += m.demanda?.volume_previsto_hl ?? 0;
        mesMap[m.mes].wsnpHL += m.producao?.wsnp_hl ?? 0;
        mesMap[m.mes].efHL += m.estoque?.estoque_final_mes_hl ?? 0;
        mesMap[m.mes].eiHL += m.estoque?.estoque_inicial_hl ?? 0;
        mesMap[m.mes].sufDias += m.estoque?.suficiencia_final_dias ?? 0;
        mesMap[m.mes].count += 1;
      }
    }
    // Constrói array de meses sintético compatível com CenarioAtualBrItem.meses
    return Object.entries(mesMap).map(([mes, v]) => ({
      mes,
      demanda: { volume_previsto_hl: v.demandaHL },
      producao: { wsnp_hl: v.wsnpHL },
      estoque: {
        estoque_inicial_hl: v.eiHL,
        estoque_final_mes_hl: v.efHL,
        suficiencia_final_dias: v.count > 0 ? v.sufDias / v.count : 0,
        suficiencia_inicial_dias: 0,
        transferencia_malha_hl: 0,
      },
    }));
  })();

  // Meses NENO efetivos (do entry direto ou agregados)
  const nenoMeses = nenoMesesAgregados;

  // Fevereiro NENO
  const nenoFev = nenoMeses.find((m) => m.mes === "Fevereiro");
  const demandaFevKHL = nenoFev
    ? Math.round((nenoFev.demanda?.volume_previsto_hl ?? 0) / 1000)
    : 180; // fallback case
  const demandaFev = demandaFevKHL > 0 ? demandaFevKHL : 180;
  const novaDemandaFev = demandaFev + MALZBIER_EXTRA_KHL; // +12 KHL Malzbier
  const producaoFev = nenoFev
    ? Math.round((nenoFev.producao?.wsnp_hl ?? 0) / 1000)
    : CAPACIDADE_NENO; // fallback
  const capacidadeNeno = producaoFev > 0 ? producaoFev : CAPACIDADE_NENO;
  const deficit = Math.max(0, novaDemandaFev - capacidadeNeno);

  // ── Gráfico: Demanda Mensal 1S 2026 ─────────────────────────────────────
  const apiMonthly =
    nenoMeses.length > 0
      ? nenoMeses.map((m) => ({
          month: MES_ABBR[m.mes] ?? m.mes,
          volume: Math.round((m.demanda?.volume_previsto_hl ?? 0) / 1000),
        }))
      : [];

  // Garante 6 meses — preenche com fallback onde API não retornou ou retornou 0
  const monthlyDemand2026 = fallbackMonthlyDemand.map((fb) => {
    const found = apiMonthly.find((a) => a.month === fb.month);
    return found && found.volume > 0 ? found : fb;
  });

  // ── DOI por sub-região ───────────────────────────────────────────────────
  const doiData = (() => {
    const subs = cenarioPorRegiao.filter(
      (r) => NENO_SUBREGIONS.includes(r.geo_regiao ?? "") && r.geo_regiao !== "NO Araguaia"
    );
    if (subs.length > 0) {
      return subs.map((r, i) => {
        const ultimoMes = r.meses?.[r.meses.length - 1];
        const dias = Math.round(ultimoMes?.estoque?.suficiencia_final_dias ?? 0);
        return {
          region: r.geo_nome ?? r.geo_regiao,
          doi: dias,
          fill: COLORS[i % COLORS.length],
        };
      });
    }
    return fallbackInventoryData.map((r, i) => ({
      region: r.region,
      doi: r.sufFinalDias,
      fill: COLORS[i],
    }));
  })();

  // ── Inventory data (sub-regiões) ─────────────────────────────────────────
  const inventoryData = (() => {
    const subs = cenarioPorRegiao.filter((r) =>
      NENO_SUBREGIONS.includes(r.geo_regiao ?? "")
    );
    if (subs.length > 0) {
      return subs.map((r) => {
        const primeiroMes = r.meses?.[0];
        const ultimoMes = r.meses?.[r.meses.length - 1];
        return {
          region: r.geo_nome ?? r.geo_regiao,
          demanda: ultimoMes?.demanda?.volume_previsto_hl ?? 0,
          wsnp: ultimoMes?.producao?.wsnp_hl ?? 0,
          estoqueInicial: primeiroMes?.estoque?.estoque_inicial_hl ?? 0,
          sufIniDias: Math.round(primeiroMes?.estoque?.suficiencia_inicial_dias ?? 0),
          transfInterna: ultimoMes?.estoque?.transferencia_malha_hl ?? 0,
          transfExtCabo: 0,
          transfExtRodo: 0,
          transito: 0,
          estoqueFinal: ultimoMes?.estoque?.estoque_final_mes_hl ?? 0,
          sufFinalDias: Math.round(ultimoMes?.estoque?.suficiencia_final_dias ?? 0),
        };
      });
    }
    return fallbackInventoryData;
  })();

  if (loading && !dashboard && loadingCenario) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Visão Geral
          </h1>
          <p className="mt-3 text-sm text-slate-500">Carregando dados do dashboard…</p>
        </header>
        <div className="mt-8 flex justify-center text-slate-500">Carregando…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Visão Geral
          </h1>
        </header>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Visão Geral
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Dashboard de planejamento Long Neck — Região NENO — Fev/2026
        </p>
      </header>

      {/* KPIs */}
      <section className="section-grid section-grid-4" aria-label="Indicadores principais">
        <KPICard
          title="Demanda Fev NENO (Original)"
          value={`${demandaFev} KHL`}
          subtitle="Projeção consenso NENO"
          icon={<BeerBottle size={22} weight="duotone" />}
        />
        <KPICard
          title="Nova Demanda Fev NENO"
          value={`${novaDemandaFev} KHL`}
          subtitle="+30% Malzbier Brahma (+12 KHL)"
          icon={<TrendUp size={22} weight="duotone" />}
          variant="warning"
          trend="up"
          trendValue={`+${Math.round(((novaDemandaFev - demandaFev) / demandaFev) * 100)}%`}
        />
        <KPICard
          title="Capacidade NENO"
          value={`${capacidadeNeno} KHL/mês`}
          subtitle={contagens.producao_pcp != null ? `${contagens.producao_pcp} registros PCP` : "AQ541 (50) + NS541 (108)"}
          icon={<Factory size={22} weight="duotone" />}
        />
        <KPICard
          title="Déficit ex-NE"
          value={`${deficit} KHL`}
          subtitle="Necessidade de transf. de SP"
          icon={<Warning size={22} weight="duotone" />}
          variant={deficit > 0 ? "danger" : "success"}
          trend={deficit > 0 ? "up" : undefined}
          trendValue={deficit > 0 ? "Ação necessária" : undefined}
        />
      </section>

      {/* Charts Row */}
      <div className="section-grid section-grid-2">
        {/* Historical Demand */}
        <SectionCard title="Evolução de Vendas LN NENO" subtitle="KHL por ano (2021–2025)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={historicalDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Volume NENO"]}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {historicalDemand.map((_, i) => (
                  <Cell key={i} fill={i === historicalDemand.length - 1 ? "#f59e0b" : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-slate-400">
            Crescimento acumulado +36% (2021–2025)
          </p>
        </SectionCard>

        {/* Monthly Demand 2026 — dados NENO */}
        <SectionCard title="Demanda Mensal NENO 1S 2026" subtitle="KHL por mês — original">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyDemand2026}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 240]} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Demanda NENO"]}
              />
              <ReferenceLine
                y={CAPACIDADE_NENO}
                stroke="#10b981"
                strokeDasharray="6 3"
                label={{ value: `Cap. ${CAPACIDADE_NENO} KHL`, position: "insideTopRight", fontSize: 10, fill: "#10b981" }}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {monthlyDemand2026.map((d, i) => (
                  <Cell key={i} fill={d.volume > CAPACIDADE_NENO ? "#ef4444" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Acima da capacidade
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Dentro da capacidade
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: "#10b981" }} /> Capacidade NENO (158)
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div className="section-grid section-grid-3">
        {/* DOI by Sub-Region */}
        <SectionCard title="DOI por Sub-Região NENO" subtitle="Suficiência final em dias">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doiData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} unit=" d" />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={75} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} dias`, "DOI"]}
              />
              <ReferenceLine x={MIN_DOI} stroke="#f59e0b" strokeDasharray="4 2"
                label={{ value: `Mín ${MIN_DOI}d`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }}
              />
              <Bar dataKey="doi" radius={[0, 6, 6, 0]}>
                {doiData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.doi >= 12 ? "#10b981" : entry.doi >= 8 ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥ 12 dias
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 8–11 dias
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> &lt; 8 dias
            </span>
          </div>
        </SectionCard>

        {/* Alerts */}
        <SectionCard title="Alertas e Riscos">
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 transition-colors hover:bg-red-50">
              <div className="flex items-center gap-2">
                <StatusBadge status="critical" label="Crítico" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                MAPAPI com DOI de {inventoryData[0]?.sufFinalDias ?? 8} dias — abaixo do mínimo de {MIN_DOI} dias.
              </p>
            </div>
            <div className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 transition-colors hover:bg-red-50">
              <div className="flex items-center gap-2">
                <StatusBadge status="critical" label="Crítico" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Déficit de {deficit} KHL em Fev/2026 — exige transferência ex-NE imediata (SP).
              </p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 transition-colors hover:bg-amber-50">
              <div className="flex items-center gap-2">
                <StatusBadge status="warning" label="Atenção" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                BIAS médio de demanda: +{newDemandScenario.demandBias}% nos últimos 3 meses.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 transition-colors hover:bg-amber-50">
              <div className="flex items-center gap-2">
                <StatusBadge status="warning" label="Atenção" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Goose Island Midway no teto de capacidade de líquido em PE.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Brazil Hardware */}
        <SectionCard title="Infraestrutura Brasil" subtitle="Last Mile Network">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Cervejarias", value: brazilHardware.breweries, icon: <Factory size={16} /> },
              { label: "Revend.", value: brazilHardware.wholesalers, icon: <Truck size={16} /> },
              { label: "DDCs", value: brazilHardware.ddcs, icon: <Package size={16} /> },
              { label: "POCs", value: "+1M", icon: <BeerBottle size={16} /> },
              { label: "Caminhões T1", value: `+${brazilHardware.outboundTrucks.toLocaleString()}`, icon: <Truck size={16} /> },
              { label: "Veíc. Last Mile", value: `+${brazilHardware.lastMileVehicles.toLocaleString()}`, icon: <Truck size={16} /> },
              { label: "Cidades", value: `+${brazilHardware.citiesCovered.toLocaleString()}`, icon: <Package size={16} /> },
              { label: "Cobertura", value: brazilHardware.territoryReach, icon: <TrendUp size={16} /> },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
