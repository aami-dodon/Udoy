import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-11 w-full rounded-lg border border-porcelain-shade bg-white/90 px-4 py-3 text-sm text-black-olive placeholder:text-neutral-400 shadow-inner focus:border-evergreen focus:outline-none focus:ring-2 focus:ring-evergreen/40 disabled:cursor-not-allowed disabled:opacity-60',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
