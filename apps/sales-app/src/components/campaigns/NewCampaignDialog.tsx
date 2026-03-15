import * as React from 'react';
import { Button } from '@core-ui/ui';
import { useTenant } from '../../contexts/TenantContext';
import { createCampaign } from '../../api/campaigns';
import { StatusMessage } from '../StatusMessage';
import { Dialog } from '../sales/Dialog';
import { campaignInputClass } from './campaignFormStyles';
import type { CreateCampaignRequest } from '../../types/campaign-api';

type DialogState = 'form' | 'loading' | 'error';

interface NewCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal "Nova campanha": formulário (name, expirationDays, startsAt, endsAt).
 * POST /campaigns com header tenant. Após sucesso, fecha e dispara refetch.
 */
export function NewCampaignDialog({ open, onClose, onSuccess }: NewCampaignDialogProps) {
  const { tenant } = useTenant();
  const [state, setState] = React.useState<DialogState>('form');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [expirationDays, setExpirationDays] = React.useState<number>(30);
  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');

  const canSubmit =
    state === 'form' &&
    !!tenant?.tenantId &&
    name.trim() !== '' &&
    expirationDays >= 1 &&
    startsAt !== '' &&
    endsAt !== '';

  const handleOpenChange = React.useCallback(() => {
    if (!open) return;
    onClose();
  }, [open, onClose]);

  const resetForm = React.useCallback(() => {
    setState('form');
    setErrorMessage(null);
    setName('');
    setExpirationDays(30);
    setStartsAt('');
    setEndsAt('');
  }, []);

  const prevOpen = React.useRef(false);
  React.useEffect(() => {
    if (open && !prevOpen.current) resetForm();
    prevOpen.current = open;
  }, [open, resetForm]);

  const handleSubmit = async () => {
    if (!tenant?.tenantId || !canSubmit) return;
    setState('loading');
    setErrorMessage(null);
    const body: CreateCampaignRequest = {
      name: name.trim(),
      expirationDays,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    };
    try {
      await createCampaign(tenant.tenantId, body);
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao criar campanha.');
      setState('error');
    }
  };

  return (
    <Dialog open={open} onClose={handleOpenChange}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Nova campanha</h2>

        {state === 'error' && errorMessage && (
          <StatusMessage
            message={errorMessage}
            variant="error"
            onDismiss={() => setState('form')}
            className="mb-4"
          />
        )}

        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground text-xs">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={state === 'loading'}
              placeholder="Ex: Campanha Natal"
              className={`${campaignInputClass} mt-1`}
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs">Validade do voucher (dias)</label>
            <input
              type="number"
              min={1}
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value, 10) || 0)}
              disabled={state === 'loading'}
              className={`${campaignInputClass} mt-1`}
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs">Início</label>
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              disabled={state === 'loading'}
              className={`${campaignInputClass} mt-1`}
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs">Fim</label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              disabled={state === 'loading'}
              className={`${campaignInputClass} mt-1`}
            />
          </div>
          <Button
            size="lg"
            className="w-full bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {state === 'loading' ? 'Criando…' : 'Criar campanha'}
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
