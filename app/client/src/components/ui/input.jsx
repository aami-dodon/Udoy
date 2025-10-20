import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-body-sm shadow-outline transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 file:border-0 file:bg-transparent file:text-body-sm file:font-medium ring-offset-background',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
