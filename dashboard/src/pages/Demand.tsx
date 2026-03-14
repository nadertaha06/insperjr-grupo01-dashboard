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
import { useEffect, useState } from "react";
import { fetchCenarioAtualBr } from "@/api/services";
import {
  historicalDemand,
  monthlyDemand2026 as fallbackMonthlyDemand,
  demandComparison as fallbackComparison,
  newDemandScenario,
} from "@/data/caseData";

// Sub-regiões que compõem o NENO
const NENO_SUBREGIONS = ["MAPAPI", "NE Norte", "NE Sul", "NO Araguaia", "NO Centro"];

const MES_ABBR: Record<string, string> = {
  Janeiro: "Jan", Fevereiro: "Fev", Março: "Mar", Abril: "Abr",
  Maio: "Mai", Junho: "Jun", Julho: "Jul", Agosto: "Ago",
  Setembro: "Set", Outubro: "Out", Novembro: "Nov", Dezembro: "Dez",
};

const growthData = historicalDemand.map((item, i) => ({
  ...item,
  growth:
    i > 0
      ? (
          ((item.volume - historicalDemand[i - 1].volume) /
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

// Fallback completo com 6 meses de NENO (valores do case)
const FALLBACK_MONTHLY = fallbackMonthlyDemand; // Jan=200, Fev=180, Mar=170, Abr=190, Mai=195, Jun=200
const FALLBACK_COMPARISON = fallbackComparison;  // original vs novo cenário

export function Demand() {
  const [monthlyDemand2026, setMonthlyDemand2026] = useState(FALLBACK_MONTHLY);
  const [demandComparison, setDemandComparison] = useState(FALLBACK_COMPARISON);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca dados do cenário NENO (não Brasil total)
    fetchCenarioAtualBr({ per_page: 200 })
      .then((res) => {
        const data = res.data;

        // Tenta encontrar entry "NENO" diretamente
        let nenoEntry = data.find((r) => r.geo_regiao === "NENO");

        // Se não encontrado, agrega sub-regiões NENO somando demanda por mês
        if (!nenoEntry) {
          const subs = data.filter((r) =>
            NENO_SUBREGIONS.includes(r.geo_regiao ?? "")
          );
          if (subs.length > 0) {
            // Cria um entry sintético agregando demanda de todos os sub-entries
            const mesMap: Record<string, number> = {};
            for (const sub of subs) {
              for (const m of sub.meses ?? []) {
                mesMap[m.mes] =
                  (mesMap[m.mes] ?? 0) + (m.demanda?.volume_previsto_hl ?? 0);
              }
            }
            const mesesAgg = Object.entries(mesMap).map(([mes, vol]) => ({
              mes,
              demanda: { volume_previsto_hl: vol },
            }));
            if (mesesAgg.length > 0) {
              // Usa o primeiro sub como template mas com meses agregados
              nenoEntry = { ...subs[0], meses: mesesAgg as typeof subs[0]["meses"] };
            }
          }
        }

        if (!nenoEntry?.meses?.length) return;

        const apiMeses = nenoEntry.meses;

        // Monta monthlyDemand2026 com dados da API
        const apiMonthly = apiMeses.map((m) => ({
          month: MES_ABBR[m.mes] ?? m.mes,
          volume: Math.round((m.demanda?.volume_previsto_hl ?? 0) / 1000),
        }));

        // Garante pelo menos 6 meses — completa com fallback se API tiver menos
        const merged = FALLBACK_MONTHLY.map((fb) => {
          const found = apiMonthly.find((a) => a.month === fb.month);
          return found && found.volume > 0 ? found : fb;
        });
        setMonthlyDemand2026(merged);

        // Monta comparação: original (API) vs nova demanda (+Malzbier)
        const compMerged = FALLBACK_MONTHLY.map((fb, i) => {
          const found = apiMonthly.find((a) => a.month === fb.month);
          const original = found && found.volume > 0 ? found.volume : fb.volume;
          // Fev: +12 KHL (Malzbier). Mar+: crescimento 10%/mês
          let novo: number;
          if (i === 0) {
            novo = original; // Jan: sem alteração
          } else if (i === 1) {
            novo = original + 12; // Fev: +30% Malzbier (~12 KHL)
          } else {
            // Mar em diante: base Fev nova × (1+10%)^(mês-Fev)
            const fevNova = (FALLBACK_MONTHLY[1]?.volume ?? 180) + 12;
            novo = Math.round(fevNova * Math.pow(1.1, i - 1));
          }
          return { month: fb.month, original, novo };
        });
        setDemandComparison(compMerged);
      })
      .catch(() => {
        // Mantém fallback em caso de erro
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && monthlyDemand2026 === FALLBACK_MONTHLY) {
    // Mostra com dados fallback mesmo carregando (não bloqueia)
  }

  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Análise de Demanda
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Evolução histórica e projeções de demanda Long Neck NENO — 2021-2026
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
            subtitle="Projeção consenso NENO"
          />
          <KPICard
            className="h-full"
            title="Nova Demanda Fev"
            value="192 KHL"
            subtitle="+30% Malzbier Brahma (+12 KHL)"
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
              <YAxis tick={{ fontSize: 12 }} domain={[1400, 2400]} unit=" KHL" />
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

        <SectionCard title="Crescimento Anual LN NENO" subtitle="% de crescimento YoY">
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
          title="Demanda Mensal NENO 1S 2026"
          subtitle="Cenário original — KHL/mês"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyDemand2026}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 240]} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`, "Demanda NENO"]}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]}
                label={{ position: "top", fontSize: 11, fontWeight: 600, formatter: (v: number) => `${v}` }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-slate-400">
            Capacidade NENO: 158 KHL/mês (linha tracejada implícita)
          </p>
        </SectionCard>

        <SectionCard
          title="Original vs Nova Demanda NENO"
          subtitle="Impacto +30% Malzbier Brahma + crescimento 10%/mês"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[130, 280]} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`]}
              />
              <Legend />
              <Line
                name="Demanda Original"
                type="monotone"
                dataKey="original"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
              <Line
                name="Nova Demanda (+Malzbier)"
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
        <SectionCard title="Resumo do Impacto na Demanda NENO">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="px-4 py-3">Cenário</th>
                  <th className="px-4 py-3">Mês</th>
                  <th className="px-4 py-3">Demanda NENO (KHL)</th>
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
                  <td className="px-4 py-3 text-slate-500">Projeção de consenso NENO</td>
                </tr>
                <tr className="bg-amber-50 hover:bg-amber-100">
                  <td className="px-4 py-3 font-medium text-amber-700">Novo</td>
                  <td className="px-4 py-3">Fevereiro</td>
                  <td className="px-4 py-3 font-bold text-amber-700">192</td>
                  <td className="px-4 py-3 text-amber-600">+6.7%</td>
                  <td className="px-4 py-3 text-slate-600">+30% Malzbier Brahma (+12 KHL)</td>
                </tr>
                <tr className="bg-red-50 hover:bg-red-100">
                  <td className="px-4 py-3 font-medium text-red-700">Novo</td>
                  <td className="px-4 py-3">Março em diante</td>
                  <td className="px-4 py-3 font-bold text-red-700">211+</td>
                  <td className="px-4 py-3 text-red-600">+10%/mês</td>
                  <td className="px-4 py-3 text-slate-600">Crescimento de market share LN</td>
                </tr>
                <tr className="bg-blue-50 hover:bg-blue-100">
                  <td className="px-4 py-3 font-medium text-blue-700">Capacidade NENO</td>
                  <td className="px-4 py-3">Todo 1S</td>
                  <td className="px-4 py-3 font-bold text-blue-700">158</td>
                  <td className="px-4 py-3 text-blue-600">—</td>
                  <td className="px-4 py-3 text-slate-600">AQ541 (50) + NS541 (108) — fixo</td>
                </tr>
                <tr className="bg-orange-50 hover:bg-orange-100">
                  <td className="px-4 py-3 font-medium text-orange-700">Déficit</td>
                  <td className="px-4 py-3">Fevereiro</td>
                  <td className="px-4 py-3 font-bold text-orange-700">34</td>
                  <td className="px-4 py-3 text-orange-600">Nova - Cap.</td>
                  <td className="px-4 py-3 text-slate-600">Transferência ex-NE necessária (SP)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
