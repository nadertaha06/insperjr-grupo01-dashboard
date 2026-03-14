import { useState, useEffect, useCallback } from "react";
import { fetchDashboard } from "@/api/services";
import type { DashboardResponse, SkuSummary, CenarioAtualBrItem } from "@/api/types";

export interface UseDashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para carregar dados do GET /dashboard (meta.contagens, meta.regioes, skus, totais_brasil).
 * Use para montar KPIs, filtros por região e visão Brasil na abertura do dashboard.
 */
export function useDashboard(): UseDashboardState {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard(true);
      setData({
        meta: {
          contagens: res.meta.contagens ?? {},
          regioes: (res.meta.regioes ?? []) as string[],
        },
        totais_brasil: (res.totais_brasil ?? []) as CenarioAtualBrItem[],
        skus: (res.skus ?? []) as SkuSummary[],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
