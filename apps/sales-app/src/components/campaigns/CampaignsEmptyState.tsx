import { Button } from '@core-ui/ui';
import { Megaphone } from 'lucide-react';
import { EmptyState } from '../EmptyState';

interface CampaignsEmptyStateProps {
  onNewCampaign: () => void;
}

/**
 * Estado vazio da lista de campanhas (usa EmptyState reutilizável).
 */
export function CampaignsEmptyState({ onNewCampaign }: CampaignsEmptyStateProps) {
  return (
    <EmptyState
      icon={<Megaphone />}
      title="Nenhuma campanha encontrada"
      description='Clique em "Nova campanha" para criar a primeira.'
      action={
        <Button className="bg-[var(--brand-primary)] hover:opacity-90" onClick={onNewCampaign}>
          Nova campanha
        </Button>
      }
    />
  );
}
