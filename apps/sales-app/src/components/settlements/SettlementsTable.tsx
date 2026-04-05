import { formatCurrency } from '../../utils/format';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { SettlementEntry } from '../../types/settlement-api';

interface SettlementsTableProps {
  entries: SettlementEntry[];
  loading: boolean;
  onRowClick: (entry: SettlementEntry) => void;
}

/**
 * Tabela de entries do batch: nome da loja, total (líquido), status.
 * Clique na linha abre o modal de detalhes.
 */
export function SettlementsTable({
  entries,
  loading,
  onRowClick,
}: SettlementsTableProps) {
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
                  <th className="px-4 py-3 text-left font-medium text-foreground">Loja</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.entryId}
                    role="button"
                    tabIndex={0}
                    onClick={() => onRowClick(entry)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(entry);
                      }
                    }}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {entry.merchantName ?? entry.merchantId}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(entry.netCents)}
                    </td>
                    <td className="px-4 py-3">
                      <SettlementStatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border">
            {entries.map((entry) => (
              <button
                key={entry.entryId}
                type="button"
                onClick={() => onRowClick(entry)}
                className="w-full px-4 py-3 text-left hover:bg-muted/30 active:bg-muted/50"
              >
                <div className="font-medium text-foreground">
                  {entry.merchantName ?? entry.merchantId}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Total: {formatCurrency(entry.netCents)} ·{' '}
                  <SettlementStatusBadge status={entry.status} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
