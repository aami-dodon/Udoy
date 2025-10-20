import { cn } from '@/lib/utils';

export function Separator({ className, decorative = true, ...props }) {
  return (
    <div
      role={decorative ? 'presentation' : 'separator'}
      className={cn('h-px w-full bg-porcelain-shade', className)}
      {...props}
    />
  );
}
