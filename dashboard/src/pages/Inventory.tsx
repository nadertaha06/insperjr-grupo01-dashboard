import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { Package, Warning, CheckCircle } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchCenarioAtualBr, fetchCenariosSemanais } from "@/api/services";
import type { CenarioAtualBrItem, CenarioSemanalItem } from "@/api/types";

const MIN_DOI = 12;

function fmt(n: number) {
  return Math.round(n).toLocaleString("pt-BR");
}

function getDOIStatus(doi: number): "ok" | "warning" | "critical" {
  if (doi >= MIN_DOI) return "ok";
  if (doi >= 8) return "warning";
  return "critical";
}

const SEMANAS = ["W0", "W1", "W2", "W3"] as const;
const SEMANA_LABELS: Record<string, string> = {
  W0: "W0 (02/02)",
  W1: "W1 (09/02)",
  W2: "W2 (16/02)",
  W3: "W3 (23/02)",
};

export function Inventory() {
  const [cenariosBr, setCenariosBr] = useState<CenarioAtualBrItem[]>([]);
  const [cenarioBrTotal, setCenarioBrTotal] = useState<CenarioAtualBrItem | null>(null);
  const [cenariosSemanais, setCenariosSemanais] = useState<CenarioSemanalItem[]>([]);
  const [semanaAtual, setSemanaAtual] = useState<string>("W0");
  const [cenarioSelecionado, setCenarioSelecionado] = useState<string>("Divulgado");
  const [skuSelecionado, setSkuSelecionado] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchCenarioAtualBr({ is_total: false, per_page: 100 }),
      fetchCenarioAtualBr({ is_total: true, per_page: 10 }),
      fetchCenariosSemanais({ per_page: 500 }),
    ])
      .then(([porRegiao, total, semanais]) => {
        setCenariosBr(porRegiao.data);
        setCenarioBrTotal(total.data[0] ?? null);
        setCenariosSemanais(semanais.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar estoque"))
      .finally(() => setLoading(false));
  }, []);

  // KPIs: Brasil total (cenario-atual-br is_total=true)
  const primeiroMesBrasil = cenarioBrTotal?.meses?.[0];
  const ultimoMesBrasil = cenarioBrTotal?.meses?.[cenarioBrTotal.meses.length - 1];
  const estoqueInicialTotal = Math.round(primeiroMesBrasil?.estoque?.estoque_inicial_hl ?? 0);
  const estoqueFinalTotal = Math.round(ultimoMesBrasil?.estoque?.estoque_final_mes_hl ?? 0);
  const doiMedioTotal = Math.round(ultimoMesBrasil?.estoque?.suficiencia_final_dias ?? 0);

  // Charts: por regiao (cenario-atual-br mensal)
  const stockComparison = cenariosBr.map((r) => ({
    region: r.geo_nome ?? r.geo_regiao,
    estoqueInicial: Math.round(r.meses?.[0]?.estoque?.estoque_inicial_hl ?? 0),
    estoqueFinal: Math.round(r.meses?.[r.meses.length - 1]?.estoque?.estoque_final_mes_hl ?? 0),
  }));

  const doiRadar = cenariosBr.map((r) => ({
    region: r.geo_nome ?? r.geo_regiao,
    doiInicial: Math.round(r.meses?.[0]?.estoque?.suficiencia_inicial_dias ?? 0),
    doiFinal: Math.round(r.meses?.[r.meses.length - 1]?.estoque?.suficiencia_final_dias ?? 0),
    minimo: MIN_DOI,
  }));

  const doiBarData = cenariosBr.map((r) => ({
    region: r.geo_nome ?? r.geo_regiao,
    doi: Math.round(r.meses?.[r.meses.length - 1]?.estoque?.suficiencia_final_dias ?? 0),
  }));

  // SKUs disponíveis nos cenários semanais
  const skusDisponiveis = useMemo(() => {
    const set = new Map<string, string>();
    for (const c of cenariosSemanais) {
      const key = c.sku_id ?? c._id;
      const label = c.sku_nome ?? c.sku_id ?? c._id;
      if (key) set.set(key, label);
    }
    return Array.from(set.entries()).map(([id, nome]) => ({ id, nome }));
  }, [cenariosSemanais]);

  // Tabela semanal: cenarios semanais agregado por geo_regiao
  const tableData = useMemo(() => {
    const filtered = cenariosSemanais.filter(
      (c) =>
        c.cenario === cenarioSelecionado &&
        (skuSelecionado === "Todos" || (c.sku_id ?? c._id) === skuSelecionado || c.sku_nome === skuSelecionado)
    );
    const byGeo: Record<string, {
      demanda: number; wsnp: number; ei: number; ef: number;
      ti: number; tc: number; tr: number; transito: number;
      dois: number[];
    }> = {};

    for (const c of filtered) {
      const semana = c.semanas.find((s) => s.semana === semanaAtual);
      if (!semana) continue;
      const m = semana.metricas ?? {};
      const geo = c.geo_regiao ?? "—";
      if (!byGeo[geo]) {
        byGeo[geo] = { demanda: 0, wsnp: 0, ei: 0, ef: 0, ti: 0, tc: 0, tr: 0, transito: 0, dois: [] };
      }
      byGeo[geo].demanda += m.demanda ?? 0;
      byGeo[geo].wsnp += m.wsnp ?? 0;
      byGeo[geo].ei += m.estoque_inicial ?? 0;
      byGeo[geo].ef += m.estoque_final ?? 0;
      byGeo[geo].ti += m.transf_interna ?? 0;
      byGeo[geo].tc += m.transf_ext_cabo ?? 0;
      byGeo[geo].tr += m.transf_ext_rodo ?? 0;
      byGeo[geo].transito += m.transito ?? 0;
      if (m.suf_final_dias != null) byGeo[geo].dois.push(m.suf_final_dias);
    }

    const rows = Object.entries(byGeo)
      .map(([geo, a]) => ({
        region: geo,
        demanda: Math.round(a.demanda),
        wsnp: Math.round(a.wsnp),
        estoqueInicial: Math.round(a.ei),
        transfInterna: Math.round(a.ti),
        transfExtCabo: Math.round(a.tc),
        transfExtRodo: Math.round(a.tr),
        transito: Math.round(a.transito),
        estoqueFinal: Math.round(a.ef),
        sufFinalDias: a.dois.length
          ? Math.round(a.dois.reduce((s, v) => s + v, 0) / a.dois.length)
          : 0,
      }))
      .sort((a, b) => a.region.localeCompare(b.region));

    const total = rows.reduce(
      (acc, r) => ({
        region: "TOTAL",
        demanda: acc.demanda + r.demanda,
        wsnp: acc.wsnp + r.wsnp,
        estoqueInicial: acc.estoqueInicial + r.estoqueInicial,
        transfInterna: acc.transfInterna + r.transfInterna,
        transfExtCabo: acc.transfExtCabo + r.transfExtCabo,
        transfExtRodo: acc.transfExtRodo + r.transfExtRodo,
        transito: acc.transito + r.transito,
        estoqueFinal: acc.estoqueFinal + r.estoqueFinal,
        sufFinalDias: 0,
      }),
      { region: "TOTAL", demanda: 0, wsnp: 0, estoqueInicial: 0, transfInterna: 0, transfExtCabo: 0, transfExtRodo: 0, transito: 0, estoqueFinal: 0, sufFinalDias: 0 }
    );

    return { rows, total };
  }, [cenariosSemanais, semanaAtual, cenarioSelecionado, skuSelecionado]);

  const regionsBelowDOI = tableData.rows.filter((r) => r.sufFinalDias > 0 && r.sufFinalDias < MIN_DOI);

  if (loading) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Gestão de Estoque</h1>
          <p className="mt-3 text-sm text-slate-500">Carregando dados…</p>
        </header>
        <div className="mt-8 flex justify-center text-slate-400">Carregando…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Gestão de Estoque</h1>
        </header>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Gestão de Estoque
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Balanço de estoque e suficiência (DOI) — Long Neck SK269 — 1S 2026
        </p>
      </header>

      {/* KPIs — Brasil total (mensal) */}
      <div className="section-grid section-grid-4">
        <KPICard
          title="Estoque Inicial Brasil"
          value={`${fmt(estoqueInicialTotal)} HL`}
          subtitle="Janeiro 2026"
          icon={<Package size={22} weight="duotone" />}
        />
        <KPICard
          title="Estoque Final Brasil"
          value={`${fmt(estoqueFinalTotal)} HL`}
          subtitle="Fevereiro 2026"
          icon={<Package size={22} weight="duotone" />}
          variant="success"
        />
        <KPICard
          title="DOI Médio Final"
          value={`${doiMedioTotal} dias`}
          subtitle={`Mínimo: ${MIN_DOI} dias`}
          icon={doiMedioTotal >= MIN_DOI ? <CheckCircle size={22} weight="duotone" /> : <Warning size={22} weight="duotone" />}
          variant={doiMedioTotal >= MIN_DOI ? "success" : "warning"}
        />
        <KPICard
          title="Sub-regiões Abaixo DOI"
          value={regionsBelowDOI.length}
          subtitle={regionsBelowDOI.map((r) => r.region).join(", ") || `Semana ${semanaAtual} — OK`}
          icon={<Warning size={22} weight="duotone" />}
          variant={regionsBelowDOI.length > 0 ? "danger" : "success"}
        />
      </div>

      {/* Charts — por regiao (mensal) */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Estoque Inicial vs Final por Região" subtitle="HL — Janeiro → Fevereiro">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [`${fmt(v)} HL`]}
              />
              <Legend />
              <Bar name="Est. Inicial (Jan)" dataKey="estoqueInicial" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar name="Est. Final (Fev)" dataKey="estoqueFinal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="DOI por Região" subtitle="Suficiência em dias — Fevereiro">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={doiRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Radar name="DOI Inicial" dataKey="doiInicial" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
              <Radar name="DOI Final" dataKey="doiFinal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Mínimo" dataKey="minimo" stroke="#ef4444" fill="transparent" strokeDasharray="5 5" />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* DOI Bar Chart */}
      <SectionCard title="Suficiência Final (DOI) por Região" subtitle="Dias de estoque — mínimo 12 dias">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={doiBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="region" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
              formatter={(v: number) => [`${v} dias`, "DOI"]}
            />
            <Bar dataKey="doi" radius={[6, 6, 0, 0]}>
              {doiBarData.map((r, i) => (
                <Cell key={i} fill={r.doi >= MIN_DOI ? "#10b981" : r.doi >= 8 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-1 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥ 12 dias (OK)</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 8–11 dias (Atenção)</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> &lt; 8 dias (Crítico)</span>
        </div>
      </SectionCard>

      {/* ═══════════════════════════════════════════════════════════════════
          BALANÇO COMPLETO DE ESTOQUE — design moderno + filtro por cerveja
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
        {/* Cabeçalho: título e KPIs em linhas separadas para nada ser cortado */}
        <div className="rounded-t-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 pl-10 pr-6 py-5 sm:pl-12 sm:pr-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Balanço Completo de Estoque
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {cenarioSelecionado === "Nova_Demanda" ? "Nova Demanda" : cenarioSelecionado}
                {" · "}
                {SEMANA_LABELS[semanaAtual] ?? semanaAtual}
                {skuSelecionado !== "Todos" && ` · ${skuSelecionado}`}
              </p>
            </div>

            {/* Mini totais: Demanda, Estoque Final e texto "Regiões Críticas N" mais à direita */}
            {tableData.rows.length > 0 && (
              <div className="flex flex-wrap items-center gap-10 sm:gap-8 sm:pl-4 sm:justify-end">
                {[
                  { label: "Demanda Total", value: `${fmt(tableData.total.demanda)} HL` },
                  { label: "Estoque Final", value: `${fmt(tableData.total.estoqueFinal)} HL` },
                ].map((kpi) => (
                  <div key={kpi.label} className="text-left sm:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{kpi.label}</p>
                    <p className="mt-0.5 text-base font-bold tabular-nums text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barra de filtros — espaçamento e overflow corrigidos */}
        <div className="flex flex-wrap items-start gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          {/* Semana */}
          <div className="flex flex-shrink-0 flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Semana</span>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              {SEMANAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSemanaAtual(s)}
                  className={`min-w-[3.5rem] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    semanaAtual === s
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {s}
                  <span className="ml-0.5 hidden text-[10px] font-normal opacity-80 sm:inline">
                    {s === "W0" ? "02/02" : s === "W1" ? "09/02" : s === "W2" ? "16/02" : "23/02"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cenário */}
          <div className="flex flex-shrink-0 flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cenário</span>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              {["Divulgado", "Nova_Demanda"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCenarioSelecionado(c)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    cenarioSelecionado === c
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {c === "Nova_Demanda" ? "Nova Demanda" : "Divulgado"}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de cerveja — truncar nomes longos, sem overflow */}
          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cerveja</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSkuSelecionado("Todos")}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  skuSelecionado === "Todos"
                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                Todos
              </button>
              {skusDisponiveis.map((sku) => (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => setSkuSelecionado(sku.nome)}
                  title={sku.nome}
                  className={`min-w-0 max-w-[220px] rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition-all overflow-hidden ${
                    skuSelecionado === sku.nome
                      ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  <span className="block truncate">{sku.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {/* Grupos de colunas */}
                <th className="px-4 py-2.5 text-left" colSpan={1}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Região</span>
                </th>
                <th className="border-l border-slate-100 px-3 py-2.5 text-right" colSpan={2}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Demanda / Produção</span>
                </th>
                <th className="border-l border-slate-100 px-3 py-2.5 text-right" colSpan={1}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Inicial</span>
                </th>
                <th className="border-l border-slate-100 px-3 py-2.5 text-right" colSpan={4}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Transferências</span>
                </th>
                <th className="border-l border-slate-100 px-3 py-2.5 text-right" colSpan={1}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Final</span>
                </th>
                <th className="border-l border-slate-100 px-3 py-2.5 text-center" colSpan={2}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">DOI</span>
                </th>
              </tr>
              <tr className="border-b-2 border-slate-200 bg-white text-xs font-semibold text-slate-500">
                <th className="px-4 pb-2.5 pt-1 text-left align-middle">Região</th>
                <th className="border-l border-slate-100 px-3 pb-2.5 pt-1 text-right align-middle">Demanda</th>
                <th className="px-3 pb-2.5 pt-1 text-right align-middle">WSNP</th>
                <th className="border-l border-slate-100 px-3 pb-2.5 pt-1 text-right align-middle">Est. Inicial</th>
                <th className="border-l border-slate-100 px-3 pb-2.5 pt-1 text-right align-middle">T. Interna</th>
                <th className="px-3 pb-2.5 pt-1 text-right align-middle">T. Cabo</th>
                <th className="px-3 pb-2.5 pt-1 text-right align-middle">T. Rodo</th>
                <th className="px-3 pb-2.5 pt-1 text-right align-middle">Trânsito</th>
                <th className="border-l border-slate-100 px-3 pb-2.5 pt-1 text-right align-middle">Est. Final</th>
                <th className="border-l border-slate-100 px-3 pb-2.5 pt-1 text-center align-middle">Dias</th>
                <th className="px-3 pb-2.5 pt-1 text-left align-middle">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableData.rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package size={32} className="opacity-30" />
                      <p className="text-sm font-medium">Sem dados disponíveis</p>
                      <p className="text-xs">
                        {semanaAtual} · {cenarioSelecionado}
                        {skuSelecionado !== "Todos" ? ` · ${skuSelecionado}` : ""}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.rows.map((r, idx) => {
                  const doiStatus = getDOIStatus(r.sufFinalDias);
                  const doiColor =
                    doiStatus === "ok"
                      ? "text-emerald-700 bg-emerald-50"
                      : doiStatus === "warning"
                      ? "text-amber-700 bg-amber-50"
                      : "text-red-700 bg-red-50";
                  const doiBarColor =
                    doiStatus === "ok" ? "bg-emerald-400" : doiStatus === "warning" ? "bg-amber-400" : "bg-red-400";
                  const doiPct = Math.min(100, (r.sufFinalDias / 30) * 100);
                  return (
                    <tr
                      key={r.region}
                      className={`group transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                    >
                      {/* Região */}
                      <td className="px-4 py-3 align-middle">
                        <span className="font-semibold text-slate-800">{r.region}</span>
                      </td>
                      {/* Demanda */}
                      <td className="border-l border-slate-100 px-3 py-3 text-right align-middle font-medium text-slate-700">
                        {fmt(r.demanda)}
                      </td>
                      {/* WSNP */}
                      <td className="px-3 py-3 text-right align-middle text-slate-600">
                        {r.wsnp !== 0 ? fmt(r.wsnp) : <span className="text-slate-300">—</span>}
                      </td>
                      {/* EI */}
                      <td className="border-l border-slate-100 px-3 py-3 text-right align-middle text-slate-600">
                        {r.estoqueInicial !== 0 ? fmt(r.estoqueInicial) : <span className="text-slate-300">—</span>}
                      </td>
                      {/* T. Interna */}
                      <td className={`border-l border-slate-100 px-3 py-3 text-right align-middle font-medium ${
                        r.transfInterna < 0 ? "text-red-600" : r.transfInterna > 0 ? "text-emerald-600" : "text-slate-300"
                      }`}>
                        {r.transfInterna !== 0
                          ? (r.transfInterna > 0 ? "+" : "") + fmt(r.transfInterna)
                          : "—"}
                      </td>
                      {/* T. Cabo */}
                      <td className={`px-3 py-3 text-right align-middle font-medium ${
                        r.transfExtCabo < 0 ? "text-red-600" : r.transfExtCabo > 0 ? "text-emerald-600" : "text-slate-300"
                      }`}>
                        {r.transfExtCabo !== 0
                          ? (r.transfExtCabo > 0 ? "+" : "") + fmt(r.transfExtCabo)
                          : "—"}
                      </td>
                      {/* T. Rodo */}
                      <td className={`px-3 py-3 text-right align-middle font-medium ${
                        r.transfExtRodo < 0 ? "text-red-600" : r.transfExtRodo > 0 ? "text-amber-600" : "text-slate-300"
                      }`}>
                        {r.transfExtRodo !== 0
                          ? (r.transfExtRodo > 0 ? "+" : "") + fmt(r.transfExtRodo)
                          : "—"}
                      </td>
                      {/* Trânsito */}
                      <td className="px-3 py-3 text-right align-middle text-slate-500">
                        {r.transito !== 0 ? fmt(r.transito) : <span className="text-slate-300">—</span>}
                      </td>
                      {/* EF */}
                      <td className={`border-l border-slate-100 px-3 py-3 text-right align-middle font-bold ${
                        r.estoqueFinal < 0 ? "text-red-600" : "text-slate-800"
                      }`}>
                        {fmt(r.estoqueFinal)}
                      </td>
                      {/* DOI dias + barra — alinhamento vertical consistente */}
                      <td className="border-l border-slate-100 px-3 py-3 align-middle">
                        {r.sufFinalDias > 0 ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${doiColor}`}>
                              {r.sufFinalDias}d
                            </span>
                            <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all ${doiBarColor}`}
                                style={{ width: `${doiPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      {/* Status — alinhado com círculo e texto na mesma linha */}
                      <td className="px-3 py-3 align-middle">
                        {r.sufFinalDias > 0 ? (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            doiStatus === "ok"
                              ? "bg-emerald-100 text-emerald-700"
                              : doiStatus === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${
                              doiStatus === "ok" ? "bg-emerald-500" : doiStatus === "warning" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                            <span>{doiStatus === "ok" ? "OK" : doiStatus === "warning" ? "Atenção" : "Crítico"}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Linha total */}
              {tableData.rows.length > 0 && (
                <tr className="border-t-2 border-slate-200 bg-slate-900 text-white">
                  <td className="px-4 py-3 text-sm font-bold tracking-wide">TOTAL</td>
                  <td className="border-l border-slate-700 px-3 py-3 text-right font-bold">{fmt(tableData.total.demanda)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.wsnp !== 0 ? fmt(tableData.total.wsnp) : "—"}
                  </td>
                  <td className="border-l border-slate-700 px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.estoqueInicial !== 0 ? fmt(tableData.total.estoqueInicial) : "—"}
                  </td>
                  <td className="border-l border-slate-700 px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.transfInterna !== 0
                      ? (tableData.total.transfInterna > 0 ? "+" : "") + fmt(tableData.total.transfInterna)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.transfExtCabo !== 0
                      ? (tableData.total.transfExtCabo > 0 ? "+" : "") + fmt(tableData.total.transfExtCabo)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.transfExtRodo !== 0
                      ? (tableData.total.transfExtRodo > 0 ? "+" : "") + fmt(tableData.total.transfExtRodo)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-300">
                    {tableData.total.transito !== 0 ? fmt(tableData.total.transito) : "—"}
                  </td>
                  <td className="border-l border-slate-700 px-3 py-3 text-right font-bold">{fmt(tableData.total.estoqueFinal)}</td>
                  <td className="border-l border-slate-700 px-3 py-3 text-center text-slate-400">—</td>
                  <td className="px-3 py-3" />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé — padding e quebra de linha para não cortar texto */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" /> ≥12d — OK
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" /> 8–11d — Atenção
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-400" /> &lt;8d — Crítico
            </span>
          </div>
          <p className="max-w-md text-right text-[11px] text-slate-400 break-words">
            Volumes em HL. EI/EF = Estoque Inicial/Final. T. Int. = transferência interna (+ recebe / − envia).
          </p>
        </div>
      </div>
    </div>
  );
}
