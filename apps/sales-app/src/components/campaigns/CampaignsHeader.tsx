import { Button } from '@core-ui/ui';
import { Plus } from 'lucide-react';
import { PageHeader } from '../PageHeader';

interface CampaignsHeaderProps {
  onNewCampaign: () => void;
}

/**
 * Header da página de Campanhas: PageHeader + botão "Nova campanha".
 */
export function CampaignsHeader({ onNewCampaign }: CampaignsHeaderProps) {
  return (
    <PageHeader
      title="Campanhas"
      subtitle="Gerencie as campanhas ativas do shopping"
      action={
        <Button
          size="lg"
          variant="brand"
          className="gap-2"
          onClick={onNewCampaign}
        >
          <Plus className="h-4 w-4" />
          Nova campanha
        </Button>
      }
    />
  );
}
