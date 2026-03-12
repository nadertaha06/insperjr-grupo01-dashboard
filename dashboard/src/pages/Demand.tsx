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
  Legend,
  Cell,
  ComposedChart,
  Area,
} from "recharts";
import { TrendUp, Warning, ArrowUp } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import {
  historicalDemand,
  monthlyDemand2026,
  demandComparison,
  newDemandScenario,
} from "@/data/caseData";

const growthData = historicalDemand.map((item, i) => ({
  ...item,
  growth:
    i > 0
      ? (((item.volume - historicalDemand[i - 1].volume) /
          historicalDemand[i - 1].volume) *
          100
        ).toFixed(1)
      : null,
}));

const tooltipStyle = {
  borderRadius: 10,
  fontSize: 13,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  padding: "10px 14px",
};

export function Demand() {
  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Análise de Demanda
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Evolução histórica e projeções de demanda Long Neck NENO
        </p>
      </header>

      {/* KPIs */}
      <section aria-label="Indicadores de demanda">
        <div className="section-grid section-grid-4">
          <KPICard
            className="h-full"
            title="Volume 2025"
            value="2.160 KHL"
            trend="up"
            trendValue="+9.1% vs 2024"
            icon={<TrendUp size={22} weight="duotone" />}
            variant="success"
          />
          <KPICard
            className="h-full"
            title="Demanda Fev Original"
            value="180 KHL"
            subtitle="Projeção inicial"
          />
          <KPICard
            className="h-full"
            title="Nova Demanda Fev"
            value="192 KHL"
            subtitle="+30% Malzbier Brahma"
            icon={<ArrowUp size={22} weight="duotone" />}
            variant="warning"
            trend="up"
            trendValue="+6.7%"
          />
          <KPICard
            className="h-full"
            title="BIAS Médio"
            value={`+${newDemandScenario.demandBias}%`}
            subtitle="Últimos 3 meses — GEOs NENO"
            icon={<Warning size={22} weight="duotone" />}
            variant="danger"
          />
        </div>
      </section>

      {/* Historical Charts */}
      <section className="section-grid section-grid-2 grid-cols-1" aria-label="Histórico de demanda">
        <SectionCard title="Venda Real LN NENO" subtitle="Volume KHL por ano (2021–2025)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[1400, 2400]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Volume"]}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {historicalDemand.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === historicalDemand.length - 1 ? "#f59e0b" : "#cbd5e1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Crescimento Anual" subtitle="% de crescimento YoY">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={growthData.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, "Crescimento"]}
              />
              <Area
                type="monotone"
                dataKey="growth"
                fill="#dbeafe"
                stroke="transparent"
              />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#3b82f6" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>
      </section>

      {/* 2026 Projection */}
      <section className="section-grid section-grid-2 grid-cols-1" aria-label="Projeções 2026">
        <SectionCard
          title="Demanda Mensal 1S 2026"
          subtitle="Projeção original (KHL/mês)"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyDemand2026}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[140, 220]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Demanda"]}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Comparação: Original vs Novo Cenário"
          subtitle="Impacto do aumento de Malzbier + crescimento 10%/mês"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[150, 240]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`]}
              />
              <Legend />
              <Line
                name="Original"
                type="monotone"
                dataKey="original"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
              <Line
                name="Novo Cenário"
                type="monotone"
                dataKey="novo"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </section>

      {/* Impact Summary */}
      <section>
        <SectionCard title="Resumo do Impacto na Demanda">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Cenário</th>
                <th className="px-4 py-3">Mês</th>
                <th className="px-4 py-3">Demanda (KHL)</th>
                <th className="px-4 py-3">Variação</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">Original</td>
                <td className="px-4 py-3">Fevereiro</td>
                <td className="px-4 py-3">180</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3 text-slate-500">Projeção de consenso</td>
              </tr>
              <tr className="bg-amber-50 hover:bg-amber-100">
                <td className="px-4 py-3 font-medium text-amber-700">Novo</td>
                <td className="px-4 py-3">Fevereiro</td>
                <td className="px-4 py-3 font-bold text-amber-700">192</td>
                <td className="px-4 py-3 text-amber-600">+6.7%</td>
                <td className="px-4 py-3 text-slate-600">+30% Malzbier Brahma (incentivo comercial)</td>
              </tr>
              <tr className="bg-red-50 hover:bg-red-100">
                <td className="px-4 py-3 font-medium text-red-700">Novo</td>
                <td className="px-4 py-3">Março em diante</td>
                <td className="px-4 py-3 font-bold text-red-700">211+</td>
                <td className="px-4 py-3 text-red-600">+10%/mês</td>
                <td className="px-4 py-3 text-slate-600">Crescimento de market share</td>
              </tr>
            </tbody>
          </table>
        </div>
        </SectionCard>
      </section>
    </div>
  );
}
