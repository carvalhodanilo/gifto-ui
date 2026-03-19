import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { VoucherListItem } from '../../types/voucher';

const PAGE_SIZE = 10;

interface SalesListProps {
  items: VoucherListItem[];
  onPrint: (item: VoucherListItem) => void;
}

/**
 * Lista/tabela de vouchers emitidos com paginação.
 * Futuro: items virão da API de listagem (ex.: GET /v1/vouchers?page=&limit=);
 * paginação server-side; substituir items por estado de fetch + parâmetros de página.
 */
export function SalesList({ items, onPrint }: SalesListProps) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-foreground">Código</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Campanha</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Data/Hora</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                <th className="w-[100px] px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {slice.map((item) => (
                <tr
                  key={item.voucherId}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono font-medium">{item.displayCode}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.campaignName}</td>
                  <td className="px-4 py-3 text-right">
                    {item.amountCents != null ? formatCurrency(item.amountCents) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(item.issuedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.status ?? '—'}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onPrint(item)}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
