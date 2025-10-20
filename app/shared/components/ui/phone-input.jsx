import * as React from 'react';
import PhoneInputPrimitive, { getCountryCallingCode } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';
import { Button } from './button.jsx';
import { Input } from './input.jsx';
import { Popover, PopoverContent, PopoverTrigger } from './popover.jsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command.jsx';
import { ScrollArea } from './scroll-area.jsx';
import { Separator } from './separator.jsx';
import { LucideIcon } from '@icons';

const getOptionDisplay = (option) => {
  if (!option || option.divider) {
    return {
      name: 'International',
      dialCode: '',
      isoCode: '',
    };
  }

  const label = option.label ?? '';
  const dialCodeMatch = label.match(/\+\d.*$/);
  const dialCode = dialCodeMatch ? dialCodeMatch[0] : '';
  const name = dialCodeMatch ? label.slice(0, dialCodeMatch.index).trim() : label.trim();
  const isoCode = option.value ?? '';

  let resolvedDialCode = dialCode;
  if (!resolvedDialCode && isoCode) {
    try {
      resolvedDialCode = `+${getCountryCallingCode(isoCode)}`;
    } catch (error) {
      resolvedDialCode = '';
    }
  }

  return {
    name: name || isoCode || 'International',
    dialCode: resolvedDialCode,
    isoCode,
  };
};

const FlagIcon = ({ country, label }) => {
  if (!country) {
    return <LucideIcon name="Globe2" className="h-4 w-4 text-muted-foreground" aria-hidden />;
  }

  const Flag = flags[country];

  if (!Flag) {
    return <LucideIcon name="Globe2" className="h-4 w-4 text-muted-foreground" aria-hidden />;
  }

  return (
    <span className="flex h-4 w-6 items-center justify-center overflow-hidden rounded-[4px] shadow-sm">
      <Flag title={label} className="h-full w-full object-cover" aria-hidden />
    </span>
  );
};

const CountrySelect = React.forwardRef(
  (
    {
      value,
      onChange,
      options = [],
      disabled,
      readOnly,
      name,
      className,
      placeholder = 'Search country…',
      emptyText = 'No country found.',
      contentClassName,
      buttonClassName,
      'aria-label': ariaLabel,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const triggerRef = React.useRef(null);

    React.useImperativeHandle(ref, () => triggerRef.current);

    React.useEffect(() => {
      if (!open) {
        setSearchValue('');
      }
    }, [open]);

    const selectedOption = React.useMemo(() => {
      if (!options?.length) {
        return undefined;
      }
      return options.find((option) => !option.divider && option.value === value) ?? undefined;
    }, [options, value]);

    const filteredOptions = React.useMemo(() => {
      const query = searchValue.trim().toLowerCase();
      if (!query) {
        return options;
      }

      return options.filter((option) => {
        if (option.divider) {
          return false;
        }

        const display = getOptionDisplay(option);
        const haystack = [display.name, display.isoCode, display.dialCode].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query.replace('+', ''));
      });
    }, [options, searchValue]);

    const handleSelect = React.useCallback(
      (countryCode) => {
        onChange(countryCode);
        setOpen(false);
      },
      [onChange]
    );

    const disabledState = disabled || readOnly;
    const triggerClassNames = cn(className, buttonClassName);
    const selectedDisplay = getOptionDisplay(selectedOption);
    const primaryLabel = selectedDisplay.dialCode || selectedDisplay.isoCode || 'Select country';
    const secondaryLabel = selectedDisplay.dialCode
      ? selectedDisplay.name
      : selectedDisplay.isoCode || selectedDisplay.name;

    return (
      <>
        {typeof name === 'string' && name.length > 0 ? (
          <input type="hidden" name={name} value={value || ''} />
        ) : null}
        <Popover
          open={open}
          onOpenChange={(next) => {
            if (disabledState) {
              return;
            }
            setOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              type="button"
              variant="ghost"
              aria-expanded={open}
              aria-label={ariaLabel || 'Select country'}
              disabled={disabledState}
              className={cn(
                'flex h-11 min-w-[4.5rem] items-center gap-2 rounded-none border-r border-border bg-muted/40 px-3 text-left text-sm font-medium text-foreground shadow-none transition hover:bg-muted/60 focus-visible:ring-0 focus-visible:ring-offset-0',
                disabledState && 'cursor-not-allowed opacity-60',
                triggerClassNames
              )}
              onFocus={(event) => {
                onFocus?.(event);
              }}
              onBlur={(event) => {
                if (!open) {
                  onBlur?.(event);
                }
              }}
              {...rest}
            >
              <FlagIcon country={selectedOption?.value} label={selectedDisplay.name} />
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-foreground">{primaryLabel}</span>
                <span className="truncate text-xs text-muted-foreground">{secondaryLabel}</span>
              </div>
              <LucideIcon name="ChevronDown" className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={cn('w-[22rem] p-0', contentClassName)}
            sideOffset={8}
          >
            <Command shouldFilter={false} className="w-full">
              <CommandInput
                value={searchValue}
                onValueChange={setSearchValue}
                placeholder={placeholder}
                autoFocus
              />
              <CommandList>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {filteredOptions.length > 0 ? (
                  <ScrollArea className="max-h-60">
                    <CommandGroup className="p-1">
                      {filteredOptions.map((option, index) => {
                        if (option.divider) {
                          return <Separator key={`divider-${index}`} className="my-1" />;
                        }

                        const display = getOptionDisplay(option);
                        const isSelected = option.value === value || (!option.value && !value);

                        return (
                          <CommandItem
                            key={option.value ?? `intl-${index}`}
                            value={[display.name, display.isoCode, display.dialCode].filter(Boolean).join(' ')}
                            onSelect={() => handleSelect(option.value)}
                          >
                            <FlagIcon country={option.value} label={display.name} />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium text-foreground">{display.name}</span>
                              {display.isoCode ? (
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {display.isoCode}
                                </span>
                              ) : null}
                            </div>
                            <span className="ml-auto text-sm font-semibold text-muted-foreground">
                              {display.dialCode}
                            </span>
                            {isSelected ? (
                              <LucideIcon
                                name="Check"
                                className="ml-2 h-4 w-4 shrink-0 text-primary"
                                aria-hidden
                              />
                            ) : null}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </ScrollArea>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </>
    );
  }
);
CountrySelect.displayName = 'CountrySelect';

const PhoneInput = React.forwardRef(
  (
    {
      className,
      inputClassName,
      countrySelectProps,
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
      ));
      Comp.displayName = 'PhoneInputField';
      return Comp;
    }, [disabled, inputClassName]);

    const handleChange = React.useCallback(
      (phoneNumber) => {
        onChange?.(phoneNumber || '');
      },
      [onChange]
    );

    return (
      <PhoneInputPrimitive
        {...props}
        ref={ref}
        value={value ?? ''}
        onChange={handleChange}
        defaultCountry={defaultCountry}
        disabled={disabled}
        flags={flags}
        countrySelectComponent={CountrySelect}
        countrySelectProps={countrySelectProps}
        inputComponent={InputComponent}
        className={cn(
          'group/grid grid w-full grid-cols-[auto_1fr] items-stretch overflow-hidden rounded-lg border border-input bg-background text-sm ring-offset-background transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-60',
          className
        )}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
