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
} from "recharts";
import { BeerBottle, TrendUp, Warning, Factory, Truck, Package } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  historicalDemand,
  monthlyDemand2026,
  kpiSummary,
  inventoryData,
  newDemandScenario,
  brazilHardware,
} from "@/data/caseData";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];

export function Overview() {
  const doiData = inventoryData.map((r, i) => ({
    region: r.region,
    doi: r.sufFinalDias,
    fill: COLORS[i],
  }));

  const tooltipStyle = {
    borderRadius: 10,
    fontSize: 13,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    padding: "10px 14px",
  };

  return (
    <div className="space-y-8">
      {/* Header — Visibilidade do contexto (Nielsen: onde estou?) */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Visão Geral
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Dashboard de planejamento Long Neck — Região NENO — Fev/2026
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores principais">
        <KPICard
          title="Demanda Fev (Original)"
          value={`${kpiSummary.totalDemandFev} KHL`}
          icon={<BeerBottle size={22} weight="duotone" />}
        />
        <KPICard
          title="Nova Demanda Fev"
          value={`${kpiSummary.newDemandFev} KHL`}
          subtitle="+30% Malzbier Brahma"
          icon={<TrendUp size={22} weight="duotone" />}
          variant="warning"
          trend="up"
          trendValue="+6.7%"
        />
        <KPICard
          title="Capacidade NENO"
          value={`${kpiSummary.capacidadeNENO} KHL/mês`}
          subtitle="AQ541 (50) + NS541 (108)"
          icon={<Factory size={22} weight="duotone" />}
        />
        <KPICard
          title="Déficit Projetado"
          value={`${kpiSummary.deficit} KHL`}
          subtitle="Necessidade de transf. ex-NE"
          icon={<Warning size={22} weight="duotone" />}
          variant="danger"
          trend="up"
          trendValue="Ação necessária"
        />
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Historical Demand */}
        <SectionCard title="Evolução de Vendas LN NENO" subtitle="KHL por ano">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={historicalDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Volume"]}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {historicalDemand.map((_, i) => (
                  <Cell key={i} fill={i === historicalDemand.length - 1 ? "#f59e0b" : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-slate-400">
            Crescimento acumulado de {kpiSummary.crescimentoAnual}% (2021–2025)
          </p>
        </SectionCard>

        {/* Monthly Demand 2026 */}
        <SectionCard title="Demanda Mensal 1S 2026" subtitle="KHL por mês">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyDemand2026}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[140, 220]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Demanda"]}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#3b82f6" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* DOI by Region */}
        <SectionCard title="DOI por Região" subtitle="Suficiência final em dias (W0)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doiData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 11 }} width={80} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} dias`, "DOI"]}
              />
              <Bar dataKey="doi" radius={[0, 6, 6, 0]}>
                {doiData.map((entry, i) => (
                  <Cell key={i} fill={entry.doi < 12 ? "#ef4444" : "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥ 12 dias
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> &lt; 12 dias
            </span>
          </div>
        </SectionCard>

        {/* Alerts — Reconhecimento de erros/riscos (Nielsen) */}
        <SectionCard title="Alertas e Riscos">
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 transition-colors hover:bg-red-50">
              <div className="flex items-center gap-2">
                <StatusBadge status="critical" label="Crítico" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                MAPAPI com DOI de {inventoryData[0].sufFinalDias} dias — abaixo do mínimo de 12 dias.
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
              { label: "Caminhões T1", value: `+${(brazilHardware.outboundTrucks).toLocaleString()}`, icon: <Truck size={16} /> },
              { label: "Veíc. Last Mile", value: `+${(brazilHardware.lastMileVehicles).toLocaleString()}`, icon: <Truck size={16} /> },
              { label: "Cidades", value: `+${(brazilHardware.citiesCovered).toLocaleString()}`, icon: <Package size={16} /> },
              { label: "Cobertura", value: brazilHardware.territoryReach, icon: <TrendUp size={16} /> },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm transition-colors hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">{item.icon}</span>
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
