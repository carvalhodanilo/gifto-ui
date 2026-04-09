import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button, cn } from '@core-ui/ui';

export type PageActionItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  title?: string;
};

type PageActionsDropdownProps = {
  items: PageActionItem[];
  size?: 'default' | 'sm' | 'lg';
};

/**
 * Botão "Ações" com menu suspenso (substitui o padrão de três pontos).
 */
export function PageActionsDropdown({ items, size = 'default' }: PageActionsDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        className="gap-1.5"
        onClick={() => setOpen((o) => !o)}
      >
        Ações
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] overflow-hidden rounded-md border border-border bg-background py-1 shadow-md"
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              title={item.title}
              className={cn(
                'flex w-full px-3 py-2 text-left text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
                item.destructive && 'text-destructive hover:bg-destructive/10'
              )}
              onClick={() => {
                if (item.disabled) return;
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
