import { Card, CardContent, CardHeader, CardTitle } from '@core-ui/ui';
import { cn } from '@core-ui/ui';

/** Valores fixos em centavos para exibição (R$). */
export const AMOUNT_OPTIONS = [
  { label: 'R$ 50', cents: 5000 },
  { label: 'R$ 100', cents: 10000 },
  { label: 'R$ 300', cents: 30000 },
  { label: 'R$ 500', cents: 50000 },
] as const;

interface AmountSelectorProps {
  valueCents: number | null;
  onChange: (cents: number) => void;
  disabled?: boolean;
}

/**
 * Seleção de valor em botões fixos (sem digitação livre).
 */
export function AmountSelector({
  valueCents,
  onChange,
  disabled,
}: AmountSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Valor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AMOUNT_OPTIONS.map(({ label, cents }) => {
            const selected = valueCents === cents;
            return (
              <button
                key={cents}
                type="button"
                onClick={() => onChange(cents)}
                disabled={disabled}
                className={cn(
                  'rounded-lg border-2 px-4 py-3 text-lg font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  selected
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                    : 'border-input bg-background hover:bg-muted/50 text-foreground'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
