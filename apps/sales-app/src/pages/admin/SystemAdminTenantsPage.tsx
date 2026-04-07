import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { getTenantsPaged } from '../../api/system-admin-tenants';
import type { SystemAdminTenantListItem } from '../../types/system-admin-tenant-api';
import { TenantStatusBadge } from '../../components/admin/TenantStatusBadge';

const PER_PAGE = 10;

export function SystemAdminTenantsPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [nameInput, setNameInput] = React.useState('');
  const [documentInput, setDocumentInput] = React.useState('');
  const [filters, setFilters] = React.useState<{ name?: string; document?: string }>({});

  const [data, setData] = React.useState<{
    items: SystemAdminTenantListItem[];
    total: number;
    currentPage: number;
    perPage: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getTenantsPaged({
      page,
      perPage: PER_PAGE,
      name: filters.name,
      document: filters.document,
    })
      .then((res) => {
        setData({
          items: res.items ?? [],
          total: res.total,
          currentPage: res.currentPage,
          perPage: res.perPage,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar parceiros');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [page, filters.name, filters.document]);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / data.perPage) : 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      name: nameInput.trim() || undefined,
      document: documentInput.trim() || undefined,
    });
    setPage(0);
  };

  const goToDetail = (t: SystemAdminTenantListItem) => {
    navigate(`/admin/tenants/${encodeURIComponent(t.id)}`);
  };

  const goToNew = () => navigate('/admin/tenants/new');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parceiros"
        subtitle="Listagem e edição (system_admin). Clique na linha para ver/editar."
        action={
          <Button
            size="lg"
            variant="brand"
            className="gap-2"
            onClick={goToNew}
          >
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1 space-y-1">
          <label htmlFor="tenants-name" className="text-sm font-medium text-foreground">
            Buscar por nome
          </label>
          <input
            id="tenants-name"
            type="text"
            placeholder="Nome ou nome fantasia..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="min-w-[200px] space-y-1">
          <label htmlFor="tenants-document" className="text-sm font-medium text-foreground">
            Buscar por documento
          </label>
          <input
            id="tenants-document"
            type="text"
            placeholder="CPF/CNPJ..."
            value={documentInput}
            onChange={(e) => setDocumentInput(e.target.value)}
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
              <table className="w-full min-w-[650px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Nome fantasia</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Documento</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum parceiro encontrado.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((t) => (
                      <tr
                        key={t.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => goToDetail(t)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            goToDetail(t);
                          }
                        }}
                        className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{t.fantasyName ?? '—'}</td>
                        <td className="px-4 py-3 text-foreground">{t.document ?? '—'}</td>
                        <td className="px-4 py-3 text-foreground">
                          {t.status ? <TenantStatusBadge status={t.status} /> : '—'}
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

