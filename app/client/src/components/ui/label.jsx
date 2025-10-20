import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-body-sm font-medium text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-60', className)}
    {...props}
  />
));

Label.displayName = 'Label';
