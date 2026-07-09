import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type IntegrationConfig = Tables<"integration_configs">;
export type SyncRun = Tables<"sync_runs">;

export function useIntegrations() {
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig | null>(null);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const { data: config } = await supabase
        .from("integration_configs")
        .select("*")
        .eq("driver_type", "automated_export")
        .maybeSingle();
      setIntegrationConfig(config ?? null);

      if (config) {
        const { data: runs } = await supabase
          .from("sync_runs")
          .select("*")
          .eq("integration_config_id", config.id)
          .order("started_at", { ascending: false })
          .limit(10);
        setSyncRuns(runs ?? []);
      } else {
        setSyncRuns([]);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { integrationConfig, syncRuns, loading, refresh: fetchAll };
}
