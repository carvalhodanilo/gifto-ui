import { Button } from '@core-ui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateTime, formatExpiry } from '../../utils/format';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import type { TenantVoucherItem } from '../../types/voucher';

interface SalesTableProps {
  items: TenantVoucherItem[];
  loading: boolean;
  total: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Tabela responsiva de vouchers: desktop = tabela; mobile = cards.
 * Colunas: campanha, comprador, valor, status, emitido, expira.
 * Linha não é clicável (sem modal de detalhes).
 */
export function SalesTable({
  items,
  loading,
  total,
  currentPage,
  perPage,
  onPageChange,
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
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Campanha</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Comprador</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Telefone</th>
                    <th className="px-4 py-3 text-right font-medium text-foreground">Valor (R$)</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Emitido em</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Expira em</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.voucherId}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground">{item.campaignName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.buyerName?.trim() ? item.buyerName : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {item.buyerPhone?.trim() ? item.buyerPhone : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(item.amountCents ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <VoucherStatusBadge status={item.status} />
                      </td>
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

            {/* Mobile: cards (somente leitura) */}
            <div className="md:hidden divide-y divide-border">
              {items.map((item) => (
                <div key={item.voucherId} className="px-4 py-3">
                  <div className="font-medium text-foreground">{item.campaignName}</div>
                  {(item.buyerName || item.buyerPhone) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.buyerName?.trim() ? item.buyerName : '—'}
                      {item.buyerPhone?.trim() ? ` · ${item.buyerPhone}` : ''}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">
                      {formatCurrency(item.amountCents ?? 0)}
                    </span>
                    <VoucherStatusBadge status={item.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Emitido: {formatDateTime(item.issuedAt)} · Expira: {formatExpiry(item.expiresAt)}
                  </div>
                </div>
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
