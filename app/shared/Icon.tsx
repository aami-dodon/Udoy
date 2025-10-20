import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import LucideIcon from './icons/LucideIcon.jsx';

export type IconWeight = 'thin' | 'regular' | 'bold';
export type IconSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl';

export interface IconProps extends ComponentPropsWithoutRef<'svg'> {
  name: string;
  fallbackName?: string;
  weight?: IconWeight;
  size?: IconSize;
  strokeWidth?: number | string;
  title?: string;
  decorative?: boolean;
  className?: string;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  return <LucideIcon ref={ref} {...props} />;
});

export { Icon };
export type { IconProps, IconProps as LucideIconProps };
export default Icon;
