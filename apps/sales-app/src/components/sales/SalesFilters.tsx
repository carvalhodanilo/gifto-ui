import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Search, X } from 'lucide-react';
import type { TenantVouchersFilters } from '../../hooks/useTenantVouchers';

interface SalesFiltersProps {
  filters: TenantVouchersFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<TenantVouchersFilters>>;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const inputClass =
  'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50';

/**
 * Filtros da listagem de vouchers: código, campanha, comprador (nome/telefone), apenas ativos.
 * Visual leve e clean; Buscar e Limpar filtros.
 */
export function SalesFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  disabled = false,
}: SalesFiltersProps) {
  const handleDisplayCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev) => ({ ...prev, displayCode: e.target.value }));
  };
  const handleCampaignName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev) => ({ ...prev, campaignName: e.target.value }));
  };
  const handleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev) => ({ ...prev, active: e.target.checked }));
  };
  const handleBuyerName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev) => ({ ...prev, buyerName: e.target.value }));
  };
  const handleBuyerPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange((prev) => ({ ...prev, buyerPhone: e.target.value }));
  };

  const hasFilters =
    filters.displayCode !== '' ||
    filters.campaignName !== '' ||
    filters.buyerName !== '' ||
    filters.buyerPhone !== '' ||
    !filters.active;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-[180px]">
          <label htmlFor="filter-displayCode" className="text-muted-foreground text-xs">
            Código
          </label>
          <input
            id="filter-displayCode"
            type="text"
            placeholder="Ex: ABC123"
            value={filters.displayCode}
            onChange={handleDisplayCode}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="min-w-0 flex-1 sm:max-w-[200px]">
          <label htmlFor="filter-campaign" className="text-muted-foreground text-xs">
            Campanha
          </label>
          <input
            id="filter-campaign"
            type="text"
            placeholder="Ex: DEFAULT"
            value={filters.campaignName}
            onChange={handleCampaignName}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="min-w-0 flex-1 sm:max-w-[200px]">
          <label htmlFor="filter-buyer-name" className="text-muted-foreground text-xs">
            Comprador (nome)
          </label>
          <input
            id="filter-buyer-name"
            type="text"
            placeholder="Nome"
            value={filters.buyerName}
            onChange={handleBuyerName}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="min-w-0 flex-1 sm:max-w-[160px]">
          <label htmlFor="filter-buyer-phone" className="text-muted-foreground text-xs">
            Comprador (telefone)
          </label>
          <input
            id="filter-buyer-phone"
            type="text"
            placeholder="Telefone"
            value={filters.buyerPhone}
            onChange={handleBuyerPhone}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="filter-active"
            type="checkbox"
            checked={filters.active}
            onChange={handleActive}
            disabled={disabled}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="filter-active" className="text-sm text-muted-foreground">
            Apenas ativos
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onApply}
            disabled={disabled}
            className="gap-1.5 bg-[var(--brand-primary)] hover:opacity-90"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar
          </Button>
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
