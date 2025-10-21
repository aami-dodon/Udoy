const DEFAULT_LOCALE = 'en';
const LOCALE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/;

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const normalized = trimmed.replace(/_/g, '-');
  if (LOCALE_PATTERN.test(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  if (LOCALE_PATTERN.test(lower)) {
    const [language, region] = lower.split('-');
    return region ? `${language}-${region.toUpperCase()}` : language;
  }

  return fallback;
}

export function getLocaleCandidates(locale, fallback = DEFAULT_LOCALE) {
  const normalized = normalizeLocale(locale, fallback);
  const [language] = normalized.split('-');
  const candidates = new Set();
  candidates.add(normalized);
  if (language && language !== normalized) {
    candidates.add(language);
  }
  candidates.add(fallback);
  return Array.from(candidates);
}

export default {
  DEFAULT_LOCALE,
  normalizeLocale,
  getLocaleCandidates,
};
