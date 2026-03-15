import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { MerchantProvider } from './contexts/MerchantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantTheme } from './components/TenantTheme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RedeemPage } from './pages/RedeemPage';
import { HistoryPage } from './pages/HistoryPage';

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
        <Route path="redeem" element={<RedeemPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Sempre usa TenantTheme para não alterar a árvore ao selecionar tenant no login.
 * Assim o LoginPage não remonta e o estado (tenantId, merchantId) não se perde.
 */
function AppWithTheme() {
  const { tenant } = useTenant();
  return (
    <TenantTheme tenant={tenant}>
      <AuthenticatedRoutes />
    </TenantTheme>
  );
}

export default function App() {
  return (
    <TenantProvider>
      <MerchantProvider>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </MerchantProvider>
    </TenantProvider>
  );
}
