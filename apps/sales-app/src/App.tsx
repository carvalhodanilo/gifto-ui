import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantTheme } from './components/TenantTheme';
import { TenantLoadingScreen } from './components/TenantLoadingScreen';
import { TenantNotFoundScreen } from './components/TenantNotFoundScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { SettlementPage } from './pages/SettlementPage';
import { MerchantsPage } from './pages/MerchantsPage';
import { MerchantDetailPage } from './pages/MerchantDetailPage';
import { RedeemPage } from './pages/RedeemPage';
import { HistoryPage } from './pages/HistoryPage';
import { SystemAdminTenantsPage } from './pages/admin/SystemAdminTenantsPage';
import { SystemAdminTenantCreatePage } from './pages/admin/SystemAdminTenantCreatePage';
import { SystemAdminTenantDetailPage } from './pages/admin/SystemAdminTenantDetailPage';
import { SystemAdminTenantMerchantsPage } from './pages/admin/SystemAdminTenantMerchantsPage';
import { TenantBrandingLoader } from './components/TenantBrandingLoader';

/**
 * Rotas após resolução do tenant: login (público) e rotas autenticadas (dashboard, vendas).
 * Futuro: /login chama POST /auth/login; tenantId identificado pelo backend.
 */
function AuthenticatedRoutes() {
  return (
    <Routes>
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
        <Route
          path="sales"
          element={
            <RoleGuard allowedRoles={['tenant_admin', 'tenant_operator']}>
              <SalesPage />
            </RoleGuard>
          }
        />
        <Route
          path="campaigns"
          element={
            <RoleGuard allowedRoles={['tenant_admin']}>
              <CampaignsPage />
            </RoleGuard>
          }
        />
        {/** `new` vem em :campaignId — rota literal campaigns/new sem param quebrava o formulário de criação */}
        <Route
          path="campaigns/:campaignId"
          element={
            <RoleGuard allowedRoles={['tenant_admin']}>
              <CampaignDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="settlement"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <SettlementPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/tenants"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <SystemAdminTenantsPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/tenants/new"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <SystemAdminTenantCreatePage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/tenants/:tenantId"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <SystemAdminTenantDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/tenants/:tenantId/merchants"
          element={
            <RoleGuard allowedRoles={['system_admin']}>
              <SystemAdminTenantMerchantsPage />
            </RoleGuard>
          }
        />
        <Route
          path="merchants"
          element={
            <RoleGuard allowedRoles={['tenant_admin']}>
              <MerchantsPage />
            </RoleGuard>
          }
        />
        <Route
          path="merchants/:merchantId"
          element={
            <RoleGuard allowedRoles={['tenant_admin']}>
              <MerchantDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="redeem"
          element={
            <RoleGuard allowedRoles={['merchant_admin', 'merchant_operator']}>
              <RedeemPage />
            </RoleGuard>
          }
        />
        <Route
          path="history"
          element={
            <RoleGuard allowedRoles={['merchant_admin', 'merchant_operator']}>
              <HistoryPage />
            </RoleGuard>
          }
        />
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
          <TenantBrandingLoader>
            <AuthenticatedRoutes />
          </TenantBrandingLoader>
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
