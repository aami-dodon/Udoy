import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border border-border bg-card text-card-foreground shadow-soft backdrop-blur-[18px]', className)}
    {...props}
  />
));

Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-3 px-8 py-6', className)} {...props} />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-heading-lg font-semibold tracking-tight text-foreground', className)} {...props} />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-body-sm text-muted-foreground', className)} {...props} />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-5 px-8 pb-8 pt-2', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-4 border-t border-border/60 px-8 py-6', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
