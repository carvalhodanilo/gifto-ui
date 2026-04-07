import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { getMerchantsByTenantAsSystemAdmin } from '../../api/system-admin-tenants';
import type { MerchantListItem } from '../../types/merchant-api';

const PER_PAGE = 10;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

export function SystemAdminTenantMerchantsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const id = tenantId ?? '';
  const navigate = useNavigate();

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

  const load = React.useCallback(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    getMerchantsByTenantAsSystemAdmin(id, {
      page,
      perPage: PER_PAGE,
      terms: terms || undefined,
      status: null,
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
  }, [id, page, terms]);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.perPage) : 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTerms(searchInput.trim());
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lojas do parceiro"
        subtitle="Somente leitura (system_admin)."
        action={
          <Button variant="outline" onClick={() => navigate(`/admin/tenants/${encodeURIComponent(id)}`)}>
            Voltar ao parceiro
          </Button>
        }
      />

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="tenant-merchants-search" className="text-sm font-medium text-foreground">
            Buscar
          </label>
          <input
            id="tenant-merchants-search"
            type="text"
            placeholder="Nome ou nome fantasia..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" variant="brand">
          Buscar
        </Button>
      </form>

      {error && <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : data ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Nome fantasia</th>
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
                        className="border-b border-border/50 last:border-0"
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

