import { Outlet } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { SidebarMenu } from '../components/SidebarMenu';

/**
 * Layout principal para rotas autenticadas: TopBar + SidebarMenu + conteúdo (Outlet).
 */
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
