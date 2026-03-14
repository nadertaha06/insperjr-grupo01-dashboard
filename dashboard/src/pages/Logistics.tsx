import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { Truck, Timer, Warning, MapPin } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchTransferencias, fetchCustos } from "@/api/services";
import type { TransferenciaItem, CustoItem } from "@/api/types";
import { transferModes, unitsTable, distributionCenters } from "@/data/caseData";

// ── Classificação de transferências ─────────────────────────────────────────
// Unidades e regionais DENTRO do NENO (transferências internas = custo R$0)
const NENO_INTERNAL_KEYWORDS = [
  "AQ541", "NS541",
  "CDR J. Pessoa", "CDR João Pessoa", "J.Pessoa",
  "CDR Bahia", "Bahia",
  "NE Norte", "NE Sul", "NE Norte", "NE",
  "NO Centro", "NO Araguaia", "NO",
  "MAPAPI", "Maranhão", "Pará", "Piauí",
  "Aquiraz", "Pernambuco", "PE", "CE",
  "João Pessoa", "Camaçari",
];

function isNENOInternal(origem: string): boolean {
  const o = origem.toLowerCase();
  return NENO_INTERNAL_KEYWORDS.some((k) => o.includes(k.toLowerCase()));
}

// Rotas estáticas de referência (fallback se API não retornar dados)
const routeDataFallback = [
  { route: "SP → CDR J.Pessoa (via Cabo)", modal: "Cabotagem", tipo: "Ex-NENO", leadTime: 25, custoRel: "1.0x" },
  { route: "SP → CDR Bahia (via Cabo)", modal: "Cabotagem", tipo: "Ex-NENO", leadTime: 25, custoRel: "1.0x" },
  { route: "SP → CDR J.Pessoa (via Rodo)", modal: "Rodoviário", tipo: "Ex-NENO", leadTime: 6, custoRel: "1.6x" },
  { route: "SP → CDR Bahia (via Rodo)", modal: "Rodoviário", tipo: "Ex-NENO", leadTime: 6, custoRel: "1.6x" },
  { route: "NS541/AQ541 → MAPAPI", modal: "Transferência Interna", tipo: "Interna NENO", leadTime: 0, custoRel: "R$ 0" },
  { route: "NS541 → NE Norte → NE Sul", modal: "Transferência Interna", tipo: "Interna NENO", leadTime: 0, custoRel: "R$ 0" },
  { route: "UB541 → NO Araguaia (Retirada)", modal: "Retirada Revendedor", tipo: "Interna NENO", leadTime: 0, custoRel: "R$ 0" },
];

const transferComparison = [
  { metric: "Lead Time", cabotagem: 25, rodoviario: 6, unit: "dias" },
  { metric: "Custo Relativo", cabotagem: 100, rodoviario: 160, unit: "%" },
  { metric: "Risco Avaria", cabotagem: 0, rodoviario: 5, unit: "%" },
];

