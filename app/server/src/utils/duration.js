const UNIT_IN_SECONDS = {
  s: 1,
  sec: 1,
  secs: 1,
  second: 1,
  seconds: 1,
  m: 60,
  min: 60,
  mins: 60,
  minute: 60,
  minutes: 60,
  h: 3600,
  hr: 3600,
  hrs: 3600,
  hour: 3600,
  hours: 3600,
  d: 86400,
  day: 86400,
  days: 86400,
  w: 604800,
  week: 604800,
  weeks: 604800,
};

function toNumber(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
  }

  return null;
}

export function parseDuration(value, fallbackSeconds = 0) {
  if (!value && value !== 0) {
    return fallbackSeconds;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return fallbackSeconds;
  }

  const trimmed = value.trim();
  const numeric = toNumber(trimmed);
  if (numeric !== null) {
    return numeric;
  }

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (!match) {
    return fallbackSeconds;
  }

  const [, quantityRaw, unitRaw] = match;
  const unit = unitRaw.toLowerCase();
  const base = UNIT_IN_SECONDS[unit];
  if (!base) {
    return fallbackSeconds;
  }

  const quantity = Number(quantityRaw);
  return Math.round(quantity * base);
}

export function addSeconds(baseDate, seconds) {
  const date = baseDate instanceof Date ? baseDate : new Date(baseDate);
  return new Date(date.getTime() + seconds * 1000);
}

export function secondsUntil(date) {
  const target = date instanceof Date ? date : new Date(date);
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
}

export default {
  parseDuration,
  addSeconds,
  secondsUntil,
};
