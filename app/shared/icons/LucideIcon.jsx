import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { resolveLucideIcon } from './lucide.js';

const WEIGHT_CLASS_MAP = Object.freeze({
  thin: 'icon--thin',
  regular: 'icon--regular',
  bold: 'icon--bold',
});

const WEIGHT_STROKE_WIDTH = Object.freeze({
  thin: 1,
  regular: 1.5,
  bold: 2,
});

const SIZE_CLASS_MAP = Object.freeze({
  xs: 'icon--xs',
  sm: 'icon--sm',
  base: 'icon--base',
  md: 'icon--md',
  lg: 'icon--lg',
  xl: 'icon--xl',
});

function buildClassName({ weight, size, className }) {
  const classes = ['icon'];

  classes.push(WEIGHT_CLASS_MAP[weight] ?? WEIGHT_CLASS_MAP.regular);
  classes.push(SIZE_CLASS_MAP[size] ?? SIZE_CLASS_MAP.base);

  if (className) {
    classes.push(className);
  }

  return classes.filter(Boolean).join(' ');
}

const LucideIcon = forwardRef(function LucideIcon(
  {
    name,
    fallbackName,
    weight = 'regular',
    size = 'base',
    strokeWidth,
    title,
    decorative = !title,
    className = '',
    ...props
  },
  ref,
) {
  const IconComponent = resolveLucideIcon({ name, fallbackName });

  if (!IconComponent) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`LucideIcon: icon "${name}" not found.`);
    }
    return null;
  }

  const computedClassName = buildClassName({ weight, size, className });
  const accessibilityProps = decorative
    ? { 'aria-hidden': true, focusable: false }
    : { role: 'img', focusable: false };
  const resolvedStrokeWidth = strokeWidth ?? WEIGHT_STROKE_WIDTH[weight] ?? WEIGHT_STROKE_WIDTH.regular;

  return (
    <IconComponent
      ref={ref}
      className={computedClassName}
      title={title}
      strokeWidth={resolvedStrokeWidth}
      {...accessibilityProps}
      {...props}
    />
  );
});

LucideIcon.displayName = 'LucideIcon';

LucideIcon.propTypes = {
  name: PropTypes.string.isRequired,
  fallbackName: PropTypes.string,
  weight: PropTypes.oneOf(['thin', 'regular', 'bold']),
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'md', 'lg', 'xl']),
  strokeWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  decorative: PropTypes.bool,
  className: PropTypes.string,
};

export default LucideIcon;
