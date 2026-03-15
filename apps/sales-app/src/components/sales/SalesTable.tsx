import * as React from 'react';
import { Button } from '@core-ui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime, formatExpiry } from '../../utils/format';
import type { TenantVoucherItem } from '../../types/voucher';

interface SalesTableProps {
  items: TenantVoucherItem[];
  loading: boolean;
  total: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onRowClick: (item: TenantVoucherItem) => void;
}

/**
 * Tabela responsiva de vouchers: desktop = tabela; mobile = cards.
 * Colunas: displayCode, campaignName, status, issuedAt, expiresAt.
 * Linha clicável abre detalhes (callback onRowClick).
 */
export function SalesTable({
  items,
  loading,
  total,
  currentPage,
  perPage,
  onPageChange,
  onRowClick,
}: SalesTableProps) {
  const totalPages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Código</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Campanha</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Emitido em</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Expira em</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.voucherId}
                      role="button"
                      tabIndex={0}
                      onClick={() => onRowClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(item);
                        }
                      }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-medium">{item.displayCode}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.campaignName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.status}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(item.issuedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatExpiry(item.expiresAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item.voucherId}
                  type="button"
                  onClick={() => onRowClick(item)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/30 active:bg-muted/50"
                >
                  <div className="font-mono font-medium text-foreground">{item.displayCode}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.campaignName} · {item.status}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Emitido: {formatDateTime(item.issuedAt)} · Expira: {formatExpiry(item.expiresAt)}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages} · {total} resultado(s)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
            >
              Próxima
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
