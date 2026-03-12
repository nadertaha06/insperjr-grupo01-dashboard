import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Factory, Warning, GearSix } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { productionLines } from "@/data/caseData";

const capacityData = [
  { name: "AQ541", capacidade: 50, color: "#f59e0b" },
  { name: "NS541", capacidade: 108, color: "#3b82f6" },
];

const totalCapacity = 158;
const newDemand = 192;

const utilizationData = [
  { name: "Utilizado", value: totalCapacity, color: "#3b82f6" },
  { name: "Déficit", value: newDemand - totalCapacity, color: "#ef4444" },
];

const productMix = [
  { name: "Brahma Chopp Zero", line: "NS541", share: 20 },
  { name: "Goose Island Midway", line: "NS541", share: 18 },
  { name: "Malzbier Brahma", line: "NS541", share: 15 },
  { name: "Colorado Lager", line: "NS541/AQ541", share: 12 },
  { name: "Skol Beats Senses", line: "NS541", share: 10 },
  { name: "Budweiser Zero", line: "NS541", share: 10 },
  { name: "Malzbier", line: "AQ541", share: 8 },
  { name: "Patagonia Amber Lager", line: "AQ541", share: 7 },
];

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

const tooltipStyle = {
  borderRadius: 10,
  fontSize: 13,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  padding: "10px 14px",
};

export function Production() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Capacidade Produtiva
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Linhas de produção Long Neck no Nordeste e unidades de suporte
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Capacidade Total NENO"
          value={`${totalCapacity} KHL/mês`}
          subtitle="AQ541 + NS541"
          icon={<Factory size={22} weight="duotone" />}
        />
        <KPICard
          title="Nova Demanda Fev"
          value="192 KHL"
          subtitle="Após ajuste Malzbier"
          variant="warning"
          trend="up"
          trendValue="+6.7%"
        />
        <KPICard
          title="Déficit"
          value={`${newDemand - totalCapacity} KHL`}
          subtitle="Necessidade de transf. SP"
          icon={<Warning size={22} weight="duotone" />}
          variant="danger"
        />
        <KPICard
          title="Utilização"
          value={`${((totalCapacity / newDemand) * 100).toFixed(0)}%`}
          subtitle="Sobre a nova demanda"
          icon={<GearSix size={22} weight="duotone" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Capacidade por Linha" subtitle="KHL/mês">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL/mês`, "Capacidade"]}
              />
              <Bar dataKey="capacidade" radius={[6, 6, 0, 0]}>
                {capacityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Capacidade vs Demanda" subtitle="Fevereiro 2026">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={utilizationData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value} KHL`}
              >
                {utilizationData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Product Mix */}
      <SectionCard title="Mix de Produtos por Linha" subtitle="Distribuição de produção">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={productMix} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v}%`, "Share"]}
            />
            <Bar dataKey="share" radius={[0, 6, 6, 0]}>
              {productMix.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Production Lines Details */}
      <SectionCard title="Detalhes das Linhas Produtivas">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {productionLines.map((line) => (
            <div
              key={line.id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900">{line.name}</h4>
                {line.capacityKHL > 0 ? (
                  <StatusBadge status="ok" label={`${line.capacityKHL} KHL/mês`} />
                ) : (
                  <StatusBadge status="neutral" label="Suporte" />
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {line.location} — {line.region}
              </p>
              {line.products.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase text-slate-400">Produtos</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {line.products.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {line.notes && (
                <p className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                  <Warning size={14} /> {line.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
