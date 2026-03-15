import { Card, CardContent } from '@core-ui/ui';
import { Button } from '@core-ui/ui';
import { CheckCircle2, Printer, PlusCircle } from 'lucide-react';
import type { IssueVoucherResponse } from '../../types/voucher';

interface VoucherResultProps {
  data: IssueVoucherResponse;
  amountCents: number;
  onPrint: () => void;
  onNewSale: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatExpiry(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Card de sucesso após emissão: displayCode em destaque, valor, expiração,
 * botões Imprimir e Nova venda.
 * Futuro: incluir QR Code (publicToken/displayCode); onPrint acionar impressão real.
 */
export function VoucherResult({
  data,
  amountCents,
  onPrint,
  onNewSale,
}: VoucherResultProps) {
  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-semibold">Voucher emitido com sucesso</span>
          </div>

          <div
            className="rounded-xl bg-background px-6 py-4 font-mono text-3xl font-bold tracking-wider text-foreground"
            style={{ color: 'var(--brand-primary)' }}
          >
            {data.displayCode}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>Valor: {formatCurrency(amountCents)}</span>
            <span>Expira em: {formatExpiry(data.expiresAt)}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="gap-2 bg-[var(--brand-primary)] hover:opacity-90"
              onClick={onPrint}
            >
              <Printer className="h-4 w-4" />
              Imprimir voucher
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={onNewSale}>
              <PlusCircle className="h-4 w-4" />
              Nova venda
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
