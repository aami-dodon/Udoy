import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MiniIcons from '@heroicons/react/20/solid';

export const HERO_ICON_STYLES = Object.freeze({
  outline: OutlineIcons,
  solid: SolidIcons,
  mini: MiniIcons,
});

export const heroIconNames = Object.freeze({
  outline: Object.keys(OutlineIcons),
  solid: Object.keys(SolidIcons),
  mini: Object.keys(MiniIcons),
});

export function getHeroIcon(name, style = 'outline') {
  if (!name) {
    return undefined;
  }

  const normalizedStyle = style in HERO_ICON_STYLES ? style : 'outline';
  const iconSet = HERO_ICON_STYLES[normalizedStyle];

  return iconSet?.[name];
}

export function resolveHeroIcon({ name, style = 'outline', fallbackStyle = 'outline' } = {}) {
  if (!name) {
    return undefined;
  }

  const primary = getHeroIcon(name, style);
  if (primary) {
    return primary;
  }

  if (style === fallbackStyle) {
    return undefined;
  }

  return getHeroIcon(name, fallbackStyle);
}

export const heroIconDefaults = Object.freeze({
  strokeWidth: Object.freeze({
    outline: 1.5,
    solid: undefined,
    mini: undefined,
  }),
  size: Object.freeze({
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    base: 'base',
    lg: 'lg',
    xl: 'xl',
  }),
});
