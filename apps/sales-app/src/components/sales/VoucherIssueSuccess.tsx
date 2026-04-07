import { Button } from '@core-ui/ui';
import { CheckCircle2, Printer, PlusCircle, X } from 'lucide-react';
import { formatCurrency, formatExpiry } from '../../utils/format';
import type { IssueVoucherResponse } from '../../types/voucher';

interface VoucherIssueSuccessProps {
  data: IssueVoucherResponse;
  amountCents: number;
  campaignName: string;
  onPrint: () => void;
  onEmitAnother: () => void;
  onClose: () => void;
}

/**
 * Conteúdo de sucesso no modal: displayCode em destaque, valor, campanha, expiração,
 * botões Imprimir voucher, Emitir outro, Fechar. Futuro: QR Code e impressão real.
 */
export function VoucherIssueSuccess({
  data,
  amountCents,
  campaignName,
  onPrint,
  onEmitAnother,
  onClose,
}: VoucherIssueSuccessProps) {
  return (
    <div className="min-w-0 overflow-x-hidden p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <span className="font-semibold">Voucher emitido com sucesso</span>
        </div>

        <div
          className="rounded-xl bg-muted/50 px-4 py-3 font-mono text-2xl font-bold tracking-wider sm:px-6 sm:py-4"
          style={{ color: 'var(--brand-primary)' }}
        >
          {data.displayCode}
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Valor: {formatCurrency(amountCents)}</p>
          <p>Campanha: {campaignName}</p>
          <p>Expira em: {formatExpiry(data.expiresAt)}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button
            size="lg"
            variant="brand"
            className="shrink-0 gap-2"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Imprimir voucher
          </Button>
          <p className="text-xs text-muted-foreground -mt-1">
            Use etiqueta adesiva 50×30 mm e imprima em tamanho real.
          </p>
          <Button variant="outline" size="lg" className="shrink-0 gap-2" onClick={onEmitAnother}>
            <PlusCircle className="h-4 w-4" />
            Emitir outro
          </Button>
          <Button variant="ghost" size="lg" className="shrink-0 gap-2" onClick={onClose}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
