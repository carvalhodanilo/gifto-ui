import * as React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useSettlementBatch } from '../hooks/useSettlementBatch';
import { runSettlementBatch } from '../api/settlements';
import { getTenants } from '../api/tenants';
import { getLastClosedPeriodKey } from '../utils/iso-week';
import { SettlementsHeader } from '../components/settlements/SettlementsHeader';
import { SettlementsTable } from '../components/settlements/SettlementsTable';
import { SettlementsEmptyState } from '../components/settlements/SettlementsEmptyState';
import { SettlementEntryDialog } from '../components/settlements/SettlementEntryDialog';
import { StatusMessage } from '../components/StatusMessage';
import type { SettlementEntry } from '../types/settlement-api';
import type { TenantOption } from '../types/tenant-api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Liquidação: filtro por período (ISO week), tabela de entries por merchant,
 * modal de detalhes com botão "Dar baixa" (se PENDING). Botão para executar batch do período atual.
 */
export function SettlementPage() {
  const { tenant } = useTenant();
  const { roles, tenantId: tokenTenantId } = useAuth();

  const isSystemAdmin = roles.includes('system_admin');

  const [selectedTenantId, setSelectedTenantId] = React.useState<string | null>(null);
  const [tenants, setTenants] = React.useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = React.useState(false);
  const [tenantsError, setTenantsError] = React.useState<string | null>(null);

  const [periodKey, setPeriodKey] = React.useState(() => getLastClosedPeriodKey());
  const [selectedEntry, setSelectedEntry] = React.useState<SettlementEntry | null>(null);
  const [runBatchLoading, setRunBatchLoading] = React.useState(false);
  const [runBatchError, setRunBatchError] = React.useState<string | null>(null);

  const tenantIdForApi =
    tokenTenantId ?? (isSystemAdmin ? selectedTenantId : null) ?? tenant?.tenantId ?? null;

  React.useEffect(() => {
    if (!isSystemAdmin) return;
    if (tokenTenantId) return; // escopo vem do token

    setTenantsLoading(true);
    setTenantsError(null);
    setTenants([]);

    getTenants()
      .then((res) => {
        const list = res.tenants ?? [];
        setTenants(list);
        // auto-seleciona se houver uma opção
        if (list.length > 0) setSelectedTenantId(list[0].id);
      })
      .catch((err) => {
        setTenantsError(err instanceof Error ? err.message : 'Erro ao carregar parceiros');
      })
      .finally(() => setTenantsLoading(false));
  }, [isSystemAdmin, tokenTenantId]);

  const { batch, loading, error, refetch } = useSettlementBatch(tenantIdForApi, periodKey);
  const entries = batch?.entries ?? [];

  const handleRunBatch = React.useCallback(async () => {
    if (!tenantIdForApi) return;
    setRunBatchLoading(true);
    setRunBatchError(null);
    try {
      await runSettlementBatch(tenantIdForApi);
      // Seletor mostra só períodos fechados; mantém o selecionado e atualiza dados
      refetch();
    } catch (err) {
      setRunBatchError(err instanceof Error ? err.message : 'Erro ao executar batch.');
    } finally {
      setRunBatchLoading(false);
    }
  }, [tenantIdForApi, refetch]);

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

      {isSystemAdmin && !tokenTenantId && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium">Selecionar parceiro (system_admin)</div>
          {tenantsLoading ? (
            <div className="text-sm text-muted-foreground">Carregando parceiros...</div>
          ) : tenantsError ? (
            <StatusMessage message={tenantsError} variant="error" onDismiss={() => setTenantsError(null)} />
          ) : (
            <select
              value={selectedTenantId ?? ''}
              onChange={(e) => setSelectedTenantId(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              disabled={tenantsLoading || tenants.length === 0}
            >
              {tenants.length === 0 ? (
                <option value="">Nenhum parceiro disponível</option>
              ) : (
                tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fantasyName}
                  </option>
                ))
              )}
            </select>
          )}
        </div>
      )}

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
        tenantId={tenantIdForApi}
        onPaidSuccess={handlePaidSuccess}
      />
    </div>
  );
}
