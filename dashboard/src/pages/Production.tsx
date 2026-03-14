import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";
import { useEffect, useState } from "react";
import { Factory, Warning, GearSix } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchProducaoPcp } from "@/api/services";
import type { ProducaoPcpItem } from "@/api/types";
import { productionLines as fallbackLines } from "@/data/caseData";

// Linhas de produção pertencentes ao NENO
const NENO_LINHAS = ["AQ541", "NS541"];

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

// Demanda NENO Fev/2026 (valores do case)
const DEMANDA_ORIGINAL_FEV = 180; // KHL
const NOVA_DEMANDA_FEV = 192;     // KHL (+30% Malzbier Brahma = +12 KHL)

export function Production() {
  const [producaoList, setProducaoList] = useState<ProducaoPcpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducaoPcp({ per_page: 200 })
      .then((res) => setProducaoList(res.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar produção"))
      .finally(() => setLoading(false));
  }, []);

  // ── Filtrar apenas linhas NENO (AQ541 + NS541) ──────────────────────────
  const nenoPcp = producaoList.filter((p) =>
    NENO_LINHAS.includes(p.linha ?? "")
  );

  // Agrupa por linha, soma semanal_hl e converte para KHL/mês (×4 semanas / 1000)
  const byLinhaMap: Record<string, { totalSemanasHL: number; produtos: string[]; localidade: string }> = {};
  for (const p of nenoPcp) {
    const linha = p.linha ?? p._id;
    if (!byLinhaMap[linha]) {
      byLinhaMap[linha] = { totalSemanasHL: 0, produtos: [], localidade: p.localidade ?? "—" };
    }
    byLinhaMap[linha].totalSemanasHL += p.capacidade?.semanal_hl ?? 0;
    if (p.sku_nome) byLinhaMap[linha].produtos.push(p.sku_nome);
  }

  const productionLines =
    Object.keys(byLinhaMap).length > 0
      ? Object.entries(byLinhaMap)
          .map(([linha, info]) => ({
            id: linha,
            name: linha,
            location: info.localidade,
            region: info.localidade,
            capacityKHL: Math.round((info.totalSemanasHL * 4) / 1000),
            products: info.produtos,
            notes: undefined as string | undefined,
          }))
          .filter((l) => l.capacityKHL > 0)
      : fallbackLines.filter((l) => NENO_LINHAS.includes(l.id));

  const linhasValidas = productionLines.filter((l) => l.capacityKHL > 0);
  const LINHA_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
  const capacityData =
    linhasValidas.length >= 2
      ? linhasValidas.map((l, i) => ({
          name: l.name,
          capacidade: l.capacityKHL,
          color: LINHA_COLORS[i] ?? "#94a3b8",
        }))
      : [
          { name: "AQ541", capacidade: 50, color: "#f59e0b" },
          { name: "NS541", capacidade: 108, color: "#3b82f6" },
        ];

  // Capacidade NENO = soma AQ541 + NS541 (fallback 158 se API não retornar dados)
  const totalCapacity =
    linhasValidas.reduce((acc, l) => acc + l.capacityKHL, 0) || 158;

  const deficit = Math.max(0, NOVA_DEMANDA_FEV - totalCapacity);
  const utilizacao = NOVA_DEMANDA_FEV > 0
    ? Math.round((totalCapacity / NOVA_DEMANDA_FEV) * 100)
    : 0;

  const demandaVsCapacidadeData = [
    { label: "Capacidade NENO", valor: totalCapacity, fill: "#3b82f6" },
    { label: "Demanda Original", valor: DEMANDA_ORIGINAL_FEV, fill: "#94a3b8" },
    { label: "Nova Demanda (Fev)", valor: NOVA_DEMANDA_FEV, fill: "#ef4444" },
  ];

  if (loading && producaoList.length === 0) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Capacidade Produtiva
          </h1>
          <p className="mt-3 text-sm text-slate-500">Carregando…</p>
        </header>
      </div>
    );
  }

  if (error && producaoList.length === 0) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Capacidade Produtiva
          </h1>
        </header>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Capacidade Produtiva
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Linhas de produção Long Neck NENO — AQ541 (Aquiraz/CE) + NS541 (Pernambuco/PE)
        </p>
      </header>

      {/* KPIs */}
      <div className="section-grid section-grid-4">
        <KPICard
          title="Capacidade Total NENO"
          value={`${totalCapacity} KHL/mês`}
          subtitle="AQ541 (50) + NS541 (108)"
          icon={<Factory size={22} weight="duotone" />}
        />
        <KPICard
          title="Nova Demanda Fev"
          value={`${NOVA_DEMANDA_FEV} KHL`}
          subtitle="+30% Malzbier Brahma (+12 KHL)"
          variant="warning"
          trend="up"
          trendValue="+6.7%"
        />
        <KPICard
          title="Déficit ex-NE"
          value={`${deficit} KHL`}
          subtitle="Volume a transferir de SP"
          icon={<Warning size={22} weight="duotone" />}
          variant={deficit > 0 ? "danger" : "success"}
        />
        <KPICard
          title="Utilização NENO"
          value={`${utilizacao}%`}
          subtitle="Capacidade / Nova Demanda"
          icon={<GearSix size={22} weight="duotone" />}
          variant={utilizacao >= 90 ? "danger" : utilizacao >= 75 ? "warning" : "success"}
        />
      </div>

      {/* Charts */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Capacidade por Linha NENO" subtitle="KHL/mês">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL/mês`, "Capacidade"]}
              />
              <Bar dataKey="capacidade" radius={[6, 6, 0, 0]} label={{ position: "top", fontSize: 13, fontWeight: 600 }}>
                {capacityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Capacidade vs Demanda NENO" subtitle="Fevereiro 2026 — KHL/mês">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={demandaVsCapacidadeData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 220]} unit=" KHL" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} KHL`]}
              />
              <ReferenceLine
                y={totalCapacity}
                stroke="#3b82f6"
                strokeDasharray="6 3"
                label={{
                  value: `Cap. ${totalCapacity} KHL`,
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "#3b82f6",
                }}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                label={{ position: "top", fontSize: 12, fontWeight: 600, formatter: (v: number) => `${v}` }}
              >
                {demandaVsCapacidadeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              Déficit:{" "}
              <span className="font-semibold text-red-600">{deficit} KHL</span> a transferir ex-NE
            </span>
            <div className="flex gap-3">
              {demandaVsCapacidadeData.map((d) => (
                <span key={d.label} className="flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: d.fill }}
                  />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Product Mix */}
      <SectionCard title="Mix de Produtos por Linha" subtitle="Distribuição de produção NENO">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={productMix} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
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

      {/* Production Lines Details — apenas NENO */}
      <SectionCard
        title="Detalhes das Linhas Produtivas NENO"
        subtitle="AQ541 e NS541 — única fonte de produção interna"
      >
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
                {line.location}
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
