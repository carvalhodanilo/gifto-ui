import * as React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useTenantVouchers } from '../hooks/useTenantVouchers';
import { SalesHeader } from '../components/sales/SalesHeader';
import { SalesEmptyState } from '../components/sales/SalesEmptyState';
import { SalesFilters } from '../components/sales/SalesFilters';
import { SalesTable } from '../components/sales/SalesTable';
import { NewVoucherDialog } from '../components/sales/NewVoucherDialog';
import { VoucherDetailsDialog } from '../components/sales/VoucherDetailsDialog';
import { StatusMessage } from '../components/StatusMessage';
import type { TenantVoucherItem } from '../types/voucher';
import type { VoucherListItem } from '../types/voucher';

/**
 * Página de Vendas: central operacional de emissão e acompanhamento de vouchers.
 * Listagem real por tenant (GET /tenants/{tenantId}/vouchers), filtros, paginação,
 * refresh após emissão e modal de detalhes (placeholder).
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
  const [detailsVoucher, setDetailsVoucher] = React.useState<TenantVoucherItem | null>(null);

  const handleNewVoucher = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  /** Após emissão: atualizar tabela mantendo filtros e página. */
  const handleIssueSuccess = React.useCallback(
    (_item?: VoucherListItem) => {
      refetch();
    },
    [refetch]
  );

  const handleRowClick = React.useCallback((item: TenantVoucherItem) => {
    setDetailsVoucher(item);
  }, []);

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
          onRowClick={handleRowClick}
        />
      )}

      <NewVoucherDialog
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleIssueSuccess}
      />

      <VoucherDetailsDialog
        open={detailsVoucher !== null}
        onClose={() => setDetailsVoucher(null)}
      />
    </div>
  );
}
