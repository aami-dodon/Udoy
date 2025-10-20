import * as React from 'react'
import PhoneInputPrimitive from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'
import { Input } from './input.jsx'

const PhoneInput = React.forwardRef(
  (
    {
      className,
      inputClassName,
      defaultCountry = 'IN',
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const InputComponent = React.useMemo(() => {
      const Comp = React.forwardRef(({ className: inputClass, ...inputProps }, inputRef) => (
        <Input
          {...inputProps}
          ref={inputRef}
          type="tel"
          disabled={disabled}
          className={cn(
            'h-11 flex-1 border-0 bg-transparent px-4 py-0 text-sm text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
            inputClassName,
            inputClass
          )}
        />
      ))
      Comp.displayName = 'PhoneInputField'
      return Comp
    }, [disabled, inputClassName])

    return (
      <PhoneInputPrimitive
        {...props}
        ref={ref}
        value={value ?? ''}
        onChange={onChange}
        defaultCountry={defaultCountry}
        disabled={disabled}
        flags={flags}
        inputComponent={InputComponent}
        className={cn(
          'flex w-full items-stretch overflow-hidden rounded border border-input bg-background pl-4 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-60',
          className
        )}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
