const BRAND_PRIMARY_COLOR = '#2563eb';
const BRAND_TEXT_COLOR = '#1f2937';
const BRAND_BACKGROUND_COLOR = '#f9fafb';

export function wrapWithBranding(body, { title = 'Udoy Notification', previewText } = {}) {
  const safeBody = body || '';
  const safePreview = previewText ? String(previewText) : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${safePreview ? `<meta name="description" content="${safePreview}" />` : ''}
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: ${BRAND_BACKGROUND_COLOR};
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: ${BRAND_TEXT_COLOR};
      }
      .email-wrapper {
        width: 100%;
        background-color: ${BRAND_BACKGROUND_COLOR};
        padding: 32px 0;
      }
      .email-container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
      }
      .email-header {
        background: linear-gradient(135deg, ${BRAND_PRIMARY_COLOR}, #1d4ed8);
        padding: 24px 32px;
        color: #ffffff;
      }
      .email-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .email-body {
        padding: 32px;
        line-height: 1.6;
        font-size: 16px;
      }
      .email-footer {
        padding: 24px 32px;
        font-size: 13px;
        color: #6b7280;
        background-color: ${BRAND_BACKGROUND_COLOR};
      }
      a {
        color: ${BRAND_PRIMARY_COLOR};
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-container">
        <div class="email-header">
          <h1>Udoy</h1>
        </div>
        <div class="email-body">
          ${safeBody}
        </div>
        <div class="email-footer">
          <p>You are receiving this message because your Udoy notification preferences allow it.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export default {
  wrapWithBranding,
};
