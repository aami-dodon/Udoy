import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { resolveHeroIcon } from './heroicons.js';

const STYLE_CLASS_MAP = Object.freeze({
  outline: 'icon--outline',
  solid: 'icon--solid',
  mini: 'icon--mini',
});

const SIZE_CLASS_MAP = Object.freeze({
  xs: 'icon--xs',
  sm: 'icon--sm',
  base: 'icon--base',
  md: 'icon--md',
  lg: 'icon--lg',
  xl: 'icon--xl',
});

function buildClassName({ style, size, className }) {
  const classes = ['icon'];

  classes.push(STYLE_CLASS_MAP[style] ?? STYLE_CLASS_MAP.outline);
  classes.push(SIZE_CLASS_MAP[size] ?? SIZE_CLASS_MAP.base);

  if (className) {
    classes.push(className);
  }

  return classes.filter(Boolean).join(' ');
}

const HeroIcon = forwardRef(function HeroIcon(
  { name, style = 'outline', size = 'base', title, decorative = !title, className = '', ...props },
  ref,
) {
  const IconComponent = resolveHeroIcon({ name, style });

  if (!IconComponent) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`HeroIcon: icon "${name}" not found for style "${style}".`);
    }
    return null;
  }

  const computedClassName = buildClassName({ style, size, className });
  const accessibilityProps = decorative
    ? { 'aria-hidden': true, focusable: false }
    : { role: 'img', focusable: false };

  return (
    <IconComponent
      ref={ref}
      className={computedClassName}
      title={title}
      {...accessibilityProps}
      {...props}
    />
  );
});

HeroIcon.displayName = 'HeroIcon';

HeroIcon.propTypes = {
  name: PropTypes.string.isRequired,
  style: PropTypes.oneOf(['outline', 'solid', 'mini']),
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'md', 'lg', 'xl']),
  title: PropTypes.string,
  decorative: PropTypes.bool,
  className: PropTypes.string,
};

export default HeroIcon;
