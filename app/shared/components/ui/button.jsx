import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const BASE_STYLES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecru focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain disabled:pointer-events-none disabled:opacity-60';

const VARIANT_STYLES = {
  primary: 'bg-evergreen text-white shadow-uplift hover:bg-evergreen-soft hover:shadow-none',
  secondary: 'bg-mint-sage text-black-olive hover:bg-mint-sage/90 shadow-gentle',
  outline: 'border border-neutral-200 bg-white text-black-olive hover:bg-porcelain-tint hover:text-evergreen',
  ghost: 'bg-transparent text-black-olive hover:bg-porcelain-tint/80',
  link: 'bg-transparent text-evergreen underline underline-offset-4 hover:text-evergreen-soft',
  accent: 'bg-ecru text-black-olive shadow-gentle hover:bg-ecru-bright hover:shadow-none',
};

const SIZE_STYLES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-lg',
  icon: 'h-10 w-10',
};

export const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button';
  const resolvedVariant = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const resolvedSize = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <Component ref={ref} className={cn(BASE_STYLES, resolvedVariant, resolvedSize, className)} {...props} />
  );
});

Button.displayName = 'Button';
