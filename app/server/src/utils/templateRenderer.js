export function renderTemplate(template, variables = {}) {
  if (!template || typeof template !== 'string') {
    return '';
  }

  const safeVariables = variables && typeof variables === 'object' ? variables : {};

  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const path = key.split('.');
    let value = safeVariables;
    for (const segment of path) {
      if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
        value = value[segment];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined || value === null) {
      return '';
    }

    return String(value);
  });
}

export function stripHtml(value) {
  if (!value) {
    return '';
  }

  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export default {
  renderTemplate,
  stripHtml,
};
