import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@core-ui/ui';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Modal centralizado; fecha só por ação (ex.: Cancelar). */
export function Dialog({ open, children, className }: DialogProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'max-h-[90vh] w-full max-w-lg min-w-0 overflow-x-hidden overflow-y-auto rounded-xl bg-card shadow-lg',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
