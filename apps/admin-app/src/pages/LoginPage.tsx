import * as React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@core-ui/ui';
import { cn } from '@core-ui/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { useMerchant } from '../contexts/MerchantContext';
import { AuthLayout } from '../components/AuthLayout';
import { getTenants } from '../api/tenants';
import { getActiveMerchants } from '../api/merchants';
import type { TenantOption } from '../types/tenant-api';
import type { MerchantOption } from '../types/merchant-api';

const inputClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Login admin: tenant -> merchants ativos -> merchant -> email/senha (mock).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { setTenantFromSelection, resetTenant } = useTenant();
  const { setMerchant } = useMerchant();

  const [tenants, setTenants] = React.useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = React.useState(true);
  const [tenantId, setTenantId] = React.useState('');
  const [merchants, setMerchants] = React.useState<MerchantOption[]>([]);
  const [merchantsLoading, setMerchantsLoading] = React.useState(false);
  const [merchantsError, setMerchantsError] = React.useState<string | null>(null);
  const [merchantId, setMerchantId] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    getTenants()
      .then((res) => {
        setTenants(res.tenants ?? []);
      })
      .catch(() => setTenants([]))
      .finally(() => setTenantsLoading(false));
  }, []);

  React.useEffect(() => {
    if (!tenantId) {
      resetTenant();
      setMerchants([]);
      setMerchantId('');
      setMerchant(null);
      setMerchantsError(null);
      return;
    }
    const option = tenants.find((t) => t.id === tenantId);
    if (option) {
      setTenantFromSelection(option);
    }
    setMerchantsLoading(true);
    setMerchantsError(null);
    let cancelled = false;
    getActiveMerchants(tenantId)
      .then((res) => {
        if (cancelled) return;
        setMerchants(res.merchantList ?? []);
        setMerchantId('');
        setMerchant(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setMerchants([]);
        setMerchantId('');
        setMerchant(null);
        setMerchantsError(err instanceof Error ? err.message : 'Erro ao carregar merchants');
      })
      .finally(() => {
        if (!cancelled) setMerchantsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId, tenants, setTenantFromSelection, resetTenant, setMerchant]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTenantId(e.target.value);
  };

  const handleMerchantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setMerchantId(id);
    const option = merchants.find((m) => m.id === id) ?? null;
    setMerchant(option);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !merchantId) return;
    const merchant = merchants.find((m) => m.id === merchantId);
    if (!merchant) return;
    setIsSubmitting(true);
    try {
      await login(email || 'admin@demo.com', password, merchant.id, merchant.merchantName);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(tenantId && merchantId);
  const merchantSelectDisabled = tenantsLoading || merchantsLoading || !tenantId;

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-center">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="tenant" className="text-sm font-medium text-foreground">
                Empresa
              </label>
              <select
                id="tenant"
                value={tenantId}
                onChange={handleTenantChange}
                disabled={tenantsLoading}
                className={cn(
                  inputClassName,
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <option value="">Selecione a empresa</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fantasyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="merchant" className="text-sm font-medium text-foreground">
                Merchant
              </label>
              <select
                id="merchant"
                value={merchantId}
                onChange={handleMerchantChange}
                disabled={merchantSelectDisabled}
                className={cn(
                  inputClassName,
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <option value="">
                  {merchantsLoading
                    ? 'Carregando...'
                    : merchantsError
                      ? 'Erro ao carregar'
                      : !tenantId
                        ? 'Selecione a empresa'
                        : merchants.length === 0
                          ? 'Nenhum merchant ativo'
                          : 'Selecione o merchant'}
                </option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.merchantName}
                  </option>
                ))}
              </select>
              {merchantsError && (
                <p className="text-xs text-destructive">{merchantsError}</p>
              )}
              {tenantId && !merchantsLoading && !merchantsError && merchants.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum merchant ativo para esta empresa.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[var(--brand-primary)] hover:opacity-90"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
