import { cn } from '@/lib/utils';

const BASE_STYLES =
  'inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wider';

const VARIANT_STYLES = {
  solid: 'bg-evergreen text-white shadow-sm',
  subtle: 'bg-porcelain-tint text-evergreen',
  outline: 'border border-evergreen text-evergreen',
  accent: 'bg-ecru text-black-olive',
};

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(BASE_STYLES, VARIANT_STYLES[variant] ?? VARIANT_STYLES.solid, className)} {...props} />
  );
}
