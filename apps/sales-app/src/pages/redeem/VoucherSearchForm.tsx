import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Search } from 'lucide-react';

const inputClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface VoucherSearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

/** Campo código + botão Buscar; Enter dispara busca. */
export function VoucherSearchForm({
  value,
  onChange,
  onSearch,
  loading,
  inputRef,
}: VoucherSearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="displayCode" className="text-sm font-medium text-foreground">
          Código do voucher
        </label>
        <input
          ref={inputRef}
          id="displayCode"
          type="text"
          placeholder="Ex.: XPTO-9231"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          disabled={loading}
          autoFocus
        />
      </div>
      <Button
        type="submit"
        className="bg-[var(--brand-primary)] hover:opacity-90 sm:shrink-0"
        disabled={loading || !value.trim()}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Buscando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </span>
        )}
      </Button>
    </form>
  );
}

