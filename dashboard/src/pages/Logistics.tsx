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
import { Truck, Timer, Warning, MapPin } from "@phosphor-icons/react";
import { KPICard } from "@/components/KPICard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import { transferModes, unitsTable, distributionCenters } from "@/data/caseData";

const transferComparison = [
  {
    metric: "Lead Time",
    cabotagem: 25,
    rodoviario: 6,
    unit: "dias",
  },
  {
    metric: "Custo Relativo",
    cabotagem: 100,
    rodoviario: 160,
    unit: "%",
  },
  {
    metric: "Risco Avaria",
    cabotagem: 0,
    rodoviario: 5,
    unit: "%",
  },
];

const routeData = [
  { route: "SP → CDR J.Pessoa", modal: "Cabotagem", leadTime: 25, custoRel: "1.0x" },
  { route: "SP → CDR Bahia", modal: "Cabotagem", leadTime: 25, custoRel: "1.0x" },
  { route: "SP → CDR J.Pessoa", modal: "Rodoviário", leadTime: 6, custoRel: "1.6x" },
  { route: "SP → CDR Bahia", modal: "Rodoviário", leadTime: 6, custoRel: "1.6x" },
  { route: "UB541 → NO Araguaia", modal: "Retirada", leadTime: 0, custoRel: "Revendedor" },
];

export function Logistics() {
  return (
    <div className="page-content">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Logística & Transferências
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Modais de transporte, rotas e custos de distribuição
        </p>
      </header>

      {/* KPIs */}
      <div className="section-grid section-grid-4">
        <KPICard
          title="Lead Time Cabotagem"
          value="25 dias"
          subtitle="Modal padrão ex-NE"
          icon={<Timer size={22} weight="duotone" />}
        />
        <KPICard
          title="Lead Time Rodoviário"
          value="6 dias"
          subtitle="60% mais caro"
          icon={<Truck size={22} weight="duotone" />}
          variant="warning"
        />
        <KPICard
          title="Custo Rodo vs Cabo"
          value="+60%"
          subtitle="Acréscimo rodoviário"
          icon={<Warning size={22} weight="duotone" />}
          variant="danger"
        />
        <KPICard
          title="Risco Avaria Rodo"
          value="+5%"
          subtitle="Comparado à cabotagem"
          icon={<Warning size={22} weight="duotone" />}
          variant="warning"
        />
      </div>

      {/* Comparison Chart */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Comparação de Modais" subtitle="Cabotagem vs Rodoviário">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transferComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Legend />
              <Bar
                name="Cabotagem"
                dataKey="cabotagem"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Rodoviário"
                dataKey="rodoviario"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Modal Details */}
        <SectionCard title="Detalhes dos Modais">
          <div className="space-y-4">
            {transferModes.map((mode) => (
              <div
                key={mode.type}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{mode.type}</h4>
                  <StatusBadge
                    status={mode.type === "Cabotagem" ? "ok" : "warning"}
                    label={`${mode.leadTimeDays} dias`}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">
                      {mode.leadTimeDays}d
                    </p>
                    <p className="text-[11px] text-slate-500">Lead Time</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">
                      {mode.costMultiplier}x
                    </p>
                    <p className="text-[11px] text-slate-500">Custo</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-800">
                      {mode.damageRisk}%
                    </p>
                    <p className="text-[11px] text-slate-500">Avaria</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{mode.notes}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Routes Table */}
      <SectionCard title="Rotas de Transferência" subtitle="Principais rotas ex-NE">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">Rota</th>
                <th className="px-4 py-3">Modal</th>
                <th className="px-4 py-3">Lead Time</th>
                <th className="px-4 py-3">Custo Relativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeData.map((route, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{route.route}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        route.modal === "Cabotagem"
                          ? "ok"
                          : route.modal === "Rodoviário"
                          ? "warning"
                          : "ok"
                      }
                      label={route.modal}
                    />
                  </td>
                  <td className="px-4 py-3">{route.leadTime > 0 ? `${route.leadTime} dias` : "N/A"}</td>
                  <td className="px-4 py-3">{route.custoRel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Distribution Centers & Units */}
      <div className="section-grid section-grid-2">
        <SectionCard title="Centros de Distribuição" subtitle="CDRs do Nordeste">
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

        <SectionCard title="Unidades Operacionais" subtitle="Cervejarias e CDs">
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
                {unitsTable.map((u) => (
                  <tr key={u.unit} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium">{u.unit}</td>
                    <td className="px-3 py-2 text-slate-600">{u.type}</td>
                    <td className="px-3 py-2 text-slate-600">{u.location}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{u.serves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
