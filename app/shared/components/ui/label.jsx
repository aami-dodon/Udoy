import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Label = forwardRef(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium text-black-olive/80',
      className
    )}
    {...props}
  >
    <span>{children}</span>
    {required ? <span className="ml-1 text-evergreen" aria-hidden="true">*</span> : null}
  </label>
));

Label.displayName = 'Label';

export { Label };
