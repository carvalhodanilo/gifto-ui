import { Button } from '@core-ui/ui';
import { Dialog } from './Dialog';

interface VoucherDetailsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal placeholder para detalhes do voucher (linha clicável).
 * Conteúdo "Em breve"; mesmo padrão visual clean da aplicação.
 */
export function VoucherDetailsDialog({ open, onClose }: VoucherDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Detalhes do voucher</h2>
        <p className="text-sm text-muted-foreground mb-6">Em breve</p>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
