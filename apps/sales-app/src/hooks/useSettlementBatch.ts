import * as React from 'react';
import { getSettlementBatch } from '../api/settlements';
import type { SettlementBatchResponse } from '../types/settlement-api';

export interface UseSettlementBatchResult {
  batch: SettlementBatchResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Carrega o batch de settlement do tenant para o período (periodKey).
 * Retorna null se 404 (sem batch para o período).
 */
export function useSettlementBatch(
  tenantId: string | null,
  periodKey: string | null
): UseSettlementBatchResult {
  const [batch, setBatch] = React.useState<SettlementBatchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fetchRef = React.useRef(0);

  const fetchBatch = React.useCallback(() => {
    if (!tenantId || !periodKey) {
      setBatch(null);
      setError(null);
      return;
    }
    const id = ++fetchRef.current;
    setLoading(true);
    setError(null);
    getSettlementBatch(tenantId, periodKey)
      .then((data) => {
        if (id === fetchRef.current) setBatch(data);
      })
      .catch((err) => {
        if (id === fetchRef.current) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar liquidação');
          setBatch(null);
        }
      })
      .finally(() => {
        if (id === fetchRef.current) setLoading(false);
      });
  }, [tenantId, periodKey]);

  React.useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  return { batch, loading, error, refetch: fetchBatch };
}
