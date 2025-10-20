import * as React from 'react';
import PhoneInputPrimitive from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

const PhoneInput = React.forwardRef(
  ({ className, inputClassName, countrySelectProps, defaultCountry = 'IN', ...props }, ref) => {
    return (
      <PhoneInputPrimitive
        ref={ref}
        defaultCountry={defaultCountry}
        className={cn('flex w-full items-center gap-3', className)}
        countrySelectProps={{
          className: cn(
            'flex h-11 items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
            countrySelectProps?.className
          ),
          ...countrySelectProps,
        }}
        inputComponent={React.forwardRef((inputProps, inputRef) => (
          <input
            {...inputProps}
            ref={inputRef}
            className={cn(
              'flex-1 h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
              inputClassName,
              inputProps.className
            )}
          />
        ))}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
