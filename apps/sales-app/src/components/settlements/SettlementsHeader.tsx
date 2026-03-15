import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Play } from 'lucide-react';
import { PageHeader } from '../PageHeader';
import { getLastPeriodKeys } from '../../utils/iso-week';

interface SettlementsHeaderProps {
  periodKey: string;
  onPeriodChange: (periodKey: string) => void;
  onRunBatch: () => void;
  runBatchLoading: boolean;
}

/**
 * Header da página de Liquidação: título, filtro por período (últimos 3), botão executar batch.
 */
export function SettlementsHeader({
  periodKey,
  onPeriodChange,
  onRunBatch,
  runBatchLoading,
}: SettlementsHeaderProps) {
  const periodOptions = React.useMemo(() => getLastPeriodKeys(3), []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Liquidação"
        subtitle="Resumo por merchant por período (semana ISO)"
        action={
          <Button
            size="lg"
            className="gap-2 bg-[var(--brand-primary)] hover:opacity-90"
            onClick={onRunBatch}
            disabled={runBatchLoading}
          >
            <Play className="h-4 w-4" />
            {runBatchLoading ? 'Executando…' : 'Executar batch do período atual'}
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        <select
          value={periodKey}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
        >
          {periodOptions.map(({ periodKey: key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
