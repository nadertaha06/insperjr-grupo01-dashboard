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
import { Package, Warning, CheckCircle } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { inventoryData, inventoryTotals } from "@/data/caseData";

const MIN_DOI = 12;

const stockComparison = inventoryData.map((r) => ({
  region: r.region,
  estoqueInicial: r.estoqueInicial,
  estoqueFinal: r.estoqueFinal,
  demanda: r.demanda,
}));

const doiRadar = inventoryData
  .filter((r) => r.region !== "NO Araguaia")
  .map((r) => ({
    region: r.region,
    doiInicial: r.sufIniDias,
    doiFinal: r.sufFinalDias,
    minimo: MIN_DOI,
  }));

function getDOIStatus(doi: number): "ok" | "warning" | "critical" {
  if (doi >= MIN_DOI) return "ok";
  if (doi >= 8) return "warning";
  return "critical";
}

export function Inventory() {
  const regionsBelowDOI = inventoryData.filter(
    (r) => r.sufFinalDias < MIN_DOI && r.region !== "NO Araguaia"
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Gestão de Estoque
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Balanço de estoque e suficiência (DOI) por região — W0 (02/02/2026)
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Estoque Inicial Total"
          value={`${inventoryTotals.estoqueInicial.toLocaleString()} HL`}
          subtitle="Todas as regiões"
          icon={<Package size={22} weight="duotone" />}
        />
        <KPICard
          title="Estoque Final Total"
          value={`${inventoryTotals.estoqueFinal.toLocaleString()} HL`}
          subtitle="Após W0"
          icon={<Package size={22} weight="duotone" />}
          variant="success"
        />
        <KPICard
          title="DOI Médio Final"
          value={`${inventoryTotals.sufFinalDias} dias`}
          subtitle={`Mínimo: ${MIN_DOI} dias`}
          icon={inventoryTotals.sufFinalDias >= MIN_DOI ? <CheckCircle size={22} weight="duotone" /> : <Warning size={22} weight="duotone" />}
          variant={inventoryTotals.sufFinalDias >= MIN_DOI ? "success" : "warning"}
        />
        <KPICard
          title="Regiões Abaixo DOI"
          value={regionsBelowDOI.length}
          subtitle={regionsBelowDOI.map((r) => r.region).join(", ") || "Nenhuma"}
          icon={<Warning size={22} weight="duotone" />}
          variant={regionsBelowDOI.length > 0 ? "danger" : "success"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Estoque Inicial vs Final" subtitle="HL por região">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [`${v.toLocaleString()} HL`]}
              />
              <Legend />
              <Bar
                name="Estoque Inicial"
                dataKey="estoqueInicial"
                fill="#94a3b8"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Estoque Final"
                dataKey="estoqueFinal"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="DOI por Região" subtitle="Suficiência em dias — Radar">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={doiRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Radar
                name="DOI Inicial"
                dataKey="doiInicial"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.2}
              />
              <Radar
                name="DOI Final"
                dataKey="doiFinal"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Mínimo"
                dataKey="minimo"
                stroke="#ef4444"
                fill="transparent"
                strokeDasharray="5 5"
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* DOI Bar Chart */}
      <SectionCard title="Suficiência Final (DOI)" subtitle="Dias de estoque por região — mínimo 12 dias">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={inventoryData.map((r) => ({
              region: r.region,
              doi: r.sufFinalDias,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="region" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
              formatter={(v: number) => [`${v} dias`, "DOI"]}
            />
            <Bar dataKey="doi" radius={[6, 6, 0, 0]}>
              {inventoryData.map((r, i) => (
                <Cell
                  key={i}
                  fill={r.sufFinalDias >= MIN_DOI ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-1 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥ 12 dias (OK)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> &lt; 12 dias (Crítico)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-red-400" /> Limite mínimo
          </span>
        </div>
      </SectionCard>

      {/* Full Inventory Table */}
      <SectionCard title="Balanço Completo de Estoque" subtitle="W0 — 02/02/2026">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-3 py-3">Região</th>
                <th className="px-3 py-3 text-right">Demanda</th>
                <th className="px-3 py-3 text-right">WSNP</th>
                <th className="px-3 py-3 text-right">EI</th>
                <th className="px-3 py-3 text-right">Suf.Ini(d)</th>
                <th className="px-3 py-3 text-right">Transf. Int.</th>
                <th className="px-3 py-3 text-right">Transf. Cabo</th>
                <th className="px-3 py-3 text-right">Transf. Rodo</th>
                <th className="px-3 py-3 text-right">Trânsito</th>
                <th className="px-3 py-3 text-right">EF</th>
                <th className="px-3 py-3 text-right">Suf.Fin(d)</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryData.map((r) => (
                <tr key={r.region} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium">{r.region}</td>
                  <td className="px-3 py-3 text-right">{r.demanda.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">{r.wsnp.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">{r.estoqueInicial.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">{r.sufIniDias}</td>
                  <td className={`px-3 py-3 text-right ${r.transfInterna < 0 ? "text-red-600" : r.transfInterna > 0 ? "text-emerald-600" : ""}`}>
                    {r.transfInterna.toLocaleString()}
                  </td>
                  <td className={`px-3 py-3 text-right ${r.transfExtCabo < 0 ? "text-red-600" : ""}`}>
                    {r.transfExtCabo.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right">{r.transfExtRodo.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right">{r.transito.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-medium">{r.estoqueFinal.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-bold">{r.sufFinalDias}</td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      status={getDOIStatus(r.sufFinalDias)}
                      label={
                        r.sufFinalDias >= MIN_DOI
                          ? "OK"
                          : r.sufFinalDias >= 8
                          ? "Atenção"
                          : "Crítico"
                      }
                    />
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td className="px-3 py-3">TOTAL</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.demanda.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.wsnp.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.estoqueInicial.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.sufIniDias}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.transfInterna.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.transfExtCabo.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.transfExtRodo.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.transito.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.estoqueFinal.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{inventoryTotals.sufFinalDias}</td>
                <td className="px-3 py-3">
                  <StatusBadge
                    status={getDOIStatus(inventoryTotals.sufFinalDias)}
                    label={inventoryTotals.sufFinalDias >= MIN_DOI ? "OK" : "Atenção"}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
