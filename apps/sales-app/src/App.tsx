import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantTheme } from './components/TenantTheme';
import { TenantLoadingScreen } from './components/TenantLoadingScreen';
import { TenantNotFoundScreen } from './components/TenantNotFoundScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettlementPage } from './pages/SettlementPage';

/**
 * Rotas após resolução do tenant: login (público) e rotas autenticadas (dashboard, vendas).
 * Futuro: /login chama POST /auth/login; tenantId identificado pelo backend.
 */
function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="settlement" element={<SettlementPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Após tenant resolvido: aplica tema, AuthProvider e rotas (login + área autenticada).
 */
function AppRoutes() {
  const { status, tenant, error, retry } = useTenant();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : undefined;

  if (status === 'idle' || status === 'loading') {
    return <TenantLoadingScreen />;
  }

  if (status === 'error') {
    return (
      <TenantNotFoundScreen
        onRetry={retry}
        hostname={hostname}
        message={error}
      />
    );
  }

  if (status === 'success' && tenant) {
    return (
      <TenantTheme tenant={tenant}>
        <AuthProvider>
          <AuthenticatedRoutes />
        </AuthProvider>
      </TenantTheme>
    );
  }

  return <TenantLoadingScreen />;
}

export default function App() {
  return (
    <TenantProvider>
      <AppRoutes />
    </TenantProvider>
  );
}
