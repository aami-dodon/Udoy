import { forwardRef } from 'react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeMap = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

const strokeMap = {
  thin: 1.25,
  regular: 1.75,
  bold: 2.25,
};

const iconRegistry = Object.fromEntries(
  Object.entries(Icons)
    .filter(([key]) => /^[A-Z]/.test(key))
    .map(([key, value]) => [key.replace(/Icon$/, ''), value])
);

const iconNames = Object.keys(iconRegistry);

const resolveIcon = (name, fallbackName) => {
  if (name && iconRegistry[name]) {
    return iconRegistry[name];
  }

  if (fallbackName && iconRegistry[fallbackName]) {
    return iconRegistry[fallbackName];
  }

  return Icons.HelpCircle;
};

const LucideIcon = forwardRef(
  ({ name, fallbackName, size = 'md', weight = 'regular', strokeWidth, title, decorative = true, className, ...props }, ref) => {
    const Glyph = resolveIcon(name, fallbackName);
    const resolvedStroke = strokeWidth ?? strokeMap[weight] ?? strokeMap.regular;
    const labelProps = decorative && !title ? { 'aria-hidden': true } : { role: 'img' };

    return (
      <Glyph
        ref={ref}
        className={cn('flex-shrink-0 text-current', sizeMap[size] ?? sizeMap.md, className)}
        strokeWidth={resolvedStroke}
        title={title}
        {...labelProps}
        {...props}
      />
    );
  }
);

LucideIcon.displayName = 'LucideIcon';

export { LucideIcon, iconNames };
