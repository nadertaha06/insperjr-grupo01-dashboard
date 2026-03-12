import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Sliders, Calculator, Warning, CheckCircle } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";

const CAPACITY_NENO = 158; // AQ541 (50) + NS541 (108)
const CABOTAGEM_BASE_COST = 100; // R$/HL base unit
const RODO_MULTIPLIER = 1.6;
const RODO_DAMAGE_RISK = 0.05;
const MIN_DOI = 12;

export function Scenarios() {
  const [malzbierIncrease, setMalzbierIncrease] = useState(30);
  const [monthlyGrowth, setMonthlyGrowth] = useState(10);
  const [useCabotagem, setUseCabotagem] = useState(true);
  const [useRodoviario, setUseRodoviario] = useState(false);
  const [rodoPercentage, setRodoPercentage] = useState(0);

  // Base demand before adjustments
  const baseDemandFev = 180;
  const baseDemandMar = 170;

  // New Malzbier demand impact (~40KHL of malzbier base, then increase)
  const malzbierBase = 40; // Approximate Malzbier KHL in NENO
  const malzbierExtra = (malzbierBase * malzbierIncrease) / 100;
  const newDemandFev = baseDemandFev + malzbierExtra;

  // Monthly projection from March with growth
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const baseMonthly = [200, 180, 170, 190, 195, 200];

  const projectedDemand = baseMonthly.map((base, i) => {
    if (i === 0) return base; // Jan stays
    if (i === 1) return Math.round(base + malzbierExtra); // Fev with Malzbier
    // Mar onwards: +growth% compounding
    const monthsFromMar = i - 2;
    return Math.round(base * Math.pow(1 + monthlyGrowth / 100, monthsFromMar + 1));
  });

  const demandVsCapacity = months.map((month, i) => ({
    month,
    demandaOriginal: baseMonthly[i],
    demandaNova: projectedDemand[i],
    capacidade: CAPACITY_NENO,
    deficit: Math.max(0, projectedDemand[i] - CAPACITY_NENO),
  }));

  // Transfer cost calculation
  const totalDeficit = projectedDemand.reduce(
    (acc, d) => acc + Math.max(0, d - CAPACITY_NENO),
    0
  );

  const rodoPct = useRodoviario ? rodoPercentage / 100 : 0;
  const caboPct = useCabotagem ? 1 - rodoPct : 0;

  const volumeCabo = totalDeficit * caboPct;
  const volumeRodo = totalDeficit * rodoPct;

  const costCabo = volumeCabo * CABOTAGEM_BASE_COST;
  const costRodo = volumeRodo * CABOTAGEM_BASE_COST * RODO_MULTIPLIER;
  const costAvaria = volumeRodo * CABOTAGEM_BASE_COST * RODO_DAMAGE_RISK;
  const totalCost = costCabo + costRodo + costAvaria;

  // Cost comparison
  const costData = [
    { tipo: "Cabotagem", custo: Math.round(costCabo), volume: Math.round(volumeCabo) },
    { tipo: "Rodoviário", custo: Math.round(costRodo), volume: Math.round(volumeRodo) },
    { tipo: "Avarias (Rodo)", custo: Math.round(costAvaria), volume: 0 },
  ];

  // Summary per month
  const monthlyBreakdown = months.map((month, i) => {
    const deficit = Math.max(0, projectedDemand[i] - CAPACITY_NENO);
    const rodoVol = deficit * rodoPct;
    const caboVol = deficit * caboPct;
    return {
      month,
      demanda: projectedDemand[i],
      producao: Math.min(projectedDemand[i], CAPACITY_NENO),
      deficit,
      transferCabo: Math.round(caboVol),
      transferRodo: Math.round(rodoVol),
      custoTotal: Math.round(
        caboVol * CABOTAGEM_BASE_COST +
        rodoVol * CABOTAGEM_BASE_COST * RODO_MULTIPLIER +
        rodoVol * CABOTAGEM_BASE_COST * RODO_DAMAGE_RISK
      ),
    };
  });

  return (
    <div className="space-y-14 lg:space-y-16 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Simulador de Cenários
        </h1>
        <p className="mt-3 text-base text-slate-500">
          Ajuste parâmetros e avalie impactos em custo, produção e transferências
        </p>
      </header>

      {/* Controls */}
      <SectionCard title="Parâmetros do Cenário" subtitle="Ajuste os valores para simular">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Malzbier Increase */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Aumento Malzbier Brahma
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={malzbierIncrease}
                onChange={(e) => setMalzbierIncrease(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
              />
              <span className="min-w-[50px] text-right text-sm font-bold text-amber-600">
                +{malzbierIncrease}%
              </span>
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Crescimento Mensal (Mar+)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={30}
                value={monthlyGrowth}
                onChange={(e) => setMonthlyGrowth(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-500"
              />
              <span className="min-w-[50px] text-right text-sm font-bold text-blue-600">
                +{monthlyGrowth}%
              </span>
            </div>
          </div>

          {/* Modal Selection */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Modal de Transferência
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useCabotagem}
                  onChange={(e) => setUseCabotagem(e.target.checked)}
                  className="accent-blue-500"
                />
                Cabotagem (25d)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useRodoviario}
                  onChange={(e) => setUseRodoviario(e.target.checked)}
                  className="accent-amber-500"
                />
                Rodoviário (6d, +60%)
              </label>
            </div>
          </div>

          {/* Rodo Percentage */}
          {useRodoviario && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                % Rodoviário do Déficit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={rodoPercentage}
                  onChange={(e) => setRodoPercentage(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-red-500"
                />
                <span className="min-w-[50px] text-right text-sm font-bold text-red-600">
                  {rodoPercentage}%
                </span>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Result KPIs */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          className="h-full"
          title="Nova Demanda Fev"
          value={`${Math.round(newDemandFev)} KHL`}
          subtitle={`+${malzbierIncrease}% Malzbier`}
          icon={<Sliders size={22} weight="duotone" />}
          variant="warning"
        />
        <KPICard
          className="h-full"
          title="Déficit Total 1S"
          value={`${totalDeficit} KHL`}
          subtitle="Volume a transferir"
          icon={<Warning size={22} weight="duotone" />}
          variant={totalDeficit > 0 ? "danger" : "success"}
        />
        <KPICard
          className="h-full"
          title="Custo Total Transf."
          value={`R$\u00a0${totalCost.toLocaleString()}`}
          subtitle="Cabo + Rodo + Avarias"
          icon={<Calculator size={22} weight="duotone" />}
          variant={totalCost > 0 ? "warning" : "success"}
        />
        <KPICard
          className="h-full"
          title="Recomendação"
          value={totalDeficit > 100 ? "Revisar" : "Viável"}
          subtitle={
            totalDeficit > 100
              ? "Déficit alto — avaliar nova linha"
              : "Cenário sustentável"
          }
          icon={
            totalDeficit > 100 ? (
              <Warning size={22} weight="duotone" />
            ) : (
              <CheckCircle size={22} weight="duotone" />
            )
          }
          variant={totalDeficit > 100 ? "danger" : "success"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <SectionCard title="Demanda vs Capacidade" subtitle="KHL/mês — 1S 2026">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandVsCapacity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [`${v} KHL`]}
              />
              <Legend />
              <Line
                name="Demanda Original"
                dataKey="demandaOriginal"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                name="Demanda Nova"
                dataKey="demandaNova"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#ef4444" }}
              />
              <Line
                name="Capacidade NENO"
                dataKey="capacidade"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="8 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Custo por Modal" subtitle="R$ estimado">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [`R$ ${v.toLocaleString()}`]}
              />
              <Bar dataKey="custo" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Deficit Chart */}
      <SectionCard title="Déficit Mensal" subtitle="KHL que precisa ser transferido">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={demandVsCapacity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
              formatter={(v: number) => [`${v} KHL`, "Déficit"]}
            />
            <Bar dataKey="deficit" fill="#ef4444" radius={[6, 6, 0, 0]} name="Déficit" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Monthly Breakdown Table */}
      <SectionCard title="Plano Detalhado por Mês">
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Mês</th>
                <th className="px-4 py-3 text-right">Demanda (KHL)</th>
                <th className="px-4 py-3 text-right">Produção NENO</th>
                <th className="px-4 py-3 text-right">Déficit</th>
                <th className="px-4 py-3 text-right">Transf. Cabo</th>
                <th className="px-4 py-3 text-right">Transf. Rodo</th>
                <th className="px-4 py-3 text-right">Custo (R$)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-right">{row.demanda}</td>
                  <td className="px-4 py-3 text-right">{row.producao}</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.deficit > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {row.deficit}
                  </td>
                  <td className="px-4 py-3 text-right">{row.transferCabo}</td>
                  <td className="px-4 py-3 text-right">{row.transferRodo}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {row.custoTotal > 0 ? `R$ ${row.custoTotal.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.deficit === 0 ? "ok" : row.deficit <= 30 ? "warning" : "critical"}
                      label={row.deficit === 0 ? "OK" : row.deficit <= 30 ? "Atenção" : "Crítico"}
                    />
                  </td>
                </tr>
              ))}
              {/* Total */}
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td className="px-4 py-3">TOTAL 1S</td>
                <td className="px-4 py-3 text-right">
                  {projectedDemand.reduce((a, b) => a + b, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {monthlyBreakdown.reduce((a, b) => a + b.producao, 0)}
                </td>
                <td className="px-4 py-3 text-right text-red-600">{totalDeficit}</td>
                <td className="px-4 py-3 text-right">
                  {monthlyBreakdown.reduce((a, b) => a + b.transferCabo, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {monthlyBreakdown.reduce((a, b) => a + b.transferRodo, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  R$ {totalCost.toLocaleString()}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Risk Analysis */}
      <SectionCard title="Análise de Riscos">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-amber-800">
              <Warning size={18} /> BIAS de Demanda
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              BIAS médio de +9% nos últimos 3 meses. A nova demanda pode estar superestimada,
              gerando excesso de estoque e custo de transferência desnecessário.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-red-800">
              <Warning size={18} /> Capacidade de Líquido
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              Goose Island Midway no teto de capacidade de elaboração em PE.
              Não é possível aumentar produção interna para absorver variações.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-blue-800">
              <Warning size={18} /> Lead Time Cabotagem
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              Lead time de 25 dias na cabotagem exige planejamento antecipado.
              Rupturas no curto prazo só podem ser cobertas por rodoviário (+60% custo).
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-purple-800">
              <Warning size={18} /> Avarias Rodoviário
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              Risco de +5% de avarias no modal rodoviário. Volume danificado deve
              ser considerado no planejamento de transferência.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle size={18} /> Araguaia Self-Service
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              Revendedores do Araguaia retiram diretamente em UB541 (Uberlândia),
              reduzindo pressão sobre a logística NENO.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h4 className="flex items-center gap-2 font-semibold text-slate-800">
              <Warning size={18} /> DOI Mínimo
            </h4>
            <p className="mt-3 text-sm text-slate-700">
              O DOI mínimo de 12 dias deve ser mantido para todas as regiões.
              MAPAPI (8 dias) está abaixo do limite no cenário atual.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
