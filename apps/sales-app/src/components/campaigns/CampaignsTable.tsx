import { formatDateOnly } from '../../utils/format';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import type { CampaignListItem } from '../../types/campaign-api';

interface CampaignsTableProps {
  items: CampaignListItem[];
  loading: boolean;
  onRowClick: (item: CampaignListItem) => void;
}

/**
 * Tabela responsiva de campanhas: desktop = tabela; mobile = cards.
 * Colunas: name, expirationDays, startsAt, endsAt, status. Sem paginação.
 */
export function CampaignsTable({ items, loading, onRowClick }: CampaignsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Carregando…
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Validade (dias)</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Início</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Fim</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onRowClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.expirationDays}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateOnly(item.startsAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateOnly(item.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRowClick(item)}
                className="w-full px-4 py-3 text-left hover:bg-muted/30 active:bg-muted/50"
              >
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Validade: {item.expirationDays} dias · <CampaignStatusBadge status={item.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Início: {formatDateOnly(item.startsAt)} · Fim: {formatDateOnly(item.endsAt)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
