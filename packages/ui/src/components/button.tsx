import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        /** Cor dinâmica do tenant; hover/active escurecem com color-mix (opacidade /90 era quase invisível). */
        brand:
          'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-[color-mix(in_srgb,var(--brand-primary)_82%,black)] hover:shadow-md active:bg-[color-mix(in_srgb,var(--brand-primary)_72%,black)] active:shadow-sm focus-visible:ring-[var(--brand-primary)]/35',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Botão estilo shadcn. Para ações principais com **cor do tenant**, use **`variant="brand"`**
 * (usa `--brand-primary`; hover escurece o fundo e reforça a sombra). `variant="default"` usa `primary` do tema,
 * não a marca — evite `className` com `bg-[var(--brand-primary)]` nesse caso.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const comp = asChild ? 'span' : 'button';
    const mergedClassName = cn(buttonVariants({ variant, size }), className);

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: cn(mergedClassName, (props.children as React.ReactElement).props?.className),
        ref,
      });
    }

    return React.createElement(comp, {
      className: mergedClassName,
      ref,
      ...props,
    });
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
