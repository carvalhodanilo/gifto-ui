import * as React from 'react';
import { getTenantVouchers } from '../api/tenant-vouchers';
import type { TenantVoucherItem, TenantVouchersParams } from '../types/voucher';

const DEFAULT_PER_PAGE = 10;

export interface TenantVouchersFilters {
  displayCode: string;
  campaignName: string;
  buyerName: string;
  buyerPhone: string;
  active: boolean;
}

const defaultFilters: TenantVouchersFilters = {
  displayCode: '',
  campaignName: '',
  buyerName: '',
  buyerPhone: '',
  active: true,
};

export interface UseTenantVouchersResult {
  items: TenantVoucherItem[];
  total: number;
  currentPage: number;
  perPage: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filters: TenantVouchersFilters;
  setFilters: React.Dispatch<React.SetStateAction<TenantVouchersFilters>>;
  appliedFilters: TenantVouchersFilters;
  applyFilters: () => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

/**
 * Hook para listagem de vouchers do tenant com filtros e paginação.
 * Usa tenantId do TenantContext no caller.
 */
export function useTenantVouchers(
  tenantId: string | null,
  options: { perPage?: number } = {}
): UseTenantVouchersResult {
  const perPage = options.perPage ?? DEFAULT_PER_PAGE;
  const [filters, setFilters] = React.useState<TenantVouchersFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<TenantVouchersFilters>(defaultFilters);
  const [page, setPage] = React.useState(0);
  const [data, setData] = React.useState<{
    items: TenantVoucherItem[];
    total: number;
    currentPage: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fetchRef = React.useRef(0);

  const fetchVouchers = React.useCallback(() => {
    if (!tenantId) {
      setData(null);
      setError(null);
      return;
    }
    const id = ++fetchRef.current;
    setLoading(true);
    setError(null);
    const params: TenantVouchersParams = {
      page,
      perPage,
      active: appliedFilters.active,
      campaignName: appliedFilters.campaignName || undefined,
      displayCode: appliedFilters.displayCode || undefined,
      buyerName: appliedFilters.buyerName || undefined,
      buyerPhone: appliedFilters.buyerPhone || undefined,
    };
    getTenantVouchers(tenantId, params)
      .then((res) => {
        if (id !== fetchRef.current) return;
        setData({
          items: res.items,
          total: res.total,
          currentPage: res.currentPage,
        });
      })
      .catch((err) => {
        if (id !== fetchRef.current) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar vouchers');
        setData(null);
      })
      .finally(() => {
        if (id === fetchRef.current) setLoading(false);
      });
  }, [tenantId, page, perPage, appliedFilters]);

  React.useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const refetch = React.useCallback(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const applyFilters = React.useCallback(() => {
    setAppliedFilters(filters);
    setPage(0);
  }, [filters]);

  const clearFilters = React.useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(0);
  }, []);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    currentPage: data?.currentPage ?? 0,
    perPage,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    setPage,
  };
}