export function Logistics() {
  const [transferencias, setTransferencias] = useState<TransferenciaItem[]>([]);
  const [custos, setCustos] = useState<CustoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchTransferencias({ per_page: 100 }),
      fetchCustos({ per_page: 100 }),
    ])
      .then(([tRes, cRes]) => {
        setTransferencias(tRes.data);
        setCustos(cRes.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar logística"))
      .finally(() => setLoading(false));
  }, []);

  // ── Classifica cada transferência como interna NENO ou ex-NENO ─────────
  const routeDataFromApi =
    transferencias.length > 0
      ? transferencias.slice(0, 15).map((t) => {
          const origemStr =
            (t.origem as { regional?: string } | null)?.regional ?? "—";
          const destinoStr =
            (t.destino as { descricao?: string } | null)?.descricao ?? "—";
          const interna = isNENOInternal(origemStr);
          const tipo = interna ? "Interna NENO" : "Ex-NENO";
          const custoRel = interna
            ? "R$ 0"
            : t.modal === "Rodoviário"
            ? "1.6x"
            : t.modal === "Cabotagem"
            ? "1.0x"
            : "—";
          const leadTime = interna
            ? 0
            : t.modal === "Rodoviário"
            ? 6
            : t.modal === "Cabotagem"
            ? 25
            : 0;
          return {
            route: `${origemStr} → ${destinoStr}`,
            modal: interna ? "Transferência Interna" : (t.modal ?? "—"),
            tipo,
            leadTime,
            custoRel,
          };
        })
      : [];

  if (loading && transferencias.length === 0) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Logística & Transferências
          </h1>
          <p className="mt-3 text-sm text-slate-500">Carregando…</p>
        </header>
      </div>
    );
  }

  if (error && transferencias.length === 0) {
    return (
      <div className="page-content">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Logística & Transferências
          </h1>
        </header>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  const routesToShow =
    routeDataFromApi.length > 0 ? routeDataFromApi : routeDataFallback;

  // Agrupa: internas NENO vs ex-NENO
  const rotasInternas = routesToShow.filter((r) => r.tipo === "Interna NENO");
  const rotasExNeno = routesToShow.filter((r) => r.tipo === "Ex-NENO");

  // Custos de API — só para ex-NENO (interna = 0)
  const custosExNeno = custos.filter((c) => {
    const orig = String(c.origem ?? "").toLowerCase();
    return !isNENOInternal(orig) || orig === "" || orig === "—";
  });

  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Logística & Transferências
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Modais ex-NE (SP→NENO) e redistribuição interna NENO — custos e lead times
        </p>
      </header>

      {/* KPIs */}
      <div className="section-grid section-grid-4">
        <KPICard
          title="Lead Time Cabotagem"
          value="25 dias"
          subtitle="Modal padrão ex-NE (SP→NENO)"
          icon={<Timer size={22} weight="duotone" />}
        />
        <KPICard
          title="Lead Time Rodoviário"
          value="6 dias"
          subtitle="Emergência — 60% mais caro"
          icon={<Truck size={22} weight="duotone" />}
          variant="warning"
        />
        <KPICard
          title="Custo Rodo vs Cabo"
          value="+60%"
          subtitle="Apenas para transferências ex-NE"
          icon={<Warning size={22} weight="duotone" />}
          variant="danger"
        />
        <KPICard
          title="Transf. Internas NENO"
          value="R$ 0"
          subtitle="Redistribuição intra-NENO sem custo"
          icon={<Truck size={22} weight="duotone" />}
          variant="success"
        />
      </div>

      {/* Nota importante */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        <strong>Premissa do case:</strong> Transferências internas ao NENO (entre sub-regiões MAPAPI, NE Norte, NE Sul,
        NO Centro, NO Araguaia) têm <strong>custo de transporte = R$ 0</strong> e tempo desprezível na análise semanal.
        Custos de transporte se aplicam apenas a transferências <strong>ex-NE</strong> (origem SP/MG → destino NENO).
      </div>

      {/* Comparison Chart */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Comparação de Modais ex-NE" subtitle="Cabotagem vs Rodoviário (SP → NENO)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transferComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Legend />
              <Bar name="Cabotagem" dataKey="cabotagem" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar name="Rodoviário" dataKey="rodoviario" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Modal Details */}
        <SectionCard title="Detalhes dos Modais ex-NE">
          <div className="space-y-4">
            {transferModes.map((mode) => (
              <div key={mode.type} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{mode.type}</h4>
                  <StatusBadge
                    status={mode.type === "Cabotagem" ? "ok" : "warning"}
                    label={`${mode.leadTimeDays} dias`}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">{mode.leadTimeDays}d</p>
                    <p className="text-[11px] text-slate-500">Lead Time</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">{mode.costMultiplier}x</p>
                    <p className="text-[11px] text-slate-500">Custo</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">{mode.damageRisk}%</p>
                    <p className="text-[11px] text-slate-500">Avaria</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{mode.notes}</p>
              </div>
            ))}

            {/* Interna NENO */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-emerald-800">Interna NENO</h4>
                <StatusBadge status="ok" label="R$ 0" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded bg-white p-2">
                  <p className="text-lg font-bold text-emerald-700">~0d</p>
                  <p className="text-[11px] text-slate-500">Lead Time</p>
                </div>
                <div className="rounded bg-white p-2">
                  <p className="text-lg font-bold text-emerald-700">0x</p>
                  <p className="text-[11px] text-slate-500">Custo</p>
                </div>
                <div className="rounded bg-white p-2">
                  <p className="text-lg font-bold text-emerald-700">0%</p>
                  <p className="text-[11px] text-slate-500">Avaria</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-emerald-700">
                Redistribuição entre sub-regiões NENO (AQ541/NS541 → CDRs → GEOs)
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Rotas Ex-NENO (pagas) */}
      <SectionCard
        title="Rotas de Transferência Ex-NE"
        subtitle="SP → NENO — volumes suplementares com custo"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Rota</th>
                <th className="px-4 py-3">Modal</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Lead Time</th>
                <th className="px-4 py-3">Custo Relativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rotasExNeno.length > 0
                ? rotasExNeno.map((route, i) => (
                    <tr key={i} className="hover:bg-amber-50">
                      <td className="px-4 py-3 font-medium">{route.route}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={route.modal === "Cabotagem" ? "ok" : "warning"}
                          label={route.modal}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Ex-NENO
                        </span>
                      </td>
                      <td className="px-4 py-3">{route.leadTime > 0 ? `${route.leadTime} dias` : "N/A"}</td>
                      <td className="px-4 py-3 font-medium text-amber-700">{route.custoRel}</td>
                    </tr>
                  ))
                : // Fallback: mostra rotas ex-NENO fixas
                  routeDataFallback
                    .filter((r) => r.tipo === "Ex-NENO")
                    .map((route, i) => (
                      <tr key={i} className="hover:bg-amber-50">
                        <td className="px-4 py-3 font-medium">{route.route}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={route.modal === "Cabotagem" ? "ok" : "warning"} label={route.modal} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Ex-NENO</span>
                        </td>
                        <td className="px-4 py-3">{route.leadTime > 0 ? `${route.leadTime} dias` : "N/A"}</td>
                        <td className="px-4 py-3 font-medium text-amber-700">{route.custoRel}</td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Rotas Internas NENO (custo zero) */}
      <SectionCard
        title="Redistribuição Interna NENO"
        subtitle="Transferências entre sub-regiões — custo R$0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Rota</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Lead Time</th>
                <th className="px-4 py-3">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(rotasInternas.length > 0
                ? rotasInternas
                : routeDataFallback.filter((r) => r.tipo === "Interna NENO")
              ).map((route, i) => (
                <tr key={i} className="hover:bg-emerald-50">
                  <td className="px-4 py-3 font-medium">{route.route}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Interna NENO
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">Desprezível</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">R$ 0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Custos de API — só para ex-NENO */}
      {custosExNeno.length > 0 && (
        <SectionCard
          title="Custos de Transferência Ex-NE (API)"
          subtitle="R$/HL por rota — apenas transferências externas ao NENO"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Origem</th>
                  <th className="px-3 py-3">Destino</th>
                  <th className="px-3 py-3 text-right">R$/HL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {custosExNeno.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 text-xs text-slate-600">{c.sku_nome ?? c.sku_id}</td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        status={c.tipo === "transferencia" ? "ok" : c.tipo === "maco" ? "warning" : "neutral"}
                        label={c.tipo ?? "—"}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{c.origem ?? "—"}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{c.destino ?? "—"}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {c.reais_por_hl != null
                        ? `R$ ${c.reais_por_hl.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            * Transferências internas NENO omitidas desta tabela (custo = R$0)
          </p>
        </SectionCard>
      )}

      {/* Distribution Centers & Units */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Centros de Distribuição NENO" subtitle="CDRs do Nordeste">
          <div className="space-y-3">
            {distributionCenters.map((dc) => (
              <div key={dc.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} weight="duotone" className="text-blue-500" />
                  <h4 className="font-semibold text-slate-900">{dc.name}</h4>
                </div>
                <p className="mt-1 text-sm text-slate-500">Localização: {dc.location}</p>
                <div className="mt-2">
                  <p className="text-xs font-medium uppercase text-slate-400">Atende</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {dc.serves.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Unidades Operacionais" subtitle="Cervejarias e CDs — NENO e externas">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="px-3 py-2">Unidade</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Local</th>
                  <th className="px-3 py-2">Atende</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitsTable.map((u) => {
                  const isNeno = ["AQ541", "NS541", "CDR J. Pessoa", "CDR Bahia"].includes(u.unit);
                  return (
                    <tr key={u.unit} className={`hover:bg-slate-50 ${isNeno ? "" : "opacity-70"}`}>
                      <td className="px-3 py-2 font-medium">
                        {u.unit}
                        {!isNeno && (
                          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                            ex-NE
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{u.type}</td>
                      <td className="px-3 py-2 text-slate-600">{u.location}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{u.serves}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
