import { Button } from '@core-ui/ui';
import { Ticket } from 'lucide-react';
import { EmptyState } from '../EmptyState';

interface SalesEmptyStateProps {
  onNewVoucher: () => void;
}

/**
 * Estado vazio da lista de vouchers (usa EmptyState reutilizável).
 */
export function SalesEmptyState({ onNewVoucher }: SalesEmptyStateProps) {
  return (
    <EmptyState
      icon={<Ticket />}
      title="Nenhum voucher emitido"
      description='Clique em "Novo voucher" para emitir o primeiro.'
      action={
        <Button className="bg-[var(--brand-primary)] hover:opacity-90" onClick={onNewVoucher}>
          Novo voucher
        </Button>
      }
    />
  );
}
