import { Card, CardContent, CardHeader, CardTitle } from '@core-ui/ui';
import { cn } from '@core-ui/ui';
import type { Campaign } from '../../types/voucher';

interface CampaignSelectorProps {
  campaigns: Campaign[];
  value: string | null;
  onChange: (campaignId: string) => void;
  disabled?: boolean;
  /** Exibe "Carregando campanhas..." como única opção quando true. */
  loading?: boolean;
}

/**
 * Seletor de campanha. Recebe lista de Campaign[] (ex.: useCampaigns(tenantId)).
 * GET /campaigns?tenantId= populado pelo hook.
 */
export function CampaignSelector({
  campaigns,
  value,
  onChange,
  disabled,
  loading,
}: CampaignSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Campanha</CardTitle>
      </CardHeader>
      <CardContent>
        <select
          value={loading ? '' : (value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          <option value="">
            {loading ? 'Carregando campanhas...' : 'Selecione uma campanha'}
          </option>
          {!loading &&
            campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </CardContent>
    </Card>
  );
}
