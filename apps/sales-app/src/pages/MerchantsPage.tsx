import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { Plus } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { getMerchants } from '../api/merchants';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import type { MerchantListItem } from '../types/merchant-api';

const PER_PAGE = 10;
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

/**
 * Página de listagem de lojas (merchants) do tenant.
 * Mesmo padrão de header (PageHeader), busca e tabela paginada das demais telas.
 * Clique na linha leva à página de detalhes; botão "Novo" abre criação.
 * Futuro: seleção de tema por merchant poderá ser acessada a partir daqui ou da tela de detalhes.
 */
export function MerchantsPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [searchInput, setSearchInput] = React.useState('');
  const [terms, setTerms] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [data, setData] = React.useState<{
    items: MerchantListItem[];
    total: number;
    currentPage: number;
    perPage: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const tenantId = tenant?.tenantId ?? '';

  const loadMerchants = React.useCallback(() => {
    if (!tenantId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    getMerchants(tenantId, {
      page,
      perPage: PER_PAGE,
      terms: terms || undefined,
      status: null, // por enquanto enviar null; filtro por status pode ser adicionado depois
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
        setError(err instanceof Error ? err.message : 'Erro ao carregar lojas');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [tenantId, page, terms]);

  React.useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTerms(searchInput.trim());
    setPage(0);
  };

  const goToNew = () => navigate('/merchants/new');
  const goToDetail = (item: MerchantListItem) => navigate(`/merchants/${item.merchantId}`);

  const totalPages = data ? Math.ceil(data.total / data.perPage) : 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lojas"
        subtitle="CRUD de lojas do tenant. Clique na linha para ver ou editar."
        action={
          <Button
            size="lg"
            className="gap-2 bg-[var(--brand-primary)] hover:opacity-90"
            onClick={goToNew}
          >
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        }
      />

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="merchants-search" className="text-sm font-medium text-foreground">
            Buscar
          </label>
          <input
            id="merchants-search"
            type="text"
            placeholder="Nome ou nome fantasia..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" className="bg-[var(--brand-primary)] hover:opacity-90">
          Buscar
        </Button>
      </form>

      {error && (
        <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : data ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">
                      Nome fantasia
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma loja encontrada.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item) => (
                      <tr
                        key={item.merchantId}
                        role="button"
                        tabIndex={0}
                        onClick={() => goToDetail(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            goToDetail(item);
                          }
                        }}
                        className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.fantasyName ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {data.currentPage + 1} de {totalPages} ({data.total} itens)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
