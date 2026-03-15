import * as React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useSettlementBatch } from '../hooks/useSettlementBatch';
import { runSettlementBatch } from '../api/settlements';
import { getCurrentPeriodKey } from '../utils/iso-week';
import { SettlementsHeader } from '../components/settlements/SettlementsHeader';
import { SettlementsTable } from '../components/settlements/SettlementsTable';
import { SettlementsEmptyState } from '../components/settlements/SettlementsEmptyState';
import { SettlementEntryDialog } from '../components/settlements/SettlementEntryDialog';
import { StatusMessage } from '../components/StatusMessage';
import type { SettlementEntry } from '../types/settlement-api';

/**
 * Página de Liquidação: filtro por período (ISO week), tabela de entries por merchant,
 * modal de detalhes com botão "Dar baixa" (se PENDING). Botão para executar batch do período atual.
 */
export function SettlementPage() {
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? null;

  const [periodKey, setPeriodKey] = React.useState(() => getCurrentPeriodKey());
  const [selectedEntry, setSelectedEntry] = React.useState<SettlementEntry | null>(null);
  const [runBatchLoading, setRunBatchLoading] = React.useState(false);
  const [runBatchError, setRunBatchError] = React.useState<string | null>(null);

  const { batch, loading, error, refetch } = useSettlementBatch(tenantId, periodKey);
  const entries = batch?.entries ?? [];

  const handleRunBatch = React.useCallback(async () => {
    if (!tenantId) return;
    const currentKey = getCurrentPeriodKey();
    setRunBatchLoading(true);
    setRunBatchError(null);
    try {
      await runSettlementBatch(tenantId);
      setPeriodKey(currentKey);
      refetch(); // garante atualização mesmo quando já estava no período atual
    } catch (err) {
      setRunBatchError(err instanceof Error ? err.message : 'Erro ao executar batch.');
    } finally {
      setRunBatchLoading(false);
    }
  }, [tenantId, refetch]);

  const handleRowClick = React.useCallback((entry: SettlementEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handlePaidSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (selectedEntry && batch?.entries) {
      const updated = batch.entries.find((e) => e.entryId === selectedEntry.entryId);
      if (updated) setSelectedEntry(updated);
    }
  }, [batch?.entries, selectedEntry]);

  const showEmpty = !loading && !error && !batch;
  const showTable = !error && (batch !== null || loading);

  return (
    <div className="space-y-6">
      <SettlementsHeader
        periodKey={periodKey}
        onPeriodChange={setPeriodKey}
        onRunBatch={handleRunBatch}
        runBatchLoading={runBatchLoading}
      />

      {runBatchError && (
        <StatusMessage
          message={runBatchError}
          variant="error"
          onDismiss={() => setRunBatchError(null)}
        />
      )}

      {error && (
        <StatusMessage message={error} variant="error" onDismiss={() => refetch()} />
      )}

      {showEmpty && <SettlementsEmptyState />}
      {showTable && (
        <SettlementsTable
          entries={entries}
          loading={loading}
          onRowClick={handleRowClick}
        />
      )}

      <SettlementEntryDialog
        open={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
        batchId={batch?.settlementBatchId ?? null}
        onPaidSuccess={handlePaidSuccess}
      />
    </div>
  );
}
