import * as React from 'react';
import { Button } from '@core-ui/ui';
import { getLedgerEntries } from '../api/ledger';
import { formatCurrency, formatDateTime } from '../utils/format';
import { LedgerEntryDetailModal } from './history/LedgerEntryDetailModal';
import type { LedgerEntry } from '../types/ledger';
import { useAuth } from '../contexts/AuthContext';

const TYPE_LABELS: Record<string, string> = {
  REDEEM: 'Resgate',
  REVERSAL: 'Extorno',
};

const DEFAULT_SORT = 'createdAt';
const DEFAULT_DIR = 'desc' as const;
const PER_PAGE = 10;

/** Alterna direção ao clicar no mesmo campo; senão usa asc. */
function nextDir(currentSort: string, currentDir: 'asc' | 'desc', newSort: string): 'asc' | 'desc' {
  if (currentSort === newSort) return currentDir === 'asc' ? 'desc' : 'asc';
  return 'asc';
}

/** Página de histórico: tabela com busca, paginação e ordenação; modal ao clicar na linha. */
export function HistoryPage() {
  const { tenantId, merchantId } = useAuth();
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState(DEFAULT_SORT);
  const [dir, setDir] = React.useState<'asc' | 'desc'>(DEFAULT_DIR);
  const [data, setData] = React.useState<{
    items: LedgerEntry[];
    total: number;
    currentPage: number;
    perPage: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = React.useState<LedgerEntry | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const loadEntries = React.useCallback(() => {
    if (!tenantId || !merchantId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    getLedgerEntries(tenantId, merchantId, {
      search,
      page,
      perPage: PER_PAGE,
      sort,
      dir,
    })
      .then((res) => {
        setData({
          items: res.items,
          total: res.total,
          currentPage: res.currentPage,
          perPage: res.perPage,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [tenantId, merchantId, search, page, sort, dir]);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  /** Busca genérica: repassa o texto digitado no query param search; lógica no backend. */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const handleSort = (field: string) => {
    const newDir = nextDir(sort, dir, field);
    setSort(field);
    setDir(newDir);
    setPage(0);
  };

  const openDetail = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  /** Após extorno com sucesso: fechar modal e refresh da tabela (novo REVERSAL aparece na lista). */
  const handleReversalSuccess = React.useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    loadEntries();
  }, [loadEntries]);

  const totalPages = data ? Math.ceil(data.total / data.perPage) : 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Histórico</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lançamentos do merchant. Clique na linha para ver detalhes.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="history-search" className="text-sm font-medium text-foreground">
            Buscar
          </label>
          <input
            id="history-search"
            type="text"
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" className="bg-[var(--brand-primary)] hover:opacity-90">
          Buscar
        </Button>
      </form>

      {!tenantId || !merchantId ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Não foi possível identificar tenant/merchant no token. Faça login novamente.
        </div>
      ) : null}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => handleSort('displayCode')}
                      className="hover:text-[var(--brand-primary)]"
                    >
                      Display Code {sort === 'displayCode' && (dir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => handleSort('type')}
                      className="hover:text-[var(--brand-primary)]"
                    >
                      Tipo {sort === 'type' && (dir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => handleSort('amountCents')}
                      className="hover:text-[var(--brand-primary)]"
                    >
                      Valor {sort === 'amountCents' && (dir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    <button
                      type="button"
                      onClick={() => handleSort('createdAt')}
                      className="hover:text-[var(--brand-primary)]"
                    >
                      Data {sort === 'createdAt' && (dir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum lançamento encontrado.
                    </td>
                  </tr>
                ) : (
                  data.items.map((entry) => (
                    <tr
                      key={entry.ledgerEntryId}
                      onClick={() => openDetail(entry)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-foreground">{entry.displayCode ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </td>
                      <td className="px-4 py-3 text-foreground">{formatCurrency(entry.amountCents)}</td>
                      <td className="px-4 py-3 text-foreground">{formatDateTime(entry.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {data.currentPage + 1} de {totalPages} ({data.total} itens)
              </span>
              <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : null}

      <LedgerEntryDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onReversalSuccess={handleReversalSuccess}
      />
    </div>
  );
}

