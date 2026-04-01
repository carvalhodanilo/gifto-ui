import * as React from 'react';

type SidebarCollapseContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarCollapseContext = React.createContext<SidebarCollapseContextValue | null>(null);

const STORAGE_KEY = 'sales-app.sidebar.collapsed';

function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;

  // Intenção: mobile-first. Se o usuário nunca escolheu, começamos recolhido no mobile
  // para não consumir largura da tela.
  return window.matchMedia?.('(max-width: 768px)').matches ?? false;
}

/**
 * Estado compartilhado de recolher/expandir a sidebar.
 * - Mobile-first: por padrão a sidebar inicia recolhida em telas pequenas.
 * - Persistido em `localStorage` para manter a preferência do usuário.
 */
export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState<boolean>(() => getInitialCollapsed());

  const setCollapsed = React.useCallback((value: boolean) => {
    setCollapsedState(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    }
  }, []);

  const toggleCollapsed = React.useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, toggleCollapsed }),
    [collapsed, setCollapsed, toggleCollapsed]
  );

  return <SidebarCollapseContext.Provider value={value}>{children}</SidebarCollapseContext.Provider>;
}

export function useSidebarCollapse() {
  const ctx = React.useContext(SidebarCollapseContext);
  if (!ctx) {
    throw new Error('useSidebarCollapse must be used within SidebarCollapseProvider');
  }
  return ctx;
}
