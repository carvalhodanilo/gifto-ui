import { Button } from '@core-ui/ui';
import { Plus } from 'lucide-react';
import { PageHeader } from '../PageHeader';

interface SalesHeaderProps {
  onNewVoucher: () => void;
}

/**
 * Header da página de Vendas: PageHeader + botão "Novo voucher".
 */
export function SalesHeader({ onNewVoucher }: SalesHeaderProps) {
  return (
    <PageHeader
      title="Vendas"
      subtitle="Emita e acompanhe os vouchers vendidos"
      action={
        <Button
          size="lg"
          variant="brand"
          className="gap-2"
          onClick={onNewVoucher}
        >
          <Plus className="h-4 w-4" />
          Novo voucher
        </Button>
      }
    />
  );
}
