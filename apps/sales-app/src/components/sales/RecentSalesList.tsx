import { Card, CardContent, CardHeader, CardTitle } from '@core-ui/ui';
import { Button } from '@core-ui/ui';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { RecentSale } from '../../types/voucher';

interface RecentSalesListProps {
  sales: RecentSale[];
  onPrint: (sale: RecentSale) => void;
}

/**
 * Lista das últimas vendas para reimpressão. Mantido em memória (últimas 5).
 * Botão Imprimir: layout pronto; futuramente acionar impressão real.
 */
export function RecentSalesList({ sales, onPrint }: RecentSalesListProps) {
  if (sales.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Últimas vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sales.map((sale, index) => (
            <li
              key={`${sale.displayCode}-${sale.issuedAt}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono font-semibold">{sale.displayCode}</span>
                <span className="text-muted-foreground">{formatCurrency(sale.amountCents)}</span>
                <span className="text-muted-foreground text-xs">{formatDateTime(sale.issuedAt)}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => onPrint(sale)}
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
