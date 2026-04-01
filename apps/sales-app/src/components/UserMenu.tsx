import * as React from 'react';
import { Button, cn } from '@core-ui/ui';
import { LogOut, User } from 'lucide-react';

type UserMenuProps = {
  triggerClassName?: string;
  menuClassName?: string;
  tenantName: string;
  username: string | null;
  email: string | null;
  onLogout: () => void;
};

/**
 * Padrão de UI bem comum: ícone de usuário (top-right) que abre um dropdown.
 * Mantém o topo limpo e agrupa ações/identidade em um lugar previsível.
 */
export function UserMenu({
  triggerClassName,
  menuClassName,
  tenantName,
  username,
  email,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const displayName = (username ?? '').trim();
  const displayEmail = (email ?? '').trim();

  React.useEffect(() => {
    if (!open) return;

    // Fecha ao clicar fora ou pressionar ESC — comportamento esperado em menus de conta.
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn('h-9 w-9 p-0 text-muted-foreground hover:text-foreground', triggerClassName)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu do usuário"
      >
        <User className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-11 z-20 w-72 overflow-hidden rounded-md border border-border bg-background shadow-md',
            menuClassName
          )}
        >
          <div className="px-3 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {displayName || 'Usuário'}
                </div>
                {displayEmail && (
                  <div className="truncate text-xs text-muted-foreground">{displayEmail}</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Sistema</span>
                  <span className="mx-1">·</span>
                  <span className="truncate">{tenantName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

