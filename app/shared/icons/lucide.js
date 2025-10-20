import * as LucideIcons from 'lucide-react';

const EXCLUDED_EXPORTS = new Set([
  'createLucideIcon',
  'icons',
  'LucideIcon',
  'IconNode',
  'LucideProps',
  'default',
]);

export const lucideIconWeights = Object.freeze(['thin', 'regular', 'bold']);

const lucideIconEntries = Object.entries(LucideIcons).filter(([name, value]) => {
  if (EXCLUDED_EXPORTS.has(name)) {
    return false;
  }

  if (!value || typeof value !== 'object' || typeof value.render !== 'function') {
    return false;
  }

  const displayName = value.displayName || '';

  return displayName.startsWith('Lucide') || /^[A-Z]/.test(name);
});

const lucideIconMap = lucideIconEntries.reduce((acc, [name, component]) => {
  const normalized = name.endsWith('Icon') ? name.slice(0, -4) : name;

  if (!acc[normalized]) {
    acc[normalized] = component;
  }

  return acc;
}, {});

export const lucideIconNames = Object.freeze(Object.keys(lucideIconMap).sort());

export function getLucideIcon(name) {
  return lucideIconMap[name] ?? null;
}

export function resolveLucideIcon({ name, fallbackName } = {}) {
  if (!name) {
    return null;
  }

  const primary = getLucideIcon(name);

  if (primary) {
    return primary;
  }

  if (fallbackName) {
    return getLucideIcon(fallbackName);
  }

  return null;
}
