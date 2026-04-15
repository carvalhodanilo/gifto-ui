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

  const mobile = window.matchMedia?.('(max-width: 767px)').matches ?? false;
  // Desktop (md+): sempre expandido ao carregar, com nomes visíveis (evita ficar preso em
  // `collapsed` vindo do mobile ou de sessão antiga, já que o toggle era só no mobile).
  if (!mobile) return false;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;

  return true;
}

/**
 * Estado compartilhado de recolher/expandir a sidebar.
 * - Mobile: padrão recolhido; preferência persistida em `localStorage`.
 * - Desktop (768px+): inicia expandido (rótulos visíveis); ao redimensionar para desktop, expande.
 */
export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState<boolean>(() => getInitialCollapsed());

  /** Ao passar para viewport desktop, expandir para liberar rótulos do menu. */
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setCollapsedState(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
