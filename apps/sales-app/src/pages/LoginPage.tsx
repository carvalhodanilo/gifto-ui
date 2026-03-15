import * as React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@core-ui/ui';
import { cn } from '@core-ui/ui';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { getTenants } from '../api/tenants';
import type { TenantOption } from '../types/tenant-api';

const inputClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Login page: AuthLayout (logo + tenant name) + card com seletor de empresa, email, senha.
 * GET /tenants para listar empresas; ao logar, TenantContext é atualizado com setTenantFromLogin.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { setTenantFromLogin } = useTenant();
  const [tenants, setTenants] = React.useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = React.useState(true);
  const [tenantId, setTenantId] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    getTenants()
      .then((res) => {
        setTenants(res.tenants ?? []);
        if (res.tenants?.length) setTenantId(res.tenants[0].id);
      })
      .catch(() => setTenants([]))
      .finally(() => setTenantsLoading(false));
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setIsLoading(true);
    try {
      await login(email || 'operador@demo.com', password, tenantId);
      const name = tenants.find((t) => t.id === tenantId)?.fantasyName ?? '';
      setTenantFromLogin(tenantId, name);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

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
                onChange={(e) => setTenantId(e.target.value)}
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
              disabled={isLoading || tenantsLoading || !tenantId}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
