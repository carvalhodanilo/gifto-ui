import * as React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useTenantVouchers } from '../hooks/useTenantVouchers';
import { SalesHeader } from '../components/sales/SalesHeader';
import { SalesEmptyState } from '../components/sales/SalesEmptyState';
import { SalesFilters } from '../components/sales/SalesFilters';
import { SalesTable } from '../components/sales/SalesTable';
import { NewVoucherDialog } from '../components/sales/NewVoucherDialog';
import { StatusMessage } from '../components/StatusMessage';

/**
 * Página de Vendas: central operacional de emissão e acompanhamento de vouchers.
 * Listagem por tenant (GET /v1/vouchers/list), filtros, paginação e refresh após emissão.
 */
export function SalesPage() {
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? null;
  const {
    items,
    total,
    currentPage,
    perPage,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    applyFilters,
    clearFilters,
    setPage,
  } = useTenantVouchers(tenantId);

  const [modalOpen, setModalOpen] = React.useState(false);

  const handleNewVoucher = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  /** Após emissão: atualizar tabela mantendo filtros e página. */
  const handleIssueSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const showEmpty = !loading && !error && items.length === 0;
  const showTable = !error && (items.length > 0 || loading);

  return (
    <div className="space-y-6">
      <SalesHeader onNewVoucher={handleNewVoucher} />

      <SalesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        disabled={!tenantId || loading}
      />

      {error && (
        <StatusMessage
          message={error}
          variant="error"
          onDismiss={() => refetch()}
        />
      )}

      {showEmpty && <SalesEmptyState onNewVoucher={handleNewVoucher} />}
      {showTable && (
        <SalesTable
          items={items}
          loading={loading}
          total={total}
          currentPage={currentPage}
          perPage={perPage}
          onPageChange={setPage}
        />
      )}

      <NewVoucherDialog
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleIssueSuccess}
      />
    </div>
  );
}
